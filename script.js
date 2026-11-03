/* Abiti Sustainable Smart Farm: site behaviour. Accessibility notes are in comments where they matter. */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Mobile menu ---------- */
const menuBtn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');
const setMenu = (open, returnFocus) => {
  if (!menu || !menuBtn) return;
  menu.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  if (!open && returnFocus) menuBtn.focus();
};
if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false, true);
  });
  document.addEventListener('click', e => {
    if (menu.classList.contains('open') && !menu.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
  });
  matchMedia('(min-width: 1181px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
}

/* Glass nav gains a stronger shadow once the page scrolls */
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

const yr = document.getElementById('year'); if (yr) yr.textContent = new Date().getFullYear();

/* ---------- Live region for filter results ---------- */
let liveRegion;
const announce = msg => {
  if (!liveRegion) {
    liveRegion = document.createElement('p');
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('role', 'status');
    document.body.appendChild(liveRegion);
  }
  liveRegion.textContent = '';
  setTimeout(() => { liveRegion.textContent = msg; }, 50);
};
const plural = (n, word) => n + ' ' + word + (n === 1 ? '' : 's');

/* ---------- Product filters (buttons expose their pressed state) ---------- */
const prodTabs = document.querySelectorAll('.tab[data-filter]');
prodTabs.forEach(t => t.setAttribute('aria-pressed', String(t.classList.contains('on'))));
prodTabs.forEach(tab => tab.addEventListener('click', () => {
  prodTabs.forEach(t => { t.classList.toggle('on', t === tab); t.setAttribute('aria-pressed', String(t === tab)); });
  const f = tab.dataset.filter;
  let shown = 0;
  document.querySelectorAll('.product').forEach(p => { const hide = f !== 'all' && p.dataset.cat !== f; p.hidden = hide; if (!hide) shown++; });
  announce('Showing ' + plural(shown, 'item') + ': ' + tab.textContent.trim());
}));

/* ---------- Contact form ---------- */
const form = document.getElementById('contact-form');
if (form) {
  const $ = id => document.getElementById(id);
  const nameEl = $('f-name'), contactEl = $('f-contact'), interestEl = $('f-interest'), msgEl = $('f-msg');
  const note = $('form-note'), summary = $('error-summary'), list = $('error-list');
  const NOTE_DEFAULT = note.textContent;

  // Prefill from ?item=Carrots etc. Order matters: the first match wins.
  const item = new URLSearchParams(location.search).get('item');
  if (item) {
    const rules = [
      [/quot|supply|bulk/i, 'Supply quotation'], [/partner/i, 'Partnership'],
      [/chick|chicken|poultry/i, 'Local chickens and chicks'], [/incubat/i, 'Incubation services'],
      [/fish/i, 'Fish'], [/pig/i, 'Pigs'],
      [/maize|sweet potato|bean|groundnut|\bpeas?\b|carrot|tomato|cabbage|beetroot|leafy|pepper|onion|vegetable|crop/i, 'Vegetables and crops']
    ];
    const hit = rules.find(([re]) => re.test(item));
    if (hit) interestEl.value = hit[1];
    msgEl.value = item === 'Partnership'
      ? 'Hello, we would like to talk about a partnership.'
      : /quot|supply|bulk/i.test(item)
        ? 'Hello, we would like a supply quotation. Products, quantities and how often we need them: '
        : 'Hello, I would like to enquire about: ' + item + '.';
  }

  const checks = {
    'f-name': {
      el: nameEl, err: $('f-name-err'),
      label: 'Enter your name',
      ok: v => v.trim().length >= 2
    },
    'f-contact': {
      el: contactEl, err: $('f-contact-err'),
      label: 'Enter a phone number or an email address we can reply to',
      detail: 'Enter a phone number, for example 0991 234 567, or an email address, for example name@example.com.',
      ok: v => {
        const t = v.trim();
        if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return true;
        const digits = t.replace(/[\s\-().]/g, '').replace(/^\+/, '');
        return /^\d{7,15}$/.test(digits);
      }
    }
  };

  const setError = (c, msg) => {
    if (msg) { c.err.textContent = msg; c.err.hidden = false; c.el.setAttribute('aria-invalid', 'true'); }
    else { c.err.textContent = ''; c.err.hidden = true; c.el.removeAttribute('aria-invalid'); }
  };
  const fieldMsg = (c, id) => {
    if (!c.el.value.trim()) return id === 'f-name' ? 'Enter your name.' : 'Enter a phone number or an email address.';
    return c.detail || 'Enter your full name.';
  };
  const validate = id => {
    const c = checks[id];
    const good = c.ok(c.el.value);
    setError(c, good ? '' : fieldMsg(c, id));
    return good;
  };

  // Inline feedback: check a field when the visitor leaves it, and clear the error as soon as it is fixed
  Object.keys(checks).forEach(id => {
    const c = checks[id];
    c.el.addEventListener('blur', () => { if (c.el.value.trim() || c.el.hasAttribute('aria-invalid')) validate(id); });
    c.el.addEventListener('input', () => { if (c.el.hasAttribute('aria-invalid') && c.ok(c.el.value)) { setError(c, ''); refreshSummary(); } });
  });

  const refreshSummary = () => {
    list.textContent = '';
    Object.keys(checks).forEach(id => {
      const c = checks[id];
      if (!c.el.hasAttribute('aria-invalid')) return;
      const li = document.createElement('li'), a = document.createElement('a');
      a.href = '#' + id; a.textContent = c.label;
      a.addEventListener('click', e => { e.preventDefault(); c.el.focus(); });
      li.appendChild(a); list.appendChild(li);
    });
    summary.hidden = !list.children.length;
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    const results = Object.keys(checks).map(validate);
    refreshSummary();
    if (results.includes(false)) {
      note.className = 'form-note err';
      note.textContent = 'Your message has not been sent. Please fix the highlighted fields.';
      summary.focus();                      // one focus move per failed submit, onto the linked error list
      return;
    }
    const text = 'Hello Abiti Sustainable Smart Farm, my name is ' + nameEl.value.trim() + ' (' + contactEl.value.trim() + '). I am interested in: ' + interestEl.value + '. ' + msgEl.value.trim();
    const url = 'https://wa.me/265991295046?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener');
    // window.open can be blocked, so always offer a link as a fallback
    note.className = 'form-note ok';
    note.textContent = 'WhatsApp should open with your message ready. If it did not, ';
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'tap here to open it';
    const hidden = document.createElement('span'); hidden.className = 'sr-only'; hidden.textContent = ' (opens in a new tab)';
    note.append(a, hidden, '.');
  });
  form.addEventListener('input', () => { if (note.classList.contains('ok')) { note.className = 'form-note'; note.textContent = NOTE_DEFAULT; } });
}

