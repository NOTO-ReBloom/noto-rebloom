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
  if(households[hid]&&Array.isArray(ho.newMemberIds)){
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
 const ho=state.householdOverlays?.[country]?.[c.householdId]||{};
 const x=structuredClone(c);
 x.ageYears=Math.floor(currentAge(c));
 if(o.settlementId)x.settlementId=o.settlementId;
 if(o.occupationId){x.occupationId=o.occupationId;x.occupation={...(x.occupation||{}),id:o.occupationId,sector:livelihoodModel.occupations[o.occupationId]?.sector||x.occupation?.sector};}
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
 const o=(m[householdId]??={foodDaysOffset:0,debtOffset:0,stressOffset:0,incomeCapacityOffset:0,newMemberIds:[],memories:[]});
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
 for(const c of Object.values(data.people)){
  if((state.roster.inactiveCitizenIds||[]).includes(c.citizenId))continue;
  const base=productivity[c.occupationId]||0;if(base)production+=base*season*wx;
 }
 const pop=state.countries[country].population,consumption=pop*7,delta=(production-consumption)/Math.max(1,pop);
 return{productionPersonDays:round(production,1),consumptionPersonDays:round(consumption,1),reserveDaysDelta:round(delta,3),seasonModifier:season,weatherModifier:round(wx,3)};
}
const NEWBORN_NAMES={
 ARCUS:['Eren','Sela','Tovin','Mael','Nara','Oren','Lio','Cassa','Venn','Sorin','Talin','Mara','Corin','Dara','Ira','Kelan','Ronel','Ari','Vesna','Joren','Marek','Elia','Rovan','Saren','Neris'],
 MIREA:['Nalia','Emon','Suri','Lema','Aven','Risa','Talen','Meri','Ilan','Sena','Aral','Nora','Vela','Eli','Mira','Ona','Tesa','Nemi','Sava','Malen','Rina','Ereni'],
 VALD:['Bren','Kora','Darek','Sivra','Torv','Neris','Varek','Ossa','Kelan','Runa','Maror','Drovin','Fena','Karel','Velka','Saren','Orm','Hela','Tarn','Ves','Brana','Korin']
};
function makeNewborn(country,mother,partnerId,household,r,serial){
 const father=partnerId?dataScope?.people?.[partnerId]:null;
 const prefix=country==='ARCUS'?'ARC':country==='MIREA'?'MIR':'VAL';
 const id=prefix+'-N'+pad(turn)+'-'+String(serial).padStart(3,'0');
 const parentProfiles=[mother,father].filter(Boolean);
 const avg=(path,def=50)=>{
  const vals=parentProfiles.map(p=>path(p)).filter(v=>Number.isFinite(v));
  return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:def;
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
 const bornAbsoluteDay=absoluteDay(state.calendar)+ri(r,1,7);
 return{
  citizenId:id,countryId:country,householdId:household.householdId,settlementId:mother.settlementId,
  givenName:NEWBORN_NAMES[country][Math.floor(r()*NEWBORN_NAMES[country].length)],familyName:mother.familyName,sex:r()<.5?'female':'male',ageYears:0,ageDays:0,bornTurn:turn,bornAbsoluteDay,
  parentIds:[mother.citizenId,partnerId].filter(Boolean),
  birthDayOfYear:((bornAbsoluteDay-1)%365)+1,
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
 const worker=dead.occupation?.status==='worker';
 applyHouseholdOverlay(country,dead.householdId,{stress:worker?3:2,foodDays:worker?-1.5:-.4,incomeCapacity:worker?-.18:0},{turn,kind:'household_death',citizenId:death.citizenId});
 turnEvents.push({turn,country,type:'death_consequences',citizenId:death.citizenId,householdId:dead.householdId,affectedRelations:impacted.size,workerIncomeLoss:worker});
}
function simulateDemography(country,data){
 const rInactive=new Set(state.roster.inactiveCitizenIds||[]),partner={};
 for(const e of data.familyEdges)if(e.type==='partner')partner[e.from]=e.to;
 const births=[],deaths=[];let bc=1;
 const households=Object.values(data.households);
 for(const h of households){
  const members=h.memberIds.map(id=>data.people[id]).filter(Boolean).map(c=>effective(c,country));
  const mothers=members.filter(c=>c.sex==='female'&&c.ageYears>=19&&c.ageYears<=40&&partner[c.citizenId]&&!rInactive.has(c.citizenId));
  if(!mothers.length)continue;
  const mother=mothers[0],r=rngFor(state.worldId+'|BIRTH|'+turn+'|'+h.householdId);
  if(r()<.0013){
   dataScope=data;
   const fatherOrPartner=partner[mother.citizenId];
   const newborn=makeNewborn(country,mother,fatherOrPartner,h,r,births.length+1);
   births.push(newborn);
   const ho=(state.householdOverlays[country][h.householdId]??={foodDaysOffset:0,debtOffset:0,stressOffset:0,incomeCapacityOffset:0,newMemberIds:[],memories:[]});
   ho.newMemberIds=ho.newMemberIds||[]; if(!ho.newMemberIds.includes(newborn.citizenId))ho.newMemberIds.push(newborn.citizenId);
   const relationshipBase={countryId:country,turnCreated:turn,trust:90,affection:92,fear:5,obligation:80,respect:35,envy:0,grievance:0,contactFrequency:98};
   state.roster.dynamicRelationships=state.roster.dynamicRelationships||[];
   state.roster.dynamicRelationships.push({...relationshipBase,from:mother.citizenId,to:newborn.citizenId,type:'parent'},{...relationshipBase,from:newborn.citizenId,to:mother.citizenId,type:'child'});
   if(fatherOrPartner)state.roster.dynamicRelationships.push({...relationshipBase,from:fatherOrPartner,to:newborn.citizenId,type:'parent'},{...relationshipBase,from:newborn.citizenId,to:fatherOrPartner,type:'child'});
  }
 }
 for(const base of Object.values(data.people)){
  if(rInactive.has(base.citizenId))continue;
  const c=effective(base,country);
  const r=rngFor(state.worldId+'|DEATH|'+turn+'|'+c.citizenId);
  let p=c.ageYears<45?.00002:c.ageYears<65?.00008:c.ageYears<75?.00025:.00070;
  if(c.materialState.health<40)p+=.00035;
  const hazard=livelihoodModel.occupations[c.occupationId]?.hazard||0;p+=hazard*.000008;
  if(r()<p){
   const work=r()<hazard*.055;
   deaths.push({citizenId:c.citizenId,countryId:country,settlementId:c.settlementId,householdId:c.householdId,turn,cause:work?'work_incident':'health_or_age'});
  }
 }
 return{births,deaths};
}
function advanceCalendar(){
 state.turn=turn;
 state.calendar=advanceWorldCalendar(state.calendar,7,turn);
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

function contactCheck(){
 const d={ARCUS_MIREA:['ARCUS','MIREA'],MIREA_VALD:['MIREA','VALD'],ARCUS_VALD:['ARCUS','VALD']};
 const truth=read('sidehustle-autopublish/note/worldsim/world/observer_truth_v1.json');
 for(const [key,[a,b]] of Object.entries(d)){
  const min=truth.map.minimumStraightLineKm[key],reach=state.countries[a].verifiedExplorationRadiusKm+state.countries[b].verifiedExplorationRadiusKm;
  if(reach>=min&&!state.contact.knownPairs.some(x=>x.includes(a)&&x.includes(b))){
   state.contact.knownPairs.push([a,b]);state.contact.firstContactOccurred=true;state.eventLog.push({turn,type:'first_contact_condition_met',countries:[a,b],reach,min});
  }
 }
}

const voteOut={},citizenDeltaLog=[],demographyOut={},turnEvents=[];
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
 state.countries[country].dynamic.birthsThisTurn=dem.births.length;state.countries[country].dynamic.deathsThisTurn=dem.deaths.length;
 if(dem.births.length||dem.deaths.length)turnEvents.push({turn,country,type:'demography',births:dem.births.length,deaths:dem.deaths.length});
 rotateInstitutions(country,data,turnEvents);
}
for(const [rid,d] of Object.entries(catalog.resourceWeeklyBaseline||{}))if(state.worldDynamic.resources[rid])state.worldDynamic.resources[rid].stockIndex=round(clamp(state.worldDynamic.resources[rid].stockIndex+d),2);
state.worldDynamic.weatherHistory.push({turn,...input.weather});
advanceCalendar();contactCheck();
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
