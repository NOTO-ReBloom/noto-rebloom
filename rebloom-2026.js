(()=>{
  const loadFonts=()=>{
    if(document.querySelector('link[data-rb-fonts]')) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.dataset.rbFonts='1';
    link.href='https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@700;800;900&family=Noto+Sans+JP:wght@400;500;600;700;800&display=swap';
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