/* ---------- Gallery: filters + keyboard-accessible photo viewer ---------- */
const gal = [...document.querySelectorAll('.gallery .g')];
const galTabs = document.querySelectorAll('[data-gfilter]');
galTabs.forEach(c => c.setAttribute('aria-pressed', String(c.classList.contains('on'))));
galTabs.forEach(c => c.addEventListener('click', () => {
  galTabs.forEach(x => { x.classList.toggle('on', x === c); x.setAttribute('aria-pressed', String(x === c)); });
  const f = c.dataset.gfilter; let shown = 0;
  gal.forEach(g => { const hide = f !== 'all' && g.dataset.g !== f; g.hidden = hide; if (!hide) shown++; });
  announce('Showing ' + plural(shown, 'photo') + ': ' + c.textContent.trim());
}));

const lb = document.getElementById('lightbox');
if (lb) {
  const big = lb.querySelector('img'), cap = lb.querySelector('.lb-cap');
  const closeBtn = lb.querySelector('.lb-close'), prevBtn = lb.querySelector('.prev'), nextBtn = lb.querySelector('.next');
  let idx = 0, opener = null;
  const vis = () => gal.filter(g => !g.hidden);

  // Each photo becomes a real, focusable button for keyboard and screen reader users
  gal.forEach(g => {
    const text = g.querySelector('figcaption').textContent.trim();
    g.tabIndex = 0; g.setAttribute('role', 'button');
    g.setAttribute('aria-label', 'View larger: ' + text);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); g.click(); } });
  });

  const show = i => {
    const v = vis(); if (!v.length) return;
    idx = (i + v.length) % v.length;
    const im = v[idx].querySelector('img'), text = v[idx].querySelector('figcaption').textContent.trim();
    big.src = im.currentSrc || im.src; big.alt = text;
    cap.textContent = text + ' (' + (idx + 1) + ' of ' + v.length + ')';
  };
  const open = g => {
    opener = g; show(vis().indexOf(g));
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };
  const close = () => {
    lb.classList.remove('open'); document.body.style.overflow = '';
    if (opener) opener.focus();
  };
  gal.forEach(g => g.addEventListener('click', () => open(g)));
  prevBtn.addEventListener('click', e => { e.stopPropagation(); show(idx - 1); });
  nextBtn.addEventListener('click', e => { e.stopPropagation(); show(idx + 1); });
  closeBtn.addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'Tab') {                  // keep focus inside the dialog while it is open
      const f = [closeBtn, prevBtn, nextBtn];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!lb.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }
  });

  // Swipe left or right in the viewer (buttons remain for everyone else)
  let x0 = null;
  lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) (dx < 0 ? nextBtn : prevBtn).click();
  });
}

