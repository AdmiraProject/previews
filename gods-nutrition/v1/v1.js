/* God's Nutrition v1 — page rendering + interactions (data from window.GNC, commerce via core.js hooks). */
(function () {
  const G = window.GNC; if (!G) return;
  const ES = G.LANG === 'es';
  const t = (es, en) => (ES ? es : en);
  const B = G.base;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ARR = '<svg class="arr" width="19" height="14" viewBox="0 0 19 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M0 7h17M11 1l6 6-6 6"/></svg>';
  const CHEV = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  const STAR = s => `<svg width="${s}" height="${s}" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.6l2.5 5.3 5.8.7-4.3 4 1.1 5.8L10 14.6l-5.1 2.8 1.1-5.8-4.3-4 5.8-.7z"/></svg>`;
  const stars = (r, s) => { s = s || 16; const row = STAR(s).repeat(5); return `<span class="st" role="img" aria-label="${r} ${t('de 5 estrellas', 'out of 5 stars')}"><span class="st__off">${row}</span><span class="st__on" style="width:${Math.max(0, Math.min(5, r)) / 5 * 100}%">${row}</span></span>`; };
  const src = p => B + p;
  const cat = id => G.cats.find(c => c.id === id) || { es: id, en: id };
  const catName = id => cat(id)[G.LANG];
  const fname = f => (f && (f[G.LANG] || f.name)) || '';
  const inStock = p => p.stock !== false;
  const firstVid = p => { const f = (p.flavors || []).find(x => x.stock) || (p.flavors || [])[0]; return f ? f.vid : ''; };
  const flv = (p, vid) => (p.flavors || []).find(f => String(f.vid) === String(vid)) || null;
  const pdp = p => G.pdp(p);
  const pad2 = n => String(n).padStart(2, '0');
  const perServing = p => p.servings ? G.money(Math.round(p.price / p.servings)) : '';
  const nrev = n => `${n} ${n === 1 ? t('reseña', 'review') : t('reseñas', 'reviews')}`;
  const ph = (fb, photo, cls) => `<div class="ph ${cls || ''}">${fb ? `<img class="ph__fb" src="${src(fb)}" alt="" loading="lazy">` : ''}${photo ? `<img class="ph__img" src="${src(photo.includes('/') ? photo : 'assets/photo/' + photo)}" alt="" loading="lazy" onerror="this.remove()">` : ''}</div>`;
  const byImportance = list => list.slice().sort((a, b) => (inStock(b) - inStock(a)));

  /* filter metadata (facts from BRIEF §12) */
  const META = {
    'gods-whey-protein': { o: ['proteina'], f: 'polvo' }, 'gods-full-protein-5-lbs': { o: ['proteina'], f: 'polvo' },
    'themis-vegan-protein-1-kg': { o: ['proteina', 'sinlacteos'], f: 'polvo' }, 'gods-creatine-1kg': { o: ['creatina'], f: 'polvo' },
    'creatina': { o: ['creatina'], f: 'polvo' }, 'ares': { o: ['preentreno'], f: 'capsulas' }, 'gods-omega-3': { o: ['bienestar'], f: 'capsulas' },
    'preventa-gods-demeter-450g': { o: ['bienestar'], f: 'polvo' }, 'gods-ceres-450g-p': { o: ['bienestar', 'fibra'], f: 'polvo' }
  };
  const OBJ = { proteina: t('Completar tu proteína', 'Hit your protein'), creatina: t('Creatina diaria', 'Daily creatine'), preentreno: t('Antes de entrenar', 'Before training'), bienestar: t('Bienestar diario', 'Daily wellness'), sinlacteos: t('Sin lácteos', 'Dairy-free'), fibra: t('Fibra', 'Fiber') };
  const FMT = { polvo: t('Polvo', 'Powder'), capsulas: t('Cápsulas', 'Capsules') };
  const LABEL = { 'gods-whey-protein': 'informacion_nutrimental', 'ares': 'Ares3', 'gods-creatine-1kg': 'Creatine1kg', 'gods-omega-3': 'Omega3', 'preventa-gods-demeter-450g': 'DEMETER', 'gods-ceres-450g-p': 'gods-CERES-1' };
  const realPhotos = p => (p.photos || []).filter(x => !/gemini|chatgpt/i.test(x));
  const labelOf = p => LABEL[p.slug] && (p.photos || []).find(x => x.includes(LABEL[p.slug]));

  /* ---------------- product card ---------------- */
  function card(p) {
    const out = !inStock(p);
    const fl = p.flavors || [];
    const live = fl.filter(f => f.stock);
    let imgs = [p.img[0]].concat(fl.filter(f => f.img).map(f => f.img)).filter(Boolean); // clean packshot first, flavors on hover/arrows
    imgs = [...new Set(imgs)].slice(0, 7);
    const badge = out ? `<span class="pc__badge pc__badge--out">${t('Agotado', 'Sold out')}</span>` : p.badge ? `<span class="pc__badge${p.badge[1] === 'New' ? ' pc__badge--new' : ''}">${esc(p.badge[ES ? 0 : 1])}</span>` : '';
    let cta;
    if (out) cta = `<button type="button" class="tl pc__cta" data-notify="${p.slug}">${t('Avísame', 'Notify me')} ${ARR}</button>`;
    else if (live.length > 1) cta = `<button type="button" class="tl pc__cta" data-qs aria-expanded="false">${t('Elegir sabor', 'Choose flavor')} ${ARR}</button>`;
    else cta = `<button type="button" class="tl pc__cta" data-add="${p.slug}"${live[0] ? ` data-vid="${live[0].vid}"` : ''}>${t('Agregar', 'Add to cart')} ${ARR}</button>`;
    const qs = (!out && live.length > 1) ? `<div class="qs" role="dialog" aria-label="${t('Elige sabor', 'Choose flavor')}"><div class="qs__hd"><span>${t('Elige tu sabor', 'Pick your flavor')}</span><button type="button" data-qs-close aria-label="${t('Cerrar', 'Close')}">×</button></div><div class="qs__list">${fl.map(f => f.stock
      ? `<button type="button" class="qs__f" data-add="${p.slug}" data-vid="${f.vid}">${f.img ? `<img src="${src(f.img)}" alt="" loading="lazy">` : '<span></span>'}<span>${esc(fname(f))}</span><em>+</em></button>`
      : `<button type="button" class="qs__f" data-notify="${p.slug}">${f.img ? `<img src="${src(f.img)}" alt="" loading="lazy">` : '<span></span>'}<span>${esc(fname(f))}</span><em>${t('Agotado', 'Sold out')}</em></button>`).join('')}</div></div>` : '';
    return `<article class="pc${out ? ' pc--out' : ''}" data-slug="${p.slug}">
      <a class="pc__link" href="${pdp(p)}" aria-label="${esc(G.nm(p))}"></a>${badge}
      <div class="pc__media"><div class="pc__slides">${imgs.map((im, i) => `<img src="${src(im)}" alt="${i ? '' : esc(G.nm(p))}" loading="lazy"${i ? '' : ' class="is-on"'}>`).join('')}</div>
        ${imgs.length > 1 ? `<button type="button" class="pc__arr pc__arr--p" data-sl="-1" aria-label="${t('Anterior', 'Previous')}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M15 4l-8 8 8 8"/></svg></button><button type="button" class="pc__arr pc__arr--n" data-sl="1" aria-label="${t('Siguiente', 'Next')}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M9 4l8 8-8 8"/></svg></button>` : ''}
      </div>
      <div class="pc__rate">${stars(p.rating, 16)}<span>${nrev(p.count)}</span></div>
      <h3 class="pc__t">${esc(G.nm(p))}</h3>
      <p class="pc__size">${esc(G.L(p, 'size'))}</p>
      <div class="pc__foot"><span class="pc__price">${G.money(p.price)}${p.compare ? `<s>${G.money(p.compare)}</s>` : ''}</span>${cta}</div>
      ${qs}
    </article>`;
  }
  document.addEventListener('click', e => {
    const sl = e.target.closest('[data-sl]');
    if (sl) {
      e.preventDefault(); e.stopPropagation();
      const imgs = $$('.pc__slides img', sl.closest('.pc')); const i = imgs.findIndex(x => x.classList.contains('is-on'));
      imgs[i].classList.remove('is-on'); imgs[(i + +sl.dataset.sl + imgs.length) % imgs.length].classList.add('is-on'); return;
    }
    const q = e.target.closest('[data-qs]');
    if (q) { e.preventDefault(); $$('.pc.is-qs').forEach(c => c.classList.remove('is-qs')); q.closest('.pc').classList.add('is-qs'); q.setAttribute('aria-expanded', 'true'); return; }
    if (e.target.closest('[data-qs-close]') || e.target.closest('.qs [data-add]') || !e.target.closest('.qs')) $$('.pc.is-qs').forEach(c => { c.classList.remove('is-qs'); const b = $('[data-qs]', c); if (b) b.setAttribute('aria-expanded', 'false'); });
  }, true);

  /* ---------------- review card ---------------- */
  function rcard(r) {
    const p = G.bySlug[r.slug];
    const body = ES ? r.es : (r.en || r.es);
    return `<article class="rcard">
      <div class="rcard__who">${r.ph ? `<img class="rav" src="${src(r.ph)}" alt="" loading="lazy">` : `<i>${esc((r.n || '?').trim()[0].toUpperCase())}</i>`}<div>${esc(r.n)}<small class="vbadge"><svg viewBox="0 0 16 16" width="13" height="13"><circle cx="8" cy="8" r="7" fill="#1E9E5A"/><path d="M4.8 8.2l2.1 2.1 4.3-4.6" fill="none" stroke="#fff" stroke-width="1.6"/></svg>${r.v ? t('Compra verificada', 'Verified purchase') : t('Cliente de la tienda', 'Store customer')}</small></div></div>
      ${stars(r.r, 16)}
      <q>${esc(body)}</q>${!ES && !r.en ? `<span class="rcard__note">Original in Spanish</span>` : ''}
      ${p ? `<div class="rcard__p"><span class="th"><img src="${G.img(p)}" alt="" loading="lazy"></span><div><span>${esc(G.nm(p))}</span><a class="tl" href="${pdp(p)}">${t('Ver producto', 'Shop product')} ${ARR}</a></div></div>` : ''}
    </article>`;
  }

  /* ---------------- carousel (scroll-snap + dash pagination + 01/05) ---------------- */
  function initCar(car) {
    if (!car || car._init) return; car._init = true;
    const tr = $('.car__track', car), nav = $('.car__nav', car);
    const m = () => {
      const k = tr.children; const max = Math.max(0, tr.scrollWidth - tr.clientWidth);
      const step = k.length > 1 ? k[1].offsetLeft - k[0].offsetLeft : (k[0] ? k[0].offsetWidth : 1);
      const st = step || 1, raw = max <= 4 ? 1 : Math.ceil(max / st - 0.05) + 1, stride = raw > 9 ? Math.ceil((raw - 1) / 8) : 1;
      return { max, step: st * stride, pages: raw <= 1 ? 1 : Math.ceil((raw - 1) / stride) + 1 };
    };
    let cur = -1;
    const update = () => {
      const { max, step, pages } = m();
      let i = Math.round(tr.scrollLeft / step); if (tr.scrollLeft >= max - 4) i = pages - 1; i = Math.max(0, Math.min(pages - 1, i));
      $$('.car__dash button', nav).forEach((b, j) => b.classList.toggle('is-on', j === i));
      const n = $('.car__n', nav); if (n) n.textContent = `${pad2(i + 1)}/${pad2(pages)}`;
      if (i !== cur) { cur = i; car.dispatchEvent(new CustomEvent('car:index', { detail: i })); }
    };
    const build = () => {
      const { pages } = m(); cur = -1;
      nav.classList.toggle('is-single', pages <= 1);
      nav.innerHTML = `<div class="car__dash">${Array.from({ length: pages }, (_, i) => `<button type="button" aria-label="${t('Ir a', 'Go to')} ${i + 1}"></button>`).join('')}</div><span class="car__n"></span>`;
      update();
    };
    nav.addEventListener('click', e => { const b = e.target.closest('.car__dash button'); if (!b) return; const i = $$('.car__dash button', nav).indexOf(b); tr.scrollTo({ left: i * m().step, behavior: 'smooth' }); });
    let raf; tr.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150); });
    // mouse drag
    let sx = 0, sl = 0, down = false, moved = false;
    tr.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.target.closest('button,select,input')) return; down = true; moved = false; sx = e.clientX; sl = tr.scrollLeft; });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 6) { moved = true; tr.classList.add('is-drag'); } if (moved) tr.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; if (moved) { const { step } = m(); tr.classList.remove('is-drag'); tr.scrollTo({ left: Math.round(tr.scrollLeft / step) * step, behavior: 'smooth' }); } });
    tr.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    car._build = build; build();
    return car;
  }

  /* ---------------- header: mega menu, mobile menu, search, sticky hide ---------------- */
  const BEST = byImportance(G.P).filter(inStock).slice(0, 5);
  const CAT_PHOTO = { proteinas: 'assets/stock/goal-musculo.jpg', creatinas: 'assets/stock/goal-recomposicion.jpg', 'pre-entreno': 'assets/stock/goal-rendimiento.jpg', bienestar: 'assets/stock/goal-bienestar.jpg' };
  const mrow = p => `<a class="mrow" href="${pdp(p)}"><span class="mrow__img"><img src="${G.img(p)}" alt="" loading="lazy"></span><span><b>${esc(G.nm(p))}</b><span>${esc(G.L(p, 'tag'))}${inStock(p) ? '' : ' · ' + t('Agotado', 'Sold out')}</span></span></a>`;
  function megaHtml(key) {
    if (key === 'best') return `<div class="mega__in"><div class="mega__hd"><h2>${t('Más vendidos', 'Bestsellers')}</h2><a class="tl" href="coleccion.html">${t('Ver todo', 'View all')} ${ARR}</a></div><div class="mega__cards">${BEST.map(card).join('')}</div></div>`;
    const c = cat(key); const list = G.P.filter(p => p.cat === key);
    return `<div class="mega__in"><div class="mega__hd"><h2>${esc(c[G.LANG])}</h2><a class="tl" href="coleccion.html?c=${key}">${t('Ver todo', 'View all')} ${ARR}</a></div>
      <div class="mega__feat"><div class="mega__rows">${list.map(mrow).join('')}</div>
      <a class="mfeat" href="coleccion.html?c=${key}"><div class="mfeat__t"><b>${esc(c[G.LANG])} ${ARR}</b><span>${esc(c[G.LANG + '_d'])}</span></div>${ph(list[0] && list[0].img[0], CAT_PHOTO[key])}</a></div></div>`;
  }
  function initHeader() {
    const hd = $('[data-hd]'); if (!hd) return;
    const panel = $('[data-mega-panel]', hd);
    let openKey = null, timer;
    const close = () => { clearTimeout(timer); panel.hidden = true; openKey = null; $$('.hd__a.is-open').forEach(a => a.classList.remove('is-open')); };
    const open = (key, a) => { clearTimeout(timer); if (openKey !== key) { panel.innerHTML = megaHtml(key); openKey = key; } panel.hidden = false; $$('.hd__a').forEach(x => x.classList.toggle('is-open', x === a)); closeSearch(); };
    $$('[data-mega]', hd).forEach(a => {
      a.addEventListener('mouseenter', () => { clearTimeout(timer); timer = setTimeout(() => open(a.dataset.mega, a), 90); });
      a.addEventListener('focus', () => open(a.dataset.mega, a));
    });
    $$('.hd__a:not([data-mega]), .hd__quiz, .hd__icons', hd).forEach(a => a.addEventListener('mouseenter', () => { clearTimeout(timer); timer = setTimeout(close, 120); }));
    hd.addEventListener('mouseleave', () => { clearTimeout(timer); timer = setTimeout(close, 160); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); closeSearch(); closeMM(); } });
    // current nav
    const pg = document.body.dataset.page, c = new URLSearchParams(location.search).get('c');
    if (pg === 'collection') { const a = $(`.hd__a[data-nav="${c || 'all'}"]`, hd); if (a) a.classList.add('is-cur'); }
    // search
    const sb = $('[data-search]', hd), si = $('[data-search-input]', hd), sr = $('[data-search-res]', hd);
    function closeSearch() { if (sb) sb.hidden = true; }
    $('[data-search-toggle]', hd).addEventListener('click', () => { const was = sb.hidden; close(); closeMM(); sb.hidden = !was; if (!sb.hidden) { si.focus(); render(); } });
    const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const render = () => {
      const q = norm(si.value.trim());
      const list = !q ? BEST.slice(0, 3) : G.P.filter(p => norm([p.name, p.name_en, G.L(p, 'tag'), G.L(p, 'short'), catName(p.cat), (p.flavors || []).map(fname).join(' ')].join(' ')).includes(q));
      sr.innerHTML = list.length ? list.map(mrow).join('') : `<p class="lead">${t('Sin resultados. Prueba con “proteína” o “creatina”.', 'No results. Try “protein” or “creatine”.')}</p>`;
    };
    si.addEventListener('input', render);
    document.addEventListener('click', e => { if (!sb.hidden && !e.target.closest('[data-search]') && !e.target.closest('[data-search-toggle]')) closeSearch(); });
    // mobile menu
    const mm = $('[data-mm]'), mmb = $('[data-mm-body]');
    mmb.innerHTML = `<a class="mm__all" href="coleccion.html">${t('Comprar todo', 'Shop all')} ${ARR}</a>
      <details class="mm__acc"><summary>${t('Más vendidos', 'Bestsellers')} ${CHEV}</summary>${BEST.slice(0, 3).map(mrow).join('')}<div class="mm__more"><a class="tl" href="coleccion.html">${t('Ver todo', 'View all')} ${ARR}</a></div></details>
      ${G.cats.map(c => `<details class="mm__acc"><summary>${esc(c[G.LANG])} ${CHEV}</summary>${G.P.filter(p => p.cat === c.id).slice(0, 3).map(mrow).join('')}<div class="mm__more"><a class="tl" href="coleccion.html?c=${c.id}">${t('Ver todo', 'View all')} ${ARR}</a></div></details>`).join('')}
      <div class="mm__util"><a href="index.html#objetivos">${t('Compra por objetivo', 'Shop by goal')}</a><a href="coleccion.html#faq">${t('Preguntas frecuentes', 'FAQ')}</a><a href="index.html#aprende">${t('Aprende', 'Learn')}</a><a href="mailto:hola@godsnutrition.com.mx">hola@godsnutrition.com.mx</a><a href="${$('[data-lang-switch]').getAttribute('href')}" data-lang-switch>${t('English', 'Español')}</a></div>`;
    const tog = $('[data-mm-toggle]');
    function closeMM() { document.documentElement.classList.remove('mm-open', 'gn-lock'); if (mm) mm.setAttribute('aria-hidden', 'true'); if (tog) tog.setAttribute('aria-expanded', 'false'); }
    tog.addEventListener('click', () => {
      const on = !document.documentElement.classList.contains('mm-open');
      if (on) { const r = hd.getBoundingClientRect(); mm.style.setProperty('--mm-top', Math.max(0, r.bottom) + 'px'); closeSearch(); }
      document.documentElement.classList.toggle('mm-open', on); document.documentElement.classList.toggle('gn-lock', on);
      mm.setAttribute('aria-hidden', String(!on)); tog.setAttribute('aria-expanded', String(on));
    });
    mm.addEventListener('click', e => { if (e.target.closest('a')) closeMM(); });
    addEventListener('resize', () => { if (innerWidth > 989) closeMM(); });
    // hide on scroll down, reveal on scroll up
    let last = scrollY;
    addEventListener('scroll', () => {
      const y = scrollY;
      const busy = !panel.hidden || !sb.hidden || document.documentElement.classList.contains('mm-open');
      if (!busy) hd.classList.toggle('is-hidden', y > last && y > 300);
      if (y < last || y < 300) hd.classList.remove('is-hidden');
      last = y;
    }, { passive: true });
    // language switch keeps the query (product / collection filter)
    $$('[data-lang-switch]').forEach(a => { if (location.search) a.setAttribute('href', a.getAttribute('href').split('?')[0] + location.search); });
    if (innerWidth <= 749) $$('.ft__col[open]').forEach(d => { d.open = false; });
    // newsletter (no network: local + event hook)
    $$('[data-news]').forEach(f => f.addEventListener('submit', e => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(f).entries());
      if (!/\S+@\S+\.\S+/.test(d.email || '')) { f.email.focus(); return; }
      document.dispatchEvent(new CustomEvent('gn:lead', { detail: { lead: d, source: 'newsletter' } }));
      $('.ft__ok', f).hidden = false; f.reset();
    }));
  }

  /* ---------------- shared sections ---------------- */
  function renderReviews() {
    $$('[data-reviews]').forEach(el => { el.innerHTML = G.reviews.map(rcard).join(''); initCar(el.closest('.car')); });
    $$('[data-stars]').forEach(el => { el.innerHTML = stars(+el.dataset.stars, +el.dataset.size || 16); });
  }
  const LEARN = [
    { slug: 'gods-creatine-1kg', ph: 'creatine-fruit.jpg', c: t('Creatina', 'Creatine'), h: t('Cómo tomar creatina', 'How to take creatine'), p: t('1 medida de 6 g en 300–500 ml de agua, todos los días a la misma hora. Cada porción trae 5 g de creatina monohidratada.', 'One 6 g scoop in 300–500 ml of water, every day at the same time. Each serving has 5 g of creatine monohydrate.') },
    { slug: 'gods-whey-protein', ph: 'hero-lineup.jpg', c: t('Proteína', 'Protein'), h: t('Proteína: cuánta trae cada porción', 'Protein: how much is in each serving'), p: t('God’s Whey: 28 g en 35 g de polvo. Full Protein: 21 g en 30 g. Themis: 23 g en 31 g.', 'God’s Whey: 28 g in 35 g of powder. Full Protein: 21 g in 30 g. Themis: 23 g in 31 g.') },
    { slug: 'ares', ph: 'ares-dark.jpg', c: t('Pre-entreno', 'Pre-workout'), h: t('Cafeína + L-teanina: qué lleva Ares', 'Caffeine + L-theanine: what’s in Ares'), p: t('200 mg de cafeína anhidra y 200 mg de L-teanina por cápsula, 30–45 minutos antes de entrenar. Máximo 1 al día.', '200 mg of caffeine anhydrous and 200 mg of L-theanine per capsule, 30–45 minutes before training. Max 1 a day.') },
    { slug: 'gods-omega-3', ph: 'omega-softgels.jpg', c: 'Omega-3', h: t('EPA y DHA: cómo leer tu Omega-3', 'EPA and DHA: how to read your Omega-3'), p: t('3 cápsulas = 3000 mg de aceite de salmón con 1200 mg de EPA y 600 mg de DHA.', '3 softgels = 3000 mg of salmon oil with 1200 mg of EPA and 600 mg of DHA.') },
    { slug: 'creatina', ph: 'stack.jpg', c: t('Creatina', 'Creatine'), h: t('Creatina de 1 kg o de 500 g', '1 kg or 500 g creatine'), p: t('La misma dosis de 5 g por porción; cambia el número de porciones: 166 contra 83.', 'The same 5 g dose per serving; only the servings change: 166 vs. 83.') },
    { slug: 'preventa-gods-demeter-450g', ph: null, c: t('Bienestar', 'Wellness'), h: t('Inositol 40:1: qué significa', 'Inositol 40:1: what it means'), p: t('Cada porción de Deméter trae 4000 mg de myo-inositol por 100 mg de D-chiro-inositol.', 'Each Deméter serving has 4000 mg of myo-inositol to 100 mg of D-chiro-inositol.') }
  ];
  function renderLearn() {
    $$('[data-learn]').forEach(el => {
      el.innerHTML = LEARN.map(a => { const p = G.bySlug[a.slug]; return p ? `<a class="bc" href="${pdp(p)}">${ph(p.img[0], a.ph)}<div class="bc__b"><h3>${esc(a.h)}</h3><small>${esc(a.c)}</small><p>${esc(a.p)}</p></div></a>` : ''; }).join('');
      initCar(el.closest('.car'));
    });
  }
  function initFaqAccordion() {
    $$('.qa').forEach(q => { const h = $('h3', q); if (!h) return; h.setAttribute('role', 'button'); h.tabIndex = 0; const tg = () => { if (innerWidth <= 749) q.classList.toggle('is-open'); }; h.addEventListener('click', tg); h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tg(); } }); });
  }

  /* ---------------- HOME ---------------- */
  function home() {
    const av = $('[data-proof-av]'); if (av) av.innerHTML = G.reviews.filter(r => r.ph).slice(0, 4).map(r => `<img src="${src(r.ph)}" alt="" width="42" height="42">`).join('');
    // tabbed carousel
    const track = $('[data-tab-track]'), car = track && track.closest('.car');
    const listFor = k => k === 'best' ? byImportance(G.P) : k === 'capsulas' ? G.P.filter(p => (META[p.slug] || {}).f === 'capsulas') : G.P.filter(p => p.cat === k);
    const show = k => { track.innerHTML = listFor(k).map(card).join(''); track.scrollLeft = 0; if (car._build) car._build(); };
    show('best'); initCar(car);
    $$('[data-tab]').forEach(b => b.addEventListener('click', () => {
      $$('[data-tab]').forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', String(x === b)); });
      track.classList.add('is-fading'); setTimeout(() => { show(b.dataset.tab); track.classList.remove('is-fading'); }, 220);
    }));
    // quote marquee (real reviews in place of press quotes)
    const qm = $('[data-quote-marquee]');
    if (qm) {
      const qs = G.reviews.filter(r => (ES ? r.es : (r.en || r.es)).length <= 95).slice(0, 8);
      const html = qs.map(r => `<div class="qmi"><q>${esc(ES ? r.es : (r.en || r.es))}</q><span class="qmi__st" aria-hidden="true">★★★★★</span><span class="qmi__n">${esc(r.n)}</span></div>`).join('');
      qm.innerHTML = html + html.replace(/class="qmi"/g, 'class="qmi" aria-hidden="true"');
    }
    // categories row
    const cats = $('[data-cats]');
    if (cats) cats.innerHTML = G.cats.map(c => { const list = G.P.filter(p => p.cat === c.id); return `<a class="cat" href="coleccion.html?c=${c.id}"><div class="cat__img">${list.slice(0, 3).map((p, i) => `<img src="${src(p.img[i % p.img.length])}" alt="" loading="lazy">`).join('')}</div><div class="cat__b"><h3>${esc(c[G.LANG])}</h3><small>${list.length} ${list.length === 1 ? t('producto', 'product') : t('productos', 'products')}</small></div></a>`; }).join('');
    renderReviews();
    // partners → founders + daily use
    const pt = $('[data-partners]');
    if (pt) {
      const P = s => G.bySlug[s];
      const slides = [
        { photo: 'aries-terron.jpg', q: t('Cofundador y cara de la marca. Comparte entrenamiento y nutrición con base en evidencia como “Fitness Científico”.', 'Co-founder and the face of the brand. Shares evidence-based training and nutrition as “Fitness Científico”.'), n: 'Aries Terrón', r: t('Cofundador · @aries_terron', 'Co-founder · @aries_terron') },
        { photo: 'gods-whey-real.jpg', q: t('“Nos regimos mucho por lo que es la ciencia de cada suplemento… solamente vendemos lo que funciona.”', '“We go by the science behind each supplement… we only sell what works.”'), n: 'Pepe Villalvazo', r: t('Cofundador de God’s Nutrition', 'Co-founder, God’s Nutrition') },
        { p: P('gods-whey-protein'), photo: 'assets/stock/athlete-a.jpg', q: t('28 g de proteína por porción, con 1 g de carbohidratos y siete sabores.', '28 g of protein per serving, with 1 g of carbs and seven flavors.'), r: t('Después de entrenar', 'After training') },
        { p: P('gods-creatine-1kg'), photo: 'assets/stock/athlete-b.jpg', q: t('5 g de creatina monohidratada al día, a la misma hora. 166 porciones por bote.', '5 g of creatine monohydrate a day, at the same time. 166 servings per tub.'), r: t('Todos los días', 'Every day') },
        { p: P('ares'), photo: 'assets/stock/athlete-c.jpg', q: t('1 cápsula con 200 mg de cafeína y 200 mg de L-teanina, 30–45 minutos antes.', '1 capsule with 200 mg of caffeine and 200 mg of L-theanine, 30–45 minutes before.'), r: t('Antes de entrenar', 'Before training') },
        { p: P('preventa-gods-demeter-450g'), photo: 'assets/stock/athlete-d.jpg', q: t('1 medida en 250 ml de agua: 4000 mg de myo-inositol y 100 mg de D-chiro-inositol (40:1).', '1 scoop in 250 ml of water: 4000 mg of myo-inositol and 100 mg of D-chiro-inositol (40:1).'), r: t('Una vez al día', 'Once a day') }
      ];
      pt.innerHTML = slides.map((s, i) => `<div class="ps${i ? '' : ' is-on'}" data-ps="${i}">
        ${s.p ? ph(s.p.img[0], s.photo, 'ps__img') : ph('assets/img/cut/whey-cafe-caramelo.png', s.photo, 'ps__img')}
        <div class="ps__txt"><p class="ps__q">${esc(s.q)}</p>${s.p ? `<p class="ps__n">${esc(G.nm(s.p))}</p><p class="ps__r">${esc(s.r)} · <a href="${pdp(s.p)}">${t('Ver producto', 'Shop product')}</a></p>` : `<p class="ps__n">${esc(s.n)}</p><p class="ps__r">${esc(s.r)}</p>`}</div></div>`).join('');
      const car2 = initCar(pt.closest('.car'));
      const setOn = i => $$('.ps', pt).forEach((x, j) => x.classList.toggle('is-on', j === i));
      car2.addEventListener('car:index', e => setOn(Math.min(e.detail, slides.length - 1)));
      pt.addEventListener('click', e => { const s = e.target.closest('.ps'); if (!s || e.target.closest('a')) return; const i = +s.dataset.ps; setOn(i); });
    }
    renderLearn();
  }

  /* ---------------- COLLECTION ---------------- */
  function collection() {
    const qp = new URLSearchParams(location.search);
    const split = k => (qp.get(k) || '').split(',').filter(Boolean);
    const S = { c: split('c').filter(c => G.cats.some(x => x.id === c)), o: split('obj'), f: split('fmt'), d: split('disp') };
    const GROUPS = [
      { k: 'c', h: t('Categoría', 'Category'), opts: G.cats.map(c => [c.id, c[G.LANG]]), test: (p, v) => p.cat === v },
      { k: 'o', h: t('Objetivo', 'Goal'), opts: Object.entries(OBJ), test: (p, v) => (META[p.slug] || { o: [] }).o.includes(v) },
      { k: 'f', h: t('Formato', 'Format'), opts: Object.entries(FMT), test: (p, v) => (META[p.slug] || {}).f === v },
      { k: 'd', h: t('Disponibilidad', 'Availability'), opts: [['si', t('En existencia', 'In stock')], ['no', t('Agotado', 'Sold out')]], test: (p, v) => (v === 'si') === inStock(p) }
    ];
    const pass = (p, skip) => GROUPS.every(g => g.k === skip || !S[g.k].length || S[g.k].some(v => g.test(p, v)));
    const fg = $('[data-filter-groups]'), grid = $('[data-col-grid]'), chips = $('[data-col-chips]');
    function render(push) {
      const list = byImportance(G.P.filter(p => pass(p)));
      grid.innerHTML = list.map(card).join('');
      $('[data-col-empty]').hidden = !!list.length;
      $('[data-col-count]').textContent = `${list.length} ${list.length === 1 ? t('producto', 'product') : t('productos', 'products')}`;
      $$('[data-col-n]').forEach(n => n.textContent = list.length);
      fg.innerHTML = GROUPS.map(g => `<details class="fg"${g.k === 'd' && !S.d.length ? '' : ' open'}><summary>${g.h} ${CHEV}</summary><ul>${g.opts.map(([v, l]) => { const n = G.P.filter(p => pass(p, g.k) && g.test(p, v)).length; return `<li><label class="fo"><input type="checkbox" data-fk="${g.k}" value="${v}"${S[g.k].includes(v) ? ' checked' : ''}${!n && !S[g.k].includes(v) ? ' disabled' : ''}><span>${esc(l)}</span><em>(${n})</em></label></li>`; }).join('')}</ul></details>`).join('');
      const one = S.c.length === 1 ? cat(S.c[0]) : null;
      $('[data-col-title]').textContent = one ? one[G.LANG] : t('Todos los productos', 'All products');
      $('[data-col-crumb]').textContent = one ? one[G.LANG] : t('Todos los productos', 'All products');
      $('[data-col-lead]').textContent = one ? one[G.LANG + '_d'] : t('Proteína, creatina, pre-entreno y bienestar con la dosis exacta en la etiqueta.', 'Protein, creatine, pre-workout and wellness with the exact dose on the label.');
      document.title = `${one ? one[G.LANG] : t('Tienda', 'Shop')} · God’s Nutrition`;
      chips.innerHTML = `<a class="chip${!S.c.length ? ' is-on' : ''}" href="coleccion.html" data-chip="">${t('Todo el catálogo', 'All Products')}</a>` + G.cats.map(c => `<a class="chip${S.c.length === 1 && S.c[0] === c.id ? ' is-on' : ''}" href="coleccion.html?c=${c.id}" data-chip="${c.id}">${esc(c[G.LANG])}</a>`).join('');
      $$('.hd__a.is-cur').forEach(a => a.classList.remove('is-cur')); const cur = $(`.hd__a[data-nav="${S.c.length === 1 ? S.c[0] : (!S.c.length ? 'all' : '')}"]`); if (cur) cur.classList.add('is-cur');
      if (push !== false) {
        const u = new URLSearchParams(); if (S.c.length) u.set('c', S.c.join(',')); if (S.o.length) u.set('obj', S.o.join(',')); if (S.f.length) u.set('fmt', S.f.join(',')); if (S.d.length) u.set('disp', S.d.join(','));
        const qs = u.toString(); history.replaceState(null, '', location.pathname + (qs ? '?' + qs.replace(/%2C/g, ',') : '') + location.hash);
        $$('[data-lang-switch]').forEach(a => a.setAttribute('href', a.getAttribute('href').split('?')[0] + (qs ? '?' + qs.replace(/%2C/g, ',') : '')));
      }
    }
    fg.addEventListener('change', e => { const i = e.target.closest('[data-fk]'); if (!i) return; const a = S[i.dataset.fk]; if (i.checked) a.push(i.value); else a.splice(a.indexOf(i.value), 1); render(); });
    chips.addEventListener('click', e => { const c = e.target.closest('[data-chip]'); if (!c) return; e.preventDefault(); S.c = c.dataset.chip ? [c.dataset.chip] : []; render(); });
    $$('[data-filter-clear]').forEach(b => b.addEventListener('click', () => { S.c = []; S.o = []; S.f = []; S.d = []; render(); }));
    const fs = $('[data-filters]');
    $('[data-filter-open]').addEventListener('click', () => { fs.classList.add('is-open'); document.documentElement.classList.add('gn-lock'); });
    $$('[data-filter-close]').forEach(b => b.addEventListener('click', () => { fs.classList.remove('is-open'); document.documentElement.classList.remove('gn-lock'); }));
    render(false);
    renderReviews();
    const im = $('[data-icon-marquee]');
    if (im) {
      const IC = {
        truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25"><path d="M2 7h12v9H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>',
        card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></svg>',
        star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25"><path d="M12 3l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16l-5.1 2.6 1-5.6-4.1-4 5.7-.8z"/></svg>',
        label: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>'
      };
      const items = [['truck', t('Envío gratis desde $400', 'Free shipping from $400')], ['card', t('Hasta 12 pagos con Mercado Pago', 'Up to 12 payments with Mercado Pago')], ['star', t('147 reseñas · 4.95★', '147 reviews · 4.95★')], ['label', t('Dosis exacta en cada etiqueta', 'Exact dose on every label')]];
      const one = items.map(([i, l]) => `<span>${IC[i]}${esc(l)}</span>`).join('');
      im.innerHTML = one.repeat(3) + `<span aria-hidden="true" style="display:contents">${one.repeat(3)}</span>`;
    }
    initFaqAccordion();
    renderLearn();
  }

  /* ---------------- PDP ---------------- */
  const IC = {
    scoop: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 26h30v6a14 14 0 01-28 0zM36 28h22"/></svg>',
    glass: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 10h28l-4 46H22zM20 26h24"/></svg>',
    shake: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M24 14h16v6l4 6v28H20V26l4-6zM20 32h24M10 22l4 2M10 34h4M50 22l4-2M50 34h4"/></svg>',
    clock: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="32" cy="32" r="22"/><path d="M32 18v14l10 6"/></svg>',
    cal: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="10" y="14" width="44" height="40" rx="3"/><path d="M10 26h44M22 8v10M42 8v10M22 38l6 6 12-12"/></svg>',
    cap: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="12" y="24" width="40" height="16" rx="8" transform="rotate(-35 32 32)"/><path d="M27 21l10 22"/></svg>',
    meal: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="32" cy="34" r="16"/><path d="M10 12v16M6 12v8a4 4 0 008 0v-8M54 12c-4 2-6 8-6 14h6v26"/></svg>',
    one: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="32" cy="32" r="22"/><path d="M28 24l6-4v24M26 44h14"/></svg>'
  };
  function howSteps(p) {
    const S = (ic, es, en, des, den) => ({ ic, h: t(es, en), p: t(des, den) });
    const powder = (g, ml, liquid, liquidEn) => [S('scoop', 'Mide', 'Measure', `1 medida (${g} g) de polvo.`, `1 scoop (${g} g) of powder.`), S('glass', 'Mezcla', 'Mix', `Con ${ml} ml de ${liquid}.`, `With ${ml} ml of ${liquidEn}.`)];
    switch (p.slug) {
      case 'gods-whey-protein': return powder(35, '250–300', 'agua o leche', 'water or milk').concat([S('shake', 'Agita', 'Shake', 'Hasta que se disuelva por completo.', 'Until it fully dissolves.'), S('clock', 'Tómala', 'Drink', 'Después de entrenar o cuando necesites completar la proteína de tu día.', 'After training or whenever you need to round out your daily protein.')]);
      case 'gods-full-protein-5-lbs': return powder(30, '250', 'agua o leche', 'water or milk').concat([S('shake', 'Agita', 'Shake', 'Hasta lograr una textura espesa y uniforme.', 'Until thick and smooth.')]);
      case 'themis-vegan-protein-1-kg': return powder(31, '250–300', 'agua o bebida vegetal', 'water or plant milk').concat([S('shake', 'Agita bien', 'Shake well', 'Agítala bien antes de tomarla.', 'Shake it well before drinking.')]);
      case 'gods-creatine-1kg': return powder(6, '300–500', 'agua', 'water').concat([S('clock', 'Misma hora', 'Same time', 'Tómala todos los días a la misma hora.', 'Take it every day at the same time.'), S('cal', 'Constancia', 'Consistency', 'La constancia es lo que cuenta.', 'Consistency is what counts.')]);
      case 'creatina': return powder(6, '300–500', 'agua', 'water').concat([S('cal', 'Todos los días', 'Every day', 'Tómala todos los días a la misma hora.', 'Take it every day at the same time.')]);
      case 'ares': return [S('cap', '1 cápsula', '1 capsule', 'Una cápsula por toma.', 'One capsule per serving.'), S('glass', 'Con agua', 'With water', 'Tómala con un vaso de agua.', 'Take it with a glass of water.'), S('clock', '30–45 min antes', '30–45 min before', 'Antes de entrenar.', 'Before training.'), S('one', 'Máximo 1 al día', 'Max 1 a day', 'No excedas 1 cápsula al día.', 'Do not exceed 1 capsule per day.')];
      case 'gods-omega-3': return [S('cap', '3 cápsulas', '3 softgels', 'Una porción son 3 cápsulas blandas.', 'One serving is 3 softgels.'), S('meal', 'Con alimentos', 'With food', 'Tómalas al día con tus comidas.', 'Take them daily with your meals.')];
      case 'preventa-gods-demeter-450g': return powder(6, '250', 'agua', 'water').concat([S('cal', 'Una vez al día', 'Once a day', 'Una porción al día.', 'One serving a day.')]);
      case 'gods-ceres-450g-p': return powder(5, '250', 'agua', 'water').concat([S('clock', 'De inmediato', 'Right away', 'Tómala en cuanto la mezcles.', 'Drink it as soon as you mix it.')]);
      default: return [S('scoop', 'Modo de uso', 'How to use', G.L(p, 'how'), G.L(p, 'how'))];
    }
  }

  function product() {
    const qp = new URLSearchParams(location.search);
    const p = G.bySlug[qp.get('p')] || G.P[0];
    const out = !inStock(p);
    const fl = p.flavors || [];
    const S = { vid: firstVid(p), qty: 1 };
    const name = G.nm(p);
    document.title = `${name} · God’s Nutrition`;
    const md = $('meta[name=description]'); if (md) md.setAttribute('content', G.L(p, 'short'));
    const label = labelOf(p);
    const photos = realPhotos(p).filter(x => x !== label);
    const cut = [...new Set(fl.filter(f => f.img).map(f => f.img).concat(p.img))];
    const gallery = cut.map(x => ({ s: x, photo: false })).concat(photos.map(x => ({ s: x, photo: true }))).concat(label ? [{ s: label, photo: true }] : []);
    const c = cat(p.cat);
    const L = k => G.L(p, k);
    const flavorOut = () => { const f = flv(p, S.vid); return out || (f && f.stock === false); };
    const atcHtml = cls => flavorOut()
      ? `<button type="button" class="atc atc--notify ${cls || ''}" data-notify="${p.slug}">${t('Avísame cuando vuelva', 'Notify me when it’s back')}</button>`
      : `<button type="button" class="atc ${cls || ''}" data-add="${p.slug}"${S.vid ? ` data-vid="${S.vid}"` : ''} data-qty="${S.qty}">${t('Agregar al carrito', 'Add to cart')}</button>`;

    // stack bundle (real cart tiers)
    const core = ['gods-whey-protein', 'gods-creatine-1kg', 'ares'];
    let stackSlugs = core.includes(p.slug) ? core : [p.slug, 'gods-whey-protein', 'gods-creatine-1kg'];
    if (p.slug === 'creatina') stackSlugs = ['creatina', 'gods-whey-protein', 'ares'];
    const stackP = stackSlugs.map(s => G.bySlug[s]).filter(x => x && inStock(x));
    const stackSum = stackP.reduce((s, x) => s + x.price, 0);
    const tier = (G.cfg.tiers || []).slice().reverse().find(x => stackSum >= x.at);

    /* main */
    $('[data-pdp-main]').innerHTML = `
      <div class="gal"><div class="gal__in">
        <div class="gal__main" data-gal-main>${out ? `<span class="gal__badge gal__badge--out">${t('Agotado', 'Sold out')}</span>` : p.badge ? `<span class="gal__badge">${esc(p.badge[ES ? 0 : 1])}</span>` : ''}<img src="${src(gallery[0].s)}" alt="${esc(name)}" fetchpriority="high"></div>
        ${gallery.length > 1 ? `<div class="gal__thumbs" data-gal-thumbs>${gallery.map((g, i) => `<button type="button" class="${i ? '' : 'is-on'}" data-gi="${i}" aria-label="${t('Imagen', 'Image')} ${i + 1}"><img src="${src(g.s)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
      </div></div>
      <div class="bb">
        <nav class="crumbs" aria-label="${t('Ruta', 'Breadcrumb')}"><a href="coleccion.html">${t('Tienda', 'Shop')}</a><span>/</span><a href="coleccion.html?c=${p.cat}">${esc(c[G.LANG])}</a></nav>
        <h1>${esc(name)}</h1>
        <div class="bb__rate">${stars(p.rating, 18)}<a href="#resenas">${nrev(p.count)}</a></div>
        ${p.servings ? `<div class="bb__pill">${perServing(p)} ${t('por porción', 'per serving')} · ${p.servings} ${t('porciones', 'servings')}</div>` : ''}
        <p class="bb__sub">${esc(L('short'))}</p>
        <a class="bb__lnk" href="#info" data-open-nut>${t('Ver información nutrimental', 'View supplement facts')} ${ARR}</a>
        <ul class="bb__facts">${p.facts.filter(f => !/^(Porciones|Servings|Cápsulas|Capsules)$/i.test(f.es)).slice(0, 4).map(f => `<li><b>${esc(f.v)}</b>${esc(f[G.LANG])}</li>`).join('')}</ul>
        <p class="bb__lbl">${t('Tamaño', 'Size')}:</p>
        <div class="bb__size"><span>${esc(L('size'))}</span></div>
        ${fl.length ? `<div class="bb__flvw"><p class="bb__lbl">${fl.length} ${t('sabores disponibles', 'flavors available')}:</p><button type="button" class="bb__flv" data-fd-open aria-haspopup="dialog"></button></div>` : ''}
        <div class="bb__opts">
          <div class="bb__buy"><span class="bb__tab">${t('Envío gratis desde $400', 'Free shipping from $400')}</span>
            <div class="bb__row"><b>${t('Ahorra por volumen', 'Save by volume')} <em>${t('hasta 20%', 'up to 20%')}</em></b><span class="bb__price">${G.money(p.price)}</span></div>
            <ul><li><b>${t('15% de descuento desde $2,399', '15% off from $2,399')}</b></li><li>${t('20% de descuento desde $2,999', '20% off from $2,999')}</li><li>${t('Se aplica solo en tu carrito', 'Applied automatically in your cart')}</li></ul>
          </div>
          <div class="bb__one"><span>${t('Cantidad', 'Quantity')}</span><div class="qty" aria-label="${t('Cantidad', 'Quantity')}"><button type="button" data-qty-step="-1" aria-label="${t('Menos', 'Less')}">−</button><span data-qty>1</span><button type="button" data-qty-step="1" aria-label="${t('Más', 'More')}">+</button></div></div>
        </div>
        <div data-stock-note></div>
        <div class="bb__atc" data-atc-wrap>
          <div data-atc></div>
        </div>
        <a class="bb__cmp" href="#comparar">${t('Comparar con otros productos', 'Compare similar products')}</a>
      </div>`;

    const setFlavor = vid => {
      S.vid = vid; const f = flv(p, vid);
      const btn = $('[data-fd-open]');
      if (btn && f) btn.innerHTML = `${f.img ? `<img src="${src(f.img)}" alt="">` : ''}<span>${esc(fname(f))}</span>${f.stock ? '' : `<em>${t('Agotado', 'Sold out')}</em>`}${CHEV.replace('M6 9l6 6 6-6', 'M9 6l6 6-6 6')}`;
      if (f && f.img) { const gi = gallery.findIndex(g => g.s === f.img); if (gi >= 0) showImg(gi); }
      $('[data-atc]').innerHTML = atcHtml();
      $('[data-stock-note]').innerHTML = flavorOut() ? `<p class="bb__out">${out ? t('Agotado por ahora. Déjanos tus datos y te avisamos cuando vuelva.', 'Sold out for now. Leave your details and we’ll let you know when it’s back.') : t('Este sabor está agotado. Elige otro o te avisamos cuando vuelva.', 'This flavor is sold out. Pick another or we’ll let you know when it’s back.')}</p>` : '';
      $('.bb__one').style.display = flavorOut() ? 'none' : '';
      
      $$('.fd__f').forEach(b => b.classList.toggle('is-on', b.dataset.vid === String(vid)));
      renderSatc();
    };
    function showImg(i) {
      const main = $('[data-gal-main] img'); const g = gallery[i]; if (!g) return;
      main.src = src(g.s); main.classList.toggle('is-photo', g.photo); main.alt = name;
      $$('[data-gi]').forEach(b => b.classList.toggle('is-on', +b.dataset.gi === i));
      const th = $(`[data-gi="${i}"]`); if (th && th.parentElement) th.parentElement.scrollTo({ left: th.offsetLeft - 40, behavior: 'smooth' });
    }
    $('[data-pdp-main]').addEventListener('click', e => {
      const g = e.target.closest('[data-gi]'); if (g) { showImg(+g.dataset.gi); return; }
      const st = e.target.closest('[data-qty-step]'); if (st) { S.qty = Math.max(1, Math.min(20, S.qty + +st.dataset.qtyStep)); $('[data-qty]').textContent = S.qty; const a = $('[data-atc] [data-add]'); if (a) a.dataset.qty = S.qty; return; }
      if (e.target.closest('[data-stack-add]')) { stackP.forEach(x => G.add(x.slug, firstVid(x), 1, { silent: true })); G.Cart.open(stackP[0].slug); return; }
      if (e.target.closest('[data-gal-main]')) { const m = $('[data-gal-main] img'); const lb = document.createElement('div'); lb.className = 'lb'; lb.innerHTML = `<img src="${m.src}" alt="${esc(name)}"><button type="button" aria-label="${t('Cerrar', 'Close')}">×</button>`; lb.addEventListener('click', () => lb.remove()); document.body.appendChild(lb); }
    });
    // flavor drawer
    const fd = $('[data-fd]');
    if (fl.length) {
      $('[data-fd-list]').innerHTML = fl.map(f => `<button type="button" class="fd__f" data-vid="${f.vid}">${f.img ? `<img src="${src(f.img)}" alt="" loading="lazy">` : '<span></span>'}<span>${esc(fname(f))}</span>${f.stock ? '' : `<em>${t('Agotado', 'Sold out')}</em>`}</button>`).join('');
      const openFd = () => { fd.classList.add('is-open'); fd.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('gn-lock'); const on = $('.fd__f.is-on', fd); if (on) on.focus(); };
      const closeFd = () => { fd.classList.remove('is-open'); fd.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('gn-lock'); };
      document.addEventListener('click', e => {
        if (e.target.closest('[data-fd-open]')) { openFd(); return; }
        if (e.target.closest('[data-fd-close]')) { closeFd(); return; }
        const f = e.target.closest('.fd__f'); if (f) { setFlavor(f.dataset.vid); closeFd(); }
      });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeFd(); });
    }
    $$('[data-open-nut]').forEach(a => a.addEventListener('click', () => { const d = $('#info'); if (d) d.open = true; }));

    /* details: label transparency card + accordion */
    const warn = L('warn');
    $('[data-pdp-details]').innerHTML = `
      <div class="tcard"><div class="tcard__hd"><h2>${t('Transparencia en la etiqueta', 'Label transparency')}</h2>
        <p>${t(`Cada porción de ${esc(name)} trae su dosis impresa en la etiqueta. Revisa la información nutrimental, los ingredientes y el modo de uso antes de comprar.`, `Every serving of ${esc(name)} has its dose printed on the label. Check the supplement facts, ingredients and directions before you buy.`)}</p></div>
        <div class="tcard__links"><a href="#info" data-open-nut>${t('Ver información nutrimental', 'View supplement facts')} ${ARR}</a>
        <a href="#ingredientes" data-open-ing>${t('Ver ingredientes', 'View ingredients')} ${ARR}</a>
        <a href="#modo-de-uso">${t('Ver modo de uso', 'View directions')} ${ARR}</a></div>
        ${warn ? `<p class="tcard__warn"><b>${t('Advertencia', 'Warning')}:</b> ${esc(warn)}</p>` : ''}
      </div>
      <div class="acc">
        <details open><summary>${t('Descripción', 'Description')}<span class="pm-ic"></span></summary><div class="acc__b"><p>${esc(L('tag'))}. ${esc(L('short'))}</p><p>${L('bullets').map(esc).join(' · ')}</p><p class="legend">${t('Este producto no es un medicamento y es responsabilidad de quien lo recomienda y de quien lo usa.', 'This product is not a medicine; responsibility lies with whoever recommends it and whoever uses it.')}</p></div></details>
        <details id="info"><summary>${t('Información nutrimental', 'Supplement facts')}<span class="pm-ic"></span></summary><div class="acc__b">${label ? `<img class="acc__label" src="${src(label)}" alt="${t('Etiqueta de', 'Label of')} ${esc(name)}" loading="lazy">` : ''}<table class="facts"><tbody>${p.facts.map(f => `<tr><th>${esc(f[G.LANG])}</th><td>${esc(f.v)}</td></tr>`).join('')}</tbody></table><p class="legend">${t('Por porción, según la etiqueta.', 'Per serving, as stated on the label.')} ${esc(L('size'))}.</p></div></details>
        <details id="ingredientes"><summary>${t('Ingredientes', 'Ingredients')}<span class="pm-ic"></span></summary><div class="acc__b"><p>${esc(L('ingredients'))}</p>${warn ? `<p><b>${t('Advertencia', 'Warning')}:</b> ${esc(warn)}</p>` : ''}</div></details>
        <details><summary>${t('Modo de uso', 'Directions')}<span class="pm-ic"></span></summary><div class="acc__b"><p>${esc(L('how'))}</p></div></details>
        <details><summary>${t('Envíos y pagos', 'Shipping & payments')}<span class="pm-ic"></span></summary><div class="acc__b"><p>${t('Envío gratis a todo México desde $400. Según nuestros clientes, los pedidos llegan en 2–3 días hábiles.', 'Free shipping across Mexico from $400 MXN. According to our customers, orders arrive in 2–3 business days.')}</p><p>${t('Pagas con Mercado Pago: tarjeta, OXXO, saldo o Mercado Crédito hasta 12 pagos; 3, 6 y 9 MSI con tarjetas participantes.', 'Pay with Mercado Pago: card, OXXO, balance or Mercado Crédito in up to 12 payments; 3, 6 and 9 interest-free months with participating cards.')}</p></div></details>
      </div>`;
    $$('[data-open-nut]').forEach(a => a.addEventListener('click', () => { $('#info').open = true; }));
    $$('[data-open-ing]').forEach(a => a.addEventListener('click', () => { $('#ingredientes').open = true; }));

    /* benefits 2×2 from bullets */
    const KIT = { 'gods-whey-protein': ['assets/stock/kitchen-shake.jpg', 'assets/stock/athlete-e.jpg', 'texture-scoop.jpg', 'editorial-hero.jpg'], 'gods-creatine-1kg': ['creatine-fruit.jpg', 'goal-creatina.jpg', 'athlete-1.jpg', 'hero-woman.jpg'], 'creatina': ['goal-creatina.jpg', 'creatine-fruit.jpg', 'hero-woman.jpg', 'athlete-1.jpg'], 'ares': ['ares-dark.jpg', 'goal-preentreno.jpg', 'athlete-3.jpg', 'stack.jpg'], 'gods-omega-3': ['omega-softgels.jpg', 'hero-lineup.jpg'], 'preventa-gods-demeter-450g': ['athlete-4.jpg', 'hero-lineup.jpg'], 'gods-ceres-450g-p': ['goal-bienestar.jpg', 'hero-lineup.jpg'] };
    const kit = KIT[p.slug] || [];
    const pool = cut.concat(photos);
    $('[data-pdp-benefits]').innerHTML = `<div class="split__hd"><h2>${t('Por qué', 'Why')} ${esc(name)}</h2><p class="lead">${esc(L('short'))}</p></div>
      <div class="bens">${L('bullets').slice(0, 4).map((b, i) => `<div class="ben"><div class="ben__t"><h3>${esc(b)}</h3></div>${ph(pool[i % pool.length], kit[i])}</div>`).join('')}</div>`;

    /* key facts + ingredient list */
    $('[data-pdp-ing]').innerHTML = `<div class="split__hd"><h2>${t('Lo que lleva cada porción', 'What’s in every serving')}</h2><p class="lead">${t(`La dosis de ${esc(name)} tal como aparece en la etiqueta.`, `The dose in ${esc(name)} exactly as it appears on the label.`)}</p></div>
      <div class="ings">${p.facts.map(f => { const sv = /^(Porciones|Servings|Cápsulas|Capsules)$/i.test(f.es); return `<div class="ing"><h3>${esc(f[G.LANG])}</h3><b>${esc(f.v)}${sv ? '' : ' ' + t('por porción', 'per serving')}</b><p>${sv ? t(`${esc(f.v)} en cada bote de ${esc(name)} (${esc(L('size'))}).`, `${esc(f.v)} in every tub of ${esc(name)} (${esc(L('size'))}).`) : t(`${esc(f.v)} de ${esc(f.es.toLowerCase())} en cada porción, tal como aparece en la tabla nutrimental de la etiqueta.`, `${esc(f.v)} of ${esc(f.en.toLowerCase())} in every serving, exactly as listed in the supplement facts on the label.`)}</p><img src="${G.img(p)}" alt="" loading="lazy"></div>`; }).join('')}</div>`;

    /* complete your stack */
    const others = byImportance(G.P.filter(x => x.slug !== p.slug && inStock(x)));
    const seen = new Set([p.cat]); const pick = [];
    others.forEach(x => { if (!seen.has(x.cat)) { seen.add(x.cat); pick.push(x); } });
    others.forEach(x => { if (pick.length < 4 && !pick.includes(x)) pick.push(x); });
    pick.length = Math.min(pick.length, 4);
    $('[data-pdp-stack]').innerHTML = `<div class="stack__hd"><h2>${t('Completa tu stack', 'Complete your stack')}</h2><p>${t(`Combina ${esc(name)} con estas fórmulas.`, `Pair ${esc(name)} with these formulas.`)}</p></div>
      <div class="stack">${pick.map(x => `<div class="sk"><div class="sk__tag">${esc(catName(x.cat))}</div><div class="sk__b"><a class="sk__img" href="${pdp(x)}"><img src="${G.img(x)}" alt="${esc(G.nm(x))}" loading="lazy"></a><div class="pc__rate">${stars(x.rating, 16)}<span>${nrev(x.count)}</span></div><h3><a href="${pdp(x)}">${esc(G.nm(x))}</a></h3><p>${esc(G.L(x, 'size'))} · ${G.money(x.price)}</p><button type="button" class="atc" data-add="${x.slug}"${firstVid(x) ? ` data-vid="${firstVid(x)}"` : ''}>${t('Agregar al carrito', 'Add to cart')}</button></div></div>`).join('')}</div>`;

    /* reviews widget */
    const revs = (p.reviews || []).slice().sort((a, b) => (b.d || '').localeCompare(a.d || ''));
    const hist = [5, 4, 3, 2, 1].map(s => [s, revs.filter(r => Math.round(r.r) === s).length]);
    const avg = revs.length ? revs.reduce((s, r) => s + r.r, 0) / revs.length : p.rating;
    const fmtD = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString(ES ? 'es-MX' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }); } catch (e) { return d; } };
    const PER = 8; let page = 0;
    const rw = $('[data-pdp-reviews]');
    const drawReviews = () => {
      const pages = Math.ceil(revs.length / PER);
      rw.innerHTML = `<div class="rw__top"><div><h2>${t('Reseñas', 'Reviews')}</h2><div class="rw__avg"><b>${p.rating.toFixed(2)}</b>${stars(p.rating, 20)}<span>${nrev(p.count)}</span></div></div>
        <div><div class="hist">${hist.map(([s, n]) => `<div><span>${s} ★</span><i style="--w:${revs.length ? n / revs.length * 100 : 0}%"></i><span>${n}</span></div>`).join('')}</div><p class="hist__note">${t(`Distribución de las ${revs.length} reseñas publicadas abajo (promedio ${avg.toFixed(2)}).`, `Breakdown of the ${revs.length} reviews published below (average ${avg.toFixed(2)}).`)}</p></div></div>
        <div class="rws">${revs.slice(page * PER, page * PER + PER).map(r => { const body = ES ? r.t : (r.en || r.t); return `<article class="rwi">${stars(r.r, 18)}<div class="rwi__hd">${r.ph ? `<img class="rav rav--sm" src="${src(r.ph)}" alt="" loading="lazy">` : ''}<b>${esc(r.n)}</b>${r.v ? `<span class="rwi__v"><svg viewBox="0 0 16 16" width="12" height="12"><circle cx="8" cy="8" r="7" fill="#1E9E5A"/><path d="M4.8 8.2l2.1 2.1 4.3-4.6" fill="none" stroke="#fff" stroke-width="1.6"/></svg> ${t('Compra verificada', 'Verified')}</span>` : ''}<span class="rwi__d">${fmtD(r.d)}</span></div><p>${esc(body).replace(/\n/g, '<br>')}</p>${!ES ? `<small>${r.en ? 'Translated from Spanish' : 'Original in Spanish'}</small>` : ''}</article>`; }).join('')}</div>
        ${pages > 1 ? `<div class="pager">${Array.from({ length: pages }, (_, i) => `<button type="button" class="${i === page ? 'is-on' : ''}" data-pg="${i}">${i + 1}</button>`).join('')}</div>` : ''}`;
    };
    rw.addEventListener('click', e => { const b = e.target.closest('[data-pg]'); if (!b) return; page = +b.dataset.pg; drawReviews(); rw.scrollIntoView({ behavior: 'smooth' }); });
    drawReviews();

    /* how to use */
    const steps = howSteps(p);
    $('[data-pdp-how]').innerHTML = `<h2>${t('Modo de uso', 'How to use')}</h2><div class="steps">${steps.map((s, i) => `<div class="step"><div class="step__n"><b>${i + 1}</b></div><div class="step__ic">${IC[s.ic] || ''}</div><div class="step__t"><h3>${t('Paso', 'Step')} ${i + 1} · ${esc(s.h)}</h3><p>${esc(s.p)}</p></div></div>`).join('')}</div><p class="how__note">${warn ? esc(warn) + ' ' : ''}${t('Este producto no es un medicamento y es responsabilidad de quien lo recomienda y de quien lo usa.', 'This product is not a medicine; responsibility lies with whoever recommends it and whoever uses it.')}</p>`;

    /* FAQ */
    const qa = [
      [t('¿Cuántas porciones trae cada bote y cuánto sale cada una?', 'How many servings are in each tub and what does each cost?'), `${esc(L('size'))}. ${p.servings ? t(`Con un precio de ${G.money(p.price)}, cada porción sale en unos ${perServing(p)}. Si sumas otros productos, el carrito aplica 15% de descuento desde $2,399 y 20% desde $2,999.`, `At ${G.money(p.price)}, each serving works out to about ${perServing(p)}. Add other products and the cart applies 15% off from $2,399 and 20% off from $2,999.`) : ''}`],
      fl.length ? [t('¿Qué sabores hay disponibles en este momento?', 'Which flavors are available right now?'), fl.map(f => esc(fname(f)) + (f.stock ? '' : ` (${t('agotado', 'sold out')})`)).join(', ') + '. ' + t('Si el sabor que quieres está agotado, elígelo en el selector y toca «Avísame»: te escribimos en cuanto vuelva a estar disponible.', 'If the flavor you want is sold out, pick it in the selector and tap “Notify me”: we’ll write as soon as it’s back in stock.')]
        : [t('¿Qué trae exactamente cada porción según la etiqueta?', 'What exactly is in each serving, per the label?'), p.facts.map(f => `${esc(f[G.LANG])}: ${esc(f.v)}`).join(' · ') + '.'],
      [t('¿Cómo y en qué momento del día se toma?', 'How and at what time of day do I take it?'), esc(L('how')) + (warn ? ' ' + esc(warn) : '') + ' ' + t('Este producto no es un medicamento y es responsabilidad de quien lo recomienda y de quien lo usa.', 'This product is not a medicine; responsibility lies with whoever recommends it and whoever uses it.')],
      [t('¿Qué ingredientes lleva la fórmula completa?', 'What are the ingredients in the full formula?'), esc(L('ingredients')) + ' ' + t('Revisa la etiqueta completa en la sección de información nutrimental antes de comprar.', 'Check the full label in the supplement facts section before you buy.')],
      [t('¿Cuánto tarda el envío y desde cuánto es gratis?', 'How long does shipping take and when is it free?'), t('Enviamos a todo México y el envío es gratis en pedidos desde $400. Según nuestros clientes, los pedidos llegan en 2–3 días hábiles. El costo y el tiempo exactos para tu código postal se muestran en el pago.', 'We ship across Mexico and shipping is free on orders from $400 MXN. According to our customers, orders arrive in 2–3 business days. The exact cost and timing for your postal code are shown at checkout.')],
      [t('¿Cómo puedo pagar y hay meses sin intereses?', 'How can I pay, and are there interest-free months?'), t('Con Mercado Pago: tarjeta, efectivo en OXXO, saldo Mercado Pago o Mercado Crédito hasta 12 pagos; 3, 6 y 9 MSI con tarjetas participantes.', 'With Mercado Pago: card, cash at OXXO, Mercado Pago balance or Mercado Crédito in up to 12 payments; 3, 6 and 9 interest-free months with participating cards.')]
    ];
    $('[data-pdp-faq]').innerHTML = `<h2 class="faq__h">${t('Preguntas frecuentes', 'Frequently asked questions')}</h2><div class="faq__grid">${qa.map(([q, a]) => `<div class="qa"><h3>${q}</h3><p>${a}</p></div>`).join('')}</div>`;
    initFaqAccordion();

    /* compare (God's vs God's only) */
    let peers = G.P.filter(x => x.cat === p.cat);
    peers = [...new Set(peers.concat(G.P))].slice(0, 5);
    peers = [p].concat(peers.filter(x => x !== p));
    const RI = {
      tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>',
      dose: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 10h11v3a5.5 5.5 0 01-11 0zM15 11h6"/></svg>',
      serv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
      price: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="9"/><path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.9 2.5 2-1 2-2.5 2c-1.2 0-2.2-.6-2.6-1.6M12 6.5v1.5M12 16v1.5"/></svg>'
    };
    $('[data-pdp-compare]').innerHTML = `<h2>${t('Compara', 'Compare')} ${esc(c[G.LANG].toLowerCase())}</h2>
      <div class="cmp">${peers.map(x => `<div class="cmp__c${x === p ? ' is-cur' : ''}">${!inStock(x) ? `<span class="pc__badge pc__badge--out">${t('Agotado', 'Sold out')}</span>` : x.badge ? `<span class="pc__badge">${esc(x.badge[ES ? 0 : 1])}</span>` : ''}
        <div class="cmp__img"><img src="${G.img(x)}" alt="${esc(G.nm(x))}" loading="lazy"></div>
        <div class="cmp__rate">${stars(x.rating, 16)}<span>${x.rating.toFixed(2)}</span></div>
        <h3><a href="${pdp(x)}">${esc(G.nm(x))}</a></h3>
        <div class="cmp__row">${RI.tag}<span>${esc(G.L(x, 'tag'))}</span></div>
        <div class="cmp__row">${RI.dose}<span><b>${esc(x.facts[0].v)}</b> ${esc(x.facts[0][G.LANG].toLowerCase())} ${t('por porción', 'per serving')}</span></div>
        <div class="cmp__row">${RI.serv}<span>${esc(G.L(x, 'size'))}</span></div>
        <div class="cmp__row">${RI.price}<span>${G.money(x.price)} · ${perServing(x)} ${t('por porción', 'per serving')}</span></div>
        <div class="cmp__row">${RI.tag}<span>${(x.flavors || []).length ? `${x.flavors.length} ${t('sabores', 'flavors')}` : t('Sin sabores', 'No flavors')}</span></div>
        ${x === p ? `<p class="tl" style="border:0;color:var(--muted)">${t('Estás viendo este producto', 'You’re viewing this product')}</p>` : `<a class="tl" href="${pdp(x)}">${t('Ver producto', 'Shop product')} ${ARR}</a>`}</div>`).join('')}</div>`;

    /* sticky ATC */
    const satc = $('[data-satc]');
    function renderSatc() {
      const f = flv(p, S.vid);
      satc.innerHTML = `<div class="satc__in"><img class="satc__img" src="${f && f.img ? src(f.img) : G.img(p)}" alt="">
        <div class="satc__info"><b>${esc(name)}</b><div class="satc__meta">${stars(p.rating, 14)}<span class="satc__cnt">${nrev(p.count)}</span><strong>${G.money(p.price)}</strong>${f ? `<span>· ${esc(fname(f))}</span>` : ''}</div></div>
        ${fl.length > 1 && !out ? `<select data-satc-flv aria-label="${t('Sabor', 'Flavor')}">${fl.map(x => `<option value="${x.vid}"${String(x.vid) === String(S.vid) ? ' selected' : ''}>${esc(fname(x))}${x.stock ? '' : ' (' + t('agotado', 'sold out') + ')'}</option>`).join('')}</select>` : ''}
        ${atcHtml().replace('Agregar al carrito', 'Agregar')}</div>`;
    }
    satc.addEventListener('change', e => { if (e.target.matches('[data-satc-flv]')) setFlavor(e.target.value); });
    const wrap = $('[data-atc-wrap]');
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { const on = !en.isIntersecting && en.boundingClientRect.top < 0; satc.classList.toggle('is-on', on); satc.setAttribute('aria-hidden', String(!on)); }).observe(wrap);

    setFlavor(S.vid);
    if (!fl.length) { $('[data-atc]').innerHTML = atcHtml(); renderSatc(); }
  }

  /* ---------------- boot ---------------- */
  initHeader();
  const pg = document.body.dataset.page;
  if (pg === 'home') home(); else if (pg === 'collection') collection(); else if (pg === 'pdp') product();
})();
