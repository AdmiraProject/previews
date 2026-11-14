/* Liefloré v1 (bouqs.com structure) — home + PDP behaviour.
   Uses window.LFK from ../assets/lf-core.js for data, cart drawer and checkout popup. */
(function () {
  const K = window.LFK;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => innerWidth < 768;
  const esc = K ? K.esc : (s => String(s));
  const WA = 'https://wa.me/526864321342?text=';

  /* ---------- delivery clock: Mexicali time (America/Tijuana), cutoff 3:30 p. m., no regular Sunday service ---------- */
  const DAYS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  function mxNow() { try { return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Tijuana' })); } catch (e) { return new Date(); } }
  const CUT = 15 * 60 + 30;
  const sameDayOpen = (d = mxNow()) => d.getDay() !== 0 && d.getHours() * 60 + d.getMinutes() < CUT;
  const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  function firstAvail() {
    if (window.LFK && LFK.firstDeliveryDate) { const n = mxNow(); const fd = LFK.firstDeliveryDate(); const d = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate()); return { d, today: ymd(d) === ymd(n) }; }
    const now = mxNow(); const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (sameDayOpen(now)) return { d, today: true };
    do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0);
    return { d, today: false };
  }
  function availLabel() {
    const f = firstAvail(); const now = mxNow();
    const tmr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    if (f.today) return 'HOY';
    if (ymd(f.d) === ymd(tmr)) return 'MAÑANA';
    return DAYS[f.d.getDay()] + ' ' + f.d.getDate() + '/' + (f.d.getMonth() + 1);
  }
  function leftText() {
    const n = mxNow(); const m = CUT - (n.getHours() * 60 + n.getMinutes());
    const h = Math.floor(m / 60), mm = m % 60;
    return (h ? h + ' h ' : '') + mm + ' min';
  }

  /* ---------- header pill ---------- */
  function initPill() {
    const lab = $('[data-pill-label]'); if (!lab) return;
    const txt = $('[data-pill-text]');
    const paint = () => {
      const f = firstAvail();
      if (f.today) { lab.textContent = 'Llega hoy'; txt.innerHTML = `Pide en las próximas <b>${leftText()}</b> y llega hoy. Entrega el mismo día si pides antes de las 3:30 p. m.`; }
      else { const l = availLabel(); lab.textContent = l === 'MAÑANA' ? 'Llega mañana' : 'Llega el ' + l.split(' ')[0].toLowerCase(); txt.textContent = 'Hoy ya cerramos el corte de las 3:30 p. m. Programa tu entrega para ' + (l === 'MAÑANA' ? 'mañana' : l.toLowerCase()) + ' o escríbenos por WhatsApp para revisar disponibilidad'; }
      $$('[data-cutoff-note]').forEach(n => { n.textContent = f.today ? `Llega hoy si pides en las próximas ${leftText()} (corte 3:30 p. m.)` : 'Pide hoy y programa tu entrega · corte diario 3:30 p. m.'; });
    };
    paint(); setInterval(paint, 60000);
    const btn = $('[data-pill]'), pop = $('#pillpop');
    btn.addEventListener('click', e => { e.stopPropagation(); const o = pop.hidden; pop.hidden = !o; btn.setAttribute('aria-expanded', String(o)); });
    pop.addEventListener('click', e => { if (e.target.closest('a')) { pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('click', e => { if (!e.target.closest('.hd-pillwrap')) { pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });
  }

  /* ---------- mega menu ---------- */
  function initMega() {
    const items = $$('.has-mm');
    const close = except => items.forEach(li => { if (li === except) return; const b = li.querySelector('button'), m = li.querySelector('.mm'); b.setAttribute('aria-expanded', 'false'); m.hidden = true; });
    items.forEach(li => {
      const b = li.querySelector('button'), m = li.querySelector('.mm'); let t;
      const open = () => { clearTimeout(t); close(li); b.setAttribute('aria-expanded', 'true'); m.hidden = false; };
      b.addEventListener('click', e => { e.stopPropagation(); if (m.hidden) open(); else close(); });
      li.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) open(); });
      li.addEventListener('mouseleave', () => { t = setTimeout(() => close(), 160); });
      m.addEventListener('click', e => { if (e.target.closest('a')) close(); });
    });
    document.addEventListener('click', e => { if (!e.target.closest('.has-mm')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); const p = $('#pillpop'); if (p) p.hidden = true; closeNav(); closeVm(); } });
  }

  /* ---------- mobile nav ---------- */
  const nav = () => $('#mnav');
  function openNav() { const n = nav(); if (!n) return; n.classList.add('is-open'); n.setAttribute('aria-hidden', 'false'); $('[data-mnav-open]').setAttribute('aria-expanded', 'true'); document.documentElement.classList.add('lf-lock'); setTimeout(() => n.querySelector('.mnav-h button').focus(), 50); }
  function closeNav() { const n = nav(); if (!n || !n.classList.contains('is-open')) return; n.classList.remove('is-open'); n.setAttribute('aria-hidden', 'true'); $('[data-mnav-open]').setAttribute('aria-expanded', 'false'); document.documentElement.classList.remove('lf-lock'); }
  function initNav() {
    const b = $('[data-mnav-open]'); if (!b) return;
    b.addEventListener('click', openNav);
    nav().addEventListener('click', e => { if (e.target.closest('[data-mnav-close]') || e.target.closest('a')) closeNav(); });
  }

  /* ---------- hero carousel (autoplay, dots, pause, swipe) ---------- */
  function initHero() {
    const root = $('[data-hero]'); if (!root) return;
    const track = $('[data-hero-track]', root), dots = $$('[data-hero-dots] button', root), pauseB = $('[data-hero-pause]', root);
    const slides = $$('.slide', root), vid = $('[data-hero-video]', root);
    let i = 0, paused = RM, timer;
    const go = n => {
      i = (n + slides.length) % slides.length;
      track.style.transform = `translateX(${-100 * i}%)`;
      dots.forEach((d, k) => d.setAttribute('aria-selected', String(k === i)));
      slides.forEach((s, k) => { s.setAttribute('aria-hidden', String(k !== i)); $$('a,button', s).forEach(a => { a.tabIndex = k === i ? 0 : -1; }); });
      if (vid) { if (i === 0 && !paused) vid.play().catch(() => {}); else if (i !== 0) vid.pause(); }
      schedule();
    };
    const schedule = () => { clearTimeout(timer); if (!paused) timer = setTimeout(() => go(i + 1), 6500); };
    dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
    pauseB.addEventListener('click', () => {
      paused = !paused; pauseB.classList.toggle('is-paused', paused); pauseB.setAttribute('aria-label', paused ? 'Reanudar carrusel' : 'Pausar carrusel');
      if (vid) { if (paused) vid.pause(); else if (i === 0) vid.play().catch(() => {}); }
      schedule();
    });
    if (paused) { pauseB.classList.add('is-paused'); pauseB.setAttribute('aria-label', 'Reanudar carrusel'); }
    let x0 = null;
    root.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') x0 = e.clientX; });
    root.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); });
    root.addEventListener('focusin', () => clearTimeout(timer));
    root.addEventListener('focusout', schedule);
    go(0);
  }

  /* ---------- in-view videos (play when visible, pausable) ---------- */
  function initInviewVideos() {
    $$('[data-inview-video]').forEach(v => {
      const btn = v.parentElement.querySelector('[data-vpause]');
      let user = RM;
      if (btn) {
        if (RM) btn.classList.add('is-paused');
        btn.addEventListener('click', () => { user = !user; btn.classList.toggle('is-paused', user); btn.setAttribute('aria-label', user ? 'Reproducir video' : 'Pausar video'); if (user) v.pause(); else v.play().catch(() => {}); });
      }
      if (!('IntersectionObserver' in window)) return;
      new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting && !user) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); }), { threshold: .35 }).observe(v);
    });
  }

  /* ---------- USP marquee (mobile) ---------- */
  function initMarquee() {
    const t = $('[data-marquee]'); if (!t) return;
    const l = t.querySelector('.usp-list'); const c = l.cloneNode(true); c.classList.add('dup'); c.setAttribute('aria-hidden', 'true'); t.appendChild(c);
  }

  /* ---------- variation model (size × color) from real WooCommerce variations ---------- */
  const NOUN = { rosas: 'rosas', gerberas: 'gerberas', tulipanes: 'tulipanes', girasoles: 'girasoles', peonias: 'peonías', 'peonías': 'peonías' };
  const isSize = x => /^\d+$/.test(x) || /^(peque|mediano|grande|extra)/i.test(x) || /\dcm|\d cm/i.test(x);
  const nice = s => { s = String(s).replace(/-/g, ' ').replace(/Pequeno/i, 'Pequeño'); return s.charAt(0).toUpperCase() + s.slice(1); };
  function model(p) {
    const vs = (p.v || []).filter(v => v.p > 0);
    const fl = (p.attrs.find(a => /flores/i.test(a.name)) || {}).terms || [];
    let noun = fl.length === 1 ? NOUN[fl[0].toLowerCase()] : '';
    if (!noun) { const m = p.t.toLowerCase().match(/(rosas|gerberas|tulipanes|girasoles|peon[ií]as)/); noun = m ? NOUN[m[1]] || m[1] : ''; }
    const otherAttr = p.attrs.find(a => !/tama|flores/i.test(a.name));
    const rows = vs.map(v => { const parts = String(v.t).split(' / ').map(s => s.trim()).filter(Boolean); const size = parts.find(isSize) || null; const other = parts.find(x => x !== size) || null; return { v, size, other: other ? other.toLowerCase() : null }; });
    const sizes = [];
    rows.forEach(r => { if (!r.size) return; let s = sizes.find(x => x.key === r.size); if (!s) { s = { key: r.size, label: /^\d+$/.test(r.size) ? r.size + (noun ? ' ' + noun : '') : nice(r.size), min: r.v.p, others: [] }; sizes.push(s); } s.min = Math.min(s.min, r.v.p); if (r.other && !s.others.includes(r.other)) s.others.push(r.other); });
    sizes.sort((a, b) => b.min - a.min); // bouqs order: most expensive first
    const others = [...new Set(rows.map(r => r.other).filter(Boolean))];
    return { rows, sizes, others, otherName: otherAttr ? (/color/i.test(otherAttr.name) ? 'Color' : nice(otherAttr.name)) : 'Opción', isColor: !otherAttr || /color/i.test(otherAttr.name) };
  }
  const cheapest = p => { const vs = (p.v || []).filter(v => v.p > 0); if (!vs.length) return null; const mn = Math.min(...vs.map(v => v.p)); const c = vs.filter(v => v.p === mn); return c.find(v => /rojo/i.test(v.t)) || c[0]; };
  function optSummary(p) {
    const m = model(p); const bits = [];
    if (m.sizes.length > 1) { const lab = m.sizes.slice().reverse().map(s => s.key); const allNum = lab.every(x => /^\d+$/.test(x)); bits.push(allNum ? lab.join(', ').replace(/, ([^,]*)$/, ' o $1') + (m.sizes[0].label.split(' ')[1] ? ' ' + m.sizes[0].label.split(' ').slice(1).join(' ') : '') : m.sizes.length + ' tamaños'); }
    if (m.others.length > 1) bits.push(m.others.length + (m.isColor ? ' colores' : ' opciones'));
    if (bits.length) return bits.join(' · ');
    if (p.cats.includes('complementos')) return 'Complemento para tu arreglo';
    if (/rosas/i.test(p.t)) return 'Rosas calidad exportación';
    return 'Armado a mano en Mexicali';
  }

  const TITLE = { 'bouquet-de-rosas-clasica': 'Bouquet de rosas clásica', 'bouquet-corazon-de-rosas': 'Bouquet corazón de rosas', 'bouquet-de-peonias': 'Bouquet de peonías', 'osito-con-bombones': 'Osito con chocolates Ferrero Rocher', 'orquidea-cimbidium-en-maceta': 'Orquídea cymbidium en maceta' };
  const T = p => TITLE[p.h] || p.t;
  /* ---------- product card (bouqs 260 card anatomy) ---------- */
  function card(p) {
    const c = cheapest(p); const hasR = K.priceLabel(p).startsWith('Desde');
    return `<article class="pc">
      <a class="pc-img" href="${K.pdpUrl(p)}" tabindex="-1" aria-hidden="true"><img src="${K.rel(p.img[0])}" alt="" loading="lazy" width="260" height="260"></a>
      <a class="pc-name" href="${K.pdpUrl(p)}">${esc(T(p))}</a>
      <div class="pc-price">${hasR ? 'Desde ' : ''}<b>${K.money(K.minPrice(p))}</b></div>
      <div class="pc-opt">${esc(optSummary(p))}</div>
      <button type="button" class="pc-add" data-lf-add="${p.h}"${c ? ` data-vid="${c.id}"` : ''} aria-label="Agregar ${esc(T(p))} al carrito"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Agregar al carrito</button>
      <div class="pc-chip">Primera entrega: ${availLabel()}</div>
    </article>`;
  }
  const promo = () => `<article class="pc pc-promo">
      <a class="pc-img" href="#membresia" tabindex="-1" aria-hidden="true"><img src="../assets/photo/IMG_8029.jpg" alt="" loading="lazy" width="260" height="260"><span class="pc-ov"><small>Membresía Floral</small><strong>Flores sorpresa cada mes</strong></span><span class="pc-bar">CONOCE MÁS</span></a>
      <a class="pc-name" href="#membresia">Membresía Floral</a>
      <div class="pc-price">Semanal, quincenal o mensual</div>
      <div class="pc-opt">Arreglos sorpresa de alta gama</div>
      <a class="pc-add" href="${WA}${encodeURIComponent('Hola Liefloré, quiero información de la Membresía Floral')}" target="_blank" rel="noopener">Pregunta por WhatsApp</a>
    </article>`;

  /* ---------- tabs (data from data.js) ---------- */
  const F = h => K.find(h);
  const byPrice = (a, b) => K.minPrice(a) - K.minPrice(b);
  const TABS = {
    hoy: () => ['bouquet-de-rosas-clasica', 'bouquet-de-rosas-premium', 'florero-de-rosas', 'ramo-de-100-rosas-mexicali', 'caja-primaveral-jardin-variado-con-rosas-y-gerberas', 'bouquet-primaveral', 'bouquet-50-rosas-con-corazon', 'caja-con-rosas'].map(F).filter(Boolean),
    rosas: () => K.LF.filter(p => (p.cats.includes('bouquets-de-rosas') || /rosa/i.test(p.t)) && !p.cats.includes('premium') && !p.cats.includes('complementos') && !/100|150|200|250/.test(p.t)).sort(byPrice),
    premium: () => K.LF.filter(p => p.cats.includes('premium') || p.h === 'ramo-de-100-rosas-rositas').sort(byPrice),
    cumple: () => { const s = K.LF.filter(p => !p.cats.includes('complementos') && !p.cats.includes('condolencias') && (K.occasionOf(p).includes('cumpleanos') || /gerbera|girasol|tulip|primaveral|peon/i.test(p.t))); return s.sort(byPrice); },
    cajas: () => K.LF.filter(p => p.cats.some(c => ['cajas-de-flores', 'floreros', 'plantas'].includes(c))).sort(byPrice),
    extras: () => K.inCat('complementos').sort(byPrice)
  };
  function renderTab(key) {
    const t = $('[data-grid="trend"]'); if (!t || !K) return;
    const list = (TABS[key] || TABS.hoy)();
    const html = list.map(card);
    if (key === 'hoy') html.splice(4, 0, promo());
    t.innerHTML = html.join('');
    t.scrollLeft = 0; updateTrack(t);
  }
  function setTab(key, scroll) {
    const tabs = $$('[data-tabs] button'); if (!tabs.length) return false;
    tabs.forEach(b => b.setAttribute('aria-selected', String(b.dataset.key === key)));
    renderTab(key);
    const b = tabs.find(x => x.dataset.key === key); if (b) { const strip = b.parentElement; const x0 = b.offsetLeft - strip.offsetLeft; if (x0 < strip.scrollLeft || x0 + b.offsetWidth > strip.scrollLeft + strip.clientWidth) strip.scrollTo({ left: Math.max(0, x0 - 20), behavior: 'auto' }); }
    if (scroll) $('#tienda').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
    return true;
  }
  function initTabs() {
    const wrap = $('[data-tabs]'); if (!wrap) return;
    wrap.addEventListener('click', e => { const b = e.target.closest('button'); if (b) setTab(b.dataset.key); });
    wrap.addEventListener('keydown', e => { if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return; const bs = $$('button', wrap); const i = bs.indexOf(document.activeElement); const n = bs[(i + (e.key === 'ArrowRight' ? 1 : -1) + bs.length) % bs.length]; n.focus(); setTab(n.dataset.key); });
    document.addEventListener('click', e => { const a = e.target.closest('a[data-tab]'); if (!a) return; if (setTab(a.dataset.tab, true)) e.preventDefault(); });
    const q = new URLSearchParams(location.search).get('tab');
    setTab(TABS[q] ? q : 'hoy');
  }

  /* ---------- carousels: arrows + progress ---------- */
  function updateTrack(t) {
    const key = t.dataset.track; const max = t.scrollWidth - t.clientWidth;
    const prev = $(`[data-prev="${key}"]`), next = $(`[data-next="${key}"]`);
    if (prev) prev.disabled = t.scrollLeft <= 4;
    if (next) next.disabled = t.scrollLeft >= max - 4;
    const bar = $(`[data-prog="${key}"]`);
    if (bar) { const W = bar.parentElement.clientWidth - 2 * parseFloat(getComputedStyle(bar).left); const w = Math.max(40, W * (t.clientWidth / Math.max(t.scrollWidth, 1))); bar.style.width = w + 'px'; bar.style.transform = `translateX(${max > 0 ? (t.scrollLeft / max) * (W - w) : 0}px)`; }
  }
  function initTracks() {
    $$('[data-track]').forEach(t => {
      const key = t.dataset.track;
      t.addEventListener('scroll', () => updateTrack(t), { passive: true });
      const step = dir => { const c = t.firstElementChild; const w = c ? c.getBoundingClientRect().width + 16 : 300; const n = Math.max(1, Math.floor((t.clientWidth - 60) / w)); t.scrollBy({ left: dir * n * w, behavior: RM ? 'auto' : 'smooth' }); };
      const p = $(`[data-prev="${key}"]`), n = $(`[data-next="${key}"]`);
      if (p) p.addEventListener('click', () => step(-1));
      if (n) n.addEventListener('click', () => step(1));
      updateTrack(t);
    });
    addEventListener('resize', () => $$('[data-track]').forEach(updateTrack));
  }

  /* ---------- UGC (real TikToks + workshop clips; views from social.json) ---------- */
  const TT = 'https://www.tiktok.com/@lieflore.mexicali/video/';
  const UGC = [
    { id: '7602653570340506887', src: 'social', views: 2021, label: 'Ramo de 100 rosas', prod: 'ramo-de-100-rosas-mexicali' },
    { id: '7577920905800666388', src: 'social', views: 1639, label: 'Ramo de 100 rosas rositas', prod: 'ramo-de-100-rosas-rositas' },
    { id: 'A001_06091506_C052', src: 'vid', label: 'Corazón de rosas, armado en el taller', prod: '150-rosas-corazon-mexicali', note: 'Desde nuestro taller' },
    { id: '7682197136108309778', src: 'social', views: 1150, label: 'Grandes gestos: 100 a 250 rosas', tab: 'premium' },
    { id: '7604022030635142408', src: 'social', views: 1064, label: '200 rosas rojas', prod: '200-rosas-rojas' },
    { id: '7598292102681742610', src: 'social', views: 757, label: 'Bouquet de 50 rosas mixtas', prod: '50-rosas-mixtas' },
    { id: 'IMG_7271', src: 'vid', label: 'En camino a su puerta', tab: 'premium', note: 'Desde nuestro taller' },
    { id: '7606557060347612424', src: 'social', views: 737, label: 'Bouquet de peonías', prod: 'bouquet-de-peonias' },
    { id: '7603176211359042823', src: 'social', views: 751, label: 'Bouquet de gerberas', prod: 'bouquet-de-gerberas' }
  ];
  const kfmt = n => n >= 1000 ? (n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0).replace('.', ',') + ' mil' : String(n);
  const ugcFile = u => u.src === 'social' ? `../assets/social/tt-${u.id}` : `../assets/vid/${u.id}`;
  function ugcCard(u, i) {
    const href = u.prod ? K.pdpUrl({ h: u.prod }) : '#tienda';
    return `<article class="uc">
      <button type="button" class="uc-media" data-ugc-i="${i}" aria-label="Ver video: ${esc(u.label)}"><img src="${ugcFile(u)}.jpg" alt="" loading="lazy" width="300" height="240"><span class="uc-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="f" d="M7 5l12 7-12 7z"/></svg></span>${u.views ? `<span class="uc-tag">${kfmt(u.views)} vistas en TikTok</span>` : ''}</button>
      <div class="uc-body"><a href="${href}"${u.tab ? ` data-tab="${u.tab}"` : ''}>${esc(u.label)}</a><small>${u.note || 'Desde nuestro TikTok'}</small></div>
    </article>`;
  }
  function initUgc() {
    const t = $('[data-ugc]'); if (!t) return;
    t.innerHTML = UGC.map(ugcCard).join('');
    updateTrack(t);
    t.addEventListener('click', e => { const b = e.target.closest('[data-ugc-i]'); if (b) openVm(UGC[+b.dataset.ugcI], b); });
  }
  let vmReturn = null;
  function openVm(u, from) {
    const m = $('#vm'); if (!m) return; vmReturn = from;
    const v = $('[data-vm-video]', m); v.src = ugcFile(u) + '.mp4'; v.poster = ugcFile(u) + '.jpg';
    const pa = $('[data-vm-prod]', m); pa.href = u.prod ? K.pdpUrl({ h: u.prod }) : '#tienda'; pa.textContent = u.prod ? 'Ver ' + u.label.toLowerCase() : 'Ver grandes gestos'; if (u.tab) pa.dataset.tab = u.tab; else delete pa.dataset.tab;
    const sa = $('[data-vm-src]', m); if (u.src === 'social') { sa.hidden = false; sa.href = TT + u.id; } else sa.hidden = true;
    m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('lf-lock');
    v.play().catch(() => {}); setTimeout(() => $('.vm-x', m).focus(), 40);
  }
  function closeVm() {
    const m = $('#vm'); if (!m || !m.classList.contains('is-open')) return;
    const v = $('[data-vm-video]', m); v.pause(); v.removeAttribute('src'); v.load();
    m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('lf-lock');
    if (vmReturn) vmReturn.focus();
  }
  function initVm() {
    const m = $('#vm'); if (!m) return;
    m.addEventListener('click', e => { if (e.target.closest('[data-vm-close]') || e.target.closest('[data-vm-prod]')) closeVm(); });
    m.addEventListener('keydown', e => { if (e.key !== 'Tab') return; const f = $$('button, a:not([hidden]), video', m); const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } });
  }

  /* ---------- footer accordions closed on mobile ---------- */
  function initFooter() { if (isMobile()) $$('.ft-col').forEach(d => d.removeAttribute('open')); }

  /* ======================= PDP ======================= */
  const REVIEWS = [
    { n: 'Arturo L.', t: 'Trato increíble y flores hermosas ✨', s: 5 },
    { n: 'Humberto M.', t: 'Excelente servicio! Y perfecta atención', s: 5 },
    { n: 'Fernanda D.', t: 'Excelentes arreglos, de los mejores ❤️', s: 5 },
    { n: 'Michelle A.', t: 'Excelente calidad y servicio✨', s: 5 },
    { n: 'Irenne A.', t: 'Buen precio', s: 4 },
    { n: 'Ramon O.', t: 'La verdad quiero agradecer a Lieflore por el buen trato que an ofrecido y la entraga excelente les doy un 1000 % de calificacion la verdad los recomiendo muchas gracias', s: 5 }
  ];
  const REELS = { '200-rosas-rojas': ['7604022030635142408'], 'ramo-de-100-rosas-mexicali': ['7602653570340506887'], 'ramo-de-100-rosas-rositas': ['7577920905800666388'], '50-rosas-mixtas': ['7598292102681742610'], 'bouquet-de-gerberas': ['7603176211359042823'], 'bouquet-de-peonias': ['7606557060347612424'] };
  const SW = { amarillo: '#f2c94c', blanco: '#ffffff', lila: '#c7a4d6', rojo: '#b3122e', rosado: '#e889a8', 'rosado-claro': '#f7cbd8', 'rosado claro': '#f7cbd8', variados: 'conic-gradient(#e889a8,#f2c94c,#c7a4d6,#b3122e,#e889a8)', rosas: '#e889a8' };
  const star = on => `<svg viewBox="0 0 24 24" class="${on ? '' : 'off'}" aria-hidden="true"><path class="f" d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"/></svg>`;
  const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  function parseDesc(p) {
    const raw = [p.sd, p.d].filter(Boolean).join('\n\n').replace(/ /g, ' ');
    const paras = raw.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
    const bullets = [], heads = [], rest = [];
    let lead = '';
    paras.forEach(s => {
      const kv = s.match(/^([^:\n]{3,38}):\s+(.+)$/s);
      if (/^[^:]{2,40}:$/.test(s) || /^¿[^?]+\?$/.test(s)) heads.push(s);
      else if (kv && !/https?:/.test(s)) bullets.push({ k: kv[1], v: kv[2] });
      else if (!lead) lead = s; else rest.push(s);
    });
    const fix = t => t.replace(/(el mismo d[ií]a|hoy mismo)(?![^.]*3:30)/gi, '$1 si pides antes de las 3:30 p. m.');
    return { lead: fix(lead), bullets, rest: rest.map(fix), full: paras.map(fix) };
  }

  function renderPdp() {
    const root = $('[data-pdp]'); if (!root || !K) return;
    const slug = new URLSearchParams(location.search).get('p') || 'bouquet-de-rosas-premium';
    const p = K.find(slug);
    if (!p) { root.innerHTML = `<div class="pdp-miss"><h1 class="pdp-title">No encontramos este arreglo</h1><p>Mira todos nuestros arreglos en la <a href="index.html#tienda">tienda</a>.</p></div>`; return; }
    document.title = T(p) + ' · Liefloré Mexicali';
    if (p.cats.includes('condolencias')) document.body.classList.add('is-fun');
    const isFun = p.cats.includes('condolencias');
    const m = model(p);
    const st = { size: null, other: null, add: new Set(), zip: false, date: null, buy: 'one' };
    if (m.sizes.length) st.size = m.sizes[m.sizes.length >= 3 ? 1 : m.sizes.length - 1].key;
    const othersFor = () => [...new Set(m.rows.filter(r => !m.sizes.length || r.size === st.size).map(r => r.other).filter(Boolean))];
    const pickOther = () => { const o = othersFor(); if (!o.length) { st.other = null; return; } if (!o.includes(st.other)) st.other = o.includes('rojo') ? 'rojo' : o[0]; };
    pickOther();
    const curVar = () => { if (!m.rows.length) return null; const r = m.rows.find(r => (!m.sizes.length || r.size === st.size) && (!st.other || r.other === st.other)) || m.rows.find(r => r.size === st.size) || m.rows[0]; return r.v; };
    const price = () => { const v = curVar(); return v ? v.p : p.p; };
    const addons = K.inCat('complementos').filter(a => a.h !== p.h).flatMap(a => (a.v.length > 1 ? a.v.filter(v => v.p > 0).map(v => ({ key: a.h + '|' + v.id, h: a.h, vid: v.id, t: a.t + ' ' + nice(v.t).replace('Corazon', 'corazón').replace('Feliz', 'feliz'), p: v.p, img: (a.h === 'globos' && /coraz/i.test(v.t) && a.img[1]) ? a.img[1] : a.img[0] })) : [{ key: a.h + '|' + ((a.v[0] || {}).id || ''), h: a.h, vid: (a.v[0] || {}).id, t: a.t, p: a.v[0] ? a.v[0].p : a.p, img: a.img[0] }]));
    const total = () => price() + [...st.add].reduce((s, k) => s + (addons.find(a => a.key === k) || { p: 0 }).p, 0);
    const D = parseDesc(p);
    const reels = REELS[p.h] || [];
    const COLORIMG = { 'bouquet-de-rosas-clasica': { n: 6, map: { rojo: 1, amarillo: 2, blanco: 3, lila: 4, rosado: 5, 'rosado-claro': 6 } } };
    const ci = COLORIMG[p.h];
    const srcs = ci ? Array.from({ length: ci.n }, (_, i) => `assets/p/${p.h}-${i + 1}.jpg`) : p.img;
    const imgs = srcs.map(src => ({ t: 'img', src: K.rel(src) })).concat(reels.map(id => ({ t: 'vid', id })));
    const crumbCat = p.catn[0] || 'Arreglos';

    root.innerHTML = `
      <nav class="crumbs" aria-label="Ruta"><a href="index.html">Inicio</a><span aria-hidden="true">»</span><a href="index.html#tienda">${esc(crumbCat)}</a><span aria-hidden="true">»</span><span>${esc(T(p))}</span></nav>
      <div class="pdp-grid">
        <div class="pdp-l">
          <div class="gal" aria-roledescription="carrusel" aria-label="Fotos de ${esc(p.t)}">
            <div class="gal-track" data-gal>${imgs.map((g, i) => g.t === 'img'
              ? `<div class="gal-slide"><img src="${g.src}" alt="${esc(p.t)}${imgs.length > 1 ? ', foto ' + (i + 1) : ''}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} width="651" height="651"></div>`
              : `<div class="gal-slide"><video src="../assets/social/tt-${g.id}.mp4" poster="../assets/social/tt-${g.id}.jpg" controls playsinline muted preload="none" aria-label="Video de TikTok de Liefloré"></video><span class="gal-badge">Desde nuestro TikTok</span></div>`).join('')}</div>
            ${imgs.length > 1 ? `<button class="arw prev" type="button" aria-label="Foto anterior" data-gp><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button><button class="arw next" type="button" aria-label="Foto siguiente" data-gn><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>
            <div class="gal-dots">${imgs.map((_, i) => `<button type="button" aria-label="Ver foto ${i + 1}" data-gd="${i}"${i ? '' : ' aria-current="true"'}></button>`).join('')}</div>` : ''}
          </div>
          ${imgs.length > 1 ? `<div class="gal-thumbs">${imgs.map((g, i) => `<button type="button" data-gd="${i}" aria-label="Ver ${g.t === 'img' ? 'foto' : 'video'} ${i + 1}"${i ? '' : ' aria-current="true"'}><img src="${g.t === 'img' ? g.src : `../assets/social/tt-${g.id}.jpg`}" alt="" loading="lazy">${g.t === 'vid' ? '<span class="tplay"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="f" d="M8 5l11 7-11 7z"/></svg></span>' : ''}</button>`).join('')}</div>` : ''}
          <div class="desc" data-desc>
            ${D.lead ? `<p class="lead">${esc(D.lead)}</p>` : ''}
            ${D.bullets.length ? `<ul>${D.bullets.slice(0, 3).map(b => `<li><b>${esc(b.k)}:</b> ${esc(b.v)}</li>`).join('')}</ul>` : ''}
            ${(D.rest.length || D.bullets.length > 3) ? `<div class="more">${D.bullets.length > 3 ? `<ul>${D.bullets.slice(3).map(b => `<li><b>${esc(b.k)}:</b> ${esc(b.v)}</li>`).join('')}</ul>` : ''}${D.rest.map(s => `<p>${esc(s)}</p>`).join('')}</div><button type="button" class="desc-tog" aria-expanded="false" data-desc-tog>Leer más</button>` : ''}
          </div>
        </div>
        <div class="pdp-r">
          <h1 class="pdp-title">${esc(T(p))}</h1>
          <div class="bb">
            <div class="bb-step">
              <label class="bb-l" for="zip">¿A dónde lo enviamos?</label>
              <div class="zip" data-zip><select id="zip" data-zip-sel><option value="mxl">Mexicali, B.C.</option><option value="valle">Valle de Mexicali (costo según ejido)</option></select><button type="button" class="btn btn-p" data-zip-ok>Confirmar</button></div>
              <button type="button" class="why" aria-expanded="false" data-why>¿Por qué lo preguntamos?</button>
              <p class="why-t" hidden data-why-t>Entregamos en Mexicali con envío estándar de $150 MXN. Al Valle de Mexicali la entrega puede ser posible y el costo cambia según el ejido; te lo confirmamos por WhatsApp antes de cerrar tu pedido</p>
            </div>
            <div class="bb-step datef">
              <span class="bb-l" id="date-l">Fecha de entrega*</span>
              <button type="button" class="date-btn" disabled aria-labelledby="date-l" aria-haspopup="dialog" aria-expanded="false" data-date-btn><span data-date-txt>Confirma la zona para elegir fecha</span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="1.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></svg></button>
              <div class="dp" hidden data-dp role="dialog" aria-label="Elegir fecha de entrega"></div>
              <p class="date-hint" data-date-hint></p>
            </div>
            ${m.sizes.length ? `<div class="bb-step"><p class="sz-h">${m.sizes.length >= 3 ? 'Elige tu tamaño' : 'Tamaño'}</p><div class="sz" role="group" aria-label="Tamaño" data-sz>${m.sizes.map(s => `<button type="button" data-size="${esc(s.key)}" aria-pressed="${s.key === st.size}"><span class="p">${K.money(s.min)}</span><span class="n">${esc(s.label)}</span><span class="s">${s.others.length > 1 ? s.others.length + (m.isColor ? ' colores' : ' opciones') : (s.others[0] ? esc(nice(s.others[0])) : '&nbsp;')}</span></button>`).join('')}</div></div>` : ''}
            ${m.others.length > 1 ? `<div class="bb-step"><span class="bb-l">${m.otherName}: <span data-other-name></span></span><div class="colors" role="group" aria-label="${m.otherName}" data-colors></div></div>` : ''}
            ${!isFun && addons.length ? `<div class="bb-step"><span class="bb-l">Agrega un detalle</span><div class="addons" data-addons>${addons.map((a, i) => `<button type="button" class="ao" data-ao="${a.key}" aria-pressed="false"${i > 1 ? ' hidden' : ''}><img src="${K.rel(a.img)}" alt="" loading="lazy"><span class="ao-b"><span class="ao-n">${esc(a.t)}</span><span class="ao-p">+${K.money(a.p)}</span><span class="ao-a">Agregar</span></span><svg class="ao-ck" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>`).join('')}</div>${addons.length > 2 ? `<button type="button" class="ao-more" data-ao-more>Ver ${addons.length - 2} complementos más</button>` : ''}</div>` : ''}
            <div class="bb-step msg"><label class="bb-l" for="msg">Mensaje para la tarjeta</label><textarea id="msg" maxlength="240" placeholder="Escribe aquí tu mensaje" data-msg></textarea><p class="msg-c"><span data-msg-c>0</span>/240</p></div>
            ${isFun ? '' : `<div class="bb-step"><p class="po-h">Opciones de compra</p>
              <label class="po is-on" data-po="one"><span class="po-r"><input type="radio" name="buy" value="one" checked> <span>Compra única: <span data-po-price>${K.money(total())}</span></span></span></label>
              <label class="po" data-po="mem"><span class="po-r"><input type="radio" name="buy" value="mem"> <span>Membresía Floral <small>· te cotizamos por WhatsApp</small></span></span>
                <span class="po-panel"><p>Arreglos sorpresa de alta gama</p><ul><li>${check}<span><b>Tú eliges la frecuencia:</b> semanal, quincenal o mensual</span></li><li>${check}<span><b>Atención directa</b> y personalizada</span></li><li>${check}<span><b>Hecho a mano</b> en nuestro taller en Mexicali</span></li></ul></span></label></div>`}
            <button type="button" class="btn btn-p atc" data-atc>Agregar al carrito – <span data-atc-p>${K.money(total())}</span></button>
            <ul class="trust">
              <li><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span>Entrega el mismo día en Mexicali si pides antes de las 3:30 p. m.</span></li>
              <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg><span>Seguimiento de tu pedido en tiempo real</span></li>
              <li><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="1.5"/><path d="M3 10h18"/></svg><span>Pago con tarjeta, PayPal o Google Pay · o pide por <a href="${WA}${encodeURIComponent('Hola Liefloré, quiero pedir: ' + p.t)}" target="_blank" rel="noopener">WhatsApp</a></span></li>
            </ul>
            <div class="pdp-acc">
              ${D.bullets.length ? `<details class="acc"><summary>Incluye<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></summary><div class="acc-b"><ul>${D.bullets.map(b => `<li><b>${esc(b.k)}:</b> ${esc(b.v)}</li>`).join('')}</ul></div></details>` : ''}
              <details class="acc"><summary>Descripción<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></summary><div class="acc-b"><p>${esc(D.full.filter(s => !D.bullets.some(b => s.startsWith(b.k + ':'))).join('\n\n')) || esc(p.t)}</p></div></details>
              <details class="acc"><summary>Entrega en Mexicali<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></summary><div class="acc-b"><ul><li>Para pedidos web antes de las 3:30 p. m. puedes elegir entrega el mismo día en Mexicali</li><li>Envío estándar en Mexicali: $150 MXN. Express, nocturno o ciertas zonas pueden tener un cargo adicional que te informamos antes de confirmar</li><li>Cuando tu arreglo sale del taller recibes un SMS o correo con la ruta del repartidor en el mapa</li><li>Lunes a sábado 8:00 a. m. – 6:30 p. m. Domingos sin servicio regular</li></ul></div></details>
              <details class="acc"><summary>Cambios y cancelaciones<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></summary><div class="acc-b"><p>Las imágenes del catálogo son ilustrativas: por la naturaleza artesanal y la temporada de las flores puede haber ligeras variaciones en tonos, bases o papeles, siempre respetando el estilo, volumen y categoría del arreglo. Una vez confirmado el pedido y procesado el pago no se realizan reembolsos; en casos excepcionales y con autorización, el monto puede quedar como saldo a favor para una nueva fecha. <a href="https://www.lieflores.com/terminos-y-condiciones/" target="_blank" rel="noopener">Términos y condiciones</a></p></div></details>
            </div>
          </div>
        </div>
      </div>`;

    { const acc = $('.pdp-acc', root); if (acc) $('.pdp-l', root).appendChild(acc); }
    /* gallery */
    const gt = $('[data-gal]', root);
    const gIdx = () => Math.round(gt.scrollLeft / gt.clientWidth);
    const gGo = i => gt.scrollTo({ left: i * gt.clientWidth, behavior: RM ? 'auto' : 'smooth' });
    const gPaint = () => { const i = gIdx(); $$('[data-gd]', root).forEach(b => b.setAttribute('aria-current', String(+b.dataset.gd === i))); $$('video', gt).forEach((v, k) => { if (!v.closest('.gal-slide') || Math.round(v.closest('.gal-slide').offsetLeft / gt.clientWidth) !== i) v.pause(); }); };
    gt.addEventListener('scroll', () => { clearTimeout(gt._t); gt._t = setTimeout(gPaint, 60); }, { passive: true });
    root.addEventListener('click', e => {
      const d = e.target.closest('[data-gd]'); if (d) gGo(+d.dataset.gd);
      if (e.target.closest('[data-gp]')) gGo(Math.max(0, gIdx() - 1));
      if (e.target.closest('[data-gn]')) gGo((gIdx() + 1) % imgs.length);
    });

    /* description toggle */
    const dt = $('[data-desc-tog]', root);
    if (dt) dt.addEventListener('click', () => { const o = $('[data-desc]', root).classList.toggle('is-open'); dt.setAttribute('aria-expanded', String(o)); dt.textContent = o ? 'Leer menos' : 'Leer más'; });

    /* zone gate → date picker (bouqs zip gate adapted) */
    const zipOk = $('[data-zip-ok]', root), dateB = $('[data-date-btn]', root), dateT = $('[data-date-txt]', root), dp = $('[data-dp]', root), hint = $('[data-date-hint]', root);
    const sel = $('[data-zip-sel]', root);
    const why = $('[data-why]', root), whyT = $('[data-why-t]', root);
    why.addEventListener('click', () => { whyT.hidden = !whyT.hidden; why.setAttribute('aria-expanded', String(!whyT.hidden)); });
    const paintHint = () => {
      const f = firstAvail();
      hint.innerHTML = sel.value === 'valle' ? 'Valle de Mexicali: el costo y las condiciones cambian según el ejido; te confirmamos por WhatsApp' : (f.today ? `Llega <b>hoy</b> si pides en las próximas ${leftText()} (corte 3:30 p. m., hora de Mexicali)` : `Primera entrega disponible: <b>${availLabel().toLowerCase()}</b> · corte diario 3:30 p. m.`);
    };
    zipOk.addEventListener('click', e => { e.stopPropagation();
      st.zip = true; $('[data-zip]', root).classList.add('is-ok'); zipOk.textContent = 'Listo ✓';
      dateB.disabled = false; if (!st.date) dateT.textContent = 'Elige una fecha'; paintHint();
      openDp();
    });
    sel.addEventListener('change', () => { if (st.zip) paintHint(); });
    let view = null;
    const label = d => { const s = d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }); return s.charAt(0).toUpperCase() + s.slice(1); };
    function drawDp() {
      const f = firstAvail(); const min = f.d; const now = mxNow();
      const y = view.getFullYear(), mo = view.getMonth();
      const first = new Date(y, mo, 1), days = new Date(y, mo + 1, 0).getDate();
      const lim = new Date(now.getFullYear(), now.getMonth() + 3, 0);
      const canPrev = new Date(y, mo, 0) >= new Date(now.getFullYear(), now.getMonth(), 1) && (y > now.getFullYear() || mo > now.getMonth());
      let cells = ['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => `<span aria-hidden="true">${d}</span>`).join('');
      for (let i = 0; i < first.getDay(); i++) cells += '<i></i>';
      for (let d = 1; d <= days; d++) {
        const dt = new Date(y, mo, d); const off = dt < min || dt.getDay() === 0 || dt > lim;
        const isT = ymd(dt) === ymd(now);
        cells += `<button type="button" data-day="${ymd(dt)}"${off ? ' disabled' : ''} aria-pressed="${st.date === ymd(dt)}" class="${isT ? 'today' : ''}" aria-label="${label(dt)}${off ? ', no disponible' : ''}">${d}</button>`;
      }
      dp.innerHTML = `<div class="dp-h"><button type="button" data-dpm="-1" aria-label="Mes anterior"${canPrev ? '' : ' disabled'}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button><span>${MONTHS[mo]} ${y}</span><button type="button" data-dpm="1" aria-label="Mes siguiente"${new Date(y, mo + 1, 1) > lim ? ' disabled' : ''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button></div><div class="dp-g">${cells}</div><p class="dp-f">Domingos sin servicio regular · Hoy solo si pides antes de las 3:30 p. m.</p>`;
    }
    function openDp() { const n = mxNow(); view = view || new Date(n.getFullYear(), n.getMonth(), 1); drawDp(); dp.hidden = false; dateB.setAttribute('aria-expanded', 'true'); const b = dp.querySelector('[aria-pressed="true"]') || dp.querySelector('[data-day]:not(:disabled)'); if (b) setTimeout(() => b.focus(), 30); }
    const closeDp = () => { dp.hidden = true; dateB.setAttribute('aria-expanded', 'false'); };
    dateB.addEventListener('click', e => { e.stopPropagation(); if (dp.hidden) openDp(); else closeDp(); });
    dp.addEventListener('click', e => {
      e.stopPropagation();
      const mv = e.target.closest('[data-dpm]'); if (mv) { view = new Date(view.getFullYear(), view.getMonth() + +mv.dataset.dpm, 1); drawDp(); return; }
      const d = e.target.closest('[data-day]'); if (!d || d.disabled) return;
      st.date = d.dataset.day; const [yy, mm, dd] = st.date.split('-').map(Number);
      try { const L = JSON.parse(localStorage.getItem('lf-lead') || '{}'); L.fecha = st.date; localStorage.setItem('lf-lead', JSON.stringify(L)); } catch (er) {}
      dateT.textContent = label(new Date(yy, mm - 1, dd)) + (st.date === ymd(mxNow()) ? ' · hoy' : '');
      dateB.classList.remove('is-err'); closeDp(); dateB.focus();
    });
    document.addEventListener('click', e => { if (!e.target.closest('.datef')) closeDp(); });
    dp.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDp(); dateB.focus(); } });

    /* sizes + colors */
    const paintColors = () => {
      const c = $('[data-colors]', root); if (!c) return;
      const o = othersFor();
      c.innerHTML = o.map(x => `<button type="button" data-other="${esc(x)}" aria-pressed="${x === st.other}">${m.isColor ? `<i style="background:${SW[x] || '#ddd'}"></i>` : ''}${esc(nice(x))}</button>`).join('');
      const n = $('[data-other-name]', root); if (n) n.textContent = st.other ? nice(st.other) : '';
    };
    const paintPrice = () => {
      const t = K.money(total());
      $$('[data-atc-p]').forEach(n => { n.textContent = t; });
      const pp = $('[data-po-price]', root); if (pp) pp.textContent = t;
    };
    paintColors();
    root.addEventListener('click', e => {
      const s = e.target.closest('[data-size]');
      if (s) { st.size = s.dataset.size; $$('[data-size]', root).forEach(b => b.setAttribute('aria-pressed', String(b === s))); pickOther(); paintColors(); paintPrice(); }
      const o = e.target.closest('[data-other]');
      if (o) { st.other = o.dataset.other; paintColors(); paintPrice(); if (ci && ci.map[st.other]) gGo(ci.map[st.other] - 1); }
      const a = e.target.closest('[data-ao]');
      if (a) { const k = a.dataset.ao; if (st.add.has(k)) st.add.delete(k); else st.add.add(k); const on = st.add.has(k); a.setAttribute('aria-pressed', String(on)); a.querySelector('.ao-a').textContent = on ? 'Quitar' : 'Agregar'; paintPrice(); }
      const mr = e.target.closest('[data-ao-more]');
      if (mr) { $$('.ao[hidden]', root).forEach(b => { b.hidden = false; }); mr.remove(); }
    });

    /* card message */
    const msg = $('[data-msg]', root), mc = $('[data-msg-c]', root);
    msg.addEventListener('input', () => { mc.textContent = msg.value.length; });

    /* purchasing options */
    const atc = $('[data-atc]', root);
    const sticky = $('[data-satc]');
    const paintBuy = () => {
      $$('[data-po]', root).forEach(l => l.classList.toggle('is-on', l.dataset.po === st.buy));
      const mem = st.buy === 'mem';
      [atc, sticky && sticky.querySelector('button')].filter(Boolean).forEach(b => {
        b.classList.toggle('btn-wa', mem); b.classList.toggle('btn-p', !mem);
        b.innerHTML = mem ? 'Quiero mi membresía por WhatsApp' : `Agregar al carrito – <span data-atc-p>${K.money(total())}</span>`;
      });
    };
    root.addEventListener('change', e => { if (e.target.name === 'buy') { st.buy = e.target.value; paintBuy(); } });

    /* add to cart → shared drawer; date + message go to the checkout popup prefill (lf-lead) */
    const doAdd = e => { if (e) e.stopPropagation();
      if (st.buy === 'mem') { window.open(WA + encodeURIComponent(`Hola Liefloré, quiero información de la Membresía Floral (me gustó: ${p.t})`), '_blank', 'noopener'); return; }
      if (!st.zip || !st.date) {
        const tgt = st.zip ? dateB : $('[data-zip]', root);
        tgt.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' });
        if (!st.zip) { zipOk.focus(); hint.innerHTML = '<b>Confirma la zona y elige una fecha de entrega</b>'; }
        else { dateB.classList.add('is-err'); openDp(); }
        return;
      }
      try { const L = JSON.parse(localStorage.getItem('lf-lead') || '{}'); L.fecha = st.date; if (msg.value.trim()) L.msg = msg.value.trim(); if (sel.value === 'valle') L.dir = L.dir || 'Valle de Mexicali (ejido: )'; localStorage.setItem('lf-lead', JSON.stringify(L)); } catch (er) {}
      const v = curVar();
      K.add(p.h, v ? v.id : undefined);
      [...st.add].forEach(k => { const a = addons.find(x => x.key === k); if (a) K.add(a.h, a.vid); });
    };
    atc.addEventListener('click', doAdd);
    if (sticky) {
      sticky.querySelector('button').addEventListener('click', doAdd);
      if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(en => sticky.classList.toggle('is-hidden', en.isIntersecting)), { threshold: 0 }).observe(atc);
    }
    paintBuy(); paintPrice();

    /* cross-sell (same category, by closeness of price) */
    const xs = $('[data-grid="xs"]');
    if (xs) {
      const base = K.minPrice(p);
      const SOBER = ['orquidea-cimbidium-en-maceta'];
      const pool = isFun ? SOBER.map(F).filter(Boolean) : K.LF.filter(x => x.h !== p.h && !x.cats.includes('complementos') && !x.cats.includes('condolencias'));
      const same = pool.filter(x => x.cats.some(c => p.cats.includes(c)));
      const list = [...same, ...pool.filter(x => !same.includes(x))].sort((a, b) => Math.abs(K.minPrice(a) - base) - Math.abs(K.minPrice(b) - base)).slice(0, 10);
      xs.innerHTML = list.map(card).join('');
      if (list.length <= 3) { const pr = $('[data-prog="xs"]'); if (pr) pr.parentElement.hidden = true; $$('[data-prev="xs"],[data-next="xs"]').forEach(b => { b.parentElement.hidden = true; }); }
      if (isFun) { const rv = $('.rv'); if (rv) rv.hidden = true; const mf = $('.mf'); if (mf) mf.hidden = true; const h = $('#xs-h'); if (h) h.textContent = 'Otras opciones para acompañar'; $$('.ann .dk').forEach(n => { n.hidden = true; }); }
      updateTrack(xs);
    }
    K.Cart.upsell = addons.map(a => a.h).filter((h, i, s) => s.indexOf(h) === i);
  }

  function renderReviews() {
    const t = $('[data-reviews]'); if (!t) return;
    t.innerHTML = REVIEWS.map(r => `<article class="rc"><div class="rc-st" role="img" aria-label="${r.s} de 5 estrellas">${[1, 2, 3, 4, 5].map(i => star(i <= r.s)).join('')}</div><q>${esc(r.t)}</q><div class="rc-who"><span class="rc-av" aria-hidden="true">${r.n.split(' ').map(w => w[0]).join('')}</span><div><b>${esc(r.n)}</b><small>Reseña en Google</small></div></div></article>`).join('');
    updateTrack(t);
  }

  /* ---------- boot ---------- */
  function boot() {
    if (!K) return;
    try { const L = JSON.parse(localStorage.getItem('lf-lead') || '{}'); const f = ymd(firstAvail().d); if (!L.fecha || L.fecha < f) { L.fecha = f; localStorage.setItem('lf-lead', JSON.stringify(L)); } } catch (er) {}
    Object.keys(TITLE).forEach(h => { const p = K.find(h); if (p) p.t = TITLE[h]; });
    initPill(); initMega(); initNav(); initHero(); initMarquee(); initTabs(); initUgc(); initVm(); initInviewVideos(); initFooter();
    renderPdp(); renderReviews();
    initTracks();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
