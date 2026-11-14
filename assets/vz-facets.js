// veyroze filter bar: dropdown panels, chip state, auto-apply (desktop), bottom sheet (mobile).
(() => {
  const root = document.querySelector('[data-vz-facets]');
  if (!root) return;

  const closeAll = (except) => {
    root.querySelectorAll('[data-vz-flt].op').forEach((flt) => {
      if (flt === except) return;
      flt.classList.remove('op');
      flt.querySelector('[data-vz-trg]')?.setAttribute('aria-expanded', 'false');
    });
  };

  const apply = (form) => {
    const params = new URLSearchParams();
    new FormData(form).forEach((value, key) => {
      if (value !== '') params.append(key, String(value));
    });
    root.classList.add('vz-loading');
    const query = params.toString();
    window.location.assign(form.action.split('?')[0] + (query ? `?${query}` : ''));
  };

  root.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-vz-trg]');
    if (trigger) {
      const flt = trigger.closest('[data-vz-flt]');
      const open = !flt.classList.contains('op');
      closeAll(flt);
      flt.classList.toggle('op', open);
      trigger.setAttribute('aria-expanded', String(open));
      return;
    }
    const accTrigger = event.target.closest('[data-vz-acc-trg]');
    if (accTrigger) {
      accTrigger.closest('[data-vz-acc]').classList.toggle('op');
      return;
    }
    if (event.target.closest('[data-vz-open]')) {
      root.querySelector('.vz-sheet')?.classList.add('op');
      root.querySelector('.vz-scrim')?.classList.add('op');
      document.body.style.overflow = 'hidden';
      return;
    }
    if (event.target.closest('[data-vz-close]')) {
      root.querySelector('.vz-sheet')?.classList.remove('op');
      root.querySelector('.vz-scrim')?.classList.remove('op');
      document.body.style.overflow = '';
    }
  });

  root.addEventListener('change', (event) => {
    const input = event.target;
    const chip = input.closest('.vz-chip');
    if (chip) chip.classList.toggle('on', input.checked);
    const form = input.closest('[data-vz-form]');
    if (form && !form.hasAttribute('data-vz-manual')) apply(form);
  });

  root.querySelectorAll('[data-vz-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      apply(form);
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-vz-flt]')) closeAll();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAll();
  });
})();
