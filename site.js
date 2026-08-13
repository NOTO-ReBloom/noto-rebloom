(()=>{
  document.documentElement.classList.add('js');

  const OLD_FORM_TOKEN='jdSpe6Pb3pyFf7QU6';
  const PARTICIPANT_FORM='https://forms.gle/6ZMrhrhtWmBCQViD8';
  const recruitmentText=/学生企画メンバー|学生募集|企画メンバー募集|共創メンバー|申込は8月8日まで|8月8日まで・学生募集/;

  const normalizeLegacyLink=(a)=>{
    if(!(a instanceof HTMLAnchorElement)) return;
    if(!(a.getAttribute('href')||'').includes(OLD_FORM_TOKEN)) return;
    a.href=PARTICIPANT_FORM;
    a.target='_blank';
    a.rel='noopener';
    if(a.classList.contains('conversion-card')){
      const small=a.querySelector('small'); if(small) small.textContent='イベントに参加';
      const h3=a.querySelector('h3'); if(h3) h3.textContent='泥ん子運動会に参加';
      const p=a.querySelector('p'); if(p) p.textContent='2026年9月20日、珠洲市・洲巻地区で開催。参加費は無料です。';
      const b=a.querySelector('b'); if(b) b.textContent='参加フォームを開く →';
      return;
    }
    if(a.closest('.header-actions')) a.textContent='9/20 参加申込';
    else if(a.closest('.mobile-dock')) a.textContent='イベント参加';
    else if(a.closest('.site-footer')) a.textContent='泥ん子運動会に参加';
    else if(a.closest('.diagnosis-result,.final-cta')) a.textContent='泥ん子運動会に参加';
    else a.textContent='9/20 参加申込';
  };

  const removeDedicatedRecruitment=()=>{
    ['co-creation','student-members','student-recruitment','recruitment'].forEach(id=>document.getElementById(id)?.remove());
    document.querySelectorAll('section').forEach(section=>{
      const heading=section.querySelector('h1,h2,h3,.eyebrow');
      if(heading && recruitmentText.test(heading.textContent||'')) section.remove();
    });
    document.querySelectorAll(`a[href*="${OLD_FORM_TOKEN}"]`).forEach(normalizeLegacyLink);
    document.querySelectorAll('p,li,.callout,.renge-event-facts>div').forEach(el=>{
      if(el.isConnected && recruitmentText.test(el.textContent||'')) el.remove();
    });
    const reason=document.getElementById('resultActionReason');
    if(reason && /企画から一緒につくる|当日だけでなく、企画から/.test(reason.textContent||'')){
      reason.textContent='人が集まる場でこそ、あなたの明るさと行動力が生きます。まずは9月20日のイベントに参加し、能登と出会う一歩がおすすめです。';
    }
    document.querySelectorAll('.button-row,.header-actions,.quick-grid,.renge-event-facts,.callout,.source-note').forEach(el=>{
      const text=(el.textContent||'').replace(/\s+/g,'').trim();
      if(!text && !el.querySelector('a,button,img,input,svg')) el.remove();
    });
  };

  const updateLegacyVenueText=()=>{
    const replacements=[
      ['会場候補を確認中','会場確定・使用許可済み'],
      ['珠洲市内で実施予定','珠洲市・洲巻地区で開催'],
      ['珠洲市内で午後開催予定','珠洲市・洲巻地区で午後開催'],
      ['上黒丸地区の元レンコン田。許可・安全条件は未確定','洲巻地区の田んぼ（約20m×50m・約1,000㎡）。土地使用許可取得済み'],
      ['会場候補となる土地の一つ','能登で確認してきた農地の様子'],
      ['活動候補となる土地の一つ','能登で確認してきた農地の様子'],
      ['企画への参加、個人からの支援、企業・団体としての協力から選んでください。','9月20日のイベント参加、個人からの支援、企業・団体としての協力から選んでください。']
    ];
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      let v=node.nodeValue||'';
      replacements.forEach(([from,to])=>{if(v.includes(from)) v=v.split(from).join(to);});
      node.nodeValue=v;
    });
  };

  const setupNav=()=>{
    const body=document.body;
    const menu=document.querySelector('.menu-button');
    const nav=document.querySelector('.site-nav');
    const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    nav?.querySelectorAll('a[href]').forEach(link=>{
      const href=(link.getAttribute('href')||'').split('#')[0].toLowerCase();
      if(href===current||(current===''&&href==='index.html')) link.setAttribute('aria-current','page');
      link.addEventListener('click',()=>{body.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false');});
    });
    menu?.addEventListener('click',()=>{
      const open=body.classList.toggle('menu-open');
      menu.setAttribute('aria-expanded',String(open));
    });
    addEventListener('keydown',e=>{
      if(e.key==='Escape'&&body.classList.contains('menu-open')){
        body.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false');menu?.focus();
      }
    });
  };

  const setupRevealAndScroll=()=>{
    const progress=document.querySelector('.scroll-progress span');
    const back=document.querySelector('.back-top');
    const dock=document.querySelector('.mobile-dock');
    const update=()=>{
      const max=document.documentElement.scrollHeight-innerHeight;
      if(progress) progress.style.width=(max>0?scrollY/max*100:0)+'%';
      back?.classList.toggle('is-visible',scrollY>700);
      dock?.classList.toggle('is-visible',scrollY>520);
    };
    addEventListener('scroll',update,{passive:true}); update();
    back?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
    const items=document.querySelectorAll('.reveal');
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window)) items.forEach(x=>x.classList.add('is-visible'));
    else{
      const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}}),{threshold:.1});
      items.forEach(x=>io.observe(x));
    }
  };

  const ensureHomepageNarrative=()=>{
    if(!document.body.classList.contains('nr-new-home')) return;
    const choices=document.querySelector('.nr-choice-grid');
    if(!choices) return;

    if(!document.getElementById('origin')){
      const origin=document.createElement('section');
      origin.id='origin';
      origin.className='section section--paper motif motif--sprout';
      origin.innerHTML=`<div class="container split-story"><div><p class="eyebrow"><span>このチームが始まった理由</span><small>OUR ORIGIN</small></p><h2>「復旧したあと」にも、<br>人が関わり続ける理由をつくりたい。</h2><p>NOTO Re:Bloomの出発点は、学生向けの地域プロジェクト「NOTO-REBOOST U-23」で能登の課題と向き合ったことでした。使われなくなった農地を前にして、私たちは「土地を整えるだけでなく、まず人がこの場所を知り、訪れ、地域の人と話す入口をつくれないか」と考えました。</p><p>農地再生を一度のイベントで完成させることはできません。だからこそ、泥スポーツという楽しい入口から人を呼び、土地の状態や地域の声を知り、次に関わる人を増やす。その小さな一歩を形にするため、3人の学生でNOTO Re:Bloomを立ち上げました。</p><div class="button-row"><a class="btn btn--outline" href="learn.html">土地の課題と企画を詳しく知る</a></div></div><figure class="photo-frame"><img src="team-reboost.webp" alt="NOTO-REBOOST U-23で活動するNOTO Re:Bloomメンバー"><figcaption>NOTO-REBOOST U-23での挑戦をきっかけに、企画を具体化してきました。</figcaption></figure></div>`;
      choices.after(origin);
    }
    if(!document.getElementById('purpose')){
      const purpose=document.createElement('section');
      purpose.id='purpose';
      purpose.className='section motif motif--vine';
      purpose.innerHTML=`<div class="container"><div class="section-heading section-heading--center"><p class="eyebrow"><span>何のためにやるのか</span><small>PURPOSE & EFFECT</small></p><h2>目標は、イベントを成功させることだけではありません。</h2><p>9月20日の一日を、能登の土地と人の次の関係につなげるための実証として位置づけています。</p></div><div class="event-values"><article><span>土</span><h3>土地に再び人が入るきっかけ</h3><p>使われていない農地を実際に活用し、安全性、排水、動線、運営に必要な条件を確かめ、今後の活用につながる情報を残します。</p></article><article><span>人</span><h3>能登を訪れる理由をつくる</h3><p>「復興支援だから行く」だけではなく、「楽しいから行ってみたい」という入口をつくり、地域外の学生や家族が能登と出会う機会を増やします。</p></article><article><span>話</span><h3>地域の人と話す接点をつくる</h3><p>競技や休憩を一緒にする中で、地域の方と参加者が自然に会話し、能登の現在を直接知る時間をつくります。</p></article><article><span>次</span><h3>一日で終わらせない</h3><p>参加者の反応、費用、土地の条件、運営上の課題を記録し、次年度以降に活用できる形へつなげます。</p></article></div></div>`;
      document.getElementById('origin')?.after(purpose);
    }
  };

  setupNav();
  setupRevealAndScroll();
  updateLegacyVenueText();
  removeDedicatedRecruitment();
  ensureHomepageNarrative();

  // diagnosis.js can update the recommended action after this file has loaded.
  // Watch later DOM changes so the retired student-member form can never reappear publicly.
  let cleaning=false;
  const observer=new MutationObserver(mutations=>{
    if(cleaning) return;
    let relevant=false;
    for(const m of mutations){
      if(m.type==='attributes'&&m.attributeName==='href'){relevant=true;break;}
      if(m.type==='childList'||m.type==='characterData'){relevant=true;break;}
    }
    if(!relevant) return;
    cleaning=true;
    removeDedicatedRecruitment();
    cleaning=false;
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['href']});
})();
