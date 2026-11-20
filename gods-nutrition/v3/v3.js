/* God's Nutrition v3 — page rendering (home, collection, PDP). Commerce goes through core.js hooks only. */
(function () {
  const G = window.GNC; if (!G) return;
  const ES = G.LANG !== 'en';
  const t = (es, en) => (ES ? es : en);
  const A = p => G.base + p;
  const W = p => String(p || '').replace(/(assets\/img\/cut\/[^/]+)\.png$/, '$1.webp');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const page = document.body.dataset.page;
  const catOf = p => G.cats.find(c => c.id === p.cat) || { es: p.cat, en: p.cat };
  const catName = p => catOf(p)[ES ? 'es' : 'en'];
  const factsOf = p => (p.facts || []).map(f => ({ n: f[ES ? 'es' : 'en'], v: f.v }));
  const isMeta = n => /^(porciones|servings|cápsulas|capsules|calorías|calories)$/i.test(n);
  const STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z"/></svg>';
  const stars = (r, cls) => `<span class="stars ${cls || ''}" role="img" aria-label="${r} ${t('de 5 estrellas', 'out of 5 stars')}">${STAR.repeat(5)}<span class="stars__on" style="width:${Math.max(0, Math.min(100, r / 5 * 100))}%">${STAR.repeat(5)}</span></span>`;
  const IC = {
    cart: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M1.5 2.5h2.6l2.1 10h9.3l2-7H5.2"/><circle cx="7.6" cy="16.6" r="1.2"/><circle cx="14.6" cy="16.6" r="1.2"/></svg>',
    bell: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 14V9a5 5 0 0 1 10 0v5l1.5 1.5h-13zM8.5 17.5a1.6 1.6 0 0 0 3 0"/></svg>',
    truck: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 3.5h8.5v7H1zM9.5 6h3l2.5 2.5v2h-5.5"/><circle cx="4" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/></svg>',
    tag: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 8.6V2.5a1 1 0 0 1 1-1h6.1l6 6-7.1 7.1z"/><circle cx="5" cy="5" r="1"/></svg>',
    card: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1" y="3" width="14" height="10" rx="1.5"/><path d="M1 6.5h14M3.5 10h3"/></svg>',
    check: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5"/></svg>',
    label: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="1.5" width="10" height="13" rx="1.5"/><path d="M5.5 5h5M5.5 8h5M5.5 11h3"/></svg>',
    clock: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 1.5"/></svg>',
    lock: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="7" width="11" height="7.5" rx="1.5"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/></svg>',
    next: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h14M12 5l5 5-5 5"/></svg>',
    prev: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M17 10H3M8 5l-5 5 5 5"/></svg>',
    up: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 6.5l3-3 3 3"/></svg>',
    down: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5l3 3 3-3"/></svg>',
    verified: '<svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="5.2" fill="#000" stroke="none"/><path d="M3.6 6.1l1.6 1.5 3.2-3.2" stroke="#fff"/></svg>'
  };
  const outLbl = t('Agotado', 'Sold out');

  /* ---------- product card ---------- */
  function card(p, kind) {
    const out = p.stock === false;
    const badge = out ? outLbl : (p.badge ? p.badge[ES ? 0 : 1] : '');
    const fx = factsOf(p).filter(f => !isMeta(f.n)).slice(0, 3).map(f => `${f.v} ${f.n.toLowerCase()}`).join(' · ');
    const href = G.pdp(p);
    return `<article class="pc pc--${kind}">
      <div class="pc__media">
        <a class="pc__img" href="${href}" aria-label="${esc(G.nm(p))}">
          <img src="${A(W(p.img[0]))}" alt="${esc(G.nm(p))}" loading="lazy" width="320" height="320">
          <div class="pc__ov" aria-hidden="true"><p><b>${esc(G.L(p, 'tag'))}</b><br>${esc(fx)}</p><p>${esc(G.L(p, 'short'))}</p></div>
        </a>
        ${badge ? `<span class="pc__badge${out ? ' pc__badge--out' : ''}">${esc(badge)}</span>` : ''}
        <div class="pc__row"><span class="pc__price">${G.money(p.price)}</span>${out
          ? `<button type="button" class="pc__atc" data-notify="${p.slug}" aria-label="${t('Avísame cuando vuelva', 'Notify me')}: ${esc(G.nm(p))}">${IC.bell}</button>`
          : `<button type="button" class="pc__atc" data-add="${p.slug}" aria-label="${t('Agregar al carrito', 'Add to cart')}: ${esc(G.nm(p))}">${IC.cart}</button>`}</div>
      </div>
      <a class="pc__name" href="${href}">${esc(G.nm(p))}</a>
      <p class="pc__cat">${esc(catName(p))} · ${esc(G.L(p, 'size'))}</p>
      <div class="pc__rt">${stars(p.rating)}<span>(${p.rating}/5)</span></div>
    </article>`;
  }
  const ordered = () => G.P.slice().sort((a, b) => (b.stock !== false) - (a.stock !== false));

  /* ---------- carousels ---------- */
  function carousel(root) {
    const vp = $('[data-car-vp]', root), prev = $('[data-car-prev]', root), next = $('[data-car-next]', root), dots = $('[data-car-dots]', root);
    if (!vp) return;
    const step = () => {
      const kid = vp.querySelector('.car__track > *'); if (!kid) return vp.clientWidth;
      const gap = parseFloat(getComputedStyle(vp.firstElementChild).columnGap) || 0;
      const pitch = kid.getBoundingClientRect().width + gap;
      return Math.max(1, Math.floor((vp.clientWidth + gap) / pitch)) * pitch;
    };
    const pages = () => Math.max(1, Math.round((vp.scrollWidth - vp.clientWidth) / step()) + 1);
    const sync = () => {
      const max = vp.scrollWidth - vp.clientWidth - 2;
      if (prev) prev.disabled = vp.scrollLeft <= 2;
      if (next) next.disabled = vp.scrollLeft >= max;
      if (dots) {
        const n = pages(), cur = Math.min(n - 1, Math.round(vp.scrollLeft / step()));
        if (dots.children.length !== n) dots.innerHTML = Array.from({ length: n }, (_, i) => `<button type="button" aria-label="${t('Ir a la página', 'Go to page')} ${i + 1}"></button>`).join('');
        [...dots.children].forEach((b, i) => b.classList.toggle('is-on', i === cur));
        dots.hidden = n < 2;
      }
    };
    prev && prev.addEventListener('click', () => vp.scrollBy({ left: -step(), behavior: 'smooth' }));
    next && next.addEventListener('click', () => vp.scrollBy({ left: step(), behavior: 'smooth' }));
    dots && dots.addEventListener('click', e => { const b = e.target.closest('button'); if (b) vp.scrollTo({ left: [...dots.children].indexOf(b) * step(), behavior: 'smooth' }); });
    let raf; vp.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); }, { passive: true });
    addEventListener('resize', sync); sync();
  }

  /* ---------- header, menu, newsletter, cart modal ---------- */
  const hdr = $('[data-hdr]');
  const mbtn = $('[data-menu-btn]'), menu = $('[data-menu]');
  mbtn && mbtn.addEventListener('click', () => {
    const open = menu.hidden; menu.hidden = !open; hdr.classList.toggle('is-menu', open); mbtn.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('gn-lock', open);
  });
  $$('[data-nl]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault(); const email = f.email.value.trim();
    if (!/\S+@\S+\.\S+/.test(email)) { f.email.focus(); return; }
    document.dispatchEvent(new CustomEvent('gn:lead', { detail: { lead: { email }, source: 'newsletter' } }));
    $('.ftr__nl-ok', f).hidden = false; f.email.value = '';
  }));
  const drawer = $('[data-cart]');
  if (drawer) {
    const head = $('.gn-drawer__head', drawer);
    head.insertAdjacentHTML('afterbegin', `<p class="v3-added" role="status"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="10"/><path d="M5.8 10.2l2.8 2.7 5.6-5.6" fill="none" stroke="#fff" stroke-width="2"/></svg>${t('Agregado al carrito', 'Added to cart')}</p>`);
    const co = $('[data-checkout]', drawer);
    co && co.insertAdjacentHTML('beforebegin', `<button type="button" class="v3-keep" data-cart-close>${t('Seguir comprando', 'Keep shopping')}</button>`);
    document.addEventListener('gn:add', () => { drawer.dataset.added = '1'; });
    document.addEventListener('click', e => { if (e.target.closest('[data-cart-open]')) drawer.dataset.added = '0'; }, true);
  }
  // lightbox
  const lbx = document.createElement('div');
  lbx.className = 'lbx'; lbx.setAttribute('role', 'dialog'); lbx.setAttribute('aria-modal', 'true');
  lbx.innerHTML = `<img alt=""><button type="button" aria-label="${t('Cerrar', 'Close')}">×</button>`;
  document.body.appendChild(lbx);
  const openLbx = (src, alt) => { const i = $('img', lbx); i.src = src; i.alt = alt || ''; lbx.classList.add('is-open'); };
  lbx.addEventListener('click', () => lbx.classList.remove('is-open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lbx.classList.remove('is-open'); });

  // "show more" clips
  function clips(root) {
    $$('.clip', root).forEach(c => {
      const btn = c.nextElementSibling && c.nextElementSibling.classList.contains('more') ? c.nextElementSibling : null;
      requestAnimationFrame(() => {
        if (c.scrollHeight <= c.clientHeight + 30) { c.classList.add('is-open'); if (btn) btn.remove(); return; }
        if (btn) btn.querySelector('button').addEventListener('click', () => { c.classList.add('is-open'); btn.remove(); });
      });
    });
  }
  const more = () => `<div class="more"><button type="button">${t('Ver más', 'Show more')}</button></div>`;

  /* =================== HOME =================== */
  if (page === 'home') {
    const best = $('[data-best]');
    if (best) best.innerHTML = ordered().map(p => card(p, 'home')).join('');
    $$('[data-car]').forEach(carousel);
  }

  /* =================== COLLECTION =================== */
  if (page === 'plp') {
    const qs = new URLSearchParams(location.search);
    const GROUPS = {
      stack: { es: 'Stack básico', en: 'Starter stack', f: p => ['gods-whey-protein', 'gods-creatine-1kg', 'ares'].includes(p.slug) },
      ella: { es: 'Línea para ella', en: 'For her', f: p => p.slug === 'preventa-gods-demeter-450g' },
      vegana: { es: 'Sin lácteos', en: 'Dairy-free', f: p => /themis/.test(p.slug) }
    };
    const CHIPS = [{ id: '', es: 'Todos', en: 'All' }].concat(G.cats.map(c => ({ id: c.id, es: c.es, en: c.en })), Object.entries(GROUPS).map(([id, g]) => ({ id, es: g.es, en: g.en })));
    const form = p => p.slug === 'ares' ? 'caps' : p.slug === 'gods-omega-3' ? 'soft' : 'polvo';
    const hay = p => [G.nm(p), p.name, p.es.tag, p.en.tag, p.es.ingredients, p.en.ingredients, ...(p.facts || []).flatMap(f => [f.es, f.en]), catOf(p).es, catOf(p).en, ...(p.flavors || []).flatMap(f => [f.es, f.en])].join(' ').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
    const S = { c: qs.get('c') || '', q: qs.get('q') || '', ing: '', sort: 'rec', page: 1 };
    if (S.c && !CHIPS.some(c => c.id === S.c)) S.c = '';
    const chipsEl = $('[data-chips]'), grid = $('[data-grid]'), pag = $('[data-pag]');
    const fsb = $('[data-fsb]'), scrim = $('[data-fsb-scrim]');
    const checked = k => $$(`[data-f="${k}"]:checked`).map(i => i.value);
    if (G.cats.some(c => c.id === S.c)) { const cb = $(`[data-f="cat"][value="${S.c}"]`); if (cb) cb.checked = true; }
    chipsEl.innerHTML = CHIPS.map(c => `<a role="listitem" class="chip" href="coleccion.html${c.id ? '?c=' + c.id : ''}" data-chip="${c.id}">${esc(c[ES ? 'es' : 'en'])}</a>`).join('');
    const title = () => {
      if (S.q) return t(`Resultados para “${S.q}”`, `Results for “${S.q}”`);
      const g = GROUPS[S.c] || G.cats.find(c => c.id === S.c);
      return g ? g[ES ? 'es' : 'en'] : t('Todos los suplementos', 'All supplements');
    };
    function render() {
      const cats = checked('cat'), forms = checked('form'), feats = checked('feat');
      let list = G.P.filter(p => {
        if (GROUPS[S.c] && !GROUPS[S.c].f(p)) return false;
        if (cats.length && !cats.includes(p.cat)) return false;
        if (forms.length && !forms.includes(form(p))) return false;
        if (feats.includes('sabores') && !(p.flavors && p.flavors.length)) return false;
        if (feats.includes('sinlacteos') && /leche|suero/i.test(p.es.ingredients)) return false;
        if (feats.includes('stock') && p.stock === false) return false;
        const q = norm(S.q + ' ' + S.ing).split(/\s+/).filter(Boolean);
        if (q.length && !q.every(w => hay(p).includes(w))) return false;
        return true;
      });
      const by = { pa: (a, b) => a.price - b.price, pd: (a, b) => b.price - a.price, rt: (a, b) => b.rating - a.rating || b.count - a.count, rv: (a, b) => b.count - a.count }[S.sort];
      list = by ? list.slice().sort(by) : list.slice().sort((a, b) => (b.stock !== false) - (a.stock !== false));
      const PER = 9, n = list.length, pages = Math.max(1, Math.ceil(n / PER));
      S.page = Math.min(S.page, pages);
      const slice = list.slice((S.page - 1) * PER, S.page * PER);
      const cards = slice.map(p => card(p, 'plp'));
      if (S.page === 1 && n) cards.splice(Math.min(2, cards.length), 0, `<div class="promo">
          <img src="${A('assets/img/brand/iso-white.png')}" alt="" width="36" height="36" loading="lazy">
          <p class="promo__t">${t('¿No sabes cuál elegir?', 'Not sure which to pick?')}</p>
          <p class="promo__b">${t('Lo más simple: proteína para completar tu día y 5 g de creatina diaria. Ares, solo si entrenas con cafeína.', 'Keep it simple: protein to round out your day and 5 g of creatine daily. Ares only if you train with caffeine.')}</p>
          <a class="btn" href="coleccion.html?c=stack">${t('Ver el stack básico', 'See the starter stack')}</a></div>`);
      grid.innerHTML = cards.join('');
      $('[data-empty]').hidden = n > 0;
      const a = n ? (S.page - 1) * PER + 1 : 0, b = Math.min(n, S.page * PER);
      $('[data-rcount]').textContent = ES ? `${a}–${b} de ${n} resultados` : `${a}–${b} of ${n} results`;
      $('[data-plp-title]').textContent = title();
      document.title = `${title()} — God’s Nutrition`;
      const cur = $('[data-crumb-cur]'), sep = $('[data-crumb-cat]');
      const hasCur = !!(S.c || S.q); cur.hidden = sep.hidden = !hasCur; if (hasCur) cur.textContent = title();
      $$('.chip', chipsEl).forEach(c => c.classList.toggle('is-on', c.dataset.chip === S.c && !S.q));
      pag.hidden = pages < 2;
      pag.innerHTML = pages < 2 ? '' : `<button type="button" class="pag__ar" data-pg="${S.page - 1}" ${S.page === 1 ? 'disabled' : ''} aria-label="${t('Anterior', 'Previous')}">${IC.prev}</button>` +
        Array.from({ length: pages }, (_, i) => `<button type="button" data-pg="${i + 1}" class="${i + 1 === S.page ? 'is-on' : ''}">${i + 1}</button>`).join('') +
        `<button type="button" class="pag__ar" data-pg="${S.page + 1}" ${S.page === pages ? 'disabled' : ''} aria-label="${t('Siguiente', 'Next')}">${IC.next}</button>`;
    }
    const url = () => { const u = new URLSearchParams(); if (S.c) u.set('c', S.c); if (S.q) u.set('q', S.q); history.replaceState(null, '', 'coleccion.html' + (u.toString() ? '?' + u : '')); };
    chipsEl.addEventListener('click', e => {
      const c = e.target.closest('[data-chip]'); if (!c) return; e.preventDefault();
      S.c = c.dataset.chip; S.q = ''; S.page = 1;
      $$('[data-f="cat"]').forEach(i => { i.checked = i.value === S.c; });
      $$('.srch input').forEach(i => { i.value = ''; });
      url(); render();
    });
    $$('[data-f]').forEach(i => i.addEventListener('change', () => { S.page = 1; if (i.dataset.f === 'cat' && G.cats.some(c => c.id === S.c) && !i.checked && i.value === S.c) { S.c = ''; url(); } render(); }));
    const ing = $('[data-ing]'); ing.addEventListener('input', () => { S.ing = ing.value; S.page = 1; render(); });
    $('[data-ing-all]').addEventListener('click', () => { ing.value = ''; S.ing = ''; render(); ing.focus(); });
    $('[data-sort]').addEventListener('change', e => { S.sort = e.target.value; render(); });
    $$('[data-clear]').forEach(b => b.addEventListener('click', () => {
      Object.assign(S, { c: '', q: '', ing: '', page: 1 }); ing.value = '';
      $$('[data-f]').forEach(i => { i.checked = false; }); $$('.srch input').forEach(i => { i.value = ''; }); url(); render();
    }));
    pag.addEventListener('click', e => { const b = e.target.closest('[data-pg]'); if (!b || b.disabled) return; S.page = +b.dataset.pg; render(); scrollTo({ top: $('.rbar').offsetTop - 120, behavior: 'smooth' }); });
    const openF = o => { fsb.classList.toggle('is-open', o); scrim.hidden = !o; document.documentElement.classList.toggle('gn-lock', o); };
    $('[data-filter-open]').addEventListener('click', () => openF(true));
    $$('[data-filter-close]').forEach(b => b.addEventListener('click', () => openF(false)));
    scrim.addEventListener('click', () => openF(false));
    $$('.srch input').forEach(i => { i.value = S.q; });
    render();
  }

  /* =================== PDP =================== */
  if (page === 'pdp') {
    const slug = new URLSearchParams(location.search).get('p');
    const p = G.bySlug[slug] || G.P[0];
    const out = p.stock === false;
    const fl = p.flavors || [];
    let vid = (fl.find(f => f.stock) || fl[0] || {}).vid || '';
    let qty = 1;
    const facts = factsOf(p);
    const LABEL = { 'gods-whey-protein': 'informacion_nutrimental', 'gods-creatine-1kg': 'Creatine1kg', creatina: 'Creatine500_2', ares: 'Ares3', 'gods-omega-3': 'Omega3', 'preventa-gods-demeter-450g': 'DEMETER', 'gods-ceres-450g-p': 'gods-CERES-1', 'gods-full-protein-5-lbs': 'Full2', 'themis-vegan-protein-1-kg': 'Themis' };
    const label = (p.photos || []).find(s => LABEL[p.slug] && s.includes('/' + LABEL[p.slug] + '.')) || (p.photos || []).slice(-1)[0];
    const SIZES = { 'gods-creatine-1kg': ['gods-creatine-1kg', 'creatina'], creatina: ['gods-creatine-1kg', 'creatina'] };
    const legend = t('Este producto no es un medicamento y es responsabilidad de quien lo recomienda y de quien lo usa.', 'This product is not a medicine; responsibility lies with whoever recommends it and whoever uses it.');
    document.title = `${G.nm(p)} — God’s Nutrition`;
    const md = $('meta[name=description]'); if (md) md.content = `${G.nm(p)}: ${G.L(p, 'short')}`;

    // title band
    const cl = $('[data-crumb-cat]'); cl.textContent = catName(p); cl.href = `coleccion.html?c=${p.cat}`;
    $('[data-name]').textContent = G.nm(p);
    $('[data-stars]').outerHTML = stars(p.rating, 'stars--18');
    $('[data-rcount]').textContent = `${p.count} ${t('reseñas', 'reviews')}`;

    // gallery
    const gal = $('[data-gal]');
    const pics = () => {
      const f = fl.find(x => String(x.vid) === String(vid));
      const cuts = [...new Set([f && f.img, ...p.img].filter(Boolean))].map(s => ({ s: W(s), cut: true }));
      return cuts.concat((p.photos || []).map(s => ({ s, cut: false })));
    };
    let gi = 0;
    function drawGal() {
      const ps = pics(); gi = Math.min(gi, ps.length - 1);
      gal.innerHTML = `<div class="gal__th" role="tablist" aria-label="${t('Imágenes', 'Images')}">${ps.map((x, i) => `<button type="button" role="tab" aria-selected="${i === gi}" class="${i === gi ? 'is-on' : ''}" data-gi="${i}" aria-label="${t('Imagen', 'Image')} ${i + 1}"><img src="${A(x.s)}" alt="" loading="lazy"></button>`).join('')}</div>
        <div class="gal__main"><div class="gal__fr"><img class="${ps[gi].cut ? 'is-cut' : ''}" src="${A(ps[gi].s)}" alt="${esc(G.nm(p))}" ${gi ? '' : 'fetchpriority="high"'}>
        <button type="button" class="gal__pv" data-gstep="-1" aria-label="${t('Imagen anterior', 'Previous image')}">${IC.prev}</button></div></div>
        <button type="button" class="gal__nx" data-gstep="1" aria-label="${t('Siguiente imagen', 'Next image')}">${IC.next}</button>`;
    }
    gal.addEventListener('click', e => {
      const th = e.target.closest('[data-gi]'), st = e.target.closest('[data-gstep]');
      const n = pics().length;
      if (th) { gi = +th.dataset.gi; drawGal(); }
      else if (st) { gi = (gi + +st.dataset.gstep + n) % n; drawGal(); }
      else if (e.target.closest('.gal__fr img') && !pics()[gi].cut) openLbx(A(pics()[gi].s), G.nm(p));
    });
    drawGal();

    // buy box
    const buy = $('[data-bbox]');
    const tier = (G.cfg.tiers || [])[0], tier2 = (G.cfg.tiers || [])[1];
    function drawBuy() {
      const f = fl.find(x => String(x.vid) === String(vid));
      const fOut = f && f.stock === false;
      const unit = G.L(p, 'size').split('·').pop().trim();
      const sizes = SIZES[p.slug];
      buy.innerHTML = `
        <h2 class="bb__tag">${esc(G.L(p, 'tag'))}. ${esc((G.L(p, 'bullets') || [])[0] || '')}.</h2>
        <p class="bb__d">${esc(G.L(p, 'short'))}</p>
        <div class="bb__p"><b>${G.money(p.price)}</b><span>/${esc(unit)}</span></div>
        ${tier ? `<p class="bb__ps">${t('o', 'or')} <b>${esc(tier[ES ? 'es' : 'en'])}</b> ${t('al sumar', 'when your cart reaches')} ${G.money(tier.at)} ${t('en tu carrito', '')}</p>` : ''}
        ${sizes ? `<p class="bb__lbl">${t('Tamaño', 'Size')}</p><div class="vc">${sizes.map(s => { const q = G.bySlug[s]; return `<a class="vcard${q.slug === p.slug ? ' is-on' : ''}" href="${G.pdp(q)}" ${q.slug === p.slug ? 'aria-current="true"' : ''}><span><b>${esc(G.nm(q))}</b><small>${esc(G.L(q, 'size'))} · ${G.money(q.price)}</small></span></a>`; }).join('')}</div>` : ''}
        ${fl.length ? `<p class="bb__lbl">${t('Sabor', 'Flavor')}: <b>${esc(f ? f[ES ? 'es' : 'en'] : '')}</b></p>
          <div class="vc vc--2" role="radiogroup" aria-label="${t('Sabor', 'Flavor')}">${fl.map(x => `<button type="button" role="radio" aria-checked="${String(x.vid) === String(vid)}" class="vcard${String(x.vid) === String(vid) ? ' is-on' : ''}${x.stock === false ? ' is-out' : ''}" data-vid="${x.vid}"><img src="${A(W(x.img || p.img[0]))}" alt="" loading="lazy"><span><b>${esc(x[ES ? 'es' : 'en'])}</b><small>${x.stock === false ? outLbl : t('Disponible', 'In stock')}</small></span></button>`).join('')}</div>` : ''}
        <div class="og">
          <p class="og__h"><i aria-hidden="true"></i>${t('Ahorra en tu carrito', 'Save in your cart')}</p>
          <ul>
            <li>${IC.truck}${t('Envío gratis desde', 'Free shipping from')} ${G.money(G.cfg.freeShipping || 400)}</li>
            ${tier ? `<li>${IC.tag}${esc(tier[ES ? 'es' : 'en'])} ${t('desde', 'from')} ${G.money(tier.at)}</li>` : ''}
            ${tier2 ? `<li>${IC.tag}${esc(tier2[ES ? 'es' : 'en'])} ${t('desde', 'from')} ${G.money(tier2.at)}</li>` : ''}
          </ul>
          ${tier2 ? `<p class="og__t"><b>${t('AHORRA 20%', 'SAVE 20%')}</b> ${t('cuando tu carrito llega a', 'when your cart reaches')} ${G.money(tier2.at)}${t('; se aplica en el carrito.', '; applied in the cart.')}</p>` : ''}
        </div>
        ${out ? `<div class="atc"><button type="button" class="atc__b atc__b--out" data-notify="${p.slug}">${t('Agotado · Avísame cuando vuelva', 'Sold out · Notify me')}</button></div>`
          : `<div class="atc" data-atc>
          <div class="qty"><input type="number" min="1" max="20" value="${qty}" aria-label="${t('Cantidad', 'Quantity')}" data-qty><div class="qty__st"><button type="button" data-qstep="1" aria-label="${t('Agregar uno', 'Add one')}">${IC.up}</button><button type="button" data-qstep="-1" aria-label="${t('Quitar uno', 'Remove one')}">${IC.down}</button></div></div>
          ${fOut ? `<button type="button" class="atc__b atc__b--out" data-notify="${p.slug}">${t('Sabor agotado · Avísame', 'Flavor sold out · Notify me')}</button>`
          : `<button type="button" class="atc__b" data-add="${p.slug}" data-vid="${vid}" data-qty="${qty}">${t('Agregar al carrito', 'Add to cart')}</button>`}
        </div>`}
        <p class="bb__note">${IC.card}<span><b>${t('3, 6 y 9 MSI', '3, 6, 9 interest-free months')}</b> ${t('con Mercado Pago · OXXO', 'with Mercado Pago · OXXO')}</span></p>`;
      drawBar(fOut);
    }
    const bar = $('[data-matc]');
    function drawBar(fOut) {
      if (!bar) return;
      bar.innerHTML = out ? `<button type="button" class="atc__b atc__b--out" data-notify="${p.slug}">${t('Agotado · Avísame', 'Sold out · Notify me')}</button>` :
        `<div class="qty"><input type="number" min="1" max="20" value="${qty}" aria-label="${t('Cantidad', 'Quantity')}" data-qty><div class="qty__st"><button type="button" data-qstep="1" aria-label="${t('Agregar uno', 'Add one')}">${IC.up}</button><button type="button" data-qstep="-1" aria-label="${t('Quitar uno', 'Remove one')}">${IC.down}</button></div></div>` +
        (fOut ? `<button type="button" class="atc__b atc__b--out" data-notify="${p.slug}">${t('Avísame', 'Notify me')}</button>` : `<button type="button" class="atc__b" data-add="${p.slug}" data-vid="${vid}" data-qty="${qty}">${t('Agregar al carrito', 'Add to cart')}</button>`);
      bar.classList.add('is-on');
    }
    const setQty = n => { qty = Math.max(1, Math.min(20, n || 1)); $$('[data-qty]').forEach(i => { i.value = qty; }); $$('.atc__b[data-add]').forEach(b => { b.dataset.qty = qty; }); };
    document.addEventListener('click', e => {
      const v = e.target.closest('.vcard[data-vid]');
      if (v) { vid = v.dataset.vid; gi = 0; drawBuy(); drawGal(); return; }
      const q = e.target.closest('[data-qstep]'); if (q) setQty(qty + +q.dataset.qstep);
    });
    document.addEventListener('change', e => { if (e.target.matches('[data-qty]')) setQty(+e.target.value); });
    drawBuy();

    // right-column extras
    const others = G.P.filter(x => x.cat === p.cat && x.slug !== p.slug);
    $('[data-buyx]').innerHTML = `
      <div class="bx"><h3>${t('En la etiqueta', 'On the label')}</h3><div class="vchips">${facts.filter(f => !isMeta(f.n)).slice(0, 5).map(f => `<span class="vchip">${IC.check}${esc(f.v)} ${esc(f.n.toLowerCase())}</span>`).join('')}<span class="vchip">${IC.label}${t('Ciencia · Pureza · Calidad', 'Science · Purity · Quality')}</span></div></div>
      <div class="bx"><h3>${t('Modo de uso', 'How to use')}</h3><p>${esc(G.L(p, 'how'))}</p></div>
      <div class="bx"><h3>${t('Relacionado', 'Related')}</h3><p class="bx__mic">${t('Categoría', 'Category')}</p><div class="vchips"><a class="vchip" href="coleccion.html?c=${p.cat}">${esc(catName(p))}</a>${others.map(x => `<a class="vchip" href="${G.pdp(x)}">${esc(G.nm(x))}</a>`).join('')}</div></div>
      <div class="bx"><h3>${t('Envío y pago', 'Shipping and payment')}</h3><ul>
        <li>${IC.truck}<span>${t('Envío gratis desde', 'Free shipping from')} ${G.money(G.cfg.freeShipping || 400)} ${t('a todo México', 'across Mexico')}</span></li>
        <li>${IC.clock}<span>${t('2–3 días hábiles, según nuestros clientes', '2–3 business days, as our customers report')}</span></li>
        <li>${IC.card}<span>${t('Mercado Pago, OXXO, MSI o hasta 12 pagos', 'Mercado Pago, OXXO, interest-free months or up to 12 payments')}</span></li>
        <li>${IC.lock}<span>${t('Terminas tu compra en godsnutrition.com.mx', 'You check out on godsnutrition.com.mx')}</span></li></ul></div>`;

    // summary & comparison
    const sum = $('[data-sum]');
    const cmpSet = (others.length ? [p, ...others] : [p, ...G.P.filter(x => x.slug !== p.slug && x.stock !== false).slice(0, 3)]);
    const key = x => { const f = factsOf(x).find(y => !isMeta(y.n)); return f ? `${f.v} ${f.n.toLowerCase()}` : ''; };
    sum.innerHTML = `
      <div class="sum__hd"><img src="${A('assets/img/brand/iso-dark.png')}" alt="" loading="lazy"><div><h2>${t('Resumen y comparación', 'Summary &amp; comparison')}</h2><p>${t('Lo esencial de un vistazo, directo de la etiqueta.', 'The essentials at a glance, straight from the label.')}</p></div></div>
      <div class="stabs" role="tablist"><button type="button" role="tab" class="is-on" data-st="0" aria-selected="true">${t('Resumen del producto', 'Product overview')}</button><button type="button" role="tab" data-st="1" aria-selected="false">${t('Comparar productos', 'Compare products')}</button></div>
      <div data-sp="0"><div class="sum__b"><div>
        <p><b>${t('Qué es:', 'What it is:')}</b> ${esc(G.L(p, 'tag'))}. ${esc(G.L(p, 'short'))}</p>
        <p><b>${t('Cómo tomarlo:', 'How to take:')}</b> ${esc(G.L(p, 'how'))}</p>
        <p><b>${t('Por porción:', 'Per serving:')}</b></p><ul>${(G.L(p, 'bullets') || []).map(b => `<li>${esc(b)}</li>`).join('')}</ul>
      </div><div class="aipills">
        <a href="#ingredientes">${t('Ver tabla nutrimental', 'See supplement facts')}</a>
        <a href="#detalles">${t('¿Qué sabores hay?', 'Which flavors?')}</a>
        <a href="#advertencias">${t('Ver advertencias', 'See warnings')}</a>
        <a href="#resenas">${t('Leer reseñas', 'Read reviews')}</a>
      </div></div>
      <div class="sum__f"><a class="ask" href="mailto:hola@godsnutrition.com.mx?subject=${encodeURIComponent(G.nm(p))}">${t('Pregúntanos por correo', 'Ask us by email')}</a></div></div>
      <div data-sp="1" hidden><table class="cmp"><thead><tr><th>${t('Producto', 'Product')}</th><th>${t('Por porción', 'Per serving')}</th><th>${t('Presentación', 'Size')}</th><th>${t('Precio', 'Price')}</th></tr></thead><tbody>
        ${cmpSet.map(x => `<tr class="${x.slug === p.slug ? 'is-me' : ''}"><td>${x.slug === p.slug ? esc(G.nm(x)) : `<a href="${G.pdp(x)}">${esc(G.nm(x))}</a>`}${x.stock === false ? ` · ${outLbl}` : ''}</td><td>${esc(key(x))}</td><td>${esc(G.L(x, 'size'))}</td><td>${G.money(x.price)}</td></tr>`).join('')}
      </tbody></table></div>`;
    sum.addEventListener('click', e => {
      const b = e.target.closest('[data-st]'); if (!b) return;
      $$('[data-st]', sum).forEach(x => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on); });
      $$('[data-sp]', sum).forEach(x => { x.hidden = x.dataset.sp !== b.dataset.st; });
    });

    // ingredients
    const keyIng = facts.filter(f => !isMeta(f.n));
    $('[data-ingr]').innerHTML = `<h2>${t('Información de ingredientes', 'Ingredient information')}</h2>
      <div class="clip" style="--clip:560px"><div class="ing">
        <div class="ing__ic"><svg viewBox="0 0 70 70" aria-hidden="true"><path d="M20 8h30M24 8v6c0 3-6 6-6 14v30a4 4 0 0 0 4 4h26a4 4 0 0 0 4-4V28c0-8-6-11-6-14V8"/><path d="M18 34h34M18 52h34M27 43h16"/></svg></div>
        <div>
          <h3>${t('Ingredientes clave', 'Key ingredients')}</h3>
          <div class="ing__chips">${keyIng.map(f => `<span>${esc(f.n)}</span>`).join('')}</div>
          <h3>${t('Cantidades por porción', 'Amounts per serving')}</h3>
          <p class="ing__sv">${t('Presentación', 'Size')}: ${esc(G.L(p, 'size'))}</p>
          <p class="ing__sv">${t('Porciones por envase', 'Servings per container')}: ${p.servings}</p>
          <table class="ftab"><thead><tr><th>${t('Nombre', 'Name')}</th><th>${t('Cantidad', 'Amount')}</th></tr></thead><tbody>${facts.map(f => `<tr><td>${esc(f.n)}</td><td>${esc(f.v)}</td></tr>`).join('')}</tbody></table>
          <p class="ing__full"><b>${t('Ingredientes', 'Ingredients')}:</b> ${esc(G.L(p, 'ingredients'))}</p>
          ${label ? `<div class="ing__lbl"><p>${t('Información nutrimental de la etiqueta (toca para ampliar)', 'Supplement facts from the label (tap to enlarge)')}</p><img src="${A(label)}" alt="${t('Información nutrimental de', 'Supplement facts for')} ${esc(G.nm(p))}" loading="lazy" data-zoom></div>` : ''}
        </div></div></div>${more()}`;
    $('[data-ingr]').addEventListener('click', e => { const z = e.target.closest('[data-zoom]'); if (z) openLbx(z.src, z.alt); });

    // details
    $('[data-det]').innerHTML = `<h2>${esc(G.nm(p))}: ${t('detalles', 'details')}</h2>
      <div class="clip" style="--clip:300px"><div class="det">
        <p>${esc(G.L(p, 'tag'))}. ${esc(G.L(p, 'short'))}</p>
        <ul>${(G.L(p, 'bullets') || []).map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        <h4>${t('Presentación', 'Size')}</h4><p>${esc(G.L(p, 'size'))}</p>
        ${fl.length ? `<h4>${t('Sabores', 'Flavors')}</h4><p>${fl.map(x => esc(x[ES ? 'es' : 'en']) + (x.stock === false ? ` (${outLbl.toLowerCase()})` : '')).join(', ')}</p>` : ''}
        <h4>${t('Modo de uso', 'How to use')}</h4><p>${esc(G.L(p, 'how'))}</p>
        <h4>${t('Ingredientes', 'Ingredients')}</h4><p>${esc(G.L(p, 'ingredients'))}</p>
      </div></div>${more()}`;

    // warnings
    const warn = G.L(p, 'warn');
    $('[data-warn]').innerHTML = `<h2>${t('Advertencias', 'Warnings')}</h2><div class="det">
      ${warn ? `<h4>${t('Contiene cafeína', 'Contains caffeine')}</h4><p class="warn">${esc(warn)}</p>` : ''}
      <h4>${t('Leyenda', 'Legend')}</h4><p>${legend}</p>
      <h4>${t('Imágenes', 'Images')}</h4><p>${t('Imágenes con fines exclusivos para venta.', 'Images for sales purposes only.')}</p></div>`;

    // FAQ (built only from product data + store facts)
    const flist = fl.map(x => x[ES ? 'es' : 'en']).join(', ');
    const faqs = [
      [t(`¿Cuánto rinde ${G.nm(p)}?`, `How many servings in ${G.nm(p)}?`), t(`${p.servings} porciones (${G.L(p, 'size')}).`, `${p.servings} servings (${G.L(p, 'size')}).`)],
      [t('¿Cómo se toma?', 'How do I take it?'), G.L(p, 'how')],
      [t('¿Qué lleva cada porción?', 'What’s in each serving?'), facts.filter(f => !isMeta(f.n)).map(f => `${f.v} ${f.n.toLowerCase()}`).join(', ') + '.'],
      fl.length ? [t('¿Qué sabores hay?', 'Which flavors are there?'), flist + '.'] : [t('¿Qué ingredientes tiene?', 'What are the ingredients?'), G.L(p, 'ingredients')],
      [t('¿Cuánto tarda el envío?', 'How long does shipping take?'), t('Según nuestros clientes, 2–3 días hábiles a todo México.', 'According to our customers, 2–3 business days across Mexico.')],
      [t('¿Cuánto cuesta el envío?', 'How much is shipping?'), t(`Gratis desde ${G.money(G.cfg.freeShipping || 400)}. Tu carrito te dice cuánto te falta.`, `Free from ${G.money(G.cfg.freeShipping || 400)}. Your cart shows how much is left.`)],
      [t('¿Cómo puedo pagar?', 'How can I pay?'), t('Con Mercado Pago: tarjeta, OXXO, 3, 6 y 9 meses sin intereses o hasta 12 pagos con Mercado Crédito.', 'With Mercado Pago: card, OXXO, 3, 6 and 9 interest-free months or up to 12 payments with Mercado Crédito.')],
      [t('¿Hay descuento si llevo más?', 'Is there a discount if I buy more?'), t('Sí: 15% al llegar a $2,399 y 20% al llegar a $2,999 en tu carrito.', 'Yes: 15% off at $2,399 MXN and 20% off at $2,999 MXN in your cart.')]
    ];
    $('[data-faq]').innerHTML = `<h2>${t('Preguntas frecuentes', 'Frequent questions')}</h2><div class="pfaq">${faqs.map(([q, a]) => `<details class="qa"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;

    // reviews
    const RV = (p.reviews || []).slice();
    const rv = $('[data-rev]');
    const hist = [5, 4, 3, 2, 1].map(s => [s, RV.filter(r => Math.round(r.r) === s).length]);
    const R = { sort: 'new', star: 0, page: 1 };
    rv.innerHTML = `<h2 class="rv__h">${t('Reseñas', 'Reviews')}</h2><p class="rv__sub">${t('Compras verificadas en godsnutrition.com.mx', 'Verified purchases on godsnutrition.com.mx')}</p>
      <div class="rv__top"><div class="rv__sc"><b>${p.rating.toFixed(p.rating % 1 ? 2 : 1)}</b><div>${stars(p.rating, 'stars--18')}<small>${t('Basado en', 'Based on')} ${p.count} ${t('reseñas', 'reviews')}</small></div></div>
      <div class="hist" aria-label="${t('Distribución de calificaciones publicadas', 'Distribution of published ratings')}">${hist.map(([s, n]) => `<div><span>${s}${STAR}</span><i><u style="width:${RV.length ? n / RV.length * 100 : 0}%"></u></i><span>${n}</span></div>`).join('')}</div></div>
      <div class="rv__ctl"><select data-rstar aria-label="${t('Filtrar por calificación', 'Filter by rating')}"><option value="0">${t('Todas las calificaciones', 'All ratings')}</option>${[5, 4, 3].map(s => `<option value="${s}">${s} ★</option>`).join('')}</select>
      <select data-rsort aria-label="${t('Ordenar reseñas', 'Sort reviews')}"><option value="new">${t('Más recientes', 'Most recent')}</option><option value="top">${t('Mejor calificadas', 'Highest rated')}</option><option value="ver">${t('Compras verificadas primero', 'Verified first')}</option></select></div>
      <div data-rlist></div><div class="rv__pag" data-rpag></div>`;
    const fmt = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString(ES ? 'es-MX' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return d; } };
    function drawRev() {
      let l = RV.filter(r => !R.star || Math.round(r.r) === R.star);
      l.sort(R.sort === 'top' ? (a, b) => b.r - a.r || (b.d > a.d ? 1 : -1) : R.sort === 'ver' ? (a, b) => (b.v - a.v) || (b.d > a.d ? 1 : -1) : (a, b) => (b.d > a.d ? 1 : -1));
      const PER = 5, pages = Math.max(1, Math.ceil(l.length / PER)); R.page = Math.min(R.page, pages);
      $('[data-rlist]', rv).innerHTML = l.length ? l.slice((R.page - 1) * PER, R.page * PER).map(r => `<article class="rvi">
        <div><p class="rvi__n">${esc(r.n)}</p>${r.v ? `<p class="ver">${IC.verified}${t('Compra verificada', 'Verified purchase')}</p>` : ''}</div>
        <div><div class="rvi__top">${stars(r.r, 'stars--16')}<span class="rvi__d">${fmt(r.d)}</span></div>
        <p class="rvi__t">${esc(!ES && r.en ? r.en : r.t)}</p>${!ES && !r.en ? `<p class="rvi__tr">(${'Original review in Spanish'})</p>` : ''}
        ${r.ph && !r.phx ? `<img class="rvi__ph" src="${A(r.ph)}" alt="${t('Foto de', 'Photo by')} ${esc(r.n)}" loading="lazy">` : ''}</div></article>`).join('')
        : `<p class="rv__empty">${t('No hay reseñas con ese filtro.', 'No reviews match that filter.')}</p>`;
      $('[data-rpag]', rv).innerHTML = pages < 2 ? '' : Array.from({ length: pages }, (_, i) => `<button type="button" data-rp="${i + 1}" class="${i + 1 === R.page ? 'is-on' : ''}" aria-label="${t('Página', 'Page')} ${i + 1}">${i + 1}</button>`).join('');
    }
    rv.addEventListener('change', e => { if (e.target.matches('[data-rstar]')) R.star = +e.target.value; if (e.target.matches('[data-rsort]')) R.sort = e.target.value; R.page = 1; drawRev(); });
    rv.addEventListener('click', e => { const b = e.target.closest('[data-rp]'); if (b) { R.page = +b.dataset.rp; drawRev(); rv.scrollIntoView({ behavior: 'smooth' }); } });
    drawRev();

    // recommendations
    const rec = G.P.filter(x => x.slug !== p.slug && x.stock !== false).sort((a, b) => (b.cat !== p.cat) - (a.cat !== p.cat)).slice(0, 4);
    $('[data-reco]').innerHTML = `<div class="reco__in"><h2 id="rch">${t('Recomendado para ti', 'Recommended for you')}</h2><div class="reco__g">${rec.map(x => card(x, 'home')).join('')}</div></div>`;

    clips(document);

    // sticky tabs: scroll-spy + stuck state
    const tabs = $('[data-ptabs]');
    const links = $$('.ptabs__in a[href^="#"]:not([data-totop])', tabs);
    const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
    const hdrH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr')) || 113;
    let ticking = false;
    const spy = () => {
      ticking = false;
      tabs.classList.toggle('is-stuck', tabs.getBoundingClientRect().top <= hdrH() + 1 && scrollY > 100);
      const y = hdrH() + 45 + 40; let cur = -1;
      secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= y) cur = i; });
      links.forEach((a, i) => a.classList.toggle('is-on', i === cur));
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
    $('[data-totop]').addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); });
    spy();
  }
})();
