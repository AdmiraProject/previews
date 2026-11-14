/* Liefloré v3 — interactions for the freddiesflowers.com structure.
   Uses window.LFK (lf-core.js) for cart/drawer/checkout. Real data only (window.LF). */
(function () {
  'use strict';
  const K = window.LFK;
  const PAGE = (document.currentScript && document.currentScript.dataset.page) || document.body.className.replace(/.*pg-(\w+).*/, '$1');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
  const WA = 'https://wa.me/526864321342?text=';
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------- lead store (lf-core prefills its popup from 'lf-lead') ---------------- */
  const LEAD = 'lf-lead';
  const getLead = () => { try { return JSON.parse(localStorage.getItem(LEAD) || '{}'); } catch (e) { return {}; } };
  const setLead = o => { try { localStorage.setItem(LEAD, JSON.stringify(Object.assign(getLead(), o))); } catch (e) {} };

  /* ---------------- Mexicali clock + delivery rules ---------------- */
  // Same day only before 3:30\u00a0p.\u00a0m. (web cutoff); no regular Sunday service.
  function mxNow() {
    try {
      const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Tijuana', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()).map(p => [p.type, p.value]));
      return { y: +parts.year, m: +parts.month - 1, d: +parts.day, h: +parts.hour % 24, min: +parts.minute };
    } catch (e) { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth(), d: n.getDate(), h: n.getHours(), min: n.getMinutes() }; }
  }
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const fromIso = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
  const todayD = () => { const n = mxNow(); return new Date(n.y, n.m, n.d); };
  const pastCutoff = () => { const n = mxNow(); return n.h * 60 + n.min >= 15 * 60 + 30; };
  function dayStatus(d) {
    const t = todayD();
    if (d < t) return 'past';
    if (d.getDay() === 0) return 'sunday';
    if (+d === +t && pastCutoff()) return 'cutoff';
    const max = new Date(t); max.setDate(max.getDate() + 120);
    if (d > max) return 'far';
    return 'ok';
  }
  const fmtDay = d => new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }).format(d).replace(/\./g, '');
  const fmtLong = d => new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
  const firstAvail = () => { const d = todayD(); for (let i = 0; i < 10; i++) { if (dayStatus(d) === 'ok') return d; d.setDate(d.getDate() + 1); } return d; };

  /* calendar widget (react-calendar look: Mon-first grid, greyed unavailable) */
  function Calendar(el, opts) {
    const st = { sel: opts.sel || null, view: new Date((opts.sel || todayD()).getFullYear(), (opts.sel || todayD()).getMonth(), 1) };
    const WD = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    function render() {
      const y = st.view.getFullYear(), m = st.view.getMonth();
      const first = new Date(y, m, 1), lead = (first.getDay() + 6) % 7;
      const start = new Date(y, m, 1 - lead);
      const t = todayD();
      const canPrev = new Date(y, m, 1) > new Date(t.getFullYear(), t.getMonth(), 1);
      const canNext = new Date(y, m + 1, 1) <= new Date(t.getFullYear(), t.getMonth() + 4, 1);
      const label = (l => l.charAt(0).toUpperCase() + l.slice(1))(new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(first));
      let cells = '';
      for (let i = 0; i < 42; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        if (i >= 35 && d.getMonth() !== m) break;
        const other = d.getMonth() !== m, s = dayStatus(d);
        const dis = other || s !== 'ok';
        const why = s === 'sunday' ? ', sin servicio regular en domingo' : s === 'cutoff' ? ', pasó la hora de corte de 3:30\u00a0p.\u00a0m.' : s === 'past' ? ', fecha pasada' : '';
        cells += `<button type="button" data-d="${iso(d)}" class="${other ? 'is-other' : ''}${+d === +t ? ' is-today' : ''}${st.sel && +d === +st.sel ? ' is-sel' : ''}" ${dis ? 'disabled' : ''} aria-label="${fmtLong(d)}${why}"${st.sel && +d === +st.sel ? ' aria-pressed="true"' : ''}>${d.getDate()}</button>`;
      }
      el.innerHTML = `<div class="cal-nav"><button type="button" data-cal-prev aria-label="Mes anterior" ${canPrev ? '' : 'disabled'}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg></button><b>${label}</b><button type="button" data-cal-next aria-label="Mes siguiente" ${canNext ? '' : 'disabled'}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg></button></div><div class="cal-g" role="grid">${WD.map(w => `<span class="wd" aria-hidden="true">${w}</span>`).join('')}${cells}</div>`;
    }
    el.addEventListener('click', e => {
      if (e.target.closest('[data-cal-prev]')) { st.view.setMonth(st.view.getMonth() - 1); render(); return; }
      if (e.target.closest('[data-cal-next]')) { st.view.setMonth(st.view.getMonth() + 1); render(); return; }
      const b = e.target.closest('button[data-d]'); if (!b || b.disabled) return;
      st.sel = fromIso(b.dataset.d); render(); opts.onPick && opts.onPick(st.sel);
    });
    render();
    return { set(d) { st.sel = d; if (d) st.view = new Date(d.getFullYear(), d.getMonth(), 1); render(); }, render };
  }
  const savedDate = () => { const d = fromIso(getLead().fecha); return d && dayStatus(d) === 'ok' ? d : null; };

  /* ---------------- common: nav dropdowns, mobile menu ---------------- */
  $$('[data-dd]').forEach(dd => {
    const b = $('button', dd);
    let hoverAt = 0;
    const set = on => { dd.classList.toggle('is-open', on); b.setAttribute('aria-expanded', on); };
    b.addEventListener('click', () => set(Date.now() - hoverAt < 500 ? true : !dd.classList.contains('is-open')));
    dd.addEventListener('mouseenter', () => { if (!isMobile()) { hoverAt = Date.now(); set(true); } });
    dd.addEventListener('mouseleave', () => set(false));
    dd.addEventListener('focusout', e => { if (!dd.contains(e.relatedTarget)) set(false); });
  });
  const mm = $('[data-mmenu]');
  const mOpen = $('[data-mopen]');
  if (mm && mOpen) {
    mOpen.addEventListener('click', () => { mm.hidden = false; mOpen.setAttribute('aria-expanded', 'true'); document.documentElement.classList.add('lf-lock'); setTimeout(() => $('.mm-x', mm).focus(), 30); });
    mm.addEventListener('click', e => { if (e.target.closest('[data-mclose]') || e.target.closest('a')) { mm.hidden = true; mOpen.setAttribute('aria-expanded', 'false'); document.documentElement.classList.remove('lf-lock'); } });
  }
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    $$('[data-dd].is-open').forEach(d => { d.classList.remove('is-open'); $('button', d).setAttribute('aria-expanded', 'false'); });
    if (mm && !mm.hidden) { mm.hidden = true; document.documentElement.classList.remove('lf-lock'); mOpen.focus(); }
  });
  document.addEventListener('click', e => { $$('[data-dd].is-open').forEach(d => { if (!d.contains(e.target)) { d.classList.remove('is-open'); $('button', d).setAttribute('aria-expanded', 'false'); } }); });

  /* in-view autoplay for muted loops (one decode per visible clip; reduced-motion = poster only) */
  const autoplay = vids => {
    if (RM || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => es.forEach(en => {
      const v = en.target;
      if (en.isIntersecting) { v.preload = 'auto'; const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause();
    }), { threshold: .35 });
    vids.forEach(v => io.observe(v));
  };
  autoplay($$('video[data-auto]'));

  /* mouse drag-to-scroll for snap rails */
  $$('[data-drag]').forEach(el => {
    let down = false, sx = 0, sl = 0, moved = false;
    el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = el.scrollLeft; });
    window.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; el.classList.add('is-drag'); } el.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', () => { if (!down) return; down = false; el.classList.remove('is-drag'); });
    el.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  });
  const scrollByCard = (track, dir) => { const c = track.firstElementChild; const w = c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0) : 300; track.scrollBy({ left: dir * w, behavior: RM ? 'auto' : 'smooth' }); };

  /* WhatsApp help form (newsletter slot) */
  $$('[data-waform]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const n = f.n.value.trim(), o = f.o.value, d = f.d.value.trim();
    const t = `Hola Liefloré${n ? ', soy ' + n : ''}. ¿Me ayudan a elegir un arreglo${o ? ' para ' + o.toLowerCase() : ''}?${d ? ' Lo necesito para: ' + d : ''}`;
    window.open(WA + encodeURIComponent(t), '_blank', 'noopener');
  }));

  /* =====================================================================
     HOME
     ===================================================================== */
  if (PAGE === 'home') {
    const rt = $('[data-rv-track]');
    if (rt) { $('[data-rv-prev]').addEventListener('click', () => scrollByCard(rt, -1)); $('[data-rv-next]').addEventListener('click', () => scrollByCard(rt, 1)); }

    const hd = $('[data-hw-date]'); if (hd) { const d = firstAvail(); hd.textContent = (x => x.charAt(0).toUpperCase() + x.slice(1))(fmtDay(d)); }
    const hw = $('[data-hw]'), dots = $$('[data-hw-dots] i');
    if (hw && dots.length) hw.addEventListener('scroll', () => { const i = Math.round(hw.scrollLeft / hw.clientWidth); dots.forEach((d, k) => d.classList.toggle('on', k === i)); }, { passive: true });

    const tl = $('[data-tt-list]');
    if (tl) {
      $('[data-tt-prev]').addEventListener('click', () => scrollByCard(tl, -1));
      $('[data-tt-next]').addEventListener('click', () => scrollByCard(tl, 1));
      // hover preview (desktop, one at a time)
      if (!RM) $$('.tt-tile', tl).forEach(t => {
        const v = $('video', t);
        t.addEventListener('mouseenter', () => { if (isMobile()) return; v.preload = 'auto'; const p = v.play(); if (p && p.catch) p.catch(() => {}); });
        t.addEventListener('mouseleave', () => { v.pause(); });
      });
      const M = $('[data-ttm]'), mv = $('[data-ttm-video]');
      let lastTile = null;
      const close = () => { mv.pause(); mv.removeAttribute('src'); mv.load(); M.hidden = true; document.documentElement.classList.remove('lf-lock'); if (lastTile) lastTile.focus(); };
      tl.addEventListener('click', e => {
        const t = e.target.closest('.tt-tile'); if (!t) return;
        lastTile = t;
        const id = t.dataset.tt;
        mv.src = `../assets/social/tt-${id}.mp4`; mv.poster = `../assets/social/tt-${id}.jpg`; mv.muted = false;
        $('[data-ttm-cap]').textContent = t.dataset.ttCap;
        const pl = $('[data-ttm-prod]'); pl.href = t.dataset.ttHref; pl.textContent = 'Ver ' + t.dataset.ttPn;
        $('[data-ttm-src]').href = `https://www.tiktok.com/@lieflore.mexicali/video/${id}`;
        M.hidden = false; document.documentElement.classList.add('lf-lock');
        const p = mv.play(); if (p && p.catch) p.catch(() => { mv.muted = true; mv.play().catch(() => {}); });
        setTimeout(() => $('.ttm-x', M).focus(), 30);
      });
      M.addEventListener('click', e => { if (e.target.closest('[data-ttm-close]')) close(); });
      M.addEventListener('keydown', e => {
        if (e.key === 'Escape') close();
        if (e.key === 'Tab') { const f = $$('button, a, video', $('.ttm-card', M)); const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
      });
    }

    // gentle parallax on the Membresía band (Freddie's "Art of flowers")
    const pb = $('[data-parallax]');
    if (pb && !RM) {
      let raf = 0;
      const upd = () => { raf = 0; const r = pb.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; const prog = (r.top + r.height / 2 - innerHeight / 2) / (innerHeight / 2 + r.height / 2); pb.style.transform = `translate3d(0, ${(Math.max(-1, Math.min(1, prog)) * 60).toFixed(1)}px, 0)`; };
      addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
      upd();
    }
  }

  /* =====================================================================
     shared product helpers
     ===================================================================== */
  const LF = (K && K.LF) || [];
  const rel = p => K.rel(p);
  const CATN = { 'bouquets-y-ramos': 'Bouquets y ramos', 'bouquets-de-rosas': 'Bouquets de rosas', 'ramos-mixtos-y-de-temporada': 'Ramos mixtos y de temporada', 'cajas-de-flores': 'Cajas de flores', 'floreros': 'Floreros', 'premium': 'Premium: 100 a 250 rosas', 'plantas': 'Plantas', 'condolencias': 'Condolencias', 'complementos': 'Complementos', 'disenos-personalizados': 'Diseños personalizados' };
  const typeOf = p => (p.cats.includes('premium') ? 'Premium' : p.catn[p.catn.length - 1] || p.catn[0]) || 'Arreglo floral';
  const isComp = p => p.cats.includes('complementos');
  const FLOR = [['rosas', /rosa/i, 'Rosas'], ['gerberas', /gerbera/i, 'Gerberas'], ['tulipanes', /tulip/i, 'Tulipanes'], ['peonias', /peon/i, 'Peonías'], ['girasoles', /girasol/i, 'Girasoles'], ['orquideas', /orqu/i, 'Orquídeas'], ['lirios', /lirio/i, 'Lirios']];
  const flowersOf = p => FLOR.filter(([, re]) => re.test(p.t + ' ' + (p.attrs.find(a => /flores/i.test(a.name)) || { terms: [] }).terms.join(' '))).map(f => f[0]);
  const OCC = [['aniversario', 'Aniversario y amor'], ['cumpleanos', 'Cumpleaños'], ['graduacion', 'Graduación'], ['mama', 'Para mamá'], ['porque-si', 'Porque sí']];
  // curated occasion map (real SKUs) on top of keyword matching, so every occasion link returns arrangements
  const OCC_X = {
    aniversario: ['bouquet-de-rosas-clasica', 'bouquet-de-rosas-premium', 'ramo-de-100-rosas-mexicali', '150-rosas-corazon-mexicali', 'bouquet-corazon-de-rosas', 'bouquet-50-rosas-con-corazon', 'florero-de-rosas', 'caja-con-rosas', '200-rosas-rojas', 'arreglo-de-250-rosas-rojas'],
    cumpleanos: ['bouquet-primaveral', 'bouquet-primaveral-con-gerberas', 'bouquet-de-gerberas', 'caja-de-gerberas-fiusha-domicilio-mexicali', 'bouquet-de-girasoles', 'ramo-de-girasol-mexicali', 'caja-primaveral', 'caja-primaveral-amarilla', '24-rosas-rositas-en-florero-mexicali'],
    mama: ['bouquet-de-peonias', 'bouquet-de-tulipanes', 'florero-de-rosas', 'caja-primaveral', 'caja-primaveral-grande-rosita', 'caja-primaveral-aroma-de-rosas-lirios-y-margaritas', '24-rosas-rositas-en-florero-mexicali', 'orquidea-cimbidium-en-maceta', 'bouquet-50-rosas-rositas'],
    graduacion: ['150-rosas-corazon-mexicali', 'bouquet-corazon-de-rosas', 'ramo-de-100-rosas-mexicali', 'bouquet-50-rosas-con-corazon', 'bouquet-de-girasoles', 'ramo-de-100-rosas-rositas', '200-rosas-rojas'],
  };
  const occOf = p => { if (isComp(p) || p.cats.includes('condolencias')) return []; const o = new Set(K.occasionOf(p).filter(x => x !== 'condolencias' && x !== 'nacimiento')); Object.entries(OCC_X).forEach(([k, l]) => { if (l.includes(p.h)) o.add(k); }); o.add('porque-si'); return [...o]; };
  const OCC_T = { aniversario: 'Flores para aniversario y amor en Mexicali', cumpleanos: 'Flores de cumpleaños a domicilio en Mexicali', graduacion: 'Flores para graduación en Mexicali', mama: 'Flores para mamá en Mexicali', 'porque-si': 'Flores porque sí, a domicilio en Mexicali' };
  const BEST = ['florero-de-rosas', 'bouquet-de-rosas-clasica', 'bouquet-de-rosas-premium', 'ramo-de-100-rosas-mexicali', 'caja-primaveral', 'bouquet-primaveral'];
  const card = (p, cls = 'pc') => {
    const simple = !p.v.length || p.v.length === 1;
    const vid = p.v.length === 1 ? p.v[0].id : '';
    const btn = simple ? `<button type="button" class="btn btn-pri" data-lf-add="${p.h}"${vid ? ` data-vid="${vid}"` : ''} aria-label="Enviar ${esc(p.t)}: agregar al carrito">Enviar</button>` : `<a class="btn btn-pri" href="${K.pdpUrl(p)}" aria-label="Enviar ${esc(p.t)}: elegir tamaño">Enviar</a>`;
    return `<li class="${cls}">
      <a class="pc-img" href="${K.pdpUrl(p)}" tabindex="-1" aria-hidden="true"><img src="${rel(p.img[0])}" alt="" loading="lazy">${p.h === 'florero-de-rosas' ? '<span class="pc-flag">Más vendido</span>' : ''}</a>
      <div class="pc-row"><div><a class="pc-t" href="${K.pdpUrl(p)}">${esc(p.t)}</a><p class="pc-type">${esc(typeOf(p))}</p><p class="pc-p">${K.priceLabel(p)}</p></div>${btn}</div>
    </li>`;
  };

  /* =====================================================================
     TIENDA (collection with calendar filter rail)
     ===================================================================== */
  if (PAGE === 'shop' && LF.length) {
    const q = new URLSearchParams(location.search);
    const F = { price: new Set(), cat: new Set(q.get('cat') ? [q.get('cat')] : []), occ: new Set(q.get('occ') ? [q.get('occ')] : []), flor: new Set() };
    let sort = 'rec';
    const PRICE = [['p1', 0, 999, 'Menos de $1,000'], ['p2', 1000, 1999, '$1,000 – $1,999'], ['p3', 2000, 3999, '$2,000 – $3,999'], ['p4', 4000, 1e9, '$4,000 o más']];
    const CATS = ['bouquets-y-ramos', 'bouquets-de-rosas', 'ramos-mixtos-y-de-temporada', 'cajas-de-flores', 'floreros', 'premium', 'plantas', 'condolencias', 'complementos'];
    const count = (fn) => LF.filter(fn).length;
    const group = (key, items) => {
      const fs = $(`[data-f-group="${key}"]`);
      fs.insertAdjacentHTML('beforeend', items.filter(i => i[2] > 0).map(([v, label, n]) => `<label class="ck"><input type="checkbox" value="${v}" data-f="${key}"${F[key].has(v) ? ' checked' : ''}><span class="ck-b"></span>${label} <small>(${n})</small></label>`).join(''));
    };
    group('price', PRICE.map(([k, a, b, l]) => [k, l, count(p => !isComp(p) && K.minPrice(p) >= a && K.minPrice(p) <= b)]));
    group('cat', CATS.map(c => [c, CATN[c], count(p => p.cats.includes(c))]));
    group('occ', OCC.map(([k, l]) => [k, l, count(p => occOf(p).includes(k))]));
    group('flor', FLOR.map(([k, , l]) => [k, l, count(p => !isComp(p) && flowersOf(p).includes(k))]));

    // heading per category / occasion
    const c0 = q.get('cat'), o0 = q.get('occ');
    if (c0 && CATN[c0]) {
      const TT = { 'bouquets-y-ramos': 'Bouquets y ramos a domicilio en Mexicali', 'bouquets-de-rosas': 'Bouquets de rosas a domicilio en Mexicali', 'ramos-mixtos-y-de-temporada': 'Ramos mixtos y de temporada', 'cajas-de-flores': 'Cajas de flores a domicilio en Mexicali', 'floreros': 'Floreros de rosas en Mexicali', 'premium': 'Grandes gestos: de 100 a 250 rosas', 'plantas': 'Plantas para regalar en Mexicali', 'condolencias': 'Arreglos de condolencias en Mexicali', 'complementos': 'Complementos para tu arreglo', 'disenos-personalizados': 'Diseños personalizados' };
      $('[data-cl-title]').textContent = TT[c0] || CATN[c0];
      if (c0 === 'condolencias') $('[data-cl-sub]').textContent = 'Arreglos sobrios para acompañar con respeto. Entrega el mismo día en Mexicali si pides antes de las 3:30\u00a0p.\u00a0m.';
      document.title = $('[data-cl-title]').textContent + ' · Liefloré';
    } else if (o0) { const o = OCC.find(x => x[0] === o0); if (o) { $('[data-cl-title]').textContent = OCC_T[o0]; document.title = $('[data-cl-title]').textContent + ' · Liefloré'; } }

    const grid = $('[data-grid]');
    function list() {
      let r = LF.filter(p => {
        if (isComp(p) && !F.cat.has('complementos')) return false;
        if (F.cat.size && ![...F.cat].some(c => p.cats.includes(c))) return false;
        if (F.occ.size && ![...F.occ].some(o => occOf(p).includes(o))) return false;
        if (F.flor.size && ![...F.flor].some(f => flowersOf(p).includes(f))) return false;
        if (F.price.size && ![...F.price].some(k => { const [, a, b] = PRICE.find(x => x[0] === k); const m = K.minPrice(p); return m >= a && m <= b; })) return false;
        return true;
      });
      if (sort === 'asc') r.sort((a, b) => K.minPrice(a) - K.minPrice(b));
      else if (sort === 'desc') r.sort((a, b) => K.minPrice(b) - K.minPrice(a));
      else if (sort === 'az') r.sort((a, b) => a.t.localeCompare(b.t, 'es'));
      else r.sort((a, b) => { const ia = BEST.indexOf(a.h), ib = BEST.indexOf(b.h); const sa = a.cats.includes('condolencias') ? 999 : 0, sb = b.cats.includes('condolencias') ? 999 : 0; return (sa + (ia < 0 ? 99 : ia)) - (sb + (ib < 0 ? 99 : ib)); });
      return r;
    }
    function draw() {
      const r = list();
      grid.innerHTML = r.length ? r.map(p => card(p)).join('') : `<li class="cl-empty"><p>No encontramos arreglos con esos filtros</p><p><button type="button" class="btn btn-out" data-clear>Quitar filtros</button></p></li>`;
      $('[data-count-txt]').textContent = `${r.length} ${r.length === 1 ? 'arreglo' : 'arreglos'}`;
      const chips = [];
      Object.entries(F).forEach(([k, s]) => s.forEach(v => { const lab = (k === 'price' ? PRICE.find(x => x[0] === v)[3] : k === 'cat' ? CATN[v] : k === 'occ' ? (OCC.find(x => x[0] === v) || [, v])[1] : (FLOR.find(x => x[0] === v) || [, , v])[2]); if (lab) chips.push(`<button type="button" class="cl-chip" data-unf="${k}|${v}" aria-label="Quitar filtro ${esc(lab)}">${esc(lab)} ×</button>`); }));
      $('[data-chips]').innerHTML = chips.join('');
    }
    document.addEventListener('change', e => {
      const i = e.target.closest('[data-f]'); if (i) { F[i.dataset.f][i.checked ? 'add' : 'delete'](i.value); draw(); }
      if (e.target.matches('[data-sort]')) { sort = e.target.value; draw(); }
    });
    document.addEventListener('click', e => {
      const u = e.target.closest('[data-unf]'); if (u) { const [k, v] = u.dataset.unf.split('|'); F[k].delete(v); const cb = $(`[data-f="${k}"][value="${v}"]`); if (cb) cb.checked = false; draw(); }
      if (e.target.closest('[data-clear]')) { Object.values(F).forEach(s => s.clear()); $$('[data-f]').forEach(c => { c.checked = false; }); draw(); }
    });

    // delivery availability: "Entrega hoy" / choose a day (all arrangements deliverable any service day)
    const pill = $('[data-cl-pill] span'), note = $('[data-cal-note]');
    const cbToday = $('[data-f-today]'), cbPick = $('[data-f-pick]');
    const setPill = d => {
      if (!d) { pill.innerHTML = '<b>Pide antes de las 3:30\u00a0p.\u00a0m.</b> y recíbelo hoy en Mexicali'; return; }
      const today = +d === +todayD();
      pill.innerHTML = today ? '<b>Entrega hoy</b> en Mexicali: pide antes de las 3:30\u00a0p.\u00a0m.' : `<b>Recíbelo el ${fmtDay(d)}</b> · todos estos arreglos están disponibles`;
    };
    const cal = Calendar($('[data-cal-inline]'), { sel: savedDate(), onPick: d => { setLead({ fecha: iso(d) }); cbPick.checked = true; cbToday.checked = +d === +todayD(); setPill(d); note.textContent = `Entrega: ${fmtLong(d)}`; } });
    const sd = savedDate(); if (sd) { cbPick.checked = true; cbToday.checked = +sd === +todayD(); setPill(sd); }
    cbToday.addEventListener('change', () => {
      if (!cbToday.checked) { setPill(null); return; }
      const t = todayD(), s = dayStatus(t);
      if (s !== 'ok') { cbToday.checked = false; note.textContent = s === 'sunday' ? 'Hoy es domingo: no hay servicio regular. Elige otro día o escríbenos por WhatsApp' : 'Hoy ya pasó la hora de corte (3:30\u00a0p.\u00a0m.). Elige otro día o escríbenos por WhatsApp'; return; }
      cal.set(t); setLead({ fecha: iso(t) }); cbPick.checked = true; setPill(t); note.textContent = `Entrega: ${fmtLong(t)}`;
    });
    cbPick.addEventListener('change', () => { if (!cbPick.checked) { cal.set(null); cbToday.checked = false; setPill(null); note.textContent = 'Sin servicio regular en domingo · mismo día antes de las 3:30\u00a0p.\u00a0m.'; } });

    // mobile filter sheet
    const rail = $('[data-rail]'); let scrim = null;
    const openRail = () => { rail.classList.add('is-open'); scrim = document.createElement('div'); scrim.className = 'scrim-rail'; scrim.addEventListener('click', closeRail); document.body.appendChild(scrim); document.documentElement.classList.add('lf-lock'); };
    const closeRail = () => { rail.classList.remove('is-open'); if (scrim) scrim.remove(); scrim = null; document.documentElement.classList.remove('lf-lock'); };
    $('[data-rail-open]').addEventListener('click', openRail);
    $$('[data-rail-close]').forEach(b => b.addEventListener('click', closeRail));
    draw();
  }

  /* =====================================================================
     PDP
     ===================================================================== */
  if (PAGE === 'pdp' && LF.length) {
    const q = new URLSearchParams(location.search);
    const p = K.find(q.get('p')) || K.find('bouquet-de-rosas-clasica') || LF[0];
    const comp = isComp(p), sober = p.cats.includes('condolencias');
    document.title = `${p.t} · Liefloré Mexicali`;
    const md = $('meta[name=description]'); if (md) md.content = `${p.t} desde ${K.money(K.minPrice(p))} MXN con IVA. Armado a mano en Mexicali, entrega el mismo día si pides antes de las 3:30\u00a0p.\u00a0m.`;
    $('[data-pd-t]').textContent = p.t; $('[data-bc-t]').textContent = p.t;
    const c0 = p.cats.find(c => c !== 'bouquets-y-ramos') || p.cats[0];
    if (c0) { const a = $('[data-bc-cat]'); a.href = 'tienda.html?cat=' + c0; a.textContent = CATN[c0] || 'Arreglos'; }
    $('[data-pd-wa]').href = WA + encodeURIComponent(`Hola Liefloré, quiero pedir: ${p.t}`);

    /* gallery: main 1:1 + 2-col grid (desktop), swipe slider + counter (mobile); real clip as a gallery tile when one exists */
    const VID = {
      '200-rosas-rojas': ['social/tt-7604022030635142408', '200 rosas rojas · TikTok'],
      'ramo-de-100-rosas-mexicali': ['social/tt-7602653570340506887', '100 rosas · TikTok'],
      'ramo-de-100-rosas-rositas': ['social/tt-7577920905800666388', 'Rosas rosas · TikTok'],
      '50-rosas-mixtas': ['social/tt-7598292102681742610', '50 rosas · TikTok'],
      'bouquet-de-peonias': ['social/tt-7606557060347612424', 'Peonías · TikTok'],
      'bouquet-de-gerberas': ['social/tt-7603176211359042823', 'Gerberas · TikTok'],
      '150-rosas-corazon-mexicali': ['vid/A001_06091458_C051', 'Así armamos un corazón'],
      'bouquet-corazon-de-rosas': ['vid/A001_06091458_C051', 'Así armamos un corazón'],
      'ramo-150-rosas-rojas-mexicali': ['vid/IMG_7271', 'Desde nuestro taller'],
    };
    const imgs = p.img.map(rel);
    const alt = i => `${p.t}${i ? ` · foto ${i + 1}` : ''}`;
    $('[data-gal-main]').innerHTML = `<img src="${imgs[0]}" alt="${esc(alt(0))}">`;
    let g = imgs.slice(1).map((s, i) => `<div><img src="${s}" alt="${esc(alt(i + 1))}" loading="lazy"></div>`).join('');
    const vv = VID[p.h];
    if (vv) g += `<button type="button" class="pd-vid" data-pvid="${vv[0]}" aria-label="Reproducir video: ${esc(vv[1])}"><img src="../assets/${vv[0]}.jpg" alt="" loading="lazy"><span>▶ ${esc(vv[1])}</span></button>`;
    $('[data-gal-grid]').innerHTML = g;
    $('[data-gal-grid]').addEventListener('click', e => {
      const b = e.target.closest('[data-pvid]'); if (!b || b.classList.contains('is-playing')) return;
      b.classList.add('is-playing');
      b.innerHTML = `<video src="../assets/${b.dataset.pvid}.mp4" poster="../assets/${b.dataset.pvid}.jpg" controls autoplay muted loop playsinline></video>`;
    });
    const track = $('[data-gal-track]'), cnt = $('[data-gal-count]');
    const nSlides = () => 1 + $$('[data-gal-grid] > *').length;
    const updCount = () => { const n = nSlides(); cnt.textContent = n > 1 ? `${Math.round(track.scrollLeft / track.clientWidth) + 1} / ${n}` : ''; };
    track.addEventListener('scroll', updCount, { passive: true }); updCount();

    /* price + options (real WooCommerce variations; price 0 combos removed) */
    const vars = p.v.filter(v => v.p > 0);
    const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\s-]+/g, '-');
    const attrFor = part => p.attrs.find(a => a.terms.some(t => norm(t) === norm(part)));
    const flowerWord = (() => { const f = (p.attrs.find(a => /flores/i.test(a.name)) || { terms: [] }).terms[0] || ''; const w = { Rosas: 'rosas', Tulipanes: 'tulipanes', Gerberas: 'gerberas', Peonias: 'peonías', Girasoles: 'girasoles' }[f]; return w || (/rosas/i.test(p.t) ? 'rosas' : ''); })();
    const GN = n => /tama/i.test(n) ? 'Tamaño' : /color/i.test(n) ? 'Color' : /tipo/i.test(n) ? 'Tipo' : n;
    const pretty = (gname, t) => { let s = String(t).replace(/-/g, ' ').replace(/^pequeno$/i, 'Pequeño'); s = s.charAt(0).toUpperCase() + s.slice(1); if (gname === 'Tamaño' && /^\d+$/.test(s) && flowerWord) s += ' ' + flowerWord; return s; };
    const DOT = { amarillo: '#F2D24B', blanco: '#FFFFFF', lila: '#C9A6DA', rojo: '#B3122E', rosado: '#EE86AE', 'rosado-claro': '#F7CAD8', variados: 'conic-gradient(#EE86AE 0 25%, #F2D24B 0 50%, #B3122E 0 75%, #C9A6DA 0)' };
    const groups = []; // [{name, terms:[raw...]}]
    const vparts = vars.map(v => {
      const parts = String(v.t).split(' / ');
      return parts.map((part, i) => { const a = attrFor(part); const name = GN(a ? a.name : (parts.length > 1 ? (i ? 'Color' : 'Tamaño') : 'Opción')); let g = groups.find(x => x.name === name); if (!g) groups.push(g = { name, terms: [] }); if (!g.terms.some(t => norm(t) === norm(part))) g.terms.push(part); return [name, norm(part)]; });
    });
    // keep size order numeric/natural
    groups.forEach(g => { if (g.name === 'Tamaño') { const ord = ['pequeno', 'mediano', 'grande', 'extra-grande']; g.terms.sort((a, b) => { const na = parseFloat(a), nb = parseFloat(b); if (!isNaN(na) && !isNaN(nb)) return na - nb; return ord.indexOf(norm(a)) - ord.indexOf(norm(b)); }); } });
    const dv0 = K.defaultVariant ? K.defaultVariant(p) : null;
    let cur = vars.length ? (vars.find(v => dv0 && v.id === dv0.id) || vars.find(v => /\brojo/i.test(v.t)) || vars[0]) : null;
    const selOf = v => Object.fromEntries(vparts[vars.indexOf(v)]);
    let sel = cur ? selOf(cur) : {};
    const match = s => vars.find((v, i) => vparts[i].every(([n, t]) => s[n] === t));
    const priceTxt = () => cur ? K.money(cur.p) : K.priceLabel(p);
    function drawOpts() {
      const box = $('[data-pd-opts]');
      if (!groups.length) { box.hidden = true; return; }
      box.innerHTML = groups.map(g => `<div class="pd-opt" role="group" aria-label="${g.name}"><p class="pd-lab">${g.name}${g.terms.length > 1 ? '' : ''}</p><div class="pd-chips">${g.terms.map(t => {
        const nt = norm(t), on = sel[g.name] === nt;
        const ok = !!match(Object.assign({}, sel, { [g.name]: nt })) || vars.some((v, i) => vparts[i].some(([n, x]) => n === g.name && x === nt));
        const vx = match(Object.assign({}, sel, { [g.name]: nt }));
        const dot = g.name === 'Color' ? `<i style="background:${DOT[nt] || '#ddd'}"></i>` : '';
        const pr = g.name === 'Tamaño' && vx && groups.length === 1 ? ` <small>${K.money(vx.p)}</small>` : (g.name === 'Tamaño' && vx && vx.p !== cur.p ? ` <small>${K.money(vx.p)}</small>` : '');
        return `<button type="button" class="pd-chip" data-opt="${g.name}|${nt}" aria-pressed="${on}" ${ok ? '' : 'disabled'}>${dot}${esc(pretty(g.name, t))}${pr}</button>`;
      }).join('')}</div></div>`).join('');
      $('[data-pd-price]').textContent = priceTxt();
      $('[data-sticky-p]').textContent = priceTxt();
    }
    $('[data-pd-opts]').addEventListener('click', e => {
      const b = e.target.closest('[data-opt]'); if (!b || b.disabled) return;
      const [n, t] = b.dataset.opt.split('|');
      const want = Object.assign({}, sel, { [n]: t });
      let v = match(want);
      if (!v) v = vars.find((x, i) => vparts[i].some(([gn, gt]) => gn === n && gt === t));
      if (v) { cur = v; sel = selOf(v); }
      drawOpts();
    });
    drawOpts();
    $('[data-pd-price]').textContent = priceTxt();
    $('[data-sticky-p]').textContent = priceTxt();

    /* delivery date → modal calendar; written to ?date= and to the checkout lead */
    const dv = $('[data-date-val]'), dBtn = $('[data-date-open]');
    const CM = $('[data-cm]'); let afterPick = null;
    const fromUrl = (() => { const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(q.get('date') || ''); if (!m) return null; const d = new Date(+m[3], +m[2] - 1, +m[1]); return dayStatus(d) === 'ok' ? d : null; })();
    let date = fromUrl || savedDate();
    const showDate = () => { dv.textContent = date ? (+date === +todayD() ? `Hoy, ${fmtDay(date)}` : fmtDay(date)) : 'Elige una fecha'; dBtn.classList.toggle('has-val', !!date); };
    const msgEl = document.createElement('p'); msgEl.className = 'cm-msg'; msgEl.setAttribute('role', 'status');
    $('[data-cal-modal]').after(msgEl);
    const mcal = Calendar($('[data-cal-modal]'), { sel: date, onPick: d => {
      date = d; showDate(); setLead({ fecha: iso(d) });
      const u = new URL(location.href); u.searchParams.set('date', `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`); history.replaceState(null, '', u);
      setTimeout(() => { closeCM(); if (afterPick) { const f = afterPick; afterPick = null; f(); } }, 180);
    } });
    let lastFocus = null;
    const openCM = (msg) => { lastFocus = document.activeElement; msgEl.textContent = msg || (pastCutoff() ? 'Para hoy ya pasó la hora de corte (3:30\u00a0p.\u00a0m.)' : 'Mismo día si pides antes de las 3:30\u00a0p.\u00a0m.'); mcal.set(date); CM.hidden = false; document.documentElement.classList.add('lf-lock'); setTimeout(() => { const b = $('.cal-g button.is-sel', CM) || $('.cal-g button:not([disabled])', CM); (b || $('.cm-x', CM)).focus(); }, 30); };
    const closeCM = () => { CM.hidden = true; document.documentElement.classList.remove('lf-lock'); if (lastFocus) lastFocus.focus(); };
    dBtn.addEventListener('click', () => openCM());
    CM.addEventListener('click', e => { if (e.target.closest('[data-cm-close]')) { afterPick = null; closeCM(); } });
    CM.addEventListener('keydown', e => { if (e.key === 'Escape') { afterPick = null; closeCM(); } });
    showDate();

    /* add-ons: real Complementos SKUs (variation-level for globos) */
    const XT = [];
    if (!comp && !sober) K.inCat('complementos').forEach(x => {
      const vs = x.v.filter(v => v.p > 0);
      if (vs.length > 1) vs.forEach((v, i) => XT.push({ key: x.h + '|' + v.id, h: x.h, vid: v.id, t: `${x.t} ${v.t.toLowerCase()}`.replace('Globos', 'Globo'), p: v.p, img: rel(x.img[i] || x.img[0]) }));
      else XT.push({ key: x.h + '|' + (vs[0] ? vs[0].id : ''), h: x.h, vid: vs[0] ? vs[0].id : '', t: x.t, p: vs[0] ? vs[0].p : x.p, img: rel(x.img[0]) });
    });
    const chosen = new Set();
    if (XT.length) {
      $('[data-xtra]').innerHTML = XT.map((x, i) => `<li class="xt"><a class="xt-img" href="${K.pdpUrl(K.find(x.h))}" tabindex="-1" aria-hidden="true"><img src="${x.img}" alt="" loading="lazy"></a><label class="ck"><input type="checkbox" data-xt="${i}"><span class="ck-b"></span>Agregar</label><div><p class="xt-n">${esc(x.t)}</p><p class="xt-p">+ ${K.money(x.p)}</p></div></li>`).join('');
      $('[data-xtra]').addEventListener('change', e => { const c = e.target.closest('[data-xt]'); if (c) chosen[c.checked ? 'add' : 'delete'](+c.dataset.xt); });
      const xl = $('[data-xtra]');
      const upA = () => { $('[data-x-prev]').disabled = xl.scrollLeft < 4; $('[data-x-next]').disabled = xl.scrollLeft + xl.clientWidth >= xl.scrollWidth - 4; };
      $('[data-x-prev]').addEventListener('click', () => xl.scrollBy({ left: -320, behavior: RM ? 'auto' : 'smooth' }));
      $('[data-x-next]').addEventListener('click', () => xl.scrollBy({ left: 320, behavior: RM ? 'auto' : 'smooth' }));
      xl.addEventListener('scroll', upA, { passive: true }); upA();
    } else $('[data-xtra-wrap]').hidden = true;

    /* card message → lead.msg (prefills the checkout popup) */
    const msg = $('[data-msg]');
    msg.value = getLead().msg || '';
    $('[data-msg-n]').textContent = msg.value.length;
    msg.addEventListener('input', () => { $('[data-msg-n]').textContent = msg.value.length; setLead({ msg: msg.value }); });

    /* CONTINUAR → date required (Freddie's flow) → shared drawer */
    const buy = () => {
      if (!date) { openCM('Elige la fecha de entrega para continuar'); afterPick = buy; return; }
      setLead({ fecha: iso(date), msg: msg.value });
      K.add(p.h, cur ? cur.id : (p.v[0] ? p.v[0].id : undefined));
      chosen.forEach(i => { const x = XT[i]; K.add(x.h, x.vid); });
    };
    $$('[data-buy]').forEach(b => b.addEventListener('click', buy));
    if (comp) $$('[data-buy]').forEach(b => { b.textContent = 'Agregar al carrito'; });

    /* description + "Qué incluye" */
    const paras = s => String(s || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);
    const sd = paras(p.sd), dd = String(p.d || '');
    const incI = dd.search(/Incluye:?/i);
    const lead = sd.length ? sd : paras(incI > 0 ? dd.slice(0, incI) : dd).slice(0, 6);
    $('[data-pd-desc]').innerHTML = (lead.length ? lead : [`${p.t}, armado a mano en nuestro taller de Mexicali.`]).map(x => `<p>${esc(x)}</p>`).join('');
    if (incI >= 0) {
      const inc = paras(dd.slice(incI).replace(/^Incluye:?/i, '')).slice(0, 10);
      if (inc.length) { $('[data-pd-inc]').innerHTML = inc.map(x => `<p>${esc(x)}</p>`).join(''); $('[data-acc-inc]').hidden = false; }
    }

    /* condolencias: sober page, no romantic story/video; cross-sell only sober options */
    if (sober) { const st0 = $('.pd-story'); if (st0) st0.hidden = true; }
    const xsSec = $('.xs');
    if (sober) {
      const so = LF.filter(x => x.h !== p.h && (x.cats.includes('condolencias') || x.cats.includes('plantas')));
      if (so.length) { $('[data-xs]').innerHTML = so.map(x => `<li class="xs-c"><a href="${K.pdpUrl(x)}" style="text-decoration:none;color:inherit"><span class="pc-img"><img src="${rel(x.img[0])}" alt="" loading="lazy"></span><p>${esc(x.t)}</p><b>${K.priceLabel(x)}</b></a></li>`).join(''); $('#xs-h').textContent = 'También disponible'; $$('.xs .pd-xtra-arr').forEach(e => { e.hidden = true; }); }
      else xsSec.hidden = true;
    } else {
    const same = LF.filter(x => x.h !== p.h && !isComp(x) && !x.cats.includes('condolencias') && x.cats.some(c => p.cats.includes(c) && c !== 'bouquets-y-ramos'));
    const pool = [...same, ...BEST.map(K.find).filter(Boolean), ...LF.filter(x => !isComp(x) && !x.cats.includes('condolencias'))];
    const seen = new Set([p.h]); const xs = [];
    pool.forEach(x => { if (x && !seen.has(x.h) && xs.length < 8) { seen.add(x.h); xs.push(x); } });
    $('[data-xs]').innerHTML = xs.map(x => `<li class="xs-c"><a href="${K.pdpUrl(x)}" style="text-decoration:none;color:inherit"><span class="pc-img"><img src="${rel(x.img[0])}" alt="" loading="lazy"></span><p>${esc(x.t)}</p><b>${K.priceLabel(x)}</b></a></li>`).join('');
    const xsl = $('[data-xs]');
    $('[data-xs-prev]').addEventListener('click', () => scrollByCard(xsl, -1));
    $('[data-xs-next]').addEventListener('click', () => scrollByCard(xsl, 1));
    }

    /* mobile sticky price + CONTINUAR when the main button is off-screen */
    const st = $('[data-sticky]'), mainBuy = $('.pd-buy');
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => st.classList.toggle('is-on', !en.isIntersecting && en.boundingClientRect.top > 0 ? true : !en.isIntersecting && en.boundingClientRect.top < 0), { threshold: 0 }).observe(mainBuy);
  }
})();
