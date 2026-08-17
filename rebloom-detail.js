(()=>{
  'use strict';
  const body=document.body;
  if(!body||body.classList.contains('rb-detail-ready'))return;
  body.classList.add('rb-detail-ready');

  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let progress=document.querySelector('.rb-detail-progress');
  if(!progress){progress=document.createElement('div');progress.className='rb-detail-progress';progress.setAttribute('aria-hidden','true');progress.innerHTML='<span></span>';body.appendChild(progress)}

  /* Atmosphere remains, but the old decorative threads are deliberately gone. */
  [...document.querySelectorAll('main>section')].forEach(section=>section.classList.add('rb-section-atmosphere'));
  document.querySelectorAll('.rb-section-thread').forEach(el=>el.remove());

  const cardSelector=[
    '.nr-choice','.visual-tile','.join-fact','.summary-grid>div','.event-values article','.definition-card','.cause-grid article','.game-grid article',
    '.check-list>div','.nr-value-grid article','.industry-grid article','.faq-card','.story-step','.rb-illustration-card','.flower-group-card','.flower-atlas-card',
    '.diagnosis-start-card','.nr-main-sponsor'
  ].join(',');
  document.querySelectorAll(cardSelector).forEach(el=>el.classList.add('rb-detail-card'));

  /* One simple reveal language. No sideways/card-by-card spectacle. */
  const unsafeParent='dialog,.diagnosis-panel,.diagnosis-result,[hidden]';
  const targets=[...document.querySelectorAll('.section-heading,.visual-mosaic-head,.rb-illustration-head,.people-trust-copy,.nr-section-head,.photo-frame,.people-trust-photo,.visual-tile,.nr-choice,.join-fact,.summary-grid>div,.event-values article,.definition-card,.cause-grid article,.game-grid article,.check-list>div,.nr-value-grid article,.industry-grid article,.faq-card,.story-step,.rb-illustration-card,.flower-group-card,.event-flow article')].filter(el=>!el.closest(unsafeParent));
  targets.forEach((el,i)=>{el.classList.add('rb-detail-reveal');el.style.setProperty('--rb-reveal-delay',`${Math.min((i%4)*35,105)}ms`)});
  if(!reduced&&'IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add('rb-detail-inview','rb-inview');io.unobserve(entry.target)}),{threshold:.08,rootMargin:'0px 0px -5% 0px'});
    targets.forEach(el=>io.observe(el));
  }else targets.forEach(el=>el.classList.add('rb-detail-inview','rb-inview'));

  /* Subtle scroll depth only. */
  let ticking=false;
  const updateScroll=()=>{
    ticking=false;
    const y=window.scrollY||window.pageYOffset||0;
    const doc=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    body.style.setProperty('--rb-page-progress',Math.max(0,Math.min(1,y/doc)).toFixed(4));
    body.classList.toggle('rb-scrolled',y>18);
    if(!reduced){
      body.style.setProperty('--rb-hero-shift',`${Math.max(-20,Math.min(20,y*.024)).toFixed(2)}px`);
      body.style.setProperty('--rb-bg-shift',`${Math.max(-12,Math.min(12,y*.014)).toFixed(2)}px`);
      body.style.setProperty('--rb-media-shift',`${Math.max(-14,Math.min(12,y*.018)).toFixed(2)}px`);
      body.style.setProperty('--rb-hero-rotate',`${Math.min(.45,y*.00055).toFixed(2)}deg`);
      body.style.setProperty('--rb-flow-shift',`${(y*.03).toFixed(1)}px`);
    }
  };
  const ask=()=>{if(ticking)return;ticking=true;requestAnimationFrame(updateScroll)};
  addEventListener('scroll',ask,{passive:true});addEventListener('resize',ask,{passive:true});updateScroll();
  requestAnimationFrame(()=>requestAnimationFrame(()=>body.classList.add('rb-page-entered')));

  document.querySelectorAll('main img').forEach(img=>{img.classList.add('rb-detail-image');if(img.complete)img.classList.add('rb-image-loaded');else img.addEventListener('load',()=>img.classList.add('rb-image-loaded'),{once:true})});

  if(document.body.classList.contains('page-diagnosis')&&'MutationObserver' in window){
    const atlas=document.querySelector('#flowerAtlasGrid');
    if(atlas){const decorate=()=>atlas.querySelectorAll('.flower-atlas-card').forEach(el=>el.classList.add('rb-detail-card'));decorate();new MutationObserver(decorate).observe(atlas,{childList:true,subtree:true})}
  }

  /* Final loading order: refinement -> density -> structural cleanup -> hierarchy -> complete purpose pass. */
  const ensureStyle=(name,href)=>{
    let link=[...document.querySelectorAll('link[rel="stylesheet"]')].find(el=>(el.getAttribute('href')||'').includes(name));
    if(!link){link=document.createElement('link');link.rel='stylesheet'}link.href=href;document.head.appendChild(link);
  };
  const ensureScript=(name,src)=>{
    const existing=document.querySelector(`script[src*="${name}"]`);
    if(existing)return existing;
    const script=document.createElement('script');script.src=src;script.async=false;document.body.appendChild(script);return script;
  };
  ensureStyle('rebloom-refine.css','rebloom-refine.css?v=20260817n');
  ensureStyle('rebloom-balance.css','rebloom-balance.css?v=20260817n');
  ensureStyle('rebloom-tight.css','rebloom-tight.css?v=20260817n');
  ensureStyle('rebloom-purpose.css','rebloom-purpose.css?v=20260817p');
  ensureStyle('rebloom-purpose-complete.css','rebloom-purpose-complete.css?v=20260817p');
  ensureScript('rebloom-refine.js','rebloom-refine.js?v=20260817n');
  ensureScript('rebloom-tight.js','rebloom-tight.js?v=20260817n');
  ensureScript('rebloom-purpose.js','rebloom-purpose.js?v=20260817p');
  ensureScript('rebloom-purpose-complete.js','rebloom-purpose-complete.js?v=20260817p');
})();
