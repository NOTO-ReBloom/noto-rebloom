(()=>{
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