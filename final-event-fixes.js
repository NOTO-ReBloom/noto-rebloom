(()=>{
  'use strict';
  if(document.documentElement.dataset.rbFinalEventFixes==='1') return;
  document.documentElement.dataset.rbFinalEventFixes='1';

  const style=document.createElement('style');
  style.id='rb-final-event-fixes-style';
  style.textContent=`
    /* Participant guide: vertical list, with each card itself laid out horizontally. */
    body.nr-new-home #participant-guide.rb-participant-guide{display:none!important}
    body.nr-new-home #home-participant-guide .rb-pg-grid,
    body.nr-new-event #participant-guide .rb-pg-grid{
      display:grid!important;
      grid-template-columns:1fr!important;
      gap:12px!important;
      align-items:stretch!important;
      overflow:visible!important;
      padding:0!important;
    }
    body.nr-new-home #home-participant-guide .rb-pg-card,
    body.nr-new-event #participant-guide .rb-pg-card{
      position:relative!important;
      display:grid!important;
      grid-template-columns:96px minmax(190px,260px) minmax(0,1fr)!important;
      align-items:center!important;
      gap:18px!important;
      width:100%!important;
      min-width:0!important;
      min-height:0!important;
      height:auto!important;
      padding:18px 22px!important;
      border-radius:18px!important;
      overflow:hidden!important;
      box-shadow:0 8px 24px rgba(24,75,61,.07)!important;
      transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease!important;
    }
    body.nr-new-home #home-participant-guide .rb-pg-card:hover,
    body.nr-new-event #participant-guide .rb-pg-card:hover{
      transform:translateY(-2px)!important;
      box-shadow:0 12px 30px rgba(24,75,61,.10)!important;
    }
    body.nr-new-home #home-participant-guide .rb-pg-card small,
    body.nr-new-event #participant-guide .rb-pg-card small{
      margin:0!important;
      justify-self:start!important;
      white-space:nowrap!important;
    }
    body.nr-new-home #home-participant-guide .rb-pg-card h3,
    body.nr-new-event #participant-guide .rb-pg-card h3{
      margin:0!important;
      font-size:19px!important;
      line-height:1.45!important;
      color:#17352e!important;
    }
    body.nr-new-home #home-participant-guide .rb-pg-card p,
    body.nr-new-event #participant-guide .rb-pg-card p{
      margin:0!important;
      font-size:14px!important;
      line-height:1.75!important;
      color:#53655e!important;
    }
    body.nr-new-home #home-participant-guide .rb-pg-card--pending,
    body.nr-new-event #participant-guide .rb-pg-card--pending{
      border-color:rgba(111,75,141,.20)!important;
      background:linear-gradient(100deg,#fff 0%,#fbf8ff 100%)!important;
    }

    /* Keep date/place information readable on yellow backgrounds. */
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

    /* Competition cards: 3 cards on the first row, 2 wider cards below. No text clipping. */
    body.nr-new-event .game-grid.game-grid--confirmed{
      display:grid!important;
      grid-template-columns:repeat(6,minmax(0,1fr))!important;
      gap:18px!important;
      align-items:stretch!important;
    }
    body.nr-new-event .game-grid.game-grid--confirmed article{
      grid-column:span 2!important;
      display:flex!important;
      flex-direction:column!important;
      min-width:0!important;
      min-height:0!important;
      height:auto!important;
      padding:24px 22px!important;
      border-radius:22px!important;
      overflow:visible!important;
      box-shadow:0 10px 28px rgba(42,58,50,.08)!important;
    }
    body.nr-new-event .game-grid.game-grid--confirmed article:nth-child(4),
    body.nr-new-event .game-grid.game-grid--confirmed article:nth-child(5){
      grid-column:span 3!important;
    }
    body.nr-new-event .game-grid.game-grid--confirmed article>span{
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      width:38px!important;
      height:38px!important;
      flex:0 0 38px!important;
      margin-bottom:14px!important;
      border-radius:999px!important;
      font-size:12px!important;
      font-weight:900!important;
    }
    body.nr-new-event .game-grid.game-grid--confirmed article h3{
      margin:0 0 10px!important;
      font-size:clamp(22px,2vw,28px)!important;
      line-height:1.3!important;
      overflow:visible!important;
      max-height:none!important;
      white-space:normal!important;
    }
    body.nr-new-event .game-grid.game-grid--confirmed article p{
      display:block!important;
      margin:0!important;
      font-size:14px!important;
      line-height:1.78!important;
      overflow:visible!important;
      max-height:none!important;
      -webkit-line-clamp:unset!important;
      line-clamp:unset!important;
      white-space:normal!important;
      word-break:normal!important;
    }
    body.nr-new-event .game-grid.game-grid--confirmed article:nth-child(1)::before,
    body.nr-new-event .game-grid.game-grid--confirmed article:nth-child(2)::before{
      flex:0 0 150px!important;
      height:150px!important;
      margin-bottom:18px!important;
      border-radius:16px!important;
    }

    @media(max-width:980px){
      body.nr-new-event .game-grid.game-grid--confirmed{
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
      }
      body.nr-new-event .game-grid.game-grid--confirmed article,
      body.nr-new-event .game-grid.game-grid--confirmed article:nth-child(4),
      body.nr-new-event .game-grid.game-grid--confirmed article:nth-child(5){
        grid-column:auto!important;
      }
      body.nr-new-event .game-grid.game-grid--confirmed article:last-child{
        grid-column:1/-1!important;
      }
      body.nr-new-home #home-participant-guide .rb-pg-card,
      body.nr-new-event #participant-guide .rb-pg-card{
        grid-template-columns:82px minmax(170px,220px) minmax(0,1fr)!important;
        gap:14px!important;
        padding:17px 18px!important;
      }
    }

    @media(max-width:680px){
      body.nr-new-event .game-grid.game-grid--confirmed{grid-template-columns:1fr!important;gap:12px!important}
      body.nr-new-event .game-grid.game-grid--confirmed article,
      body.nr-new-event .game-grid.game-grid--confirmed article:last-child{
        grid-column:auto!important;
        padding:20px 18px!important;
      }
      body.nr-new-event .game-grid.game-grid--confirmed article:nth-child(1)::before,
      body.nr-new-event .game-grid.game-grid--confirmed article:nth-child(2)::before{
        flex-basis:180px!important;
        height:180px!important;
      }
      body.nr-new-home #home-participant-guide .rb-pg-grid,
      body.nr-new-event #participant-guide .rb-pg-grid{
        display:grid!important;
        grid-template-columns:1fr!important;
        overflow:visible!important;
        gap:10px!important;
      }
      body.nr-new-home #home-participant-guide .rb-pg-card,
      body.nr-new-event #participant-guide .rb-pg-card{
        display:grid!important;
        grid-template-columns:auto minmax(0,1fr)!important;
        gap:8px 12px!important;
        padding:16px!important;
      }
      body.nr-new-home #home-participant-guide .rb-pg-card h3,
      body.nr-new-event #participant-guide .rb-pg-card h3{
        font-size:17px!important;
      }
      body.nr-new-home #home-participant-guide .rb-pg-card p,
      body.nr-new-event #participant-guide .rb-pg-card p{
        grid-column:1/-1!important;
        font-size:13px!important;
        line-height:1.7!important;
      }
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

  const run=()=>{stabilizeCompetition()};

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
  setTimeout(run,80);
  setTimeout(run,350);
})();
