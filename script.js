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

  // Count-up labels: purely decorative; original numbers remain in the HTML for a safe fallback.
  const countItems = [...document.querySelectorAll("[data-count]")];
  const numberFormatter = new Intl.NumberFormat("ja-JP");
  const animateCount = (element) => {
    const target = Number(element.dataset.count || 0);
    const suffix = element.dataset.suffix || "";
    const duration = 750;
    const started = performance.now();
    const frame = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      element.innerHTML = `${numberFormatter.format(current)}<small>${suffix}</small>`;
      if (progress < 1) window.requestAnimationFrame(frame);
    };
    window.requestAnimationFrame(frame);
  };
  if ("IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.45 });
    countItems.forEach((item) => countObserver.observe(item));
  }

  // A compact "find your role" interaction. It doesn't change navigation or require another form.
  const roleContent = {
    fund: {
      label: "資金で支える",
      title: "土地整備と安全な受入れの、最初の一歩を前へ。",
      text: "協賛金は、必要に応じた重機・整地・草木撤去、安全なイベント準備など、現地の基盤づくりに活かします。"
    },
    skill: {
      label: "技術で支える",
      title: "専門性が、安全な再生のスタートを支えます。",
      text: "重機・運搬・整地などの専門的な力は、現地の状況に応じた安全で確かな土地再生に直結します。"
    },
    goods: {
      label: "モノで支える",
      title: "花苗や備品が、体験を景色へ変えていきます。",
      text: "花苗、道具、安全用品、飲料や備品など、現場で必要なものを通じて参加者の一日を支えられます。"
    },
    people: {
      label: "人で支える",
      title: "社員の皆様の参加が、地域との新しい接点になります。",
      text: "花植え、会場づくり、子どもや地域の方との交流など、社員参加はチームの思い出と地域の力になります。"
    },
    media: {
      label: "発信で支える",
      title: "この変化を伝えることも、能登の未来を育てます。",
      text: "企業のWebサイト・社内報・SNS、メディア取材などを通じて、能登の土地と人の変化をより多くの方へ届けられます。"
    }
  };
  const roleButtons = [...document.querySelectorAll("[data-support-role]")];
  const roleMessage = document.querySelector(".role-message");
  if (roleButtons.length && roleMessage) {
    roleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.supportRole;
        const content = roleContent[key];
        if (!content) return;
        roleButtons.forEach((item) => {
          const selected = item === button;
          item.classList.toggle("is-active", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
        roleMessage.innerHTML = `<span class="role-message-label">${content.label}</span><strong>${content.title}</strong><p>${content.text}</p><a target="_blank" rel="noopener" href="https://forms.gle/BTcMERE34qfghFiV8">この形で相談する <i>→</i></a>`;
      });
    });
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
