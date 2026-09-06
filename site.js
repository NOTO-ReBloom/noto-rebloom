(()=>{
  const nav=document.querySelector('.site-nav');
  if(nav && !nav.querySelector('a[href="thoughts.html"]')){
    const link=document.createElement('a');
    link.href='thoughts.html';
    link.textContent='私たちの思い';
    const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    if(current==='thoughts.html') link.setAttribute('aria-current','page');
    const before=nav.querySelector('a[href="learn.html"]');
    if(before) nav.insertBefore(link,before); else nav.appendChild(link);
  }
  document.write('<script src="site-core.js?v=20260906a"><\/script>');
})();