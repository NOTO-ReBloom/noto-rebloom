(()=>{
  'use strict';
  const body=document.body;
  if(!body||body.classList.contains('rb-cinematic-ready')) return;
  body.classList.add('rb-cinematic-ready');

  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stage=document.createElement('div');
  stage.className='rb-cinema-stage';
  stage.setAttribute('aria-hidden','true');
  body.appendChild(stage);

  const fly=(x,y,count=18,spread=1)=>{
    if(reduce) return;
    for(let i=0;i<count;i++){
      const dot=document.createElement('i');
      dot.className='rb-cinema-fly';
      const a=(Math.PI*2/count)*i+(Math.random()-.5)*.42;
      const d=(75+Math.random()*185)*spread;
      dot.style.setProperty('--x',`${x}px`);dot.style.setProperty('--y',`${y}px`);
      dot.style.setProperty('--dx',`${Math.cos(a)*d}px`);dot.style.setProperty('--dy',`${Math.sin(a)*d+54}px`);
      dot.style.setProperty('--rot',`${(Math.random()-.5)*520}deg`);
      dot.style.setProperty('--s',`${8+Math.random()*22}px`);
      dot.style.setProperty('--dur',`${.48+Math.random()*.28}s`);
      stage.appendChild(dot);setTimeout(()=>dot.remove(),980);
    }
  };

  let splashBusy=false;
  const fullSplash=({x=.5,y=.58}={})=>{
    if(reduce||splashBusy) return;
    splashBusy=true;
    const sx=innerWidth*x,sy=innerHeight*y;
    fly(sx,sy,22,1.04);
    const sheet=document.createElement('div');
    sheet.className='rb-cinema-screen';
    sheet.style.setProperty('--sx',`${x*100}%`);sheet.style.setProperty('--sy',`${y*100}%`);
    stage.appendChild(sheet);
    requestAnimationFrame(()=>requestAnimationFrame(()=>sheet.classList.add('is-impact')));
    body.classList.add('rb-cinema-obscured');
    setTimeout(()=>sheet.classList.add('is-drain'),350);
    setTimeout(()=>{sheet.remove();body.classList.remove('rb-cinema-obscured');splashBusy=false},1080);
  };

  const observeOnce=(target,callback,{threshold=.2,rootMargin='0px 0px -12% 0px'}={})=>{
    if(!target) return;
    if(reduce||!('IntersectionObserver' in window)){callback(target);return}
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(!e.isIntersecting)return;
      io.disconnect();callback(e.target);
    }),{threshold,rootMargin});
    io.observe(target);
  };

  /* One memorable full-screen splash per browser tab, not one per page/section. */
  let signatureSeen=false;
  try{signatureSeen=sessionStorage.getItem('rb-mud-signature-v2')==='1'}catch(_){/* storage may be unavailable */}
  if(!signatureSeen&&(page==='index.html'||page==='event.html')){
    const target=page==='index.html'?document.querySelector('#rb-fun-day'):document.querySelector('.game-grid');
    observeOnce(target,()=>{
      fullSplash(page==='index.html'?{x:.72,y:.65}:{x:.52,y:.70});
      try{sessionStorage.setItem('rb-mud-signature-v2','1')}catch(_){/* no-op */}
    },{threshold:page==='index.html'?.18:.24});
  }

  const flowerBurst=(target,count=20)=>{
    if(reduce||!target)return;
    const r=target.getBoundingClientRect();
    const cx=r.left+r.width*.5,cy=Math.max(80,Math.min(innerHeight-80,r.top+r.height*.45));
    const colors=['#f4cf58','#e99a91','#9bbd7c','#c5a7d8','#f1b6cb'];
    for(let i=0;i<count;i++){
      const petal=document.createElement('i');petal.className='rb-cinema-petal';
      const a=(Math.PI*2/count)*i+(Math.random()-.5)*.5;const d=75+Math.random()*150;
      petal.style.left=`${cx}px`;petal.style.top=`${cy}px`;petal.style.setProperty('--px',`${Math.cos(a)*d}px`);petal.style.setProperty('--py',`${Math.sin(a)*d+35}px`);petal.style.setProperty('--ps',`${7+Math.random()*9}px`);petal.style.setProperty('--pr',`${Math.random()*180}deg`);petal.style.setProperty('--pc',colors[i%colors.length]);
      body.appendChild(petal);setTimeout(()=>petal.remove(),1250);
    }
  };

  if(page==='diagnosis.html'){
    const ribbon=document.querySelector('.rb-flower-ribbon')||document.querySelector('.page-hero--diagnosis');
    observeOnce(ribbon,t=>flowerBurst(t,18),{threshold:.2,rootMargin:'0px'});
  }

  /* The project overview remains the only substantial content-specific animation outside the event pages. */
  const diagramHTML=(caption='NOTO Re:Bloomの企画全体像')=>`<figure class="rb-illustration-card rb-project-diagram-card">
    <div class="rb-project-diagram" role="img" aria-label="使われない農地から、人が来て、泥ん子運動会で遊び、地域の人と話し、次の関わりにつなげるNOTO Re:Bloomの流れ">
      <svg viewBox="0 0 1000 330" preserveAspectRatio="none" aria-hidden="true"><path class="rb-project-route" d="M80 225 C170 225 190 90 290 90 S390 235 495 225 S600 82 700 88 S805 220 920 220"/><path class="rb-project-route-draw" d="M80 225 C170 225 190 90 290 90 S390 235 495 225 S600 82 700 88 S805 220 920 220"/></svg>
      <i class="rb-project-traveller" aria-hidden="true"></i>
      <div class="rb-project-node rb-project-node--1"><span>土</span><strong>使われない農地</strong></div>
      <div class="rb-project-node rb-project-node--2"><span>来</span><strong>人が来る</strong></div>
      <div class="rb-project-node rb-project-node--3"><span>泥</span><strong>泥ん子運動会</strong></div>
      <div class="rb-project-node rb-project-node--4"><span>話</span><strong>地域で話す</strong></div>
      <div class="rb-project-node rb-project-node--5"><span>次</span><strong>次の関わりへ</strong></div>
    </div><figcaption>${caption}</figcaption></figure>`;

  const replaceOverview=()=>{
    const replaceFigure=(fig)=>{
      if(!fig||fig.classList.contains('rb-project-diagram-card'))return;
      const oldCaption=fig.querySelector('figcaption')?.textContent?.trim()||'NOTO Re:Bloomの企画全体像';
      const holder=document.createElement('div');holder.innerHTML=diagramHTML(oldCaption);fig.replaceWith(holder.firstElementChild);
    };
    document.querySelectorAll('img[src*="project-overview.webp"]').forEach(img=>replaceFigure(img.closest('figure')));
    document.querySelectorAll('.rb-project-map-card').forEach(replaceFigure);
    document.querySelectorAll('.rb-project-diagram').forEach(diagram=>{
      if(diagram.dataset.rbObserved)return;diagram.dataset.rbObserved='1';
      observeOnce(diagram,()=>diagram.classList.add('is-visible'),{threshold:.25,rootMargin:'0px 0px -8% 0px'});
    });
  };
  replaceOverview();
  if('MutationObserver' in window){
    const mo=new MutationObserver(()=>replaceOverview());
    mo.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>mo.disconnect(),3000);
  }

  /* Partner page stays calmer: one connection field, no mud transition. */
  if(page==='partner.html'){
    const partnerSection=document.querySelector('#current-partners');
    if(partnerSection){
      partnerSection.classList.add('rb-cinema-connected');
      const field=document.createElement('div');field.className='rb-cinema-connect-field';field.setAttribute('aria-hidden','true');
      for(let i=0;i<5;i++){const p=document.createElement('i');p.style.setProperty('--ci',i);field.appendChild(p)}
      partnerSection.appendChild(field);
      observeOnce(partnerSection,()=>partnerSection.classList.add('is-connected'),{threshold:.24});
    }
  }
})();
