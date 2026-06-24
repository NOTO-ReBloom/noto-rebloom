(() => {
  "use strict";

  // Enable motion effects only when JavaScript has loaded successfully.
  document.documentElement.classList.add("js");

  // Mobile menu
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

  // Reveal animations — all content remains visible if the browser does not support IntersectionObserver.
  const revealItems = [...document.querySelectorAll(".reveal")];

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
})();
