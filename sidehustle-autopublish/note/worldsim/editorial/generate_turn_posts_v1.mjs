import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const P=(...x)=>path.join(ROOT,...x);
const read=p=>JSON.parse(fs.readFileSync(P(p),'utf8'));
const write=(p,o)=>{const f=P(p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(o,null,2)+'\n');};
const writeText=(p,s)=>{const f=P(p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,String(s).trim()+'\n');};
const turn=Number(process.env.WORLDSIM_TURN||1);
const pad=n=>String(n).padStart(4,'0');
const dry=process.env.WORLDSIM_EDITORIAL_DRY_RUN==='1';
if(turn<1)throw new Error('WORLDSIM_TURN must be >= 1');

const base='sidehustle-autopublish/note/worldsim/';
const state=read(base+'state/turn_'+pad(turn)+'/world_state.json');
const prev=read(base+'state/turn_'+pad(turn-1)+'/world_state.json');
const votes=read(base+'turns/turn_'+pad(turn)+'/votes.json');
const events=read(base+'turns/turn_'+pad(turn)+'/events.json');
const input=read(base+'turns/turn_'+pad(turn)+'/turn_input.json');
const demo=read(base+'turns/turn_'+pad(turn)+'/demography.json');
const queuePath=base+'publication_queue.json';
const rebuild=read(base+'rebuild_request.json');

const META={
 ARCUS:{ja:'アルカ',series:'アルカ通信',accent:'#15334A',tag:'アルカ'},
 MIREA:{ja:'ミレア',series:'ミレア通信',accent:'#284738',tag:'ミレア'},
 VALD:{ja:'ヴァルド',series:'ヴァルド通信',accent:'#333A46',tag:'ヴァルド'}
};
const OCC={
 child:'子ども',student:'学生',apprentice:'見習い',caregiver:'ケア担当',farmer:'農家',orchard_keeper:'果樹農家',
 goat_keeper:'ヤギ飼育',fisher:'漁師',deepwater_fisher:'沖合漁師',wetland_gatherer:'湿地採集',miller:'製粉職',
 food_preserver:'食料保存職',salt_worker:'製塩職',shipwright:'船大工',boat_repairer:'船修理職',metalworker:'金属職人',
 toolmaker:'道具職人',carpenter:'大工',stoneworker:'石工',net_maker:'網職人',timber_worker:'木材労働者',
 charcoal_burner:'炭焼き職',miner:'鉱夫',smelter:'製錬工',hunter:'狩人',irrigation_builder:'灌漑工',
 road_worker:'道路工',dock_laborer:'港湾労働者',hauler:'運搬人',boat_operator:'船運航者',pack_transporter:'山岳運搬人',
 trader:'商人',fish_trader:'魚商',storekeeper:'倉庫管理人',quartermaster:'備蓄管理人',healer:'治療師',
 healer_assistant:'治療助手',herbalist:'薬草師',teacher:'教師',clerk:'書記',council_worker:'行政実務者',
 signal_watch:'見張り役',pass_watch:'峠見張り',map_worker:'測量・地図職',map_apprentice:'測量見習い',
 craft_worker:'職人',reed_worker:'葦細工職人',wool_worker:'羊毛職人',domestic_producer:'家内生産者',retired:'退職者'
};
const FACTOR={
 values:'本人の価値観',sectorBenefit:'自分の仕事に直接ある利益',sectorCost:'自分の仕事が負うコスト',
 affectedLocality:'自分の暮らす地域への直接影響',localCost:'地域が負担するコスト',
 opportunityCost:'ほかに回せた資源や労力を失うこと',sponsorOwnership:'自分自身が提案者であること',
 rumorSignal:'その問題について持っていた未確定情報',sponsorRelationship:'提案者への信頼関係',
 stressSecurity:'生活上の不安から安全を優先したこと'
};

