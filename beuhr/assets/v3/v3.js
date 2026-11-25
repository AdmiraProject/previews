
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  const B = window.BEUHR;
  const L = (o) => (o && typeof o === 'object' && ('es' in o || 'en' in o)) ? (o[LANG] ?? o.es) : o;

  // —— header: transparent over hero → solid on scroll ——
  const hd = $('[data-hd]');
  const solidAlways = document.body.classList.contains('hd-solid');
  const onScroll = () => {
    const y = window.scrollY;
    if (hd) hd.classList.toggle('is-solid', solidAlways || y > 24);
    const mb = $('[data-mbar]'); if (mb) mb.classList.toggle('is-on', y > 480 || document.body.classList.contains('pg-pdp'));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // —— background loops: muted, pause offscreen, poster only under reduced motion ——
  const loops = [...document.querySelectorAll('video[data-loop]')];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) loops.forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });
  else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { const v = e.target; if (e.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause(); }), { threshold: 0.05 });
    loops.forEach((v) => io.observe(v));
  }

  // —— before/after compare slider (cabello): drag or arrow keys move the divider ——
  document.querySelectorAll('[data-ba]').forEach((box) => {
    const h = box.querySelector('[data-ba-handle]'); if (!h) return;
    const set = (v) => { v = Math.max(4, Math.min(96, v)); box.style.setProperty('--p', v + '%'); h.setAttribute('aria-valuenow', Math.round(v)); };
    const at = (y) => { const r = box.getBoundingClientRect(); set(((y - r.top) / r.height) * 100); };
    h.addEventListener('pointerdown', (e) => { e.preventDefault(); h.setPointerCapture(e.pointerId); const mv = (ev) => at(ev.clientY); const up = () => { h.removeEventListener('pointermove', mv); h.removeEventListener('pointerup', up); }; h.addEventListener('pointermove', mv); h.addEventListener('pointerup', up); });
    h.addEventListener('keydown', (e) => { const v = parseFloat(h.getAttribute('aria-valuenow')) || 50; if (e.key === 'ArrowUp') { e.preventDefault(); set(v - 5); } if (e.key === 'ArrowDown') { e.preventDefault(); set(v + 5); } });
  });

  // —— mobile menu ——
  const mnav = $('#mnav');
  const openBtn = $('[data-menu-open]');
  const setMenu = (on) => { if (!mnav) return; mnav.hidden = !on; openBtn && openBtn.setAttribute('aria-expanded', on); document.documentElement.classList.toggle('menu-lock', on); if (on) { const x = $('[data-menu-close]'); x && x.focus(); } };
  openBtn && openBtn.addEventListener('click', () => setMenu(true));
  $$('[data-menu-close]').forEach((b) => b.addEventListener('click', () => setMenu(false)));
  mnav && mnav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // —— accordions ——
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.acc__btn'); if (!b) return;
    const on = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', on);
    const p = document.getElementById(b.getAttribute('aria-controls')); if (!p) return;
    // Chakra Collapse: height 0 <-> auto, 200ms ease-out (open) / 200ms ease-in (close)
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches || !p.animate;
    if (on) { p.hidden = false; if (!still) { const h = p.scrollHeight; p.style.overflow = 'hidden'; p.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 200, easing: 'ease-out' }).onfinish = () => { p.style.overflow = ''; }; } }
    else if (still) p.hidden = true;
    else { const h = p.scrollHeight; p.style.overflow = 'hidden'; p.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 200, easing: 'ease-in' }).onfinish = () => { p.hidden = true; p.style.overflow = ''; }; }
  });

  // —— horizontal sliders with arrows ——
  $$('[data-slider]').forEach((wrap) => {
    const track = $('[data-track]', wrap); if (!track) return;
    const step = () => { const c = track.firstElementChild; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : 300; };
    $$('[data-prev]', wrap).forEach((b) => b.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' })));
    $$('[data-next]', wrap).forEach((b) => b.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' })));
  });

  // —— cabello mini-quiz / any [data-goal] links keep the goal ——
  // (plain links; nothing to do)


  // ===================== PDP (?p=) =====================
  window.V3PDP = function (B, L, LANG) {
    const C = window.V3C; if (!C) return;
    const D = C.pdp; const root = $('[data-pdp]'); if (!root) return;
    const id = new URLSearchParams(location.search).get('p');
    const p = (id && B.byId(id)) || B.byId(root.dataset.id);
    const base = (() => { const s = $('script[src*="core/data.js"]'); return s ? s.getAttribute('src').replace(/core\/data\.js.*$/, '') : '../../assets/'; })();
    const money = (n) => '$' + Number(n).toLocaleString('en-US') + ' MXN';
    const tr = (a) => Object.entries(D.act || {}).reduce((s, [k, v]) => s.split(k).join(v), a);
    const sub = (s, m) => String(s).replace(/\{(\w+)\}/g, (_, k) => (k in m ? m[k] : '{' + k + '}'));
    const set = (k, v, attr) => $$('[data-pf="' + k + '"]').forEach((el) => { if (attr) el.setAttribute(attr, v); else el.textContent = v; });
    const pp = D.pp[p.id] || {};
    const rx = !!p.rx; const line = p.line;
    const goal = line === 'sex' ? 'sex' : 'hair';
    const body = document.body;
    body.classList.toggle('is-rx', rx); body.classList.toggle('is-otc', !rx); body.classList.toggle('is-hair', line === 'hair');
    root.dataset.kind = rx ? 'rx' : 'otc'; root.dataset.line = line; root.dataset.id = p.id;
    const vars = { name: p.name, blurb: L(p.blurb), format: L(p.format), purpose: L(p.purpose) || L(p.blurb), how: pp.how || L(p.format), mg: pp.mg || '' };
    document.title = sub(D.title, vars);
    set('name', p.name); set('mname', p.name);
    set('blurb', L(p.blurb) + ' ' + (rx ? L(p.does) + ' ' + D.lead_rx : L(p.purpose) + ' ' + D.lead_otc)); set('dosefmt', L(p.dose) + ' · ' + L(p.format));
    set('price', money(p.price)); set('price2', money(p.price)); set('mprice', money(p.price));
    ['quizlink', 'quizlink2', 'quizlink3'].forEach((k) => set(k, 'quiz.html?goal=' + goal, 'href'));
    ['add', 'add2', 'add3'].forEach((k) => set(k, p.id, 'data-id'));
    const cut = base + 'v3/img/cut/' + p.id + '-r.webp';
    set('cut', cut, 'src'); set('cut', p.name, 'alt'); set('cut2', cut, 'src');
    const glow = $('[data-pf="glow"]'); if (glow) glow.style.setProperty('--glow', p.color || 'transparent');
    set('scene', base + (p.img.scene || p.img.card), 'src');
    set('qn', p.name); set('q1', L(p.dose)); set('q2', L(p.format)); const q3 = $('[data-pf="q3"]'); if (q3) q3.textContent = rx ? q3.dataset.rx : q3.dataset.otc;
    if (pp.quote) set('quote', '“' + pp.quote + '”');
    // reviews by line
    const order = line === 'sex' ? [3, 0, 1] : line === 'hair' ? [0, 1, 2] : [2, 0, 1];
    const row = $('.prev__row');
    if (row) order.forEach((k) => { const el = $('[data-rv="' + k + '"]', row); if (el) { el.hidden = false; row.appendChild(el); } });
    $$('[data-rv]').forEach((el) => { if (!order.includes(+el.dataset.rv)) { el.hidden = true; if (row) row.appendChild(el); } });
    // formula
    const acts = p.actives.map(tr);
    set('formula', rx ? sub(acts.length > 1 ? D.formula_rx : D.formula_rx1, { name: p.name, n: acts.join(LANG === 'es' ? ' y ' : ' and ') }) : sub(D.formula_otc, { name: p.name, n: acts.length, mg: vars.mg }));
    const grid = $('[data-pf="actives"]');
    if (grid) { const ic = grid.querySelector('.ic'); const icon = ic ? ic.outerHTML : ''; grid.innerHTML = acts.map((a) => { let i = a.indexOf(' '); if (i > 0 && !/\d/.test(a[i + 1])) i = -1; return '<li class="ftile">' + icon + '<h3>' + (i > 0 ? a.slice(0, i) : a) + '</h3></li>'; }).join(''); }
    $$('[data-cmp]').forEach((r) => r.classList.toggle('is-cur', r.dataset.cmp === p.id));
    if (p.img.panel) set('panel', base + p.img.panel, 'src');
    // chips / ship
    if (pp.chip) { set('chip0', pp.chip[0]); set('chip1', pp.chip[1]); set('chip2', pp.chip[2]); }
    set('home', sub(D.home_h, vars)); set('fit', sub(D.fit_h, vars));
    if (rx) { set('fitk0', D.fit_rx[0]); set('fitk1', D.fit_rx[1]); set('fit0', L(p.ideal)); set('fit1', L(p.does)); }
    else { set('fitk0', D.fit_otc[0]); set('fitk1', D.fit_otc[1]); set('fit0', L(p.purpose)); set('fit1', pp.how || L(p.format)); }
    ['legal', 'legal2'].forEach((k) => set(k, rx ? C.legal.rx : C.legal.supp));
    // promises (Rx) / transparency (OTC)
    if (rx) {
      const pr = B.promises.slice();
      if (line !== 'hair') pr[2] = { t: D.ship_card.t, d: D.ship_card.d };
      set('trh', D.tr_h_rx); pr.forEach((x, i) => { set('trk' + i, L(x.t)); set('trd' + i, L(x.d)); });
    } else {
      set('trh', D.tr_h_otc); const v = [L(p.blurb), L(p.purpose), pp.how || L(p.format)];
      D.tr_otc_k.forEach((k, i) => { set('trk' + i, k); set('trd' + i, v[i]); });
    }
    // cross-sell
    const also = $('[data-pf="also"]');
    if (also && D.also[line]) { const arr = also.querySelector('.ic'); const ic = arr ? arr.outerHTML : ''; also.innerHTML = D.also[line].map((a) => '<a class="acard" href="' + a.href + '"><div class="acard__in"><div class="acard__top"><p class="acard__t">' + a.t + '</p>' + ic + '</div><p>' + a.d + '</p></div></a>').join(''); }
    // faq
    const fq = rx ? D.faq_rx : D.faq_otc;
    $$('#faq .acc__item').forEach((it, i) => { const f = fq[i]; if (!f) { it.hidden = true; return; } it.hidden = false; $('.acc__q', it).textContent = sub(f.q, vars); $('.acc__panel p', it).textContent = sub(f.a, vars); });
    // OTC stock
    if (!rx && p.stock === false) {
      $$('[data-add]').forEach((b) => { b.disabled = true; const l = b.querySelector('.btn__l') || b; l.textContent = LANG === 'en' ? 'Sold out' : 'Agotado'; b.classList.add('is-off'); });
      $$('.buy__legal, [data-pf="legal2"]').forEach((el) => { el.innerHTML = el.textContent + ' <a class="u" href="https://wa.me/' + B.contact.wa + '" target="_blank" rel="noopener">' + D.soldout_note + '</a>'; });
    }
    // bundle pills → data-qty
    const pick = (q) => {
      $$('.buy__pills.k-otc .ppill').forEach((x) => { const on = x.dataset.qty === String(q); x.classList.toggle('is-on', on); x.setAttribute('aria-checked', on); });
      $$('[data-add]').forEach((a) => { a.dataset.qty = q; });
      const bd = B.bundles.find((x) => x.n === +q); if (!rx) set('mprice', money(bd ? bd.price : p.price * q));
    };
    $$('.buy__pills.k-otc').forEach((g) => g.addEventListener('click', (e) => { const b = e.target.closest('.ppill'); if (b) pick(b.dataset.qty); }));
    if (!rx) pick(2);
    document.documentElement.dataset.pdpReady = p.id;
  };



  window.V3QUIZ = function () {
    const page = $('[data-qpage]'); const root = $('[data-quiz]'); if (!page || !root) return;
    const goal = new URLSearchParams(location.search).get('goal');
    const go = (st) => { page.dataset.state = st; document.body.dataset.qstate = st; if (st === 'quiz') { const h = $('.qz__q', root); h && h.setAttribute('tabindex', '-1'); } scrollTo({ top: 0 }); };
    $$('[data-qz-start]').forEach((b) => b.addEventListener('click', () => go('quiz')));
    document.body.dataset.qstate = 'intro';
    if (new URLSearchParams(location.search).get('start')) go('quiz');
    const title = $('[data-qz-title]');
    root.addEventListener('qz:render', (e) => {
      const d = e.detail || {}; const id = d.id;
      const scr = $('.qz__screen', root);
      const isGoal = id === 'goal';
      page.dataset.screen = isGoal ? 'goal' : (['result', 'done', 'stop', 'otc'].includes(id) ? 'result' : 'q');
      const h = $('.qz__q', root);
      if (h && !isGoal && page.dataset.screen === 'q' && scr && !['info'].includes(scr.dataset.type)) h.dataset.n = d.index;
      if (title) title.textContent = page.dataset.screen === 'result' ? title.dataset.tR : title.dataset.tQ;
      const bk = $('[data-qz-back]'); if (bk) bk.hidden = isGoal && !goal;
    });
    $$('[data-qz-back]').forEach((b) => b.addEventListener('click', () => { const x = $('.qz__back', root); if (x && !x.hidden) x.click(); else go('intro'); }));
  };

  // —— PDP: ?p= swap ——
  if (document.body.dataset.page === 'product' && B && window.V3PDP) window.V3PDP(B, L, LANG);
  // —— quiz chrome ——
  if (document.body.dataset.page === 'quiz' && window.V3QUIZ) window.V3QUIZ();
})();
