import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd(),P=(...x)=>path.join(ROOT,...x);
const read=p=>JSON.parse(fs.readFileSync(P(p),'utf8'));
const write=(p,o)=>{const f=P(p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(o,null,2)+'\n');};
const model=read('sidehustle-autopublish/note/worldsim/institutions/institution_model_v2.json');
const popRoot='sidehustle-autopublish/note/worldsim/population/personality';
const socialRoot='sidehustle-autopublish/note/worldsim/population/social';

function loadCountry(country){
 const dir=P(popRoot,country),people={},bySettlement={};
 for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))){
  const d=read(popRoot+'/'+country+'/'+f);
  for(const c of d.citizens){people[c.citizenId]=c;(bySettlement[c.settlementId]??=[]).push(c);}
 }
 return{people,bySettlement};
}
function scoreCandidates(country,people,graph){
 const incoming={};for(const e of graph.edges)(incoming[e.to]??=[]).push(e);
 const scores={};
 for(const c of Object.values(people)){
  const inc=incoming[c.citizenId]||[];
  const respect=inc.length?inc.reduce((s,e)=>s+e.respect,0)/inc.length:40;
  const trust=inc.length?inc.reduce((s,e)=>s+e.trust,0)/inc.length:40;
  const skill=c.occupation?.skill??40,con=c.psychology.bigFive.conscientiousness,community=c.values.community,fair=c.values.fairness,stress=c.materialState.stress;
  scores[c.citizenId]=Number((respect*.28+trust*.18+skill*.18+con*.14+community*.10+fair*.07+(100-stress)*.05).toFixed(3));
 }
 return scores;
}
function chooseLocal(list,seats,scores){
 const eligible=list.filter(c=>c.ageYears>=25&&c.ageYears<=76&&c.occupation.status!=='dependent'&&c.occupation.status!=='student')
   .sort((a,b)=>scores[b.citizenId]-scores[a.citizenId]||a.citizenId.localeCompare(b.citizenId));
 const picked=[],occCount={},sectorCount={};
 const maxOcc=Math.max(2,Math.ceil(seats*.4));
 for(const c of eligible){
  if(picked.length>=seats)break;
  if((occCount[c.occupationId]||0)>=maxOcc)continue;
  picked.push(c);occCount[c.occupationId]=(occCount[c.occupationId]||0)+1;sectorCount[c.occupation.sector]=(sectorCount[c.occupation.sector]||0)+1;
 }
 while(picked.length<seats&&eligible[picked.length]){const c=eligible.find(x=>!picked.includes(x));if(!c)break;picked.push(c);}
 // Age diversity swaps if possible
 if(!picked.some(c=>c.ageYears<40)){const x=eligible.find(c=>c.ageYears<40&&!picked.includes(c));if(x)picked[picked.length-1]=x;}
 if(!picked.some(c=>c.ageYears>=45)){const x=eligible.find(c=>c.ageYears>=45&&!picked.includes(c));if(x)picked[picked.length-1]=x;}
 return picked;
}

const output={version:2,turn:0,countries:{}};
for(const country of ['ARCUS','MIREA','VALD']){
 const cfg=model.countries[country],{people,bySettlement}=loadCountry(country),graph=read(socialRoot+'/'+country+'.json'),scores=scoreCandidates(country,people,graph);
 const localCouncils={};
 for(const [sid,list] of Object.entries(bySettlement)){
  const seats=Math.min(cfg.localCouncilRule.maxSeats,cfg.localCouncilRule.baseSeats+Math.floor(list.length/cfg.localCouncilRule.extraSeatPerPopulation));
  const members=chooseLocal(list,seats,scores);
  localCouncils[sid]={settlementId:sid,seats,memberIds:members.map(x=>x.citizenId),termEndsTurn:cfg.localCouncilRule.termTurns,memberScores:Object.fromEntries(members.map(x=>[x.citizenId,scores[x.citizenId]]))};
 }
 const national=[];
 for(const [sid,council] of Object.entries(localCouncils)){
  const sorted=council.memberIds.slice().sort((a,b)=>scores[b]-scores[a]);
  national.push(...sorted.slice(0,cfg.nationalBody.delegatesPerSettlement).map(id=>({citizenId:id,settlementId:sid,selectionScore:scores[id]})));
 }
 const exec=[];
 const usedSettlements=new Set();
 for(const x of national.slice().sort((a,b)=>b.selectionScore-a.selectionScore)){
  if(exec.length>=cfg.executive.count)break;
  if(usedSettlements.has(x.settlementId)&&national.some(y=>!usedSettlements.has(y.settlementId)))continue;
  exec.push(x.citizenId);usedSettlements.add(x.settlementId);
 }
 const advisors=[];
 for(const occ of cfg.exOfficioOccupations||[]){
  const candidates=Object.values(people).filter(c=>c.ageYears>=25&&c.occupationId===occ).sort((a,b)=>scores[b.citizenId]-scores[a.citizenId]);
  if(candidates[0])advisors.push({occupationId:occ,citizenId:candidates[0].citizenId,voice:'advisory_nonvoting'});
 }
 output.countries[country]={
  constitutionalName:cfg.constitutionalName,
  authority:cfg.authority,checks:cfg.checks,decisionStyle:cfg.decisionStyle,
  localCouncils,
  nationalBody:{name:cfg.nationalBody.name,members:national,termEndsTurn:cfg.nationalBody.termTurns},
  executive:{name:cfg.executive.name,memberIds:exec,termEndsTurn:cfg.executive.termTurns},
  advisors,
  legacyObjectiveWeightsUsed:false
 };
}
write('sidehustle-autopublish/note/worldsim/institutions/institution_state_turn0.json',output);
console.log(JSON.stringify(Object.fromEntries(Object.entries(output.countries).map(([k,v])=>[k,{local:Object.keys(v.localCouncils).length,national:v.nationalBody.members.length,executive:v.executive.memberIds.length,advisors:v.advisors.length}]))));
