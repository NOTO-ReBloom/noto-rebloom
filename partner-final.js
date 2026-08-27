(()=>{
  'use strict';
  if(!document.body.classList.contains('nr-new-partner')) return;

  const INSTAGRAM='https://www.instagram.com/doronkounndoukai2026?igsi=MTNmdjN6bWY0YnJjcQ%3D%3D&utm_source=qr';
  const FACEBOOK='https://www.facebook.com/share/1GqkbWfDAN/?mibextid=wwXIfr';
  const instagramIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>';
  const facebookIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.8 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V3.9c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V10H7v3h3v8h3.8Z"/></svg>';

  const socialMarkup=(placement)=>`<nav class="rb-social-links rb-social-links--${placement}" aria-label="公式SNS"><a href="${INSTAGRAM}" target="_blank" rel="noopener noreferrer" aria-label="泥ん子運動会 公式Instagram">${instagramIcon}</a><a href="${FACEBOOK}" target="_blank" rel="noopener noreferrer" aria-label="泥ん子運動会 公式Facebook">${facebookIcon}</a></nav>`;

  document.querySelectorAll('.header-social,.footer-social,.rb-social-links').forEach(el=>el.remove());
  const header=document.querySelector('.site-header');
  const menu=header?.querySelector('.menu-button');
  if(header&&menu) menu.insertAdjacentHTML('beforebegin',socialMarkup('header'));
  const footer=document.querySelector('.site-footer');
  const footerBottom=footer?.querySelector('.rb-footer-bottom');
  if(footer&&footerBottom) footerBottom.insertAdjacentHTML('beforebegin',socialMarkup('footer'));

  const section=document.getElementById('current-partners');
  if(!section) return;
  const head=section.querySelector('.nr-section-head');
  if(head){
    const h2=head.querySelector('h2');
    const lead=head.querySelector('h2+p');
    if(h2) h2.textContent='協賛パートナーの皆さま';
    if(lead) lead.textContent='NOTO Re:Bloomの活動を支えてくださっている2社です。各社の公式サイト・ご提供資料で確認できる情報をもとに、サービスや取り組みをご紹介します。';
  }

  section.querySelectorAll('.nr-main-sponsor,.nr-sponsor-row,.nr-sponsor-wide').forEach(el=>el.remove());

  const sponsors=[
    {
      company:'株式会社アーネストテクノロジーズ',
      service:'部活ナビ',
      url:'https://bukatsunavi.com/',
      companyUrl:'https://earnest-technologies.co.jp/',
      logo:'bukatsu-navi-logo.svg',
      logoAlt:'部活ナビ',
      eyebrow:'BUKATSU NAVI',
      title:'「やりたい部活」から、学校を探せる。',
      lead:'部活ナビは、高校・中学・大学の部活動を検索できるポータルサイトです。部活動そのものを入口に学校を探せるほか、見学・体験会やイベント、各部活の最新情報にもアクセスできます。',
      tags:['高校・中学・大学','部活検索','見学・体験会','イベント検索'],
      facts:[
        ['部活を検索','競技や地域などから、掲載されている部活動を探すことができます。'],
        ['見学・体験会','各部活が掲載する見学・体験会の情報を検索できます。'],
        ['イベント','部活動に関するイベント情報を検索できます。'],
        ['部活ストーリー','部活動に関する動画コンテンツやストーリーが公開されています。']
      ],
      companyInfo:'運営企業の株式会社アーネストテクノロジーズは、システム開発・ITコンサルティングに加え、部活動支援SaaS「Bukatsu Page」など部活動に特化した自社サービスを開発しています。',
      thanks:'READYFORを通じてNOTO Re:Bloomをご支援いただきました。ありがとうございます。',
      cta:'部活ナビ公式サイトを見る'
    },
    {
      company:'TechsPlus株式会社',
      service:'逆転コーチング',
      url:'https://gyakuten-coaching.com/',
      companyUrl:'https://techsplus.co.jp/',
      logo:'gyakuten-coaching-official-logo.png',
      logoAlt:'逆転コーチング',
      eyebrow:'GYAKUTEN COACHING',
      title:'逆転合格に特化した、学習管理塾。',
      lead:'逆転コーチングは、志望校合格から逆算して学習を管理する大学受験オンライン塾です。ご提供いただいた公式チラシでは、難関大学への合格実績や、1日単位の学習管理、志望校特化の対策、継続的なサポート体制などが案内されています。',
      tags:['志望校特化','1日単位の学習管理','オンライン','無料体験あり'],
      metrics:[
        ['1000名突破','合格者累計','早慶MARCHなどの難関大学を含む合格実績'],
        ['全国120以上','自習室と連携','2026年6月時点のチラシ記載情報'],
        ['無料体験','コーチング','1人1回。入会は必須ではない旨を案内']
      ],
      reasons:[
        ['1日単位の学習管理','毎週のコーチングで、志望校から逆算した「今日やるべき課題」「1週間単位の計画表」「年間ルート」を作成。'],
        ['志望校特化の対策授業','志望校に特化した映像授業を用意し、過去問なども分析しながら対策。'],
        ['報告制度で継続サポート','毎日の学習内容を報告し、フィードバックを受けながら学習を継続。'],
        ['総合型・英検®もサポート','一般入試だけでなく、総合型選抜や英検®対策にも対応。'],
        ['全国120以上の自習室と連携','全国120以上のエリアで自習室と連携し、参考書学習に特化した自習室も案内。']
      ],
      sourceNote:'※合格実績は複数大学・複数学部への合格を含む延べ合格数です。成果・合格を保証するものではありません。自習室数は2026年6月時点のチラシ記載情報です。',
      related:{
        name:'ウカルート',
        url:'https://www.ukaroute.com/',
        kicker:'TechsPlusの受験情報サービス',
        headline:'早慶MARCH合格者500名以上の合格体験記を掲載。',
        lead:'公式チラシでは、合格体験記を無料で閲覧できる受験情報サービスとして案内されています。',
        badges:['すべて無料','時期別スケジュール','科目別の使用参考書ルート','似た境遇の逆転合格者']
      },
      companyInfo:'運営するTechsPlus株式会社は教育事業を展開し、逆転コーチングのほか、受験情報サービス「ウカルート」などを運営しています。',
      thanks:'NOTO Re:Bloomの活動にご協賛いただいています。ありがとうございます。',
      cta:'逆転コーチング公式サイトを見る'
    }
  ];

  const makeFacts=(s)=>{
    if(s.reasons){
      return `<div class="nr-sponsor-wide__reasons-title"><span>選ばれる理由</span><small>OFFICIAL FLYER</small></div><div class="nr-sponsor-wide__reasons">${s.reasons.map(([title,text],i)=>`<div><b>0${i+1}</b><strong>${title}</strong><span>${text}</span></div>`).join('')}</div>${s.sourceNote?`<p class="nr-sponsor-wide__source-note">${s.sourceNote}</p>`:''}`;
    }
    return `<div class="nr-sponsor-wide__facts">${s.facts.map(([title,text],i)=>`<div><small>0${i+1}</small><strong>${title}</strong><span>${text}</span></div>`).join('')}</div>`;
  };

  const makeMetrics=(s)=>s.metrics?`<div class="nr-sponsor-wide__metrics">${s.metrics.map(([value,label,note])=>`<div><strong>${value}</strong><span>${label}</span><small>${note}</small></div>`).join('')}</div>`:'';

  const makeRelated=(s)=>s.related?`<div class="nr-sponsor-wide__related"><div class="nr-sponsor-wide__related-brand"><span>${s.related.kicker}</span><strong>${s.related.name}</strong></div><div class="nr-sponsor-wide__related-copy"><h4>${s.related.headline}</h4><p>${s.related.lead}</p><div>${s.related.badges.map(b=>`<span>${b}</span>`).join('')}</div></div><a href="${s.related.url}" target="_blank" rel="noopener">ウカルートを見る <b>↗</b></a></div>`:'';

  const makeSponsor=(s,index)=>{
    const article=document.createElement('article');
    article.className=`nr-sponsor-wide rb-detail-card${s.metrics?' nr-sponsor-wide--featured':''}`;
    article.innerHTML=`
      <span class="nr-sponsor-wide__ornament" aria-hidden="true"></span>
      <div class="nr-sponsor-wide__brand">
        <div class="nr-sponsor-wide__partnerline"><span>SPONSOR PARTNER</span><b>0${index+1}</b></div>
        <a class="nr-sponsor-wide__logo" href="${s.url}" target="_blank" rel="sponsored noopener" aria-label="${s.service}公式サイト">
          <img src="${s.logo}" alt="${s.logoAlt}" loading="lazy" decoding="async">
        </a>
        <p>${s.company}</p>
        <small>${s.thanks}</small>
        <div class="nr-sponsor-wide__brandlinks">
          <a href="${s.url}" target="_blank" rel="sponsored noopener">サービス公式 ↗</a>
          <a href="${s.companyUrl}" target="_blank" rel="noopener">企業公式 ↗</a>
        </div>
      </div>
      <div class="nr-sponsor-wide__body">
        <div class="nr-sponsor-wide__titlebar"><span>${s.eyebrow}</span><small>OFFICIAL INFORMATION</small></div>
        <div class="nr-sponsor-wide__intro">
          <div>
            <h3>${s.title}</h3>
            <p>${s.lead}</p>
          </div>
          <div class="nr-sponsor-wide__tags" aria-label="${s.service}の公式情報">${s.tags.map(tag=>`<span>${tag}</span>`).join('')}</div>
        </div>
        ${makeMetrics(s)}
        ${makeFacts(s)}
        ${makeRelated(s)}
        <div class="nr-sponsor-wide__company"><span>運営企業について</span><p>${s.companyInfo}</p></div>
        <div class="nr-sponsor-wide__action"><span>公式サイトで、さらに詳しく</span><a href="${s.url}" target="_blank" rel="sponsored noopener">${s.cta}<b>↗</b></a></div>
      </div>`;
    return article;
  };

  sponsors.forEach((s,index)=>section.appendChild(makeSponsor(s,index)));
})();
