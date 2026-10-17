import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {absoluteDay as modelAbsoluteDay,advanceCalendar as advanceWorldCalendar,ageYears as modelAgeYears,ageDays as modelAgeDays,seasonalFoodModifier,normalizeCalendar} from './time_model_v1.mjs';

const ROOT=process.cwd(),P=(...x)=>path.join(ROOT,...x);
const read=p=>JSON.parse(fs.readFileSync(P(p),'utf8'));
const write=(p,o)=>{const f=P(p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(o,null,2)+'\n');};
const turn=Number(process.env.WORLDSIM_TURN||1),prev=turn-1,pad=n=>String(n).padStart(4,'0');
const prevState=read('sidehustle-autopublish/note/worldsim/state/turn_'+pad(prev)+'/world_state.json');
const input=read('sidehustle-autopublish/note/worldsim/turns/turn_'+pad(turn)+'/turn_input.json');
const catalog=read('sidehustle-autopublish/note/worldsim/simulation/policy_catalog_v1.json');
const institutions=read('sidehustle-autopublish/note/worldsim/institutions/institution_state_turn0.json');
const institutionModel=read('sidehustle-autopublish/note/worldsim/institutions/institution_model_v2.json');
const livelihoodModel=read('sidehustle-autopublish/note/worldsim/population/livelihood_model_v1.json');
const state=structuredClone(prevState);

