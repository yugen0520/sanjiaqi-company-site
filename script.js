const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector(".site-nav");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (menuButton && siteNav) {
  const closeMenu = () => {
    siteNav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "打开导航菜单");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "关闭导航菜单" : "打开导航菜单");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
      closeMenu();
      menuButton.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 780) {
      closeMenu();
    }
  });
}

const revealItems = document.querySelectorAll(".reveal");

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const metricValues = document.querySelectorAll(".metric-value[data-count]");

const setMetricValue = (element, value) => {
  const prefix = element.dataset.prefix || "";
  const suffix = element.dataset.suffix || "";
  element.textContent = `${prefix}${value}${suffix}`;
};

const animateMetric = (element) => {
  if (element.dataset.animated === "true") {
    return;
  }

  element.dataset.animated = "true";
  const target = Number(element.dataset.count);

  if (reducedMotion || !Number.isFinite(target)) {
    setMetricValue(element, target);
    return;
  }

  const duration = 1250;
  const startTime = performance.now();
  const completionTimer = window.setTimeout(() => {
    setMetricValue(element, target);
  }, duration + 200);
  setMetricValue(element, 0);

  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    setMetricValue(element, Math.round(target * eased));

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      window.clearTimeout(completionTimer);
    }
  };

  requestAnimationFrame(tick);
};

if (metricValues.length) {
  if (reducedMotion || !("IntersectionObserver" in window)) {
    metricValues.forEach(animateMetric);
  } else {
    const metricObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateMetric(entry.target);
            metricObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.45 },
    );

    metricValues.forEach((metric) => metricObserver.observe(metric));
  }
}

const caseTrack = document.querySelector(".case-track");
const caseButtons = document.querySelectorAll(".case-arrow");

if (caseTrack && caseButtons.length) {
  const updateCaseButtons = () => {
    const maxScroll = Math.max(0, caseTrack.scrollWidth - caseTrack.clientWidth);
    const current = Math.max(0, caseTrack.scrollLeft);
    const tolerance = 4;

    caseButtons.forEach((button) => {
      const direction = Number(button.dataset.direction);
      button.disabled =
        direction < 0 ? current <= tolerance : current >= maxScroll - tolerance;
    });
  };

  const moveCases = (direction) => {
    const distance = Math.max(280, caseTrack.clientWidth * 0.84);
    caseTrack.scrollBy({
      left: direction * distance,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  caseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      moveCases(Number(button.dataset.direction));
    });
  });

  caseTrack.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      moveCases(event.key === "ArrowLeft" ? -1 : 1);
    }
  });

  let updateQueued = false;
  caseTrack.addEventListener("scroll", () => {
    if (!updateQueued) {
      updateQueued = true;
      requestAnimationFrame(() => {
        updateCaseButtons();
        updateQueued = false;
      });
    }
  });

  window.addEventListener("resize", updateCaseButtons);
  updateCaseButtons();
}
