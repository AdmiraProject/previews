/* Ultra Techos v6 — B2B landing interactions. Nothing is sent anywhere: forms preventDefault + success state. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = () => innerWidth < 900;

  /* NAV */
  const nav = $('#nav'), burger = $('#burger'), mnav = $('#mnav');
  const onScroll = () => nav.classList.toggle('is-solid', scrollY > 40 || mnav.classList.contains('is-open'));
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  burger.addEventListener('click', () => {
    const open = !mnav.classList.contains('is-open');
    mnav.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', open); onScroll();
  });
  $$('a', mnav).forEach(a => a.addEventListener('click', () => { mnav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); onScroll(); }));

  /* HERO + CHAPTER VIDEO (lazy, size by viewport, skipped on reduced motion) */
  const bgVids = [['.hero', '#heroVid'], ...$$('.chap').map(c => [c, 'video'])];
  const loadBg = (host, vid) => {
    if (RM || !vid || vid.dataset.loaded) return;
    const src = small() && vid.dataset.srcSm ? vid.dataset.srcSm : vid.dataset.src;
    if (!src) return;
    vid.dataset.loaded = 1; vid.src = src;
    vid.addEventListener('playing', () => host.classList.add('has-video'), { once: true });
    vid.play().catch(() => {});
  };
  const bgIO = new IntersectionObserver(es => es.forEach(e => {
    const host = e.target, vid = host._vid;
    if (e.isIntersecting) { loadBg(host, vid); if (vid.dataset.loaded) vid.play().catch(() => {}); }
    else if (vid && vid.dataset.loaded) vid.pause();
  }), { rootMargin: '200px 0px' });
  bgVids.forEach(([h, v]) => { const host = typeof h === 'string' ? $(h) : h; if (!host) return; host._vid = $(v, host) || $(v); if (host._vid) bgIO.observe(host); });

  /* data-auto videos: play muted only while visible */
  const autoIO = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting && !RM && v.dataset.hold !== '1') { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
  }), { threshold: .25 });
  $$('video[data-auto]').forEach(v => { v.muted = true; autoIO.observe(v); });

  /* PROOF video pause/play */
  $$('.pc__pp').forEach(b => b.addEventListener('click', () => {
    const v = b.closest('.pc').querySelector('video');
    if (v.paused) { v.dataset.hold = ''; v.play().catch(() => {}); b.classList.remove('is-paused'); b.setAttribute('aria-label', 'Pausar video'); }
    else { v.dataset.hold = '1'; v.pause(); b.classList.add('is-paused'); b.setAttribute('aria-label', 'Reproducir video'); }
  }));

  /* REVEAL */
  const rvTargets = $$('.shead, .stats, .vcard, .sys__app, .cmp__wrap, .ind__app, .case, .eng__steps, .logi > *, .proof__head, .pc, .dist__grid li, .faq__list, .qbox, .book, .chap__in > *');
  if (!RM) {
    rvTargets.forEach(el => el.classList.add('rv'));
    /* Mill stagger: column x 90ms + row x 140ms */
    $$('.proof__col').forEach((col, ci) => $$('.pc', col).forEach((pc, ri) => { pc.style.transitionDelay = (ci * 90 + ri * 140) + 'ms'; }));
    const rvIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); rvIO.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    rvTargets.forEach(el => rvIO.observe(el));
  }

  /* STAT COUNT-UP */
  const cntIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cntIO.unobserve(e.target);
    const el = e.target, to = +el.dataset.count; if (RM) return;
    const t0 = performance.now(), d = 1400;
    const tick = t => { const k = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
    el.textContent = '0'; requestAnimationFrame(tick);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cntIO.observe(el));

  /* VALUE CARD SLIDER */
  const vSlides = $$('#vcard article'); let vi = 0, vTimer;
  const vGo = n => { vSlides[vi].classList.remove('is-on'); vi = (n + vSlides.length) % vSlides.length; vSlides[vi].classList.add('is-on'); };
  const vAuto = () => { clearInterval(vTimer); if (!RM) vTimer = setInterval(() => vGo(vi + 1), 5200); };
  $$('#vcard [data-v]').forEach(b => b.addEventListener('click', () => { vGo(vi + +b.dataset.v); vAuto(); }));
  vAuto();

  /* SYSTEMS */
  const IMG = '../assets/img/', CUT = '../assets/v2/';
  const SYS = {
    u35: { n: 'Ultra 35', f: 'ultra-35', img: 'p-ultra35.jpg', cut: 'mat-ultra35.webp',
      d: 'Techo termoacústico en polímeros con cinco crestas. La alternativa moderna a las cubiertas metálicas y de fibrocemento: reduce el calor y el ruido de la lluvia y no se corroe.',
      r: [['Uso', 'Industrial · Comercial · Residencial'], ['Perfil', 'Panel estructural de cinco crestas'], ['Largo', 'Hasta 11,80 m por lámina'], ['Ideal', 'Bodegas, naves, comercios, zonas húmedas o con salitre']] },
    clear: { n: 'Ultra 35 Clear', f: 'ultra-35-clear', img: 'p-ultra35-clear.jpg', cut: 'mat-clear.webp',
      d: 'Panel translúcido con la misma geometría de Ultra 35. Se combinan en una misma cubierta para meter luz natural durante el día.',
      r: [['Uso', 'Iluminación natural'], ['Espesor', '1,5 mm, translúcido'], ['Combina con', 'Ultra 35, misma geometría'], ['Ideal', 'Bodegas, naves, talleres, supermercados']] },
    therm: { n: 'Ultra Therm', f: 'ultra-therm', img: 'p-ultra-therm.jpg', cut: 'mat-therm.webp',
      d: 'Panel sándwich termoacústico: dos láminas de aluminio prelacado con núcleo de espuma rígida de poliuretano de alta densidad. Alto aislamiento y resistencia estructural.',
      r: [['Uso', 'Alto desempeño térmico y acústico'], ['Caras', 'Aluminio prelacado'], ['Núcleo', 'Poliuretano rígido de alta densidad'], ['Ideal', 'Viviendas de alto desempeño, comercios, hoteles, industria']] },
    colonial: { n: 'Ultra Colonial', f: 'ultra-colonial', img: 'p-ultra-colonial.jpg', cut: 'mat-colonial.webp',
      d: 'La apariencia de la teja tradicional con los beneficios de los polímeros: resistencia a la corrosión, bajo mantenimiento y más confort termoacústico.',
      r: [['Uso', 'Residencial premium · Hotelería'], ['Estética', 'Teja tradicional'], ['Mantenimiento', 'Bajo, sin óxido'], ['Ideal', 'Viviendas, hoteles, iglesias, terrazas, restaurantes']] },
    palma: { n: 'Ultra Palma', f: 'ultra-palma', img: 'p-ultra-palma.jpg', cut: 'mat-palma.webp',
      d: 'La belleza de la palma natural con la durabilidad de una solución moderna, para techos y revestimientos tropicales. Versiones Protect y Deco.',
      r: [['Uso', 'Techos y revestimientos tropicales'], ['Versiones', 'Protect · Deco'], ['Estética', 'Palma natural'], ['Ideal', 'Hoteles, resorts, palapas, ranchos, casas de playa, pérgolas']] },
    aislante: { n: 'Aislante Térmico Reflectivo', f: 'aislante-reflectivo', img: 'p-aislante.jpg', cut: 'mat-aislante.webp',
      d: 'Capa reflectiva de aluminio con núcleo de espuma de polietileno expandido (EPE) de celda cerrada. Complementa cualquier sistema de techado.',
      r: [['Uso', 'Complemento térmico'], ['Reflectividad', '95–97 %'], ['Espesor', '10 mm'], ['Núcleo', 'EPE de celda cerrada']] },
    acc: { n: 'Accesorios', f: 'accesorios', img: 'p-accesorios.jpg', cut: 'mat-accesorios.webp',
      d: 'Todo lo que tu cubierta necesita para quedar cerrada y bien terminada, del mismo proveedor que tus láminas.',
      r: [['Incluye', 'Cumbreras, botaguas lisos y acanalados'], ['Remates', 'Limatesas'], ['Fijación', 'Sets de fijación y más'], ['Ventaja', 'Un solo proveedor para toda la cubierta']] },
  };
  const sysPanel = $('#sysPanel');
  const sysRender = k => {
    const s = SYS[k]; if (!s) return;
    sysPanel.classList.add('is-swap');
    setTimeout(() => {
      $('#sysPhoto').src = IMG + s.img; $('#sysPhoto').alt = s.n;
      const cut = $('#sysCut'); if (s.cut) { cut.src = CUT + s.cut; cut.hidden = false; } else cut.hidden = true;
      $('#sysFile').textContent = 'ficha / ' + s.f; $('#sysName').textContent = s.n; $('#sysDesc').textContent = s.d;
      $('#sysRows').innerHTML = s.r.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');
      $('#sysQuote').textContent = 'Cotizar ' + (k === 'acc' ? 'accesorios' : k === 'aislante' ? 'aislante' : s.n);
      sysPanel.classList.remove('is-swap');
    }, RM ? 0 : 220);
  };
  $$('.sys__tabs [data-s]').forEach(b => b.addEventListener('click', () => {
    $$('.sys__tabs [data-s]').forEach(x => x.setAttribute('aria-selected', x === b)); sysRender(b.dataset.s);
  }));
  sysRender('u35');

  /* INDUSTRIES */
  const IND = [
    { img: 'p-ultra35-clear.jpg', sys: 'Ultra 35 + Ultra 35 Clear', t: 'Bodegas y naves industriales', x: 'Láminas de hasta 11,80 m para cubrir luces grandes con pocos traslapes, y franjas de Ultra 35 Clear para trabajar con luz natural de día.', tipo: 'Industrial' },
    { img: 'p-ultra35-clear.jpg', sys: 'Ultra 35 Clear + Ultra 35', t: 'Supermercados y talleres', x: 'Combiná paneles translúcidos y opacos en la misma cubierta: luz natural sobre los pasillos o el área de trabajo y menos calor que con un techo de metal.', tipo: 'Comercial' },
    { img: 'huacas-courts.jpg', sys: 'Ultra 35 en cubierta curva', t: 'Canchas y espacios deportivos', x: 'Cubiertas curvas ligeras para canchas que se usan con sol o con lluvia, como las canchas techadas en Huacas, Guanacaste.', tipo: 'Deportivo' },
    { img: 'proj-plaza-diagonal.jpg', sys: 'Ultra 35', t: 'Comercios y plazas', x: 'Una cubierta en polímeros que no se pinta ni se oxida, para que el mantenimiento del techo no cierre tu local. Caso real: Plaza Diagonal.', tipo: 'Comercial' },
    { img: 'hotel-aerial-orange.jpg', sys: 'Ultra Colonial + Ultra Palma', t: 'Hoteles, ranchos y restaurantes', x: 'La estética de la palma o de la teja para ranchos, palapas y habitaciones, con la durabilidad de los polímeros frente a la humedad.', tipo: 'Hotelería' },
    { img: 'proj-dominical.jpg', sys: 'Ultra Colonial + Ultra Therm', t: 'Residencial premium', x: 'Ultra Colonial para la apariencia de teja y Ultra Therm para alto aislamiento térmico y acústico. Caso real: Casa Dominical E1.', tipo: 'Residencial premium' },
    { img: 'baulas-aerial.jpg', sys: 'Polímeros sin metal', t: 'Proyectos en costa', x: 'Cero metal en la lámina: nada que se oxide con el salitre. Desde casas en zonas costeras hasta un hotel en Tortuguero, donde la corrosión es altísima.', tipo: 'Hotelería' },
  ];
  const indCard = $('#indCard');
  const indRender = i => {
    const d = IND[i]; indCard.classList.add('is-swap');
    setTimeout(() => {
      $('#indImg').src = IMG + d.img; $('#indImg').alt = d.t;
      $('#indSys').textContent = d.sys; $('#indTitle').textContent = d.t; $('#indText').textContent = d.x;
      $('#indCta').dataset.tipo = d.tipo; indCard.classList.remove('is-swap');
    }, RM ? 0 : 220);
  };
  $$('.ind__list [data-i]').forEach(b => {
    const go = () => { $$('.ind__list [data-i]').forEach(x => x.setAttribute('aria-selected', x === b)); indRender(+b.dataset.i); };
    b.addEventListener('click', go);
    b.addEventListener('mouseenter', () => { if (matchMedia('(hover:hover)').matches) go(); });
  });
  indRender(0);

  /* CASES RAIL */
  const rail = $('#casRail'), cases = $$('.case', rail), cnt = $('#casCount');
  const pad = n => String(n).padStart(2, '0');
  const curCase = () => { const x = rail.scrollLeft; let best = 0, bd = 1e9; cases.forEach((c, i) => { const d = Math.abs(c.offsetLeft - rail.offsetLeft - parseFloat(getComputedStyle(rail).paddingLeft) - x); if (d < bd) { bd = d; best = i; } }); return best; };
  const goCase = i => { i = Math.max(0, Math.min(cases.length - 1, i)); rail.scrollTo({ left: cases[i].offsetLeft - cases[0].offsetLeft, behavior: RM ? 'auto' : 'smooth' }); };
  $('#casPrev').addEventListener('click', () => goCase(curCase() - 1));
  $('#casNext').addEventListener('click', () => goCase(curCase() + 1));
  let rq; rail.addEventListener('scroll', () => { cancelAnimationFrame(rq); rq = requestAnimationFrame(() => cnt.textContent = `${pad(curCase() + 1)} / ${pad(cases.length)}`); }, { passive: true });
  cnt.textContent = `01 / ${pad(cases.length)}`;

  /* ENGINEERING STEPS */
  const steps = $$('.eng__steps li'); let si = 0, sTimer;
  const sGo = i => { steps.forEach(s => s.classList.remove('is-on')); void steps[0].offsetWidth; si = i % steps.length; steps[si].classList.add('is-on'); };
  const sAuto = () => { clearInterval(sTimer); if (!RM) sTimer = setInterval(() => sGo(si + 1), 4000); };
  steps.forEach((s, i) => s.addEventListener('click', () => { sGo(i); sAuto(); }));
  const engUi = $('.eng__ui');
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { engUi.classList.add('is-in'); sAuto(); o.disconnect(); } }), { threshold: .3 }).observe(engUi);

  /* FORMS */
  const wireQf = (root, preset = {}) => {
    const qf = root.matches('.qf') ? root : $('.qf', root), form = $('form', qf);
    const st = n => { $$('.qf__step', qf).forEach(s => s.classList.toggle('is-on', s.dataset.step == n)); $$('.qf__dot', qf).forEach((d, i) => d.classList.toggle('is-on', i < n)); qf.classList.toggle('is-s2', n == 2); };
    const valid = step => { let ok = true; $$('[required]', step).forEach(f => { const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value)); f.classList.toggle('is-err', bad); if (bad && ok) { f.focus(); ok = false; } }); return ok; };
    $$('input,select,textarea', qf).forEach(f => f.addEventListener('input', () => f.classList.remove('is-err')));
    Object.entries(preset).forEach(([k, v]) => { const f = form.elements[k]; if (f) f.value = v; });
    $('[data-next]', qf)?.addEventListener('click', () => { if (valid($('.qf__step[data-step="1"]', qf))) st(2); });
    $('[data-back]', qf)?.addEventListener('click', () => st(1));
    form.addEventListener('submit', e => { e.preventDefault(); const cur = $('.qf__step.is-on', qf); if (!valid(cur)) return; qf.classList.add('is-done'); });
  };
  const clone = id => document.importNode($('#tpl-' + id).content, true).firstElementChild;
  $$('[data-qform]').forEach(box => { const el = clone(box.dataset.qform); box.appendChild(el); wireQf(el); });
  $$('form[data-mini]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault(); let ok = true;
    $$('[required]', f).forEach(x => { const bad = !x.value.trim() || (x.type === 'email' && !/^\S+@\S+\.\S+$/.test(x.value)); x.classList.toggle('is-err', bad); if (bad && ok) { x.focus(); ok = false; } });
    if (ok) f.classList.add('is-done');
  }));

  /* MODAL */
  const modal = $('#modal'), slot = $('.modal__slot', modal);
  const COPY = {
    quote: ['Cotización para empresas', 'Contanos de tu proyecto'],
    dist: ['Red de distribuidores', 'Solicitá información de distribución'],
    fichas: ['Fichas técnicas 2026', 'Recibí las fichas técnicas'],
  };
  let lastFocus;
  const openModal = (kind, tipo) => {
    lastFocus = document.activeElement;
    $('#modalK').textContent = COPY[kind][0]; $('#modalH').textContent = COPY[kind][1];
    slot.innerHTML = ''; const el = clone(kind); slot.appendChild(el); wireQf(el, tipo ? { tipo } : {});
    modal.hidden = false; document.body.style.overflow = 'hidden';
    setTimeout(() => $('input', slot)?.focus(), 60);
  };
  const closeModal = () => { modal.hidden = true; document.body.style.overflow = ''; lastFocus?.focus?.(); };
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (o) { e.preventDefault(); mnav.classList.remove('is-open'); openModal(o.dataset.open, o.dataset.tipo); return; }
    if (e.target.closest('[data-close]')) closeModal();
  });

  /* VIDEO LIGHTBOX (with sound) */
  const vbox = $('#vbox'), vv = $('video', vbox);
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-vsrc]'); if (b) { e.preventDefault(); vv.src = b.dataset.vsrc; vv.muted = false; vbox.hidden = false; document.body.style.overflow = 'hidden'; vv.play().catch(() => {}); return; }
    if (e.target.closest('[data-vclose]')) { vv.pause(); vv.removeAttribute('src'); vv.load(); vbox.hidden = true; document.body.style.overflow = ''; }
  });
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!vbox.hidden) $('[data-vclose]', vbox).click();
    else if (!modal.hidden) closeModal();
    else if (mnav.classList.contains('is-open')) burger.click();
  });
})();

