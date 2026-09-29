(()=>{
  'use strict';

  const loadFonts=(displayMode='swap')=>{
    if(document.getElementById('rebloom-google-fonts'))return;
    const link=document.createElement('link');
    link.id='rebloom-google-fonts';
    link.rel='stylesheet';
    link.href='https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;700;800;900&family=Noto+Sans+JP:wght@400;500;600;700;800&display='+encodeURIComponent(displayMode);
    document.head.appendChild(link);
  };
  const isEventArchive=!!document.body?.classList.contains('event-final')||!!document.body?.classList.contains('nr-new-event');
  const isDiagnosis=!!document.body?.classList.contains('page-diagnosis');
  if((document.body?.classList.contains('page-home')||document.body?.classList.contains('nr-new-home'))){
    loadFonts('swap');
  }else if(isDiagnosis){
    /* The diagnosis uses the shared font stack from CSS without a late remote
       font swap, preventing the stacked mobile hero from shifting after paint. */
  }else if(!isEventArchive){
    if('requestIdleCallback' in window)requestIdleCallback(loadFonts,{timeout:1600}); else setTimeout(loadFonts,900);
  }

  const makeImageReliable=(img)=>{
    try{
      const eventArchive=!!document.body?.classList.contains('event-final')||!!document.body?.classList.contains('nr-new-event');
      const eventHero=eventArchive&&!!img.closest('.event-hero,.page-hero,.hero');
      if(!eventArchive||eventHero) img.loading='eager';
      img.decoding='async';
      if(img.dataset?.src && !img.getAttribute('src')) img.src=img.dataset.src;
      if(img.dataset?.srcset && !img.getAttribute('srcset')) img.srcset=img.dataset.srcset;
      img.style.opacity='1';
      img.style.visibility='visible';
      img.style.filter='none';
      img.removeAttribute('hidden');

      const retry=()=>{
        if(img.dataset.rbRetried==='1') return;
        if(!img.complete || img.naturalWidth>0) return;
        img.dataset.rbRetried='1';
        try{
          const u=new URL(img.currentSrc||img.src,location.href);
          if(u.origin===location.origin && u.search){
            u.search='';
            img.src=u.pathname+u.hash;
          }
        }catch{}
      };
      img.addEventListener('error',retry,{once:true});
      if(img.complete) retry();
    }catch{}
  };

  const refresh=()=>{
    document.querySelectorAll('img').forEach(makeImageReliable);
    document.querySelectorAll('.photo-frame,.visual-tile,.report-photo,.contact-hero-photo,.people-trust-photo')
      .forEach(el=>{
        el.style.opacity='1';
        el.style.visibility='visible';
      });
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',refresh,{once:true});
  }else{
    refresh();
  }

  addEventListener('load',refresh,{once:true});

  const observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){
        if(node.nodeType!==1) continue;
        if(node.matches?.('img')) makeImageReliable(node);
        node.querySelectorAll?.('img').forEach(makeImageReliable);
      }
    }
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});

  /* UNIVERSAL SITE CHROME + CONTRAST / 2026-09-28 */
  const UNIVERSAL_INSTAGRAM='https://www.instagram.com/doronkounndoukai2026?igsi=MTNmdjN6bWY0YnJjcQ%3D%3D&utm_source=qr';
  const UNIVERSAL_FACEBOOK='https://www.facebook.com/share/1GqkbWfDAN/?mibextid=wwXIfr';
  const UNIVERSAL_CROWD='https://readyfor.jp/projects/kousakuhoukiti-saisei';
  const UNIVERSAL_ISHIMO='https://www.ishimo-ishikawa.jp/';

  const socialIconMarkup=(extraClass='')=>`
    <nav class="rb-universal-social ${extraClass}" aria-label="NOTO Re:Bloom 公式SNS">
      <a class="rb-social-instagram" href="${UNIVERSAL_INSTAGRAM}" target="_blank" rel="noopener noreferrer" aria-label="泥ん子運動会 公式Instagram">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>
      </a>
      <a class="rb-social-facebook" href="${UNIVERSAL_FACEBOOK}" target="_blank" rel="noopener noreferrer" aria-label="泥ん子運動会 公式Facebook">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.8 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V3.9c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V10H7v3h3v8h3.8Z"/></svg>
      </a>
    </nav>`;

  const ensureHeaderSocial=()=>{
    const header=document.querySelector('.site-header');
    if(!header)return;
    const actions=header.querySelector('.header-actions');
    if(actions && !actions.querySelector('.rb-header-social')){
      actions.insertAdjacentHTML('afterbegin',socialIconMarkup('rb-header-social'));
    }
    const nav=header.querySelector('.site-nav');
    if(nav && !nav.querySelector('.rb-menu-social')){
      nav.insertAdjacentHTML('beforeend',socialIconMarkup('rb-menu-social'));
    }
  };

  const universalFooterMarkup=(current)=>{
    const reportMode=current==='report.html';
    const ctaHref=reportMode?'partner.html':'report.html';
    const ctaLabel=reportMode?'協賛・協力を見る':'開催レポートを見る';
    const ctaTitle=reportMode?'この一日を支えてくださった皆さまへ。':'泥ん子運動会2026を開催しました。';
    const ctaText=reportMode
      ?'協賛・物品提供・情報発信・現地調整など、多くの協力に支えられて開催できました。'
      :'2026年9月20日、珠洲市若山町洲巻で開催した一日の記録を公開しています。';
    return `
      <div class="container rb-footer-cta"><div><h2>${ctaTitle}</h2><p>${ctaText}</p></div><a class="btn rb-footer-cta__button" href="${ctaHref}">${ctaLabel}</a></div>
      <div class="container rb-footer-grid">
        <div><b>NOTO Re:Bloom</b><p>楽しさを入口に能登を訪れ、土地を知り、地域の方と関わる時間をつくる学生プロジェクトです。</p></div>
        <div class="rb-footer-links"><strong>PROJECT</strong><a href="report.html">開催レポート</a><a href="learn.html">土地と企画</a><a href="event.html">泥ん子運動会アーカイブ</a><a href="diagnosis.html">花タイプ診断</a></div>
        <div class="rb-footer-links"><strong>CONTACT</strong><a href="partner.html">協賛・協力</a><a href="contact.html">お問い合わせ</a><a href="mailto:infonotorebloom@gmail.com">メールで問い合わせ</a><a href="${UNIVERSAL_CROWD}" target="_blank" rel="noopener">2026年クラファン結果</a></div>
      </div>
      ${socialIconMarkup('rb-footer-social')}
      <div class="container rb-contact-footer"><strong>質問・お問い合わせ</strong><span>活動・取材・協賛・今後の連携など</span><a href="mailto:infonotorebloom@gmail.com">infonotorebloom@gmail.com</a><a class="rb-contact-footer__page" href="contact.html">お問い合わせページを見る →</a></div>
      <div class="container rb-footer-bottom"><span>NOTO Re:Bloom</span><span>infonotorebloom@gmail.com</span></div>`;
  };

  const ensureUniversalFooter=()=>{
    const footer=document.querySelector('.site-footer');
    if(!footer)return;
    const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    footer.classList.add('rb-footer','rb-footer--universal');
    footer.innerHTML=universalFooterMarkup(current);
  };

  const ensurePartnerStrip=()=>{
    const footer=document.querySelector('.site-footer');
    if(!footer)return;
    document.querySelectorAll('.site-partner-strip').forEach(el=>el.remove());
    const strip=document.createElement('section');
    strip.className='site-partner-strip site-partner-strip--universal';
    strip.setAttribute('aria-label','NOTO Re:Bloomの協賛・協力パートナー');
    strip.innerHTML=`
      <div class="site-partner-strip__inner">
        <p class="site-partner-strip__label">NOTO Re:Bloom / 協賛・協力パートナー</p>
        <div class="site-partner-strip__logos">
          <a class="site-partner-strip__logo site-partner-strip__logo--rebloom" href="index.html" aria-label="NOTO Re:Bloom"><img src="assets/perf/noto-rebloom-logo-220.webp" alt="NOTO Re:Bloom" loading="lazy" decoding="async" width="499" height="570"></a>
          <a class="site-partner-strip__logo" href="https://bukatsunavi.com/" target="_blank" rel="sponsored noopener" aria-label="部活ナビ"><img src="bukatsu-navi-logo.svg" alt="部活ナビ" loading="lazy" decoding="async" width="1671" height="734"></a>
          <a class="site-partner-strip__logo" href="https://gyakuten-coaching.com/" target="_blank" rel="sponsored noopener" aria-label="逆転コーチング"><img src="assets/perf/gyakuten-coaching-logo-720.webp" alt="逆転コーチング" loading="lazy" decoding="async" width="2400" height="675"></a>
          <a class="site-partner-strip__logo" href="${UNIVERSAL_ISHIMO}" target="_blank" rel="noopener" aria-label="ishimo"><img src="ishimo-logo.svg" alt="ishimo" loading="lazy" decoding="async" width="1210" height="461"></a>
          <a class="site-partner-strip__logo" href="https://hamonz.co.jp/" target="_blank" rel="noopener" aria-label="HAMONZ"><img src="hamonz-logo.svg" alt="HAMONZ" loading="lazy" decoding="async" width="237" height="71"></a>
          <a class="site-partner-strip__logo" href="https://coworkingsquarekanazawa.com/zukan/" target="_blank" rel="noopener" aria-label="イシカワズカン"><img src="ishikawa-zukan-logo.png" alt="イシカワズカン" loading="lazy" decoding="async" width="250" height="250"></a>
        </div>
        <a class="site-partner-strip__more" href="partner.html">協賛・協力について詳しく見る →</a>
      </div>`;
    footer.before(strip);
  };

  const rgb=(value)=>{
    const m=String(value||'').match(/rgba?\((\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)(?:[,/\s]+([\d.]+))?\)/i);
    if(!m)return null;
    return {r:+m[1],g:+m[2],b:+m[3],a:m[4]==null?1:+m[4]};
  };
  const luminance=(x)=>{
    const lin=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};
    return .2126*lin(x.r)+.7152*lin(x.g)+.0722*lin(x.b);
  };
  const forceReadableLightSurfaces=()=>{
    const targets=document.querySelectorAll([
      'body.page-learn .data-grid>article strong',
      'body.page-learn .data-grid>article strong small',
      'body.page-learn .data-grid>article h3',
      '.report-finance .eyebrow',
      '.report-finance .eyebrow small'
    ].join(','));
    targets.forEach(el=>el.classList.add('rb-auto-contrast-text'));
  };

  const applyKnownContrastFixes=()=>{
    const important=(el,prop,value)=>el?.style?.setProperty(prop,value,'important');

    document.querySelectorAll('.event-values>article>span,.cause-grid>article>span,.check-list>div>span').forEach(el=>{
      important(el,'background-color','#174a36');
      important(el,'color','#ffffff');
      important(el,'-webkit-text-fill-color','#ffffff');
    });

    document.querySelectorAll('.eyebrow,.eyebrow--light').forEach(el=>{
      important(el,'background-color','#dfe9d8');
      important(el,'color','#173f34');
      important(el,'-webkit-text-fill-color','#173f34');
      el.querySelectorAll('span,small,strong').forEach(child=>{
        important(child,'color','#173f34');
        important(child,'-webkit-text-fill-color','#173f34');
      });
    });

    document.querySelectorAll('body.page-learn #numbers .data-grid>article').forEach(card=>{
      important(card,'background-color','#fffdf8');
      important(card,'color','#173f34');
      card.querySelectorAll('strong,h3,small').forEach(el=>{
        important(el,'color','#173f34');
        important(el,'-webkit-text-fill-color','#173f34');
      });
    });

    document.querySelectorAll('body.report-page .report-money-card').forEach(card=>{
      important(card,'background-color','#fffdf8');
      important(card,'color','#173f34');
      card.querySelectorAll('h3,p,span,strong,b,small,em,a').forEach(el=>{
        important(el,'color','#173f34');
        important(el,'-webkit-text-fill-color','#173f34');
      });
    });

    document.querySelectorAll('body.report-page .report-thanks .report-volunteer-names>span').forEach(el=>{
      important(el,'background-color','#f5f7f1');
      important(el,'color','#315e50');
      important(el,'-webkit-text-fill-color','#315e50');
    });
  };

  const ensureBotanicalDecor=()=>{
    if(document.querySelector('.rb-botanical-decor'))return;
    const layer=document.createElement('div');
    layer.className='rb-botanical-decor';
    layer.setAttribute('aria-hidden','true');
    layer.innerHTML=`
      <span class="rb-botanical-haze rb-botanical-haze--one"></span>
      <span class="rb-botanical-haze rb-botanical-haze--two"></span>

      <svg class="rb-botanical-vine rb-botanical-vine--left" viewBox="0 0 220 720" focusable="false" aria-hidden="true">
        <path class="rb-vine-stem" d="M100 714C59 620 146 571 91 482C36 393 139 341 101 251C70 176 133 118 107 8"/>
        <ellipse class="rb-vine-leaf" cx="79" cy="626" rx="24" ry="43" transform="rotate(-38 79 626)"/>
        <ellipse class="rb-vine-leaf rb-vine-leaf--soft" cx="127" cy="574" rx="22" ry="40" transform="rotate(31 127 574)"/>
        <ellipse class="rb-vine-leaf" cx="70" cy="502" rx="23" ry="42" transform="rotate(-44 70 502)"/>
        <ellipse class="rb-vine-leaf rb-vine-leaf--soft" cx="136" cy="432" rx="22" ry="40" transform="rotate(38 136 432)"/>
        <ellipse class="rb-vine-leaf" cx="77" cy="350" rx="21" ry="38" transform="rotate(-40 77 350)"/>
        <ellipse class="rb-vine-leaf rb-vine-leaf--soft" cx="132" cy="274" rx="20" ry="37" transform="rotate(36 132 274)"/>
        <ellipse class="rb-vine-leaf" cx="86" cy="192" rx="18" ry="34" transform="rotate(-34 86 192)"/>
        <ellipse class="rb-vine-leaf rb-vine-leaf--soft" cx="128" cy="112" rx="17" ry="32" transform="rotate(30 128 112)"/>
        <g transform="translate(139 382)">
          <circle class="rb-vine-bloom" cx="-14" cy="0" r="16"/><circle class="rb-vine-bloom" cx="14" cy="0" r="16"/>
          <circle class="rb-vine-bloom" cx="0" cy="-14" r="16"/><circle class="rb-vine-bloom" cx="0" cy="14" r="16"/>
          <circle class="rb-vine-bloom-core" cx="0" cy="0" r="8"/>
        </g>
        <g transform="translate(80 145) scale(.72)">
          <circle class="rb-vine-bloom" cx="-14" cy="0" r="16"/><circle class="rb-vine-bloom" cx="14" cy="0" r="16"/>
          <circle class="rb-vine-bloom" cx="0" cy="-14" r="16"/><circle class="rb-vine-bloom" cx="0" cy="14" r="16"/>
          <circle class="rb-vine-bloom-core" cx="0" cy="0" r="8"/>
        </g>
      </svg>

      <svg class="rb-botanical-vine rb-botanical-vine--right" viewBox="0 0 220 720" focusable="false" aria-hidden="true">
        <path class="rb-vine-stem" d="M100 714C59 620 146 571 91 482C36 393 139 341 101 251C70 176 133 118 107 8"/>
        <ellipse class="rb-vine-leaf" cx="79" cy="626" rx="24" ry="43" transform="rotate(-38 79 626)"/>
        <ellipse class="rb-vine-leaf rb-vine-leaf--soft" cx="127" cy="574" rx="22" ry="40" transform="rotate(31 127 574)"/>
        <ellipse class="rb-vine-leaf" cx="70" cy="502" rx="23" ry="42" transform="rotate(-44 70 502)"/>
        <ellipse class="rb-vine-leaf rb-vine-leaf--soft" cx="136" cy="432" rx="22" ry="40" transform="rotate(38 136 432)"/>
        <ellipse class="rb-vine-leaf" cx="77" cy="350" rx="21" ry="38" transform="rotate(-40 77 350)"/>
        <ellipse class="rb-vine-leaf rb-vine-leaf--soft" cx="132" cy="274" rx="20" ry="37" transform="rotate(36 132 274)"/>
        <ellipse class="rb-vine-leaf" cx="86" cy="192" rx="18" ry="34" transform="rotate(-34 86 192)"/>
        <ellipse class="rb-vine-leaf rb-vine-leaf--soft" cx="128" cy="112" rx="17" ry="32" transform="rotate(30 128 112)"/>
        <g transform="translate(139 382)">
          <circle class="rb-vine-bloom" cx="-14" cy="0" r="16"/><circle class="rb-vine-bloom" cx="14" cy="0" r="16"/>
          <circle class="rb-vine-bloom" cx="0" cy="-14" r="16"/><circle class="rb-vine-bloom" cx="0" cy="14" r="16"/>
          <circle class="rb-vine-bloom-core" cx="0" cy="0" r="8"/>
        </g>
      </svg>

      <svg class="rb-botanical-sprig rb-botanical-sprig--one" viewBox="0 0 160 260" focusable="false" aria-hidden="true">
        <path d="M78 252C82 194 65 149 92 98C106 71 111 40 108 10"/>
        <ellipse cx="59" cy="187" rx="18" ry="34" transform="rotate(-43 59 187)"/>
        <ellipse cx="103" cy="157" rx="17" ry="32" transform="rotate(38 103 157)"/>
        <ellipse cx="75" cy="112" rx="16" ry="29" transform="rotate(-36 75 112)"/>
        <ellipse cx="120" cy="78" rx="15" ry="27" transform="rotate(34 120 78)"/>
        <circle cx="103" cy="28" r="9"/><circle cx="120" cy="34" r="6"/><circle cx="91" cy="39" r="5"/>
      </svg>
      <svg class="rb-botanical-sprig rb-botanical-sprig--two" viewBox="0 0 160 260" focusable="false" aria-hidden="true">
        <path d="M78 252C82 194 65 149 92 98C106 71 111 40 108 10"/>
        <ellipse cx="59" cy="187" rx="18" ry="34" transform="rotate(-43 59 187)"/>
        <ellipse cx="103" cy="157" rx="17" ry="32" transform="rotate(38 103 157)"/>
        <ellipse cx="75" cy="112" rx="16" ry="29" transform="rotate(-36 75 112)"/>
        <ellipse cx="120" cy="78" rx="15" ry="27" transform="rotate(34 120 78)"/>
        <circle cx="103" cy="28" r="9"/><circle cx="120" cy="34" r="6"/><circle cx="91" cy="39" r="5"/>
      </svg>

      <span class="rb-botanical-petal rb-botanical-petal--1"></span>
      <span class="rb-botanical-petal rb-botanical-petal--2"></span>
      <span class="rb-botanical-petal rb-botanical-petal--3"></span>
      <span class="rb-botanical-petal rb-botanical-petal--4"></span>
      <span class="rb-botanical-petal rb-botanical-petal--5"></span>
      <span class="rb-botanical-petal rb-botanical-petal--6"></span>
      <span class="rb-botanical-petal rb-botanical-petal--7"></span>
      <span class="rb-botanical-petal rb-botanical-petal--8"></span>

      <span class="rb-seed-cluster rb-seed-cluster--one"><i></i><i></i><i></i><i></i><i></i><i></i></span>
      <span class="rb-seed-cluster rb-seed-cluster--two"><i></i><i></i><i></i><i></i><i></i><i></i></span>
    `;
    document.body.appendChild(layer);
    requestAnimationFrame(()=>document.documentElement.classList.add('rb-botanical-ready'));
  };

  const currentMotif=()=>{
    const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    if(file==='index.html')return'home';
    if(file==='thoughts.html')return'thoughts';
    if(file==='learn.html')return'learn';
    if(file==='event.html')return'event';
    if(file==='report.html')return'report';
    if(file==='partner.html')return'partner';
    if(file==='diagnosis.html')return'diagnosis';
    if(file==='contact.html')return'contact';
    return'home';
  };

  const motifSvg=(kind)=>{
    const commonStart='<svg viewBox="0 0 120 120" focusable="false" aria-hidden="true">';
    const commonEnd='</svg>';
    const motifs={
      home:
        '<path class="rb-motif-stroke" d="M60 104C58 82 61 64 59 43"/>'+
        '<ellipse class="rb-motif-fill" cx="43" cy="58" rx="15" ry="27" transform="rotate(-42 43 58)"/>'+
        '<ellipse class="rb-motif-fill" cx="77" cy="48" rx="14" ry="25" transform="rotate(38 77 48)"/>'+
        '<ellipse class="rb-motif-seed" cx="61" cy="100" rx="8" ry="13" transform="rotate(12 61 100)"/>',
      thoughts:
        '<path class="rb-motif-stroke" d="M60 14C57 40 61 59 58 76M58 76C42 84 29 94 18 108M58 76C73 86 88 97 101 109M58 76C52 91 49 102 47 114M58 76C67 91 72 102 74 114"/>'+
        '<ellipse class="rb-motif-fill" cx="42" cy="35" rx="12" ry="23" transform="rotate(-36 42 35)"/>'+
        '<ellipse class="rb-motif-fill" cx="76" cy="29" rx="11" ry="21" transform="rotate(33 76 29)"/>',
      learn:
        '<path class="rb-motif-stroke" d="M60 102C61 82 62 62 61 42"/>'+
        '<ellipse class="rb-motif-seed" cx="45" cy="87" rx="8" ry="16" transform="rotate(-34 45 87)"/>'+
        '<ellipse class="rb-motif-seed" cx="72" cy="79" rx="8" ry="16" transform="rotate(28 72 79)"/>'+
        '<ellipse class="rb-motif-fill" cx="47" cy="48" rx="13" ry="24" transform="rotate(-39 47 48)"/>'+
        '<ellipse class="rb-motif-fill" cx="78" cy="40" rx="12" ry="22" transform="rotate(35 78 40)"/>',
      event:
        '<path class="rb-motif-stroke" d="M60 106C59 88 61 66 60 45"/>'+
        '<path class="rb-motif-stroke" d="M23 106C39 96 79 94 98 106"/>'+
        '<ellipse class="rb-motif-fill" cx="44" cy="60" rx="14" ry="25" transform="rotate(-42 44 60)"/>'+
        '<ellipse class="rb-motif-fill" cx="77" cy="50" rx="13" ry="24" transform="rotate(37 77 50)"/>'+
        '<circle class="rb-motif-seed" cx="31" cy="101" r="5"/><circle class="rb-motif-seed" cx="87" cy="102" r="4"/>',
      report:
        '<circle class="rb-motif-accent" cx="60" cy="55" r="13"/>'+
        '<ellipse class="rb-motif-fill" cx="60" cy="28" rx="12" ry="22"/>'+
        '<ellipse class="rb-motif-fill" cx="88" cy="55" rx="12" ry="22" transform="rotate(90 88 55)"/>'+
        '<ellipse class="rb-motif-fill" cx="60" cy="82" rx="12" ry="22"/>'+
        '<ellipse class="rb-motif-fill" cx="32" cy="55" rx="12" ry="22" transform="rotate(90 32 55)"/>'+
        '<path class="rb-motif-stroke" d="M60 69C58 84 58 96 61 111"/>',
      partner:
        '<path class="rb-motif-stroke" d="M20 96C31 67 49 60 61 33M100 96C89 68 72 58 60 33"/>'+
        '<ellipse class="rb-motif-fill" cx="35" cy="71" rx="11" ry="21" transform="rotate(-42 35 71)"/>'+
        '<ellipse class="rb-motif-fill" cx="85" cy="70" rx="11" ry="21" transform="rotate(41 85 70)"/>'+
        '<circle class="rb-motif-accent" cx="60" cy="28" r="11"/>',
      diagnosis:
        '<path class="rb-motif-stroke" d="M58 100C58 82 60 66 60 52"/>'+
        '<ellipse class="rb-motif-accent" cx="36" cy="35" rx="10" ry="18" transform="rotate(-36 36 35)"/>'+
        '<ellipse class="rb-motif-accent" cx="75" cy="26" rx="9" ry="17" transform="rotate(31 75 26)"/>'+
        '<ellipse class="rb-motif-fill" cx="45" cy="68" rx="12" ry="22" transform="rotate(-40 45 68)"/>'+
        '<ellipse class="rb-motif-fill" cx="79" cy="60" rx="11" ry="21" transform="rotate(37 79 60)"/>',
      contact:
        '<path class="rb-motif-stroke" d="M34 107C54 82 72 57 86 16"/>'+
        '<ellipse class="rb-motif-fill" cx="50" cy="79" rx="11" ry="21" transform="rotate(-41 50 79)"/>'+
        '<ellipse class="rb-motif-fill" cx="74" cy="51" rx="10" ry="19" transform="rotate(37 74 51)"/>'+
        '<circle class="rb-motif-accent" cx="89" cy="18" r="8"/><circle class="rb-motif-accent" cx="100" cy="27" r="5"/>'
    };
    return commonStart+(motifs[kind]||motifs.home)+commonEnd;
  };

  const sectionDividerMarkup=(alt=false)=>`
    <span class="rb-section-botanical${alt?' rb-section-botanical--alt':''}" aria-hidden="true">
      <svg viewBox="0 0 280 38" focusable="false">
        <path class="rb-divider-stem" d="M8 21C58 11 96 29 140 18C184 7 221 27 272 16"/>
        <ellipse class="rb-divider-leaf" cx="90" cy="18" rx="9" ry="4.5" transform="rotate(-22 90 18)"/>
        <ellipse class="rb-divider-leaf" cx="185" cy="18" rx="9" ry="4.5" transform="rotate(24 185 18)"/>
        <circle class="rb-divider-seed" cx="140" cy="18" r="3.5"/>
      </svg>
    </span>`;

  const ensureFinishingDecor=()=>{
    const motif=currentMotif();
    document.body.dataset.rbMotif=motif;

    const layer=document.querySelector('.rb-botanical-decor');
    if(layer && !layer.querySelector('.rb-leaf-shadow')){
      layer.insertAdjacentHTML('beforeend',`
        <span class="rb-leaf-shadow rb-leaf-shadow--one"></span>
        <span class="rb-leaf-shadow rb-leaf-shadow--two"></span>
        <span class="rb-page-motif rb-page-motif--top">${motifSvg(motif)}</span>

        <svg class="rb-editorial-plant rb-editorial-plant--left" viewBox="0 0 360 760" focusable="false" aria-hidden="true">
          <path class="rb-art-stem" d="M176 748C151 670 194 612 165 541C138 475 204 421 170 347C142 286 190 224 164 160C148 119 166 73 153 17"/>
          <path class="rb-art-stem" d="M166 535C115 510 88 480 59 438M174 350C221 323 250 288 275 243M164 164C118 145 89 111 69 78"/>
          <path class="rb-art-leaf" d="M139 650C90 613 72 557 92 525C137 531 166 579 157 624C153 637 147 646 139 650Z"/>
          <path class="rb-art-leaf" d="M194 593C240 562 263 512 247 479C204 482 171 521 174 565C176 578 182 588 194 593Z"/>
          <path class="rb-art-leaf" d="M117 468C72 443 47 402 58 368C101 365 139 395 143 437C144 451 136 462 117 468Z"/>
          <path class="rb-art-leaf" d="M213 405C254 381 283 342 276 307C235 300 197 328 190 370C188 384 196 397 213 405Z"/>
          <path class="rb-art-leaf" d="M120 268C82 244 64 206 75 177C113 176 143 203 145 239C145 251 137 262 120 268Z"/>
          <path class="rb-art-leaf" d="M198 218C232 194 249 159 239 132C204 134 177 161 176 195C176 207 184 216 198 218Z"/>
          <g transform="translate(281 235)">
            <path class="rb-art-flower" d="M0-32C16-31 24-20 18-7C33-5 38 7 29 18C18 32 3 27 0 14C-4 28-20 31-30 19C-39 8-33-5-18-8C-24-21-15-32 0-32Z"/>
            <circle class="rb-art-core" cx="0" cy="0" r="8"/>
          </g>
          <g transform="translate(68 74) scale(.72)">
            <path class="rb-art-flower" d="M0-32C16-31 24-20 18-7C33-5 38 7 29 18C18 32 3 27 0 14C-4 28-20 31-30 19C-39 8-33-5-18-8C-24-21-15-32 0-32Z"/>
            <circle class="rb-art-core" cx="0" cy="0" r="8"/>
          </g>
          <ellipse class="rb-art-seed" cx="63" cy="445" rx="8" ry="17" transform="rotate(-36 63 445)"/>
          <ellipse class="rb-art-seed" cx="280" cy="252" rx="7" ry="16" transform="rotate(34 280 252)"/>
        </svg>

        <svg class="rb-editorial-plant rb-editorial-plant--right" viewBox="0 0 360 760" focusable="false" aria-hidden="true">
          <path class="rb-art-stem" d="M176 748C151 670 194 612 165 541C138 475 204 421 170 347C142 286 190 224 164 160C148 119 166 73 153 17"/>
          <path class="rb-art-stem" d="M166 535C115 510 88 480 59 438M174 350C221 323 250 288 275 243M164 164C118 145 89 111 69 78"/>
          <path class="rb-art-leaf" d="M139 650C90 613 72 557 92 525C137 531 166 579 157 624C153 637 147 646 139 650Z"/>
          <path class="rb-art-leaf" d="M194 593C240 562 263 512 247 479C204 482 171 521 174 565C176 578 182 588 194 593Z"/>
          <path class="rb-art-leaf" d="M117 468C72 443 47 402 58 368C101 365 139 395 143 437C144 451 136 462 117 468Z"/>
          <path class="rb-art-leaf" d="M213 405C254 381 283 342 276 307C235 300 197 328 190 370C188 384 196 397 213 405Z"/>
          <path class="rb-art-leaf" d="M120 268C82 244 64 206 75 177C113 176 143 203 145 239C145 251 137 262 120 268Z"/>
          <path class="rb-art-leaf" d="M198 218C232 194 249 159 239 132C204 134 177 161 176 195C176 207 184 216 198 218Z"/>
          <g transform="translate(281 235)">
            <path class="rb-art-flower" d="M0-32C16-31 24-20 18-7C33-5 38 7 29 18C18 32 3 27 0 14C-4 28-20 31-30 19C-39 8-33-5-18-8C-24-21-15-32 0-32Z"/>
            <circle class="rb-art-core" cx="0" cy="0" r="8"/>
          </g>
        </svg>

        <span class="rb-handline rb-handline--left"><svg viewBox="0 0 260 44" aria-hidden="true"><path d="M4 27C38 9 65 35 98 20C128 7 154 32 184 18C210 6 230 16 255 10"/><circle cx="99" cy="20" r="3.2"/></svg></span>
        <span class="rb-handline rb-handline--right"><svg viewBox="0 0 260 44" aria-hidden="true"><path d="M4 27C38 9 65 35 98 20C128 7 154 32 184 18C210 6 230 16 255 10"/><circle cx="184" cy="18" r="3.2"/></svg></span>
      `);
    }

    const sections=[...document.querySelectorAll('main>section')];
    const usable=sections.filter(section=>!section.matches('.section--soil,.report-finance,.update-band'));
    const washTargets=[usable[1],usable[Math.max(2,Math.floor(usable.length*.58))]].filter(Boolean);
    washTargets.forEach((section,index)=>{
      section.classList.add('rb-art-wash');
      if(index%2===1)section.classList.add('rb-art-wash--alt');
    });

    const featureIndices=new Set([2,Math.max(3,Math.floor(sections.length*.68))]);
    sections.forEach((section,index)=>{
      if(index===0||section.matches('.section--soil,.report-finance,.update-band'))return;
      if(!featureIndices.has(index))return;
      section.classList.add('rb-section-botanical-host');
      if(!section.querySelector(':scope > .rb-section-botanical')){
        section.insertAdjacentHTML('afterbegin',sectionDividerMarkup(index%2===0));
      }
      section.querySelector(':scope > .rb-section-botanical')?.classList.add('rb-section-botanical--feature');
    });

    const photoCandidates=[
      ...document.querySelectorAll('.photo-frame,.contact-hero-photo,.report-photo,.people-trust-photo,.visual-tile')
    ].filter(el=>el.querySelector('img'));
    const chosen=photoCandidates.find(el=>!photoCandidates.some(other=>other!==el&&other.contains(el)))||photoCandidates[0];
    if(chosen && !chosen.querySelector(':scope > .rb-photo-corner-leaf')){
      chosen.classList.add('rb-photo-botanical');
      chosen.insertAdjacentHTML('beforeend','<span class="rb-photo-corner-leaf" aria-hidden="true"><i></i></span>');
    }
  };

  const ensureUniversalChrome=()=>{
    ensureHeaderSocial();
    ensureUniversalFooter();
    ensurePartnerStrip();
    ensureBotanicalDecor();
    ensureFinishingDecor();
    forceReadableLightSurfaces();
    applyKnownContrastFixes();
  };

  const runUniversal=()=>{
    if(document.documentElement.dataset.rbUniversalChrome==='1')return;
    document.documentElement.dataset.rbUniversalChrome='1';
    refresh();
    ensureUniversalChrome();
    forceReadableLightSurfaces();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',runUniversal,{once:true});
  else runUniversal();

})();