function seedInt(s){return crypto.createHash('sha256').update(String(s)).digest().readUInt32LE(0);}
function rngFor(s){let a=seedInt(s);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const ri=(r,a,b)=>Math.floor(r()*(b-a+1))+a;
const round=(n,d=3)=>Number(n.toFixed(d));
const policyById=Object.fromEntries(catalog.policies.map(x=>[x.id,x]));

function loadCountry(country){
 const dir=P('sidehustle-autopublish/note/worldsim/population/personality',country),people={},households={},familyEdges=[];
 for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))){
  const d=read('sidehustle-autopublish/note/worldsim/population/personality/'+country+'/'+f);
  for(const c of d.citizens)people[c.citizenId]=c;
  for(const h of d.households)households[h.householdId]=h;
  familyEdges.push(...d.familyEdges);
 }
 const beliefs=read('sidehustle-autopublish/note/worldsim/population/beliefs/'+country+'.json');
 const social=read('sidehustle-autopublish/note/worldsim/population/social/'+country+'.json');
 for(const n of (state.roster.newCitizens||[]).filter(x=>x.countryId===country)){
  if(!people[n.citizenId])people[n.citizenId]=structuredClone(n.profile||n);
 }
 const dynamicRelations=(state.roster.dynamicRelationships||[]).filter(x=>x.countryId===country);
 for(const [hid,ho] of Object.entries(state.householdOverlays?.[country]||{})){
  if(!households[hid])continue;
  if(Array.isArray(ho.departedMemberIds)&&ho.departedMemberIds.length){
   const gone=new Set(ho.departedMemberIds);
   households[hid].memberIds=households[hid].memberIds.filter(id=>!gone.has(id));
  }
  if(Array.isArray(ho.newMemberIds)){
   for(const id of ho.newMemberIds)if(!households[hid].memberIds.includes(id))households[hid].memberIds.push(id);
  }
 }
 const allEdges=[...social.edges,...dynamicRelations];
 const rel={},incoming={};
 for(const e of allEdges){rel[e.from+'|'+e.to]=e;(incoming[e.to]??=[]).push(e);}
 return{people,households,familyEdges:[...familyEdges,...dynamicRelations.filter(x=>['parent','child','sibling','partner'].includes(x.type))],beliefs,social:{...social,edges:allEdges},rel,incoming};
}
const absoluteDay=modelAbsoluteDay;
function currentAge(c){return modelAgeYears(c,state.calendar);}
function currentAgeDays(c){return modelAgeDays(c,state.calendar);}
function effective(c,country){
 const o=state.citizenOverlays?.[country]?.[c.citizenId]||{};
 const effectiveHouseholdId=o.householdId||c.householdId;
 const ho=state.householdOverlays?.[country]?.[effectiveHouseholdId]||{};
 const x=structuredClone(c);
 x.ageYears=Math.floor(currentAge(c));
 x.ageDays=currentAgeDays(c);
 x.householdId=effectiveHouseholdId;
 if(o.settlementId)x.settlementId=o.settlementId;
 if(o.occupationId){
  x.occupationId=o.occupationId;
  const om=livelihoodModel.occupations[o.occupationId]||{};
  const status=o.occupationId==='child'?'dependent':o.occupationId==='student'?'student':o.occupationId==='apprentice'||o.occupationId==='map_apprentice'?'apprentice':o.occupationId==='retired'?'retired':'worker';
  const started=o.occupationStartedAbsoluteDay??absoluteDay(state.calendar);
  const yrs=Math.max(0,(absoluteDay(state.calendar)-started)/365);
  const baseSkill=o.occupationSkillBase??(status==='worker'?22:status==='apprentice'?12:0);
  x.occupation={id:o.occupationId,sector:om.sector||'other',yearsExperience:round(yrs,2),skill:round(clamp(baseSkill+yrs*(status==='worker'?2.1:1.5)),1),status,trainingTrack:o.trainingTrack||x.occupation?.trainingTrack||null};
 }
 x.materialState=x.materialState||{stress:20,health:95,householdFoodDays:60,householdDebt:0};
 x.materialState.stress=clamp((x.materialState.stress||0)+(o.stressOffset||0)+(ho.stressOffset||0));
 x.materialState.health=clamp((x.materialState.health||100)+(o.healthOffset||0));
 x.materialState.householdFoodDays=Math.max(0,(x.materialState.householdFoodDays||0)+(ho.foodDaysOffset||0));
 x.materialState.householdDebt=Math.max(0,(x.materialState.householdDebt||0)+(ho.debtOffset||0));
 return x;
}
function rumorSignal(record,topic){
 const xs=(record?.rumors||[]).filter(x=>x.topic===topic);
 if(!xs.length)return 0;
 return xs.reduce((s,x)=>s+(x.stance==='believed'?1:x.stance==='uncertain'?.35:-.25)*(x.confidence/100),0)/xs.length;
}
function voteUtility(c,policy,proposal,data){
 const factors={
  values:0,
  sectorBenefit:0,
  sectorCost:0,
  affectedLocality:0,
  localCost:0,
  opportunityCost:0,
  sponsorOwnership:0,
  rumorSignal:0,
  sponsorRelationship:0,
  stressSecurity:0,
  boundedNoise:0
 };
 for(const [k,w] of Object.entries(policy.valueImpact||{}))factors.values+=w*((c.values[k]??50)-50)/50*18;
 if(policy.sectorBenefits?.[c.occupation.sector])factors.sectorBenefit=10*policy.sectorBenefits[c.occupation.sector];
 if(policy.sectorCosts?.[c.occupation.sector])factors.sectorCost=-12*policy.sectorCosts[c.occupation.sector];
 if((policy.affectedSettlements||[]).includes(c.settlementId))factors.affectedLocality=3.5;
 const localCost=policy.settlementCosts?.[c.settlementId]||0;
 factors.localCost=-12*localCost;
 const reservePressure=(c.materialState.householdFoodDays<50?1.25:1)+(c.materialState.householdDebt>30?.30:0);
 factors.opportunityCost=-10*(policy.opportunityCost||0)*reservePressure;
 if(c.citizenId===proposal.sponsorId)factors.sponsorOwnership=7.5;
 factors.rumorSignal=rumorSignal(data.beliefs.records[c.citizenId],policy.topic)*6;
 const relation=data.rel[c.citizenId+'|'+proposal.sponsorId];
 if(relation)factors.sponsorRelationship=(relation.trust-50)*.055+(relation.respect-50)*.035;
 if((policy.valueImpact?.security||0)>0&&c.materialState.stress>65)factors.stressSecurity=2.5;
 const r=rngFor(state.worldId+'|VOTE|'+turn+'|'+policy.id+'|'+c.citizenId);
 factors.boundedNoise=(r()-.5)*7;
 for(const k of Object.keys(factors))factors[k]=round(factors[k],3);
 const utility=round(Object.values(factors).reduce((a,b)=>a+b,0),3);
 return{utility,factors};
}
function conductVote(country,proposal,data){
 const policy=policyById[proposal.policyId],body=(state.countries[country].institution||institutions.countries[country]).nationalBody.members;
 const inactive=new Set(state.roster.inactiveCitizenIds||[]);
 const votes=[];
 for(const m of body){
  if(inactive.has(m.citizenId))continue;
  const raw=data.people[m.citizenId];if(!raw)continue;
  const c=effective(raw,country),calc=voteUtility(c,policy,proposal,data),utility=calc.utility;
  votes.push({citizenId:c.citizenId,settlementId:m.settlementId,utility,factors:calc.factors,vote:utility>2.25?'yes':utility<-2.25?'no':'abstain'});
 }
 const yes=votes.filter(x=>x.vote==='yes').length,no=votes.filter(x=>x.vote==='no').length,abstain=votes.length-yes-no;
 const yesShare=yes+no?yes/(yes+no):0;
 let settlementMajority=true,settlementResults={};
 if(policy.dualMajority){
  const groups={};for(const v of votes)(groups[v.settlementId]??=[]).push(v);
  let supporting=0;
  for(const [sid,vs] of Object.entries(groups)){
   const y=vs.filter(x=>x.vote==='yes').length,n=vs.filter(x=>x.vote==='no').length;
   const pass=y>n; if(pass)supporting++;settlementResults[sid]={yes:y,no:n,abstain:vs.length-y-n,pass};
  }
  settlementMajority=supporting>Object.keys(groups).length/2;
 }
 const passed=yesShare>=policy.approvalThreshold&&settlementMajority;
 return{policyId:policy.id,title:policy.title,sponsorId:proposal.sponsorId,urgency:proposal.urgency,yes,no,abstain,yesShare:round(yesShare,4),threshold:policy.approvalThreshold,dualMajority:!!policy.dualMajority,settlementMajority,settlementResults,passed,votes};
}
function applyOverlay(country,id,delta,memory){
 const m=(state.citizenOverlays[country]??={});
 const o=(m[id]??={stressOffset:0,healthOffset:0,memories:[]});
 o.stressOffset=round(o.stressOffset+(delta.stress||0),3);
 o.healthOffset=round(o.healthOffset+(delta.health||0),3);
 if(memory)o.memories.push(memory);
 if(o.memories.length>30)o.memories=o.memories.slice(-30);
}
function applyHouseholdOverlay(country,householdId,delta,memory){
 const m=(state.householdOverlays[country]??={});
 const o=(m[householdId]??={foodDaysOffset:0,debtOffset:0,stressOffset:0,incomeCapacityOffset:0,newMemberIds:[],departedMemberIds:[],memories:[]});
 o.foodDaysOffset=round(o.foodDaysOffset+(delta.foodDays||0),3);
 o.debtOffset=round(o.debtOffset+(delta.debt||0),3);
 o.stressOffset=round(o.stressOffset+(delta.stress||0),3);
 o.incomeCapacityOffset=round(o.incomeCapacityOffset+(delta.incomeCapacity||0),3);
 if(memory)o.memories.push(memory);
 if(o.memories.length>20)o.memories=o.memories.slice(-20);
}
function applyPolicy(country,result,data,citizenDeltaLog){
 if(!result.passed)return;
 const p=policyById[result.policyId],eff=p.effects||{},cs=state.countries[country];
 cs.dynamic.publicWorks=cs.dynamic.publicWorks||[];
 cs.dynamic.publicWorks.push({policyId:p.id,title:p.title,startedTurn:turn,completeTurn:turn+(p.durationTurns||1),status:'active'});
 if(eff.country?.foodDays)cs.meanFoodReserveDays=round(cs.meanFoodReserveDays+eff.country.foodDays,2);
 if(eff.country?.health)cs.meanHealth=round(clamp(cs.meanHealth+eff.country.health),2);
 if(eff.country?.stress)cs.meanStress=round(clamp(cs.meanStress+eff.country.stress),2);
 for(const [sid,d] of Object.entries(eff.settlement||{})){
  const ss=cs.settlementStates[sid];if(!ss)continue;
  if(d.foodDays)ss.meanFoodReserveDays=round(ss.meanFoodReserveDays+d.foodDays,2);
  if(d.health)ss.meanHealth=round(clamp(ss.meanHealth+d.health),2);
  if(d.stress)ss.meanStress=round(clamp(ss.meanStress+d.stress),2);
 }
 for(const [rid,d] of Object.entries(eff.resources||{})){
  if(state.worldDynamic.resources[rid])state.worldDynamic.resources[rid].stockIndex=round(clamp(state.worldDynamic.resources[rid].stockIndex+d),2);
 }
 if(eff.explorationKm)cs.verifiedExplorationRadiusKm=round(cs.verifiedExplorationRadiusKm+eff.explorationKm,2);
 const affected=[];
 for(const c0 of Object.values(data.people)){
  if((state.roster.inactiveCitizenIds||[]).includes(c0.citizenId))continue;
  const local=(p.affectedSettlements||[]).includes(c0.settlementId),benefit=p.sectorBenefits?.[c0.occupation.sector]||0,cost=p.sectorCosts?.[c0.occupation.sector]||0;
  if(!local&&!benefit&&!cost)continue;
  const sd=(local?-0.08:0)-(benefit*.10)+(cost*.14)+(eff.settlement?.[c0.settlementId]?.stress||0)*.35;
  const hd=(eff.settlement?.[c0.settlementId]?.health||0)*.45+(eff.country?.health||0)*.25;
  applyOverlay(country,c0.citizenId,{stress:sd,health:hd},{turn,kind:'policy',policyId:p.id,outcome:'passed'});
  affected.push({citizenId:c0.citizenId,stressDelta:round(sd),healthDelta:round(hd)});
 }
 citizenDeltaLog.push({country,policyId:p.id,affectedCount:affected.length,sample:affected.slice(0,20)});
}
function foodBalance(country,data){
 const productivity=catalog.foodProductivityPersonDaysPerWorkerWeek,season=seasonalFoodModifier(country,state.calendar.dayOfYear);
 let wx=1;
 if(country==='ARCUS')wx=clamp(1-Math.max(0,input.weather.ARCUS.coastalWindIndex-60)*.005,.78,1.02);
 if(country==='MIREA'){const p=input.weather.MIREA.riverPressureIndex;wx=p>80?.86:p<35?.91:p>=55&&p<=70?1.03:1;}
 if(country==='VALD')wx=input.weather.VALD.coldPressureIndex>55?.92:1;
 let production=0;
 for(const raw of Object.values(data.people)){
  if((state.roster.inactiveCitizenIds||[]).includes(raw.citizenId))continue;
  const c=effective(raw,country);
  const base=productivity[c.occupationId]||0;if(base)production+=base*season*wx;
 }
 const pop=state.countries[country].population,consumption=pop*7;
 const rawDelta=(production-consumption)/Math.max(1,pop);
 const currentReserve=state.countries[country].meanFoodReserveDays;
 const storageSpoilageDays=currentReserve>120?(currentReserve-120)*.025:0;
 const delta=rawDelta-storageSpoilageDays;
 return{
  productionPersonDays:round(production,1),
  consumptionPersonDays:round(consumption,1),
  grossReserveDaysDelta:round(rawDelta,3),
  storageSpoilageDays:round(storageSpoilageDays,3),
  reserveDaysDelta:round(delta,3),
  seasonModifier:season,
  weatherModifier:round(wx,3)
 };
}
const NEWBORN_NAMES={
 ARCUS:['Eren','Sela','Tovin','Mael','Nara','Oren','Lio','Cassa','Venn','Sorin','Talin','Mara','Corin','Dara','Ira','Kelan','Ronel','Ari','Vesna','Joren','Marek','Elia','Rovan','Saren','Neris'],
 MIREA:['Nalia','Emon','Suri','Lema','Aven','Risa','Talen','Meri','Ilan','Sena','Aral','Nora','Vela','Eli','Mira','Ona','Tesa','Nemi','Sava','Malen','Rina','Ereni'],
 VALD:['Bren','Kora','Darek','Sivra','Torv','Neris','Varek','Ossa','Kelan','Runa','Maror','Drovin','Fena','Karel','Velka','Saren','Orm','Hela','Tarn','Ves','Brana','Korin']
};
function makeNewborn(country,mother,partnerId,household,r,serial,bornAbsoluteDay){
 const father=partnerId?dataScope?.people?.[partnerId]:null;
 const prefix=country==='ARCUS'?'ARC':country==='MIREA'?'MIR':'VAL';
 const id=prefix+'-N'+pad(turn)+'-'+String(serial).padStart(3,'0');
 const parentProfiles=[mother,father].filter(Boolean);
 const avg=(fn,def=50)=>{
  const vals=parentProfiles.map(p=>fn(p)).filter(v=>Number.isFinite(v));
  return vals.length?vals.reduce((x,y)=>x+y,0)/vals.length:def;
 };
 const jitter=(base,spread=8)=>Math.round(clamp(base+(r()-.5)*spread*2));
 const bigFive={
  openness:jitter(avg(p=>p.psychology?.bigFive?.openness),9),
  conscientiousness:jitter(avg(p=>p.psychology?.bigFive?.conscientiousness),9),
  extraversion:jitter(avg(p=>p.psychology?.bigFive?.extraversion),10),
  agreeableness:jitter(avg(p=>p.psychology?.bigFive?.agreeableness),9),
  emotionalVolatility:jitter(avg(p=>p.psychology?.bigFive?.emotionalVolatility),10)
 };
 const actionTendencies={
  riskTolerance:jitter(avg(p=>p.psychology?.actionTendencies?.riskTolerance),10),
  patience:jitter(avg(p=>p.psychology?.actionTendencies?.patience),10),
  trustBaseline:jitter(avg(p=>p.psychology?.actionTendencies?.trustBaseline),9),
  reciprocity:jitter(avg(p=>p.psychology?.actionTendencies?.reciprocity),9),
  conflictAversion:jitter(avg(p=>p.psychology?.actionTendencies?.conflictAversion),10),
  authorityAcceptance:50,statusDrive:30,curiosity:55,persistence:45,generosity:50,resentmentRetention:20,shameSensitivity:30,impulsivity:60
 };
 const values={family:70,autonomy:30,security:65,achievement:30,status:20,tradition:50,fairness:50,community:60,novelty:55,faith:40,materialComfort:40,environment:50};
 const bornAbs=Math.floor(bornAbsoluteDay);
 return{
  citizenId:id,countryId:country,householdId:household.householdId,settlementId:mother.settlementId,
  givenName:NEWBORN_NAMES[country][Math.floor(r()*NEWBORN_NAMES[country].length)],familyName:mother.familyName,sex:r()<.5?'female':'male',
  ageYears:0,ageDays:0,bornTurn:turn,bornAbsoluteDay:bornAbs,
  parentIds:[mother.citizenId,partnerId].filter(Boolean),
  birthDayOfYear:((bornAbs-1)%365+365)%365+1,
  occupationId:'child',occupation:{id:'child',sector:'dependent',yearsExperience:0,skill:0,status:'dependent'},
  psychology:{bigFive,actionTendencies,epistemicTraits:{skepticism:20,rumorSusceptibility:20,deferenceToExpertise:70,memoryReliability:20},stressResponses:['seekAllies'],developmentalStability:.15},
  values,
  goals:{primaryGoal:'remain safe with caregivers',secondaryGoal:'develop through household care',protectedThing:'caregiver access',desiredStatus:'none',avoidAtAllCosts:'loss of essential care'},
  materialState:{health:96,stress:12,householdFoodDays:mother.materialState?.householdFoodDays||60,householdDebt:mother.materialState?.householdDebt||0},
  lifeHistory:[{age:0,type:'birth',detail:'born into household '+household.householdId}],
  psychologyFingerprint:crypto.createHash('sha256').update(id+'|'+JSON.stringify(bigFive)).digest('hex').slice(0,16)
 };
}
let dataScope=null;
function applyDeathConsequences(country,death,data,turnEvents){
 const dead=data.people[death.citizenId];if(!dead)return;
 const closeTypes=new Set(['partner','parent','child','sibling','grandparent','grandchild','friend','relative']);
 const connected=(data.social.edges||[]).filter(e=>(e.from===death.citizenId||e.to===death.citizenId)&&closeTypes.has(e.type));
 const impacted=new Map();
 for(const e of connected){
  const other=e.from===death.citizenId?e.to:e.from;
  if(other===death.citizenId||!data.people[other])continue;
  const intensity=Math.max(e.affection||0,e.trust||0);
  const delta=e.type==='partner'||e.type==='parent'||e.type==='child'?7+intensity/18:e.type==='sibling'?5+intensity/24:2+intensity/35;
  impacted.set(other,Math.max(impacted.get(other)||0,delta));
 }
 for(const [id,stress] of impacted)applyOverlay(country,id,{stress},{turn,kind:'bereavement',citizenId:death.citizenId,relation:'social_graph'});
 const worker=effective(dead,country).occupation?.status==='worker';
 applyHouseholdOverlay(country,dead.householdId,{stress:worker?3:2,foodDays:worker?-1.5:-.4,incomeCapacity:worker?-.18:0},{turn,kind:'household_death',citizenId:death.citizenId});
 turnEvents.push({turn,country,type:'death_consequences',citizenId:death.citizenId,householdId:dead.householdId,affectedRelations:impacted.size,workerIncomeLoss:worker});
}
function simulateDemography(country,data){
 state.demographyState=state.demographyState||{pregnancies:{},seededPregnanciesAtTurn0:0,gestationDays:266};
 state.demographyState.pregnancies=state.demographyState.pregnancies||{};
 const pregnancies=state.demographyState.pregnancies;
 const inactive=new Set(state.roster.inactiveCitizenIds||[]);
 const partner={};
 for(const e of data.familyEdges)if(e.type==='partner')partner[e.from]=e.to;
 const births=[],deaths=[],conceptions=[],cancelledPregnancies=[];
 const currentAbs=absoluteDay(state.calendar),weekEndAbs=currentAbs+7;

 dataScope=data;

 // Pregnancies persist across turns. Birth occurs only when the fixed due date falls in this seven-day interval.
 for(const [motherId,preg] of Object.entries({...pregnancies})){
  if(preg.countryId!==country)continue;
  const mother=data.people[motherId];
  if(!mother||inactive.has(motherId)){
   cancelledPregnancies.push({...preg,cancelledTurn:turn,reason:'mother_inactive_before_birth'});
   delete pregnancies[motherId];
   continue;
  }
  if(preg.dueAbsoluteDay>weekEndAbs)continue;
  const h=data.households[preg.householdId];
  if(!h){
   cancelledPregnancies.push({...preg,cancelledTurn:turn,reason:'household_missing'});
   delete pregnancies[motherId];
   continue;
  }
  const r=rngFor(state.worldId+'|DELIVERY|'+turn+'|'+motherId);
  const bornAbs=Math.max(currentAbs+1,Math.min(weekEndAbs,preg.dueAbsoluteDay));
  const newborn=makeNewborn(country,effective(mother,country),preg.partnerId,h,r,births.length+1,bornAbs);
  births.push(newborn);
  delete pregnancies[motherId];

  const ho=(state.householdOverlays[country][h.householdId]??={foodDaysOffset:0,debtOffset:0,stressOffset:0,incomeCapacityOffset:0,newMemberIds:[],memories:[]});
  ho.newMemberIds=ho.newMemberIds||[];
  if(!ho.newMemberIds.includes(newborn.citizenId))ho.newMemberIds.push(newborn.citizenId);
  const relationshipBase={countryId:country,turnCreated:turn,trust:90,affection:92,fear:5,obligation:80,respect:35,envy:0,grievance:0,contactFrequency:98};
  state.roster.dynamicRelationships=state.roster.dynamicRelationships||[];
  state.roster.dynamicRelationships.push(
   {...relationshipBase,from:motherId,to:newborn.citizenId,type:'parent'},
   {...relationshipBase,from:newborn.citizenId,to:motherId,type:'child'}
  );
  if(preg.partnerId){
   state.roster.dynamicRelationships.push(
    {...relationshipBase,from:preg.partnerId,to:newborn.citizenId,type:'parent'},
    {...relationshipBase,from:newborn.citizenId,to:preg.partnerId,type:'child'}
   );
  }
 }

 // New conceptions create a durable pregnancy record; they never create an immediate newborn.
 const birthedMothers=new Set(births.flatMap(b=>b.parentIds.slice(0,1)));
 for(const h of Object.values(data.households)){
  const members=h.memberIds.map(id=>data.people[id]).filter(Boolean).map(c=>effective(c,country));
  for(const mother of members){
   if(mother.sex!=='female'||mother.ageYears<19||mother.ageYears>40)continue;
   if(inactive.has(mother.citizenId)||pregnancies[mother.citizenId]||birthedMothers.has(mother.citizenId))continue;
   const partnerId=partner[mother.citizenId];
   if(!partnerId||inactive.has(partnerId))continue;
   const r=rngFor(state.worldId+'|CONCEPTION|'+turn+'|'+mother.citizenId);
   if(r()>=.00165)continue;
   const conceptionAbsoluteDay=currentAbs+ri(r,1,7);
   const gestationDays=state.demographyState.gestationDays||266;
   const dueAbsoluteDay=conceptionAbsoluteDay+gestationDays+ri(r,-4,4);
   const pregnancy={
    pregnancyId:'PREG-'+country+'-'+mother.citizenId+'-T'+pad(turn),
    countryId:country,motherId:mother.citizenId,partnerId,
    householdId:mother.householdId,settlementId:mother.settlementId,
    conceivedTurn:turn,conceptionAbsoluteDay,dueAbsoluteDay,
    dueTurn:turn+Math.ceil((dueAbsoluteDay-weekEndAbs)/7)
   };
   pregnancies[mother.citizenId]=pregnancy;
   conceptions.push(pregnancy);
  }
 }

 // Mortality is evaluated for the week after births/conceptions; a conception is cancelled if the mother dies in the same week.
 for(const base of Object.values(data.people)){
  if(inactive.has(base.citizenId))continue;
  const c=effective(base,country);
  const r=rngFor(state.worldId+'|DEATH|'+turn+'|'+c.citizenId);
  let p=c.ageYears<45?.00002:c.ageYears<65?.00008:c.ageYears<75?.00025:c.ageYears<85?.00070:c.ageYears<95?.00250:.00600;
  if(c.materialState.health<40)p+=.00035;
  const hazard=livelihoodModel.occupations[c.occupationId]?.hazard||0;
  p+=hazard*.000008;
  if(r()<p){
   const work=r()<hazard*.055;
   const death={citizenId:c.citizenId,countryId:country,settlementId:c.settlementId,householdId:c.householdId,turn,cause:work?'work_incident':'health_or_age'};
   deaths.push(death);
   if(pregnancies[c.citizenId]){
    cancelledPregnancies.push({...pregnancies[c.citizenId],cancelledTurn:turn,reason:'mother_died_during_pregnancy'});
    delete pregnancies[c.citizenId];
   }
  }
 }
 return{births,deaths,conceptions,cancelledPregnancies,activePregnanciesAfterTurn:Object.values(pregnancies).filter(x=>x.countryId===country).length};
}
function advanceCalendar(){
 state.turn=turn;
 state.calendar=advanceWorldCalendar(state.calendar,7,turn);
}

