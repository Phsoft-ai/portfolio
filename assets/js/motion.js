(() => {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    return;
  }

  const SINGLE_SELECTORS = [
    '.cover__title',
    '.cover__subtitle',
    '.profile-meta',
    '.project-hero__title',
    '.project-hero__rule',
    '.project-hero__desc',
    '.project-hero__meta',
    '.link-bar',
    '.hero-frame',
    '.ipad-stage--hero',
    '.subpage-header__eyebrow',
    '.subpage-header__title',
    '.subpage-header__summary',
    '.section__heading',
    '.section__lead',
    '.tech-meta',
    '.table-wrap',
    '.video-frame',
    '.experiments-banner',
    '.page-nav',
  ];

  const GROUP_SELECTORS = [
    '.project-list > .project-row',
    '.subtask-list > .subtask-row',
    '.spec-grid > .spec-card',
    '.gallery-grid > .gallery-card',
    '.exp-list > .exp-item',
    '.stat-strip > .stat-cell',
    '.flow-steps > .flow-step',
    '.swatch-grid > *',
  ];

  const targets = new Set();

  // Add staggered group items first so parent containers stay clean
  GROUP_SELECTORS.forEach((selector) => {
    const items = document.querySelectorAll(selector);
    const byParent = new Map();
    items.forEach((el) => {
      const parent = el.parentElement;
      if (!byParent.has(parent)) byParent.set(parent, []);
      byParent.get(parent).push(el);
    });
    byParent.forEach((group) => {
      group.forEach((el, idx) => {
        el.style.setProperty('--reveal-delay', `${Math.min(idx * 70, 350)}ms`);
        targets.add(el);
      });
    });
  });

  // Add standalone editorial blocks
  SINGLE_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      // Avoid double-animating elements nested inside an already-targeted element
      if (!el.closest('.reveal')) {
        targets.add(el);
      }
    });
  });

  // Apply gentle stagger for hero/cover elements on initial load
  const heroGroup = document.querySelector('.cover, .project-hero, .subpage-header');
  if (heroGroup) {
    let heroIndex = 0;
    heroGroup.querySelectorAll('*').forEach((el) => {
      if (targets.has(el)) {
        el.style.setProperty('--reveal-delay', `${Math.min(heroIndex * 55, 280)}ms`);
        heroIndex += 1;
      }
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.06,
      rootMargin: '0px 0px -32px 0px',
    }
  );

  const inViewNow = [];
  const vh = window.innerHeight || document.documentElement.clientHeight;

  targets.forEach((el) => {
    el.classList.add('reveal');
    const rect = el.getBoundingClientRect();
    if (rect.top < vh * 0.95) {
      inViewNow.push(el);
    } else {
      observer.observe(el);
    }
  });

  // Reveal above-the-fold elements on the next frame for a smooth entry
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      inViewNow.forEach((el) => el.classList.add('is-visible'));
    });
  });

  // Clear will-change after transition finishes to keep compositing lightweight
  document.addEventListener(
    'transitionend',
    (e) => {
      if (e.target && e.target.classList && e.target.classList.contains('is-visible')) {
        e.target.style.willChange = 'auto';
      }
    },
    { passive: true }
  );
})();