function loadPeople(country){
 const dir=P(base+'population/personality',country),people={},houses={};
 for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))){
  const d=read(base+'population/personality/'+country+'/'+f);
  for(const c of d.citizens)people[c.citizenId]=c;
  for(const h of d.households)houses[h.householdId]=h;
 }
 for(const n of (state.roster.newCitizens||[]).filter(x=>x.countryId===country)){
  if(!people[n.citizenId])people[n.citizenId]=n.profile||n;
 }
 return{people,houses};
}
function absDay(cal){return (cal.year-1)*365+cal.dayOfYear;}
function ageNow(c){
 if(c.bornAbsoluteDay!=null)return Math.max(0,Math.floor((absDay(state.calendar)-c.bornAbsoluteDay)/365));
 const startAbs=239,birth=c.birthDayOfYear||1,now=absDay(state.calendar);
 const crossed=Math.floor((now-birth)/365)-Math.floor((startAbs-birth)/365);
 return Math.max(0,(c.ageYears||0)+Math.max(0,crossed));
}
function effectiveHousehold(country,c,houses){
 const h=houses[c.householdId]||null,ho=state.householdOverlays?.[country]?.[c.householdId]||{};
 return{
  members:h?.memberIds?.length??null,
  foodDays:Math.max(0,(h?.economy?.foodDays??c.materialState?.householdFoodDays??0)+(ho.foodDaysOffset||0)),
  debtUnits:Math.max(0,(h?.economy?.debtUnits??c.materialState?.householdDebt??0)+(ho.debtOffset||0))
 };
}
function person(country,id,vote,data){
 const c=data.people[id];if(!c)return null;
 const positive=Object.entries(vote?.factors||{}).filter(([k,v])=>k!=='boundedNoise'&&v>0).sort((a,b)=>b[1]-a[1]);
 const negative=Object.entries(vote?.factors||{}).filter(([k,v])=>k!=='boundedNoise'&&v<0).sort((a,b)=>a[1]-b[1]);
 return{
  id:id,name:(c.givenName||'')+' '+(c.familyName||''),age:ageNow(c),occupation:OCC[c.occupationId]||c.occupationId,
  settlementId:c.settlementId,household:effectiveHousehold(country,c,data.houses),
  vote:vote?.vote||null,utility:vote?.utility??null,
  mainPositive:positive[0]?.[0]||null,mainNegative:negative[0]?.[0]||null,
  goals:c.goals||{},values:c.values||{}
 };
}
function voteScore(v){
 const closeness=Math.max(0,1-Math.abs((v.yesShare??.5)-.5)*2);
 return 3+(v.no||0)*1.45+(v.abstain||0)*.55+closeness*5+(v.passed?0:5)+(v.dualMajority&&!v.settlementMajority?8:0);
}
function countryCandidate(country){
 const rows=votes[country]||[];
 if(!rows.length)return null;
 const selected=rows.map(v=>({v:v,score:voteScore(v)})).sort((a,b)=>b.score-a.score)[0];
 const d=demo.countries[country]||{births:[],deaths:[]};
 const inst=(events.events||[]).filter(e=>e.country===country&&e.type==='institution_rotation').length;
 const completed=(events.events||[]).filter(e=>e.country===country&&e.type==='project_completed').length;
 const foodDelta=state.countries[country].meanFoodReserveDays-prev.countries[country].meanFoodReserveDays;
 const score=selected.score+d.deaths.length*3+d.births.length*2+inst*4+completed*2+Math.min(4,Math.abs(foodDelta)*1.5);
 return{country:country,vote:selected.v,score:Number(score.toFixed(2)),births:d.births,deaths:d.deaths,inst:inst,completed:completed,foodDelta:Number(foodDelta.toFixed(2))};
}
function factorPhrase(key){return FACTOR[key]||'複数の生活条件';}
function weatherJa(country){
 const w=input.weather[country]||{};
 if(country==='ARCUS')return w.coastalWindIndex>=70?'沿岸は荒れ気味でした。':w.coastalWindIndex>=58?'沿岸では風の強い時間がありました。':'沿岸は大きく荒れず、通常の仕事ができる週でした。';
 if(country==='MIREA')return w.riverPressureIndex>=78?'川の水圧がかなり高い週でした。':w.riverPressureIndex>=60?'上流の雨で、川はやや高い水圧になりました。':'川は大きく増水せずに推移しました。';
 return w.coldPressureIndex>=58?'高地では季節外れの冷え込みが強まりました。':'高地は冷えましたが、まだ本格的な凍結には入りませんでした。';
}
function titleFor(cand){
 const v=cand.vote,m=META[cand.country],short=v.title.replace(/[。]/g,'');
 if(v.dualMajority&&!v.passed&&v.yes>v.no)return '賛成'+v.yes+'、反対'+v.no+'。それでも「'+short+'」は通らなかった｜'+m.ja+'・第'+turn+'週';
 if(v.passed&&v.no>0)return '「'+short+'」が'+v.yes+'対'+v.no+'で可決｜'+m.ja+'・第'+turn+'週';
 if(v.passed)return '「'+short+'」が可決。賛成'+v.yes+'、棄権'+v.abstain+'｜'+m.ja+'・第'+turn+'週';
 return '「'+short+'」は否決。賛成'+v.yes+'、反対'+v.no+'｜'+m.ja+'・第'+turn+'週';
}
function outcomeText(v){
 if(v.dualMajority&&!v.passed&&v.yes>v.no){
  const pass=Object.entries(v.settlementResults||{}).filter(([,x])=>x.pass).map(([k])=>k).length;
  const total=Object.keys(v.settlementResults||{}).length;
  return '評議員全体では賛成が上回りましたが、集落単位で支持を得たのは'+pass+'/'+total+'。必要な地域多数を取れず、議案は否決されました。';
 }
 return v.passed?'投票は賛成'+v.yes+'、反対'+v.no+'、棄権'+v.abstain+'。議案は可決されました。':'投票は賛成'+v.yes+'、反対'+v.no+'、棄権'+v.abstain+'。議案は否決されました。';
}
function countryArticle(cand){
 const country=cand.country,m=META[country],v=cand.vote,data=loadPeople(country);
 const byUtility=v.votes.slice().sort((a,b)=>a.utility-b.utility);
 const sponsorVote=v.votes.find(x=>x.citizenId===v.sponsorId);
 const strongestNo=byUtility.find(x=>x.vote==='no')||null;
 const strongestYes=[...byUtility].reverse().find(x=>x.vote==='yes')||null;
 const abstain=byUtility.find(x=>x.vote==='abstain')||null;
 const sponsor=person(country,v.sponsorId,sponsorVote,data);
 const noP=strongestNo?person(country,strongestNo.citizenId,strongestNo,data):null;
 const yesP=strongestYes?person(country,strongestYes.citizenId,strongestYes,data):null;
 const abP=abstain?person(country,abstain.citizenId,abstain,data):null;
 const before=prev.countries[country].meanFoodReserveDays,after=state.countries[country].meanFoodReserveDays;
 const delta=Number((after-before).toFixed(2));
 const title=titleFor(cand);
 const settlementName=id=>state.countries[country].settlementStates[id]?.name||id;
 const p=[];
 p.push('# '+title,'',m.ja+'の第'+turn+'週。'+weatherJa(country),'','この週、評議会で最も意見が割れたのは、**「'+v.title+'」**という議案でした。','',outcomeText(v));
 if(sponsor){
  p.push('','## 提案したのは、'+sponsor.age+'歳の'+sponsor.occupation,'','提案者は'+settlementName(sponsor.settlementId)+'の'+sponsor.name+'。'+sponsor.age+'歳、'+sponsor.occupation+'です。');
  if(sponsor.household.members)p.push('',sponsor.household.members+'人世帯で、食料備蓄はおよそ'+Math.round(sponsor.household.foodDays)+'日分。'+(sponsor.household.debtUnits>0?'世帯には'+Math.round(sponsor.household.debtUnits)+'単位の負債があります。':'大きな世帯負債はありません。'));
  if(sponsor.vote)p.push('','本人は'+(sponsor.vote==='yes'?'賛成':sponsor.vote==='no'?'反対':'棄権')+'しました。判断を分解すると、特に大きかったのは「'+factorPhrase(sponsor.mainPositive||sponsor.mainNegative)+'」でした。');
 }
 if(noP){
  p.push('','## 反対側にも、生活上の理由がある','','最も強く反対したのは、'+settlementName(noP.settlementId)+'の'+noP.name+'。'+noP.age+'歳の'+noP.occupation+'です。','','この判断で大きかったのは、**'+factorPhrase(noP.mainNegative)+'**。賛成側から見れば必要な政策でも、負担を引き受ける場所や仕事から見ると同じ意味にはなりません。');
 }else if(abP){
  p.push('','## 棄権した人は、利益と負担の間にいた','',settlementName(abP.settlementId)+'の'+abP.name+'は棄権しました。'+abP.age+'歳の'+abP.occupation+'です。','','本人の価値観だけなら議案を支持する材料があっても、'+factorPhrase(abP.mainNegative)+'が判断を鈍らせました。');
 }else if(yesP&&yesP.id!==sponsor?.id){
  p.push('','## 強く賛成した住民','',settlementName(yesP.settlementId)+'の'+yesP.name+'は、'+factorPhrase(yesP.mainPositive)+'を重く見て賛成しました。');
 }
 if(v.dualMajority&&!v.passed){
  p.push('','## 多数決だけでは決まらない','','この制度では、川や土地のように地域ごとの影響が大きい案件は、評議員全体の多数だけでなく集落側の支持も必要です。今回は「賛成者の方が多いのに否決」という結果になりました。');
 }
 p.push('','## 国全体では、食料備蓄が'+(delta>=0?'増えた':'減った')+'','','平均食料備蓄は'+before+'日分から'+after+'日分へ'+(delta>=0?'増加':'減少')+'しました。変化は'+Math.abs(delta)+'日分です。');
 if(cand.births.length||cand.deaths.length)p.push('','この週の人口変化は、出生'+cand.births.length+'人、死亡'+cand.deaths.length+'人でした。死亡や出生は数字だけで終わらず、世帯構成と近しい人の状態に次週以降も残ります。');
 if(cand.inst)p.push('','また、この週は制度上の任期・欠員処理による役職交代も起きています。次の判断は、同じ顔ぶれとは限りません。');
 p.push('','次の7日間で同じ問題が再び議題になるとは限りません。政策には再提案までの間隔があり、別の問題の緊急度が上がれば、そちらが先に扱われます。','','※架空世界LYRA-001のシミュレーション記録です。国家・人物・統計・出来事はすべて架空です。');
 return{title:title,body:p.join('\n')};
}
function observerContactArticle(newPairs){
 const pairs=newPairs.map(x=>x.join('と')).join('、');
 const title='初めて「別の文明」が観測条件に入った｜世界観測記録・第'+turn+'週';
 const lines=[
  '# '+title,'','第'+turn+'週、LYRA-001で初めて国家間の接触条件が成立しました。','',
  '対象は **'+pairs+'** です。','',
  'ここまで、3国は互いの存在を知らないまま生活圏と探索範囲を広げてきました。今回の判定も「物語上そろそろ会わせる」という理由ではありません。','',
  '実際の地理上の距離に対して、双方の探索・観測可能範囲が条件を満たしたためです。','',
  'ただし、接触条件が成立したことと、友好的な外交が始まることは別です。','',
  '最初に見つかるのが人なのか、船なのか、道具なのか、信号なのか。相手を何だと理解するのか。誰がその情報を信じるのか。','',
  'ここからは、接触した側の住民が実際に得た情報だけを各国の記事へ反映します。','',
  '※架空世界LYRA-001のシミュレーション記録です。国家・人物・統計・出来事はすべて架空です。'
 ];
 return{perspective:'observer',country:null,title:title,body:lines.join('\n'),score:100,coverLabel:'世界観測記録',coverCopy:'初めて、別の文明が観測範囲に入った。',accent:'#121820'};
}

