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

  const addResidue=()=>{
    if(reduce)return;
    ['left','right'].forEach((side,i)=>{
      const mark=document.createElement('i');
      mark.className=`rb-cinema-residue rb-cinema-residue--${side}`;
      mark.style.setProperty('--rr',`${i?18:-16}deg`);
      stage.appendChild(mark);
      requestAnimationFrame(()=>mark.classList.add('is-show'));
      setTimeout(()=>mark.remove(),1850);
    });
  };

  let splashBusy=false;
  const fullSplash=({x=.5,y=.55,soft=false}={})=>{
    if(reduce||splashBusy) return;
    splashBusy=true;
    const sx=innerWidth*x, sy=innerHeight*y;
    fly(sx,sy,soft?16:30,soft?.82:1.2);
    const sheet=document.createElement('div');
    sheet.className='rb-cinema-screen'+(soft?' is-soft':'');
    sheet.style.setProperty('--sx',`${x*100}%`);sheet.style.setProperty('--sy',`${y*100}%`);
    stage.appendChild(sheet);
    requestAnimationFrame(()=>requestAnimationFrame(()=>sheet.classList.add('is-impact')));
    body.classList.add('rb-cinema-obscured');
    setTimeout(()=>sheet.classList.add('is-drain'),soft?330:410);
    setTimeout(addResidue,soft?620:720);
    setTimeout(()=>{sheet.remove();body.classList.remove('rb-cinema-obscured');splashBusy=false},soft?1040:1190);
  };

  const flowerBurst=(target,count=20)=>{
    if(reduce||!target)return;
    const r=target.getBoundingClientRect();
    const cx=r.left+r.width*.5,cy=Math.max(80,Math.min(innerHeight-80,r.top+r.height*.45));
    const colors=['#f4cf58','#e99a91','#9bbd7c','#c5a7d8','#f1b6cb'];
    for(let i=0;i<count;i++){
      const petal=document.createElement('i');petal.className='rb-cinema-petal';
      const a=(Math.PI*2/count)*i+(Math.random()-.5)*.5;const d=90+Math.random()*190;
      petal.style.left=`${cx}px`;petal.style.top=`${cy}px`;petal.style.setProperty('--px',`${Math.cos(a)*d}px`);petal.style.setProperty('--py',`${Math.sin(a)*d+45}px`);petal.style.setProperty('--ps',`${7+Math.random()*10}px`);petal.style.setProperty('--pr',`${Math.random()*180}deg`);petal.style.setProperty('--pc',colors[i%colors.length]);
      body.appendChild(petal);setTimeout(()=>petal.remove(),1350);
    }
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

  /* One bold mud impact per page, tied to the page's central idea. */
  const sceneConfigs={
    'index.html':[{selector:'#rb-fun-day',x:.72,y:.66,threshold:.16},{selector:'#people-behind-project',x:.24,y:.48,threshold:.25,soft:true}],
    'event.html':[{selector:'.game-grid',x:.52,y:.73,threshold:.24}],
    'learn.html':[{selector:'#rb-learn-illustrations',x:.5,y:.68,threshold:.18},{selector:'#numbers',x:.2,y:.54,threshold:.3,soft:true}],
    'partner.html':[{selector:'#current-partners',x:.3,y:.58,threshold:.24,soft:true}]
  };
  (sceneConfigs[page]||[]).forEach(cfg=>{
    const target=document.querySelector(cfg.selector);
    observeOnce(target,()=>fullSplash(cfg),{threshold:cfg.threshold||.2});
  });

  /* Flower-related content gets flower motion instead of an unrelated mud wipe. */
  if(page==='event.html'){
    const flowerSection=[...document.querySelectorAll('.section--mint')].find(s=>s.querySelector('img[src*="renge"]'));
    observeOnce(flowerSection,t=>flowerBurst(t,18),{threshold:.28});
  }
  if(page==='diagnosis.html'){
    const ribbon=document.querySelector('.rb-flower-ribbon')||document.querySelector('.page-hero--diagnosis');
    observeOnce(ribbon,t=>flowerBurst(t,26),{threshold:.2,rootMargin:'0px'});
  }

  /* The project overview is a live DOM/SVG diagram, never a flat image. */
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
      observeOnce(diagram,()=>diagram.classList.add('is-visible'),{threshold:.28,rootMargin:'0px 0px -8% 0px'});
    });
  };
  replaceOverview();
  if('MutationObserver' in window){
    const mo=new MutationObserver(()=>replaceOverview());
    mo.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>mo.disconnect(),4000);
  }

  /* Local mud masks: the wipe itself explains that the content is about mud. */
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

  if(page==='event.html') prepareLocalReveal('.game-grid',':scope > article',115);
  if(page==='learn.html') prepareLocalReveal('#numbers .data-grid',':scope > article',120);
  if(page==='partner.html') prepareLocalReveal('#current-partners','.nr-main-sponsor',0);

  if(page==='learn.html'){
    const numbers=document.querySelector('#numbers .data-grid');
    if(numbers) observeOnce(numbers,()=>numbers.querySelectorAll('article').forEach((el,i)=>setTimeout(()=>el.classList.add('rb-number-clean'),i*130)),{threshold:.32});
  }

  /* Sponsor/cooperation content uses connection motion. */
  if(page==='partner.html'){
    const partnerSection=document.querySelector('#current-partners');
    if(partnerSection){
      partnerSection.classList.add('rb-cinema-connected');
      const field=document.createElement('div');field.className='rb-cinema-connect-field';field.setAttribute('aria-hidden','true');
      for(let i=0;i<5;i++){const p=document.createElement('i');p.style.setProperty('--ci',i);field.appendChild(p)}
      partnerSection.appendChild(field);
      observeOnce(partnerSection,()=>partnerSection.classList.add('is-connected'),{threshold:.22});
    }
  }

  /* Edge splashes mark chapter changes while staying away from reading lines. */
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
