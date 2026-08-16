(()=>{
  'use strict';
  const body=document.body;
  if(!body||body.classList.contains('rb-fun-ready')) return;
  body.classList.add('rb-fun-ready');

  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  const JOIN='https://forms.gle/6ZMrhrhtWmBCQViD8';
  const EVENT_AT=Date.parse('2026-09-20T13:00:00+09:00');
  const days=Math.max(0,Math.ceil((EVENT_AT-Date.now())/86400000));

  const addLiveChips=()=>{
    const copy=document.querySelector('.hero-copy,.page-hero-grid>div');
    if(!copy||copy.querySelector('.rb-fun-live')||page==='diagnosis.html'||page==='404.html') return;
    const live=document.createElement('div');
    live.className='rb-fun-live';
    const countdown=days>0?`開催まであと <strong>${days}日</strong>`:'9/20 開催';
    live.innerHTML=`<span class="rb-fun-chip rb-fun-chip--yellow" style="--chip-r:-1deg">${countdown}</span><span class="rb-fun-chip rb-fun-chip--student" style="--chip-r:1deg">学生チームで準備中</span>`;
    const lead=copy.querySelector('h1');
    lead?.after(live);
  };
  addLiveChips();

  const addSticker=(hero,text,cls,pos={})=>{
    if(!hero) return;
    const el=document.createElement('span');
    el.className=`rb-fun-sticker ${cls||''}`;
    el.dataset.float='1';
    el.textContent=text;
    Object.entries(pos).forEach(([k,v])=>el.style[k]=v);
    hero.appendChild(el);
  };
  const hero=document.querySelector('.hero,.page-hero');
  if(hero&&page!=='diagnosis.html'){
    if(page==='index.html'){
      addSticker(hero,'学生企画\n9.20','rb-fun-sticker--hero-a',{'--sticker-r':'9deg'});
      addSticker(hero,'参加費\n0円','rb-fun-sticker--paper rb-fun-sticker--hero-b',{'--sticker-r':'-8deg'});
    }else if(page==='event.html'){
      addSticker(hero,'泥ん子\n運動会','rb-fun-sticker--mud rb-fun-sticker--hero-a',{'--sticker-r':'8deg'});
      addSticker(hero,'SUZU\n9.20','rb-fun-sticker--pink rb-fun-sticker--hero-b',{'--sticker-r':'-7deg'});
    }else if(page==='learn.html') addSticker(hero,'能登の\n田んぼから','rb-fun-sticker--paper rb-fun-sticker--hero-a',{'--sticker-r':'7deg'});
    else if(page==='partner.html') addSticker(hero,'一緒に\nつくる','rb-fun-sticker--paper rb-fun-sticker--hero-a',{'--sticker-r':'-7deg'});
  }

  const playgroundHTML=()=>`<section class="rb-fun-playground" id="rb-fun-day"><div class="rb-fun-playground-inner">
    <div class="rb-fun-head"><div><p class="eyebrow"><span>9月20日の一日</span><small>GET MUDDY / HAVE FUN</small></p><h2>田んぼに入ったら、<br>あとは思いきり遊ぶ。</h2><p>泥の感触を楽しんで、みんなで遊んで、自然に笑って。最後にはレンゲを持ち帰ります。</p></div><div class="rb-fun-meter" aria-label="泥だらけ度"><div class="rb-fun-meter-top"><span>泥だらけ度</span><strong class="rb-fun-meter-num">0%</strong></div><div class="rb-fun-meter-track"><div class="rb-fun-meter-fill"></div></div></div></div>
    <div class="rb-fun-steps">
      <article class="rb-fun-step"><span class="rb-fun-step-no">01</span><h3>入る</h3><p>約1,000㎡の田んぼへ。普段はなかなか入らない泥の中へ踏み込みます。</p><span class="rb-fun-step-word">泥</span></article>
      <article class="rb-fun-step"><span class="rb-fun-step-no">02</span><h3>遊ぶ</h3><p>泥歩きやリレー、的当てなど、その日の田んぼの状態に合わせて楽しみます。</p><span class="rb-fun-step-word">遊</span></article>
      <article class="rb-fun-step"><span class="rb-fun-step-no">03</span><h3>笑う</h3><p>子どもも大人も同じ田んぼで。競技の合間も含めて、みんなで過ごす一日にします。</p><span class="rb-fun-step-word">笑</span></article>
      <article class="rb-fun-step"><span class="rb-fun-step-no">04</span><h3>持ち帰る</h3><p>最後にはレンゲの種を入れた小さなポットを持ち帰る予定です。</p><span class="rb-fun-step-word">花</span></article>
    </div>
    <div class="rb-fun-join"><div><b>9月20日、田んぼで一緒に遊ぼう。</b><span>参加費無料。受付12:30、13:00スタート。</span></div><a class="btn rb-fun-magnet" href="${JOIN}" target="_blank" rel="noopener">参加申込へ</a></div>
  </div></section>`;

  if((page==='index.html'||page==='event.html')&&!document.querySelector('#rb-fun-day')){
    const temp=document.createElement('div');
    temp.innerHTML=playgroundHTML();
    const section=temp.firstElementChild;
    const target=page==='index.html'?document.querySelector('#visual-day'):document.querySelector('.event-summary');
    if(target) target.after(section); else document.querySelector('main')?.appendChild(section);
  }

  /* Notes should feel like students are preparing the day, without becoming explanatory UI copy. */
  if(page==='index.html'){
    const origin=document.querySelector('#origin');
    if(origin&&!origin.querySelector('.rb-student-note')){
      const note=document.createElement('div');note.className='rb-student-note';note.textContent='学生チームで9/20に向けて準備中！';origin.appendChild(note);
    }
  }
  if(page==='event.html'){
    const program=document.querySelector('.game-grid')?.closest('section');
    if(program&&!program.querySelector('.rb-student-note')){
      const note=document.createElement('div');note.className='rb-student-note';note.textContent='当日の田んぼを見ながら、安全にできる遊びを選びます。';program.appendChild(note);
    }
  }

  /* Mud level increases as the playground comes through the viewport. */
  const fun=document.querySelector('#rb-fun-day');
  let meterTick=false;
  const updateMeter=()=>{
    meterTick=false;
    if(!fun) return;
    const r=fun.getBoundingClientRect();
    const span=Math.max(1,r.height+innerHeight*.55);
    const p=Math.max(0,Math.min(1,(innerHeight*.82-r.top)/span));
    const level=Math.round(p*100);
    fun.style.setProperty('--mud-level',`${level}%`);
    const n=fun.querySelector('.rb-fun-meter-num');if(n)n.textContent=`${level}%`;
  };
  if(fun){
    const askMeter=()=>{if(meterTick)return;meterTick=true;requestAnimationFrame(updateMeter)};
    addEventListener('scroll',askMeter,{passive:true});addEventListener('resize',askMeter,{passive:true});updateMeter();
    fun.querySelectorAll('.rb-fun-step').forEach(card=>{
      card.addEventListener('pointerdown',()=>{card.classList.remove('is-played');void card.offsetWidth;card.classList.add('is-played')},{passive:true});
    });
  }

  /* Tiny mud crumbs only where the site is intentionally playful. */
  if(fine&&!reduced&&(page==='index.html'||page==='event.html')){
    let last=0;
    addEventListener('pointermove',e=>{
      const zone=e.target.closest?.('.hero,.page-hero,#rb-fun-day');
      if(!zone||performance.now()-last<72) return;
      last=performance.now();
      const c=document.createElement('i');c.className='rb-fun-crumb';
      c.style.left=`${e.clientX-4}px`;c.style.top=`${e.clientY-4}px`;
      c.style.setProperty('--dx',`${(Math.random()-.5)*18}px`);c.style.setProperty('--dy',`${8+Math.random()*18}px`);
      body.appendChild(c);setTimeout(()=>c.remove(),760);
    },{passive:true});
  }

  /* A light magnetic pull for the key participation CTAs. */
  if(fine&&!reduced){
    const magnets=[...document.querySelectorAll('a[href*="forms.gle/6ZMrhrhtWmBCQViD8"],.rb-fun-magnet')];
    magnets.forEach(btn=>{
      btn.classList.add('rb-fun-magnet');
      btn.addEventListener('pointermove',e=>{
        const r=btn.getBoundingClientRect();
        const x=(e.clientX-r.left-r.width/2)*.09;const y=(e.clientY-r.top-r.height/2)*.12;
        btn.style.transform=`translate(${x}px,${y}px)`;
      },{passive:true});
      btn.addEventListener('pointerleave',()=>btn.style.transform='',{passive:true});
    });
  }

  /* Event-page entrance: one memorable full-screen mud wipe, never on form links or menu navigation. */
  if(!reduced&&page!=='event.html'){
    const wipe=document.createElement('div');wipe.className='rb-fun-wipe';wipe.setAttribute('aria-hidden','true');wipe.innerHTML='<div class="rb-fun-wipe-mark">泥ん子運動会へ！</div>';body.appendChild(wipe);
    const links=[...document.querySelectorAll('main a[href="event.html"],main a[href$="/event.html"]')];
    links.forEach(a=>a.addEventListener('click',e=>{
      if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank')return;
      e.preventDefault();
      wipe.style.setProperty('--wipe-x',`${e.clientX||innerWidth*.5}px`);wipe.style.setProperty('--wipe-y',`${e.clientY||innerHeight*.5}px`);
      wipe.classList.add('is-going');
      setTimeout(()=>{location.href=a.href},430);
    }));
  }
})();
