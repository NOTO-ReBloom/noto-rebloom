(() => {
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

  /* Aquarius support feature: use the current official Coca-Cola product visual. */
  const program = document.querySelector('.program-clean');
  if (program && !document.querySelector('.aquarius-support')) {
    const oldCallout = program.querySelector('.callout');
    if (oldCallout) oldCallout.style.display = 'none';

    const style = document.createElement('style');
    style.textContent = `
      .aquarius-support{position:relative;overflow:hidden;padding:54px 0 62px;background:linear-gradient(135deg,#f8fbff 0%,#edf7ff 48%,#f8fcff 100%);border-top:1px solid rgba(31,95,160,.10);border-bottom:1px solid rgba(31,95,160,.10)}
      .aquarius-support::before{content:"";position:absolute;right:-90px;top:-120px;width:330px;height:330px;border-radius:50%;background:radial-gradient(circle at 40% 40%,rgba(24,117,213,.16),rgba(24,117,213,.02) 62%,transparent 63%);pointer-events:none}
      .aquarius-support::after{content:"";position:absolute;left:-90px;bottom:-135px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle at 55% 40%,rgba(51,167,234,.13),rgba(51,167,234,.02) 62%,transparent 63%);pointer-events:none}
      .aquarius-support__inner{position:relative;z-index:1;display:grid;grid-template-columns:minmax(280px,.9fr) minmax(0,1.1fr);align-items:center;gap:42px;max-width:1040px;margin:0 auto;padding:0 24px}
      .aquarius-support__visual{display:grid;place-items:center;min-height:440px;padding:22px;border-radius:30px;background:rgba(255,255,255,.88);border:1px solid rgba(31,95,160,.12);box-shadow:0 18px 44px rgba(28,83,134,.10)}
      .aquarius-support__visual img{display:block;width:auto;max-width:min(100%,350px);height:400px;object-fit:contain;filter:drop-shadow(0 18px 24px rgba(15,62,110,.16))}
      .aquarius-support__copy{max-width:560px}
      .aquarius-support__kicker{display:inline-flex;align-items:center;gap:8px;margin:0 0 14px;padding:7px 11px;border-radius:999px;background:#fff;color:#15549b;border:1px solid rgba(21,84,155,.13);font-size:11px;font-weight:900;letter-spacing:.10em;box-shadow:0 4px 12px rgba(22,81,143,.06)}
      .aquarius-support__kicker::before{content:"";width:8px;height:8px;border-radius:50%;background:#1689dd;box-shadow:0 0 0 4px rgba(22,137,221,.12)}
      .aquarius-support h2{margin:0 0 16px;color:#173e34;font-size:clamp(32px,4vw,54px);line-height:1.1;letter-spacing:-.045em}
      .aquarius-support__lead{margin:0;color:#425b54;font-size:16px;line-height:1.9}
      .aquarius-support__thanks{display:inline-block;margin-top:19px;padding-top:13px;border-top:1px solid rgba(21,84,155,.15);color:#547079;font-size:12px;line-height:1.75}
      .aquarius-support__thanks strong{color:#1a5d9f;font-weight:900}
      .aquarius-support__note{margin-top:10px;color:#7a898e;font-size:10px;line-height:1.6}
      @media(max-width:760px){
        .aquarius-support{padding:42px 0 48px}
        .aquarius-support__inner{grid-template-columns:1fr;gap:24px;padding:0 18px}
        .aquarius-support__visual{min-height:330px;padding:18px;border-radius:24px}
        .aquarius-support__visual img{height:300px;max-width:100%}
        .aquarius-support h2{font-size:clamp(30px,9vw,42px)}
        .aquarius-support__lead{font-size:15px;line-height:1.8}
      }
    `;
    document.head.appendChild(style);

    const support = document.createElement('section');
    support.className = 'aquarius-support';
    support.setAttribute('aria-label', 'アクエリアス提供');
    support.innerHTML = `
      <div class="aquarius-support__inner">
        <figure class="aquarius-support__visual">
          <img src="https://www.coca-cola.com/content/dam/onexp/jp/ja/media-center/news-20250415-11/news-20250415-11-hr-05.png" alt="アクエリアス ペットボトル" loading="lazy">
        </figure>
        <div class="aquarius-support__copy">
          <p class="aquarius-support__kicker">HYDRATION SUPPORT</p>
          <h2>思いっきり泥だらけになったら、<br>しっかり水分補給。</h2>
          <p class="aquarius-support__lead">当日は参加者のみなさんに、アクエリアスをご用意します。競技の合間や終了後に、しっかり水分を補給しながら楽しみましょう。</p>
          <p class="aquarius-support__thanks"><strong>北陸コカ・コーラボトリング様</strong>よりご提供いただきました。</p>
          <p class="aquarius-support__note">製品画像：日本コカ・コーラ株式会社 公式製品画像</p>
        </div>
      </div>
    `;
    program.insertAdjacentElement('afterend', support);
  }

  /* The support is confirmed, so remove the old tentative wording in FAQ. */
  document.querySelectorAll('.faq-card').forEach((card) => {
    const q = card.querySelector('.q');
    if (q && q.textContent.includes('飲み物はありますか')) {
      const p = card.querySelector('p');
      if (p) p.innerHTML = '<strong>あります。</strong> 参加者向けにアクエリアスをご用意します。暑さ対策のため、ご自身でも飲み物をご準備ください。';
    }
  });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.event-flow article,.program-clean-row,.check-list>div,.cup-steps li,.faq-card,.aquarius-support__visual,.aquarius-support__copy');
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
