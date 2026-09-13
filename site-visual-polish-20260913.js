(()=>{
  'use strict';
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();

  const style=document.createElement('style');
  style.id='rb-visual-polish-20260913';
  style.textContent=`
    :root{--rb-deep:#184b3d;--rb-deeper:#123d32;--rb-ink:#173f34;--rb-muted:#5f7069;--rb-paper:#f7f3ea;--rb-soft:#f4f7f3;--rb-sage:#e7f0e9;--rb-line:rgba(24,75,61,.12)}

    /* Light surfaces: always use dark readable type. */
    .rb-current-note{background:var(--rb-soft)!important;border:1px solid var(--rb-line)!important;color:#465b53!important;box-shadow:none!important}
    .rb-current-note strong,.rb-current-note a{color:var(--rb-deep)!important}
    .rb-home-deadline-chip{background:var(--rb-sage)!important;color:var(--rb-deep)!important;border-color:rgba(24,75,61,.14)!important}
    .rb-support-now{background:#f8f8f4!important;border-color:rgba(24,75,61,.08)!important}
    .rb-support-now__head h2{color:var(--rb-ink)!important}.rb-support-now__head p{color:var(--rb-muted)!important}
    .rb-support-now__grid{gap:14px!important}
    .rb-support-now__card,.rb-support-now__card--media{background:#fff!important;color:var(--rb-ink)!important;border:1px solid var(--rb-line)!important;box-shadow:0 8px 24px rgba(24,75,61,.045)!important}
    .rb-support-now__card small,.rb-support-now__card--media small{color:#607a70!important}
    .rb-support-now__card h3,.rb-support-now__card--media h3{color:var(--rb-ink)!important}
    .rb-support-now__card p,.rb-support-now__card--media p{color:var(--rb-muted)!important}
    .rb-support-now__card strong,.rb-support-now__card--media strong{color:var(--rb-deep)!important}
    .rb-land-next{background:var(--rb-paper)!important;border:1px solid var(--rb-line)!important;box-shadow:none!important}
    .rb-land-next h3{color:var(--rb-ink)!important}.rb-land-next p{color:var(--rb-muted)!important}

    /* Event page light sections. */
    .event-final .hero-note{background:#f7f5ef!important;border-color:var(--rb-line)!important;color:#455851!important}
    .event-final .update-band{background:#f3f6f2!important;border-color:var(--rb-line)!important}
    .event-final .event-kicker:before{background:#89a89a!important;box-shadow:0 0 0 5px rgba(137,168,154,.16)!important}
    .event-final .info-section,.event-final .bring-section{background:#f5f7f4!important}
    .event-final .program-section,.event-final .renge-section{background:#f8f5ee!important}
    .event-final .game-card--special{background:#f6f8f5!important;border-color:rgba(24,75,61,.14)!important}
    .event-final .game-card--special .game-num{background:#e4eee7!important;color:var(--rb-deep)!important}
    .event-final .program-note{background:#edf3ee!important;color:#3f5d53!important}
    .event-final .update-tag{background:#fff!important;color:var(--rb-deep)!important;border-color:var(--rb-line)!important}

    /* Dark surfaces: lock both background AND type colors together. */
    body.rb-unified.event-final main>section.join-section,
    body.event-final main>section.join-section,
    .event-final .join-section{background:linear-gradient(135deg,#123d32 0%,#1d5748 100%)!important;background-color:#184b3d!important;color:#fff!important}
    .event-final .join-section::before,.event-final .join-section::after{opacity:.08!important}
    .event-final .join-section h2,.event-final .join-section h3,.event-final .join-section .event-kicker,.event-final .join-section .event-kicker span,.event-final .join-section .event-kicker small{color:#fff!important;opacity:1!important}
    .event-final .join-section>div>p:not(.event-kicker),.event-final .join-section .container>p:not(.event-kicker){color:rgba(255,255,255,.9)!important;opacity:1!important}
    .event-final .join-section .contact-box{color:rgba(255,255,255,.84)!important;opacity:1!important}
    .event-final .join-section .contact-box a{color:#fff!important;text-decoration:underline!important;text-underline-offset:3px!important;opacity:1!important}
    .event-final .join-section .btn--paper{background:#fff!important;color:#184b3d!important;border:2px solid #fff!important;box-shadow:none!important}
    .event-final .join-section .button-row .btn:not(.btn--paper){background:transparent!important;color:#fff!important;border:2px solid rgba(255,255,255,.72)!important;box-shadow:none!important}
    .event-final .join-section .button-row .btn:not(.btn--paper):hover{background:#fff!important;color:#184b3d!important;border-color:#fff!important}

    .event-final .support-card{background:#214f42!important;background-color:#214f42!important;border-color:#214f42!important;color:#fff!important;box-shadow:none!important}
    .event-final .support-card h3,.event-final .support-card .event-kicker{color:#fff!important}.event-final .support-card p{color:rgba(255,255,255,.9)!important}.event-final .support-chip{color:#fff!important}

    /* Footer must never become pale while retaining white type. */
    body.rb-unified .site-footer,body.rb-unified .rb-footer,.site-footer.rb-footer{background:#123d32!important;background-color:#123d32!important;color:#fff!important}
    body.rb-unified .site-footer :is(h2,h3,b,strong,small,p,span,a),body.rb-unified .rb-footer :is(h2,h3,b,strong,small,p,span,a){color:#fff!important}
    body.rb-unified .site-footer p,body.rb-unified .rb-footer p{color:rgba(255,255,255,.84)!important}

    .rb-current-actions .is-main,.btn--green{box-shadow:none!important}
    .rb-current-actions .is-sub{background:#fff!important;border-color:var(--rb-line)!important}

    @media(max-width:760px){.rb-support-now__card{padding:20px!important}.event-final .hero-note{padding:14px 15px!important}.event-final .join-section{padding-top:58px!important;padding-bottom:58px!important}}
  `;
  document.head.appendChild(style);

  /* Inline important fallbacks prevent old high-specificity theme rules from washing out CTAs. */
  const lockDarkContrast=()=>{
    document.querySelectorAll('.event-final .join-section').forEach(section=>{
      section.style.setProperty('background','linear-gradient(135deg,#123d32 0%,#1d5748 100%)','important');
      section.style.setProperty('background-color','#184b3d','important');
      section.style.setProperty('color','#fff','important');
      section.querySelectorAll('h2,h3,.event-kicker,.event-kicker span,.event-kicker small').forEach(el=>{el.style.setProperty('color','#fff','important');el.style.setProperty('opacity','1','important')});
      section.querySelectorAll('.container>p:not(.event-kicker)').forEach(el=>{el.style.setProperty('color','rgba(255,255,255,.9)','important');el.style.setProperty('opacity','1','important')});
      section.querySelectorAll('.contact-box,.contact-box a').forEach(el=>{el.style.setProperty('color','#fff','important');el.style.setProperty('opacity','1','important')});
    });
  };
  lockDarkContrast();

  if(page==='partner.html'){
    const section=document.getElementById('current-support-20260913');
    const grid=section?.querySelector('.rb-support-now__grid');
    const headLead=section?.querySelector('.rb-support-now__head p:last-child');
    if(headLead) headLead.textContent='物品提供や後援に加え、会場づくりや農地の利用調整では地域の方々に支えていただいています。';
    if(grid){
      grid.innerHTML=`
        <article class="rb-support-now__card"><small>IN-KIND SUPPORT</small><h3>北陸コカ・コーラボトリング株式会社</h3><p>当日の水分補給に向けた<strong>アクエリアス</strong>と、エキシビション企画等で活用する<strong>Coke ONチケット</strong>をご提供いただく予定です。</p></article>
        <article class="rb-support-now__card"><small>LOCAL SUPPORT</small><h3>地域の方々</h3><p>会場となる農地の利用調整や農地再生、現地での受け入れなど、開催に向けた準備をさまざまな形で支えていただいています。</p></article>
        <article class="rb-support-now__card"><small>SUPPORT</small><h3>北國新聞社・MRO北陸放送</h3><p>泥ん子運動会2026を<strong>後援</strong>いただいています。</p></article>`;
    }
  }
})();