function processBirthdays(country,data,calendarBefore,turnEvents){
 const inactive=new Set(state.roster.inactiveCitizenIds||[]);
 for(const base of Object.values(data.people)){
  if(inactive.has(base.citizenId))continue;
  const beforeAge=modelAgeYears(base,calendarBefore);
  const afterAge=modelAgeYears(base,state.calendar);
  if(afterAge<=beforeAge)continue;
  let healthDelta=0;
  if(afterAge>=85)healthDelta=-0.70;
  else if(afterAge>=70)healthDelta=-0.35;
  else if(afterAge>=55)healthDelta=-0.15;
  if(healthDelta)applyOverlay(country,base.citizenId,{health:healthDelta},{turn,kind:'birthday_aging',age:afterAge});
  turnEvents.push({turn,country,type:'birthday',citizenId:base.citizenId,ageBefore:beforeAge,ageAfter:afterAge,healthDelta});
 }
}

function occupationStatus(id){
 if(id==='child')return'dependent';
 if(id==='student')return'student';
 if(id==='apprentice'||id==='map_apprentice')return'apprentice';
 if(id==='retired')return'retired';
 return'worker';
}
function chooseAdultOccupation(country,c){
 const profile=livelihoodModel.settlementProfiles[c.settlementId]?.weights||{};
 const age=currentAge(c);
 const choices=Object.entries(profile).filter(([id,w])=>{
  const m=livelihoodModel.occupations[id];
  return w>0&&m&&!['child','student','apprentice','map_apprentice','retired'].includes(id)&&age>=m.minAge&&age<=m.maxAge;
 });
 if(!choices.length)return'domestic_producer';
 const total=choices.reduce((a,[,w])=>a+w,0);
 const r=rngFor(state.worldId+'|CAREER|'+c.citizenId+'|'+Math.floor(age));
 let x=r()*total;
 for(const [id,w] of choices){x-=w;if(x<=0)return id;}
 return choices[choices.length-1][0];
}
function setOccupation(country,c,id,reason,targetOccupationId=null){
 const m=(state.citizenOverlays[country]??={});
 const o=(m[c.citizenId]??={stressOffset:0,healthOffset:0,memories:[]});
 o.occupationId=id;
 o.occupationStartedAbsoluteDay=absoluteDay(state.calendar);
 o.occupationSkillBase=id==='student'?0:id==='apprentice'||id==='map_apprentice'?12:id==='retired'?Math.min(70,c.occupation?.skill||45):22+(seedInt('CAREER_SKILL|'+c.citizenId+'|'+id)%22);
 if(targetOccupationId)o.targetOccupationId=targetOccupationId;
 else if(id!=='apprentice'&&id!=='map_apprentice')delete o.targetOccupationId;
 o.memories=o.memories||[];
 o.memories.push({turn,kind:'life_stage',occupationId:id,reason});
 if(o.memories.length>30)o.memories=o.memories.slice(-30);
}
function applyLifeStageTransitions(country,data,turnEvents){
 const inactive=new Set(state.roster.inactiveCitizenIds||[]);
 for(const base of Object.values(data.people)){
  if(inactive.has(base.citizenId))continue;
  const c=effective(base,country);
  const age=c.ageYears,occ=c.occupationId,status=occupationStatus(occ);
  let next=null,reason=null,target=null;
  if(occ==='child'&&age>=6){next='student';reason='school_age_reached';}
  else if(occ==='student'&&age>=16){
   target=chooseAdultOccupation(country,c);
   next=target==='map_worker'?'map_apprentice':'apprentice';
   reason='entered_apprenticeship';
  }else if((occ==='apprentice'||occ==='map_apprentice')&&age>=18){
   const overlay=state.citizenOverlays?.[country]?.[c.citizenId]||{};
   next=overlay.targetOccupationId||chooseAdultOccupation(country,c);
   reason='entered_adult_occupation';
  }else if(status==='worker'){
   const om=livelihoodModel.occupations[occ];
   if(om&&age>om.maxAge){next='retired';reason='occupation_age_limit_reached';}
  }
  if(!next||next===occ)continue;
  setOccupation(country,c,next,reason,target);
  turnEvents.push({turn,country,type:'life_stage_transition',citizenId:c.citizenId,age,fromOccupationId:occ,toOccupationId:next,targetOccupationId:target,reason});
 }
}

