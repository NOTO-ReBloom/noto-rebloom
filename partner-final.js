(()=>{
  'use strict';
  if(!document.body.classList.contains('nr-new-partner')) return;

  const INSTAGRAM='https://www.instagram.com/doronkounndoukai2026?igsi=MTNmdjN6bWY0YnJjcQ%3D%3D&utm_source=qr';
  const FACEBOOK='https://www.facebook.com/share/1GqkbWfDAN/?mibextid=wwXIfr';
  const instagramIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>';
  const facebookIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.8 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V3.9c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V10H7v3h3v8h3.8Z"/></svg>';

  const socialMarkup=(placement)=>`<nav class="rb-social-links rb-social-links--${placement}" aria-label="公式SNS"><a href="${INSTAGRAM}" target="_blank" rel="noopener noreferrer" aria-label="泥ん子運動会 公式Instagram">${instagramIcon}</a><a href="${FACEBOOK}" target="_blank" rel="noopener noreferrer" aria-label="泥ん子運動会 公式Facebook">${facebookIcon}</a></nav>`;

  /* Earlier static social markup was overwritten by rebloom-unified.js. Remove duplicates and add the links after the final shared rendering. */
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
    if(h2) h2.innerHTML='協賛パートナーの皆さまを、<br>ご紹介します。';
    if(lead) lead.textContent='NOTO Re:Bloomの活動を支えてくださっている2社です。ご協賛への感謝を込めて、それぞれのサービスや特徴を詳しくご紹介します。';
  }

  section.querySelectorAll('.nr-main-sponsor').forEach(el=>el.remove());

  const sponsors=[
    {
      company:'株式会社アーネストテクノロジーズ',
      support:'READYFORを通じてNOTO Re:Bloomをご支援いただきました。',
      service:'部活ナビ',
      url:'https://bukatsunavi.com/',
      logo:'bukatsu-navi-logo.svg',
      logoAlt:'部活ナビ',
      supported:'SUPPORTED BY EARNEST TECHNOLOGIES',
      title:'部活から、進学先との出会いをつくる。',
      lead:'「部活ナビ」は、高校・中学・大学の部活動を探せる部活特化型の情報メディアです。学校名だけでなく、やりたい部活や地域を入口に学校を探し、見学・体験会やイベントの情報まで確認できます。',
      features:[
        ['01','部活を探す','競技・文化系を含む部活動を、地域や学校などから探せます。'],
        ['02','見学・体験会','気になる部活の見学や体験会を探し、進学前の情報収集に役立てられます。'],
        ['03','イベント情報','部活動に関するイベントや学校の最新情報をチェックできます。'],
        ['04','部活のリアルを知る','ニュースや部活ストーリーを通して、活動の雰囲気や取り組みを知るきっかけになります。']
      ],
      forText:'部活を続けたい中高生や、部活動も含めて進学先を検討したい保護者の方におすすめです。',
      thanks:'NOTO Re:Bloomの活動をご支援いただき、ありがとうございます。部活動を通じて若者の挑戦や選択肢を広げるサービスとして、ぜひご覧ください。',
      cta:'部活ナビで部活を探す ↗'
    },
    {
      company:'TechsPlus株式会社',
      support:'NOTO Re:Bloomの活動にご協賛いただいています。',
      service:'逆転コーチング',
      url:'https://gyakuten-coaching.com/',
      logo:'gyakuten-coaching-official-logo.png',
      logoAlt:'逆転コーチング',
      supported:'SUPPORTED BY TECHSPLUS',
      title:'志望校から逆算して、毎日の勉強を設計する。',
      lead:'「逆転コーチング」は、志望校に合格した専属コーチが、受験本番から逆算して日々の学習計画を作成・管理する大学受験オンライン塾です。自学自習の質と効率を高めながら、志望校合格までの道筋を具体化します。',
      features:[
        ['01','志望校合格者が担当','志望校に合格したコーチが、受験までマンツーマンで伴走します。'],
        ['02','1日単位の学習計画','「今日は何をするか」まで落とし込み、学習の迷いを減らします。'],
        ['03','進捗を継続管理','宿題・成績などを管理しながら、計画と実行のズレを調整します。'],
        ['04','オンラインで利用','住んでいる地域に左右されにくく、志望校に合わせたサポートを受けられます。']
      ],
      forText:'独学だけでは計画管理が難しい高校生や、志望校に合わせて勉強の優先順位を明確にしたい受験生におすすめです。',
      thanks:'NOTO Re:Bloomの活動をご支援いただき、ありがとうございます。受験生の挑戦を日々の行動まで落とし込んで支えるサービスとして、ぜひご覧ください。',
      cta:'逆転コーチング公式サイトを見る ↗'
    }
  ];

  const makeSponsor=(s)=>{
    const article=document.createElement('article');
    article.className='nr-main-sponsor nr-main-sponsor--equal rb-detail-card';
    article.innerHTML=`<div class="nr-sponsor-identity"><span class="nr-badge">協賛パートナー</span><a class="nr-sponsor-logo" href="${s.url}" target="_blank" rel="sponsored noopener" aria-label="${s.service}公式サイト"><img src="${s.logo}" alt="${s.logoAlt}" loading="lazy" decoding="async"></a><p>${s.company}</p><small>${s.support}</small></div><div class="nr-sponsor-story"><p class="nr-sponsor-thanks">${s.supported}</p><h3>${s.title}</h3><p class="nr-sponsor-lead">${s.lead}</p><div class="nr-sponsor-highlights">${s.features.map(([n,t,d])=>`<div class="nr-sponsor-highlight"><small>${n}</small><strong>${t}</strong><span>${d}</span></div>`).join('')}</div><p class="nr-sponsor-for"><strong>こんな方へ：</strong>${s.forText}</p><p class="nr-sponsor-thankyou"><strong>NOTO Re:Bloomから</strong>${s.thanks}</p><div class="nr-actions"><a class="nr-sponsor-primary-final" href="${s.url}" target="_blank" rel="sponsored noopener">${s.cta}</a></div></div>`;
    return article;
  };
  sponsors.forEach(s=>section.appendChild(makeSponsor(s)));
})();
