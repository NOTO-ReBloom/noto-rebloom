(()=>{
 document.documentElement.classList.add('js');
 const path=location.pathname;
 if(/(?:^|\/)index\.html$/.test(path)||path.endsWith('/noto-rebloom/')||path.endsWith('/')){
  const legacy={'#partner-pack':'partner.html','#partners':'partner.html','#sponsor':'partner.html','#event':'event.html','#mud-sports':'event.html','#renge-cup':'event.html#renge-cup','#flower-diagnosis':'diagnosis.html','#diagnosis':'diagnosis.html','#data':'learn.html#numbers','#abandoned-farmland':'learn.html','#noto-data':'learn.html#noto'};
  if(legacy[location.hash]) location.replace(legacy[location.hash]);
 }

 const body=document.body;
 const menu=document.querySelector('.menu-button');
 const nav=document.querySelector('.site-nav');
 const currentFile=(location.pathname.split('/').pop()||'index.html').toLowerCase();
 nav?.querySelectorAll('a[href]').forEach(link=>{
   const href=(link.getAttribute('href')||'').split('#')[0].toLowerCase();
   if(href===currentFile||(currentFile===''&&href==='index.html')) link.setAttribute('aria-current','page');
 });
 menu?.addEventListener('click',()=>{
   const open=body.classList.toggle('menu-open');
   menu.setAttribute('aria-expanded',String(open));
 });
 addEventListener('keydown',event=>{
   if(event.key==='Escape'&&body.classList.contains('menu-open')){
     body.classList.remove('menu-open');
     menu?.setAttribute('aria-expanded','false');
     menu?.focus();
   }
 });
 nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
   body.classList.remove('menu-open');
   menu?.setAttribute('aria-expanded','false');
 }));

 const progress=document.querySelector('.scroll-progress span');
 const back=document.querySelector('.back-top');
 const dock=document.querySelector('.mobile-dock');
 const updateScroll=()=>{
   const max=document.documentElement.scrollHeight-innerHeight;
   const pct=max>0?scrollY/max*100:0;
   if(progress) progress.style.width=pct+'%';
   back?.classList.toggle('is-visible',scrollY>700);
   dock?.classList.toggle('is-visible',scrollY>520);
 };
 addEventListener('scroll',updateScroll,{passive:true});
 updateScroll();
 back?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const reveals=document.querySelectorAll('.reveal');
 if(!reduced&&'IntersectionObserver'in window){
   const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
     if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target);}
   }),{threshold:.1});
   reveals.forEach(el=>io.observe(el));
 }else reveals.forEach(el=>el.classList.add('is-visible'));

 const OLD_STUDENT_FORM='jdSpe6Pb3pyFf7QU6';
 const recruitmentPattern=/学生企画メンバー|学生募集|企画メンバー募集|企画から関わる|共創メンバー|申込は8月8日まで|8月8日まで・学生募集/;
 const removeRecruitment=()=>{
   document.querySelectorAll(`a[href*="${OLD_STUDENT_FORM}"]`).forEach(a=>{
     const quick=a.closest('.quick-card');
     if(quick){quick.remove();return;}
     const source=a.closest('.source-note');
     if(source && source.querySelectorAll('a').length===1){source.remove();return;}
     const row=a.closest('.button-row');
     a.remove();
     if(row && !row.querySelector('a,button')) row.remove();
   });

   ['co-creation','student-members','student-recruitment','recruitment'].forEach(id=>document.getElementById(id)?.remove());

   document.querySelectorAll('section').forEach(section=>{
     const heading=section.querySelector('h1,h2,h3,.eyebrow');
     if(heading && recruitmentPattern.test(heading.textContent||'')) section.remove();
   });

   document.querySelectorAll('p,li,article,.callout,.quick-card,.renge-event-facts>div').forEach(el=>{
     if(!el.isConnected) return;
     if(recruitmentPattern.test(el.textContent||'')) el.remove();
   });

   document.querySelectorAll('.button-row,.header-actions,.quick-grid,.renge-event-facts,.callout,.source-note').forEach(el=>{
     const meaningful=(el.textContent||'').replace(/\s+/g,'').trim();
     if(!meaningful && !el.querySelector('a,button,img,input,svg')) el.remove();
   });
  };
 removeRecruitment();

 // Keep venue wording current on legacy informational pages without reintroducing recruitment CTAs.
 const textReplacements=[
   ['会場候補を確認中','会場確定・使用許可済み'],
   ['珠洲市内で実施予定','珠洲市・洲巻地区で開催'],
   ['珠洲市内で午後開催予定','珠洲市・洲巻地区で午後開催'],
   ['上黒丸地区の元レンコン田。許可・安全条件は未確定','洲巻地区の田んぼ（約20m×50m・約1,000㎡）。土地使用許可取得済み'],
   ['会場候補となる土地の一つ','能登で確認してきた農地の様子'],
   ['活動候補となる土地の一つ','能登で確認してきた農地の様子']
 ];
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 const textNodes=[];
 while(walker.nextNode()) textNodes.push(walker.currentNode);
 textNodes.forEach(node=>{
   let value=node.nodeValue||'';
   textReplacements.forEach(([from,to])=>{if(value.includes(from)) value=value.split(from).join(to);});
   node.nodeValue=value;
 });
 removeRecruitment();

 document.querySelectorAll('.quiz-choice').forEach(btn=>btn.addEventListener('click',()=>{
   const shell=btn.closest('.quiz-shell');
   const fb=shell?.querySelector('.quiz-feedback');
   shell?.querySelectorAll('.quiz-choice').forEach(b=>b.disabled=true);
   const ok=btn.dataset.correct==='true';
   btn.classList.add(ok?'correct':'wrong');
   const correct=shell?.querySelector('[data-correct="true"]');
   if(!ok) correct?.classList.add('correct');
   if(fb) fb.textContent=(ok?'正解です。':'もう一歩。')+(btn.dataset.explain||correct?.dataset.explain||'');
 }));

 const printPartner=document.querySelector('[data-print-partner]');
 printPartner?.addEventListener('click',()=>window.print());

 document.querySelectorAll('[data-learning-quiz]').forEach(quiz=>{
   const questions=[...quiz.querySelectorAll('[data-question]')];
   const next=quiz.querySelector('[data-quiz-next]');
   const resultBox=quiz.querySelector('[data-quiz-result]');
   const scoreEl=quiz.querySelector('[data-quiz-score]');
   const messageEl=quiz.querySelector('[data-quiz-message]');
   const retry=quiz.querySelector('[data-quiz-retry]');
   const progressEl=quiz.querySelector('[data-quiz-progress]');
   const progressFill=quiz.querySelector('[data-quiz-fill]');
   let current=0,score=0,answered=false;
   const messages=['土地を見る視点は、これから育てられます。解説をもう一度読んでみましょう。','大切な入口をつかめています。現地では、数字と人の話の両方を確かめてみてください。','土地の背景をかなり丁寧に捉えられています。誰かに一つ説明できたら、理解はさらに深まります。','全問正解です。問題を知る力を、参加・共有・協力の一歩へつなげてみてください。'];
   const updateProgress=()=>{
     if(progressEl) progressEl.textContent=`${Math.min(current+1,questions.length)} / ${questions.length}`;
     if(progressFill) progressFill.style.width=`${Math.round(current/questions.length*100)}%`;
   };
   const showQuestion=idx=>{
     questions.forEach((q,i)=>q.classList.toggle('is-active',i===idx));
     resultBox?.classList.remove('is-active');
     if(next){next.hidden=false;next.disabled=true;next.textContent=idx===questions.length-1?'結果を見る':'次の問題へ';}
     current=idx;answered=false;updateProgress();
   };
   questions.forEach(q=>q.querySelectorAll('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>{
     if(answered) return;
     answered=true;
     const ok=btn.dataset.answer==='true';
     if(ok) score++;
     q.querySelectorAll('[data-answer]').forEach(item=>{
       item.disabled=true;
       if(item.dataset.answer==='true') item.classList.add('is-correct');
     });
     if(!ok) btn.classList.add('is-wrong');
     const feedback=q.querySelector('[data-feedback]');
     if(feedback){
       feedback.textContent=ok?feedback.dataset.correctText:feedback.dataset.wrongText;
       feedback.classList.add('is-visible',ok?'is-correct':'is-wrong');
     }
     if(next) next.disabled=false;
   })));
   next?.addEventListener('click',()=>{
     if(!answered) return;
     if(current<questions.length-1){showQuestion(current+1);return;}
     questions.forEach(q=>q.classList.remove('is-active'));
     next.hidden=true;
     resultBox?.classList.add('is-active');
     if(scoreEl) scoreEl.textContent=`4問中 ${score}問 正解`;
     if(messageEl) messageEl.textContent=messages[Math.max(0,Math.min(messages.length-1,score-1))];
     if(progressEl) progressEl.textContent='4 / 4';
     if(progressFill) progressFill.style.width='100%';
   });
   retry?.addEventListener('click',()=>{
     score=0;
     questions.forEach(q=>{
       q.querySelectorAll('[data-answer]').forEach(btn=>{btn.disabled=false;btn.classList.remove('is-correct','is-wrong');});
       const feedback=q.querySelector('[data-feedback]');
       if(feedback){feedback.textContent='';feedback.className='learning-feedback';}
     });
     showQuestion(0);
   });
   if(questions.length) showQuestion(0);
 });

 const actionBtn=document.querySelector('[data-action-spinner]');
 const actionOut=document.querySelector('[data-action-output]');
 const actions=['家族や友人に、NOTO Re:Bloomを1人だけ紹介する。','READYFORで支援の使いみちを確認する。','身近な空き地や農地の変化に目を向ける。','花タイプ診断で、自分に合う関わり方を見つける。','企業・団体でできる協力を一つ考える。','9月20日の泥ん子運動会の参加方法を確認する。'];
 actionBtn?.addEventListener('click',()=>{if(actionOut) actionOut.textContent=actions[Math.floor(Math.random()*actions.length)];});

 const bloomBtn=document.querySelector('[data-bloom-button]');
 const garden=document.querySelector('.bloom-garden');
 const flowers=['🌱','🌸','🌼','🪻','☘️','🌷'];
 let count=0;
 bloomBtn?.addEventListener('click',()=>{
   if(!garden) return;
   const f=document.createElement('span');
   f.className='bloom-flower';
   f.textContent=flowers[count%flowers.length];
   f.style.left=(4+Math.random()*92)+'%';
   f.style.fontSize=(30+Math.random()*28)+'px';
   garden.appendChild(f);
   count++;
   bloomBtn.textContent=count<8?'もう一輪、咲かせる':'花がいっぱい！';
   if(garden.children.length>14) garden.firstElementChild.remove();
 });
})();