/* ---------- Elastic "walk through the farm" ---------- */
document.querySelectorAll('#elastic .el').forEach((el, _, all) => {
  const on = () => all.forEach(x => { x.classList.toggle('on', x === el); x.setAttribute('aria-expanded', String(x === el)); });
  el.setAttribute('aria-expanded', String(el.classList.contains('on')));
  el.addEventListener('mouseenter', on); el.addEventListener('focus', on); el.addEventListener('click', on);
});

/* ---------- Count-up numbers (markup already holds the real value) ---------- */
const counters = document.querySelectorAll('[data-count]');
if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
  counters.forEach(c => { c.textContent = '0'; });
  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; cio.unobserve(en.target);
    const end = +en.target.dataset.count, t0 = performance.now();
    const step = t => { const p = Math.min(1, (t - t0) / 1200); en.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  counters.forEach(c => cio.observe(c));
}

/* ---------- Parallax for collage cards ---------- */
const par = document.querySelectorAll('[data-speed]');
if (par.length && !reduceMotion) {
  let queued = false;
  const upd = () => { par.forEach(p => p.style.setProperty('--py', (scrollY * p.dataset.speed) + 'px')); queued = false; };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(upd); } }, { passive: true });
}

/* ---------- Staggered reveal for card grids ----------
   Each card is watched on its own, so a tall grid on a short screen can never stay hidden.
   Cards that enter the screen together are staggered; later ones animate as they arrive. */
