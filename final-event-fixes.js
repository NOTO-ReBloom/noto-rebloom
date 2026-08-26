(()=>{
  'use strict';
  if(document.documentElement.dataset.rbFinalEventFixes==='1') return;
  document.documentElement.dataset.rbFinalEventFixes='1';

  const style=document.createElement('style');
  style.id='rb-final-event-fixes-style';
  style.textContent=`
    /* 1) Keep the participant guide horizontal and remove the older duplicate home guide. */
    body.nr-new-home #participant-guide.rb-participant-guide{display:none!important}
    body.nr-new-home #home-participant-guide .rb-pg-grid{
      display:grid!important;
      grid-template-columns:repeat(4,minmax(0,1fr))!important;
      gap:14px!important;
      align-items:stretch!important;
    }
    body.nr-new-home #home-participant-guide .rb-pg-card{min-width:0!important;height:100%!important}
    body.nr-new-event #participant-guide .rb-pg-grid{
      display:grid!important;
      grid-template-columns:repeat(3,minmax(0,1fr))!important;
      gap:14px!important;
      align-items:stretch!important;
    }
    body.nr-new-event #participant-guide .rb-pg-card{min-width:0!important;height:100%!important}

    /* 2) Improve contrast for the date/place information near the top. */
    body.nr-new-home .nr-home-hero .eyebrow,
    body.nr-new-home .nr-home-hero .eyebrow span,
    body.nr-new-home .nr-home-hero .eyebrow small,
    body.nr-new-event .page-hero--event .eyebrow,
    body.nr-new-event .page-hero--event .eyebrow span,
    body.nr-new-event .page-hero--event .eyebrow small{
      color:#17352e!important;
      text-shadow:none!important;
    }
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

    /* 3) The confirmed competition cards should use the normal confirmed-program layout. */
    body.nr-new-event .game-grid.game-grid--confirmed{
      grid-template-columns:repeat(5,minmax(0,1fr))!important;
    }

    @media(max-width:1050px){
      body.nr-new-event .game-grid.game-grid--confirmed{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      body.nr-new-event #participant-guide .rb-pg-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    }
    @media(max-width:760px){
      body.nr-new-home #home-participant-guide .rb-pg-grid,
      body.nr-new-event #participant-guide .rb-pg-grid{
        display:flex!important;
        overflow-x:auto!important;
        gap:12px!important;
        padding:2px 2px 10px!important;
        scroll-snap-type:x mandatory;
        -webkit-overflow-scrolling:touch;
      }
      body.nr-new-home #home-participant-guide .rb-pg-card,
      body.nr-new-event #participant-guide .rb-pg-card{
        flex:0 0 min(82vw,310px)!important;
        scroll-snap-align:start;
      }
    }
    @media(max-width:600px){
      body.nr-new-event .game-grid.game-grid--confirmed{grid-template-columns:1fr!important}
    }
  `;
  document.head.appendChild(style);

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
    grid.innerHTML=`
      <article><span>01</span><h3>綱引き</h3><p>泥の中で踏ん張りながら、チームで力を合わせる定番競技です。</p></article>
      <article><span>02</span><h3>リレー</h3><p>泥の中を走って次の人へつなぐ、運動会らしいチーム競技です。</p></article>
      <article><span>03</span><h3>台風の目</h3><p>棒を持ってチームで進み、息を合わせながらコースを回ります。</p></article>
      <article><span>04</span><h3>バケツリレー</h3><p>バケツを使って、チームで協力しながらつないでいきます。</p></article>
      <article><span>05</span><h3>玉入れ</h3><p>泥の中でも参加しやすく、年齢を問わず楽しめる競技です。</p></article>`;
    section.querySelectorAll('.rb-play-note').forEach(el=>el.remove());
  };

  const run=()=>{
    stabilizeCompetition();
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
  setTimeout(run,80);
  setTimeout(run,350);
})();
