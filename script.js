(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".primary-nav");
  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
    });
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "メニューを開く");
      });
    });
  }

  const progress = document.querySelector(".scroll-progress span");
  let ticking = false;
  const updateProgress = () => {
    if (!progress) return;
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const percent = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
    progress.style.width = `${percent}%`;
  };
  updateProgress();
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateProgress();
      ticking = false;
    });
  }, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });

  const revealItems = [...document.querySelectorAll(".reveal")];
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -32px 0px" });
    revealItems.forEach((item) => observer.observe(item));
  }

  const bloomButton = document.querySelector("[data-bloom]");
  const petalLayer = document.querySelector(".bloom-petals");
  const bloomStatus = document.getElementById("bloom-status");
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (bloomButton && petalLayer) {
    bloomButton.addEventListener("click", () => {
      if (bloomStatus) bloomStatus.textContent = "花びらが咲きました。";
      if (reducedMotion) return;
      const buttonRect = bloomButton.getBoundingClientRect();
      const layerRect = petalLayer.getBoundingClientRect();
      const startX = buttonRect.left - layerRect.left + buttonRect.width / 2;
      const startY = buttonRect.top - layerRect.top + buttonRect.height / 2;
      for (let index = 0; index < 12; index += 1) {
        const petal = document.createElement("span");
        petal.className = "bloom-petal";
        petal.style.left = `${startX}px`;
        petal.style.top = `${startY}px`;
        petal.style.setProperty("--tx", `${Math.round((Math.random() - 0.5) * 260)}px`);
        petal.style.setProperty("--ty", `${Math.round(70 + Math.random() * 160)}px`);
        petal.style.animationDelay = `${index * 0.025}s`;
        petalLayer.appendChild(petal);
        window.setTimeout(() => petal.remove(), 1900);
      }
    });
  }
})();
