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

  const faqMedia = window.matchMedia('(max-width: 760px)');
  const faqCards = Array.from(document.querySelectorAll('#event-faq .faq-card'));

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
    const targets = document.querySelectorAll('.event-flow article,.program-clean-row,.check-list>div,.cup-steps li,.faq-card,.aquarius-inline');
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
