(()=>{
  'use strict';
  const GROUPS=['太陽の花','風の花','里山の花','水辺の花'];
  const normalize=text=>GROUPS.find(g=>(text||'').includes(g))||'';

  function apply(){
    const resultBadge=document.getElementById('resultGroup');
    const resultHero=document.querySelector('.diagnosis-result .result-hero');
    if(resultBadge){
      const group=normalize(resultBadge.textContent);
      if(group){resultBadge.dataset.group=group;if(resultHero)resultHero.dataset.group=group;}
    }

    const dialogBadge=document.getElementById('atlasDialogGroup');
    if(dialogBadge){
      const group=normalize(dialogBadge.textContent);
      if(group)dialogBadge.dataset.group=group;
    }
  }

  function watch(el){
    if(!el)return;
    new MutationObserver(apply).observe(el,{childList:true,subtree:true,characterData:true});
  }

  function init(){
    apply();
    watch(document.getElementById('resultGroup'));
    watch(document.getElementById('atlasDialogGroup'));
    document.addEventListener('click',e=>{
      if(e.target.closest('.flower-atlas-card'))setTimeout(apply,40);
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
