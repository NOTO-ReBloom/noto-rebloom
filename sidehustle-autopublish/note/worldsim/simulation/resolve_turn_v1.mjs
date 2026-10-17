import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT=process.cwd(),P=(...x)=>path.join(ROOT,...x);
const read=p=>JSON.parse(fs.readFileSync(P(p),'utf8'));
const write=(p,o)=>{const f=P(p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(o,null,2)+'\n');};
const turn=Number(process.env.WORLDSIM_TURN||1),prev=turn-1,pad=n=>String(n).padStart(4,'0');
const prevState=read('sidehustle-autopublish/note/worldsim/state/turn_'+pad(prev)+'/world_state.json');
const input=read('sidehustle-autopublish/note/worldsim/turns/turn_'+pad(turn)+'/turn_input.json');
const catalog=read('sidehustle-autopublish/note/worldsim/simulation/policy_catalog_v1.json');
const institutions=read('sidehustle-autopublish/note/worldsim/institutions/institution_state_turn0.json');
const livelihoodModel=read('sidehustle-autopublish/note/worldsim/population/livelihood_model_v1.json');
const state=structuredClone(prevState);

function seedInt(s){return crypto.createHash('sha256').update(String(s)).digest().readUInt32LE(0);}
function rngFor(s){let a=seedInt(s);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
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
 const rel={};for(const e of social.edges)rel[e.from+'|'+e.to]=e;
 return{people,households,familyEdges,beliefs,social,rel};
}
function effective(c,country){
 const o=state.citizenOverlays?.[country]?.[c.citizenId]||{};
 const x=structuredClone(c);
 x.materialState.stress=clamp(x.materialState.stress+(o.stressOffset||0));
 x.materialState.health=clamp(x.materialState.health+(o.healthOffset||0));
 return x;
}
function rumorSignal(record,topic){
 const xs=(record?.rumors||[]).filter(x=>x.topic===topic);
 if(!xs.length)return 0;
 return xs.reduce((s,x)=>s+(x.stance==='believed'?1:x.stance==='uncertain'?.35:-.25)*(x.confidence/100),0)/xs.length;
}
function voteUtility(c,policy,proposal,data){
 let u=0;
 for(const [k,w] of Object.entries(policy.valueImpact||{}))u+=w*((c.values[k]??50)-50)/50*18;
 if(policy.sectorBenefits?.[c.occupation.sector])u+=10*policy.sectorBenefits[c.occupation.sector];
 if(policy.sectorCosts?.[c.occupation.sector])u-=10*policy.sectorCosts[c.occupation.sector];
 if((policy.affectedSettlements||[]).includes(c.settlementId))u+=3.5;
 u+=rumorSignal(data.beliefs.records[c.citizenId],policy.topic)*6;
 const relation=data.rel[c.citizenId+'|'+proposal.sponsorId];
 if(relation)u+=(relation.trust-50)*.055+(relation.respect-50)*.035;
 if((policy.valueImpact?.security||0)>0&&c.materialState.stress>65)u+=2.5;
 const r=rngFor(state.worldId+'|VOTE|'+turn+'|'+policy.id+'|'+c.citizenId);
 u+=(r()-.5)*7;
 return round(u,3);
}
function conductVote(country,proposal,data){
 const policy=policyById[proposal.policyId],body=institutions.countries[country].nationalBody.members;
 const inactive=new Set(state.roster.inactiveCitizenIds||[]);
 const votes=[];
 for(const m of body){
  if(inactive.has(m.citizenId))continue;
  const raw=data.people[m.citizenId];if(!raw)continue;
  const c=effective(raw,country),utility=voteUtility(c,policy,proposal,data);
  votes.push({citizenId:c.citizenId,settlementId:m.settlementId,utility,vote:utility>2.25?'yes':utility<-2.25?'no':'abstain'});
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
function applyPolicy(country,result,data,citizenDeltaLog){
 if(!result.passed)return;
 const p=policyById[result.policyId],eff=p.effects||{},cs=state.countries[country];
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
 const productivity=catalog.foodProductivityPersonDaysPerWorkerWeek,season=catalog.seasonalFoodModifier[country]||1;
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
function simulateDemography(country,data){
 const rInactive=new Set(state.roster.inactiveCitizenIds||[]),partner={};
 for(const e of data.familyEdges)if(e.type==='partner')partner[e.from]=e.to;
 const births=[],deaths=[];let bc=1;
 const households=Object.values(data.households);
 for(const h of households){
  const members=h.memberIds.map(id=>data.people[id]).filter(Boolean);
  const mothers=members.filter(c=>c.sex==='female'&&c.ageYears>=19&&c.ageYears<=40&&partner[c.citizenId]&&!rInactive.has(c.citizenId));
  if(!mothers.length)continue;
  const mother=mothers[0],r=rngFor(state.worldId+'|BIRTH|'+turn+'|'+h.householdId);
  if(r()<.0013){
   const fatherOrPartner=partner[mother.citizenId],prefix=country==='ARCUS'?'ARC':country==='MIREA'?'MIR':'VAL';
   const id=prefix+'-N'+pad(turn)+'-'+String(bc++).padStart(3,'0');
   births.push({citizenId:id,countryId:country,householdId:h.householdId,settlementId:mother.settlementId,givenName:'(unnamed newborn)',familyName:mother.familyName,sex:r()<.5?'female':'male',ageDays:0,bornTurn:turn,parentIds:[mother.citizenId,fatherOrPartner].filter(Boolean),developmentalSeed:crypto.createHash('sha256').update(id+'|development').digest('hex').slice(0,16)});
  }
 }
 for(const c of Object.values(data.people)){
  if(rInactive.has(c.citizenId))continue;
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
 state.turn=turn;state.calendar.turn=turn;state.calendar.dayOfYear+=7;
 state.calendar.daysUntilMeteorologicalWinter=Math.max(0,(state.calendar.daysUntilMeteorologicalWinter??93)-7);
 if(state.calendar.dayOfYear>365){state.calendar.year+=1;state.calendar.dayOfYear-=365;}
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
 for(const d of dem.deaths)if(!state.roster.inactiveCitizenIds.includes(d.citizenId))state.roster.inactiveCitizenIds.push(d.citizenId);
 state.countries[country].population+=dem.births.length-dem.deaths.length;
 state.countries[country].dynamic.birthsThisTurn=dem.births.length;state.countries[country].dynamic.deathsThisTurn=dem.deaths.length;
 if(dem.births.length||dem.deaths.length)turnEvents.push({turn,country,type:'demography',births:dem.births.length,deaths:dem.deaths.length});
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
write('sidehustle-autopublish/note/worldsim/turns/turn_'+pad(turn)+'/turn_summary.json',{version:1,turn,populations:Object.fromEntries(Object.entries(state.countries).map(([k,v])=>[k,v.population])),foodReserveDays:Object.fromEntries(Object.entries(state.countries).map(([k,v])=>[k,v.meanFoodReserveDays])),explorationKm:Object.fromEntries(Object.entries(state.countries).map(([k,v])=>[k,v.verifiedExplorationRadiusKm])),firstContact:state.contact.firstContactOccurred,passedPolicies:Object.fromEntries(Object.entries(voteOut).map(([k,v])=>[k,v.filter(x=>x.passed).map(x=>x.policyId]))});
console.log(JSON.stringify(read('sidehustle-autopublish/note/worldsim/turns/turn_'+pad(turn)+'/turn_summary.json'),null,2));
