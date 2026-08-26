(()=>{
  'use strict';
  if(document.documentElement.dataset.rbFinalEventFixes==='photoFaqV1') return;
  document.documentElement.dataset.rbFinalEventFixes='photoFaqV1';

  const style=document.createElement('style');
  style.id='rb-final-event-fixes-style';
  style.textContent=`
    /* The separate pre-participation guide is now merged into the FAQ. */
    body.nr-new-event #participant-guide,
    body.nr-new-event #participant-readiness,
    body.nr-new-home #participant-guide,
    body.nr-new-home #home-participant-guide{
      display:none!important;
    }

    /* Keep date/place information readable on yellow backgrounds. */
    body.nr-new-home .nr-home-hero .eyebrow,
    body.nr-new-home .nr-home-hero .eyebrow span,
    body.nr-new-home .nr-home-hero .eyebrow small,
    body.nr-new-event .page-hero--event .eyebrow,
    body.nr-new-event .page-hero--event .eyebrow span,
    body.nr-new-event .page-hero--event .eyebrow small,
    body.nr-new-home .join-fact,
    body.nr-new-home .join-fact small,
    body.nr-new-home .join-fact strong,
    body.nr-new-home .join-fact span,
    body.nr-new-event .event-summary .summary-grid>div,
    body.nr-new-event .event-summary .summary-grid>div span,
    body.nr-new-event .event-summary .summary-grid>div b{
      color:#17352e!important;
      text-shadow:none!important;
    }

    /* Final competition cards: photo first, simple text hierarchy, no overlapping decoration. */
    body.nr-new-event .game-grid.game-grid--confirmed{
      display:grid!important;
      grid-template-columns:repeat(2,minmax(0,1fr))!important;
      gap:24px!important;
      align-items:stretch!important;
      max-width:1080px!important;
      margin-inline:auto!important;
    }
    body.nr-new-event .game-grid.game-grid--confirmed article{
      position:relative!important;
      display:flex!important;
      flex-direction:column!important;
      min-width:0!important;
      min-height:0!important;
      width:100%!important;
      height:auto!important;
      margin:0!important;
      padding:0!important;
      border:1px solid rgba(24,75,61,.14)!important;
      border-radius:24px!important;
      background:#fff!important;
      overflow:hidden!important;
      box-shadow:0 12px 34px rgba(34,55,45,.09)!important;
      isolation:isolate!important;
    }
    body.nr-new-event .game-grid.game-grid--confirmed article::before,
    body.nr-new-event .game-grid.game-grid--confirmed article::after{
      content:none!important;
      display:none!important;
      background:none!important;
    }
    body.nr-new-event .game-grid.game-grid--confirmed article:last-child{
      grid-column:1/-1!important;
      width:min(528px,calc(50% - 12px))!important;
      justify-self:center!important;
    }
    body.nr-new-event .rb-game-photo{
      display:block!important;
      width:100%!important;
      aspect-ratio:3/2!important;
      height:auto!important;
      object-fit:cover!important;
      object-position:center!important;
      margin:0!important;
      border:0!important;
      border-radius:0!important;
      transform:none!important;
      opacity:1!important;
    }
    body.nr-new-event .rb-game-body{
      display:grid!important;
      grid-template-columns:46px minmax(0,1fr)!important;
      grid-template-rows:auto auto!important;
      column-gap:15px!important;
      row-gap:7px!important;
      align-items:start!important;
      flex:1 1 auto!important;
      padding:21px 23px 24px!important;
    }
    body.nr-new-event .rb-game-no{
      grid-column:1!important;
      grid-row:1/3!important;
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      width:42px!important;
      height:42px!important;
      margin:1px 0 0!important;
      padding:0!important;
      border-radius:999px!important;
      background:#e7f3e8!important;
      color:#184b3d!important;
      font-size:12px!important;
      font-weight:900!important;
      line-height:1!important;
      letter-spacing:.03em!important;
    }
    body.nr-new-event .rb-game-body h3{
      grid-column:2!important;
      grid-row:1!important;
      position:static!important;
      display:block!important;
      width:auto!important;
      height:auto!important;
      margin:0!important;
      padding:0!important;
      font-size:clamp(23px,2.2vw,30px)!important;
      line-height:1.3!important;
      color:#17352e!important;
      white-space:normal!important;
      word-break:keep-all!important;
      overflow:visible!important;
      max-height:none!important;
    }
    body.nr-new-event .rb-game-body p{
      grid-column:2!important;
      grid-row:2!important;
      position:static!important;
      display:block!important;
      width:auto!important;
      height:auto!important;
      min-height:0!important;
      margin:0!important;
      padding:0!important;
      font-size:14.5px!important;
      line-height:1.8!important;
      color:#566761!important;
      white-space:normal!important;
      overflow:visible!important;
      max-height:none!important;
      -webkit-line-clamp:unset!important;
      line-clamp:unset!important;
      text-overflow:clip!important;
    }

    /* FAQ is now the single source for practical participant information. */
    body.nr-new-event #event-faq .faq-grid{
      align-items:stretch!important;
    }
    body.nr-new-event #event-faq .faq-card{
      overflow:visible!important;
      height:auto!important;
      min-height:0!important;
    }
    body.nr-new-event #event-faq .faq-card p{
      overflow:visible!important;
      max-height:none!important;
      -webkit-line-clamp:unset!important;
      line-clamp:unset!important;
    }

    @media(max-width:760px){
      body.nr-new-event .game-grid.game-grid--confirmed{
        grid-template-columns:1fr!important;
        gap:16px!important;
      }
      body.nr-new-event .game-grid.game-grid--confirmed article,
      body.nr-new-event .game-grid.game-grid--confirmed article:last-child{
        grid-column:auto!important;
        width:100%!important;
      }
      body.nr-new-event .rb-game-body{
        grid-template-columns:42px minmax(0,1fr)!important;
        column-gap:13px!important;
        padding:18px 18px 21px!important;
      }
      body.nr-new-event .rb-game-no{
        width:38px!important;
        height:38px!important;
      }
      body.nr-new-event .rb-game-body h3{
        font-size:22px!important;
      }
      body.nr-new-event .rb-game-body p{
        font-size:14px!important;
        line-height:1.75!important;
      }
    }
  `;
  document.head.appendChild(style);

  const program=[
    ['01','綱引き','泥の中で踏ん張りながら、チームで力を合わせる定番競技です。','event-tug-generated.webp','泥の田んぼで綱引きを楽しむ参加者のイメージ'],
    ['02','リレー','泥の中を走って次の人へつなぐ、運動会らしいチーム競技です。','event-relay-generated.webp','泥の田んぼでリレーを楽しむ参加者のイメージ'],
    ['03','台風の目','棒を持ってチームで進み、息を合わせながらコースを回ります。','event-typhoon-generated.webp','泥の田んぼで台風の目を楽しむ参加者のイメージ'],
    ['04','バケツリレー','バケツを使って、チームで協力しながらつないでいきます。','event-bucket-generated.webp','泥の田んぼでバケツリレーを楽しむ参加者のイメージ'],
    ['05','玉入れ','泥の中でも参加しやすく、年齢を問わず楽しめる競技です。','event-ball-generated.webp','泥の田んぼで玉入れを楽しむ参加者のイメージ']
  ];

  const removeSeparateGuides=()=>{
    document.querySelectorAll('#participant-guide,#participant-readiness,#home-participant-guide').forEach(el=>el.remove());
  };

  const mergeParticipantInfoIntoFaq=()=>{
    if(!document.body.classList.contains('nr-new-event')) return;
    const faq=document.querySelector('#event-faq .faq-grid');
    if(!faq) return;

    /* Remove duplicate FAQ cards that an older participant helper may append. */
    faq.querySelectorAll('[data-rb-final-faq]').forEach(el=>el.remove());

    const cards=[...faq.querySelectorAll('.faq-card')];
    const byQuestion=(text)=>cards.find(card=>(card.querySelector('.q')?.textContent||'').includes(text));

    const change=byQuestion('着替えや泥落とし');
    if(change){
      const p=change.querySelector('p');
      if(p) p.innerHTML='更衣スペースを設けます。また、シャワーではありませんが、水で泥を落とす程度の洗い流しは可能です。<strong>着替え一式・タオル・汚れた衣類を入れる袋</strong>をご持参ください。';
    }

    const parking=byQuestion('車は停められますか');
    if(parking){
      const p=parking.querySelector('p');
      if(p) p.textContent='田んぼ周辺に駐車できる場所を用意する予定です。位置・台数は最終確認中で、旧上黒丸小学校も追加候補として確認しています。最終的な集合場所・駐車位置・会場への入り方は、確定後に参加者へ案内します。';
    }
  };

  const stabilizeCompetition=()=>{
    if(!document.body.classList.contains('nr-new-event')) return;
    const grid=document.querySelector('.game-grid');
    const section=grid&&grid.closest('.section');
    if(!grid||!section) return;

    const heading=section.querySelector('.section-heading');
    if(heading){
      const eyebrow=heading.querySelector('.eyebrow span');
      const small=heading.querySelector('.eyebrow small');
      const h2=heading.querySelector('h2');
      const p=heading.querySelector('p:last-of-type');
      if(eyebrow) eyebrow.textContent='競技内容';
      if(small) small.textContent='PROGRAM';
      if(h2) h2.textContent='競技内容を一部公開。';
      if(p) p.textContent='泥の中で、子どもから大人まで一緒に楽しめる競技を行います。綱引き、リレー、台風の目、バケツリレー、玉入れを予定しており、当日の田んぼの状態や天候などにより内容を変更する場合があります。';
      heading.querySelectorAll('.rb-play-status').forEach(el=>el.remove());
    }

    section.classList.remove('rb-mud-play-section');
    grid.classList.remove('rb-play-grid');
    grid.classList.add('game-grid--confirmed');

    const hasFinalPhotos=grid.dataset.rbFinalProgram==='photo-v1' && grid.querySelectorAll('.rb-game-photo').length===5;
    if(!hasFinalPhotos){
      grid.innerHTML=program.map(([no,title,desc,src,alt])=>`<article class="rb-game-card"><img class="rb-game-photo" src="${src}" alt="${alt}" loading="lazy"><div class="rb-game-body"><span class="rb-game-no">${no}</span><h3>${title}</h3><p>${desc}</p></div></article>`).join('');
      grid.dataset.rbFinalProgram='photo-v1';
    }
    section.querySelectorAll('.rb-play-note').forEach(el=>el.remove());
  };

  const run=()=>{
    removeSeparateGuides();
    mergeParticipantInfoIntoFaq();
    stabilizeCompetition();
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
  [80,350,900,1800].forEach(ms=>setTimeout(run,ms));
})();
