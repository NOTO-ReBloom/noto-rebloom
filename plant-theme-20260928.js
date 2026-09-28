(()=>{
  'use strict';

  const loadFonts=()=>{
    if(document.getElementById('rebloom-google-fonts'))return;
    const link=document.createElement('link');
    link.id='rebloom-google-fonts';
    link.rel='stylesheet';
    link.href='https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;700;800;900&family=Noto+Sans+JP:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  };
  const isEventArchive=!!document.body?.classList.contains('event-final')||!!document.body?.classList.contains('nr-new-event');
  const isDiagnosis=!!document.body?.classList.contains('page-diagnosis');
  if((document.body?.classList.contains('page-home')||document.body?.classList.contains('nr-new-home')||isDiagnosis)){
    loadFonts();
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

  const ensureUniversalChrome=()=>{
    ensureHeaderSocial();
    ensureUniversalFooter();
    ensurePartnerStrip();
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