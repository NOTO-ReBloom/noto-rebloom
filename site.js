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

  // Every link in the site header must stay in the current browsing tab on an ordinary click.
  // This deliberately bypasses target attributes and any later link rewriting.
  const navigateHeaderInPlace=(event)=>{
    if(event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link=event.target?.closest?.('.site-nav a[href], a.brand[href]');
    if(!(link instanceof HTMLAnchorElement)) return;
    const href=link.getAttribute('href');
    if(!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    link.removeAttribute('target');
    const url=new URL(href,location.href);
    window.location.href=url.href;
  };
  window.addEventListener('click',navigateHeaderInPlace,true);


  const isInternalSiteLink=(link)=>{
    if(!(link instanceof HTMLAnchorElement)) return false;
    const href=link.getAttribute('href');
    if(!href||href.startsWith('#')||href.startsWith('mailto:')||href.startsWith('tel:')||href.startsWith('javascript:')) return false;
    try{
      const url=new URL(href,location.href);
      return url.origin===location.origin && url.pathname.startsWith('/noto-rebloom/');
    }catch(e){return false;}
  };

  const keepInternalLinksInSameTab=(root=document)=>{
    root.querySelectorAll?.('a[href]').forEach(link=>{
      if(!isInternalSiteLink(link)) return;
      link.removeAttribute('target');
      const rel=(link.getAttribute('rel')||'').split(/\s+/).filter(Boolean).filter(x=>x!=='noopener'&&x!=='noreferrer');
      if(rel.length) link.setAttribute('rel',rel.join(' ')); else link.removeAttribute('rel');
    });
  };

  keepInternalLinksInSameTab();
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('a[href]');
    if(isInternalSiteLink(link)){
      link.removeAttribute('target');
    }
  },true);
  new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){
        if(node.nodeType===1){
          if(node.matches?.('a[href]')&&isInternalSiteLink(node)) node.removeAttribute('target');
          keepInternalLinksInSameTab(node);
        }
      }
    }
  }).observe(document.documentElement,{childList:true,subtree:true});

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

  document.write('<script src="site-core.js?v=20260919sametab2"><\/script>');

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
      audit.onload=()=>{
        if(document.querySelector('script[data-visual-polish-loader]')) return;
        const polish=document.createElement('script');
        polish.src='site-visual-polish-20260913.js?v=20260913b';
        polish.dataset.visualPolishLoader='1';
        polish.onload=()=>{
          if(document.querySelector('script[data-latest-facts-loader]')) return;
          const latest=document.createElement('script');
          latest.src='site-current-20260917.js?v=20260917a';
          latest.dataset.latestFactsLoader='1';
          document.body.appendChild(latest);
        };
        document.body.appendChild(polish);
      };
      document.body.appendChild(audit);
    };
    document.body.appendChild(script);
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',loadCurrentFacts,{once:true});
  else loadCurrentFacts();
})();