function ensureHouseholdOverlay(country,householdId){
 const m=(state.householdOverlays[country]??={});
 return (m[householdId]??={foodDaysOffset:0,debtOffset:0,stressOffset:0,incomeCapacityOffset:0,newMemberIds:[],departedMemberIds:[],memories:[]});
}
function moveCitizenHousehold(country,citizenId,fromHouseholdId,toHouseholdId){
 if(!fromHouseholdId||!toHouseholdId||fromHouseholdId===toHouseholdId)return;
 const cm=(state.citizenOverlays[country]??={});
 const co=(cm[citizenId]??={stressOffset:0,healthOffset:0,memories:[]});
 co.householdId=toHouseholdId;
 co.memories=co.memories||[];
 co.memories.push({turn,kind:'household_move',fromHouseholdId,toHouseholdId});
 if(co.memories.length>30)co.memories=co.memories.slice(-30);

 const old=ensureHouseholdOverlay(country,fromHouseholdId);
 old.departedMemberIds=old.departedMemberIds||[];
 if(!old.departedMemberIds.includes(citizenId))old.departedMemberIds.push(citizenId);
 old.newMemberIds=(old.newMemberIds||[]).filter(id=>id!==citizenId);

 const next=ensureHouseholdOverlay(country,toHouseholdId);
 next.newMemberIds=next.newMemberIds||[];
 if(!next.newMemberIds.includes(citizenId))next.newMemberIds.push(citizenId);
 next.departedMemberIds=(next.departedMemberIds||[]).filter(id=>id!==citizenId);
}
function householdScore(h){
 if(!h)return 0;
 const e=h.economy||{};
 return (e.dwellingQuality||50)*.45+(e.foodDays||60)*.20+(e.fuelDays||60)*.12+(e.cashLikeReserve||0)*.08-Math.max(0,e.debtUnits||0)*.12;
}
function formPartnerships(country,data,turnEvents){
 state.roster.dynamicRelationships=state.roster.dynamicRelationships||[];
 const inactive=new Set(state.roster.inactiveCitizenIds||[]);
 const activePartner=new Map();
 for(const e of data.familyEdges){
  if(e.type!=='partner'||inactive.has(e.from)||inactive.has(e.to))continue;
  activePartner.set(e.from,e.to);
 }
 const closeFamily=new Set();
 for(const e of data.familyEdges){
  if(['parent','child','sibling','grandparent','grandchild'].includes(e.type)){
   closeFamily.add(e.from+'|'+e.to);closeFamily.add(e.to+'|'+e.from);
  }
 }
 const candidates=Object.values(data.people).map(x=>effective(x,country)).filter(c=>{
  if(inactive.has(c.citizenId)||activePartner.has(c.citizenId))return false;
  if(c.ageYears<19||c.ageYears>45)return false;
  if(['dependent','student'].includes(c.occupation?.status))return false;
  return true;
 }).sort((a,b)=>a.citizenId.localeCompare(b.citizenId));
 const available=new Map(candidates.map(c=>[c.citizenId,c]));
 const paired=new Set();

 for(const c of candidates){
  if(paired.has(c.citizenId)||!available.has(c.citizenId))continue;
  const attempt=rngFor(state.worldId+'|PARTNER_ATTEMPT|'+turn+'|'+c.citizenId);
  if(attempt()>=.0022)continue;

  let best=null;
  for(const other of candidates){
   if(other.citizenId===c.citizenId||paired.has(other.citizenId)||!available.has(other.citizenId))continue;
   if(other.settlementId!==c.settlementId||other.householdId===c.householdId)continue;
   if(Math.abs(other.ageYears-c.ageYears)>10)continue;
   if(closeFamily.has(c.citizenId+'|'+other.citizenId))continue;

   const familySimilarity=100-Math.abs((c.values?.family??50)-(other.values?.family??50));
   const communitySimilarity=100-Math.abs((c.values?.community??50)-(other.values?.community??50));
   const ageFit=100-Math.abs(other.ageYears-c.ageYears)*8;
   const agree=((c.psychology?.bigFive?.agreeableness??50)+(other.psychology?.bigFive?.agreeableness??50))/2;
   const trust=((c.psychology?.actionTendencies?.trustBaseline??50)+(other.psychology?.actionTendencies?.trustBaseline??50))/2;
   const rr=rngFor(state.worldId+'|PARTNER_MATCH|'+c.citizenId+'|'+other.citizenId);
   const score=familySimilarity*.24+communitySimilarity*.16+ageFit*.22+agree*.18+trust*.16+(rr()-.5)*8;
   if(!best||score>best.score)best={other,score};
  }
  if(!best||best.score<48)continue;

  const other=best.other;
  paired.add(c.citizenId);paired.add(other.citizenId);
  activePartner.set(c.citizenId,other.citizenId);activePartner.set(other.citizenId,c.citizenId);

  const ch=data.households[c.householdId],oh=data.households[other.householdId];
  const cScore=householdScore(ch),oScore=householdScore(oh);
  let target=cScore>=oScore?c.householdId:other.householdId;
  let mover=target===c.householdId?other:c;
  if(!data.households[target]){target=c.householdId;mover=other;}
  moveCitizenHousehold(country,mover.citizenId,mover.householdId,target);

  const trust=Math.round(clamp(56+best.score*.22));
  const affection=Math.round(clamp(60+best.score*.25));
  const base={countryId:country,turnCreated:turn,trust,affection,fear:4,obligation:62,respect:Math.round(clamp(45+best.score*.18)),envy:4,grievance:0,contactFrequency:82};
  state.roster.dynamicRelationships.push(
   {...base,from:c.citizenId,to:other.citizenId,type:'partner'},
   {...base,from:other.citizenId,to:c.citizenId,type:'partner'}
  );
  turnEvents.push({turn,country,type:'partnership_formed',citizenIds:[c.citizenId,other.citizenId],settlementId:c.settlementId,movedCitizenId:mover.citizenId,targetHouseholdId:target,compatibilityScore:round(best.score,2)});
 }
}

