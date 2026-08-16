(()=>{
  'use strict';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const body=document.body;
  body.classList.add('rb-mudfx-ready');

  const layer=document.createElement('div');
  layer.className='rb-mudfx-layer';
  layer.setAttribute('aria-hidden','true');
  document.body.appendChild(layer);

  const burst=(x,y,{count=9,energy=1,size=14,fall=true}={})=>{
    if(reduce) return;
    for(let i=0;i<count;i++){
      const d=document.createElement('i');
      d.className='rb-mud-drop'+(i%3?' rb-mud-small':'');
      const s=size*(.55+Math.random()*.9);
      d.style.setProperty('--s',`${s}px`);
      d.style.left=`${x}px`; d.style.top=`${y}px`;
      layer.appendChild(d);
      const angle=(-Math.PI*.92)+(Math.random()*Math.PI*.84);
      const distance=(54+Math.random()*105)*energy;
      const dx=Math.cos(angle)*distance;
      const up=Math.sin(angle)*distance-(35+Math.random()*65)*energy;
      const gravity=fall?(100+Math.random()*130)*energy:25;
      const rot=(Math.random()-.5)*540;
      const duration=520+Math.random()*360;
      const a=d.animate([
        {transform:'translate(-50%,-50%) scale(.45) rotate(0deg)',opacity:0},
        {offset:.12,transform:'translate(-50%,-50%) scale(1.1) rotate(8deg)',opacity:.94},
        {transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${up+gravity}px)) scale(.6) rotate(${rot}deg)`,opacity:0}
      ],{duration,easing:'cubic-bezier(.16,.78,.27,1)',fill:'forwards'});
      a.onfinish=()=>d.remove();
    }
  };

  const hero=document.querySelector('.hero,.page-hero');
  const heroCopy=document.querySelector('.hero-copy,.page-hero-grid>div');
  const wordMap={
    'index.html':['田んぼ','みんなの遊び場'],
    'event.html':['9月20日','泥ん子運動会'],
    'learn.html':['使われない農地','人が集まる場所'],
    'partner.html':['支援する','一緒につくる'],
    '404.html':['道に迷った','土の見える方へ']
  };

  if(hero&&heroCopy&&wordMap[page]){
    const [before,after]=wordMap[page];
    const word=document.createElement('span');
    word.className='rb-mud-word';
    word.setAttribute('aria-label',after);
    word.innerHTML=`<span class="rb-mud-word-before" aria-hidden="true">${before}</span><span class="rb-mud-word-after" aria-hidden="true">${after}</span>`;
    const eyebrow=heroCopy.querySelector('.eyebrow');
    eyebrow?.after(word);

    if(!reduce){
      const splat=document.createElement('i');
      splat.className='rb-hero-splat';
      splat.setAttribute('aria-hidden','true');
      hero.appendChild(splat);
      const strong=page==='index.html'||page==='event.html';
      setTimeout(()=>{
        if(strong) splat.classList.add('rb-splat-in');
        const r=word.getBoundingClientRect();
        const x=r.left+r.width*.58, y=r.top+r.height*.42;
        burst(x,y,{count:strong?16:9,energy:strong?1.15:.8,size:strong?17:12});
        word.classList.add('rb-mud-impact');
        setTimeout(()=>word.classList.add('rb-mud-word-done'),230);
      },strong?780:1050);
    }else word.classList.add('rb-mud-word-done');
  }

  // Mud-wipe selected images. Never apply to interactive diagnosis panels.
  const revealCandidates=[
    ...document.querySelectorAll('.visual-mosaic .visual-tile:first-child'),
    ...document.querySelectorAll('.rb-illustration-card:first-child'),
    ...document.querySelectorAll('.people-trust-photo')
  ].filter(el=>!el.closest('.diagnosis-panel'));
  if((page==='index.html'||page==='event.html')&&document.querySelector('.hero .photo-frame,.page-hero .photo-frame')){
    revealCandidates.unshift(document.querySelector('.hero .photo-frame,.page-hero .photo-frame'));
  }
  revealCandidates.forEach(el=>el&&el.classList.add('rb-mud-reveal'));
  if(!reduce&&'IntersectionObserver' in window){
    const rio=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(!e.isIntersecting)return;
      setTimeout(()=>e.target.classList.add('rb-mud-revealed'),120);
      rio.unobserve(e.target);
    }),{threshold:.24});
    revealCandidates.forEach(el=>el&&rio.observe(el));
  }else revealCandidates.forEach(el=>el&&el.classList.add('rb-mud-revealed'));

  // Mud stamps punctuate long pages without covering content.
  const sections=[...document.querySelectorAll('main>section')];
  const stamped=sections.filter((s,i)=>i>0&&i<sections.length-1&&i%3===1&&!s.classList.contains('diagnosis-panel'));
  stamped.forEach((s,i)=>{
    s.style.position=s.style.position||'relative';
    const stamp=document.createElement('i');
    stamp.className='rb-mud-stamp'; stamp.setAttribute('aria-hidden','true');
    stamp.style.top=i%2?'18px':'34px';
    stamp.style[i%2?'left':'right']=i%2?'max(10px,3vw)':'max(10px,3vw)';
    stamp.style.setProperty('--mud-r',`${i%2?11:-14}deg`);
    s.appendChild(stamp);
  });
  if(!reduce&&'IntersectionObserver' in window){
    const sio=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('is-visible');sio.unobserve(e.target)}
    }),{threshold:.22});
    document.querySelectorAll('.rb-mud-stamp').forEach(el=>sio.observe(el));
  }

  // Buttons spit a tiny amount of mud on hover/tap. No navigation delay.
  const burstTargets=[...document.querySelectorAll('.btn,.nr-btn,.rb-mobile-join a,.visual-join-action .btn')];
  burstTargets.forEach(el=>{
    el.classList.add('rb-mud-burst-host');
    let last=0;
    const pop=(ev)=>{
      if(reduce)return;
      const now=performance.now(); if(now-last<650)return; last=now;
      const r=el.getBoundingClientRect();
      const x=ev.clientX||r.left+r.width*.72;
      const y=ev.clientY||r.top+r.height*.48;
      burst(x,y,{count:5,energy:.48,size:8,fall:false});
    };
    el.addEventListener('pointerenter',pop,{passive:true});
    el.addEventListener('pointerdown',pop,{passive:true});
  });

  // Event day flow: muddy footprints walk through the schedule.
  if(page==='event.html'){
    const flow=document.querySelector('.event-flow');
    if(flow){
      const positions=[[18,54,-18],[34,45,12],[50,57,-12],[66,45,14],[82,55,-16]];
      positions.forEach(([x,y,r],i)=>{
        const foot=document.createElement('i');
        foot.className='rb-mud-footprint'; foot.setAttribute('aria-hidden','true');
        foot.style.left=`${x}%`;foot.style.top=`${y}%`;foot.style.setProperty('--foot-r',`${r}deg`);
        foot.dataset.delay=String(i*125);flow.appendChild(foot);
      });
      if(!reduce&&'IntersectionObserver' in window){
        const fio=new IntersectionObserver(entries=>entries.forEach(e=>{
          if(!e.isIntersecting)return;
          flow.querySelectorAll('.rb-mud-footprint').forEach(f=>setTimeout(()=>f.classList.add('is-visible'),Number(f.dataset.delay||0)));
          fio.disconnect();
        }),{threshold:.32});fio.observe(flow);
      }
    }
  }

  // A rare scroll splash: only home/event, only once, well below hero.
  if(!reduce&&(page==='index.html'||page==='event.html')){
    let fired=false;
    addEventListener('scroll',()=>{
      if(fired||scrollY<innerHeight*1.35)return;
      fired=true;
      burst(innerWidth*(page==='event.html'?.22:.78),innerHeight*.62,{count:11,energy:.72,size:11});
    },{passive:true});
  }
})();
