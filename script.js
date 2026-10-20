const menuBtn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');
if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => { const o = menu.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', o); });
  menu.addEventListener('click', e => { if (e.target.tagName === 'A') menu.classList.remove('open'); });
}
const yr = document.getElementById('year'); if (yr) yr.textContent = new Date().getFullYear();

document.querySelectorAll('.tab[data-filter]').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab[data-filter]').forEach(t => t.classList.toggle('on', t === tab));
  const f = tab.dataset.filter;
  document.querySelectorAll('.product').forEach(p => { p.hidden = f !== 'all' && p.dataset.cat !== f; });
}));


const form = document.getElementById('contact-form');
if (form) {
  const item = new URLSearchParams(location.search).get('item');
  if (item) {
    const sel = form.interest;
    const map = { Partnership: 'Partnership' };
    const m = map[item] || ['Vegetables','Field crops','Chicks','Incubation services'].find(o => item.toLowerCase().includes(o.toLowerCase().split(' ')[0]));
    if (m) sel.value = m;
    form.message.value = 'Hello, I would like to enquire about: ' + item + '.';
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    const note = document.getElementById('form-note');
    if (!form.name.value.trim() || !form.contact.value.trim()) { note.style.color = '#b3261e'; note.textContent = 'Please enter your name and a phone number or email.'; return; }
    const text = 'Hello Abiti Smart Farm, my name is ' + form.name.value.trim() + ' (' + form.contact.value.trim() + '). I am interested in: ' + form.interest.value + '. ' + form.message.value.trim();
    window.open('https://wa.me/265991295046?text=' + encodeURIComponent(text), '_blank', 'noopener');
    note.style.color = ''; note.textContent = 'Opening WhatsApp with your message.';
  });
}

// Gallery filters and lightbox with previous/next
const gal = [...document.querySelectorAll('.gallery .g')];
document.querySelectorAll('[data-gfilter]').forEach(c => c.addEventListener('click', () => {
  document.querySelectorAll('[data-gfilter]').forEach(x => x.classList.toggle('on', x === c));
  const f = c.dataset.gfilter; gal.forEach(g => { g.hidden = f !== 'all' && g.dataset.g !== f; });
}));
const lb = document.getElementById('lightbox');
if (lb) {
  const big = lb.querySelector('img'), cap = lb.querySelector('.lb-cap'); let idx = 0;
  const vis = () => gal.filter(g => !g.hidden);
  const show = i => { const v = vis(); idx = (i + v.length) % v.length; const im = v[idx].querySelector('img'); big.src = im.src; big.alt = im.alt; cap.textContent = im.alt; lb.classList.add('open'); };
  gal.forEach(g => g.addEventListener('click', () => show(vis().indexOf(g))));
  lb.querySelector('.prev').addEventListener('click', e => { e.stopPropagation(); show(idx - 1); });
  lb.querySelector('.next').addEventListener('click', e => { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener('click', () => lb.classList.remove('open'));
  document.addEventListener('keydown', e => { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') lb.classList.remove('open'); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
}

// Elastic gallery
document.querySelectorAll('#elastic .el').forEach((el, _, all) => {
  const on = () => all.forEach(x => x.classList.toggle('on', x === el));
  el.addEventListener('mouseenter', on); el.addEventListener('focus', on); el.addEventListener('click', on);
});

// Count-up numbers
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; cio.unobserve(en.target);
    const end = +en.target.dataset.count, t0 = performance.now();
    const step = t => { const p = Math.min(1, (t - t0) / 1200); en.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  counters.forEach(c => cio.observe(c));
}

// Parallax for collage cards
const par = document.querySelectorAll('[data-speed]');
if (par.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let queued = false;
  const upd = () => { par.forEach(p => p.style.setProperty('--py', (scrollY * p.dataset.speed) + 'px')); queued = false; };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(upd); } }, { passive: true });
}
