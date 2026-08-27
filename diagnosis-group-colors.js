(()=>{
  'use strict';
  const GROUPS=['太陽の花','風の花','里山の花','水辺の花'];
  const normalize=text=>GROUPS.find(g=>(text||'').includes(g))||'';

  function applyAtlasCards(){
    document.querySelectorAll('.flower-atlas-card').forEach(card=>{
      const group=normalize(card.querySelector('span')?.textContent||'');
      if(group)card.dataset.flowerGroup=group;
    });
  }

  function apply(){
    const resultBadge=document.getElementById('resultGroup');
    const resultHero=document.querySelector('.diagnosis-result .result-hero');
    if(resultBadge){
      const group=normalize(resultBadge.textContent);
      if(group){
        resultBadge.dataset.group=group;
        if(resultHero)resultHero.dataset.group=group;
      }
    }

    const dialogBadge=document.getElementById('atlasDialogGroup');
    const dialog=document.getElementById('flowerAtlasDialog');
    if(dialogBadge){
      const group=normalize(dialogBadge.textContent);
      if(group){
        dialogBadge.dataset.group=group;
        if(dialog)dialog.dataset.group=group;
      }
    }

    applyAtlasCards();
  }

  function watch(el,options={childList:true,subtree:true,characterData:true}){
    if(!el)return;
    new MutationObserver(apply).observe(el,options);
  }

  function init(){
    apply();
    watch(document.getElementById('resultGroup'));
    watch(document.getElementById('atlasDialogGroup'));
    watch(document.getElementById('flowerAtlasGrid'),{childList:true,subtree:true});
    document.addEventListener('click',e=>{
      if(e.target.closest('.flower-atlas-card'))setTimeout(apply,40);
    });
    setTimeout(apply,160);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
