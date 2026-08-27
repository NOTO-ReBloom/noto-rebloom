(()=>{
'use strict';
const TONE_BY_GROUP={
  '太陽の花':'sun',
  '風の花':'wind',
  '里山の花':'satoyama',
  '水辺の花':'water'
};
function toneFor(group){return TONE_BY_GROUP[(group||'').trim()]||'';}
function applyAtlasTones(){
  document.querySelectorAll('.flower-atlas-card').forEach(card=>{
    const group=card.querySelector('span')?.textContent?.trim()||'';
    const tone=toneFor(group);
    if(tone) card.dataset.flowerTone=tone;
  });
}
function applyGroupPreviewTones(){
  document.querySelectorAll('[data-group-preview]').forEach(preview=>{
    const card=preview.closest('.flower-group-card');
    const tone=toneFor(preview.dataset.groupPreview);
    if(card&&tone)card.dataset.flowerTone=tone;
  });
}
function applyDialogTone(){
  const dialog=document.getElementById('flowerAtlasDialog');
  const group=document.getElementById('atlasDialogGroup')?.textContent?.trim()||'';
  const tone=toneFor(group);
  if(dialog){
    if(tone)dialog.dataset.flowerTone=tone;
    else delete dialog.dataset.flowerTone;
  }
}
function applyResultTone(){
  const hero=document.querySelector('#diagnosisResult .result-hero');
  const group=document.getElementById('resultGroup')?.textContent?.trim()||'';
  const tone=toneFor(group);
  if(hero){
    if(tone)hero.dataset.flowerTone=tone;
    else delete hero.dataset.flowerTone;
  }
}
function init(){
  applyGroupPreviewTones();
  applyAtlasTones();
  applyDialogTone();
  applyResultTone();

  const atlas=document.getElementById('flowerAtlasGrid');
  if(atlas)new MutationObserver(()=>applyAtlasTones()).observe(atlas,{childList:true,subtree:true});

  const dialogGroup=document.getElementById('atlasDialogGroup');
  if(dialogGroup)new MutationObserver(()=>applyDialogTone()).observe(dialogGroup,{childList:true,subtree:true,characterData:true});

  const resultGroup=document.getElementById('resultGroup');
  if(resultGroup)new MutationObserver(()=>applyResultTone()).observe(resultGroup,{childList:true,subtree:true,characterData:true});

  document.addEventListener('click',e=>{
    if(e.target.closest('.flower-atlas-card'))setTimeout(applyDialogTone,40);
  });

  setTimeout(()=>{
    applyGroupPreviewTones();
    applyAtlasTones();
    applyDialogTone();
    applyResultTone();
  },180);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
