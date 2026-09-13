(()=>{
  'use strict';

  const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const FORM_URL='https://forms.gle/6ZMrhrhtWmBCQViD8';
  const INSTAGRAM_URL='https://www.instagram.com/doronkounndoukai2026/';
  const CONTACT_EMAIL='infonotorebloom@gmail.com';
  const SCHOOL_NAME='旧上黒丸小学校';
  const SCHOOL_ADDRESS='石川県珠洲市若山町上黒丸10部34番地';
  const SCHOOL_MAP='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(SCHOOL_ADDRESS);

  const addStyles=()=>{
    if(document.getElementById('rb-current-20260913-style')) return;
    const style=document.createElement('style');
    style.id='rb-current-20260913-style';
    style.textContent=`
      .rb-current-note{margin:16px 0 0;padding:14px 16px;border-radius:16px;background:#fff8d8;border:1px solid rgba(201,160,35,.25);color:#43534d;font-size:13px;line-height:1.75}
      .rb-current-note strong{color:#184b3d}
      .rb-current-note a{color:#184b3d;font-weight:900;text-underline-offset:3px}
      .rb-current-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
      .rb-current-actions a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 16px;border-radius:999px;text-decoration:none;font-weight:900}
      .rb-current-actions .is-main{background:#184b3d;color:#fff}.rb-current-actions .is-sub{background:#fff;color:#184b3d;border:1px solid rgba(24,75,61,.18)}
      .rb-support-now{padding:72px 0;background:#f4f7f2;border-top:1px solid rgba(24,75,61,.08);border-bottom:1px solid rgba(24,75,61,.08)}
      .rb-support-now__head{max-width:780px;margin:0 auto 30px;text-align:center}.rb-support-now__head h2{margin:8px 0 10px;color:#173f34;font-size:clamp(28px,4vw,42px);line-height:1.25}.rb-support-now__head p{margin:0;color:#586b64;line-height:1.85}
      .rb-support-now__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
      .rb-support-now__card{padding:22px;border-radius:22px;background:#fff;border:1px solid rgba(24,75,61,.12);box-shadow:0 10px 28px rgba(24,75,61,.055)}
      .rb-support-now__card small{display:inline-block;margin-bottom:9px;color:#55786b;font-size:10px;font-weight:900;letter-spacing:.1em}.rb-support-now__card h3{margin:0 0 8px;color:#173f34;font-size:19px;line-height:1.45}.rb-support-now__card p{margin:0;color:#5d6f69;font-size:14px;line-height:1.8}.rb-support-now__card strong{color:#184b3d}
      .rb-support-now__card--media{background:linear-gradient(145deg,#184b3d,#245f4d);color:#fff}.rb-support-now__card--media small,.rb-support-now__card--media h3,.rb-support-now__card--media p,.rb-support-now__card--media strong{color:#fff}
      .rb-land-next{margin-top:28px;padding:26px;border-radius:24px;background:linear-gradient(135deg,#eff7ef 0%,#fff8db 100%);border:1px solid rgba(24,75,61,.12)}
      .rb-land-next__eyebrow{display:block;margin-bottom:8px;color:#55786b;font-size:10px;font-weight:900;letter-spacing:.1em}.rb-land-next h3{margin:0 0 10px;color:#173f34;font-size:clamp(22px,3vw,30px);line-height:1.4}.rb-land-next p{margin:0;color:#586b64;line-height:1.85}.rb-land-next p+p{margin-top:10px}
      .rb-event-faq-extra{margin-top:14px}
      .rb-home-deadline-chip{background:#fff2a8!important;color:#604d00!important;border-color:rgba(164,127,0,.18)!important}
      @media(max-width:760px){.rb-support-now{padding:52px 0}.rb-support-now__grid{grid-template-columns:1fr}.rb-current-actions a{width:100%}.rb-land-next{padding:20px;border-radius:20px}}
    `;
    document.head.appendChild(style);
  };

  const replaceExactText=(selector,from,to)=>{
    document.querySelectorAll(selector).forEach(el=>{
      if((el.textContent||'').trim()===from) el.textContent=to;
    });
  };

  const normalizeGlobalFacts=()=>{
    replaceExactText('.people-trust-tags span','保険・救護を準備','安全・救護を準備');
    replaceExactText('.site-footer small','後援：北國新聞社','後援：北國新聞社・MRO北陸放送');

    document.querySelectorAll('a[href*="forms.gle/cRdr2oa2pxBhrFE3A"]').forEach(a=>{
      const text=(a.textContent||'').trim();
      if(text==='協賛・連携を相談' || text==='協賛・連携相談フォーム'){
        a.textContent=text==='協賛・連携相談フォーム'?'今後の連携相談フォーム':'今後の連携を相談';
      }
    });
  };

  const updateHome=()=>{
    if(current!=='index.html') return;
    const chips=document.querySelector('.status-chips');
    if(chips && ![...chips.children].some(el=>(el.textContent||'').includes('9/19'))){
      const chip=document.createElement('span');
      chip.className='rb-home-deadline-chip';
      chip.textContent='申込9/19まで';
      chips.appendChild(chip);
    }

    const guide=document.querySelector('#participant-guide .rb-guide-actions');
    if(guide && !guide.querySelector('[data-instagram-current]')){
      const a=document.createElement('a');
      a.className='btn btn--paper';
      a.href=INSTAGRAM_URL;
      a.target='_blank';
      a.rel='noopener';
      a.dataset.instagramCurrent='1';
      a.textContent='Instagramで最新情報を見る ↗';
      guide.appendChild(a);
    }
  };

  const updateEvent=()=>{
    if(current!=='event.html') return;

    const infoCards=[...document.querySelectorAll('#before-you-come .info-card')];
    const access=infoCards.find(card=>(card.querySelector('small')?.textContent||'').trim()==='ACCESS');
    if(access){
      const h3=access.querySelector('h3');
      const p=access.querySelector('p');
      if(h3) h3.textContent='旧上黒丸小学校付近からスタッフが誘導';
      if(p) p.innerHTML=`<strong>12:00頃から</strong>、${SCHOOL_NAME}（${SCHOOL_ADDRESS}）付近から会場までスタッフを配置します。現地ではスタッフの指示に従って駐車場所へお進みください。`;
    }

    document.querySelectorAll('#before-you-come .info-card p,.timeline p,.faq-list p').forEach(p=>{
      if(p.innerHTML.includes('上黒丸小学校')&&!p.innerHTML.includes('旧上黒丸小学校')) p.innerHTML=p.innerHTML.replaceAll('上黒丸小学校','旧上黒丸小学校');
    });

    const mapRow=document.querySelector('#before-you-come .map-row');
    if(mapRow && !mapRow.querySelector('[data-school-map]')){
      const school=document.createElement('a');
      school.className='btn btn--paper';
      school.href=SCHOOL_MAP;
      school.target='_blank';
      school.rel='noopener';
      school.dataset.schoolMap='1';
      school.textContent='旧上黒丸小学校を地図で見る ↗';
      mapRow.appendChild(school);

      const note=document.createElement('p');
      note.className='rb-current-note';
      note.innerHTML='<strong>車でお越しの方へ：</strong> 会場のGoogleマップは位置確認用です。ナビだけで田んぼへ直接進まず、当日は旧上黒丸小学校付近から配置するスタッフの誘導に従ってください。道幅が狭い場所があります。';
      mapRow.after(note);
    }

    const faq=document.querySelector('#event-faq .faq-list');
    if(faq && !faq.querySelector('[data-current-faq]')){
      const wrap=document.createElement('div');
      wrap.dataset.currentFaq='1';
      wrap.className='rb-event-faq-extra';
      wrap.innerHTML=`
        <details><summary>申込みはいつまでですか？</summary><p><strong>9月19日（土）まで</strong>受け付けています。開催前日まで申込み可能です。</p></details>
        <details><summary>家族や友人を誘ってもいいですか？</summary><p><strong>もちろん大歓迎です。</strong> 大人の方もお子さまも参加できます。参加される方は参加フォームからお申込みください。</p></details>
        <details><summary>申込後の人数変更・キャンセルはどうすればいいですか？</summary><p><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> までメールでご連絡ください。</p></details>
        <details><summary>目に泥が入った場合はどうしますか？</summary><p>目をこすらず、すぐスタッフへお声がけください。清潔な水で洗い流します。痛みや違和感が続く場合は無理に競技へ戻らないでください。</p></details>
        <details><summary>最新情報はどこで確認できますか？</summary><p>このイベントページに加えて、<a href="${INSTAGRAM_URL}" target="_blank" rel="noopener">泥ん子運動会公式Instagram ↗</a>でも準備の様子や最新情報を発信しています。</p></details>`;
      faq.appendChild(wrap);
    }

    const contactBox=document.querySelector('.join-section .contact-box');
    if(contactBox && !contactBox.querySelector('[data-instagram-current]')){
      contactBox.insertAdjacentHTML('beforeend',`<br><a data-instagram-current="1" href="${INSTAGRAM_URL}" target="_blank" rel="noopener">公式Instagramで最新情報を見る ↗</a>`);
    }

    if(!document.querySelector('script[data-event-jsonld-current]')){
      const jsonld=document.createElement('script');
      jsonld.type='application/ld+json';
      jsonld.dataset.eventJsonldCurrent='1';
      jsonld.textContent=JSON.stringify({
        '@context':'https://schema.org','@type':'Event',name:'泥ん子運動会2026',
        description:'2026年9月20日、石川県珠洲市若山町洲巻で開催する、子どもから大人まで参加できる泥ん子運動会。参加・見学無料。',
        startDate:'2026-09-20T13:00:00+09:00',endDate:'2026-09-20T16:30:00+09:00',eventStatus:'https://schema.org/EventScheduled',eventAttendanceMode:'https://schema.org/OfflineEventAttendanceMode',
        location:{'@type':'Place',name:'珠洲市若山町洲巻の田んぼ',address:{'@type':'PostalAddress',addressLocality:'珠洲市',addressRegion:'石川県',streetAddress:'若山町洲巻',addressCountry:'JP'}},
        offers:{'@type':'Offer',price:'0',priceCurrency:'JPY',url:FORM_URL,availability:'https://schema.org/InStock'},
        organizer:{'@type':'Organization',name:'NOTO Re:Bloom',url:'https://noto-rebloom.github.io/noto-rebloom/'},
        image:['https://noto-rebloom.github.io/noto-rebloom/field-overview.webp']
      });
      document.head.appendChild(jsonld);
    }
  };

  const updatePartner=()=>{
    if(current!=='partner.html') return;
    if(document.getElementById('current-support-20260913')) return;

    const statusSection=[...document.querySelectorAll('section')].find(sec=>(sec.textContent||'').includes('今回の協賛募集は終了しました'));
    const section=document.createElement('section');
    section.className='rb-support-now';
    section.id='current-support-20260913';
    section.innerHTML=`<div class="container">
      <div class="rb-support-now__head"><p class="eyebrow"><span>現在の協力・地域連携</span><small>CURRENT SUPPORT</small></p><h2>9月20日の開催を、さまざまな形で支えていただいています。</h2><p>金銭協賛だけでなく、物品提供、農地再生、会場調整、地域での受け入れなど、それぞれの立場からご協力いただいています。</p></div>
      <div class="rb-support-now__grid">
        <article class="rb-support-now__card"><small>IN-KIND SUPPORT</small><h3>北陸コカ・コーラボトリング株式会社</h3><p>当日の水分補給に向けた<strong>アクエリアス</strong>と、エキシビション企画等で活用する<strong>Coke ONチケット</strong>をご提供いただく予定です。</p></article>
        <article class="rb-support-now__card"><small>LOCAL PARTNER</small><h3>一般社団法人紡ぐ学校上黒丸</h3><p>洲巻で進められている棚田・農地再生の取り組みを通じて、今回の会場となる土地とのつながりを支えていただいています。</p></article>
        <article class="rb-support-now__card"><small>FARMING PARTNER</small><h3>オーガニックベース石川株式会社</h3><p>洲巻の農地再生事業で営農を担い、今回の<strong>会場農地の利用・調整</strong>にもご協力いただいています。</p></article>
        <article class="rb-support-now__card"><small>LOCAL COMMUNITY</small><h3>洲巻地区の皆さま</h3><p>会場となる農地の利用を含め、地域の皆さまのご理解とご協力をいただきながら準備を進めています。</p></article>
        <article class="rb-support-now__card rb-support-now__card--media"><small>SUPPORTED BY</small><h3>後援：北國新聞社・MRO北陸放送</h3><p>泥ん子運動会2026は、<strong>北國新聞社</strong>・<strong>MRO北陸放送</strong>の後援をいただいて開催します。</p></article>
        <article class="rb-support-now__card"><small>AFTER THE EVENT</small><h3>イベント後も、農地として続いていきます。</h3><p>会場農地は一日限りの遊び場ではなく、地域で進む農地再生の流れの中にあります。<strong>2027年春からレンコンの植え付けを予定</strong>しています。</p></article>
      </div>
    </div>`;
    if(statusSection) statusSection.before(section); else document.querySelector('main')?.appendChild(section);
  };

  const updateLearn=()=>{
    if(current!=='learn.html') return;
    if(document.getElementById('land-next-2027')) return;
    const cta=document.getElementById('learn-join-cta');
    const section=document.createElement('section');
    section.className='section section--paper';
    section.id='land-next-2027';
    section.innerHTML=`<div class="container split-story"><div><p class="eyebrow"><span>イベントのその先</span><small>AFTER 9.20</small></p><h2>この田んぼは、<br>一日だけの会場ではありません。</h2><p>9月20日に泥ん子運動会を行う田んぼは、地域で進められている農地再生の流れの中にある土地です。一般社団法人紡ぐ学校上黒丸、オーガニックベース石川株式会社、地域の皆さまなどの関わりのもと、農地としてもう一度使っていく準備が進んでいます。</p><div class="rb-land-next"><span class="rb-land-next__eyebrow">NEXT SEASON / 2027 SPRING</span><h3>2027年春から、レンコンの植え付けを予定しています。</h3><p>私たちは泥ん子運動会を「農地を遊び場に変えて終わる企画」にはしたくありません。人がこの土地を知るきっかけをつくり、その後も農地として使われていく過程まで見ていきます。</p><p>イベントで生まれた人とのつながりも、次年度以降の活動へつなげていきます。</p></div></div><figure class="photo-frame"><img src="field-detail.webp" alt="2027年春からレンコンの植え付けを予定している洲巻の農地" loading="lazy" decoding="async"><figcaption>泥ん子運動会のあとも、農地として次の季節へつながります。</figcaption></figure></div>`;
    if(cta) cta.before(section); else document.querySelector('main')?.appendChild(section);
  };

  const updateThoughts=()=>{
    if(current!=='thoughts.html') return;
    const future=document.getElementById('future');
    if(!future || future.querySelector('[data-land-next]')) return;
    const container=future.querySelector('.container');
    if(!container) return;
    const callout=document.createElement('div');
    callout.className='rb-land-next';
    callout.dataset.landNext='1';
    callout.innerHTML='<span class="rb-land-next__eyebrow">THE LAND AFTER THE EVENT</span><h3>会場の田んぼは、2027年春からレンコンの植え付けを予定しています。</h3><p>9月20日が終わった後も、この土地は農地として次の季節へ進みます。イベントで土地を知った人が、その後の変化にも関われるようなつながりを残していきたいと考えています。</p>';
    container.appendChild(callout);
  };

  const updateContact=()=>{
    if(current!=='contact.html') return;
    const accessTopic=[...document.querySelectorAll('.contact-topic')].find(el=>(el.querySelector('b')?.textContent||'').includes('当日の準備・アクセス'));
    if(accessTopic && !accessTopic.querySelector('[data-access-current]')){
      const p=document.createElement('span');
      p.dataset.accessCurrent='1';
      p.innerHTML=`<br>当日は${SCHOOL_NAME}（${SCHOOL_ADDRESS}）付近から12:00頃よりスタッフが誘導します。`;
      accessTopic.appendChild(p);
    }
  };

  addStyles();
  normalizeGlobalFacts();
  updateHome();
  updateEvent();
  updatePartner();
  updateLearn();
  updateThoughts();
  updateContact();
})();
