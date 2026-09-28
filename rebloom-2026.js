(()=>{
  const injectPhotoRibbon=()=>{
    const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    const exists=()=>document.querySelector('.photo-ribbon-section');
    const make=(items)=>`<section class="photo-ribbon-section" aria-label="活動写真"><div class="site-shell photo-ribbon">${items.map(i=>`<figure><img src="${i.src}" alt="${i.alt}"><figcaption>${i.cap}</figcaption></figure>`).join('')}</div></section>`;
    if(file==='event.html'&&!exists()){
      const target=[...document.querySelectorAll('main>.article-section')].find(el=>el.classList.contains('soft'));
      if(target)target.insertAdjacentHTML('beforebegin',make([
        {src:'assets/event-2026/day-tug-of-war.webp',alt:'田んぼで綱引きを楽しむ参加者',cap:'泥んこ綱引き。足元までイベントの一部でした。'},
        {src:'assets/perf/game-800.webp',alt:'泥ん子運動会の競技の様子',cap:'競技中は、田んぼ全体が笑い声でいっぱいに。'},
        {src:'assets/perf/child-800.webp',alt:'子どもと学生が田んぼで交流する様子',cap:'子どもも大人も、同じ場所で泥だらけになりました。'}
      ]));
    }
    if(file==='contact.html'&&!exists()){
      const target=document.querySelector('main>.final-cta');
      if(target)target.insertAdjacentHTML('beforebegin',make([
        {src:'assets/perf/team-presentation-800.webp',alt:'活動を発表する学生メンバー',cap:'企画や活動についての取材・連携も歓迎しています。'},
        {src:'assets/event-2026/group.webp',alt:'泥ん子運動会の参加者とスタッフ',cap:'地域・学生・企業や団体とのつながりから活動が生まれました。'},
        {src:'assets/perf/cup-800.webp',alt:'完成したRe:Bloomレンゲカップ',cap:'小さなアイデアの相談からでも大丈夫です。'}
      ]));
    }
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',injectPhotoRibbon,{once:true});
  else injectPhotoRibbon();

  const loadFonts=()=>{
    if(document.querySelector('link[data-rb-fonts]')) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.dataset.rbFonts='1';
    link.href='https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@700;800;900&display=swap';
    document.head.appendChild(link);
  };
  if('requestIdleCallback' in window) requestIdleCallback(loadFonts,{timeout:1200});
  else setTimeout(loadFonts,200);

  const b=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.site-nav');
  if(!b||!nav)return;
  const close=()=>{document.body.classList.remove('menu-open');b.setAttribute('aria-expanded','false')};
  b.addEventListener('click',()=>{
    const open=!document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open',open);
    b.setAttribute('aria-expanded',String(open));
  });
  nav.addEventListener('click',e=>{if(e.target.closest('a'))close()});
  addEventListener('resize',()=>{if(innerWidth>820)close()},{passive:true});
})();