function observerStageArticle(changes){
 const names={ARCUS:'アルカ',MIREA:'ミレア',VALD:'ヴァルド'};
 const ch=changes[0];
 const pair=ch.pair.map(x=>names[x]||x).join('と');
 const direct=ch.toStage==='direct_contact';
 const title=direct
  ? pair+'が、初めて直接接触できる距離まで来た｜世界観測記録・第'+turn+'週'
  : pair+'の間に、継続往来できるルートが成立した｜世界観測記録・第'+turn+'週';
 const body=[
  '# '+title,'',
  '第'+turn+'週、LYRA-001の国家間接触が次の段階へ進みました。','',
  '**'+pair+'：'+ch.fromStage+' → '+ch.toStage+'**','',
  'これは話数に合わせて起こしたイベントではありません。両国が実際に積み上げた探索範囲と地理上の距離から、接触可能性が一段階上がったためです。','',
  direct
   ? 'これまで相手の存在を確認できても、継続して人が会える状態ではありませんでした。今回からは、実際の住民同士が直接接触する状態として記録されます。'
   : '単発の出会いではなく、同じ経路を繰り返し使える段階です。ここからは小規模な物資交換や、誤解・信頼の蓄積も双方の状態へ残ります。','',
  '最初の接触代表者も、国を象徴する架空の人格ではなく、その時点で探索・交易・観測に向いていた実在住民から選ばれています。','',
  '今後、接触が友好へ向かうか、警戒や摩擦が増えるかは固定していません。相互信頼、接触回数、物資状況とその週の出来事で変わります。','',
  '※架空世界LYRA-001のシミュレーション記録です。国家・人物・統計・出来事はすべて架空です。'
 ].join('\n');
 return{perspective:'observer',country:null,title,body,score:99,coverLabel:'世界観測記録',coverCopy:direct?'初めて、住民同士が直接出会う。':'単発の接触が、往来できる道になった。',accent:'#121820'};
}

