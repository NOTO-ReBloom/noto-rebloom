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
  const EVENT_END=Date.parse('2026-09-20T17:30:00+09:00');
  const now=Date.now();
  const days=Math.max(0,Math.ceil((EVENT_AT-now)/86400000));
  const eventLabel=now<EVENT_AT?`開催まであと <strong>${days}日</strong>`:(now<EVENT_END?'今日、開催！':'9/20 開催しました');

  const toast=(text)=>{
    let el=document.querySelector('.rb-fun-toast');
    if(!el){el=document.createElement('div');el.className='rb-fun-toast';el.setAttribute('role','status');body.appendChild(el)}
    el.textContent=text;el.classList.remove('is-show');void el.offsetWidth;el.classList.add('is-show');
  };

  const tinyBurst=(x,y,count=8)=>{
    if(reduced)return;
    for(let i=0;i<count;i++){
      const dot=document.createElement('i');dot.className='rb-fun-burst';
      dot.style.left=`${x}px`;dot.style.top=`${y}px`;
      const a=(Math.PI*2/count)*i+(Math.random()-.5)*.45;
      const d=28+Math.random()*54;
      dot.style.setProperty('--bx',`${Math.cos(a)*d}px`);
      dot.style.setProperty('--by',`${Math.sin(a)*d}px`);
      dot.style.setProperty('--bs',`${5+Math.random()*8}px`);
      body.appendChild(dot);setTimeout(()=>dot.remove(),760);
    }
  };

  const shareEvent=async(source)=>{
    const url=new URL('event.html',location.href).href;
    const data={title:'9/20 泥ん子運動会｜NOTO Re:Bloom',text:'9月20日、珠洲の田んぼで泥ん子運動会。参加費無料。一緒に行かない？',url};
    try{
      if(navigator.share){await navigator.share(data);return}
      if(navigator.clipboard){await navigator.clipboard.writeText(`${data.text}\n${url}`);toast('イベントURLをコピーしました');return}
    }catch(err){if(err&&err.name==='AbortError')return}
    try{prompt('このURLを友達に送ってください',url)}catch(_){/* no-op */}
  };

  const addLiveChips=()=>{
    const copy=document.querySelector('.hero-copy,.page-hero-grid>div');
    if(!copy||copy.querySelector('.rb-fun-live')||page==='diagnosis.html'||page==='404.html') return;
    const live=document.createElement('div');
    live.className='rb-fun-live';
    live.innerHTML=`<span class="rb-fun-chip rb-fun-chip--yellow" style="--chip-r:-1deg">${eventLabel}</span><span class="rb-fun-chip rb-fun-chip--student" style="--chip-r:1deg">学生主催・みんなで準備中</span>`;
    copy.querySelector('h1')?.after(live);
  };
  addLiveChips();

  const addShareButtons=()=>{
    if(page!=='index.html'&&page!=='event.html')return;
    const row=document.querySelector('.hero-copy .button-row,.page-hero .button-row');
    if(row&&!row.querySelector('.rb-fun-share')){
      const btn=document.createElement('button');btn.type='button';btn.className='rb-fun-share';btn.innerHTML='<span>↗</span> 友達に送る';
      btn.addEventListener('click',e=>{const r=btn.getBoundingClientRect();tinyBurst(r.left+r.width*.5,r.top+r.height*.5,7);shareEvent('hero')});
      row.appendChild(btn);
    }
    const dock=document.querySelector('.rb-mobile-join');
    if(dock&&!dock.querySelector('.rb-fun-mobile-share')){
      const share=document.createElement('button');share.type='button';share.className='rb-fun-mobile-share';share.textContent='友達に送る';
      share.addEventListener('click',()=>shareEvent('mobile'));dock.prepend(share);
    }
  };
  addShareButtons();

  const addSticker=(hero,text,cls,pos={})=>{
    if(!hero) return;
    const el=document.createElement('span');
    el.className=`rb-fun-sticker ${cls||''}`;
    el.dataset.float='1';el.textContent=text;
    Object.entries(pos).forEach(([k,v])=>k.startsWith('--')?el.style.setProperty(k,v):(el.style[k]=v));
    hero.appendChild(el);
  };
  const hero=document.querySelector('.hero,.page-hero');
  if(hero&&page!=='diagnosis.html'){
    if(page==='index.html'){
      addSticker(hero,'学生主催\n9.20','rb-fun-sticker--hero-a',{'--sticker-r':'9deg'});
      addSticker(hero,'参加費\n0円','rb-fun-sticker--paper rb-fun-sticker--hero-b',{'--sticker-r':'-8deg'});
      addSticker(hero,'一緒に\n遊ぼう！','rb-fun-sticker--pink rb-fun-sticker--hero-c',{'--sticker-r':'5deg'});
    }else if(page==='event.html'){
      addSticker(hero,'泥ん子\n運動会','rb-fun-sticker--mud rb-fun-sticker--hero-a',{'--sticker-r':'8deg'});
      addSticker(hero,'SUZU\n9.20','rb-fun-sticker--pink rb-fun-sticker--hero-b',{'--sticker-r':'-7deg'});
      addSticker(hero,'全力で\n遊ぶ日','rb-fun-sticker--hero-c',{'--sticker-r':'6deg'});
    }else if(page==='learn.html') addSticker(hero,'能登の\n田んぼから','rb-fun-sticker--paper rb-fun-sticker--hero-a',{'--sticker-r':'7deg'});
    else if(page==='partner.html') addSticker(hero,'一緒に\nつくる','rb-fun-sticker--paper rb-fun-sticker--hero-a',{'--sticker-r':'-7deg'});
  }

  const playgroundHTML=()=>`<section class="rb-fun-playground" id="rb-fun-day"><div class="rb-fun-playground-inner">
    <div class="rb-fun-head"><div><p class="eyebrow"><span>9月20日の一日</span><small>GET MUDDY / HAVE FUN</small></p><h2>田んぼに入ったら、<br>あとは思いきり遊ぶ。</h2><p>泥の感触を楽しんで、みんなで遊んで、自然に笑って。学生がつくる、かしこまりすぎない一日にします。</p></div><div class="rb-fun-meter" aria-label="泥だらけ度"><div class="rb-fun-meter-top"><span>泥だらけ度</span><strong class="rb-fun-meter-num">0%</strong></div><div class="rb-fun-meter-track"><div class="rb-fun-meter-fill"></div></div></div></div>
    <div class="rb-fun-steps">
      <article class="rb-fun-step"><span class="rb-fun-step-no">01</span><h3>入る</h3><p>約1,000㎡の田んぼへ。普段はなかなか入らない泥の中へ踏み込みます。</p><span class="rb-fun-step-word">泥</span></article>
      <article class="rb-fun-step"><span class="rb-fun-step-no">02</span><h3>遊ぶ</h3><p>その日の田んぼの状態に合わせて、みんなで泥スポーツを楽しみます。</p><span class="rb-fun-step-word">遊</span></article>
      <article class="rb-fun-step"><span class="rb-fun-step-no">03</span><h3>笑う</h3><p>子どもも大人も同じ田んぼで。競技の合間も含めて、みんなで過ごす一日にします。</p><span class="rb-fun-step-word">笑</span></article>
      <article class="rb-fun-step"><span class="rb-fun-step-no">04</span><h3>持ち帰る</h3><p>最後にはレンゲの種を入れた小さなポットを持ち帰る予定です。</p><span class="rb-fun-step-word">花</span></article>
    </div>
    <div class="rb-fun-join"><div><b>9月20日、田んぼで一緒に遊ぼう。</b><span>参加費無料。受付12:30、13:00スタート。</span></div><div class="rb-fun-join-actions"><button type="button" class="rb-fun-share rb-fun-share--dark">友達に送る</button><a class="btn rb-fun-magnet" href="${JOIN}" target="_blank" rel="noopener">参加申込へ</a></div></div>
  </div></section>`;

  if((page==='index.html'||page==='event.html')&&!document.querySelector('#rb-fun-day')){
    const temp=document.createElement('div');temp.innerHTML=playgroundHTML();
    const section=temp.firstElementChild;
    const target=page==='index.html'?document.querySelector('#visual-day'):document.querySelector('.event-summary');
    if(target) target.after(section); else document.querySelector('main')?.appendChild(section);
    section.querySelector('.rb-fun-share')?.addEventListener('click',e=>{const r=e.currentTarget.getBoundingClientRect();tinyBurst(r.left+r.width/2,r.top+r.height/2,8);shareEvent('playground')});
  }

  const chooserHTML=()=>`<section class="rb-fun-choose" id="rb-fun-choose"><div class="rb-fun-choose-inner">
    <div class="rb-fun-choose-head"><p class="eyebrow"><span>どんな感じで来る？</span><small>CHOOSE YOUR DAY</small></p><h2>参加のしかたは、<br>好きな感じで。</h2><p>選んでみると、9月20日の自分がちょっと想像できます。</p></div>
    <div class="rb-fun-modes" role="group" aria-label="参加イメージを選ぶ">
      <button type="button" class="rb-fun-mode" data-mode="friends" aria-pressed="false"><span>友達と</span><b>一緒に泥だらけ</b><small>笑って、写真を撮って、帰り道まで話のネタに。</small></button>
      <button type="button" class="rb-fun-mode" data-mode="family" aria-pressed="false"><span>家族で</span><b>子どもも大人も本気</b><small>同じ田んぼに入って、一緒に遊ぶ一日に。</small></button>
      <button type="button" class="rb-fun-mode" data-mode="solo" aria-pressed="false"><span>ひとりで</span><b>飛び込んでみる</b><small>ひとり参加も歓迎。田んぼに入れば、同じ一日の仲間です。</small></button>
    </div>
    <div class="rb-fun-choice-result" aria-live="polite"><div><span>YOUR DAY</span><strong>どれでも大歓迎。</strong><p>参加費は無料です。気になる気持ちのまま、田んぼへ。</p></div><a class="btn rb-fun-magnet" href="${JOIN}" target="_blank" rel="noopener">この日に参加する</a></div>
    <div class="rb-fun-mission"><div><span>自由参加 / PLAY MISSION</span><strong class="rb-fun-mission-text">最初の一歩を、ためらわない。</strong></div><button type="button" class="rb-fun-mission-btn">別のミッションを引く ↻</button></div>
  </div></section>`;

  if((page==='index.html'||page==='event.html')&&!document.querySelector('#rb-fun-choose')){
    const temp=document.createElement('div');temp.innerHTML=chooserHTML();const chooser=temp.firstElementChild;
    const fun=document.querySelector('#rb-fun-day');fun?.after(chooser);
    const modes={
      friends:['友達と来るなら、遠慮なく全力で。','一緒に泥だらけになれば、それだけで思い出になります。'],
      family:['家族で来るなら、大人も本気で。','子どもだけでなく、大人も同じ田んぼで遊ぶ一日に。'],
      solo:['ひとりで来ても、大丈夫。','知らない人と同じことで笑えるのが、泥ん子運動会です。']
    };
    const result=chooser.querySelector('.rb-fun-choice-result');
    chooser.querySelectorAll('.rb-fun-mode').forEach(btn=>btn.addEventListener('click',()=>{
      chooser.querySelectorAll('.rb-fun-mode').forEach(b=>{b.classList.toggle('is-selected',b===btn);b.setAttribute('aria-pressed',String(b===btn))});
      const [title,copy]=modes[btn.dataset.mode];
      result.querySelector('strong').textContent=title;result.querySelector('p').textContent=copy;
      const r=btn.getBoundingClientRect();tinyBurst(r.left+r.width*.5,r.top+r.height*.5,9);
    }));
    const missions=['最初の一歩を、ためらわない。','いちばん楽しそうな泥はねをつくる。','友達と「泥だらけの一枚」を残す。','知らない人のナイスプレーにも拍手する。','帰るまでに、今日いちばん笑った瞬間をつくる。','服の汚れより、楽しさを優先する。'];
    let missionIndex=0;
    chooser.querySelector('.rb-fun-mission-btn')?.addEventListener('click',e=>{
      missionIndex=(missionIndex+1+Math.floor(Math.random()*(missions.length-1)))%missions.length;
      const text=chooser.querySelector('.rb-fun-mission-text');text.classList.remove('is-changing');void text.offsetWidth;text.textContent=missions[missionIndex];text.classList.add('is-changing');
      const r=e.currentTarget.getBoundingClientRect();tinyBurst(r.left+r.width*.5,r.top+r.height*.5,6);
    });
  }

  /* Make the student host presence feel warmer and closer. */
  const crew=document.querySelector('.people-trust-copy');
  if(crew&&!crew.querySelector('.rb-fun-crewline')){
    const line=document.createElement('div');line.className='rb-fun-crewline';
    line.innerHTML='<strong>主催は学生。参加する人と一緒に笑える一日にしたい。</strong><div><span>学生主催</span><span>手づくりで準備中</span><span>9.20 珠洲</span></div>';
    const heading=crew.querySelector('h2');heading?.after(line);
    crew.closest('.people-trust')?.classList.add('rb-fun-crew-section');
  }

  if(page==='index.html'){
    const origin=document.querySelector('#origin');
    if(origin&&!origin.querySelector('.rb-student-note')){const note=document.createElement('div');note.className='rb-student-note';note.textContent='学生チームで9/20に向けて準備中！';origin.appendChild(note)}
  }
  if(page==='event.html'){
    const program=document.querySelector('.game-grid')?.closest('section');
    if(program&&!program.querySelector('.rb-student-note')){const note=document.createElement('div');note.className='rb-student-note';note.textContent='当日の田んぼを見ながら、安全にできる遊びを選びます。';program.appendChild(note)}
  }

  const fun=document.querySelector('#rb-fun-day');
  let meterTick=false;
  const updateMeter=()=>{
    meterTick=false;if(!fun)return;
    const r=fun.getBoundingClientRect();const span=Math.max(1,r.height+innerHeight*.55);
    const p=Math.max(0,Math.min(1,(innerHeight*.82-r.top)/span));const level=Math.round(p*100);
    fun.style.setProperty('--mud-level',`${level}%`);const n=fun.querySelector('.rb-fun-meter-num');if(n)n.textContent=`${level}%`;
  };
  if(fun){
    const askMeter=()=>{if(meterTick)return;meterTick=true;requestAnimationFrame(updateMeter)};
    addEventListener('scroll',askMeter,{passive:true});addEventListener('resize',askMeter,{passive:true});updateMeter();
    fun.querySelectorAll('.rb-fun-step').forEach(card=>card.addEventListener('pointerdown',()=>{card.classList.remove('is-played');void card.offsetWidth;card.classList.add('is-played')},{passive:true}));
  }

  /* Cheer words pop out only a few times as the user scrolls. */
  if(!reduced&&'IntersectionObserver' in window&&(page==='index.html'||page==='event.html')){
    const targets=[document.querySelector('#rb-fun-day'),document.querySelector('#rb-fun-choose'),document.querySelector('.people-trust'),document.querySelector('.game-grid')?.closest('section')].filter(Boolean);
    const words=['泥だらけ歓迎！','一緒に遊ぼう！','9.20 珠洲！','全力でいこう！'];
    const cheer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting||entry.target.dataset.funCheered)return;
      entry.target.dataset.funCheered='1';
      const pop=document.createElement('div');pop.className='rb-fun-popword';pop.textContent=words[Math.floor(Math.random()*words.length)];
      pop.style.left=`${8+Math.random()*68}vw`;pop.style.top=`${16+Math.random()*58}vh`;pop.style.setProperty('--pop-r',`${-10+Math.random()*20}deg`);
      body.appendChild(pop);setTimeout(()=>pop.remove(),1150);cheer.unobserve(entry.target);
    }),{threshold:.38});targets.forEach(t=>cheer.observe(t));
  }

  if(fine&&!reduced&&(page==='index.html'||page==='event.html')){
    let last=0;
    addEventListener('pointermove',e=>{
      const zone=e.target.closest?.('.hero,.page-hero,#rb-fun-day,#rb-fun-choose');
      if(!zone||performance.now()-last<72)return;last=performance.now();
      const c=document.createElement('i');c.className='rb-fun-crumb';c.style.left=`${e.clientX-4}px`;c.style.top=`${e.clientY-4}px`;
      c.style.setProperty('--dx',`${(Math.random()-.5)*18}px`);c.style.setProperty('--dy',`${8+Math.random()*18}px`);body.appendChild(c);setTimeout(()=>c.remove(),760);
    },{passive:true});
  }

  if(fine&&!reduced){
    const magnets=[...document.querySelectorAll('a[href*="forms.gle/6ZMrhrhtWmBCQViD8"],.rb-fun-magnet')];
    magnets.forEach(btn=>{
      btn.classList.add('rb-fun-magnet');
      btn.addEventListener('pointermove',e=>{const r=btn.getBoundingClientRect();const x=(e.clientX-r.left-r.width/2)*.09;const y=(e.clientY-r.top-r.height/2)*.12;btn.style.transform=`translate(${x}px,${y}px)`},{passive:true});
      btn.addEventListener('pointerleave',()=>btn.style.transform='',{passive:true});
    });
  }

  if(!reduced&&page!=='event.html'){
    const wipe=document.createElement('div');wipe.className='rb-fun-wipe';wipe.setAttribute('aria-hidden','true');wipe.innerHTML='<div class="rb-fun-wipe-mark">泥ん子運動会へ！</div>';body.appendChild(wipe);
    [...document.querySelectorAll('main a[href="event.html"],main a[href$="/event.html"]')].forEach(a=>a.addEventListener('click',e=>{
      if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank')return;
      e.preventDefault();wipe.style.setProperty('--wipe-x',`${e.clientX||innerWidth*.5}px`);wipe.style.setProperty('--wipe-y',`${e.clientY||innerHeight*.5}px`);wipe.classList.add('is-going');setTimeout(()=>{location.href=a.href},430);
    }));
  }
})();
