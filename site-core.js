(()=>{
  document.documentElement.classList.add('js');

  const OLD_FORM_TOKEN='jdSpe6Pb3pyFf7QU6';
  const REPORT_PAGE='report.html';
  const CONTACT_PAGE='contact.html';
  const CONTACT_EMAIL='infonotorebloom@gmail.com';
  const REBOOST_STUDIO_URL='https://coworkingsquarekanazawa.com/events/event/re%EF%BC%9Aboostreboost-studio-%EF%BD%9Ekanazawa-reboost-u23%EF%BD%9E%EF%BD%9C%E5%AD%A6%E7%94%9F%E3%81%AE%E6%8C%91%E6%88%A6%E3%82%92%E3%80%81%E5%9C%B0%E5%9F%9F%E3%81%AE%E7%86%B1%E7%8B%82%E3%81%AB/';
  const INSTAGRAM_URL='https://www.instagram.com/doronkounndoukai2026?igsi=MTNmdjN6bWY0YnJjcQ%3D%3D&utm_source=qr';
  const FACEBOOK_URL='https://www.facebook.com/share/1GqkbWfDAN/?mibextid=wwXIfr';
  const recruitmentText=/学生企画メンバー|学生募集|企画メンバー募集|共創メンバー|申込は8月8日まで|8月8日まで・学生募集/;

  const injectGlobalContact=()=>{
    const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();

    if(!document.querySelector('.rb-contact-fab') && current!=='contact.html'){
      const fab=document.createElement('a');
      fab.href=CONTACT_PAGE;
      fab.className='rb-contact-fab';
      fab.setAttribute('aria-label','質問・お問い合わせページを開く');
      fab.innerHTML='<span class="rb-contact-fab__icon" aria-hidden="true">?</span><span>質問・お問い合わせ</span>';
      document.body.appendChild(fab);
    }

    const footer=document.querySelector('.site-footer');
    if(footer && !footer.querySelector('.rb-contact-footer')){
      const block=document.createElement('div');
      block.className='rb-contact-footer';
      block.innerHTML=`<strong>質問・お問い合わせ</strong><span>活動・取材・協賛・今後の連携など</span><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a><a class="rb-contact-footer__page" href="${CONTACT_PAGE}">お問い合わせページを見る →</a>`;
      footer.appendChild(block);
    }
  };

  const injectFooterSocial=()=>{
    const footer=document.querySelector('.site-footer');
    if(!footer) return;
    footer.querySelectorAll('.rb-social-links--footer').forEach(el=>el.remove());
    const nav=document.createElement('nav');
    nav.className='rb-social-links rb-social-links--footer';
    nav.setAttribute('aria-label','NOTO Re:Bloom 公式SNS');
    nav.innerHTML=`<a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" aria-label="泥ん子運動会 公式Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg></a><a href="${FACEBOOK_URL}" target="_blank" rel="noopener noreferrer" aria-label="泥ん子運動会 公式Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.8 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V3.9c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V10H7v3h3v8h3.8Z"/></svg></a>`;
    footer.appendChild(nav);
  };

  const normalizeLegacyLink=(a)=>{
    if(!(a instanceof HTMLAnchorElement)) return;
    if(!(a.getAttribute('href')||'').includes(OLD_FORM_TOKEN)) return;
    a.href=REPORT_PAGE;
    a.target='_self';
    a.removeAttribute('rel');
    if(a.classList.contains('conversion-card')){
      const small=a.querySelector('small'); if(small) small.textContent='開催結果を見る';
      const h3=a.querySelector('h3'); if(h3) h3.textContent='泥ん子運動会2026 開催報告';
      const p=a.querySelector('p'); if(p) p.textContent='2026年9月20日、珠洲市若山町洲巻で開催した一日の記録を公開しています。';
      const b=a.querySelector('b'); if(b) b.textContent='開催レポートを見る →';
      return;
    }
    if(a.closest('.header-actions')) a.textContent='開催レポート';
    else if(a.closest('.mobile-dock')) a.textContent='開催レポート';
    else if(a.closest('.site-footer')) a.textContent='開催レポートを見る';
    else if(a.closest('.diagnosis-result,.final-cta')) a.textContent='開催レポートを見る';
    else a.textContent='開催レポート';
  };

  const removeDedicatedRecruitment=()=>{
    ['co-creation','student-members','student-recruitment','recruitment'].forEach(id=>document.getElementById(id)?.remove());
    document.querySelectorAll('section').forEach(section=>{
      const heading=section.querySelector('h1,h2,h3,.eyebrow');
      if(heading && recruitmentText.test(heading.textContent||'')) section.remove();
    });
    document.querySelectorAll(`a[href*="${OLD_FORM_TOKEN}"]`).forEach(normalizeLegacyLink);
    document.querySelectorAll('p,li,.callout,.renge-event-facts>div').forEach(el=>{
      if(el.isConnected && recruitmentText.test(el.textContent||'')) el.remove();
    });
    const reason=document.getElementById('resultActionReason');
    if(reason && /企画から一緒につくる|当日だけでなく、企画から/.test(reason.textContent||'')){
      reason.textContent='人が集まる場でこそ、あなたの明るさと行動力が生きます。9月20日の開催レポートから、能登で生まれたつながりを見てみてください。';
    }
    document.querySelectorAll('.button-row,.header-actions,.quick-grid,.renge-event-facts,.callout,.source-note').forEach(el=>{
      const text=(el.textContent||'').replace(/\s+/g,'').trim();
      if(!text && !el.querySelector('a,button,img,input,svg')) el.remove();
    });
  };

  const updateLegacyVenueText=()=>{
    const replacements=[
      ['会場候補を確認中','会場確定・使用許可済み'],
      ['珠洲市内で実施予定','珠洲市・洲巻地区で開催'],
      ['珠洲市内で午後開催予定','珠洲市・洲巻地区で午後開催'],
      ['上黒丸地区の元レンコン田。許可・安全条件は未確定','洲巻地区の田んぼ（約20m×50m・約1,000㎡）。土地使用許可取得済み'],
      ['会場候補となる土地の一つ','能登で確認してきた農地の様子'],
      ['活動候補となる土地の一つ','能登で確認してきた農地の様子'],
      ['企画への参加、個人からの支援、企業・団体としての協力から選んでください。','開催レポート、個人からの支援、企業・団体としての協力から選んでください。'],
      ['17:00頃終了予定','16:30頃閉会予定'],
      ['終了17:00予定','閉会16:30予定']
    ];
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      let v=node.nodeValue||'';
      replacements.forEach(([from,to])=>{if(v.includes(from)) v=v.split(from).join(to);});
      node.nodeValue=v;
    });
  };

  const setupRevealAndScroll=()=>{
    const progress=document.querySelector('.scroll-progress span');
    const back=document.querySelector('.back-top');
    const update=()=>{
      const max=document.documentElement.scrollHeight-innerHeight;
      if(progress) progress.style.width=(max>0?scrollY/max*100:0)+'%';
      back?.classList.toggle('is-visible',scrollY>700);
    };
    addEventListener('scroll',update,{passive:true}); update();
    back?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
    const items=document.querySelectorAll('.reveal');
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window)) items.forEach(x=>x.classList.add('is-visible'));
    else{
      const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}}),{threshold:.1});
      items.forEach(x=>io.observe(x));
    }
  };

  const refineHomepage=()=>{};

  const enrichLearnPage=()=>{
    if(!document.body.classList.contains('page-learn')||document.getElementById('farmland-data-story')) return;
    const numbers=document.getElementById('numbers');
    const container=numbers?.querySelector('.container');
    if(!container) return;
    const heading=numbers.querySelector('.section-heading');
    const h2=heading?.querySelector('h2');
    const p=heading?.querySelector('p:last-child');
    if(h2) h2.textContent='全国に25.7万haの荒廃農地があります。';
    if(p) p.textContent='令和6年度は、そのうち9.8万haが再生利用可能とされています。一年間に新たに発生した荒廃農地は2.4万ha、再生利用された面積は0.8万haでした。';
    const chart=document.createElement('div');
    chart.id='farmland-data-story';
    chart.innerHTML=`<div class="chart-grid"><article class="chart-card"><h3>再生利用が可能な荒廃農地の推移</h3><p>平成27年から令和6年度までの全国値です。令和3年度から調査内容が見直されているため、令和2年以前との単純比較には注意が必要です。</p><div class="trend-bars" role="img" aria-label="再生利用が可能な荒廃農地の推移。平成27年12.4万ヘクタール、令和6年度9.8万ヘクタール"><div class="trend-item"><span class="trend-value">12.4</span><i class="trend-bar" style="height:149px"></i><span class="trend-year">H27</span></div><div class="trend-item"><span class="trend-value">9.8</span><i class="trend-bar" style="height:118px"></i><span class="trend-year">H28</span></div><div class="trend-item"><span class="trend-value">9.2</span><i class="trend-bar" style="height:110px"></i><span class="trend-year">H29</span></div><div class="trend-item"><span class="trend-value">9.2</span><i class="trend-bar" style="height:110px"></i><span class="trend-year">H30</span></div><div class="trend-item"><span class="trend-value">9.1</span><i class="trend-bar" style="height:109px"></i><span class="trend-year">R1</span></div><div class="trend-item"><span class="trend-value">9.0</span><i class="trend-bar" style="height:108px"></i><span class="trend-year">R2</span></div><div class="trend-item"><span class="trend-value">9.1</span><i class="trend-bar" style="height:109px"></i><span class="trend-year">R3</span></div><div class="trend-item"><span class="trend-value">9.0</span><i class="trend-bar" style="height:108px"></i><span class="trend-year">R4</span></div><div class="trend-item"><span class="trend-value">9.4</span><i class="trend-bar" style="height:113px"></i><span class="trend-year">R5</span></div><div class="trend-item"><span class="trend-value">9.8</span><i class="trend-bar" style="height:118px"></i><span class="trend-year">R6</span></div></div><p class="chart-note">単位：万ha。出典：農林水産省「農地に関する統計」「荒廃農地面積の推移」</p></article><article class="chart-card"><h3>25.7万haの内訳</h3><p>整地などによって再び使えると見込まれる土地と、再生が難しいと見込まれる土地があります。</p><div class="breakdown"><div class="breakdown-total"><strong>25.7<small>万ha</small></strong><span>令和6年度</span></div><div class="stack-bar" role="img" aria-label="再生利用が可能9.8万ヘクタール、再生利用が困難15.9万ヘクタール"><span class="possible">9.8</span><span class="difficult">15.9</span></div><div class="stack-legend"><div><i class="possible-dot"></i><span>再生利用が可能</span><b>9.8万ha</b></div><div><i class="difficult-dot"></i><span>再生利用が困難</span><b>15.9万ha</b></div></div></div><div class="flow-compare"><div class="flow-year"><strong>令和5年度</strong><div class="flow-row"><span>新たに発生</span><div class="flow-track"><i class="new" style="width:100%"></i></div><b>2.5</b></div><div class="flow-row"><span>再生利用</span><div class="flow-track"><i class="reuse" style="width:40%"></i></div><b>1.0</b></div></div><div class="flow-year"><strong>令和6年度</strong><div class="flow-row"><span>新たに発生</span><div class="flow-track"><i class="new" style="width:96%"></i></div><b>2.4</b></div><div class="flow-row"><span>再生利用</span><div class="flow-track"><i class="reuse" style="width:32%"></i></div><b>0.8</b></div></div></div><p class="chart-note">発生・再生利用の単位も万haです。</p></article></div><p class="data-source">出典：農林水産省「農地に関する統計」「荒廃農地の発生防止・解消等」。※令和6年能登半島地震の影響により、珠洲市を含む石川県内の一部市町については、荒廃農地面積の一部に過年度の数値を用いて集計されています。</p>`;
    container.appendChild(chart);
  };

  const refineEventPage=()=>{
    if(!document.body.classList.contains('nr-new-event')) return;

    const heroH1=document.querySelector('.page-hero--event h1');
    const heroLead=heroH1?.nextElementSibling;
    if(heroLead?.tagName==='P') heroLead.textContent='使われなくなった土地を、みんなが集まり、笑い合える場所へ。2026年9月20日、珠洲市若山町洲巻の約1,000㎡の田んぼで5つの泥競技とRe:Bloomレンゲカップを実施しました。';

    const reboost=document.getElementById('reboost-studio');
    const faq=document.getElementById('event-faq');
    if(reboost){
      reboost.className='rb-reboost-section rb-reboost-section--compact';
      reboost.innerHTML=`<a class="event-reboost-note" href="${REBOOST_STUDIO_URL}" target="_blank" rel="noopener" aria-label="9月19日 RE:BOOST STUDIO 公式イベントページを見る"><div class="event-reboost-note__copy"><small>9.19 SAT / KANAZAWA</small><strong>前日の9月19日には、香林坊でNOTO Re:Bloomの活動を発表しました。</strong><p>これまでの活動と、翌9月20日に珠洲で実施した泥ん子運動会について紹介しました。</p></div><div class="event-reboost-note__date">9/19<br>15:00–17:00</div></a>`;
      if(faq) faq.after(reboost);
    }

    const grid=document.querySelector('#event-faq .faq-grid');
    if(grid && !grid.querySelector('.faq-category')){
      const cards=[...grid.querySelectorAll(':scope > .faq-card')];
      const groups=[
        ['参加について',cards.slice(0,3)],
        ['服装・持ち物',cards.slice(3,8)],
        ['アクセス・設備',cards.slice(8,13)],
        ['安全・当日の運営',cards.slice(13)]
      ];
      groups.forEach(([title,items])=>{
        if(!items.length) return;
        const group=document.createElement('section');
        group.className='faq-category';
        const heading=document.createElement('h3');
        heading.className='faq-category__title';
        heading.textContent=title;
        const wrap=document.createElement('div');
        wrap.className='faq-category__cards';
        items.forEach(card=>wrap.appendChild(card));
        group.append(heading,wrap);
        grid.appendChild(group);
      });
    }
  };

  const setupDiagnosisExperience=()=>{
    if(!document.body.classList.contains('page-diagnosis')) return;
    const body=document.body;
    const panel=document.getElementById('diagnosisPanel');
    const result=document.getElementById('diagnosisResult');
    if(!panel||!result) return;

    const partnerNav=document.querySelector('.site-nav a[href="partner.html"]');
    if(partnerNav) partnerNav.textContent='協賛・協力';
    const trust=document.querySelector('.diagnosis-trust-note');
    if(trust) trust.textContent='全40問、目安は4〜6分。途中保存でき、結果では32種類の花タイプから自分の傾向を見られます。';
    const tags=[...document.querySelectorAll('.diagnosis-tags li')];
    if(tags[2]) tags[2].textContent='32種類';
    const startCard=document.querySelector('.diagnosis-start-card h3');
    if(startCard) startCard.textContent='直感で、4つから答えるだけ。';

    if(!panel.querySelector('.diagnosis-focus-bar')){
      const bar=document.createElement('div');
      bar.className='diagnosis-focus-bar';
      bar.innerHTML='<div class="diagnosis-focus-copy"><b>花タイプ診断</b><span>回答は自動で保存されます</span></div><button class="diagnosis-focus-close" type="button">いったん閉じる</button>';
      panel.prepend(bar);
      bar.querySelector('button')?.addEventListener('click',()=>{
        body.classList.remove('diagnosis-running');
        document.querySelector('.page-hero--diagnosis')?.scrollIntoView({behavior:'smooth',block:'start'});
      });
    }

    const begin=()=>{
      body.classList.add('diagnosis-running');
      body.classList.remove('diagnosis-has-result');
    };
    ['startDiagnosis','resumeDiagnosis','atlasStartDiagnosis','retryDiagnosis'].forEach(id=>document.getElementById(id)?.addEventListener('click',begin));

    const syncResultState=()=>{
      if(result.classList.contains('is-active')){
        body.classList.remove('diagnosis-running');
        body.classList.add('diagnosis-has-result');
      }
    };
    new MutationObserver(syncResultState).observe(result,{attributes:true,attributeFilter:['class']});
    addEventListener('keydown',event=>{
      if(event.key==='Escape'&&body.classList.contains('diagnosis-running')){
        body.classList.remove('diagnosis-running');
        document.querySelector('.page-hero--diagnosis')?.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  };

  const injectPartnerStrip=()=>{
    if(document.querySelector('.site-partner-strip')) return;
    const footer=document.querySelector('.site-footer');
    if(!footer) return;
    const strip=document.createElement('section');
    strip.className='site-partner-strip';
    strip.setAttribute('aria-label','NOTO Re:Bloomの協賛・協力パートナー');
    strip.innerHTML=`<div class="site-partner-strip__inner"><p class="site-partner-strip__label">NOTO Re:Bloom / 協賛・協力パートナー</p><div class="site-partner-strip__logos"><a class="site-partner-strip__logo site-partner-strip__logo--rebloom" href="index.html" aria-label="NOTO Re:Bloom"><img src="assets/perf/noto-rebloom-logo-220.webp" alt="NOTO Re:Bloom" loading="eager" fetchpriority="low" decoding="async" width="499" height="570"></a><a class="site-partner-strip__logo" href="https://bukatsunavi.com/" target="_blank" rel="sponsored noopener" aria-label="部活ナビ"><img src="bukatsu-navi-logo.svg" alt="部活ナビ" loading="eager" fetchpriority="low" decoding="async" width="1671" height="734"></a><a class="site-partner-strip__logo" href="https://gyakuten-coaching.com/" target="_blank" rel="sponsored noopener" aria-label="逆転コーチング"><img src="assets/perf/gyakuten-coaching-logo-720.webp" alt="逆転コーチング" loading="eager" fetchpriority="low" decoding="async" width="2400" height="675"></a><a class="site-partner-strip__logo" href="https://www.ishimo-ishikawa.jp/" target="_blank" rel="noopener" aria-label="ishimo"><img src="ishimo-logo.svg" alt="ishimo" loading="eager" fetchpriority="low" decoding="async" width="1210" height="461"></a><a class="site-partner-strip__logo" href="https://hamonz.co.jp/" target="_blank" rel="noopener" aria-label="HAMONZ"><img src="hamonz-logo.svg" alt="HAMONZ" loading="eager" fetchpriority="low" decoding="async" width="237" height="71"></a><a class="site-partner-strip__logo" href="https://coworkingsquarekanazawa.com/zukan/" target="_blank" rel="noopener" aria-label="イシカワズカン"><img src="ishikawa-zukan-logo.png" alt="イシカワズカン" loading="eager" fetchpriority="low" decoding="async" width="250" height="250"></a></div><a class="site-partner-strip__more" href="partner.html">協賛・協力について詳しく見る →</a></div>`;
    footer.before(strip);
  };

  injectGlobalContact();
  refineHomepage();
  enrichLearnPage();
  refineEventPage();
  setupDiagnosisExperience();
  injectPartnerStrip();
  injectFooterSocial();
  setupRevealAndScroll();

})();