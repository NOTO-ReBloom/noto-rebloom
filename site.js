
(()=>{
  document.documentElement.classList.add('js');
  // Keep links shared from the former one-page site working after the multi-page redesign.
  if(/(?:^|\/)index\.html$/.test(location.pathname)||location.pathname.endsWith('/noto-rebloom/')||location.pathname.endsWith('/')){
    const legacy={
      '#partner-pack':'partner.html','#partners':'partner.html','#sponsor':'partner.html',
      '#event':'event.html','#mud-sports':'event.html','#renge-cup':'event.html#renge-cup',
      '#flower-diagnosis':'diagnosis.html','#diagnosis':'diagnosis.html',
      '#data':'learn.html#numbers','#abandoned-farmland':'learn.html','#noto-data':'learn.html'
    };
    if(legacy[location.hash]) location.replace(legacy[location.hash]);
  }
  const body=document.body, menu=document.querySelector('.menu-button'), nav=document.querySelector('.site-nav');
  if(menu){menu.addEventListener('click',()=>{const open=body.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));});}
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{body.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false');}));
  const progress=document.querySelector('.scroll-progress span');
  const back=document.querySelector('.back-top');
  const updateScroll=()=>{const max=document.documentElement.scrollHeight-innerHeight;const pct=max>0?scrollY/max*100:0;if(progress)progress.style.width=pct+'%';if(back)back.classList.toggle('is-visible',scrollY>700);};
  addEventListener('scroll',updateScroll,{passive:true});updateScroll();back?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window&&!reduced){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}}),{threshold:.12});items.forEach(el=>io.observe(el));}else items.forEach(el=>el.classList.add('is-visible'));
  // final-value-first accessible counters
  const counters=document.querySelectorAll('[data-count]');
  if(!reduced&&'IntersectionObserver' in window){const cio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;const end=Number(el.dataset.count),dec=Number(el.dataset.decimals||0),suffix=el.dataset.suffix||'';const start=performance.now(),dur=900;const tick=t=>{const p=Math.min(1,(t-start)/dur);const v=end*(1-Math.pow(1-p,3));el.textContent=v.toFixed(dec)+suffix;if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick);cio.unobserve(el);}),{threshold:.55});counters.forEach(el=>cio.observe(el));}
  // future field slider
  const range=document.getElementById('futureRange'), future=document.querySelector('.future-demo'), futureLabel=document.getElementById('futureLabel');
  if(range&&future){const apply=()=>{const v=Number(range.value);future.style.setProperty('--bloom',String(.05+v/100*.95));if(futureLabel)futureLabel.textContent=v<30?'手が入らない土地':v<70?'人が関わり始めた土地':'次の活用が見える土地';};range.addEventListener('input',apply);apply();}
  // bloom garden
  const bloomBtn=document.querySelector('[data-bloom-button]'), garden=document.querySelector('.bloom-garden');
  const flowers=['🌱','🌸','🌼','🌺','🌷','🪻','☘️'];let bloomCount=0;
  bloomBtn?.addEventListener('click',()=>{if(!garden)return;const f=document.createElement('span');f.className='bloom-flower';f.textContent=flowers[bloomCount%flowers.length];f.style.left=(5+Math.random()*90)+'%';f.style.fontSize=(28+Math.random()*28)+'px';garden.appendChild(f);bloomCount++;bloomBtn.textContent=bloomCount<8?'もう一輪、咲かせる':'花がいっぱい！';if(garden.children.length>12)garden.firstElementChild.remove();});
  // one-minute quiz
  document.querySelectorAll('.quiz-choice').forEach(btn=>btn.addEventListener('click',()=>{const shell=btn.closest('.quiz-shell'),fb=shell?.querySelector('.quiz-feedback');shell?.querySelectorAll('.quiz-choice').forEach(b=>b.disabled=true);const ok=btn.dataset.correct==='true';btn.classList.add(ok?'correct':'wrong');const correct=shell?.querySelector('[data-correct="true"]');if(!ok)correct?.classList.add('correct');if(fb)fb.textContent=(ok?'正解！ ':'もう一歩！ ')+(btn.dataset.explain||correct?.dataset.explain||'');}));
  // random action
  const actionBtn=document.querySelector('[data-action-spinner]'), actionOut=document.querySelector('[data-action-output]');
  const actions=['家族や友人に、このサイトを1人だけ共有する。','イベントを「気になる」に入れて、開催情報を待つ。','READYFORの活動報告を1本読んでみる。','身近な空き地や農地の変化に目を向けてみる。','花タイプ診断で、自分に合う応援方法を見つける。','企業・団体でできる協力を一つ考えてみる。'];
  actionBtn?.addEventListener('click',()=>{if(actionOut)actionOut.textContent=actions[Math.floor(Math.random()*actions.length)];});
  // copy share / partner summary
  document.querySelectorAll('[data-copy-target]').forEach(btn=>btn.addEventListener('click',async()=>{const target=document.querySelector(btn.dataset.copyTarget);if(!target)return;const text=target.innerText;try{await navigator.clipboard.writeText(text);btn.textContent='コピーしました';setTimeout(()=>btn.textContent='要点をコピー',1800)}catch(e){btn.textContent='選択してコピーしてください';}}));
  // native share
  document.querySelectorAll('[data-share]').forEach(btn=>btn.addEventListener('click',async()=>{const data={title:document.title,text:'能登の耕作放棄地に、もう一度人が関わる入口を。NOTO Re:Bloom',url:location.href};if(navigator.share){try{await navigator.share(data)}catch(e){}}else{try{await navigator.clipboard.writeText(location.href);btn.textContent='URLをコピーしました'}catch(e){}}}));
})();
