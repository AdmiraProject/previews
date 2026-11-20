/* Zoom Académie v3 — page behaviour (nav, mega-menu, accordions, gliders, scroll-spy, media). Commerce/activation live in assets/za/core.js. */
(function () {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* hero footage: square cut on phones */
  const hv = $('.hero__vid');
  if (hv) {
    const m = matchMedia('(max-width: 767px)').matches;
    if (m && hv.dataset.posterM) hv.poster = hv.dataset.posterM;
    hv.src = m ? hv.dataset.srcM : hv.dataset.srcD;
    if (RM) hv.removeAttribute('autoplay'); else hv.play().catch(() => {});
  }

  /* lazy muted loops: load + play only while visible */
  const lazy = $$('video[data-lazy-src]');
  if (lazy.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) {
        if (!v.src) { v.src = v.dataset.lazySrc; }
        if (!RM) v.play().catch(() => {});
      } else if (v.src) v.pause();
    }), { rootMargin: '200px 0px' });
    lazy.forEach(v => io.observe(v));
  }

  /* nav: mega-menu (hover on desktop, click anywhere) + mobile panel */
  const nav = $('.nav');
  const mega = $('.has-mega');
  if (mega) {
    const btn = $('.nav__link', mega);
    let t;
    const set = on => { mega.classList.toggle('is-open', on); btn.setAttribute('aria-expanded', on); };
    const fine = matchMedia('(hover: hover)').matches;
    if (fine) {
      mega.addEventListener('mouseenter', () => { clearTimeout(t); set(true); });
      mega.addEventListener('mouseleave', () => { t = setTimeout(() => set(false), 120); });
    }
    btn.addEventListener('click', () => set(!mega.classList.contains('is-open')));
    $('.mega__x', mega).addEventListener('click', () => set(false));
    $$('a, [data-add]', mega).forEach(a => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }
  const burger = $('.nav__burger');
  if (burger) {
    const panel = $('.mnav');
    const set = on => { nav.classList.toggle('is-mob', on); burger.setAttribute('aria-expanded', on); panel.setAttribute('aria-hidden', !on); document.documentElement.classList.toggle('za-lock', on); };
    burger.addEventListener('click', () => set(!nav.classList.contains('is-mob')));
    $$('a', panel).forEach(a => a.addEventListener('click', () => set(false)));
    const acc = $('.mnav__acc', panel);
    if (acc) $('.mnav__item', acc).addEventListener('click', e => { const on = !acc.classList.contains('is-open'); acc.classList.toggle('is-open', on); e.currentTarget.setAttribute('aria-expanded', on); });
    matchMedia('(min-width: 1024px)').addEventListener('change', e => { if (e.matches) set(false); });
  }

  /* accordions (one open at a time, like the benchmark) */
  $$('[data-acc]').forEach(group => {
    $$(':scope > .acc__item > .acc__q', group).forEach(q => q.addEventListener('click', () => {
      const item = q.parentElement, on = !item.classList.contains('is-open');
      item.classList.toggle('is-open', on); q.setAttribute('aria-expanded', on);
    }));
  });

  /* keyboard for div[role=button] (media posters, accordion rows, toggle tabs) */
  document.addEventListener('keydown', e => {
    const t = e.target; if (!(t instanceof Element) || !t.matches('[role="button"],[role="tab"]')) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.click(); }
  });

  /* gliders: native scroll-snap + arrows */
  $$('[data-glider]').forEach(g => {
    const track = $('.glider__track', g), prev = $('[data-prev]', g), next = $('[data-next]', g);
    const step = () => { const c = track.children[0]; return c ? c.getBoundingClientRect().width + 16 : 300; };
    const upd = () => { prev.disabled = track.scrollLeft < 4; next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4; };
    const go = dir => {
      const from = track.scrollLeft, to = Math.max(0, Math.min(track.scrollWidth - track.clientWidth, from + dir * step()));
      if (RM) { track.scrollLeft = to; return; }
      const t0 = performance.now(), D = 170;
      const f = t => { const k = Math.min(1, (t - t0) / D), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; track.scrollLeft = from + (to - from) * e; if (k < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    };
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    track.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true });
    addEventListener('resize', upd); upd();
  });

  /* program: scroll-spy sidebar */
  const links = $$('.side__nav a');
  if (links.length) {
    const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
    const spy = () => {
      const y = scrollY + innerHeight * 0.3;
      let cur = secs[0];
      secs.forEach(s => { if (s.offsetTop <= y) cur = s; });
      links.forEach(a => a.classList.toggle('is-on', a.getAttribute('href') === '#' + cur.id));
    };
    addEventListener('scroll', () => requestAnimationFrame(spy), { passive: true }); spy();
  }

  /* program: curriculum toggle swaps the timeline copy instantly */
  $$('.toggle [data-tl]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.tl;
    $$('.toggle [data-tl]').forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', x === b); });
    $$('.tl [data-a]').forEach(n => { n.textContent = n.dataset[k]; });
  }));

  /* inline form → engine activation flow, prefilling name + email when the contact step appears */
  const form = $('[data-iform]');
  if (form) {
    form.addEventListener('submit', e => e.preventDefault());
    const fill = () => {
      const n = form.iname.value.trim(), m = form.iemail.value.trim();
      if (!n && !m) return;
      const obs = new MutationObserver(() => {
        const a = $('.za-modal input[name=name]'), b = $('.za-modal input[name=email]');
        if (a && b) { if (n && !a.value) a.value = n; if (m && !b.value) b.value = m; obs.disconnect(); }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => obs.disconnect(), 120000);
    };
    $('[data-enroll]', form).addEventListener('click', fill);
  }

  /* lazy images fade in (opacity .3s) once loaded */
  $$('img[loading="lazy"]').forEach(img => {
    if (img.complete && img.naturalWidth) return;
    img.classList.add('is-pending');
    const done = () => img.classList.remove('is-pending');
    img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true });
  });

  /* video posters play in place (benchmark plays its embeds inline) */
  document.addEventListener('click', e => {
    const box = e.target.closest('.vposter[data-video], .scard__media[data-video], .bcard--video[data-video]');
    if (!box || box.classList.contains('is-playing')) return;
    e.stopPropagation(); e.preventDefault();
    const root = (document.querySelector('script[src*="assets/za/core.js"]') || {}).src || '';
    const base = root.replace(/assets\/za\/core\.js.*$/, '');
    const v = document.createElement('video');
    v.className = 'inline-play'; v.controls = true; v.playsInline = true; v.src = base + box.dataset.video;
    box.classList.add('is-playing'); box.append(v); v.play().catch(() => {});
  }, true);
})();
