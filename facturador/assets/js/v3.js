/* Facturador.com · v3 page behaviour (curved media ring, swipe rows, showreel,
   word reveal, inverted mobile bar, lazy heavy video, YouTube facade).
   Loaded after fx.js; no dependencies. */
(() => {
  const d = document, RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mqDesk = matchMedia('(min-width:1024px)');

  /* ---------- 1. curved auto-scrolling media ring ---------- */
  const ring = d.querySelector('[data-ring]');
  if (ring) {
    const cards = [...ring.querySelectorAll('.ring__card')];
    ring.classList.add('ring--js');
    let W = 0, cw = 0, pitch = 0, total = 0, off = 0, last = 0, visible = true, raf;
    const measure = () => {
      W = ring.clientWidth;
      cw = cards[0].offsetWidth;
      const gap = parseFloat(getComputedStyle(ring).getPropertyValue('--gap')) || parseFloat(getComputedStyle(ring.querySelector('.ring__track')).columnGap) || 32;
      pitch = cw + gap; total = pitch * cards.length;
    };
    const place = () => {
      const half = W / 2;
      cards.forEach((c, i) => {
        // wrap each card into [-pitch, total - pitch)
        let x = ((i * pitch - off) % total + total) % total - pitch;
        const cx = x + cw / 2, n = Math.max(-1.25, Math.min(1.25, (cx - half) / half));
        const a = Math.abs(n);
        const rot = -n * 16, s = 1 + a * a * 0.11;
        c.style.transform = `translate3d(${x}px,0,0) perspective(1100px) rotateY(${rot.toFixed(2)}deg) scale(${s.toFixed(3)})`;
        c.classList.toggle('is-in', a < 0.78);
      });
    };
    const speed = () => (W < 768 ? 26 : 38); // px per second
    const tick = now => {
      const dt = Math.min(64, now - (last || now)); last = now;
      if (visible && !RM && !d.hidden) { off += speed() * dt / 1000; place(); }
      raf = requestAnimationFrame(tick);
    };
    measure(); place();
    addEventListener('resize', () => { measure(); place(); }, { passive: true });
    new IntersectionObserver(es => es.forEach(e => visible = e.isIntersecting)).observe(ring);
    raf = requestAnimationFrame(tick);
  }

  /* ---------- 2. heavy videos: load after the page settles / near viewport ---------- */
  const lazies = [...d.querySelectorAll('video[data-lazy]')];
  const arm = v => {
    if (v.src) return;
    v.src = v.dataset.lazy; v.muted = true;
    if (!RM) v.play().catch(() => {});
  };
  if (lazies.length && !RM) {
    const lio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { arm(e.target); lio.unobserve(e.target); }
    }), { rootMargin: '300px' });
    const start = () => setTimeout(() => lazies.forEach(v => lio.observe(v)), 1200);
    if (d.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
  }

  /* ---------- 3. swipe rows (mobile trios) ---------- */
  d.querySelectorAll('[data-swipe]').forEach(track => {
    const nav = track.nextElementSibling && track.nextElementSibling.classList.contains('swipe-nav') ? track.nextElementSibling : null;
    if (!nav) return;
    const prev = nav.querySelector('[data-swipe-prev]'), next = nav.querySelector('[data-swipe-next]');
    nav.removeAttribute('aria-hidden');
    const step = () => (track.firstElementChild ? track.firstElementChild.offsetWidth + 12 : 300);
    const upd = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft >= max;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: RM ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: RM ? 'auto' : 'smooth' }));
    track.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  });

  /* ---------- 4. testimonial showreel ---------- */
  const reel = d.querySelector('[data-reel-track]');
  if (reel) {
    const items = [...reel.children];
    const prev = d.querySelector('[data-reel-prev]'), next = d.querySelector('[data-reel-next]');
    let active = 0;
    const centerOf = el => el.offsetLeft + el.offsetWidth / 2;
    const go = i => {
      i = Math.max(0, Math.min(items.length - 1, i));
      const left = centerOf(items[i]) - reel.clientWidth / 2;
      reel.scrollTo({ left, behavior: RM ? 'auto' : 'smooth' });
    };
    const upd = () => {
      const mid = reel.scrollLeft + reel.clientWidth / 2;
      let best = 0, bd = Infinity;
      items.forEach((el, k) => { const dd = Math.abs(centerOf(el) - mid); if (dd < bd) { bd = dd; best = k; } });
      active = best;
      items.forEach((el, k) => el.classList.toggle('is-active', k === best));
      prev.disabled = best === 0; next.disabled = best === items.length - 1;
    };
    prev.addEventListener('click', () => go(active - 1));
    next.addEventListener('click', () => go(active + 1));
    reel.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); } });
    let t; reel.addEventListener('scroll', () => { cancelAnimationFrame(t); t = requestAnimationFrame(upd); }, { passive: true });
    addEventListener('resize', upd, { passive: true });
    upd();
  }

  /* ---------- 5. word-by-word reveal on AI tab descriptions ---------- */
  d.querySelectorAll('[data-words]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const s = d.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i); s.textContent = w;
      el.append(s, ' ');
    });
  });

  /* ---------- 6. header: hide on scroll down (mobile) + mega a11y ---------- */
  const hdr = d.querySelector('[data-nav]');
  if (hdr) {
    let lastY = scrollY;
    addEventListener('scroll', () => {
      const y = scrollY;
      if (!mqDesk.matches && !hdr.classList.contains('menu-open')) hdr.classList.toggle('hdr--hide', y > lastY && y > 320);
      lastY = y;
    }, { passive: true });
    hdr.querySelectorAll('[data-mega]').forEach(item => {
      const btn = item.querySelector('button');
      const sync = () => btn.setAttribute('aria-expanded', item.classList.contains('open'));
      new MutationObserver(sync).observe(item, { attributes: true, attributeFilter: ['class'] });
      item.querySelectorAll('.mega a').forEach(a => a.addEventListener('click', () => item.classList.remove('open')));
    });
    addEventListener('keydown', e => { if (e.key === 'Escape') hdr.querySelectorAll('[data-mega].open').forEach(i => i.classList.remove('open')); });
    d.addEventListener('click', e => { if (!e.target.closest('[data-mega]')) hdr.querySelectorAll('[data-mega].open').forEach(i => i.classList.remove('open')); });
    hdr.querySelectorAll('.mnav a').forEach(a => a.addEventListener('click', () => {
      hdr.classList.remove('menu-open'); d.body.style.overflow = '';
      const b = hdr.querySelector('[data-burger]'); b && b.setAttribute('aria-expanded', false);
    }));
  }

  /* ---------- 7. mobile sticky bar inverts with the section under it ---------- */
  const mbar = d.querySelector('.mbar');
  if (mbar) {
    const themed = [...d.querySelectorAll('[data-nav-theme]')];
    const upd = () => {
      const y = innerHeight - 36;
      let theme = 'light';
      for (const s of themed) { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) { theme = s.dataset.navTheme; break; } }
      mbar.dataset.theme = theme;
    };
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  }

  /* ---------- 8. activation: carry the step-1 email into step 2 (shared-kit gap, reported) ---------- */
  const act = d.getElementById('activate');
  if (act) {
    const e1 = act.querySelector('#act-email'), e2 = act.querySelector('#act-email2'), nx = act.querySelector('.act__step [data-next]');
    nx && e1 && e2 && nx.addEventListener('click', () => { if (e1.value.trim() && !e2.value.trim()) e2.value = e1.value.trim(); });
  }

  /* ---------- 9. YouTube click-to-play facade ---------- */
  d.querySelectorAll('[data-yt]').forEach(b => b.addEventListener('click', () => {
    const f = d.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1&rel=0`;
    f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true;
    f.title = b.getAttribute('aria-label') || 'YouTube';
    const box = d.createElement('div'); box.className = 'yt yt--on'; box.append(f);
    b.replaceWith(box); f.focus();
  }, { once: true }));
})();
