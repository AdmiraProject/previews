(function () {
  const { inCol, colTitle, GROUPS, groupOf, inGroup, nm, K, B, esc, WA, tile, vendorName, I, photos } = window.V3;
  const main = document.querySelector('[data-plp]');
  const PER = 24;
  const PRICES = [['linea', 'Con precio en línea'], ['cotizacion', 'Precio bajo cotización'], ['0-100000', 'Hasta $100,000'], ['100000-250000', '$100,000 a $250,000'], ['250000-500000', '$250,000 a $500,000'], ['500000-', 'Más de $500,000']];
  const SORTS = [['featured', 'Destacados'], ['price-asc', 'Precio: menor a mayor'], ['price-desc', 'Precio: mayor a menor'], ['az', 'Nombre: A a Z']];
  const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const cleanT = t => /^[^a-záéíóúñ]+$/.test(t) ? t.charAt(0) + t.slice(1).toLowerCase() : t;
  const colCount = h => K.P.filter(p => inCol(p, h)).length;
  const isGroup = k => !!groupOf(k);
  const ALL = K.P.slice();
  const VENDORS = [...new Set(ALL.map(p => p.vendor))].sort((a, b) => ALL.filter(p => p.vendor === b).length - ALL.filter(p => p.vendor === a).length);

  /* ---------- state ---------- */
  const list = v => (v || '').split(',').map(s => s.trim()).filter(Boolean);
  const read = () => { const u = new URLSearchParams(location.search); return { cat: list(u.get('cat')), brand: list(u.get('brand')), price: list(u.get('price')), q: u.get('q') || '', sort: SORTS.some(s => s[0] === u.get('sort')) ? u.get('sort') : 'featured', page: Math.max(1, +u.get('page') || 1) }; };
  const write = (st, push) => { const u = new URLSearchParams(); if (st.cat.length) u.set('cat', st.cat.join(',')); if (st.brand.length) u.set('brand', st.brand.join(',')); if (st.price.length) u.set('price', st.price.join(',')); if (st.q) u.set('q', st.q); if (st.sort !== 'featured') u.set('sort', st.sort); if (st.page > 1) u.set('page', st.page); const url = 'coleccion.html' + (u.toString() ? '?' + u : ''); history[push ? 'pushState' : 'replaceState'](null, '', url); };
  let S = read();
  const clone = s => JSON.parse(JSON.stringify(s));

  /* ---------- filtering ---------- */
  const mCat = (p, cat) => !cat.length || cat.some(c => isGroup(c) ? inGroup(p, c) : inCol(p, c));
  const mBrand = (p, b) => !b.length || b.includes(p.vendor);
  const mPrice = (p, pr) => !pr.length || pr.some(k => { if (k === 'linea') return !K.isQuote(p); if (k === 'cotizacion') return K.isQuote(p); const [a, z] = k.split('-').map(Number); const m = K.minPrice(p); return m != null && m >= (a || 0) && (!z || m < z); });
  const mQ = (p, q) => !q || norm(p.t + ' ' + p.vendor + ' ' + p.type + ' ' + p.cols.join(' ')).includes(norm(q));
  const match = (p, st, skip) => (skip === 'cat' || mCat(p, st.cat)) && (skip === 'brand' || mBrand(p, st.brand)) && (skip === 'price' || mPrice(p, st.price)) && mQ(p, st.q);
  const results = st => { let a = ALL.filter(p => match(p, st)); const pr = p => K.minPrice(p);
    if (st.sort === 'price-asc') a.sort((x, y) => (pr(x) ?? 1e15) - (pr(y) ?? 1e15));
    else if (st.sort === 'price-desc') a.sort((x, y) => (pr(y) ?? -1) - (pr(x) ?? -1));
    else if (st.sort === 'az') a.sort((x, y) => nm(x).localeCompare(nm(y), 'es'));
    else a.sort((x, y) => (K.isQuote(x) - K.isQuote(y)) || (!x.img.length - !y.img.length) || ((y.img.length > 1) - (x.img.length > 1)));
    return a; };
  const count = (st, facet, val) => { const t = clone(st); t[facet] = [val]; return ALL.filter(p => match(p, t, null) && match(p, st, facet)).length; };
  const label = (facet, v) => facet === 'cat' ? (isGroup(v) ? groupOf(v).t : colTitle(v)) : facet === 'brand' ? vendorName(v) : (PRICES.find(x => x[0] === v) || [0, v])[1];

  /* ---------- skeleton ---------- */
  main.innerHTML = `
  <section class="cban" data-cban><div class="cban__img" data-cban-img></div><div class="cban__txt"><div class="cban__in"><h1 class="cban__h" data-cban-h></h1><p class="cban__p" data-cban-p></p></div></div></section>
  <section class="plx">
    <div class="plx__chips" data-qchips role="group" aria-label="Categorías"></div>
    <div class="plx__bar"><span class="plx__count" data-count-txt aria-live="polite"></span><button type="button" class="plx__fbtn" data-fopen aria-haspopup="dialog">Filtros<span data-fbadge hidden></span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 4.5h7M12 4.5h2M2 11.5h2M7 11.5h7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="10.5" cy="4.5" r="1.5" stroke="currentColor" stroke-width="1.3"/><circle cx="5.5" cy="11.5" r="1.5" stroke="currentColor" stroke-width="1.3"/></svg></button></div>
    <div class="plx__active" data-active hidden></div>
    <div class="grid4 plx__grid" data-grid></div>
    <div class="plx__more" data-more></div>
  </section>
  <div class="fdr" data-fdr aria-hidden="true"><div class="fdr__scrim" data-fclose></div>
    <div class="fdr__panel" role="dialog" aria-modal="true" aria-labelledby="fdr-h">
      <div class="fdr__hd"><h2 id="fdr-h">Filtros</h2><button type="button" class="fdr__x" data-fclose aria-label="Cerrar filtros">${I.close}</button></div>
      <div class="fdr__body" data-fbody></div>
      <div class="fdr__ft"><button type="button" class="btn btn--ghost" data-fclear>Limpiar filtros</button><button type="button" class="btn btn--cyan" data-fapply>Ver resultados</button></div>
    </div></div>`;

  const $ = s => main.querySelector(s);
  const grid = $('[data-grid]'), more = $('[data-more]'), fdr = $('[data-fdr]'), fbody = $('[data-fbody]');
  let D = clone(S); // draft state inside the drawer
  const openSecs = new Set(['sort', 'cat', 'brand', 'price']);
  const openGroups = new Set();

  /* ---------- render page ---------- */
  function banner() {
    const one = S.cat.length === 1 ? S.cat[0] : null;
    const g = one ? (groupOf(one) || GROUPS.find(x => x.cols.includes(one))) : null;
    const title = one ? label('cat', one) : (S.q ? `Resultados para “${S.q}”` : 'Todos los equipos');
    const desc = g ? g.d : 'Ultrasonido, aparatología estética, imagenología, fillers y equipo veterinario. Precio en línea o cotización formal en menos de 24 horas';
    const img = g ? g.img : 'banners/showroom-16x9.webp';
    $('[data-cban-h]').textContent = title; $('[data-cban-p]').textContent = desc;
    const box = $('[data-cban-img]'); if (box.dataset.src !== img) { box.dataset.src = img; box.innerHTML = `<img src="${B}assets/photo/${img}" alt="" fetchpriority="high">`; }
  }
  function chips() {
    const cur = S.cat.length === 1 ? S.cat[0] : (S.cat.length ? null : 'all');
    $('[data-qchips]').innerHTML = `<button type="button" data-qc="all" aria-pressed="${cur === 'all'}">Todos</button>` + GROUPS.map(g => `<button type="button" data-qc="${g.k}" aria-pressed="${cur === g.k}">${esc(g.t)}</button>`).join('') + `<button type="button" data-qc="linea" aria-pressed="${S.price.length === 1 && S.price[0] === 'linea'}">Con precio en línea</button>`;
  }
  function active() {
    const items = [...S.cat.map(v => ['cat', v]), ...S.brand.map(v => ['brand', v]), ...S.price.map(v => ['price', v]), ...(S.q ? [['q', S.q]] : [])];
    const box = $('[data-active]'); box.hidden = !items.length;
    box.innerHTML = items.map(([f, v]) => `<button type="button" class="plx__ac" data-rm="${f}|${esc(v)}" aria-label="Quitar filtro ${esc(f === 'q' ? v : label(f, v))}">${esc(f === 'q' ? `“${v}”` : label(f, v))}${I.x}</button>`).join('') + (items.length ? `<button type="button" class="plx__clear" data-clearall>Limpiar filtros</button>` : '');
    const n = items.length; const bd = $('[data-fbadge]'); bd.hidden = !n; bd.textContent = n;
  }
  function render(anim) {
    const a = results(S), shown = Math.min(a.length, S.page * PER);
    banner(); chips(); active();
    $('[data-count-txt]').textContent = `${a.length} ${a.length === 1 ? 'producto' : 'productos'}`;
    grid.innerHTML = a.slice(0, shown).map(p => tile(p)).join('') || `<div class="plx__empty"><h2 class="h3">No encontramos equipos con esos filtros</h2><p class="t-l">Prueba con menos filtros o pídele a un asesor una cotización a la medida</p><div><button type="button" class="btn btn--ghost" data-clearall>Limpiar filtros</button><a class="btn btn--cyan" href="${WA('Hola Inbasix, busco un equipo que no encontré en el catálogo')}" target="_blank" rel="noopener">Cotizar por WhatsApp</a></div></div>`;
    more.innerHTML = a.length > PER ? `<p><b>${shown}</b> de ${a.length} productos</p><i class="plx__prog"><b style="transform:scaleX(${shown / a.length})"></b></i>${shown < a.length ? `<button type="button" class="btn btn--soft" data-more-btn>Ver más</button>` : ''}` : '';
    if (anim) { grid.classList.remove('fade-in'); void grid.offsetWidth; grid.classList.add('fade-in'); }
    if (photos) photos(main);
  }

  /* ---------- drawer ---------- */
  const box = (type, name, val, on, txt, n, cls) => `<label class="fo${cls ? ' ' + cls : ''}${n === 0 && !on ? ' is-zero' : ''}"><input type="${type}" name="${name}" value="${esc(val)}"${on ? ' checked' : ''}${n === 0 && !on ? ' disabled' : ''}><i aria-hidden="true"></i><span>${txt}</span>${n != null ? `<em>${n}</em>` : ''}</label>`;
  const sec = (id, title, body) => `<details class="fs" data-sec="${id}"${openSecs.has(id) ? ' open' : ''}><summary>${title}<i aria-hidden="true"></i></summary><div class="fs__b">${body}</div></details>`;
  function drawer() {
    const scroll = fbody.scrollTop;
    const catHTML = GROUPS.map(g => {
      const subs = g.cols.filter(c => colCount(c) > 0);
      const exp = openGroups.has(g.k) || D.cat.includes(g.k) || subs.some(c => D.cat.includes(c));
      return `<div class="fg">${box('checkbox', 'cat', g.k, D.cat.includes(g.k), esc(g.t), count(D, 'cat', g.k))}${subs.length > 1 ? `<button type="button" class="fg__t" data-fg="${g.k}" aria-expanded="${exp}" aria-label="Ver colecciones de ${esc(g.t)}">${I.chevD}</button>` : ''}
        ${subs.length > 1 ? `<div class="fg__subs"${exp ? '' : ' hidden'}>${subs.map(c => box('checkbox', 'cat', c, D.cat.includes(c), esc(colTitle(c)), count(D, 'cat', c), 'fo--sub')).join('')}</div>` : ''}</div>`;
    }).join('');
    fbody.innerHTML = `<label class="fsearch"><span class="vh">Buscar</span>${I.search.replace('<svg', '<svg width="18" height="18"')}<input type="search" data-fq placeholder="Buscar equipo, marca o modelo" value="${esc(D.q)}"></label>` +
      sec('sort', 'Ordenar por', SORTS.map(([v, t]) => box('radio', 'sort', v, D.sort === v, t, null)).join('')) +
      sec('cat', 'Categoría', catHTML) +
      sec('brand', 'Marca', VENDORS.map(v => box('checkbox', 'brand', v, D.brand.includes(v), esc(vendorName(v)), count(D, 'brand', v))).join('')) +
      sec('price', 'Precio', PRICES.map(([v, t]) => box('checkbox', 'price', v, D.price.includes(v), t, count(D, 'price', v))).join(''));
    fbody.scrollTop = scroll;
    const n = results(D).length; $('[data-fapply]').textContent = n ? `Ver ${n} ${n === 1 ? 'producto' : 'productos'}` : 'Sin resultados';
    $('[data-fapply]').disabled = !n;
  }
  let lastFocus = null;
  function openD(focusQ) { D = clone(S); drawer(); lastFocus = document.activeElement; fdr.classList.add('is-open'); fdr.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('ib-lock'); setTimeout(() => { const t = focusQ ? fbody.querySelector('[data-fq]') : fdr.querySelector('.fdr__x'); if (t) t.focus(); }, 250); }
  function closeD() { fdr.classList.remove('is-open'); fdr.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('ib-lock'); if (lastFocus) lastFocus.focus(); }
  function commit(st, push) { S = st; S.page = 1; write(S, push); render(true); }

  fbody.addEventListener('change', e => {
    const t = e.target; if (!t.name) return;
    if (t.name === 'sort') D.sort = t.value;
    else {
      const arr = D[t.name]; const v = t.value;
      if (t.checked) { arr.push(v); if (t.name === 'cat') { if (isGroup(v)) { const g = groupOf(v); D.cat = D.cat.filter(c => !g.cols.includes(c) || c === v); } else { const g = GROUPS.find(x => x.cols.includes(v)); if (g) D.cat = D.cat.filter(c => c !== g.k); } } }
      else D[t.name] = arr.filter(x => x !== v);
    }
    drawer();
  });
  let tq; fbody.addEventListener('input', e => { if (!e.target.matches('[data-fq]')) return; clearTimeout(tq); tq = setTimeout(() => { D.q = e.target.value.trim(); const pos = e.target.selectionStart; drawer(); const f = fbody.querySelector('[data-fq]'); f.focus(); f.setSelectionRange(pos, pos); }, 200); });
  fbody.addEventListener('keydown', e => { if (e.target.matches('[data-fq]') && e.key === 'Enter') { e.preventDefault(); D.q = e.target.value.trim(); commit(clone(D), true); closeD(); } });
  fbody.addEventListener('click', e => { const g = e.target.closest('[data-fg]'); if (g) { const k = g.dataset.fg; openGroups.has(k) ? openGroups.delete(k) : openGroups.add(k); const subs = g.parentElement.querySelector('.fg__subs'); const ex = g.getAttribute('aria-expanded') !== 'true'; g.setAttribute('aria-expanded', ex); subs.hidden = !ex; } });
  fbody.addEventListener('toggle', e => { const d = e.target; if (d.matches && d.matches('details[data-sec]')) d.open ? openSecs.add(d.dataset.sec) : openSecs.delete(d.dataset.sec); }, true);
  $('[data-fapply]').addEventListener('click', () => { commit(clone(D), true); closeD(); main.querySelector('.plx').scrollIntoView({ block: 'start' }); });
  $('[data-fclear]').addEventListener('click', () => { D = { cat: [], brand: [], price: [], q: '', sort: D.sort, page: 1 }; drawer(); });
  fdr.addEventListener('click', e => { if (e.target.closest('[data-fclose]')) closeD(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && fdr.classList.contains('is-open')) closeD(); });
  $('[data-fopen]').addEventListener('click', () => openD());
  document.addEventListener('click', e => { const s = e.target.closest('[data-search]'); if (s) { e.preventDefault(); e.stopImmediatePropagation(); openD(true); } }, true);

  /* ---------- page events ---------- */
  main.addEventListener('click', e => {
    const qc = e.target.closest('[data-qc]');
    if (qc) { const k = qc.dataset.qc; const st = clone(S); if (k === 'all') { st.cat = []; st.brand = []; st.price = []; st.q = ''; } else if (k === 'linea') { st.price = st.price.length === 1 && st.price[0] === 'linea' ? [] : ['linea']; } else { st.cat = S.cat.length === 1 && S.cat[0] === k ? [] : [k]; st.brand = []; st.price = []; st.q = ''; } commit(st, true); return; }
    const rm = e.target.closest('[data-rm]');
    if (rm) { const [f, v] = rm.dataset.rm.split('|'); const st = clone(S); if (f === 'q') st.q = ''; else st[f] = st[f].filter(x => x !== v); commit(st, true); return; }
    if (e.target.closest('[data-clearall]')) { commit({ cat: [], brand: [], price: [], q: '', sort: S.sort, page: 1 }, true); return; }
    if (e.target.closest('[data-more-btn]')) { S.page++; write(S, false); const before = grid.children.length; render(false); const first = grid.children[before]; if (first) first.querySelector('a.tile__t').focus({ preventScroll: true }); }
  });
  addEventListener('popstate', () => { S = read(); render(true); });

  const wantSearch = new URLSearchParams(location.search).has('buscar');
  if (wantSearch) { history.replaceState(null, '', 'coleccion.html'); S = read(); }
  render(false);
  if (wantSearch) openD(true);
  K.watch(main);
})();
