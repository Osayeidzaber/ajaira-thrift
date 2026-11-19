/*
  Size diagram for the "Find your size" dialog (sections/vz-product.liquid).
  Reads the size chart table already in the dialog, draws the right garment
  (jacket / pants / vest, from data-garment) and puts each measurement on it.
  Size buttons switch the numbers. No data is hard-coded: everything comes from
  the chart rows the owner typed.
*/
(() => {
  const NS = 'http://www.w3.org/2000/svg';

  // Garment outlines (viewBox 0 0 240 260) and where each measurement sits.
  const GARMENTS = {
    jacket: {
      body: 'M88 28 L120 40 L152 28 L186 44 L214 150 L192 156 L170 92 L170 226 L70 226 L70 92 L48 156 L26 150 L54 44 Z',
      extra: ['M120 40 L120 226', 'M88 28 L104 58 L120 40 L136 58 L152 28'],
      lines: {
        shoulder: { x1: 56, y1: 44, x2: 184, y2: 44, lx: 120, ly: 22 },
        chest: { x1: 70, y1: 104, x2: 170, y2: 104, lx: 120, ly: 98 },
        waist: { x1: 70, y1: 182, x2: 170, y2: 182, lx: 120, ly: 176 },
        length: { x1: 228, y1: 30, x2: 228, y2: 226, lx: 232, ly: 130, side: 'right' },
        sleeve: { x1: 186, y1: 44, x2: 214, y2: 150, lx: 204, ly: 170 },
        hem: { x1: 70, y1: 238, x2: 170, y2: 238, lx: 120, ly: 252 },
      },
    },
    vest: {
      body: 'M88 28 L120 40 L152 28 L168 40 L166 84 L174 96 L174 226 L66 226 L66 96 L74 84 L72 40 Z',
      extra: ['M120 40 L120 226', 'M88 28 L104 58 L120 40 L136 58 L152 28'],
      lines: {
        shoulder: { x1: 72, y1: 40, x2: 168, y2: 40, lx: 120, ly: 20 },
        chest: { x1: 66, y1: 108, x2: 174, y2: 108, lx: 120, ly: 102 },
        waist: { x1: 66, y1: 182, x2: 174, y2: 182, lx: 120, ly: 176 },
        length: { x1: 210, y1: 30, x2: 210, y2: 226, lx: 214, ly: 130, side: 'right' },
        hem: { x1: 66, y1: 238, x2: 174, y2: 238, lx: 120, ly: 252 },
      },
    },
    pants: {
      body: 'M72 22 L168 22 L176 238 L132 238 L120 96 L108 238 L64 238 Z',
      extra: ['M72 34 L168 34', 'M120 34 L120 96'],
      lines: {
        waist: { x1: 72, y1: 14, x2: 168, y2: 14, lx: 120, ly: 9 },
        hip: { x1: 70, y1: 60, x2: 170, y2: 60, lx: 120, ly: 55 },
        rise: { x1: 120, y1: 34, x2: 120, y2: 96, lx: 125, ly: 86, side: 'right' },
        thigh: { x1: 67, y1: 112, x2: 117, y2: 112, lx: 92, ly: 106 },
        inseam: { x1: 124, y1: 98, x2: 132, y2: 238, lx: 138, ly: 170, side: 'right' },
        length: { x1: 200, y1: 22, x2: 200, y2: 238, lx: 204, ly: 130, side: 'right' },
        hem: { x1: 132, y1: 248, x2: 176, y2: 248, lx: 154, ly: 258 },
      },
    },
  };

  // Which column header means which line on the drawing.
  const KEYS = [
    ['shoulder', /shoulder/],
    ['chest', /chest|pit|bust|p2p/],
    ['sleeve', /sleeve|arm/],
    ['waist', /waist/],
    ['hip', /hip|seat/],
    ['rise', /rise/],
    ['thigh', /thigh/],
    ['inseam', /inseam|inside leg/],
    ['hem', /hem|leg open|opening|bottom/],
    ['length', /length|long/],
  ];

  const readTable = (table) => {
    const headRows = [...table.querySelectorAll('thead tr')];
    let headers;
    if (headRows.length === 2) {
      // default chart: Size | <measure> (unit a, unit b)
      const top = [...headRows[0].children].map((c) => c.textContent.trim());
      const units = [...headRows[1].children].map((c) => c.textContent.trim());
      headers = [top[0], ...units.map((u) => `${top[1]} (${u})`)];
    } else if (headRows.length === 1) {
      headers = [...headRows[0].children].map((c) => c.textContent.trim());
    } else return null;
    const rows = [...table.querySelectorAll('tbody tr')].map((tr) => [...tr.children].map((c) => c.textContent.trim()));
    return rows.length ? { headers, rows } : null;
  };

  // First column per measurement wins (so "Chest (in)" beats "Chest (cm)").
  const mapColumns = (headers, garment) => {
    const used = {};
    headers.forEach((h, i) => {
      if (i === 0) return;
      const lower = h.toLowerCase();
      for (const [key, re] of KEYS) {
        if (re.test(lower) && GARMENTS[garment].lines[key] && used[key] === undefined) {
          used[key] = i;
          break;
        }
      }
    });
    return used;
  };

  const el = (name, attrs, text) => {
    const n = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    if (text != null) n.textContent = text;
    return n;
  };

  // Source unit of a column: 'in', 'cm' or '' (not a length)
  const unitOf = (header) => {
    const h = header.toLowerCase();
    if (/\(\s*(in|inch|inches|")\s*\)|\binch/.test(h)) return 'in';
    if (/\(\s*cm\s*\)|\bcm\b/.test(h)) return 'cm';
    return '';
  };
  const round = (n) => String(Math.round(n * 2) / 2).replace(/\.0$/, '');
  // Convert every number in a value like "36-38" or "22.5"
  const convert = (value, from, to) => {
    if (!from || from === to) return value;
    const f = from === 'in' ? 2.54 : 1 / 2.54;
    return value.replace(/\d+(?:\.\d+)?/g, (n) => round(parseFloat(n) * f));
  };
  const suffix = (unit) => (unit === 'in' ? '"' : unit === 'cm' ? ' cm' : '');

  const build = (dialog) => {
    if (dialog.dataset.sgDiagram) return;
    const table = dialog.querySelector('.vz-sg__table');
    const mount = dialog.querySelector('[data-sg-diagram]');
    if (!table || !mount) return;
    const data = readTable(table);
    const garment = GARMENTS[dialog.dataset.garment] ? dialog.dataset.garment : 'jacket';
    if (!data) return;
    const cols = mapColumns(data.headers, garment);
    if (!Object.keys(cols).length) return;
    dialog.dataset.sgDiagram = '1';

    const g = GARMENTS[garment];
    const svg = el('svg', { viewBox: '0 0 240 262', class: 'vz-sgd__svg', role: 'img', 'aria-label': `${garment} measurements` });
    svg.append(el('path', { d: g.body, class: 'vz-sgd__body' }));
    g.extra.forEach((d) => svg.append(el('path', { d, class: 'vz-sgd__seam' })));
    const labels = {};
    Object.entries(cols).forEach(([key]) => {
      const L = g.lines[key];
      svg.append(el('line', { x1: L.x1, y1: L.y1, x2: L.x2, y2: L.y2, class: 'vz-sgd__dim', 'marker-start': 'url(#vzArrow)', 'marker-end': 'url(#vzArrow)' }));
      const anchor = L.side === 'right' ? 'start' : L.side === 'left' ? 'end' : 'middle';
      const t = el('text', { x: L.lx, y: L.ly, 'text-anchor': anchor, class: 'vz-sgd__val' });
      svg.append(t);
      labels[key] = t;
    });
    const defs = el('defs', {});
    const marker = el('marker', { id: 'vzArrow', viewBox: '0 0 10 10', refX: '5', refY: '5', markerWidth: '5', markerHeight: '5', orient: 'auto-start-reverse' });
    marker.append(el('path', { d: 'M0 1 L9 5 L0 9 z', class: 'vz-sgd__arrow' }));
    defs.append(marker);
    svg.prepend(defs);

    const legend = document.createElement('dl');
    legend.className = 'vz-sgd__legend';
    const legendVals = {};
    Object.entries(cols).forEach(([key, i]) => {
      const dt = document.createElement('dt');
      dt.textContent = data.headers[i].replace(/\s*\([^)]*\)\s*/, '');
      const dd = document.createElement('dd');
      legend.append(dt, dd);
      legendVals[key] = dd;
    });

    const chips = document.createElement('div');
    chips.className = 'vz-sgd__sizes';
    chips.setAttribute('role', 'group');
    chips.setAttribute('aria-label', data.headers[0] || 'Size');

    const units = data.headers.map(unitOf);
    const hasUnits = units.some(Boolean);
    let unit = units.find(Boolean) || 'in';
    let current = 0;

    // Table: remember originals, rewrite in the chosen unit. Skip when the
    // chart already has the same measurement in both units (default chart).
    const bothUnits = units.includes('in') && units.includes('cm');
    const bodyRows = [...table.querySelectorAll('tbody tr')];
    const headCells = table.querySelectorAll('thead tr').length === 1 ? [...table.querySelectorAll('thead th')] : [];
    const syncTable = () => {
      if (bothUnits) return;
      headCells.forEach((th, i) => {
        if (!units[i]) return;
        th.dataset.orig = th.dataset.orig || th.textContent;
        th.textContent = th.dataset.orig.replace(/\(\s*(in|inch|inches|cm|")\s*\)/i, `(${unit})`);
      });
      bodyRows.forEach((tr, r) => {
        [...tr.children].forEach((cell, i) => {
          if (!units[i]) return;
          cell.textContent = convert(data.rows[r][i], units[i], unit);
        });
      });
    };

    const show = (r) => {
      current = r;
      const row = data.rows[r];
      Object.entries(cols).forEach(([key, i]) => {
        const raw = row[i] || '–';
        const v = units[i] ? convert(raw, units[i], unit) : raw;
        const sx = units[i] ? suffix(unit) : '';
        labels[key].textContent = unit === 'cm' && units[i] ? v : v + sx;
        legendVals[key].textContent = v + sx;
      });
      chips.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-pressed', String(j === r)));
    };

    const toggle = document.createElement('div');
    toggle.className = 'vz-sgd__units';
    toggle.setAttribute('role', 'group');
    toggle.setAttribute('aria-label', 'Units');
    ['in', 'cm'].forEach((u) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'vz-sgd__unit';
      b.textContent = u;
      b.setAttribute('aria-pressed', String(u === unit));
      b.addEventListener('click', () => {
        unit = u;
        try { localStorage.setItem('vzUnit', u); } catch (e) { /* private mode */ }
        toggle.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        syncTable();
        show(current);
      });
      toggle.append(b);
    });
    try {
      const saved = localStorage.getItem('vzUnit');
      if (saved === 'in' || saved === 'cm') {
        unit = saved;
        toggle.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x.textContent === unit)));
      }
    } catch (e) { /* private mode */ }

    data.rows.forEach((row, r) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'vz-sgd__size';
      b.textContent = row[0];
      b.addEventListener('click', () => show(r));
      chips.append(b);
    });

    const wrap = document.createElement('div');
    wrap.className = 'vz-sgd';
    const fig = document.createElement('div');
    fig.className = 'vz-sgd__fig';
    fig.append(svg);
    const side = document.createElement('div');
    side.className = 'vz-sgd__side';
    if (hasUnits) side.append(toggle);
    side.append(chips, legend);
    wrap.append(fig, side);
    mount.append(wrap);

    // start on the middle size so the drawing reads well
    syncTable();
    show(Math.floor((data.rows.length - 1) / 2));
  };

  document.addEventListener('click', (e) => {
    const open = e.target.closest('[data-sg-open]');
    if (!open) return;
    const dlg = document.getElementById(open.dataset.sgOpen);
    if (dlg) build(dlg);
  });
  window.vzBuildSizeDiagram = build;
})();
