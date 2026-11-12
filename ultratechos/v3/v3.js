/* Ultra Techos v3 — interactions (Jetson motion model) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => innerWidth < 768;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const store = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };

  requestAnimationFrame(() => document.body.classList.add('ready'));
  if (/[?&]shot=render/.test(location.search)) document.documentElement.classList.add('render');
  /* hero: real-projects montage (one looping video, caption follows the cuts) */
  const hv = document.getElementById('hvid'), slab = document.getElementById('slab'), hp = document.getElementById('hpause');
  const CUT = 2.6, LABELS = ['Casa Dominical · Ultra Therm', 'Canchas en Huacas · Ultra 35', 'Casa Baulas · Guanacaste', 'Plaza Diagonal', 'Huacas · vista amplia', 'Huacas · cubiertas curvas Ultra 35', 'Casa en el bosque', 'Casa Baulas · vista cenital', 'Cancha de pádel', 'Canchas en Huacas · Ultra 35', 'Casa Baulas · Guanacaste', 'Canchas techadas'];
  if (hv) {
    let li = 0;
    const setLab = i => { if (i === li) return; li = i; slab.classList.add('fade'); setTimeout(() => { slab.textContent = LABELS[li]; slab.classList.remove('fade'); }, 250); };
    hv.addEventListener('timeupdate', () => setLab(Math.min(LABELS.length - 1, Math.floor(hv.currentTime / CUT))));
    const sync = () => { const paused = hv.paused; hp.classList.toggle('paused', paused); hp.setAttribute('aria-pressed', String(paused)); hp.setAttribute('aria-label', paused ? 'Reproducir video' : 'Pausar video'); };
    hv.addEventListener('play', sync); hv.addEventListener('pause', sync);
    hp.addEventListener('click', () => { if (hv.paused) { hv.play().catch(() => {}); } else hv.pause(); });
    if (RM) { hv.removeAttribute('autoplay'); hv.pause(); hv.preload = 'none'; document.documentElement.classList.add('rm'); }
    else hv.play().catch(() => {});
    sync();
  }

  /* ---------- header: hide on scroll down, show on up ---------- */
  const hdr = $('#hdr'); let lastY = scrollY;
  const mega = $('#mega'), mbtn = $('#mbtn');
  const closeMega = () => { mega.classList.remove('open'); mbtn.setAttribute('aria-expanded', 'false'); };
  mbtn.addEventListener('click', () => { const o = !mega.classList.contains('open'); mega.classList.toggle('open', o); mbtn.setAttribute('aria-expanded', String(o)); });
  let megaT; [mbtn, mega].forEach(el => { el.addEventListener('mouseenter', () => { clearTimeout(megaT); if (!mobile()) { mega.classList.add('open'); mbtn.setAttribute('aria-expanded', 'true'); } }); el.addEventListener('mouseleave', () => { megaT = setTimeout(closeMega, 220); }); });
  $$('#mega a').forEach(a => a.addEventListener('click', closeMega));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMega(); closeAll(); } });

  const mm = $('#mmenu');
  $('#burger').addEventListener('click', () => { mm.classList.add('open'); mm.setAttribute('aria-hidden', 'false'); });
  const closeMM = () => { mm.classList.remove('open'); mm.setAttribute('aria-hidden', 'true'); };
  $('#mclose').addEventListener('click', closeMM); $$('#mmenu a, #mmenu button').forEach(a => a.addEventListener('click', closeMM));

  /* ---------- hero question bar (Tesla "Ask a question" → real FAQ answers) ---------- */
  const FAQ = [
    'Sí. Los polímeros de Ultra Techos no tienen metal: no se oxidan con la humedad ni con el salitre. Por eso los elegimos para casas de playa y para un hotel dentro del Parque Nacional Tortuguero.',
    'Evaluamos tu proyecto: podemos instalar nosotros o compartirte un listado de instaladores certificados.',
    'Idealmente planos o medidas de tu proyecto, y saber en qué etapa de construcción estás. Con eso te respondemos en menos de 24 horas hábiles.',
    'Estamos en Heredia, Lagunilla (Bodegas Lagunilla, Bodega #19) y atendemos proyectos en todo el país.'
  ];
  const ans = $('#answer');
  $$('.chip').forEach(c => c.addEventListener('click', () => {
    const on = c.getAttribute('aria-pressed') === 'true';
    $$('.chip').forEach(x => x.setAttribute('aria-pressed', 'false'));
    if (on) { ans.classList.remove('show'); return; }
    c.setAttribute('aria-pressed', 'true');
    ans.innerHTML = `<strong>${c.textContent}</strong><br>${FAQ[+c.dataset.q]} <a href="#" data-lead>Cotizá tu techo →</a>`;
    ans.classList.remove('show'); void ans.offsetWidth; ans.classList.add('show');
  }));
  const qs = ['¿Sirve cerca del mar?', '¿Hace ruido cuando llueve?', '¿Cuánto tarda la instalación?', '¿Llegan a Guanacaste?'];
  let qi = 0; const askIn = $('#askIn');
  if (!RM) setInterval(() => { if (document.activeElement !== askIn && !askIn.value) { qi = (qi + 1) % qs.length; askIn.placeholder = qs[qi]; } }, 3200);
  $('#askForm').addEventListener('submit', e => {
    e.preventDefault();
    const q = askIn.value.trim() || askIn.placeholder;
    window.open('https://wa.me/50670121636?text=' + encodeURIComponent('Hola Ultra Techos, ' + q), '_blank', 'noopener');
  });

  /* ---------- product rail: pinned horizontal scroll (desktop) ---------- */
  const rail = $('#rail'), track = $('#track'), dots = $$('#railProg i'), prods = $$('.prod');
  const sizeRail = () => {
    if (mobile()) { rail.style.height = ''; return; }
    const dist = track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft) * 0 + 120;
    rail.style.height = (innerHeight + Math.max(0, track.scrollWidth - innerWidth * .5 - 450)) + 'px';
  };
  const railMax = () => Math.max(0, track.scrollWidth - innerWidth / 2 - 450);
  $$('[data-go]').forEach(a => a.addEventListener('click', e => {
    if (mobile()) { e.preventDefault(); prods[+a.dataset.go].scrollIntoView({ behavior: RM ? 'auto' : 'smooth', inline: 'center', block: 'nearest' }); rail.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); return; }
    e.preventDefault();
    const i = +a.dataset.go, max = railMax(), per = max / (prods.length - 1);
    const top = rail.getBoundingClientRect().top + scrollY + i * per;
    scrollTo({ top, behavior: RM ? 'auto' : 'smooth' });
  }));

  /* ---------- horizontal card dots ---------- */
  const mkDots = (wrap, track, n) => {
    wrap.innerHTML = Array.from({ length: n }, (_, i) => `<button aria-label="Ir a la tarjeta ${i + 1}"${i ? '' : ' class="on"'}><i></i></button>`).join('');
    const btns = $$('button', wrap), items = [...track.children];
    btns.forEach((b, i) => b.addEventListener('click', () => track.scrollTo({ left: items[i].offsetLeft - items[0].offsetLeft, behavior: RM ? 'auto' : 'smooth' })));
    track.addEventListener('scroll', () => {
      const x = track.scrollLeft; let k = 0, best = 1e9;
      items.forEach((it, i) => { const d = Math.abs(it.offsetLeft - items[0].offsetLeft - x); if (d < best) { best = d; k = i; } });
      btns.forEach((b, i) => b.classList.toggle('on', i === k));
    }, { passive: true });
  };
  mkDots($('#hdots'), $('#hcards'), $$('#hcards .hcard').length);
  /* Mill-style social-proof bento: staggered reveal (col x 90ms + row x 140ms) + video pause buttons */
  const mio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); mio.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
  $$('#millGrid .mill__col').forEach((col, ci) => [...col.children].forEach((c, ri) => { c.style.transitionDelay = (ci * 90 + ri * 140) + 'ms'; mio.observe(c); }));
  $$('.mill__head .mrv').forEach((c, i) => { c.style.transitionDelay = (i * 90) + 'ms'; mio.observe(c); });
  $$('.mc__pp').forEach(b => { const v = b.parentElement.querySelector('video'); const sync = () => { b.classList.toggle('paused', v.paused); b.setAttribute('aria-label', v.paused ? 'Reproducir video' : 'Pausar video'); };
    b.addEventListener('click', () => { if (v.paused) { v.dataset.hold = ''; v.play().catch(() => {}); } else { v.dataset.hold = '1'; v.pause(); } }); v.addEventListener('play', sync); v.addEventListener('pause', sync); sync(); });

  $$('.hcard').forEach(card => {
    const b = $('button.row', card);
    b.addEventListener('click', () => { const o = !card.classList.contains('open'); card.classList.toggle('open', o); b.setAttribute('aria-expanded', String(o)); });
  });

  /* ---------- scroll engine ---------- */
  const heroCard = $('#heroCard'), hero = $('#hero');
  const collage = $$('#collage .c');
  const brains = $('#brains'), tile = $('#tile'), bp = $('#bp');
  const quote = $('#quote'), qcard = $('#qcard');
  const appImg = $('#appImg');
  const sbar = $('#sbar'), wa = $('.wa');
  let ticking = false;
  const frame = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight, vw = innerWidth, m = mobile();
    // header
    if (y > lastY + 4 && y > 140 && !mega.classList.contains('open')) hdr.classList.add('hide');
    else if (y < lastY - 4) hdr.classList.remove('hide');
    hdr.classList.toggle('scrolled', y > 40); lastY = y;
    // hero → inset rounded card (Jetson)
    if (!m) {
      const p = clamp(y / (vh * .3));
      const ins = p * 20;
      heroCard.style.clipPath = `inset(${ins}px ${ins}px ${ins}px ${ins}px round ${p * 16}px)`;
    } else heroCard.style.clipPath = '';
    // sticky bar visible after hero, hidden over final CTA/footer
    const qr = quote.getBoundingClientRect();
    sbar.classList.toggle('off', y < vh * .6 || qr.top < vh * .6);
    wa.classList.toggle('off', y < vh * .6);
    // product rail
    if (!m) {
      const r = rail.getBoundingClientRect(), max = railMax();
      const p = clamp(-r.top / Math.max(1, rail.offsetHeight - vh));
      track.style.transform = `translate3d(${-p * max}px,0,0)`;
      const k = Math.round(p * (prods.length - 1));
      dots.forEach((d, i) => d.classList.toggle('on', i === k));
    }
    // collage parallax
    if (!m && !RM) collage.forEach(c => {
      const r = c.getBoundingClientRect(), sp = parseFloat(c.dataset.sp) || 0;
      c.style.transform = `translate3d(0,${(r.top + r.height / 2 - vh / 2) * sp}px,0)`;
    });
    // collage tiles: slow 1.00 -> 1.04 push-in while the section scrolls through
    if (!RM && collage.length) { const r = collage[0].parentElement.getBoundingClientRect(); const p = clamp((vh - r.top) / (vh + r.height)); collage.forEach(c => { const v = c.querySelector('video'); if (v) v.style.transform = `scale(${1 + p * .04})`; }); }
    // app image scale-down
    if (!RM) { const r = appImg.parentElement.getBoundingClientRect(); const p = clamp(1 - r.top / vh); appImg.style.transform = `scale(${1.08 - p * .08})`; }
    // brains: tile travels from behind title to below it
    if (!m) {
      const r = brains.getBoundingClientRect(); const p = clamp(-r.top / Math.max(1, brains.offsetHeight - vh));
      const st = brains.firstElementChild, h2 = st.querySelector('h2'), bpEl = bp; const h2b = h2.offsetTop + h2.offsetHeight, bpb = bpEl.offsetTop + bpEl.offsetHeight; const y0 = h2b - 150, y1 = bpb + 36; const q2 = clamp(p * 1.7), e2 = 1 - Math.pow(1 - q2, 3); tile.style.transform = `translate3d(0,${y0 + (y1 - y0) * e2}px,0) rotate(${-8 + e2 * 8}deg) scale(${.92 + e2 * .08})`;
      bp.classList.toggle('in', p > .5);
    }
    // quote card expands to full
    if (!m) {
      const r = quote.getBoundingClientRect(); const p = clamp((-r.top) / (quote.offsetHeight - vh) * 1.6);
      const e = 1 - Math.pow(1 - p, 3);
      const W = Math.min(vw - 128, 1312), H = vh - 64;
      qcard.style.width = (308 + (W - 308) * e) + 'px';
      qcard.style.height = (418 + (H - 418) * e) + 'px';
      quote.classList.toggle('full', p > .82);
    } else { qcard.style.width = ''; qcard.style.height = ''; quote.classList.add('full'); }
    // offer modal once (Jetson shows it while browsing)
    if (!offered && y > (document.documentElement.scrollHeight - vh) * .34) { offered = true; if (!store.get('ut-offer')) { store.set('ut-offer', '1'); openOv($('#offer')); } }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  let offered = /[?&]shot/.test(location.search);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { sizeRail(); onScroll(); });
  addEventListener('load', () => { sizeRail(); onScroll(); });
  sizeRail(); frame();

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  /* ---------- autoplay muted videos in view ---------- */
  const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { if (v.dataset.hold === '1') return; v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); }), { threshold: .3 });
  $$('video[data-auto]').forEach(v => vio.observe(v));
  // clips that must skip their opening (e.g. the beach part of baulas3): loop back to data-from, never to 0
  $$('video[data-from]').forEach(v => { const f = +v.dataset.from; const back = () => { v.currentTime = f; v.play().catch(() => {}); };
    v.addEventListener('loadedmetadata', () => { if (v.currentTime < f) v.currentTime = f; });
    v.addEventListener('timeupdate', () => { if (v.currentTime < f - .2) v.currentTime = f; else if (v.duration && v.currentTime > v.duration - .15) back(); });
    v.addEventListener('ended', back); });
  $$('[data-snd]').forEach(b => b.addEventListener('click', () => { const v = b.parentElement.querySelector('video'); v.muted = !v.muted; if (!v.muted) { v.currentTime = 0; v.play(); } b.setAttribute('aria-label', v.muted ? 'Activar sonido' : 'Silenciar'); }));

  /* ---------- overlays ---------- */
  let lastFocus = null;
  const openOv = ov => { lastFocus = document.activeElement; ov.classList.add('open'); document.documentElement.style.overflow = 'hidden'; setTimeout(() => { const f = ov.querySelector('input,select,button'); f && f.focus({ preventScroll: true }); }, 60); };
  const closeOv = ov => { ov.classList.remove('open'); if (!$$('.ovl.open').length) document.documentElement.style.overflow = ''; const v = ov.querySelector('video'); if (v) v.pause(); lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true }); };
  const closeAll = () => $$('.ovl.open').forEach(closeOv);
  $$('.ovl').forEach(ov => { ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-close]')) closeOv(ov); }); });

  // video modal
  const vmod = $('#vmod'), vp = $('#vplayer');
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-video]'); if (!t) return;
    e.preventDefault(); vp.src = t.dataset.video; vp.poster = t.dataset.video.replace('.mp4', '.jpg'); openOv(vmod); vp.play().catch(() => {});
  });

  // lead modal
  const lead = $('#lead'), form = $('#leadForm'), steps = $('#steps');
  const step = n => {
    $$('.lstep', form).forEach(s => s.hidden = +s.dataset.step !== n);
    $('#ldone').hidden = true; $('.lnote', lead).hidden = false;
    steps.classList.toggle('two', n === 2); steps.children[2].classList.toggle('on', n === 2);
  };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-lead]'); if (!t) return;
    e.preventDefault();
    const v = t.dataset.lead;
    $('#leadK').textContent = v === 'asesoria' ? 'Asesoría técnica' : (v ? v : 'Cotización directa');
    $('#leadT').textContent = v === 'asesoria' ? 'Agendá tu asesoría con un ingeniero' : 'Encontrá el techo ideal para tu proyecto';
    if (v && v !== 'asesoria') $('#leadProd').value = v;
    closeAll(); step(1); openOv(lead);
  });
  $('#next').addEventListener('click', () => {
    const req = $$('[data-step="1"] [required]', form);
    const bad = req.filter(i => !i.value.trim());
    req.forEach(i => i.setAttribute('aria-invalid', String(!i.value.trim())));
    $('#lerr1').textContent = bad.length ? 'Completá nombre, WhatsApp y ubicación para continuar.' : '';
    if (bad.length) { bad[0].focus(); return; }
    step(2);
  });
  $('#back').addEventListener('click', () => step(1));
  form.addEventListener('submit', e => {
    e.preventDefault(); // demo: nothing is sent anywhere
    $$('.lstep', form).forEach(s => s.hidden = true);
    $('#ldone').hidden = false; $('.lnote', lead).hidden = true;
    try { localStorage.setItem('ut-v3-lead', JSON.stringify(Object.fromEntries(new FormData(form)))); } catch (err) {}
  });
  $('#offerForm').addEventListener('submit', e => {
    e.preventDefault();
    $('#leadLoc').value = $('#offerLoc').value;
    closeOv($('#offer')); $('#leadK').textContent = 'Ultra Colonial'; $('#leadProd').value = 'Ultra Colonial'; step(1); openOv(lead);
  });
  $('#news').addEventListener('submit', e => { e.preventDefault(); $('#newsOk').style.display = 'block'; e.target.reset(); });
})();
