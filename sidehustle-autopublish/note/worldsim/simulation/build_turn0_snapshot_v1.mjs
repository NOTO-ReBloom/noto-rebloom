import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {normalizeCalendar,absoluteDay} from './time_model_v1.mjs';
const ROOT=process.cwd(),P=(...x)=>path.join(ROOT,...x);
const read=p=>JSON.parse(fs.readFileSync(P(p),'utf8'));
const write=(p,o)=>{const f=P(p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(o,null,2)+'\n');};
const truth=read('sidehustle-autopublish/note/worldsim/world/observer_truth_v1.json');
const institutions=read('sidehustle-autopublish/note/worldsim/institutions/institution_state_turn0.json');
const settlements=read('sidehustle-autopublish/note/worldsim/population/settlement_livelihood_skeleton_v1.json');
const personRoot='sidehustle-autopublish/note/worldsim/population/personality';
const beliefRoot='sidehustle-autopublish/note/worldsim/population/beliefs';
const socialRoot='sidehustle-autopublish/note/worldsim/population/social';
const countryCfgRoot='sidehustle-autopublish/note/worldsim/countries';
const sha=o=>crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex');
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const round=(n,d=2)=>Number(n.toFixed(d));
const seedU32=s=>crypto.createHash('sha256').update(String(s)).digest().readUInt32LE(0);
const seedUnit=s=>seedU32(s)/4294967296;

const state={version:1,worldId:truth.worldId,turn:0,calendar:truth.calendar,sourceTruthHash:sha(truth),countries:{},
 worldDynamic:{
  resources:Object.fromEntries(truth.resources.nodes.map(x=>[x.id,{type:x.type,stockIndex:x.stockIndex,renewable:x.renewable,x:x.x,y:x.y}])),
  climate:structuredClone(truth.climate.currentAnomalies),
  weatherHistory:[],
  deepHistoryEvidenceDiscovered:[]
 },
 contact:{knownPairs:[],firstContactOccurred:false},
 roster:{newCitizens:[],inactiveCitizenIds:[]},
 citizenOverlays:{ARCUS:{},MIREA:{},VALD:{}},
 householdOverlays:{ARCUS:{},MIREA:{},VALD:{}},
 relationshipOverlays:{ARCUS:{},MIREA:{},VALD:{}},
 institutionalHistory:[],
 demographyState:{pregnancies:{},seededPregnanciesAtTurn0:0,gestationDays:266},
 eventLog:[],publicationReady:false};
const manifest={version:1,turn:0,sourceHashes:{observerTruth:state.sourceTruthHash},countrySources:{}};

