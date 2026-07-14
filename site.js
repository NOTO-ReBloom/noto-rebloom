
(() => {
  const body = document.body;
  const menu = document.querySelector('.menu-button');
  const nav = document.querySelector('#site-nav');
  const progress = document.querySelector('.scroll-progress span');

  const closeNav = () => {
    body.classList.remove('nav-open');
    menu?.setAttribute('aria-expanded', 'false');
  };
  menu?.addEventListener('click', () => {
    const open = body.classList.toggle('nav-open');
    menu.setAttribute('aria-expanded', String(open));
  });
  nav?.addEventListener('click', e => { if (e.target.closest('a')) closeNav(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  };
  addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('resize', updateProgress);
  updateProgress();

  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -35px 0px' });
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add('is-visible'));
  }

  document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      const text = button.dataset.copy || '';
      const original = button.textContent;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const area = document.createElement('textarea');
          area.value = text;
          area.setAttribute('readonly','');
          area.style.position = 'fixed';
          area.style.left = '-9999px';
          document.body.appendChild(area);
          area.select();
          document.execCommand('copy');
          area.remove();
        }
        button.textContent = 'コピーしました';
        const status = button.closest('.copy-card')?.querySelector('.copy-status');
        if (status) status.textContent = '要点をクリップボードにコピーしました。';
        setTimeout(() => { button.textContent = original; if (status) status.textContent = ''; }, 2200);
      } catch (e) {
        const status = button.closest('.copy-card')?.querySelector('.copy-status');
        if (status) status.textContent = 'コピーできませんでした。本文を選択してコピーしてください。';
      }
    });
  });
})();
