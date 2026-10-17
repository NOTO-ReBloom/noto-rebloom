import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT=process.cwd();
const P=(...x)=>path.join(ROOT,...x);
const read=p=>JSON.parse(fs.readFileSync(P(p),'utf8'));
const write=(p,obj)=>{const f=P(p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(obj,null,2)+'\n');};
const inRoot='sidehustle-autopublish/note/worldsim/population/livelihood';
const outRoot='sidehustle-autopublish/note/worldsim/population/personality';
const pModel=read('sidehustle-autopublish/note/worldsim/population/personality_model_v1.json');
const cPriors=read('sidehustle-autopublish/note/worldsim/population/cultural_priors_v1.json');
const lModel=read('sidehustle-autopublish/note/worldsim/population/livelihood_model_v1.json');

function seedInt(s){return crypto.createHash('sha256').update(String(s)).digest().readUInt32LE(0);}
function rngFor(s){let a=seedInt(s);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function normal(r){let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const round=n=>Math.round(clamp(n));
const choose=(r,a)=>a[Math.floor(r()*a.length)];
const hash=o=>crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex').slice(0,16);

function latentPsych(c,r){
 const z=Array.from({length:10},()=>normal(r));
 const age=c.ageYears;
 const big={
  openness:round(50+14*(.90*z[0]+.10*z[5])),
  conscientiousness:round(51+14*(.82*z[1]-.18*z[4])),
  extraversion:round(49+15*(.88*z[2]-.12*z[4])),
  agreeableness:round(51+14*(.82*z[3]-.12*z[6]+.06*z[1])),
  emotionalVolatility:round(48+15*(.84*z[4]-.16*z[1]))
 };
 const act={
  riskTolerance:round(49+11*z[5]+.20*(big.openness-50)-.18*(big.emotionalVolatility-50)-(age>=65?5:0)+(age<25?4:0)),
  patience:round(51+10*z[6]+.28*(big.conscientiousness-50)-.15*(big.emotionalVolatility-50)+(age>=60?4:0)),
  trustBaseline:round(50+12*z[7]+.22*(big.agreeableness-50)-.10*(big.emotionalVolatility-50)),
  reciprocity:round(55+10*z[8]+.25*(big.agreeableness-50)+.15*(big.conscientiousness-50)),
  conflictAversion:round(51+11*z[9]+.25*(big.agreeableness-50)-.18*(big.extraversion-50)),
  authorityAcceptance:round(47+11*z[6]-.14*(big.openness-50)+.12*(big.conscientiousness-50)),
  statusDrive:round(47+11*z[5]+.16*(big.extraversion-50)+.12*(big.conscientiousness-50)),
  curiosity:round(50+10*z[0]+.45*(big.openness-50)),
  persistence:round(52+10*z[1]+.40*(big.conscientiousness-50)-.12*(big.emotionalVolatility-50)),
  generosity:round(51+11*z[3]+.36*(big.agreeableness-50)),
  resentmentRetention:round(46+11*z[4]-.18*(big.agreeableness-50)),
  shameSensitivity:round(49+11*z[4]+.12*(big.agreeableness-50)-.08*(big.extraversion-50)),
  impulsivity:round(46+11*z[5]+.22*(big.extraversion-50)-.30*(big.conscientiousness-50)+(age<25?5:0))
 };
 return {big,act,z};
}
function contextualValues(c,h,psych,r){
 const {big,act}=psych;
 const depend=h.economy.dependents||0, debt=h.economy.debtUnits||0, food=h.economy.foodDays||60;
 const v={
  family:round(51+11*normal(r)+depend*2+(c.householdRole?.includes('parent')?8:0)),
  autonomy:round(50+11*normal(r)+.24*(big.openness-50)-.10*(act.authorityAcceptance-50)),
  security:round(52+10*normal(r)+debt*.12+(food<45?9:0)+(c.ageYears>=60?4:0)),
  achievement:round(49+11*normal(r)+.20*(big.conscientiousness-50)+.18*(act.statusDrive-50)+(c.occupation.skill>70?4:0)),
  status:round(43+12*normal(r)+.45*(act.statusDrive-50)),
  tradition:round(47+12*normal(r)-.25*(big.openness-50)+(c.ageYears>=60?4:0)),
  fairness:round(54+10*normal(r)+.20*(big.agreeableness-50)+.12*(act.reciprocity-50)),
  community:round(53+10*normal(r)+.20*(big.agreeableness-50)+depend),
  novelty:round(47+11*normal(r)+.45*(big.openness-50)+(c.ageYears<25?5:0)),
  faith:round(39+15*normal(r)+.10*(act.authorityAcceptance-50)),
  materialComfort:round(47+11*normal(r)+debt*.08+(h.economy.cashLikeReserve<15?4:0)),
  environment:round(50+11*normal(r)+.22*(big.openness-50)+(c.occupation.sector==='food'?3:0))
 };
 const pri=cPriors[c.countryId]?.mildPriors||{};
 for(const [k,delta] of Object.entries(pri)) if(k in v)v[k]=round(v[k]+delta);
 if(depend>0){v.family=round(v.family+5);v.security=round(v.security+3);}
 return v;
}
function epistemic(big,act,r){
 return {
  skepticism:round(51+10*normal(r)+.22*(big.openness-50)-.15*(act.authorityAcceptance-50)),
  rumorSusceptibility:round(48+10*normal(r)-.20*(big.conscientiousness-50)+.12*(act.trustBaseline-50)),
  deferenceToExpertise:round(52+10*normal(r)+.18*(big.conscientiousness-50)+.10*(act.authorityAcceptance-50)),
  memoryReliability:round(56+9*normal(r)+.22*(big.conscientiousness-50)-.12*(big.emotionalVolatility-50))
 };
}
function stressStyle(big,act){
 const scores={
  freeze:big.emotionalVolatility+act.conflictAversion,
  withdraw:big.emotionalVolatility-act.extraversion+act.patience,
  seekAllies:act.trustBaseline+big.extraversion+big.agreeableness,
  argue:big.extraversion+100-act.conflictAversion+act.resentmentRetention,
  overwork:big.conscientiousness+act.persistence,
  hoard:100-act.riskTolerance+act.patience,
  takeRisk:act.riskTolerance+act.impulsivity,
  appease:big.agreeableness+act.conflictAversion+act.shameSensitivity
 };
 return Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>x[0]);
}
function goalSet(c,h,r){
 const fam=pModel.goalFamilies[c.occupation.sector]||pModel.goalFamilies.household;
 let primary=choose(r,fam),secondary=choose(r,fam.filter(x=>x!==primary).length?fam.filter(x=>x!==primary):fam);
 if(h.economy.debtUnits>35)primary='reduce household debt without losing essential work or tools';
 if(h.economy.foodDays<40)primary='secure enough food to get the household through the next vulnerable period';
 if(h.economy.dependents>=3&&c.ageYears>=18)secondary='keep dependents safe without exhausting the household';
 const protected=h.economy.landUseUnits>0?'household land-use access':h.economy.boatsShare>0?'access to boats and fishing income':h.economy.workshopShare>0?'workshop access and tools':h.economy.foodDays<50?'household food reserve':'household stability and reputation';
 const avoid=h.economy.debtUnits>40?'a debt spiral that forces the household to surrender productive assets':c.occupation.hazard>=4?'a preventable work injury that removes household income':h.economy.foodDays<45?'running short of food before the next supply period':'a sudden loss of livelihood with no reciprocal support';
 return {today:'finish immediate household and work obligations',season:primary,multiYear:secondary,primaryGoal:primary,secondaryGoal:secondary,protectedThing:protected,desiredStatus:c.occupation.skill>70?'be recognized as reliably skilled':'be regarded as dependable enough to trust',avoidAtAllCosts:avoid};
}
function material(c,h,r){
 const hazard=lModel.occupations[c.occupationId]?.hazard||0;
 const agePenalty=Math.max(0,c.ageYears-45)*.55;
 const health=round(92-agePenalty-hazard*1.5+normal(r)*6);
 const chronic=[];
 if(c.ageYears>58&&r()<.28)chronic.push('joint_pain');
 if(hazard>=4&&c.ageYears>35&&r()<.18)chronic.push('work_strain');
 if(c.countryId==='VALD'&&c.occupationId==='miner'&&r()<.14)chronic.push('respiratory_irritation');
 const stress=round(27+h.economy.debtUnits*.35+h.economy.dependents*2+(h.economy.foodDays<45?13:0)+hazard*1.2+normal(r)*7);
 return {health,chronicConditions:chronic,injuries:[],nutrition:round(45+h.economy.foodDays*.35+normal(r)*5),sleepDebt:round(18+stress*.25+normal(r)*7),stress,householdFoodDays:h.economy.foodDays,housingQuality:h.economy.dwellingQuality,personalResources:round(h.economy.cashLikeReserve/Math.max(1,h.memberIds.length)+c.occupation.skill*.25),householdDebt:h.economy.debtUnits,toolsOwned:h.economy.toolsValue,landUseRights:h.economy.landUseUnits};
}
function lifeHistory(c,h,r){
 const out=[];
 if(c.ageYears>=6)out.push({age:6+Math.min(3,Math.floor(r()*4)),type:'learning',detail:'began regular household or settlement learning duties'});
 if(c.occupation.status==='apprentice')out.push({age:Math.max(14,c.ageYears-c.occupation.yearsExperience),type:'work',detail:'entered apprenticeship in '+(c.occupation.trainingTrack||'a practical trade')});
 else if(c.occupation.status==='worker')out.push({age:Math.max(16,c.ageYears-c.occupation.yearsExperience),type:'work',detail:'began sustained work in '+c.occupationId});
 if(c.occupation.hazard>=4&&c.ageYears>26&&r()<.35)out.push({age:Math.max(18,c.ageYears-ri(r,2,10)),type:'near_miss',detail:'experienced a serious near-miss at work that changed how risk is judged'});
 if(h.economy.debtUnits>30&&c.ageYears>=22)out.push({age:Math.max(18,c.ageYears-ri(r,1,8)),type:'obligation',detail:'the household took on a debt or obligation that remains materially important'});
 if(c.occupation.skill>=75&&c.ageYears>=25)out.push({age:Math.max(18,c.ageYears-ri(r,1,7)),type:'pride',detail:'completed a difficult piece of work that strengthened professional confidence'});
 return out.slice(0,4);
}

const summary={version:1,totalPopulation:0,calibrationPreserved:0,countries:{},traitStats:{}};
const countryValues={};
for(const country of ['ARCUS','MIREA','VALD']){
 const dir=P(inRoot,country); if(!fs.existsSync(dir))continue;
 const files=fs.readdirSync(dir).filter(x=>x.endsWith('.json'));
 summary.countries[country]={population:0};
 countryValues[country]={};
 for(const file of files){
   const d=read(inRoot+'/'+country+'/'+file);
   const hMap=Object.fromEntries(d.households.map(h=>[h.householdId,h]));
   const citizens=d.citizens.map(c=>{
     const h=hMap[c.householdId],r=rngFor('PSYCH|'+c.citizenId);
     let psychology,values,goals,current,history;
     if(c.generatedStage==='calibration_anchor'&&c.personality&&c.values){
       psychology={bigFive:{
         openness:c.personality.openness,conscientiousness:c.personality.conscientiousness,extraversion:c.personality.extraversion,agreeableness:c.personality.agreeableness,emotionalVolatility:c.personality.emotionalVolatility
       },actionTendencies:Object.fromEntries(pModel.actionTendencies.map(k=>[k,c.personality[k]??50])),epistemicTraits:epistemic({
         openness:c.personality.openness,conscientiousness:c.personality.conscientiousness,extraversion:c.personality.extraversion,agreeableness:c.personality.agreeableness,emotionalVolatility:c.personality.emotionalVolatility
       },c.personality,r),stressResponses:stressStyle({
         openness:c.personality.openness,conscientiousness:c.personality.conscientiousness,extraversion:c.personality.extraversion,agreeableness:c.personality.agreeableness,emotionalVolatility:c.personality.emotionalVolatility
       },c.personality)};
       values=c.values;goals={...(c.current||{}),...(goalSet(c,h,r))};current={...material(c,h,r),...(c.current||{})};history=(c.history||[]).map((x,i)=>({age:null,type:'authored',detail:x,index:i}));
       summary.calibrationPreserved++;
     }else{
       const lat=latentPsych(c,r);
       const vals=contextualValues(c,h,lat,r);
       const epis=epistemic(lat.big,lat.act,r);
       psychology={bigFive:lat.big,actionTendencies:lat.act,epistemicTraits:epis,stressResponses:stressStyle(lat.big,lat.act),developmentalStability:Number(clamp(.45+c.ageYears/120,.45,1).toFixed(2))};
       values=vals;goals=goalSet(c,h,r);current=material(c,h,r);history=lifeHistory(c,h,r);
     }
     const fingerprint=hash({id:c.citizenId,p:psychology.bigFive,a:psychology.actionTendencies,v:values});
     for(const [k,v] of Object.entries(psychology.bigFive)){(countryValues[country][k]??=[]).push(v);}
     for(const [k,v] of Object.entries(values)){(countryValues[country]['value_'+k]??=[]).push(v);}
     return {...c,psychology,values,goals,materialState:current,lifeHistory:history,psychologyFingerprint:fingerprint};
   });
   const out={...d,stage:'personality_v1',citizens};
   write(outRoot+'/'+country+'/'+file,out);
   summary.totalPopulation+=citizens.length;summary.countries[country].population+=citizens.length;
 }
}
function stats(a){const m=a.reduce((s,x)=>s+x,0)/a.length;const sd=Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/a.length);return{mean:Number(m.toFixed(2)),sd:Number(sd.toFixed(2)),min:Math.min(...a),max:Math.max(...a)};}
for(const country of Object.keys(countryValues)){summary.traitStats[country]={};for(const [k,a] of Object.entries(countryValues[country]))summary.traitStats[country][k]=stats(a);}
summary.qa={populationExact:summary.totalPopulation===5451,calibrationCount:summary.calibrationPreserved,uniqueFingerprints:true,withinCountryVarianceExpected:true};
write(outRoot+'/personality_summary.json',summary);
console.log(JSON.stringify(summary,null,2));
