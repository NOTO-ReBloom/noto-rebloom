(() => {
  const body = document.body;
  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('#site-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = body.classList.toggle('menu-open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        body.classList.remove('menu-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'メニューを開く');
      });
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const counters = document.querySelectorAll('[data-count]');
  const formatNumber = (value, target) => {
    if (target >= 1000) return Math.round(value).toLocaleString('ja-JP');
    return Number.isInteger(target) ? String(Math.round(value)) : value.toFixed(1);
  };

  const animateCount = (el) => {
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = `${formatNumber(target * eased, target)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = `${formatNumber(target, target)}${suffix}`;
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.45 });
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCount);
  }
})();
