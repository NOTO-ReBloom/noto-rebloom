(()=>{
  'use strict';
  const body=document.body;
  if(!body||body.dataset.rbAppealReady==='1')return;
  body.dataset.rbAppealReady='1';

  /* PROJECT AT A GLANCE is injected at runtime by rebloom-experience.js.
     Replace only the four illustration panes with photographs. */
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
    /* rebloom-experience.js was also replacing the confirmed competition program with
       old SVG concept art and 'under consideration' copy. Restore the current confirmed
       five-event program so the page remains consistent with event.html and the flyer. */
    const grid=document.querySelector('.game-grid');
    const section=grid&&grid.closest('.section');
    if(grid&&section){
      const heading=section.querySelector('.section-heading');
      if(heading){
        const eyebrow=heading.querySelector('.eyebrow span'); if(eyebrow) eyebrow.textContent='競技内容';
        const small=heading.querySelector('.eyebrow small'); if(small) small.textContent='PROGRAM';
        const h2=heading.querySelector('h2'); if(h2) h2.textContent='競技内容を一部公開。';
        const p=heading.querySelector('p:last-of-type'); if(p) p.textContent='泥の中で、子どもから大人まで一緒に楽しめる競技を行います。以下の競技を予定しており、当日の田んぼの状態や天候などにより内容を変更する場合があります。';
        heading.querySelector('.rb-play-status')?.remove();
      }
      section.classList.remove('rb-mud-play-section');
      grid.className='game-grid game-grid--confirmed';
      grid.innerHTML=`
        <article><span>01</span><h3>綱引き</h3><p>泥の中で踏ん張りながら、チームで力を合わせる定番競技です。</p></article>
        <article><span>02</span><h3>リレー</h3><p>泥の中を走って次の人へつなぐ、運動会らしいチーム競技です。</p></article>
        <article><span>03</span><h3>台風の目</h3><p>棒を持ってチームで進み、息を合わせながらコースを回ります。</p></article>
        <article><span>04</span><h3>バケツリレー</h3><p>バケツを使って、チームで協力しながらつないでいきます。</p></article>
        <article><span>05</span><h3>玉入れ</h3><p>泥の中でも参加しやすく、年齢を問わず楽しめる競技です。</p></article>`;
      section.querySelector('.rb-play-note')?.remove();
    }

    const summary=document.querySelector('.event-summary');
    if(summary&&!document.querySelector('.rb-mud-energy')){
      const energy=document.createElement('section');
      energy.className='rb-mud-energy';
      energy.innerHTML=`<div class="rb-mud-energy__inner"><small>MUD SPORTS DAY</small><h2>走るだけじゃない。探す、投げる、運ぶ、そして笑う。</h2><p>泥の中だから、いつもの運動会とはちょっと違う。うまく走れなくても、泥だらけになるだけで面白い。子どもも大人も一緒に楽しめる一日にします。</p><div class="rb-mud-verbs" aria-label="泥ん子運動会の楽しみ方"><span>泥に入る</span><span>みんなで協力</span><span>思いきり笑う</span><span>全身どろんこ</span></div></div>`;
      summary.insertAdjacentElement('afterend',energy);
    }
  }
})();
