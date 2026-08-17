(()=>{
  'use strict';
  const JOIN='https://forms.gle/6ZMrhrhtWmBCQViD8';
  const CROWD='https://readyfor.jp/projects/kousakuhoukiti-saisei';
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  document.body.classList.add('rb-unified');

  const ensureStyle=(name,href)=>{
    let link=[...document.querySelectorAll('link[rel="stylesheet"]')].find(el=>(el.getAttribute('href')||'').includes(name));
    if(!link){link=document.createElement('link');link.rel='stylesheet'}
    link.href=href;document.head.appendChild(link);return link;
  };
  ensureStyle('rebloom-unified.css','rebloom-unified.css?v=20260817e');
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

  const projectMap=()=>`<div class="rb-project-map" role="img" aria-label="使われなくなった田んぼを泥ん子運動会の会場として使い、人が能登へ来て地域と関わり、次の関わりにつなげるNOTO Re:Bloomの全体像">
    <div class="rb-project-map-path" aria-hidden="true"></div>
    <div class="rb-project-node rb-project-node--land"><span class="rb-project-node-icon">土</span><b>田んぼ</b><small>使われなくなった土地</small></div>
    <div class="rb-project-arrow rb-project-arrow--a" aria-hidden="true"><i></i></div>
    <div class="rb-project-node rb-project-node--event"><span class="rb-project-node-icon">泥</span><b>泥ん子運動会</b><small>楽しいから、来てみる</small></div>
    <div class="rb-project-arrow rb-project-arrow--b" aria-hidden="true"><i></i></div>
    <div class="rb-project-cluster"><div class="rb-project-mini"><span>来</span><b>能登に来る</b></div><div class="rb-project-mini"><span>話</span><b>地域と話す</b></div><div class="rb-project-mini"><span>知</span><b>土地を知る</b></div></div>
    <div class="rb-project-arrow rb-project-arrow--c" aria-hidden="true"><i></i></div>
    <div class="rb-project-node rb-project-node--next"><span class="rb-project-node-icon">花</span><b>次の関わりへ</b><small>また来る・続け方を考える</small></div>
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

  if(page==='diagnosis.html'&&!document.querySelector('.rb-flower-ribbon')){
    const flowers=['renge.png','himawari.png','nemophila.png','lavender.png','cosmos.png','mimosa.png','ajisai.png','tulip.png','gerbera.png','sumire.png','rindou.png','poppy.png'];
    const ribbon=document.createElement('div');ribbon.className='rb-flower-ribbon';const twice=[...flowers,...flowers];
    ribbon.innerHTML=`<div class="rb-flower-track" aria-hidden="true">${twice.map((src,i)=>`<img src="${src}" alt="" loading="lazy" style="animation-delay:${(i%6)*-.2}s">`).join('')}</div>`;document.querySelector('.page-hero--diagnosis')?.after(ribbon);
  }

  document.querySelectorAll('main>section').forEach(section=>{
    const imageCount=section.querySelectorAll('img').length;const textLength=(section.innerText||'').replace(/\s/g,'').length;
    if(imageCount===0&&textLength>420)section.classList.add('rb-text-heavy');if(imageCount>=2)section.classList.add('rb-image-rich');
  });

  const footer=document.querySelector('.site-footer');
  if(footer){
    footer.classList.add('rb-footer');footer.innerHTML=`
      <div class="container rb-footer-cta"><div><h2>9月20日、洲巻の田んぼで開催します。</h2><p>参加費無料。受付12:30、13:00開始、17:00頃終了予定です。</p></div><a class="btn" href="${JOIN}" target="_blank" rel="noopener">参加申込</a></div>
      <div class="container rb-footer-grid"><div><b>NOTO Re:Bloom</b><p>泥スポーツをきっかけに能登を訪れ、土地を知り、地域の方と関わる時間をつくる学生プロジェクトです。</p></div><div class="rb-footer-links"><strong>PROJECT</strong><a href="learn.html">土地と企画</a><a href="event.html">泥ん子運動会</a><a href="diagnosis.html">花タイプ診断</a></div><div class="rb-footer-links"><strong>CONTACT</strong><a href="partner.html">協賛・協力</a><a href="mailto:infonotorebloom@gmail.com">メールで問い合わせ</a><a href="${CROWD}" target="_blank" rel="noopener">2026年クラファン結果</a></div></div>
      <div class="container rb-footer-bottom"><span>NOTO Re:Bloom</span><span>infonotorebloom@gmail.com</span></div>`;
  }

  document.querySelectorAll('.mobile-dock,.join-dock,.rb-mobile-join').forEach(el=>el.remove());
  if(page!=='404.html'){
    const dock=document.createElement('div');dock.className='rb-mobile-join';dock.innerHTML=`<a href="${JOIN}" target="_blank" rel="noopener"><span>9/20 参加申込</span><small>参加費無料</small></a>`;document.body.appendChild(dock);
  }

  const revealTargets=[...document.querySelectorAll('main>section,.rb-illustration-section')].filter(el=>!el.classList.contains('diagnosis-panel'));
  revealTargets.forEach(el=>el.classList.add('rb-reveal'));
  if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('rb-inview');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -50px'});revealTargets.forEach(el=>io.observe(el))}else revealTargets.forEach(el=>el.classList.add('rb-inview'));

  document.querySelectorAll('.brand-mark,.hero-motif').forEach(el=>el.classList.add('rb-float'));

  if(!document.querySelector('script[src*="rebloom-detail.js"]')){
    const detail=document.createElement('script');detail.src='rebloom-detail.js?v=20260817p';detail.defer=true;document.body.appendChild(detail);
  }
})();
