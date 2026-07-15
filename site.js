(()=>{
 document.documentElement.classList.add('js');
 const path=location.pathname;
 if(/(?:^|\/)index\.html$/.test(path)||path.endsWith('/noto-rebloom/')||path.endsWith('/')){
  const legacy={'#partner-pack':'partner.html','#partners':'partner.html','#sponsor':'partner.html','#event':'event.html','#mud-sports':'event.html','#renge-cup':'event.html#renge-cup','#flower-diagnosis':'diagnosis.html','#diagnosis':'diagnosis.html','#data':'learn.html#numbers','#abandoned-farmland':'learn.html','#noto-data':'learn.html#noto'};
  if(legacy[location.hash]) location.replace(legacy[location.hash]);
 }
 const body=document.body,menu=document.querySelector('.menu-button'),nav=document.querySelector('.site-nav');
 menu?.addEventListener('click',()=>{const open=body.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));});
 nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{body.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false');}));
 const progress=document.querySelector('.scroll-progress span'),back=document.querySelector('.back-top'),dock=document.querySelector('.mobile-dock');
 const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;const pct=max>0?scrollY/max*100:0;if(progress)progress.style.width=pct+'%';back?.classList.toggle('is-visible',scrollY>700);dock?.classList.toggle('is-visible',scrollY>520)};
 addEventListener('scroll',update,{passive:true});update();back?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const reveals=document.querySelectorAll('.reveal');
 if(!reduced&&'IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.1});reveals.forEach(el=>io.observe(el));}else reveals.forEach(el=>el.classList.add('is-visible'));
 document.querySelectorAll('.quiz-choice').forEach(btn=>btn.addEventListener('click',()=>{const shell=btn.closest('.quiz-shell'),fb=shell?.querySelector('.quiz-feedback');shell?.querySelectorAll('.quiz-choice').forEach(b=>b.disabled=true);const ok=btn.dataset.correct==='true';btn.classList.add(ok?'correct':'wrong');const correct=shell?.querySelector('[data-correct="true"]');if(!ok)correct?.classList.add('correct');if(fb)fb.textContent=(ok?'正解です。':'もう一歩。')+(btn.dataset.explain||correct?.dataset.explain||'')}));
 const actionBtn=document.querySelector('[data-action-spinner]'),actionOut=document.querySelector('[data-action-output]');const actions=['家族や友人に、このサイトを1人だけ共有する。','READYFORの活動報告を1本読んでみる。','身近な空き地や農地の変化に目を向ける。','花タイプ診断で、自分に合う応援方法を見つける。','企業・団体でできる協力を一つ考える。','9月20日の予定を確認して、参加・見学フォームを開く。'];actionBtn?.addEventListener('click',()=>{if(actionOut)actionOut.textContent=actions[Math.floor(Math.random()*actions.length)]});
 const bloomBtn=document.querySelector('[data-bloom-button]'),garden=document.querySelector('.bloom-garden'),flowers=['🌱','🌸','🌼','🪻','☘️','🌷'];let count=0;bloomBtn?.addEventListener('click',()=>{if(!garden)return;const f=document.createElement('span');f.className='bloom-flower';f.textContent=flowers[count%flowers.length];f.style.left=(4+Math.random()*92)+'%';f.style.fontSize=(30+Math.random()*28)+'px';garden.appendChild(f);count++;bloomBtn.textContent=count<8?'もう一輪、咲かせる':'花がいっぱい！';if(garden.children.length>14)garden.firstElementChild.remove()});
})();