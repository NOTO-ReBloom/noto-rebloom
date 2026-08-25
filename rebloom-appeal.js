(()=>{
  'use strict';
  const body=document.body;
  if(!body||body.dataset.rbAppealReady==='1')return;
  body.dataset.rbAppealReady='1';

  /* Fix only the four PROJECT AT A GLANCE image panes. The cards themselves,
     their copy, arrows, spacing and the rest of the page remain unchanged. */
  if(body.classList.contains('nr-new-home')){
    const photos=[
      ['home-step1-generated.webp','農地を見ながら現地で話すイメージ'],
      ['home-step2-generated.webp','泥ん子運動会で競技を楽しむイメージ'],
      ['home-step3-generated.webp','子ども・大人・学生・地域の人が集まるイメージ'],
      ['home-step4-generated.webp','活動を次につなげるイメージ']
    ];

    const applyPhotos=()=>{
      const cards=[...document.querySelectorAll('.rb-project-glance .rb-glance-flow article')];
      if(cards.length<4)return false;
      cards.slice(0,4).forEach((card,i)=>{
        const pane=card.querySelector('.rb-glance-ill');
        if(!pane)return;
        const [src,alt]=photos[i];
        pane.innerHTML=`<img src="${src}?v=20260825generated2" alt="${alt}" loading="lazy" decoding="async" style="display:block;width:100%;height:100%;object-fit:cover;object-position:center;border-radius:inherit">`;
        pane.classList.add('rb-glance-ill--photo');
      });
      return true;
    };

    if(!applyPhotos()){
      const observer=new MutationObserver(()=>{
        if(applyPhotos())observer.disconnect();
      });
      observer.observe(document.documentElement,{childList:true,subtree:true});
      setTimeout(()=>observer.disconnect(),8000);
    }
  }

  /* Keep the existing event-page enhancement unchanged. */
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
