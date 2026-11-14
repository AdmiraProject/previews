/* Liefloré v4 — page behaviour. Uses window.LFK (lf-core.js) for cart/drawer/checkout; never re-implements them.
   Real data only: products from data.js, TikTok numbers from assets/social/social.json (copied below), Google reviews from AUDIT §5. */
(function () {
  'use strict';
  const K = window.LFK; if (!K) return;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const A = K.ASSET;
  const esc = K.esc;
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const DESK = matchMedia('(min-width: 1024px)');
  document.documentElement.classList.add('js');
  const WA = t => 'https://wa.me/526864321342?text=' + encodeURIComponent(t);

  /* ---------------- icons ---------------- */
  const I = {
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>',
    l: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 5l-7 7 7 7"/></svg>',
    r: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 5l7 7-7 7"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
    mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>',
    snd: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    star: '<svg viewBox="0 0 12 11" fill="currentColor"><path d="M6 0l1.76 3.6 3.94.56-2.86 2.78.68 3.92L6 9.02 2.48 10.86l.68-3.92L.3 4.16l3.94-.56z"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    g: '<svg viewBox="0 0 24 24"><path fill="#F1D3A2" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#fff" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0012 22z"/><path fill="#fff" opacity=".7" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 002 12c0 1.6.4 3.2 1.1 4.6L6.4 14z"/><path fill="#F1D3A2" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 003.1 7.4L6.4 10C7.2 7.7 9.4 6 12 6z"/></svg>'
  };
  const stars = n => `<span class="stars" role="img" aria-label="${n} de 5 estrellas">${[1, 2, 3, 4, 5].map(i => `<span class="${i > n ? 'off' : ''}">${I.star}</span>`).join('')}</span>`;

  /* ---------------- Mexicali time + delivery logic (cutoff 3:30 p. m., no Sundays) ---------------- */
  const TZ = 'America/Tijuana';
  function mxNow() {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()).map(p => [p.type, p.value]));
    const d = new Date(+parts.year, +parts.month - 1, +parts.day);
    return { d, mins: (+parts.hour % 24) * 60 + (+parts.minute) };
  }
  const CUT = 15 * 60 + 30;
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const fromIso = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addD = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const sameDayOpen = () => { const n = mxNow(); return n.d.getDay() !== 0 && n.mins < CUT; };
  function firstAvail() { const n = mxNow(); let d = n.d; if (d.getDay() === 0 || n.mins >= CUT) { d = addD(d, 1); while (d.getDay() === 0) d = addD(d, 1); } return d; }
  const isAvail = d => { const f = firstAvail(); return d.getDay() !== 0 && iso(d) >= iso(f); };
  const fmtDay = d => d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '').replace(',', '');
  const fmtLong = d => d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  const getLead = () => { try { return JSON.parse(localStorage.getItem('lf-lead') || '{}'); } catch (e) { return {}; } };
  const setLead = o => { try { localStorage.setItem('lf-lead', JSON.stringify(Object.assign(getLead(), o))); } catch (e) {} };
  function selDate() { const f = getLead().fecha; if (f && /^\d{4}-\d\d-\d\d$/.test(f)) { const d = fromIso(f); if (isAvail(d)) return d; } return null; }
  function chipHTML() {
    const s = selDate();
    if (s && iso(s) !== iso(mxNow().d)) return `<span class="chip is-later"><i></i>Recíbelo el ${fmtDay(s)}</span>`;
    if (sameDayOpen()) return '<span class="chip"><i></i>Llega hoy si pides antes de 3:30 p. m.</span>';
    const f = firstAvail(); const tmr = iso(f) === iso(addD(mxNow().d, 1));
    return `<span class="chip is-later"><i></i>Recíbelo ${tmr ? 'mañana, ' : 'el '}${fmtDay(f)}</span>`;
  }
  function receiveLabel() { const s = selDate() || firstAvail(); return iso(s) === iso(mxNow().d) ? 'Hoy, ' + fmtDay(s) : fmtDay(s); }

  /* ---------------- product helpers ---------------- */
  const P = h => K.find(h);
  const isAddon = p => p.cats.includes('complementos');
  const img2 = p => p.img[1] || '';
  const BEST = ['bouquet-de-rosas-clasica', 'bouquet-de-rosas-premium', 'florero-de-rosas', 'ramo-de-100-rosas-mexicali', 'caja-primaveral', 'bouquet-primaveral', 'ramo-50-rosas-rojas-mexicali', '150-rosas-corazon-mexicali'];
  const STAR = '<svg viewBox="0 0 100 100"><path fill="currentColor" d="M50 2l8 10 12-5 3 13 13 1-3 13 11 7-9 10 9 10-11 7 3 13-13 1-3 13-12-5-8 10-8-10-12 5-3-13-13-1 3-13-11-7 9-10-9-10 11-7-3-13 13-1 3-13 12 5z"/></svg>';
  function card(p, o) {
    o = o || {};
    const v = K.defaultVariant ? K.defaultVariant(p) : (p.v.length ? p.v.slice().sort((a, b) => a.p - b.p)[0] : null);
    const hov = img2(p) ? K.rel(img2(p)) : (o.hov ? `${A}photo/${o.hov}.jpg` : '');
    const prem = p.cats.includes('premium');
    return `<article class="pc">
      <div class="pc-mw"><a class="pc-m" href="${K.pdpUrl(p)}" tabindex="-1" aria-hidden="true"><img src="${K.rel(p.img[0])}" alt="" loading="lazy" decoding="async">${hov ? `<span class="pc-w"><img src="${hov}" alt="" loading="lazy" decoding="async"></span>` : ''}${prem ? `<span class="oc2-badge">${STAR}<span>Gran<br>gesto</span></span>` : ''}</a>
      <button type="button" class="pc-q" data-lf-add="${p.h}" ${v ? `data-vid="${v.id}"` : ''} aria-label="Agregar ${esc(p.t)} al carrito">${I.plus}<span>Agregar</span></button></div>
      <a class="pc-t" href="${K.pdpUrl(p)}">${esc(p.t)}</a>
      <div class="pc-p">${K.priceLabel(p)}</div>
      ${o.pill ? `<span class="rpill"><i></i>${o.pill}</span>` : (isAddon(p) ? '' : chipHTML())}
    </article>`;
  }

  /* ---------------- carousels: arrows + UrbanStems scrollbar ---------------- */
  function initCar(car) {
    const rail = $('.rail', car); if (!rail || car._init) return; car._init = 1;
    const p = $('.arw--p', car), n = $('.arw--n', car), bar = $('.sbar i', car);
    const step = () => { const c = rail.children[0]; return c ? (c.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 16)) * Math.max(1, Math.floor(rail.clientWidth / (c.getBoundingClientRect().width + 16)) - 1 || 1) : rail.clientWidth * .8; };
    const upd = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      if (p) p.disabled = rail.scrollLeft < 4; if (n) n.disabled = rail.scrollLeft > max - 4;
      if (bar) { const w = Math.min(1, rail.clientWidth / rail.scrollWidth); const tr = bar.parentElement.clientWidth; bar.style.width = (w * 100) + '%'; bar.style.transform = `translateX(${max > 0 ? (rail.scrollLeft / max) * (tr - w * tr) : 0}px)`; bar.parentElement.hidden = w >= .995; }
    };
    p && p.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: RM.matches ? 'auto' : 'smooth' }));
    n && n.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: RM.matches ? 'auto' : 'smooth' }));
    rail.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true });
    addEventListener('resize', upd); car._upd = upd; upd();
  }
  const initCars = r => $$('.car', r).forEach(c => { c._init = 0; initCar(c); });

  /* ---------------- header, mega menu, mobile menu ---------------- */
  function initHeader() {
    const hdr = $('.hdr');
    const onS = () => hdr && hdr.classList.toggle('is-scrolled', scrollY > 10);
    addEventListener('scroll', onS, { passive: true }); onS();
    $$('.has-mega').forEach(li => {
      const b = $('.nav-b', li);
      b && b.addEventListener('click', () => { const o = li.classList.toggle('is-open'); b.setAttribute('aria-expanded', o); });
      li.addEventListener('mouseleave', () => { li.classList.remove('is-open'); b && b.setAttribute('aria-expanded', 'false'); });
      li.addEventListener('keydown', e => { if (e.key === 'Escape') { li.classList.remove('is-open'); b && b.focus(); } });
    });
    const mm = $('.mm');
    $$('[data-mm-open]').forEach(b => b.addEventListener('click', () => { mm.classList.add('is-open'); document.documentElement.classList.add('lf-lock'); b.setAttribute('aria-expanded', 'true'); setTimeout(() => $('.mm-x', mm).focus(), 50); }));
    $$('[data-mm-close]').forEach(b => b.addEventListener('click', () => { mm.classList.remove('is-open'); document.documentElement.classList.remove('lf-lock'); }));
    mm && mm.addEventListener('click', e => { if (e.target.closest('a')) { mm.classList.remove('is-open'); document.documentElement.classList.remove('lf-lock'); } });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && mm && mm.classList.contains('is-open')) { mm.classList.remove('is-open'); document.documentElement.classList.remove('lf-lock'); } });
    if (!sameDayOpen()) { const sh = $('#st-h'); if (sh) sh.textContent = 'Del taller a su puerta'; const l6 = $('.story-steps li:last-child'); if (l6) { l6.dataset.t = 'Llega a su puerta'; const sp = $('span', l6); if (sp && sp.firstChild) sp.firstChild.nodeValue = 'Llega a su puerta'; } }
    const h1 = $('[data-h1]');
    if (h1 && !sameDayOpen()) { const f = firstAvail(); h1.textContent = iso(f) === iso(addD(mxNow().d, 1)) ? 'Flores que llegan mañana' : 'Flores para el ' + f.toLocaleDateString('es-MX', { weekday: 'long' }); }
    // dynamic same-day copy (falls back to static text without JS)
    $$('[data-cutoff]').forEach(el => {
      if (sameDayOpen()) el.textContent = el.dataset.open || 'Pide antes de las 3:30 p. m. y llega hoy';
      else { const f = firstAvail(); el.textContent = (el.dataset.closed || 'Pide ahora y recíbelo el {d}').replace('{d}', fmtLong(f)).replace('{s}', fmtDay(f)); }
    });
  }

  /* ---------------- reveal + card fan-in ---------------- */
  function initReveal() {
    const els = $$('.rv, .rc');
    if (!('IntersectionObserver' in window) || RM.matches) { els.forEach(e => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .12 });
    els.forEach(e => io.observe(e));
    setTimeout(() => els.forEach(e => e.classList.add('is-in')), 4000); // never hide content for long (G5)
  }

  /* ---------------- reels (TikTok @lieflore.mexicali, real view counts) ---------------- */
  const REELS = [
    { id: '7602653570340506887', views: 2021, cap: '100 rosas', h: 'ramo-de-100-rosas-mexicali' },
    { id: '7577920905800666388', views: 1639, cap: 'Rosas rosas', h: 'ramo-de-100-rosas-rositas', sim: 1 },
    { id: '7604022030635142408', views: 1064, cap: '200 rosas rojas', h: '200-rosas-rojas' },
    { id: '7598292102681742610', views: 757, cap: '50 rosas rojas y rosas', h: '50-rosas-mixtas' },
    { id: '7606557060347612424', views: 737, cap: 'Peonías', h: 'bouquet-de-peonias' },
    { id: '7603176211359042823', views: 751, cap: 'Gerberas', h: 'bouquet-de-gerberas' }
  ];
  const vfmt = n => n >= 1000 ? (Math.floor(n / 100) / 10).toString().replace('.0', '') + ' mil' : String(n); // never round up
  const ttUrl = r => `https://www.tiktok.com/@lieflore.mexicali/video/${r.id}`;
  const rSrc = r => `${A}social/tt-${r.id}.mp4`, rPos = r => `${A}social/tt-${r.id}.jpg`;
  function reelTile(r, i) {
    const p = P(r.h);
    return `<div class="rt" data-reel="${i}">
      <img src="${rPos(r)}" alt="" loading="lazy" decoding="async">
      <video muted playsinline loop preload="none" poster="${rPos(r)}" data-src="${rSrc(r)}" aria-hidden="true"></video>
      <div class="rt-top"><span>@lieflore.mexicali</span><span aria-label="${vfmt(r.views)} reproducciones en TikTok">▶ ${vfmt(r.views)}</span></div>
      <button type="button" class="rt-open" data-open-reel="${i}" aria-label="Ver video: ${esc(r.cap)} en @lieflore.mexicali" style="position:absolute;inset:0;z-index:1;background:none;border:0"></button>
      <span class="rt-play" aria-hidden="true">${I.play}</span>
      ${p ? `<a class="rt-chip" href="${K.pdpUrl(p)}"><img src="${K.rel(p.img[0])}" alt="" loading="lazy"><span><b>${r.sim ? 'Similar: ' : ''}${esc(p.t)}</b><small>${K.priceLabel(p)} · <u>Ver ramo</u></small></span></a>` : ''}
    </div>`;
  }
  let reelsPaused = RM.matches || !!(navigator.connection && (navigator.connection.saveData || /2g|3g/.test(navigator.connection.effectiveType || '')));
  function initReels(root, list) {
    const rail = $('.rail', root); if (!rail) return;
    rail.innerHTML = list.map(r => reelTile(r, REELS.indexOf(r))).join('');
    const tiles = $$('.rt', rail);
    const vis = new Map();
    const maxPlay = () => DESK.matches ? 2 : 1;
    function sync() {
      const ranked = tiles.filter(t => (vis.get(t) || 0) >= .5).sort((a, b) => (vis.get(b) || 0) - (vis.get(a) || 0) || a.getBoundingClientRect().left - b.getBoundingClientRect().left).slice(0, reelsPaused || document.hidden ? 0 : maxPlay());
      tiles.forEach(t => {
        const v = $('video', t);
        if (ranked.includes(t)) { if (!v.src) v.src = v.dataset.src; const pr = v.play(); pr && pr.catch(() => {}); t.classList.add('is-playing'); }
        else { if (!v.paused) v.pause(); t.classList.remove('is-playing'); }
      });
    }
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { es.forEach(e => vis.set(e.target, e.intersectionRatio)); sync(); }, { threshold: [0, .25, .5, .75, 1] });
      tiles.forEach(t => io.observe(t));
    }
    document.addEventListener('visibilitychange', sync);
    const pb = $('.rr-pause', root);
    const setPB = () => { if (!pb) return; pb.innerHTML = (reelsPaused ? I.play + 'Reproducir videos' : I.pause + 'Pausar videos'); pb.setAttribute('aria-pressed', reelsPaused); };
    pb && pb.addEventListener('click', () => { reelsPaused = !reelsPaused; setPB(); sync(); }); setPB();
    root.addEventListener('click', e => { const b = e.target.closest('[data-open-reel]'); if (b) Viewer.open(list.map(r => REELS.indexOf(r)), list.indexOf(REELS[+b.dataset.openReel]), b); });
    initCar($('.car', root) || root);
  }

  /* story viewer modal (focus trap, Esc, prev/next, tap pause, sound toggle, product chip) */
  const Viewer = {
    el: null, ids: [], i: 0, from: null, muted: true, raf: 0,
    build() {
      const m = document.createElement('div'); m.className = 'sv'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Videos de @lieflore.mexicali');
      m.innerHTML = `<div class="sv-bg"></div><button type="button" class="sv-nav sv-nav--p" aria-label="Video anterior">${I.l}</button>
        <div class="sv-st"><div class="sv-prog"></div>
          <div class="sv-hd"><a class="sv-src" target="_blank" rel="noopener">@lieflore.mexicali</a><div class="sv-btns"><button type="button" class="sv-b sv-snd" aria-label="Activar sonido">${I.mute}</button><button type="button" class="sv-b sv-x" aria-label="Cerrar">${I.x}</button></div></div>
          <video playsinline muted></video>
          <button type="button" class="sv-tap sv-tap--p" aria-label="Anterior"></button><button type="button" class="sv-tap sv-tap--c" aria-label="Pausar o reproducir"></button><button type="button" class="sv-tap sv-tap--n" aria-label="Siguiente"></button>
          <p class="sv-cap"></p><div class="sv-chip"></div></div>
        <button type="button" class="sv-nav sv-nav--n" aria-label="Video siguiente">${I.r}</button>`;
      document.body.appendChild(m); this.el = m;
      const v = $('video', m); this.v = v;
      $('.sv-x', m).onclick = () => this.close();
      $('.sv-nav--p', m).onclick = $('.sv-tap--p', m).onclick = () => this.go(-1);
      $('.sv-nav--n', m).onclick = $('.sv-tap--n', m).onclick = () => this.go(1);
      $('.sv-tap--c', m).onclick = () => v.paused ? v.play() : v.pause();
      $('.sv-snd', m).onclick = () => { this.muted = !this.muted; v.muted = this.muted; $('.sv-snd', m).innerHTML = this.muted ? I.mute : I.snd; $('.sv-snd', m).setAttribute('aria-label', this.muted ? 'Activar sonido' : 'Silenciar'); };
      v.addEventListener('ended', () => this.go(1, true));
      this.onKey = e => {
        if (!m.classList.contains('is-open')) return;
        if (!m.contains(document.activeElement)) $('.sv-x', m).focus();
        if (e.key === 'Escape') { e.stopPropagation(); this.close(); }
        else if (e.key === 'ArrowRight') this.go(1); else if (e.key === 'ArrowLeft') this.go(-1);
        else if (e.key === 'Tab') { const f = $$('button, a[href]', m).filter(x => x.offsetParent); const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
      };
      m.addEventListener('click', e => { if (e.target === m || e.target.classList.contains('sv-bg')) this.close(); if (e.target.closest('[data-lf-add]')) this.close(); });
    },
    open(ids, i, from) {
      if (!this.el) this.build(); this.ids = ids; this.from = from;
      $('.sv-prog', this.el).innerHTML = ids.map(() => '<span><i></i></span>').join('');
      this.el.classList.add('is-open'); document.documentElement.classList.add('lf-lock');
      document.addEventListener('keydown', this.onKey, true);
      this.show(i); setTimeout(() => $('.sv-x', this.el).focus(), 30);
      $$('.rt video').forEach(v => v.pause());
    },
    show(i) {
      this.i = (i + this.ids.length) % this.ids.length; const r = REELS[this.ids[this.i]]; const v = this.v; const p = P(r.h);
      v.src = rSrc(r); v.poster = rPos(r); v.muted = this.muted; v.loop = false; const pr = v.play(); pr && pr.catch(() => {});
      $('.sv-bg', this.el).style.backgroundImage = `url("${rPos(r)}")`;
      $('.sv-src', this.el).href = ttUrl(r);
      $('.sv-cap', this.el).textContent = `${r.cap} · ${vfmt(r.views)} reproducciones en TikTok`;
      this.el.setAttribute('aria-label', 'Video: ' + r.cap);
      const hadChip = $('.sv-chip', this.el).contains(document.activeElement);
      $('.sv-chip', this.el).innerHTML = p ? `<img src="${K.rel(p.img[0])}" alt=""><div><b>${r.sim ? 'Similar: ' : ''}${esc(p.t)}</b><small>${K.priceLabel(p)}</small></div><div class="sv-acts"><a class="btn btn--light btn--sm" href="${K.pdpUrl(p)}">Ver ramo</a><button type="button" class="btn btn--sm" data-lf-add="${p.h}"${p.v.length ? ` data-vid="${p.v.slice().sort((a, b) => a.p - b.p)[0].id}"` : ''}>Agregar</button></div>` : '';
      if (hadChip || !this.el.contains(document.activeElement)) { const f = $('.sv-chip a', this.el) || $('.sv-x', this.el); if (this.el.classList.contains('is-open')) f.focus(); }
      $$('.sv-prog span', this.el).forEach((s, k) => { $('i', s).style.width = k < this.i ? '100%' : '0'; });
      cancelAnimationFrame(this.raf);
      const bar = $$('.sv-prog i', this.el)[this.i];
      const tick = () => { if (v.duration) bar.style.width = (v.currentTime / v.duration * 100) + '%'; this.raf = requestAnimationFrame(tick); }; tick();
    },
    go(d) { this.show(this.i + d); },
    close() { if (!this.el) return; document.removeEventListener('keydown', this.onKey, true); this.v.pause(); this.v.removeAttribute('src'); this.v.load(); cancelAnimationFrame(this.raf); this.el.classList.remove('is-open'); document.documentElement.classList.remove('lf-lock'); this.from && this.from.focus(); }
  };

  /* ---------------- calendar modal (Freddie's: greyed days, legend, "date not available?") ---------------- */
  const Cal = {
    el: null, cb: null, view: null,
    build() {
      const m = document.createElement('div'); m.className = 'cal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-labelledby', 'cal-h');
      m.innerHTML = `<div class="cal-s" data-cal-x></div><div class="cal-c"><button type="button" class="cal-x" data-cal-x aria-label="Cerrar">×</button>
        <h2 id="cal-h">Elige el día de entrega</h2><p data-cal-note></p>
        <div class="cal-m"><button type="button" data-cal-m="-1" aria-label="Mes anterior">‹</button><b aria-live="polite"></b><button type="button" data-cal-m="1" aria-label="Mes siguiente">›</button></div>
        <div class="cal-g" role="grid"></div>
        <div class="cal-leg"><span><i style="background:var(--cream);box-shadow:inset 0 0 0 1px var(--gold)"></i>Hoy</span><span><i style="background:var(--cream)"></i>Disponible</span><span><i style="background:#fff;box-shadow:inset 0 0 0 1px #ddd"></i>Domingo o fecha pasada</span></div>
        <p class="cal-f">¿No ves tu fecha o lo necesitas urgente? <a href="${WA('Hola Liefloré, quiero confirmar una fecha de entrega')}" target="_blank" rel="noopener">Escríbenos por WhatsApp</a></p></div>`;
      document.body.appendChild(m); this.el = m;
      m.addEventListener('click', e => {
        if (e.target.closest('[data-cal-x]')) return this.close();
        const mb = e.target.closest('[data-cal-m]'); if (mb) { this.view = new Date(this.view.getFullYear(), this.view.getMonth() + +mb.dataset.calM, 1); return this.render(); }
        const d = e.target.closest('[data-day]'); if (d && !d.disabled) { const v = d.dataset.day; setLead({ fecha: v }); this.close(); this.cb && this.cb(fromIso(v)); }
      });
      m.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); this.close(); } });
    },
    open(cb, from) { if (!this.el) this.build(); this.cb = cb; this.from = from; const s = selDate() || firstAvail(); this.view = new Date(s.getFullYear(), s.getMonth(), 1); this.render(); this.el.classList.add('is-open'); setTimeout(() => { const b = $('[aria-pressed="true"], [data-day]:not([disabled])', this.el); b && b.focus(); }, 30); },
    close() { this.el.classList.remove('is-open'); this.from && this.from.focus(); },
    render() {
      const m = this.el, v = this.view, today = mxNow().d, sel = selDate();
      $('[data-cal-note]', m).textContent = sameDayOpen() ? 'Entrega el mismo día en Mexicali si pides antes de las 3:30 p. m.' : (today.getDay() === 0 ? 'No hay servicio regular en domingo; el primer día disponible está marcado' : 'Ya pasó el corte de las 3:30 p. m.; el primer día disponible está marcado');
      $('.cal-m b', m).textContent = cap1(v.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }));
      const first = new Date(v.getFullYear(), v.getMonth(), 1), off = (first.getDay() + 6) % 7, dim = new Date(v.getFullYear(), v.getMonth() + 1, 0).getDate();
      $('[data-cal-m="-1"]', m).disabled = v.getFullYear() === today.getFullYear() && v.getMonth() <= today.getMonth();
      $('[data-cal-m="1"]', m).disabled = (v.getFullYear() * 12 + v.getMonth()) - (today.getFullYear() * 12 + today.getMonth()) >= 2;
      let h = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].map(d => `<span class="dw" aria-hidden="true">${d}</span>`).join('') + '<span></span>'.repeat(off);
      for (let i = 1; i <= dim; i++) { const d = new Date(v.getFullYear(), v.getMonth(), i); const ok = isAvail(d); h += `<button type="button" data-day="${iso(d)}" ${ok ? '' : 'disabled'} class="${iso(d) === iso(today) ? 'is-today' : ''}" aria-pressed="${sel && iso(sel) === iso(d)}" aria-label="${fmtLong(d)}${ok ? '' : ', no disponible'}">${i}</button>`; }
      $('.cal-g', m).innerHTML = h;
    }
  };

  /* ---------------- HOME ---------------- */
  function initBestsellers() {
    const sec = $('#llegan-hoy'); if (!sec) return;
    const rail = $('.rail', sec);
    const sets = {
      fav: () => BEST.map(P).filter(Boolean),
      rosas: () => K.LF.filter(p => !isAddon(p) && /rosas/i.test(p.t) && !p.cats.includes('premium') && !p.cats.includes('cajas-de-flores')).slice(0, 10),
      menos: () => K.LF.filter(p => !isAddon(p) && !p.cats.includes('condolencias') && K.minPrice(p) <= 1000).sort((a, b) => K.minPrice(a) - K.minPrice(b)),
      cajas: () => K.LF.filter(p => p.cats.includes('cajas-de-flores') || p.cats.includes('floreros')),
      gestos: () => K.LF.filter(p => p.cats.includes('premium')).sort((a, b) => K.minPrice(a) - K.minPrice(b)),
      extras: () => K.LF.filter(isAddon)
    };
    const HOV = { fav: 'IMG_8029', rosas: 'IMG_8031', menos: 'IMG_6459', cajas: 'IMG_7101', gestos: 'IMG_5797', extras: 'IMG_8110' };
    const render = k => { rail.innerHTML = sets[k]().map(p => card(p, { hov: HOV[k] })).join(''); rail.scrollLeft = 0; const c = $('.car', sec); c._upd && c._upd(); };
    $$('.pill', sec).forEach(b => b.addEventListener('click', () => { $$('.pill', sec).forEach(x => x.setAttribute('aria-selected', x === b)); render(b.dataset.set); }));
    render('fav'); initCar($('.car', sec)); initWave(sec, '.pc');
  }
  // Olipop data-hover-wave-card (simplified): a wavy clip rises from the bottom over the hovered card's media
  function initWave(sec, item) {
    const path = $('#lfWave path'); if (!path) return;
    if (RM.matches) { path.setAttribute('d', 'M0,0 L1,0 L1,1 L0,1 Z'); return; }
    let t = 0, lvl = 1.06, raf = 0, hovering = 0;
    const draw = () => { let d = `M0,${lvl.toFixed(3)} `; for (let x = 0; x <= 1.0001; x += .05) d += `L${x.toFixed(3)},${(lvl + Math.sin((x * 2.2 + t) * Math.PI) * .035).toFixed(3)} `; path.setAttribute('d', d + 'L1,1.1 L0,1.1 Z'); };
    const loop = () => { t += .02; lvl += ((hovering ? -0.08 : 1.06) - lvl) * .09; draw(); raf = (hovering || lvl < 1.05) ? requestAnimationFrame(loop) : 0; };
    sec.addEventListener('mouseover', e => { if (e.target.closest(item)) { hovering = 1; if (!raf) raf = requestAnimationFrame(loop); } });
    sec.addEventListener('mouseout', e => { const o = e.target.closest(item); if (o && !o.contains(e.relatedTarget)) { hovering = 0; if (!raf) raf = requestAnimationFrame(loop); } });
    draw();
  }
  function initOliTabs() {
    const sec = $('#coleccion'); if (!sec) return;
    const TABS = {
      rosas: { f: p => (p.cats.includes('bouquets-de-rosas') || /rosas/i.test(p.t)) && !isAddon(p) && !p.cats.includes('cajas-de-flores') && !p.cats.includes('floreros'), sub: 'Rosas calidad exportación, de tallo largo y armadas a mano', hov: 'IMG_8029' },
      mixtos: { f: p => p.cats.includes('ramos-mixtos-y-de-temporada') || /gerbera|girasol|tulip|peon/i.test(p.t) && !p.cats.includes('cajas-de-flores') && !isAddon(p), sub: 'Color y textura para cumpleaños o porque sí', hov: 'IMG_6459' },
      cajas: { f: p => p.cats.includes('cajas-de-flores'), sub: 'Listas para regalar, sin buscar florero', hov: 'IMG_7101' },
      floreros: { f: p => p.cats.includes('floreros') || p.cats.includes('plantas'), sub: 'Llegan listos para colocar en casa u oficina', hov: 'IMG_7329' },
      extras: { f: p => isAddon(p), sub: 'Vino, chocolates, ositos, globos y foto personalizada', hov: 'IMG_8110' }
    };
    const panel = $('.rail', sec), sub = $('.ot-sub', sec);
    const render = k => {
      const t = TABS[k]; sub.textContent = t.sub;
      panel.innerHTML = K.LF.filter(t.f).map(p => {
        const v = p.v.length ? p.v.slice().sort((a, b) => a.p - b.p)[0] : null;
        const prem = p.cats.includes('premium');
        return `<article class="oc2"><a class="oc2-m" href="${K.pdpUrl(p)}" aria-label="${esc(p.t)}"><img src="${K.rel(p.img[0])}" alt="" loading="lazy"><span class="oc2-w" aria-hidden="true"><img src="${A}photo/${t.hov}.jpg" alt="" loading="lazy"></span>${prem ? `<span class="oc2-badge"><svg viewBox="0 0 100 100"><path fill="currentColor" d="M50 2l8 10 12-5 3 13 13 1-3 13 11 7-9 10 9 10-11 7 3 13-13 1-3 13-12-5-8 10-8-10-12 5-3-13-13-1 3-13-11-7 9-10-9-10 11-7-3-13 13-1 3-13 12 5z"/></svg><span>Gran<br>gesto</span></span>` : ''}
          <button type="button" class="oc2-add" data-lf-add="${p.h}" ${v ? `data-vid="${v.id}"` : ''}>Agregar · ${K.priceLabel(p)}</button></a>
          <div class="oc2-b"><div class="oc2-l">${esc((p.catn || [])[0] || 'Liefloré')}</div><a class="oc2-t" href="${K.pdpUrl(p)}">${esc(p.t)}</a><div class="oc2-p">${K.priceLabel(p)}</div><button type="button" class="oc2-mb" data-lf-add="${p.h}" ${v ? `data-vid="${v.id}"` : ''} aria-label="Agregar ${esc(p.t)}">Agregar</button></div></article>`;
      }).join('');
      panel.scrollLeft = 0; const c = $('.car', sec); c._upd && c._upd();
    };
    $$('.ot-chip', sec).forEach(b => b.addEventListener('click', () => { $$('.ot-chip', sec).forEach(x => x.setAttribute('aria-selected', x === b)); render(b.dataset.tab); }));
    render('rosas'); initCar($('.car', sec));
    // animated wave clip-path (Olipop data-hover-wave-card, simplified): wave rises from the bottom
    const path = $('#lfWave path');
    if (path && !RM.matches) {
      let t = 0, lvl = 1, raf = 0, hovering = 0;
      const draw = () => { const y = lvl; let d = `M0,${y.toFixed(3)} `; for (let x = 0; x <= 1.0001; x += .05) d += `L${x.toFixed(3)},${(y + Math.sin((x * 2.2 + t) * Math.PI) * .035).toFixed(3)} `; d += 'L1,1.1 L0,1.1 Z'; path.setAttribute('d', d); };
      const loop = () => { t += .02; lvl += ((hovering ? -0.08 : 1.06) - lvl) * .09; draw(); if (hovering || lvl < 1.05) raf = requestAnimationFrame(loop); else raf = 0; };
      sec.addEventListener('mouseover', e => { if (e.target.closest('.oc2')) { hovering = 1; if (!raf) { lvl = Math.max(lvl, 1); raf = requestAnimationFrame(loop); } } });
      sec.addEventListener('mouseout', e => { const o = e.target.closest('.oc2'); if (o && !o.contains(e.relatedTarget)) { hovering = 0; if (!raf) raf = requestAnimationFrame(loop); } });
      draw();
    } else if (path) path.setAttribute('d', 'M0,0 L1,0 L1,1 L0,1 Z');
  }

  /* signature story: A001 workshop clips in sequence (autoplay muted only in view; no scroll scrubbing) */
  function initStory() {
    const sec = $('#taller'); if (!sec) return;
    const stage = $('.story-v', sec), steps = $$('.story-steps li', sec), prog = $$('.story-prog i', sec), cap = $('.story-cap', sec), pp = $('.story-pp', sec);
    const CH = steps.map(li => ({ src: li.dataset.src, poster: li.dataset.poster, img: li.dataset.img, t: li.dataset.t, s: li.dataset.cap || '' }));
    const DUR = 6000;
    let i = 0, playing = !RM.matches, inView = false, t0 = 0, raf = 0, elapsed = 0;
    const layers = [document.createElement('video'), document.createElement('video')];
    layers.forEach(v => { v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'none'; v.loop = true; v.setAttribute('aria-hidden', 'true'); v.className = 'is-hide'; stage.insertBefore(v, stage.firstChild.nextSibling); });
    const still = $('img', stage);
    let cur = 0;
    function load(k) {
      const c = CH[k]; const v = layers[cur ^= 1];
      if (c.img) { still.src = c.img; still.classList.remove('is-hide'); layers.forEach(x => { x.classList.add('is-hide'); x.pause(); }); }
      else { v.poster = c.poster; if (v.dataset.k !== String(k)) { v.src = c.src; v.dataset.k = k; } v.currentTime = 0; if (playing && inView) { const pr = v.play(); pr && pr.catch(() => {}); } v.classList.remove('is-hide'); layers[cur ^ 1].classList.add('is-hide'); setTimeout(() => layers[cur ^ 1].pause(), 600); still.classList.add('is-hide'); }
      steps.forEach((li, n) => li.classList.toggle('is-on', n === k)); prog.forEach((b, n) => b.style.width = n < k ? '100%' : '0');
      cap.innerHTML = `${esc(c.t)}<small>${esc(c.s)}</small>`;
      const nx = CH[(k + 1) % CH.length]; if (nx.src) { const pre = new Image(); pre.src = nx.poster; }
    }
    function go(k) { i = (k + CH.length) % CH.length; elapsed = 0; t0 = performance.now(); load(i); }
    function tick(now) { if (playing && inView) { elapsed += now - t0; prog[i].style.width = Math.min(100, elapsed / DUR * 100) + '%'; if (elapsed >= DUR) go(i + 1); } t0 = now; raf = requestAnimationFrame(tick); }
    steps.forEach((li, n) => $('button', li).addEventListener('click', () => go(n)));
    const setPP = () => { pp.innerHTML = playing ? I.pause : I.play; pp.setAttribute('aria-label', playing ? 'Pausar historia' : 'Reproducir historia'); };
    pp.addEventListener('click', () => { playing = !playing; setPP(); const v = layers[cur]; if (!CH[i].img) playing ? v.play().catch(() => {}) : v.pause(); });
    setPP();
    const io = new IntersectionObserver(es => es.forEach(e => { inView = e.intersectionRatio >= .5; const v = layers[cur]; if (!CH[i].img) { if (inView && playing) { if (!v.src) load(i); v.play().catch(() => {}); } else v.pause(); } }), { threshold: [0, .5, 1] });
    io.observe(stage);
    steps[0].classList.add('is-on'); cap.innerHTML = `${esc(CH[0].t)}<small>${esc(CH[0].s)}</small>`;
    t0 = performance.now(); raf = requestAnimationFrame(tick);
    if (!RM.matches) go(0);
  }

  /* ---------------- PDP ---------------- */
  const COLORS = { amarillo: '#F2CF4A', blanco: '#ffffff', lila: '#C8A2D6', rojo: '#B3122E', rosado: '#EE8FB0', 'rosado-claro': '#F7C9D6' };
  const SIZEW = ['pequeno', 'pequeño', 'mediano', 'grande', 'extra-grande'];
  const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
  const nice = s => ({ pequeno: 'Pequeño', 'extra-grande': 'Extra grande', 'rosado-claro': 'Rosado claro', corazon: 'Corazón' }[s.toLowerCase()] || cap1(s));
  function dims(p) {
    const out = p.v.filter(v => v.p > 0).map(v => { const parts = String(v.t).split('/').map(s => s.trim()).filter(Boolean); let size = null, color = null; parts.forEach(x => { if (/^\d+$/.test(x) || SIZEW.includes(x.toLowerCase()) || /cm/i.test(x)) size = x; else color = x.toLowerCase(); }); return { v, size, color }; });
    return out;
  }
  function unitOf(p) { const t = p.t.toLowerCase(); return /peon/.test(t) ? 'peonías' : /gerbera/.test(t) ? 'gerberas' : /tulip/.test(t) ? 'tulipanes' : /girasol/.test(t) ? 'girasoles' : 'rosas'; }
  function initPDP() {
    const root = $('#pdp'); if (!root) return;
    const h = new URLSearchParams(location.search).get('p') || 'bouquet-de-rosas-clasica';
    const p = P(h);
    if (!p) { root.innerHTML = `<div class="pdp-404"><h1 class="h4">No encontramos este arreglo</h1><p class="lead" style="margin-top:12px">Explora la tienda para ver todos los arreglos disponibles</p><p style="margin-top:24px"><a class="btn" href="tienda.html">Ver arreglos</a></p></div>`; return; }
    document.title = `${p.t} · Liefloré Mexicali`;
    const sober = p.cats.includes('condolencias');
    const D = dims(p);
    const sizes = [...new Set(D.map(x => x.size).filter(Boolean))];
    const colors = [...new Set(D.map(x => x.color).filter(Boolean))];
    let selC = colors.includes('rojo') ? 'rojo' : colors[0] || null;
    const priceFor = (s, c) => { const m = D.find(x => (s == null || x.size === s) && (c == null || x.color === c)); return m ? m.v : null; };
    const minOf = s => Math.min(...D.filter(x => x.size === s).map(x => x.v.p));
    const sizesSorted = sizes.slice().sort((a, b) => minOf(a) - minOf(b)); // ascending, matches the "Desde $X" label
    const dv = K.defaultVariant ? K.defaultVariant(p) : null; const dvd = dv && D.find(x => x.v === dv);
    let selS = dvd && dvd.size ? dvd.size : (sizesSorted[0] || null);
    if (dvd && dvd.color) selC = dvd.color;
    if (selS && selC && !priceFor(selS, selC)) selC = colors.find(c => priceFor(selS, c)) || selC;
    const cur = () => D.length ? (priceFor(selS, selC) || D[0].v) : null;
    const price = () => { const v = cur(); return v ? v.p : p.p; };
    const stems = t => { const m = /(\d+)\s*rosas/i.exec(t || ''); return m ? +m[1] : 0; };
    const reelsFor = sober || isAddon(p) ? [] : REELS.filter(r => r.h === p.h || (stems(p.t) >= 50 && P(r.h) && stems(P(r.h).t) === stems(p.t)));
    const exactReel = REELS.find(r => r.h === p.h && !r.sim);
    const media = p.img.map(s => ({ img: K.rel(s) })); if (exactReel) media.push({ reel: exactReel });
    const desc = String(p.d || p.sd || '').split(/\n+/).map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean)
      .map(t => /(el mismo d[ií]a|hoy mismo)[.!]?$/i.test(t) && !/3:30/.test(t) ? t.replace(/[.!]?$/, '') + ' si pides antes de las 3:30 p. m.' : t);
    const lead = getLead();
    const extras = K.LF.filter(isAddon);
    const XT = { todos: () => true, chocolates: x => /chocolate|bombon/i.test(x.t), vino: x => /vino/i.test(x.t), peluches: x => /osito/i.test(x.t), globos: x => /globo/i.test(x.t), foto: x => /foto/i.test(x.t) };
    const occLink = sober ? '<a href="tienda.html?o=condolencias">Condolencias</a>' : (p.cats[0] ? `<a href="tienda.html?c=${p.cats[0]}">${esc((p.catn || [])[0])}</a>` : '');
    const sub = (p.d && p.sd && p.sd.replace(/\s+/g, ' ').trim().length >= 20) ? p.sd.replace(/\s+/g, ' ').trim() : '';
    const unit = unitOf(p);
    const sizeName = s => /^\d+$/.test(s) ? `${s} ${unit}` : nice(s);

    root.innerHTML = `
      <div class="pdp-gal"><div class="pdp-gr" tabindex="0" aria-label="Galería de ${esc(p.t)}">${media.map((m, k) => m.reel ? `<div class="is-v"><video muted playsinline loop preload="none" poster="${rPos(m.reel)}" src="${rSrc(m.reel)}" aria-label="Video de ${esc(p.t)} en TikTok"></video></div>` : `<div><img src="${m.img}" alt="${esc(p.t)}${k ? ' — foto ' + (k + 1) : ''}" ${k > 1 ? 'loading="lazy"' : ''}></div>`).join('')}${media.length < 2 ? `<div class="pdp-fill" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:var(--cream-2);text-align:center;padding:40px"><img src="${A}brand/png-icono-1.png" alt="" style="width:120px;height:auto;object-fit:contain"><p style="font:400 30px/1.15 var(--disp);color:var(--plum);max-width:360px">${sober ? 'Un tributo hecho a mano en Mexicali' : 'Armado a mano en nuestro taller en Mexicali'}</p><p style="font:400 13px/1.5 var(--sans);color:var(--muted);max-width:340px">Las fotos son ilustrativas; puede haber ligeras variaciones según la disponibilidad de flores del día</p></div>` : ''}</div>
        <span class="pdp-cnt" aria-hidden="true">1 / ${media.length}</span>
        ${media.length > 2 ? `<div class="pdp-th">${media.slice(0, 4).map((m, k) => `<button type="button" data-th="${k}" class="${k ? '' : 'is-on'}" aria-label="Ver foto ${k + 1}"><img src="${m.reel ? rPos(m.reel) : m.img}" alt=""></button>`).join('')}<button type="button" class="ar" data-gal="-1" aria-label="Anterior">←</button><button type="button" class="ar" data-gal="1" aria-label="Siguiente">→</button></div>` : ''}
        <span class="pdp-bar" aria-hidden="true"></span></div>
      <div class="wrap pdp">
        <nav class="crumbs" aria-label="Migas de pan"><a href="index.html">Inicio</a><a href="tienda.html">Tienda</a>${occLink.replace('<a ', '<a ')}<span aria-current="page">${esc(p.t)}</span></nav>
        <div class="pdp-g">
          <div class="pdp-l">
            <h1>${esc(p.t)}</h1>
            ${sober ? '' : `<a class="pdp-rv" href="#resenas"><span>Ver reseñas de Liefloré en Google</span></a>`}
            ${sub ? `<p class="pdp-sub">${esc(sub.slice(0, 180))}${sub.length > 180 ? '…' : ''}</p>` : ''}
            <div class="pdp-pr"><span data-price>${K.money(price())}</span><small>MXN · IVA incluido</small></div>
          </div>
          <div class="acc">
              <details ${DESK.matches ? 'open' : ''}><summary>Descripción</summary><div class="acc-b">${desc.length ? desc.map(t => `<p>${esc(t)}</p>`).join('') : `<p>${esc(p.t)} de Liefloré, armado a mano en nuestro taller en Mexicali</p>`}</div></details>
              <details><summary>Entrega en Mexicali</summary><div class="acc-b"><ul><li>Entrega el mismo día en Mexicali para pedidos web antes de las 3:30 p. m.</li><li>Servicio Express con tiempo estimado de 2 a 4 horas, después de confirmar tu pago y datos completos</li><li>Envío estándar en Mexicali $150 MXN; Express, nocturno o ciertas zonas pueden tener cargo adicional</li><li>Lunes a sábado de 8:00 a. m. a 6:30 p. m. Domingos sin servicio regular</li><li>Valle de Mexicali: posible, el costo depende del ejido</li></ul></div></details>
              <details><summary>Seguimiento y pago</summary><div class="acc-b"><p>Cuando tu arreglo sale de nuestro taller recibes un SMS o correo con un enlace para ver la ruta de nuestro repartidor en el mapa</p><p>Paga con tarjeta, PayPal, Google Pay u otros métodos disponibles. Pregunta por meses sin intereses</p></div></details>
              <details><summary>Fotos y cambios</summary><div class="acc-b"><p>Las imágenes del catálogo son ilustrativas; puede haber ligeras variaciones según la disponibilidad de flores del día, manteniendo el valor y estilo del arreglo</p><p><a href="https://www.lieflores.com/terminos-y-condiciones/" target="_blank" rel="noopener">Consulta nuestros términos y condiciones</a></p></div></details>
          </div>
          <div class="bb" id="comprar">
            <section class="bb-sec"><h2 class="bb-t">Información de entrega</h2>
              <div class="dbar"><button type="button" data-date>${I.cal}<span><b>Recíbelo el:</b> <span data-date-l>${receiveLabel()}</span></span></button><div>${I.pin}<span><b>Envío a:</b> Mexicali, B.C.</span></div></div>
              <p class="dnote"><i></i><span data-cutoff data-open="Entrega el mismo día si pides antes de las 3:30 p. m." data-closed="Ya pasó el corte de hoy; el primer día disponible es {d}">Entrega el mismo día si pides antes de las 3:30 p. m.</span></p>
            </section>
            ${sizes.length > 1 ? `<section class="bb-sec"><h2 class="bb-t">Elige el tamaño</h2><div class="szs ${sizes.length === 2 ? 'is-2' : ''}" role="radiogroup" aria-label="Tamaño" data-sizes></div></section>` : ''}
            ${colors.length > 1 ? `<section class="bb-sec"><p class="lbl">${/globo/.test(p.h) ? 'Estilo' : 'Color'}: <b data-col-l></b></p><div class="cols" role="radiogroup" aria-label="Color" data-cols></div></section>` : ''}
            ${isAddon(p) || sober ? '' : `<section class="bb-sec bb-x"><div class="xh"><div><h2 class="bb-t">Hazlo aún más especial</h2><p>Los complementos se agregan a tu carrito por separado</p></div><div class="arws"><button type="button" data-xs="-1" aria-label="Anterior">←</button><button type="button" data-xs="1" aria-label="Siguiente">→</button></div></div>
              <div class="xtabs" role="tablist">${Object.keys(XT).map((k, n) => `<button type="button" class="xtab" role="tab" data-xt="${k}" aria-selected="${!n}">${{ todos: 'Todos', chocolates: 'Chocolates', vino: 'Vino', peluches: 'Peluches', globos: 'Globos', foto: 'Foto' }[k]}</button>`).join('')}</div>
              <div class="xr" data-xr></div></section>`}
            ${isAddon(p) ? '' : `<section class="bb-sec msg"><h2 class="bb-t">Mensaje para la tarjeta</h2><label class="vh" for="lf-msg">Mensaje para la tarjeta</label><textarea id="lf-msg" maxlength="160" placeholder="${sober ? 'Escribe unas palabras de acompañamiento' : 'Escribe tu mensaje; lo incluimos en una tarjeta personalizada'}">${esc(lead.msg || '')}</textarea><div class="msg-r"><span><span data-mc>0</span> / 160</span><button type="button" data-prev>Ver tarjeta</button></div><div class="note-card" aria-live="polite"><img src="${A}brand/logo.png" alt="Liefloré"><p data-np></p></div></section>`}
            <button type="button" class="btn atc" data-atc>Agregar al carrito – <span data-price>${K.money(price())}</span></button>
            <a class="btn btn--wa atc-wa" href="${WA('Hola Liefloré, quiero pedir: ' + p.t)}" target="_blank" rel="noopener" data-wa><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8a11.4 11.4 0 01-4.4-4c-.3-.5-1-1.5-1-2.8s.7-2 1-2.3a1 1 0 01.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.2 1.6 2a7.6 7.6 0 002.3 1.4c.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l2 1c.3.1.4.2.5.3.1.2.1.7-.1 1.3z"/></svg>Pedir por WhatsApp</a>
            <ul class="trust bb-tr">
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span><b>Entrega el mismo día en Mexicali</b> para pedidos web antes de las 3:30 p. m.</span></li>
              <li>${I.pin}<span><b>Seguimiento en tiempo real:</b> te enviamos la ruta del repartidor por SMS o correo</span></li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 8l9 6 9-6"/></svg><span><b>Tarjeta personalizada</b> con tu mensaje</span></li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12a8 8 0 0116 0v5a2 2 0 01-2 2h-2v-6h4M4 13h4v6H6a2 2 0 01-2-2z"/></svg><span><b>Atención directa y personalizada</b> por WhatsApp al 686 432 1342</span></li>
            </ul>
          </div>
        </div>
      </div>
      ${reelsFor.length >= 2 ? `<section class="pdp-ugc reels" style="border-bottom:0;padding:56px 0"><div class="wrap"><div class="sec-h"><div><p class="eb">Así llegan</p><h2 class="h4">Ramos reales, entregados en Mexicali</h2><p class="lead">Desde nuestro TikTok @lieflore.mexicali</p></div><div class="reels-tools"><button type="button" class="rr-pause"></button></div></div>
        <div class="car"><div class="rail"></div><button type="button" class="arw arw--p" aria-label="Anterior">${I.l}</button><button type="button" class="arw arw--n" aria-label="Siguiente">${I.r}</button></div></div></section>` : ''}
      <section class="prev" id="resenas"><div class="wrap"><div class="sec-h" style="padding:0"><div><p class="eb">Reseñas en Google</p><h2 class="h4">Lo que dicen de Liefloré</h2></div><a class="tlink" href="https://www.google.com/maps/place/Lieflor%C3%A9+Mexicali/@32.6347958,-115.4368491,17z" target="_blank" rel="noopener">Ver en Google Maps</a></div>
        <div class="prev-g">${(sober ? REVIEWS.filter(r => !/[\u2728\u2764\u{1F300}-\u{1FAFF}]/u.test(r.q)).slice(0, 3) : REVIEWS.slice(0, 3)).map(r => `<article class="prc"><div class="prc-h"><i aria-hidden="true">${r.i}</i><div><b>${r.n}</b><small>Reseña en Google</small></div></div>${stars(r.s)}<p>“${r.q}”</p></article>`).join('')}</div>
        <p class="rev-note">Reseñas de la florería publicadas en Google, sin editar</p></div></section>
      <section class="bs" style="padding-bottom:100px"><div class="wrap"><div class="bs-h sec-h" style="border:0;margin:0;padding-bottom:18px"><h2 class="h4">${sober ? 'También puedes enviar' : 'También te puede gustar'}</h2><a class="shopall" href="tienda.html">Ver todo</a></div>
        <div class="car"><div class="rail" data-xsell></div><button type="button" class="arw arw--p" aria-label="Anterior">${I.l}</button><button type="button" class="arw arw--n" aria-label="Siguiente">${I.r}</button><div class="sbar" aria-hidden="true"><i></i></div></div></div></section>
      <section class="ship rule-t"><div class="wrap"><h2 class="h4">Así llega tu pedido</h2>
        <div class="ship-g">
          ${sober ? `<article><div class="sh-m"><img src="${K.rel(p.img[0])}" alt="${esc(p.t)} de Liefloré" loading="lazy" style="object-fit:contain;background:#fff"><b>1</b></div><h3>Lo preparamos con cuidado</h3><p>Cada arreglo se arma a mano en nuestro taller en Mexicali</p></article>
          <article><div class="sh-m sh-t"><img src="${A}brand/png-icono-1.png" alt="" loading="lazy" style="width:120px;height:auto;object-fit:contain;border-radius:0"><b>2</b></div><h3>Coordinamos la entrega</h3><p>Confirmamos dirección, horario y recinto contigo por WhatsApp</p></article>
          <article><div class="sh-m sh-t"><p>Entrega el mismo día en Mexicali si pides antes de las 3:30 p. m. Envío estándar $150</p><b>3</b></div><h3>Llega a tiempo</h3><p>Te enviamos la ruta del repartidor en tiempo real</p></article>` : `<article><div class="sh-m"><img src="${A}vid/A001_06091409_C050.jpg" alt="Florista de Liefloré insertando rosas en un corazón floral" loading="lazy"><b>1</b></div><h3>Lo armamos a mano</h3><p>Tu arreglo se prepara en nuestro taller en Mexicali con flores del día</p></article>
          <article><div class="sh-m"><img src="${A}photo/IMG_7273.jpg" alt="Ramo de rosas rojas de Liefloré en el auto de reparto" loading="lazy"><b>2</b></div><h3>Sale a ruta</h3><p>Te enviamos un SMS o correo con la ruta del repartidor en tiempo real</p></article>
          <article><div class="sh-m"><img src="${A}photo/IMG_4418.jpg" alt="Clienta recibiendo un corazón de rosas rojas de Liefloré" loading="lazy"><b>3</b></div><h3>Llega a su puerta</h3><p>Mismo día en Mexicali si pides antes de las 3:30 p. m. Envío estándar $150</p></article>`}
        </div></div></section>
      <div class="satc" aria-hidden="true"><div class="satc-in"><div class="satc-i"><img src="${K.rel(p.img[0])}" alt=""><div><b>${esc(p.t)}</b><small data-satc-v></small></div></div><button type="button" class="btn" data-atc tabindex="-1">Agregar al carrito – <span data-price>${K.money(price())}</span></button></div></div>`;

    if (sober) { const w = $('.wa-f'); if (w) w.href = WA('Hola Liefloré, quiero información sobre una corona de condolencias'); }
    // gallery
    const gr = $('.pdp-gr', root), cnt = $('.pdp-cnt', root), bar = $('.pdp-bar', root);
    const gUpd = () => { const w = gr.children[0].getBoundingClientRect().width; const k = Math.round(gr.scrollLeft / w); cnt.textContent = `${k + 1} / ${media.length}`; $$('.pdp-th [data-th]', root).forEach(b => b.classList.toggle('is-on', +b.dataset.th === k)); const per = DESK.matches ? 2 : 1; const n = Math.max(1, gr.children.length - per + 1); bar.style.width = (100 / n) + '%'; bar.style.transform = `translateX(${Math.min(k, n - 1) * 100}%)`; };
    gr.addEventListener('scroll', () => requestAnimationFrame(gUpd), { passive: true }); addEventListener('resize', gUpd); gUpd();
    root.addEventListener('click', e => {
      const t = e.target.closest('[data-th]'); if (t) gr.scrollTo({ left: gr.children[0].getBoundingClientRect().width * +t.dataset.th, behavior: 'smooth' });
      const g = e.target.closest('[data-gal]'); if (g) gr.scrollBy({ left: gr.children[0].getBoundingClientRect().width * +g.dataset.gal, behavior: 'smooth' });
    });
    const gv = $('.pdp-gr video', root);
    if (gv && 'IntersectionObserver' in window && !RM.matches) new IntersectionObserver(es => es.forEach(e => e.intersectionRatio >= .5 ? gv.play().catch(() => {}) : gv.pause()), { threshold: [0, .5] }).observe(gv);
    // date
    const dl = $('[data-date-l]', root);
    $('[data-date]', root).addEventListener('click', e => Cal.open(() => { dl.textContent = receiveLabel(); }, e.currentTarget));
    // sizes + colours
    const setPrice = () => { $$('[data-price]').forEach(n => n.textContent = K.money(price())); const sv = $('[data-satc-v]'); if (sv) sv.textContent = [selS ? sizeName(selS) : '', selC ? nice(selC) : ''].filter(Boolean).join(' · ') || K.money(price()); };
    function renderSizes() {
      const box = $('[data-sizes]', root); if (!box) return;
      box.innerHTML = sizesSorted.map(s => { const v = priceFor(s, selC); return `<button type="button" class="sz" role="radio" aria-checked="${s === selS}" data-s="${esc(s)}" ${v ? '' : 'disabled'}><span class="sz-p">${v ? K.money(v.p) : '—'}</span><span class="sz-n">${esc(sizeName(s))}</span>${v ? '' : '<span class="sz-s">No disponible en este color</span>'}</button>`; }).join('');
    }
    function renderCols() {
      const box = $('[data-cols]', root); if (!box) return;
      box.innerHTML = colors.map(c => { const ok = !selS || priceFor(selS, c); return `<button type="button" class="col" role="radio" aria-checked="${c === selC}" data-c="${esc(c)}" ${ok ? '' : 'disabled'}>${COLORS[c] ? `<i style="background:${COLORS[c]}"></i>` : ''}${esc(nice(c))}</button>`; }).join('');
      const l = $('[data-col-l]', root); if (l) l.textContent = selC ? nice(selC) : '';
    }
    root.addEventListener('click', e => {
      const s = e.target.closest('[data-s]'); if (s && !s.disabled) { selS = s.dataset.s; if (selC && !priceFor(selS, selC)) selC = colors.find(c => priceFor(selS, c)); renderSizes(); renderCols(); setPrice(); }
      const c = e.target.closest('[data-c]'); if (c && !c.disabled) { selC = c.dataset.c; renderSizes(); renderCols(); setPrice(); }
    });
    renderSizes(); renderCols(); setPrice();
    // extras
    const xr = $('[data-xr]', root); const picked = new Map();
    const renderX = k => { xr.innerHTML = extras.filter(XT[k]).map(x => { const v0 = x.v.length ? x.v[0] : null; return `<div class="xc"><div class="xc-m"><img src="${K.rel(x.img[0])}" alt="" loading="lazy"></div><b>${esc(x.t)}</b><small>+ ${K.priceLabel(x)}</small>${x.v.length > 1 ? `<label class="vh" for="xv-${x.h}">Opción</label><select id="xv-${x.h}" data-xv="${x.h}" style="margin-top:6px;width:100%;height:34px;border:1px solid #e3d9df;border-radius:4px;font:500 13px var(--sans)">${x.v.map(v => `<option value="${v.id}">${esc(nice(v.t))} · ${K.money(v.p)}</option>`).join('')}</select>` : ''}<button type="button" data-x="${x.h}" aria-pressed="${picked.has(x.h)}">${picked.has(x.h) ? '✓ Agregado' : 'Agregar'}</button></div>`; }).join(''); };
    if (xr) {
      renderX('todos');
      root.addEventListener('click', e => {
        const t = e.target.closest('[data-xt]'); if (t) { $$('[data-xt]', root).forEach(b => b.setAttribute('aria-selected', b === t)); renderX(t.dataset.xt); }
        const b = e.target.closest('[data-x]'); if (b) { const hh = b.dataset.x; if (picked.has(hh)) picked.delete(hh); else { const sel = $(`[data-xv="${hh}"]`, root); const x = P(hh); picked.set(hh, sel ? sel.value : (x.v[0] ? x.v[0].id : '')); } b.setAttribute('aria-pressed', picked.has(hh)); b.textContent = picked.has(hh) ? '✓ Agregado' : 'Agregar'; }
        const xs = e.target.closest('[data-xs]'); if (xs) xr.scrollBy({ left: +xs.dataset.xs * 200, behavior: 'smooth' });
      });
      root.addEventListener('change', e => { const s = e.target.closest('[data-xv]'); if (s && picked.has(s.dataset.xv)) picked.set(s.dataset.xv, s.value); });
    }
    // message
    const ta = $('#lf-msg', root);
    if (ta) {
      const mc = $('[data-mc]', root), np = $('[data-np]', root), nc = $('.note-card', root);
      const upd = () => { mc.textContent = ta.value.length; np.textContent = ta.value || 'Tu mensaje aparecerá aquí'; setLead({ msg: ta.value }); };
      ta.addEventListener('input', upd); upd();
      $('[data-prev]', root).addEventListener('click', e => { const on = nc.classList.toggle('is-on'); e.target.textContent = on ? 'Ocultar tarjeta' : 'Ver tarjeta'; });
    }
    // ATC
    $$('[data-atc]').forEach(b => b.addEventListener('click', () => {
      const v = cur(); if (ta) setLead({ msg: ta.value });
      if (!selDate()) setLead({ fecha: iso(firstAvail()) });
      K.add(p.h, v ? v.id : undefined, 1);
      picked.forEach((vid, hh) => K.add(hh, vid || undefined, 1));
    }));
    // WA link with selection
    const wa = $('[data-wa]', root);
    const updWA = () => { const v = cur(); wa.href = WA(`Hola Liefloré, quiero pedir: ${p.t}${v && v.t ? ' (' + v.t + ')' : ''} — ${K.money(price())}. Entrega: ${receiveLabel()}`); };
    root.addEventListener('click', updWA); updWA();
    // sticky ATC (appears when in-flow ATC leaves view)
    const satc = $('.satc', root), main = $('.atc', root);
    if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { const on = !e.isIntersecting && e.boundingClientRect.top < 0; satc.classList.toggle('is-on', on); satc.setAttribute('aria-hidden', !on); $('button', satc).tabIndex = on ? 0 : -1; document.body.classList.toggle('has-satc', on); }), { threshold: 0 }).observe(main);
    // reels under the buy box
    const ugc = $('.pdp-ugc', root); if (ugc) { initReels(ugc, reelsFor.slice(0, 6)); ugc.classList.toggle('is-few', reelsFor.length <= 3); }
    if (sober) { const q = $('.qrow'); if (q) q.hidden = true; }
    // cross-sell
    const xs = $('[data-xsell]', root);
    const pool = K.LF.filter(x => x.h !== p.h && !isAddon(x) && (sober ? (x.cats.includes('condolencias') || /orquid/i.test(x.h)) : !x.cats.includes('condolencias')));
    const same = pool.filter(x => x.cats.some(c => p.cats.includes(c)));
    const xl = [...new Set([...same, ...pool])].slice(0, 10);
    xs.innerHTML = xl.map(x => card(x)).join('');
    if (xl.length < 2) xs.closest('section').hidden = true;
    initCars(root); initWave(root, '.pc');
    K.Cart.upsell = extras.map(x => x.h);
  }

  /* ---------------- TIENDA (UrbanStems collection) ---------------- */
  const OCC = {
    aniversario: { n: 'Aniversario y amor', f: p => /rosa|coraz|te amo/i.test(p.t) && !p.cats.includes('condolencias') },
    cumpleanos: { n: 'Cumpleaños', f: p => /gerbera|girasol|primaveral|tulip|globo|caja/i.test(p.t) },
    graduacion: { n: 'Graduación', f: p => /girasol|100 rosas|200 rosas|premium|gerbera/i.test(p.t) },
    mama: { n: 'Para mamá', f: p => /peon|tulip|rositas|primaveral|orquid|florero/i.test(p.t) },
    porque: { n: 'Porque sí', f: p => /girasol|clasica|gerbera|tulip|24 rosas|florero/i.test(p.t) && !p.cats.includes('premium') },
    gestos: { n: 'Grandes gestos', f: p => p.cats.includes('premium') },
    condolencias: { n: 'Condolencias', f: p => p.cats.includes('condolencias') }
  };
  const CATS = [['bouquets-y-ramos', 'Bouquets y ramos'], ['bouquets-de-rosas', 'Bouquets de rosas'], ['ramos-mixtos-y-de-temporada', 'Mixtos y de temporada'], ['cajas-de-flores', 'Cajas de flores'], ['floreros', 'Floreros'], ['premium', 'Premium'], ['plantas', 'Plantas'], ['condolencias', 'Condolencias'], ['complementos', 'Complementos']];
  const PRICES = [['0-1000', 'Hasta $1,000', 0, 1000], ['1000-2500', '$1,000 a $2,500', 1000.01, 2500], ['2500-99999', 'Más de $2,500', 2500.01, 1e9]];
  function initTienda() {
    const root = $('#tienda'); if (!root || !$('.grid', root)) return;
    const q = new URLSearchParams(location.search);
    const st = { c: new Set(q.get('c') ? [q.get('c')] : []), o: q.get('o') || '', pr: new Set(), sort: 'rec' };
    const grid = $('.grid', root), cnt = $('[data-count-n]', root), chips = $('.fbar-chips', root), h1 = $('.col-h h1', root), sub = $('.col-h p', root);
    const fd = $('.fd');
    function list() {
      let L = K.LF.slice();
      if (st.o && OCC[st.o]) L = L.filter(OCC[st.o].f).filter(p => !isAddon(p) || st.o === 'cumpleanos');
      if (st.c.size) L = L.filter(p => p.cats.some(c => st.c.has(c)));
      if (st.pr.size) L = L.filter(p => [...st.pr].some(k => { const r = PRICES.find(x => x[0] === k); const m = K.minPrice(p); return m >= r[2] && m <= r[3]; }));
      if (!st.c.has('complementos')) L = L.filter(p => !isAddon(p));
      if (st.sort === 'asc') L.sort((a, b) => K.minPrice(a) - K.minPrice(b)); else if (st.sort === 'desc') L.sort((a, b) => K.minPrice(b) - K.minPrice(a));
      else L.sort((a, b) => (BEST.indexOf(a.h) < 0 ? 99 : BEST.indexOf(a.h)) - (BEST.indexOf(b.h) < 0 ? 99 : BEST.indexOf(b.h)) || (isAddon(a) - isAddon(b)));
      return L;
    }
    function render() {
      const L = list();
      const pill = isAddon ? null : null;
      const rec = (() => { const s = selDate(); if (s) return iso(s) === iso(mxNow().d) ? 'Llega hoy · antes de 3:30 p. m.' : 'Recíbelo el ' + fmtDay(s); return sameDayOpen() ? 'Llega hoy · antes de 3:30 p. m.' : 'Recíbelo el ' + fmtDay(firstAvail()); })();
      grid.innerHTML = L.length ? L.map(p => card(p, { pill: isAddon(p) ? 'Complemento para tu arreglo' : rec })).join('') : `<div class="grid-empty"><p>No hay arreglos con estos filtros</p><button type="button" class="btn btn--line" data-clear style="margin-top:18px">Quitar filtros</button></div>`;
      const allX = L.length && L.every(isAddon); cnt.textContent = L.length + (allX ? (L.length === 1 ? ' complemento' : ' complementos') : (L.length === 1 ? ' arreglo' : ' arreglos'));
      const qk = st.o ? 'o:' + st.o : (st.c.size === 1 && !st.pr.size ? 'c:' + [...st.c][0] : (!st.c.size && !st.pr.size ? '' : null));
      $$('.tpills .pill').forEach(b => b.classList.toggle('is-on', b.dataset.q === qk));
      const n = st.c.size + st.pr.size + (st.o ? 1 : 0); const badge = $('.fbar-n', root); badge.textContent = n; badge.hidden = !n;
      const tag = st.o ? OCC[st.o].n : st.c.size === 1 ? (CATS.find(c => c[0] === [...st.c][0]) || [, 'Tienda'])[1] : '';
      h1.textContent = tag ? tag : 'Todos los arreglos';
      sub.textContent = st.o === 'condolencias' || st.c.has('condolencias') ? 'Arreglos de condolencias armados con respeto en nuestro taller de Mexicali' : 'Arreglos premium armados a mano en Mexicali. Entrega el mismo día si pides antes de las 3:30 p. m.';
      chips.innerHTML = [...(st.o ? [['o', st.o, OCC[st.o].n]] : []), ...[...st.c].map(c => ['c', c, (CATS.find(x => x[0] === c) || [, c])[1]]), ...[...st.pr].map(k => ['pr', k, PRICES.find(x => x[0] === k)[1]])].map(([t, v, l]) => `<button type="button" class="fchip" data-rm="${t}|${v}" aria-label="Quitar filtro ${esc(l)}">${esc(l)} <span aria-hidden="true">×</span></button>`).join('');
      chips.hidden = !n;
      $('[data-rec-l]', root).textContent = receiveLabel();
      $$('input[data-fc]').forEach(i => i.checked = st.c.has(i.value)); $$('input[data-fo]').forEach(i => i.checked = st.o === i.value); $$('input[data-fp]').forEach(i => i.checked = st.pr.has(i.value)); $$('input[data-fs]').forEach(i => i.checked = st.sort === i.value);
      const u = new URL(location.href); u.search = ''; if (st.o) u.searchParams.set('o', st.o); if (st.c.size === 1) u.searchParams.set('c', [...st.c][0]); history.replaceState(null, '', u);
    }
    // filter drawer content
    const cntFor = f => K.LF.filter(f).length;
    $('.fd-b', fd).innerHTML = `
      <div class="fd-g"><h3>Ordenar</h3>${[['rec', 'Recomendados'], ['asc', 'Precio: menor a mayor'], ['desc', 'Precio: mayor a menor']].map(([v, l]) => `<label><input type="radio" name="fs" data-fs value="${v}">${l}</label>`).join('')}</div>
      <div class="fd-g"><h3>Ocasión</h3>${Object.entries(OCC).map(([k, o]) => `<label><input type="radio" name="fo" data-fo value="${k}">${o.n}<span>${cntFor(o.f)}</span></label>`).join('')}<label><input type="radio" name="fo" data-fo value="">Todas</label></div>
      <div class="fd-g"><h3>Categoría</h3>${CATS.map(([k, l]) => `<label><input type="checkbox" data-fc value="${k}">${l}<span>${cntFor(p => p.cats.includes(k))}</span></label>`).join('')}</div>
      <div class="fd-g"><h3>Precio</h3>${PRICES.map(([k, l, a, b]) => `<label><input type="checkbox" data-fp value="${k}">${l}<span>${cntFor(p => !isAddon(p) && K.minPrice(p) >= a && K.minPrice(p) <= b)}</span></label>`).join('')}</div>`;
    const openFD = () => { fd.classList.add('is-open'); document.documentElement.classList.add('lf-lock'); setTimeout(() => $('.fd-x', fd).focus(), 30); };
    const closeFD = () => { fd.classList.remove('is-open'); document.documentElement.classList.remove('lf-lock'); };
    $('[data-filters]', root).addEventListener('click', openFD);
    fd.addEventListener('click', e => { if (e.target.closest('[data-fd-x]')) closeFD(); if (e.target.closest('[data-clear]')) { st.c.clear(); st.pr.clear(); st.o = ''; st.sort = 'rec'; render(); } });
    fd.addEventListener('keydown', e => { if (e.key === 'Escape') closeFD(); });
    fd.addEventListener('change', e => {
      const i = e.target;
      if (i.matches('[data-fc]')) i.checked ? st.c.add(i.value) : st.c.delete(i.value);
      if (i.matches('[data-fo]')) st.o = i.value;
      if (i.matches('[data-fp]')) i.checked ? st.pr.add(i.value) : st.pr.delete(i.value);
      if (i.matches('[data-fs]')) st.sort = i.value;
      render();
    });
    root.addEventListener('click', e => {
      const r = e.target.closest('[data-rm]'); if (r) { const [t, v] = r.dataset.rm.split('|'); if (t === 'o') st.o = ''; if (t === 'c') st.c.delete(v); if (t === 'pr') st.pr.delete(v); render(); }
      if (e.target.closest('[data-clear]')) { st.c.clear(); st.pr.clear(); st.o = ''; render(); }
      const qp = e.target.closest('.tpills [data-q]'); if (qp) { st.c.clear(); st.pr.clear(); st.o = ''; const [t, v] = (qp.dataset.q || ':').split(':'); if (t === 'c') st.c.add(v); if (t === 'o') st.o = v; render(); }
      const l = e.target.closest('[data-lay]'); if (l) { $$('[data-lay]', root).forEach(b => b.setAttribute('aria-pressed', b === l)); grid.classList.toggle('is-2', l.dataset.lay === '2'); }
    });
    $('[data-rec]', root).addEventListener('click', e => Cal.open(() => render(), e.currentTarget));
    render(); initWave(root, '.pc');
  }

  /* ---------------- reviews (AUDIT §5, verbatim) ---------------- */
  const REVIEWS = [
    { n: 'Arturo L.', i: 'AL', s: 5, q: 'Trato increíble y flores hermosas ✨' },
    { n: 'Humberto M.', i: 'HM', s: 5, q: 'Excelente servicio! Y perfecta atención' },
    { n: 'Fernanda D.', i: 'FD', s: 5, q: 'Excelentes arreglos, de los mejores ❤️' },
    { n: 'Michelle A.', i: 'MA', s: 5, q: 'Excelente calidad y servicio✨' },
    { n: 'Irenne A.', i: 'IA', s: 4, q: 'Buen precio' },
    { n: 'Ramón O.', i: 'RO', s: 5, q: 'La verdad quiero agradecer a Lieflore por el buen trato que an ofrecido y la entraga excelente les doy un 1000 % de calificacion la verdad los recomiendo muchas gracias' }
  ];

  /* ---------------- boot ---------------- */
  function boot() {
    // default the checkout date to the first real delivery day (lf-core pre-fills from lf-lead)
    document.addEventListener('click', e => { if (e.target.closest('[data-lf-add], [data-checkout], [data-atc]') && !selDate()) setLead({ fecha: iso(firstAvail()) }); }, true);
    initHeader();
    initBestsellers(); initOliTabs();
    const hr = $('#reels'); if (hr) initReels(hr, REELS);
    initStory(); initPDP(); initTienda();
    initCars(document);
    initReveal();
    // hero video: respect reduced motion (poster only)
    const hv = $('.hero-media video'); if (hv && RM.matches) { hv.removeAttribute('autoplay'); hv.pause(); }
    // drawer: shipping line + date in cart foot
    K.onChange(() => { const d = $('[data-cart-date]'); if (d) d.textContent = receiveLabel(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.LFV4 = { Cal, Viewer, chipHTML, firstAvail, sameDayOpen };
})();
