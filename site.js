(()=>{
  const nav=document.querySelector('.site-nav');
  const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();

  if(nav){
    nav.setAttribute('aria-label','メインナビゲーション');
    if(!nav.querySelector('a[href="thoughts.html"]')){
      const link=document.createElement('a');
      link.href='thoughts.html';
      link.textContent='私たちの思い';
      if(current==='thoughts.html') link.setAttribute('aria-current','page');
      const before=nav.querySelector('a[href="learn.html"]');
      if(before) nav.insertBefore(link,before); else nav.appendChild(link);
    }
  }

  document.querySelectorAll('a[target="_blank"]').forEach(link=>{
    const rel=new Set((link.getAttribute('rel')||'').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    link.setAttribute('rel',[...rel].join(' '));
  });

  document.querySelectorAll('img').forEach((img,index)=>{
    if(!img.hasAttribute('decoding')) img.setAttribute('decoding','async');
    const isHero=!!img.closest('.page-hero,.hero--home,.nr-home-hero');
    if(isHero && index<3){
      if(!img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority','high');
    }else if(!img.hasAttribute('loading')){
      img.setAttribute('loading','lazy');
    }
  });

  document.write('<script src="site-core.js?v=20260913audit2"><\/script>');

  const loadCurrentFacts=()=>{
    if(document.querySelector('script[data-current-facts-loader]')) return;
    const script=document.createElement('script');
    script.src='site-current-20260913.js?v=20260913b';
    script.dataset.currentFactsLoader='1';
    script.onload=()=>{
      if(document.querySelector('script[data-final-audit-loader]')) return;
      const audit=document.createElement('script');
      audit.src='site-final-audit-20260913.js?v=20260913a';
      audit.dataset.finalAuditLoader='1';
      document.body.appendChild(audit);
    };
    document.body.appendChild(script);
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',loadCurrentFacts,{once:true});
  }else{
    loadCurrentFacts();
  }
})();
