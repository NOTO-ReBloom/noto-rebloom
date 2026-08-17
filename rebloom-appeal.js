(()=>{
  'use strict';
  const body=document.body;
  if(!body||body.dataset.rbAppealReady==='1')return;
  body.dataset.rbAppealReady='1';
  if(body.classList.contains('nr-new-event')){
    const summary=document.querySelector('.event-summary');
    if(summary&&!document.querySelector('.rb-mud-energy')){
      const energy=document.createElement('section');
      energy.className='rb-mud-energy';
      energy.innerHTML=`<div class="rb-mud-energy__inner"><small>MUD SPORTS DAY</small><h2>走るだけじゃない。探す、投げる、運ぶ、そして笑う。</h2><p>泥の中だから、いつもの運動会とはちょっと違う。うまく走れなくても、泥だらけになるだけで面白い。子どもも大人も一緒に楽しめる一日にします。</p><div class="rb-mud-verbs" aria-label="泥ん子運動会の楽しみ方"><span>泥に入る</span><span>みんなで協力</span><span>思いきり笑う</span><span>全身どろんこ</span></div></div>`;
      summary.insertAdjacentElement('afterend',energy);
    }
  }
})();
