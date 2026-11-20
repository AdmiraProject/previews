/* Serna shared interactions: on-load video media, reveal, header state, carousels, coverflow, accordions, modal, mobile nav. */
(() => {
  const d = document, de = d.documentElement; de.classList.add('js');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Video media: poster image shows instantly, video fades in once it can play. Plays on load for heroes, on view for the rest. */
  const startVid = fig => {
    const v = fig.querySelector('video'); if (!v || v.dataset.on) return; v.dataset.on = 1;
    if (RM) return;
    v.muted = true; v.playsInline = true; v.loop = true; v.preload = 'auto';
    if (v.dataset.src) v.src = v.dataset.src;
    const go = () => { const p = v.play(); if (p && p.then) p.then(() => fig.classList.add('playing')).catch(() => {}); else fig.classList.add('playing'); };
    if (v.readyState >= 3) go(); else v.addEventListener('canplay', go, { once: true });
  };
  const vids = [...d.querySelectorAll('.vm')];
  vids.filter(f => f.hasAttribute('data-eager')).forEach(startVid);
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    const v = e.target.querySelector('video');
    if (e.isIntersecting) { startVid(e.target); if (v && v.dataset.on && v.paused && !RM) v.play().catch(() => {}); }
    else if (v && !v.paused) v.pause();
  }), { rootMargin: '200px 0px' }) : null;
  vids.forEach(f => io ? io.observe(f) : startVid(f));

  /* Reveal */
  const rvs = d.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    const ro = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach(el => ro.observe(el));
  } else rvs.forEach(el => el.classList.add('in'));

  /* Header scrolled state */
  const hd = d.querySelector('[data-hd]');
  if (hd) { const f = () => hd.classList.toggle('scrolled', scrollY > 12); f(); addEventListener('scroll', f, { passive: true }); }

  /* Mobile nav */
  d.querySelectorAll('[data-menu]').forEach(b => b.addEventListener('click', () => { const o = de.classList.toggle('nav-open'); b.setAttribute('aria-expanded', o); }));
  d.querySelectorAll('.mnav a').forEach(a => a.addEventListener('click', () => de.classList.remove('nav-open')));

  /* Promo bar close */
  d.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => b.closest(b.dataset.close).remove()));

  /* Generic horizontal carousel: [data-car] > .car-track ; [data-prev]/[data-next]; .car-dots */
  d.querySelectorAll('[data-car]').forEach(c => {
    const tr = c.querySelector('.car-track'); if (!tr) return;
    const items = [...tr.children], dots = c.querySelector('.car-dots');
    const step = () => { const a = items[0], b = items[1]; return b ? b.getBoundingClientRect().left - a.getBoundingClientRect().left : tr.clientWidth; };
    const pages = () => Math.max(1, Math.round((tr.scrollWidth - tr.clientWidth) / step()) + 1);
    const idx = () => Math.round(tr.scrollLeft / step());
    const draw = () => { if (!dots) return; const n = pages(); dots.hidden = n < 2; if (n < 2) return; void 0; const i = Math.min(idx(), n - 1); if (dots.children.length !== n) dots.innerHTML = Array.from({ length: n }, (_, k) => `<button type="button" aria-label="${k + 1}"></button>`).join(''); [...dots.children].forEach((b, k) => { b.classList.toggle('on', k === i); b.onclick = () => tr.scrollTo({ left: k * step(), behavior: 'smooth' }); }); };
    c.querySelectorAll('[data-prev]').forEach(b => b.addEventListener('click', () => tr.scrollBy({ left: -step(), behavior: 'smooth' })));
    c.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => tr.scrollBy({ left: step(), behavior: 'smooth' })));
    tr.addEventListener('scroll', () => requestAnimationFrame(draw), { passive: true }); addEventListener('resize', draw); draw();
  });

  d.querySelectorAll('[data-cf]').forEach(cf => {
    const cards = [...cf.querySelectorAll('.cf-card')], n = cards.length, dots = cf.querySelector('.cf-dots');
    let cur = Math.min(2, n - 1), timer;
    if (dots) dots.innerHTML = cards.map((_, k) => `<button type="button" aria-label="${k + 1}"></button>`).join('');
    const set = i => {
      cur = (i + n) % n;
      cards.forEach((c, k) => { let p = k - cur; if (p > n / 2) p -= n; if (p < -n / 2) p += n; c.dataset.pos = Math.abs(p) > 3 ? 'far' : p; c.setAttribute('aria-hidden', p !== 0); });
      if (dots) [...dots.children].forEach((b, k) => b.classList.toggle('on', k === cur));
    };
    const auto = () => { clearInterval(timer); if (!RM) timer = setInterval(() => set(cur + 1), 5200); };
    cf.querySelector('[data-cf-prev]')?.addEventListener('click', () => { set(cur - 1); auto(); });
    cf.querySelector('[data-cf-next]')?.addEventListener('click', () => { set(cur + 1); auto(); });
    if (dots) [...dots.children].forEach((b, k) => b.addEventListener('click', () => { set(k); auto(); }));
    cards.forEach((c, k) => c.addEventListener('click', () => { if (+c.dataset.pos === 0) openModal(c); else { set(k); auto(); } }));
    let x0 = null; cf.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    cf.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { set(cur + (dx < 0 ? 1 : -1)); auto(); } x0 = null; });
    cf.addEventListener('mouseenter', () => clearInterval(timer)); cf.addEventListener('mouseleave', auto);
    set(cur); auto();
  });

  /* Modal */
  const md = d.createElement('div'); md.className = 'md'; md.setAttribute('role', 'dialog'); md.setAttribute('aria-modal', 'true');
  md.innerHTML = '<div class="md-box"><button class="md-x" type="button" aria-label="Cerrar"><svg class="ic" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button><div class="md-media"></div><div class="md-txt"></div></div>';
  d.body.appendChild(md);
  const close = () => { md.classList.remove('on'); md.querySelector('video')?.pause(); };
  md.addEventListener('click', e => { if (e.target === md || e.target.closest('.md-x')) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  function openModal(src) {
    const box = md.querySelector('.md-box'), media = md.querySelector('.md-media'), txt = md.querySelector('.md-txt');
    const vid = src.dataset.video;
    box.classList.toggle('vid', !!vid);
    media.innerHTML = vid ? `<video src="${vid}" controls autoplay playsinline></video>` : `<img src="${src.dataset.img}" alt="">`;
    txt.innerHTML = vid ? '' : src.querySelector('template')?.innerHTML || '';
    txt.hidden = !!vid;
    md.classList.add('on'); md.querySelector('.md-x').focus();
  }
  d.querySelectorAll('[data-modal]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); openModal(el); }));
  window.SFmodal = openModal;

  /* Accordion (single-open): [data-acc] > .acc-i > .acc-h + .acc-b */
  d.querySelectorAll('[data-acc]').forEach(acc => {
    const items = [...acc.querySelectorAll('.acc-i')];
    const open = it => items.forEach(x => { const on = x === it && !x.classList.contains('on'); x.classList.toggle('on', x === it ? on || acc.dataset.acc === 'keep' : false); const b = x.querySelector('.acc-b'); b.style.maxHeight = x.classList.contains('on') ? b.scrollHeight + 'px' : '0px'; x.querySelector('.acc-h').setAttribute('aria-expanded', x.classList.contains('on')); });
    items.forEach(it => it.querySelector('.acc-h').addEventListener('click', () => open(it)));
    const first = items.find(x => x.classList.contains('on')); items.forEach(x => { const b = x.querySelector('.acc-b'); b.style.maxHeight = x === first ? b.scrollHeight + 'px' : '0px'; });
    addEventListener('resize', () => items.forEach(x => { if (x.classList.contains('on')) { const b = x.querySelector('.acc-b'); b.style.maxHeight = b.scrollHeight + 'px'; } }));
  });

  /* Count-up numbers */
  d.querySelectorAll('[data-count]').forEach(el => {
    const to = +el.dataset.count, dur = 1600; let st;
    const ob = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; ob.disconnect(); if (RM) { el.textContent = to; return; } const f = t => { st ??= t; const k = Math.min(1, (t - st) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); });
    ob.observe(el);
  });
})();
