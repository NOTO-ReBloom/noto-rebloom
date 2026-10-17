import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {seasonalWeatherBaseline,anomalyMemory,normalizeCalendar} from './time_model_v1.mjs';

const ROOT=process.cwd(),P=(...x)=>path.join(ROOT,...x);
const read=p=>JSON.parse(fs.readFileSync(P(p),'utf8'));
const write=(p,o)=>{const f=P(p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(o,null,2)+'\n');};
const turn=Number(process.env.WORLDSIM_TURN||1),prev=turn-1;
const turnPad=n=>String(n).padStart(4,'0');
const state=read('sidehustle-autopublish/note/worldsim/state/turn_'+turnPad(prev)+'/world_state.json');
const truth=read('sidehustle-autopublish/note/worldsim/world/observer_truth_v1.json');
const catalog=read('sidehustle-autopublish/note/worldsim/simulation/policy_catalog_v1.json');
const institutions=read('sidehustle-autopublish/note/worldsim/institutions/institution_state_turn0.json');

function seedInt(s){return crypto.createHash('sha256').update(String(s)).digest().readUInt32LE(0);}
function rngFor(s){let a=seedInt(s);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const ri=(r,a,b)=>Math.floor(r()*(b-a+1))+a;
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));

function loadPeople(country){
 const dir=P('sidehustle-autopublish/note/worldsim/population/personality',country),out={};
 for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))){
  const d=read('sidehustle-autopublish/note/worldsim/population/personality/'+country+'/'+f);
  for(const c of d.citizens)out[c.citizenId]=c;
 }
 return out;
}
function loadBelief(country){return read('sidehustle-autopublish/note/worldsim/population/beliefs/'+country+'.json');}
function rumorPrevalence(belief,topic){
 const vals=Object.values(belief.records).flatMap(r=>r.rumors.filter(x=>x.topic===topic));
 if(!vals.length)return 0;
 return vals.reduce((s,x)=>s+(x.stance==='believed'?1:x.stance==='uncertain'?.45:0),0)/vals.length;
}
function weather(){
 const r=rngFor(state.worldId+'|WEATHER|'+turn);
 const cal=normalizeCalendar(state.calendar);
 const a=seasonalWeatherBaseline('ARCUS',cal.dayOfYear);
 const m=seasonalWeatherBaseline('MIREA',cal.dayOfYear);
 const v=seasonalWeatherBaseline('VALD',cal.dayOfYear);
 const memory=anomalyMemory(turn,10);
 const arcaWind=clamp(a.coastalWind+truth.climate.currentAnomalies.arcaSeaSurfaceTempVs20yMeanC*6*memory+ri(r,-11,13));
 const arcaRain=clamp(a.rain+ri(r,-12,13));
 const mireaRain=clamp(m.catchmentRain+truth.climate.currentAnomalies.mireaUpperCatchmentRainVsMeanPct*.55*memory+ri(r,-13,14));
 const riverPressure=clamp((mireaRain+truth.hydrology.mireaRiver.turn0SedimentIndex*.72)/1.72+ri(r,-4,4));
 const valdCold=clamp(v.cold+ri(r,-10,11));
 const valdSnow=clamp(v.snow+ri(r,-10,12));
 return {
  calendar:{year:cal.year,dayOfYear:cal.dayOfYear,season:cal.season,seasonStage:cal.seasonStage},
  ARCUS:{coastalWindIndex:Math.round(arcaWind),rainIndex:Math.round(arcaRain),summary:arcaWind>=72?'rough coastal week':arcaWind>=58?'breezy coast':'mostly workable coast'},
  MIREA:{upperCatchmentRainIndex:Math.round(mireaRain),riverPressureIndex:Math.round(riverPressure),summary:riverPressure>=78?'high river pressure':riverPressure>=60?'elevated river':'ordinary river conditions'},
  VALD:{coldPressureIndex:Math.round(valdCold),snowRiskIndex:Math.round(valdSnow),summary:valdCold>=70?'hard-freeze conditions':valdSnow>=45?'cold with meaningful snow risk':valdCold>=52?'cold highland week':'mild-to-cool highland week'}
 };
}
const wx=weather();

