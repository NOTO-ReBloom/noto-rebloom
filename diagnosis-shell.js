(()=>{
  'use strict';
  document.documentElement.classList.add('js');

  const body=document.body;
  const nav=document.getElementById('siteNav');
  const menu=document.querySelector('.menu-button');
  const back=document.querySelector('.back-top');
  const progress=document.querySelector('.scroll-progress span');

  const closeMenu=()=>{
    body.classList.remove('menu-open');
    menu?.setAttribute('aria-expanded','false');
  };
  menu?.addEventListener('click',()=>{
    const open=!body.classList.contains('menu-open');
    body.classList.toggle('menu-open',open);
    menu.setAttribute('aria-expanded',open?'true':'false');
  });
  nav?.addEventListener('click',event=>{
    if(event.target.closest('a'))closeMenu();
  });
  addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
  addEventListener('resize',()=>{if(innerWidth>1020)closeMenu();},{passive:true});

  const sameSite=(link)=>{
    if(!(link instanceof HTMLAnchorElement))return false;
    const href=link.getAttribute('href')||'';
    if(!href||/^(?:#|mailto:|tel:|javascript:)/i.test(href))return false;
    try{
      const url=new URL(href,location.href);
      return url.origin===location.origin&&url.pathname.startsWith('/noto-rebloom/');
    }catch{return false;}
  };
  document.querySelectorAll('a[href]').forEach(link=>{
    if(sameSite(link))link.removeAttribute('target');
    if(link.target==='_blank'){
      const rel=new Set((link.rel||'').split(/\s+/).filter(Boolean));
      rel.add('noopener');
      link.rel=[...rel].join(' ');
    }
  });

  const updateScroll=()=>{
    const max=Math.max(0,document.documentElement.scrollHeight-innerHeight);
    if(progress)progress.style.width=(max?scrollY/max*100:0)+'%';
    back?.classList.toggle('is-visible',scrollY>700);
  };
  addEventListener('scroll',updateScroll,{passive:true});
  addEventListener('resize',updateScroll,{passive:true});
  updateScroll();
  back?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

  const reveals=[...document.querySelectorAll('.reveal')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced||!('IntersectionObserver' in window)){
    reveals.forEach(el=>el.classList.add('is-visible'));
  }else{
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    },{threshold:.08,rootMargin:'0px 0px -40px'});
    reveals.forEach(el=>io.observe(el));
  }

  const loadCuteFont=()=>{
    if(document.querySelector('link[data-diagnosis-font]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500&display=swap';
    link.dataset.diagnosisFont='zen-maru-gothic';
    link.onload=()=>{document.documentElement.classList.add('diagnosis-cute-font-ready');};
    document.head.appendChild(link);
  };
  addEventListener('load',()=>{
    if('requestIdleCallback' in window)requestIdleCallback(loadCuteFont,{timeout:1800});
    else setTimeout(loadCuteFont,650);
  },{once:true});

  document.querySelectorAll('img').forEach((img,index)=>{
    if(!img.hasAttribute('decoding'))img.decoding='async';
    if(!img.closest('.page-hero')&&!img.hasAttribute('loading'))img.loading='lazy';
    if(img.closest('.page-hero')&&index<3&&!img.hasAttribute('fetchpriority'))img.fetchPriority='high';
  });
})();