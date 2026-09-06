(() => {
  const EVENT_URL = 'https://noto-rebloom.github.io/noto-rebloom/event.html';
  const SHARE_TEXT = '9月20日、珠洲市で開催される「泥ん子運動会2026」。参加費無料です。';
  const VENUE_MAP_URL = 'https://maps.app.goo.gl/AGuuVrEbfju5sZFv9';

  /* Event-specific cache bust: make the latest conversion/readiness styles win over older cached CSS. */
  if (!document.querySelector('link[href*="site-finishing.css?v=20260828conversion1"]')) {
    const latestStyles = document.createElement('link');
    latestStyles.rel = 'stylesheet';
    latestStyles.href = 'site-finishing.css?v=20260828conversion1';
    document.head.appendChild(latestStyles);
  }

  /* Venue-confirmed UI. Kept here so the latest venue information can be updated without duplicating markup across the page. */
  if (!document.getElementById('venue-confirmed-style')) {
    const style = document.createElement('style');
    style.id = 'venue-confirmed-style';
    style.textContent = `
      .nr-new-event .event-venue-confirmed{padding:22px 0;background:#eef8f2;border-bottom:1px solid rgba(24,75,61,.12)}
      .nr-new-event .event-venue-confirmed__inner{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:22px;align-items:center}
      .nr-new-event .event-venue-confirmed__eyebrow{display:block;margin:0 0 6px;color:#2d725d;font-size:11px;font-weight:900;letter-spacing:.09em}
      .nr-new-event .event-venue-confirmed h2{margin:0 0 7px;color:#153f34;font-size:clamp(21px,3vw,30px);line-height:1.3}
      .nr-new-event .event-venue-confirmed p{margin:0;color:#506861;line-height:1.75}
      .nr-new-event .event-venue-map-btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 20px;border-radius:999px;background:#184b3d;color:#fff;text-decoration:none;font-weight:900;white-space:nowrap;box-shadow:0 8px 20px rgba(24,75,61,.16)}
      .nr-new-event .event-venue-map-btn:hover{transform:translateY(-1px)}
      .nr-new-event .event-summary a{color:#184b3d;text-underline-offset:4px}
      .nr-new-event .faq-card--venue{border-color:rgba(45,114,93,.28);background:linear-gradient(180deg,#f4fbf7 0%,#fff 100%)}
      .nr-new-event .faq-card--venue a{font-weight:900;color:#184b3d;text-underline-offset:4px}
      @media(max-width:760px){
        .nr-new-event .event-venue-confirmed__inner{grid-template-columns:1fr;gap:14px}
        .nr-new-event .event-venue-map-btn{width:100%}
      }
    `;
    document.head.appendChild(style);
  }

  const target = new Date('2026-09-20T00:00:00+09:00');
  const el = document.getElementById('eventCountdown');
  if (el) {
    const now = new Date();
    const diff = Math.ceil((target - now) / 86400000);
    if (diff > 1) el.textContent = `開催まであと${diff}日`;
    else if (diff === 1) el.textContent = 'いよいよ明日！';
    else if (diff === 0) el.textContent = '今日は泥ん子運動会！';
    else el.textContent = '泥ん子運動会2026';
  }

  /* Latest confirmed venue information (2026-09-06). */
  const latest = document.querySelector('.event-latest');
  if (latest) {
    const latestLabel = latest.querySelector('.event-latest__label');
    const latestText = latest.querySelector('p');
    if (latestLabel) latestLabel.textContent = 'LATEST UPDATE / 2026.9.6';
    if (latestText) latestText.innerHTML = `<strong>会場となる農地が正式に決定しました。</strong> 石川県珠洲市若山町洲巻の田んぼで開催します。詳しい位置は <a href="${VENUE_MAP_URL}" target="_blank" rel="noopener">Googleマップ</a> から確認できます。`;
  }

  const summary = document.querySelector('.event-summary');
  if (summary) {
    const venueRow = Array.from(summary.querySelectorAll('.summary-grid > div')).find(row => (row.querySelector('span')?.textContent || '').trim() === '会場');
    const venueValue = venueRow?.querySelector('b');
    if (venueValue) venueValue.innerHTML = `石川県珠洲市若山町洲巻<br><a href="${VENUE_MAP_URL}" target="_blank" rel="noopener">Googleマップで会場を見る ↗</a>`;

    if (!document.querySelector('.event-venue-confirmed')) {
      const venueSection = document.createElement('section');
      venueSection.className = 'event-venue-confirmed';
      venueSection.setAttribute('aria-label', '確定した会場農地');
      venueSection.innerHTML = `<div class="container event-venue-confirmed__inner">
        <div><span class="event-venue-confirmed__eyebrow">VENUE CONFIRMED / 2026.9.6</span><h2>9月20日の会場農地が決まりました。</h2><p>現地で確認した、珠洲市若山町洲巻の田んぼを使用します。参加前に地図で場所をご確認いただけます。</p></div>
        <a class="event-venue-map-btn" href="${VENUE_MAP_URL}" target="_blank" rel="noopener">Googleマップで会場を見る ↗</a>
      </div>`;
      summary.after(venueSection);
    }
  }

  /* Latest confirmed participation information. */
  const safetyCards = Array.from(document.querySelectorAll('.check-list>div'));
  const weatherSafety = safetyCards.find(card => (card.querySelector('b')?.textContent || '').includes('暑さ・天候'));
  const rescueSafety = safetyCards.find(card => (card.querySelector('b')?.textContent || '').includes('救護・緊急時'));
  if (weatherSafety?.querySelector('p')) {
    weatherSafety.querySelector('p').textContent = '休憩と水分補給を行います。小雨の場合は開催予定です。雷・大雨・強風など、安全確保が難しい荒天の場合は中止します。';
  }
  if (rescueSafety?.querySelector('p')) {
    rescueSafety.querySelector('p').textContent = '体調不良やけががあった場合は競技を止めて対応し、必要に応じて119番通報や保護者への連絡を行います。開催に向けてイベント保険への加入を予定しています。';
  }

  const faqGrid = document.querySelector('#event-faq .faq-grid');
  if (faqGrid && !faqGrid.querySelector('.faq-card--venue')) {
    const venueFaq = document.createElement('article');
    venueFaq.className = 'faq-card faq-card--venue';
    venueFaq.innerHTML = `<div class="q">会場はどこですか？</div><p><strong>石川県珠洲市若山町洲巻の田んぼです。</strong> 会場農地は正式に決定しています。詳しい位置は <a href="${VENUE_MAP_URL}" target="_blank" rel="noopener">Googleマップで確認できます ↗</a>。</p>`;
    faqGrid.prepend(venueFaq);
  }

  const faqHeadingLead = document.querySelector('#event-faq .section-heading > p:last-child');
  if (faqHeadingLead) faqHeadingLead.textContent = '服装やアクセス、確定した会場など、参加前に気になる情報をまとめています。未確定の内容は「現在調整中」と明記しています。';

  const faqCards = Array.from(document.querySelectorAll('#event-faq .faq-card'));
  const findFaq = (text) => faqCards.find(card => (card.querySelector('.q')?.textContent || '').includes(text));
  const rainFaq = findFaq('雨天時');
  const injuryFaq = findFaq('けがをした場合');
  const parkingFaq = findFaq('駐車場');
  const toiletFaq = findFaq('トイレ');
  if (rainFaq?.querySelector('p')) {
    rainFaq.querySelector('p').innerHTML = '<strong>小雨の場合は開催予定です。</strong> 雷・大雨・強風など、安全確保が難しい荒天の場合は中止します。開催可否に変更がある場合は、このサイトでお知らせします。';
  }
  if (injuryFaq?.querySelector('p')) {
    injuryFaq.querySelector('p').innerHTML = '体調不良やけががあった場合は競技を止めて対応し、必要に応じて119番通報や保護者への連絡を行います。<strong>開催に向けてイベント保険への加入を予定しています。</strong>';
  }
  if (parkingFaq?.querySelector('p')) {
    parkingFaq.querySelector('p').innerHTML = '<strong>現在調整中です。</strong> 具体的な駐車位置と台数は、確定後にこのサイトでご案内します。';
  }
  if (toiletFaq?.querySelector('p')) {
    toiletFaq.querySelector('p').innerHTML = '<strong>現在調整中です。</strong> 利用場所が確定後、このサイトでご案内します。';
  }

  /* Put the four biggest parent/participant decision points near the top. */
  if (summary && !document.querySelector('.event-readiness-strip')) {
    const readiness = document.createElement('section');
    readiness.className = 'event-readiness-strip';
    readiness.setAttribute('aria-label', '参加前の重要情報');
    readiness.innerHTML = `<div class="event-readiness-strip__inner">
      <div class="event-readiness-item"><span>天</span><div><b>小雨は開催予定</b><small>荒天時は中止</small></div></div>
      <div class="event-readiness-item"><span>保</span><div><b>イベント保険</b><small>加入予定</small></div></div>
      <div class="event-readiness-item"><span>車</span><div><b>駐車場</b><small>現在調整中</small></div></div>
      <div class="event-readiness-item"><span>WC</span><div><b>トイレ</b><small>現在調整中</small></div></div>
    </div>`;
    const venueConfirmed = document.querySelector('.event-venue-confirmed');
    (venueConfirmed || summary).after(readiness);

    const share = document.createElement('section');
    share.className = 'event-share-strip';
    share.setAttribute('aria-label', '泥ん子運動会を共有');
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(EVENT_URL)}`;
    share.innerHTML = `<div class="event-share-strip__inner">
      <div class="event-share-strip__copy"><b>家族や友達にも「一緒に行かない？」と送れます。</b><span>9月20日のイベントページを、そのまま共有できます。</span></div>
      <div class="event-share-actions">
        <a class="event-share-btn event-share-btn--line" href="${lineUrl}" target="_blank" rel="noopener">LINEで送る</a>
        <button class="event-share-btn" type="button" data-event-share>家族・友達に共有</button>
        <button class="event-share-btn" type="button" data-event-copy>リンクをコピー</button>
        <span class="event-share-status" aria-live="polite"></span>
      </div>
    </div>`;
    readiness.after(share);

    const status = share.querySelector('.event-share-status');
    const copyLink = async () => {
      try {
        await navigator.clipboard.writeText(EVENT_URL);
        if (status) status.textContent = 'コピーしました';
      } catch (_) {
        const input = document.createElement('textarea');
        input.value = EVENT_URL;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
        if (status) status.textContent = 'コピーしました';
      }
      setTimeout(() => { if (status) status.textContent = ''; }, 2200);
    };
    share.querySelector('[data-event-copy]')?.addEventListener('click', copyLink);
    share.querySelector('[data-event-share]')?.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({ title: '泥ん子運動会2026｜NOTO Re:Bloom', text: SHARE_TEXT, url: EVENT_URL });
          return;
        } catch (error) {
          if (error?.name === 'AbortError') return;
        }
      }
      await copyLink();
    });
  }

  const faqMedia = window.matchMedia('(max-width: 760px)');

  const syncFaqMode = () => {
    faqCards.forEach((card, index) => {
      const question = card.querySelector('.q');
      const answer = card.querySelector('p');
      if (!question || !answer) return;

      if (!answer.id) answer.id = `event-faq-answer-${index + 1}`;

      if (faqMedia.matches) {
        question.setAttribute('role', 'button');
        question.setAttribute('tabindex', '0');
        question.setAttribute('aria-controls', answer.id);
        question.setAttribute('aria-expanded', card.classList.contains('is-open') ? 'true' : 'false');
      } else {
        card.classList.remove('is-open');
        question.removeAttribute('role');
        question.removeAttribute('tabindex');
        question.removeAttribute('aria-controls');
        question.removeAttribute('aria-expanded');
      }
    });
  };

  const toggleFaq = (card) => {
    if (!faqMedia.matches) return;
    const question = card.querySelector('.q');
    const willOpen = !card.classList.contains('is-open');
    card.classList.toggle('is-open', willOpen);
    if (question) question.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  };

  faqCards.forEach(card => {
    const question = card.querySelector('.q');
    if (!question) return;
    question.addEventListener('click', () => toggleFaq(card));
    question.addEventListener('keydown', (event) => {
      if (!faqMedia.matches || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      toggleFaq(card);
    });
  });

  syncFaqMode();
  if (faqMedia.addEventListener) faqMedia.addEventListener('change', syncFaqMode);
  else faqMedia.addListener(syncFaqMode);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.event-flow article,.program-clean-row,.check-list>div,.cup-steps li,.faq-card,.aquarius-inline,.event-readiness-item,.event-venue-confirmed__inner');
    targets.forEach(node => node.classList.add('event-reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    targets.forEach(node => io.observe(node));
  }
})();
