(()=>{
  'use strict';
  const body=document.body;
  if(!body||body.dataset.rbAppealReady==='1')return;
  body.dataset.rbAppealReady='1';

  if(body.classList.contains('nr-new-home')){
    const hero=document.querySelector('.nr-home-hero');
    if(hero&&!document.querySelector('.rb-project-snapshot')){
      const section=document.createElement('section');
      section.className='rb-project-snapshot';
      section.setAttribute('aria-labelledby','rbProjectSnapshotTitle');
      section.innerHTML=`<div class="rb-project-snapshot__inner"><div class="rb-project-snapshot__top"><div><p class="rb-project-snapshot__label">NOTO Re:Bloomって？</p><h2 id="rbProjectSnapshotTitle">使われなくなった田んぼを、<br>人が集まる場所に変える学生プロジェクトです。</h2></div><p class="rb-project-snapshot__lead">私たちは、能登の農地を舞台に「楽しそうだから行ってみたい」と思えるきっかけをつくります。最初の一歩が、9月20日の泥ん子運動会です。</p></div><div class="rb-project-flow"><article class="rb-project-step"><span class="rb-project-step__num">01</span><b>使われなくなった田んぼに目を向ける</b><p>農家さんや地域の方と相談し、実際に使える場所を探します。</p></article><div class="rb-project-arrow" aria-hidden="true">→</div><article class="rb-project-step"><span class="rb-project-step__num">02</span><b>泥ん子運動会で、人が集まる場所にする</b><p>子どもも大人も、田んぼで思いきり遊べる一日をつくります。</p></article><div class="rb-project-arrow" aria-hidden="true">→</div><article class="rb-project-step"><span class="rb-project-step__num">03</span><b>「また能登に来たい」につなげる</b><p>楽しい体験を、能登を知ることや次の交流のきっかけにします。</p></article></div><p class="rb-project-snapshot__note">耕作放棄地を一度のイベントだけで解決するのではなく、まず「人が来る・使ってみる・話す」入口をつくることから始めています。</p></div>`;
      hero.insertAdjacentElement('afterend',section);
    }
  }

  if(body.classList.contains('nr-new-event')){
    const summary=document.querySelector('.event-summary');
    if(summary&&!document.querySelector('.rb-mud-energy')){
      const energy=document.createElement('section');
      energy.className='rb-mud-energy';
      energy.innerHTML=`<div class="rb-mud-energy__inner"><small>MUD SPORTS DAY</small><h2>走るだけじゃない。探す、投げる、引っぱる、そして笑う。</h2><p>泥の中だから、いつもの運動会とはちょっと違う。うまく走れなくても、泥だらけになるだけで面白い。子どもも大人も一緒に楽しめる一日にします。</p><div class="rb-mud-verbs" aria-label="泥ん子運動会の楽しみ方"><span>泥に入る</span><span>みんなで協力</span><span>思いきり笑う</span><span>全身どろんこ</span></div></div>`;
      summary.insertAdjacentElement('afterend',energy);
    }

    const grid=document.querySelector('.game-grid');
    if(grid){
      const section=grid.closest('section');
      if(section)section.classList.add('rb-play-program');
      const head=section&&section.querySelector('.section-heading');
      if(head){
        head.innerHTML=`<p class="eyebrow"><span>こんな競技を考えています</span><small>PROGRAM IDEAS</small></p><span class="rb-program-status">競技内容は現在検討中です</span><h2>泥だから面白い。<br>そんな遊びを考えています。</h2><p>当日の田んぼの状態や参加人数、安全面を見ながら最終決定します。ここでは、現在候補にしている競技のイメージをご紹介します。</p>`;
      }
      grid.className='game-grid rb-play-grid';
      grid.innerHTML=`<article class="rb-play-card"><span>IDEA 01</span><div class="rb-play-scene"><strong>宝</strong></div><div class="rb-play-copy"><h3>泥んこ宝さがし</h3><p>田んぼの中に隠された宝を、泥をかき分けながら探します。速さよりも「見つけた！」が楽しい競技です。</p><b>子どもも参加しやすい</b></div></article><article class="rb-play-card"><span>IDEA 02</span><div class="rb-play-scene"><strong>玉</strong></div><div class="rb-play-copy"><h3>泥玉チャレンジ</h3><p>泥を使った玉入れ・的当てなどを検討中。走るのが得意でなくても、みんなで盛り上がれる遊びにします。</p><b>狙って、投げて、盛り上がる</b></div></article><article class="rb-play-card"><span>IDEA 03</span><div class="rb-play-scene"><strong>綱</strong></div><div class="rb-play-copy"><h3>泥んこ綱引き</h3><p>踏ん張っても足が滑るのが泥んこ版の面白さ。勝っても負けても、最後はみんな泥だらけです。</p><b>チームで力を合わせる</b></div></article><article class="rb-play-card"><span>IDEA 04</span><div class="rb-play-scene"><strong>桶</strong></div><div class="rb-play-copy"><h3>泥バケツリレー</h3><p>声をかけ合いながらバケツをつなぐ協力競技。単純だからこそ、子どもから大人まで一緒に参加できます。</p><b>みんなで協力</b></div></article>`;
      if(!section.querySelector('.rb-program-caution')){
        const note=document.createElement('p');
        note.className='rb-program-caution';
        note.textContent='※ 上記は競技例です。実施内容は確定ではありません。当日の田んぼの状態、参加人数、安全面を確認したうえで内容を調整します。';
        grid.insertAdjacentElement('afterend',note);
      }
    }
  }
})();
