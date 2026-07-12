(() => {
  const doc = document.documentElement;
  const body = document.body;
  const progress = document.querySelector('.scroll-progress span');

  const updateProgress = () => {
    if (!progress) return;
    const max = doc.scrollHeight - innerHeight;
    const ratio = max > 0 ? scrollY / max : 0;
    progress.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
  };
  addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('resize', updateProgress);
  updateProgress();

  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('#site-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = body.classList.toggle('menu-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        body.classList.remove('menu-open');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const revealTargets = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -50px 0px' });
  revealTargets.forEach((target) => revealObserver.observe(target));

  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = parseFloat(el.dataset.count || '0');
      const suffix = el.dataset.suffix || '';
      const duration = 1100;
      const startAt = performance.now();
      const decimals = Number.isInteger(end) ? 0 : 1;
      const tick = (now) => {
        const p = Math.min(1, (now - startAt) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = end * eased;
        el.textContent = `${value.toLocaleString('ja-JP', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.55 });
  counters.forEach((counter) => counterObserver.observe(counter));

  const amountSlider = document.querySelector('#supportAmount');
  const amountText = document.querySelector('#supportAmountText');
  const areaOutput = document.querySelector('#areaOutput');
  const formatYen = (value) => `${Number(value).toLocaleString('ja-JP')}円`;
  const formatArea = (value) => {
    const area = Number(value) / 300;
    if (area < 10) return `約${area.toFixed(1).replace('.0', '')}㎡`;
    return `約${Math.round(area).toLocaleString('ja-JP')}㎡`;
  };
  const updateCalculator = () => {
    if (!amountSlider || !amountText || !areaOutput) return;
    amountText.textContent = formatYen(amountSlider.value);
    areaOutput.textContent = formatArea(amountSlider.value);
  };
  if (amountSlider) {
    amountSlider.addEventListener('input', updateCalculator);
    updateCalculator();
  }

  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      if (innerWidth < 900) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
})();