function urgency(policy,country,people,belief){
 const cs=state.countries[country];let u=35;
 switch(policy.id){
  case'A_TIMBER_REPAIR':u=58+(65-state.worldDynamic.resources['R-ARCA-TIMBER-01'].stockIndex)*.8+(wx.ARCUS.coastalWindIndex-50)*.18;break;
  case'A_HARBOR_SANITATION':u=48+(70-cs.settlementStates['ARCA-PORT-01'].meanHealth)*.55+rumorPrevalence(belief,'health')*15;break;
  case'A_COASTAL_SURVEY':u=28+Object.values(people).filter(x=>x.occupation.sector==='knowledge').length*1.2+turn*1.1;break;
  case'A_INLAND_ROAD_REPAIR':u=42+(cs.settlementStates['ARCA-RIDGE-01'].risks.includes('landslide')?7:0);break;
  case'M_GATE_CLEARING':u=55+(wx.MIREA.riverPressureIndex-50)*.45+(truth.hydrology.mireaRiver.turn0SedimentIndex-50)*.35;break;
  case'M_SPILLWAY_SURVEY':u=48+(wx.MIREA.riverPressureIndex-50)*.30+rumorPrevalence(belief,'river')*10;break;
  case'M_WETLAND_BUFFER':u=38+(80-state.worldDynamic.resources['R-MIR-WETLAND-01'].stockIndex)*.25+rumorPrevalence(belief,'wetland')*16;break;
  case'M_SCHOOL_HARVEST':u=30+rumorPrevalence(belief,'education')*18;break;
  case'V_MINE_INSPECTION':u=55+Object.values(people).filter(x=>x.occupationId==='miner').length*.045+rumorPrevalence(belief,'mining')*18;break;
  case'V_FUEL_BUFFER':u=46+(90-cs.meanFuelReserveDays)*.25+(93-state.calendar.daysUntilMeteorologicalWinter)*.08;break;
  case'V_SMOKE_VENT':u=43+rumorPrevalence(belief,'health')*18+(72-cs.settlementStates['VALD-BASIN-01'].meanHealth)*.35;break;
  case'V_PASS_SURVEY':u=25+rumorPrevalence(belief,'information')*8+turn*1.0;break;
 }
 return Number(clamp(u).toFixed(2));
}
function sponsor(policy,country,people,belief){
 const members=(state.countries[country].institution||institutions.countries[country]).nationalBody.members.map(x=>people[x.citizenId]).filter(Boolean);
 const preferred=new Set(policy.sponsorSectors||[]);
 return members.map(c=>{
  const topicRumors=belief.records[c.citizenId]?.rumors?.filter(x=>x.topic===policy.topic)||[];
  const awareness=topicRumors.reduce((m,x)=>Math.max(m,x.confidence),0);
  const sector=preferred.has(c.occupation.sector)?18:0;
  const valueScore=Object.entries(policy.valueImpact||{}).reduce((s,[k,w])=>s+w*((c.values[k]||50)-50)/5,0);
  return{c,score:sector+c.occupation.skill*.16+c.psychology.bigFive.conscientiousness*.09+awareness*.07+valueScore};
 }).sort((a,b)=>b.score-a.score)[0]?.c?.citizenId||members[0]?.citizenId||null;
}

function recentPolicyRecord(policyId){
 const xs=(state.eventLog||[]).filter(e=>e.type==='policy_vote'&&e.policyId===policyId).sort((a,b)=>b.turn-a.turn);
 return xs[0]||null;
}
function policyAvailable(policy){
 const last=recentPolicyRecord(policy.id);
 if(!last)return true;
 const cooldown=policy.cooldownTurns||0;
 if(last.passed&&turn-last.turn<=cooldown)return false;
 if(!last.passed&&turn-last.turn<=1)return false;
 return true;
}
const proposals={};
for(const country of ['ARCUS','MIREA','VALD']){
 const people=loadPeople(country),belief=loadBelief(country);
 const ranked=catalog.policies.filter(p=>p.country===country&&policyAvailable(p)).map(p=>{
   let u=urgency(p,country,people,belief);
   const last=recentPolicyRecord(p.id);
   if(last&&!last.passed)u=Math.max(0,u-6);
   return {...p,urgency:Number(u.toFixed(2))};
 }).sort((a,b)=>b.urgency-a.urgency);
 proposals[country]=ranked.slice(0,2).map(p=>({policyId:p.id,title:p.title,topic:p.topic,urgency:p.urgency,sponsorId:sponsor(p,country,people,belief),reason:'selected from current material conditions, local risk, policy cooldown and citizen information'}));
}
const input={version:1,worldId:state.worldId,turn,previousTurn:prev,preparedFromStateHash:crypto.createHash('sha256').update(JSON.stringify(state)).digest('hex'),weather:wx,proposals};
write('sidehustle-autopublish/note/worldsim/turns/turn_'+turnPad(turn)+'/turn_input.json',input);
console.log(JSON.stringify(input,null,2));
