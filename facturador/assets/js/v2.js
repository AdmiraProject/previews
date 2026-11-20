/* Facturador.com — v2 extras: sticky-nav morph, promo close, button text-roll,
   YouTube facades/lightbox, review carousel, mega-menu a11y. Depends on nothing. */
(() => {
  const d = document;

  /* nav: morph to the light bar only once it actually sticks */
  const hdr = d.querySelector('.hdr'), sent = d.querySelector('[data-stick-sentinel]');
  if (hdr && sent) {
    const setTop = () => hdr.style.setProperty('--mnav-top', Math.round(hdr.getBoundingClientRect().bottom) + 'px');
    new IntersectionObserver(([e]) => { hdr.classList.toggle('is-stuck', !e.isIntersecting && e.boundingClientRect.top < 0); setTop(); }, { threshold: 0 }).observe(sent);
    addEventListener('resize', setTop, { passive: true });
    hdr.querySelector('[data-burger]')?.addEventListener('click', setTop);
    // close mobile menu after following an in-page link
    hdr.querySelectorAll('.mnav a').forEach(a => a.addEventListener('click', () => {
      if (hdr.classList.contains('menu-open')) hdr.querySelector('[data-burger]').click();
    }));
    // mega menus: aria + close on outside click / Escape
    const megas = [...hdr.querySelectorAll('[data-mega]')];
    const sync = () => megas.forEach(m => m.querySelector('button').setAttribute('aria-expanded', m.classList.contains('open')));
    megas.forEach(m => {
      new MutationObserver(sync).observe(m, { attributes: true, attributeFilter: ['class'] });
      m.querySelector('button').addEventListener('click', () => megas.forEach(o => o !== m && o.classList.remove('open')));
    });
    d.addEventListener('click', e => { if (!e.target.closest('[data-mega]')) megas.forEach(m => m.classList.remove('open')); });
    addEventListener('keydown', e => { if (e.key === 'Escape') megas.forEach(m => m.classList.remove('open')); });
    // the mega cards hold a lazily loaded video
    megas.forEach(m => m.addEventListener('mouseenter', () => m.querySelectorAll('video[data-src]').forEach(v => { if (!v.src) { v.src = v.dataset.src; v.play().catch(() => {}); } }), { once: true }));
  }

  /* video budget: only loops that are on screen (and not in a hidden persona/tab) play */
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const vv = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting && v.offsetParent) v.play().catch(() => {}); else v.pause();
    }), { rootMargin: '120px' });
    d.querySelectorAll('.media video').forEach(v => vv.observe(v));
  }

  /* promo bar close */
  d.querySelector('[data-promo-close]')?.addEventListener('click', () => d.querySelector('[data-promo]').classList.add('is-gone'));

  /* button text-roll: label rendered twice, rolls on hover */
  d.querySelectorAll('.btn').forEach(b => {
    const t = [...b.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
    if (!t || b.querySelector('.roll')) return;
    const label = t.textContent.trim(), s = d.createElement('span'), i = d.createElement('span');
    s.className = 'roll'; s.dataset.t = label; i.textContent = label; s.append(i);
    b.replaceChild(s, t);
    if (!b.getAttribute('aria-label') && b.querySelector('svg')) b.querySelectorAll('svg').forEach(v => v.setAttribute('aria-hidden', 'true'));
  });

  /* YouTube: inline facade + lightbox */
  const yt = id => `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="YouTube" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  d.querySelectorAll('[data-yt-inline]').forEach(btn => btn.addEventListener('click', () => {
    const box = d.createElement('div'); box.className = 'yt-facade'; box.innerHTML = yt(btn.dataset.ytInline);
    btn.replaceWith(box);
  }, { once: true }));
  const lb = d.querySelector('[data-ytbox]');
  if (lb) {
    const frame = lb.querySelector('[data-ytframe]'); let last;
    const close = () => { frame.innerHTML = ''; lb.hidden = true; d.body.style.overflow = ''; last && last.focus(); };
    d.querySelectorAll('[data-yt]').forEach(b => b.addEventListener('click', () => {
      last = b; frame.innerHTML = yt(b.dataset.yt); lb.hidden = false; d.body.style.overflow = 'hidden';
      lb.querySelector('.ytbox__x').focus();
    }));
    lb.querySelectorAll('[data-ytclose]').forEach(b => b.addEventListener('click', close));
    addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) close(); });
  }

  /* activation: carry the step-1 email into step 2 (shared modal leaves it blank) */
  const e1 = d.getElementById('act-email'), e2 = d.getElementById('act-email2');
  d.querySelector('#activate [data-next]')?.addEventListener('click', () => { if (e1 && e2 && !e2.value) e2.value = e1.value; });

  /* reviews carousel arrows */
  const track = d.querySelector('[data-rv-track]');
  d.querySelectorAll('[data-rv]').forEach(b => b.addEventListener('click', () => {
    const card = track.firstElementChild, step = card ? card.getBoundingClientRect().width + 20 : 360;
    track.scrollBy({ left: +b.dataset.rv * step, behavior: 'smooth' });
  }));
})();
