(() => {
  'use strict';
  document.documentElement.classList.add('js');

  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('.nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'メニューを開く');
    }));
  }

  const progress = document.querySelector('.progress span');
  const updateProgress = () => {
    const top = window.scrollY || document.documentElement.scrollTop;
    const total = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    if (progress) progress.style.width = `${Math.min(100, (top / total) * 100)}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  const revealItems = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -44px 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  const navTargets = navLinks.map((link) => ({ link, target: document.querySelector(link.getAttribute('href')) })).filter((item) => item.target);
  if ('IntersectionObserver' in window && navTargets.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.remove('is-active'));
        const match = navTargets.find((item) => item.target === entry.target);
        if (match) match.link.classList.add('is-active');
      });
    }, { rootMargin: '-35% 0px -58% 0px', threshold: 0 });
    navTargets.forEach((item) => navObserver.observe(item.target));
  }

  const counters = [...document.querySelectorAll('[data-count]')];
  const renderNumber = (value, decimal) => decimal ? value.toFixed(1) : Math.round(value).toLocaleString('ja-JP');
  const runCounter = (element) => {
    const goal = Number(element.dataset.count || 0);
    const suffix = element.dataset.suffix || '';
    const decimal = String(goal).includes('.');
    const duration = 1050;
    const start = performance.now();
    const tick = (now) => {
      const ratio = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - ratio, 3);
      element.textContent = `${renderNumber(goal * eased, decimal)}${suffix}`;
      if (ratio < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: .55 });
    counters.forEach((counter) => countObserver.observe(counter));
  } else {
    counters.forEach(runCounter);
  }

  const roleData = {
    fund: { label: '資金で支える', title: '土地整備と安全な受入れの、最初の一歩を前へ。', text: '協賛金は、必要に応じた重機・整地・草木撤去、安全なイベント準備など、現地の基盤づくりに活かします。' },
    skill: { label: '技術で支える', title: '重機・運搬・整地の力を、土地の再生に。', text: '現地の状態に応じて必要になる重機作業や運搬、安全な整備について、専門的な力を歓迎しています。' },
    goods: { label: 'モノで支える', title: '種・花苗・資材・備品が、当日の挑戦を支える。', text: '種まき、会場づくり、参加者の受入れに必要な物品提供も、プロジェクトの大切な力です。' },
    people: { label: '人で支える', title: '社員の皆さんが、地域との新しい接点になる。', text: '種まき、運営補助、地域との交流など、社員ボランティアとしての参加も歓迎しています。' },
    media: { label: '発信で支える', title: '挑戦の記録を、次の関わりへつなげる。', text: '取材、社内報、自社サイトやSNS等での発信を歓迎しています。写真・企画のご相談もお待ちしています。' }
  };
  const roleButtons = [...document.querySelectorAll('[data-role]')];
  const rolePanel = document.querySelector('.role-panel');
  const setRole = (key) => {
    if (!rolePanel || !roleData[key]) return;
    const value = roleData[key];
    roleButtons.forEach((button) => {
      const active = button.dataset.role === key;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    rolePanel.innerHTML = `<span>${value.label}</span><b>${value.title}</b><p>${value.text}</p><a href="https://forms.gle/BTcMERE34qfghFiV8" target="_blank" rel="noopener">この形で相談する →</a>`;
  };
  roleButtons.forEach((button) => button.addEventListener('click', () => setRole(button.dataset.role)));
  if (roleButtons[0]) setRole(roleButtons[0].dataset.role);

  const seedButton = document.querySelector('[data-seed]');
  const burst = document.querySelector('.seed-burst');
  if (seedButton && burst) {
    seedButton.addEventListener('click', () => {
      for (let i = 0; i < 16; i += 1) {
        const petal = document.createElement('i');
        petal.textContent = i % 3 === 0 ? '✿' : '•';
        const angle = (Math.PI * 2 * i) / 16;
        const distance = 55 + Math.random() * 80;
        petal.style.left = '86px';
        petal.style.top = '80%';
        petal.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
        petal.style.setProperty('--y', `${Math.sin(angle) * distance - 30}px`);
        burst.appendChild(petal);
        setTimeout(() => petal.remove(), 950);
      }
      seedButton.blur();
    });
  }
})();
