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
    if(lead) lead.textContent='NOTO Re:Bloomの活動を支えてくださっている2社です。ご支援への感謝を込めて、それぞれのサービスをご紹介します。';
  }

  section.querySelectorAll('.nr-main-sponsor,.nr-sponsor-row,.nr-sponsor-wide').forEach(el=>el.remove());

  const sponsors=[
    {
      company:'株式会社アーネストテクノロジーズ',
      service:'部活ナビ',
      url:'https://bukatsunavi.com/',
      logo:'bukatsu-navi-logo.svg',
      logoAlt:'部活ナビ',
      title:'「やりたい部活」から、学校を探せる。',
      lead:'部活ナビは、高校・中学・大学の部活動を探せる部活特化型の情報メディアです。学校名だけでなく、競技や活動内容を入口に進学先を探せるのが大きな特徴です。',
      tags:['部活から学校検索','見学・体験会','イベント情報','部活ストーリー'],
      points:[
        ['部活を軸に学校を探す','地域や競技、学校種別などから、自分が続けたい・始めたい部活動を探せます。'],
        ['入学前の情報収集','見学・体験会やイベント情報を確認し、進学後の活動を具体的にイメージできます。'],
        ['部活動の魅力を発信','各校・各部活のニュースやストーリーを通じて、日々の取り組みや魅力を届けています。']
      ],
      thanks:'READYFORを通じてNOTO Re:Bloomをご支援いただきました。ありがとうございます。',
      cta:'部活ナビ公式サイトを見る ↗'
    },
    {
      company:'TechsPlus株式会社',
      service:'逆転コーチング',
      url:'https://gyakuten-coaching.com/',
      logo:'gyakuten-coaching-official-logo.png',
      logoAlt:'逆転コーチング',
      title:'志望校から逆算し、毎日の勉強を具体化する。',
      lead:'逆転コーチングは、志望校に特化したオンラインの学習管理塾です。合格までに必要な学習を逆算し、「今日何をするか」まで具体的な計画に落とし込んで学習を支えます。',
      tags:['志望校特化','1日単位の学習計画','進捗管理','オンライン対応'],
      points:[
        ['志望校から逆算','必要な勉強量や優先順位を整理し、合格までの学習ルートを具体化します。'],
        ['毎日の行動まで設計','長期計画だけでなく、1日単位まで落とし込むことで「何をすればいいか」を明確にします。'],
        ['継続して進捗を確認','計画と実際の学習状況を確認しながら、受験まで継続的に学習を支えます。']
      ],
      thanks:'NOTO Re:Bloomの活動にご協賛いただいています。ありがとうございます。',
      cta:'逆転コーチング公式サイトを見る ↗'
    }
  ];

  const makeSponsor=(s)=>{
    const article=document.createElement('article');
    article.className='nr-sponsor-wide rb-detail-card';
    article.innerHTML=`
      <div class="nr-sponsor-wide__brand">
        <span class="nr-sponsor-wide__label">協賛パートナー</span>
        <a class="nr-sponsor-wide__logo" href="${s.url}" target="_blank" rel="sponsored noopener" aria-label="${s.service}公式サイト">
          <img src="${s.logo}" alt="${s.logoAlt}" loading="lazy" decoding="async">
        </a>
        <p>${s.company}</p>
        <small>${s.thanks}</small>
      </div>
      <div class="nr-sponsor-wide__body">
        <div class="nr-sponsor-wide__intro">
          <div>
            <h3>${s.title}</h3>
            <p>${s.lead}</p>
          </div>
          <div class="nr-sponsor-wide__tags" aria-label="${s.service}の特徴">${s.tags.map(tag=>`<span>${tag}</span>`).join('')}</div>
        </div>
        <div class="nr-sponsor-wide__points">${s.points.map(([title,text])=>`<div><strong>${title}</strong><span>${text}</span></div>`).join('')}</div>
        <div class="nr-sponsor-wide__action"><a href="${s.url}" target="_blank" rel="sponsored noopener">${s.cta}</a></div>
      </div>`;
    return article;
  };

  sponsors.forEach(s=>section.appendChild(makeSponsor(s)));
})();