const groups = document.querySelectorAll('.products, .bento, .fbento, .values, .pcards');
if (groups.length && !reduceMotion && 'IntersectionObserver' in window) {
  const sio = new IntersectionObserver(entries => {
    const batch = entries.filter(en => en.isIntersecting)
      .sort((a, b) => (a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1);
    batch.forEach((en, k) => {
      en.target.style.setProperty('--i', Math.min(k, 6));
      en.target.classList.add('in');
      sio.unobserve(en.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  groups.forEach(g => { g.classList.add('stagger'); [...g.children].forEach(c => sio.observe(c)); });
}

/* ---------- Ticker: moving content needs a way to pause it (WCAG 2.2.2) ---------- */
const ticker = document.querySelector('.marquee');
if (ticker && !reduceMotion) {
  const wrap = document.createElement('div'); wrap.className = 'marquee-wrap';
  ticker.parentNode.insertBefore(wrap, ticker); wrap.appendChild(ticker);
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'marquee-toggle';
  const PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12" rx="1"/><rect x="9.5" y="2" width="3.5" height="12" rx="1"/></svg>';
  const PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.2v11.6a.6.6 0 0 0 .9.5l9-5.8a.6.6 0 0 0 0-1L4.9 1.7a.6.6 0 0 0-.9.5z"/></svg>';
  const paint = paused => { btn.innerHTML = paused ? PLAY : PAUSE; btn.setAttribute('aria-label', paused ? 'Play animations' : 'Pause animations'); };
  paint(false);
  btn.addEventListener('click', () => { const p = document.documentElement.classList.toggle('motion-paused'); paint(p); });
  wrap.appendChild(btn);
}

/* ---------- Abiti Integrated Farm Ecosystem ----------
   One list of activities and links draws the diagram on every page that has [data-eco].
   Following the owner's brief, every link is a proposed or developing practice, never a fully
   operational process, and each activity carries its real status. Edit the lists below to update both pages. */
const ECO_STATUS = {
  ok: { label: 'Operational', badge: 'green' },
  est: { label: 'Setup established', badge: '' },
  wip: { label: 'Work in progress', badge: 'wip' },
  dev: { label: 'Developing practice', badge: 'dev' }
};
const ECO_ICON = {
  azolla: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20v-9"/><path d="M12 15c-2.8 0-4.6-1.8-4.6-4.6 2.8 0 4.6 1.8 4.6 4.6z"/><path d="M12 12.6c2.8 0 4.6-1.8 4.6-4.6-2.8 0-4.6 1.8-4.6 4.6z"/><path d="M12 9c-1.6 0-2.6-1-2.6-2.6 1.6 0 2.6 1 2.6 2.6z"/><path d="M3.5 20.5c1.4-1 2.8-1 4.2 0s2.8 1 4.3 0 2.8-1 4.2 0 2.9 1 4.3 0"/></svg>',
  waste: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 0 1-13.7 5.7"/><path d="M4 12a8 8 0 0 1 13.7-5.7"/><path d="M17.9 2.6v3.9H14"/><path d="M6.1 21.4v-3.9H10"/><path d="M12 15.5c-1.9 0-3-1.2-3-3 1.9 0 3 1.1 3 3zm0 0c1.9 0 3-1.2 3-3-1.9 0-3 1.1-3 3z"/></svg>'
};
// Listed clockwise from the top of the ring; this order keeps most links short.
const ECO_NODES = [
  { id: 'crops', name: 'Vegetables & crops', full: 'Vegetable and crop production', st: 'ok', img: 'images/leafy-greens.jpg',
    text: 'Tomatoes, cabbages, carrots, beetroot, onions, green peppers, leafy vegetables, maize, beans and other seasonal crops.' },
  { id: 'bsf', name: 'Black Soldier Fly', full: 'Black Soldier Fly (BSF) farming', st: 'est', img: 'images/bsf-larvae.jpg',
    text: 'Our BSF setup is established. BSF larvae can convert suitable organic material into useful agricultural resources.' },
  { id: 'fish', name: 'Fish farming', full: 'Fish farming and aquaculture', st: 'ok', img: 'images/fish-ponds.jpg',
    text: 'Fish ponds that form part of our integrated system, with plans to develop our aquaculture further.' },
  { id: 'azolla', name: 'Azolla', full: 'Azolla cultivation', st: 'wip', icon: 'azolla',
    text: 'A fast-growing aquatic fern we are developing as a potential supplementary feed and a way to recycle nutrients.' },
  { id: 'chickens', name: 'Local chickens', full: 'Local chicken farming', st: 'ok', img: 'images/chicks.jpg', pos: '12% 45%',
    text: 'Local chickens, chicks and incubation services that contribute to food production and household livelihoods.' },
  { id: 'pigs', name: 'Pig farming', full: 'Pig farming', st: 'ok', img: 'images/pigs.jpg',
    text: 'Pigs raised as part of our diversified, integrated farming enterprise.' },
  { id: 'waste', name: 'Organic recycling', full: 'Organic waste management and nutrient recycling', st: 'dev', icon: 'waste',
    text: 'Managing suitable crop residues and manure so that nutrients can be reused rather than wasted.' }
];
const ECO_LINKS = [
  ['crops', 'waste', 'Suitable crop residues and vegetable waste can be collected for recycling.'],
  ['pigs', 'waste', 'Pig manure can be managed as an organic resource.'],
  ['chickens', 'waste', 'Poultry manure can be managed as an organic resource.'],
  ['waste', 'bsf', 'Suitable organic by-products can be used to feed BSF larvae.'],
  ['waste', 'crops', 'Composted organic matter is being explored for soil fertility.'],
  ['bsf', 'fish', 'BSF larvae are being explored as a supplementary protein ingredient in fish feed.'],
  ['bsf', 'chickens', 'BSF larvae are being explored as a supplementary poultry feed.'],
  ['bsf', 'pigs', 'BSF larvae are being explored as a supplementary pig feed ingredient.'],
  ['bsf', 'crops', 'BSF frass is being explored as a soil amendment.'],
  ['azolla', 'fish', 'Azolla is being explored as a supplementary fish feed.'],
  ['azolla', 'chickens', 'Azolla is being explored as a supplementary poultry feed.'],
  ['azolla', 'pigs', 'Azolla is being explored as a supplementary livestock feed.']
];

document.querySelectorAll('[data-eco]').forEach((host, k) => {
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const CX = 50, CY = 51, R = 33, NR = 8;   // viewBox units; each node is 16% of the map wide
  const byId = {};
  ECO_NODES.forEach((n, i) => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / ECO_NODES.length;
    byId[n.id] = { ...n, x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
  });

  // A curve bowed toward the centre and nudged to one side, so two-way links never overlap
  const curve = (a, b) => {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    const cx = mx + (CX - mx) * .42 - dy / len * 3.2, cy = my + (CY - my) * .42 + dx / len * 3.2;
    const trim = (p, gap) => { const vx = cx - p.x, vy = cy - p.y, l = Math.hypot(vx, vy); return (p.x + vx / l * gap).toFixed(2) + ' ' + (p.y + vy / l * gap).toFixed(2); };
    return 'M' + trim(a, NR + 1) + ' Q' + cx.toFixed(2) + ' ' + cy.toFixed(2) + ' ' + trim(b, NR + 2.4);
  };
  const arrow = (id, fill) => '<marker id="' + id + '" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="' + fill + '"/></marker>';
  const ARR = 'eco-arr-' + k, ARR_ON = 'eco-arr-on-' + k, PANEL = 'eco-panel-' + k;

  const svg = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs>' + arrow(ARR, 'rgba(198,227,90,.85)') + arrow(ARR_ON, '#e3a72f') + '</defs>' +
    '<circle class="eco-ring" cx="' + CX + '" cy="' + CY + '" r="' + R + '"/>' +
    ECO_LINKS.map(([f, t]) => '<path class="eco-edge" data-from="' + f + '" data-to="' + t + '" d="' + curve(byId[f], byId[t]) + '" marker-end="url(#' + ARR + ')"/>').join('') + '</svg>';

  const nodes = Object.values(byId).map(n => {
    const chip = n.st === 'ok' ? '' : '<span class="eco-chip">' + ECO_STATUS[n.st].label + '</span>';
    const face = n.img ? '<img src="' + n.img + '" alt="" loading="lazy"' + (n.pos ? ' style="object-position:' + n.pos + '"' : '') + '>' : ECO_ICON[n.icon];
    // labels sit on the outer side of the ring, away from where the arrows arrive
    const up = n.y < CY - 1;
    return '<button type="button" class="eco-node ' + n.st + (up ? ' up' : '') + '" data-id="' + n.id + '" aria-pressed="false" aria-controls="' + PANEL + '" style="--x:' + n.x.toFixed(2) + '%;--y:' + n.y.toFixed(2) + '%">' +
      '<span class="eco-dot">' + face + '</span><span class="eco-name">' + esc(n.name) + chip + '</span></button>';
  }).join('');

  const count = st => ECO_NODES.filter(n => n.st === st).length;
  const legend = '<ul class="eco-legend"><li><i></i>Operational activity</li><li><i class="est"></i>Setup established</li><li><i class="wip"></i>Work in progress</li><li><i class="dev"></i>Developing practice</li><li><i class="line"></i>Proposed or developing connection</li></ul>' +
    '<p class="eco-note">The arrows show how resources could be reused across the farm. They are proposed or developing practices, not processes that are already fully operational.</p>';

  host.innerHTML = '<div class="eco"><div class="eco-map">' + svg + nodes + '</div><div class="eco-panel" id="' + PANEL + '" aria-live="polite"></div></div>' + legend;

  const eco = host.querySelector('.eco'), panel = host.querySelector('.eco-panel');
  const edges = [...host.querySelectorAll('.eco-edge')], btns = [...host.querySelectorAll('.eco-node')];
  const item = (who, text) => '<li><b>' + esc(who) + '</b>' + esc(text) + '</li>';

  const select = id => {
    const n = id && byId[id];
    eco.classList.toggle('has-sel', !!n);
    btns.forEach(b => b.setAttribute('aria-pressed', String(!!n && b.dataset.id === id)));
    edges.forEach(e => {
      const on = !!n && (e.dataset.from === id || e.dataset.to === id);
      e.classList.toggle('on', on);
      e.setAttribute('marker-end', 'url(#' + (on ? ARR_ON : ARR) + ')');
    });
    if (!n) {
      panel.innerHTML = '<span class="badge">How it fits together</span><h3>Resources reused, not wasted</h3>' +
        '<p>Our crop, fish, pig and local chicken enterprises are operational. We are linking them through Black Soldier Fly farming, Azolla cultivation and organic recycling, so that by-products from one activity can become inputs for another.</p>' +
        '<p>Select an activity to see how it connects.</p>' +
        '<ul class="eco-counts"><li><b>' + count('ok') + '</b>operational enterprises</li><li><b>' + count('est') + '</b>setup established</li><li><b>' + count('wip') + '</b>work in progress</li><li><b>' + ECO_LINKS.length + '</b>proposed connections</li></ul>';
      return;
    }
    const s = ECO_STATUS[n.st];
    const out = ECO_LINKS.filter(l => l[0] === id).map(l => item('To ' + byId[l[1]].name, l[2])).join('');
    const inc = ECO_LINKS.filter(l => l[1] === id).map(l => item('From ' + byId[l[0]].name, l[2])).join('');
    panel.innerHTML = '<span class="badge ' + s.badge + '">' + s.label + '</span><h3>' + esc(n.full) + '</h3><p>' + esc(n.text) + '</p>' +
      (out ? '<h4>Can supply</h4><ul class="eco-links">' + out + '</ul>' : '') +
      (inc ? '<h4>Can receive</h4><ul class="eco-links">' + inc + '</ul>' : '') +
      '<button type="button" class="btn btn-ghost btn-sm eco-reset">Show all connections</button>';
    panel.querySelector('.eco-reset').addEventListener('click', () => {
      const b = btns.find(x => x.dataset.id === id); select(null); if (b) b.focus();
    });
  };

  btns.forEach(b => b.addEventListener('click', () => select(b.getAttribute('aria-pressed') === 'true' ? null : b.dataset.id)));
  select(null);
});
