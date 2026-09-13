(()=>{
  'use strict';
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();

  const style=document.createElement('style');
  style.id='rb-visual-polish-20260913';
  style.textContent=`
    /* Keep the added information visually consistent with the original NOTO Re:Bloom palette. */
    :root{--rb-deep:#184b3d;--rb-ink:#173f34;--rb-muted:#5f7069;--rb-paper:#f7f3ea;--rb-soft:#f4f7f3;--rb-sage:#e7f0e9;--rb-line:rgba(24,75,61,.12)}

    .rb-current-note{background:var(--rb-soft)!important;border:1px solid var(--rb-line)!important;color:#52635d!important;box-shadow:none!important}
    .rb-current-note strong,.rb-current-note a{color:var(--rb-deep)!important}
    .rb-home-deadline-chip{background:var(--rb-sage)!important;color:var(--rb-deep)!important;border-color:rgba(24,75,61,.14)!important}

    .rb-support-now{background:#f8f8f4!important;border-color:rgba(24,75,61,.08)!important}
    .rb-support-now__head h2{color:var(--rb-ink)!important}
    .rb-support-now__head p{color:var(--rb-muted)!important}
    .rb-support-now__grid{gap:14px!important}
    .rb-support-now__card,.rb-support-now__card--media{background:#fff!important;color:var(--rb-ink)!important;border:1px solid var(--rb-line)!important;box-shadow:0 8px 24px rgba(24,75,61,.045)!important}
    .rb-support-now__card small,.rb-support-now__card--media small{color:#607a70!important}
    .rb-support-now__card h3,.rb-support-now__card--media h3{color:var(--rb-ink)!important}
    .rb-support-now__card p,.rb-support-now__card--media p{color:var(--rb-muted)!important}
    .rb-support-now__card strong,.rb-support-now__card--media strong{color:var(--rb-deep)!important}

    .rb-land-next{background:var(--rb-paper)!important;border:1px solid var(--rb-line)!important;box-shadow:none!important}
    .rb-land-next h3{color:var(--rb-ink)!important}.rb-land-next p{color:var(--rb-muted)!important}

    .event-final .hero-note{background:#f7f5ef!important;border-color:var(--rb-line)!important;color:#455851!important}
    .event-final .update-band{background:#f3f6f2!important;border-color:var(--rb-line)!important}
    .event-final .event-kicker:before{background:#89a89a!important;box-shadow:0 0 0 5px rgba(137,168,154,.16)!important}
    .event-final .info-section,.event-final .bring-section{background:#f5f7f4!important}
    .event-final .program-section,.event-final .renge-section{background:#f8f5ee!important}
    .event-final .game-card--special{background:#f6f8f5!important;border-color:rgba(24,75,61,.14)!important}
    .event-final .game-card--special .game-num{background:#e4eee7!important;color:var(--rb-deep)!important}
    .event-final .program-note{background:#edf3ee!important;color:#3f5d53!important}
    .event-final .support-card{background:#214f42!important;border-color:#214f42!important;box-shadow:none!important}
    .event-final .join-section{background:#184b3d!important}
    .event-final .update-tag{background:#fff!important;color:var(--rb-deep)!important;border-color:var(--rb-line)!important}

    .rb-current-actions .is-main,.btn--green{box-shadow:none!important}
    .rb-current-actions .is-sub{background:#fff!important;border-color:var(--rb-line)!important}

    @media(max-width:760px){
      .rb-support-now__card{padding:20px!important}
      .event-final .hero-note{padding:14px 15px!important}
    }
  `;
  document.head.appendChild(style);

  if(page==='partner.html'){
    const section=document.getElementById('current-support-20260913');
    const grid=section?.querySelector('.rb-support-now__grid');
    const headLead=section?.querySelector('.rb-support-now__head p:last-child');
    if(headLead){
      headLead.textContent='物品提供や後援に加え、会場づくりや農地の利用調整では地域の方々に支えていただいています。';
    }
    if(grid){
      grid.innerHTML=`
        <article class="rb-support-now__card">
          <small>IN-KIND SUPPORT</small>
          <h3>北陸コカ・コーラボトリング株式会社</h3>
          <p>当日の水分補給に向けた<strong>アクエリアス</strong>と、エキシビション企画等で活用する<strong>Coke ONチケット</strong>をご提供いただく予定です。</p>
        </article>
        <article class="rb-support-now__card">
          <small>LOCAL SUPPORT</small>
          <h3>地域の方々</h3>
          <p>会場となる農地の利用調整や農地再生、現地での受け入れなど、開催に向けた準備をさまざまな形で支えていただいています。</p>
        </article>
        <article class="rb-support-now__card">
          <small>SUPPORT</small>
          <h3>北國新聞社・MRO北陸放送</h3>
          <p>泥ん子運動会2026を<strong>後援</strong>いただいています。</p>
        </article>`;
    }
  }
})();