/* Siete sistemas: scroll-driven tabs (desktop). Pins the app; each stretch of scroll selects the next system. */
(() => {
  const app = document.querySelector('.sys__app'); if (!app) return;
  const tabsBox = app.querySelector('.sys__tabs');
  const tabs = [...tabsBox.querySelectorAll('[data-s]')]; const n = tabs.length;
  const mq = /[?&]shot/.test(location.search) ? { matches: false } : matchMedia('(min-width: 901px) and (prefers-reduced-motion: no-preference)');
  const pin = document.createElement('div'); pin.className = 'sys__pin';
  app.parentNode.insertBefore(pin, app); pin.appendChild(app);
  const bar = document.createElement('i'); bar.className = 'sys__prog'; tabsBox.appendChild(bar);
  const count = document.createElement('div'); count.className = 'sys__count'; count.setAttribute('aria-hidden', 'true');
  count.innerHTML = `<b>01 <span>/ ${String(n).padStart(2, '0')}</span></b><small>Deslizá para ver los ${n} sistemas</small>`;
  tabsBox.appendChild(count);
  const STEP = 0.62; // viewport heights of scroll per system
  let cur = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true'); if (cur < 0) cur = 0;
  let programmatic = false, total = 0, top = 96;
  const size = () => {
    if (!mq.matches) { pin.style.height = ''; return; }
    top = parseFloat(getComputedStyle(app).top) || 96;
    total = Math.round(n * STEP * innerHeight);
    pin.style.height = (app.offsetHeight + total) + 'px';
  };
  const select = i => {
    if (i === cur) return; cur = i;
    programmatic = true; tabs[i].click(); programmatic = false;
    count.querySelector('b').firstChild.nodeValue = String(i + 1).padStart(2, '0') + ' ';
  };
  const onScroll = () => {
    if (!mq.matches || !total) return;
    const p = Math.min(1, Math.max(0, (top - pin.getBoundingClientRect().top) / total));
    bar.style.height = (p * 100) + '%';
    pin.classList.toggle('is-end', p >= .999);
    select(Math.min(n - 1, Math.floor(p * n)));
  };
  // clicking a tab scrolls to that system's slot so scroll + tabs stay in sync
  tabs.forEach((t, i) => t.addEventListener('click', () => {
    if (programmatic) return;
    cur = i; count.querySelector('b').firstChild.nodeValue = String(i + 1).padStart(2, '0') + ' ';
    if (!mq.matches) return;
    const y = pin.getBoundingClientRect().top + scrollY - top + (i + 0.5) / n * total;
    scrollTo({ top: y, behavior: 'smooth' });
  }));
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { size(); onScroll(); });
  mq.addEventListener?.('change', () => { size(); onScroll(); });
  addEventListener('load', () => { size(); onScroll(); });
  size(); onScroll();
})();