function foodBand(v){
 if(v<=0)return 4;
 if(v<7)return 3;
 if(v<14)return 2;
 if(v<28)return 1;
 return 0;
}
function fuelBand(v){
 if(v<=0)return 4;
 if(v<14)return 3;
 if(v<28)return 2;
 if(v<45)return 1;
 return 0;
}
function materialCandidate(country){
 const beforeFood=prev.countries[country].meanFoodReserveDays;
 const afterFood=state.countries[country].meanFoodReserveDays;
 const beforeFuel=prev.countries[country].meanFuelReserveDays;
 const afterFuel=state.countries[country].meanFuelReserveDays;
 const fb0=foodBand(beforeFood),fb1=foodBand(afterFood),fu0=fuelBand(beforeFuel),fu1=fuelBand(afterFuel);
 const options=[];
 if(fb1>fb0)options.push({country,kind:'food_scarcity',direction:'worse',before:beforeFood,after:afterFood,band:fb1,score:82+fb1*3});
 if(fb0>=2&&fb1<fb0)options.push({country,kind:'food_scarcity',direction:'recovery',before:beforeFood,after:afterFood,band:fb0,score:72+fb0*2});
 if(fu1>fu0)options.push({country,kind:'fuel_scarcity',direction:'worse',before:beforeFuel,after:afterFuel,band:fu1,score:80+fu1*3});
 if(fu0>=2&&fu1<fu0)options.push({country,kind:'fuel_scarcity',direction:'recovery',before:beforeFuel,after:afterFuel,band:fu0,score:70+fu0*2});
 return options.sort((a,b)=>b.score-a.score)[0]||null;
}
function materialArticle(cand){
 const m=META[cand.country];
 const food=cand.kind==='food_scarcity';
 const balance=(events.events||[]).find(e=>e.country===cand.country&&e.type===(food?'food_balance':'fuel_balance'))||{};
 const scarcity=(events.events||[]).find(e=>e.country===cand.country&&e.type==='food_scarcity')||null;
 const n=x=>Number(x).toFixed(2).replace(/\.00$/,'');
 let title;
 if(cand.direction==='recovery'){
  title=(food?'食料':'燃料')+'備蓄が危機ラインを戻した｜'+m.ja+'・第'+turn+'週';
 }else if(cand.after<=0){
  title=m.ja+'の'+(food?'食料':'燃料')+'備蓄が0日になった｜第'+turn+'週';
 }else{
  title=m.ja+'の'+(food?'食料':'燃料')+'備蓄が'+n(cand.after)+'日分まで落ちた｜第'+turn+'週';
 }
 const lines=['# '+title,'',
  m.ja+'の第'+turn+'週、'+(food?'食料':'燃料')+'備蓄が **'+n(cand.before)+'日分 → '+n(cand.after)+'日分** に変化しました。',''];
 if(food){
  if((balance.rationMultiplier??1)<1){
   lines.push('備蓄が減ったため、この週は通常量をそのまま消費せず、配給・節約に相当する消費抑制が入りました。消費係数は'+balance.rationMultiplier+'です。','');
  }
  if(scarcity){
   lines.push('この不足は数字だけではありません。国全体のストレスと健康へ影響し、備蓄が深刻になるほど受胎率と死亡率にも影響する状態です。','');
  }
  lines.push('このシミュレーションでは、食料0日を「計算エラー」にして世界を止めません。もし0日まで落ちれば、配給だけでなく健康悪化や食料不足に伴う死亡が住民・世帯の状態へ残ります。');
 }else{
  if((balance.collectionDaysPerPerson??0)>0){
   lines.push('不足に対して、住民は燃料集めへ追加の労働を回しています。1人あたりの追加採取相当は'+balance.collectionDaysPerPerson+'日分で、そのぶん食料生産の機会費用と資源消費も発生します。','');
  }
  if((balance.conservationMultiplier??1)<1){
   lines.push('同時に暖房・燃料使用も抑えています。消費係数は'+balance.conservationMultiplier+'で、節約が強いほど健康・ストレスへの負担も大きくなります。','');
  }
  lines.push('燃料も0日をシステム停止条件にはしていません。欠乏そのものを社会状態として扱い、その後の判断と健康へつなげます。');
 }
 lines.push('','危機が次週すぐ解消するかは決まっていません。季節、資源量、住民の仕事、議会の判断によって続くことも回復することもあります。','',
  '※架空世界LYRA-001のシミュレーション記録です。国家・人物・統計・出来事はすべて架空です。');
 return{
  perspective:cand.country,country:cand.country,title,body:lines.join('\n'),score:cand.score,
  storyKind:cand.kind,
  coverLabel:m.series+' / 第'+turn+'週',
  coverCopy:food?'食料備蓄 '+n(cand.before)+'日 → '+n(cand.after)+'日':'燃料備蓄 '+n(cand.before)+'日 → '+n(cand.after)+'日',
  accent:m.accent
 };
}

