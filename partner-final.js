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
    if(lead) lead.textContent='NOTO Re:Bloomの活動を支えてくださっている2社です。各社の公式サイトで公開されている情報をもとに、サービスや取り組みをご紹介します。';
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
      cta:'部活ナビ公式サイトを見る',
      companyCta:'運営会社公式サイト'
    },
    {
      company:'TechsPlus株式会社',
      service:'逆転コーチング',
      url:'https://gyakuten-coaching.com/',
      companyUrl:'https://techsplus.co.jp/',
      logo:'gyakuten-coaching-official-logo.png',
      logoAlt:'逆転コーチング',
      eyebrow:'GYAKUTEN COACHING',
      title:'志望校に特化し、毎日の学習を徹底管理。',
      lead:'逆転コーチングは、志望校に合格したコーチが専属で担当し、志望校合格から逆算した毎日の学習計画を作成・管理する大学受験オンライン塾です。参考書を用いた自学自習の質と効率を高めることに特化しています。',
      tags:['志望校特化','専属コーチ','1日単位の学習計画','オンライン'],
      facts:[
        ['志望校合格者が担当','生徒の志望校に合格したコーチが担当し、長期的に伴走します。'],
        ['毎日の学習を管理','1日単位の学習計画作成から日々の進捗管理までマンツーマンで支援します。'],
        ['複数の対策コース','一般入試、総合型選抜、英検®対策、社会人プロ講師が指導するPROコースを案内しています。'],
        ['専用システム・自習環境','専用の学習管理アプリで日々の状況を確認し、希望者には提携自習室や逆転コーチング自習室も案内しています。']
      ],
      companyInfo:'運営するTechsPlus株式会社は「次の世代の幸福を創出する」をビジョンに掲げ、教育事業を展開しています。逆転コーチングのほか、受験特化型メディア「ウカルート」や参考書特化型自習室も運営しています。',
      thanks:'NOTO Re:Bloomの活動にご協賛いただいています。ありがとうございます。',
      cta:'逆転コーチング公式サイトを見る',
      companyCta:'運営会社公式サイト'
    }
  ];

  const makeSponsor=(s,index)=>{
    const article=document.createElement('article');
    article.className='nr-sponsor-wide rb-detail-card';
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
          <div class="nr-sponsor-wide__tags" aria-label="${s.service}の公式サイト掲載情報">${s.tags.map(tag=>`<span>${tag}</span>`).join('')}</div>
        </div>
        <div class="nr-sponsor-wide__facts">${s.facts.map(([title,text],i)=>`<div><small>0${i+1}</small><strong>${title}</strong><span>${text}</span></div>`).join('')}</div>
        <div class="nr-sponsor-wide__company"><span>運営企業について</span><p>${s.companyInfo}</p></div>
        <div class="nr-sponsor-wide__action"><span>公式サイトで、さらに詳しく</span><a href="${s.url}" target="_blank" rel="sponsored noopener">${s.cta}<b>↗</b></a></div>
      </div>`;
    return article;
  };

  sponsors.forEach((s,index)=>section.appendChild(makeSponsor(s,index)));
})();
