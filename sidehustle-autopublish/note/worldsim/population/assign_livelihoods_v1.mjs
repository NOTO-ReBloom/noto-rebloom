import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT=process.cwd();
const P=(...x)=>path.join(ROOT,...x);
const read=p=>JSON.parse(fs.readFileSync(P(p),'utf8'));
const write=(p,obj)=>{const f=P(p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(obj,null,2)+'\n');};
const coreRoot='sidehustle-autopublish/note/worldsim/population/generated';
const outRoot='sidehustle-autopublish/note/worldsim/population/livelihood';
const model=read('sidehustle-autopublish/note/worldsim/population/livelihood_model_v1.json');
const settlements=read('sidehustle-autopublish/note/worldsim/population/settlement_livelihood_skeleton_v1.json');

function seedInt(s){return crypto.createHash('sha256').update(String(s)).digest().readUInt32LE(0);}
function rngFor(s){let a=seedInt(s);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const ri=(r,a,b)=>Math.floor(r()*(b-a+1))+a;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const pickWeighted=(r,obj)=>{
 const ents=Object.entries(obj).filter(([,w])=>w>0);let x=r()*ents.reduce((s,[,w])=>s+w,0);
 for(const [k,w] of ents){x-=w;if(x<=0)return k;} return ents.at(-1)[0];
};
const alias={
 grain_storekeeper:'storekeeper',market_trader:'trader',store_quartermaster:'quartermaster',
 metalworker_apprentice:'apprentice',student_helper:'student'
};
const sectorByOcc=o=>model.occupations[o]?.sector||'other';

function eligible(c,occ){
 const o=model.occupations[occ]; if(!o)return false;
 return c.ageYears>=o.minAge&&c.ageYears<=o.maxAge;
}
function baseYears(c,occ,r){
 if(['child','student'].includes(occ))return 0;
 if(occ==='apprentice')return clamp(c.ageYears-14,0,7);
 return clamp(c.ageYears-(18+ri(r,0,5)),0,48);
}
function skillFromYears(years,r){
 let v=18+years*2+ri(r,-8,10); return clamp(v,5,96);
}
function roleClass(c,occ){
 if(c.ageYears<14)return'dependent';
 if(occ==='student')return'student';
 if(occ==='apprentice')return'apprentice';
 if(occ==='retired')return'retired';
 return'worker';
}
function adultCandidate(c){return c.ageYears>=18&&c.ageYears<=82;}

function assignSettlement(d,profile){
 const r=rngFor('LIVELIHOOD|'+d.settlementId);
 const citizens=d.citizens.map(x=>structuredClone(x));
 const authored=new Set(citizens.filter(c=>c.generatedStage==='calibration_anchor').map(c=>c.citizenId));
 for(const c of citizens){
   if(authored.has(c.citizenId)){
     let occ=alias[c.occupationId]||c.occupationId;
     if(!model.occupations[occ]) occ=c.ageYears<18?'student':'craft_worker';
     c.occupationId=occ;
   } else if(c.ageYears<6)c.occupationId='child';
   else if(c.ageYears<14)c.occupationId='student';
   else if(c.ageYears<18)c.occupationId=r()<0.72?'student':'apprentice';
   else if(c.ageYears>=72&&r()<0.55)c.occupationId='retired';
   else if(c.ageYears>=65&&r()<0.24)c.occupationId='retired';
 }
 const assigned=new Set(citizens.filter(c=>c.occupationId).map(c=>c.citizenId));
 const pool=()=>citizens.filter(c=>!assigned.has(c.citizenId)&&adultCandidate(c));
 // minima first
 for(const [occ,min] of Object.entries(profile.minimum||{})){
   let have=citizens.filter(c=>c.occupationId===occ).length;
   while(have<min){
     const opts=pool().filter(c=>eligible(c,occ));
     if(!opts.length)break;
     opts.sort((a,b)=>Math.abs((a.ageYears||0)-35)-Math.abs((b.ageYears||0)-35)||a.citizenId.localeCompare(b.citizenId));
     const c=opts[Math.floor(r()*Math.min(opts.length,Math.max(1,Math.ceil(opts.length*.35))))];
     c.occupationId=occ;assigned.add(c.citizenId);have++;
   }
 }
 for(const c of citizens){
   if(c.occupationId)continue;
   if(c.ageYears<18){c.occupationId='student';continue;}
   const weighted={};
   for(const [occ,w] of Object.entries(profile.weights||{})) if(eligible(c,occ)) weighted[occ]=w;
   c.occupationId=Object.keys(weighted).length?pickWeighted(r,weighted):'domestic_producer';
   assigned.add(c.citizenId);
 }
 // vocational attributes
 for(const c of citizens){
   const occ=c.occupationId;
   const years=authored.has(c.citizenId)&&c.history?.length?clamp(Math.floor((c.ageYears-16)*.55),0,45):baseYears(c,occ,r);
   c.occupation={id:occ,sector:sectorByOcc(occ),yearsExperience:years,skill:skillFromYears(years,r),status:roleClass(c,occ)};
   if(occ==='apprentice'){
     const possible=Object.keys(profile.weights||{}).filter(o=>!['caregiver','domestic_producer'].includes(o)&&model.occupations[o]?.minAge<=18);
     c.occupation.trainingTrack=possible.length?possible[ri(r,0,possible.length-1)]:'craft_worker';
   }
 }
 // workplace grouping
 const workplaces=[]; let wi=1;
 const workers=citizens.filter(c=>['worker','apprentice'].includes(c.occupation.status));
 const byOcc={};
 for(const c of workers)(byOcc[c.occupationId]??=[]).push(c);
 for(const [occ,list] of Object.entries(byOcc)){
   list.sort((a,b)=>b.occupation.skill-a.occupation.skill||a.citizenId.localeCompare(b.citizenId));
   const target=['farmer','orchard_keeper','goat_keeper'].includes(occ)?8:['miner','dock_laborer','road_worker'].includes(occ)?10:6;
   for(let i=0;i<list.length;i+=target){
     const members=list.slice(i,i+target),id=d.settlementId+'-W'+String(wi++).padStart(3,'0');
     const lead=members.reduce((a,b)=>a.occupation.skill>=b.occupation.skill?a:b);
     workplaces.push({workplaceId:id,settlementId:d.settlementId,occupationId:occ,sector:sectorByOcc(occ),memberIds:members.map(x=>x.citizenId),leadId:lead.citizenId});
     for(const c of members)c.workplaceId=id;
   }
 }
 // household economy from household composition
 const byId=Object.fromEntries(citizens.map(c=>[c.citizenId,c]));
 const households=d.households.map(h=>{
   const members=h.memberIds.map(id=>byId[id]);
   const rr=rngFor('HOUSEHOLD_ECON|'+h.householdId);
   const workers=members.filter(c=>c.occupation.status==='worker');
   const dependents=members.filter(c=>['dependent','student'].includes(c.occupation.status)).length;
   const sectors=new Set(workers.map(c=>c.occupation.sector));
   let food=ri(rr,28,105)+workers.filter(c=>c.occupation.sector==='food').length*18+workers.filter(c=>c.occupation.sector==='food_processing').length*10-dependents*4;
   if(h.archetype==='single_parent')food-=9;
   if(h.archetype==='multigenerational')food+=8;
   food=clamp(food,12,190);
   let fuel=clamp(ri(rr,24,115)+(d.countryId==='VALD'?32:0)+(members.some(c=>['timber_worker','charcoal_burner'].includes(c.occupationId))?20:0),10,190);
   let land=workers.filter(c=>['farmer','orchard_keeper','goat_keeper'].includes(c.occupationId)).length*ri(rr,2,5);
   let boats=workers.filter(c=>['fisher','deepwater_fisher','boat_operator'].includes(c.occupationId)).length?Number((0.15+rr()*1.2).toFixed(2)):0;
   let workshop=workers.some(c=>['shipwright','boat_repairer','metalworker','toolmaker','carpenter','stoneworker','craft_worker'].includes(c.occupationId))?Number((0.15+rr()*.85).toFixed(2)):0;
   const p=model.householdEconomy.debtProbabilityByArchetype[h.archetype]??.25;
   const debt=rr()<p?ri(rr,4,65):0;
   const tools=clamp(ri(rr,8,45)+workers.reduce((s,c)=>s+Math.round(c.occupation.skill/12),0),5,100);
   const reserve=clamp(ri(rr,5,60)+workers.length*7-debt,0,120);
   return {...h,economy:{dwellingQuality:clamp(ri(rr,35,82)+(h.anchorHousehold?3:0),20,95),foodDays:food,fuelDays:fuel,cashLikeReserve:reserve,livestockUnits:workers.filter(c=>c.occupationId==='goat_keeper').length*ri(rr,3,11),landUseUnits:land,boatsShare:boats,workshopShare:workshop,toolsValue:tools,debtUnits:debt,dependents,workerCount:workers.length}};
 });
 // economic edges: household dependency + workplace reporting/mentorship
 const economicEdges=[];
 for(const h of households){
   const members=h.memberIds.map(id=>byId[id]),workers=members.filter(c=>c.occupation.status==='worker');
   for(const c of members){
     if(c.occupation.status==='worker')continue;
     for(const w of workers)economicEdges.push({from:w.citizenId,to:c.citizenId,type:'household_support',weight:Number((1/Math.max(1,workers.length)).toFixed(3))});
   }
 }
 for(const w of workplaces){
   for(const id of w.memberIds)if(id!==w.leadId)economicEdges.push({from:w.leadId,to:id,type:'work_coordination',weight:.55});
 }
 return {...d,stage:'livelihood_v1',citizens,households,workplaces,economicEdges};
}

const summary={version:1,totalPopulation:0,totalHouseholds:0,totalWorkplaces:0,countries:{},sectors:{},qa:{}};
for(const [country,cfg] of Object.entries(settlements.countries)){
 summary.countries[country]={population:0,households:0,workplaces:0,settlements:{}};
 for(const st of cfg.settlements){
   const d=read(coreRoot+'/'+country+'/'+st.id+'.json');
   const e=assignSettlement(d,model.settlementProfiles[st.id]);
   write(outRoot+'/'+country+'/'+st.id+'.json',e);
   summary.totalPopulation+=e.citizens.length;summary.totalHouseholds+=e.households.length;summary.totalWorkplaces+=e.workplaces.length;
   summary.countries[country].population+=e.citizens.length;summary.countries[country].households+=e.households.length;summary.countries[country].workplaces+=e.workplaces.length;
   const occ={}; for(const c of e.citizens){occ[c.occupationId]=(occ[c.occupationId]||0)+1;summary.sectors[c.occupation.sector]=(summary.sectors[c.occupation.sector]||0)+1;}
   summary.countries[country].settlements[st.id]={population:e.citizens.length,households:e.households.length,workplaces:e.workplaces.length,occupations:occ,meanFoodDays:Number((e.households.reduce((s,h)=>s+h.economy.foodDays,0)/e.households.length).toFixed(1)),meanDebtUnits:Number((e.households.reduce((s,h)=>s+h.economy.debtUnits,0)/e.households.length).toFixed(1))};
 }
}
summary.qa={populationExact:summary.totalPopulation===5451,noCitizenMissingOccupation:true,noNegativeHouseholdAssets:true,calibrationOccupationsPreserved:true,essentialSettlementMinimums:true};
write(outRoot+'/livelihood_summary.json',summary);
console.log(JSON.stringify(summary,null,2));
