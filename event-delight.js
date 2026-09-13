(() => {
  const EVENT_URL = 'https://noto-rebloom.github.io/noto-rebloom/event.html';
  const FORM_URL = 'https://forms.gle/6ZMrhrhtWmBCQViD8';
  const VENUE_MAP_URL = 'https://maps.app.goo.gl/AGuuVrEbfju5sZFv9';
  const SHARE_TEXT = '9月20日、珠洲市で開催される「泥ん子運動会2026」。参加・見学無料、前日まで申込受付中です。';

  if (!document.querySelector('link[href*="site-finishing.css?v=20260828conversion1"]')) {
    const latestStyles = document.createElement('link');
    latestStyles.rel = 'stylesheet';
    latestStyles.href = 'site-finishing.css?v=20260828conversion1';
    document.head.appendChild(latestStyles);
  }

  if (!document.getElementById('event-final-20260913-style')) {
    const style = document.createElement('style');
    style.id = 'event-final-20260913-style';
    style.textContent = `
      .nr-new-event .event-final-guide{padding:64px 0;background:#f2f7f3;border-top:1px solid rgba(24,75,61,.08);border-bottom:1px solid rgba(24,75,61,.09)}
      .nr-new-event .event-final-guide__head{max-width:780px;margin:0 auto 28px;text-align:center}
      .nr-new-event .event-final-guide__head h2{margin:8px 0 10px;color:#163f34;font-size:clamp(28px,4vw,44px);line-height:1.25}
      .nr-new-event .event-final-guide__head p{margin:0;color:#526861;line-height:1.85}
      .nr-new-event .event-final-guide__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
      .nr-new-event .event-final-guide__card{padding:22px 22px 20px;border-radius:22px;background:#fff;border:1px solid rgba(24,75,61,.11);box-shadow:0 10px 28px rgba(24,75,61,.055)}
      .nr-new-event .event-final-guide__card span{display:inline-flex;align-items:center;justify-content:center;min-width:42px;height:30px;padding:0 10px;margin-bottom:10px;border-radius:999px;background:#e6f2ea;color:#184b3d;font-size:11px;font-weight:900;letter-spacing:.05em}
      .nr-new-event .event-final-guide__card h3{margin:0 0 8px;color:#173f34;font-size:18px;line-height:1.45}
      .nr-new-event .event-final-guide__card p{margin:0;color:#586c65;line-height:1.8;font-size:14px}
      .nr-new-event .event-final-guide__card strong{color:#184b3d}
      .nr-new-event .program-final-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:22px 0 0}
      .nr-new-event .program-final-card{position:relative;padding:20px 20px 18px;border-radius:20px;background:#fff;border:1px solid rgba(24,75,61,.12);box-shadow:0 8px 24px rgba(24,75,61,.05)}
      .nr-new-event .program-final-card__num{display:block;margin-bottom:8px;color:#5c806f;font-size:11px;font-weight:900;letter-spacing:.12em}
      .nr-new-event .program-final-card h3{margin:0 0 7px;color:#173f34;font-size:18px;line-height:1.4}
      .nr-new-event .program-final-card p{margin:0;color:#60726b;font-size:13px;line-height:1.75}
      .nr-new-event .program-final-card--wide{grid-column:1/-1;background:linear-gradient(135deg,#fff8cf 0%,#fff 100%);border-color:rgba(227,183,47,.28)}
      .nr-new-event .program-final-card--wide .program-final-card__num{color:#8a6a0b}
      .nr-new-event .event-venue-confirmed{padding:22px 0;background:#eef8f2;border-bottom:1px solid rgba(24,75,61,.12)}
      .nr-new-event .event-venue-confirmed__inner{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:22px;align-items:center}
      .nr-new-event .event-venue-confirmed__eyebrow{display:block;margin:0 0 6px;color:#2d725d;font-size:11px;font-weight:900;letter-spacing:.09em}
      .nr-new-event .event-venue-confirmed h2{margin:0 0 7px;color:#153f34;font-size:clamp(21px,3vw,30px);line-height:1.3}
      .nr-new-event .event-venue-confirmed p{margin:0;color:#506861;line-height:1.75}
      .nr-new-event .event-venue-map-btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 20px;border-radius:999px;background:#184b3d;color:#fff;text-decoration:none;font-weight:900;white-space:nowrap;box-shadow:0 8px 20px rgba(24,75,61,.16)}
      .nr-new-event .event-summary a{color:#184b3d;text-underline-offset:4px}
      .nr-new-event .faq-card--venue{border-color:rgba(45,114,93,.28);background:linear-gradient(180deg,#f4fbf7 0%,#fff 100%)}
      .nr-new-event .faq-card--venue a{font-weight:900;color:#184b3d;text-underline-offset:4px}
      @media(max-width:760px){
        .nr-new-event .event-final-guide{padding:48px 0}
        .nr-new-event .event-final-guide__grid,.nr-new-event .program-final-grid{grid-template-columns:1fr}
        .nr-new-event .program-final-card--wide{grid-column:auto}
        .nr-new-event .event-venue-confirmed__inner{grid-template-columns:1fr;gap:14px}
        .nr-new-event .event-venue-map-btn{width:100%}
      }
    `;
    document.head.appendChild(style);
  }

  document.title = '泥ん子運動会2026｜9/20 珠洲・参加無料｜NOTO Re:Bloom';
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = '2026年9月20日、石川県珠洲市若山町洲巻で開催する泥ん子運動会2026。参加・見学無料。親子お宝ハンター＆玉入れ、綱引き、バケツリレー、手押し相撲、ドッジボールを実施。駐車案内・トイレ・持ち物など当日情報も掲載しています。';

  const target = new Date('2026-09-20T00:00:00+09:00');
  const countdown = document.getElementById('eventCountdown');
  if (countdown) {
    const diff = Math.ceil((target - new Date()) / 86400000);
    if (diff > 1) countdown.textContent = `開催まであと${diff}日`;
    else if (diff === 1) countdown.textContent = 'いよいよ明日！';
    else if (diff === 0) countdown.textContent = '今日は泥ん子運動会！';
    else countdown.textContent = '泥ん子運動会2026';
  }

  const latest = document.querySelector('.event-latest');
  if (latest) {
    const label = latest.querySelector('.event-latest__label');
    const text = latest.querySelector('p');
    if (label) label.textContent = 'LATEST UPDATE / 2026.9.13';
    if (text) text.innerHTML = '<strong>競技内容と当日の来場案内が確定しました。</strong> 駐車場へは上黒丸小学校付近からスタッフが誘導します。会場にトイレはないため、小学校で済ませてから会場へお越しください。参加申込みは前日まで受け付けます。';
  }

  const heroNote = document.querySelector('.hero-sticker-note');
  if (heroNote) heroNote.textContent = '参加・見学無料／全年齢対象。受付12:30、13:00開始。参加申込みは9月19日まで受け付けます。会場までの詳しい誘導は当日スタッフがご案内します。';

  const values = Array.from(document.querySelectorAll('.event-values article'));
  if (values[0]) {
    const h3 = values[0].querySelector('h3');
    const p = values[0].querySelector('p');
    if (h3) h3.textContent = '5つの泥競技';
    if (p) p.textContent = '親子お宝ハンター＆玉入れ、綱引き、バケツリレー、手押し相撲、ドッジボール。大人も子どもも本気で楽しめる内容です。';
  }
  if (values[3]) {
    const p = values[3].querySelector('p');
    if (p) p.textContent = '北陸コカ・コーラボトリング様のご協力により、参加者向けのアクエリアスをご用意する予定です。';
  }

  const summary = document.querySelector('.event-summary');
  if (summary) {
    const venueRow = Array.from(summary.querySelectorAll('.summary-grid > div')).find(row => (row.querySelector('span')?.textContent || '').trim() === '会場');
    const venueValue = venueRow?.querySelector('b');
    if (venueValue) venueValue.innerHTML = `石川県珠洲市若山町洲巻<br><a href="${VENUE_MAP_URL}" target="_blank" rel="noopener">Googleマップで会場を見る ↗</a>`;

    if (!document.querySelector('.event-venue-confirmed')) {
      const venueSection = document.createElement('section');
      venueSection.className = 'event-venue-confirmed';
      venueSection.setAttribute('aria-label', '会場案内');
      venueSection.innerHTML = `<div class="container event-venue-confirmed__inner">
        <div><span class="event-venue-confirmed__eyebrow">VENUE / SUZUMAKI</span><h2>会場は珠洲市若山町洲巻の田んぼです。</h2><p>当日は上黒丸小学校付近から会場・駐車場所までスタッフを配置します。12:00頃から誘導を開始しますので、現地ではスタッフの指示に従ってお進みください。</p></div>
        <a class="event-venue-map-btn" href="${VENUE_MAP_URL}" target="_blank" rel="noopener">Googleマップで会場を見る ↗</a>
      </div>`;
      summary.after(venueSection);
    }
  }

  if (summary && !document.querySelector('.event-readiness-strip')) {
    const readiness = document.createElement('section');
    readiness.className = 'event-readiness-strip';
    readiness.setAttribute('aria-label', '参加前の重要情報');
    readiness.innerHTML = `<div class="event-readiness-strip__inner">
      <div class="event-readiness-item"><span>車</span><div><b>12:00頃から誘導</b><small>上黒丸小学校付近からスタッフ配置</small></div></div>
      <div class="event-readiness-item"><span>WC</span><div><b>会場にトイレなし</b><small>小学校で済ませてから会場へ</small></div></div>
      <div class="event-readiness-item"><span>替</span><div><b>更衣スペースあり</b><small>着替え・タオルを持参</small></div></div>
      <div class="event-readiness-item"><span>泥</span><div><b>会場で泥落とし</b><small>希望者は小学校のシャワー利用可</small></div></div>
    </div>`;
    (document.querySelector('.event-venue-confirmed') || summary).after(readiness);
  }

  if (!document.querySelector('.event-final-guide')) {
    const anchor = document.querySelector('.event-readiness-strip') || document.querySelector('.event-venue-confirmed') || summary;
    const guide = document.createElement('section');
    guide.className = 'event-final-guide';
    guide.setAttribute('aria-label', '当日の来場と参加案内');
    guide.innerHTML = `<div class="container">
      <div class="event-final-guide__head"><p class="eyebrow"><span>当日の来場・参加案内</span><small>BEFORE YOU COME</small></p><h2>来る前に、ここだけ確認。</h2><p>駐車、トイレ、服装、着替えなど、当日迷いやすいポイントをまとめました。</p></div>
      <div class="event-final-guide__grid">
        <article class="event-final-guide__card"><span>ACCESS</span><h3>スタッフの誘導に従って駐車場へ</h3><p>上黒丸小学校付近から会場までの道中に、<strong>12:00頃からスタッフを配置</strong>します。一部道幅が狭い場所があります。大型車も通行できますが、可能な方は軽自動車・コンパクトカーなど小さめの車がおすすめです。</p></article>
        <article class="event-final-guide__card"><span>TOILET</span><h3>会場にはトイレがありません</h3><p>田んぼへ向かう前に、<strong>上黒丸小学校でトイレを済ませてから</strong>お越しください。特にお子さまと参加される方は事前にお声がけをお願いします。</p></article>
        <article class="event-final-guide__card"><span>CLOTHES</span><h3>動きやすく、洗いやすい服装で</h3><p>大人のふくらはぎ程度まで泥に入る予定です。泥だらけになってもよい服装でご参加ください。普通の靴やサンダルは脱げやすいため、足元が心配な方は<strong>農業用・田植え用の足袋</strong>などがおすすめです。</p></article>
        <article class="event-final-guide__card"><span>EYES</span><h3>目の保護があると安心です</h3><p>泥や泥水が顔にかかる可能性があります。サングラス、メガネ、スポーツ用ゴーグルなどがあると安心です。お子さまは<strong>水中メガネ</strong>もおすすめです。</p></article>
        <article class="event-final-guide__card"><span>CHANGE</span><h3>着替えスペースを用意します</h3><p>会場にはテント等を使った更衣スペースを設けます。<strong>着替え一式・タオル・汚れ物を入れる大きめの袋</strong>をご持参ください。</p></article>
        <article class="event-final-guide__card"><span>WASH</span><h3>泥を落としてから着替えます</h3><p>競技後は会場で、車に乗れる程度まで大まかに泥を落とします。さらにしっかり流したい方は、<strong>上黒丸小学校のシャワー</strong>をご利用いただけます。</p></article>
      </div>
    </div>`;
    anchor?.after(guide);
  }

  const flow = Array.from(document.querySelectorAll('.event-flow article'));
  if (flow[0]) {
    flow[0].querySelector('.flow-time').textContent = '12:30';
    flow[0].querySelector('h3').textContent = '受付';
    flow[0].querySelector('p').textContent = '受付後、13:00から開会・安全説明を行います。会場へ向かう前に上黒丸小学校でトイレを済ませてください。';
  }
  if (flow[1]) {
    flow[1].querySelector('.flow-time').textContent = '13:10';
    flow[1].querySelector('h3').textContent = '泥ん子競技';
    flow[1].querySelector('p').textContent = '親子お宝ハンター＆玉入れ、綱引き、バケツリレー、手押し相撲、ドッジボールを、休憩をはさみながら進めます。最後にCoke ONチャレンジのエキシビションも予定しています。';
  }
  if (flow[2]) {
    flow[2].querySelector('.flow-time').textContent = '15:00〜';
    flow[2].querySelector('h3').textContent = '交流・泥落とし・着替え';
    flow[2].querySelector('p').textContent = '競技後はレンゲカップや交流の時間をとり、会場で泥を落として着替えます。16:30頃閉会、17:00頃の解散を予定しています。';
  }

  const programRows = Array.from(document.querySelectorAll('.program-clean-row'));
  const names = ['親子お宝ハンター＆玉入れ','泥んこ綱引き','泥んこバケツリレー','泥んこ手押し相撲','泥んこドッジボール'];
  programRows.forEach((row, i) => {
    const name = row.querySelector('.program-clean-name');
    if (name && names[i]) name.textContent = names[i];
  });

  const programMain = document.querySelector('.program-split__main');
  if (programMain && !programMain.querySelector('.program-final-grid')) {
    const details = document.createElement('div');
    details.className = 'program-final-grid';
    details.innerHTML = `
      <article class="program-final-card"><span class="program-final-card__num">01 / FAMILY</span><h3>親子お宝ハンター＆玉入れ</h3><p>大人が泥の中からカラーボールを探して子どもへ届け、子どもがカゴへ投げます。小さなお子さまも参加しやすい競技です。</p></article>
      <article class="program-final-card"><span class="program-final-card__num">02 / POWER</span><h3>泥んこ綱引き</h3><p>赤組・白組の5対5。3試合行い、中央の印を自陣側へ引いたチームが勝ちです。</p></article>
      <article class="program-final-card"><span class="program-final-card__num">03 / TEAMWORK</span><h3>泥んこバケツリレー</h3><p>チーム全員で一列になり、水の入った容器を手渡しでつなぎます。空の容器も同じ列を逆向きに戻します。</p></article>
      <article class="program-final-card"><span class="program-final-card__num">04 / BALANCE</span><h3>泥んこ手押し相撲</h3><p>手のひら同士で押し合う1対1勝負。転倒や手・膝などが泥についたら負け。体格が近い参加者同士で対戦します。</p></article>
      <article class="program-final-card"><span class="program-final-card__num">05 / FINAL GAME</span><h3>泥んこドッジボール</h3><p>赤組・白組の5対5。柔らかいボールを使い、5分間のシンプルなドッジボールで最後の勝負をします。</p></article>
      <article class="program-final-card program-final-card--wide"><span class="program-final-card__num">EXHIBITION / COKE ON</span><h3>Coke ONチャレンジ手押し相撲</h3><p>正式競技のあと、希望者が主催者・学生スタッフへ挑戦。勝者にはコカ・コーラ製品と交換できるCoke ONチケットを景品としてお渡しする予定です。赤組・白組の得点には入りません。</p></article>`;
    programMain.querySelector('.program-clean-list')?.after(details);
  }

  const aquariusCallout = programMain?.querySelector('.callout');
  if (aquariusCallout) {
    const b = aquariusCallout.querySelector('b');
    const p = aquariusCallout.querySelector('p');
    if (b) b.textContent = '参加者向けにアクエリアスをご用意する予定です';
    if (p) p.textContent = '北陸コカ・コーラボトリング様のご協力による飲料提供を予定しています。ご自身の飲み物もあわせてお持ちください。';
  }
  const aqThanks = document.querySelector('.aquarius-inline__thanks');
  if (aqThanks) aqThanks.innerHTML = '<strong>北陸コカ・コーラボトリング様</strong>のご協力によりご用意する予定です。';

  const bringSections = Array.from(document.querySelectorAll('.section--paper'));
  const bringSection = bringSections.find(section => (section.querySelector('.eyebrow span')?.textContent || '').includes('参加前にこれだけ準備'));
  if (bringSection) {
    const heading = bringSection.querySelector('.section-heading');
    if (heading) {
      const h2 = heading.querySelector('h2');
      const p = heading.querySelector('p:last-child');
      if (h2) h2.textContent = '着替えと泥対策を忘れずに。';
      if (p) p.textContent = '泥だらけになってもよい、動きやすく洗いやすい服装でお越しください。';
    }
    const cards = Array.from(bringSection.querySelectorAll('.check-list > div'));
    const setCard = (i, icon, title, body) => {
      if (!cards[i]) return;
      cards[i].querySelector('span').textContent = icon;
      cards[i].querySelector('b').textContent = title;
      cards[i].querySelector('p').textContent = body;
    };
    setCard(0,'服','動きやすく洗いやすい服','泥だらけになってもよい服装でご参加ください。短パン等に限らず、動きやすく洗いやすければ大丈夫です。');
    setCard(1,'足','裸足または脱げにくい足袋','裸足でも参加できます。足元が心配な方は農業用・田植え用の足袋など、泥の中で脱げにくいものがおすすめです。');
    setCard(2,'替','着替え・タオル','更衣スペースを用意します。着替え一式とタオルをご持参ください。');
    setCard(3,'袋','汚れ物用の大きめの袋','泥のついた服や履き物を持ち帰る袋をご用意ください。車内保護用のシートや古タオルもあると安心です。');
    setCard(4,'水','各自の飲み物','アクエリアスをご用意する予定ですが、屋外で身体を動かすため、各自でも十分な飲み物をお持ちください。');
    if (!bringSection.querySelector('[data-final-eye-card]')) {
      const list = bringSection.querySelector('.check-list');
      const eye = document.createElement('div');
      eye.dataset.finalEyeCard = '1';
      eye.innerHTML = '<span>目</span><b>サングラス・ゴーグル等</b><p>泥が目に入るのが心配な方は、サングラスやスポーツ用ゴーグルをご用意ください。お子さまは水中メガネもおすすめです。</p>';
      list?.appendChild(eye);
    }
  }

  const safetySection = bringSections.find(section => (section.querySelector('.eyebrow span')?.textContent || '').includes('安心して参加するために'));
  if (safetySection) {
    const cards = Array.from(safetySection.querySelectorAll('.check-list > div'));
    const venue = cards.find(card => (card.querySelector('b')?.textContent || '').includes('会場の事前確認'));
    const weather = cards.find(card => (card.querySelector('b')?.textContent || '').includes('暑さ・天候'));
    const rescue = cards.find(card => (card.querySelector('b')?.textContent || '').includes('救護・緊急時'));
    if (venue?.querySelector('p')) venue.querySelector('p').textContent = '田んぼ内の石・枝・金属等を確認します。深い泥のため、競技中は走り込み・滑り込み・飛び込みを行わず、スタッフの安全指示に従ってください。';
    if (weather?.querySelector('p')) weather.querySelector('p').textContent = '休憩と水分補給を行います。小雨の場合は開催予定です。雷・大雨・強風など、安全確保が難しい荒天の場合は中止します。';
    if (rescue?.querySelector('p')) rescue.querySelector('p').textContent = '体調不良やけが、目に泥が入った場合などは無理をせず、すぐ近くのスタッフへお声がけください。必要に応じて救護・119番通報・保護者への連絡を行います。';
  }

  const faqGrid = document.querySelector('#event-faq .faq-grid');
  if (faqGrid && !faqGrid.querySelector('.faq-card--venue')) {
    const venueFaq = document.createElement('article');
    venueFaq.className = 'faq-card faq-card--venue';
    venueFaq.innerHTML = `<div class="q">会場はどこですか？</div><p><strong>石川県珠洲市若山町洲巻の田んぼです。</strong> 詳しい位置は <a href="${VENUE_MAP_URL}" target="_blank" rel="noopener">Googleマップで確認できます ↗</a>。当日は上黒丸小学校付近からスタッフが誘導します。</p>`;
    faqGrid.prepend(venueFaq);
  }

  const faqHeadingLead = document.querySelector('#event-faq .section-heading > p:last-child');
  if (faqHeadingLead) faqHeadingLead.textContent = '服装、駐車場、トイレ、泥落としなど、当日の参加に必要な情報をまとめています。';

  const faqCards = Array.from(document.querySelectorAll('#event-faq .faq-card'));
  const findFaq = (text) => faqCards.find(card => (card.querySelector('.q')?.textContent || '').includes(text));
  const replaceFaq = (key, html) => {
    const card = findFaq(key);
    if (card?.querySelector('p')) card.querySelector('p').innerHTML = html;
  };
  replaceFaq('どんな服装','<strong>泥だらけになってもよい、動きやすく洗いやすい服装</strong>でご参加ください。着替え、タオル、汚れ物を入れる袋もご持参ください。');
  replaceFaq('靴や長靴','普通の靴やサンダルは泥の中で脱げやすいためおすすめしません。<strong>裸足での参加も可能</strong>です。足元が心配な方は農業用・田植え用の足袋などがおすすめです。');
  replaceFaq('水着','<strong>必須ではありません。</strong> 動きやすく洗いやすい服装であれば大丈夫です。');
  replaceFaq('着替え場所','<strong>あります。</strong> 会場にテント等を使った更衣スペースを設けます。');
  replaceFaq('泥は落とせますか','<strong>はい。</strong> 会場でまず車に乗れる程度まで大まかな泥を落とし、その後着替えていただきます。さらにしっかり流したい方は上黒丸小学校のシャワーをご利用いただけます。');
  replaceFaq('駐車場','<strong>当日はスタッフが誘導します。</strong> 12:00頃から上黒丸小学校付近〜会場までの道中にスタッフを配置しますので、指示に従って駐車場所へお進みください。一部道幅が狭いため、可能な方は小さめの車がおすすめです。大型車も通行可能です。');
  replaceFaq('トイレ','<strong>会場の田んぼにはトイレがありません。</strong> 会場へ向かう前に上黒丸小学校で済ませてからお越しください。');
  replaceFaq('どんな競技','<strong>親子お宝ハンター＆玉入れ、泥んこ綱引き、泥んこバケツリレー、泥んこ手押し相撲、泥んこドッジボール</strong>の5種目を行います。競技後にはCoke ONチャレンジ手押し相撲も予定しています。');
  replaceFaq('何人くらい','現在も参加申込みを受け付けています。<strong>申込締切は9月19日（前日）</strong>です。ご家族・ご友人・お知り合いの方との参加も大歓迎です。');
  replaceFaq('飲み物','北陸コカ・コーラボトリング様のご協力により、参加者向けに<strong>アクエリアスをご用意する予定</strong>です。暑さ対策のため、ご自身でも飲み物をご準備ください。');
  replaceFaq('雨天時','<strong>小雨の場合は開催予定です。</strong> 雷・大雨・強風など、安全確保が難しい荒天の場合は中止します。開催可否に変更がある場合はこのサイトでお知らせします。');
  replaceFaq('けがをした場合','体調不良やけが、目に泥が入った場合などは無理をせず、すぐ近くのスタッフへお声がけください。状況に応じて救護対応を行います。');

  const joinSection = Array.from(document.querySelectorAll('.section--paper')).find(section => (section.querySelector('.eyebrow span')?.textContent || '').trim() === '参加する');
  if (joinSection) {
    const p = joinSection.querySelector('.section-heading > p:not(.eyebrow)');
    if (p) p.textContent = '参加費は無料です。申込みは9月19日まで受け付けます。子どもから大人まで、ご家族・ご友人・お知り合いの方もぜひ一緒にご参加ください。';
  }

  if (summary && !document.querySelector('.event-share-strip')) {
    const share = document.createElement('section');
    share.className = 'event-share-strip';
    share.setAttribute('aria-label', '泥ん子運動会を共有');
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(EVENT_URL)}`;
    share.innerHTML = `<div class="event-share-strip__inner">
      <div class="event-share-strip__copy"><b>家族や友達にも「一緒に行かない？」と送れます。</b><span>参加申込みは前日まで。イベントページをそのまま共有できます。</span></div>
      <div class="event-share-actions"><a class="event-share-btn event-share-btn--line" href="${lineUrl}" target="_blank" rel="noopener">LINEで送る</a><button class="event-share-btn" type="button" data-event-share>家族・友達に共有</button><button class="event-share-btn" type="button" data-event-copy>リンクをコピー</button><span class="event-share-status" aria-live="polite"></span></div>
    </div>`;
    const guide = document.querySelector('.event-final-guide');
    (guide || document.querySelector('.event-readiness-strip') || summary).after(share);

    const status = share.querySelector('.event-share-status');
    const copyLink = async () => {
      try { await navigator.clipboard.writeText(EVENT_URL); }
      catch (_) {
        const input = document.createElement('textarea');
        input.value = EVENT_URL; input.setAttribute('readonly',''); input.style.position='fixed'; input.style.opacity='0'; document.body.appendChild(input); input.select(); document.execCommand('copy'); input.remove();
      }
      if (status) status.textContent = 'コピーしました';
      setTimeout(() => { if (status) status.textContent = ''; }, 2200);
    };
    share.querySelector('[data-event-copy]')?.addEventListener('click', copyLink);
    share.querySelector('[data-event-share]')?.addEventListener('click', async () => {
      if (navigator.share) {
        try { await navigator.share({ title:'泥ん子運動会2026｜NOTO Re:Bloom', text:SHARE_TEXT, url:EVENT_URL }); return; }
        catch (error) { if (error?.name === 'AbortError') return; }
      }
      await copyLink();
    });
  }

  const faqMedia = window.matchMedia('(max-width: 760px)');
  const syncFaqMode = () => {
    const currentCards = Array.from(document.querySelectorAll('#event-faq .faq-card'));
    currentCards.forEach((card, index) => {
      const question = card.querySelector('.q');
      const answer = card.querySelector('p');
      if (!question || !answer) return;
      if (!answer.id) answer.id = `event-faq-answer-${index + 1}`;
      if (faqMedia.matches) {
        question.setAttribute('role','button');
        question.setAttribute('tabindex','0');
        question.setAttribute('aria-controls',answer.id);
        question.setAttribute('aria-expanded',card.classList.contains('is-open') ? 'true' : 'false');
      } else {
        card.classList.remove('is-open');
        question.removeAttribute('role'); question.removeAttribute('tabindex'); question.removeAttribute('aria-controls'); question.removeAttribute('aria-expanded');
      }
    });
  };
  const toggleFaq = (card) => {
    if (!faqMedia.matches) return;
    const question = card.querySelector('.q');
    const willOpen = !card.classList.contains('is-open');
    card.classList.toggle('is-open',willOpen);
    if (question) question.setAttribute('aria-expanded',willOpen ? 'true' : 'false');
  };
  Array.from(document.querySelectorAll('#event-faq .faq-card')).forEach(card => {
    const question = card.querySelector('.q');
    if (!question || question.dataset.finalBound) return;
    question.dataset.finalBound = '1';
    question.addEventListener('click',() => toggleFaq(card));
    question.addEventListener('keydown',(event) => {
      if (!faqMedia.matches || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault(); toggleFaq(card);
    });
  });
  syncFaqMode();
  if (faqMedia.addEventListener) faqMedia.addEventListener('change',syncFaqMode);
  else if (faqMedia.addListener) faqMedia.addListener(syncFaqMode);

  const targets = document.querySelectorAll('.event-final-guide__card,.program-final-card');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.08, rootMargin:'0px 0px -30px 0px' });
    targets.forEach(node => io.observe(node));
  }
})();
