import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd(),P=(...x)=>path.join(ROOT,...x);
const read=p=>JSON.parse(fs.readFileSync(P(p),'utf8'));
const writeText=(p,s)=>{const f=P(p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s.trim()+'\n');};
const write=(p,o)=>{const f=P(p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(o,null,2)+'\n');};

const base='sidehustle-autopublish/note/worldsim/';
const brief=read(base+'editorial/launch_brief_compact.json');
const s0=read(base+'state/turn_0000/world_state.json');
const s1=read(base+'state/turn_0001/world_state.json');
const queuePath=base+'publication_queue.json';
const queue=read(queuePath);

const META={
 ARCUS:{ja:'アルカ',id:'worldsim_launch_arca',file:'01_arca_turn1.md',accent:'#15334A',series:'アルカ通信',tag:'アルカ'},
 MIREA:{ja:'ミレア',id:'worldsim_launch_mirea',file:'02_mirea_turn1.md',accent:'#284738',series:'ミレア通信',tag:'ミレア'},
 VALD:{ja:'ヴァルド',id:'worldsim_launch_vald',file:'03_vald_turn1.md',accent:'#333A46',series:'ヴァルド通信',tag:'ヴァルド'}
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
 values:'本人の価値観',
 sectorBenefit:'自分の仕事に直接ある利益',
 sectorCost:'自分の仕事が負うコスト',
 affectedLocality:'自分の暮らす地域への直接影響',
 localCost:'地域が負担するコスト',
 opportunityCost:'ほかに回せた資源や労力を失うこと',
 sponsorOwnership:'自分自身が提案者であること',
 rumorSignal:'その問題について持っていた未確定情報',
 sponsorRelationship:'提案者への信頼関係',
 stressSecurity:'生活上の不安から安全を優先したこと'
};
const factorPhrase=k=>FACTOR[k]||'複数の生活条件';
const shortTitle=s=>String(s||'').replace(/[。]/g,'').trim();
const settlementName=(country,id)=>s1.countries[country].settlementStates[id]?.name||s0.countries[country].settlementStates[id]?.name||id;

