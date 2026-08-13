(()=>{
 document.documentElement.classList.add('js');
 const path=location.pathname;
 if(/(?:^|\/)index\.html$/.test(path)||path.endsWith('/noto-rebloom/')||path.endsWith('/')){
  const legacy={'#partner-pack':'partner.html','#partners':'partner.html','#sponsor':'partner.html','#event':'event.html','#mud-sports':'event.html','#renge-cup':'event.html#renge-cup','#flower-diagnosis':'diagnosis.html','#diagnosis':'diagnosis.html','#data':'learn.html#numbers','#abandoned-farmland':'learn.html','#noto-data':'learn.html#noto'};
  if(legacy[location.hash]) location.replace(legacy[location.hash]);
 }
 const body=document.body,menu=document.querySelector('.menu-button'),nav=document.querySelector('.site-nav');
 const currentFile=(location.pathname.split('/').pop()||'index.html').toLowerCase();
 nav?.querySelectorAll('a[href]').forEach(link=>{
   const href=(link.getAttribute('href')||'').split('#')[0].toLowerCase();
   if(href===currentFile||(currentFile===''&&href==='index.html')) link.setAttribute('aria-current','page');
 });
 menu?.addEventListener('click',()=>{const open=body.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));});
 addEventListener('keydown',event=>{if(event.key==='Escape'&&body.classList.contains('menu-open')){body.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false');menu?.focus();}});
 nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{body.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false');}));
 const progress=document.querySelector('.scroll-progress span'),back=document.querySelector('.back-top'),dock=document.querySelector('.mobile-dock');
 const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;const pct=max>0?scrollY/max*100:0;if(progress)progress.style.width=pct+'%';back?.classList.toggle('is-visible',scrollY>700);dock?.classList.toggle('is-visible',scrollY>520)};
 addEventListener('scroll',update,{passive:true});update();back?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const reveals=document.querySelectorAll('.reveal');
 if(!reduced&&'IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.1});reveals.forEach(el=>io.observe(el));}else reveals.forEach(el=>el.classList.add('is-visible'));
 document.querySelectorAll('.quiz-choice').forEach(btn=>btn.addEventListener('click',()=>{const shell=btn.closest('.quiz-shell'),fb=shell?.querySelector('.quiz-feedback');shell?.querySelectorAll('.quiz-choice').forEach(b=>b.disabled=true);const ok=btn.dataset.correct==='true';btn.classList.add(ok?'correct':'wrong');const correct=shell?.querySelector('[data-correct="true"]');if(!ok)correct?.classList.add('correct');if(fb)fb.textContent=(ok?'正解です。':'もう一歩。')+(btn.dataset.explain||correct?.dataset.explain||'')}));
 const printPartner=document.querySelector('[data-print-partner]');
 printPartner?.addEventListener('click',()=>window.print());
 document.querySelectorAll('[data-learning-quiz]').forEach(quiz=>{
   const questions=[...quiz.querySelectorAll('[data-question]')];
   const next=quiz.querySelector('[data-quiz-next]');
   const resultBox=quiz.querySelector('[data-quiz-result]');
   const scoreEl=quiz.querySelector('[data-quiz-score]');
   const messageEl=quiz.querySelector('[data-quiz-message]');
   const retry=quiz.querySelector('[data-quiz-retry]');
   const progress=quiz.querySelector('[data-quiz-progress]');
   const progressFill=quiz.querySelector('[data-quiz-fill]');
   let current=0,score=0,answered=false;
   const messages=['土地を見る視点は、これから育てられます。解説をもう一度読んでみましょう。','大切な入口をつかめています。現地では、数字と人の話の両方を確かめてみてください。','土地の背景をかなり丁寧に捉えられています。誰かに一つ説明できたら、理解はさらに深まります。','全問正解です。問題を知る力を、参加・共有・協力の一歩へつなげてみてください。'];
   const updateProgress=()=>{if(progress) progress.textContent=`${Math.min(current+1,questions.length)} / ${questions.length}`;if(progressFill) progressFill.style.width=`${Math.round(current/questions.length*100)}%`;};
   const showQuestion=(idx)=>{questions.forEach((q,i)=>q.classList.toggle('is-active',i===idx));resultBox?.classList.remove('is-active');next.hidden=false;next.disabled=true;next.textContent=idx===questions.length-1?'結果を見る':'次の問題へ';current=idx;answered=false;updateProgress();};
   questions.forEach(q=>{q.querySelectorAll('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;answered=true;const ok=btn.dataset.answer==='true';if(ok)score++;q.querySelectorAll('[data-answer]').forEach(item=>{item.disabled=true;if(item.dataset.answer==='true')item.classList.add('is-correct');});if(!ok)btn.classList.add('is-wrong');const feedback=q.querySelector('[data-feedback]');if(feedback){feedback.textContent=ok?feedback.dataset.correctText:feedback.dataset.wrongText;feedback.classList.add('is-visible',ok?'is-correct':'is-wrong');}next.disabled=false;}));});
   next?.addEventListener('click',()=>{if(!answered)return;if(current<questions.length-1){showQuestion(current+1);return;}questions.forEach(q=>q.classList.remove('is-active'));next.hidden=true;resultBox?.classList.add('is-active');if(scoreEl)scoreEl.textContent=`4問中 ${score}問 正解`;if(messageEl)messageEl.textContent=messages[Math.max(0,Math.min(messages.length-1,score-1))];if(progress)progress.textContent='4 / 4';if(progressFill)progressFill.style.width='100%';});
   retry?.addEventListener('click',()=>{score=0;questions.forEach(q=>{q.querySelectorAll('[data-answer]').forEach(btn=>{btn.disabled=false;btn.classList.remove('is-correct','is-wrong');});const feedback=q.querySelector('[data-feedback]');if(feedback){feedback.textContent='';feedback.className='learning-feedback';}});showQuestion(0);});
   if(questions.length)showQuestion(0);
 });
 const actionBtn=document.querySelector('[data-action-spinner]'),actionOut=document.querySelector('[data-action-output]');const actions=['家族や友人に、NOTO Re:Bloomを1人だけ紹介する。','READYFORで支援の使いみちを確認する。','身近な空き地や農地の変化に目を向ける。','花タイプ診断で、自分に合う関わり方を見つける。','企業・団体でできる協力を一つ考える。','9月20日の泥ん子運動会の参加方法を確認する。'];actionBtn?.addEventListener('click',()=>{if(actionOut)actionOut.textContent=actions[Math.floor(Math.random()*actions.length)]});
 const bloomBtn=document.querySelector('[data-bloom-button]'),garden=document.querySelector('.bloom-garden'),flowers=['🌱','🌸','🌼','🪻','☘️','🌷'];let count=0;bloomBtn?.addEventListener('click',()=>{if(!garden)return;const f=document.createElement('span');f.className='bloom-flower';f.textContent=flowers[count%flowers.length];f.style.left=(4+Math.random()*92)+'%';f.style.fontSize=(30+Math.random()*28)+'px';garden.appendChild(f);count++;bloomBtn.textContent=count<8?'もう一輪、咲かせる':'花がいっぱい！';if(garden.children.length>14)garden.firstElementChild.remove()});

 // 2026-08-13 latest project information patch
 const STUDENT_FORM='https://forms.gle/jdSpe6Pb3pyFf7QU6';
 const PARTICIPANT_FORM='https://forms.gle/6ZMrhrhtWmBCQViD8';
 const SPONSOR_FORM='https://forms.gle/cRdr2oa2pxBhrFE3A';
 const READYFOR='https://readyfor.jp/projects/kousakuhoukiti-saisei';
 const ERNEST='https://earnest-technologies.co.jp/about/';
 const HAMONZ='https://hamonz.co.jp/';
 const ISHIKAWA_ZUKAN='https://partner.chiiki-zukan.com/ishikawa/';
 const KANAZAWA_PORT='https://www.kanazawa-port.jp/';
 const textReplacements=[
  ['会場候補を確認中','会場確定・使用許可済み'],
  ['珠洲市内で実施予定','珠洲市・洲巻地区で開催'],
  ['珠洲市内で午後開催予定','珠洲市・洲巻地区で午後開催'],
  ['上黒丸地区の元レンコン田。許可・安全条件は未確定','洲巻地区の田んぼ（約20m×50m・約1,000㎡）。土地使用許可取得済み'],
  ['学生企画メンバーを8月8日まで募集。','学生企画メンバーを随時募集しています。'],
  ['8月8日まで・学生募集','学生企画メンバー募集'],
  ['会場候補となる土地の一つ','能登で確認してきた農地の様子'],
  ['活動候補となる土地の一つ','能登で確認してきた農地の様子']
 ];
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 const textNodes=[];while(walker.nextNode())textNodes.push(walker.currentNode);
 textNodes.forEach(node=>{let value=node.nodeValue||'';textReplacements.forEach(([from,to])=>{if(value.includes(from))value=value.split(from).join(to);});node.nodeValue=value;});
 document.querySelectorAll(`a[href*="jdSpe6Pb3pyFf7QU6"]`).forEach(a=>{a.href=STUDENT_FORM;if(/8月8日|学生|企画|募集/.test(a.textContent))a.textContent='学生企画メンバー募集';});
 document.querySelectorAll(`a[href="${SPONSOR_FORM}"]`).forEach(a=>{if(/協賛|連携/.test(a.textContent))a.textContent='8月21日まで・協賛／連携相談';});
 document.querySelectorAll(`a[href="${READYFOR}"]`).forEach(a=>a.setAttribute('aria-label','READYFORでNOTO Re:Bloomを支援する'));

 const style=document.createElement('style');
 style.textContent=`
 .latest-info{margin:28px auto 0;padding:22px;border:1px solid rgba(21,72,59,.16);border-radius:22px;background:#fff;box-shadow:0 10px 30px rgba(21,72,59,.08)}
 .latest-info h2,.latest-info h3{margin:0 0 10px}.latest-info p{margin:0 0 10px;line-height:1.9}.latest-info strong{color:#15483b}.latest-info .latest-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:16px}.latest-info .latest-kpis>div{padding:16px;border-radius:16px;background:#f2f7f4}.latest-info .latest-kpis b{display:block;font-size:1.25rem}.latest-info .latest-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
 .hero-sponsor{display:inline-flex;align-items:center;gap:10px;margin:14px 0 4px;padding:9px 13px;border:1px solid rgba(91,55,126,.22);border-radius:999px;background:rgba(255,255,255,.86);font-size:.82rem;line-height:1.25;box-shadow:0 6px 16px rgba(62,40,83,.08)}.hero-sponsor small{font-weight:800;letter-spacing:.12em;color:#74538f}.hero-sponsor b{color:#362842}.hero-sponsor:hover{transform:translateY(-1px)}
 .home-sponsor-spotlight{margin:22px auto 0;padding:28px;border-radius:26px;background:linear-gradient(135deg,#33243f 0%,#4c315e 62%,#6a4480 100%);color:#fff;box-shadow:0 16px 36px rgba(55,34,71,.18)}.home-sponsor-spotlight .sponsor-label{font-size:.74rem;font-weight:900;letter-spacing:.16em;color:#dfcaed}.home-sponsor-spotlight-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(240px,.65fr);gap:26px;align-items:center}.home-sponsor-spotlight h2{margin:8px 0 8px;font-size:clamp(1.55rem,3vw,2.35rem);color:#fff}.home-sponsor-spotlight p{margin:0;line-height:1.85;color:rgba(255,255,255,.9)}.home-sponsor-spotlight .sponsor-brand{font-size:clamp(1.25rem,2.4vw,1.7rem);font-weight:900;margin-bottom:4px}.home-sponsor-spotlight .sponsor-company{font-size:.88rem;color:#d9c9e5}.home-sponsor-spotlight .sponsor-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.home-sponsor-spotlight .sponsor-action{display:inline-flex;align-items:center;justify-content:center;padding:11px 15px;border-radius:999px;background:#fff;color:#3f2a4d;font-weight:800;text-decoration:none}.home-sponsor-spotlight .sponsor-action--ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.45)}.home-sponsor-spotlight .brand-panel{padding:22px;border:1px solid rgba(255,255,255,.2);border-radius:20px;background:rgba(255,255,255,.08)}.home-sponsor-spotlight .brand-panel b{display:block;margin-bottom:8px}.home-sponsor-spotlight .brand-panel span{display:block;font-size:.88rem;line-height:1.7;color:rgba(255,255,255,.8)}.supporting-partners{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.supporting-partners a{display:inline-flex;padding:7px 10px;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);color:#fff;text-decoration:none;font-size:.8rem;font-weight:700}
 .partner-showcase{padding:64px 0;background:#f7f4fb}.partner-showcase .partner-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:28px}.partner-showcase article{background:#fff;border:1px solid rgba(88,60,120,.13);border-radius:22px;padding:24px;box-shadow:0 10px 26px rgba(63,39,86,.07)}.partner-showcase article.featured-sponsor{grid-column:1/-1;border:2px solid rgba(104,63,135,.28);background:linear-gradient(180deg,#fff 0%,#fbf8fd 100%)}.partner-showcase .partner-type{display:inline-block;font-size:.78rem;font-weight:800;letter-spacing:.08em;padding:6px 10px;border-radius:999px;background:#eee6f8;color:#56377c;margin-bottom:12px}.partner-showcase h3{margin:0 0 6px;font-size:1.2rem}.partner-showcase .featured-sponsor h3{font-size:1.55rem}.partner-showcase .service-name{font-weight:900;color:#6e45a1}.partner-showcase .logo-pending{display:flex;align-items:center;justify-content:center;min-height:88px;margin:14px 0;border:1px dashed #baa8ce;border-radius:14px;color:#816d96;background:#fbf9fd;font-size:.88rem}.partner-showcase p{line-height:1.8;margin:0}.partner-showcase .partner-link{display:inline-flex;margin-top:16px;font-weight:800;color:#583878;text-decoration:none}.partner-showcase .partner-link:hover{text-decoration:underline}.report-card{margin-top:28px;padding:24px;border-radius:22px;background:#fff6d9;border:1px solid #ead89f}.report-card b{display:block;font-size:1.25rem;margin-bottom:8px}.deadline-note{font-weight:800;color:#8a3d35}
 .sponsor-value{padding:56px 0;background:#fff}.sponsor-value-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:36px;align-items:start}.sponsor-value h2{margin:8px 0 12px}.sponsor-value p{line-height:1.9}.sponsor-benefits{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.sponsor-benefits article{padding:20px;border-radius:18px;background:#f7f2fa;border:1px solid rgba(95,58,123,.12)}.sponsor-benefits span{display:flex;width:34px;height:34px;align-items:center;justify-content:center;border-radius:50%;background:#684187;color:#fff;font-weight:900;margin-bottom:10px}.sponsor-benefits b{display:block;margin-bottom:5px}.sponsor-benefits p{margin:0;font-size:.9rem;line-height:1.7}.sponsor-value .value-note{margin-top:18px;padding:14px 16px;border-left:4px solid #684187;background:#faf7fc;font-size:.9rem}
 @media(max-width:760px){.latest-info .latest-kpis,.partner-showcase .partner-cards,.home-sponsor-spotlight-grid,.sponsor-value-grid,.sponsor-benefits{grid-template-columns:1fr}.latest-info{margin-top:18px;padding:18px}.partner-showcase{padding:44px 0}.partner-showcase article.featured-sponsor{grid-column:auto}.home-sponsor-spotlight{padding:22px}.hero-sponsor{max-width:100%;flex-wrap:wrap}}
 `;
 document.head.appendChild(style);

 if(body.classList.contains('page-home')){
   const hero=document.querySelector('.hero--home');
   const heroCopy=document.querySelector('.hero--home .hero-copy');
   const dateRibbon=heroCopy?.querySelector('.date-ribbon');
   if(heroCopy&&!heroCopy.querySelector('.hero-sponsor')){
     const badge=document.createElement('a');
     badge.className='hero-sponsor';
     badge.href=ERNEST;
     badge.target='_blank';
     badge.rel='sponsored noopener';
     badge.innerHTML='<small>SUPPORTED BY</small><b>Bukatsu</b><span>｜アーネストテクノロジーズ</span>';
     dateRibbon?.after(badge);
   }
   const info=document.createElement('section');
   info.className='container latest-info';
   info.innerHTML=`<p class="eyebrow"><span>最新情報</span><small>UPDATED 2026.08.13</small></p><h2>9月20日の会場が決まりました。</h2><p>石川県珠洲市<strong>洲巻地区</strong>の、約20m×50m（約1,000㎡）の田んぼをお借りして開催します。土地使用の許可をいただいています。</p><div class="latest-kpis"><div><small>開催日</small><b>2026.9.20</b><span>受付12:30／13:00開始</span></div><div><small>参加費</small><b>無料</b><span>参加上限40人</span></div><div><small>READYFOR支援総額</small><b>180,000円</b><span>8月15日23:00まで</span></div></div><div class="latest-actions"><a class="btn btn--green" href="${PARTICIPANT_FORM}" target="_blank" rel="noopener">泥ん子運動会に参加</a><a class="btn btn--paper" href="${STUDENT_FORM}" target="_blank" rel="noopener">学生企画メンバー募集</a><a class="btn btn--yellow" href="${READYFOR}" target="_blank" rel="noopener">READYFORで支援</a></div>`;
   hero?.after(info);

   const spotlight=document.createElement('section');
   spotlight.className='container home-sponsor-spotlight';
   spotlight.innerHTML=`<div class="home-sponsor-spotlight-grid"><div><span class="sponsor-label">SPONSOR</span><h2>この挑戦を支えてくださっています。</h2><div class="sponsor-brand">Bukatsu</div><div class="sponsor-company">株式会社アーネストテクノロジーズ</div><p>部活動の情報発信、イベント管理、オンライン決済、寄付・クラウドファンディングなどを支える部活動支援サービスです。今回、学生や子どもたちへの支援という思いからNOTO Re:Bloomをご支援いただいています。</p><div class="sponsor-actions"><a class="sponsor-action" href="${ERNEST}" target="_blank" rel="sponsored noopener">Bukatsuを知る ↗</a><a class="sponsor-action sponsor-action--ghost" href="partner.html#current-partners">協賛・協力企業を見る</a></div></div><div class="brand-panel"><b>協力企業・団体</b><span>プロジェクトの企画・地域との接点づくりなどを支えていただいています。</span><div class="supporting-partners"><a href="${HAMONZ}" target="_blank" rel="noopener">HAMONZ ↗</a><a href="${ISHIKAWA_ZUKAN}" target="_blank" rel="noopener">イシカワズカン ↗</a><a href="${KANAZAWA_PORT}" target="_blank" rel="noopener">金沢ポート ↗</a></div><div class="sponsor-actions"><a class="sponsor-action sponsor-action--ghost" href="${SPONSOR_FORM}" target="_blank" rel="noopener">8月21日まで・協賛相談</a></div></div></div>`;
   info.after(spotlight);
 }

 if(body.classList.contains('page-event')){
   const main=document.querySelector('main');
   const venue=document.createElement('section');
   venue.className='section section--tight';
   venue.innerHTML=`<div class="container latest-info"><p class="eyebrow"><span>会場確定</span><small>VENUE CONFIRMED</small></p><h2>珠洲市・洲巻地区の約1,000㎡の田んぼで開催します。</h2><p>約20m×50mの田んぼをお借りし、土地使用の許可をいただいています。参加者への集合場所・アクセスなどの詳細は、必要な案内を整理したうえでお知らせします。</p><div class="latest-kpis"><div><small>受付</small><b>12:30</b></div><div><small>開始</small><b>13:00</b></div><div><small>終了目安</small><b>17:00</b></div></div><div class="latest-actions"><a class="btn btn--green" href="${PARTICIPANT_FORM}" target="_blank" rel="noopener">参加申し込み</a></div><div class="report-card"><b>前日 9月19日｜プロジェクト報告会</b><p>金沢・香林坊で、NOTO Re:Bloomがここまで取り組んできた内容をまとめた報告会を開催予定です。時間・会場などの詳細は決まり次第お知らせします。</p></div></div>`;
   main?.appendChild(venue);
 }

 if(body.classList.contains('page-partner')){
   const hero=document.querySelector('.page-hero--partner');
   const value=document.createElement('section');
   value.className='sponsor-value';
   value.innerHTML=`<div class="container sponsor-value-grid"><div><p class="eyebrow"><span>支援を、認知につなげる</span><small>SPONSOR VALUE</small></p><h2>ロゴを載せて終わり、にはしません。</h2><p>協賛企業の名前だけではなく、サービスや事業内容、支援いただいた背景まで伝えます。NOTO Re:Bloomへの支援が、企業やサービスを知るきっかけになる掲載を目指します。</p><div class="value-note">今回のイベントに向けた協賛受付は<strong>2026年8月21日まで</strong>。掲載内容や見せ方は、企業ごとの希望を伺って調整します。</div><div class="latest-actions"><a class="btn btn--green" href="${SPONSOR_FORM}" target="_blank" rel="noopener">協賛・連携を相談する</a></div></div><div class="sponsor-benefits"><article><span>1</span><b>企業・サービスを紹介</b><p>ロゴだけでなく、サービス名・特徴・企業名を文章でも掲載。公式サイトやサービスへの導線も設けます。</p></article><article><span>2</span><b>スタッフTシャツへ掲載</b><p>当日スタッフが着用するTシャツの背面に協賛ロゴを掲載予定。イベント現場での視認機会をつくります。</p></article><article><span>3</span><b>バナー・活動報告でも紹介</b><p>ご希望と素材提供に応じて、バナーやサービス紹介をWebサイト・活動報告等で活用します。</p></article><article><span>4</span><b>支援の背景まで伝える</b><p>「なぜこの活動を支援したのか」を紹介できる場合は、企業の地域・学生・子どもへの取り組みとして伝えます。</p></article></div></div>`;
   hero?.after(value);

   const snap=document.querySelector('.partner-snapshot');
   const deadline=document.createElement('div');
   deadline.className='container latest-info';
   deadline.innerHTML=`<p class="eyebrow"><span>協賛受付</span><small>SPONSOR DEADLINE</small></p><h2>2026年8月21日まで</h2><p class="deadline-note">スタッフTシャツ等への掲載準備のため、今回のイベントに向けた協賛受付は8月21日を締切とします。</p><p>協賛企業については、企業名・ロゴだけでなく、サービスや取り組みも公式サイト内で紹介し、ご支援が実際の認知につながる形を目指します。</p><div class="latest-actions"><a class="btn btn--green" href="${SPONSOR_FORM}" target="_blank" rel="noopener">協賛・連携を相談する</a></div>`;
   snap?.after(deadline);

   const showcase=document.createElement('section');
   showcase.className='partner-showcase';
   showcase.id='current-partners';
   showcase.innerHTML=`<div class="container"><div class="section-heading section-heading--center"><p class="eyebrow"><span>現在の協賛・協力</span><small>PARTNERS</small></p><h2>一緒に、この挑戦をつくってくださる皆さま。</h2><p>協賛企業はサービスまで詳しく紹介し、協力企業・団体もそれぞれの活動が分かる形で掲載します。</p></div><div class="partner-cards"><article class="featured-sponsor"><span class="partner-type">協賛企業</span><h3>株式会社アーネストテクノロジーズ</h3><div class="logo-pending">Bukatsu ロゴ・バナー受領後に正式画像へ差し替えます</div><p><span class="service-name">Bukatsu</span><br>中学・高校の部活動を中心に、活動の情報発信や運営をITで支えるサービスです。Bukatsu Pageでは、Webサイト作成に加え、イベント管理、オンライン決済、寄付・クラウドファンディングなどの機能を備えています。今回、学生や子どもたちへの支援という思いからNOTO Re:Bloomをご支援いただきました。</p><a class="partner-link" href="${ERNEST}" target="_blank" rel="sponsored noopener">Bukatsu・アーネストテクノロジーズを詳しく見る ↗</a></article><article><span class="partner-type">協力企業・団体</span><h3>株式会社HAMONZ</h3><p>プロスポーツチーム支援、スポンサー企業の広報・PR支援、公民連携スポーツイベント支援などを行う企業です。NOTO-REBOOST U-23を通じて、学生・地域・企業がスポーツを軸に挑戦する機会を支えています。</p><a class="partner-link" href="${HAMONZ}" target="_blank" rel="noopener">HAMONZを見る ↗</a></article><article><span class="partner-type">協力企業・団体</span><h3>イシカワズカン株式会社</h3><p>石川県の仕事と暮らしを発信し、地域企業と全国の若者をつなぐ地域メディア・人材サービスを展開しています。NOTO-REBOOST U-23の共催団体としても、学生と能登の接点づくりに関わっています。</p><a class="partner-link" href="${ISHIKAWA_ZUKAN}" target="_blank" rel="noopener">イシカワズカンを見る ↗</a></article><article><span class="partner-type">協力企業・団体</span><h3>金沢ポート</h3><p>金沢を拠点に活動するプロ卓球チーム。競技活動に加え、学校訪問など地域連携にも取り組んでいます。</p><a class="partner-link" href="${KANAZAWA_PORT}" target="_blank" rel="noopener">金沢ポートを見る ↗</a></article></div></div>`;
   deadline.after(showcase);
 }
})();