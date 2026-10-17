import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT=process.cwd(),P=(...x)=>path.join(ROOT,...x);
const read=p=>JSON.parse(fs.readFileSync(P(p),'utf8'));
const write=(p,o)=>{const f=P(p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(o,null,2)+'\n');};
const personRoot='sidehustle-autopublish/note/worldsim/population/personality';
const socialRoot='sidehustle-autopublish/note/worldsim/population/social';
const outRoot='sidehustle-autopublish/note/worldsim/population/beliefs';
const model=read('sidehustle-autopublish/note/worldsim/population/belief_model_v1.json');
const settlements=read('sidehustle-autopublish/note/worldsim/population/settlement_livelihood_skeleton_v1.json');

function seedInt(s){return crypto.createHash('sha256').update(String(s)).digest().readUInt32LE(0);}
function rngFor(s){let a=seedInt(s);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const ri=(r,a,b)=>Math.floor(r()*(b-a+1))+a;
const mobile=new Set(['trader','fish_trader','hauler','boat_operator','pack_transporter','map_worker','road_worker','signal_watch','pass_watch']);

const settlementMeta={};
for(const [country,cfg] of Object.entries(settlements.countries))for(const s of cfg.settlements)settlementMeta[s.id]={country,...s};

for(const country of ['ARCUS','MIREA','VALD']){
 const dir=P(personRoot,country);if(!fs.existsSync(dir))continue;
 const docs=fs.readdirSync(dir).filter(x=>x.endsWith('.json')).map(f=>read(personRoot+'/'+country+'/'+f));
 const people={},households={},workplaces={};
 for(const d of docs){
   for(const c of d.citizens)people[c.citizenId]=c;
   for(const h of d.households)households[h.householdId]=h;
   for(const w of d.workplaces)workplaces[w.workplaceId]=w;
 }
 const graph=read(socialRoot+'/'+country+'.json');
 const incoming={};for(const e of graph.edges)(incoming[e.to]??=[]).push(e);
 const outgoing={};for(const e of graph.edges)(outgoing[e.from]??=[]).push(e);

 const records={};
 for(const c of Object.values(people)){
   const r=rngFor('BELIEF|'+c.citizenId);
   const home=settlementMeta[c.settlementId],h=households[c.householdId];
   const knownFacts=[
     {factId:'home:'+c.settlementId,kind:'location',content:'lives in '+home.name,source:'personalObservation',confidence:100},
     {factId:'occupation:'+c.citizenId,kind:'work',content:'works or trains as '+c.occupationId,source:'personalObservation',confidence:100}
   ];
   if(h)knownFacts.push({factId:'household:'+h.householdId,kind:'household',content:'knows the members and daily condition of own household',source:'household',confidence:98});
   if(c.workplaceId&&workplaces[c.workplaceId])knownFacts.push({factId:'workplace:'+c.workplaceId,kind:'workplace',content:'knows regular coworkers and immediate work conditions',source:'workplace',confidence:92});
   const risks=home.risks||[];
   const beliefs=[];
   if(risks.length){
     const count=Math.min(risks.length,c.ageYears>=18?2:1);
     for(let i=0;i<count;i++){
       const risk=risks[(Math.floor(r()*risks.length)+i)%risks.length];
       beliefs.push({beliefId:'risk:'+c.settlementId+':'+i,claim:'local risk matters: '+risk,confidence:clamp(45+ri(r,-12,18)+(c.ageYears>=30?8:0)),basis:c.occupation.sector==='food'?'workplace':'personalObservation'});
     }
   }
   const localFair=Math.round(clamp(50+(c.values.fairness-50)*.16-(c.psychology.actionTendencies.resentmentRetention-50)*.12+ri(r,-18,18)));
   beliefs.push({beliefId:'local_rules_fair',claim:'local decision procedures are generally fair',confidence:clamp(35+c.psychology.epistemicTraits.deferenceToExpertise*.25+ri(r,-8,15)),stance:localFair>=50?'leans_true':'leans_false',evaluation:localFair});
   const econ=h?.economy;
   if(econ)beliefs.push({beliefId:'household_outlook',claim:'my household can absorb a moderate supply disruption',confidence:clamp(35+econ.foodDays*.28+econ.cashLikeReserve*.12-econ.debtUnits*.20+ri(r,-10,10)),stance:(econ.foodDays>55&&econ.debtUnits<40)?'leans_true':'leans_false'});

   const knownLocations=new Set([c.settlementId]);
   if(mobile.has(c.occupationId)){
     const cross=(outgoing[c.citizenId]||[]).filter(e=>people[e.to]&&people[e.to].settlementId!==c.settlementId);
     for(const e of cross.slice(0,3))knownLocations.add(people[e.to].settlementId);
   }

   const rumorSeeds=model.rumorSeeds[c.settlementId]||[];
   const rumorCount=c.ageYears<10?0:Math.min(3,Math.max(0,Math.floor((c.psychology.epistemicTraits.rumorSusceptibility+r()*60)/55)));
   const rumors=[];
   const socialSources=(incoming[c.citizenId]||[]).filter(e=>['friend','neighbor','coworker','trade_contact','relative','sibling'].includes(e.type));
   for(let i=0;i<rumorCount&&rumorSeeds.length;i++){
     const seed=rumorSeeds[(Math.floor(r()*rumorSeeds.length)+i)%rumorSeeds.length];
     const src=socialSources.length?socialSources[Math.floor(r()*socialSources.length)]:null;
     const sourceTrust=src?src.trust:42;
     const confidence=Math.round(clamp(20+c.psychology.epistemicTraits.rumorSusceptibility*.32+sourceTrust*.24-c.psychology.epistemicTraits.skepticism*.15+ri(r,-8,8)));
     rumors.push({rumorId:seed.id,claim:seed.claim,topic:seed.topic,confidence,stance:confidence>=62?'believed':confidence>=40?'uncertain':'doubted',sourceId:src?.from||null,sourceRelation:src?.type||'ambient_local_talk'});
   }
   const sources=['personalObservation','household'];
   if(c.workplaceId)sources.push('workplace');
   if((outgoing[c.citizenId]||[]).some(e=>e.type==='friend'))sources.push('friend');
   if((outgoing[c.citizenId]||[]).some(e=>e.type==='neighbor'))sources.push('neighbor');
   if(mobile.has(c.occupationId))sources.push('market');

   records[c.citizenId]={citizenId:c.citizenId,countryId:country,homeSettlementId:c.settlementId,knownLocations:[...knownLocations],knownFacts,beliefs,rumors,informationSources:[...new Set(sources)],epistemicTraits:c.psychology.epistemicTraits,lastUpdatedTurn:0};
 }
 const summary={citizenCount:Object.keys(records).length,rumorHolders:Object.values(records).filter(x=>x.rumors.length).length,meanRumors:Number((Object.values(records).reduce((s,x)=>s+x.rumors.length,0)/Object.keys(records).length).toFixed(2)),citizensKnowingMultipleSettlements:Object.values(records).filter(x=>x.knownLocations.length>1).length};
 write(outRoot+'/'+country+'.json',{version:1,countryId:country,stage:'beliefs_v1',records,summary});
 console.log(country,summary);
}