function institutionCandidateScore(country,c,data){
 const incoming=data.incoming?.[c.citizenId]||[];
 const respect=incoming.length?incoming.reduce((a,e)=>a+(e.respect||50),0)/incoming.length:45;
 const trust=incoming.length?incoming.reduce((a,e)=>a+(e.trust||50),0)/incoming.length:45;
 const ec=effective(c,country);
 return respect*.28+trust*.18+(ec.occupation?.skill||40)*.18+ec.psychology.bigFive.conscientiousness*.14+ec.values.community*.10+ec.values.fairness*.07+(100-ec.materialState.stress)*.05;
}
function selectCouncilMembers(country,settlementId,seats,data){
 const inactive=new Set(state.roster.inactiveCitizenIds||[]);
 const eligible=Object.values(data.people).filter(base=>{
  if(inactive.has(base.citizenId))return false;
  const c=effective(base,country);
  return c.settlementId===settlementId&&c.ageYears>=25&&c.ageYears<=76&& !['dependent','student'].includes(c.occupation?.status);
 }).map(c=>({c,score:institutionCandidateScore(country,c,data)}))
   .sort((a,b)=>b.score-a.score||a.c.citizenId.localeCompare(b.c.citizenId));
 const picked=[],occ={};
 const maxSame=Math.max(2,Math.ceil(seats*.4));
 for(const x of eligible){
  if(picked.length>=seats)break;
  const o=x.c.occupationId||'other';
  if((occ[o]||0)>=maxSame)continue;
  picked.push(x);occ[o]=(occ[o]||0)+1;
 }
 for(const x of eligible){if(picked.length>=seats)break;if(!picked.some(y=>y.c.citizenId===x.c.citizenId))picked.push(x);}
 return picked;
}
function rotateInstitutions(country,data,turnEvents){
 const cfg=institutionModel.countries[country];
 const inst=state.countries[country].institution||structuredClone(institutions.countries[country]);
 let localsChanged=false;
 for(const [sid,council] of Object.entries(inst.localCouncils||{})){
  const inactive=(council.memberIds||[]).filter(id=>(state.roster.inactiveCitizenIds||[]).includes(id)).length;
  if(turn>=(council.termEndsTurn||Infinity)||inactive>0){
   const picked=selectCouncilMembers(country,sid,council.seats,data);
   const old=[...(council.memberIds||[])];
   council.memberIds=picked.map(x=>x.c.citizenId);
   council.memberScores=Object.fromEntries(picked.map(x=>[x.c.citizenId,round(x.score,3)]));
   council.termEndsTurn=turn+cfg.localCouncilRule.termTurns;
   localsChanged=true;
   state.institutionalHistory.push({turn,country,type:'local_council_renewal',settlementId:sid,oldMemberIds:old,newMemberIds:council.memberIds});
  }
 }
 if(turn>=(inst.nationalBody.termEndsTurn||Infinity)||localsChanged){
  const national=[];
  for(const [sid,council] of Object.entries(inst.localCouncils)){
   const ranked=(council.memberIds||[]).map(id=>({id,score:institutionCandidateScore(country,data.people[id],data)})).filter(x=>data.people[x.id]).sort((a,b)=>b.score-a.score);
   for(const x of ranked.slice(0,cfg.nationalBody.delegatesPerSettlement))national.push({citizenId:x.id,settlementId:sid,selectionScore:round(x.score,3)});
  }
  const old=inst.nationalBody.members?.map(x=>x.citizenId)||[];
  inst.nationalBody.members=national;
  inst.nationalBody.termEndsTurn=turn+cfg.nationalBody.termTurns;
  state.institutionalHistory.push({turn,country,type:'national_body_renewal',oldMemberIds:old,newMemberIds:national.map(x=>x.citizenId)});
 }
 const currentExec=inst.executive.memberIds||[];
 const execInactive=currentExec.some(id=>(state.roster.inactiveCitizenIds||[]).includes(id));
 if(turn>=(inst.executive.termEndsTurn||Infinity)||execInactive){
  const count=cfg.executive.count;
  const previous=new Set(currentExec);
  const ranked=(inst.nationalBody.members||[]).map(m=>({m,score:institutionCandidateScore(country,data.people[m.citizenId],data)})).filter(x=>data.people[x.m.citizenId]).sort((a,b)=>{
   const ap=previous.has(a.m.citizenId)?1:0,bp=previous.has(b.m.citizenId)?1:0;
   return ap-bp||b.score-a.score;
  });
  const next=[],settlements=new Set();
  for(const x of ranked){
   if(next.length>=count)break;
   if(settlements.has(x.m.settlementId)&&ranked.some(y=>!settlements.has(y.m.settlementId)&&!next.includes(y.m.citizenId)))continue;
   next.push(x.m.citizenId);settlements.add(x.m.settlementId);
  }
  const old=[...currentExec];
  inst.executive.memberIds=next;
  inst.executive.termEndsTurn=turn+cfg.executive.termTurns;
  state.institutionalHistory.push({turn,country,type:'executive_rotation',oldMemberIds:old,newMemberIds:next});
  turnEvents.push({turn,country,type:'institution_rotation',body:inst.executive.name,oldMemberIds:old,newMemberIds:next});
 }
 state.countries[country].institution=inst;
}
function processProjectLifecycle(country,turnEvents){
 const works=state.countries[country].dynamic.publicWorks||[];
 for(const w of works){
  if(w.status==='active'&&turn>=w.completeTurn){
   w.status='completed';w.completedTurn=turn;
   turnEvents.push({turn,country,type:'project_completed',policyId:w.policyId,title:w.title});
  }
 }
}

