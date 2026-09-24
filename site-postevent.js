(()=>{
  'use strict';
  window.__RB_POSTEVENT_RUNTIME__=true;
  const ensureRuntimeStyle=()=>{
    if(document.querySelector('link[href*="site-runtime-20260924.css"]')) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='site-runtime-20260924.css?v=1';
    const consistency=document.querySelector('link[href*="site-consistency.css"]');
    if(consistency) consistency.before(link); else document.head.appendChild(link);
  };
  ensureRuntimeStyle();

  const nav=document.querySelector('.site-nav');
  const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();

  const labels={
    'index.html':'ホーム',
    'thoughts.html':'私たちの思い',
    'learn.html':'土地と企画',
    'event.html':'泥ん子運動会',
    'partner.html':'協賛・協力',
    'diagnosis.html':'花タイプ診断',
    'contact.html':'お問い合わせ'
  };

  if(nav){
    nav.setAttribute('aria-label','メインナビゲーション');
    if(!nav.querySelector('a[href="thoughts.html"]')){
      const link=document.createElement('a');
      link.href='thoughts.html';
      link.textContent='私たちの思い';
      const before=nav.querySelector('a[href="learn.html"]');
      if(before) nav.insertBefore(link,before); else nav.appendChild(link);
    }
    if(!nav.querySelector('a[href="contact.html"]')){
      const link=document.createElement('a');
      link.href='contact.html';
      link.textContent='お問い合わせ';
      nav.appendChild(link);
    }
    nav.querySelectorAll('a[href]').forEach(link=>{
      const href=(link.getAttribute('href')||'').split('#')[0].toLowerCase();
      if(labels[href]) link.textContent=labels[href];
      link.removeAttribute('aria-current');
      if(href===current||(current===''&&href==='index.html')) link.setAttribute('aria-current','page');
    });
  }

  const actions=document.querySelector('.header-actions');
  if(actions){
    actions.innerHTML='';
    const action=document.createElement('a');
    action.className='btn btn--small btn--green';
    action.target='_self';
    if(current==='partner.html'){
      action.href='mailto:infonotorebloom@gmail.com';
      action.textContent='今後の連携を相談';
    }else if(current==='report.html'){
      action.href='partner.html';
      action.textContent='協賛・協力を見る';
    }else{
      action.href='report.html';
      action.textContent='開催レポート';
    }
    actions.appendChild(action);
  }

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
  new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){
        if(node.nodeType===1) keepInternalLinksInSameTab(node);
      }
    }
  }).observe(document.documentElement,{childList:true,subtree:true});

  const menu=document.querySelector('.menu-button');
  const closeMenu=()=>{
    document.body.classList.remove('menu-open');
    menu?.setAttribute('aria-expanded','false');
  };
  menu?.addEventListener('click',()=>{
    const open=document.body.classList.toggle('menu-open');
    menu.setAttribute('aria-expanded',String(open));
  });
  nav?.addEventListener('click',event=>{
    if(event.target?.closest?.('a[href]')) closeMenu();
  });
  addEventListener('keydown',event=>{
    if(event.key==='Escape'&&document.body.classList.contains('menu-open')){
      closeMenu();
      menu?.focus();
    }
  });

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

  document.write('<script src="site-core.js?v=20260924shell1"><\/script>');
})();