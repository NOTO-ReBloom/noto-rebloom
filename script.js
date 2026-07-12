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

  const scaleExamples = [
    { key: 'tatami1', label: '畳1枚', area: 1.62, caption: '寝転がれるくらいの、最小単位の広さ。', amount: 486 },
    { key: 'tsubo', label: '1坪', area: 3.31, caption: '住宅の広さでよく見る、基本の単位。', amount: 993 },
    { key: 'tatami6', label: '6畳の部屋', area: 9.72, caption: '人が立ち止まり、作業や記録ができる広さ。', amount: 2916 },
    { key: 'parking', label: '駐車場1台分', area: 12.5, caption: '車1台がちょうど収まる身近な広さ。', amount: 3750 },
    { key: 'tatami8', label: '8畳の部屋', area: 12.96, caption: '少し広めの居室。使い方が想像しやすい広さ。', amount: 3888 },
    { key: 'oneroom', label: 'コンパクトな1K', area: 20, caption: '一人暮らしの部屋くらいのイメージ。', amount: 6000 },
    { key: 'classroom', label: '小学校の教室', area: 63, caption: '人が集まって作業できる広さが見えてきます。', amount: 18900 },
    { key: 'badminton', label: 'バドミントンコート', area: 81.74, caption: 'コート1面分。区画の大きさが一気に想像しやすくなります。', amount: 24522 },
    { key: 'tennis', label: 'テニスコート1面', area: 260.87, caption: '広い一画を、はっきり“場”として感じられるサイズです。', amount: 78261 },
    { key: 'pool', label: '25mプール', area: 312.5, caption: '学校のプールくらい。まとまった一枚の土地を思い描けます。', amount: 93750 }
  ];

  const svgFor = (key) => {
    switch (key) {
      case 'tatami1':
        return `<svg viewBox="0 0 160 100" aria-hidden="true"><rect x="25" y="18" width="110" height="64" rx="8" class="svg-floor"/><rect x="31" y="24" width="98" height="52" rx="6" fill="none" stroke="rgba(53,35,21,.22)" stroke-width="2"/><line x1="80" y1="24" x2="80" y2="76" class="svg-stroke"/><text x="80" y="90" text-anchor="middle" class="svg-mini">1.62㎡</text></svg>`;
      case 'tsubo':
        return `<svg viewBox="0 0 160 100" aria-hidden="true"><rect x="38" y="14" width="84" height="84" rx="10" class="svg-wall"/><line x1="80" y1="14" x2="80" y2="98" class="svg-stroke"/><line x1="38" y1="56" x2="122" y2="56" class="svg-stroke"/><text x="80" y="92" text-anchor="middle" class="svg-mini">約3.31㎡</text></svg>`;
      case 'tatami6':
        return `<svg viewBox="0 0 160 100" aria-hidden="true"><rect x="18" y="16" width="124" height="68" rx="10" class="svg-wall"/><g fill="#e4d5b7" stroke="rgba(53,35,21,.16)" stroke-width="1.8"><rect x="26" y="24" width="34" height="24" rx="4"/><rect x="63" y="24" width="34" height="24" rx="4"/><rect x="100" y="24" width="34" height="24" rx="4"/><rect x="26" y="52" width="34" height="24" rx="4"/><rect x="63" y="52" width="34" height="24" rx="4"/><rect x="100" y="52" width="34" height="24" rx="4"/></g></svg>`;
      case 'parking':
        return `<svg viewBox="0 0 160 100" aria-hidden="true"><rect x="18" y="18" width="124" height="64" rx="12" fill="#f8fbf3" stroke="rgba(53,35,21,.18)" stroke-width="2"/><rect x="28" y="24" width="104" height="52" rx="10" fill="none" stroke="#88a867" stroke-width="3" stroke-dasharray="7 6"/><rect x="48" y="40" width="64" height="18" rx="8" fill="#7f8fa8"/><circle cx="60" cy="62" r="6" fill="#435064"/><circle cx="100" cy="62" r="6" fill="#435064"/></svg>`;
      case 'tatami8':
        return `<svg viewBox="0 0 160 100" aria-hidden="true"><rect x="14" y="16" width="132" height="68" rx="10" class="svg-wall"/><g fill="#e4d5b7" stroke="rgba(53,35,21,.16)" stroke-width="1.5"><rect x="22" y="24" width="28" height="24" rx="4"/><rect x="54" y="24" width="28" height="24" rx="4"/><rect x="86" y="24" width="28" height="24" rx="4"/><rect x="118" y="24" width="20" height="24" rx="4"/><rect x="22" y="52" width="28" height="24" rx="4"/><rect x="54" y="52" width="28" height="24" rx="4"/><rect x="86" y="52" width="28" height="24" rx="4"/><rect x="118" y="52" width="20" height="24" rx="4"/></g></svg>`;
      case 'oneroom':
        return `<svg viewBox="0 0 160 100" aria-hidden="true"><rect x="18" y="14" width="124" height="72" rx="10" class="svg-wall"/><rect x="28" y="24" width="54" height="42" rx="6" fill="#e4d5b7"/><rect x="94" y="24" width="34" height="16" rx="4" fill="#d9aa5b"/><rect x="94" y="46" width="34" height="20" rx="4" fill="#88a867"/><circle cx="122" cy="72" r="8" fill="#c97a72"/></svg>`;
      case 'classroom':
        return `<svg viewBox="0 0 160 100" aria-hidden="true"><rect x="16" y="14" width="128" height="72" rx="10" class="svg-wall"/><rect x="28" y="22" width="104" height="10" rx="4" fill="#88a867"/><g fill="#e4d5b7" stroke="rgba(53,35,21,.1)" stroke-width="1.2"><rect x="30" y="40" width="22" height="14" rx="3"/><rect x="58" y="40" width="22" height="14" rx="3"/><rect x="86" y="40" width="22" height="14" rx="3"/><rect x="114" y="40" width="22" height="14" rx="3"/><rect x="30" y="60" width="22" height="14" rx="3"/><rect x="58" y="60" width="22" height="14" rx="3"/><rect x="86" y="60" width="22" height="14" rx="3"/><rect x="114" y="60" width="22" height="14" rx="3"/></g></svg>`;
      case 'badminton':
        return `<svg viewBox="0 0 160 100" aria-hidden="true"><rect x="18" y="12" width="124" height="76" rx="12" class="svg-court"/><rect x="32" y="20" width="96" height="60" fill="none" stroke="#f7fff3" stroke-width="2"/><line x1="80" y1="20" x2="80" y2="80" stroke="#f7fff3" stroke-width="2"/><line x1="32" y1="50" x2="128" y2="50" stroke="#f7fff3" stroke-width="2"/><line x1="48" y1="20" x2="48" y2="80" stroke="#f7fff3" stroke-width="1.5"/><line x1="112" y1="20" x2="112" y2="80" stroke="#f7fff3" stroke-width="1.5"/></svg>`;
      case 'tennis':
        return `<svg viewBox="0 0 160 100" aria-hidden="true"><rect x="10" y="12" width="140" height="76" rx="12" fill="#7aa0d8"/><rect x="20" y="20" width="120" height="60" fill="none" stroke="#fff" stroke-width="2"/><line x1="80" y1="20" x2="80" y2="80" stroke="#fff" stroke-width="2"/><line x1="20" y1="50" x2="140" y2="50" stroke="#fff" stroke-width="2"/><line x1="50" y1="20" x2="50" y2="80" stroke="#fff" stroke-width="2"/><line x1="110" y1="20" x2="110" y2="80" stroke="#fff" stroke-width="2"/></svg>`;
      case 'pool':
        return `<svg viewBox="0 0 160 100" aria-hidden="true"><rect x="18" y="12" width="124" height="76" rx="12" class="svg-pool"/><g stroke="#e6f9ff" stroke-width="2"><line x1="34" y1="24" x2="126" y2="24"/><line x1="34" y1="36" x2="126" y2="36"/><line x1="34" y1="48" x2="126" y2="48"/><line x1="34" y1="60" x2="126" y2="60"/><line x1="34" y1="72" x2="126" y2="72"/></g><g fill="#fff"><circle cx="30" cy="24" r="3"/><circle cx="30" cy="36" r="3"/><circle cx="30" cy="48" r="3"/><circle cx="30" cy="60" r="3"/><circle cx="30" cy="72" r="3"/></g></svg>`;
      default:
        return '';
    }
  };

  const amountSlider = document.querySelector('#supportAmount');
  const amountText = document.querySelector('#supportAmountText');
  const areaOutput = document.querySelector('#areaOutput');
  const areaContext = document.querySelector('#areaContext');
  const compareFigure = document.querySelector('#compareFigure');
  const liveLabel = document.querySelector('#liveLabel');
  const liveDesc = document.querySelector('#liveDesc');
  const stageArea = document.querySelector('#stageArea');
  const stageHint = document.querySelector('#stageHint');
  const scaleCards = Array.from(document.querySelectorAll('.js-scale-item'));

  scaleCards.forEach((card) => {
    const key = card.dataset.example;
    const figure = card.querySelector('.example-figure');
    if (figure) figure.innerHTML = svgFor(key);
  });

  const formatYen = (value) => `${Number(value).toLocaleString('ja-JP')}円`;
  const formatArea = (area) => area < 10 ? `約${area.toFixed(1).replace('.0', '')}㎡` : `約${Math.round(area).toLocaleString('ja-JP')}㎡`;
  const closestExample = (area) => scaleExamples.reduce((prev, current) => Math.abs(current.area - area) < Math.abs(prev.area - area) ? current : prev, scaleExamples[0]);
  const contextForArea = (example) => `${example.label}に近い広さ`;
  const updateActiveCard = (key) => {
    scaleCards.forEach((card) => card.classList.toggle('is-active', card.dataset.example === key));
  };

  const updateCalculator = () => {
    if (!amountSlider || !amountText || !areaOutput) return;
    const value = Number(amountSlider.value);
    const area = value / 300;
    const example = closestExample(area);
    amountText.textContent = formatYen(value);
    areaOutput.textContent = formatArea(area);
    if (areaContext) areaContext.textContent = contextForArea(example);
    if (compareFigure) compareFigure.innerHTML = svgFor(example.key);
    if (liveLabel) liveLabel.textContent = example.label;
    if (liveDesc) liveDesc.textContent = `約${example.area.toLocaleString('ja-JP', { maximumFractionDigits: 2 })}㎡ / 支援目安 ${formatYen(example.amount)}`;
    if (stageArea) stageArea.textContent = formatArea(area);
    if (stageHint) stageHint.textContent = `${example.label}に近い広さ`;
    updateActiveCard(example.key);
  };
  if (amountSlider) {
    amountSlider.addEventListener('input', updateCalculator);
    updateCalculator();
  }

  scaleCards.forEach((card) => {
    card.addEventListener('click', () => {
      if (!amountSlider) return;
      const amount = Number(card.dataset.yen || 0);
      amountSlider.value = String(Math.round(amount / 100) * 100);
      updateCalculator();
      amountSlider.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    card.addEventListener('keypress', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        card.click();
      }
    });
  });

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