const previousPairs=new Set((prev.contact?.knownPairs||[]).map(x=>[...x].sort().join('|')));
const newPairs=(state.contact?.knownPairs||[]).filter(x=>!previousPairs.has([...x].sort().join('|')));
const stageChanges=[];
for(const [key,ps] of Object.entries(state.contact?.pairStates||{})){
 const old=prev.contact?.pairStates?.[key];
 if(old&&old.stage!==ps.stage)stageChanges.push({key,pair:ps.pair,fromStage:old.stage,toStage:ps.stage,representativeIds:ps.representativeIds,trustIndex:ps.trustIndex});
}
const stories=[];
if(newPairs.length)stories.push({...observerContactArticle(newPairs),storyKind:'first_contact'});
else if(stageChanges.length)stories.push({...observerStageArticle(stageChanges),storyKind:'contact_stage'});

const materialCandidates=['ARCUS','MIREA','VALD'].map(materialCandidate).filter(Boolean).sort((a,b)=>b.score-a.score);
for(const mc of materialCandidates){
 if(stories.length>=2)break;
 stories.push(materialArticle(mc));
}

const candidates=['ARCUS','MIREA','VALD'].map(country=>countryCandidate(country)).filter(Boolean).filter(x=>x.score>=8).sort((a,b)=>b.score-a.score);
for(const cand of candidates){
 if(stories.length>=2)break;
 if(stories.some(x=>x.country===cand.country&&x.storyKind&&x.storyKind.includes('scarcity')))continue;
 const art=countryArticle(cand),m=META[cand.country];
 stories.push({
  perspective:cand.country,country:cand.country,title:art.title,body:art.body,score:cand.score,
  coverLabel:m.series+' / 第'+turn+'週',
  coverCopy:cand.vote.passed?'決まったことと、反対した人。':'多数でも、通らないことがある。',
  accent:m.accent,policyId:cand.vote.policyId,storyKind:'policy'
 });
}

