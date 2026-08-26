(()=>{
  'use strict';
  if(document.documentElement.dataset.rbFinalEventFixes==='1') return;
  document.documentElement.dataset.rbFinalEventFixes='1';

  const style=document.createElement('style');
  style.id='rb-final-event-fixes-style';
  style.textContent=`
    /* Participant guide: cards are stacked vertically; text stays horizontal and easy to scan. */
    body.nr-new-home #participant-guide.rb-participant-guide{display:none!important}
    body.nr-new-home #home-participant-guide .rb-pg-grid,
    body.nr-new-event #participant-guide .rb-pg-grid{
      display:grid!important;
      grid-template-columns:1fr!important;
      gap:13px!important;
      align-items:stretch!important;
      overflow:visible!important;
      padding:0!important;
      max-width:1080px!important;
      margin-inline:auto!important;
    }
    body.nr-new-home #home-participant-guide .rb-pg-card,
    body.nr-new-event #participant-guide .rb-pg-card{
      position:relative!important;
      display:grid!important;
      grid-template-columns:92px minmax(210px,270px) minmax(0,1fr)!important;
      align-items:center!important;
      gap:20px!important;
      width:100%!important;
      min-width:0!important;
      min-height:112px!important;
      height:auto!important;
      padding:20px 24px!important;
      border:1px solid rgba(24,75,61,.13)!important;
      border-left:5px solid #3f8068!important;
      border-radius:18px!important;
      background:linear-gradient(100deg,#ffffff 0%,#fbfdfb 100%)!important;
      overflow:visible!important;
      box-shadow:0 8px 24px rgba(24,75,61,.065)!important;
      transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease!important;
    }
    body.nr-new-home #home-participant-guide .rb-pg-card:hover,
    body.nr-new-event #participant-guide .rb-pg-card:hover{
      transform:translateY(-2px)!important;
      box-shadow:0 13px 30px rgba(24,75,61,.10)!important;
      border-color:rgba(24,75,61,.22)!important;
    }
    body.nr-new-home #home-participant-guide .rb-pg-card small,
    body.nr-new-event #participant-guide .rb-pg-card small{
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      justify-self:start!important;
      min-width:72px!important;
      min-height:30px!important;
      margin:0!important;
      padding:6px 10px!important;
      border-radius:999px!important;
      white-space:nowrap!important;
      font-size:11px!important;
      font-weight:900!important;
      letter-spacing:.06em!important;
      background:#e8f3ec!important;
      color:#245441!important;
    }
    body.nr-new-home #home-participant-guide .rb-pg-card h3,
    body.nr-new-event #participant-guide .rb-pg-card h3{
      margin:0!important;
      font-size:19px!important;
      line-height:1.45!important;
      color:#17352e!important;
      letter-spacing:-.01em!important;
    }
    body.nr-new-home #home-participant-guide .rb-pg-card p,
    body.nr-new-event #participant-guide .rb-pg-card p{
      margin:0!important;
      font-size:14px!important;
      line-height:1.78!important;
      color:#53655e!important;
      overflow:visible!important;
      max-height:none!important;
      white-space:normal!important;
    }
    body.nr-new-home #home-participant-guide .rb-pg-card--pending,
    body.nr-new-event #participant-guide .rb-pg-card--pending{
      border-color:rgba(111,75,141,.20)!important;
      border-left-color:#7658a0!important;
      background:linear-gradient(100deg,#fff 0%,#fbf8ff 100%)!important;
    }
    body.nr-new-home #home-participant-guide .rb-pg-card--pending small,
    body.nr-new-event #participant-guide .rb-pg-card--pending small{
      background:#eee7f5!important;
      color:#684887!important;
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

    /* Competition cards: generous two-column layout so every description fits cleanly. */
    body.nr-new-event .game-grid.game-grid--confirmed{
      display:grid!important;
      grid-template-columns:repeat(2,minmax(0,1fr))!important;
      gap:20px!important;
      align-items:stretch!important;
      max-width:1040px!important;
      margin-inline:auto!important;
    }
    body.nr-new-event .game-grid.game-grid--confirmed article{
      position:relative!important;
      display:flex!important;
      flex-direction:column!important;
      justify-content:flex-start!important;
      min-width:0!important;
      min-height:250px!important;
      width:100%!important;
      height:auto!important;
      padding:26px 25px 27px!important;
      border:1px solid rgba(24,75,61,.13)!important;
      border-radius:22px!important;
      background:#fff!important;
      overflow:visible!important;
      box-shadow:0 10px 28px rgba(42,58,50,.075)!important;
      box-sizing:border-box!important;
    }
    body.nr-new-event .game-grid.game-grid--confirmed article:last-child{
      grid-column:1/-1!important;
      width:calc(50% - 10px)!important;
      justify-self:center!important;
    }
    body.nr-new-event .game-grid.game-grid--confirmed article>span{
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      width:40px!important;
      height:40px!important;
      flex:0 0 40px!important;
      margin:0 0 15px!important;
      border-radius:999px!important;
      font-size:12px!important;
      font-weight:900!important;
      line-height:1!important;
    }
    body.nr-new-event .game-grid.game-grid--confirmed article h3{
      position:static!important;
      display:block!important;
      width:auto!important;
      height:auto!important;
      margin:0 0 11px!important;
      padding:0!important;
      font-size:clamp(23px,2.1vw,29px)!important;
      line-height:1.35!important;
      overflow:visible!important;
      max-height:none!important;
      white-space:normal!important;
      word-break:keep-all!important;
      overflow-wrap:anywhere!important;
    }
    body.nr-new-event .game-grid.game-grid--confirmed article p{
      position:static!important;
      display:block!important;
      width:auto!important;
      height:auto!important;
      min-height:0!important;
      margin:0!important;
      padding:0!important;
      font-size:15px!important;
      line-height:1.82!important;
      overflow:visible!important;
      max-height:none!important;
      -webkit-line-clamp:unset!important;
      line-clamp:unset!important;
      -webkit-box-orient:initial!important;
      white-space:normal!important;
      word-break:normal!important;
      overflow-wrap:anywhere!important;
      text-overflow:clip!important;
    }
    body.nr-new-event .game-grid.game-grid--confirmed article:nth-child(1)::before,
    body.nr-new-event .game-grid.game-grid--confirmed article:nth-child(2)::before{
      display:block!important;
      position:relative!important;
      inset:auto!important;
      width:100%!important;
      flex:0 0 185px!important;
      height:185px!important;
      min-height:185px!important;
      margin:0 0 20px!important;
      border-radius:16px!important;
      overflow:hidden!important;
    }

    @media(max-width:900px){
      body.nr-new-home #home-participant-guide .rb-pg-card,
      body.nr-new-event #participant-guide .rb-pg-card{
        grid-template-columns:82px minmax(180px,220px) minmax(0,1fr)!important;
        gap:14px!important;
        padding:18px 20px!important;
      }
      body.nr-new-event .game-grid.game-grid--confirmed{
        gap:16px!important;
      }
      body.nr-new-event .game-grid.game-grid--confirmed article{
        padding:23px 21px 24px!important;
      }
      body.nr-new-event .game-grid.game-grid--confirmed article:last-child{
        width:calc(50% - 8px)!important;
      }
    }

    @media(max-width:720px){
      body.nr-new-event .game-grid.game-grid--confirmed{
        grid-template-columns:1fr!important;
        gap:13px!important;
      }
      body.nr-new-event .game-grid.game-grid--confirmed article,
      body.nr-new-event .game-grid.game-grid--confirmed article:last-child{
        grid-column:auto!important;
        width:100%!important;
        min-height:0!important;
        padding:21px 18px 22px!important;
      }
      body.nr-new-event .game-grid.game-grid--confirmed article:nth-child(1)::before,
      body.nr-new-event .game-grid.game-grid--confirmed article:nth-child(2)::before{
        flex-basis:190px!important;
        height:190px!important;
        min-height:190px!important;
      }
      body.nr-new-home #home-participant-guide .rb-pg-grid,
      body.nr-new-event #participant-guide .rb-pg-grid{
        grid-template-columns:1fr!important;
        gap:10px!important;
      }
      body.nr-new-home #home-participant-guide .rb-pg-card,
      body.nr-new-event #participant-guide .rb-pg-card{
        display:grid!important;
        grid-template-columns:1fr!important;
        gap:8px!important;
        min-height:0!important;
        padding:17px 18px!important;
      }
      body.nr-new-home #home-participant-guide .rb-pg-card small,
      body.nr-new-event #participant-guide .rb-pg-card small{
        justify-self:start!important;
      }
      body.nr-new-home #home-participant-guide .rb-pg-card h3,
      body.nr-new-event #participant-guide .rb-pg-card h3{
        font-size:18px!important;
      }
      body.nr-new-home #home-participant-guide .rb-pg-card p,
      body.nr-new-event #participant-guide .rb-pg-card p{
        font-size:13.5px!important;
        line-height:1.72!important;
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
