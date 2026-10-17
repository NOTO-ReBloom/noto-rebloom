import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const P = (...x) => path.join(ROOT, ...x);
const read = p => JSON.parse(fs.readFileSync(P(p), 'utf8'));
const write = (p, obj) => { const f=P(p); fs.mkdirSync(path.dirname(f),{recursive:true}); fs.writeFileSync(f, JSON.stringify(obj,null,2)+'\n'); };

const demographic = read('sidehustle-autopublish/note/worldsim/population/demographic_targets_v1.json');
const anchorsCfg = read('sidehustle-autopublish/note/worldsim/population/anchor_households_v1.json');
const settlementCfg = read('sidehustle-autopublish/note/worldsim/population/settlement_livelihood_skeleton_v1.json');
const calibration = read('sidehustle-autopublish/note/worldsim/population/calibration_citizens_v1.json');

function seedInt(s){ return crypto.createHash('sha256').update(String(s)).digest().readUInt32LE(0); }
function rngFor(seed){ let a=seedInt(seed); return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const pick=(rng,a)=>a[Math.floor(rng()*a.length)];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const ri=(rng,a,b)=>Math.floor(rng()*(b-a+1))+a;

const NAME = {
 ARCUS:{
  givenA:['Er','Sel','Tov','Ma','Nar','Or','Li','Cas','Ven','Sor','Tal','Mer','Cor','Dar','Ira','Kel','Ron','Ari','Ves','Jor'],
  givenB:['en','a','in','el','ra','on','io','is','an','or','eth','as'],
  famA:['Val','Rin','Ter','Sol','Var','Dai','Cor','Mar','Bel','Ren','Fal','Ser','Nor','Cal','Eld','Vin'],
  famB:['e','n','en','is','ar','on','el','in']
 },
 MIREA:{
  givenA:['Na','Em','Su','Le','Ave','Ri','Tal','Me','Ila','Se','Ara','No','Vela','Eli','Mira','Ona','Tesa','Lio','Nemi','Sava'],
  givenB:['lia','on','ri','ma','n','sa','en','ri','an','na','el','a'],
  famA:['Are','Nim','Sor','Lav','Ela','Mor','Tes','Vel','Roa','Sena','Ive','Nora','Ami','Lera','Oren','Meli'],
  famB:['l','a','en','i','r','an','is','o']
 },
 VALD:{
  givenA:['Br','Kor','Dar','Siv','Tor','Ner','Var','Oss','Kel','Run','Mar','Dro','Fen','Kar','Vel','Sar','Orm','Hel','Tarn','Ves'],
  givenB:['en','a','ek','ra','v','is','ek','a','an','a','or','in'],
  famA:['Kel','Var','Osk','Dra','Sen','Vol','Ret','Mar','Brek','Tor','Harn','Vesk','Orn','Krav','Del','Rauk'],
  famB:['m','n','k','un','n','k','h','n','er','a','is','ov']
 }
};

function generatedName(country,rng,familyHint=null){
 const n=NAME[country];
 const given=pick(rng,n.givenA)+pick(rng,n.givenB);
 const family=familyHint || pick(rng,n.famA)+pick(rng,n.famB);
 return {givenName:given,familyName:family};
}
function ageBand(a){ if(a<=4)return'0-4'; if(a<=14)return'5-14'; if(a<=24)return'15-24'; if(a<=44)return'25-44'; if(a<=64)return'45-64'; return'65+'; }
function roleSex(rng){ return rng()<0.5?'female':'male'; }
function parentAge(rng){
 return rng()<0.50 ? ri(rng,25,44) : ri(rng,45,62);
}
function flexibleAdultAge(rng){
 const x=rng();
 if(x<0.23) return ri(rng,18,24);
 if(x<0.66) return ri(rng,25,44);
 if(x<0.92) return ri(rng,45,64);
 return ri(rng,65,78);
}
function childAge(rng,maxAge){
 maxAge=Math.max(0,Math.min(30,maxAge));
 if(maxAge<=4) return ri(rng,0,maxAge);
 if(maxAge<=14) return rng()<0.32 ? ri(rng,0,4) : ri(rng,5,maxAge);
 const x=rng();
 if(x<0.18) return ri(rng,0,4);
 if(x<0.52) return ri(rng,5,14);
 return ri(rng,15,maxAge);
}

const calibrationMap=new Map(calibration.citizens.map(c=>[c.citizenId,c]));
const anchorByHouse=new Map(anchorsCfg.households.map(h=>[h.householdId,h]));
const idCounter={ARCUS:7,MIREA:7,VALD:7};
const hCounter={ARCUS:100,MIREA:100,VALD:100};
const code={ARCUS:'ARC',MIREA:'MIR',VALD:'VAL'};
function nextCitizenId(country){ return code[country]+'-'+String(idCounter[country]++).padStart(4,'0'); }
function nextHouseId(country){ return code[country]+'-H'+String(hCounter[country]++).padStart(4,'0'); }

function addEdge(edges,a,b,typeAB,typeBA=typeAB){
 edges.push({from:a,to:b,type:typeAB});
 if(typeBA) edges.push({from:b,to:a,type:typeBA});
}
function uniquePairs(children,edges){
 for(let i=0;i<children.length;i++) for(let j=i+1;j<children.length;j++) addEdge(edges,children[i].citizenId,children[j].citizenId,'sibling','sibling');
}

function makePerson(country,settlement,householdId,rng,age,sex,role,familyHint=null,extra={}){
 const nm=generatedName(country,rng,familyHint);
 return {
  citizenId:nextCitizenId(country),countryId:country,settlementId:settlement,householdId,
  givenName:nm.givenName,familyName:nm.familyName,ageYears:age,sex,householdRole:role,
  generatedStage:'household_core_v1',...extra
 };
}

function buildAnchorHousehold(country,settlement,plan,rng){
 const anchor=structuredClone(calibrationMap.get(plan.anchorId));
 if(!anchor) throw new Error('missing anchor '+plan.anchorId);
 anchor.settlementId=settlement; anchor.householdRole=plan.anchorRole||'anchor'; anchor.generatedStage='calibration_anchor';
 const people=[anchor], edges=[];
 const byRel={};
 for(const slot of plan.slots){
  let familyHint=anchor.familyName;
  if(['partner','niece_partner'].includes(slot.relation)) familyHint=null;
  const p=makePerson(country,settlement,plan.householdId,rng,slot.age,slot.sex,slot.relation,familyHint);
  people.push(p); if(!byRel[slot.relation])byRel[slot.relation]=[];byRel[slot.relation].push(p);
  if(slot.relation==='partner') addEdge(edges,anchor.citizenId,p.citizenId,'partner','partner');
  else if(slot.relation==='child') addEdge(edges,anchor.citizenId,p.citizenId,'parent','child');
  else if(slot.relation==='mother') addEdge(edges,anchor.citizenId,p.citizenId,'child','parent');
  else if(slot.relation==='father') addEdge(edges,anchor.citizenId,p.citizenId,'child','parent');
  else if(slot.relation==='sibling') addEdge(edges,anchor.citizenId,p.citizenId,'sibling','sibling');
  else if(slot.relation==='adult_child') addEdge(edges,anchor.citizenId,p.citizenId,'parent','child');
  else if(slot.relation==='grandmother') addEdge(edges,anchor.citizenId,p.citizenId,'grandchild','grandparent');
  else if(slot.relation==='grandfather') addEdge(edges,anchor.citizenId,p.citizenId,'grandchild','grandparent');
  else if(slot.relation==='niece') addEdge(edges,anchor.citizenId,p.citizenId,'aunt_or_uncle','niece_or_nephew');
  else if(slot.relation==='adult_relative') addEdge(edges,anchor.citizenId,p.citizenId,'relative','relative');
 }
 const children=(byRel.child||[]).concat(byRel.niece_child||[]);
 uniquePairs(children,edges);
 if((byRel.partner||[])[0]) for(const ch of byRel.child||[]) addEdge(edges,byRel.partner[0].citizenId,ch.citizenId,'parent','child');
 if((byRel.father||[])[0]&&(byRel.mother||[])[0]) addEdge(edges,byRel.father[0].citizenId,byRel.mother[0].citizenId,'partner','partner');
 if((byRel.niece||[])[0]&&(byRel.niece_partner||[])[0]) addEdge(edges,byRel.niece[0].citizenId,byRel.niece_partner[0].citizenId,'partner','partner');
 if((byRel.niece||[])[0]) for(const ch of byRel.niece_child||[]) addEdge(edges,byRel.niece[0].citizenId,ch.citizenId,'parent','child');
 if((byRel.niece_partner||[])[0]) for(const ch of byRel.niece_child||[]) addEdge(edges,byRel.niece_partner[0].citizenId,ch.citizenId,'parent','child');

 return {household:{householdId:plan.householdId,countryId:country,settlementId:settlement,archetype:plan.archetype,anchorHousehold:true,memberIds:people.map(p=>p.citizenId)},people,edges};
}

function weightedArchetype(rng,mix,remaining){
 const valid=Object.entries(mix).filter(([k])=>{
  const min={single_adult:1,elderly:1,couple_no_children:2,single_parent:2,shared_workers:2,couple_children:3,multigenerational:3}[k];
  return remaining>=min;
 });
 let x=rng()*valid.reduce((s,[,w])=>s+w,0);
 for(const [k,w] of valid){x-=w;if(x<=0)return k;}
 return valid[valid.length-1][0];
}
function preferredSize(rng,type,remaining){
 let sizes;
 if(type==='single_adult')sizes=[1];
 else if(type==='elderly')sizes=[1,2,2];
 else if(type==='couple_no_children')sizes=[2];
 else if(type==='single_parent')sizes=[2,3,3,4];
 else if(type==='shared_workers')sizes=[2,3,3,4,5];
 else if(type==='couple_children')sizes=[3,4,4,5,5,6];
 else sizes=[3,4,5,5,6,6,7,8];
 return Math.min(pick(rng,sizes),remaining);
}
function makeGeneric(country,settlement,type,size,rng){
 const householdId=nextHouseId(country), people=[], edges=[];
 const family=generatedName(country,rng).familyName;
 const add=(age,sex,role,fam=family)=>{const p=makePerson(country,settlement,householdId,rng,age,sex,role,fam);people.push(p);return p;};

 if(type==='single_adult'){
  const a=add(flexibleAdultAge(rng),roleSex(rng),'single_adult');
 } else if(type==='elderly'){
  const a=add(ri(rng,62,84),roleSex(rng),'elder');
  if(size>1){const b=add(clamp(a.ageYears+ri(rng,-6,6),60,87),a.sex==='male'?'female':'male','elder_partner',null);addEdge(edges,a.citizenId,b.citizenId,'partner','partner');}
 } else if(type==='couple_no_children'){
  const a=add(flexibleAdultAge(rng),roleSex(rng),'adult');
  const b=add(clamp(a.ageYears+ri(rng,-6,6),20,69),a.sex==='male'?'female':'male','partner',null);addEdge(edges,a.citizenId,b.citizenId,'partner','partner');
 } else if(type==='shared_workers'){
  for(let i=0;i<size;i++) add(rng()<0.35?ri(rng,18,24):ri(rng,25,52),roleSex(rng),'shared_worker',null);
 } else if(type==='single_parent'){
  const p=add(parentAge(rng),roleSex(rng),'parent');
  const maxChild=Math.max(1,Math.min(30,p.ageYears-18));
  const kids=[];
  for(let i=1;i<size;i++){const c=add(childAge(rng,maxChild),roleSex(rng),'child');kids.push(c);addEdge(edges,p.citizenId,c.citizenId,'parent','child');}
  uniquePairs(kids,edges);
 } else if(type==='couple_children'){
  const a=add(parentAge(rng),roleSex(rng),'parent');
  const b=add(clamp(a.ageYears+ri(rng,-6,6),23,53),a.sex==='male'?'female':'male','parent_partner',null);addEdge(edges,a.citizenId,b.citizenId,'partner','partner');
  const maxChild=Math.max(1,Math.min(30,Math.min(a.ageYears,b.ageYears)-18));
  const kids=[];
  for(let i=2;i<size;i++){const c=add(childAge(rng,maxChild),roleSex(rng),'child');kids.push(c);addEdge(edges,a.citizenId,c.citizenId,'parent','child');addEdge(edges,b.citizenId,c.citizenId,'parent','child');}
  uniquePairs(kids,edges);
 } else {
  const gp=add(ri(rng,59,83),roleSex(rng),'grandparent');
  const adultAge=clamp(gp.ageYears-ri(rng,20,32),28,60);
  const adult=add(adultAge,gp.sex==='male'?'female':'male','adult_child');addEdge(edges,gp.citizenId,adult.citizenId,'parent','child');
  let partner=null;
  if(size>=4){partner=add(clamp(adultAge+ri(rng,-6,6),23,57),adult.sex==='male'?'female':'male','adult_partner',null);addEdge(edges,adult.citizenId,partner.citizenId,'partner','partner');}
  const used=partner?3:2, kids=[];
  const maxChild=Math.max(1,Math.min(30,adult.ageYears-18));
  for(let i=used;i<size;i++){const c=add(childAge(rng,maxChild),roleSex(rng),'child');kids.push(c);addEdge(edges,adult.citizenId,c.citizenId,'parent','child');if(partner)addEdge(edges,partner.citizenId,c.citizenId,'parent','child');addEdge(edges,gp.citizenId,c.citizenId,'grandparent','grandchild');}
  uniquePairs(kids,edges);
 }
 return {household:{householdId,countryId:country,settlementId:settlement,archetype:type,anchorHousehold:false,memberIds:people.map(p=>p.citizenId)},people,edges};
}

function auditSettlement(data,target){
 const ids=new Set(data.citizens.map(x=>x.citizenId));
 if(ids.size!==data.citizens.length) throw new Error('duplicate citizen id '+data.settlementId);
 if(data.citizens.length!==target) throw new Error('population mismatch '+data.settlementId+' '+data.citizens.length+'!='+target);
 const hid=new Set(data.households.map(x=>x.householdId));
 if(hid.size!==data.households.length) throw new Error('duplicate household id '+data.settlementId);
 for(const h of data.households){
  if(!h.memberIds.length) throw new Error('empty household '+h.householdId);
  for(const id of h.memberIds) if(!ids.has(id)) throw new Error('missing member '+id);
  const members=h.memberIds.map(id=>data.citizens.find(c=>c.citizenId===id));
  if(members.every(c=>c.ageYears<18)) throw new Error('minor-only household '+h.householdId);
 }
 for(const e of data.familyEdges) if(!ids.has(e.from)||!ids.has(e.to)) throw new Error('bad edge '+data.settlementId+' '+JSON.stringify(e));
}

const countrySummary={};
for(const [country,cfg] of Object.entries(settlementCfg.countries)){
 const rng=rngFor(demographic.seed+'|'+country);
 const mix=demographic.countries[country].householdMix;
 const anchors=calibration.citizens.filter(c=>c.countryId===country);
 const summary={population:0,households:0,settlements:{},ageBands:{'0-4':0,'5-14':0,'15-24':0,'25-44':0,'45-64':0,'65+':0},householdTypes:{}};
 for(const st of cfg.settlements){
  const data={version:1,countryId:country,settlementId:st.id,settlementName:st.name,targetPopulation:st.population,households:[],citizens:[],familyEdges:[]};
  for(const a of anchors.filter(x=>x.homeSettlementId===st.id)){
   const plan=anchorByHouse.get(a.householdId); if(!plan) throw new Error('missing anchor plan '+a.citizenId);
   const made=buildAnchorHousehold(country,st.id,plan,rng);
   data.households.push(made.household);data.citizens.push(...made.people);data.familyEdges.push(...made.edges);
  }
  let remaining=st.population-data.citizens.length;
  while(remaining>0){
   let type=weightedArchetype(rng,mix,remaining);
   let size=preferredSize(rng,type,remaining);
   if(size<=0) throw new Error('bad size');
   const made=makeGeneric(country,st.id,type,size,rng);
   data.households.push(made.household);data.citizens.push(...made.people);data.familyEdges.push(...made.edges);
   remaining-=size;
  }
  auditSettlement(data,st.population);
  for(const c of data.citizens) summary.ageBands[ageBand(c.ageYears)]++;
  for(const h of data.households) summary.householdTypes[h.archetype]=(summary.householdTypes[h.archetype]||0)+1;
  summary.population+=data.citizens.length;summary.households+=data.households.length;
  summary.settlements[st.id]={population:data.citizens.length,households:data.households.length,meanHouseholdSize:Number((data.citizens.length/data.households.length).toFixed(2))};
  write('sidehustle-autopublish/note/worldsim/population/generated/'+country+'/'+st.id+'.json',data);
 }
 if(summary.population!==cfg.totalPopulation) throw new Error('country total mismatch '+country);
 countrySummary[country]=summary;
}

const global={
 version:1,seed:demographic.seed,generatedAt:new Date().toISOString(),
 totalPopulation:Object.values(countrySummary).reduce((s,x)=>s+x.population,0),
 totalHouseholds:Object.values(countrySummary).reduce((s,x)=>s+x.households,0),
 countries:countrySummary,
 invariants:{exactSettlementPopulation:true,noMinorOnlyHouseholds:true,calibrationCitizensPreserved:true,directionalFamilyEdges:true}
};
if(global.totalPopulation!==demographic.totalPopulation) throw new Error('global population mismatch');
write('sidehustle-autopublish/note/worldsim/population/generated/household_generation_summary.json',global);
console.log(JSON.stringify({ok:true,totalPopulation:global.totalPopulation,totalHouseholds:global.totalHouseholds,countries:countrySummary},null,2));
