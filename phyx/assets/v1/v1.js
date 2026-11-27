
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  
  const cs = (window.PHYX && window.PHYX.centers) || [];
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
  $$('[data-centro]').forEach(el => { const v = norm(el.dataset.centro); const c = cs.find(c => norm(c.id) === v || norm(c.name).includes(v) || v.includes(norm(c.id))); if (c) el.dataset.centro = c.id; });

  
  const h = $('.xh');
  if (h) {
    const mode = h.dataset.mode;
    const onScroll = () => {
      const y = scrollY;
      if (mode === 'home') h.style.position = y > 0 ? 'relative' : 'fixed';
      if (mode === 'dark') h.classList.toggle('is-solid', y > 100);
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  
  const mm = $('.xm');
  if (mm) {
    $$('[data-menu-open]').forEach(b => b.addEventListener('click', () => { mm.classList.add('is-open'); document.documentElement.style.overflow = 'hidden'; }));
    $$('[data-menu-close]', mm).forEach(b => b.addEventListener('click', () => { mm.classList.remove('is-open'); $$('.xm__sub', mm).forEach(s => s.classList.remove('is-open')); document.documentElement.style.overflow = ''; }));
    $$('[data-sub]', mm).forEach(b => b.addEventListener('click', () => { const s = $(`#${b.dataset.sub}`); if (s) s.classList.add('is-open'); }));
    $$('[data-sub-back]', mm).forEach(b => b.addEventListener('click', () => b.closest('.xm__sub').classList.remove('is-open')));
    $$('a, [data-book]', mm).forEach(a => a.addEventListener('click', () => { if (!a.hasAttribute('data-sub')) { mm.classList.remove('is-open'); document.documentElement.style.overflow = ''; } }));
  }

  
  $$('.tb__track').forEach(t => {
    if (RM) return;
    let x = 0, last = performance.now(), set = 0;
    const measure = () => { const kids = t.children.length; if (!kids) return; const n = +t.dataset.set || kids / 3; const gap = parseFloat(getComputedStyle(t).columnGap) || 60; let w = 0; for (let i = 0; i < n; i++) w += t.children[i].getBoundingClientRect().width + gap; set = w; };
    measure(); addEventListener('resize', measure); addEventListener('load', measure);
    const speed = +t.dataset.speed || 45;
    const step = now => { const dt = Math.min(64, now - last); last = now; x -= speed * dt / 1000; if (set && -x >= set) x += set; t.style.transform = `translateX(${x.toFixed(3)}px)`; requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });

  
  $$('.acc__vp').forEach(vp => {
    const tr = $('.acc__track', vp), p = $('.acc__arrow--p', vp), n = $('.acc__arrow--n', vp); let i = 0;
    const len = tr.children.length;
    const go = k => { i = Math.max(0, Math.min(len - 1, k)); tr.style.transform = innerWidth < 768 ? `translateX(calc(${-i * 100}% - ${i * 24}px))` : ''; p.disabled = i === 0; n.disabled = i === len - 1; };
    p.addEventListener('click', () => go(i - 1)); n.addEventListener('click', () => go(i + 1)); addEventListener('resize', () => go(i)); go(0);
  });

  
  $$('.faq__q, .ldr__q').forEach(q => q.addEventListener('click', () => {
    const it = q.parentElement; const open = it.classList.toggle('is-open');
    const i = $('.faq__i, .ldr__i', it); if (i) i.textContent = open ? '−' : '+'; q.setAttribute('aria-expanded', open);
  }));

  
  const lb = $('.lb');
  $$('[data-lightbox]').forEach(b => b.addEventListener('click', e => {
    e.preventDefault(); if (!lb) return; const v = $('video', lb); if (b.dataset.lightbox) v.src = b.dataset.lightbox;
    lb.classList.add('is-open'); v.currentTime = 0; v.play().catch(() => {});
  }));
  if (lb) { const close = () => { lb.classList.remove('is-open'); $('video', lb).pause(); }; $$('[data-lb-close]', lb).forEach(x => x.addEventListener('click', close)); lb.addEventListener('click', e => { if (e.target === lb) close(); }); addEventListener('keydown', e => { if (e.key === 'Escape') close(); }); }

  
  $$('[data-slider]').forEach(s => {
    const tr = $('.js-track', s); if (!tr) return; let i = 0;
    const pitch = () => { const c = tr.children[0]; if (!c) return 300; const r = c.getBoundingClientRect(); return r.width + (parseFloat(getComputedStyle(tr).columnGap) || 0); };
    const max = () => Math.max(0, tr.children.length - Math.floor(s.getBoundingClientRect().width / pitch()));
    const go = k => { const m = max(); i = k < 0 ? m : k > m ? 0 : k; tr.style.transform = `translateX(${-i * pitch()}px)`; };
    $$('[data-prev]', s).forEach(b => b.addEventListener('click', () => go(i - 1)));
    $$('[data-next]', s).forEach(b => b.addEventListener('click', () => go(i + 1)));
    let sx = null; tr.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    tr.addEventListener('touchend', e => { if (sx == null) return; const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 40) go(i + (d < 0 ? 1 : -1)); sx = null; });
    addEventListener('resize', () => go(Math.min(i, max())));
  });

  
  $$('.tsl').forEach(t => {
    const sl = $$('.tsl__sl', t); let i = 0; const go = k => { i = (k + sl.length) % sl.length; sl.forEach((s, j) => s.classList.toggle('is-on', j === i)); };
    $$('[data-prev]', t).forEach(b => b.addEventListener('click', () => go(i - 1))); $$('[data-next]', t).forEach(b => b.addEventListener('click', () => go(i + 1)));
  });

  
  $$('[data-cols]').forEach(w => {
    const cols = $$('[data-col]', w); const go = c => cols.forEach(x => x.classList.toggle('is-on', x === c));
    cols.forEach(c => { c.addEventListener('mouseenter', () => go(c)); c.addEventListener('click', () => go(c)); });
    let i = 0; $$('[data-prev]', w).forEach(b => b.addEventListener('click', () => { i = (i - 1 + cols.length) % cols.length; go(cols[i]); }));
    $$('[data-next]', w).forEach(b => b.addEventListener('click', () => { i = (i + 1) % cols.length; go(cols[i]); }));
  });

  
  $$('.team').forEach(t => {
    const data = JSON.parse(t.dataset.team || '{}'); const tabs = $$('.team__tabs button', t); let tab = tabs[0] && tabs[0].dataset.tab, i = 0;
    const render = () => { const L = data[tab] || []; if (!L.length) return; const p = L[(i + L.length) % L.length], a = L[(i - 1 + L.length) % L.length], b = L[(i + 1) % L.length];
      $('.team__txt h2', t).textContent = p.name; $('.team__txt h4', t).textContent = p.role; $('.team__txt p', t).textContent = p.bio;
      $('.team__main', t).src = p.img; $('.team__sm--l', t).src = a.img; $('.team__sm--r', t).src = b.img; };
    tabs.forEach(b => b.addEventListener('click', () => { tabs.forEach(x => x.classList.toggle('is-on', x === b)); tab = b.dataset.tab; i = 0; render(); }));
    $$('[data-prev]', t).forEach(b => b.addEventListener('click', () => { i--; render(); })); $$('[data-next]', t).forEach(b => b.addEventListener('click', () => { i++; render(); }));
  });

  
  const shards = $$('[data-par]');
  if (shards.length && !RM) {
    const tick = () => { shards.forEach(s => { const r = s.parentElement.getBoundingClientRect(); const k = +s.dataset.par; s.style.transform = `translate3d(0, ${((r.top + r.height / 2 - innerHeight / 2) * k).toFixed(1)}px, 0)`; }); };
    addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true }); tick();
  }

  
  $$('form[data-lead]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault(); const c = f.elements.centro && f.elements.centro.value, m = f.elements.motivo && f.elements.motivo.value;
    if (window.PXLead) window.PXLead.open({ centro: c || undefined, motivo: m || undefined, plan: f.dataset.plan || '' });
  }));

  
  $$('video[data-src-m], video[data-fallback]').forEach(v => {
    const src = v.querySelector('source');
    if (src && v.dataset.srcM && innerWidth < 768) { src.src = v.dataset.srcM; v.load(); }
    if (src && v.dataset.fallback) src.addEventListener('error', () => { if (!src.src.endsWith(v.dataset.fallback.split('/').pop())) { src.src = v.dataset.fallback; v.load(); } });
  });
  
  $$('video[data-auto]').forEach(v => {
    if (RM) { v.removeAttribute('autoplay'); v.pause(); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }), { threshold: .1 });
    io.observe(v);
  });
})();
