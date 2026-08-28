(() => {
  const EVENT_URL = 'https://noto-rebloom.github.io/noto-rebloom/event.html';
  const SHARE_TEXT = '9月20日、珠洲市で開催される「泥ん子運動会2026」。参加費無料です。';

  /* Event-specific cache bust: make the latest conversion/readiness styles win over older cached CSS. */
  if (!document.querySelector('link[href*="site-finishing.css?v=20260828conversion1"]')) {
    const latestStyles = document.createElement('link');
    latestStyles.rel = 'stylesheet';
    latestStyles.href = 'site-finishing.css?v=20260828conversion1';
    document.head.appendChild(latestStyles);
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
  const summary = document.querySelector('.event-summary');
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
    summary.after(readiness);

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
    const targets = document.querySelectorAll('.event-flow article,.program-clean-row,.check-list>div,.cup-steps li,.faq-card,.aquarius-inline,.event-readiness-item');
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
