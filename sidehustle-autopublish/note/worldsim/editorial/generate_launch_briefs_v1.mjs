import fs from 'node:fs';
import path from 'node:path';
import {ageYears as modelAgeYears} from '../simulation/time_model_v1.mjs';

const ROOT=process.cwd(),P=(...x)=>path.join(ROOT,...x);
const read=p=>JSON.parse(fs.readFileSync(P(p),'utf8'));
const write=(p,o)=>{const f=P(p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(o,null,2)+'\n');};
const votes=read('sidehustle-autopublish/note/worldsim/turns/turn_0001/votes.json');
const events=read('sidehustle-autopublish/note/worldsim/turns/turn_0001/events.json');
const before=read('sidehustle-autopublish/note/worldsim/state/turn_0000/world_state.json');
const after=read('sidehustle-autopublish/note/worldsim/state/turn_0001/world_state.json');
const demo=read('sidehustle-autopublish/note/worldsim/turns/turn_0001/demography.json');
const institutions=read('sidehustle-autopublish/note/worldsim/institutions/institution_state_turn0.json');

function loadCountry(country){
 const dir=P('sidehustle-autopublish/note/worldsim/population/personality',country),people={},households={};
 for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))){
  const d=read('sidehustle-autopublish/note/worldsim/population/personality/'+country+'/'+f);
  for(const c of d.citizens)people[c.citizenId]=c;
  for(const h of d.households)households[h.householdId]=h;
 }
 const beliefs=read('sidehustle-autopublish/note/worldsim/population/beliefs/'+country+'.json');
 return{people,households,beliefs};
}
function personCard(id,data,topic,vote,country){
 const c=data.people[id];if(!c)return null;
 const co=after.citizenOverlays?.[country]?.[id]||{};
 const householdId=co.householdId||c.householdId;
 const h=data.households[householdId];
 const ho=after.householdOverlays?.[country]?.[householdId]||{};
 const age=modelAgeYears(c,after.calendar);
 const record=data.beliefs.records[id]||{};
 const strongestPositive=vote?Object.entries(vote.factors||{}).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,3):[];
 const strongestNegative=vote?Object.entries(vote.factors||{}).filter(([,v])=>v<0).sort((a,b)=>a[1]-b[1]).slice(0,3):[];
 return{
  citizenId:id,name:c.givenName+' '+c.familyName,age,sex:c.sex,settlementId:co.settlementId||c.settlementId,
  occupation:co.occupationId||c.occupationId,sector:c.occupation.sector,skill:c.occupation.skill,householdId,
  household:{members:h?.memberIds?.length??null,foodDays:Math.max(0,(h?.economy?.foodDays??c.materialState.householdFoodDays)+(ho.foodDaysOffset||0)),debtUnits:Math.max(0,(h?.economy?.debtUnits??c.materialState.householdDebt)+(ho.debtOffset||0)),cashLikeReserve:h?.economy?.cashLikeReserve??null,landUseUnits:h?.economy?.landUseUnits??null},
  selectedValues:Object.fromEntries(['family','autonomy','security','achievement','fairness','community','environment','status'].map(k=>[k,c.values[k]])),
  selectedTraits:{conscientiousness:c.psychology.bigFive.conscientiousness,agreeableness:c.psychology.bigFive.agreeableness,riskTolerance:c.psychology.actionTendencies.riskTolerance,authorityAcceptance:c.psychology.actionTendencies.authorityAcceptance,statusDrive:c.psychology.actionTendencies.statusDrive},
  goals:{primary:c.goals.primaryGoal,secondary:c.goals.secondaryGoal,protectedThing:c.goals.protectedThing,avoidAtAllCosts:c.goals.avoidAtAllCosts},
  material:{health:c.materialState.health,stress:c.materialState.stress},
  relevantRumors:(record.rumors||[]).filter(x=>x.topic===topic),
  vote:vote?{choice:vote.vote,utility:vote.utility,strongestPositive,strongestNegative,factors:vote.factors}:null
 };
}
function chooseVote(country){
 const rows=votes[country];
 const scored=rows.map(v=>{
  const contested=(v.no*2)+(v.abstain*.7)+(v.passed?0:8)+(v.dualMajority&&!v.settlementMajority?8:0);
  return{v,score:contested};
 }).sort((a,b)=>b.score-a.score);
 return scored[0].v;
}
const out={version:1,turn:1,createdFrom:'canonical turn 1',world:{id:after.worldId,calendarBefore:before.calendar,calendarAfter:after.calendar,firstContact:after.contact.firstContactOccurred},countries:{}};
for(const country of ['ARCUS','MIREA','VALD']){
 const data=loadCountry(country),v=chooseVote(country);
 const sorted=v.votes.slice().sort((a,b)=>a.utility-b.utility);
 const strongestNo=sorted.find(x=>x.vote==='no')||sorted[0];
 const strongestYes=sorted.slice().reverse().find(x=>x.vote==='yes')||sorted.at(-1);
 const abstain=sorted.find(x=>x.vote==='abstain')||null;
 const sponsorVote=v.votes.find(x=>x.citizenId===v.sponsorId)||null;
 const ssBefore=before.countries[country].settlementStates,ssAfter=after.countries[country].settlementStates;
 out.countries[country]={
  countryName:after.countries[country].nameJa,
  populationBefore:before.countries[country].population,populationAfter:after.countries[country].population,
  foodReserveDaysBefore:before.countries[country].meanFoodReserveDays,foodReserveDaysAfter:after.countries[country].meanFoodReserveDays,
  weather:events.weather[country],
  selectedEvent:{policyId:v.policyId,title:v.title,passed:v.passed,yes:v.yes,no:v.no,abstain:v.abstain,yesShare:v.yesShare,dualMajority:v.dualMajority,settlementMajority:v.settlementMajority,settlementResults:v.settlementResults},
  people:{
   sponsor:personCard(v.sponsorId,data,v.policyId.startsWith('M_GATE')?'river':v.policyId.startsWith('V_MINE')?'mining':v.policyId.startsWith('A_TIMBER')?'repair':'',sponsorVote,country),
   strongestYes:personCard(strongestYes.citizenId,data,v.policyId.startsWith('M_GATE')?'river':v.policyId.startsWith('V_MINE')?'mining':v.policyId.startsWith('A_TIMBER')?'repair':'',strongestYes,country),
   strongestNo:personCard(strongestNo.citizenId,data,v.policyId.startsWith('M_GATE')?'river':v.policyId.startsWith('V_MINE')?'mining':v.policyId.startsWith('A_TIMBER')?'repair':'',strongestNo,country),
   abstainer:abstain?personCard(abstain.citizenId,data,v.policyId.startsWith('M_GATE')?'river':v.policyId.startsWith('V_MINE')?'mining':v.policyId.startsWith('A_TIMBER')?'repair':'',abstain,country):null
  },
  settlementBefore:ssBefore,settlementAfter:ssAfter,
  demography:demo.countries[country],
  allTurnPolicies:votes[country].map(x=>({policyId:x.policyId,title:x.title,passed:x.passed,yes:x.yes,no:x.no,abstain:x.abstain,yesShare:x.yesShare,settlementMajority:x.settlementMajority}))
 };
}
write('sidehustle-autopublish/note/worldsim/editorial/launch_brief_turn1.json',out);
const compact={
 version:2,
 turn:out.turn,
 world:out.world,
 countries:Object.fromEntries(Object.entries(out.countries).map(([country,c])=>[country,{
   countryName:c.countryName,
   populationBefore:c.populationBefore,
   populationAfter:c.populationAfter,
   foodReserveDaysBefore:c.foodReserveDaysBefore,
   foodReserveDaysAfter:c.foodReserveDaysAfter,
   weather:c.weather,
   selectedEvent:c.selectedEvent,
   people:c.people,
   demography:c.demography,
   allTurnPolicies:c.allTurnPolicies
 }]))
};
write('sidehustle-autopublish/note/worldsim/editorial/launch_brief_compact.json',compact);
console.log(JSON.stringify(compact,null,2));
