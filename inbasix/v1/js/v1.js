/* Inbasix v1 · shared UI: header menus, mobile drawer, marquees, announcement slider, video mounting, product cards. */
(function () {
  const K = window.IBK;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const IC = {
    check: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z"/></svg>',
    tick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    mute: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a9 9 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9zM12 4 9.91 6.09 12 8.18z"/></svg>',
    snd: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
  };

  /* ---------- catalog groups (nav + ?cat=) ---------- */
  const IMG = ['tomografos', 'resonancia-magnetica', 'rayos-x-y-digitalizadores', 'arco-en-c', 'mastografos', 'medicina-nuclear', 'tomografia-pet-pet-ct'];
  const GROUPS = {
    // mapped by collection handle (never by keyword): diagnostic ultrasound only; Nubway/GiLáser live in Aparatología
    ultrasonido: { t: 'Ultrasonido', cols: ['equipo-de-ultrasonido-mindray', 'equipo-de-ultrasonido-samsung', 'ultrasonidos-de-gabinete-uso-humano', 'radiologia-portatil-humano', 'ginecologia-mindray', 'imagenes-generales-mindray', 'samsung-gabinete-ginecologia', 'ginecologia-portatil-samsung', 'estetica-portatil-humano', 'ultrasonidos-portatiles-para-ginecologia-de-uso-humano-mindray', 'ultrasonido-veterinario'] },
    aparatologia: { t: 'Aparatología estética', cols: ['aparatologia-estetica', 'nubway', 'gilaser'] },
    imagenologia: { t: 'Imagenología', cols: IMG },
    fillers: { t: 'Fillers', cols: ['fillers', 'rejubeau', 'youthfill'] },
    veterinario: { t: 'Veterinario', cols: ['equipo-veterinario', 'ultrasonido-veterinario'] },
    quirofano: { t: 'Quirófano', cols: ['quirofano'] },
    transductores: { t: 'Transductores y accesorios', cols: ['transductores-de-uso-humano', 'accesorios'] },
    cardiologia: { t: 'Cardiología', cols: ['desfibriladores-mindray', 'electrocardiografos-uso-humano'] },
  };
  const colTitle = h => (GROUPS[h] && GROUPS[h].t) || ((K.COLS.find(c => c.h === h) || {}).t) || null;
  const inGroup = (p, key) => { const g = GROUPS[key]; return g ? g.cols.some(c => p.cols.includes(c)) : p.cols.includes(key); };
  const listFor = (key, withImg) => K.P.filter(p => (key === 'all' || inGroup(p, key)) && (!withImg || p.img.length));

  /* ---------- prices ---------- */
  const fmt = n => { const r = Math.round(n * 100) / 100; return Number.isInteger(r) ? K.money0(r) : K.money(r); };
  const priceParts = n => { const s = fmt(n).slice(1); return `<span class="cur">$</span><span class="n">${s}</span>`; };
  const minVar = p => { const pv = K.priced(p); return pv.length ? pv.reduce((a, b) => (b.p < a.p ? b : a)) : null; };
  const cardVar = p => { const v = p.v.filter(v => v.p).find(v => /tarjeta 12/i.test(v.t)); return v || null; };
  const VEND = { 'GE General Electric': 'GE', 'Inbasix Medical': 'Inbasix', SAMSUNG: 'Samsung', REJUBEAU: 'Rejubeau', YOUTHFILL: 'Youthfill', SIEMENS: 'Siemens', HOLOGIC: 'Hologic' };
  const vendor = p => VEND[p.vendor] || p.vendor;

  // studio product cards from the photo kit (assets/photo/prod/<handle>.webp, PHOTOS.md §C); falls back to the store render
  const CUTS = new Set(["acido-hialuronico-ha-stylish-plus-200", "acido-hialuronico-youthfill-deep", "acido-poli-l-lactico-le-ciel-rosy", "aqua-bomb", "body-sculptor-gilaser", "cryolipolisis-360-nubway", "dax-exosoma-ampolleta-de-rejuvenecimiento", "hi-skin-9-en-1", "hifu-mini", "ipl-elight", "laser-co2-70w", "laser-diodo-quattro", "laser-picosecond", "laser-tri-diodo-mini-nubway", "microneedle-mini", "plasma-tech", "sculpt-muscle-nubway", "ultrasonido-hera-w10", "ultrasonido-mindray-consona-n5", "ultrasonido-mindray-dc30-gin", "ultrasonido-mindray-dc40-full-hd-incluye-transductor-volumetrico-vaginal-convexo", "ultrasonido-mindray-dp-20", "ultrasonido-mindray-mx3-gin", "ultrasonido-mindray-mx7"]);
  const cardImg = (p, w) => CUTS.has(p.h) ? K.BASE + 'assets/photo/prod/' + p.h + '.webp' : K.img(p.img[0], w);
  function card(p) {
    const q = K.isQuote(p), mv = minVar(p), multi = K.priced(p).length > 1;
    const perk = /filler/i.test(p.type) || p.cols.includes('fillers') ? 'Envíos a todo México' : 'Garantía de fábrica y capacitación';
    return `<article class="pc">
      <a class="pc-link" href="${K.pdp(p.h)}" aria-label="${esc(K.shortName(p))}"></a>
      <div class="pc-badges"><span class="k">${esc(vendor(p))}</span><span class="y">${q ? 'A cotizar' : esc(p.type)}</span></div>
      <div class="pc-img">${p.img.length ? `<img src="${cardImg(p, 480)}" alt="${esc(K.shortName(p))}" loading="lazy">` : `<img class="ph" src="../assets/brand/logo-navy.png" alt="" loading="lazy">`}</div>
      <div class="pc-b">
        <h3 class="pc-t">${esc(K.shortName(p))}</h3>
        <p class="pc-cat">${IC.tick}<b>${perk}</b></p>
        ${q ? `<p class="pc-pr"><span class="q">Precio bajo cotización</span></p><span class="pc-tag">Propuesta formal en menos de 24 h</span>`
            : `<p class="pc-pr">${multi ? '<span class="from">Desde</span>' : ''}${priceParts(mv.p)}</p><span class="pc-tag">*Precio en pesos mexicanos</span>`}
        <div class="pc-sp"></div>
        <button class="btn-y pc-cta" type="button" data-add="${p.h}"${mv ? ` data-vid="${mv.id}"` : ''}>${q ? 'Cotizar' : 'Agregar al carrito'}</button>
      </div></article>`;
  }

  /* ---------- video availability (one directory listing request; no 404 noise) ---------- */
  // All planned files exist in assets/vid (see MEDIA.md); no directory probe (static hosts 404 on folder URLs).
  const VIDS = Promise.resolve(null);
  const has = (set, f) => !set || set.has(f);
  function makeVideo(name, set, opts) {
    const v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('loop', '');
    if (!opts || !opts.manual) v.setAttribute('data-inview', '');
    if (has(set, name + '.jpg')) v.poster = K.BASE + 'assets/vid/' + name + '.jpg';
    v.src = K.BASE + 'assets/vid/' + name + '.mp4';
    v.setAttribute('aria-hidden', 'true');
    return v;
  }
  async function mountVideos(root) {
    const set = await VIDS;
    $$('[data-v]', root).forEach(box => {
      if (box.dataset.vDone) return; box.dataset.vDone = 1;
      let name = box.dataset.v;
      if (box.dataset.vm && matchMedia('(max-width:768px)').matches) name = box.dataset.vm;
      if (!has(set, name + '.mp4')) { if (name !== box.dataset.v && has(set, box.dataset.v + '.mp4')) name = box.dataset.v; else return; }
      if (RM.matches && !has(set, name + '.jpg')) return; // reduced motion: keep still fallback image
      const fb = box.querySelector('img');
      const v = makeVideo(name, set);
      if (RM.matches) { v.removeAttribute('data-inview'); v.preload = 'none'; v.autoplay = false; }
      v.addEventListener('loadeddata', () => { if (fb) fb.remove(); }, { once: true });
      v.addEventListener('error', () => v.remove(), { once: true });
      box.appendChild(v);
    });
    K.watch(root || document);
  }

  /* ---------- reels ---------- */
  const REELS = [
    { v: 'reel-mx7', t: 'Mindray MX7', tag: 'productos', k: ['mx7', 'ultrasonido'] },
    { v: 'reel-consona-n5', t: 'Mindray Consona N5', tag: 'productos', k: ['consona', 'ultrasonido'] },
    { v: 'reel-congreso-gdl', t: 'Congreso Face & Body, Guadalajara', tag: 'congresos', k: ['congreso', 'co2', 'aparatologia'] },
    { v: 'reel-fillers', t: 'Fillers Rejubeau en congreso', tag: 'productos', k: ['fillers', 'rejubeau', 'hialur', 'lactico'] },
    { v: 'reel-mx3', t: 'Mindray MX3', tag: 'productos', k: ['mx3', 'ultrasonido'] },
    { v: 'reel-codestetica', t: 'Inbasix en Codestética CDMX', tag: 'congresos', k: ['aparatologia', 'nubway', 'laser'] },
    { v: 'reel-dp30', t: 'Mindray DP-30', tag: 'productos', k: ['dp30', 'ultrasonido'] },
  ];
  async function reelCards(list) {
    const set = await VIDS;
    const POST = K.BASE + 'v1/media/';
    return list.filter(r => has(set, r.v + '.mp4')).map(r => {
      const el = document.createElement('article');
      el.className = 'mi rv'; el.dataset.tag = r.tag; el.tabIndex = 0; el.setAttribute('role', 'button');
      el.setAttribute('aria-label', 'Reproducir video: ' + r.t);
      el.innerHTML = `<img src="${POST + r.v}.jpg" alt="${esc(r.t)}" loading="lazy"><span class="rv-play">${IC.play}</span>`;
      let v = null;
      const toggle = () => {
        if (!v) {
          v = document.createElement('video'); v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto';
          v.poster = POST + r.v + '.jpg'; v.src = K.BASE + 'assets/vid/' + r.v + '.mp4';
          v.addEventListener('ended', () => el.classList.remove('is-snd'));
          el.insertBefore(v, el.firstChild); el.querySelector('img').remove();
        }
        const on = v.paused;
        $$('.rv.is-snd').forEach(o => { if (o !== el) { o.classList.remove('is-snd'); const ov = o.querySelector('video'); if (ov) ov.pause(); } });
        el.classList.toggle('is-snd', on);
        if (on) v.play().catch(() => {}); else v.pause();
      };
      el.addEventListener('click', toggle);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
      return el;
    });
  }

  /* ---------- customer reviews (assets/people/reviews.js · placeholder render, client replaces) ---------- */
  const RV = window.IB_REVIEWS || [], PL = window.IB_REVIEW_PLATFORMS || {};
  const ICONS = { google: 'google-g.svg', facebook: 'facebook.svg', trustpilot: 'trustpilot-star.svg' };
  const WORD = { google: 'google-wordmark.svg', facebook: 'facebook.svg', trustpilot: 'trustpilot.svg' };
  const starRow = (n, color, cls) => `<span class="${cls || 'rs'}" role="img" aria-label="${n} de 5 estrellas" style="color:${color}">${IC.star.repeat(n)}</span>`;
  const pIcon = k => `<img class="rp" src="${K.BASE}assets/brand/reviews/${ICONS[k]}" alt="Reseña en ${esc((PL[k] || {}).name || k)}" width="22" height="22" loading="lazy">`;
  const photo = (r, sq) => `${K.BASE}assets/people/${r.slug}${sq ? '-sq' : ''}.webp`;
  function reviewCard(r) { // benchmark grey review card: name row + platform glyph top-right, stars, quote
    const pl = PL[r.platform] || {};
    return `<article class="mi rt" data-tag="${r.group}" data-placeholder="true"><div class="rt-h"><img class="rt-ph" src="${photo(r, true)}" alt="${esc(r.name)}" width="56" height="56" loading="lazy"><div><p class="rt-n">${esc(r.name)}</p><p class="rt-r">${esc(r.role)}</p></div>${pIcon(r.platform)}</div>${starRow(r.stars, pl.starColor || '#FBBC04')}<p>“${esc(r.quote)}”</p></article>`;
  }
  function reviewRow(r) { // benchmark PDP review row
    const pl = PL[r.platform] || {};
    return `<article class="rr" data-tag="${r.group}" data-placeholder="true"><img class="rt-ph" src="${photo(r, true)}" alt="${esc(r.name)}" width="48" height="48" loading="lazy"><div><p class="nm">${esc(r.name)}</p><p class="rl">${esc(r.role)}</p></div><div class="rr-r">${starRow(r.stars, pl.starColor || '#FBBC04')}${pIcon(r.platform)}</div><p>“${esc(r.quote)}”</p></article>`;
  }
  function reviewSummary() { // logos + average stars per platform present in the data; no review counts
    const ks = [...new Set(RV.map(r => r.platform))];
    return ks.map(k => { const l = RV.filter(r => r.platform === k), avg = l.reduce((s, r) => s + r.stars, 0) / l.length, pl = PL[k] || {};
      return `<div class="rsum-i"><img class="rsum-l ${k}" src="${K.BASE}assets/brand/reviews/${WORD[k]}" alt="${esc(pl.name || k)}" loading="lazy"><b>${avg.toFixed(1)}</b>${starRow(Math.round(avg), pl.starColor || '#FBBC04', 'rs rs-lg')}<span>en ${esc(pl.name || k)}</span></div>`; }).join('');
  }

  /* ---------- header: mega menus (click, like the benchmark) ---------- */
  function mega() {
    const items = $$('.nav-i');
    const close = except => items.forEach(i => { if (i !== except) { i.classList.remove('is-open'); const b = i.querySelector('.nav-b'); b && b.setAttribute('aria-expanded', 'false'); } });
    items.forEach(i => {
      const b = i.querySelector('.nav-b');
      b.addEventListener('click', e => {
        e.stopPropagation();
        const open = !i.classList.contains('is-open');
        close(i); i.classList.toggle('is-open', open); b.setAttribute('aria-expanded', String(open));
        if (open) fillMega(i);
      });
    });
    document.addEventListener('click', e => { if (!e.target.closest('.nav-i')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }
  function fillMega(i) {
    const row = i.querySelector('[data-mega-row]'); if (!row || row.dataset.done) return;
    row.dataset.done = 1;
    const key = row.dataset.megaRow;
    let list = listFor(key, true);
    list = list.sort((a, b) => (K.isQuote(a) - K.isQuote(b)) || (b.img.length - a.img.length)).slice(0, 5);
    row.innerHTML = list.map(p => `<a class="mc" href="${K.pdp(p.h)}"><div class="mc-img"><img src="${cardImg(p, 360)}" alt="" loading="lazy">${K.isQuote(p) ? '<span class="mc-tag">A cotizar</span>' : ''}</div>
      <p class="mc-t">${esc(K.shortName(p))}</p><div class="mc-row"><div><p class="mc-d">${K.isQuote(p) ? 'Precio' : (K.priced(p).length > 1 ? 'Desde:' : 'Precio:')}</p><p class="mc-p">${K.isQuote(p) ? 'Bajo cotización' : fmt(K.minPrice(p))}</p></div><span class="mc-v">${esc(vendor(p))}</span></div></a>`).join('');
  }

  /* ---------- mobile menu ---------- */
  function mobileMenu() {
    const mm = $('[data-mm]'); if (!mm) return;
    const set = o => { mm.classList.toggle('is-open', o); mm.setAttribute('aria-hidden', String(!o)); document.documentElement.classList.toggle('ib-lock', o); };
    $$('[data-mm-open]').forEach(b => b.addEventListener('click', () => set(true)));
    mm.addEventListener('click', e => { if (e.target.closest('[data-mm-close]') || e.target.closest('.mm-sub a')) set(false); });
    $$('.mm-list button.mm-a', mm).forEach(b => b.addEventListener('click', () => b.parentElement.classList.toggle('is-open')));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && mm.classList.contains('is-open')) set(false); });
  }

  /* ---------- marquees (linear, px/s like the benchmark) ---------- */
  function marquees() {
    $$('[data-mq]').forEach(t => {
      const pxs = +t.dataset.mq || 60;
      const fit = () => { const w = t.scrollWidth / 2; if (w) t.style.setProperty('--mq-d', (w / pxs).toFixed(2) + 's'); };
      fit(); window.addEventListener('load', fit, { once: true });
    });
  }

  /* ---------- announcement slider (.45s, 5s cadence) ---------- */
  function announce() {
    const tr = $('[data-ann]'); if (!tr) return;
    const n = tr.children.length; let i = 0;
    if (RM.matches || n < 2) return;
    setInterval(() => { if (document.hidden) return; i = (i + 1) % n; tr.style.transform = `translateX(${-100 * i}%)`; }, 5000);
  }

  function misc() {
    $$('[data-top]').forEach(b => b.addEventListener('click', () => scrollTo({ top: 0, behavior: RM.matches ? 'auto' : 'smooth' })));
    // keep drawer aria in sync
    const cd = $('[data-cart]');
    if (cd) new MutationObserver(() => cd.setAttribute('aria-hidden', String(!cd.classList.contains('is-open')))).observe(cd, { attributes: true, attributeFilter: ['class'] });
  }

  document.addEventListener('DOMContentLoaded', () => { mega(); mobileMenu(); marquees(); announce(); misc(); mountVideos(); });

  window.V1 = { RV, reviewCard, reviewRow, reviewSummary, cardImg, $, $$, esc, IC, GROUPS, colTitle, inGroup, listFor, fmt, priceParts, minVar, cardVar, vendor, card, VIDS, has, makeVideo, mountVideos, REELS, reelCards };
})();
