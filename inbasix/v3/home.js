/* Inbasix v3 — home page sections */
(function () {
  const { nm, K, B, esc, catUrl, WA, inC, byPrice, tile, media, I, tabs, ytThumb, hasVid, RM, logoOf, vendorName } = window.V3;
  const $ = s => document.querySelector(s);
  const IMG = B + 'assets/img/';

  /* virtual filters (several collections) */
  const VIRT = {
    imagenologia: { t: 'Imagenología', cols: ['tomografos', 'tomografia-pet-pet-ct', 'resonancia-magnetica', 'medicina-nuclear', 'arco-en-c', 'rayos-x-y-digitalizadores', 'mastografos', 'quirofano', 'desfibriladores-mindray', 'electrocardiografos-uso-humano'] },
    veterinario: { t: 'Veterinario', cols: ['equipo-veterinario', 'ultrasonido-veterinario'] },
  };
  const colsOf = h => VIRT[h] ? VIRT[h].cols : [h];
  const titleOf = h => VIRT[h] ? VIRT[h].t : ((K.COLS.find(c => c.h === h) || {}).t || 'Catálogo');
  const nice = t => t.charAt(0) + t.slice(1).toLowerCase().replace(/\b(mindray|samsung|youthfill|gilaser)\b/g, m => ({ mindray: 'Mindray', samsung: 'Samsung', youthfill: 'YouthFill', gilaser: 'GiLáser' }[m]));
  const cleanTitle = t => /^[A-ZÁÉÍÓÚÑ &,\-]+$/.test(t) ? nice(t) : t;

  /* ---------- 1 · hero ---------- */
  (function hero() {
    const root = $('[data-hero]'); if (!root) return;
    const slides = [...root.querySelectorAll('.hero__slide')], segs = [...root.querySelectorAll('[data-hero-seg] i')];
    const nextBtn = root.querySelector('[data-hero-next]'), nextT = root.querySelector('[data-hero-next-t]'), nextImg = nextBtn.querySelector('img');
    slides.forEach((s, i) => { const v = s.dataset.vid; if (hasVid(v) && !RM) s.querySelector('.hero__media').innerHTML = media(v, s.dataset.still, { autoplay: i === 0 }); });
    let cur = 0, paused = false;
    const pauseBtn = root.querySelector('[data-hero-pause]');
    const setPauseIcon = () => { pauseBtn.innerHTML = paused ? I.play : I.pause; pauseBtn.setAttribute('aria-label', paused ? 'Reanudar carrusel' : 'Pausar carrusel'); };
    function go(n) {
      slides[cur].classList.remove('is-on'); const ov = slides[cur].querySelector('video'); if (ov) ov.pause();
      cur = (n + slides.length) % slides.length; slides[cur].classList.add('is-on');
      const v = slides[cur].querySelector('video'); if (v) { v.currentTime = 0; v.play().catch(() => {}); }
      segs.forEach((s, i) => { s.classList.toggle('is-done', i < cur); s.classList.remove('is-on'); void s.offsetWidth; if (i === cur) s.classList.add('is-on'); });
      const nx = slides[(cur + 1) % slides.length]; nextT.textContent = nx.querySelector('.hero__h').textContent; nextImg.src = nx.dataset.still;
    }
    segs.forEach((s, i) => { s.firstElementChild.addEventListener('animationend', () => { if (i === cur) go(cur + 1); }); s.addEventListener('click', () => go(i)); });
    nextBtn.addEventListener('click', () => go(cur + 1));
    pauseBtn.addEventListener('click', () => { paused = !paused; root.classList.toggle('is-paused', paused); setPauseIcon(); const v = slides[cur].querySelector('video'); if (v) paused ? v.pause() : v.play().catch(() => {}); });
    if (RM) { paused = true; root.classList.add('is-paused'); }
    setPauseIcon();
    // swipe on touch
    let x0 = null; root.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1)); x0 = null; });
    // pause while offscreen
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { if (!paused) root.classList.toggle('is-paused', !en.isIntersecting); }).observe(root);
  })();

  /* ---------- 2 · 6-up with tabs ---------- */
  (function deals() {
    const grid = $('[data-deals]'); if (!grid) return;
    const render = h => { const k = { 'sistemas-de-diagnostico-por-ultrasonido': 'ultrasonido', 'aparatologia-estetica': 'aparatologia' }[h] || h; grid.innerHTML = byPrice(K.P.filter(p => p.img.length && window.V3.inGroup(p, k))).slice(0, 6).map(p => tile(p)).join(''); };
    const btns = [...document.querySelectorAll('[data-deal-tabs] [role=tab]')];
    tabs($('[data-deal-tabs]'), i => render(btns[i].dataset.c));
    render(btns[0].dataset.c);
  })();

  /* ---------- 3 · feature cards ---------- */
  (function feat() {
    const box = $('[data-feat]'); if (!box) return;
    const F = [
      { h: 'ultrasonido-mindray-mx7', vid: 'loop-mx7', still: B + 'assets/vid/loop-mx7.jpg', t: 'Mindray MX7 portátil', p: 'Monitor de 15.6″ Full HD, pantalla touch de 12.3″ y un peso aproximado de 3.5 kg', icon: I.cap, stat: '<b>Capacitación botón por botón</b> incluida con tu equipo' },
      { h: 'laser-co2-70w', vid: 'loop-co2', still: B + 'assets/vid/loop-co2.jpg', t: 'Láser CO2 70W Nubway', p: 'Tres sistemas en un equipo: normal, fraccionado y ginecológico, con 7 formas de escáner', icon: I.card, stat: '<b>Financiamiento</b> con aprobación en 24 horas' },
    ];
    box.innerHTML = F.map(f => { const p = K.find(f.h); if (!p) return ''; return `<article class="fcard" data-reveal>
      <a class="fcard__media" href="${K.pdp(p.h)}" tabindex="-1" aria-hidden="true">${media(f.vid, f.still, { alt: '' })}<span class="fcard__price">${esc(vendorName(p.vendor))} | <b>${K.priceLabel(p)}</b></span></a>
      <div class="fcard__body"><h3>${esc(f.t)}</h3><p>${esc(f.p)}</p><a class="btn btn--cyan" href="${K.pdp(p.h)}">Ver ${esc(f.t.replace(/ (portátil|Nubway)$/, ''))}</a></div>
      <div class="fcard__stat"><span class="ic-circle">${f.icon}</span><span>${f.stat}</span></div></article>`; }).join('');
  })();

  /* ---------- 4 · quick links ---------- */
  (function ql() {
    const box = $('[data-ql]'); if (!box) return;
    const Q = [['ultrasonido', 'Ultrasonido', 'ultrasonido-mindray-mx7', 'ultrasonido'], ['aparatologia', 'Aparatología estética', 'hifu', 'aparatologia'], ['fillers', 'Fillers', null, 'fillers'], ['imagenologia', 'Imagenología', null, 'imagenologia'], ['veterinario', 'Veterinario', null, 'veterinario'], ['transductores', 'Transductores', null, null]];
    box.innerHTML = Q.map(([h, t, ph, tileImg]) => { const list = K.P.filter(x => x.img.length && window.V3.inGroup(x, h)); const p = (ph && K.find(ph)) || list[0]; const n = list.length;
      return `<a href="${catUrl(h)}">${tileImg ? `<img class="ql-tile" src="${B}assets/photo/tiles/${tileImg}-1x1.webp" alt="" loading="lazy">` : p && p.img[0] ? `<img src="${K.img(p.img[0], 160)}" alt="" loading="lazy">` : ''}<span>${esc(t)}<small>${n} productos</small></span>${I.arrow}</a>`; }).join('');
  })();

  /* ---------- 5 · 4-up ---------- */
  (function four() {
    const box = $('[data-four]'); if (!box) return;
    const list = inC('nubway').filter(p => !K.isQuote(p));
    const pick = ['laser-co2-70w', 'microneedle', 'hifu-mini', 'laser-picosecond'].map(K.find).filter(Boolean);
    box.innerHTML = (pick.length === 4 ? pick : list.slice(0, 4)).map(p => tile(p)).join('');
    box.classList.add('hscroll-m');
  })();

  /* ---------- 8 · reels ---------- */
  (function reels() {
    const box = $('[data-reels]'); if (!box) return;
    const R = [
      ['reel-mx7', 'Mindray MX7', 'Ultrasonido portátil', '0bcbN-HI8zE'],
      ['reel-consona-n5', 'Mindray Consona N5', 'Ultrasonido de gabinete', 'sLLEWXz6RvA'],
      ['reel-codestetica', 'Láser CO2', 'Aparatología estética', '1e9kIhxFd2Q'],
      ['reel-fillers', 'Aplicación de fillers', 'Fillers', 'MLVawVdwYAc'],
      ['reel-mx3', 'Mindray MX3', 'Ultrasonido portátil', 'kHGrDOZO3nY'],
      ['reel-congreso-gdl', 'Congreso en Guadalajara', 'Inbasix en congresos', 'M4vJD808YYY'],
      ['reel-dp30', 'Mindray DP-30', 'Ultrasonido portátil', 'rVh31LkO9Ec'],
    ];
    const have = R.filter(r => hasVid(r[0]));
    const list = (have.length >= 4 ? have : R).slice(0, 4);
    box.innerHTML = list.map(([v, t, s, yt]) => hasVid(v) && !RM
      ? `<figure class="reel" data-reveal><div class="reel__v"><video muted playsinline loop preload="none" poster="${B}assets/vid/${v}.jpg" data-inview src="${B}assets/vid/${v}.mp4"></video><button type="button" class="reel__snd" data-snd aria-label="Activar sonido">${I.mute}</button></div><figcaption><small>${esc(s)}</small>${esc(t)}</figcaption></figure>`
      : `<figure class="reel" data-reveal><button type="button" class="ytf" data-ytm-open="${yt}" aria-label="Ver video: ${esc(t)}" style="position:absolute;inset:0"><img src="${ytThumb(yt)}" alt="" loading="lazy" style="object-position:center"><span class="pl">${I.play}</span></button><figcaption><small>${esc(s)}</small>${esc(t)}</figcaption></figure>`).join('');
  })();

  /* ---------- 9 · brands ---------- */
  (function brands() {
    const res = $('[data-res]');
    if (res) {
      const cnt = v => K.P.filter(p => p.vendor === v).length;
      const B3 = [['Mindray', 'equipo-de-ultrasonido-mindray', `<b>Ultrasonido portátil y de gabinete</b>, transductores y accesorios originales. ${cnt('Mindray')} productos Mindray en catálogo`],
        ['SAMSUNG', 'equipo-de-ultrasonido-samsung', `<b>Ultrasonido Samsung para ginecología</b>, de gabinete y portátil. ${cnt('SAMSUNG')} equipos en catálogo`],
        ['Nubway', 'nubway', `<b>Aparatología estética</b>: láser, HIFU, criolipólisis, microagujas y más. ${cnt('Nubway')} equipos en catálogo`]];
      res.innerHTML = B3.map(([v, h, txt]) => `<div><img src="${logoOf(v)}" alt="${esc(vendorName(v))}" loading="lazy"><p>${txt}</p><a class="ul-link" href="${catUrl(h)}">Ver equipos ${esc(vendorName(v))}</a></div>`).join('');
    }
    const lg = $('[data-logos]');
    if (lg) {
      const L = [['Mindray', 'equipo-de-ultrasonido-mindray'], ['SAMSUNG', 'equipo-de-ultrasonido-samsung'], ['Nubway', 'nubway'], ['GiLáser', 'gilaser'], ['REJUBEAU', 'rejubeau'], ['GE General Electric', 'tomografos'], ['SIEMENS', 'resonancia-magnetica'], ['Philips', 'medicina-nuclear'], ['HOLOGIC', 'mastografos'], ['Toshiba', 'tomografos']];
      lg.innerHTML = `<div class="logos__track">${L.map(([v, h]) => window.V3.logoItem(v, catUrl(h))).join('')}${L.map(([v, h]) => window.V3.logoItem(v, catUrl(h), 1)).join('')}</div>`;
    }
  })();

  /* ---------- 10 · perks ---------- */
  (function perks() {
    const box = $('[data-perks]'); if (!box) return;
    const P = [[I.truck, 'Envíos a todo México', 'Entrega estimada de 3 a 10 días hábiles después de confirmado tu pedido'], [I.shield, 'Garantía de 12 meses', 'Garantía del fabricante, ampliable a 24, 36 o 48 meses, y servicio postventa'], [I.cap, 'Capacitación incluida', 'Instalación profesional y capacitación botón por botón a tu personal'], [I.card, 'Financiamiento en 24 h', 'Arrendamiento puro o crédito simple con aprobación en 24 horas']];
    box.innerHTML = P.map(([ic, t, d]) => `<div>${ic}<b>${t}</b><p>${d}</p></div>`).join('');
  })();

  /* ---------- 11 · showrooms + congresos ---------- */
  (function ret() {
    const box = $('[data-ret]'); if (!box) return;
    box.innerHTML = `<article class="rcard" data-reveal><div class="bgm" data-photo="showroom">${media('loop-showroom', B + 'assets/vid/loop-showroom.jpg', { alt: '' })}</div><div class="rcard__b">
        <div class="cities"><span>CDMX</span><span>Guadalajara</span><span>Monterrey</span><span>Chihuahua</span></div>
        <h3>Visita nuestros showrooms</h3><p>Salas de exhibición de ultrasonido, quirófano, laparoscopía, endoscopía, neonatología y aparatología estética</p>
        <a class="btn btn--cyan" href="${WA('Hola Inbasix, quiero agendar una visita a un showroom')}" target="_blank" rel="noopener">Agenda tu visita</a></div></article>
      <article class="rcard" data-reveal><div class="bgm" data-photo="congreso">${media('loop-congreso', B + 'assets/vid/loop-congreso.jpg', { alt: '' })}</div><div class="rcard__b">
        <h3>Congresos y capacitación</h3><p>Nos encuentras en congresos médicos y en nuestro canal con demostraciones de equipos</p>
        <a class="btn btn--cyan" href="https://www.youtube.com/@inbasixmedical" target="_blank" rel="noopener">Ver canal de YouTube</a></div></article>`;
  })();

  /* ---------- 12 · recompra media ---------- */
  (function iwt() { const box = $('[data-iwt]'); if (box) box.innerHTML = media('loop-samsung', B + 'assets/vid/loop-samsung.jpg', { alt: 'Equipo médico en uso' }); })();

  /* ---------- 13 · learn ---------- */
  (function learn() {
    const box = $('[data-learn]'); if (!box) return;
    const L = [['ultrasonido-mindray-consona-n9', 'M4vJD808YYY'], ['hifu', 'qCjcrInufV4'], ['ultrasonido-mindray-nuewa-i9', 'uDGo2DVzyas'], ['laser-picosecond', '0vBLX-Irgnc']];
    box.innerHTML = L.map(([h, yt]) => { const p = K.find(h); if (!p) return ''; return `<a class="bcard" href="https://www.youtube.com/watch?v=${yt}" data-ytm-open="${yt}">
      <div class="bcard__img"><img src="https://i.ytimg.com/vi/${yt}/mqdefault.jpg" alt="" loading="lazy"><span class="bcard__play"><span>${I.play}</span></span></div>
      <p class="eyebrow">Video · ${esc(vendorName(p.vendor))}</p><h3>${esc(nm(p))}</h3></a>`; }).join('');
    box.classList.add('hscroll');
  })();

  /* ---------- 14 · catalog (PLP) with ?cat= ---------- */
  (function plp() {
    const grid = $('[data-plp-grid]'); if (!grid) return;
    const chipsBox = $('[data-plp-chips]'), count = $('[data-plp-count]'), more = $('[data-plp-more]'), sortSel = $('[data-plp-sort]'), q = $('[data-plp-q]'), title = $('[data-plp-title]');
    const params = new URLSearchParams(location.search);
    let cat = params.get('cat') || 'all', sort = 'feat', shown = 12, term = params.get('q') || '';
    const BASE_CHIPS = [['all', 'Todo'], ['sistemas-de-diagnostico-por-ultrasonido', 'Ultrasonido'], ['aparatologia-estetica', 'Aparatología'], ['fillers', 'Fillers'], ['imagenologia', 'Imagenología'], ['veterinario', 'Veterinario'], ['transductores-de-uso-humano', 'Transductores'], ['accesorios', 'Accesorios']];
    const known = h => h === 'all' || VIRT[h] || K.COLS.some(c => c.h === h);
    if (!known(cat)) cat = 'all';
    const chips = () => { const c = BASE_CHIPS.slice(); if (!c.some(x => x[0] === cat)) c.splice(1, 0, [cat, cleanTitle(titleOf(cat))]); return c; };
    const listFor = h => h === 'all' ? K.P.slice() : K.P.filter(p => p.cols.some(c => colsOf(h).includes(c)));
    const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    function items() {
      let a = listFor(cat).filter(p => p.img.length);
      if (term) { const t = norm(term); a = a.filter(p => norm(p.t + ' ' + p.vendor + ' ' + p.type).includes(t)); }
      const pr = p => K.minPrice(p);
      if (sort === 'asc') a.sort((x, y) => (pr(x) ?? 1e15) - (pr(y) ?? 1e15));
      else if (sort === 'desc') a.sort((x, y) => (pr(y) ?? -1) - (pr(x) ?? -1));
      else if (sort === 'az') a.sort((x, y) => K.shortName(x).localeCompare(K.shortName(y), 'es'));
      else a = byPrice(a);
      return a;
    }
    function render(keep) {
      const a = items();
      chipsBox.innerHTML = chips().map(([h, t]) => `<button type="button" aria-pressed="${h === cat}" data-cat="${h}">${esc(t)}<small>${listFor(h).filter(p => p.img.length).length}</small></button>`).join('');
      grid.innerHTML = a.slice(0, shown).map(p => tile(p)).join('') || `<p class="t-l" style="grid-column:1/-1;padding:40px 0">No encontramos equipos con “${esc(term)}”. <a class="ul-link" href="${WA('Hola Inbasix, busco: ' + term)}" target="_blank" rel="noopener">Pregúntale a un asesor</a></p>`;
      count.textContent = `${a.length} ${a.length === 1 ? 'producto' : 'productos'}`;
      more.hidden = a.length <= shown;
      title.textContent = cat === 'all' ? 'Catálogo completo' : cleanTitle(titleOf(cat));
      if (!keep) grid.classList.remove('fade-in'), void grid.offsetWidth, grid.classList.add('fade-in');
    }
    chipsBox.addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (!b) return; cat = b.dataset.cat; shown = 12; const u = new URL(location); cat === 'all' ? u.searchParams.delete('cat') : u.searchParams.set('cat', cat); history.replaceState(null, '', u); render(); });
    sortSel.addEventListener('change', () => { sort = sortSel.value; render(); });
    more.addEventListener('click', () => { shown += 12; render(true); });
    let tq; q.value = term; q.addEventListener('input', () => { clearTimeout(tq); tq = setTimeout(() => { term = q.value.trim(); shown = 12; render(); }, 180); });
    render(true);
    if (params.get('cat') || location.hash === '#catalogo') addEventListener('load', () => { const el = $('#catalogo'); if (el) el.scrollIntoView(); });
  })();

  if (window.V3.reviews) document.querySelectorAll('[data-reviews]').forEach(window.V3.reviews);

  /* financing renders + split media (photo kit can replace via data-photo) */
  document.querySelectorAll('[data-render]').forEach(el => { const p = K.find(el.dataset.render); if (p && p.img[0]) el.insertAdjacentHTML('afterbegin', `<img src="${K.img(p.img[0], 700)}" alt="${esc(nm(p))}" loading="lazy">`); });
  document.querySelectorAll('[data-media]').forEach(el => { el.innerHTML = media(el.dataset.media, B + 'assets/vid/' + el.dataset.media + '.jpg', { alt: el.querySelector('img') ? el.querySelector('img').alt : '' }); });
  if (window.V3.photos) window.V3.photos();

  if (K.watch) K.watch();
})();