function titleFor(country,c){
 const m=META[country],v=c.selectedEvent,short=shortTitle(v.title);
 if(v.dualMajority&&!v.passed&&v.yes>v.no)return '賛成'+v.yes+'、反対'+v.no+'。それでも「'+short+'」は通らなかった｜'+m.ja+'、最初の7日';
 if(v.passed&&v.no>0)return '「'+short+'」が'+v.yes+'対'+v.no+'で可決｜'+m.ja+'、最初の7日';
 if(v.passed)return '「'+short+'」が可決。賛成'+v.yes+'、棄権'+v.abstain+'｜'+m.ja+'、最初の7日';
 return '「'+short+'」は否決。賛成'+v.yes+'、反対'+v.no+'｜'+m.ja+'、最初の7日';
}
function voteJa(x){return x==='yes'?'賛成':x==='no'?'反対':'棄権';}
function personParagraph(country,p,label){
 if(!p)return[];
 const pos=p.vote?.strongestPositive?.[0]?.[0]||null;
 const neg=p.vote?.strongestNegative?.[0]?.[0]||null;
 const key=p.vote?.choice==='no'?(neg||pos):(pos||neg);
 const debt=p.household?.debtUnits||0,food=Math.round(p.household?.foodDays||0);
 return[
  '',
  '## '+label,
  '',
  settlementName(country,p.settlementId)+'の'+p.name+'。'+p.age+'歳、'+(OCC[p.occupation]||p.occupation)+'です。',
  '',
  (p.household?.members||'?')+'人世帯で、食料備蓄はおよそ'+food+'日分。'+(debt>0?'世帯には約'+Math.round(debt)+'単位の負債があります。':'大きな世帯負債はありません。'),
  '',
  'この議案では**'+voteJa(p.vote?.choice)+'**。判断を分解すると、特に大きかったのは「'+factorPhrase(key)+'」でした。'
 ];
}
function resultParagraph(v){
 if(v.dualMajority&&!v.passed&&v.yes>v.no){
  const rows=Object.values(v.settlementResults||{}),support=rows.filter(x=>x.pass).length;
  return '評議員全体では賛成が上回りました。それでも、集落単位で支持を得たのは'+support+'/'+rows.length+'。制度上必要な地域多数を取れず、議案は否決されました。';
 }
 return '投票は賛成'+v.yes+'、反対'+v.no+'、棄権'+v.abstain+'。議案は'+(v.passed?'可決':'否決')+'されました。';
}
function weatherJa(country,w){
 if(country==='ARCUS'){
  if(w.coastalWindIndex>=72)return '沿岸は荒れ気味の一週間でした。';
  if(w.coastalWindIndex>=58)return '沿岸では風の強い時間がありました。';
  return '沿岸は大きく荒れず、通常の仕事ができる一週間でした。';
 }
 if(country==='MIREA'){
  if(w.riverPressureIndex>=78)return '川の水圧がかなり高い一週間でした。';
  if(w.riverPressureIndex>=60)return '上流の雨で、川はやや高い水圧になりました。';
  return '川は大きく増水せずに推移しました。';
 }
 if(w.coldPressureIndex>=70)return '高地では強い冷え込みが続きました。';
 if(w.snowRiskIndex>=45)return '高地は冷え、雪の可能性が無視できない一週間でした。';
 return '高地は冷えましたが、本格的な冬にはまだ入っていません。';
}
function article(country,c){
 const m=META[country],v=c.selectedEvent,title=titleFor(country,c);
 const lines=[
  '# '+title,'',
  m.ja+'の最初の7日間が終わりました。世界内の時刻は **'+brief.world.calendarBefore.worldDateLabel+' → '+brief.world.calendarAfter.worldDateLabel+'**。季節は夏の終わりから秋の入り口へ進みました。','',
  weatherJa(country,c.weather),'',
  'この週、評議会で最も意見が割れたのは、**「'+v.title+'」**という議案でした。','',
  resultParagraph(v)
 ];
 lines.push(...personParagraph(country,c.people.sponsor,'提案した人'));
 const no=c.people.strongestNo;
 const yes=c.people.strongestYes;
 const abst=c.people.abstainer;
 if(no&&no.citizenId!==c.people.sponsor?.citizenId) lines.push(...personParagraph(country,no,'強く反対した人'));
 else if(abst&&abst.citizenId!==c.people.sponsor?.citizenId) lines.push(...personParagraph(country,abst,'利益と負担の間で棄権した人'));
 else if(yes&&yes.citizenId!==c.people.sponsor?.citizenId) lines.push(...personParagraph(country,yes,'強く賛成した人'));

 if(v.dualMajority&&!v.passed){
  lines.push('','## 多数決だけでは決まらない','',
   'この制度では、地域ごとの影響が大きい案件は評議員全体の多数だけでは決まりません。今回は「賛成者の方が多いのに否決」という結果になりました。');
 }
 const before=c.foodReserveDaysBefore,after=c.foodReserveDaysAfter,delta=Number((after-before).toFixed(2));
 lines.push('','## 7日後の国全体','',
  '平均食料備蓄は'+before+'日分から'+after+'日分へ'+(delta>=0?'増え':'減り')+'ました。変化は'+Math.abs(delta)+'日分です。');
 const d=c.demography||{};
 lines.push('',
  'この週の人口動態は、出生'+(d.births?.length||0)+'人、死亡'+(d.deaths?.length||0)+'人、新たな受胎'+(d.conceptions?.length||0)+'件。妊娠はその週に突然「出生」へ変換せず、世界内の日付を持って次の週へ持ち越されます。');
 if(c.populationAfter!==c.populationBefore){
  lines.push('','人口は'+c.populationBefore+'人から'+c.populationAfter+'人になりました。');
 }
 const other=c.allTurnPolicies.filter(x=>x.policyId!==v.policyId);
 if(other.length){
  lines.push('','同じ週には「'+other[0].title+'」も審議され、'+(other[0].passed?'可決':'否決')+'されています。');
 }
 lines.push('',
  '次の7日間に同じ議案が自動で繰り返されるわけではありません。政策には再提案までの間隔があり、天候、備蓄、住民の状態、制度の顔ぶれが変われば、次に優先される問題も変わります。','',
  '※架空世界LYRA-001のシミュレーション記録です。国家・人物・統計・出来事はすべて架空です。');
 return{title,body:lines.join('\n')};
}

const output={version:3,turn:1,worldCalendar:{before:brief.world.calendarBefore,after:brief.world.calendarAfter},articles:{}};
for(const country of ['ARCUS','MIREA','VALD']){
 const a=article(country,brief.countries[country]),m=META[country];
 const bodyPath=base+'launch_v2/'+m.file;
 writeText(bodyPath,a.body);
 output.articles[country]={id:m.id,title:a.title,bodyPath};
 const q=queue.entries.find(x=>x.id===m.id);
 if(!q)throw new Error('missing launch queue '+m.id);
 if(q.publicUrlVerified)throw new Error('refusing to rewrite already-public launch article '+m.id);
 q.title=a.title;
 q.bodyPath=bodyPath;
 q.coverLabel=m.series+' / 第1週';
 q.coverCopy=brief.countries[country].selectedEvent.passed
   ? brief.countries[country].selectedEvent.yes+'対'+brief.countries[country].selectedEvent.no+'／'+shortTitle(brief.countries[country].selectedEvent.title)
   : '否決／'+shortTitle(brief.countries[country].selectedEvent.title);
 q.accent=m.accent;
 q.tags=['AI世界観測所','シミュレーション',m.tag];
 q.enabled=false;
 q.publicUrlVerified=false;
}
queue.updatedAt='prelaunch-turn1-finalized';
queue.status='final_turn1_article_hold';
queue.holdReason='Final Turn 1 articles regenerated from canonical facts; release remains locked until final QA evidence is recorded.';
write(queuePath,queue);
write(base+'editorial/launch_articles_manifest_v3.json',output);
console.log(JSON.stringify(output,null,2));
