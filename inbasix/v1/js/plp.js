/* Inbasix v1 · category page (coleccion.html): groups → collections, brand, price, search, sort, URL state */
(function () {
  const K = window.IBK, V = window.V1;
  const { $, $$, esc } = V;
  const P = K.P;

  /* group map (defined once): group key → real Shopify collections inside it */
  const ORDER = ['ultrasonido', 'aparatologia', 'imagenologia', 'fillers', 'veterinario', 'quirofano', 'transductores', 'cardiologia'];
  const G = V.GROUPS;
  const SUBCOLS = { // drill-down collections shown per group (only those with products)
    ultrasonido: ['equipo-de-ultrasonido-mindray', 'equipo-de-ultrasonido-samsung', 'ultrasonidos-de-gabinete-uso-humano', 'radiologia-portatil-humano', 'ginecologia-mindray', 'imagenes-generales-mindray', 'samsung-gabinete-ginecologia'],
    aparatologia: ['nubway', 'gilaser', 'serie-antienvejecimiento', 'serie-para-adelgazar-y-dar-forma', 'serie-para-depilacion', 'serie-cuidado-de-la-piel', 'serie-removedor-de-tatuajes-y-pigmentacion', 'serie-terapia-en-frio', 'serie-tratamiento-de-venas', 'rehabilitacion'],
    imagenologia: G.imagenologia.cols,
    fillers: ['rejubeau', 'youthfill'],
    veterinario: G.veterinario.cols,
    quirofano: ['quirofano'],
    transductores: G.transductores.cols,
    cardiologia: G.cardiologia.cols,
  };
  const ICON = {
    all: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
    ultrasonido: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4M8 12a4 4 0 0 1 8 0"/>',
    aparatologia: '<path d="M12 3v6M9 9h6l-1 8h-4zM10 17v4h4v-4"/>',
    imagenologia: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>',
    fillers: '<path d="M10 3h4M12 3v3M9 6h6v12a3 3 0 0 1-6 0z"/>',
    veterinario: '<circle cx="8" cy="8" r="2"/><circle cx="16" cy="8" r="2"/><circle cx="5" cy="13" r="2"/><circle cx="19" cy="13" r="2"/><path d="M12 12c3 0 5 4 4 6s-6 2-8 0 1-6 4-6z"/>',
    quirofano: '<path d="M4 10h16M7 10V6h10v4M6 10v8M18 10v8"/>',
    transductores: '<path d="M9 3h6v9l-3 9-3-9z"/>',
    cardiologia: '<path d="M3 12h4l2-5 3 10 2-5h7"/>',
  };
  const RANGES = [['0-10000', 'Hasta $10,000'], ['10000-100000', '$10,000 a $100,000'], ['100000-300000', '$100,000 a $300,000'], ['300000-', 'Más de $300,000']];
  const BANNER = { ultrasonido: 'scenes/ultrasonido-16x9', aparatologia: 'scenes/aparatologia-16x9', imagenologia: 'scenes/imagenologia-16x9', fillers: 'scenes/fillers-16x9', veterinario: 'scenes/veterinario-16x9', all: 'banners/showroom-16x9' };
  const FAQ = [
    ['¿Cómo me aseguran que tienen el mejor precio?', 'Somos importadores directos de fábrica y distribuidor autorizado de la marca en México. Compras sin intermediarios y recibes tu cotización formal en menos de 24 horas.'],
    ['No soy médico, soy dueño de un spa, ¿puedo comprar?', 'Sí. Spas y centros de bienestar también pueden comprar aparatología estética con nosotros.'],
    ['¿Dónde puedo ver el equipo?', 'En nuestros showrooms de CDMX, Guadalajara, Monterrey y Chihuahua.'],
    ['¿Qué formas de pago tienen?', 'Transferencia BBVA, tarjeta de crédito o débito, crédito bancario y arrendamiento puro.'],
    ['¿Qué garantía dan?', 'Garantía estándar del fabricante de 12 meses, ampliable a 24, 36 o 48 meses, y servicio postventa después de la garantía.'],
    ['¿Cuál es el tiempo de entrega?', 'La entrega estimada es de 3 a 10 días hábiles después de confirmado tu pedido. Enviamos a todo México.'],
  ];

  const LBL = { 'equipo-de-ultrasonido-mindray': 'Mindray', 'equipo-de-ultrasonido-samsung': 'Samsung', 'ultrasonidos-de-gabinete-uso-humano': 'De gabinete', 'radiologia-portatil-humano': 'Portátiles', 'ginecologia-mindray': 'Ginecología Mindray', 'imagenes-generales-mindray': 'Imágenes generales', 'samsung-gabinete-ginecologia': 'Ginecología Samsung',
    nubway: 'Nubway', gilaser: 'GiLáser', 'serie-antienvejecimiento': 'Antienvejecimiento', 'serie-para-adelgazar-y-dar-forma': 'Corporal', 'serie-para-depilacion': 'Depilación', 'serie-cuidado-de-la-piel': 'Cuidado de la piel', 'serie-removedor-de-tatuajes-y-pigmentacion': 'Tatuajes y pigmentación', 'serie-terapia-en-frio': 'Terapia en frío', 'serie-tratamiento-de-venas': 'Venas', rehabilitacion: 'Rehabilitación',
    'transductores-de-uso-humano': 'Transductores', accesorios: 'Accesorios Mindray', 'desfibriladores-mindray': 'Desfibriladores', 'electrocardiografos-uso-humano': 'Electrocardiógrafos', 'tomografia-pet-pet-ct': 'PET y PET-CT', 'rayos-x-y-digitalizadores': 'Rayos X', 'ultrasonido-veterinario': 'Ultrasonido veterinario', youthfill: 'Youthfill', rejubeau: 'Rejubeau' };
  const colT0 = h => ((K.COLS.find(c => c.h === h) || {}).t || h).replace(/\b([A-ZÁÉÍÓÚÑ]{3,})\b/g, w => w[0] + w.slice(1).toLowerCase());
  const colT = h => LBL[h] || colT0(h);
  const groupOf = key => G[key] ? key : ORDER.find(g => (SUBCOLS[g] || []).includes(key) || G[g].cols.includes(key)) || null;
  const price = p => K.minPrice(p);
  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  /* ---------- state <-> URL ---------- */
  const S = { cat: '', brand: [], price: [], q: '', sort: 'featured', page: 1 };
  function read() {
    const u = new URLSearchParams(location.search);
    S.cat = u.get('cat') || ''; if (S.cat && !V.colTitle(S.cat) && !K.COLS.some(c => c.h === S.cat)) S.cat = '';
    S.brand = (u.get('brand') || '').split(',').filter(Boolean);
    S.price = (u.get('price') || '').split(',').filter(Boolean);
    S.q = u.get('q') || ''; S.sort = u.get('sort') || 'featured'; S.page = Math.max(1, +u.get('page') || 1);
  }
  function write(push) {
    const u = new URLSearchParams();
    if (S.cat) u.set('cat', S.cat); if (S.brand.length) u.set('brand', S.brand.join(',')); if (S.price.length) u.set('price', S.price.join(','));
    if (S.q) u.set('q', S.q); if (S.sort !== 'featured') u.set('sort', S.sort); if (S.page > 1) u.set('page', S.page);
    const url = location.pathname + (u.toString() ? '?' + u : '');
    if (url !== location.pathname + location.search) history[push ? 'pushState' : 'replaceState'](null, '', url);
  }

  /* ---------- filtering (each facet counted against the other facets) ---------- */
  const inCat = (p, cat) => !cat || (G[cat] ? V.inGroup(p, cat) : p.cols.includes(cat));
  const okBrand = (p, b) => !b.length || b.includes(p.vendor);
  const okPrice = (p, pr) => !pr.length || pr.some(r => {
    if (r === 'online') return !K.isQuote(p);
    if (r === 'quote') return K.isQuote(p);
    const [a, b] = r.split('-').map(x => x === '' ? null : +x), m = price(p);
    return m != null && m >= (a || 0) && (b == null || m < b);
  });
  const okQ = (p, q) => !q || norm(p.t + ' ' + p.vendor + ' ' + p.type).includes(norm(q));
  const filtered = (skip) => P.filter(p => (skip === 'cat' || inCat(p, S.cat)) && (skip === 'brand' || okBrand(p, S.brand)) && (skip === 'price' || okPrice(p, S.price)) && okQ(p, S.q));
  function sorted(list) {
    const l = list.slice();
    if (S.sort === 'price-asc') l.sort((a, b) => (price(a) ?? Infinity) - (price(b) ?? Infinity));
    else if (S.sort === 'price-desc') l.sort((a, b) => (price(b) ?? -1) - (price(a) ?? -1));
    else if (S.sort === 'az') l.sort((a, b) => K.shortName(a).localeCompare(K.shortName(b), 'es'));
    else l.sort((a, b) => (!a.img.length - !b.img.length) || (K.isQuote(a) - K.isQuote(b)) || (b.img.length > 2) - (a.img.length > 2));
    return l;
  }

  /* ---------- render ---------- */
  const PER = 24;
  const tabsIn = $('[data-tabs-in]'), subs = $('[data-subs]'), grid = $('[data-grid]'), more = $('[data-more]'), empty = $('[data-empty]'), act = $('[data-act]'), fdB = $('[data-fd-b]');
  function render() {
    const grp = S.cat ? groupOf(S.cat) : null;
    const base = P.filter(p => okBrand(p, S.brand) && okPrice(p, S.price) && okQ(p, S.q)); // for tab counts
    // tabs (benchmark sticky icon tabs)
    tabsIn.innerHTML = [['', 'Todos los productos'], ...ORDER.map(k => [k, G[k].t])].map(([k, t]) => {
      const n = base.filter(p => inCat(p, k)).length, on = (k || '') === (grp || '');
      return `<a class="tab${on ? ' is-on' : ''}" href="coleccion.html${k ? '?cat=' + k : ''}" data-cat="${k}"${on ? ' aria-current="page"' : ''}><span class="tab-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k || 'all']}</svg></span><span class="tab-tx"><strong>${esc(t)}</strong><em>${n} ${n === 1 ? 'equipo' : 'equipos'}</em></span></a>`;
    }).join('');
    // sub-collections (drill-down)
    const subList = grp ? (SUBCOLS[grp] || []).map(c => [c, base.filter(p => p.cols.includes(c)).length]).filter(([, n]) => n) : [];
    subs.hidden = subList.length < 2;
    subs.innerHTML = subList.length < 2 ? '' : `<button class="chip-y${S.cat === grp ? ' is-on' : ''}" type="button" data-sub="${grp}">Todo ${esc(G[grp].t.toLowerCase())}</button>` +
      subList.map(([c, n]) => `<button class="chip-y${S.cat === c ? ' is-on' : ''}" type="button" data-sub="${c}">${esc(colT(c))} <small>${n}</small></button>`).join('');
    // header
    const title = !S.cat ? 'Todos los productos' : (G[S.cat] ? G[S.cat].t : colT(S.cat));
    $('[data-plp-title]').textContent = title;
    const inC = P.filter(p => inCat(p, S.cat));
    const brands = [...new Set(inC.map(p => V.vendor(p)))];
    $('[data-plp-sub]').textContent = `${inC.length} ${inC.length === 1 ? 'producto' : 'productos'} · ${brands.slice(0, 4).join(', ')}${brands.length > 4 ? ' y más' : ''}`;
    const bn = BANNER[grp || 'all'] || BANNER.all; const img = $('[data-plp-img]');
    if (!img.src.includes(bn)) img.src = '../assets/photo/' + bn + '.webp';
    $('[data-plp-h2]').textContent = title;
    // results
    const list = sorted(filtered());
    const shown = list.slice(0, S.page * PER);
    grid.innerHTML = shown.map(V.card).join('');
    more.hidden = shown.length >= list.length;
    empty.hidden = !!list.length;
    $('[data-n]').textContent = `${list.length} ${list.length === 1 ? 'equipo' : 'equipos'}`;
    $('[data-sort]').value = S.sort;
    const q = $('[data-q]'); if (document.activeElement !== q) q.value = S.q;
    // active chips
    const chips = [];
    if (S.cat) chips.push(['cat', '', title]);
    S.brand.forEach(b => chips.push(['brand', b, b]));
    S.price.forEach(r => chips.push(['price', r, r === 'online' ? 'Con precio en línea' : r === 'quote' ? 'Precio bajo cotización' : (RANGES.find(x => x[0] === r) || [, r])[1]]));
    if (S.q) chips.push(['q', '', '“' + S.q + '”']);
    act.innerHTML = chips.length ? chips.map(([k, v, t]) => `<button class="act-c" type="button" data-rm="${k}" data-v="${esc(v)}" aria-label="Quitar filtro ${esc(t)}">${esc(t)}<span aria-hidden="true">×</span></button>`).join('') + '<button class="act-x" type="button" data-clear>Limpiar filtros</button>' : '';
    const nf = S.brand.length + S.price.length + (S.cat ? 1 : 0);
    $('[data-f-n]').textContent = nf ? ` (${nf})` : '';
    // drawer facets (live counts excluding own facet)
    const fCat = filtered('cat'), fBrand = filtered('brand'), fPrice = filtered('price');
    const box = (name, val, label, n, on) => `<label class="fo${n ? '' : ' is-0'}"><input type="checkbox" data-fk="${name}" value="${esc(val)}"${on ? ' checked' : ''}${n || on ? '' : ' disabled'}><span class="fo-b"></span><span class="fo-t">${esc(label)}</span><span class="fo-n">${n}</span></label>`;
    const radio = (val, label, n, on) => `<label class="fo${n ? '' : ' is-0'}"><input type="radio" name="fcat" data-fk="cat" value="${val}"${on ? ' checked' : ''}${n || on ? '' : ' disabled'}><span class="fo-b r"></span><span class="fo-t">${esc(label)}</span><span class="fo-n">${n}</span></label>`;
    const allBrands = [...new Set(P.map(p => p.vendor))].sort((a, b) => fBrand.filter(p => p.vendor === b).length - fBrand.filter(p => p.vendor === a).length);
    fdB.innerHTML = `
      <details class="fg" open><summary>Categoría${V.IC.chev}</summary><div class="fg-b">${radio('', 'Todos los productos', fCat.length, !S.cat)}${ORDER.map(k => radio(k, G[k].t, fCat.filter(p => inCat(p, k)).length, S.cat === k) + (grp === k ? `<div class="fg-sub">${(SUBCOLS[k] || []).map(c => [c, fCat.filter(p => p.cols.includes(c)).length]).filter(([, n]) => n).map(([c, n]) => radio(c, colT(c), n, S.cat === c)).join('')}</div>` : '')).join('')}</div></details>
      <details class="fg" open><summary>Marca${V.IC.chev}</summary><div class="fg-b">${allBrands.map(b => box('brand', b, V.vendor({ vendor: b }), fBrand.filter(p => p.vendor === b).length, S.brand.includes(b))).join('')}</div></details>
      <details class="fg" open><summary>Precio${V.IC.chev}</summary><div class="fg-b">${box('price', 'online', 'Con precio en línea', fPrice.filter(p => !K.isQuote(p)).length, S.price.includes('online'))}${box('price', 'quote', 'Precio bajo cotización', fPrice.filter(p => K.isQuote(p)).length, S.price.includes('quote'))}
        <p class="fg-k">Rangos de precio</p>${RANGES.map(([r, t]) => box('price', r, t, fPrice.filter(p => okPrice(p, [r])).length, S.price.includes(r))).join('')}</div></details>`;
    $('[data-f-apply]').textContent = `Ver ${list.length} ${list.length === 1 ? 'equipo' : 'equipos'}`;
    // guide table
    const gk = grp || null;
    const rows = gk ? (SUBCOLS[gk] || []).map(c => [c, P.filter(p => p.cols.includes(c))]) : ORDER.map(k => [k, P.filter(p => V.inGroup(p, k))]);
    $('[data-guide-t]').textContent = gk ? G[gk].t.toLowerCase() : 'categorías';
    $('[data-guide]').innerHTML = rows.filter(([, l]) => l.length).map(([c, l]) => `<tr><td><a href="coleccion.html?cat=${c}">${esc(G[c] ? G[c].t : colT(c))}</a></td><td>${l.length}</td><td>${esc([...new Set(l.map(p => V.vendor(p)))].join(', '))}</td></tr>`).join('');
    K.watch(grid);
  }

  /* ---------- events ---------- */
  const set = (patch, push) => { Object.assign(S, patch); if (!('page' in patch)) S.page = 1; write(push); render(); };
  tabsIn.addEventListener('click', e => { const a = e.target.closest('[data-cat]'); if (!a) return; e.preventDefault(); set({ cat: a.dataset.cat }, true); a.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); });
  subs.addEventListener('click', e => { const b = e.target.closest('[data-sub]'); if (b) set({ cat: b.dataset.sub }, true); });
  $('[data-sort]').addEventListener('change', e => set({ sort: e.target.value }));
  let qt; $('[data-q]').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => set({ q: e.target.value.trim() }), 200); });
  more.addEventListener('click', () => set({ page: S.page + 1 }));
  act.addEventListener('click', e => {
    const b = e.target.closest('[data-rm]'); if (!b) return;
    const k = b.dataset.rm, v = b.dataset.v;
    if (k === 'cat') set({ cat: '' }, true); else if (k === 'q') set({ q: '' }); else set({ [k]: S[k].filter(x => x !== v) });
  });
  document.addEventListener('click', e => { if (e.target.closest('[data-clear]')) set({ cat: '', brand: [], price: [], q: '' }, true); });
  fdB.addEventListener('change', e => {
    const i = e.target; if (!i.dataset.fk) return;
    if (i.dataset.fk === 'cat') return set({ cat: i.value });
    const k = i.dataset.fk; set({ [k]: i.checked ? [...S[k], i.value] : S[k].filter(x => x !== i.value) });
  });
  // drawer (same motion as the mobile menu: transform .2s, scrim opacity .1s)
  const fd = $('[data-fd]');
  const openF = o => { fd.classList.toggle('is-open', o); fd.setAttribute('aria-hidden', String(!o)); document.documentElement.classList.toggle('ib-lock', o); if (o) setTimeout(() => fd.querySelector('.fd-h button').focus(), 50); };
  $('[data-f-open]').addEventListener('click', () => openF(true));
  fd.addEventListener('click', e => { if (e.target.closest('[data-f-close]')) openF(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && fd.classList.contains('is-open')) openF(false); });
  // tabs arrow
  $('[data-tabs-nx]').addEventListener('click', () => tabsIn.scrollBy({ left: 360, behavior: 'smooth' }));
  const tabs = $('[data-tabs]');
  if ('IntersectionObserver' in window) { const sen = document.createElement('div'); tabs.before(sen); new IntersectionObserver(([en]) => tabs.classList.toggle('is-stuck', !en.isIntersecting), { rootMargin: '-69px 0px 0px 0px' }).observe(sen); }
  window.addEventListener('popstate', () => { read(); render(); });
  $('[data-faq]').innerHTML = `<div class="acc">${FAQ.map(([q, a]) => `<div class="acc-i"><button class="acc-b" type="button" aria-expanded="false">${esc(q)}${V.IC.chev}</button><div class="acc-c"><div><p>${esc(a)}</p></div></div></div>`).join('')}</div>`;
  $('[data-faq]').addEventListener('click', e => { const b = e.target.closest('.acc-b'); if (!b) return; const it = b.parentElement, o = !it.classList.contains('is-open'); it.classList.toggle('is-open', o); b.setAttribute('aria-expanded', String(o)); });

  read(); render();
  const on = tabsIn.querySelector('.is-on'); if (on && on.offsetLeft > tabsIn.clientWidth - 200) tabsIn.scrollLeft = on.offsetLeft - 100;
})();
