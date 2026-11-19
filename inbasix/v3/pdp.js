/* Inbasix v3 — product page: product.html?p=<handle> renders any of the 186 products */
(function () {
  const { nm, K, B, esc, catUrl, WA, inC, byPrice, defVar, typeLabel, vendorName, logoOf, blurb, I, media, tile, tabs, ytFacade, hasVid, RM } = window.V3;
  const main = document.querySelector('[data-pdp]');
  const IMG = B + 'assets/img/';
  const h = new URLSearchParams(location.search).get('p');
  const p = h && K.find(h);
  const ck = I.check.replace('stroke-width="1.6"', 'stroke-width="1.8"');

  /* ---------- not found ---------- */
  if (!p) {
    const sug = byPrice(inC(['sistemas-de-diagnostico-por-ultrasonido', 'aparatologia-estetica'])).slice(0, 4);
    main.innerHTML = `<section class="nf"><p class="eyebrow">Producto no encontrado</p><h1 class="h2">No encontramos este producto</h1>
      <p class="t-l">Puede que el enlace haya cambiado. Revisa el catálogo completo o pregúntale a un asesor</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a class="btn btn--cyan" href="coleccion.html">Ver catálogo</a><a class="btn btn--ghost" href="${WA('Hola Inbasix, busco un equipo')}" target="_blank" rel="noopener">Hablar con un asesor</a></div></section>
      <section class="sec"><div class="pw"><h2 class="h2" style="margin-bottom:32px">Lo más buscado</h2><div class="grid4">${sug.map(x => tile(x)).join('')}</div></div></section>`;
    return;
  }

  /* ---------- derived data ---------- */
  const name = nm(p), vend = vendorName(p.vendor), isFiller = p.type === 'Fillers', isAcc = p.cols.includes('accesorios') || p.type === 'Transductores';
  const equip = !isFiller && !isAcc;
  const priced = !K.isQuote(p);
  const variants = p.v;
  let cur = defVar(p);
  const opts = (p.opts || []).filter(o => !(o.v.length === 1 && o.v[0] === 'Default Title'));
  const SPECIFIC = c => !['equipo-medico', 'sistemas-de-diagnostico-por-ultrasonido', 'aparatologia-estetica', 'fillers'].includes(c);
  const primaryCol = p.cols.find(SPECIFIC) || p.cols[0];
  const catH = p.cols.includes('sistemas-de-diagnostico-por-ultrasonido') ? 'sistemas-de-diagnostico-por-ultrasonido' : p.cols.includes('aparatologia-estetica') ? 'aparatologia-estetica' : p.cols.includes('fillers') ? 'fillers' : primaryCol;
  const catT = ((K.COLS.find(c => c.h === catH) || {}).t || p.type).replace(/^Sistemas de Diagnóstico por /, '');
  const gallery = p.img.map(src => ({ src })); if (p.yt.length) gallery.splice(Math.min(1, gallery.length), 0, { yt: p.yt[0] });
  const lc = (p.h + ' ' + p.t).toLowerCase();
  const loopFor = () => {
    if (/mx7/.test(lc)) return 'loop-mx7'; if (/consona/.test(lc)) return 'loop-consona'; if (/nuewa|resona/.test(lc)) return 'loop-nuewa';
    if (/samsung|hera|hs30|hs40|\bv[5-8]\b/.test(lc) || p.vendor === 'SAMSUNG') return 'loop-samsung';
    if (/co2/.test(lc)) return 'loop-co2'; if (/hifu|lifting|v-shape/.test(lc)) return 'loop-hifu'; if (/microneedle/.test(lc)) return 'loop-microneedle';
    if (/crio|cryo/.test(lc)) return 'sq-cryo'; if (/diodo/.test(lc)) return 'sq-tridiodo';
    if (isFiller) return 'loop-plla'; if (p.type === 'Aparatología Estética') return 'loop-microneedle';
    if (p.type === 'Ultrasonido' || p.type === 'Transductores' || /ultrasonido/.test(lc)) return 'loop-curso';
    return 'loop-showroom';
  };
  const isUS = /ultrasonido|transductor/.test(lc) || p.type === 'Ultrasonido';

  /* ---------- skeleton ---------- */
  const chip = (ic, t) => `<span>${ic.replace(/viewBox="0 0 40 40"/, 'viewBox="0 0 40 40" width="16" height="16"')}${t}</span>`;
  const chips = equip
    ? [chip(I.shield, 'Garantía de 12 meses'), chip(I.truck, 'Envíos a todo México'), chip(I.cap, 'Capacitación incluida'), chip(I.card, 'Financiamiento en 24 h')]
    : [chip(I.truck, 'Envíos a todo México'), chip(I.chat, 'Asesoría de especialistas'), chip(I.card, 'Pago con tarjeta o transferencia')];

  const thumbs = gallery.map((g, i) => g.yt
    ? `<button type="button" class="vid" data-g="${i}" aria-label="Ver video" aria-current="${i === 0}"><img src="https://i.ytimg.com/vi/${g.yt}/default.jpg" alt=""><span class="play">${I.playS}</span></button>`
    : `<button type="button" data-g="${i}" aria-label="Ver imagen ${i + 1}" aria-current="${i === 0}"><img src="${K.img(g.src, 160)}" alt="" loading="lazy"></button>`).join('');

  const optHTML = opts.map((o, oi) => {
    const long = o.v.length > 5;
    return `<fieldset class="popt" data-oi="${oi}"><legend>${esc(o.n.charAt(0) + o.n.slice(1).toLowerCase())}</legend><div class="popt__list${long ? ' is-long' : ''}">${o.v.map(val =>
      `<button type="button" class="popt__btn" data-ov="${esc(val)}" aria-pressed="false">${oi === 0 && p.img[0] && o.v.length <= 4 ? `<img src="${K.img(p.img[0], 120)}" alt="">` : ''}<span>${esc(val)}</span><b></b></button>`).join('')}</div></fieldset>`;
  }).join('');

  const cards = [
    { k: 'capacitacion', t: 'Capacitación botón por botón', ic: I.cap, m: media(isUS ? 'loop-curso' : 'loop-microneedle', B + 'assets/vid/loop-curso.jpg'), d: 'Capacitación técnica a tu personal en toda la república, para que operes el equipo con confianza desde el primer día', f: ['Incluida', ''] },
    { k: 'instalacion', t: 'Instalación profesional', ic: I.tool, m: media('loop-nuewa', B + 'assets/vid/loop-nuewa.jpg'), d: 'Instalamos tu equipo en tu consultorio, clínica u hospital en cualquier parte del país', f: ['Incluida', ''] },
    { k: 'garantia', t: 'Garantía de fábrica', ic: I.shield, m: media(loopFor(), B + 'assets/vid/loop-showroom.jpg'), d: 'Garantía estándar del fabricante de 12 meses, con opción de ampliarla a 24, 36 o 48 meses', f: ['12 a 48 meses', ''] },
    { k: 'asesoria', t: 'Asesoría biomédica', ic: I.chat, m: media('loop-congreso', B + 'assets/vid/loop-congreso.jpg'), d: 'Ingenieros biomédicos te ayudan a elegir la configuración correcta. Soporte humano, no robots', f: ['Antes y después de comprar', ''] },
    { k: 'postventa', t: 'Servicio postventa', ic: I.help.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24"'), m: media('hero-ultrasonido', B + 'assets/vid/hero-ultrasonido.jpg'), d: 'Seguimos contigo después de la garantía con servicio postventa', f: ['Después de la garantía', ''] },
    { k: 'showroom', t: 'Showrooms', ic: I.store, m: media('loop-showroom', B + 'assets/vid/loop-showroom.jpg'), d: 'Ve el equipo funcionando en nuestras salas de exhibición antes de decidir', f: ['CDMX · GDL · MTY · CUU', ''] },
  ].filter(c => equip || !/Instalación|Garantía|Capacitación/.test(c.t));

  const rel = byPrice(inC(p.cols.filter(SPECIFIC).concat(catH)).filter(x => x.h !== p.h)).slice(0, 8);
  const sib = (() => { const pool = inC(p.cols.filter(SPECIFIC)).filter(x => x.h !== p.h && x.img.length); const same = pool.filter(x => K.isQuote(x) === !priced); return (same[0] || pool[0] || rel[0]); })();
  const addon = (() => {
    const notMe = x => x.h !== p.h && (!sib || x.h !== sib.h);
    if (isUS && p.type !== 'Transductores') {
      const model = (p.t.match(/\b(DC ?30|DC ?40|DC ?70|DP ?10|Z ?50|Z ?60|MX ?7|MX ?3|MX ?6)\b/i) || [])[0];
      const tr = inC('transductores-de-uso-humano').filter(notMe);
      const byModel = model && tr.find(x => x.t.replace(/\s/g, '').toLowerCase().includes(model.replace(/\s/g, '').toLowerCase()));
      if (byModel) return byModel;
      const vet = p.cols.includes('ultrasonido-veterinario');
      const acc = inC('accesorios').filter(x => notMe(x) && (vet ? /animal|vet/i.test(x.t) : !/animal|vet/i.test(x.t)));
      return acc.find(x => /carrito/i.test(x.t) && /port/i.test(p.t)) || acc[0] || tr[0];
    }
    if (p.type === 'Aparatología Estética') { const s = ['skin-analizer', 'led-therapy-skin', 'hidrogen-6-en-1'].map(K.find).find(x => x && notMe(x)); if (s) return s; }
    if (isFiller) { const s = byPrice(inC(['rejubeau', 'youthfill', 'fillers'])).filter(notMe).find(x => !K.isQuote(x)); if (s) return s; }
    const pool = byPrice(inC(p.cols.filter(SPECIFIC))).filter(notMe); return pool.find(x => !K.isQuote(x)) || pool[0] || rel[1]; })();

  const T = [
    { ini: 'CR', n: 'Dr. Carlos Ramírez', r: 'Ginecólogo Obstetra', tag: 'Arrendamiento', q: 'Gracias al arrendamiento de Inbasix pude abrir mi segunda sucursal sin tocar mis ahorros. El proceso fue increíblemente rápido.' },
    { ini: 'SM', n: 'Dra. Sofía Méndez', r: 'Radióloga', tag: 'Asesoría técnica', q: 'La asesoría técnica fue clave. No sabía qué ultrasonido elegir y me ayudaron a encontrar la mejor relación costo-beneficio.' },
    { ini: 'LT', n: 'Dr. Luis Torres', r: 'Director Clínico', tag: 'Postventa', q: 'Excelente servicio post-venta. Tuvimos una duda con la configuración del equipo y nos atendieron el mismo día.' },
  ];
  const REELS = isFiller ? ['reel-fillers', 'reel-congreso-gdl', 'reel-codestetica', 'reel-consona-n5']
    : p.type === 'Aparatología Estética' ? ['reel-codestetica', 'reel-congreso-gdl', 'reel-fillers', 'reel-mx7']
    : ['reel-mx7', 'reel-consona-n5', 'reel-mx3', 'reel-dp30'];
  const RL = { 'reel-mx7': ['Mindray MX7', 'Ultrasonido portátil'], 'reel-consona-n5': ['Mindray Consona N5', 'Ultrasonido de gabinete'], 'reel-mx3': ['Mindray MX3', 'Ultrasonido portátil'], 'reel-dp30': ['Mindray DP30', 'Ultrasonido portátil'], 'reel-codestetica': ['Inbasix en Codestética CDMX', 'Congresos'], 'reel-congreso-gdl': ['Face & Body Guadalajara', 'Congresos'], 'reel-fillers': ['Rejubeau en congreso', 'Fillers'] };

  const FAQ = [
    ['¿Cómo me aseguran que tienen el mejor precio?', 'Somos importadores directos de fábrica de la mayoría de las marcas y distribuidor autorizado en México, así que no hay intermediarios entre la fábrica y tú.'],
    ['No soy médico, soy dueño de un spa, ¿puedo comprar?', 'Sí. Los spas y centros de bienestar también pueden comprar aparatología estética.'],
    ['¿Dónde puedo ver el equipo?', 'En nuestros showrooms de CDMX, Guadalajara, Monterrey y Chihuahua, con salas de exhibición de ultrasonido, quirófano, laparoscopía, endoscopía, neonatología y aparatología estética. El de Guadalajara está en Av. de las Américas 1545, Providencia, 44630 Guadalajara, Jal.'],
    ['¿Qué formas de pago aceptan?', 'Transferencia BBVA a nombre de IMPORTACIONES INBASIX S.A. de C.V., tarjeta de crédito o débito, crédito bancario y arrendamiento puro.'],
    ['¿Qué garantía dan?', 'Garantía estándar del fabricante de 12 meses, con opción de ampliarla a 24, 36 o 48 meses. Después de la garantía te seguimos atendiendo con servicio postventa.'],
    ['¿Pueden recomprarme el equipo?', 'Te ayudamos a revender tu equipo directo con el cliente final.'],
    ['¿Incluye capacitación?', 'Sí. La capacitación botón por botón está incluida, con instalación profesional y capacitación técnica a tu personal en toda la república.'],
    ['¿Cuál es el tiempo de entrega?', 'De 3 a 10 días hábiles después de confirmado tu pedido.'],
    ['¿Envían fuera del país?', 'Sí. Escríbenos y revisamos contigo el envío fuera de México.'],
    ['¿Tienen asesoramiento técnico?', 'Sí. Ingenieros biomédicos te ayudan a elegir el equipo y la configuración que necesitas.'],
  ];

  const ctaTxt = () => K.isQuote(p) || !cur.p ? 'Cotizar' : 'Agregar al carrito';
  const grp = window.V3.GROUPS.find(g => window.V3.inGroup(p, g.k));
  const crumbs = `<nav class="crumbs" aria-label="Ruta"><a href="index.html">Inicio</a><span>⊢</span><a href="${catUrl(grp ? grp.k : catH)}">${esc(grp ? grp.t : catT)}</a><span>⊢</span><span aria-current="page">${esc(name)}</span></nav>`;

  main.innerHTML = `${crumbs}
  <section class="inset pmain" aria-label="${esc(name)}">
    <div class="pmain__thumbs"${gallery.length < 2 ? ' hidden' : ''}><div class="pmain__tlist" data-tlist>${thumbs}</div>${gallery.length > 7 ? `<button type="button" class="pmain__tnext" data-tnext aria-label="Más imágenes">${I.chevD}</button>` : ''}</div>
    <div class="pmain__stage"><div class="pmain__main" data-stage>${gallery.length ? '' : `<div class="pmain__ph"><div><img src="${B}assets/brand/logo-navy.png" alt=""><p>Imagen disponible con tu asesor</p></div></div>`}
      <span class="pmain__badge">${esc(vend)}</span></div></div>
    <div class="pinfo">
      <p class="eyebrow">${esc(catT)}</p>
      <h1>${esc(name)}</h1>
      <p class="pinfo__desc">${esc(blurb(p, 230))}</p>
      <div class="pchips">${chips.join('')}</div>
      <div class="pvendor">${logoOf(p.vendor) ? `<img src="${logoOf(p.vendor)}" alt="${esc(vend)}">` : ''}<span>Marca <b>${esc(vend)}</b> · ${esc(typeLabel(p))}</span></div>
      ${optHTML}
      <div class="pprice"><b data-price></b><small data-price-note></small></div>
      <p class="pvel">${I.bolt}<b>Cotizaciones flash</b> tu propuesta formal en menos de 24 horas</p>
      <div class="pcta" data-cta>
        <button type="button" class="btn btn--cyan" data-add="${p.h}" data-vid="${cur.id}" data-main-add>${ctaTxt()}</button>
        ${priced ? `<button type="button" class="btn btn--ghost" data-buy="${p.h}" data-vid="${cur.id}" data-main-buy>Comprar ahora</button>` : `<a class="btn btn--ghost" href="${WA(`Hola Inbasix, quiero cotizar: ${p.t} (${K.STORE}/products/${p.h})`)}" target="_blank" rel="noopener">Hablar con un asesor</a>`}
      </div>
      <p class="ppay">Paga con transferencia, tarjeta, arrendamiento puro o crédito simple · <a href="index.html#financiamiento">Aprobación en 24 horas</a></p>
    </div>
  </section>

  <section class="inset pben" data-reveal><div class="pben__h"><span class="ic-circle">${I.flask}</span>Por qué comprar con Inbasix</div>
    <div class="pben__g">
      <p><b>Importadores directos</b> de fábrica, sin intermediarios</p>
      <p><b>Más de 45,000 médicos</b> confían en Inbasix desde hace 29 años</p>
      <p><b>Cotización formal</b> en menos de 24 horas</p>
      <p><b>Soporte humano</b>: hablas con expertos, no con robots</p>
      <p><b>Envíos a todo México</b> en 3 a 10 días hábiles tras confirmar tu pedido</p>
    </div></section>

  <section class="inset pcar" data-reveal aria-label="Lo que incluye tu compra"><h2 class="h2">${equip ? 'Un equipo. Todo el respaldo Inbasix' : 'Tu compra, con el respaldo Inbasix'}</h2>
    <div class="pcar__vp"><div class="pcar__track" data-ctrack>${cards.map(c => `<article class="scard"><div class="scard__img" data-photo="${c.k}">${c.m}</div><div class="scard__b"><h3 class="scard__t">${c.ic.replace(/viewBox="0 0 (40|24) (40|24)"/, m => m + ' width="22" height="22"')}${c.t}</h3><p>${c.d}</p><div class="scard__ft"><span>${c.f[0]}</span></div></div></article>`).join('')}</div></div>
    <div class="pcar__bot"><a href="index.html#showrooms">Conoce nuestros showrooms ${I.arrowS}</a><div class="pcar__prog"><i data-cprog></i></div><div class="pcar__arr"><button type="button" data-cprev aria-label="Anterior">${I.chevL}</button><button type="button" data-cnext aria-label="Siguiente">${I.chevR}</button></div></div>
  </section>

  <section class="pban" data-pban hidden><div class="pban__img">${p.img[1] || p.img[0] ? `<img src="${K.img(p.img[1] || p.img[0], 1400)}" alt="${esc(name)}" loading="lazy">` : ''}</div><div class="pban__txt"><h2 data-pban-h></h2><p data-pban-p></p></div></section>

  <section class="inset ptabs" data-reveal>
    <div class="ptabs__main">
      <div class="ptabs__tl" role="tablist" aria-label="Información del producto" data-ptabs></div>
      <div data-ppanels></div>
    </div>
    ${addon ? `<aside class="ptabs__side"><h3>Complemento</h3><a class="aimg" href="${K.pdp(addon.h)}"><img src="${K.img(addon.img[0], 640)}" alt="" loading="lazy"></a><h4>${esc(nm(addon))}</h4><p>${esc(blurb(addon, 90))}</p><span class="pr">${K.priceLabel(addon)}</span><button type="button" class="btn btn--white" data-add="${addon.h}" data-vid="${defVar(addon).id}">${K.isQuote(addon) ? 'Cotizar' : 'Agregar al carrito'}</button></aside>` : ''}
  </section>

  <section class="inset pvid" data-reveal>
    <div>
      ${logoOf(p.vendor) ? `<img class="pvid__logo" src="${logoOf(p.vendor)}" alt="${esc(vend)}">` : `<p class="eyebrow" style="margin-bottom:16px">${esc(vend)}</p>`}
      <h2 class="h2">${p.yt.length ? `Mira el ${esc(name.replace(/^Ultrasonido\s+/i, ''))} en acción` : 'Te acompañamos de principio a fin'}</h2>
      <p class="pvid__sub">${p.yt.length ? 'Video de nuestro canal de YouTube' : 'Del primer mensaje a la instalación en tu clínica'}</p>
      <ul class="pvid__rows">
        <li>${I.cap.replace('viewBox="0 0 40 40"', 'viewBox="0 0 40 40" width="24" height="24"')}<span><b>Capacitación botón por botón</b> para ti y tu personal, en toda la república</span></li>
        <li>${I.chat.replace('viewBox="0 0 40 40"', 'viewBox="0 0 40 40" width="24" height="24"')}<span><b>Soporte humano</b>: habla con expertos, no con robots, antes y después de comprar</span></li>
        <li>${I.store.replace('viewBox="0 0 40 40"', 'viewBox="0 0 40 40" width="24" height="24"')}<span><b>Showrooms</b> en CDMX, Guadalajara, Monterrey y Chihuahua para ver el equipo funcionando</span></li>
      </ul>
      <div class="pvid__card"><div><strong>Habla con un especialista</strong><p>Te enviamos tu propuesta formal en menos de 24 horas</p></div><a class="wa" href="${WA(`Hola Inbasix, me interesa: ${p.t}`)}" target="_blank" rel="noopener">${I.wa}WhatsApp<br>55 22 33 22 33</a></div>
    </div>
    <div class="pvid__media">${p.yt.length ? ytFacade(p.yt[p.yt.length > 1 ? 1 : 0], name) : media(loopFor(), B + 'assets/vid/loop-showroom.jpg')}</div>
  </section>

  ${sib ? `<section class="pcmp" data-reveal>
    <div class="pcmp__txt"><h2 class="h2">Compara ${esc(name)} y ${esc(nm(sib))}</h2><p class="t-l">Las dos opciones llegan con el respaldo Inbasix. Si dudas entre modelos o configuraciones, un asesor te ayuda a elegir</p></div>
    ${[p, sib].map((x, i) => { const yes = (b, t) => `<div class="ctab__r"><i class="${b ? '' : 'no'}">${b ? ck : I.x}</i><span>${t}</span></div>`; const multi = (x.opts || []).some(o => o.v.length > 1);
      return `<div class="pcmp__col"><div class="pcmp__blob"><div>${x.img[0] ? `<img src="${K.img(x.img[0], 500)}" alt="" loading="lazy">` : ''}</div></div>
      <h3>${i ? `<a href="${K.pdp(x.h)}">${esc(nm(x))}</a>` : esc(nm(x))}</h3><p class="pr${K.isQuote(x) ? ' q' : ''}">${K.priceLabel(x)}</p>
      <div class="ctab">${yes(true, `Marca <em>${esc(vendorName(x.vendor))}</em>`)}${yes(!K.isQuote(x), 'Precio en línea')}${yes(multi, 'Varias configuraciones disponibles')}${yes(x.yt.length > 0, 'Video del equipo en nuestro canal')}${yes(true, 'Envío a todo México')}${equip ? yes(true, 'Capacitación botón por botón') + yes(true, 'Garantía de fábrica de 12 meses') : yes(true, 'Asesoría de especialistas')}</div>
      ${i ? `<a class="btn btn--soft" href="${K.pdp(x.h)}">Ver ${esc(nm(x).replace(/^Ultrasonido\s+/i, ''))}</a>` : ''}</div>`; }).join('')}
  </section>` : ''}

  <section class="notes" style="padding:8px 0 24px"><div class="pw"><div><p>Precios en pesos mexicanos. Los equipos “Precio bajo cotización” se cotizan según configuración. Entrega estimada de 3 a 10 días hábiles después de confirmado el pedido. Descripción y especificaciones del fabricante publicadas en inbasixmedical.com.</p></div></div></section>

  <section class="prev-sec" id="testimonios" aria-labelledby="rv-h">
    <h2 class="h2" id="rv-h">Lo que opinan nuestros clientes</h2>
    <div class="prev__top">
      <div class="prev__score"><b>45,000+</b><span>médicos confían en Inbasix</span></div>
      <div class="prev__bars">${[['29 años', 'de experiencia'], ['24 horas', 'para tu cotización formal'], ['24 horas', 'para aprobar tu financiamiento'], ['12 a 48 meses', 'de garantía']].map(([a, b]) => `<div><b style="color:var(--navy)">${a}</b><span style="color:var(--body)">${b}</span></div>`).join('')}</div>
    </div>
    <div data-reviews data-nohead="1"></div>
    <div class="reels rv-reels">${REELS.filter(hasVid).map(v => RM ? `<figure class="reel"><div class="reel__v"><img src="${B}assets/vid/${v}.jpg" alt=""></div><figcaption><small>${esc(RL[v][1])}</small>${esc(RL[v][0])}</figcaption></figure>` : `<figure class="reel" data-reveal><div class="reel__v"><video muted playsinline loop preload="none" poster="${B}assets/vid/${v}.jpg" data-inview src="${B}assets/vid/${v}.mp4"></video><button type="button" class="reel__snd" data-snd aria-label="Activar sonido">${I.mute}</button></div><figcaption><small>${esc(RL[v][1])}</small>${esc(RL[v][0])}</figcaption></figure>`).join('')}</div>
  </section>

  <section class="faq" aria-labelledby="faq-h"><div><h2 class="h2" id="faq-h">Preguntas frecuentes</h2><p class="t-l" style="margin-top:16px">¿Otra duda? <a class="ul-link" href="${WA()}" target="_blank" rel="noopener">Escríbenos por WhatsApp</a></p></div>
    <div class="faq__list">${FAQ.map(([q, a]) => `<details><summary>${esc(q)}<i aria-hidden="true"></i></summary><div class="ans"><p>${esc(a)}</p></div></details>`).join('')}</div></section>

  <section class="sec" style="padding:24px 0 40px"><div class="pw"><h2 class="h2" style="margin-bottom:24px">Marcas que distribuimos</h2><div class="logos" data-logos></div></div></section>

  ${rel.length ? `<section class="sec" style="padding:24px 0 56px"><div class="pw"><div class="sec-h"><h2 class="h2">También te puede interesar</h2><a class="ul-link" href="${catUrl(primaryCol)}">Ver todo</a></div><div class="grid4 hscroll">${rel.slice(0, 4).map(x => tile(x)).join('')}</div></div></section>` : ''}

  <div class="stk" data-stk aria-hidden="true"><div class="stk__in"><div class="stk__info"><div class="stk__name">${esc(name)}</div><div class="stk__p" data-stk-p></div></div>
    <div class="stk__btns"><button type="button" class="btn btn--cyan" data-add="${p.h}" data-vid="${cur.id}" data-stk-add>${ctaTxt()}</button><small>Financiamiento con aprobación en 24 horas</small></div></div></div>`;

  /* ---------- gallery ---------- */
  const stage = main.querySelector('[data-stage]'), tlist = main.querySelector('[data-tlist]');
  let gi = 0;
  function show(i) {
    if (!gallery.length) return;
    gi = (i + gallery.length) % gallery.length; const g = gallery[gi];
    stage.querySelectorAll('img.gimg, .ytf').forEach(n => n.remove());
    if (g.yt) { stage.insertAdjacentHTML('afterbegin', ytFacade(g.yt, name)); stage.style.cursor = 'default'; }
    else { const im = new Image(); im.className = 'gimg'; im.alt = name; im.src = K.img(g.src, 1400); im.style.opacity = 0; im.onload = () => requestAnimationFrame(() => im.style.opacity = 1); stage.insertAdjacentElement('afterbegin', im); stage.style.cursor = ''; }
    tlist && tlist.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-current', k === gi));
    const tb = tlist && tlist.children[gi]; if (tb) tb.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  show(0);
  if (tlist) tlist.addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (b) show(+b.dataset.g); });
  const tnext = main.querySelector('[data-tnext]'); if (tnext) tnext.addEventListener('click', () => { tlist.scrollTop += 182; });
  // hover zoom (fine pointer) + swipe
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  stage.addEventListener('mousemove', e => { if (!fine) return; const im = stage.querySelector('img.gimg'); if (!im) return; const r = stage.getBoundingClientRect(); im.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`; stage.classList.add('is-zoom'); });
  stage.addEventListener('mouseleave', () => stage.classList.remove('is-zoom'));
  let x0 = null; stage.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(gi + (dx < 0 ? 1 : -1)); x0 = null; });
  const syncH = () => main.querySelector('.pmain').style.setProperty('--stageh', stage.offsetHeight + 'px');
  addEventListener('resize', syncH); syncH();

  /* ---------- variants ---------- */
  const sel = (cur.o || []).slice();
  const optIdx = opts.map(o => p.opts.indexOf(o));
  const match = s => variants.find(v => optIdx.every((oi, k) => v.o[oi] === s[k]));
  const selV = () => { const s = optIdx.map(oi => sel[oi]); return match(s); };
  function paint() {
    const v = selV() || cur; cur = v;
    main.querySelectorAll('.popt').forEach((fs, k) => {
      const oi = optIdx[k];
      fs.querySelectorAll('.popt__btn').forEach(b => {
        const val = b.dataset.ov; const on = sel[oi] === val; b.setAttribute('aria-pressed', on);
        const s2 = optIdx.map(o => o === oi ? val : sel[o]); const mv = match(s2) || variants.find(x => x.o[oi] === val);
        const bb = b.querySelector('b'); bb.textContent = mv && mv.p ? K.money(mv.p) : 'A cotizar'; bb.className = mv && mv.p ? '' : 'q';
        b.disabled = !mv; b.style.opacity = mv && mv.a !== false ? '' : '.5';
      });
    });
    const pr = main.querySelector('[data-price]'), note = main.querySelector('[data-price-note]');
    pr.textContent = v.p ? K.money(v.p) : 'Precio bajo cotización'; pr.className = v.p ? '' : 'q';
    note.textContent = v.p ? 'MXN' : 'Propuesta formal en menos de 24 h';
    main.querySelectorAll('[data-add="' + p.h + '"],[data-buy="' + p.h + '"]').forEach(b => b.dataset.vid = v.id);
    main.querySelectorAll('[data-main-add],[data-stk-add]').forEach(b => b.textContent = v.p ? 'Agregar al carrito' : 'Cotizar');
    const sp = main.querySelector('[data-stk-p]'); sp.textContent = v.p ? K.money(v.p) : 'Precio bajo cotización'; sp.className = 'stk__p' + (v.p ? '' : ' q');
    const mb = main.querySelector('[data-main-buy]'); if (mb) mb.hidden = !v.p;
  }
  main.addEventListener('click', e => { const b = e.target.closest('.popt__btn'); if (!b || b.disabled) return; const oi = optIdx[+b.closest('.popt').dataset.oi]; sel[oi] = b.dataset.ov; if (!selV()) { const v = variants.find(x => x.o[oi] === b.dataset.ov); if (v) v.o.forEach((x, k) => sel[k] = x); } paint(); });
  paint();

  /* ---------- services carousel ---------- */
  (function car() {
    const track = main.querySelector('[data-ctrack]'), prev = main.querySelector('[data-cprev]'), next = main.querySelector('[data-cnext]'), prog = main.querySelector('[data-cprog]');
    let i = 0;
    const step = () => { const c = track.children[0]; return c ? c.offsetWidth + 24 : 330; };
    const maxI = () => Math.max(0, Math.ceil((track.scrollWidth - track.parentElement.offsetWidth + 24) / step()));
    const upd = () => { const m = maxI(); i = Math.min(i, m); track.style.transform = `translateX(${-Math.min(i * step(), Math.max(0, track.scrollWidth - track.parentElement.offsetWidth + 24))}px)`; prev.disabled = i === 0; next.disabled = i >= m; const vis = Math.min(1, track.parentElement.offsetWidth / track.scrollWidth); prog.style.width = (vis * 100) + '%'; prog.style.transform = `translateX(${m ? (i / m) * ((1 - vis) / vis) * 100 : 0}%)`; };
    prev.addEventListener('click', () => { i = Math.max(0, i - 1); upd(); }); next.addEventListener('click', () => { i++; upd(); });
    let x0 = null; track.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { i = Math.max(0, i + (dx < 0 ? 1 : -1)); upd(); } x0 = null; });
    addEventListener('resize', upd); upd();
  })();

  if (window.V3.reviews) main.querySelectorAll('[data-reviews]').forEach(window.V3.reviews);

  /* ---------- logos ---------- */
  (function logos() {
    const lg = main.querySelector('[data-logos]'); if (!lg) return;
    const L = ['Mindray', 'SAMSUNG', 'Nubway', 'GiLáser', 'REJUBEAU', 'GE General Electric', 'SIEMENS', 'Philips', 'HOLOGIC', 'Toshiba'];
    const colOf = { Mindray: 'equipo-de-ultrasonido-mindray', SAMSUNG: 'equipo-de-ultrasonido-samsung', Nubway: 'nubway', 'GiLáser': 'gilaser', REJUBEAU: 'rejubeau', 'GE General Electric': 'tomografos', SIEMENS: 'resonancia-magnetica', Philips: 'medicina-nuclear', HOLOGIC: 'mastografos', Toshiba: 'tomografos' };
    lg.innerHTML = `<div class="logos__track">${L.map(v => window.V3.logoItem(v, catUrl(colOf[v]))).join('')}${L.map(v => window.V3.logoItem(v, catUrl(colOf[v]), 1)).join('')}</div>`;
  })();

  /* ---------- sticky add-to-cart ---------- */
  (function sticky() {
    const bar = main.querySelector('[data-stk]'), cta = main.querySelector('[data-cta]'), foot = document.querySelector('.ftr');
    let ctaOut = false, footIn = false;
    const set = () => { const on = ctaOut && !footIn; bar.classList.toggle('is-on', on); bar.setAttribute('aria-hidden', !on); document.body.style.paddingBottom = on ? bar.offsetHeight + 'px' : ''; };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => { ctaOut = !en.isIntersecting && en.boundingClientRect.top < 0; set(); }).observe(cta);
      if (foot) new IntersectionObserver(([en]) => { footIn = en.isIntersecting; set(); }).observe(foot);
    }
  })();

  /* ---------- description: sanitize + derive tabs and banner ---------- */
  function clean(html) {
    const d = new DOMParser().parseFromString(html || '', 'text/html'), b = d.body;
    b.querySelectorAll('script,style,iframe,object,embed,form,input,button,link,meta,noscript,svg').forEach(n => n.remove());
    b.querySelectorAll('*').forEach(el => { [...el.attributes].forEach(a => { if (!['href', 'src', 'alt', 'colspan', 'rowspan'].includes(a.name)) el.removeAttribute(a.name); });
      if (el.tagName === 'A') { const hr = el.getAttribute('href') || ''; if (/^\s*javascript:/i.test(hr)) el.removeAttribute('href'); el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
      if (el.tagName === 'IMG') { el.setAttribute('loading', 'lazy'); const s = el.getAttribute('src') || ''; if (s.startsWith('//')) el.setAttribute('src', 'https:' + s); } });
    b.querySelectorAll('span,font,center,u').forEach(el => el.replaceWith(...el.childNodes));
    b.querySelectorAll('h1').forEach(el => { const n = d.createElement('h3'); n.innerHTML = el.innerHTML; el.replaceWith(n); });
    for (let k = 0; k < 2; k++) b.querySelectorAll('p,div,li,strong,b,em,h2,h3,h4,h5,h6').forEach(el => { if (!el.textContent.replace(/ /g, '').trim() && !el.querySelector('img,table')) el.remove(); });
    b.querySelectorAll('table').forEach(t => { const w = d.createElement('div'); w.className = 'tbl'; t.replaceWith(w); w.appendChild(t); });
    return b;
  }
  const txt = n => n.textContent.replace(/\s+/g, ' ').trim();
  K.body(p.h).then(data => {
    const b = clean(data && data.body);
    const bullets = [...b.querySelectorAll('li')].map(txt).filter(t => t.length > 2 && t.length < 160).slice(0, 12);
    let specs = [];
    b.querySelectorAll('tr').forEach(tr => { const c = [...tr.children].map(txt); if (c.length >= 2 && c[0] && c[1] && c[0].length < 60) specs.push([c[0], c.slice(1).join(' · ')]); });
    if (!specs.length) b.querySelectorAll('p,li').forEach(n => { const m = txt(n).match(/^([^:]{3,32}):\s*(.{2,140})$/); if (m) specs.push([m[1], m[2]]); });
    specs = specs.slice(0, 40);
    const hasBody = txt(b).length > 40;

    // banner
    const heads = [...b.querySelectorAll('h2,h3,h4,strong')].map(txt).filter(t => t.length >= 10 && t.length <= 80 && !t.toLowerCase().includes(name.toLowerCase().slice(0, 12).toLowerCase()) && !/^(serie|detalles|características|caracteristicas|especificaciones)/i.test(t));
    const paras = [...b.querySelectorAll('p')].map(txt).filter(t => t.length > 70);
    const pb = main.querySelector('[data-pban]');
    if (pb && (p.img[1] || p.img[0]) && (heads[0] || paras[0])) {
      const H = heads[0] || name; let P = paras.find(x => x !== H) || '';
      if (P.length > 230) { const cut = P.slice(0, 230); P = cut.slice(0, Math.max(cut.lastIndexOf('. ') + 1, cut.lastIndexOf(' '))) + (cut.lastIndexOf('. ') > 120 ? '' : '…'); }
      pb.querySelector('[data-pban-h]').textContent = H.replace(/[.:]$/, '');
      pb.querySelector('[data-pban-p]').textContent = P;
      pb.hidden = false;
      if ('IntersectionObserver' in window) new IntersectionObserver(([en], o) => { if (en.isIntersecting) { pb.classList.add('is-in'); o.disconnect(); } }, { threshold: .25 }).observe(pb); else pb.classList.add('is-in');
    }

    // tabs
    const incl = [name + (cur.t && cur.t !== 'Default Title' ? ` (${cur.t})` : '')].concat(equip ? ['Capacitación botón por botón para tu personal', 'Instalación profesional', 'Garantía de fábrica de 12 meses, ampliable a 48', 'Asesoría con ingenieros biomédicos', 'Envío a todo México'] : ['Asesoría de especialistas', 'Envío a todo México']);
    const pimg = p.img[0] ? `<img src="${K.img(p.img[0], 900)}" alt="${esc(name)}" loading="lazy">` : `<img src="${B}assets/brand/logo-navy.png" alt="" style="max-width:50%">`;
    const T2 = [['inc', 'Lo que incluye', `<div class="ptabs__inc"><div class="ptabs__img">${pimg}</div><ul class="blist">${incl.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`]];
    if (bullets.length >= 2) T2.push(['car', 'Características', `<ul class="blist" style="columns:2;column-gap:44px;display:block">${bullets.map(t => `<li style="break-inside:avoid;margin-bottom:10px">${esc(t)}</li>`).join('')}</ul>`]);
    if (specs.length >= 2) T2.push(['spe', 'Especificaciones', `<div class="rte"><div class="tbl"><table><tbody>${specs.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</tbody></table></div></div>`]);
    if (hasBody) { const bb = b.cloneNode(true); T2.push(['des', 'Descripción', `<div class="rte">${bb.innerHTML}</div>`]); }
    const tl = main.querySelector('[data-ptabs]'), pp = main.querySelector('[data-ppanels]');
    tl.innerHTML = T2.map(([id, t], i) => `<button type="button" role="tab" id="tab-${id}" aria-controls="pan-${id}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}">${t}</button>`).join('');
    pp.innerHTML = T2.map(([id, , html], i) => `<div role="tabpanel" id="pan-${id}" aria-labelledby="tab-${id}"${i ? ' hidden' : ''}>${html}</div>`).join('');
    tabs(tl);
    K.watch(main);
  });

  // FAQ smooth open
  main.querySelectorAll('.faq details').forEach(d => d.addEventListener('toggle', () => { if (d.open && !RM) { const a = d.querySelector('.ans'); a.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' }); } }));

  if (window.V3.photos) window.V3.photos(main);
  K.watch(main);
})();
