(()=>{
  'use strict';
  const JOIN='https://forms.gle/6ZMrhrhtWmBCQViD8';
  const CROWD='https://readyfor.jp/projects/kousakuhoukiti-saisei';
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  document.body.classList.add('rb-unified');

  // site.js can append legacy styles at runtime. Keep every unified layer last.
  const ensureStyle=(name,href)=>{
    let link=[...document.querySelectorAll('link[rel="stylesheet"]')].find(el=>(el.getAttribute('href')||'').includes(name));
    if(!link){
      link=document.createElement('link');
      link.rel='stylesheet';
      link.href=href;
    }else{
      link.href=href;
    }
    document.head.appendChild(link);
    return link;
  };
  ensureStyle('rebloom-unified.css','rebloom-unified.css?v=20260817e');
  ensureStyle('rebloom-polish.css','rebloom-polish.css?v=20260817e');
  ensureStyle('rebloom-detail.css','rebloom-detail.css?v=20260817e');

  // Keep the navigation wording and priority consistent everywhere.
  const labels={
    'index.html':'ホーム','learn.html':'土地と企画','event.html':'泥ん子運動会',
    'partner.html':'協賛・協力','diagnosis.html':'花タイプ診断'
  };
  const nav=document.querySelector('.site-nav');
  if(nav){
    [...nav.querySelectorAll('a')].forEach(a=>{
      const href=(a.getAttribute('href')||'').split('#')[0];
      if(labels[href]) a.textContent=labels[href];
      a.removeAttribute('aria-current');
      if(href===page || (page===''&&href==='index.html')) a.setAttribute('aria-current','page');
    });
  }

  const actions=document.querySelector('.header-actions');
  if(actions){
    actions.innerHTML='';
    if(page==='partner.html'){
      const consult=document.createElement('a');
      consult.className='rb-header-secondary';
      consult.href='mailto:infonotorebloom@gmail.com';
      consult.textContent='協賛について相談';
      actions.appendChild(consult);
    }
    const join=document.createElement('a');
    join.className='btn btn--small btn--green';
    join.href=JOIN; join.target='_blank'; join.rel='noopener'; join.textContent='9/20 参加申込';
    actions.appendChild(join);
  }

  // Defensive cleanup in case an old cached HTML page is served.
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
  document.querySelectorAll('h1,h2,h3,p,span,a,b').forEach(el=>{
    const t=el.textContent.trim();
    if(replacements.has(t)) el.textContent=replacements.get(t);
  });

  // Add illustration-led sections where real photo variety is limited.
  const makeIllustrationSection=(title,lead,cards)=>{
    const s=document.createElement('section');
    s.className='rb-illustration-section rb-reveal';
    s.innerHTML=`<div class="rb-illustration-inner"><div class="rb-illustration-head"><h2>${title}</h2><p>${lead}</p></div><div class="rb-illustration-grid">${cards.map(c=>`<figure class="rb-illustration-card"><img src="${c.src}" alt="${c.alt}" loading="lazy"><figcaption>${c.cap}</figcaption></figure>`).join('')}</div></div>`;
    return s;
  };

  if(page==='learn.html'&&!document.querySelector('#rb-learn-illustrations')){
    const s=makeIllustrationSection(
      '田んぼを、次の関わりにつなげる。',
      '農地を一度で解決するのではなく、人が来るきっかけをつくり、土地と地域との関係を少しずつ育てていきます。',
      [
        {src:'project-overview.webp',alt:'NOTO Re:Bloomの企画全体像',cap:'NOTO Re:Bloomの企画全体像'},
        {src:'regeneration-model.webp',alt:'農地との関わりを続けるイメージ',cap:'一日のイベントから、その後の関わりへ'}
      ]
    );
    s.id='rb-learn-illustrations';
    const target=document.querySelector('#project');
    if(target) target.before(s); else document.querySelector('main')?.appendChild(s);
  }

  if(page==='partner.html'&&!document.querySelector('#rb-partner-illustrations')){
    const s=makeIllustrationSection(
      '企業・団体の皆さまとつくる形。',
      '資金だけでなく、物品、広報、サービス、地域とのつながりなど、それぞれの強みを生かした協力を相談しています。',
      [
        {src:'sponsor-value.webp',alt:'協賛・協力によって生まれる価値のイメージ',cap:'協賛・協力の考え方'},
        {src:'project-overview.webp',alt:'NOTO Re:Bloomの企画全体像',cap:'9月20日のイベントと、その先の活動'}
      ]
    );
    s.id='rb-partner-illustrations';
    const target=document.querySelector('.nr-value-prop');
    if(target) target.before(s); else document.querySelector('main')?.appendChild(s);
  }

  if(page==='diagnosis.html'&&!document.querySelector('.rb-flower-ribbon')){
    const flowers=['renge.png','himawari.png','nemophila.png','lavender.png','cosmos.png','mimosa.png','ajisai.png','tulip.png','gerbera.png','sumire.png','rindou.png','poppy.png'];
    const ribbon=document.createElement('div');
    ribbon.className='rb-flower-ribbon';
    const twice=[...flowers,...flowers];
    ribbon.innerHTML=`<div class="rb-flower-track" aria-hidden="true">${twice.map((src,i)=>`<img src="${src}" alt="" loading="lazy" style="animation-delay:${(i%6)*-.2}s">`).join('')}</div>`;
    const hero=document.querySelector('.page-hero--diagnosis');
    hero?.after(ribbon);
  }

  // Break long text-only stretches with quiet project motifs.
  document.querySelectorAll('main>section').forEach((section,i)=>{
    const imageCount=section.querySelectorAll('img').length;
    const textLength=(section.innerText||'').replace(/\s/g,'').length;
    if(imageCount===0&&textLength>420) section.classList.add('rb-text-heavy');
    if(imageCount>=2) section.classList.add('rb-image-rich');
    if(i%3===1) section.classList.add('rb-section-wave');
  });

  // Standard footer across all public pages.
  const footer=document.querySelector('.site-footer');
  if(footer){
    footer.classList.add('rb-footer');
    footer.innerHTML=`
      <div class="container rb-footer-cta">
        <div><h2>9月20日、洲巻の田んぼで開催します。</h2><p>参加費無料。受付12:30、13:00開始、17:00頃終了予定です。</p></div>
        <a class="btn" href="${JOIN}" target="_blank" rel="noopener">参加申込</a>
      </div>
      <div class="container rb-footer-grid">
        <div><b>NOTO Re:Bloom</b><p>泥スポーツをきっかけに能登を訪れ、土地を知り、地域の方と関わる時間をつくる学生プロジェクトです。</p></div>
        <div class="rb-footer-links"><strong>PROJECT</strong><a href="learn.html">土地と企画</a><a href="event.html">泥ん子運動会</a><a href="diagnosis.html">花タイプ診断</a></div>
        <div class="rb-footer-links"><strong>CONTACT</strong><a href="partner.html">協賛・協力</a><a href="mailto:infonotorebloom@gmail.com">メールで問い合わせ</a><a href="${CROWD}" target="_blank" rel="noopener">2026年クラファン結果</a></div>
      </div>
      <div class="container rb-footer-bottom"><span>NOTO Re:Bloom</span><span>infonotorebloom@gmail.com</span></div>`;
  }

  // Replace old mobile docks with one consistent participant CTA.
  document.querySelectorAll('.mobile-dock,.join-dock,.rb-mobile-join').forEach(el=>el.remove());
  if(page!=='404.html'){
    const dock=document.createElement('div');
    dock.className='rb-mobile-join';
    dock.innerHTML=`<a href="${JOIN}" target="_blank" rel="noopener"><span>9/20 参加申込</span><small>参加費無料</small></a>`;
    document.body.appendChild(dock);
  }

  // Calm reveal motion; avoid hiding interactive diagnosis panels.
  const revealTargets=[...document.querySelectorAll('main>section,.rb-illustration-section')].filter(el=>!el.classList.contains('diagnosis-panel'));
  revealTargets.forEach(el=>el.classList.add('rb-reveal'));
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('rb-inview');io.unobserve(e.target)}
    }),{threshold:.08,rootMargin:'0px 0px -50px'});
    revealTargets.forEach(el=>io.observe(el));
  }else revealTargets.forEach(el=>el.classList.add('rb-inview'));

  // A small amount of movement for decorative assets only.
  document.querySelectorAll('.brand-mark,.hero-motif').forEach(el=>el.classList.add('rb-float'));

  // Detail layer: scroll depth, micro-interactions, page-specific atmosphere.
  if(!document.querySelector('script[src*="rebloom-detail.js"]')){
    const detail=document.createElement('script');
    detail.src='rebloom-detail.js?v=20260817g';
    detail.defer=true;
    document.body.appendChild(detail);
  }
})();
