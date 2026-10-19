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

const lb = document.getElementById('lightbox');
if (lb) {
  const big = lb.querySelector('img');
  document.querySelectorAll('.gallery .g img').forEach(i => i.addEventListener('click', () => { big.src = i.src; big.alt = i.alt; lb.classList.add('open'); }));
  lb.addEventListener('click', () => lb.classList.remove('open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });
}

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
