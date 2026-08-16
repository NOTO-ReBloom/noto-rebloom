(()=>{
  'use strict';

  const body=document.body;
  if(!body||body.classList.contains('rb-detail-ready')) return;
  body.classList.add('rb-detail-ready');

  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer=window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* Page progress. Reuse nothing from the old implementation so the visual is identical on every page. */
  let progress=document.querySelector('.rb-detail-progress');
  if(!progress){
    progress=document.createElement('div');
    progress.className='rb-detail-progress';
    progress.setAttribute('aria-hidden','true');
    progress.innerHTML='<span></span>';
    body.appendChild(progress);
  }

  /* Give long sections a quiet atmosphere and connect some sections visually. */
  const sections=[...document.querySelectorAll('main>section')];
  sections.forEach((section,index)=>{
    section.classList.add('rb-section-atmosphere');
    if(index<sections.length-1 && index%2===0 && !section.classList.contains('conversion-band') && !section.classList.contains('section--soil')){
      const thread=document.createElement('span');
      thread.className='rb-section-thread';
      thread.setAttribute('aria-hidden','true');
      section.appendChild(thread);
    }
  });

  /* Cards share one tactile language across the entire site. */
  const cardSelector=[
    '.nr-choice','.visual-tile','.join-fact','.summary-grid>div',
    '.event-values article','.definition-card','.cause-grid article','.game-grid article',
    '.check-list>div','.nr-value-grid article','.industry-grid article','.faq-card',
    '.story-step','.rb-illustration-card','.flower-group-card','.flower-atlas-card',
    '.diagnosis-start-card','.nr-main-sponsor'
  ].join(',');
  document.querySelectorAll(cardSelector).forEach(el=>el.classList.add('rb-detail-card'));

  /* Reveal choreography. Interactive diagnosis panels/results are deliberately excluded. */
  const unsafeParent='dialog,.diagnosis-panel,.diagnosis-result,[hidden]';
  const revealGroups=[
    ['.section-heading,.visual-mosaic-head,.rb-illustration-head,.people-trust-copy,.nr-section-head',0,'left'],
    ['.photo-frame,.people-trust-photo',80,'right'],
    ['.visual-tile,.nr-choice,.join-fact,.summary-grid>div,.event-values article,.definition-card,.cause-grid article,.game-grid article,.check-list>div,.nr-value-grid article,.industry-grid article,.faq-card,.story-step,.rb-illustration-card,.flower-group-card',60,'up']
  ];

  const revealSet=new Set();
  revealGroups.forEach(([selector,step,direction])=>{
    document.querySelectorAll(selector).forEach((el,i)=>{
      if(el.closest(unsafeParent)) return;
      el.classList.add('rb-detail-reveal');
      if(direction!=='up') el.dataset.rbReveal=direction;
      el.style.setProperty('--rb-reveal-delay',`${Math.min((i%6)*step,300)}ms`);
      revealSet.add(el);
    });
  });

  /* Event timeline gets its own tiny sequence. */
  document.querySelectorAll('.event-flow article').forEach((el,i)=>{
    el.classList.add('rb-detail-reveal');
    el.style.setProperty('--rb-reveal-delay',`${i*100}ms`);
    revealSet.add(el);
  });

  if(!reduced && 'IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        entry.target.classList.add('rb-detail-inview','rb-inview');
        io.unobserve(entry.target);
      });
    },{threshold:.09,rootMargin:'0px 0px -7% 0px'});
    revealSet.forEach(el=>io.observe(el));
  }else{
    revealSet.forEach(el=>el.classList.add('rb-detail-inview','rb-inview'));
  }

  /* Pointer light follows only the card currently under the cursor. */
  if(finePointer&&!reduced){
    document.addEventListener('pointermove',event=>{
      const card=event.target.closest?.('.rb-detail-card');
      if(!card) return;
      const rect=card.getBoundingClientRect();
      if(!rect.width||!rect.height) return;
      const x=((event.clientX-rect.left)/rect.width)*100;
      const y=((event.clientY-rect.top)/rect.height)*100;
      card.style.setProperty('--rb-card-x',`${Math.max(0,Math.min(100,x))}%`);
      card.style.setProperty('--rb-card-y',`${Math.max(0,Math.min(100,y))}%`);
    },{passive:true});
  }

  /* Scroll-linked values: one RAF per visual frame, no layout-heavy animation loop. */
  let ticking=false;
  const updateScroll=()=>{
    ticking=false;
    const y=window.scrollY||window.pageYOffset||0;
    const doc=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    const ratio=Math.max(0,Math.min(1,y/doc));
    body.style.setProperty('--rb-page-progress',ratio.toFixed(4));
    body.classList.toggle('rb-scrolled',y>18);

    if(!reduced){
      const heroShift=Math.max(-38,Math.min(38,y*.045));
      const bgShift=Math.max(-24,Math.min(24,y*.025));
      const mediaShift=Math.max(-26,Math.min(20,y*.032));
      body.style.setProperty('--rb-hero-shift',`${heroShift.toFixed(2)}px`);
      body.style.setProperty('--rb-bg-shift',`${bgShift.toFixed(2)}px`);
      body.style.setProperty('--rb-media-shift',`${mediaShift.toFixed(2)}px`);
      body.style.setProperty('--rb-hero-rotate',`${Math.min(1.4,y*.0015).toFixed(2)}deg`);
      body.style.setProperty('--rb-flow-shift',`${(y*.08).toFixed(1)}px`);

      document.querySelectorAll('.rb-text-heavy').forEach(section=>{
        const r=section.getBoundingClientRect();
        const local=(window.innerHeight-r.top)*.012;
        section.style.setProperty('--rb-grid-y',`${local.toFixed(1)}px`);
        section.style.setProperty('--rb-grid-x',`${(-local*.35).toFixed(1)}px`);
      });
    }
  };
  const requestScrollUpdate=()=>{
    if(ticking) return;
    ticking=true;
    requestAnimationFrame(updateScroll);
  };
  window.addEventListener('scroll',requestScrollUpdate,{passive:true});
  window.addEventListener('resize',requestScrollUpdate,{passive:true});
  updateScroll();

  requestAnimationFrame(()=>requestAnimationFrame(()=>body.classList.add('rb-page-entered')));

  document.querySelectorAll('main img').forEach(img=>{
    img.classList.add('rb-detail-image');
    if(img.complete) img.classList.add('rb-image-loaded');
    else img.addEventListener('load',()=>img.classList.add('rb-image-loaded'),{once:true});
  });

  if(document.body.classList.contains('page-diagnosis')&&'MutationObserver' in window){
    const atlas=document.querySelector('#flowerAtlasGrid');
    if(atlas){
      const decorate=()=>atlas.querySelectorAll('.flower-atlas-card').forEach(el=>el.classList.add('rb-detail-card'));
      decorate();
      new MutationObserver(decorate).observe(atlas,{childList:true,subtree:true});
    }
  }

  /* The playful mud layer is isolated from the layout and diagnosis logic. */
  if(!document.querySelector('link[href*="rebloom-mudfx.css"]')){
    const mudStyle=document.createElement('link');
    mudStyle.rel='stylesheet';
    mudStyle.href='rebloom-mudfx.css?v=20260817g';
    document.head.appendChild(mudStyle);
  }
  if(!document.querySelector('script[src*="rebloom-mudfx.js"]')){
    const mudScript=document.createElement('script');
    mudScript.src='rebloom-mudfx.js?v=20260817g';
    mudScript.defer=true;
    document.body.appendChild(mudScript);
  }

  /* Student-led fun layer: participation energy without touching core content or forms. */
  if(!document.querySelector('link[href*="rebloom-fun.css"]')){
    const funStyle=document.createElement('link');
    funStyle.rel='stylesheet';
    funStyle.href='rebloom-fun.css?v=20260817h';
    document.head.appendChild(funStyle);
  }
  if(!document.querySelector('script[src*="rebloom-fun.js"]')){
    const funScript=document.createElement('script');
    funScript.src='rebloom-fun.js?v=20260817h';
    funScript.defer=true;
    document.body.appendChild(funScript);
  }
})();
