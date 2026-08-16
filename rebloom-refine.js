(()=>{
  'use strict';
  const body=document.body;
  if(!body||body.classList.contains('rb-refine-ready')) return;
  body.classList.add('rb-refine-ready');

  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Animate the project overview only when it becomes meaningful on screen. */
  const maps=[...document.querySelectorAll('.rb-project-map')];
  if(reduced||!('IntersectionObserver' in window)){
    maps.forEach(map=>map.classList.add('is-visible'));
  }else{
    const mapObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      mapObserver.unobserve(entry.target);
    }),{threshold:.34,rootMargin:'0px 0px -8% 0px'});
    maps.forEach(map=>mapObserver.observe(map));
  }

  /* One signature mud splash only: event program, once per browser session. */
  if(page!=='event.html'||reduced) return;
  const program=document.querySelector('.game-grid');
  if(!program) return;

  const key='rb-refine-event-splash-v1';
  let already=false;
  try{already=sessionStorage.getItem(key)==='1'}catch(_){/* storage can be blocked */}
  if(already) return;

  const splash=()=>{
    try{sessionStorage.setItem(key,'1')}catch(_){/* no-op */}
    const sheet=document.createElement('div');
    sheet.className='rb-refine-splash';
    sheet.setAttribute('aria-hidden','true');
    body.appendChild(sheet);

    for(let i=0;i<16;i++){
      const dot=document.createElement('i');
      dot.className='rb-refine-drop';
      const angle=(Math.PI*2/16)*i+(Math.random()-.5)*.38;
      const distance=95+Math.random()*180;
      dot.style.setProperty('--s',`${8+Math.random()*22}px`);
      dot.style.setProperty('--x',`${Math.cos(angle)*distance}px`);
      dot.style.setProperty('--y',`${Math.sin(angle)*distance+45}px`);
      dot.style.setProperty('--r',`${(Math.random()-.5)*600}deg`);
      body.appendChild(dot);
      setTimeout(()=>dot.remove(),900);
    }

    requestAnimationFrame(()=>requestAnimationFrame(()=>sheet.classList.add('is-hit')));
    setTimeout(()=>sheet.classList.add('is-drain'),360);
    setTimeout(()=>sheet.remove(),1080);
  };

  if(!('IntersectionObserver' in window)){splash();return}
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting) return;
    observer.disconnect();
    splash();
  }),{threshold:.28,rootMargin:'0px 0px -14% 0px'});
  observer.observe(program);
})();
