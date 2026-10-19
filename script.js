const menuBtn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');
if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
}

const yr = document.getElementById('year');
if (yr) yr.textContent = new Date().getFullYear();

// Scroll reveal
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Product filter
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t === tab));
    const f = tab.dataset.filter;
    document.querySelectorAll('.product').forEach(p => { p.hidden = f !== 'all' && p.dataset.cat !== f; });
  });
});

// Gallery lightbox
const lb = document.getElementById('lightbox');
if (lb) {
  const big = lb.querySelector('img');
  document.querySelectorAll('.gallery .g img').forEach(img => {
    img.addEventListener('click', () => { big.src = img.src; big.alt = img.alt; lb.classList.add('open'); });
  });
  lb.addEventListener('click', () => lb.classList.remove('open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });
}

// Contact form (frontend only, no backend yet)
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const note = document.getElementById('form-note');
    if (!form.name.value.trim() || !form.contact.value.trim()) {
      note.style.color = '#b3261e';
      note.textContent = 'Please enter your name and a phone number or email.';
      return;
    }
    note.style.color = '';
    note.textContent = 'Thank you! This is a preview, so the message has not been sent anywhere yet.';
    form.reset();
  });
}
