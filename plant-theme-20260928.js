(()=>{
  'use strict';

  const makeImageReliable=(img)=>{
    try{
      img.loading='eager';
      img.decoding='async';
      if(img.dataset?.src && !img.getAttribute('src')) img.src=img.dataset.src;
      if(img.dataset?.srcset && !img.getAttribute('srcset')) img.srcset=img.dataset.srcset;
      img.style.opacity='1';
      img.style.visibility='visible';
      img.style.filter='none';
      img.removeAttribute('hidden');

      const retry=()=>{
        if(img.dataset.rbRetried==='1') return;
        if(!img.complete || img.naturalWidth>0) return;
        img.dataset.rbRetried='1';
        try{
          const u=new URL(img.currentSrc||img.src,location.href);
          if(u.origin===location.origin && u.search){
            u.search='';
            img.src=u.pathname+u.hash;
          }
        }catch{}
      };
      img.addEventListener('error',retry,{once:true});
      if(img.complete) retry();
    }catch{}
  };

  const refresh=()=>{
    document.querySelectorAll('img').forEach(makeImageReliable);
    document.querySelectorAll('.photo-frame,.visual-tile,.report-photo,.contact-hero-photo,.people-trust-photo')
      .forEach(el=>{
        el.style.opacity='1';
        el.style.visibility='visible';
      });
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',refresh,{once:true});
  }else{
    refresh();
  }

  addEventListener('load',refresh,{once:true});

  const observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){
        if(node.nodeType!==1) continue;
        if(node.matches?.('img')) makeImageReliable(node);
        node.querySelectorAll?.('img').forEach(makeImageReliable);
      }
    }
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();