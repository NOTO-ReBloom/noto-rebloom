(()=>{
  'use strict';

  /* Fonts load in each page <head> before first paint; never inject them later. */

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
    /* Remove page-specific legacy social controls before adding the single universal set. */
    header.querySelectorAll('.rb-social-links--header,.header-social').forEach(el=>el.remove());
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
        <div><b>NOTO Re:Bloom</b><p>楽しさをきっかけに能登を訪れ、土地や地域の方と関わる活動をしている学生プロジェクトです。</p></div>
        <div class="rb-footer-links"><strong>活動を見る</strong><a href="report.html">開催レポート</a><a href="learn.html">土地と企画</a><a href="event.html">泥ん子運動会アーカイブ</a><a href="diagnosis.html">花タイプ診断</a></div>
        <div class="rb-footer-links"><strong>お問い合わせ</strong><a href="partner.html">協賛・協力</a><a href="contact.html">お問い合わせ</a><a href="mailto:infonotorebloom@gmail.com">メールで問い合わせ</a><a href="${UNIVERSAL_CROWD}" target="_blank" rel="noopener">2026年クラファン結果</a></div>
      </div>
      ${socialIconMarkup('rb-footer-social')}
      <div class="container rb-footer-bottom"><span>NOTO Re:Bloom</span><span>後援：北國新聞社・MRO北陸放送・テレビ金沢</span><span>infonotorebloom@gmail.com</span></div>`;
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
          <a class="site-partner-strip__logo" href="https://coworkingsquarekanazawa.com/zukan/" target="_blank" rel="noopener" aria-label="イシカワズカン"><img src="ishikawa-zukan-logo-new.svg" alt="イシカワズカン" loading="lazy" decoding="async" width="250" height="250"></a>
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

    document.querySelectorAll('body.report-page .flow-section .section-intro h2').forEach(el=>{
      important(el,'color','#ffffff');
      important(el,'-webkit-text-fill-color','#ffffff');
      important(el,'background','none');
      important(el,'text-shadow','none');
      important(el,'opacity','1');
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

  const signatureFlowerSvg=()=>`
    <svg class="rb-hero-print" viewBox="0 0 360 360" focusable="false" aria-hidden="true">
      <path class="rb-print-petal" d="M181 38C205 68 207 103 181 128C154 103 157 68 181 38Z"/>
      <path class="rb-print-petal" d="M322 178C292 201 257 203 232 179C257 152 293 154 322 178Z"/>
      <path class="rb-print-petal" d="M182 321C158 292 155 257 181 232C207 257 205 292 182 321Z"/>
      <path class="rb-print-petal" d="M39 181C69 156 104 155 129 180C104 207 68 205 39 181Z"/>
      <path class="rb-print-petal" d="M81 81C117 87 142 112 143 147C108 148 84 123 81 81Z"/>
      <path class="rb-print-petal" d="M281 80C276 118 251 141 216 143C215 108 240 84 281 80Z"/>
      <path class="rb-print-petal" d="M281 281C243 276 219 252 216 217C251 215 276 240 281 281Z"/>
      <path class="rb-print-petal" d="M80 281C87 243 112 219 147 217C148 252 123 276 80 281Z"/>
      <circle class="rb-print-core" cx="181" cy="181" r="46"/>
      <circle class="rb-print-seed" cx="181" cy="181" r="10"/>
      <path class="rb-print-leaf" d="M173 298C136 286 112 313 111 346C148 351 174 331 173 298Z"/>
      <path class="rb-print-leaf" d="M194 303C230 290 254 316 255 348C219 353 193 334 194 303Z"/>
    </svg>`;

  const stageMarkSvg=(side='left')=>`
    <svg class="rb-stage-mark rb-stage-mark--${side}" viewBox="0 0 220 320" focusable="false" aria-hidden="true">
      <path d="M108 310C107 262 109 223 107 174C106 125 120 78 112 15"/>
      <ellipse cx="71" cy="240" rx="28" ry="56" transform="rotate(-38 71 240)"/>
      <ellipse cx="149" cy="204" rx="26" ry="52" transform="rotate(34 149 204)"/>
      <ellipse cx="77" cy="142" rx="25" ry="49" transform="rotate(-36 77 142)"/>
      <ellipse cx="145" cy="98" rx="23" ry="44" transform="rotate(31 145 98)"/>
      <circle cx="112" cy="39" r="25"/>
    </svg>`;

  const pollenMarkup=(side='a')=>`
    <span class="rb-pollen rb-pollen--${side}" aria-hidden="true">
      <i></i><i></i><i></i><i></i><i></i><i></i>
    </span>`;

  const ensureSignatureStages=()=>{
    const sections=[...document.querySelectorAll('main>section')];
    if(!sections.length)return;

    const hero=sections[0];
    if(!hero.classList.contains('rb-signature-hero')){
      hero.classList.add('rb-signature-hero');
      hero.insertAdjacentHTML('afterbegin','<span class="rb-hero-colorfield" aria-hidden="true"></span>'+signatureFlowerSvg());
    }

    const usable=sections.filter(section=>!section.matches('.section--soil,.report-finance,.update-band,.conversion-band'));
    const candidates=[
      usable[Math.min(2,Math.max(1,usable.length-1))],
      usable[Math.max(2,Math.floor(usable.length*.52))],
      usable[Math.max(2,usable.length-2)]
    ].filter(Boolean);
    const unique=[...new Set(candidates)].filter(section=>section!==hero);

    unique.slice(0,3).forEach((section,index)=>{
      section.classList.add('rb-stage',index===0?'rb-stage--a':index===1?'rb-stage--b':'rb-stage--c');
      if(!section.querySelector(':scope > .rb-stage-mark')){
        section.insertAdjacentHTML('afterbegin',stageMarkSvg(index%2===0?'left':'right')+pollenMarkup(index%2===0?'a':'b'));
      }
    });
  };

  const botanicalSpecimenSvg=(kind,side='left')=>{
    const cls=`rb-botanical-specimen rb-botanical-specimen--${side}`;

    if(kind==='root'){
      return `<svg class="${cls}" viewBox="0 0 260 360" focusable="false" aria-hidden="true">
        <path class="rb-spec-line" d="M132 18C127 52 134 86 128 121C124 145 129 161 127 178"/>
        <path class="rb-spec-line" d="M128 96C104 81 87 64 77 45C102 47 119 62 128 85"/>
        <path class="rb-spec-line rb-spec-line--fine" d="M79 46C91 57 104 67 124 83"/>
        <path class="rb-spec-line" d="M128 126C151 111 170 90 180 69C158 72 139 88 129 112"/>
        <path class="rb-spec-line rb-spec-line--fine" d="M178 71C166 84 151 97 134 110"/>
        <path class="rb-spec-line" d="M127 178C111 209 93 239 76 351"/>
        <path class="rb-spec-line" d="M128 178C142 211 157 252 165 351"/>
        <path class="rb-spec-line" d="M127 178C127 226 127 286 130 354"/>
        <path class="rb-spec-line rb-spec-line--fine" d="M101 225C84 235 69 250 57 269M91 267C75 281 63 299 53 324"/>
        <path class="rb-spec-line rb-spec-line--fine" d="M153 232C171 245 187 261 200 282M160 278C178 291 191 311 201 334"/>
        <path class="rb-spec-line rb-spec-line--fine" d="M128 242C112 258 102 278 95 300M131 294C145 309 153 327 158 344"/>
      </svg>`;
    }

    if(kind==='seed'){
      return `<svg class="${cls}" viewBox="0 0 260 360" focusable="false" aria-hidden="true">
        <path class="rb-spec-line" d="M128 348C127 302 129 255 127 205C126 155 130 103 127 48"/>
        <path class="rb-spec-line" d="M127 254C106 242 90 225 80 204C103 206 118 221 127 241"/>
        <path class="rb-spec-line rb-spec-line--fine" d="M82 205C94 217 108 229 123 239"/>
        <path class="rb-spec-line" d="M128 225C149 214 165 196 174 176C152 179 138 193 129 212"/>
        <path class="rb-spec-line rb-spec-line--fine" d="M172 178C160 190 146 200 133 210"/>
        <path class="rb-spec-line rb-spec-line--accent" d="M127 142C112 134 103 122 105 111C119 109 128 119 130 132"/>
        <path class="rb-spec-line rb-spec-line--accent" d="M128 118C142 109 151 97 149 86C136 84 128 94 126 107"/>
        <path class="rb-spec-line rb-spec-line--accent" d="M126 92C111 84 103 72 106 61C120 60 128 69 130 81"/>
        <path class="rb-spec-line rb-spec-line--accent" d="M128 72C141 63 148 52 145 42C133 41 126 49 124 60"/>
        <path class="rb-spec-line rb-spec-line--accent" d="M126 48C119 38 119 27 126 18C135 27 136 39 128 49"/>
      </svg>`;
    }

    if(kind==='flower'){
      return `<svg class="${cls}" viewBox="0 0 260 360" focusable="false" aria-hidden="true">
        <path class="rb-spec-line" d="M130 351C128 303 131 254 129 204C128 188 129 170 130 154"/>
        <path class="rb-spec-line" d="M129 269C107 257 90 239 80 217C103 219 120 235 129 255"/>
        <path class="rb-spec-line rb-spec-line--fine" d="M82 219C96 232 110 243 125 253"/>
        <path class="rb-spec-line" d="M130 238C151 226 168 207 177 184C153 188 138 203 130 224"/>
        <path class="rb-spec-line rb-spec-line--fine" d="M174 187C160 200 146 212 134 222"/>
        <path class="rb-spec-line rb-spec-line--flower" d="M130 154C111 149 96 137 90 121C106 118 119 125 128 137C125 120 129 103 141 91C151 106 151 121 142 137C154 126 170 124 184 132C177 148 164 156 147 158C161 163 171 174 173 188C156 192 143 185 135 171C133 185 124 196 109 201C101 185 105 171 118 162C102 163 90 155 84 141C99 134 114 138 130 154Z"/>
        <path class="rb-spec-line rb-spec-line--fine" d="M130 154C131 145 134 139 140 134M130 154C121 151 114 147 109 141M130 154C137 159 141 165 143 172"/>
      </svg>`;
    }

    return `<svg class="${cls}" viewBox="0 0 260 360" focusable="false" aria-hidden="true">
      <path class="rb-spec-line" d="M72 350C96 309 115 268 132 221C149 174 163 121 180 18"/>
      <path class="rb-spec-line" d="M108 286C89 276 74 261 65 243C85 243 101 255 110 272"/>
      <path class="rb-spec-line rb-spec-line--fine" d="M67 244C79 254 91 263 106 270"/>
      <path class="rb-spec-line" d="M129 236C150 226 167 209 178 190C157 190 141 202 131 220"/>
      <path class="rb-spec-line rb-spec-line--fine" d="M176 192C163 202 149 212 135 218"/>
      <path class="rb-spec-line" d="M145 181C126 170 113 155 106 137C126 139 141 151 147 168"/>
      <path class="rb-spec-line rb-spec-line--fine" d="M108 139C119 149 131 158 144 166"/>
      <path class="rb-spec-line" d="M160 132C179 122 192 107 199 90C180 90 166 101 158 117"/>
      <path class="rb-spec-line rb-spec-line--fine" d="M197 92C185 101 174 110 161 116"/>
      <path class="rb-spec-line rb-spec-line--accent" d="M180 18C173 30 174 42 184 52C195 41 196 28 188 17C185 13 182 13 180 18Z"/>
    </svg>`;
  };

  const rootLineMarkup=()=>`
    <span class="rb-root-line" aria-hidden="true"><svg viewBox="0 0 620 78" focusable="false">
      <path d="M310 4C306 24 306 44 310 74M310 24C272 31 245 43 221 69M310 28C350 35 379 47 405 71M275 37C253 42 233 52 218 64M345 40C368 46 388 56 401 68M309 48C291 54 279 62 268 74M313 50C329 57 340 64 350 75"/>
    </svg></span>`;

  const growthSpineMarkup=()=>`
    <span class="rb-growth-spine" aria-hidden="true">
      <svg viewBox="0 0 108 1600" preserveAspectRatio="none" focusable="false">
        <path class="rb-spine-line" d="M55 0C41 168 69 294 51 468C34 634 71 782 50 952C34 1081 69 1267 52 1600"/>
        <path class="rb-spine-line rb-spine-line--fine" d="M54 236C40 219 29 201 24 182C39 187 49 198 55 216M52 494C66 478 78 460 84 440C69 443 58 455 52 475M51 837C36 820 25 801 21 781C36 786 46 797 52 817M51 1187C65 1173 77 1155 84 1136C70 1138 59 1149 52 1167"/>
        <path class="rb-spine-line rb-spine-line--flower" d="M51 662C39 658 31 648 31 638C42 636 50 641 55 651C55 639 61 629 71 624C79 634 79 644 72 654C82 651 92 654 98 663C91 672 82 675 71 671C77 681 76 691 68 699C57 694 52 685 54 674C46 682 36 684 27 678C32 668 40 663 51 662Z"/>
        <path class="rb-spine-line rb-spine-line--fine" d="M52 1414C42 1404 35 1394 34 1383C44 1384 51 1391 55 1401M53 1465C62 1455 70 1444 72 1433C62 1434 55 1440 51 1451"/>
      </svg>
    </span>`;

  const ensureBotanicalStructure=()=>{
    const layer=document.querySelector('.rb-botanical-decor');
    if(layer && !layer.querySelector('.rb-growth-spine')){
      layer.insertAdjacentHTML('beforeend',growthSpineMarkup());
    }

    document.querySelectorAll('main>section h2').forEach(h=>h.classList.add('rb-plant-heading'));

    const motif=currentMotif();
    document.body.dataset.rbMotif=motif;
    const motifKinds={
      home:['seed','flower','root'],
      thoughts:['root','branch','flower'],
      learn:['seed','branch','root'],
      event:['seed','branch','flower'],
      report:['flower','seed','root'],
      partner:['branch','root','seed'],
      diagnosis:['flower','branch','seed'],
      contact:['branch','seed','root']
    };
    const kinds=motifKinds[motif]||motifKinds.home;
    const sections=[...document.querySelectorAll('main>section')]
      .filter(s=>!s.matches('.section--soil,.report-finance,.update-band,.conversion-band'));

    const picks=[
      sections[Math.min(1,sections.length-1)],
      sections[Math.max(1,Math.floor(sections.length*.5))],
      sections[Math.max(1,sections.length-2)]
    ].filter(Boolean);
    [...new Set(picks)].forEach((section,index)=>{
      if(section.querySelector(':scope > .rb-botanical-specimen'))return;
      section.classList.add('rb-botanical-specimen-host');
      const side=index%2===0?'right':'left';
      section.insertAdjacentHTML('afterbegin',botanicalSpecimenSvg(kinds[index%kinds.length],side)+rootLineMarkup());
    });
  };

  const ensureUniversalChrome=()=>{
    ensureHeaderSocial();
    ensureUniversalFooter();
    ensurePartnerStrip();
    ensureBotanicalDecor();
    ensureBotanicalStructure();
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