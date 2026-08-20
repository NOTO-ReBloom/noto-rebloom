(()=>{
  'use strict';
  const JOIN='https://forms.gle/6ZMrhrhtWmBCQViD8';
  const CROWD='https://readyfor.jp/projects/kousakuhoukiti-saisei';
  const ISHIMO='https://www.ishimo-ishikawa.jp/';
  const GYAKUTEN='https://gyakuten-coaching.com/';
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  document.body.classList.add('rb-unified');

  const ensureStyle=(name,href)=>{
    let link=[...document.querySelectorAll('link[rel="stylesheet"]')].find(el=>(el.getAttribute('href')||'').includes(name));
    if(!link){link=document.createElement('link');link.rel='stylesheet'}
    link.href=href;document.head.appendChild(link);return link;
  };
  ensureStyle('rebloom-unified.css','rebloom-unified.css?v=20260820sponsor');
  ensureStyle('rebloom-polish.css','rebloom-polish.css?v=20260817e');
  ensureStyle('rebloom-detail.css','rebloom-detail.css?v=20260817e');

  const labels={'index.html':'ホーム','learn.html':'土地と企画','event.html':'泥ん子運動会','partner.html':'協賛・協力','diagnosis.html':'花タイプ診断'};
  const nav=document.querySelector('.site-nav');
  if(nav){
    [...nav.querySelectorAll('a')].forEach(a=>{
      const href=(a.getAttribute('href')||'').split('#')[0];
      if(labels[href])a.textContent=labels[href];
      a.removeAttribute('aria-current');
      if(href===page||(page===''&&href==='index.html'))a.setAttribute('aria-current','page');
    });
  }

  const actions=document.querySelector('.header-actions');
  if(actions){
    actions.innerHTML='';
    if(page==='partner.html'){
      const consult=document.createElement('a');consult.className='rb-header-secondary';consult.href='mailto:infonotorebloom@gmail.com';consult.textContent='協賛について相談';actions.appendChild(consult);
    }
    const join=document.createElement('a');join.className='btn btn--small btn--green';join.href=JOIN;join.target='_blank';join.rel='noopener';join.textContent='9/20 参加申込';actions.appendChild(join);
  }

  const replacements=new Map([
    ['文字より先に、\n会場と私たちを見てください。','この場所で、\n泥だらけの一日を。'],
    ['文字より先に、会場と私たちを見てください。','この場所で、泥だらけの一日を。'],
    ['詳しい企画背景を全部読まなくても、まずイベントから能登と出会えます。','受付12:30、13:00開始。子どもから大人まで参加できます。'],
    ['「ちょっと楽しそう」で、参加して大丈夫です。','子どもも大人も、参加費は無料です。'],
    ['どんな場所か、\n先に見ておけます。','洲巻の田んぼで、\n泥だらけの一日を。'],
    ['どんな場所か、先に見ておけます。','洲巻の田んぼで、泥だらけの一日を。'],
    ['迷いやすいところだけ、先に。','参加前のよくある質問'],
    ['32の花を先に見る','32の花を見る'],
    ['まず、土地を見てください。','この土地から、企画を考えました。'],
    ['時間は、これだけ覚えればOK。','12:30受付、13:00スタート。']
  ]);
  document.querySelectorAll('h1,h2,h3,p,span,a,b').forEach(el=>{const t=el.textContent.trim();if(replacements.has(t))el.textContent=replacements.get(t)});

  if(page==='index.html'&&!document.querySelector('#ishimo-collaboration')){
    const section=document.createElement('section');
    section.id='ishimo-collaboration';
    section.className='section ishimo-collaboration';
    section.innerHTML=`<div class="container"><article class="ishimo-collaboration-card"><div class="ishimo-collaboration-mark"><img class="ishimo-collaboration-logo--ishimo" src="ishimo-logo.svg" alt="石川をもっと、ishimo"><small aria-hidden="true">×</small><img class="ishimo-collaboration-logo--rebloom" src="noto-rebloom-logo.png" alt="NOTO Re:Bloom"></div><div class="ishimo-collaboration-copy"><p class="ishimo-collaboration-kicker">COLLABORATION</p><h2>学生プロジェクト<br><span>ishimo（イシモ）</span>と連携します。</h2><p>2026年9月20日の泥ん子運動会に向け、石川県主催の学生プロジェクト「ishimo」と連携します。学生への情報発信や参加の呼びかけを通じて、能登と学生がつながる入口を一緒につくります。</p><p class="ishimo-collaboration-note">今回の連携を、学生が継続して能登に関わる仕組みへつなげていきます。</p><a class="btn btn--paper ishimo-collaboration-link" href="${ISHIMO}" target="_blank" rel="noopener">ishimo公式サイトを見る ↗</a></div></article></div>`;
    const target=document.querySelector('#project-story');
    if(target)target.before(section);else document.querySelector('main')?.appendChild(section);
  }

  if(page==='partner.html'&&!document.querySelector('.industry-partner--ishimo')){
    const grid=document.querySelector('.industry-grid');
    if(grid){
      grid.classList.add('industry-grid--partners');
      const article=document.createElement('article');
      article.className='industry-partner--ishimo';
      article.innerHTML=`<span class="industry-partner-label">COLLABORATION</span><a class="industry-partner-logo" href="${ISHIMO}" target="_blank" rel="noopener" aria-label="ishimo公式サイト"><img src="ishimo-logo.svg" alt="石川をもっと、ishimo"></a><h3>学生プロジェクト ishimo（イシモ）</h3><p>石川県主催の学生プロジェクトです。NOTO Re:Bloomとは、泥ん子運動会の情報発信と学生参加に向けて連携します。</p><a class="text-link" href="${ISHIMO}" target="_blank" rel="noopener">ishimo公式サイト →</a>`;
      grid.prepend(article);
    }
  }

  if((page==='index.html'||page==='partner.html')&&!document.querySelector('.nr-main-sponsor--gyakuten')){
    const sponsorSection=page==='partner.html'?document.querySelector('#current-partners'):document.querySelector('main>.nr-sponsor-feature--spotlight');
    if(sponsorSection){
      const head=sponsorSection.querySelector('.nr-section-head');
      const heading=head?.querySelector('h2');
      const lead=head?.querySelector('h2+p');
      if(page==='index.html'){
        if(heading)heading.innerHTML='活動を支えてくださる、<br>協賛パートナー。';
        if(lead)lead.textContent='株式会社アーネストテクノロジーズとTechsPlus株式会社に、NOTO Re:Bloomの活動をご支援いただいています。';
      }else if(lead){
        lead.textContent='ご支援への感謝を込めて、株式会社アーネストテクノロジーズの「部活ナビ」と、TechsPlus株式会社の「逆転コーチング」をご紹介します。';
      }
      const article=document.createElement('article');
      article.className=`nr-main-sponsor nr-main-sponsor--navi nr-main-sponsor--gyakuten${page==='index.html'?' nr-main-sponsor--compact':''}`;
      article.innerHTML=`<div class="nr-sponsor-identity"><span class="nr-badge">協賛企業</span><a class="nr-sponsor-logo nr-sponsor-logo--gyakuten" href="${GYAKUTEN}" target="_blank" rel="sponsored noopener" aria-label="逆転コーチング公式サイト"><img class="gyakuten-official-logo" src="gyakuten-coaching-official-logo.png" alt="逆転コーチング"></a><p>TechsPlus株式会社</p><small>NOTO Re:Bloomの活動にご協賛いただいています。</small></div><div class="nr-sponsor-story"><p class="nr-sponsor-thanks">SUPPORTED BY TECHSPLUS</p><h3>志望校から逆算し、毎日の学習を支える。</h3><p>「逆転コーチング」は、志望校に合格したコーチが専属でつき、日々の学習計画の作成と進捗管理を行う大学受験オンライン塾です。</p><div class="nr-navi-features" aria-label="逆転コーチングの特徴"><span>志望校に特化</span><span>1日単位の学習管理</span><span>オンライン対応</span></div><div class="nr-actions"><a class="nr-btn nr-sponsor-primary nr-sponsor-primary--gyakuten" href="${GYAKUTEN}" target="_blank" rel="sponsored noopener">逆転コーチング公式サイト ↗</a></div></div>`;
      sponsorSection.appendChild(article);
    }
  }

  const projectMap=()=>`<div class="rb-project-map" role="img" aria-label="使われなくなった田んぼを泥ん子運動会の会場として使い、人が能登へ来て地域と関わり、来年度以降の開催につなげるNOTO Re:Bloomの全体像">
    <div class="rb-project-map-path" aria-hidden="true"></div>
    <div class="rb-project-node rb-project-node--land"><span class="rb-project-node-icon">土</span><b>田んぼ</b><small>使われなくなった土地</small></div>
    <div class="rb-project-arrow rb-project-arrow--a" aria-hidden="true"><i></i></div>
    <div class="rb-project-node rb-project-node--event"><span class="rb-project-node-icon">泥</span><b>泥ん子運動会</b><small>楽しいから、来てみる</small></div>
    <div class="rb-project-arrow rb-project-arrow--b" aria-hidden="true"><i></i></div>
    <div class="rb-project-cluster"><div class="rb-project-mini"><span>来</span><b>能登に来る</b></div><div class="rb-project-mini"><span>話</span><b>地域と話す</b></div><div class="rb-project-mini"><span>知</span><b>土地を知る</b></div></div>
    <div class="rb-project-arrow rb-project-arrow--c" aria-hidden="true"><i></i></div>
    <div class="rb-project-node rb-project-node--next"><span class="rb-project-node-icon">花</span><b>来年度以降へ</b><small>記録とつながりを次の開催へ</small></div>
  </div>`;

  const makeIllustrationSection=(title,lead,cards)=>{
    const cardMarkup=(c)=>c.type==='map'?`<figure class="rb-illustration-card rb-project-map-card">${projectMap()}<figcaption>${c.cap}</figcaption></figure>`:`<figure class="rb-illustration-card"><img src="${c.src}" alt="${c.alt}" loading="lazy"><figcaption>${c.cap}</figcaption></figure>`;
    const s=document.createElement('section');s.className='rb-illustration-section rb-reveal';
    s.innerHTML=`<div class="rb-illustration-inner"><div class="rb-illustration-head"><h2>${title}</h2><p>${lead}</p></div><div class="rb-illustration-grid${cards.length===1?' rb-illustration-grid--single':''}">${cards.map(cardMarkup).join('')}</div></div>`;return s;
  };

  if(page==='learn.html'&&!document.querySelector('#rb-learn-illustrations')){
    const s=makeIllustrationSection('田んぼを、次の関わりにつなげる。','農地を一度で解決するのではなく、人が来るきっかけをつくり、土地と地域との関係を少しずつ育てていきます。',[{type:'map',cap:'NOTO Re:Bloomの全体像'}]);
    s.id='rb-learn-illustrations';const target=document.querySelector('#project');if(target)target.before(s);else document.querySelector('main')?.appendChild(s);
  }

  /* Partner already has a photo mosaic, sponsor value block and sponsor feature. Avoid another duplicate illustration section. */
  document.querySelector('#rb-partner-illustrations')?.remove();

  /* Continuous decorative motion was intentionally removed. The diagnosis page already has rich flower imagery in its actual content. */
  document.querySelector('.rb-flower-ribbon')?.remove();
  document.querySelectorAll('.brand-mark,.hero-motif').forEach(el=>el.classList.remove('rb-float'));

  document.querySelectorAll('main>section').forEach(section=>{
    const imageCount=section.querySelectorAll('img').length;const textLength=(section.innerText||'').replace(/\s/g,'').length;
    if(imageCount===0&&textLength>420)section.classList.add('rb-text-heavy');if(imageCount>=2)section.classList.add('rb-image-rich');
  });

  const footer=document.querySelector('.site-footer');
  if(footer){
    footer.classList.add('rb-footer');footer.innerHTML=`
      <div class="container rb-footer-cta"><div><h2>9月20日、洲巻の田んぼで開催します。</h2><p>参加費無料。受付12:30、13:00開始、17:00頃終了予定です。</p></div><a class="btn" href="${JOIN}" target="_blank" rel="noopener">参加申込</a></div>
      <div class="container rb-footer-grid"><div><b>NOTO Re:Bloom</b><p>泥スポーツをきっかけに能登を訪れ、土地を知り、地域の方と関わる時間をつくる学生プロジェクトです。</p></div><div class="rb-footer-links"><strong>PROJECT</strong><a href="learn.html">土地と企画</a><a href="event.html">泥ん子運動会</a><a href="diagnosis.html">花タイプ診断</a></div><div class="rb-footer-links"><strong>CONTACT</strong><a href="partner.html">協賛・協力</a><a href="${ISHIMO}" target="_blank" rel="noopener">ishimo公式サイト ↗</a><a href="mailto:infonotorebloom@gmail.com">メールで問い合わせ</a><a href="${CROWD}" target="_blank" rel="noopener">2026年クラファン結果</a></div></div>
      <div class="container rb-footer-bottom"><span>NOTO Re:Bloom</span><span>infonotorebloom@gmail.com</span></div>`;
  }

  document.querySelectorAll('.mobile-dock,.join-dock,.rb-mobile-join').forEach(el=>el.remove());
  if(page!=='404.html'){
    const dock=document.createElement('div');dock.className='rb-mobile-join';dock.innerHTML=`<a href="${JOIN}" target="_blank" rel="noopener"><span>9/20 参加申込</span><small>参加費無料</small></a>`;document.body.appendChild(dock);
  }

  const revealTargets=[...document.querySelectorAll('main>section,.rb-illustration-section')].filter(el=>!el.classList.contains('diagnosis-panel'));
  revealTargets.forEach(el=>el.classList.add('rb-reveal'));
  if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('rb-inview');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -50px'});revealTargets.forEach(el=>io.observe(el))}else revealTargets.forEach(el=>el.classList.add('rb-inview'));

  if(!document.querySelector('script[src*="rebloom-detail.js"]')){
    const detail=document.createElement('script');detail.src='rebloom-detail.js?v=20260817z';detail.defer=true;document.body.appendChild(detail);
  }
})();
