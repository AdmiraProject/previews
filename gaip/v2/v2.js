/* GAIP v2 — interactions (Samsara-equivalent behaviours). No backend. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mqDesk = matchMedia('(min-width:1200px)');
  const mqMob = matchMedia('(max-width:767px)');

  /* ---------- i18n: one script serves /v2/ (es-MX) and /v2/en/ (en-US) ---------- */
  const EN = /^en\b/i.test(document.documentElement.lang);
  const T = EN ? {
    menuOpen: 'Open menu', menuClose: 'Close menu',
    steps: [['1. DIAGNOSIS'], ['2. DESIGN'], ['3. TECHNICAL', 'FEASIBILITY'], ['4. MOLD'], ['5. PILOT', 'RUN'], ['6. YOUR IDEA,', 'MADE REAL']]
  } : {
    menuOpen: 'Abrir menú', menuClose: 'Cerrar menú',
    steps: [['1. DIAGNÓSTICO'], ['2. DISEÑO'], ['3. FACTIBILIDAD', 'TÉCNICA'], ['4. MOLDE'], ['5. CORRIDA', 'PILOTO'], ['6. TU IDEA', 'MATERIALIZADA']]
  };

  /* ---------- language switcher (footer select; any [data-lang-switch]) ----------
     option value = relative URL of that language's page; keeps the current #hash */
  const langSels = $$('select[data-lang-switch]');
  const syncLang = () => langSels.forEach(sel => [...sel.options].forEach(o => { o.selected = o.hasAttribute('data-current'); }));
  langSels.forEach(sel => sel.addEventListener('change', () => {
    const o = sel.options[sel.selectedIndex];
    if (!o || o.hasAttribute('data-current')) return;
    const u = new URL(o.value, location.href); u.hash = location.hash;
    location.href = u.href;
  }));
  syncLang(); addEventListener('pageshow', syncLang); // reset after back/forward (bfcache)

  /* ---------- banner / nav scroll state ---------- */
  const onScroll = () => document.body.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- videos: hero picks resolution; others lazy-load + play only in view ---------- */
  const hero = $('.hero__video');
  if (hero) {
    hero.src = innerWidth * (devicePixelRatio || 1) > 1400 ? hero.dataset.hd : hero.dataset.sd;
    hero.play().catch(() => {});
  }
  const ensureSrc = v => { if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); } };
  const tryPlay = v => { ensureSrc(v); const p = v.play(); if (p) p.catch(() => {}); };
  const lazyVids = $$('video[data-src]');
  const io = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    v._vis = e.isIntersecting;
    // only the active slide/blade plays; inactive ones stay paused on their poster
    const holder = v.closest('.fa__slide, .blade');
    const allowed = !holder || holder.classList.contains('is-active');
    if (e.isIntersecting && allowed) tryPlay(v); else if (!e.isIntersecting) v.pause();
  }), { rootMargin: '200px 0px' });
  lazyVids.forEach(v => io.observe(v));

  /* ---------- marquees: duplicate sets for seamless -50% loop ---------- */
  $$('.logos__set, .strip__set').forEach(set => {
    const parent = set.parentElement;
    if (set.classList.contains('strip__set')) { // strip: the set itself animates; duplicate children
      [...set.children].forEach(c => set.appendChild(c.cloneNode(true)));
    } else {
      const c = set.cloneNode(true); c.setAttribute('aria-hidden', 'true'); parent.appendChild(c);
    }
  });

  /* ---------- nav dropdowns (desktop) ---------- */
  const items = $$('.nav__item[data-dd]');
  const panels = $$('.dd');
  let ddTimer;
  const closeDD = () => { items.forEach(b => b.setAttribute('aria-expanded', 'false')); panels.forEach(p => p.hidden = true); };
  const openDD = key => {
    clearTimeout(ddTimer);
    items.forEach(b => b.setAttribute('aria-expanded', String(b.dataset.dd === key)));
    panels.forEach(p => p.hidden = p.dataset.panel !== key);
  };
  items.forEach(b => {
    b.addEventListener('click', e => { e.stopPropagation(); b.getAttribute('aria-expanded') === 'true' ? closeDD() : openDD(b.dataset.dd); });
    b.addEventListener('mouseenter', () => mqDesk.matches && openDD(b.dataset.dd));
  });
  const navEl = $('#nav');
  navEl.addEventListener('mouseleave', () => { ddTimer = setTimeout(closeDD, 220); });
  navEl.addEventListener('mouseenter', () => clearTimeout(ddTimer));
  $$('.nav__item--link, .nav__logo, .nav__right').forEach(el => el.addEventListener('mouseenter', closeDD));
  panels.forEach(p => p.addEventListener('click', e => { if (e.target.closest('a')) closeDD(); }));
  document.addEventListener('click', e => { if (!e.target.closest('#nav')) closeDD(); });

  /* ---------- mobile menu ---------- */
  const tog = $('#navToggle'), mnav = $('#mnav');
  const setM = open => { tog.setAttribute('aria-expanded', String(open)); tog.setAttribute('aria-label', open ? T.menuClose : T.menuOpen); mnav.hidden = !open; };
  tog.addEventListener('click', () => setM(mnav.hidden));
  mnav.addEventListener('click', e => { if (e.target.closest('a')) setM(false); });
  mqDesk.addEventListener('change', () => setM(false));

  /* ---------- feature accordion ---------- */
  const fa = $('[data-fa]');
  if (fa) {
    const rows = $$('.fa__row', fa), slides = $$('.fa__slide', fa);
    const prev = $('.fa__nav .arrow--prev', fa), next = $('.fa__nav .arrow--next', fa);
    let cur = 0;
    const setFA = i => {
      cur = (i + rows.length) % rows.length;
      rows.forEach((r, k) => { r.classList.toggle('is-active', k === cur); $('.fa__btn', r).setAttribute('aria-expanded', String(k === cur)); });
      slides.forEach((s, k) => {
        const on = k === cur; s.classList.toggle('is-active', on);
        const v = $('video', s); if (on) tryPlay(v); else v.pause();
      });
      prev.disabled = cur === 0; next.disabled = cur === rows.length - 1;
    };
    const track = $('[data-fa-track]');
    const desk = matchMedia('(min-width:1024px)');
    const geo = () => { const b = track.getBoundingClientRect(); return { top: b.top + scrollY, span: Math.max(1, track.offsetHeight - innerHeight + 96) }; };
    const onScrollFA = () => {
      if (!desk.matches || !track) return;
      const g = geo(); const p = Math.min(1, Math.max(0, (scrollY - g.top + 96) / g.span));
      const n = rows.length, f = p * n, k = Math.min(n - 1, Math.floor(f));
      if (k !== cur) setFA(k);
      $$('.fa__prog', fa).forEach((b, i) => b.style.setProperty('--p', i < k ? 1 : i === k ? Math.min(1, f - k) : 0));
    };
    addEventListener('scroll', onScrollFA, { passive: true }); addEventListener('resize', onScrollFA); onScrollFA();
    rows.forEach((r, k) => $('.fa__btn', r).addEventListener('click', () => {
      if (desk.matches && track) { const g = geo(); scrollTo({ top: g.top - 96 + g.span * (k + .5) / rows.length, behavior: 'smooth' }); }
      else setFA(k);
    }));
    prev.addEventListener('click', () => setFA(cur - 1));
    next.addEventListener('click', () => setFA(cur + 1));
    $$('[data-acc]').forEach(a => a.addEventListener('click', () => setFA(+a.dataset.acc)));
    // touch swipe on mobile media
    let sx = null;
    $('.fa__media', fa).addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    $('.fa__media', fa).addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) setFA(cur + (dx < 0 ? 1 : -1)); sx = null; });
  }

  /* ---------- accordion blades ---------- */
  const bl = $('[data-blades]');
  if (bl) {
    const blades = $$('.blade', bl);
    const setB = i => {
      blades.forEach((b, k) => { b.classList.toggle('is-active', k === i); const v = $('video', b); if (k === i) tryPlay(v); else v.pause(); });
      bl.style.setProperty('--bt', blades.map((_, k) => k === i ? '748fr' : '145fr').join(' '));
    };
    blades.forEach((b, k) => b.addEventListener('click', e => { if (!b.classList.contains('is-active')) { e.preventDefault(); setB(k); } }));
  }

  /* ---------- catalog carousel ---------- */
  const car = $('[data-carousel]');
  if (car) {
    const track = $('.res__track', car), cards = $$('.rcard', track);
    const prev = $('.res__arrows .arrow--prev'), next = $('.res__arrows .arrow--next');
    let idx = 0;
    const step = () => cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 24);
    const maxIdx = () => {
      const vis = car.clientWidth - parseFloat(getComputedStyle(car).paddingLeft);
      return Math.max(0, Math.ceil((track.scrollWidth - vis) / step()));
    };
    const go = i => {
      idx = Math.max(0, Math.min(i, maxIdx()));
      track.style.transform = `translateX(${-idx * step()}px)`;
      prev.disabled = idx === 0; next.disabled = idx >= maxIdx();
    };
    prev.addEventListener('click', () => go(idx - 1));
    next.addEventListener('click', () => go(idx + 1));
    addEventListener('resize', () => go(idx));
    let sx = null;
    car.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    car.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1)); sx = null; });
    go(0);
  }

  /* ---------- footer accordions (mobile) ---------- */
  $$('.fgroup__h').forEach(h => h.addEventListener('click', () => {
    if (!mqMob.matches) return;
    const g = h.parentElement; const open = !g.classList.contains('is-open');
    g.classList.toggle('is-open', open); h.setAttribute('aria-expanded', String(open));
  }));

  /* ---------- process cycle diagram (6 real steps) ---------- */
  const arcs = $('#cycleArcs'), labels = $('#cycleLabels');
  if (arcs && labels) {
    const cx = 340, cy = 340, R = 272, gap = 19;
    const steps = T.steps;
    const pt = a => { const r = (a * Math.PI) / 180; return [cx + R * Math.sin(r), cy - R * Math.cos(r)]; };
    const NS = 'http://www.w3.org/2000/svg';
    const hlq = [];
    steps.forEach((lines, i) => {
      const a = i * 60; const [x, y] = pt(a);
      const t = document.createElementNS(NS, 'text');
      const lh = 26; const y0 = y - ((lines.length - 1) * lh) / 2 + 8;
      lines.forEach((ln, k) => { const ts = document.createElementNS(NS, 'tspan'); ts.setAttribute('x', x.toFixed(1)); ts.setAttribute('y', (y0 + k * lh).toFixed(1)); ts.textContent = ln; t.appendChild(ts); });
      const hl = document.createElementNS(NS, 'g'); hl.setAttribute('class', 'cycle__hl'); hl.style.animationDelay = (i * 1.8).toFixed(1) + 's';
      labels.appendChild(hl); labels.appendChild(t);
      hlq.push([hl, t]);
      const [x1, y1] = pt(a + gap), [x2, y2] = pt(a + 60 - gap);
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', `M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`);
      arcs.appendChild(p);
    });
    // Samsara flywheel: a highlighter block sweeps behind each step label in order (12 s loop)
    const drawHL = () => hlq.forEach(([hl, t]) => {
      hl.textContent = '';
      [...t.querySelectorAll('tspan')].forEach(ts => {
        const w = ts.getComputedTextLength(), x = +ts.getAttribute('x'), y = +ts.getAttribute('y');
        const r = document.createElementNS(NS, 'rect');
        r.setAttribute('x', (x - w / 2 - 7).toFixed(1)); r.setAttribute('y', (y - 21).toFixed(1));
        r.setAttribute('width', (w + 14).toFixed(1)); r.setAttribute('height', '27'); r.setAttribute('rx', '1.5');
        hl.appendChild(r);
      });
    });
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(drawHL);
    const fig = labels.closest('svg');
    if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => fig.classList.toggle('is-play', e.isIntersecting)), { threshold: .35 }).observe(fig);
    else fig.classList.add('is-play');
  }

  /* ---------- quote modal ---------- */
  const modal = $('#quote'), form = $('#qform'), done = $('.qdone', modal);
  let lastFocus = null;
  const openQ = (opts = {}) => {
    lastFocus = document.activeElement;
    form.hidden = false; done.hidden = true;
    if (opts.industria) form.industria.value = opts.industria;
    if (opts.producto) form.producto.value = opts.producto;
    if (opts.mensaje && !form.mensaje.value) form.mensaje.value = opts.mensaje;
    modal.hidden = false; document.body.classList.add('modal-open');
    setM && !mnav.hidden && setM(false);
    setTimeout(() => form.nombre.focus(), 30);
  };
  const closeQ = () => { modal.hidden = true; document.body.classList.remove('modal-open'); lastFocus && lastFocus.focus && lastFocus.focus(); };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-quote]');
    if (!t) return;
    e.preventDefault(); closeDD();
    openQ({ industria: t.dataset.industria, producto: t.dataset.producto, mensaje: t.dataset.mensaje });
  });
  $$('[data-close]', modal).forEach(b => b.addEventListener('click', closeQ));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (!modal.hidden) closeQ(); closeDD(); if (!mnav.hidden) setM(false); }
    if (e.key === 'Tab' && !modal.hidden) { // focus trap
      const f = $$('button, input, select, textarea, a[href]', modal).filter(x => !x.closest('[hidden]') && x.offsetParent !== null);
      if (!f.length) return; const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', form).forEach(f => { const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value)); f.classList.toggle('is-bad', bad); if (bad && ok) { f.focus(); ok = false; } });
    if (!ok) return;
    form.hidden = true; done.hidden = false; form.reset();
  });
  $$('input, select, textarea', form).forEach(f => f.addEventListener('input', () => f.classList.remove('is-bad')));

  /* ---------- bubble: collapse message after first interaction/scroll ---------- */
  const bubble = $('#bubble');
  setTimeout(() => addEventListener('scroll', function h() { if (scrollY > 1600) { bubble.classList.add('is-min'); removeEventListener('scroll', h); } }, { passive: true }), 500);
})();