for(const country of ['ARCUS','MIREA','VALD']){
 const cfg=read(countryCfgRoot+'/'+country+'.json');
 const dir=P(personRoot,country);
 const docs=fs.readdirSync(dir).filter(x=>x.endsWith('.json')).map(f=>read(personRoot+'/'+country+'/'+f));
 const belief=read(beliefRoot+'/'+country+'.json'),social=read(socialRoot+'/'+country+'.json');
 const people=[],households=[],workplaces=[],familyEdges=[];
 for(const d of docs){people.push(...d.citizens);households.push(...d.households);workplaces.push(...d.workplaces);familyEdges.push(...(d.familyEdges||[]));}
 const byId=Object.fromEntries(people.map(c=>[c.citizenId,c]));
 const settlementStates={};
 const meta=settlements.countries[country].settlements;
 for(const sm of meta){
  const ps=people.filter(c=>c.settlementId===sm.id),hs=households.filter(h=>h.settlementId===sm.id);
  const personDays=hs.reduce((s,h)=>s+h.economy.foodDays*h.memberIds.length,0);
  const fuelDays=hs.reduce((s,h)=>s+h.economy.fuelDays*h.memberIds.length,0);
  const sectors={};for(const c of ps)sectors[c.occupation.sector]=(sectors[c.occupation.sector]||0)+1;
  settlementStates[sm.id]={
   settlementId:sm.id,name:sm.name,population:ps.length,households:hs.length,
   meanFoodReserveDays:round(personDays/Math.max(1,ps.length),1),
   meanFuelReserveDays:round(fuelDays/Math.max(1,ps.length),1),
   meanHealth:round(avg(ps.map(c=>c.materialState.health)),1),
   meanStress:round(avg(ps.map(c=>c.materialState.stress)),1),
   totalDebtUnits:round(hs.reduce((s,h)=>s+h.economy.debtUnits,0),1),
   totalCashLikeReserve:round(hs.reduce((s,h)=>s+h.economy.cashLikeReserve,0),1),
   sectorCounts:sectors,
   risks:sm.risks,
   infrastructure:sm.infrastructure
  };
 }
 const personDays=households.reduce((s,h)=>s+h.economy.foodDays*h.memberIds.length,0);
 const fuelPersonDays=households.reduce((s,h)=>s+h.economy.fuelDays*h.memberIds.length,0);
 const skills=people.filter(c=>c.occupation.status==='worker').map(c=>c.occupation.skill);
 const skilled=skills.filter(x=>x>=65).length;
 const countryState={
  countryId:country,nameJa:cfg.nameJa,population:people.length,households:households.length,workplaces:workplaces.length,
  verifiedExplorationRadiusKm:cfg.verifiedExplorationRadiusKm,knownOtherCountries:false,
  meanFoodReserveDays:round(personDays/people.length,1),meanFuelReserveDays:round(fuelPersonDays/people.length,1),
  meanHealth:round(avg(people.map(c=>c.materialState.health)),1),meanStress:round(avg(people.map(c=>c.materialState.stress)),1),
  totalHouseholdDebtUnits:round(households.reduce((s,h)=>s+h.economy.debtUnits,0),1),
  totalCashLikeReserve:round(households.reduce((s,h)=>s+h.economy.cashLikeReserve,0),1),
  skilledWorkerShare:round(skilled/Math.max(1,skills.length),4),
  settlementStates,
  institution:institutions.countries[country],
  dynamic:{explorationInvestment:0,publicWorks:[],activeOrders:[],migrationCountThisTurn:0,birthsThisTurn:0,deathsThisTurn:0},
  dataIntegrity:{citizens:people.length===cfg.population,beliefRecords:Object.keys(belief.records).length===people.length,socialCitizenCount:social.citizenCount===people.length}
 };
 state.countries[country]=countryState;

 const partner={};
 for(const e of familyEdges)if(e.type==='partner')partner[e.from]=e.to;
 const epochAbs=absoluteDay(state.calendar);
 for(const c of people){
  if(c.sex!=='female'||c.ageYears<19||c.ageYears>40||!partner[c.citizenId])continue;
  if(seedUnit('PREGNANCY_AT_T0|'+c.citizenId)>=0.055)continue;
  const gestationAgeDays=7+(seedU32('GESTATION_AGE|'+c.citizenId)%245);
  const conceptionAbsoluteDay=epochAbs-gestationAgeDays;
  const dueAbsoluteDay=conceptionAbsoluteDay+state.demographyState.gestationDays;
  const dueTurn=Math.max(1,Math.ceil((dueAbsoluteDay-epochAbs)/7));
  state.demographyState.pregnancies[c.citizenId]={
   pregnancyId:'PREG-T0-'+c.citizenId,
   countryId:country,
   motherId:c.citizenId,
   partnerId:partner[c.citizenId],
   householdId:c.householdId,
   settlementId:c.settlementId,
   conceivedTurn:null,
   conceptionAbsoluteDay,
   dueAbsoluteDay,
   dueTurn,
   seededAtTurn0:true
  };
  state.demographyState.seededPregnanciesAtTurn0++;
 }

 manifest.countrySources[country]={population:people.length,personalityHash:sha(docs.map(d=>d.citizens)),beliefHash:sha(belief.summary),socialSummaryHash:sha(social.summary),institutionHash:sha(institutions.countries[country])};
}
write('sidehustle-autopublish/note/worldsim/state/turn_0000/world_state.json',state);
write('sidehustle-autopublish/note/worldsim/state/turn_0000/snapshot_manifest.json',manifest);
console.log(JSON.stringify({turn:0,populations:Object.fromEntries(Object.entries(state.countries).map(([k,v])=>[k,v.population])),food:Object.fromEntries(Object.entries(state.countries).map(([k,v])=>[k,v.meanFoodReserveDays])),health:Object.fromEntries(Object.entries(state.countries).map(([k,v])=>[k,v.meanHealth]))},null,2));
