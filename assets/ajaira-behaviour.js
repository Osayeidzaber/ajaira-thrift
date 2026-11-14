// Global storefront behaviour, driven by Theme settings → "Ajaira behaviour".
// Settings arrive as data attributes on <html> (see layout/theme.liquid).
(() => {
  const root = document.documentElement;
  const cfg = root.dataset;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scrollable overlays keep their own native scrolling.
  const NESTED = [
    '[data-lenis-prevent]',
    'cart-drawer', '.drawer', '.menu-drawer', '.vz-sheet', '.vz-pan',
    '.product-popup-modal', 'modal-dialog', '.predictive-search', 'details[open] > .header__submenu',
    '[role="dialog"]', '[aria-modal="true"]', '.aj-rail__track', '.aj-reviews__scroller', '.slider',
  ].join(',');

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  const startSmooth = () => {
    if (cfg.smoothScroll !== 'true' || reduceMotion || typeof window.Lenis !== 'function') return;
    if (window.Shopify && window.Shopify.designMode) return; // keep the theme editor predictable
    const intensity = Number(cfg.smoothScrollIntensity || 5); // 1 (subtle) – 10 (floaty)
    lenis = new window.Lenis({
      lerp: 0.16 - intensity * 0.012,
      smoothWheel: true,
      wheelMultiplier: 1,
      anchors: { offset: -Number(cfg.anchorOffset || 90) },
      prevent: (node) => node instanceof Element && !!node.closest(NESTED),
    });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    window.ajairaLenis = lenis;

    // Pause page scrolling while an overlay locks the body.
    const sync = () => {
      const locked =
        document.body.classList.contains('overflow-hidden') ||
        document.body.classList.contains('overflow-hidden-mobile') ||
        document.body.classList.contains('overflow-hidden-tablet') ||
        document.body.style.overflow === 'hidden';
      locked ? lenis.stop() : lenis.start();
    };
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] });
  };

  /* ---------- Back to top ---------- */
  const startBackToTop = () => {
    const button = document.querySelector('[data-back-to-top]');
    if (!button) return;
    const threshold = () => window.innerHeight * 1.2;
    const update = () => button.classList.toggle('is-visible', window.scrollY > threshold());
    window.addEventListener('scroll', update, { passive: true });
    update();
    button.addEventListener('click', () => {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  };

  /* ---------- Image fade-in ---------- */
  const startImageFade = () => {
    if (cfg.imageFade !== 'true' || reduceMotion) return;
    const mark = (img) => {
      if (img.dataset.ajFade) return;
      img.dataset.ajFade = '1';
      if (img.complete && img.naturalWidth) return;
      img.classList.add('aj-fade');
      img.addEventListener('load', () => img.classList.add('aj-fade--in'), { once: true });
      img.addEventListener('error', () => img.classList.add('aj-fade--in'), { once: true });
    };
    document.querySelectorAll('main img').forEach(mark);
    new MutationObserver((records) => {
      records.forEach((r) => r.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        if (n.tagName === 'IMG') mark(n);
        n.querySelectorAll && n.querySelectorAll('img').forEach(mark);
      }));
    }).observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
  };

  /* ---------- Hover-open dropdowns ---------- */
  const startHoverMenus = () => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('[data-hover-menu] header-menu > details').forEach((details) => {
      let timer = null;
      const item = details.closest('li') || details;
      item.addEventListener('mouseenter', () => {
        clearTimeout(timer);
        document.querySelectorAll('[data-hover-menu] header-menu > details[open]').forEach((d) => { if (d !== details) d.removeAttribute('open'); });
        details.setAttribute('open', '');
        details.querySelector('summary')?.setAttribute('aria-expanded', 'true');
      });
      item.addEventListener('mouseleave', () => {
        timer = setTimeout(() => {
          details.removeAttribute('open');
          details.querySelector('summary')?.setAttribute('aria-expanded', 'false');
        }, 180);
      });
    });
  };

  const init = () => {
    startHoverMenus();
    startSmooth();
    startBackToTop();
    startImageFade();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
