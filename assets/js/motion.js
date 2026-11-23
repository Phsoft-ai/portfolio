(() => {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    return;
  }

  const SELECTOR = [
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
    '.project-list > .project-row',
    '.subtask-list > .subtask-row',
    '.spec-grid > .spec-card',
    '.gallery-grid > .gallery-card',
    '.exp-list > .exp-item',
    '.stat-strip > .stat-cell',
    '.flow-steps > .flow-step',
    '.swatch-grid > *',
  ].join(', ');

  // querySelectorAll returns elements in exact top-to-bottom DOM order
  const rawNodes = Array.from(document.querySelectorAll(SELECTOR));
  const targetSet = new Set(rawNodes);

  // Exclude any element nested inside another reveal target
  const targets = rawNodes.filter((el) => {
    let parent = el.parentElement;
    while (parent) {
      if (targetSet.has(parent)) return false;
      parent = parent.parentElement;
    }
    return true;
  });

  if (targets.length === 0) return;

  const indexMap = new Map(targets.map((el, i) => [el, i]));

  // Mark all targets hidden first
  targets.forEach((el) => {
    el.classList.add('reveal');
  });

  // Force synchronous reflow so Safari/Chrome commit the initial hidden state
  void document.documentElement.offsetHeight;

  const observer = new IntersectionObserver(
    (entries) => {
      const entering = entries
        .filter((e) => e.isIntersecting)
        .map((e) => e.target)
        .sort((a, b) => (indexMap.get(a) || 0) - (indexMap.get(b) || 0));

      entering.forEach((el, batchIdx) => {
        el.style.setProperty('--reveal-delay', `${Math.min(batchIdx * 75, 300)}ms`);
        el.classList.add('is-visible');
        observer.unobserve(el);
      });
    },
    {
      threshold: 0.05,
      rootMargin: '0px 0px -28px 0px',
    }
  );

  const vh = window.innerHeight || document.documentElement.clientHeight;
  const aboveFold = [];

  targets.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < vh * 0.96) {
      aboveFold.push(el);
    } else {
      observer.observe(el);
    }
  });

  // Smooth top-to-bottom cascade for everything visible on initial screen
  requestAnimationFrame(() => {
    aboveFold.forEach((el, idx) => {
      el.style.setProperty('--reveal-delay', `${Math.min(idx * 65, 420)}ms`);
      el.classList.add('is-visible');
    });
  });

  // Clean up will-change and reveal delay once animation completes
  document.addEventListener(
    'transitionend',
    (e) => {
      const el = e.target;
      if (el && el.classList && el.classList.contains('is-visible')) {
        el.style.willChange = 'auto';
        el.style.setProperty('--reveal-delay', '0ms');
      }
    },
    { passive: true }
  );
})();