function selectContactRepresentative(country){
 const data=loadCountry(country);
 const inactive=new Set(state.roster.inactiveCitizenIds||[]);
 const preferred=new Set(['map_worker','map_apprentice','signal_watch','pass_watch','boat_operator','trader','fish_trader','pack_transporter']);
 const rows=Object.values(data.people).filter(x=>!inactive.has(x.citizenId)).map(raw=>{
  const c=effective(raw,country);
  const curiosity=c.psychology?.actionTendencies?.curiosity??50;
  const trust=c.psychology?.actionTendencies?.trustBaseline??50;
  const risk=c.psychology?.actionTendencies?.riskTolerance??50;
  const skill=c.occupation?.skill??30;
  const role=preferred.has(c.occupationId)?22:0;
  return{c,score:role+curiosity*.26+trust*.20+risk*.16+skill*.18};
 }).sort((a,b)=>b.score-a.score||a.c.citizenId.localeCompare(b.c.citizenId));
 return rows[0]?.c||null;
}
function initialContactTrust(a,b){
 if(!a||!b)return 50;
 const ta=a.psychology?.actionTendencies?.trustBaseline??50;
 const tb=b.psychology?.actionTendencies?.trustBaseline??50;
 const aa=a.psychology?.bigFive?.agreeableness??50;
 const ab=b.psychology?.bigFive?.agreeableness??50;
 const ca=a.psychology?.actionTendencies?.curiosity??50;
 const cb=b.psychology?.actionTendencies?.curiosity??50;
 return round(clamp((ta+tb)*.28+(aa+ab)*.14+(ca+cb)*.08),2);
}
function processContactInteraction(key,ps,a,b,min,reach,margin){
 if(!['direct_contact','sustained_route'].includes(ps.stage))return;
 const r=rngFor(state.worldId+'|CROSS_BORDER|'+turn+'|'+key);
 const stageGain=ps.stage==='sustained_route'?1.3:.65;
 const noise=(r()-.5)*1.6;
 const trustEffect=(ps.trustIndex-50)*.012;
 ps.familiarity=round(clamp((ps.familiarity||0)+stageGain+trustEffect+noise),2);
 ps.lastInteractionTurn=turn;

 const misunderstandingChance=Math.max(.015,(58-ps.trustIndex)/900);
 if(r()<misunderstandingChance){
  ps.trustIndex=round(clamp(ps.trustIndex-1.8),2);
  ps.misunderstandings=(ps.misunderstandings||0)+1;
  state.countries[a].meanStress=round(clamp(state.countries[a].meanStress+.08),2);
  state.countries[b].meanStress=round(clamp(state.countries[b].meanStress+.08),2);
  state.eventLog.push({turn,type:'cross_border_misunderstanding',countries:[a,b],stage:ps.stage,trustIndex:ps.trustIndex,familiarity:ps.familiarity});
  return;
 }

 ps.trustIndex=round(clamp(ps.trustIndex+.10+Math.max(0,ps.familiarity-20)*.003),2);
 if(ps.stage==='sustained_route'&&r()<Math.min(.30,.07+(ps.familiarity||0)/500)){
  const ca=state.countries[a],cb=state.countries[b];
  const donor=ca.meanFoodReserveDays>=cb.meanFoodReserveDays?ca:cb;
  const recipient=donor===ca?cb:ca;
  const donorId=donor===ca?a:b,recipientId=donor===ca?b:a;
  const gap=donor.meanFoodReserveDays-recipient.meanFoodReserveDays;
  let transferPersonDays=0;
  if(gap>8){
   transferPersonDays=Math.min(120,Math.max(20,gap*4));
   donor.meanFoodReserveDays=round(Math.max(0,donor.meanFoodReserveDays-transferPersonDays/donor.population),2);
   recipient.meanFoodReserveDays=round(recipient.meanFoodReserveDays+transferPersonDays/recipient.population,2);
  }
  ca.verifiedExplorationRadiusKm=round(ca.verifiedExplorationRadiusKm+.08,2);
  cb.verifiedExplorationRadiusKm=round(cb.verifiedExplorationRadiusKm+.08,2);
  ps.exchanges=(ps.exchanges||0)+1;
  state.eventLog.push({turn,type:'cross_border_exchange',countries:[a,b],stage:ps.stage,donorCountry:transferPersonDays?donorId:null,recipientCountry:transferPersonDays?recipientId:null,foodPersonDaysTransferred:round(transferPersonDays,1),trustIndex:ps.trustIndex,familiarity:ps.familiarity});
 }
}
function contactCheck(){
 const pairs={ARCUS_MIREA:['ARCUS','MIREA'],MIREA_VALD:['MIREA','VALD'],ARCUS_VALD:['ARCUS','VALD']};
 const truth=read('sidehustle-autopublish/note/worldsim/world/observer_truth_v1.json');
 state.contact.pairStates=state.contact.pairStates||{};
 for(const [key,[a,b]] of Object.entries(pairs)){
  const min=truth.map.minimumStraightLineKm[key];
  const reach=state.countries[a].verifiedExplorationRadiusKm+state.countries[b].verifiedExplorationRadiusKm;
  const margin=round(reach-min,2);
  let ps=state.contact.pairStates[key]||null;

  if(!ps&&reach>=min){
   const ra=selectContactRepresentative(a),rb=selectContactRepresentative(b);
   ps={
    pair:[a,b],stage:'verified_presence',firstDetectedTurn:turn,lastStageTurn:turn,
    minDistanceKm:min,reachKm:round(reach,2),reachMarginKm:margin,
    representativeIds:[ra?.citizenId||null,rb?.citizenId||null],
    trustIndex:initialContactTrust(ra,rb),familiarity:0,misunderstandings:0,exchanges:0
   };
   state.contact.pairStates[key]=ps;
   if(!state.contact.knownPairs.some(x=>x.includes(a)&&x.includes(b)))state.contact.knownPairs.push([a,b]);
   state.contact.firstContactOccurred=true;
   for(const [self,other] of [[a,b],[b,a]]){
    state.countries[self].knownOtherCountries=true;
    state.countries[self].knownCountryIds=state.countries[self].knownCountryIds||[];
    if(!state.countries[self].knownCountryIds.includes(other))state.countries[self].knownCountryIds.push(other);
   }
   state.eventLog.push({turn,type:'first_contact_condition_met',countries:[a,b],stage:'verified_presence',representativeIds:ps.representativeIds,trustIndex:ps.trustIndex,reach:round(reach,2),min,margin});
   continue;
  }
  if(!ps)continue;

  ps.reachKm=round(reach,2);ps.reachMarginKm=margin;
  let next=ps.stage;
  if(margin>=20)next='sustained_route';
  else if(margin>=8)next='direct_contact';
  else next='verified_presence';

  const rank={verified_presence:1,direct_contact:2,sustained_route:3};
  if(rank[next]>rank[ps.stage]){
   const from=ps.stage;
   ps.stage=next;ps.lastStageTurn=turn;
   state.eventLog.push({turn,type:'contact_stage_changed',countries:[a,b],fromStage:from,toStage:next,representativeIds:ps.representativeIds,trustIndex:ps.trustIndex,reach:round(reach,2),min,margin});
  }
  processContactInteraction(key,ps,a,b,min,reach,margin);
 }
}

