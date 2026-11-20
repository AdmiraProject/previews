/* Zoom Académie v2 — page behaviors (nav, mega-menu, off-canvas, carousels, strip, tabs, scroll-spy, FAQ). */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* sticky nav shadow */
  const nv = $('.nv');
  const onScroll = () => nv && nv.classList.toggle('is-scrolled', scrollY > 4);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* mega-menus: click to open, full-width panel */
  const dds = $$('.nv-dd');
  const closeMega = () => dds.forEach(b => { b.setAttribute('aria-expanded', 'false'); const m = document.getElementById(b.dataset.mega); if (m) m.hidden = true; });
  dds.forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    const open = b.getAttribute('aria-expanded') === 'true'; closeMega();
    if (!open) { b.setAttribute('aria-expanded', 'true'); document.getElementById(b.dataset.mega).hidden = false; }
  }));
  document.addEventListener('click', e => { if (!e.target.closest('.mega') || e.target.closest('a,[data-add],[data-enroll]')) closeMega(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMega(); closeOc(); } });
  $$('.mega-rail [data-pane]').forEach(g => g.addEventListener('click', e => {
    e.stopPropagation(); const rail = g.closest('.mega-in');
    $$('[data-pane]', rail).forEach(x => x.classList.toggle('is-on', x === g));
    $$('.mega-pane', rail).forEach(p => p.classList.toggle('is-on', p.id === g.dataset.pane));
  }));

  /* mobile off-canvas */
  const oc = $('.oc'), burger = $('.nv-burger');
  function closeOc() { if (!oc) return; oc.classList.remove('is-open'); oc.setAttribute('aria-hidden', 'true'); burger && burger.setAttribute('aria-expanded', 'false'); document.documentElement.style.overflow = ''; }
  burger && burger.addEventListener('click', () => { oc.classList.add('is-open'); oc.setAttribute('aria-hidden', 'false'); burger.setAttribute('aria-expanded', 'true'); document.documentElement.style.overflow = 'hidden'; });
  oc && $('.oc-x', oc).addEventListener('click', closeOc);
  oc && oc.addEventListener('click', e => { if (e.target.closest('a,[data-add],[data-enroll]')) closeOc(); });
  $$('.oc-row[aria-expanded]').forEach(r => r.addEventListener('click', () => {
    const on = r.getAttribute('aria-expanded') !== 'true'; r.setAttribute('aria-expanded', on); r.nextElementSibling.hidden = !on;
  }));

  /* segmented toggle (programs) */
  $$('.seg').forEach(seg => $$('button', seg).forEach(b => b.addEventListener('click', () => {
    $$('button', seg).forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', x === b); });
    $$('.seg-pane', seg.parentNode).forEach(p => { const on = p.id === b.dataset.seg; p.hidden = !on; p.classList.toggle('is-on', on); });
  })));

  /* centered-focus video carousel (loop via 3 copies, no autoplay) */
  $$('[data-vc]').forEach(vc => {
    const track = $('.vc-track', vc), orig = $$('.vs', track), n = orig.length, dots = $('.vc-dots', vc);
    orig.forEach(s => track.appendChild(s.cloneNode(true)));
    orig.forEach(s => track.insertBefore(s.cloneNode(true), track.firstChild));
    const all = $$('.vs', track); all.forEach((s, i) => { if (i < n || i >= 2 * n) { s.setAttribute('aria-hidden', 'true'); s.querySelectorAll('button').forEach(b => b.tabIndex = -1); } });
    let i = n; // index in all
    const dotBtns = orig.map((_, k) => { const d = document.createElement('button'); d.type = 'button'; d.setAttribute('aria-label', String(k + 1)); d.addEventListener('click', () => go(n + k)); dots.appendChild(d); return d; });
    function pos(anim) {
      const s = all[i], w = s.offsetWidth - 1;
      track.style.transition = anim === false ? 'none' : '';
      track.style.transform = `translateX(${vc.clientWidth / 2 - (i * w + s.offsetWidth / 2)}px)`;
      all.forEach((x, k) => x.classList.toggle('is-on', k === i));
      dotBtns.forEach((d, k) => d.classList.toggle('is-on', k === (i % n)));
    }
    function go(k) { i = k; pos(); }
    track.addEventListener('transitionend', e => { if (e.target !== track) return; if (i < n || i >= 2 * n) { i = n + (i % n); pos(false); } });
    track.addEventListener('click', e => { // inactive slide → focus it instead of playing
      const s = e.target.closest('.vs'); if (!s) return; const k = all.indexOf(s);
      if (k !== i) { e.stopPropagation(); e.preventDefault(); go(k); }
    }, true);
    let x0 = null, moved = false;
    track.addEventListener('pointerdown', e => { x0 = e.clientX; moved = false; });
    addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) { moved = true; go(i + (dx < 0 ? 1 : -1)); } });
    track.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    addEventListener('resize', () => pos(false));
    pos(false);
  });

  /* auto-scrolling strip ≈120px/s (measured on the benchmark), infinite, pause on hover, draggable */
  $$('[data-strip]').forEach(v => {
    const list = $('.strip-l', v); if (RM) return;
    $$('.ac', list).forEach(c => { const d = c.cloneNode(true); d.setAttribute('aria-hidden', 'true'); list.appendChild(d); });
    let x = 0, last = performance.now(), hover = false, drag = null, visible = true;
    const half = () => list.scrollWidth / 2 + 34.5;
    v.addEventListener('mouseenter', () => hover = true); v.addEventListener('mouseleave', () => { hover = false; drag = null; v.classList.remove('is-drag'); });
    v.addEventListener('pointerdown', e => { drag = { x: e.clientX, s: x }; v.classList.add('is-drag'); });
    addEventListener('pointermove', e => { if (drag) x = drag.s + (e.clientX - drag.x); });
    addEventListener('pointerup', () => { drag = null; v.classList.remove('is-drag'); });
    new IntersectionObserver(es => visible = es[0].isIntersecting).observe(v);
    (function tick(t) {
      const dt = Math.min(64, t - last); last = t;
      if (!hover && !drag && visible) x -= 120 * dt / 1000;
      const h = half(); if (x <= -h) x += h; if (x > 0) x -= h;
      list.style.transform = `translate3d(${x}px,0,0)`;
      requestAnimationFrame(tick);
    })(last);
  });

  /* vertical tabs (curriculum + why) — buttons [data-tab] inside [data-tabs] */
  $$('[data-tabs]').forEach(box => {
    const btns = $$('[data-tab]', box);
    $$('[data-acc]', box).forEach(x => x.addEventListener('click', () => { const pane = document.getElementById(x.dataset.acc), on = x.getAttribute('aria-expanded') !== 'true'; x.setAttribute('aria-expanded', on); pane.classList.toggle('acc-open', on); }));
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on); });
      $$('.tab-p', box).forEach(p => { const on = p.id === b.dataset.tab; p.hidden = !on; });
      if (innerWidth < 992 && b.parentNode.scrollWidth > b.parentNode.clientWidth) b.parentNode.scrollTo({ left: b.offsetLeft - 12, behavior: RM ? 'auto' : 'smooth' });
    }));
  });

  /* sticky scroll-spy sub-nav (program page) */
  const spy = $('.ptabs');
  if (spy) {
    const links = $$('.ptabs-l a', spy), secs = links.map(a => document.getElementById(a.getAttribute('href').slice(1)));
    const upd = () => {
      const y = scrollY + 140; let k = -1;
      secs.forEach((s, j) => { if (s && s.offsetTop <= y) k = j; });
      links.forEach((a, j) => a.classList.toggle('is-on', j === k));
      const on = links[k]; if (on && innerWidth < 992) { const l = on.parentNode; if (on.offsetLeft < l.scrollLeft || on.offsetLeft + on.offsetWidth > l.scrollLeft + l.clientWidth) l.scrollTo({ left: on.offsetLeft - 12 }); }
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* cohort finder: language filter + sessions collapse */
  const finder = $('.finder');
  if (finder) {
    const sel = $('#f-lang', finder), rows = $$('.ses-row', finder);
    const apply = () => rows.forEach(r => r.hidden = !!sel.value && r.dataset.lang !== sel.value);
    sel.addEventListener('change', apply);
    const tg = $('.ses-toggle', finder), body = $('.ses-body', finder);
    tg.addEventListener('click', () => { const on = tg.getAttribute('aria-expanded') !== 'true'; tg.setAttribute('aria-expanded', on); body.hidden = !on; });
    const ft = $('.f-toggle', finder); ft && ft.addEventListener('click', () => { const on = ft.getAttribute('aria-expanded') !== 'true'; ft.setAttribute('aria-expanded', on); $('.f-body', finder).classList.toggle('is-open', on); });
  }

  /* testimonial slider: 416px step, arrows, no autoplay */
  $$('[data-ts]').forEach(ts => {
    const track = $('.ts-track', ts), cards = $$('.ts-card', track); let i = 0;
    const step = () => cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : 416;
    const vis = () => Math.max(1, Math.floor((ts.clientWidth + 24) / step()));
    function go(k) {
      const max = Math.max(0, cards.length - vis()); i = Math.max(0, Math.min(max, k));
      track.style.transform = `translateX(${-i * step()}px)`;
      $('.ts-prev', ts).disabled = i === 0; $('.ts-next', ts).disabled = i === max;
    }
    $('.ts-prev', ts).addEventListener('click', () => go(i - 1));
    $('.ts-next', ts).addEventListener('click', () => go(i + 1));
    let x0 = null; track.addEventListener('pointerdown', e => x0 = e.clientX);
    addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1)); });
    addEventListener('resize', () => go(i)); go(0);
  });

  /* FAQ: category pills + accordion (one open at a time) */
  const faq = $('.faq');
  if (faq) {
    const pills = $$('.faq-pills button', faq), items = $$('.qa', faq);
    pills.forEach(p => p.addEventListener('click', () => {
      pills.forEach(x => { x.classList.toggle('is-on', x === p); x.setAttribute('aria-selected', x === p); });
      items.forEach(it => it.hidden = p.dataset.cat !== 'all' && it.dataset.cat !== p.dataset.cat);
    }));
    const fsel = $('.faq-sel', faq); fsel && fsel.addEventListener('change', () => items.forEach(it => it.hidden = fsel.value !== 'all' && it.dataset.cat !== fsel.value));
    requestAnimationFrame(() => { const q0 = $('.qa-q', items[0]), a0 = $('.qa-a', items[0]); q0.setAttribute('aria-expanded', 'true'); a0.style.height = a0.scrollHeight + 'px'; });
    items.forEach(it => {
      const q = $('.qa-q', it), a = $('.qa-a', it);
      q.addEventListener('click', () => {
        const on = q.getAttribute('aria-expanded') !== 'true';
        items.forEach(o => { if (o !== it) { $('.qa-q', o).setAttribute('aria-expanded', 'false'); $('.qa-a', o).style.height = '0px'; } });
        q.setAttribute('aria-expanded', on); a.style.height = on ? a.scrollHeight + 'px' : '0px';
      });
    });
  }
  /* lazy background videos */
  const lv = $$('video[data-lazy-src]');
  if (lv.length) { const io = new IntersectionObserver(es => es.forEach(x => { if (!x.isIntersecting) return; const v = x.target; io.unobserve(v); if (RM) return; v.src = v.dataset.lazySrc; v.play().catch(() => {}); }), { rootMargin: '200px' }); lv.forEach(v => io.observe(v)); }
})();
