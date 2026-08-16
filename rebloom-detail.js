(()=>{
  'use strict';

  const body=document.body;
  if(!body||body.classList.contains('rb-detail-ready')) return;
  body.classList.add('rb-detail-ready');

  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer=window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  let progress=document.querySelector('.rb-detail-progress');
  if(!progress){
    progress=document.createElement('div');
    progress.className='rb-detail-progress';
    progress.setAttribute('aria-hidden','true');
    progress.innerHTML='<span></span>';
    body.appendChild(progress);
  }

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

  const cardSelector=[
    '.nr-choice','.visual-tile','.join-fact','.summary-grid>div',
    '.event-values article','.definition-card','.cause-grid article','.game-grid article',
    '.check-list>div','.nr-value-grid article','.industry-grid article','.faq-card',
    '.story-step','.rb-illustration-card','.flower-group-card','.flower-atlas-card',
    '.diagnosis-start-card','.nr-main-sponsor'
  ].join(',');
  document.querySelectorAll(cardSelector).forEach(el=>el.classList.add('rb-detail-card'));

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

  document.querySelectorAll('.event-flow article').forEach((el,i)=>{
    el.classList.add('rb-detail-reveal');
    el.style.setProperty('--rb-reveal-delay',`${i*90}ms`);
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

  let ticking=false;
  const updateScroll=()=>{
    ticking=false;
    const y=window.scrollY||window.pageYOffset||0;
    const doc=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    const ratio=Math.max(0,Math.min(1,y/doc));
    body.style.setProperty('--rb-page-progress',ratio.toFixed(4));
    body.classList.toggle('rb-scrolled',y>18);

    if(!reduced){
      const heroShift=Math.max(-30,Math.min(30,y*.035));
      const bgShift=Math.max(-18,Math.min(18,y*.02));
      const mediaShift=Math.max(-20,Math.min(16,y*.025));
      body.style.setProperty('--rb-hero-shift',`${heroShift.toFixed(2)}px`);
      body.style.setProperty('--rb-bg-shift',`${bgShift.toFixed(2)}px`);
      body.style.setProperty('--rb-media-shift',`${mediaShift.toFixed(2)}px`);
      body.style.setProperty('--rb-hero-rotate',`${Math.min(.8,y*.001).toFixed(2)}deg`);
      body.style.setProperty('--rb-flow-shift',`${(y*.05).toFixed(1)}px`);

      document.querySelectorAll('.rb-text-heavy').forEach(section=>{
        const r=section.getBoundingClientRect();
        const local=(window.innerHeight-r.top)*.008;
        section.style.setProperty('--rb-grid-y',`${local.toFixed(1)}px`);
        section.style.setProperty('--rb-grid-x',`${(-local*.25).toFixed(1)}px`);
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

  /* One final experience layer replaces the former mud + fun + cinematic stack. */
  if(!document.querySelector('link[href*="rebloom-refine.css"]')){
    const refineStyle=document.createElement('link');
    refineStyle.rel='stylesheet';
    refineStyle.href='rebloom-refine.css?v=20260817l';
    document.head.appendChild(refineStyle);
  }
  if(!document.querySelector('script[src*="rebloom-refine.js"]')){
    const refineScript=document.createElement('script');
    refineScript.src='rebloom-refine.js?v=20260817l';
    refineScript.defer=true;
    document.body.appendChild(refineScript);
  }
})();
