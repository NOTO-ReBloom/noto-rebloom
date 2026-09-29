(()=>{
  'use strict';
  let corePromise=null;
  let stylePromise=null;
  let loaded=false;
  let atlasTriggered=false;

  const legacyStyles=[
    'diagnosis-v2.css?v=20260926scale3',
    'diagnosis-fixes.css?v=20260919font1',
    'diagnosis-ux-v3.css?v=20260928font1'
  ];
  const coreScripts=[
    'diagnosis.js?v=20260927rich2',
    'diagnosis-visual-v2.js?v=20260929clean2'
  ];

  const addStyle=(href)=>new Promise((resolve,reject)=>{
    if(document.querySelector(`link[href="${href}"]`))return resolve();
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=href;
    link.onload=resolve;
    link.onerror=reject;
    const anchor=document.querySelector('link[href*="diagnosis-2026.css"]');
    if(anchor)anchor.before(link); else document.head.appendChild(link);
  });

  const addScript=(src)=>new Promise((resolve,reject)=>{
    const existing=document.querySelector(`script[src="${src}"]`);
    if(existing){
      if(existing.dataset.loaded==='1')return resolve();
      existing.addEventListener('load',resolve,{once:true});
      existing.addEventListener('error',reject,{once:true});
      return;
    }
    const s=document.createElement('script');
    s.src=src;
    s.onload=()=>{s.dataset.loaded='1';resolve();};
    s.onerror=reject;
    document.body.appendChild(s);
  });

  const loadLegacyStyles=()=>{
    if(!stylePromise)stylePromise=Promise.all(legacyStyles.map(addStyle));
    return stylePromise;
  };

  const loadCore=()=>{
    if(corePromise)return corePromise;
    document.documentElement.classList.add('diagnosis-core-loading');
    corePromise=loadLegacyStyles()
      .then(()=>addScript(coreScripts[0]))
      .then(()=>addScript(coreScripts[1]))
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


  document.addEventListener('click',async event=>{
    const anchor=event.target.closest?.('a[href="#flower-atlas"]');
    if(!anchor||loaded)return;
    event.preventDefault();
    anchor.dataset.loading='1';
    try{
      await loadCore();
      document.getElementById('flower-atlas')?.scrollIntoView({behavior:'smooth',block:'start'});
      history.replaceState(null,'','#flower-atlas');
    }finally{
      delete anchor.dataset.loading;
    }
  },true); // flower-atlas-link

  addEventListener('hashchange',()=>{
    if(location.hash==='#flower-atlas'&&!loaded)loadCore().catch(()=>{});
  });

  const atlas=document.getElementById('flower-atlas');
  let io=null;
  const stopAtlasWatch=()=>{
    io?.disconnect();
    removeEventListener('scroll',maybeLoadAtlas);
    document.removeEventListener('scroll',maybeLoadAtlas,true);
    removeEventListener('resize',maybeLoadAtlas);
  };
  const maybeLoadAtlas=()=>{
    if(!atlas||atlasTriggered||loaded)return;
    const rect=atlas.getBoundingClientRect();
    if(rect.top<innerHeight+180&&rect.bottom>-180){
      atlasTriggered=true;
      stopAtlasWatch();
      loadCore().catch(()=>{});
    }
  };

  if(atlas){
    addEventListener('scroll',maybeLoadAtlas,{passive:true});
    document.addEventListener('scroll',maybeLoadAtlas,{passive:true,capture:true});
    addEventListener('resize',maybeLoadAtlas,{passive:true});
    if('IntersectionObserver' in window){
      io=new IntersectionObserver(entries=>{
        if(entries.some(e=>e.isIntersecting)){
          atlasTriggered=true;
          stopAtlasWatch();
          loadCore().catch(()=>{});
        }
      },{rootMargin:'120px 0px'});
      io.observe(atlas);
    }
    requestAnimationFrame(maybeLoadAtlas);
  }

  /* Existing users should see their saved/partial diagnosis immediately after reload. */
  try{
    const saved=JSON.parse(localStorage.getItem('rebloom-flower-diagnosis-v4')||'null');
    if(saved&&saved.version==='2026-09-26-v4'&&(
      saved.completed===true||
      (Array.isArray(saved.answers)&&saved.answers.length>0)
    )){
      loadCore().catch(()=>{});
    }
  }catch{}

  [...legacyStyles,...coreScripts].forEach(href=>{
    const l=document.createElement('link');
    l.rel='prefetch';
    l.href=href;
    if(href.endsWith('.css')||href.includes('.css?'))l.as='style'; else l.as='script';
    document.head.appendChild(l);
  });
})();