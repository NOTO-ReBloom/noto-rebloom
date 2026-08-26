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

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.event-flow article,.program-clean-row,.check-list>div,.cup-steps li,.faq-card');
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