const voteOut={},citizenDeltaLog=[],demographyOut={},turnEvents=[];
const calendarBefore=normalizeCalendar(state.calendar);
for(const country of ['ARCUS','MIREA','VALD']){
 const data=loadCountry(country);voteOut[country]=[];
 processProjectLifecycle(country,turnEvents);
 for(const proposal of input.proposals[country]||[]){
  const v=conductVote(country,proposal,data);voteOut[country].push(v);
  turnEvents.push({turn,country,type:'policy_vote',policyId:v.policyId,title:v.title,passed:v.passed,yes:v.yes,no:v.no,abstain:v.abstain,yesShare:v.yesShare});
  applyPolicy(country,v,data,citizenDeltaLog);
 }
 const fb=foodBalance(country,data);
 state.countries[country].meanFoodReserveDays=round(Math.max(0,state.countries[country].meanFoodReserveDays+fb.reserveDaysDelta),2);
 for(const ss of Object.values(state.countries[country].settlementStates))ss.meanFoodReserveDays=round(Math.max(0,ss.meanFoodReserveDays+fb.reserveDaysDelta),2);
 turnEvents.push({turn,country,type:'food_balance',...fb});
 const dem=simulateDemography(country,data);demographyOut[country]=dem;
 state.roster.newCitizens.push(...dem.births);
 for(const d of dem.deaths){
  if(!state.roster.inactiveCitizenIds.includes(d.citizenId))state.roster.inactiveCitizenIds.push(d.citizenId);
  applyDeathConsequences(country,d,data,turnEvents);
 }
 state.countries[country].population+=dem.births.length-dem.deaths.length;
 for(const b of dem.births){
  const ss=state.countries[country].settlementStates[b.settlementId];
  if(ss)ss.population+=1;
 }
 for(const d of dem.deaths){
  const ss=state.countries[country].settlementStates[d.settlementId];
  if(ss)ss.population=Math.max(0,ss.population-1);
 }
 state.countries[country].dynamic.birthsThisTurn=dem.births.length;state.countries[country].dynamic.deathsThisTurn=dem.deaths.length;
 if(dem.births.length||dem.deaths.length||dem.conceptions.length||dem.cancelledPregnancies.length)turnEvents.push({turn,country,type:'demography',births:dem.births.length,deaths:dem.deaths.length,conceptions:dem.conceptions.length,cancelledPregnancies:dem.cancelledPregnancies.length,activePregnanciesAfterTurn:dem.activePregnanciesAfterTurn});
 rotateInstitutions(country,data,turnEvents);
}
for(const [rid,d] of Object.entries(catalog.resourceWeeklyBaseline||{}))if(state.worldDynamic.resources[rid])state.worldDynamic.resources[rid].stockIndex=round(clamp(state.worldDynamic.resources[rid].stockIndex+d),2);
state.worldDynamic.weatherHistory.push({turn,calendar:{year:calendarBefore.year,dayOfYear:calendarBefore.dayOfYear,season:calendarBefore.season,seasonStage:calendarBefore.seasonStage},...input.weather});
advanceCalendar();
turnEvents.push({turn,type:'calendar_advance',from:{year:calendarBefore.year,dayOfYear:calendarBefore.dayOfYear,absoluteDay:calendarBefore.absoluteDay,season:calendarBefore.season},to:{year:state.calendar.year,dayOfYear:state.calendar.dayOfYear,absoluteDay:state.calendar.absoluteDay,season:state.calendar.season},days:7});
for(const country of ['ARCUS','MIREA','VALD']){
 const dynamicData=loadCountry(country);
 processBirthdays(country,dynamicData,calendarBefore,turnEvents);
 applyLifeStageTransitions(country,dynamicData,turnEvents);
 formPartnerships(country,dynamicData,turnEvents);
}
contactCheck();
state.eventLog.push(...turnEvents);
state.publicationReady=turnEvents.some(e=>e.type==='policy_vote'&&e.passed)||state.contact.firstContactOccurred;
state.lastResolvedFrom={turnInputHash:crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex'),engine:'resolve_turn_v1'};
write('sidehustle-autopublish/note/worldsim/state/turn_'+pad(turn)+'/world_state.json',state);
write('sidehustle-autopublish/note/worldsim/turns/turn_'+pad(turn)+'/votes.json',voteOut);
write('sidehustle-autopublish/note/worldsim/turns/turn_'+pad(turn)+'/events.json',{version:1,turn,weather:input.weather,events:turnEvents});
write('sidehustle-autopublish/note/worldsim/turns/turn_'+pad(turn)+'/citizen_deltas.json',{version:1,turn,policyEffects:citizenDeltaLog});
write('sidehustle-autopublish/note/worldsim/turns/turn_'+pad(turn)+'/demography.json',{version:1,turn,countries:demographyOut});
const turnSummary={
 version:1,
 turn,
 populations:Object.fromEntries(Object.entries(state.countries).map(([k,v])=>[k,v.population])),
 foodReserveDays:Object.fromEntries(Object.entries(state.countries).map(([k,v])=>[k,v.meanFoodReserveDays])),
 explorationKm:Object.fromEntries(Object.entries(state.countries).map(([k,v])=>[k,v.verifiedExplorationRadiusKm])),
 firstContact:state.contact.firstContactOccurred,
 passedPolicies:Object.fromEntries(
   Object.entries(voteOut).map(([k,v])=>[k,v.filter(x=>x.passed).map(x=>x.policyId)])
 )
};
write('sidehustle-autopublish/note/worldsim/turns/turn_'+pad(turn)+'/turn_summary.json',turnSummary);
console.log(JSON.stringify(read('sidehustle-autopublish/note/worldsim/turns/turn_'+pad(turn)+'/turn_summary.json'),null,2));
