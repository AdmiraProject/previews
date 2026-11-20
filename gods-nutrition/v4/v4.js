/* God's Nutrition v4 — page rendering + motion. Commerce (cart, drawer, popup, checkout) lives in assets/gn/core.js. */
(function () {
  const G = window.GNC; if (!G) return;
  const ES = G.LANG !== 'en';
  const t = (es, en) => (ES ? es : en);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const A = p => G.base + p;
  const webp = p => (p && p.includes('/cut/') ? p.replace(/\.png$/, '.webp') : p);
  const cut = (p, i) => A(webp(p.img[i || 0]));
  const money = G.money;
  const page = document.body.dataset.page;
  const caps = p => /ares|omega/.test(p.slug);
  const params = new URLSearchParams(location.search);
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  /* ---------- header: announcement, scroll shadow, mega, mobile nav, bag count ---------- */
  const ann = $('[data-ann]');
  if (ann) {
    const n = ann.children.length; let i = 0, timer;
    const go = k => { i = (k + n) % n; ann.style.transform = `translateX(${-100 * i}%)`; };
    const auto = () => { clearInterval(timer); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => go(i + 1), 8000); };
    $('[data-ann-prev]') && $('[data-ann-prev]').addEventListener('click', () => { go(i - 1); auto(); });
    $('[data-ann-next]') && $('[data-ann-next]').addEventListener('click', () => { go(i + 1); auto(); });
    auto();
  }
  const top = $('[data-top]');
  const onScroll = () => top && top.classList.toggle('is-sc', scrollY > 4);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const byCat = id => G.P.filter(p => p.cat === id);
  const catName = id => { const c = G.cats.find(x => x.id === id); return c ? c[G.LANG] : id; };
  const megaCols = [['proteinas'], ['creatinas', 'pre-entreno'], ['bienestar']];
  const mc = $('[data-mega-cols]');
  if (mc) mc.innerHTML = megaCols.map(ids => `<div>${ids.map((id, k) => `<h4${k ? ' style="margin-top:20px"' : ''}><a href="coleccion.html?c=${id}" style="padding:0;font:inherit">${esc(catName(id))}</a></h4>${byCat(id).map(p => `<a href="${G.pdp(p)}">${esc(G.nm(p))}</a>`).join('')}`).join('')}</div>`).join('');
  const megaBtn = $('[data-mega-btn]'), mega = $('[data-mega]');
  if (megaBtn && mega) {
    let hideT;
    const open = v => { clearTimeout(hideT); mega.hidden = !v; megaBtn.setAttribute('aria-expanded', String(v)); };
    megaBtn.addEventListener('click', () => open(mega.hidden));
    [megaBtn, mega].forEach(el => { el.addEventListener('mouseenter', () => matchMedia('(hover:hover)').matches && open(true)); el.addEventListener('mouseleave', () => { hideT = setTimeout(() => open(false), 160); }); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') open(false); });
  }
  const mnav = $('[data-mnav]'), burger = $('[data-burger]');
  if (mnav && burger) {
    const sec = (label, body, href) => href ? `<div class="mnav__sec"><a class="mnav__h" href="${href}">${esc(label)}</a></div>`
      : `<div class="mnav__sec"><button type="button" class="mnav__h" aria-expanded="false">${esc(label)}<svg class="chev" viewBox="0 0 11 6" aria-hidden="true"><path d="M1 1l4.5 4L10 1"/></svg></button><div class="mnav__b" hidden>${body}</div></div>`;
    const cards = $$('.mega .mcard').map(c => c.outerHTML).join('');
    $('[data-mnav-body]').innerHTML =
      sec(t('Tienda', 'Shop'), `<a href="coleccion.html">${t('Todos los productos', 'All products')}</a>` + G.cats.map(c => `<a href="coleccion.html?c=${c.id}">${esc(c[G.LANG])}</a>`).join('')) +
      G.cats.map(c => sec(c[G.LANG], byCat(c.id).map(p => `<a href="${G.pdp(p)}">${esc(G.nm(p))}</a>`).join(''))).join('') +
      sec(t('Ciencia', 'Science'), '', 'index.html#ciencia') + sec(t('Arma tu stack', 'Build your stack'), '', 'producto.html?p=gods-whey-protein#stack') +
      sec(t('English', 'Español'), '', $('[data-alt]').getAttribute('href')) + cards;
    mnav.addEventListener('click', e => { const h = e.target.closest('button.mnav__h'); if (!h) return; const b = h.nextElementSibling; const o = h.getAttribute('aria-expanded') !== 'true'; h.setAttribute('aria-expanded', String(o)); b.hidden = !o; });
    const setNav = v => { mnav.hidden = !v; burger.setAttribute('aria-expanded', String(v)); document.documentElement.classList.toggle('gn-lock', v); };
    burger.addEventListener('click', () => setNav(mnav.hidden));
    mnav.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });
    addEventListener('resize', () => { if (innerWidth >= 1024 && !mnav.hidden) setNav(false); });
  }
  const bagN = $('[data-cart-count-h]'), dot = $('.hd__dot[data-count]');
  const syncBag = () => { if (bagN) bagN.textContent = G.count(); };
  if (dot) new MutationObserver(syncBag).observe(dot, { childList: true, characterData: true, subtree: true, attributes: true });
  syncBag(); document.addEventListener('gn:add', () => setTimeout(syncBag, 0));

  $$('[data-nl]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault(); const i = f.querySelector('input');
    if (!/\S+@\S+\.\S+/.test(i.value)) { i.focus(); i.setAttribute('aria-invalid', 'true'); return; }
    document.dispatchEvent(new CustomEvent('gn:lead', { detail: { lead: { email: i.value }, source: 'newsletter' } }));
    f.hidden = true; const ok = f.parentNode.querySelector('[data-nl-ok]'); if (ok) ok.hidden = false;
  }));

  /* ---------- accordions ---------- */
  document.addEventListener('click', e => {
    const h = e.target.closest('.acc__h'); if (!h) return;
    const it = h.parentNode; const o = !it.classList.contains('is-open');
    it.classList.toggle('is-open', o); h.setAttribute('aria-expanded', String(o));
  });

  /* ---------- product card ---------- */
  const stars = (r, cls) => `<span class="stars${cls ? ' ' + cls : ''}" style="--p:${Math.round((r || 5) / 5 * 100)}%" role="img" aria-label="${t('Calificación', 'Rated')} ${r} ${t('de 5', 'out of 5')}"></span>`;
  const badge = p => p.stock === false ? `<span class="pc__badge pc__badge--out">${t('Agotado', 'Sold out')}</span>` : p.badge ? `<span class="pc__badge">${esc(p.badge[ES ? 0 : 1])}</span>` : '';
  const addBtn = (p, cls) => p.stock === false
    ? `<button type="button" class="pc__add pc__add--out ${cls || ''}" data-notify="${p.slug}">${t('Avísame', 'Notify me')}<i>+</i></button>`
    : `<button type="button" class="pc__add ${cls || ''}" data-add="${p.slug}" aria-label="${t('Agregar', 'Add')} ${esc(G.nm(p))} ${t('al carrito', 'to cart')}">${t('Agregar', 'Add to Bag')}<i>+</i></button>`;
  function card(p, mode) {
    const bul = (p[G.LANG] && p[G.LANG].bullets || []).slice(0, 3);
    return `<article class="pc">
      <a class="pc__lnk" href="${G.pdp(p)}" aria-label="${esc(G.nm(p))}"></a>${badge(p)}
      <div class="pc__img"><img src="${cut(p)}" alt="${esc(G.nm(p))}" loading="lazy" width="185" height="185"></div>
      <div class="pc__rate">${stars(p.rating)}<span>(${p.count})</span></div>
      <a class="pc__t" href="${G.pdp(p)}">${esc(G.nm(p))}</a>
      ${mode === 'col' ? `<p class="pc__tag">${esc(G.L(p, 'short'))}</p>` : `<ul class="pc__bul">${bul.map(b => `<li>${esc(b)}</li>`).join('')}</ul>`}
      <div class="pc__ft"><span class="pc__pr">${money(p.price)}${p.compare ? `<s>${money(p.compare)}</s>` : ''}</span>${addBtn(p)}</div>
    </article>`;
  }

  /* ---------- rails: drag + mobile progress ---------- */
  function rail(vp) {
    let down = false, sx = 0, sl = 0, moved = false;
    vp.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = vp.scrollLeft; vp.style.scrollSnapType = 'none'; });
    addEventListener('pointermove', e => { if (!down) return; const d = e.clientX - sx; if (Math.abs(d) > 4) moved = true; vp.scrollLeft = sl - d; });
    addEventListener('pointerup', () => { if (!down) return; down = false; vp.style.scrollSnapType = ''; });
    vp.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    vp.addEventListener('dragstart', e => e.preventDefault());
    const bar = vp.parentNode.querySelector('[data-rail-thumb]');
    if (bar) {
      const upd = () => { const tw = bar.parentNode.clientWidth; const w = Math.max(30, tw * vp.clientWidth / vp.scrollWidth); bar.style.width = w + 'px'; const max = vp.scrollWidth - vp.clientWidth; bar.style.transform = `translateX(${max > 0 ? (tw - w) * vp.scrollLeft / max : 0}px)`; };
      vp.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); setTimeout(upd, 50);
    }
  }
  const initRails = () => $$('[data-rail]').forEach(rail);

  /* ---------- HOME ---------- */
  if (page === 'home') {
    const best = G.P.filter(p => p.stock !== false);
    $('[data-cards="best"]').innerHTML = best.map(p => card(p)).join('');
    const vp = $('[data-rail="team"]'), tiles = $$('.ttile', vp), nums = $('[data-team-nums]'), prog = $('[data-team-prog]');
    nums.innerHTML = tiles.map((_, i) => `<button type="button" aria-label="${t('Ir a', 'Go to')} ${i + 1}">${String(i + 1).padStart(2, '0')}</button>`).join('');
    const btns = $$('button', nums);
    btns.forEach((b, i) => b.addEventListener('click', () => vp.scrollTo({ left: tiles[i].offsetLeft - tiles[0].offsetLeft, behavior: 'smooth' })));
    const upd = () => { const max = vp.scrollWidth - vp.clientWidth; const f = max > 0 ? vp.scrollLeft / max : 0; const k = Math.round(f * (tiles.length - 1)); btns.forEach((b, i) => b.classList.toggle('is-on', i === k)); prog.style.width = (100 / tiles.length) + '%'; prog.style.transform = `translateX(${k * 100}%)`; };
    vp.addEventListener('scroll', upd, { passive: true }); upd();
    initRails();
  }

  /* ---------- COLLECTION ---------- */
  if (page === 'coleccion') {
    const grid = $('[data-grid]'), empty = $('[data-empty]');
    const catBox = $('[data-fcat]');
    catBox.innerHTML = G.cats.map(c => `<label class="fopt"><input type="checkbox" value="${c.id}" data-fc><span>${esc(c[G.LANG])} <small>(${byCat(c.id).length})</small></span></label>`).join('');
    const pc = params.get('c'), q = params.get('q');
    if (pc) { const i = $(`[data-fc][value="${pc}"]`); if (i) i.checked = true; }
    if (q) { const hq = $('#hd-q'); if (hq) hq.value = q; }
    const sortEls = [$('[data-sort]'), $('[data-msort]')];
    const render = () => {
      const cs = $$('[data-fc]:checked').map(i => i.value), fs = $$('[data-ffmt]:checked').map(i => i.value), st = $('[data-fstock]').checked;
      const sort = sortEls[0].value;
      let list = G.P.filter(p => (!cs.length || cs.includes(p.cat)) && (!fs.length || fs.includes(caps(p) ? 'caps' : 'polvo')) && (!st || p.stock !== false));
      if (q) { const k = norm(q).split(/\s+/); list = list.filter(p => { const h = norm([p.name, p.name_en, catName(p.cat), G.L(p, 'tag'), G.L(p, 'short')].join(' ')); return k.every(w => h.includes(w)); }); }
      if (sort === 'rating') list = list.slice().sort((a, b) => b.rating - a.rating || b.count - a.count);
      if (sort === 'asc') list = list.slice().sort((a, b) => a.price - b.price);
      if (sort === 'desc') list = list.slice().sort((a, b) => b.price - a.price);
      if (sort === 'pop') list = list.slice().sort((a, b) => (a.stock === false) - (b.stock === false));
      grid.innerHTML = list.map(p => card(p, 'col')).join(''); empty.hidden = !!list.length;
      const one = cs.length === 1 ? G.cats.find(c => c.id === cs[0]) : null;
      const title = q ? `${t('Resultados para', 'Results for')} “${q}”` : one ? one[G.LANG] : t('Todos los productos', 'Shop All');
      $('[data-col-h]').textContent = title; $('[data-crumb]').textContent = title;
      $('[data-col-d]').textContent = one ? one[G.LANG + '_d'] : q ? `${list.length} ${t('productos', 'products')}` : t('Nueve fórmulas, cada una con la dosis por porción en la etiqueta.', 'Nine formulas, each with the dose per serving on the label.');
      document.title = `${title} — God’s Nutrition`;
    };
    document.addEventListener('change', e => {
      if (e.target.matches('[data-sort],[data-msort]')) sortEls.forEach(s => { s.value = e.target.value; });
      if (e.target.closest('[data-filters]') || e.target.matches('[data-sort]')) render();
    });
    $$('.fgrp__h').forEach(h => h.addEventListener('click', () => { const g = h.parentNode; g.classList.toggle('is-open'); h.setAttribute('aria-expanded', String(g.classList.contains('is-open'))); }));
    const side = $('[data-filters]'), fbtn = $('[data-fopen]');
    const sheet = v => { side.classList.toggle('is-open', v); fbtn.setAttribute('aria-expanded', String(v)); document.documentElement.classList.toggle('gn-lock', v); };
    fbtn.addEventListener('click', () => sheet(true));
    $$('[data-fclose]').forEach(b => b.addEventListener('click', () => sheet(false)));
    render();
  }

  /* ---------- PDP ---------- */
  if (page === 'producto') {
    const p = G.bySlug[params.get('p')] || G.P[0];
    const LBL = { 'gods-whey-protein': 'informacion_nutrimental', 'gods-creatine-1kg': 'Creatine1kg', creatina: 'Creatine500_2', ares: 'Ares3', 'gods-omega-3': 'Omega3', 'preventa-gods-demeter-450g': 'DEMETER', 'gods-ceres-450g-p': 'gods-CERES-1', 'gods-full-protein-5-lbs': 'Full2', 'themis-vegan-protein-1-kg': 'Themis' };
    const label = p.photos.find(x => x.includes(LBL[p.slug] || '§')) || p.photos[p.photos.length - 1];
    const MOMENT = { 'gods-whey-protein': 'texture-scoop.jpg', 'gods-creatine-1kg': 'creatine-fruit.jpg', creatina: 'creatine-fruit.jpg', ares: 'ares-dark.jpg', 'gods-omega-3': 'omega-softgels.jpg', 'gods-full-protein-5-lbs': 'stack.jpg', 'themis-vegan-protein-1-kg': 'hero-lineup.jpg', 'preventa-gods-demeter-450g': 'hero-lineup.jpg', 'gods-ceres-450g-p': 'hero-lineup.jpg' };
    const PAIR = { 'gods-whey-protein': 'gods-full-protein-5-lbs', 'gods-full-protein-5-lbs': 'gods-whey-protein', 'themis-vegan-protein-1-kg': 'gods-whey-protein', 'gods-creatine-1kg': 'creatina', creatina: 'gods-creatine-1kg', ares: 'gods-creatine-1kg', 'gods-omega-3': 'gods-ceres-450g-p', 'gods-ceres-450g-p': 'gods-omega-3', 'preventa-gods-demeter-450g': 'gods-omega-3' };
    const FBT = { 'gods-whey-protein': ['gods-creatine-1kg', 'ares'], 'gods-creatine-1kg': ['gods-whey-protein', 'ares'], creatina: ['gods-whey-protein', 'ares'], ares: ['gods-creatine-1kg', 'gods-whey-protein'] };
    const nm = G.nm(p), d = p[G.LANG] || p.es;
    document.title = `${nm} — God’s Nutrition`;
    const md = $('meta[name=description]'); if (md) md.content = G.L(p, 'short');
    $('[data-p-crumb]').textContent = nm;
    const flv = p.flavors || [];
    let cur = flv.find(f => f.stock && f.img && f.img === p.img[0]) || flv.find(f => f.stock) || flv[0] || null;
    let qty = 1;
    const fname = f => f ? (f[G.LANG] || f.es) : (d.size || '');

    // gallery
    const slides = [];
    const seen = new Set();
    const push = (src, kind) => { if (!src || seen.has(src)) return; seen.add(src); slides.push({ src: A(webp(src)), kind }); };
    push(cur && cur.img ? cur.img : p.img[0], 'cut');
    p.img.forEach(s => push(s, 'cut'));
    p.photos.forEach(s => push(s, 'ph'));
    const track = $('[data-gal-track]'), thumbs = $('[data-gal-thumbs]');
    track.innerHTML = slides.map((s, i) => `<div class="gal__sl gal__sl--${s.kind}"><img src="${s.src}" alt="${esc(nm)} — ${i + 1}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}></div>`).join('');
    thumbs.innerHTML = slides.map((s, i) => `<button type="button" class="gal__th${i ? '' : ' is-on'}" aria-label="${t('Imagen', 'Image')} ${i + 1}"><img src="${s.src}" alt="" loading="lazy"></button>`).join('');
    const dots = document.createElement('div'); dots.className = 'gal__dots'; dots.setAttribute('aria-hidden', 'true'); dots.innerHTML = slides.map((_, i) => `<i${i ? '' : ' class="is-on"'}></i>`).join(''); $('[data-gal]').appendChild(dots);
    let gi = 0;
    const desk = () => matchMedia('(min-width: 1024px)').matches;
    const show = i => {
      gi = (i + slides.length) % slides.length;
      if (desk()) { track.style.transform = `translateX(${-track.parentNode.clientWidth * gi}px)`; const tt = $('.gal__ttrack'); const step = 90, vis = Math.floor(tt.parentNode.clientWidth / step); tt.style.transform = `translateX(${-Math.max(0, Math.min(gi - vis + 2, slides.length - vis)) * step}px)`; }
      else { const vp = track.parentNode; vp.scrollTo({ left: track.children[gi].offsetLeft, behavior: 'smooth' }); }
      $$('.gal__th', thumbs).forEach((b, k) => b.classList.toggle('is-on', k === gi));
      $$('i', dots).forEach((b, k) => b.classList.toggle('is-on', k === gi));
    };
    thumbs.addEventListener('click', e => { const b = e.target.closest('.gal__th'); if (b) show($$('.gal__th', thumbs).indexOf(b)); });
    $('[data-gal-prev]').addEventListener('click', () => show(gi - 1));
    $('[data-gal-next]').addEventListener('click', () => show(gi + 1));
    addEventListener('resize', () => show(gi));
    const tags = [p.stock === false ? t('Agotado', 'Sold out') : p.badge ? p.badge[ES ? 0 : 1] : t('Ciencia · Pureza · Calidad', 'Science · Purity · Quality'), catName(p.cat), d.size].filter(Boolean);
    $('[data-gal-tags]').innerHTML = tags.map(x => `<span>${esc(x)}</span>`).join('');

    // buy box
    $('[data-p-rate]').innerHTML = `${stars(p.rating)}<span>(${p.count})</span>`;
    $('[data-p-name]').textContent = nm;
    const serv = p.servings;
    $('[data-p-serv]').innerHTML = serv ? `<b>${serv} ${caps(p) && p.slug === 'ares' ? t('cápsulas por envase', 'capsules per bottle') : t('porciones por envase', 'servings per container')}:</b> $${(p.price / (p.slug === 'ares' ? serv : serv)).toFixed(2)}/${p.slug === 'ares' ? t('cápsula', 'capsule') : t('porción', 'serving')}` : '';
    $('[data-p-sub]').textContent = d.short || '';
    $('[data-p-bul]').innerHTML = (d.bullets || []).slice(0, 3).map(b => `<li>${esc(b)}</li>`).join('');
    const flvBox = $('[data-p-flv]');
    const renderFlv = () => {
      if (!flv.length) { flvBox.innerHTML = ''; return; }
      flvBox.innerHTML = `<p class="buy__lbl">${t('Elige sabor', 'Select Flavor')}: <b data-flv-name>${esc(fname(cur))}</b></p><div class="chips" role="radiogroup" aria-label="${t('Sabor', 'Flavor')}">${flv.map(f => `<button type="button" role="radio" class="chip${f === cur ? ' is-on' : ''}${f.stock ? '' : ' is-out'}" aria-checked="${f === cur}" data-vid="${f.vid}">${esc(fname(f))}${f.stock ? '' : ` · ${t('agotado', 'sold out')}`}</button>`).join('')}</div>`;
    };
    flvBox.addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      cur = flv.find(f => String(f.vid) === b.dataset.vid); renderFlv(); renderAtc();
      if (cur.img) { const im = $('img', track.children[0]); im.src = A(webp(cur.img)); $('img', thumbs.children[0]).src = im.src; show(0); }
    });
    const SIZES = { 'gods-creatine-1kg': ['gods-creatine-1kg', 'creatina'], creatina: ['gods-creatine-1kg', 'creatina'] };
    const sz = (SIZES[p.slug] || [p.slug]).map(s => G.bySlug[s]);
    $('[data-p-size]').innerHTML = `<p class="buy__lbl" style="margin-top:24px">${t('Tamaño', 'Size')}: <b>${esc(d.size)}</b></p><div class="sizes">${sz.map(q => `<a class="size${q === p ? ' is-on' : ''}" href="${G.pdp(q)}"${q === p ? ' aria-current="true"' : ''}><img src="${cut(q, q.slug === 'creatina' ? 0 : 0)}" alt="">${esc((q[G.LANG] || q.es).size)}</a>`).join('')}</div>`;
    $('[data-p-opt]').innerHTML = p.stock === false ? `<p class="buy__out">${t('Agotado por ahora. Déjanos tus datos y te avisamos cuando vuelva.', 'Sold out for now. Leave your details and we’ll let you know when it’s back.')}</p>` :
      `<div class="opt__box"><div class="opt__top"><span class="opt__ck" aria-hidden="true"></span><b>${t('Compra única', 'One-time purchase')}</b><span class="opt__pr">${money(p.price)}</span></div><ul class="opt__perks"><li>${t('Envío gratis desde $400', 'Free shipping from $400')}</li><li>${t('15% de descuento en tu carrito desde $2,399', '15% off your cart from $2,399')}</li><li>${t('20% de descuento desde $2,999', '20% off from $2,999')}</li><li>${t('Mercado Pago, OXXO o hasta 12 pagos', 'Mercado Pago, OXXO or up to 12 payments')}</li></ul></div>`;
    const atcHTML = (sticky) => {
      const out = p.stock === false || (cur && !cur.stock);
      if (out) return `<button type="button" class="atc__btn atc__btn--out" style="border-radius:4px" data-notify="${p.slug}">${t('Avísame cuando vuelva', 'Notify me when it’s back')}</button>`;
      return `<div class="qty"><button type="button" data-qd="-1" aria-label="${t('Quitar uno', 'Remove one')}">−</button><span data-qn>${qty}</span><button type="button" data-qd="1" aria-label="${t('Agregar uno', 'Add one')}">+</button></div><button type="button" class="atc__btn" data-add="${p.slug}"${cur ? ` data-vid="${cur.vid}"` : ''} data-qty="${qty}">${sticky ? t('Agregar', 'Add to Bag') : t('Agregar al carrito', 'Add to Bag')}<b>${money(p.price * qty)}</b></button>`;
    };
    const renderAtc = () => {
      $('[data-atc]').innerHTML = atcHTML(false);
      $('[data-satc-in]').innerHTML = `<div class="satc__p"><img src="${cur && cur.img ? A(webp(cur.img)) : cut(p)}" alt=""><div><div class="satc__n">${esc(nm)}</div><div class="satc__f">${esc(fname(cur))}</div></div></div><div class="satc__a atc">${atcHTML(true)}</div>`;
      const fl = $('[data-flv-name]'); if (fl) fl.textContent = fname(cur);
    };
    document.addEventListener('click', e => { const b = e.target.closest('[data-qd]'); if (!b) return; qty = Math.max(1, Math.min(20, qty + +b.dataset.qd)); renderAtc(); });
    renderFlv(); renderAtc();

    // frequently bought together
    const fb = (FBT[p.slug] || ['gods-whey-protein', 'gods-creatine-1kg']).filter(s => s !== p.slug).map(s => G.bySlug[s]).filter(q => q && q.stock !== false);
    $('[data-fbt]').innerHTML = fb.map(q => `<div class="fcard"><img src="${cut(q)}" alt="" loading="lazy"><div><a href="${G.pdp(q)}">${esc(G.nm(q))}</a><p>${money(q.price)}</p>${addBtn(q)}</div></div>`).join('');

    // story + accordion
    $('[data-p-story-h]').textContent = d.tag ? `${d.tag}.` : nm;
    $('[data-p-story-p]').textContent = `${d.short || ''} ${t('La dosis por porción está impresa en la etiqueta: ve la tabla nutrimental completa aquí al lado.', 'The dose per serving is printed on the label: see the full nutrition table right here.')}`;
    const facts = (p.facts || []).map(f => `<tr><td>${esc(f[G.LANG] || f.es)}</td><td>${esc(f.v)}</td></tr>`).join('');
    const items = [
      [t('Información nutrimental', 'Supplement facts'), `<div class="nlab">${label ? `<img src="${A(label)}" alt="${t('Etiqueta nutrimental de', 'Nutrition label of')} ${esc(nm)}" loading="lazy" data-zoom>` : ''}<div><table class="ftab"><tbody>${facts}</tbody></table><p style="margin-top:12px;font-size:14px">${t('Por porción', 'Per serving')} · ${esc(d.size || '')}</p></div></div>`],
      [t('Ingredientes', 'Ingredients'), `<p>${esc(d.ingredients || '')}</p>`],
      [t('Modo de uso', 'How to use'), `<p>${esc(d.how || '')}</p>`],
      [t('Advertencias y leyendas', 'Warnings and legends'), `${d.warn ? `<p class="warn">${esc(d.warn)}</p>` : ''}<p>${t('Este producto no es un medicamento y es responsabilidad de quien lo recomienda y de quien lo usa.', 'This product is not a medicine; responsibility lies with whoever recommends it and whoever uses it.')}</p><p>${t('Imágenes con fines exclusivos para venta.', 'Images for sales purposes only.')}</p>`]
    ];
    if (d.warn) { const w = items.pop(); items.splice(1, 0, w); }
    $('[data-p-acc]').innerHTML = items.map((it, i) => `<div class="acc__i${i ? '' : ' is-open'}"><button type="button" class="acc__h" aria-expanded="${!i}">${it[0]}<span class="pm" aria-hidden="true"></span></button><div class="acc__p"><div>${it[1]}</div></div></div>`).join('');
    document.addEventListener('click', e => { const z = e.target.closest('[data-zoom]'); if (z) open(z.src, '_blank', 'noopener'); });

    // comparison (God's formats only)
    const q = G.bySlug[PAIR[p.slug]] || G.P.find(x => x !== p);
    const dq = q[G.LANG] || q.es;
    const key = x => (x.facts && x.facts[0]) ? `${x.facts[0].v}` : '';
    const keyL = x => (x.facts && x.facts[0]) ? (x.facts[0][G.LANG] || x.facts[0].es) : '';
    const unit = x => x.slug === 'ares' ? t('cápsula', 'capsule') : t('porción', 'serving');
    const rows = [
      [money(p.price), t('Precio', 'Price'), money(q.price), t('Precio', 'Price')],
      [String(p.servings), p.slug === 'ares' ? t('Cápsulas', 'Capsules') : t('Porciones', 'Servings'), String(q.servings), q.slug === 'ares' ? t('Cápsulas', 'Capsules') : t('Porciones', 'Servings')],
      [`$${(p.price / p.servings).toFixed(2)}`, `${t('Por', 'Per')} ${unit(p)}`, `$${(q.price / q.servings).toFixed(2)}`, `${t('Por', 'Per')} ${unit(q)}`],
      [key(p), `${keyL(p)} ${t('por', 'per')} ${unit(p)}`, key(q), `${keyL(q)} ${t('por', 'per')} ${unit(q)}`],
      [d.tag || '', t('Fórmula', 'Formula'), dq.tag || '', t('Fórmula', 'Formula')]
    ];
    $('[data-cmp-h]').textContent = t('¿Qué formato es para ti?', 'Which format fits you?');
    $('[data-cmp-p]').textContent = t(`${nm} junto a ${G.nm(q)}: mismo estándar de etiqueta, distinta presentación. Compara rendimiento y precio.`, `${nm} next to ${G.nm(q)}: the same label standard, a different format. Compare yield and price.`);
    $('[data-cmp-tab]').innerHTML = `<div class="ctab__r ctab__hd"><div>${esc(nm)}</div><div><a href="${G.pdp(q)}" style="color:inherit">${esc(G.nm(q))}</a></div></div>` + rows.map(r => `<div class="ctab__r"><div class="ctab__c"><b>${esc(r[0])}</b><span>${esc(r[1])}</span></div><div class="ctab__c"><b>${esc(r[2])}</b><span>${esc(r[3])}</span></div></div>`).join('');
    const ci = $('[data-cmp-img]'); ci.src = A('assets/photo/' + (MOMENT[p.slug] || 'hero-lineup.jpg')); ci.alt = nm;
    $('[data-cmp-chips]').innerHTML = `<span>${esc(nm)}</span><span>${esc(d.size || '')}</span>`;

    // build your stack rail
    $('[data-cards="stack"]').innerHTML = G.P.filter(x => x !== p && x.stock !== false).map(x => card(x)).join('');

    // FAQ
    const faq = [
      [t('¿Cómo se toma?', 'How do I take it?'), d.how],
      [t('¿Cuántas porciones trae?', 'How many servings are in it?'), t(`${p.servings} ${p.slug === 'ares' ? 'cápsulas' : 'porciones'} por envase (${d.size}).`, `${p.servings} ${p.slug === 'ares' ? 'capsules' : 'servings'} per container (${d.size}).`)],
      [t('¿Qué ingredientes lleva?', 'What are the ingredients?'), d.ingredients],
      [t('¿Cuánto tarda el envío?', 'How long does shipping take?'), t('Según nuestros clientes, los pedidos llegan en 2 a 3 días hábiles. Enviamos a todo México y el envío es gratis desde $400.', 'According to our customers, orders arrive in 2 to 3 business days. We ship across Mexico and shipping is free from $400.')],
      [t('¿Cómo puedo pagar?', 'How can I pay?'), t('Con tarjeta, cuenta de Mercado Pago, efectivo en OXXO o hasta 12 pagos con Mercado Crédito. También hay 3, 6 y 9 meses sin intereses.', 'By card, Mercado Pago account, cash at OXXO or up to 12 payments with Mercado Crédito. 3, 6 and 9 interest-free months are available too.')],
      [t('¿Hay descuento por volumen?', 'Is there a volume discount?'), t('Sí: tu carrito aplica 15% de descuento desde $2,399 y 20% desde $2,999.', 'Yes: your cart applies 15% off from $2,399 and 20% from $2,999.')]
    ].filter(x => x[1]);
    $('[data-faq]').innerHTML = faq.map((f, i) => `<div class="acc__i${i ? '' : ' is-open'}"><button type="button" class="acc__h" aria-expanded="${!i}">${esc(f[0])}<span class="pm" aria-hidden="true"></span></button><div class="acc__p"><div><p>${esc(f[1])}</p></div></div></div>`).join('');

    // reviews (real, verbatim)
    const rv = (p.reviews || []).slice().sort((a, b) => (b.d || '').localeCompare(a.d || ''));
    const hist = [5, 4, 3, 2, 1].map(s => [s, rv.filter(r => Math.round(r.r) === s).length]);
    $('[data-rev-sum]').innerHTML = `<div class="rsum"><div class="rsum__big"><b>${p.rating}</b>${stars(p.rating, 'stars--l')}</div><p>${t('Basado en', 'Based on')} ${p.count} ${t('reseñas en godsnutrition.com.mx', 'reviews on godsnutrition.com.mx')}</p>${rv.length ? `<div class="hist" aria-label="${t('Distribución de las reseñas publicadas aquí', 'Distribution of the reviews shown here')}">${hist.map(h => `<div><span>${h[0]}★</span><i style="--w:${rv.length ? h[1] / rv.length * 100 : 0}%"></i><span>${h[1]}</span></div>`).join('')}</div><p>${t(`Distribución de las ${rv.length} reseñas publicadas aquí.`, `Distribution of the ${rv.length} reviews shown here.`)}</p>` : ''}</div>`;
    const fmtD = s => { try { return new Date(s + 'T12:00:00').toLocaleDateString(ES ? 'es-MX' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }); } catch (e) { return s; } };
    let shown = 5;
    const list = $('[data-rev-list]'), more = $('[data-rev-more]');
    const renderRev = () => {
      list.innerHTML = rv.length ? rv.slice(0, shown).map(r => `<article class="rcard"><div class="rcard__hd">${r.ph && !r.phx ? `<img class="rcard__av" src="${A(r.ph)}" alt="" width="32" height="32" loading="lazy">` : ''}<span>${esc(r.n)}</span>${r.v ? `<span class="rcard__v">✓ ${t('Compra verificada', 'Verified purchase')}</span>` : ''}<span class="rcard__d">${fmtD(r.d)}</span></div>${stars(r.r)}<p>${esc(r.t)}</p>${!ES && r.en ? `<p class="rcard__tr">${t('', 'Translation')}: ${esc(r.en)}</p>` : ''}</article>`).join('') : `<p style="margin-top:24px">${t('Aún no hay reseñas publicadas de este producto.', 'No reviews published for this product yet.')}</p>`;
      more.hidden = shown >= rv.length;
    };
    more.addEventListener('click', () => { shown += 5; renderRev(); });
    renderRev();

    // sticky ATC: hidden while the inline ATC is visible
    const satc = $('[data-satc]'), inline = $('[data-atc]');
    if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(en => { const on = !en.isIntersecting; satc.classList.toggle('is-on', on); satc.setAttribute('aria-hidden', String(!on)); }), { rootMargin: '0px 0px -20px 0px' }).observe(inline);
    document.body.classList.add('has-satc');
    initRails();
    if (location.hash) setTimeout(() => { const el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }, 300);
  }
})();
