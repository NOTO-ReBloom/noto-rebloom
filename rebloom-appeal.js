(()=>{
  'use strict';
  const body=document.body;
  if(!body||body.dataset.rbAppealReady==='1')return;
  body.dataset.rbAppealReady='1';

  /* The four PROJECT AT A GLANCE cards are injected at runtime by rebloom-experience.js.
     Replace only their illustration panes with the generated photographs; keep all copy,
     card layout and surrounding site design unchanged. */
  if(body.classList.contains('nr-new-home')){
    const photos=[
      ['home-step1-land.webp','農地を地域の方と確認するイメージ'],
      ['home-step2-event.webp','泥ん子運動会を楽しむイメージ'],
      ['home-step3-community.webp','地域の方や子ども、学生が集まるイメージ'],
      ['home-step4-next.webp','活動を次につなげるイメージ']
    ];
    const cards=[...document.querySelectorAll('.rb-project-glance .rb-glance-flow article')];
    cards.slice(0,4).forEach((card,i)=>{
      const pane=card.querySelector('.rb-glance-ill');
      if(!pane)return;
      const [src,alt]=photos[i];
      pane.innerHTML=`<img src="${src}" alt="${alt}" loading="lazy" style="display:block;width:100%;height:100%;object-fit:cover;object-position:center;border-radius:inherit">`;
      pane.classList.add('rb-glance-ill--photo');
    });
  }

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
