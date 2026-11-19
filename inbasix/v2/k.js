/* Inbasix v2 — shared shell (header, footer, drawer, carousels, cards, search) */
(function () {
  const I = window.IBK;
  const A = '../assets/';
  const V = A + 'vid/';
  document.documentElement.classList.remove('no-js');

  /* ---------- icons ---------- */
  const sv = (d, vb, extra) => `<svg viewBox="${vb || '0 0 24 24'}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra || ''}>${d}</svg>`;
  const IC = {
    search: sv('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>'),
    chev: sv('<path d="M5 9l7 7 7-7"/>'),
    right: sv('<path d="M9 5l7 7-7 7"/>'),
    left: sv('<path d="M15 5l-7 7 7 7"/>'),
    arrowR: sv('<path d="M4 12h16M14 6l6 6-6 6"/>'),
    pin: sv('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    cart: sv('<path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.5L21 8H6.2"/><circle cx="10" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/>'),
    burger: sv('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    x: sv('<path d="M6 6l12 12M18 6L6 18"/>'),
    head: sv('<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>'),
    heart: sv('<path d="M12 20s-7.5-4.6-9.2-9.3C1.7 7.5 3.8 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.2 0 5.3 3 4.2 6.2C19.5 15.4 12 20 12 20z"/>'),
    share: sv('<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>'),
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
    check: sv('<path d="M5 12.5l4.5 4.5L19 7"/>', null, ' stroke-width="2.4"'),
    checkC: sv('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16.5 9.5"/>'),
    shield: sv('<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'),
    truck: sv('<path d="M2 6h11v10H2zM13 9h4.5l3.5 3.5V16h-8"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    tool: sv('<path d="M14.5 6.5a4 4 0 0 0 5 5l-8.8 8.8a2.1 2.1 0 0 1-3-3L16.5 8.5"/><path d="M14.5 6.5l3-3a4 4 0 0 0-5 5"/>'),
    cap: sv('<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3.5 2.5 8.5 2.5 12 0v-5"/><path d="M22 9v6"/>'),
    doc: sv('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>'),
    card: sv('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>'),
    cash: sv('<circle cx="12" cy="12" r="9"/><path d="M14.8 9.2c-.6-.8-1.6-1.2-2.8-1.2-1.6 0-2.8.8-2.8 2s1.2 1.7 2.8 2 2.8.8 2.8 2-1.2 2-2.8 2c-1.3 0-2.4-.5-3-1.4M12 6.5V8M12 16v1.5"/>'),
    swap: sv('<path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/>'),
    user: sv('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>'),
    gear: sv('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    building: sv('<path d="M4 21V5l8-2v18M12 21V9l8 2v10M2 21h20M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2"/>'),
    chat: sv('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01" stroke-width="2.4"/>'),
    sliders: sv('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'),
    sort: sv('<path d="M7 4v16M3.5 7.5L7 4l3.5 3.5M17 20V4M13.5 16.5L17 20l3.5-3.5"/>'),
    sound: sv('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
    mute: sv('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>'),
    calendar: sv('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    spark: sv('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>'),
    box: sv('<path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9"/>'),
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z"/></svg>',
    wa: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.4.7 4.7 1.9 6.7L3 29l6.9-2.1c1.9 1 4 1.6 6.1 1.6 7 0 12.7-5.7 12.7-12.7S23 3 16 3zm0 23.2c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.1 1.2 1.2-4-.3-.4c-1.1-1.7-1.7-3.6-1.7-5.6C5.3 9.8 10.1 5.1 16 5.1s10.7 4.7 10.7 10.6S21.9 26.2 16 26.2zm5.9-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2.1-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8 0 1.6 1.2 3.2 1.4 3.4.2.2 2.3 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.2-.7-.4z"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21z"/></svg>',
    ig: sv('<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><path d="M17 7h.01" stroke-width="2.4"/>', null, ' stroke-width="2"'),
    yt: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z"/></svg>',
    phone: sv('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
    mail: sv('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>')
  };

  /* ---------- reference data (verified, from BRIEF.md) ---------- */
  const WA = n => `https://wa.me/${I.WA}?text=${encodeURIComponent(n)}`;
  const BRANDS = [
    { slug: 'mindray', name: 'Mindray', logo: 'color/mindray.png', crop: 1, v: ['Mindray'] },
    { slug: 'samsung', name: 'Samsung', logo: 'color/samsung-medison.svg', v: ['SAMSUNG'] },
    { slug: 'nubway', name: 'Nubway', logo: 'color/nubway.png', v: ['Nubway'] },
    { slug: 'gilaser', name: 'GiLáser', logo: 'color/gilaser.png', v: ['GiLáser'] },
    { slug: 'rejubeau', name: 'Rejubeau', logo: 'color/rejubeau.png', v: ['REJUBEAU'] },
    { slug: 'ge', name: 'GE HealthCare', logo: 'color/ge.svg', v: ['GE General Electric'] },
    { slug: 'siemens', name: 'Siemens Healthineers', logo: 'color/siemens-healthineers.svg', v: ['SIEMENS'] },
    { slug: 'philips', name: 'Philips', logo: 'color/philips.svg', v: ['Philips'] },
    { slug: 'hologic', name: 'Hologic', logo: 'color/hologic.svg', v: ['HOLOGIC'] },
    { slug: 'toshiba', name: 'Toshiba', logo: 'color/toshiba.svg', v: ['Toshiba'] }
  ];
  const vendorSlug = v => { const b = BRANDS.find(b => b.v.includes(v)); return b ? b.slug : (v || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  const vendorName = v => { const b = BRANDS.find(b => b.v.includes(v)); return b ? b.name : (v === 'YOUTHFILL' ? 'YouthFill' : v === 'SYNICS' ? 'Synics' : v); };
  const cardName = p => { let t = I.shortName(p); const vn = vendorName(p.vendor), raw = p.vendor;
    [vn, raw].forEach(x => { t = t.replace(new RegExp('\\s*-\\s*' + x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$', 'i'), ''); });
    t = t.replace(new RegExp('^(ultrasonido\\s+(port[aá]til\\s+)?)?' + vn.split(' ')[0] + '\\s+', 'i'), '$1').replace(new RegExp('\\s+' + vn.split(' ')[0] + '$', 'i'), '');
    return t.charAt(0).toUpperCase() + t.slice(1); };
  const CATS = [
    ['equipo-de-ultrasonido-mindray', 'Ultrasonido Mindray'], ['equipo-de-ultrasonido-samsung', 'Ultrasonido Samsung'],
    ['sistemas-de-diagnostico-por-ultrasonido', 'Ultrasonido'], ['aparatologia-estetica', 'Aparatología estética'], ['fillers', 'Fillers'],
    ['tomografos', 'Tomógrafos'], ['resonancia-magnetica', 'Resonancia magnética'], ['arco-en-c', 'Arco en C'], ['medicina-nuclear', 'Medicina nuclear'],
    ['tomografia-pet-pet-ct', 'PET y PET-CT'], ['mastografos', 'Mastógrafos'], ['rayos-x-y-digitalizadores', 'Rayos X y digitalizadores'], ['quirofano', 'Quirófano'],
    ['transductores-de-uso-humano', 'Transductores'], ['accesorios', 'Accesorios'], ['equipo-veterinario', 'Equipo veterinario']
  ];
  // Category groups → real Shopify collections (one map for the whole v2 site)
  const GROUPS = [
    { k: 'ultrasonido', t: 'Ultrasonido', tile: 'tiles/ultrasonido-1x1.webp', x: p => p.vendor === 'Nubway' || p.vendor === 'GiLáser', d: 'Ultrasonido Mindray y Samsung de gabinete y portátil para imagen general, ginecología y radiología.',
      c: [['sistemas-de-diagnostico-por-ultrasonido', 'Todos los ultrasonidos'], ['equipo-de-ultrasonido-mindray', 'Ultrasonido Mindray'], ['equipo-de-ultrasonido-samsung', 'Ultrasonido Samsung'], ['ultrasonidos-de-gabinete-uso-humano', 'De gabinete'], ['ginecologia-mindray', 'Ginecología de gabinete Mindray'], ['ultrasonidos-portatiles-para-ginecologia-de-uso-humano-mindray', 'Portátiles para ginecología Mindray'], ['samsung-gabinete-ginecologia', 'Ginecología de gabinete Samsung'], ['ginecologia-portatil-samsung', 'Ginecología portátil Samsung'], ['radiologia-portatil-humano', 'Radiología portátil'], ['imagenes-generales-mindray', 'Imágenes generales Mindray'], ['estetica-portatil-humano', 'Portátil para medicina estética'], ['ultrasonido-veterinario', 'Ultrasonido veterinario']] },
    { k: 'aparatologia-estetica', t: 'Aparatología estética', tile: 'tiles/aparatologia-1x1.webp', d: 'Láser, HIFU, criolipólisis y más para tu clínica o spa, con capacitación incluida.',
      c: [['aparatologia-estetica', 'Toda la aparatología'], ['nubway', 'Nubway'], ['gilaser', 'GiLáser'], ['serie-antienvejecimiento', 'Antienvejecimiento'], ['serie-cuidado-de-la-piel', 'Cuidado de la piel'], ['serie-para-adelgazar-y-dar-forma', 'Adelgazar y dar forma'], ['serie-para-depilacion', 'Depilación'], ['serie-removedor-de-tatuajes-y-pigmentacion', 'Tatuajes y pigmentación'], ['serie-terapia-en-frio', 'Terapia en frío'], ['serie-tratamiento-de-venas', 'Tratamiento de venas']] },
    { k: 'imagenologia', t: 'Imagenología', tile: 'tiles/imagenologia-1x1.webp', d: 'Tomógrafos, resonancia, rayos X, arco en C, mastografía, medicina nuclear y PET.',
      c: [['tomografos', 'Tomógrafos'], ['resonancia-magnetica', 'Resonancia magnética'], ['rayos-x-y-digitalizadores', 'Rayos X y digitalizadores'], ['arco-en-c', 'Arco en C'], ['mastografos', 'Mastógrafos'], ['medicina-nuclear', 'Medicina nuclear'], ['tomografia-pet-pet-ct', 'PET y PET-CT']] },
    { k: 'fillers', t: 'Fillers', tile: 'tiles/fillers-1x1.webp', d: 'Rellenos, bioestimuladores y skin boosters Rejubeau y YouthFill.',
      c: [['fillers', 'Todos los fillers'], ['rejubeau', 'Rejubeau'], ['youthfill', 'YouthFill']] },
    { k: 'veterinario', t: 'Veterinario', tile: 'tiles/veterinario-1x1.webp', d: 'Ultrasonido y equipo para clínicas veterinarias.',
      c: [['equipo-veterinario', 'Equipo veterinario'], ['ultrasonido-veterinario', 'Ultrasonido veterinario de gabinete']] },
    { k: 'quirofano', t: 'Quirófano', tile: 'tiles/equipo-medico-1x1.webp', d: 'Anestesia, mesas, lámparas, monitores, desfibriladores y electrocardiógrafos.',
      c: [['quirofano', 'Quirófano'], ['desfibriladores-mindray', 'Desfibriladores'], ['electrocardiografos-uso-humano', 'Electrocardiógrafos'], ['rehabilitacion', 'Rehabilitación']] },
    { k: 'transductores-y-accesorios', t: 'Transductores y accesorios', tile: null, d: 'Transductores de uso humano y accesorios Mindray.',
      c: [['transductores-de-uso-humano', 'Transductores'], ['accesorios', 'Accesorios']] }
  ];
  const inGroup = (p, g) => g.c.some(([h]) => p.cols.includes(h)) && !(g.x && g.x(p)); // by collection handle; aesthetic vendors never in diagnostic ultrasound
  const groupOf = p => GROUPS.find(g => inGroup(p, g));
  const plp = o => { const u = new URLSearchParams(); Object.entries(o || {}).forEach(([a, b]) => b && u.set(a, b)); const s = u.toString(); return 'coleccion.html' + (s ? '?' + s : ''); };
  const catName = h => (CATS.find(c => c[0] === h) || [h, (I.COLS.find(c => c.h === h) || {}).t || h])[1];
  const TESTI = [
    { q: 'Gracias al arrendamiento de Inbasix pude abrir mi segunda sucursal sin tocar mis ahorros. El proceso fue increíblemente rápido.', n: 'Dr. Carlos Ramírez', r: 'Ginecólogo Obstetra', img: 'medico_caso_de_exito.webp' },
    { q: 'La asesoría técnica fue clave. No sabía qué ultrasonido elegir y me ayudaron a encontrar la mejor relación costo-beneficio.', n: 'Dra. Sofía Méndez', r: 'Radióloga', img: 'DOCTORA_CASO_DE_EXITO_INBASIX.webp' },
    { q: 'Excelente servicio post-venta. Tuvimos una duda con la configuración del equipo y nos atendieron el mismo día.', n: 'Dr. Luis Torres', r: 'Director Clínico', img: 'dr_caso_de_exito.webp' }
  ];
  // Real titles of Inbasix Medical's YouTube videos (oEmbed), keyed by id → product they belong to.
  const YT = {
    M4vJD808YYY: 'Ultrasonido Mindray CONSONA N9 para imagen general', T7g8WbjKpRY: 'Consona N8/N9 Sistema de diagnóstico por ultrasonido Mindray',
    sLLEWXz6RvA: 'MiCo+ plataforma de Mindray para médicos de todo el mundo', kHGrDOZO3nY: 'Ultrasonido Mindray MX3 para Imagen General',
    rVh31LkO9Ec: 'Mindray MX3, MX5 y MX6: Sistema de Ultrasonido portátil para cada necesidad clínica', M4aSn5T2vrQ: 'Beneficio MiCo+ para equipos de ultrasonido Mindray',
    ReZ2wTCJcQA: 'Ultrasonido Mindray MX6 para imagen general', HUfWaCITFBM: 'Ultrasonido portátil Mindray MX6 para ginecología y obstetricia',
    '0bcbN-HI8zE': 'Ultrasonido portátil Mindray MX7 para Dermatología y Medicina Estética', 'P8uv-w941hg': 'Ultrasonido Mindray MX7',
    wrQsnhz3Wdg: 'Ultrasonido RESONA i9 - MINDRAY', e7ztaINKlx4: 'Criolipólisis 360', '0vBLX-Irgnc': 'Láser Picosecond', ZRrlfDqJGS0: 'Láser ND Yag con registro de COFEPRIS',
    jF0604GjI4w: 'Cryo Therapy Cool 30 ºC', '1e9kIhxFd2Q': 'Láser CO2 70W', qCjcrInufV4: 'HIFU', MLVawVdwYAc: 'HIFU 5D Mini',
    'J-1CZizZhpo': 'Aplicación de tratamiento de rejuvenecimiento facial con MicroNeedle', r5nPuKTWPaU: 'Hi Skin 9 en 1', XYduUjfgcNg: 'LED Therapy Skin',
    '3Uj0b4q718c': 'ME Time Lifting en Inbasix Medical', uDGo2DVzyas: 'Ultrasonido Mindray Nuewa I9 en Inbasix Medical'
  };
  const ytOwner = id => I.P.find(p => p.yt.includes(id));
  const ytThumb = id => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const FAQ = [
    ['¿Cómo me aseguran que tienen el mejor precio?', 'Somos importadores directos de fábrica y distribuidor autorizado directo de la marca en México. Compras sin intermediarios.'],
    ['No soy médico, soy dueño de un spa, ¿puedo comprar?', 'Sí. Spas y centros de bienestar también pueden comprar aparatología estética.'],
    ['¿Dónde puedo ver el equipo?', 'En nuestros showrooms de CDMX, Guadalajara, Monterrey y Chihuahua, con salas de ultrasonido, quirófano, laparoscopía, endoscopía, neonatología y aparatología estética.'],
    ['¿Qué formas de pago tienen?', 'Transferencia bancaria BBVA a nombre de IMPORTACIONES INBASIX S.A. de C.V., tarjeta de crédito o débito, crédito bancario y arrendamiento puro.'],
    ['¿Qué garantía dan?', 'Garantía estándar del fabricante de 12 meses, con ampliación a 24, 36 o 48 meses. Después de la garantía te damos servicio postventa.'],
    ['¿Incluye capacitación?', 'Sí. La capacitación botón por botón está incluida, con instalación profesional y capacitación técnica a tu personal en toda la república.'],
    ['¿Cuál es el tiempo de entrega?', 'La entrega estimada es de 3 a 10 días hábiles después de confirmado tu pedido. Tenemos envíos a todo México.'],
    ['¿Envían fuera del país?', 'Sí, contáctanos para revisar tu envío fuera de México.'],
    ['¿Me dan asesoramiento técnico?', 'Sí. Te asesoran ingenieros biomédicos para elegir el equipo con la mejor relación costo-beneficio.']
  ];
  const SHOWS = [
    { c: 'CDMX', img: 'inbasix_cdmx.webp' }, { c: 'Guadalajara', img: 'inbasix_guadalajara.webp', a: 'Av. de las Américas 1545, Providencia, 44630 Guadalajara, Jal.' },
    { c: 'Monterrey', img: 'inbasix_monterrey.webp' }, { c: 'Chihuahua', img: 'inbasix_chihuahua.webp' }
  ];
  const POL = [['aviso-de-privacidad-de-inbasix-medical', 'Aviso de privacidad'], ['politicas-de-venta', 'Políticas de venta'], ['politicas-de-devolucion', 'Devoluciones'], ['politicas-de-envio', 'Envíos'], ['politicas-de-cancelacion', 'Cancelaciones'], ['politica-de-costos-extras', 'Costos extras']];

  /* ---------- helpers ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const pdp = h => 'product.html?p=' + encodeURIComponent(h);
  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const priceParts = p => { const m = I.minPrice(p); if (m == null) return null; const [a, b] = I.money(m).replace('$', '').split('.'); return { from: I.priced(p).length > 1, int: a, dec: b }; };
  const priceHTML = (p, cls) => { const pp = priceParts(p); return pp ? `<div class="k-price ${cls || ''}"><i>$</i><b>${pp.int}</b><u>.${pp.dec}</u></div>` : `<div class="k-price k-price--q ${cls || ''}"><b>Precio bajo cotización</b></div>`; };
  const typeLabel = p => p.type === 'Equipo médico' ? (p.cols.includes('tomografos') ? 'Tomógrafo' : p.cols.includes('resonancia-magnetica') ? 'Resonancia magnética' : p.cols.includes('arco-en-c') ? 'Arco en C' : p.cols.includes('medicina-nuclear') ? 'Medicina nuclear' : p.cols.includes('mastografos') ? 'Mastógrafo' : p.cols.includes('rayos-x-y-digitalizadores') ? 'Rayos X' : p.cols.includes('quirofano') ? 'Quirófano' : p.cols.includes('accesorios') ? 'Accesorio' : 'Equipo médico') : p.type;
  const nOpts = p => p.v.length > 1 ? `${p.v.length} configuraciones` : 'Configuración única';
  // Photo kit (assets/photo/PHOTOS.md): studio cards + transparent cutouts for 24 real product renders.
  const PROD = new Set(["acido-hialuronico-ha-stylish-plus-200", "acido-hialuronico-youthfill-deep", "acido-poli-l-lactico-le-ciel-rosy", "aqua-bomb", "body-sculptor-gilaser", "cryolipolisis-360-nubway", "dax-exosoma-ampolleta-de-rejuvenecimiento", "hi-skin-9-en-1", "hifu-mini", "ipl-elight", "laser-co2-70w", "laser-diodo-quattro", "laser-picosecond", "laser-tri-diodo-mini-nubway", "microneedle-mini", "plasma-tech", "sculpt-muscle-nubway", "ultrasonido-hera-w10", "ultrasonido-mindray-consona-n5", "ultrasonido-mindray-dc30-gin", "ultrasonido-mindray-dc40-full-hd-incluye-transductor-volumetrico-vaginal-convexo", "ultrasonido-mindray-dp-20", "ultrasonido-mindray-mx3-gin", "ultrasonido-mindray-mx7"]);
  const PH = A + 'photo/';
  const cut = p => PROD.has(p.h) ? PH + 'prod/cut/' + p.h + '.webp' : null;          // transparent, for cards on white
  const studio = p => PROD.has(p.h) ? PH + 'prod/' + p.h + '.webp' : null;          // 1600² studio card, PDP first image
  const pimg = (p, w) => cut(p) || (p.img.length ? I.img(p.img[0], w) : A + 'brand/logo-navy.png');
  const vids = n => ({ mp4: V + n + '.mp4', jpg: V + n + '.jpg' });
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loopVideo = (n, cls) => `<video class="${cls || ''}" muted playsinline loop preload="metadata" poster="${vids(n).jpg}" data-inview><source src="${vids(n).mp4}" type="video/mp4"></video>`;
  const loopFor = p => { const c = p.cols, t = norm(p.t);
    if (c.includes('fillers') || p.type === 'Fillers') return 'loop-plla';
    if (/co2/.test(t)) return 'loop-co2'; if (/hifu|v-shape|smas/.test(t)) return 'loop-hifu';
    if (/microneedle|micro needle|rf/.test(t)) return 'loop-microneedle';
    if (p.type === 'Aparatología Estética' || c.includes('aparatologia-estetica')) return 'loop-showroom';
    if (/mx7|mx6|mx3|mx5/.test(t)) return 'loop-mx7'; if (/nuewa/.test(t)) return 'loop-nuewa'; if (/consona|resona|dc-|dp-/.test(t)) return 'loop-consona';
    if (p.vendor === 'SAMSUNG') return 'loop-samsung'; if (p.vendor === 'Mindray') return 'loop-consona';
    if (/veterin/.test(t) || c.includes('equipo-veterinario')) return 'loop-curso';
    return 'loop-showroom'; };

  /* ---------- cards ---------- */
  const mcard = p => `<a class="k-mcard" href="${pdp(p.h)}">
      <div class="k-mcard__img"><img src="${pimg(p, 400)}" alt="${esc(p.t)}" loading="lazy" width="262" height="128"></div>
      <div class="k-mcard__b"><h3 class="k-mcard__t">${esc(I.shortName(p))}</h3>
      ${I.isQuote(p) ? '<div class="k-mcard__p is-q">Precio bajo cotización</div>' : `<div class="k-mcard__p">${I.priced(p).length > 1 ? '<span style="font-size:12px;font-weight:400">Desde </span>' : ''}${I.money(I.minPrice(p))}</div>`}
      <p class="k-mcard__m">${esc(vendorName(p.vendor))} • ${esc(typeLabel(p))}</p></div></a>`;
  const pcard = (p, opt) => {
    const q = I.isQuote(p); const o = opt || {};
    const flag = q ? '' : `<span class="k-pcard__flag">${IC.cart}Compra en línea</span>`;
    return `<div class="k-pcard">
      <a class="k-pcard__img" href="${pdp(p.h)}">${p.img.length ? `<img src="${pimg(p, 520)}" alt="${esc(p.t)}" loading="lazy">` : `<img src="${A}brand/logo-navy.png" alt="" style="object-fit:contain;padding:60px">`}${flag}</a>
      <a class="k-pcard__b" href="${pdp(p.h)}"><h3 class="k-pcard__t">${esc(vendorName(p.vendor))} • ${esc(cardName(p))}</h3><p class="k-pcard__m">${esc(typeLabel(p))} • ${nOpts(p)}</p></a>
      <div class="k-pcard__pr"><small>${q ? 'Cotización formal' : I.priced(p).length > 1 ? 'Precio desde' : 'Precio'}</small>${priceHTML(p)}<em>${q ? 'Te la enviamos en menos de 24 h' : 'Pago seguro en línea'}</em></div>
      ${o.actions ? `<div class="k-pcard__act">${q ? `<button class="k-btn k-btn--ghost" type="button" data-add="${p.h}">Cotizar</button>` : `<button class="k-btn" type="button" data-add="${p.h}">Agregar al carrito</button>`}</div>` : ''}
      <div class="k-pcard__loc">${IC.truck}Envío a todo México · Garantía 12 meses</div></div>`;
  };
  const arrows = () => `<button class="k-arrow k-arrow--prev" type="button" aria-label="Anterior" hidden>${IC.left}</button><button class="k-arrow k-arrow--next" type="button" aria-label="Siguiente">${IC.right}</button>`;
  function carousel(root) {
    $$('.k-scroller', root).forEach(sc => {
      if (sc.dataset.ok) return; sc.dataset.ok = 1;
      const tr = $('.k-track', sc), prev = $('.k-arrow--prev', sc), next = $('.k-arrow--next', sc);
      if (!tr || !next) return;
      const step = () => { const c = tr.children[0]; return c ? (c.getBoundingClientRect().width + parseFloat(getComputedStyle(tr).columnGap || 16)) * Math.max(1, Math.floor(tr.clientWidth / c.getBoundingClientRect().width)) : tr.clientWidth; };
      const upd = () => { prev.hidden = tr.scrollLeft < 4; next.hidden = tr.scrollLeft + tr.clientWidth >= tr.scrollWidth - 4; };
      prev.onclick = () => tr.scrollBy({ left: -step() }); next.onclick = () => tr.scrollBy({ left: step() });
      tr.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); setTimeout(upd, 50); upd();
    });
  }

  /* ---------- accordion + tabs (delegated) ---------- */
  document.addEventListener('click', e => {
    const h = e.target.closest('.k-acc__h');
    if (h) { const it = h.closest('.k-acc__i'); const open = !it.classList.contains('is-open'); it.classList.toggle('is-open', open); h.setAttribute('aria-expanded', open); return; }
    const t = e.target.closest('[data-tab]');
    if (t) { const g = t.closest('[data-tabs]'); const scope = g.dataset.tabs ? document.getElementById(g.dataset.tabs) : g.parentElement;
      $$('[data-tab]', g).forEach(b => { b.classList.toggle('is-on', b === t); b.setAttribute('aria-selected', b === t); });
      $$('[data-pane]', scope).forEach(p => p.hidden = p.dataset.pane !== t.dataset.tab); }
    const y = e.target.closest('[data-yt]');
    if (y) { e.preventDefault(); openYT(y.dataset.yt); }
  });
  const acc = (items, open) => `<div class="k-acc">${items.map(([q, a], i) => `<div class="k-acc__i${open === i ? ' is-open' : ''}"><button class="k-acc__h" type="button" aria-expanded="${open === i}"><span>${q}</span>${IC.chev}</button><div class="k-acc__b"><div><div class="k-acc__in">${a}</div></div></div></div>`).join('')}</div>`;

  /* ---------- video modal ---------- */
  function openYT(id) {
    let m = $('#k-yt');
    if (!m) { m = document.createElement('div'); m.id = 'k-yt'; m.className = 'k-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Video');
      m.innerHTML = '<div class="k-modal__scrim" data-ytx></div><div class="k-modal__box"><button class="k-modal__x" type="button" data-ytx aria-label="Cerrar">×</button><div data-ytf style="width:100%;height:100%"></div></div>';
      document.body.appendChild(m); m.addEventListener('click', e => { if (e.target.closest('[data-ytx]')) closeYT(); }); }
    $('[data-ytf]', m).innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0" title="Video de Inbasix Medical" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    m.classList.add('is-open'); document.documentElement.classList.add('ib-lock');
  }
  function closeYT() { const m = $('#k-yt'); if (!m) return; m.classList.remove('is-open'); $('[data-ytf]', m).innerHTML = ''; document.documentElement.classList.remove('ib-lock'); }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeYT(); closeMenu(); } });

  /* ---------- shell: bar, header, menu, drawer, footer, wa ---------- */
  const NAV = [
    ['coleccion.html', 'Productos'], ['index.html#financiamiento', 'Financiamiento'], ['index.html#showrooms', 'Showrooms']
  ];
  const headHTML = (withSearch, plpTools) => `
  <div class="k-bar">Ven a conocernos. Encuentra tu showroom Inbasix más cercano <a href="index.html#showrooms">aquí</a>.</div>
  <header class="k-head">
    <div class="k-wrap">
      <div class="k-head__in">
        <a class="k-logo" href="index.html" aria-label="Inbasix Medical, inicio"><img src="${A}brand/logo-navy.png" alt="Inbasix Medical" width="140" height="42"></a>
        <nav class="k-nav" aria-label="Principal"><ul class="k-nav__list">
          <li class="k-nav__dd"><a class="k-nav__a" href="coleccion.html" aria-haspopup="true">Productos ${IC.chev}</a>
            <div class="k-dd k-dd--l" role="menu"><a href="coleccion.html" role="menuitem"><b>Todos los productos</b><small>${I.P.length} equipos y consumibles</small></a>${GROUPS.map(g => `<a href="${plp({ cat: g.k })}" role="menuitem">${g.t}<small>${I.P.filter(p => inGroup(p, g)).length} productos</small></a>`).join('')}</div></li>
          ${NAV.slice(1).map(([h, t]) => `<li><a class="k-nav__a" href="${h}">${t}</a></li>`).join('')}
          <li class="k-nav__dd"><a class="k-nav__a" href="index.html#faq" aria-haspopup="true">Ayuda ${IC.chev}</a>
            <div class="k-dd" role="menu">
              <a href="index.html#faq" role="menuitem">Preguntas frecuentes<small>Garantía, envíos, formas de pago</small></a>
              <a href="index.html#testimonios" role="menuitem">Testimonios<small>Médicos que ya equiparon su clínica</small></a>
              <a href="index.html#videos" role="menuitem">Videos de expertos<small>Demos de equipos en YouTube</small></a>
              <a href="${WA('Hola Inbasix, necesito asesoría para elegir un equipo.')}" target="_blank" rel="noopener" role="menuitem">Habla con un asesor<small>WhatsApp 55 22 33 22 33</small></a>
            </div></li>
        </ul></nav>
        <div class="k-head__tools">
          <a class="k-phone" href="tel:${I.TEL}">${IC.head}800 462 2749</a>
          <a class="k-pill" href="index.html#showrooms">${IC.pin}Showrooms</a>
          <button class="k-cartbtn" type="button" data-cart-open aria-label="Abrir carrito">${IC.cart}<span class="k-badge" data-count hidden>0</span><span class="k-cartbtn__l">Carrito</span></button>
          <button class="k-burger" type="button" aria-label="Abrir menú" data-menu-open>${IC.burger}</button>
        </div>
      </div>
      ${withSearch ? `<div class="k-search-row">${searchBox('k-searchbox', 'Busca por equipo, marca o categoría')}${plpTools ? `<button class="k-sqbtn" type="button" data-filters-open aria-label="Filtros">${IC.sliders}<span class="k-sqbtn__n" data-fbadge hidden></span></button><button class="k-sqbtn" type="button" data-sortm-open aria-label="Ordenar">${IC.sort}</button>` : ''}</div>` : ''}
    </div>
  </header>
  <div class="k-menu" data-menu aria-hidden="true">
    <div class="k-menu__scrim" data-menu-close></div>
    <div class="k-menu__panel" role="dialog" aria-label="Menú">
      <div class="k-menu__top"><img src="${A}brand/logo-navy.png" alt="Inbasix Medical"><button class="k-menu__x" type="button" data-menu-close aria-label="Cerrar menú">${IC.x}</button></div>
      <nav><details class="k-menu__grp"><summary>Productos${IC.chev}</summary><a href="coleccion.html" data-menu-close>Todos los productos${IC.right}</a>${GROUPS.map(g => `<a href="${plp({ cat: g.k })}" data-menu-close>${g.t}${IC.right}</a>`).join('')}</details>${NAV.slice(1).concat([['index.html#faq', 'Preguntas frecuentes'], ['index.html#testimonios', 'Testimonios'], ['index.html#videos', 'Videos']]).map(([h, t]) => `<a href="${h}" data-menu-close>${t}${IC.right}</a>`).join('')}</nav>
      <div class="k-menu__foot"><a class="k-btn" href="tel:${I.TEL}">${''}Llámanos 800 462 2749</a><a class="k-btn k-btn--ghost" href="${WA('Hola Inbasix, necesito asesoría.')}" target="_blank" rel="noopener">WhatsApp 55 22 33 22 33</a></div>
    </div>
  </div>`;
  function searchBox(cls, ph) {
    return `<div class="${cls}" data-search><label class="${cls}__f"><span class="sr">Buscar equipo</span>${IC.search}<input type="search" placeholder="${ph}" autocomplete="off" enterkeyhint="search"></label><div class="k-sugg" role="listbox" hidden></div></div>`;
  }
  const footHTML = () => `
  <footer class="k-foot">
    <div class="k-wrap">
      <div class="k-foot__top">
        <div class="k-foot__logo"><img src="${A}brand/logo-white.png" alt="Inbasix Medical" width="140" height="42"></div>
        <div class="k-foot__cols">
          <div><a href="coleccion.html">Productos</a>${GROUPS.slice(0, 4).map(g => `<a href="${plp({ cat: g.k })}">${g.t}</a>`).join('')}</div>
          <div><a href="index.html#financiamiento">Financiamiento</a><a href="index.html#como-comprar">Cómo comprar</a><a href="index.html#showrooms">Showrooms</a><a href="index.html#faq">Preguntas frecuentes</a><a href="index.html#testimonios">Testimonios</a><a href="https://www.youtube.com/@inbasixmedical" target="_blank" rel="noopener">Videos en YouTube</a><a href="${I.STORE}/pages/politicas-de-envio" target="_blank" rel="noopener">Envíos</a><a href="${I.STORE}/pages/politicas-de-devolucion" target="_blank" rel="noopener">Devoluciones</a></div>
          <div><a href="tel:${I.TEL}">${IC.phone}800 462 2749</a><a href="https://wa.me/${I.WA}" target="_blank" rel="noopener">${IC.chat}55 22 33 22 33</a><a href="mailto:contacto@importacionesinbasix.com">${IC.mail}contacto@importacionesinbasix.com</a><span>🇲🇽 México</span></div>
        </div>
      </div>
      <div class="k-social">
        <a href="https://www.facebook.com/INBASIXMEDICAL/" target="_blank" rel="noopener" aria-label="Facebook">${IC.fb}</a>
        <a href="https://www.instagram.com/inbasix_medical" target="_blank" rel="noopener" aria-label="Instagram">${IC.ig}</a>
        <a href="https://www.youtube.com/@inbasixmedical" target="_blank" rel="noopener" aria-label="YouTube">${IC.yt}</a>
        <a href="https://wa.me/${I.WA}" target="_blank" rel="noopener" aria-label="WhatsApp">${IC.wa}</a>
      </div>
      <div class="k-foot__badges">
        <span class="k-fbadge">${IC.shield}Distribuidor autorizado</span><span class="k-fbadge">${IC.truck}Envíos a todo México</span>
        <span class="k-fbadge">${IC.checkC}Garantía de fábrica 12 meses</span><span class="k-fbadge">${IC.cap}Capacitación incluida</span>
      </div>
      <div class="k-foot__legal"><span>© ${new Date().getFullYear()} Inbasix Medical. Todos los derechos reservados.</span>${POL.map(([h, t]) => `<a href="${I.STORE}/pages/${h}" target="_blank" rel="noopener">${t}</a>`).join('')}</div>
      <p class="k-foot__addr">IMPORTACIONES INBASIX S.A. de C.V. · Showroom Guadalajara: Av. de las Américas 1545, Providencia, 44630 Guadalajara, Jal.</p>
      <p class="k-foot__pro">INFORMACIÓN DIRIGIDA EXCLUSIVAMENTE AL PROFESIONAL DE LA SALUD</p>
    </div>
  </footer>
  <a class="k-wa" href="https://wa.me/${I.WA}" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">${IC.wa}</a>`;
  const cartHTML = () => `
  <div class="k-cart" data-cart aria-hidden="true">
    <div class="k-cart__scrim" data-cart-close></div>
    <aside class="k-cart__p" role="dialog" aria-modal="true" aria-labelledby="k-cart-h">
      <div class="k-cart__h"><h2 id="k-cart-h">Tu carrito <span data-cart-count>0</span></h2><button class="k-cart__x" type="button" data-cart-close aria-label="Cerrar carrito">${IC.x}</button></div>
      <div class="k-cart__ok" data-cart-ok hidden>${IC.checkC}Agregaste un equipo a tu carrito</div>
      <div class="k-cart__body"><div style="display:flex;flex-direction:column;gap:12px" data-cart-lines></div>
        <div class="k-cart__up" data-cart-upwrap hidden><h3>También te podría interesar</h3><div data-cart-up></div></div></div>
      <div class="k-cart__f" data-cart-foot hidden>
        <div class="k-cart__sub"><span>Subtotal</span><b data-cart-sub>$0.00</b></div>
        <p class="k-cart__note" data-cart-note></p>
        <button class="k-btn" type="button" data-checkout>Finalizar compra</button>
        <div class="k-cart__trust"><span>${IC.shield}Pago seguro</span><span>${IC.truck}Envíos a todo México</span><span>${IC.checkC}Garantía 12 meses</span></div>
      </div>
    </aside>
  </div>`;
  function mountShell(opts) {
    const h = $('[data-k-head]'); if (h) h.outerHTML = headHTML(opts && opts.search, opts && opts.plp);
    const f = $('[data-k-foot]'); if (f) f.outerHTML = footHTML() + cartHTML();
  }
  function closeMenu() { const m = $('[data-menu]'); if (m && m.classList.contains('is-open')) { m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('ib-lock'); } }
  document.addEventListener('click', e => {
    if (e.target.closest('[data-menu-open]')) { const m = $('[data-menu]'); m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('ib-lock'); return; }
    if (e.target.closest('[data-menu-close]')) closeMenu();
  });
  // "added" confirmation inside the drawer + aria state
  document.addEventListener('click', e => { if (e.target.closest('[data-add]')) { const ok = $('[data-cart-ok]'); if (ok) { ok.hidden = false; clearTimeout(ok._t); ok._t = setTimeout(() => ok.hidden = true, 3500); } } }, true);
  new MutationObserver(() => { const c = $('[data-cart]'); if (c) c.setAttribute('aria-hidden', !c.classList.contains('is-open')); }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  /* ---------- search (client-side over IBK.P) ---------- */
  function searchProducts(q, n) {
    const t = norm(q).trim(); if (!t) return [];
    const words = t.split(/\s+/);
    return I.P.map(p => { const hay = norm(p.t + ' ' + p.vendor + ' ' + vendorName(p.vendor) + ' ' + p.type + ' ' + p.cols.map(catName).join(' '));
      const ok = words.every(w => hay.includes(w)); if (!ok) return null;
      let s = 0; if (norm(p.t).includes(t)) s += 5; if (norm(vendorName(p.vendor)).startsWith(words[0])) s += 3; if (p.img.length) s += 1; if (!I.isQuote(p)) s += .5; return [s, p]; })
      .filter(Boolean).sort((a, b) => b[0] - a[0]).slice(0, n || 999).map(x => x[1]);
  }
  function wireSearch(root) {
    $$('[data-search]', root).forEach(box => {
      const inp = $('input', box), sug = $('.k-sugg', box); let idx = -1;
      const go = q => { location.href = plp({ q }); };
      const render = () => {
        const q = inp.value.trim(); box.classList.toggle('has-text', !!q);
        if (!q) { sug.hidden = true; return; }
        const r = searchProducts(q, 6); idx = -1;
        sug.innerHTML = (r.length ? r.map(p => `<a href="${pdp(p.h)}" role="option"><img src="${pimg(p, 100)}" alt="">${'<span>' + esc(I.shortName(p)) + `<small>${esc(vendorName(p.vendor))} • ${esc(I.priceLabel(p))}</small></span>`}</a>`).join('') : '<p class="k-sugg__none">Sin resultados. Prueba con una marca o categoría.</p>')
          + `<a class="k-sugg__all" href="${plp({ q })}">Ver todos los resultados</a>`;
        sug.hidden = false;
      };
      inp.addEventListener('input', render);
      inp.addEventListener('focus', render);
      inp.addEventListener('keydown', e => {
        const items = $$('a', sug);
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); idx = (idx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach((a, i) => a.classList.toggle('is-on', i === idx)); }
        else if (e.key === 'Enter') { e.preventDefault(); if (idx >= 0 && items[idx]) location.href = items[idx].href; else if (inp.value.trim()) { if (box.dataset.local) box.dispatchEvent(new CustomEvent('k:search', { detail: inp.value.trim() })); else go(inp.value.trim()); sug.hidden = true; } }
        else if (e.key === 'Escape') sug.hidden = true;
      });
      document.addEventListener('click', e => { if (!box.contains(e.target)) sug.hidden = true; });
    });
  }

  /* ---------- reused sections ---------- */
  const brandsHTML = (active) => `<div class="k-brands">${BRANDS.map(b => { const n = I.P.filter(p => b.v.includes(p.vendor)).length;
    return `<a class="k-sq${active === b.slug ? ' is-on' : ''}" href="${plp({ brand: b.slug })}" data-brand="${b.slug}" aria-label="${b.name}: ${n} equipos">${b.crop ? `<span class="k-sq__crop"><img src="${A}brand/${b.logo}" alt="${b.name}" loading="lazy"></span>` : `<img src="${A}brand/${b.logo}" alt="${b.name}" loading="lazy">`}<small>${n} equipo${n === 1 ? '' : 's'}</small></a>`; }).join('')}</div>`;
  // Reviews: shared placeholder render (assets/people/reviews.js); photos + platforms are swapped for real ones before launch.
  const RV = () => window.IB_REVIEWS || TESTI.map(t => ({ slug: '', name: t.n, role: t.r, quote: t.q, platform: 'google', stars: 5 }));
  const PLAT = {
    google: { n: 'Google', ic: A + 'brand/reviews/google-g.svg', word: A + 'brand/reviews/google-wordmark.svg', stars: A + 'brand/reviews/stars-google.svg' },
    facebook: { n: 'Facebook', ic: A + 'brand/reviews/facebook.svg', word: null, stars: A + 'brand/reviews/stars-google.svg' },
    trustpilot: { n: 'Trustpilot', ic: A + 'brand/reviews/trustpilot-star.svg', word: A + 'brand/reviews/trustpilot.svg', stars: A + 'brand/reviews/stars-trustpilot.svg' }
  };
  const tcard = t => { const pl = PLAT[t.platform] || PLAT.google;
    return `<div class="k-tcard" data-placeholder="true"><div><div class="k-tcard__h">${t.slug ? `<img class="k-tcard__ph" src="${A}people/${t.slug}-sq.webp" alt="${esc(t.name)}" loading="lazy" width="48" height="48">` : ''}<div><b>${esc(t.name)}</b><small>${esc(t.role)}</small></div><img class="k-tcard__pl" src="${pl.ic}" alt="Reseña en ${pl.n}" width="22" height="22" loading="lazy"></div>
      <img class="k-tcard__st" src="${pl.stars}" alt="${t.stars || 5} de 5 estrellas" width="84" height="16" loading="lazy"><p>${esc(t.quote)}</p></div></div>`; };
  const testiHTML = () => { const all = RV(); const med = all.filter(r => r.group !== 'negocios'), neg = all.filter(r => r.group === 'negocios');
    const mix = (a, b) => { const o = []; for (let i = 0; i < Math.max(a.length, b.length); i++) { if (a[i]) o.push(a[i]); if (b[i]) o.push(b[i]); } return o; };
    const r1 = mix(med.filter((_, i) => i % 2 === 0), neg.filter((_, i) => i % 2 === 0)), r2 = mix(med.filter((_, i) => i % 2 === 1), neg.filter((_, i) => i % 2 === 1));
    const row = arr => `<div class="k-mq__t">${[...arr, ...arr, ...arr, ...arr].map(tcard).join('')}</div>`;
    const sum = `<div class="k-rsum" aria-label="Reseñas en plataformas">${['google', 'facebook', 'trustpilot'].map(k => { const pl = PLAT[k]; return `<div class="k-rsum__i">${pl.word ? `<img class="k-rsum__w k-rsum__w--${k}" src="${pl.word}" alt="${pl.n}" loading="lazy">` : `<span class="k-rsum__fb"><img src="${pl.ic}" alt="" loading="lazy">${pl.n}</span>`}<img src="${pl.stars}" alt="5 de 5 estrellas" width="84" height="16" loading="lazy"></div>`; }).join('')}</div>`;
    return sum + `<div class="k-tst"><div class="k-mq">${row(r1)}</div><div class="k-mq k-mq--rev">${row(r2.length ? r2 : r1)}</div></div>`; };
  const sim = () => `
    <div class="k-sim" data-sim>
      <div class="k-seg" role="tablist" aria-label="Esquema de financiamiento"><button type="button" class="is-on" data-s="arr" role="tab" aria-selected="true">Arrendamiento puro</button><button type="button" data-s="cre" role="tab" aria-selected="false">Crédito simple</button></div>
      <div data-sp="arr"><p class="k-sim__lab">Tu renta mensual <span class="k-tag">Más popular</span></p><div class="k-sim__big">100%<small>deducible</small></div>
        <div class="k-field"><span>Renovación de equipo</span>Cada 3 a 5 años</div><div class="k-field"><span>Al final del plazo</span>Opción de compra</div>
        <p class="k-sim__note">Sin afectar tus líneas de crédito</p></div>
      <div data-sp="cre" hidden><p class="k-sim__lab">Plazo elegido</p><div class="k-sim__big"><span data-plazo>36</span><small>meses</small></div>
        <div class="k-field"><span>Tasa</span>Desde 12% anual</div><div class="k-field"><span>Propiedad del equipo</span>Inmediata, con depreciación fiscal acelerada</div>
        <div class="k-range"><label class="sr" for="k-plazo">Plazo en meses</label><input id="k-plazo" type="range" min="12" max="60" step="12" value="36" style="--p:50%"><div class="k-range__l"><span>12 meses</span><span>60 meses</span></div></div></div>
    </div>`;
  function wireSim(root) {
    $$('[data-sim]', root).forEach(s => {
      $$('[data-s]', s).forEach(b => b.onclick = () => { $$('[data-s]', s).forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', x === b); }); $$('[data-sp]', s).forEach(p => p.hidden = p.dataset.sp !== b.dataset.s); s.dispatchEvent(new CustomEvent('k:sim', { bubbles: true, detail: b.dataset.s })); });
      const r = $('input[type=range]', s); if (r) r.oninput = () => { $('[data-plazo]', s).textContent = r.value; r.style.setProperty('--p', ((r.value - 12) / 48 * 100) + '%'); s.dispatchEvent(new CustomEvent('k:sim', { bubbles: true, detail: 'cre' })); };
    });
  }
  const simWA = s => { const cre = $('[data-s="cre"].is-on', s); return cre ? WA(`Hola Inbasix, quiero información de crédito simple a ${$('[data-plazo]', s).textContent} meses.`) : WA('Hola Inbasix, quiero información de arrendamiento puro para mi equipo.'); };

  /* ---------- in-view videos (core watch handles play/pause) ---------- */
  function heroVideo(el) {
    if (!el || RM) return;
    const mob = matchMedia('(max-width: 767px)').matches;
    const n = el.dataset.hero + (mob ? '-m' : '');
    const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.loop = true; v.autoplay = true; v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.preload = 'auto';
    v.src = vids(n).mp4; v.addEventListener('playing', () => v.classList.add('is-ready'), { once: true });
    el.appendChild(v); v.play().catch(() => {});
  }

  window.K = { IC, BRANDS, CATS, TESTI, YT, FAQ, SHOWS, POL, WA, esc, $, $$, pdp, norm, mcard, pcard, arrows, carousel, acc, openYT, mountShell, wireSearch, searchProducts,
    brandsHTML, testiHTML, cardName, GROUPS, groupOf, inGroup, plp, PROD, PH, cut, studio, sim, wireSim, simWA, vendorSlug, vendorName, catName, typeLabel, nOpts, pimg, priceHTML, priceParts, ytOwner, ytThumb, loopVideo, loopFor, vids, heroVideo, RM, A };
})();
