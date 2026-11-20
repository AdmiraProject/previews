/* Facturador.com · v1 extras (runs after fx.js). No dependencies. */
(() => {
  const d = document;
  const mqDesk = matchMedia('(min-width:1024px)');
  const mqMob = matchMedia('(max-width:767px)');

  /* YouTube click-to-play facades: [data-yt] card + .yt__play button */
  d.querySelectorAll('.yt[data-yt]').forEach(card => {
    const btn = card.querySelector('.yt__play');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (card.classList.contains('is-on')) return;
      const f = d.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${card.dataset.yt}?autoplay=1&rel=0&modestbranding=1`;
      f.title = btn.getAttribute('aria-label') || 'Video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      card.appendChild(f);
      card.classList.add('is-on');
      const v = card.querySelector('video'); v && v.pause();
    });
  });

  /* Tabs (Emite · Cobra · Declara): CTA follows the active tab; keyboard support */
  d.querySelectorAll('.jobs__grid[data-tabs]').forEach(box => {
    const cta = box.querySelector('.jobs__cta');
    box.addEventListener('tab', e => {
      const v = cta && cta.getAttribute('data-cta-' + e.detail);
      if (!v) return;
      const [href, label] = v.split('|');
      cta.href = href; cta.querySelector('span').textContent = label;
    });
    box.querySelectorAll('[data-tab]').forEach(t => t.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.click(); }
    }));
  });

  /* Hero mock: keep the 1164px desktop composition intact on tablet by zooming it */
  const fits = [...d.querySelectorAll('.hero__mock, .hero__phone')];
  const fit = () => fits.forEach(el => {
    const w = el.parentElement.clientWidth;
    el.style.zoom = (!mqMob.matches && w < 1164) ? (w / 1164).toFixed(4) : '';
  });
  fit(); addEventListener('resize', fit, { passive: true });

  /* Hero composition: aim the scripted cursor at the real field + stamp button; phone view by default on mobile */
  const hx = d.querySelector('.hx');
  if (hx) {
    const win = hx.querySelector('.hx-win'), cur = hx.querySelector('.hx-cur');
    const aim = () => {
      const z = parseFloat(getComputedStyle(hx.closest('.hero__mock')).zoom) || 1;
      const W = win.getBoundingClientRect();
      const rel = (el, fx, fy) => { const r = el.getBoundingClientRect(); return [(r.left - W.left + r.width * fx) / z, (r.top - W.top + r.height * fy) / z]; };
      const [x0, y0] = rel(hx.querySelector('.hx-f--client .hx-in'), .55, .7);
      const [x1, y1] = rel(hx.querySelector('.hx-stamp'), .5, .55);
      [cur, hx.querySelector('.hx-ripple')].forEach(el => { el.style.setProperty('--x0', x0 + 'px'); el.style.setProperty('--y0', y0 + 'px'); el.style.setProperty('--x1', x1 + 'px'); el.style.setProperty('--y1', y1 + 'px'); });
    };
    aim(); addEventListener('resize', aim, { passive: true }); d.fonts && d.fonts.ready.then(aim);
  }
  if (mqMob.matches) { const b = d.querySelector('.dev-switch [data-value="cel"]'); b && b.click(); }


  /* Floating desktop CTA bar + back-to-top */
  const fbar = d.querySelector('.fbar'), top = d.querySelector('.totop');
  const hero = d.querySelector('[data-hero]'), fin = d.querySelector('#precios');
  const onScroll = () => {
    const past = hero ? hero.getBoundingClientRect().bottom < 60 : scrollY > 600;
    const end = fin ? fin.getBoundingClientRect().top < innerHeight - 40 : false;
    fbar && fbar.classList.toggle('on', past && !end);
    top && top.classList.toggle('on', scrollY > innerHeight * 1.2);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  top && top.addEventListener('click', () => scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));

  /* Nav: mega menus aria + close on outside click / Esc / link click; mobile menu closes on in-page links */
  const nav = d.querySelector('[data-nav]');
  if (nav) {
    const megas = [...nav.querySelectorAll('[data-mega]')];
    const sync = () => megas.forEach(m => { const b = m.querySelector('button'); b && b.setAttribute('aria-expanded', m.classList.contains('open')); });
    megas.forEach(m => {
      new MutationObserver(sync).observe(m, { attributes: true, attributeFilter: ['class'] });
      m.querySelector('button').addEventListener('click', () => megas.forEach(o => o !== m && o.classList.remove('open')));
      m.querySelectorAll('.mega a, .mega button').forEach(a => a.addEventListener('click', () => m.classList.remove('open')));
    });
    sync();
    d.addEventListener('click', e => { if (!e.target.closest('[data-mega]')) megas.forEach(m => m.classList.remove('open')); });
    addEventListener('keydown', e => { if (e.key === 'Escape') megas.forEach(m => m.classList.remove('open')); });
    const burger = nav.querySelector('[data-burger]');
    const closeMenu = () => { nav.classList.remove('menu-open'); d.body.style.overflow = ''; burger && burger.setAttribute('aria-expanded', 'false'); };
    nav.querySelectorAll('.mnav a, .mnav [data-activate]').forEach(a => a.addEventListener('click', closeMenu));
    mqDesk.addEventListener('change', e => e.matches && closeMenu());
  }
})();