const outDir=base+'editorial/generated/turn_'+pad(turn);
const manifest={version:2,turn:turn,dryRun:dry,generatedAt:'deterministic',newContactPairs:newPairs,contactStageChanges:stageChanges,stories:[]};
for(let i=0;i<stories.length;i++){
 const st=stories[i],slug=st.perspective==='observer'?'observer':st.country.toLowerCase();
 const id='worldsim_t'+pad(turn)+'_'+slug+(st.policyId?'_'+st.policyId.toLowerCase():'_'+(st.storyKind||'event'));
 const bodyPath=outDir+'/'+String(i+1).padStart(2,'0')+'_'+id+'.md';
 writeText(bodyPath,st.body);
 manifest.stories.push({id:id,title:st.title,perspective:st.perspective,country:st.country,score:st.score,bodyPath:bodyPath,policyId:st.policyId||null,storyKind:st.storyKind||null});
}
write(outDir+'/manifest.json',manifest);

if(!dry&&turn>=2&&stories.length){
 const q=read(queuePath),existing=new Map((q.entries||[]).map(x=>[x.id,x]));
 const launchCompleted=rebuild.status==='completed'&&rebuild.launchVerified===true;
 for(let i=0;i<stories.length;i++){
  const st=stories[i],m=st.country?META[st.country]:null;
  const slug=st.perspective==='observer'?'observer':st.country.toLowerCase();
  const id='worldsim_t'+pad(turn)+'_'+slug+(st.policyId?'_'+st.policyId.toLowerCase():'_'+(st.storyKind||'event'));
  const bodyPath=manifest.stories[i].bodyPath;
  const entry={
   id:id,turn:turn,perspective:st.perspective,title:st.title,bodyPath:bodyPath,
   tags:['AI世界観測所','シミュレーション'].concat(m?[m.tag]:['世界観測記録']),
   coverLabel:st.coverLabel,coverCopy:st.coverCopy,accent:st.accent,
   enabled:launchCompleted,publicUrlVerified:false,order:1000+turn*10+i,
   generatedBy:'generate_turn_posts_v1',editorialScore:st.score,storyKind:st.storyKind||null
  };
  const old=existing.get(id);
  if(old?.publicUrlVerified){
   entry.enabled=false;entry.publicUrlVerified=true;entry.publicUrl=old.publicUrl;entry.verifiedAt=old.verifiedAt;
  }
  existing.set(id,Object.assign({},old||{},entry));
 }
 q.entries=[...existing.values()].sort((a,b)=>(a.order||999999)-(b.order||999999));
 q.updatedAt='turn-'+turn;
 if(launchCompleted){q.status='operational';q.holdReason=null;}
 write(queuePath,q);
}
console.log(JSON.stringify(manifest,null,2));
