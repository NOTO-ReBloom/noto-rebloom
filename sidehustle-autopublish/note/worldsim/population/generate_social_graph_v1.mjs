import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT=process.cwd(), P=(...x)=>path.join(ROOT,...x);
const read=p=>JSON.parse(fs.readFileSync(P(p),'utf8'));
const write=(p,o)=>{const f=P(p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(o,null,2)+'\n');};
const inRoot='sidehustle-autopublish/note/worldsim/population/personality';
const outRoot='sidehustle-autopublish/note/worldsim/population/social';
const model=read('sidehustle-autopublish/note/worldsim/population/social_graph_model_v1.json');

function seedInt(s){return crypto.createHash('sha256').update(String(s)).digest().readUInt32LE(0);}
function rngFor(s){let a=seedInt(s);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const ri=(r,a,b)=>Math.floor(r()*(b-a+1))+a;
const h16=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,16);

function normalizeType(t){
 if(['parent','child','partner','sibling','grandparent','grandchild'].includes(t))return t;
 if(t==='relative'||t==='aunt_or_uncle'||t==='niece_or_nephew')return'relative';
 return t;
}
function metrics(src,type,r){
 const pri=model.typePriors[type]||model.typePriors.neighbor;
 const a=src.psychology.actionTendencies,b=src.psychology.bigFive;
 const base=k=>pri[k]??(k==='fear'?8:k==='envy'?15:k==='grievance'?12:45);
 return {
  trust:Math.round(clamp(base('trust')+(a.trustBaseline-50)*.30+ri(r,-10,10))),
  affection:Math.round(clamp(base('affection')+(b.agreeableness-50)*.20+ri(r,-11,11))),
  fear:Math.round(clamp((type==='rival'?24:base('fear'))+(b.emotionalVolatility-50)*.12+ri(r,-8,8))),
  obligation:Math.round(clamp(base('obligation')+(a.reciprocity-50)*.20+ri(r,-8,8))),
  respect:Math.round(clamp(base('respect')+(src.values.achievement-50)*.10+ri(r,-10,10))),
  envy:Math.round(clamp((type==='rival'?40:base('envy'))+(a.statusDrive-50)*.22+ri(r,-10,10))),
  grievance:Math.round(clamp((type==='rival'?38:base('grievance'))+(a.resentmentRetention-50)*.24+ri(r,-9,9))),
  contactFrequency:Math.round(clamp(base('contactFrequency')+ri(r,-8,8)))
 };
}
function addEdge(edges,seen,people,from,to,type,context=''){
 if(!from||!to||from===to)return;
 const key=from+'|'+to+'|'+type;if(seen.has(key))return;seen.add(key);
 const src=people[from];if(!src)return;
 const r=rngFor('REL|'+key);
 edges.push({relationshipId:h16(key),from,to,type,...metrics(src,type,r),sharedHistory:context||type});
}
function relationExists(seen,a,b){for(const t of model.relationshipTypes)if(seen.has(a+'|'+b+'|'+t))return true;return false;}

