(()=>{
  'use strict';
  const body=document.body;
  if(!body||body.classList.contains('rb-experience-ready')) return;
  body.classList.add('rb-experience-ready');

  const iconField=`<svg viewBox="0 0 180 120" role="img" aria-label="使われていない農地のイラスト"><path d="M15 91c29-12 57-13 83-4 25 9 47 8 67-4v25H15z" fill="#b98661"/><path d="M14 72c28-10 55-9 82 1 27 11 50 9 70-4" fill="none" stroke="#7f5b43" stroke-width="5" stroke-linecap="round"/><path d="M40 70c-3-22 4-38 20-50M61 72c0-19 9-31 26-40M116 72c3-19-3-34-18-46M137 69c2-15 9-25 21-31" fill="none" stroke="#63845a" stroke-width="5" stroke-linecap="round"/><circle cx="43" cy="29" r="5" fill="#f3cf58"/><circle cx="151" cy="30" r="5" fill="#f3cf58"/></svg>`;
  const iconMud=`<svg viewBox="0 0 180 120" role="img" aria-label="泥ん子運動会のイラスト"><ellipse cx="90" cy="99" rx="67" ry="13" fill="#9f6b4c"/><circle cx="71" cy="35" r="13" fill="#f5c7a8"/><path d="M58 55c9-11 25-12 35-2l11 12-15 13-12-10-16 14-14-15z" fill="#f3cf58"/><path d="M63 81 49 99M84 79l16 20M57 61 37 51M94 62l24-13" fill="none" stroke="#184b3d" stroke-width="7" stroke-linecap="round"/><path d="M31 94c8-10 15-11 23-4M119 92c10-9 18-8 27 2" fill="none" stroke="#fff7d7" stroke-width="4" stroke-linecap="round"/></svg>`;
  const iconPeople=`<svg viewBox="0 0 180 120" role="img" aria-label="人が集まって話すイラスト"><circle cx="48" cy="38" r="12" fill="#f5c7a8"/><circle cx="91" cy="31" r="12" fill="#f0b99c"/><circle cx="135" cy="40" r="12" fill="#f5c7a8"/><path d="M29 91c2-25 12-38 25-38s23 14 25 38M72 91c2-30 12-45 25-45 15 0 25 15 27 45M115 91c2-24 12-37 25-37s21 13 24 37" fill="#dcefd9" stroke="#184b3d" stroke-width="5" stroke-linejoin="round"/><path d="M60 27c7-12 20-17 29-14M108 18c9-6 19-6 28 0" fill="none" stroke="#f3cf58" stroke-width="5" stroke-linecap="round"/></svg>`;
  const iconSprout=`<svg viewBox="0 0 180 120" role="img" aria-label="次の活用につながる芽のイラスト"><path d="M22 96c34-18 68-18 101-3 16 7 29 7 40 0v20H22z" fill="#b98661"/><path d="M90 99V49" fill="none" stroke="#184b3d" stroke-width="7" stroke-linecap="round"/><path d="M88 61c-22-2-34-12-36-29 22-1 36 8 39 28M93 53c19-1 30-10 33-25-20-2-32 7-35 24" fill="#78a66a" stroke="#184b3d" stroke-width="4" stroke-linejoin="round"/><circle cx="90" cy="28" r="7" fill="#f3cf58"/></svg>`;

  const arrow=`<span class="rb-glance-arrow" aria-hidden="true">→</span>`;

  if(body.classList.contains('nr-new-home')&&!document.querySelector('.rb-project-glance')){
    const hero=document.querySelector('.nr-home-hero');
    if(hero){
      const section=document.createElement('section');
      section.className='rb-project-glance';
      section.innerHTML=`<div class="container">
        <div class="rb-glance-head">
          <div><p class="eyebrow"><span>NOTO Re:Bloomとは？</span><small>PROJECT AT A GLANCE</small></p><h2>使われなくなった農地を、<br><em>みんなが集まるきっかけ</em>に。</h2></div>
          <p>遊ぶことを入口に、能登へ来る理由と、人がつながる時間をつくる学生プロジェクトです。</p>
        </div>
        <div class="rb-glance-flow" aria-label="NOTO Re:Bloomの取り組みの流れ">
          <article><div class="rb-glance-ill">${iconField}</div><small>STEP 1</small><h3>農地を借りる</h3><p>使われなくなった田んぼをお借りします。</p></article>${arrow}
          <article><div class="rb-glance-ill">${iconMud}</div><small>STEP 2</small><h3>泥ん子運動会</h3><p>まずは、思いきり遊べる一日をつくります。</p></article>${arrow}
          <article><div class="rb-glance-ill">${iconPeople}</div><small>STEP 3</small><h3>人が集まる</h3><p>子ども・大人・学生・地域の人が同じ場所へ。</p></article>${arrow}
          <article><div class="rb-glance-ill">${iconSprout}</div><small>STEP 4</small><h3>次につなげる</h3><p>一日で終わらせず、次の活用を考えます。</p></article>
        </div>
        <div class="rb-glance-line"><strong>農地再生だけでも、イベントだけでもない。</strong><span>「楽しい」を入口に、能登との関わりを増やしていきます。</span><a href="learn.html">企画の理由を詳しく見る →</a></div>
      </div>`;
      hero.insertAdjacentElement('afterend',section);
    }
  }

  const mudRun=`<svg viewBox="0 0 220 150" role="img" aria-label="泥の中を走る人のイラスト"><ellipse cx="111" cy="127" rx="89" ry="16" fill="#996647"/><circle cx="92" cy="41" r="15" fill="#f3c5a6"/><path d="M77 61c11-11 31-11 42 2l15 18-18 13-13-13-17 18-19-17z" fill="#f3cf58"/><path d="M82 97 61 124M108 94l24 30M78 68 48 59M119 70l30-19" fill="none" stroke="#184b3d" stroke-width="8" stroke-linecap="round"/><path d="M37 118c11-10 21-10 32 0M144 116c12-10 24-8 35 4" fill="none" stroke="#fff5c9" stroke-width="5" stroke-linecap="round"/><circle cx="150" cy="48" r="4" fill="#9b6a4c"/><circle cx="160" cy="59" r="6" fill="#9b6a4c"/></svg>`;
  const mudTreasure=`<svg viewBox="0 0 220 150" role="img" aria-label="泥の中で宝探しをする人のイラスト"><ellipse cx="110" cy="128" rx="91" ry="16" fill="#996647"/><circle cx="104" cy="42" r="14" fill="#f3c5a6"/><path d="M78 75c11-18 37-23 55-7l11 10-17 17-14-9-18 9-21-11z" fill="#dfeeda"/><path d="M87 83 64 116M126 86l22 31M84 77 58 90M134 78l24 13" fill="none" stroke="#184b3d" stroke-width="8" stroke-linecap="round"/><path d="M50 116c18-9 34-7 49 5M135 119c16-8 30-7 43 4" fill="none" stroke="#fff5c9" stroke-width="5" stroke-linecap="round"/><path d="m40 74 8 8 13-19 13 19 9-8-5 22H45z" fill="#f3cf58" stroke="#184b3d" stroke-width="3"/></svg>`;
  const mudTarget=`<svg viewBox="0 0 220 150" role="img" aria-label="泥玉を的に投げる人のイラスト"><ellipse cx="106" cy="130" rx="83" ry="14" fill="#996647"/><circle cx="67" cy="50" r="14" fill="#f3c5a6"/><path d="M51 70c11-12 27-13 40-4l13 10-14 16-12-8-8 28-27-4z" fill="#e9dff5"/><path d="M62 107 50 126M78 108l14 18M52 77 31 5M91 75l24-18" fill="none" stroke="#184b3d" stroke-width="8" stroke-linecap="round"/><circle cx="123" cy="54" r="9" fill="#895b40"/><circle cx="166" cy="72" r="31" fill="#fffaf0" stroke="#184b3d" stroke-width="6"/><circle cx="166" cy="72" r="20" fill="#f3cf58"/><circle cx="166" cy="72" r="9" fill="#e98399"/></svg>`;
  const bucketRelay=`<svg viewBox="0 0 220 150" role="img" aria-label="バケツリレーをする二人のイラスト"><ellipse cx="110" cy="130" rx="91" ry="14" fill="#996647"/><circle cx="68" cy="44" r="13" fill="#f3c5a6"/><circle cx="151" cy="43" r="13" fill="#f0b99c"/><path d="M52 63c10-9 25-9 35 0l10 13-15 13-12-10-8 30-27-5zM136 63c10-10 26-10 36 0l12 13-15 13-13-11-8 31-27-6z" fill="#dfeeda"/><path d="M54 106 44 127M74 107l12 20M139 106l-9 21M160 106l13 21M80 75l30 13M140 75l-30 13" fill="none" stroke="#184b3d" stroke-width="7" stroke-linecap="round"/><path d="M92 81h35l-4 29H96z" fill="#a9d8e7" stroke="#184b3d" stroke-width="4"/><path d="M97 80c2-17 24-17 26 0" fill="none" stroke="#184b3d" stroke-width="4"/></svg>`;

  if(body.classList.contains('nr-new-event')){
    const grid=document.querySelector('.game-grid');
    const section=grid&&grid.closest('.section');
    if(grid&&section&&!section.classList.contains('rb-mud-play-section')){
      section.classList.add('rb-mud-play-section');
      const heading=section.querySelector('.section-heading');
      if(heading){
        const eyebrow=heading.querySelector('.eyebrow span'); if(eyebrow) eyebrow.textContent='こんな遊びを検討中';
        const small=heading.querySelector('.eyebrow small'); if(small) small.textContent='PLAY IDEAS';
        const h2=heading.querySelector('h2'); if(h2) h2.innerHTML='泥の中だから、<br><span>いつもの遊びがもっとおもしろい。</span>';
        const p=heading.querySelector('p:last-child'); if(p) p.textContent='競技はまだ確定していません。当日の田んぼの状態や参加人数を見ながら、子どもも大人も一緒に笑える内容を選びます。';
        heading.insertAdjacentHTML('beforeend','<div class="rb-play-status"><b>競技例</b><span>内容は検討中です</span></div>');
      }
      grid.classList.add('rb-play-grid');
      grid.innerHTML=`
        <article><div class="rb-play-ill">${mudRun}</div><div class="rb-play-copy"><small>PLAY 01</small><h3>泥んこダッシュ</h3><p>走っているのに全然進まない。それだけで笑える、泥ならではの短距離チャレンジ。</p><b>走るだけで、おもしろい。</b></div></article>
        <article><div class="rb-play-ill">${mudTreasure}</div><div class="rb-play-copy"><small>PLAY 02</small><h3>泥んこ宝探し</h3><p>泥の中に隠れた“お宝”をみんなで捜索。速さより、見つけた瞬間の盛り上がりを楽しむ遊びです。</p><b>見つけた人がヒーロー。</b></div></article>
        <article><div class="rb-play-ill">${mudTarget}</div><div class="rb-play-copy"><small>PLAY 03</small><h3>泥玉チャレンジ</h3><p>泥玉を作って、狙った場所へ。走るのが得意じゃなくても参加しやすい遊びを考えています。</p><b>狙って、投げて、盛り上がる。</b></div></article>
        <article><div class="rb-play-ill">${bucketRelay}</div><div class="rb-play-copy"><small>PLAY 04</small><h3>バケツリレー</h3><p>チームで声をかけながらバケツをつなぐ。大人も子どもも同じチームで楽しめる競技例です。</p><b>最後はチームでハイタッチ。</b></div></article>`;
      grid.insertAdjacentHTML('afterend','<p class="rb-play-note">※掲載している競技はイメージです。天候・田んぼの深さ・参加人数・安全面を確認して、当日の内容を決定します。</p>');
    }
  }
})();
