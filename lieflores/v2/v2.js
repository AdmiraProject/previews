/* Liefloré v2 — urbanstems.com structure. Uses window.LFK (lf-core.js) for cart, drawer and checkout. */
(function () {
  const K = window.LFK; if (!K) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const A = K.ASSET;
  const esc = K.esc, money = K.money;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = 'https://wa.me/526864321342?text=';
  const page = document.body.dataset.page;

  /* extra gallery images that exist in assets/p (variation photos) */
  K.LF.forEach(p => { p.t = p.t.replace(/\bclasica\b/g, 'clásica'); });
  const EXTRA = { 'florero-de-rosas': 8, 'bouquet-50-rosas-personalizado': 6, 'bouquet-corazon-de-rosas': 6, 'bouquet-de-girasoles': 3, 'bouquet-de-rosas-clasica': 6, 'bouquet-de-rosas-premium': 12 };
  const imgsOf = p => EXTRA[p.h] ? Array.from({ length: EXTRA[p.h] }, (_, i) => `assets/p/${p.h}-${i + 1}.jpg`) : p.img;

  /* ---------- delivery dates (Mexicali time, cutoff 3:30 p. m., no regular Sunday service) ---------- */
  const CUT = 15 * 60 + 30;
  function mxNow() {
    const f = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Tijuana', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short' });
    const o = Object.fromEntries(f.formatToParts(new Date()).map(x => [x.type, x.value]));
    return { iso: `${o.year}-${o.month}-${o.day}`, mins: +o.hour * 60 + +o.minute, wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday) };
  }
  const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const wdOf = iso => new Date(iso + 'T12:00:00Z').getUTCDay();
  const NOW = mxNow();
  const sameDayOpen = NOW.wd !== 0 && NOW.mins < CUT;
  let EARLIEST = NOW.iso;
  if (!sameDayOpen) { EARLIEST = addDays(NOW.iso, 1); while (wdOf(EARLIEST) === 0) EARLIEST = addDays(EARLIEST, 1); }
  const fmtDay = iso => new Date(iso + 'T12:00:00Z').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).replace(/[.,]/g, '');
  const rel = iso => iso === NOW.iso ? 'hoy' : iso === addDays(NOW.iso, 1) ? 'mañana' : 'el ' + fmtDay(iso);
  const validDate = iso => { let d = iso && iso >= EARLIEST ? iso : EARLIEST; while (wdOf(d) === 0) d = addDays(d, 1); return d; };
  const lead = () => { try { return JSON.parse(localStorage.getItem('lf-lead') || '{}'); } catch (e) { return {}; } };
  const saveLead = o => { try { localStorage.setItem('lf-lead', JSON.stringify(Object.assign(lead(), o))); } catch (e) {} };
  let DATE = validDate(lead().fecha);

  /* ---------- product helpers ---------- */
  const COLORS = { amarillo: '#f2c94c', blanco: '#ffffff', lila: '#c7a3d8', rojo: '#b3122e', rosado: '#e889a8', 'rosado-claro': '#f6cbd8' };
  const SIZEW = { pequeno: 'Pequeño', mediano: 'Mediano', grande: 'Grande', 'extra-grande': 'Extra grande' };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const colorName = c => cap(c.replace('-', ' '));
  const nounOf = p => { const t = p.t.toLowerCase(); return /tulip/.test(t) ? 'tulipanes' : /gerbera/.test(t) ? 'gerberas' : /peon/.test(t) ? 'peonías' : /girasol/.test(t) ? 'girasoles' : /rosa/.test(t) ? 'rosas' : 'flores'; };
  const vars = p => p.v.filter(v => v.p > 0).map(v => {
    const parts = v.t.split('/').map(s => s.trim().toLowerCase());
    let size = '', color = '';
    parts.forEach(x => { if (COLORS[x]) color = x; else size = size ? size + ' ' + x : x; });
    return { ...v, size, color };
  });
  const sizeLabel = (p, s) => /^\d+$/.test(s) ? `${s} ${nounOf(p)}` : SIZEW[s] || cap(s.replace(/-/g, ' '));
  const defVar = p => { const vs = vars(p); if (!vs.length) return null; const d = K.defaultVariant && K.defaultVariant(p); const m = d && vs.find(v => v.id === d.id && v.color === 'rojo'); return m || vs.find(v => v.color === 'rojo') || vs.reduce((a, b) => (b.p < a.p ? b : a)); };
  const priceLabel = K.priceLabel;
  const svg = (id, vb, w, h) => `<svg viewBox="${vb}" style="width:${w}px;height:${h}px" aria-hidden="true"><use href="#${id}"/></svg>`;

  function card(p, o = {}) {
    if (!p) return '';
    const im = imgsOf(p), dv = defVar(p);
    const pill = o.pill ? `<span class="pill${DATE === NOW.iso ? ' is-today' : ''}" data-pill>${svg('i-truck', '0 0 20 20', 13, 13)}${pillText()}</span>` : '';
    return `<article class="pc${o.rv ? ' rv' : ''}">
      <div class="pc__media"><a href="${K.pdpUrl(p)}" tabindex="-1" aria-hidden="true"><img src="${K.rel(im[0])}" alt="" loading="lazy">${im[1] ? `<img class="alt" src="${K.rel(im[1])}" alt="" loading="lazy">` : ''}</a>
        <button class="pc__qa" type="button" data-lf-add="${p.h}"${dv ? ` data-vid="${dv.id}"` : ''} aria-label="Agregar ${esc(p.t)} al carrito">${svg('i-bagplus', '0 0 18 18', 18, 18)}<span>Agregar</span></button></div>
      ${pill}<a class="pc__t" href="${K.pdpUrl(p)}">${esc(p.t)}</a>
      <p class="pc__p">${priceLabel(p)}</p>
      ${o.meta ? `<p class="pc__m" data-pill-t>${DATE === NOW.iso ? 'Recíbelo hoy si pides antes de las 3:30 p. m.' : 'Recíbelo ' + rel(DATE) + ' en Mexicali'}</p>` : ''}
    </article>`;
  }
  const pillText = () => DATE === NOW.iso ? 'Recíbelo hoy · antes de 3:30 p. m.' : 'Recíbelo ' + rel(DATE);
  const renderList = (el, slugs, o) => { el.innerHTML = slugs.map(K.find).filter(Boolean).map(p => card(p, o)).join(''); };

  /* ---------- header: mega menu, search, mobile menu ---------- */
  const hdr = $('.hdr');
  const setHdr = () => document.documentElement.style.setProperty('--hdr', hdr.offsetHeight + 'px');
  setHdr(); addEventListener('resize', setHdr);
  const mega = $('#mega'), megaBtn = $('[data-mega]'), scrim = $('[data-mega-scrim]');
  let megaT;
  const setMega = on => { mega.classList.toggle('is-open', on); scrim.classList.toggle('is-open', on); megaBtn.setAttribute('aria-expanded', on); };
  megaBtn.addEventListener('click', () => setMega(!mega.classList.contains('is-open')));
  if (matchMedia('(hover: hover) and (min-width: 1024px)').matches) {
    [megaBtn, mega].forEach(el => { el.addEventListener('mouseenter', () => { clearTimeout(megaT); setMega(true); }); el.addEventListener('mouseleave', () => { megaT = setTimeout(() => setMega(false), 160); }); });
  }
  scrim.addEventListener('click', () => setMega(false));
  const srch = $('#srch'), sBtn = $('[data-search]');
  sBtn.addEventListener('click', () => { const on = !srch.classList.contains('is-open'); srch.classList.toggle('is-open', on); sBtn.setAttribute('aria-expanded', on); if (on) $('input', srch).focus(); });
  const mm = $('#mm'), mmBtn = $('[data-mm-open]');
  const setMM = on => { if (on) mm.hidden = false; requestAnimationFrame(() => mm.classList.toggle('is-open', on)); mmBtn.setAttribute('aria-expanded', on); document.documentElement.classList.toggle('lf-lock', on); if (on) setTimeout(() => $('.mm__x', mm).focus(), 50); else setTimeout(() => { if (!mm.classList.contains('is-open')) mm.hidden = true; }, 320); };
  mmBtn.addEventListener('click', () => setMM(true));
  $$('[data-mm-close]').forEach(b => b.addEventListener('click', () => setMM(false)));
  $$('[data-cart-open]', mm).forEach(b => b.addEventListener('click', () => setMM(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { setMega(false); if (mm.classList.contains('is-open')) setMM(false); closeVM(); closeFD && closeFD(); } });
  $$('.ft__col h3 button').forEach(b => b.addEventListener('click', () => { const c = b.closest('.ft__col'); c.classList.toggle('is-open'); b.setAttribute('aria-expanded', c.classList.contains('is-open')); }));

  /* ---------- drawer: card message (saved for the checkout popup) ---------- */
  const msg = $('[data-msg]'), msgN = $('[data-msg-n]');
  if (msg) {
    msg.value = lead().msg || ''; msgN.textContent = msg.value.length;
    msg.addEventListener('input', () => { msgN.textContent = msg.value.length; saveLead({ msg: msg.value }); syncMsg(msg); });
  }
  function syncMsg(src) { $$('[data-msg],[data-pdp-msg]').forEach(t => { if (t !== src) { t.value = src.value; const n = t.closest('.msg,.cd__gift'); const c = n && n.querySelector('[data-msg-n],[data-pdp-msg-n]'); if (c) c.textContent = t.value.length; } }); }
  // keep checkout popup prefilled with chosen date
  document.addEventListener('click', e => { if (e.target.closest('[data-checkout]')) saveLead({ fecha: DATE }); }, true);

  /* ---------- carousels ---------- */
  function initCar(car) {
    if (car._init) { car._upd && car._upd(); return; } car._init = true;
    const tr = $('[data-track]', car), prev = $('[data-prev]', car), next = $('[data-next]', car), sb = $('[data-sbar]', car), drag = sb && $('i', sb);
    const upd = () => {
      const max = tr.scrollWidth - tr.clientWidth;
      if (prev) prev.disabled = tr.scrollLeft <= 2;
      if (next) next.disabled = tr.scrollLeft >= max - 2;
      if (drag) { const r = tr.clientWidth / tr.scrollWidth; drag.style.width = Math.min(100, r * 100) + '%'; drag.style.left = (max > 0 ? (tr.scrollLeft / max) * (100 - r * 100) : 0) + '%'; sb.style.visibility = max > 2 ? 'visible' : 'hidden'; }
    };
    car._upd = upd;
    const step = d => { const kid = tr.children[0]; const w = kid ? kid.getBoundingClientRect().width + parseFloat(getComputedStyle(tr).columnGap || 16) : 300; const n = Math.max(1, Math.floor(tr.clientWidth / w)); tr.scrollBy({ left: d * n * w, behavior: RM ? 'auto' : 'smooth' }); };
    prev && prev.addEventListener('click', () => step(-1));
    next && next.addEventListener('click', () => step(1));
    tr.addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd);
    if (sb) sb.addEventListener('click', e => { const r = sb.getBoundingClientRect(); tr.scrollTo({ left: ((e.clientX - r.left) / r.width) * (tr.scrollWidth - tr.clientWidth), behavior: RM ? 'auto' : 'smooth' }); });
    upd(); setTimeout(upd, 400);
  }
  const initCars = (root = document) => $$('[data-car]', root).forEach(initCar);

  /* ---------- reveal + review fan ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .2 }) : null;
  const reveal = (root = document) => $$('.rv:not(.in), .rc:not(.in)', root).forEach(el => io ? io.observe(el) : el.classList.add('in'));

  /* ---------- videos ---------- */
  const vio = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting && !v._paused) v.play().catch(() => {}); else v.pause(); }), { threshold: .4 }) : null;
  $$('[data-autovideo]').forEach(w => {
    const v = $('video', w), b = $('[data-vtoggle]', w);
    if (RM) { v.remove(); b && b.remove(); return; }
    v.addEventListener('playing', () => { $('img', w) && ($('img', w).style.opacity = 0); });
    vio && vio.observe(v);
    b && b.addEventListener('click', () => { if (v.paused) { v._paused = false; v.play(); b.innerHTML = svg('i-pause', '0 0 12 12', 12, 12); b.setAttribute('aria-label', 'Pausar video'); } else { v._paused = true; v.pause(); b.innerHTML = svg('i-play', '0 0 12 12', 12, 12); b.setAttribute('aria-label', 'Reproducir video'); } });
  });
  // UGC tiles: hover plays (desktop), one featured big tile plays in view, click opens 9:16 modal
  const tiles = $$('[data-ut]');
  const playTile = t => { if (RM) return; const v = $('video', t); if (!v.src) v.src = t.dataset.src; tiles.forEach(o => { if (o !== t) { o.classList.remove('is-playing'); $('video', o).pause(); } }); v.play().then(() => t.classList.add('is-playing')).catch(() => {}); };
  const stopTile = t => { t.classList.remove('is-playing'); $('video', t).pause(); };
  tiles.forEach(t => {
    if (matchMedia('(hover: hover)').matches) { t.addEventListener('mouseenter', () => playTile(t)); t.addEventListener('mouseleave', () => stopTile(t)); }
    t.addEventListener('click', () => openVM(t));
  });
  if ('IntersectionObserver' in window && !RM) {
    const tio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !tiles.some(x => x.classList.contains('is-playing'))) playTile(e.target); else if (!e.isIntersecting) stopTile(e.target); }), { threshold: .75 });
    $$('.ut--b').forEach(t => tio.observe(t));
  }
  const vm = $('#vm'); let vmFrom = null;
  function openVM(t) {
    if (!vm) return; vmFrom = t; tiles.forEach(stopTile);
    const v = $('video', vm); v.src = t.dataset.src; v.poster = $('img', t).src;
    $('[data-vm-cap]', vm).textContent = t.dataset.cap; $('[data-vm-link]', vm).href = t.dataset.link;
    vm.hidden = false; vm.classList.add('is-open'); document.documentElement.classList.add('lf-lock');
    v.play().catch(() => {}); $('.vm__x', vm).focus();
  }
  function closeVM() { if (!vm || !vm.classList.contains('is-open')) return; const v = $('video', vm); v.pause(); vm.classList.remove('is-open'); vm.hidden = true; document.documentElement.classList.remove('lf-lock'); vmFrom && vmFrom.focus(); }
  vm && vm.addEventListener('click', e => { if (e.target === vm || e.target.closest('[data-vm-close]')) closeVM(); });
  let closeFD = null;

  /* ================= HOME ================= */
  if (page === 'home') {
    $$('[data-grid]').forEach(el => renderList(el, el.dataset.grid.split(','), { meta: true }));
    const prem = K.inCat('premium').map(K.minPrice); if (prem.length && $('[data-min-premium]')) $('[data-min-premium]').textContent = money(Math.min(...prem));
    const allHref = ['tienda.html?cat=bouquets-de-rosas', 'tienda.html?cat=cajas-de-flores', 'tienda.html?cat=complementos'];
    $$('.bs [data-tab]').forEach(t => t.addEventListener('click', () => {
      const i = +t.dataset.tab;
      $$('.bs [data-tab]').forEach(x => x.setAttribute('aria-selected', x === t));
      $$('.bs__panel').forEach((p, j) => p.hidden = j !== i);
      $('[data-bs-all]').href = allHref[i];
      initCars($$('.bs__panel')[i]);
    }));
  }

  /* ================= SHOP ================= */
  if (page === 'shop') {
    const q = new URLSearchParams(location.search);
    const state = { cats: q.get('cat') ? [q.get('cat')] : [], occ: q.get('occ') || '', q: (q.get('q') || '').trim().toLowerCase(), sort: q.get('sort') || 'pop' };
    const CATS = { 'bouquets-y-ramos': 'Bouquets y ramos', 'bouquets-de-rosas': 'Bouquets de rosas', 'ramos-mixtos-y-de-temporada': 'Ramos mixtos y de temporada', 'cajas-de-flores': 'Cajas de flores', premium: 'Grandes gestos', floreros: 'Floreros', plantas: 'Plantas', condolencias: 'Condolencias', complementos: 'Complementos' };
    const OCC = { aniversario: 'Aniversario y amor', cumpleanos: 'Cumpleaños', graduacion: 'Graduación', mama: 'Para mamá', porquesi: 'Porque sí' };
    const SUBS = { premium: 'Ramos y arreglos de 100 a 250 rosas, armados a mano en nuestro taller de Mexicali', condolencias: 'Arreglos sobrios para acompañar con respeto. Escríbenos y te ayudamos con la entrega', complementos: 'Vino, chocolates, ositos, globos y foto personalizada para acompañar tus flores' };
    const occMatch = (p, o) => {
      if (p.cats.includes('condolencias')) return false;
      const t = (p.t + ' ' + p.sd).toLowerCase(), oc = K.occasionOf(p);
      if (o === 'aniversario') return oc.includes('aniversario') || /rosas rojas|coraz|te amo|100 rosas|150|200|250/.test(t);
      if (o === 'cumpleanos') return oc.includes('cumpleanos') || /gerbera|girasol|primaveral|globo/.test(t);
      if (o === 'graduacion') return oc.includes('graduacion') || p.cats.includes('premium') || /girasol/.test(t);
      if (o === 'mama') return oc.includes('mama') || /peon|tulip|rosita|primaveral|orqu/.test(t);
      if (o === 'porquesi') return !p.cats.includes('complementos') && /girasol|tulip|gerbera|primaveral|florero|mixtas/.test(t);
      return true;
    };
    const POP = ['florero-de-rosas', 'bouquet-de-rosas-clasica', 'bouquet-de-rosas-premium', 'ramo-de-100-rosas-mexicali', 'caja-con-rosas', 'bouquet-primaveral', 'bouquet-primaveral-con-gerberas', 'ramo-50-rosas-rojas-mexicali', 'bouquet-corazon-de-rosas'];
    const grid = $('[data-shop]'), dateIn = $('[data-date]'), loc = $('[data-loc]');
    dateIn.min = EARLIEST; dateIn.value = DATE;
    dateIn.addEventListener('change', () => { DATE = validDate(dateIn.value); dateIn.value = DATE; saveLead({ fecha: DATE }); $$('[data-pill]').forEach(x => { x.lastChild.textContent = pillText(); x.classList.toggle('is-today', DATE === NOW.iso); }); });
    const list = () => {
      let L = K.LF.slice();
      if (state.cats.length) L = L.filter(p => state.cats.some(c => p.cats.includes(c)));
      else if (!state.q) L = L.filter(p => !p.cats.includes('condolencias'));
      if (state.occ) L = L.filter(p => occMatch(p, state.occ));
      if (state.q) L = L.filter(p => (p.t + ' ' + p.sd + ' ' + p.catn.join(' ')).toLowerCase().includes(state.q));
      if (state.sort === 'asc') L.sort((a, b) => K.minPrice(a) - K.minPrice(b));
      else if (state.sort === 'desc') L.sort((a, b) => K.minPrice(b) - K.minPrice(a));
      else L.sort((a, b) => { const ia = POP.indexOf(a.h), ib = POP.indexOf(b.h); return (ia < 0 ? 99 + (a.cats.includes('complementos') ? 50 : 0) : ia) - (ib < 0 ? 99 + (b.cats.includes('complementos') ? 50 : 0) : ib); });
      return L;
    };
    const render = () => {
      const L = list();
      grid.innerHTML = L.length ? L.map(p => card(p, { pill: true })).join('') : `<p class="grid__empty">No encontramos arreglos con esos filtros. <a class="tlink" href="tienda.html">Ver todo</a></p>`;
      $('[data-count-label]').textContent = L.length + ' productos';
      $('[data-fd-n]').textContent = L.length;
      const n = state.cats.length + (state.occ ? 1 : 0) + (state.q ? 1 : 0); const ap = $('[data-applied]'); ap.hidden = !n; ap.textContent = n;
      const title = state.q ? `Resultados para “${q.get('q')}”` : state.occ ? OCC[state.occ] : state.cats.length === 1 ? CATS[state.cats[0]] : 'Flores a domicilio en Mexicali';
      $('[data-ch-title]').textContent = title; $('[data-bc-cur]').textContent = title;
      if (state.cats.length === 1 && SUBS[state.cats[0]]) $('[data-ch-sub]').textContent = SUBS[state.cats[0]];
      document.title = title + ' · Liefloré Mexicali';
    };
    // filter drawer
    const fd = $('#fd'), fdForm = $('[data-fd-form]');
    $('[data-fd-cats]').innerHTML = Object.entries(CATS).map(([k, v]) => `<label><input type="checkbox" name="cat" value="${k}"${state.cats.includes(k) ? ' checked' : ''}> ${v}</label>`).join('');
    $('[data-fd-occ]').innerHTML = `<label><input type="radio" name="occ" value=""${!state.occ ? ' checked' : ''}> Todas</label>` + Object.entries(OCC).map(([k, v]) => `<label><input type="radio" name="occ" value="${k}"${state.occ === k ? ' checked' : ''}> ${v}</label>`).join('');
    const sr = $(`[name=sort][value=${state.sort}]`, fdForm); if (sr) sr.checked = true;
    fdForm.addEventListener('change', () => { const f = new FormData(fdForm); state.cats = f.getAll('cat'); state.occ = f.get('occ') || ''; state.sort = f.get('sort') || 'pop'; render(); });
    const openFD = () => { fd.classList.add('is-open'); fd.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('lf-lock'); setTimeout(() => $('.cd__x', fd).focus(), 50); };
    closeFD = () => { if (!fd.classList.contains('is-open')) return; fd.classList.remove('is-open'); fd.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('lf-lock'); };
    $('[data-fd-open]').addEventListener('click', openFD);
    $$('[data-fd-close]').forEach(b => b.addEventListener('click', closeFD));
    $('[data-fd-clear]').addEventListener('click', () => { state.cats = []; state.occ = ''; state.q = ''; state.sort = 'pop'; $$('input', fdForm).forEach(i => { i.checked = i.type === 'radio' && (i.value === 'pop' || (i.name === 'occ' && i.value === '')); }); render(); });
    $$('[data-lay]').forEach(b => b.addEventListener('click', () => { $$('[data-lay]').forEach(x => x.setAttribute('aria-pressed', x === b)); grid.classList.toggle('is-2', b.dataset.lay === '2'); }));
    loc.addEventListener('change', () => { if (loc.value === 'valle') alert('Valle de Mexicali: la entrega puede ser posible, pero el costo y las condiciones cambian según el ejido. Confírmanos por WhatsApp antes de pagar.'); });
    render();
    $$('[data-grid]').forEach(el => renderList(el, el.dataset.grid.split(','), { meta: true }));
  }

  /* ================= PDP ================= */
  if (page === 'pdp') {
    const slug = new URLSearchParams(location.search).get('p');
    const p = K.find(slug) || K.find('bouquet-de-rosas-premium');
    const root = $('[data-pdp]');
    const isAddon = p.cats.includes('complementos');
    const somber = p.cats.includes('condolencias');
    document.title = p.t + ' · Liefloré Mexicali';
    const VS = vars(p);
    const sizes = [...new Set(VS.map(v => v.size))].filter(s => s !== '').sort((a, b) => Math.min(...VS.filter(v => v.size === a).map(v => v.p)) - Math.min(...VS.filter(v => v.size === b).map(v => v.p)));
    const colors = [...new Set(VS.map(v => v.color))].filter(Boolean);
    let sel = defVar(p);
    const minOfSize = s => Math.min(...VS.filter(v => v.size === s).map(v => v.p));
    const extras = new Set(); // "slug|vid"
    const im = imgsOf(p);
    const solo = im.length < 2 && (isAddon || somber);
    const slides = im.map((s, i) => `<div class="gal__s gal__s--prod${solo ? ' gal__s--solo' : ''}"><img src="${K.rel(s)}" alt="${esc(p.t)}${im.length > 1 ? ' · foto ' + (i + 1) : ''}"${i > 1 ? ' loading="lazy"' : ''}></div>`);
    if (im.length < 2 && !isAddon && !somber) slides.push(`<div class="gal__s" data-autovideo><img src="${A}vid/A001_06091303_C046.jpg" alt=""><video muted loop playsinline preload="none" poster="${A}vid/A001_06091303_C046.jpg" aria-label="Video: rosas preparadas en nuestro taller"><source src="${A}vid/A001_06091303_C046.mp4" type="video/mp4"></video><span class="gal__cap">Armado a mano en nuestro taller</span></div>`);
    const nS = slides.length;
    const clean = t => (t || '').replace(/[ \u00a0]+\n/g, '\n').replace(/\n[ \u00a0]+/g, '\n');
    let desc = clean(p.sd || p.d).replace(/\n{3,}/g, '\n\n').trim();
    if (/mismo d[ií]a/i.test(desc)) desc += '\n\nEntrega el mismo día para pedidos web realizados antes de las 3:30 p. m.';
    const incl = p.sd && p.d && p.d.trim() !== p.sd.trim() ? clean(p.d).replace(/\n{3,}/g, '\n\n').trim() : '';
    const sub = p.catn.join(' · ');
    const accs = (cls) => `<div class="pdp__acc ${cls}">
        <details class="acc" open><summary>Descripción</summary><div class="acc__b">${esc(desc || p.catn.join(' · '))}</div></details>
        ${incl ? `<details class="acc"><summary>Detalles del arreglo</summary><div class="acc__b">${esc(incl)}</div></details>` : ''}
        <details class="acc"><summary>Entrega en Mexicali</summary><div class="acc__b">Para pedidos web realizados antes de las 3:30 p. m. puedes elegir entrega el mismo día en Mexicali. Envío estándar $150 MXN; Express, nocturno o ciertas zonas pueden generar un cargo adicional. Al salir del taller te enviamos un SMS o correo con la ruta del repartidor en tiempo real. Horario: lunes a sábado de 8:00 a. m. a 6:30 p. m.</div></details>
        <details class="acc"><summary>Pagos y cambios</summary><div class="acc__b">Paga con tarjeta, PayPal o Google Pay. Las imágenes son ilustrativas: por la naturaleza artesanal y la temporada puede haber ligeras variaciones en tonos, bases o papeles, siempre respetando el estilo, volumen y categoría del arreglo. <a href="https://www.lieflores.com/terminos-y-condiciones/">Términos y condiciones</a></div></details>
      </div>`;
    const ADD1 = isAddon || somber ? [] : [['vino-con-chocolates', null, 'Vino y chocolates'], ['complementos-vino-tinto-merlot', null, 'Vino tinto'], ['osito-con-bombones', null, 'Peluche y chocolates']];
    const ADD2 = isAddon || somber ? [] : [['osito-te-amo', null, 'peluches'], ['osito-de-peluche', null, 'peluches'], ['globos', 1013, 'globos', 'Globo de corazón'], ['globos', 1014, 'globos', 'Globo “Feliz cumpleaños”'], ['foto-personalizada', 1720, 'foto', 'Foto personalizada 5 × 8 cm']];
    const priceOf = (h, vid) => { const x = K.find(h); const v = vid && x.v.find(v => v.id === vid); return v ? v.p : K.minPrice(x); };
    const addBtn = (h, vid, cls) => `<button type="button" class="btn btn--sm${cls || ''}" data-extra="${h}|${vid || ''}" aria-pressed="false">Agregar</button>`;
    const vcs = ADD1.map(([h, vid, eb]) => { const x = K.find(h); return x ? `<div class="vc"><img src="${K.rel(x.img[0])}" alt="${esc(x.t)}" loading="lazy"><div><p class="vc__eb">${eb}</p><p class="vc__n">${esc(x.t)}</p><p class="vc__p">${money(priceOf(h, vid))}</p>${addBtn(h, vid)}</div></div>` : ''; }).join('');
    const xcs = ADD2.map(([h, vid, grp, name]) => { const x = K.find(h); return x ? `<div class="xc" data-grp="${grp}"><img src="${K.rel(x.img[vid === 1013 && x.img[1] ? 1 : 0])}" alt="${esc(name || x.t)}" loading="lazy"><p class="xc__n">${esc(name || x.t)}</p><p class="xc__p">${money(priceOf(h, vid))}</p>${addBtn(h, vid)}</div>` : ''; }).join('');
    const sizeCards = sizes.length ? sizes.map(s => `<button type="button" class="szc" data-size="${esc(s)}" aria-pressed="${sel && sel.size === s}"><b>${esc(sizeLabel(p, s))}</b><span>${colors.length > 1 && VS.filter(v => v.size === s).some(v => v.p !== minOfSize(s)) ? 'Desde ' : ''}${money(minOfSize(s))}</span></button>`).join('') : `<button type="button" class="szc" aria-pressed="true"><b>${VS.length ? esc(VS[0].t) : 'Tamaño único'}</b><span>${money(sel ? sel.p : p.p)}</span></button>`;

    root.innerHTML = `
      <section class="gal" aria-label="Fotos de ${esc(p.t)}">
        <div class="gal__track" data-gal>${slides.join('')}</div>
        ${nS > 2 ? `<button class="gal__zoom" type="button" aria-label="Ampliar foto" data-zoom>${svg('i-zoom', '0 0 18 18', 18, 18)}</button>` : `<button class="gal__zoom" type="button" aria-label="Ampliar foto" data-zoom>${svg('i-zoom', '0 0 18 18', 18, 18)}</button>`}
        ${somber ? '' : `<span class="gal__seal seal" aria-hidden="true"><svg class="ring" viewBox="0 0 144 144"><text fill="currentColor" font-family="Montserrat, sans-serif" font-size="11" font-weight="600" letter-spacing="1.5"><textPath href="#sealp" textLength="338" lengthAdjust="spacingAndGlyphs">ENTREGA HOY · MEXICALI · ANTES DE 3:30 P. M. ·</textPath></text></svg><img src="${A}brand/png-icono-2.png" alt=""></span>`}
        ${nS > 2 ? `<div class="gal__thumbs">${im.slice(0, 4).map((s, i) => `<button type="button" data-go="${i}" aria-label="Foto ${i + 1}"${i === 0 ? ' class="is-on"' : ''}><img src="${K.rel(s)}" alt=""></button>`).join('')}${nS > 4 ? `<button type="button" class="more" data-go="4" aria-label="Ver más fotos">+${nS - 4}</button>` : ''}<button type="button" class="gal__arr" data-gp aria-label="Foto anterior">${svg('i-left', '0 0 16 16', 16, 16)}</button><button type="button" class="gal__arr" data-gn aria-label="Foto siguiente">${svg('i-right', '0 0 16 16', 16, 16)}</button></div>` : ''}
        <span class="gal__count" data-gcount>1 / ${nS}</span>
        <i class="gal__prog" data-gprog></i>
      </section>
      <div class="pdp__main">
        <nav class="bc" aria-label="Migas de pan"><a href="index.html">Inicio</a><span style="color:inherit"><a href="tienda.html${p.cats[0] ? '?cat=' + p.cats[0] : ''}">${esc(p.catn[0] || 'Tienda')}</a></span><span>${esc(p.t)}</span></nav>
        <div class="pdp__info">
          <h1>${esc(p.t)}</h1>
          ${sub ? `<p class="pdp__sub">${esc(sub)}</p>` : ''}
          <p class="pdp__price" data-price>${money(sel ? sel.p : p.p)}</p>
          ${accs('')}
        </div>
        <div class="bb" aria-label="Comprar">
          <div class="bb__blk" style="margin-top:0">
            <h2 class="bb__t">Información de entrega</h2>
            <div class="dl">
              <label class="dl__f dl__d">${svg('i-cal', '0 0 20 20', 18, 18)}<b>Recíbelo:</b><input type="date" data-pdate aria-label="Fecha de entrega"></label>
              <label class="dl__f dl__l">${svg('i-pin', '0 0 20 20', 18, 18)}<b>Entrega en:</b><select data-ploc aria-label="Zona de entrega"><option value="mxl">Mexicali, B.C.</option><option value="valle">Valle de Mexicali</option></select></label>
            </div>
            <p class="dl__msg" data-dmsg aria-live="polite"></p>
          </div>
          <div class="bb__blk">
            <h2 class="bb__t">${sizes.length > 1 ? 'Elige el tamaño' : 'Tamaño'}</h2>
            <div class="sz" role="group" aria-label="Tamaño">${sizeCards}</div>
            ${colors.length > 1 ? `<div class="chips" role="group" aria-label="Color" data-colors></div>` : ''}
          </div>
          ${vcs ? `<div class="bb__blk"><div class="bb__t"><h2 style="font:inherit">Agrega vino o chocolates</h2><span class="arrs"><button type="button" data-hr="-1" aria-label="Anterior">${svg('i-left', '0 0 16 16', 14, 14)}</button><button type="button" data-hr="1" aria-label="Siguiente">${svg('i-right', '0 0 16 16', 14, 14)}</button></span></div><p class="bb__note">Se agregan a tu carrito junto con tu arreglo</p><div class="hrow">${vcs}</div></div>` : ''}
          ${xcs ? `<div class="bb__blk"><div class="bb__t"><h2 style="font:inherit">Hazlo aún más especial</h2><span class="arrs"><button type="button" data-hr="-1" aria-label="Anterior">${svg('i-left', '0 0 16 16', 14, 14)}</button><button type="button" data-hr="1" aria-label="Siguiente">${svg('i-right', '0 0 16 16', 14, 14)}</button></span></div><p class="bb__note">Los extras se agregan a tu carrito por separado</p>
            <div class="chips" role="tablist" aria-label="Tipo de extra" style="margin:0 0 16px">${[['all', 'Todos'], ['peluches', 'Peluches'], ['globos', 'Globos'], ['foto', 'Foto']].map(([k, v], i) => `<button type="button" class="chip" role="tab" aria-selected="${i === 0}" data-grpf="${k}">${v}</button>`).join('')}</div>
            <div class="hrow">${xcs}</div></div>` : ''}
          ${isAddon ? '' : `<div class="msg"><label for="pdp-msg">Mensaje para la tarjeta</label><textarea id="pdp-msg" maxlength="160" data-pdp-msg placeholder="Escribe lo que dirá la tarjeta (opcional)"></textarea><div class="cnt"><span>Máximo 160 caracteres</span><span><span data-pdp-msg-n>0</span> / 160</span></div></div>`}
          <button type="button" class="btn btn--dark atc" data-atc>Agregar al carrito – ${money(sel ? sel.p : p.p)}</button>
          <p class="atc-note">${svg('i-cal', '0 0 20 20', 16, 16)}Eliges horario y dirección al finalizar tu pedido</p>
          <p class="atc-wa"><a href="${WA + encodeURIComponent('Hola Liefloré, quiero pedir: ' + p.t)}" target="_blank" rel="noopener">${svg('i-wa', '0 0 24 24', 16, 16)}Pedir este arreglo por WhatsApp</a></p>
        </div>
        ${accs('pdp__acc--m')}
      </div>`;

    // gallery
    const gal = $('[data-gal]'), prog = $('[data-gprog]'), cnt = $('[data-gcount]');
    const per = () => innerWidth >= 1024 ? 2 : 1;
    const gIdx = () => Math.round(gal.scrollLeft / (gal.clientWidth / per()));
    const gUpd = () => { const i = gIdx(); const vis = Math.min(nS, i + per()); prog.style.width = '100%'; prog.style.transform = `scaleX(${vis / nS})`; cnt.textContent = `${Math.min(nS, i + 1)} / ${nS}`; $$('.gal__thumbs [data-go]').forEach(b => b.classList.toggle('is-on', +b.dataset.go === i)); };
    const go = i => gal.scrollTo({ left: Math.max(0, Math.min(nS - per(), i)) * gal.clientWidth / per(), behavior: RM ? 'auto' : 'smooth' });
    gal.addEventListener('scroll', gUpd, { passive: true }); addEventListener('resize', gUpd); gUpd();
    $$('[data-go]').forEach(b => b.addEventListener('click', () => go(+b.dataset.go)));
    $('[data-gp]') && $('[data-gp]').addEventListener('click', () => go(gIdx() - 1));
    $('[data-gn]') && $('[data-gn]').addEventListener('click', () => go(gIdx() + 1));
    $('[data-zoom]').addEventListener('click', () => {
      const img = gal.children[gIdx()].querySelector('img'); if (!img) return;
      const lb = document.createElement('div'); lb.className = 'vm is-open'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Foto ampliada');
      lb.innerHTML = `<button class="vm__x" type="button" aria-label="Cerrar">×</button><img src="${img.src}" alt="${esc(img.alt)}" style="max-width:min(92vw,1100px);max-height:88vh;object-fit:contain;border-radius:8px;background:#fff">`;
      const close = () => { lb.remove(); document.documentElement.classList.remove('lf-lock'); document.removeEventListener('keydown', kd); $('[data-zoom]').focus(); };
      const kd = e => { if (e.key === 'Escape') close(); };
      lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('.vm__x')) close(); });
      document.addEventListener('keydown', kd); document.body.appendChild(lb); document.documentElement.classList.add('lf-lock'); $('.vm__x', lb).focus();
    });
    $$('.gal [data-autovideo]').forEach(w => { const v = $('video', w); if (RM) { v.remove(); return; } v.addEventListener('playing', () => $('img', w).style.opacity = 0); vio && vio.observe(v); });

    // delivery date
    const pd = $('[data-pdate]'), pl = $('[data-ploc]'), dm = $('[data-dmsg]');
    pd.min = EARLIEST; pd.value = DATE;
    const dmsg = () => {
      const ico = svg('i-truck', '0 0 20 20', 16, 16);
      if (pl.value === 'valle') { dm.innerHTML = `${ico}<span><b>Valle de Mexicali:</b> la entrega puede ser posible; el costo y las condiciones cambian según el ejido. <a href="${WA + encodeURIComponent('Hola Liefloré, ¿entregan en el Valle de Mexicali? Quiero pedir: ' + p.t)}" target="_blank" rel="noopener" style="text-decoration:underline">Confírmalo por WhatsApp</a></span>`; return; }
      if (DATE === NOW.iso) { const left = CUT - NOW.mins; const h = Math.floor(left / 60), m = left % 60; dm.innerHTML = `${ico}<span><b>Puede llegar hoy.</b> Pide en ${h ? h + ' h ' : ''}${m} min (antes de las 3:30 p. m.) y elige entrega el mismo día en Mexicali</span>`; }
      else if (!sameDayOpen && DATE === EARLIEST) dm.innerHTML = `${ico}<span><b>Recíbelo ${rel(DATE)}.</b> ${NOW.wd === 0 ? 'No hay servicio regular los domingos' : 'Ya pasó el corte de las 3:30 p. m. para entrega hoy'}. ¿Es urgente? <a href="${WA + encodeURIComponent('Hola Liefloré, tengo un pedido urgente: ' + p.t)}" target="_blank" rel="noopener" style="text-decoration:underline">Escríbenos por WhatsApp</a></span>`;
      else dm.innerHTML = `${ico}<span><b>Recíbelo ${rel(DATE)}</b> en Mexicali · envío estándar $150</span>`;
    };
    pd.addEventListener('change', () => { const v = validDate(pd.value); if (pd.value && wdOf(pd.value) === 0) { dm.textContent = 'No hay servicio regular los domingos'; } DATE = v; pd.value = v; saveLead({ fecha: DATE }); if (!(pd.value && wdOf(pd.value) === 0)) dmsg(); });
    pl.addEventListener('change', dmsg); dmsg();

    // sizes / colors
    const priceEl = $('[data-price]'), atc = $('[data-atc]');
    const total = () => (sel ? sel.p : p.p) + [...extras].reduce((s, k) => { const [h, vid] = k.split('|'); return s + priceOf(h, vid ? +vid : null); }, 0);
    const refresh = () => {
      priceEl.textContent = money(sel ? sel.p : p.p);
      const t = 'Agregar al carrito – ' + money(total());
      atc.textContent = t; $('[data-satc-btn]').textContent = t; $('[data-satc-p]').textContent = (sel && sel.t ? sel.t.replace(/\b\w/g, c => c.toUpperCase()) + ' · ' : '') + money(sel ? sel.p : p.p);
      $$('.szc[data-size]').forEach(b => b.setAttribute('aria-pressed', !!sel && b.dataset.size === sel.size));
      const ch = $('[data-colors]');
      if (ch && sel) { const avail = VS.filter(v => v.size === sel.size); ch.innerHTML = avail.map(v => `<button type="button" class="chip" data-color="${v.color}" aria-pressed="${v.id === sel.id}"><i style="background:${COLORS[v.color] || '#ccc'}"></i>${colorName(v.color)}</button>`).join(''); }
    };
    root.addEventListener('click', e => {
      const sz = e.target.closest('.szc[data-size]');
      if (sz) { const s = sz.dataset.size; sel = VS.find(v => v.size === s && v.color === (sel && sel.color)) || VS.filter(v => v.size === s).reduce((a, b) => (b.p < a.p ? b : a)); refresh(); return; }
      const c = e.target.closest('[data-color]');
      if (c) { sel = VS.find(v => v.size === sel.size && v.color === c.dataset.color) || sel; refresh(); return; }
      const x = e.target.closest('[data-extra]');
      if (x) { const k = x.dataset.extra; const on = !extras.has(k); on ? extras.add(k) : extras.delete(k); x.classList.toggle('is-added', on); x.setAttribute('aria-pressed', on); x.textContent = on ? 'Agregado ✓' : 'Agregar'; refresh(); return; }
      const hr = e.target.closest('[data-hr]');
      if (hr) { const row = hr.closest('.bb__blk').querySelector('.hrow'); row.scrollBy({ left: +hr.dataset.hr * (row.clientWidth * .8), behavior: RM ? 'auto' : 'smooth' }); return; }
      const g = e.target.closest('[data-grpf]');
      if (g) { $$('[data-grpf]').forEach(b => b.setAttribute('aria-selected', b === g)); $$('.xc').forEach(xc => xc.hidden = g.dataset.grpf !== 'all' && xc.dataset.grp !== g.dataset.grpf); }
    });
    const doAdd = () => {
      saveLead({ fecha: DATE });
      K.add(p.h, sel ? sel.id : undefined, 1);
      extras.forEach(k => { const [h, vid] = k.split('|'); K.add(h, vid || undefined, 1); });
    };
    atc.addEventListener('click', doAdd);
    $('[data-satc-btn]').addEventListener('click', doAdd);
    const pm = $('[data-pdp-msg]');
    if (pm) { pm.value = lead().msg || ''; $('[data-pdp-msg-n]').textContent = pm.value.length; pm.addEventListener('input', () => { $('[data-pdp-msg-n]').textContent = pm.value.length; saveLead({ msg: pm.value }); syncMsg(pm); }); }
    // sticky ATC
    const satc = $('[data-satc]');
    $('[data-satc-img]').src = K.rel(im[0]); $('[data-satc-t]').textContent = p.t;
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { const on = !e.isIntersecting && e.boundingClientRect.top < 0; satc.classList.toggle('is-on', on); satc.setAttribute('aria-hidden', !on); document.body.classList.toggle('has-satc', on); }).observe(atc);
    refresh();
    // also like
    const also = K.LF.filter(x => x.h !== p.h && !x.cats.includes('complementos') && !x.cats.includes('condolencias') && (somber ? false : x.cats.some(c => p.cats.includes(c))));
    const fill = ['bouquet-de-rosas-clasica', 'florero-de-rosas', 'bouquet-de-rosas-premium', 'caja-con-rosas', 'bouquet-primaveral', 'ramo-de-100-rosas-mexicali'].map(K.find).filter(x => x && x.h !== p.h && !also.includes(x));
    if (somber) { $('.prv').hidden = true; const st = $$('.how .st__img img'); const neu = [['photo/IMG_7922.jpg', 'Flores blancas preparadas en nuestro taller'], ['photo/IMG_7915.jpg', 'Arreglo de flores blancas listo para salir'], ['p/corona-funeral-1.jpg', 'Corona funeral de flores blancas']]; st.forEach((im, i) => { im.src = A + neu[i][0]; im.alt = neu[i][1]; }); $$('.how .st__s')[2].textContent = 'Entregamos en Mexicali con el mensaje que elegiste. Para el mismo día, pide antes de las 3:30 p. m.'; $('.how .st__t', $$('.how .st')[2]).textContent = 'Llega con tu mensaje'; }
    if (somber) $('.also').hidden = true; else renderList($('[data-also]'), [...also, ...fill].slice(0, 8).map(x => x.h), { meta: true });
  }

  $$('[data-more]').forEach(b => b.addEventListener('click', () => { const q = b.previousElementSibling; const open = q.classList.toggle('is-clamp'); b.textContent = open ? 'Leer completa' : 'Ver menos'; b.setAttribute('aria-expanded', !open); }));
  initCars(); reveal();
  // reflect cart drawer message when it opens
  K.onChange(() => { if (msg) { msg.value = lead().msg || ''; msgN.textContent = msg.value.length; } });
})();
