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

  document.write('<script src="site-core.js?v=20260919sametab3"><\/script>');
  // Pre-event fact injectors were retired after the 2026-09-20 event.
  // Historical scripts remain in the repository but are intentionally not loaded.
})();

/* 2026 post-event mode */
document.addEventListener('DOMContentLoaded',()=>{
  // Keep the flower diagnosis as its standalone experience; do not apply post-event rewrites or styles.
  if(document.body.classList.contains('page-diagnosis')) return;
  document.querySelectorAll('.site-nav a[href="event.html"]').forEach(a=>{a.textContent='開催レポート';});
  document.querySelectorAll('footer a[href="event.html"]').forEach(a=>{if(/泥ん子運動会|詳細/.test(a.textContent||'')) a.textContent='開催レポート';});
  if(!document.body.classList.contains('rb-postevent') && !document.querySelector('link[href^="post-event-legacy.css"]')){
    const l=document.createElement('link');
    l.rel='stylesheet';
    l.href='post-event-legacy.css?v=20260922e';
    l.dataset.postEventPolish='1';
    document.head.appendChild(l);
  }
  document.querySelectorAll('a[href*="forms.gle/6ZMrhrhtWmBCQViD8"]').forEach(a=>{
    a.href='event.html';
    a.target='_self';
    a.removeAttribute('rel');
    a.textContent='開催レポートを見る';
  });
  document.querySelectorAll('.header-actions a').forEach(a=>{
    if(/9\/20|参加申込|参加フォーム/.test(a.textContent||'')){
      a.href='event.html';
      a.target='_self';
      a.textContent='開催レポート';
    }
  });
  document.querySelectorAll('a').forEach(a=>{
    if(/参加フォームを開く|無料で参加申込|9月20日に参加する|泥ん子運動会の詳細を見る|9\/20の詳細/.test(a.textContent||'')){
      a.href='event.html';
      a.target='_self';
      a.removeAttribute('rel');
      a.textContent='開催レポートを見る';
    }
  });
});
