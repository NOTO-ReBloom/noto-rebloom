(()=>{
  'use strict';
  let corePromise=null;
  let loaded=false;

  const addScript=(src)=>new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src;
    s.defer=true;
    s.onload=resolve;
    s.onerror=reject;
    document.body.appendChild(s);
  });

  const loadCore=()=>{
    if(corePromise)return corePromise;
    document.documentElement.classList.add('diagnosis-core-loading');
    corePromise=addScript('diagnosis.js?v=20260927rich2')
      .then(()=>addScript('diagnosis-visual-v2.js?v=20260927rich3'))
      .then(()=>{
        loaded=true;
        document.documentElement.classList.remove('diagnosis-core-loading');
        document.documentElement.classList.add('diagnosis-core-ready');
      })
      .catch(err=>{
        corePromise=null;
        document.documentElement.classList.remove('diagnosis-core-loading');
        console.error('Diagnosis core load failed',err);
        throw err;
      });
    return corePromise;
  };

  const triggerIds=new Set(['startDiagnosis','resumeDiagnosis','mobileStartDiagnosis']);
  document.addEventListener('click',async event=>{
    const button=event.target.closest?.('button,a');
    if(!button||!triggerIds.has(button.id)||loaded)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const original=button.textContent;
    button.disabled=true;
    button.textContent='診断を準備しています…';
    try{
      await loadCore();
      button.disabled=false;
      button.textContent=original;
      requestAnimationFrame(()=>button.click());
    }catch{
      button.disabled=false;
      button.textContent='読み込みに失敗しました。もう一度お試しください';
    }
  },true);

  const atlas=document.getElementById('flower-atlas');
  if(atlas&&'IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting)){
        io.disconnect();
        loadCore().catch(()=>{});
      }
    },{rootMargin:'900px 0px'});
    io.observe(atlas);
  }else if(atlas){
    const onScroll=()=>{
      if(atlas.getBoundingClientRect().top<innerHeight+900){
        removeEventListener('scroll',onScroll);
        loadCore().catch(()=>{});
      }
    };
    addEventListener('scroll',onScroll,{passive:true});
  }

  ['diagnosis.js?v=20260927rich2','diagnosis-visual-v2.js?v=20260927rich3'].forEach(href=>{
    const l=document.createElement('link');
    l.rel='prefetch';
    l.as='script';
    l.href=href;
    document.head.appendChild(l);
  });
})();