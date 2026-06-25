(() => {
  "use strict";
  document.documentElement.classList.add("js");

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".primary-nav");
  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    });
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    }));
  }

  const progress = document.querySelector(".scroll-progress span");
  let ticking = false;
  const updateProgress = () => {
    if (!progress) return;
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    progress.style.width = `${Math.min(100, Math.max(0, window.scrollY / max * 100))}%`;
  };
  updateProgress();
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateProgress(); ticking = false; });
  }, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });

  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealItems = [...document.querySelectorAll(".reveal")];
  if (!("IntersectionObserver" in window) || reduced) revealItems.forEach((item) => item.classList.add("is-visible"));
  else {
    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); current.unobserve(entry.target); } });
    }, { threshold: .08, rootMargin: "0px 0px -26px 0px" });
    revealItems.forEach((item) => observer.observe(item));
  }

  const charts = [...document.querySelectorAll(".chart-card")];
  if (!("IntersectionObserver" in window) || reduced) charts.forEach((item) => item.classList.add("is-chart-ready"));
  else {
    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-chart-ready"); current.unobserve(entry.target); } });
    }, { threshold: .25 });
    charts.forEach((item) => observer.observe(item));
  }

  const counts = [...document.querySelectorAll("[data-count]")];
  const animateCount = (el) => {
    const target = Number(el.dataset.count || 0);
    const decimal = Number(el.dataset.decimal || 0);
    const suffix = el.dataset.suffix || "";
    const start = performance.now();
    const duration = 850;
    const step = (now) => {
      const ratio = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - ratio, 3);
      const n = target * eased;
      const text = decimal ? n.toFixed(decimal) : Math.round(n).toLocaleString("ja-JP");
      el.innerHTML = `${text}<small>${suffix}</small>`;
      if (ratio < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && !reduced) {
    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { animateCount(entry.target); current.unobserve(entry.target); } });
    }, { threshold: .5 });
    counts.forEach((item) => observer.observe(item));
  }

  const links = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
  const sections = links.map((link) => ({ link, section: document.querySelector(link.getAttribute("href")) })).filter((item) => item.section);
  if (sections.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!active) return;
      const current = sections.find((item) => item.section === active.target);
      links.forEach((link) => link.classList.toggle("is-current", current && current.link === link));
    }, { rootMargin: "-20% 0px -66% 0px", threshold: [.01,.18,.4] });
    sections.forEach((item) => observer.observe(item.section));
  }

  const roles = {
    fund: ["資金で支える","土地整備と安全な受入れの、最初の一歩を前へ。","協賛金は、必要に応じた重機・整地・草木撤去、安全なイベント準備など、現地の基盤づくりに活かします。"],
    skill: ["技術で支える","専門性が、安全な再生のスタートを支えます。","重機・運搬・整地などの専門的な力は、現地の状況に応じた安全で確かな土地再生に直結します。"],
    goods: ["モノで支える","種や備品が、体験を景色へ変えていきます。","種、道具、安全用品、飲料や備品など、現場で必要なものを通じて参加者の一日を支えられます。"],
    people: ["人で支える","社員の皆様の参加が、地域との新しい接点になります。","種まき、会場づくり、子どもや地域の方との交流など、社員参加はチームの思い出と地域の力になります。"],
    media: ["発信で支える","この変化を伝えることも、能登の未来を育てます。","企業のWebサイト・社内報・SNS、メディア取材などを通じて、能登の土地と人の変化をより多くの方へ届けられます。"]
  };
  const roleButtons = [...document.querySelectorAll("[data-support-role]")];
  const roleMessage = document.querySelector(".role-message");
  roleButtons.forEach((button) => button.addEventListener("click", () => {
    const content = roles[button.dataset.supportRole];
    if (!content || !roleMessage) return;
    roleButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    roleMessage.innerHTML = `<span>${content[0]}</span><strong>${content[1]}</strong><p>${content[2]}</p><a target="_blank" rel="noopener" href="https://forms.gle/BTcMERE34qfghFiV8">この形で相談する →</a>`;
  }));

  const bloomButton = document.querySelector("[data-bloom]");
  const petalLayer = document.querySelector(".bloom-petals");
  const status = document.getElementById("bloom-status");
  if (bloomButton && petalLayer) bloomButton.addEventListener("click", () => {
    if (status) status.textContent = "花びらが咲きました。";
    if (reduced) return;
    const button = bloomButton.getBoundingClientRect();
    const layer = petalLayer.getBoundingClientRect();
    for (let i = 0; i < 13; i += 1) {
      const petal = document.createElement("span");
      petal.className = "bloom-petal";
      petal.style.left = `${button.left - layer.left + button.width / 2}px`;
      petal.style.top = `${button.top - layer.top + button.height / 2}px`;
      petal.style.setProperty("--tx", `${Math.round((Math.random() - .5) * 260)}px`);
      petal.style.setProperty("--ty", `${Math.round(60 + Math.random() * 170)}px`);
      petal.style.animationDelay = `${i * .028}s`;
      petalLayer.appendChild(petal);
      setTimeout(() => petal.remove(), 2000);
    }
  });
})();