for(const country of ['ARCUS','MIREA','VALD']){
 const dir=P(inRoot,country); if(!fs.existsSync(dir))continue;
 const files=fs.readdirSync(dir).filter(x=>x.endsWith('.json'));
 const docs=files.map(f=>read(inRoot+'/'+country+'/'+f));
 const people={},bySettlement={},workplaces=[],family=[];
 for(const d of docs){
  for(const c of d.citizens){people[c.citizenId]=c;(bySettlement[c.settlementId]??=[]).push(c);}
  workplaces.push(...d.workplaces);
  family.push(...d.familyEdges);
 }
 const edges=[],seen=new Set();
 // family
 for(const e of family){
  const type=normalizeType(e.type);
  addEdge(edges,seen,people,e.from,e.to,type,'shared household or kinship history');
 }
 // workplace ties: lead + nearby peers
 for(const w of workplaces){
  const ids=w.memberIds.filter(id=>people[id]);
  for(let i=0;i<ids.length;i++){
   const id=ids[i];
   if(id!==w.leadId){addEdge(edges,seen,people,id,w.leadId,'coworker','same workplace');addEdge(edges,seen,people,w.leadId,id,'coworker','same workplace');}
   if(ids.length>1){const peer=ids[(i+1)%ids.length];if(peer!==id){addEdge(edges,seen,people,id,peer,'coworker','repeated work contact');addEdge(edges,seen,people,peer,id,'coworker','repeated work contact');}}
  }
 }
 // neighbor ties between household representatives in deterministic local ordering
 for(const [sid,list] of Object.entries(bySettlement)){
  const hMap={};for(const c of list)(hMap[c.householdId]??=[]).push(c);
  const hs=Object.keys(hMap).sort();
  for(let i=0;i<hs.length;i++){
   const a=hMap[hs[i]].filter(x=>x.ageYears>=16).sort((x,y)=>y.ageYears-x.ageYears)[0]||hMap[hs[i]][0];
   const b=hMap[hs[(i+1)%hs.length]].filter(x=>x.ageYears>=16).sort((x,y)=>y.ageYears-x.ageYears)[0]||hMap[hs[(i+1)%hs.length]][0];
   if(a&&b){addEdge(edges,seen,people,a.citizenId,b.citizenId,'neighbor','nearby households');addEdge(edges,seen,people,b.citizenId,a.citizenId,'neighbor','nearby households');}
  }
 }
 // friendships: repeated-local-contact approximation with value similarity
 for(const [sid,list] of Object.entries(bySettlement)){
  const eligible=list.filter(c=>c.ageYears>=10);
  for(const c of eligible){
   const r=rngFor('FRIEND|'+c.citizenId);
   const target=c.ageYears<18?1+Math.floor(c.psychology.bigFive.extraversion/45):1+Math.floor(c.psychology.bigFive.extraversion/32);
   const sample=[];
   for(let k=0;k<Math.min(60,eligible.length);k++)sample.push(eligible[Math.floor(r()*eligible.length)]);
   const scored=sample.filter(x=>x.citizenId!==c.citizenId&&x.householdId!==c.householdId&&Math.abs(x.ageYears-c.ageYears)<=15&&!relationExists(seen,c.citizenId,x.citizenId))
    .map(x=>{
      const sim=['autonomy','security','community','achievement'].reduce((s,k)=>s+Math.abs(c.values[k]-x.values[k]),0);
      return{x,score:sim+Math.abs(c.ageYears-x.ageYears)*1.4-r()*18};
    }).sort((a,b)=>a.score-b.score);
   for(const x of scored.slice(0,target)){
    addEdge(edges,seen,people,c.citizenId,x.x.citizenId,'friend','voluntary repeated contact');
    addEdge(edges,seen,people,x.x.citizenId,c.citizenId,'friend','voluntary repeated contact');
   }
  }
 }
 // mentorship for apprentices/students in practical tracks
 for(const c of Object.values(people)){
  if(c.occupation.status!=='apprentice')continue;
  const targetOcc=c.occupation.trainingTrack;
  const candidates=(bySettlement[c.settlementId]||[]).filter(x=>x.citizenId!==c.citizenId&&x.occupationId===targetOcc&&x.occupation.skill>=55).sort((a,b)=>b.occupation.skill-a.occupation.skill);
  if(candidates[0]){
   addEdge(edges,seen,people,c.citizenId,candidates[0].citizenId,'mentor','skill transfer');
   addEdge(edges,seen,people,candidates[0].citizenId,c.citizenId,'apprentice','skill transfer');
  }
 }
 // rivalry only among high status-drive peers in same occupation/settlement
 for(const [sid,list] of Object.entries(bySettlement)){
  const high=list.filter(c=>c.ageYears>=18&&c.psychology.actionTendencies.statusDrive>=68);
  for(const c of high){
   const peers=high.filter(x=>x.citizenId!==c.citizenId&&x.occupationId===c.occupationId&&Math.abs(x.occupation.skill-c.occupation.skill)<=20);
   if(!peers.length)continue;
   const r=rngFor('RIVAL|'+c.citizenId);const x=peers[Math.floor(r()*peers.length)];
   if(!relationExists(seen,c.citizenId,x.citizenId))addEdge(edges,seen,people,c.citizenId,x.citizenId,'rival','status competition in shared work');
  }
 }
 // cross-settlement bridges through mobile occupations
 const mobile=new Set(['trader','fish_trader','hauler','boat_operator','pack_transporter','map_worker','road_worker']);
 const sids=Object.keys(bySettlement);
 for(const c of Object.values(people)){
  if(!mobile.has(c.occupationId)||sids.length<2)continue;
  const r=rngFor('CROSS|'+c.citizenId); if(r()>.45)continue;
  const otherSids=sids.filter(x=>x!==c.settlementId),os=otherSids[Math.floor(r()*otherSids.length)];
  const candidates=(bySettlement[os]||[]).filter(x=>x.ageYears>=18&&(mobile.has(x.occupationId)||x.occupation.sector==='trade'||x.occupation.sector==='storage'));
  if(!candidates.length)continue;
  const x=candidates[Math.floor(r()*candidates.length)];
  addEdge(edges,seen,people,c.citizenId,x.citizenId,'trade_contact','cross-settlement work or market contact');
  addEdge(edges,seen,people,x.citizenId,c.citizenId,'trade_contact','cross-settlement work or market contact');
 }
 // repair isolated adults/minors with local acquaintances
 const degree={};for(const e of edges)(degree[e.from]??=new Set()).add(e.to);
 for(const c of Object.values(people)){
  const min=c.ageYears<18?1:2;
  while((degree[c.citizenId]?.size||0)<min){
   const local=(bySettlement[c.settlementId]||[]).filter(x=>x.citizenId!==c.citizenId);
   const r=rngFor('REPAIR|'+c.citizenId+'|'+(degree[c.citizenId]?.size||0));
   const x=local[Math.floor(r()*local.length)];if(!x)break;
   addEdge(edges,seen,people,c.citizenId,x.citizenId,'neighbor','ordinary local familiarity');
   addEdge(edges,seen,people,x.citizenId,c.citizenId,'neighbor','ordinary local familiarity');
   (degree[c.citizenId]??=new Set()).add(x.citizenId);(degree[x.citizenId]??=new Set()).add(c.citizenId);
  }
 }
 // network summary
 const uniqueDegree={};for(const e of edges)(uniqueDegree[e.from]??=new Set()).add(e.to);
 const adults=Object.values(people).filter(c=>c.ageYears>=18),minors=Object.values(people).filter(c=>c.ageYears<18);
 const avg=arr=>arr.length?arr.reduce((s,c)=>s+(uniqueDegree[c.citizenId]?.size||0),0)/arr.length:0;
 const cross=edges.filter(e=>people[e.from]?.settlementId!==people[e.to]?.settlementId);
 const graph={version:1,countryId:country,stage:'social_v1',citizenCount:Object.keys(people).length,edges,summary:{edgeCount:edges.length,adultMeanDegree:Number(avg(adults).toFixed(2)),minorMeanDegree:Number(avg(minors).toFixed(2)),isolatedAdults:adults.filter(c=>(uniqueDegree[c.citizenId]?.size||0)<2).length,crossSettlementEdges:cross.length,crossCountryEdges:edges.filter(e=>people[e.from]?.countryId!==people[e.to]?.countryId).length,typeCounts:Object.fromEntries([...new Set(edges.map(e=>e.type))].map(t=>[t,edges.filter(e=>e.type===t).length]))}};
 write(outRoot+'/'+country+'.json',graph);
 console.log(country,graph.summary);
}
