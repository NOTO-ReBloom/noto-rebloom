(()=>{
  'use strict';
  if(!document.body.classList.contains('nr-new-partner')) return;

  const INSTAGRAM='https://www.instagram.com/doronkounndoukai2026?igsi=MTNmdjN6bWY0YnJjcQ%3D%3D&utm_source=qr';
  const FACEBOOK='https://www.facebook.com/share/1GqkbWfDAN/?mibextid=wwXIfr';
  const instagramIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>';
  const facebookIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.8 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V3.9c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V10H7v3h3v8h3.8Z"/></svg>';

  const socialMarkup=(placement)=>`<nav class="rb-social-links rb-social-links--${placement}" aria-label="公式SNS"><a href="${INSTAGRAM}" target="_blank" rel="noopener noreferrer" aria-label="泥ん子運動会 公式Instagram">${instagramIcon}</a><a href="${FACEBOOK}" target="_blank" rel="noopener noreferrer" aria-label="泥ん子運動会 公式Facebook">${facebookIcon}</a></nav>`;

  /* Shared rendering rewrites the footer, so restore SNS after that final render. */
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
    if(h2) h2.innerHTML='協賛パートナーの皆さま';
    if(lead) lead.textContent='NOTO Re:Bloomの活動を支えてくださっている2社です。サービスの魅力が伝わるよう、公式情報と実際の動画をあわせてご紹介します。';
  }

  section.querySelectorAll('.nr-main-sponsor').forEach(el=>el.remove());

  const sponsors=[
    {
      company:'株式会社アーネストテクノロジーズ',
      service:'部活ナビ',
      url:'https://bukatsunavi.com/',
      logo:'bukatsu-navi-logo.svg',
      logoAlt:'部活ナビ',
      title:'「やりたい部活」から、学校を探せる。',
      lead:'部活ナビは、高校・中学・大学の部活動を探せる部活特化型の情報メディアです。学校名だけでなく、部活そのものを入口に進学先を探せるのが大きな特徴です。',
      tags:['部活を検索','見学・体験会','イベント情報','部活ストーリー'],
      points:[
        ['部活から学校選びを始められる','競技や活動内容、地域などから気になる部活を探し、学校との新しい出会いにつなげられます。'],
        ['入学前に「実際の活動」を知れる','見学・体験会、ニュース、イベント、動画などを通して、部活の雰囲気まで確認できます。'],
        ['部活動の発信そのものを広げる','各校・各部活の取り組みやストーリーを届け、部活を応援する人との接点をつくっています。']
      ],
      video:'9OVDPksd_cM',
      videoTitle:'部活ナビ掲載校の活動動画',
      videoCaption:'部活ナビ掲載校の活動動画より。サイトではニュースや動画を通して、部活動の実際の姿も見ることができます。',
      thanks:'READYFORを通じてNOTO Re:Bloomをご支援いただきました。ありがとうございます。',
      cta:'部活ナビを見る ↗'
    },
    {
      company:'TechsPlus株式会社',
      service:'逆転コーチング',
      url:'https://gyakuten-coaching.com/',
      logo:'gyakuten-coaching-official-logo.png',
      logoAlt:'逆転コーチング',
      title:'志望校から逆算し、毎日の勉強を具体化する。',
      lead:'逆転コーチングは、志望校に特化したオンラインの学習管理塾です。合格までに必要な勉強を逆算し、「今日何をするか」まで具体的な計画に落とし込みます。',
      tags:['志望校特化','1日単位の計画','映像授業','オンライン対応'],
      points:[
        ['志望校に合わせて伴走','志望校の入試傾向や必要な勉強量を踏まえ、合格までのルートを設計・管理します。'],
        ['計画だけで終わらせない','1日単位の学習計画と継続的な進捗確認で、迷いや計画倒れを減らします。'],
        ['学習環境までまとめて支える','コーチングに加え、映像授業やテストアプリ、提携自習室なども組み合わせて学習を支えています。']
      ],
      video:'Tz6AOrg4ljM',
      videoTitle:'逆転コーチング公式動画',
      videoCaption:'逆転コーチング公式サイトで公開されている2026年度の受験対策動画。実際にどのような情報発信を行っているかを見ることができます。',
      thanks:'NOTO Re:Bloomの活動にご協賛いただいています。ありがとうございます。',
      cta:'逆転コーチングを見る ↗'
    }
  ];

  const makeSponsor=(s)=>{
    const article=document.createElement('article');
    article.className='nr-sponsor-row rb-detail-card';
    article.innerHTML=`
      <div class="nr-sponsor-row__copy">
        <div class="nr-sponsor-brandline">
          <a class="nr-sponsor-logo-compact" href="${s.url}" target="_blank" rel="sponsored noopener" aria-label="${s.service}公式サイト">
            <img src="${s.logo}" alt="${s.logoAlt}" loading="lazy" decoding="async">
          </a>
          <div class="nr-sponsor-brandmeta"><span>協賛パートナー</span><p>${s.company}</p></div>
        </div>
        <h3>${s.title}</h3>
        <p class="nr-sponsor-row__lead">${s.lead}</p>
        <div class="nr-sponsor-tags" aria-label="${s.service}の特徴">${s.tags.map(tag=>`<span>${tag}</span>`).join('')}</div>
        <div class="nr-sponsor-points">${s.points.map(([title,text])=>`<div><strong>${title}</strong><span>${text}</span></div>`).join('')}</div>
        <div class="nr-sponsor-row__foot"><a href="${s.url}" target="_blank" rel="sponsored noopener">${s.cta}</a><small>${s.thanks}</small></div>
      </div>
      <div class="nr-sponsor-row__media">
        <div class="nr-sponsor-video"><iframe src="https://www.youtube-nocookie.com/embed/${s.video}" title="${s.videoTitle}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>
        <p>${s.videoCaption}</p>
      </div>`;
    return article;
  };

  sponsors.forEach(s=>section.appendChild(makeSponsor(s)));
})();
