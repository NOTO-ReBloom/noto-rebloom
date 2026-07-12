(() => {
  const body = document.body;
  const doc = document.documentElement;
  const progress = document.querySelector('.scroll-progress span');

  const updateProgress = () => {
    if (!progress) return;
    const max = doc.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  };
  addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('resize', updateProgress);
  updateProgress();

  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('#site-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = body.classList.toggle('menu-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', e => {
      if (e.target.closest('a')) {
        body.classList.remove('menu-open');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const revealTargets = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach(el => revealObserver.observe(el));

  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = Number(el.dataset.count || 0);
      const suffix = el.dataset.suffix || '';
      const decimals = Number.isInteger(end) ? 0 : 1;
      const start = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - start) / 1100);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = end * eased;
        el.textContent = `${value.toLocaleString('ja-JP', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: .55 });
  counters.forEach(el => counterObserver.observe(el));

  const examples = [
    { key:'tatami1', label:'畳1枚', area:1.62, amount:486 },
    { key:'tsubo', label:'1坪', area:3.31, amount:993 },
    { key:'tatami6', label:'6畳の部屋', area:9.72, amount:2916 },
    { key:'parking', label:'駐車場1台分', area:12.5, amount:3750 },
    { key:'oneroom', label:'コンパクトな1K', area:20, amount:6000 },
    { key:'classroom', label:'小学校の教室', area:63, amount:18900 },
    { key:'badminton', label:'バドミントンコート', area:81.74, amount:24522 },
    { key:'tennis', label:'テニスコート1面', area:260.87, amount:78261 },
    { key:'pool', label:'25mプール', area:312.5, amount:93750 }
  ];

  const svgFor = key => {
    switch(key){
      case 'tatami1': return `<svg viewBox="0 0 160 100"><rect x="25" y="18" width="110" height="64" rx="8" class="svg-floor"/><rect x="31" y="24" width="98" height="52" rx="6" fill="none" stroke="rgba(53,35,21,.22)" stroke-width="2"/><line x1="80" y1="24" x2="80" y2="76" class="svg-stroke"/><text x="80" y="90" text-anchor="middle" class="svg-mini">畳1枚</text></svg>`;
      case 'tsubo': return `<svg viewBox="0 0 160 100"><rect x="38" y="14" width="84" height="84" rx="10" class="svg-wall"/><line x1="80" y1="14" x2="80" y2="98" class="svg-stroke"/><line x1="38" y1="56" x2="122" y2="56" class="svg-stroke"/><text x="80" y="92" text-anchor="middle" class="svg-mini">1坪</text></svg>`;
      case 'tatami6': return `<svg viewBox="0 0 160 100"><rect x="18" y="16" width="124" height="68" rx="10" class="svg-wall"/><g fill="#e4d5b7" stroke="rgba(53,35,21,.16)" stroke-width="1.8"><rect x="26" y="24" width="34" height="24" rx="4"/><rect x="63" y="24" width="34" height="24" rx="4"/><rect x="100" y="24" width="34" height="24" rx="4"/><rect x="26" y="52" width="34" height="24" rx="4"/><rect x="63" y="52" width="34" height="24" rx="4"/><rect x="100" y="52" width="34" height="24" rx="4"/></g></svg>`;
      case 'parking': return `<svg viewBox="0 0 160 100"><rect x="18" y="18" width="124" height="64" rx="12" fill="#f8fbf3" stroke="rgba(53,35,21,.18)" stroke-width="2"/><rect x="28" y="24" width="104" height="52" rx="10" fill="none" stroke="#88a867" stroke-width="3" stroke-dasharray="7 6"/><rect x="48" y="40" width="64" height="18" rx="8" fill="#7f8fa8"/><circle cx="60" cy="62" r="6" fill="#435064"/><circle cx="100" cy="62" r="6" fill="#435064"/></svg>`;
      case 'oneroom': return `<svg viewBox="0 0 160 100"><rect x="18" y="14" width="124" height="72" rx="10" class="svg-wall"/><rect x="28" y="24" width="54" height="42" rx="6" fill="#e4d5b7"/><rect x="94" y="24" width="34" height="16" rx="4" fill="#d9aa5b"/><rect x="94" y="46" width="34" height="20" rx="4" fill="#88a867"/><circle cx="122" cy="72" r="8" fill="#c97a72"/></svg>`;
      case 'classroom': return `<svg viewBox="0 0 160 100"><rect x="16" y="14" width="128" height="72" rx="10" class="svg-wall"/><rect x="28" y="22" width="104" height="10" rx="4" fill="#88a867"/><g fill="#e4d5b7" stroke="rgba(53,35,21,.1)" stroke-width="1.2"><rect x="30" y="40" width="22" height="14" rx="3"/><rect x="58" y="40" width="22" height="14" rx="3"/><rect x="86" y="40" width="22" height="14" rx="3"/><rect x="114" y="40" width="22" height="14" rx="3"/><rect x="30" y="60" width="22" height="14" rx="3"/><rect x="58" y="60" width="22" height="14" rx="3"/><rect x="86" y="60" width="22" height="14" rx="3"/><rect x="114" y="60" width="22" height="14" rx="3"/></g></svg>`;
      case 'badminton': return `<svg viewBox="0 0 160 100"><rect x="18" y="12" width="124" height="76" rx="12" class="svg-court"/><rect x="32" y="20" width="96" height="60" fill="none" stroke="#f7fff3" stroke-width="2"/><line x1="80" y1="20" x2="80" y2="80" stroke="#f7fff3" stroke-width="2"/><line x1="32" y1="50" x2="128" y2="50" stroke="#f7fff3" stroke-width="2"/><line x1="48" y1="20" x2="48" y2="80" stroke="#f7fff3" stroke-width="1.5"/><line x1="112" y1="20" x2="112" y2="80" stroke="#f7fff3" stroke-width="1.5"/></svg>`;
      case 'tennis': return `<svg viewBox="0 0 160 100"><rect x="10" y="12" width="140" height="76" rx="12" fill="#7aa0d8"/><rect x="20" y="20" width="120" height="60" fill="none" stroke="#fff" stroke-width="2"/><line x1="80" y1="20" x2="80" y2="80" stroke="#fff" stroke-width="2"/><line x1="20" y1="50" x2="140" y2="50" stroke="#fff" stroke-width="2"/><line x1="50" y1="20" x2="50" y2="80" stroke="#fff" stroke-width="2"/><line x1="110" y1="20" x2="110" y2="80" stroke="#fff" stroke-width="2"/></svg>`;
      case 'pool': return `<svg viewBox="0 0 160 100"><rect x="18" y="12" width="124" height="76" rx="12" class="svg-pool"/><g stroke="#e6f9ff" stroke-width="2"><line x1="34" y1="24" x2="126" y2="24"/><line x1="34" y1="36" x2="126" y2="36"/><line x1="34" y1="48" x2="126" y2="48"/><line x1="34" y1="60" x2="126" y2="60"/><line x1="34" y1="72" x2="126" y2="72"/></g></svg>`;
      default: return '';
    }
  };

  const amountSlider = document.querySelector('#supportAmount');
  const amountText = document.querySelector('#supportAmountText');
  const areaOutput = document.querySelector('#areaOutput');
  const areaContext = document.querySelector('#areaContext');
  const compareFigure = document.querySelector('#compareFigure');
  const liveLabel = document.querySelector('#liveLabel');
  const liveDesc = document.querySelector('#liveDesc');
  const chips = [...document.querySelectorAll('.example-chips button')];

  const formatYen = value => `${Number(value).toLocaleString('ja-JP')}円`;
  const formatArea = area => area < 10 ? `約${area.toFixed(1).replace('.0','')}㎡` : `約${Math.round(area).toLocaleString('ja-JP')}㎡`;
  const closest = area => examples.reduce((a,b)=>Math.abs(b.area-area)<Math.abs(a.area-area)?b:a, examples[0]);

  const update = () => {
    if (!amountSlider) return;
    const value = Number(amountSlider.value);
    const area = value / 300;
    const ex = closest(area);
    amountText.textContent = formatYen(value);
    areaOutput.textContent = formatArea(area);
    areaContext.textContent = `${ex.label}に近い広さ`;
    compareFigure.innerHTML = svgFor(ex.key);
    liveLabel.textContent = ex.label;
    liveDesc.textContent = `約${ex.area.toLocaleString('ja-JP', { maximumFractionDigits: 2 })}㎡ / 支援目安 ${formatYen(ex.amount)}`;
    chips.forEach(chip => chip.classList.toggle('is-active', chip.dataset.example === ex.key));
  };

  if (amountSlider) {
    amountSlider.addEventListener('input', update);
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        amountSlider.value = chip.dataset.yen || '3000';
        update();
      });
    });
    update();
  }
})();
