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
      const a=(Math.PI*2/count)*i+(Math.random()-.5)*.48;
      const d=(80+Math.random()*220)*spread;
      dot.style.setProperty('--x',`${x}px`);dot.style.setProperty('--y',`${y}px`);
      dot.style.setProperty('--dx',`${Math.cos(a)*d}px`);dot.style.setProperty('--dy',`${Math.sin(a)*d+70}px`);
      dot.style.setProperty('--rot',`${(Math.random()-.5)*720}deg`);
      dot.style.setProperty('--s',`${8+Math.random()*28}px`);
      dot.style.setProperty('--dur',`${.5+Math.random()*.34}s`);
      stage.appendChild(dot);
      setTimeout(()=>dot.remove(),1050);
    }
  };

  let splashBusy=false;
  const fullSplash=({x=.5,y=.55,soft=false}={})=>{
    if(reduce||splashBusy) return;
    splashBusy=true;
    const sx=innerWidth*x, sy=innerHeight*y;
    fly(sx,sy,soft?12:22,soft?.75:1.08);
    const sheet=document.createElement('div');
    sheet.className='rb-cinema-screen'+(soft?' is-soft':'');
    sheet.style.setProperty('--sx',`${x*100}%`);sheet.style.setProperty('--sy',`${y*100}%`);
    stage.appendChild(sheet);
    requestAnimationFrame(()=>requestAnimationFrame(()=>sheet.classList.add('is-impact')));
    body.classList.add('rb-cinema-obscured');
    setTimeout(()=>sheet.classList.add('is-drain'),soft?300:370);
    setTimeout(()=>{sheet.remove();body.classList.remove('rb-cinema-obscured');splashBusy=false},soft?990:1120);
  };

  const observeOnce=(target,callback,{threshold=.2,rootMargin='0px 0px -12% 0px'}={})=>{
    if(!target) return;
    if(reduce||!('IntersectionObserver' in window)){callback(target);return}
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(!e.isIntersecting) return;
      io.disconnect();callback(e.target);
    }),{threshold,rootMargin});
    io.observe(target);
  };

  /* Cinematic splashes only at meaningful content changes. */
  const sceneConfigs={
    'index.html':[{selector:'#rb-fun-day',x:.72,y:.66,threshold:.16},{selector:'#people-behind-project',x:.24,y:.48,threshold:.25,soft:true}],
    'event.html':[{selector:'.game-grid',x:.52,y:.73,threshold:.24},{selector:'.section--mint',x:.78,y:.58,threshold:.27,soft:true}],
    'learn.html':[{selector:'#project',x:.5,y:.68,threshold:.2},{selector:'#numbers',x:.2,y:.54,threshold:.3,soft:true}],
    'partner.html':[{selector:'#current-partners',x:.3,y:.58,threshold:.24,soft:true}]
  };
  (sceneConfigs[page]||[]).forEach(cfg=>{
    const target=document.querySelector(cfg.selector);
    observeOnce(target,()=>fullSplash(cfg),{threshold:cfg.threshold||.2});
  });

  /* Replace every old project-overview image card with a living diagram. */
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

  const replaceOverviewImages=()=>{
    document.querySelectorAll('img[src*="project-overview.webp"]').forEach(img=>{
      const fig=img.closest('figure');
      if(!fig||fig.classList.contains('rb-project-diagram-card')) return;
      const oldCaption=fig.querySelector('figcaption')?.textContent?.trim()||'NOTO Re:Bloomの企画全体像';
      const holder=document.createElement('div');holder.innerHTML=diagramHTML(oldCaption);
      fig.replaceWith(holder.firstElementChild);
    });
    document.querySelectorAll('.rb-project-diagram').forEach(diagram=>{
      observeOnce(diagram,()=>diagram.classList.add('is-visible'),{threshold:.28,rootMargin:'0px 0px -8% 0px'});
    });
  };
  replaceOverviewImages();
  if('MutationObserver' in window){
    const mo=new MutationObserver(()=>replaceOverviewImages());
    mo.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>mo.disconnect(),4000);
  }

  /* Local mud masks are tied to actual content instead of random decoration. */
  const prepareLocalReveal=(containerSelector,itemSelector,step=90)=>{
    const container=document.querySelector(containerSelector);
    if(!container) return;
    const items=[...container.querySelectorAll(itemSelector)];
    if(!items.length) return;
    items.forEach(el=>{
      if(el.querySelector(':scope > .rb-cinema-local-mud')) return;
      el.classList.add('rb-cinema-local');
      const mud=document.createElement('i');mud.className='rb-cinema-local-mud';mud.setAttribute('aria-hidden','true');el.appendChild(mud);
    });
    observeOnce(container,()=>items.forEach((el,i)=>setTimeout(()=>el.classList.add('is-cleared'),i*step)),{threshold:.24});
  };

  if(page==='event.html') prepareLocalReveal('.game-grid',':scope > article',105);
  if(page==='learn.html') prepareLocalReveal('#numbers .data-grid',':scope > article',120);
  if(page==='partner.html') prepareLocalReveal('#current-partners','.nr-main-sponsor',0);

  if(page==='learn.html'){
    const numbers=document.querySelector('#numbers .data-grid');
    if(numbers) observeOnce(numbers,()=>numbers.querySelectorAll('article').forEach((el,i)=>setTimeout(()=>el.classList.add('rb-number-clean'),i*130)),{threshold:.32});
  }

  /* Edge splashes mark a new chapter, but sit outside the reading area. */
  const edgeTargets=[];
  if(page==='index.html') edgeTargets.push(document.querySelector('#origin'),document.querySelector('#people-behind-project'));
  if(page==='event.html') edgeTargets.push(document.querySelector('.event-flow-section'),document.querySelector('#event-faq'));
  if(page==='learn.html') edgeTargets.push(document.querySelector('#words'),document.querySelector('#project'));
  if(page==='partner.html') edgeTargets.push(document.querySelector('.nr-value-prop'),document.querySelector('#current-partners'));
  edgeTargets.filter(Boolean).forEach((section,i)=>{
    section.style.position=section.style.position||'relative';
    const splat=document.createElement('i');splat.className='rb-cinema-edge-splat';splat.setAttribute('aria-hidden','true');
    splat.style.top=i%2?'24px':'34px';splat.style[i%2?'left':'right']='max(12px,2.5vw)';splat.style.setProperty('--r',`${i%2?12:-13}deg`);
    section.appendChild(splat);
    observeOnce(section,()=>splat.classList.add('is-in'),{threshold:.18});
  });
})();
