/* Ultra Techos v2 */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* nav: transparent over hero → solid */
  const nav = $('#nav'), hero = $('.hero');
  const setNav = () => nav.classList.toggle('is-solid', scrollY > (hero ? hero.offsetHeight - 90 : 40) || $('#mnav').classList.contains('is-open'));
  addEventListener('scroll', setNav, { passive: true }); setNav();
  const burger = $('#burger'), mnav = $('#mnav');
  burger.addEventListener('click', () => { const o = !mnav.classList.contains('is-open'); mnav.classList.toggle('is-open', o); burger.setAttribute('aria-expanded', o); setNav(); });
  $$('#mnav a').forEach(a => a.addEventListener('click', () => { mnav.classList.remove('is-open'); burger.setAttribute('aria-expanded', false); setNav(); }));

  /* HERO VIDEO: the house builds itself (loop), pause + reduced motion */
  const heroSec = $('#sistemas'), hv = $('#heroVideo');
  let paused = reduce;
  const loadHero = () => fetch(hv.dataset.src).then(r => { if (!r.ok) throw 0; return r.blob(); }).then(b => {
    hv.src = URL.createObjectURL(b);
    hv.addEventListener('canplay', () => { heroSec.classList.add('has-video'); if (!paused) hv.play().catch(() => {}); }, { once: true });
  }).catch(() => {});
  if (!reduce) loadHero();
  $('#heroPause').addEventListener('click', e => { paused = !paused; e.currentTarget.classList.toggle('is-paused', paused); e.currentTarget.setAttribute('aria-label', paused ? 'Reproducir animación' : 'Pausar animación'); paused ? hv.pause() : hv.play().catch(() => {}); });
  new IntersectionObserver(es => { if (!paused && !heroSec.classList.contains('is-open')) es[0].isIntersecting ? hv.play().catch(() => {}) : hv.pause(); }).observe(heroSec);
  const procRow = $('.proc__row'); if (procRow) new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { procRow.classList.add('is-in'); o.disconnect(); } }, { threshold: .3 }).observe(procRow);

  /* lead modal: clone the Figma 2-step form */
  const modal = $('#leadModal'), slot = $('.modal__slot', modal), tpl = $('#cotizar [data-form]');
  const mform = tpl.cloneNode(true); slot.appendChild(mform);
  let lastFocus = null;
  function openLead(prefill = {}) {
    lastFocus = document.activeElement;
    resetForm(mform);
    if (prefill.tipo) { const r = $$('input[name=tipo]', mform).find(x => x.value === prefill.tipo) || $$('input[name=tipo]', mform)[prefill.tipo === 'Comercial / Industrial' ? 1 : 0]; if (r) r.checked = true; }
    if (prefill.sistema) { const s = $('select[name=sistema]', mform); [...s.options].forEach(o => { if (o.text === prefill.sistema) s.value = o.value; }); }
    modal.hidden = false; document.body.style.overflow = 'hidden';
    setTimeout(() => $('input', mform).focus(), 60);
  }
  function closeLead() { modal.hidden = true; document.body.style.overflow = ''; lastFocus && lastFocus.focus(); }
  $$('[data-close]', modal).forEach(b => b.addEventListener('click', closeLead));
  addEventListener('keydown', e => { if (e.key === 'Escape') { if (!modal.hidden) closeLead(); if (!vbox.hidden) closeV(); } });
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-lead]'); if (!t) return;
    e.preventDefault();
    openLead({ sistema: t.dataset.sistema });
  });

  /* form logic (both instances) */
  function resetForm(root) {
    root.classList.remove('is-s2', 'is-done');
    $$('.qform__step', root).forEach(s => s.classList.toggle('is-on', s.dataset.step === '1'));
    $$('.qform__dot', root).forEach((d, i) => d.classList.toggle('is-on', i === 0));
    $('form', root).reset();
  }
  function wire(root) {
    const f = $('form', root);
    $('[data-next]', root).addEventListener('click', () => {
      let ok = true;
      $$('[data-step="1"] input[required]', root).forEach(i => { const bad = !i.value.trim(); i.classList.toggle('is-err', bad); if (bad && ok) { i.focus(); ok = false; } });
      if (!ok) return;
      root.classList.add('is-s2');
      $$('.qform__step', root).forEach(s => s.classList.toggle('is-on', s.dataset.step === '2'));
      $$('.qform__dot', root)[1].classList.add('is-on');
    });
    $('[data-back]', root).addEventListener('click', () => {
      root.classList.remove('is-s2');
      $$('.qform__step', root).forEach(s => s.classList.toggle('is-on', s.dataset.step === '1'));
      $$('.qform__dot', root)[1].classList.remove('is-on');
    });
    $$('input', root).forEach(i => i.addEventListener('input', () => i.classList.remove('is-err')));
    f.addEventListener('submit', e => {
      e.preventDefault(); // prototype: nothing is sent anywhere
      try { localStorage.setItem('ut-lead', JSON.stringify(Object.fromEntries(new FormData(f)))); } catch (_) {}
      root.classList.add('is-done');
    });
  }
  wire(tpl); wire(mform);

  /* MATERIAL CHOOSER (Westlake chips) */
  const MATS = {
    colonial: { tag: 'Residencial premium', t: 'Ultra Colonial', d: 'La apariencia de la teja tradicional con los beneficios de los polímeros: resistencia a la corrosión, bajo mantenimiento y mayor confort termoacústico, sin depender de una cubierta metálica.', i: 'viviendas, hoteles, iglesias, terrazas, restaurantes y proyectos donde la estética arquitectónica es importante.', img: 'mat-colonial.webp' },
    ultra35: { tag: 'Industrial · Comercial · Residencial', t: 'Ultra 35', d: 'Panel estructural en polímeros con cinco crestas: la alternativa moderna a las cubiertas metálicas y de fibrocemento. Reduce el calor y el ruido de la lluvia, es 100% resistente a la corrosión, de bajo mantenimiento y fácil de instalar.', i: 'viviendas, comercios, bodegas, proyectos industriales y zonas con alta humedad o exposición al salitre.', img: 'mat-ultra35.webp' },
    clear: { tag: 'Iluminación natural', t: 'Ultra 35 Clear', d: 'Panel translúcido de 1,5 mm con la misma geometría de Ultra 35: se combinan en una misma cubierta para dejar entrar la luz natural durante el día y usar menos iluminación artificial.', i: 'bodegas, naves industriales, talleres, supermercados y áreas donde querés aprovechar la luz natural.', img: 'mat-clear.webp' },
    palma: { tag: 'Tropical', t: 'Ultra Palma', d: 'La belleza natural de la palma con la durabilidad de una solución moderna. Techos y revestimientos de apariencia tropical, sin depender de la palma natural y con menos mantenimiento. Versiones Protect y Deco.', i: 'hoteles, resorts, restaurantes, palapas, ranchos, casas de playa, pérgolas y terrazas.', img: 'mat-palma.webp' },
    aislante: { tag: 'Complemento', t: 'Aislante Térmico Reflectivo', d: 'Capa reflectiva de aluminio con un núcleo de espuma de polietileno expandida EPE de celda cerrada: ayuda a reducir la transferencia de calor hacia el interior. 95–97% de reflectividad y 10 mm de espesor.', i: 'complementar sistemas de techado y cerramiento en viviendas, comercios, bodegas y proyectos donde querés mejorar el confort térmico.', img: 'mat-aislante.webp' },
    accesorios: { tag: 'Instalación', t: 'Accesorios', d: 'Línea completa de accesorios para una instalación profesional: cumbreras, botaguas lisos y acanalados, limatesas, sets de fijación y más.', i: 'instalaciones nuevas, ampliaciones, remodelaciones y proyectos que necesitan una solución completa de techado.', img: 'mat-accesorios.webp' },
    therm: { tag: 'Alto desempeño', t: 'Ultra Therm', d: 'Panel sándwich termoacústico: dos láminas de aluminio prelacado y un núcleo de espuma rígida de poliuretano de alta densidad. Alto aislamiento térmico y acústico con resistencia estructural.', i: 'viviendas de alto desempeño, comercios, hoteles, proyectos industriales y obras donde el aislamiento es prioridad.', img: 'mat-therm.webp' }
  };
  const matSec = $('#sistemas'), chips = $$('.mat__chips button');
  let curM = null;
  function openMat(k) {
    const m = MATS[k];
    if (curM === k) return closeMat();
    curM = k;
    chips.forEach(c => c.setAttribute('aria-selected', c.dataset.m === k));
    $('#matTag').textContent = m.tag; $('#matTitle').textContent = m.t; $('#matText').textContent = m.d; $('#matIdeal').textContent = m.i;
    $('#matCta').textContent = 'Cotizar ' + m.t; $('#matCta').dataset.sistema = m.t;
    const img = $('#matImg'); img.alt = 'Muestra de ' + m.t;
    matSec.classList.remove('is-open'); void matSec.offsetWidth; // restart animation
    img.src = '../assets/v2/' + m.img;
    matSec.classList.add('is-open'); hv.pause();
  }
  function closeMat() { curM = null; matSec.classList.remove('is-open'); if (!paused) hv.play().catch(() => {}); chips.forEach(c => c.setAttribute('aria-selected', false)); }
  chips.forEach(c => c.addEventListener('click', () => openMat(c.dataset.m)));
  $('#matClose').addEventListener('click', closeMat);
  Object.values(MATS).forEach(m => { const i = new Image(); i.src = '../assets/v2/' + m.img; });

  /* projects rail arrows */
  const rail = $('#projRail');
  const step = () => rail.querySelector('.pcard').offsetWidth + 16;
  $('#projPrev').addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
  $('#projNext').addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));

  /* Mill-style staggered reveal + autoplay videos in view */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, col = el.closest('.rev__col'), cols = $$('.rev__col');
    const d = (cols.indexOf(col) * 90) + ([...col.children].indexOf(el) * 140);
    setTimeout(() => el.classList.add('is-in'), reduce ? 0 : d);
    io.unobserve(el);
  }), { threshold: 0.18 });
  $$('.reveal').forEach(el => io.observe(el));
  const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting && !reduce) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); }), { threshold: 0.35 });
  $$('video[data-auto]').forEach(v => vio.observe(v));
  $$('.rc__pp').forEach(b => b.addEventListener('click', () => { const v = $('video', b.parentElement); if (v.paused) { v.play(); b.setAttribute('aria-label', 'Pausar video'); } else { v.pause(); b.setAttribute('aria-label', 'Reproducir video'); } }));

  /* video lightbox (with sound) */
  const vbox = $('#vbox'), vv = $('video', vbox);
  function closeV() { vv.pause(); vbox.hidden = true; document.body.style.overflow = ''; }
  $$('[data-vsrc]').forEach(b => b.addEventListener('click', () => { vv.src = b.dataset.vsrc; vbox.hidden = false; document.body.style.overflow = 'hidden'; vv.play().catch(() => {}); }));
  $$('[data-vclose]', vbox).forEach(b => b.addEventListener('click', closeV));
  $$('.rc--story').forEach(c => { c.style.cursor = 'pointer'; c.addEventListener('click', () => { vv.src = '../assets/video/jp-tortuguero.mp4'; vbox.hidden = false; document.body.style.overflow = 'hidden'; vv.play().catch(() => {}); }); });
})();
