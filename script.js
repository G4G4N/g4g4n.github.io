const revealElements = document.querySelectorAll(".reveal");
const sectionLinks = document.querySelectorAll(".story-link");
const sections = document.querySelectorAll(".section-anchor");
const progressBar = document.getElementById("story-progress-bar");
const chapterCards = document.querySelectorAll(".chapter-card");
const chapterTitle = document.getElementById("chapter-title");
const chapterText = document.getElementById("chapter-text");
const stackTabs = document.querySelectorAll(".stack-tab");
const stackViews = document.querySelectorAll(".stack-view");
const counters = document.querySelectorAll(".impact-value[data-count]");
const quoteRotatorText = document.getElementById("quote-rotator-text");
const quoteDotsContainer = document.querySelector(".quote-dots");
const pointerGlow = document.getElementById("pointer-glow");
const parallaxElements = document.querySelectorAll("[data-parallax]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const quotes = [
  "As long as I'm alive, there are infinite chances.",
  "Cool cool cool. Now show me the audit trail.",
  "Whatever you do in life, it's not legendary unless your people trust it.",
  "No doubt, no doubt, no doubt. Still verify the workflow.",
  "A setback is data, not destiny."
];

if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealElements.forEach(element => revealObserver.observe(element));
} else {
  revealElements.forEach(element => element.classList.add("is-visible"));
}

const setActiveSection = activeId => {
  sectionLinks.forEach(link => {
    link.classList.toggle("is-active", link.dataset.target === activeId);
  });
};

const sectionObserver = new IntersectionObserver(
  entries => {
    const visibleEntry = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visibleEntry) {
      setActiveSection(visibleEntry.target.dataset.section);
    }
  },
  { threshold: [0.3, 0.55, 0.8], rootMargin: "-10% 0px -25% 0px" }
);

sections.forEach(section => sectionObserver.observe(section));

const updateScrollUI = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const percent = maxScroll <= 0 ? 0 : Math.round((window.scrollY / maxScroll) * 100);

  document.body.classList.toggle("is-scrolled", window.scrollY > 12);

  if (progressBar) {
    progressBar.style.height = `${percent}%`;
  }
};

updateScrollUI();
window.addEventListener("scroll", updateScrollUI, { passive: true });

const chapterObserver = new IntersectionObserver(
  entries => {
    const activeEntry = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!activeEntry) {
      return;
    }

    chapterCards.forEach(card => card.classList.toggle("is-current", card === activeEntry.target));

    if (chapterTitle) {
      chapterTitle.textContent = activeEntry.target.dataset.chapterTitle;
    }

    if (chapterText) {
      chapterText.textContent = activeEntry.target.dataset.chapterText;
    }
  },
  { threshold: [0.45, 0.7], rootMargin: "-15% 0px -20% 0px" }
);

chapterCards.forEach(card => chapterObserver.observe(card));

stackTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.stack;

    stackTabs.forEach(item => {
      const isActive = item === tab;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    stackViews.forEach(view => {
      view.classList.toggle("is-active", view.dataset.stackView === target);
    });
  });
});

const animateCounters = () => {
  counters.forEach(counter => {
    const goal = Number(counter.dataset.count);
    const isCompact = counter.textContent.includes("<");

    if (isCompact) {
      return;
    }

    let frame = 0;
    const totalFrames = 42;

    const step = () => {
      frame += 1;
      const value = Math.round((goal * frame) / totalFrames);
      counter.textContent = `${value}${goal >= 6 ? "+" : ""}`;

      if (frame < totalFrames) {
        window.requestAnimationFrame(step);
      }
    };

    step();
  });
};

const counterObserver = new IntersectionObserver(
  entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      animateCounters();
      counterObserver.disconnect();
    }
  },
  { threshold: 0.45 }
);

if (counters.length > 0) {
  counterObserver.observe(counters[0]);
}

if (!prefersReducedMotion) {
  document.querySelectorAll(".tilt-card").forEach(card => {
    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -7;
      const rotateY = ((x / rect.width) - 0.5) * 8;
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

if (quoteRotatorText && quoteDotsContainer) {
  let quoteIndex = 0;
  quoteDotsContainer.innerHTML = quotes
    .map((_, index) => `<span${index === 0 ? ' class="is-active"' : ""}></span>`)
    .join("");
  const quoteDots = quoteDotsContainer.querySelectorAll("span");

  const renderQuote = index => {
    quoteRotatorText.textContent = quotes[index];

    quoteDots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  };

  renderQuote(quoteIndex);

  if (!prefersReducedMotion) {
    window.setInterval(() => {
      quoteIndex = (quoteIndex + 1) % quotes.length;
      renderQuote(quoteIndex);
    }, 3200);
  }
}

if (!prefersReducedMotion) {
  window.addEventListener(
    "pointermove",
    event => {
      if (pointerGlow) {
        pointerGlow.style.left = `${event.clientX}px`;
        pointerGlow.style.top = `${event.clientY}px`;
      }

      parallaxElements.forEach(element => {
        const factor = Number(element.dataset.parallax || 0);
        const x = ((event.clientX / window.innerWidth) - 0.5) * factor;
        const y = ((event.clientY / window.innerHeight) - 0.5) * factor;
        element.style.transform = `translate(${x}px, ${y}px)`;
      });
    },
    { passive: true }
  );
}
