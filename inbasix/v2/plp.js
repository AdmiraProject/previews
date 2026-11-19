/* Inbasix v2 — category / listing page (coleccion.html). Structure 1:1 with the benchmark catalog. */
(function () {
  const I = window.IBK, K = window.K, { $, $$, esc, IC } = K;
  K.mountShell({ search: true, plp: true });
  K.wireSearch(document);
  const P = I.P, G = K.GROUPS, PER = 30;
  const inGroup = K.inGroup;
  const grpBy = k => G.find(g => g.k === k);
  const colTitle = h => { for (const g of G) { const c = g.c.find(([x]) => x === h); if (c) return c[1]; } return K.catName(h); };
  const groupOfCol = h => G.find(g => g.c.some(([x]) => x === h));
  const vendors = [...new Set(P.map(p => p.vendor))].map(v => ({ s: K.vendorSlug(v), n: K.vendorName(v), v })).sort((a, b) => a.n.localeCompare(b.n));
  const prices = P.map(I.minPrice).filter(x => x != null);
  const PMIN = Math.min(...prices), PMAX = Math.max(...prices);
  const RANGES = [['0-100000', 'Hasta $100,000'], ['100000-250000', '$100,000 a $250,000'], ['250000-500000', '$250,000 a $500,000'], ['500000-', 'Más de $500,000']];
  const EXTRAS = [['video', 'Con video demostrativo', p => p.yt.length > 0], ['config', 'Varias configuraciones', p => p.v.length > 1], ['foto', 'Con fotos', p => p.img.length > 0]];
  const SORTS = [['featured', 'Destacados'], ['price-asc', 'Menor precio'], ['price-desc', 'Mayor precio'], ['az', 'Nombre A–Z']];

  /* ---------- state <-> URL ---------- */
  let S;
  function parse() {
    const q = new URLSearchParams(location.search), s = { grp: '', sub: [], brand: [], avail: '', range: '', min: '', max: '', x: [], q: q.get('q') || '', sort: q.get('sort') || 'featured', page: Math.max(1, +q.get('page') || 1) };
    const cat = (q.get('cat') || '').split(',').filter(Boolean);
    if (cat.length === 1 && grpBy(cat[0]) && !(cat[0] === 'fillers' && q.get('sub'))) s.grp = cat[0];
    else if (cat.length) { const g = groupOfCol(cat[0]); s.grp = g ? g.k : ''; s.sub = cat.filter(c => groupOfCol(c)); if (g && s.sub.length === 1 && s.sub[0] === g.c[0][0]) s.sub = []; }
    s.brand = (q.get('brand') || '').split(',').filter(Boolean);
    (q.get('price') || '').split(',').filter(Boolean).forEach(t => { if (t === 'online' || t === 'quote') s.avail = t; else if (/^\d*-\d*$/.test(t)) { if (RANGES.some(r => r[0] === t)) s.range = t; else { const [a, b] = t.split('-'); s.min = a; s.max = b; } } });
    s.x = (q.get('x') || '').split(',').filter(x => EXTRAS.some(e => e[0] === x));
    if (!SORTS.some(x => x[0] === s.sort)) s.sort = 'featured';
    return s;
  }
  function toURL(s) {
    const u = new URLSearchParams();
    const cat = s.sub.length ? s.sub.join(',') : s.grp; if (cat) u.set('cat', cat);
    if (s.brand.length) u.set('brand', s.brand.join(','));
    const pr = [s.avail, s.range, (s.min || s.max) ? `${s.min || ''}-${s.max || ''}` : ''].filter(Boolean); if (pr.length) u.set('price', pr.join(','));
    if (s.x.length) u.set('x', s.x.join(','));
    if (s.q) u.set('q', s.q); if (s.sort !== 'featured') u.set('sort', s.sort); if (s.page > 1) u.set('page', s.page);
    const t = u.toString(); return 'coleccion.html' + (t ? '?' + t : '');
  }
  function commit(push, keepPage) { if (!keepPage) S.page = 1; const url = toURL(S); history[push ? 'pushState' : 'replaceState'](null, '', url); render(); }
  addEventListener('popstate', () => { S = parse(); render(); });

  /* ---------- filtering ---------- */
  const qset = () => S.q ? new Set(K.searchProducts(S.q).map(p => p.h)) : null;
  function match(p, skip, qs) {
    if (qs && !qs.has(p.h)) return false;
    if (skip !== 'cat') { if (S.sub.length) { if (!S.sub.some(c => p.cols.includes(c)) || (S.grp && !inGroup(p, grpBy(S.grp)))) return false; } else if (S.grp && !inGroup(p, grpBy(S.grp))) return false; }
    if (skip !== 'brand' && S.brand.length && !S.brand.includes(K.vendorSlug(p.vendor))) return false;
    const m = I.minPrice(p);
    if (skip !== 'avail' && S.avail && (S.avail === 'online' ? m == null : m != null)) return false;
    if (skip !== 'price') {
      if (S.range) { const [a, b] = S.range.split('-').map(Number); if (m == null || m < (a || 0) || (b && m > b)) return false; }
      if (S.min || S.max) { if (m == null || (S.min && m < +S.min) || (S.max && m > +S.max)) return false; }
    }
    if (skip !== 'x' && S.x.length && !S.x.every(k => EXTRAS.find(e => e[0] === k)[2](p))) return false;
    return true;
  }
  const featured = p => (p.img.length ? 0 : 100) + (I.isQuote(p) ? 10 : 0) + (K.PROD.has(p.h) ? 0 : 1);
  function results() {
    const qs = qset(); let r = P.filter(p => match(p, null, qs));
    const pr = I.minPrice;
    if (S.sort === 'price-asc') r.sort((a, b) => (pr(a) == null) - (pr(b) == null) || pr(a) - pr(b));
    else if (S.sort === 'price-desc') r.sort((a, b) => (pr(a) == null) - (pr(b) == null) || pr(b) - pr(a));
    else if (S.sort === 'az') r.sort((a, b) => K.cardName(a).localeCompare(K.cardName(b), 'es'));
    else r.sort((a, b) => featured(a) - featured(b));
    return r;
  }
  const count = (skip, fn) => { const qs = qset(); return P.filter(p => match(p, skip, qs) && fn(p)).length; };

  /* ---------- facets (shared by sidebar accordion and mobile modal tabs) ---------- */
  const chk = (name, val, label, n, on, sub) => `<label class="c-chk${n === 0 && !on ? ' is-dis' : ''}"><input type="checkbox" name="${name}" value="${esc(val)}"${on ? ' checked' : ''}${n === 0 && !on ? ' disabled' : ''}><span class="c-chk__b" aria-hidden="true">${IC.check}</span><span class="c-chk__t">${esc(label)}${sub ? `<small>${esc(sub)}</small>` : ''}</span><em>${n}</em></label>`;
  const FACETS = {
    cat: { t: 'Categoría', body: () => {
      const tiles = G.map(g => { const n = count('cat', p => inGroup(p, g)); const on = S.grp === g.k;
        return `<button type="button" class="c-sq${on ? ' is-on' : ''}${n ? '' : ' is-dis'}" data-grp="${g.k}" aria-pressed="${on}"${n || on ? '' : ' disabled'}><span class="c-sq__i">${g.tile ? `<img src="${K.PH}${g.tile}" alt="" loading="lazy">` : (() => { const x = P.find(p => inGroup(p, g) && p.img.length); return x ? `<img src="${K.pimg(x, 160)}" alt="" loading="lazy" style="object-fit:contain;background:#fff">` : ''; })()}</span><span class="c-sq__t">${g.t}</span><em>${n}</em></button>`; }).join('');
      const g = grpBy(S.grp);
      const subs = g ? `<p class="c-fsub">Subcategorías de ${esc(g.t)}</p>` + g.c.slice(1).map(([h, t]) => chk('sub', h, t, count('cat', p => p.cols.includes(h) && inGroup(p, g)), S.sub.includes(h))).join('') : '';
      return `<p class="c-fsub">Tipo de producto</p><div class="c-sqs">${tiles}</div>${subs}`; } },
    brand: { t: 'Marca', body: () => vendors.map(v => chk('brand', v.s, v.n, count('brand', p => K.vendorSlug(p.vendor) === v.s), S.brand.includes(v.s))).join('') },
    price: { t: 'Precio', body: () => `
      <div class="c-range"><label class="c-in"><span>Desde</span><i>$</i><input type="number" inputmode="numeric" min="0" step="1000" name="min" value="${esc(S.min)}" placeholder="${Math.floor(PMIN).toLocaleString('es-MX')}"></label><b>-</b><label class="c-in"><span>Hasta</span><i>$</i><input type="number" inputmode="numeric" min="0" step="1000" name="max" value="${esc(S.max)}" placeholder="${Math.ceil(PMAX).toLocaleString('es-MX')}"></label></div>
      <p class="c-fsub">Rangos de precio</p>${RANGES.map(([v, l]) => chk('range', v, l, count('price', p => { const m = I.minPrice(p); const [a, b] = v.split('-').map(Number); return m != null && m >= (a || 0) && (!b || m <= b); }), S.range === v)).join('')}
      <p class="c-fsub">Forma de compra</p>${chk('avail', 'online', 'Con precio en línea', count('avail', p => I.minPrice(p) != null), S.avail === 'online', 'Compra y paga en línea')}${chk('avail', 'quote', 'Precio bajo cotización', count('avail', p => I.minPrice(p) == null), S.avail === 'quote', 'Te cotizamos en menos de 24 h')}` },
    x: { t: 'Oportunidades para ti', body: () => EXTRAS.map(([k, l, fn]) => chk('x', k, l, count('x', fn), S.x.includes(k))).join('') }
  };
  const ORDER = ['cat', 'brand', 'price', 'x'];
  const openF = new Set(['cat']);
  function renderSide() {
    $('[data-side]').innerHTML = `<h2 class="c-filters__h">Filtros</h2>` + ORDER.map(k => `<div class="c-facet${openF.has(k) ? ' is-open' : ''}" data-facet="${k}"><button type="button" class="c-facet__h" aria-expanded="${openF.has(k)}">${FACETS[k].t}${IC.chev}</button><div class="c-facet__b">${openF.has(k) ? FACETS[k].body() : ''}</div></div>`).join('');
  }
  let mTab = 'cat';
  function renderModal() {
    $('[data-ftabs]').innerHTML = ORDER.map(k => `<button type="button" role="tab" aria-selected="${mTab === k}" class="${mTab === k ? 'is-on' : ''}" data-mtab="${k}">${FACETS[k].t}</button>`).join('');
    $('[data-fpane]').innerHTML = FACETS[mTab].body();
  }

  /* ---------- quick chips + active chips ---------- */
  const QCH = [['avail', 'online', 'Compra en línea'], ['grp', 'ultrasonido', 'Ultrasonido'], ['grp', 'aparatologia-estetica', 'Aparatología estética'], ['grp', 'imagenologia', 'Imagenología'], ['grp', 'fillers', 'Fillers'], ['range', '0-100000', 'Menos de $100k'], ['brand', 'mindray', 'Mindray'], ['brand', 'nubway', 'Nubway'], ['grp', 'veterinario', 'Veterinario']];
  const chipOn = ([k, v]) => k === 'brand' ? S.brand.includes(v) : S[k] === v;
  function renderChips() { $('[data-chips]').innerHTML = QCH.map((c, i) => `<button type="button" role="listitem" class="c-chip${chipOn(c) ? ' is-on' : ''}" data-qi="${i}" aria-pressed="${chipOn(c)}">${c[2]}</button>`).join(''); }
  function activeList() {
    const a = [];
    if (S.q) a.push(['q', '', `“${S.q}”`]);
    if (S.grp && !S.sub.length) a.push(['grp', S.grp, grpBy(S.grp).t]);
    S.sub.forEach(h => a.push(['sub', h, colTitle(h)]));
    S.brand.forEach(b => a.push(['brand', b, (vendors.find(v => v.s === b) || { n: b }).n]));
    if (S.avail) a.push(['avail', S.avail, S.avail === 'online' ? 'Con precio en línea' : 'Precio bajo cotización']);
    if (S.range) a.push(['range', S.range, RANGES.find(r => r[0] === S.range)[1]]);
    if (S.min || S.max) a.push(['mm', '', `${S.min ? I.money0(+S.min) : 'Desde $0'} – ${S.max ? I.money0(+S.max) : 'sin límite'}`]);
    S.x.forEach(x => a.push(['x', x, EXTRAS.find(e => e[0] === x)[1]]));
    return a;
  }
  function renderActive() {
    const a = activeList(), el = $('[data-active]'); el.hidden = !a.length;
    el.innerHTML = a.map(([k, v, l]) => `<button type="button" class="c-tag" data-rm="${k}|${esc(v)}" aria-label="Quitar filtro ${esc(l)}">${esc(l)}${IC.x}</button>`).join('') + (a.length ? `<button type="button" class="c-clear" data-clear>Limpiar filtros</button>` : '');
    const b = $('[data-fbadge]'); if (b) { b.hidden = !a.length; b.textContent = a.length; }
  }

  /* ---------- grid + pagination ---------- */
  const sellWA = K.WA('Hola Inbasix, quiero vender mi equipo. Marca / modelo / año: ');
  const promoSell = `<div class="c-pc c-pc--sell">${IC.swap}<h3>¡Vende tu equipo y renueva tu clínica!</h3><a class="k-btn k-btn--block" href="${sellWA}" target="_blank" rel="noopener">Cotizar</a></div>`;
  const promoAsk = () => `<div class="c-pc c-pc--ask"><img src="${K.PH}real/showroom-ultrasonido.webp" alt="" loading="lazy"><div><h3>¿Buscas otro equipo?</h3><p>Cuéntanos qué necesitas y un asesor te envía tu cotización formal en menos de 24 horas.</p><a class="k-btn k-btn--block" href="${K.WA('Hola Inbasix, busco un equipo que no encontré en el catálogo: ' + (S.q || ''))}" target="_blank" rel="noopener">Hablar con un asesor</a></div></div>`;
  function renderGrid(r) {
    const pages = Math.max(1, Math.ceil(r.length / PER)); if (S.page > pages) S.page = pages;
    const slice = r.slice((S.page - 1) * PER, S.page * PER);
    const cards = slice.map(p => `<div class="c-cell">${K.pcard(p, { actions: true })}</div>`);
    if (cards.length) { if (S.page === 1) { cards.splice(Math.min(2, cards.length), 0, promoSell); if (cards.length > 7) cards.splice(6, 0, promoAsk()); } }
    $('[data-grid]').innerHTML = cards.join('') || `<div class="c-empty">${IC.search}<h3>No encontramos productos con estos filtros</h3><p>Quita algún filtro o pídele a un asesor que te ayude a encontrar el equipo que buscas.</p><div><button type="button" class="k-btn k-btn--ghost" data-clear>Limpiar filtros</button><a class="k-btn" href="${K.WA('Hola Inbasix, busco un equipo: ' + (S.q || ''))}" target="_blank" rel="noopener">Pedir cotización por WhatsApp</a></div></div>`;
    // pagination: numbers with ellipsis like the benchmark (1 2 3 4 … N ›)
    const pg = $('[data-pag]');
    if (pages < 2) { pg.innerHTML = ''; return; }
    const nums = []; const c = S.page;
    for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || (i >= c - 1 && i <= c + 2) || (c <= 2 && i <= 4)) nums.push(i); else if (nums[nums.length - 1] !== '…') nums.push('…');
    pg.innerHTML = `<button type="button" class="c-pg c-pg--a" data-pg="${c - 1}" aria-label="Página anterior"${c === 1 ? ' hidden' : ''}>${IC.left}</button>` + nums.map(n => n === '…' ? '<span class="c-pg c-pg--e">…</span>' : `<button type="button" class="c-pg${n === c ? ' is-on' : ''}" data-pg="${n}"${n === c ? ' aria-current="page"' : ''}>${n}</button>`).join('') + `<button type="button" class="c-pg c-pg--a" data-pg="${c + 1}" aria-label="Página siguiente"${c === pages ? ' hidden' : ''}>${IC.right}</button>`;
  }
  function renderSort() {
    $('[data-sort-label]').textContent = SORTS.find(s => s[0] === S.sort)[1];
    const opts = n => `<p class="c-fsub">Relevancia</p>${radio('featured', n)}<p class="c-fsub">Precio</p>${radio('price-asc', n)}${radio('price-desc', n)}<p class="c-fsub">Nombre</p>${radio('az', n)}`;
    $('[data-sort-menu]').innerHTML = opts('sort-d'); $('[data-smob]').innerHTML = opts('sort-m');
    function radio(k, n) { return `<label class="c-rad"><input type="radio" name="${n}" value="${k}" data-sortv${S.sort === k ? ' checked' : ''}><span></span>${SORTS.find(s => s[0] === k)[1]}</label>`; }
  }
  function render() {
    const r = results();
    const g = grpBy(S.grp), title = S.sub.length === 1 ? colTitle(S.sub[0]) : g ? g.t : S.brand.length === 1 ? (vendors.find(v => v.s === S.brand[0]) || {}).n : 'Todos los productos';
    $('[data-h1]').textContent = title;
    document.title = (title === 'Todos los productos' ? 'Productos' : title) + ' | Inbasix Medical';
    $('[data-rcount]').innerHTML = `<b>${r.length.toLocaleString('es-MX')}</b> ${r.length === 1 ? 'equipo' : 'equipos'}${title !== 'Todos los productos' ? ` <span>en ${esc(title)}</span>` : ''}`;
    renderChips(); renderActive(); renderSide(); renderGrid(r); renderSort(); renderSeo(g, title);
    if ($('[data-fmodal]').classList.contains('is-open')) renderModal();
    const see = $('[data-fsee]'); see.textContent = `Ver (${r.length.toLocaleString('es-MX')})`;
    I.watch($('[data-grid]'));
  }

  /* ---------- SEO band, brands row, links ---------- */
  function renderSeo(g, title) {
    const n = P.filter(p => !g || inGroup(p, g)).length;
    $('[data-seo]').innerHTML = `<h3>${g ? `Catálogo de ${esc(g.t.toLowerCase())} en México` : 'Catálogo de equipo médico y estético en México'}</h3>
      <div class="v-desc is-clamp" data-seo-t><p>${g ? esc(g.d) : 'Ultrasonido, aparatología estética, imagenología, fillers, quirófano y equipo veterinario de marcas como Mindray, Samsung, Nubway, GE, Siemens Healthineers y Philips.'} Hoy tienes ${n} productos en esta categoría.</p>
      <p>Inbasix Medical es importador directo de fábrica y distribuidor autorizado en México: compras sin intermediarios, con garantía de fábrica de 12 meses ampliable a 24, 36 o 48 meses, capacitación botón por botón e instalación profesional en toda la república.</p>
      <p>Paga con transferencia, tarjeta de crédito o débito, crédito bancario o arrendamiento puro. Los equipos con precio bajo cotización te los cotiza un asesor en menos de 24 horas, y tenemos envíos a todo México con entrega estimada de 3 a 10 días hábiles.</p></div>
      <button class="v-more" type="button" data-seo-more>Leer más ${IC.chev}</button>`;
  }
  $('[data-faq]').innerHTML = K.acc(K.FAQ);
  $('[data-shows]').innerHTML = `<h3>Showrooms Inbasix</h3><p>Ve y prueba los equipos en nuestras salas de exhibición de ultrasonido, quirófano, laparoscopía, endoscopía, neonatología y aparatología estética en CDMX, Guadalajara, Monterrey y Chihuahua.</p><p>Showroom Guadalajara: Av. de las Américas 1545, Providencia, 44630 Guadalajara, Jal. Para las otras sedes, <a href="${K.WA('Hola Inbasix, quiero agendar una visita a un showroom.')}" target="_blank" rel="noopener">agenda tu visita por WhatsApp</a>.</p>`;
  $('[data-brands]').innerHTML = `<div class="k-track">${vendors.map(v => `<div><a class="c-brand" href="${K.plp({ brand: v.s })}" data-brandq="${v.s}">${esc(v.n)}</a></div>`).join('')}</div>${K.arrows()}`;
  const L = (arr) => `<div class="k-links">${arr.map(([u, t]) => `<a href="${u}">${esc(t)}</a>`).join('')}</div>`;
  $('[data-links]').innerHTML = K.acc([
    ['Busca por categoría', L(G.map(g => [K.plp({ cat: g.k }), g.t]))],
    ['Busca por subcategoría', L(G.flatMap(g => g.c.slice(1).map(([c, t]) => [K.plp({ cat: c }), t])))],
    ['Busca por marca', L(vendors.map(v => [K.plp({ brand: v.s }), v.n]))],
    ['Busca por rango de precio', L([[K.plp({ price: 'online' }), 'Con precio en línea'], [K.plp({ price: 'quote' }), 'Precio bajo cotización'], ...RANGES.map(([v, l]) => [K.plp({ price: v }), l])])],
    ['Busca por especialidad', L([[K.plp({ q: 'ginecologia' }), 'Ginecología y obstetricia'], [K.plp({ q: 'radiologia' }), 'Radiología'], [K.plp({ cat: 'veterinario' }), 'Veterinaria'], [K.plp({ cat: 'aparatologia-estetica' }), 'Medicina estética'], [K.plp({ q: 'portatil' }), 'Ultrasonido portátil'], [K.plp({ cat: 'quirofano' }), 'Quirófano']])]
  ]);

  /* ---------- events ---------- */
  const toggleArr = (arr, v) => arr.includes(v) ? arr.filter(x => x !== v) : arr.concat(v);
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.matches('[data-sortv]')) { S.sort = t.value; closeSort(); commit(true); return; }
    if (!t.closest('[data-side], [data-fpane]')) return;
    if (t.name === 'sub') { S.sub = toggleArr(S.sub, t.value); commit(true); }
    else if (t.name === 'brand') { S.brand = toggleArr(S.brand, t.value); commit(true); }
    else if (t.name === 'avail') { S.avail = S.avail === t.value ? '' : t.value; commit(true); }
    else if (t.name === 'range') { S.range = S.range === t.value ? '' : t.value; S.min = S.max = ''; commit(true); }
    else if (t.name === 'x') { S.x = toggleArr(S.x, t.value); commit(true); }
    else if (t.name === 'min' || t.name === 'max') { S[t.name] = t.value ? String(Math.max(0, Math.round(+t.value))) : ''; S.range = ''; commit(true); }
  });
  document.addEventListener('click', e => {
    const fh = e.target.closest('.c-facet__h'); if (fh) { const f = fh.parentElement, k = f.dataset.facet; openF.has(k) ? openF.delete(k) : openF.add(k); renderSide(); return; }
    const gb = e.target.closest('[data-grp]'); if (gb) { S.grp = S.grp === gb.dataset.grp ? '' : gb.dataset.grp; S.sub = []; commit(true); return; }
    const qi = e.target.closest('[data-qi]'); if (qi) { const [k, v] = QCH[+qi.dataset.qi];
      if (k === 'brand') S.brand = toggleArr(S.brand, v); else if (k === 'grp') { S.grp = S.grp === v ? '' : v; S.sub = []; } else if (k === 'range') { S.range = S.range === v ? '' : v; S.min = S.max = ''; } else S[k] = S[k] === v ? '' : v; commit(true); return; }
    const rm = e.target.closest('[data-rm]'); if (rm) { const [k, v] = rm.dataset.rm.split('|');
      if (k === 'q') S.q = ''; else if (k === 'grp') { S.grp = ''; S.sub = []; } else if (k === 'sub') S.sub = S.sub.filter(x => x !== v); else if (k === 'brand') S.brand = S.brand.filter(x => x !== v); else if (k === 'mm') S.min = S.max = ''; else if (k === 'x') S.x = S.x.filter(x => x !== v); else S[k] = ''; commit(true); return; }
    if (e.target.closest('[data-clear]')) { S = { grp: '', sub: [], brand: [], avail: '', range: '', min: '', max: '', x: [], q: '', sort: S.sort, page: 1 }; commit(true); return; }
    const pgb = e.target.closest('[data-pg]'); if (pgb) { S.page = +pgb.dataset.pg; history.pushState(null, '', toURL(S)); render(); $('.c-res').scrollIntoView({ behavior: K.RM ? 'auto' : 'smooth', block: 'start' }); return; }
    const bq = e.target.closest('[data-brandq]'); if (bq) { e.preventDefault(); S.brand = [bq.dataset.brandq]; commit(true); $('.c-res').scrollIntoView({ block: 'start' }); return; }
    // sort dropdown (desktop) / sheet (mobile)
    if (e.target.closest('[data-sort-open]')) { const m = $('[data-sort-menu]'); m.hidden = !m.hidden; $('[data-sort-open]').setAttribute('aria-expanded', !m.hidden); return; }
    if (!e.target.closest('[data-sortwrap]')) { const m = $('[data-sort-menu]'); if (m && !m.hidden) { m.hidden = true; $('[data-sort-open]').setAttribute('aria-expanded', 'false'); } }
    if (e.target.closest('[data-sortm-open]')) { const s = $('[data-ssheet]'); s.classList.add('is-open'); s.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('ib-lock'); return; }
    if (e.target.closest('[data-sclose]')) { closeSort(); return; }
    // mobile filter modal
    if (e.target.closest('[data-filters-open]')) { const m = $('[data-fmodal]'); renderModal(); m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('ib-lock'); return; }
    const mt = e.target.closest('[data-mtab]'); if (mt) { mTab = mt.dataset.mtab; renderModal(); return; }
    if (e.target.closest('[data-fclose]')) { const m = $('[data-fmodal]'); m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('ib-lock'); return; }
    if (e.target.closest('[data-seo-more]')) { const d = $('[data-seo-t]'), b = $('[data-seo-more]'); const c = d.classList.toggle('is-clamp'); b.innerHTML = (c ? 'Leer más ' : 'Leer menos ') + IC.chev; return; }
    if (e.target.closest('[data-help-x]')) { $('[data-help]').hidden = true; try { sessionStorage.setItem('k-help-x', '1'); } catch (er) {} }
  });
  function closeSort() { const s = $('[data-ssheet]'); s.classList.remove('is-open'); s.setAttribute('aria-hidden', 'true'); if (!$('[data-fmodal]').classList.contains('is-open')) document.documentElement.classList.remove('ib-lock'); const m = $('[data-sort-menu]'); if (m) m.hidden = true; }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSort(); const m = $('[data-fmodal]'); if (m.classList.contains('is-open')) { m.classList.remove('is-open'); document.documentElement.classList.remove('ib-lock'); } } });
  // header search filters in place
  const hs = $('.k-search-row [data-search]');
  if (hs) { hs.dataset.local = 1; hs.addEventListener('k:search', e => { S.q = e.detail; commit(true); $('.c-res').scrollIntoView({ block: 'start' }); }); }

  /* floating help banner (benchmark's "¿No encuentras lo que buscas?") */
  const help = $('[data-help]'); $('[data-help-wa]').href = K.WA('Hola Inbasix, no encuentro el equipo que busco. ¿Me ayudan?');
  let dismissed = false; try { dismissed = sessionStorage.getItem('k-help-x') === '1'; } catch (er) {}
  if (!dismissed) addEventListener('scroll', function onS() { if (scrollY > 900) { help.hidden = false; removeEventListener('scroll', onS); } }, { passive: true });

  S = parse();
  if (S.q) { const i = $('.k-search-row input'); if (i) i.value = S.q; }
  render();
  K.carousel(document);
})();
