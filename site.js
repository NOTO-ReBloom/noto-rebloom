(()=>{
  document.documentElement.classList.add('js');

  const OLD_FORM_TOKEN='jdSpe6Pb3pyFf7QU6';
  const PARTICIPANT_FORM='https://forms.gle/6ZMrhrhtWmBCQViD8';
  const recruitmentText=/学生企画メンバー|学生募集|企画メンバー募集|共創メンバー|申込は8月8日まで|8月8日まで・学生募集/;

  const ensureLatestStyles=()=>{
    if(document.querySelector('link[href*="student-refresh.css?v=20260813c"]')) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='student-refresh.css?v=20260813c';
    document.head.appendChild(link);
  };

  const normalizeLegacyLink=(a)=>{
    if(!(a instanceof HTMLAnchorElement)) return;
    if(!(a.getAttribute('href')||'').includes(OLD_FORM_TOKEN)) return;
    a.href=PARTICIPANT_FORM;
    a.target='_blank';
    a.rel='noopener';
    if(a.classList.contains('conversion-card')){
      const small=a.querySelector('small'); if(small) small.textContent='イベントに参加';
      const h3=a.querySelector('h3'); if(h3) h3.textContent='泥ん子運動会に参加';
      const p=a.querySelector('p'); if(p) p.textContent='2026年9月20日、珠洲市・洲巻地区で開催。参加費は無料です。';
      const b=a.querySelector('b'); if(b) b.textContent='参加フォームを開く →';
      return;
    }
    if(a.closest('.header-actions')) a.textContent='9/20 参加申込';
    else if(a.closest('.mobile-dock')) a.textContent='イベント参加';
    else if(a.closest('.site-footer')) a.textContent='泥ん子運動会に参加';
    else if(a.closest('.diagnosis-result,.final-cta')) a.textContent='泥ん子運動会に参加';
    else a.textContent='9/20 参加申込';
  };

  const removeDedicatedRecruitment=()=>{
    ['co-creation','student-members','student-recruitment','recruitment'].forEach(id=>document.getElementById(id)?.remove());
    document.querySelectorAll('section').forEach(section=>{
      const heading=section.querySelector('h1,h2,h3,.eyebrow');
      if(heading && recruitmentText.test(heading.textContent||'')) section.remove();
    });
    document.querySelectorAll(`a[href*="${OLD_FORM_TOKEN}"]`).forEach(normalizeLegacyLink);
    document.querySelectorAll('p,li,.callout,.renge-event-facts>div').forEach(el=>{
      if(el.isConnected && recruitmentText.test(el.textContent||'')) el.remove();
    });
    const reason=document.getElementById('resultActionReason');
    if(reason && /企画から一緒につくる|当日だけでなく、企画から/.test(reason.textContent||'')){
      reason.textContent='人が集まる場でこそ、あなたの明るさと行動力が生きます。まずは9月20日のイベントに参加し、能登と出会う一歩がおすすめです。';
    }
    document.querySelectorAll('.button-row,.header-actions,.quick-grid,.renge-event-facts,.callout,.source-note').forEach(el=>{
      const text=(el.textContent||'').replace(/\s+/g,'').trim();
      if(!text && !el.querySelector('a,button,img,input,svg')) el.remove();
    });
  };

  const updateLegacyVenueText=()=>{
    const replacements=[
      ['会場候補を確認中','会場確定・使用許可済み'],
      ['珠洲市内で実施予定','珠洲市・洲巻地区で開催'],
      ['珠洲市内で午後開催予定','珠洲市・洲巻地区で午後開催'],
      ['上黒丸地区の元レンコン田。許可・安全条件は未確定','洲巻地区の田んぼ（約20m×50m・約1,000㎡）。土地使用許可取得済み'],
      ['会場候補となる土地の一つ','能登で確認してきた農地の様子'],
      ['活動候補となる土地の一つ','能登で確認してきた農地の様子'],
      ['企画への参加、個人からの支援、企業・団体としての協力から選んでください。','9月20日のイベント参加、個人からの支援、企業・団体としての協力から選んでください。']
    ];
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      let v=node.nodeValue||'';
      replacements.forEach(([from,to])=>{if(v.includes(from)) v=v.split(from).join(to);});
      node.nodeValue=v;
    });
  };

  const setupNav=()=>{
    const body=document.body;
    const menu=document.querySelector('.menu-button');
    const nav=document.querySelector('.site-nav');
    const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    nav?.querySelectorAll('a[href]').forEach(link=>{
      const href=(link.getAttribute('href')||'').split('#')[0].toLowerCase();
      if(href===current||(current===''&&href==='index.html')) link.setAttribute('aria-current','page');
      if(href==='partner.html'&&link.textContent.trim()==='法人・団体') link.textContent='協賛・協力';
      link.addEventListener('click',()=>{body.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false');});
    });
    menu?.addEventListener('click',()=>{
      const open=body.classList.toggle('menu-open');
      menu.setAttribute('aria-expanded',String(open));
    });
    addEventListener('keydown',e=>{
      if(e.key==='Escape'&&body.classList.contains('menu-open')){
        body.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false');menu?.focus();
      }
    });
  };

  const setupRevealAndScroll=()=>{
    const progress=document.querySelector('.scroll-progress span');
    const back=document.querySelector('.back-top');
    const dock=document.querySelector('.mobile-dock');
    const update=()=>{
      const max=document.documentElement.scrollHeight-innerHeight;
      if(progress) progress.style.width=(max>0?scrollY/max*100:0)+'%';
      back?.classList.toggle('is-visible',scrollY>700);
      dock?.classList.toggle('is-visible',scrollY>520);
    };
    addEventListener('scroll',update,{passive:true}); update();
    back?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
    const items=document.querySelectorAll('.reveal');
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window)) items.forEach(x=>x.classList.add('is-visible'));
    else{
      const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}}),{threshold:.1});
      items.forEach(x=>io.observe(x));
    }
  };

  const ensureHomepageNarrative=()=>{
    if(!document.body.classList.contains('nr-new-home')) return;
    const choices=document.querySelector('.nr-choice-grid');
    if(!choices) return;
    if(!document.getElementById('origin')){
      const origin=document.createElement('section');
      origin.id='origin';
      origin.className='section section--paper motif motif--sprout';
      origin.innerHTML=`<div class="container split-story"><div><p class="eyebrow"><span>この企画を始めたきっかけ</span><small>OUR START</small></p><h2>能登に来る理由を、<br>ひとつでも増やしたい。</h2><p>きっかけは「NOTO-REBOOST U-23」で能登を訪れ、使われなくなった農地を見たことでした。土地をきれいにするだけではなく、まずここに人が来て、地域の方と話して、能登のことを知る時間をつくれないだろうか。そこからこの企画を考え始めました。</p><p>一度のイベントで農地の問題が解決するわけではありません。それでも、泥だらけになって遊んだ一日が「また来たい」「今度は別の形でも関わりたい」と思うきっかけになれば、その一歩には意味があると思っています。まずは自分たちにできる形から始めます。</p><div class="button-row"><a class="btn btn--outline" href="learn.html">土地のことと企画の理由を見る</a></div></div><figure class="photo-frame"><img src="team-reboost.webp" alt="NOTO-REBOOST U-23で活動するNOTO Re:Bloomメンバー"><figcaption>NOTO-REBOOST U-23で能登と向き合ったことが、この企画の出発点です。</figcaption></figure></div>`;
      choices.after(origin);
    }
  };

  const enrichLearnPage=()=>{
    if(!document.body.classList.contains('page-learn')||document.getElementById('farmland-data-story')) return;
    const numbers=document.getElementById('numbers');
    const container=numbers?.querySelector('.container');
    if(!container) return;
    const heading=numbers.querySelector('.section-heading');
    const h2=heading?.querySelector('h2');
    const p=heading?.querySelector('p:last-child');
    if(h2) h2.textContent='全国に25.7万haの荒廃農地があります。';
    if(p) p.textContent='令和6年度は、そのうち9.8万haが再生利用可能とされています。一年間に新たに発生した荒廃農地は2.4万ha、再生利用された面積は0.8万haでした。';
    const chart=document.createElement('div');
    chart.id='farmland-data-story';
    chart.innerHTML=`<div class="chart-grid"><article class="chart-card"><h3>再生利用が可能な荒廃農地の推移</h3><p>平成27年から令和6年度までの全国値です。令和3年度から調査内容が見直されているため、令和2年以前との単純比較には注意が必要です。</p><div class="trend-bars" role="img" aria-label="再生利用が可能な荒廃農地の推移。平成27年12.4万ヘクタール、令和6年度9.8万ヘクタール"><div class="trend-item"><span class="trend-value">12.4</span><i class="trend-bar" style="height:149px"></i><span class="trend-year">H27</span></div><div class="trend-item"><span class="trend-value">9.8</span><i class="trend-bar" style="height:118px"></i><span class="trend-year">H28</span></div><div class="trend-item"><span class="trend-value">9.2</span><i class="trend-bar" style="height:110px"></i><span class="trend-year">H29</span></div><div class="trend-item"><span class="trend-value">9.2</span><i class="trend-bar" style="height:110px"></i><span class="trend-year">H30</span></div><div class="trend-item"><span class="trend-value">9.1</span><i class="trend-bar" style="height:109px"></i><span class="trend-year">R1</span></div><div class="trend-item"><span class="trend-value">9.0</span><i class="trend-bar" style="height:108px"></i><span class="trend-year">R2</span></div><div class="trend-item"><span class="trend-value">9.1</span><i class="trend-bar" style="height:109px"></i><span class="trend-year">R3</span></div><div class="trend-item"><span class="trend-value">9.0</span><i class="trend-bar" style="height:108px"></i><span class="trend-year">R4</span></div><div class="trend-item"><span class="trend-value">9.4</span><i class="trend-bar" style="height:113px"></i><span class="trend-year">R5</span></div><div class="trend-item"><span class="trend-value">9.8</span><i class="trend-bar" style="height:118px"></i><span class="trend-year">R6</span></div></div><p class="chart-note">単位：万ha。出典：農林水産省「農地に関する統計」「荒廃農地面積の推移」</p></article><article class="chart-card"><h3>25.7万haの内訳</h3><p>整地などによって再び使えると見込まれる土地と、再生が難しいと見込まれる土地があります。</p><div class="breakdown"><div class="breakdown-total"><strong>25.7<small>万ha</small></strong><span>令和6年度</span></div><div class="stack-bar" role="img" aria-label="再生利用が可能9.8万ヘクタール、再生利用が困難15.9万ヘクタール"><span class="possible">9.8</span><span class="difficult">15.9</span></div><div class="stack-legend"><div><i class="possible-dot"></i><span>再生利用が可能</span><b>9.8万ha</b></div><div><i class="difficult-dot"></i><span>再生利用が困難</span><b>15.9万ha</b></div></div></div><div class="flow-compare"><div class="flow-year"><strong>令和5年度</strong><div class="flow-row"><span>新たに発生</span><div class="flow-track"><i class="new" style="width:100%"></i></div><b>2.5</b></div><div class="flow-row"><span>再生利用</span><div class="flow-track"><i class="reuse" style="width:40%"></i></div><b>1.0</b></div></div><div class="flow-year"><strong>令和6年度</strong><div class="flow-row"><span>新たに発生</span><div class="flow-track"><i class="new" style="width:96%"></i></div><b>2.4</b></div><div class="flow-row"><span>再生利用</span><div class="flow-track"><i class="reuse" style="width:32%"></i></div><b>0.8</b></div></div></div><p class="chart-note">発生・再生利用の単位も万haです。</p></article></div><p class="data-source">出典：農林水産省「農地に関する統計」「荒廃農地の発生防止・解消等」。※令和6年能登半島地震の影響により、珠洲市を含む石川県内の一部市町については、荒廃農地面積の一部に過年度の数値を用いて集計されています。</p>`;
    container.appendChild(chart);
  };

  const enrichHomeTimeline=()=>{
    if(!document.body.classList.contains('nr-new-home')||document.getElementById('project-story')) return;
    const purpose=document.getElementById('purpose');
    if(!purpose) return;
    const section=document.createElement('section');
    section.id='project-story';
    section.className='section story-timeline-section';
    section.innerHTML=`<div class="container"><div class="section-heading section-heading--center"><p class="eyebrow"><span>ここまでの歩み</span><small>OUR JOURNEY</small></p><h2>考えるだけではなく、一つずつ形にしてきました。</h2><p>最初から全部が決まっていたわけではありません。現地へ行き、人と話し、やり方を変えながら9月20日に向けて準備しています。</p></div><div class="story-timeline"><article class="story-step"><span class="story-dot">01</span><small>きっかけ</small><h3>NOTO-REBOOST U-23</h3><p>能登の課題と向き合い、この企画を考え始めました。</p></article><article class="story-step"><span class="story-dot">02</span><small>現地へ</small><h3>農地を見て、話を聞く</h3><p>実際に土地を見ながら、何ができるかを考えました。</p></article><article class="story-step"><span class="story-dot">03</span><small>2026年8月</small><h3>洲巻地区の会場が決定</h3><p>約1,000㎡の田んぼをお借りできることになりました。</p></article><article class="story-step"><span class="story-dot">04</span><small>準備中</small><h3>支援を集め、開催準備</h3><p>READYFORや協賛を通して、必要な準備を進めています。</p></article><article class="story-step"><span class="story-dot">05</span><small>2026.9.19</small><h3>香林坊で報告会</h3><p>ここまで考えてきたことをまとめてお話しします。</p></article><article class="story-step"><span class="story-dot">06</span><small>2026.9.20</small><h3>泥ん子運動会</h3><p>洲巻の田んぼで、まず一回やってみます。</p></article></div></div>`;
    purpose.after(section);
  };

  const enrichEventReport=()=>{
    if(!document.body.classList.contains('nr-new-event')||document.getElementById('after-event-report')) return;
    const main=document.querySelector('main');
    if(!main) return;
    const sections=[...main.querySelectorAll(':scope > section')];
    const join=sections.find(section=>section.querySelector('.eyebrow span')?.textContent.trim()==='参加する');
    const report=document.createElement('section');
    report.id='after-event-report';
    report.className='section after-report';
    report.innerHTML=`<div class="container"><div class="after-report-board after-report-board--compact"><div class="after-report-head"><div><p class="eyebrow"><span>開催後の報告</span><small>EVENT REPORT</small></p><h2>開催後は、結果と次の改善点を公開します。</h2><p>参加人数やアンケート、運営で分かった課題を整理し、次の活動につなげます。</p></div><span class="after-report-status">開催後に更新</span></div></div></div>`;
    if(join) main.insertBefore(report,join); else main.appendChild(report);
  };

  const setupDiagnosisExperience=()=>{
    if(!document.body.classList.contains('page-diagnosis')) return;
    const body=document.body;
    const panel=document.getElementById('diagnosisPanel');
    const result=document.getElementById('diagnosisResult');
    if(!panel||!result) return;

    const partnerNav=document.querySelector('.site-nav a[href="partner.html"]');
    if(partnerNav) partnerNav.textContent='協賛・協力';
    const trust=document.querySelector('.diagnosis-trust-note');
    if(trust) trust.textContent='全56問、目安は6〜10分。途中保存でき、結果では32種類の花タイプから自分の傾向を見られます。';
    const tags=[...document.querySelectorAll('.diagnosis-tags li')];
    if(tags[2]) tags[2].textContent='32種類';
    const startCard=document.querySelector('.diagnosis-start-card h3');
    if(startCard) startCard.textContent='直感で、3つから答えるだけ。';

    if(!panel.querySelector('.diagnosis-focus-bar')){
      const bar=document.createElement('div');
      bar.className='diagnosis-focus-bar';
      bar.innerHTML='<div class="diagnosis-focus-copy"><b>花タイプ診断</b><span>回答は自動で保存されます</span></div><button class="diagnosis-focus-close" type="button">いったん閉じる</button>';
      panel.prepend(bar);
      bar.querySelector('button')?.addEventListener('click',()=>{
        body.classList.remove('diagnosis-running');
        document.querySelector('.page-hero--diagnosis')?.scrollIntoView({behavior:'smooth',block:'start'});
      });
    }

    const begin=()=>{
      body.classList.add('diagnosis-running');
      body.classList.remove('diagnosis-has-result');
    };
    ['startDiagnosis','resumeDiagnosis','atlasStartDiagnosis','retryDiagnosis'].forEach(id=>document.getElementById(id)?.addEventListener('click',begin));

    const syncResultState=()=>{
      if(result.classList.contains('is-active')){
        body.classList.remove('diagnosis-running');
        body.classList.add('diagnosis-has-result');
      }
    };
    new MutationObserver(syncResultState).observe(result,{attributes:true,attributeFilter:['class']});
    addEventListener('keydown',event=>{
      if(event.key==='Escape'&&body.classList.contains('diagnosis-running')){
        body.classList.remove('diagnosis-running');
        document.querySelector('.page-hero--diagnosis')?.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  };

  ensureLatestStyles();
  setupNav();
  setupRevealAndScroll();
  updateLegacyVenueText();
  removeDedicatedRecruitment();
  ensureHomepageNarrative();
  enrichLearnPage();
  enrichHomeTimeline();
  enrichEventReport();
  setupDiagnosisExperience();

  let cleaning=false;
  const observer=new MutationObserver(mutations=>{
    if(cleaning) return;
    let relevant=false;
    for(const m of mutations){
      if(m.type==='attributes'&&m.attributeName==='href'){relevant=true;break;}
      if(m.type==='childList'||m.type==='characterData'){relevant=true;break;}
    }
    if(!relevant) return;
    cleaning=true;
    removeDedicatedRecruitment();
    cleaning=false;
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['href']});
})();
