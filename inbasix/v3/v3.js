/* Inbasix v3 — shared chrome (promo, header + mega menu, mobile menu, cart drawer, footer) + helpers.
   Requires ../assets/data.js + ../assets/core.js (window.IBK). */
(function () {
  const K = window.IBK, B = K.BASE;
  document.documentElement.classList.remove('no-js');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Videos available in assets/vid (checked at build time; others fall back to the photo/poster). */
  const VIDS = window.V3_VIDS || [];
  const hasVid = n => VIDS.includes(n);

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const catUrl = h => `coleccion.html?cat=${encodeURIComponent(h)}`;
  /* category groups → real Shopify collections (one map for menu, home, listing page) */
  const GROUPS = [
    { k: 'ultrasonido', t: 'Ultrasonido', img: 'scenes/ultrasonido-16x9.webp', d: 'Ultrasonido Mindray y Samsung, portátil y de gabinete, con capacitación botón por botón incluida',
      cols: ['sistemas-de-diagnostico-por-ultrasonido', 'equipo-de-ultrasonido-mindray', 'equipo-de-ultrasonido-samsung', 'radiologia-portatil-humano', 'ultrasonidos-portatiles-para-ginecologia-de-uso-humano-mindray', 'ginecologia-mindray', 'imagenes-generales-mindray', 'ultrasonidos-de-gabinete-uso-humano', 'samsung-gabinete-ginecologia', 'ginecologia-portatil-samsung', 'estetica-portatil-humano'],
      ex: p => p.type === 'Aparatología Estética' || p.type === 'Transductores' || p.cols.includes('accesorios') || p.cols.includes('transductores-de-uso-humano') || ['Nubway', 'GiLáser', 'LipoSAVER'].includes(p.vendor) },
    { k: 'aparatologia', t: 'Aparatología estética', img: 'scenes/aparatologia-16x9.webp', d: 'Láser, HIFU, criolipólisis, radiofrecuencia y más de Nubway y GiLáser para clínicas y spas',
      cols: ['aparatologia-estetica', 'nubway', 'gilaser', 'serie-antienvejecimiento', 'serie-cuidado-de-la-piel', 'serie-para-adelgazar-y-dar-forma', 'serie-para-depilacion', 'serie-removedor-de-tatuajes-y-pigmentacion', 'serie-terapia-en-frio', 'serie-tratamiento-de-venas', 'rehabilitacion'],
      ex: p => p.type === 'Ultrasonido' || p.type === 'Transductores' },
    { k: 'imagenologia', t: 'Imagenología', img: 'scenes/imagenologia-16x9.webp', d: 'Tomógrafos, resonancia magnética, medicina nuclear, PET, arco en C, rayos X y mastógrafos de GE, Siemens, Philips, Hologic y Toshiba',
      cols: ['tomografos', 'tomografia-pet-pet-ct', 'resonancia-magnetica', 'medicina-nuclear', 'arco-en-c', 'rayos-x-y-digitalizadores', 'mastografos'] },
    { k: 'fillers', t: 'Fillers', img: 'scenes/fillers-16x9.webp', d: 'Ácido hialurónico, bioestimuladores y skin boosters Rejubeau y YouthFill', cols: ['fillers', 'rejubeau', 'youthfill'] },
    { k: 'veterinario', t: 'Veterinario', img: 'scenes/veterinario-16x9.webp', d: 'Ultrasonido y equipo veterinario Mindray', cols: ['ultrasonido-veterinario', 'equipo-veterinario'] },
    { k: 'quirofano', t: 'Quirófano y monitoreo', img: 'tiles/equipo-medico-1x1.webp', d: 'Máquinas de anestesia, mesas de cirugía, lámparas, monitores, desfibriladores y electrocardiógrafos', cols: ['quirofano', 'desfibriladores-mindray', 'electrocardiografos-uso-humano'] },
    { k: 'transductores', t: 'Transductores y accesorios', img: 'scenes/ultrasonido-16x9.webp', d: 'Transductores y accesorios originales Mindray para tu ultrasonido', cols: ['transductores-de-uso-humano', 'accesorios'] },
  ];
  const COLT = { 'sistemas-de-diagnostico-por-ultrasonido': 'Todos los ultrasonidos', 'equipo-de-ultrasonido-mindray': 'Ultrasonido Mindray', 'equipo-de-ultrasonido-samsung': 'Ultrasonido Samsung', 'radiologia-portatil-humano': 'Portátiles para radiología', 'ultrasonidos-portatiles-para-ginecologia-de-uso-humano-mindray': 'Portátiles para ginecología', 'ginecologia-mindray': 'Ginecología de gabinete Mindray', 'imagenes-generales-mindray': 'Imágenes generales Mindray', 'ultrasonidos-de-gabinete-uso-humano': 'Ultrasonido de gabinete', 'samsung-gabinete-ginecologia': 'Ginecología de gabinete Samsung', 'ginecologia-portatil-samsung': 'Ginecología portátil Samsung', 'aparatologia-estetica': 'Toda la aparatología', 'serie-antienvejecimiento': 'Antienvejecimiento', 'serie-cuidado-de-la-piel': 'Cuidado de la piel', 'serie-para-adelgazar-y-dar-forma': 'Moldeado corporal', 'serie-para-depilacion': 'Depilación', 'serie-removedor-de-tatuajes-y-pigmentacion': 'Tatuajes y pigmentación', 'serie-terapia-en-frio': 'Terapia en frío', 'serie-tratamiento-de-venas': 'Tratamiento de venas', 'estetica-portatil-humano': 'Estética portátil', 'rehabilitacion': 'Rehabilitación', 'tomografia-pet-pet-ct': 'PET y PET-CT', 'resonancia-magnetica': 'Resonancia magnética', 'rayos-x-y-digitalizadores': 'Rayos X y digitalizadores', 'fillers': 'Todos los fillers', 'youthfill': 'YouthFill', 'ultrasonido-veterinario': 'Ultrasonido veterinario', 'equipo-veterinario': 'Equipo veterinario', 'desfibriladores-mindray': 'Desfibriladores', 'electrocardiografos-uso-humano': 'Electrocardiógrafos', 'transductores-de-uso-humano': 'Transductores', 'accesorios': 'Accesorios Mindray' };
  const colTitle = h => { if (COLT[h]) return COLT[h]; const c = K.COLS.find(x => x.h === h); const t = c ? c.t : h; return /^[^a-záéíóúñ]+$/.test(t) ? t.charAt(0) + t.slice(1).toLowerCase() : t; };
  const groupOf = k => GROUPS.find(g => g.k === k);
  const inGroup = (p, k) => { const g = groupOf(k); return !!g && p.cols.some(c => g.cols.includes(c)) && !(g.ex && g.ex(p)); };
  /* collection filter honours the owning group's exclusions (e.g. Nubway cavitación tagged into a diagnostic ultrasound collection) */
  const inCol = (p, c) => p.cols.includes(c) && !GROUPS.some(g => g.cols.includes(c) && g.ex && g.ex(p) && !GROUPS.some(o => o !== g && o.cols.includes(c)));
  const WA = (t) => `https://wa.me/${K.WA}?text=${encodeURIComponent(t || 'Hola Inbasix, quiero asesoría para elegir un equipo')}`;
  const STORE = K.STORE;
  const col = h => (K.COLS.find(c => c.h === h) || {});
  const inC = (hs, n) => { hs = [].concat(hs); const seen = new Set(); return K.P.filter(p => p.img.length && p.cols.some(c => hs.includes(c)) && !seen.has(p.h) && seen.add(p.h)).slice(0, n || 999); };
  const byPrice = a => a.slice().sort((x, y) => (K.isQuote(x) - K.isQuote(y)) || (y.img.length > 1) - (x.img.length > 1));
  const defVar = p => { const pr = p.v.filter(v => v.p && v.a); if (pr.length) return pr.reduce((m, v) => v.p < m.p ? v : m, pr[0]); return p.v.find(v => v.a) || p.v[0]; };
  const typeLabel = p => ({ 'Ultrasonido': 'Ultrasonido', 'Fillers': 'Filler', 'Equipo médico': 'Equipo médico', 'Aparatología Estética': 'Aparatología', 'Transductores': 'Transductor', 'Ultrasonido veterinario': 'Veterinario' }[p.type] || p.type);
  const vendorName = v => ({ 'GE General Electric': 'GE HealthCare', SIEMENS: 'Siemens', SAMSUNG: 'Samsung', REJUBEAU: 'Rejubeau', YOUTHFILL: 'YouthFill', HOLOGIC: 'Hologic', DRGEM: 'DRGEM', DRTECH: 'DRTECH', SYNICS: 'Synics' }[v] || v);
  const LOGOS = { Mindray: 'mindray.png', SAMSUNG: 'samsung-medison.svg', Nubway: 'nubway.png', 'GiLáser': 'gilaser.png', REJUBEAU: 'rejubeau.png', 'GE General Electric': 'ge.svg', SIEMENS: 'siemens-healthineers.svg', Philips: 'philips.svg', HOLOGIC: 'hologic.svg', Toshiba: 'toshiba.svg' };
  const logoOf = v => LOGOS[v] ? B + 'assets/brand/color/' + LOGOS[v] : null;
  /* full-color logo bar item (Mindray PNG carries a tagline: crop it) */
  const logoItem = (v, href, hidden) => { const s = logoOf(v); const name = vendorName(v); const img = `<img src="${s}" alt="${esc(name)}" loading="lazy">`; return `<a href="${href}"${hidden ? ' aria-hidden="true" tabindex="-1"' : ''} class="${v === 'GE General Electric' ? 'lg-ge' : ''}">${img}</a>`; };
  // Clean display name: drop the store's category tail ("GINECOLOGÍA GABINETE HUMANO"), " - Vendor" suffix, and ALLCAPS shouting.
  const TAIL = new Set(['GINECOLOGÍA', 'GINECOLOGIA', 'GABINETE', 'HUMANO', 'RADIOLOGÍA', 'RADIOLOGIA', 'PORTÁTIL', 'PORTATIL', 'ESTÉTICA', 'ESTETICA', 'IMÁGENES', 'IMAGENES', 'GENERALES', 'VETERINARIO', 'CARDIOLOGÍA', 'USO', 'DE', 'Y', '-', 'GIN', 'IMG', 'EST', 'SAMSUNG']);
  const tc = w => w.length > 3 && /^[A-ZÁÉÍÓÚÑÜ]+$/.test(w) && !/^(HIFU|LED|IPL|CO2|HD|ND|YAG|PET|CT|PRP|RF|EMS|EM|GE)$/.test(w) ? w.charAt(0) + w.slice(1).toLowerCase() : w;
  const nm = p => { let t = K.shortName(p).replace(/\s+-\s+(Nubway|GiLáser|Gilaser|Rejubeau|YouthFill|Youthfill)\s*$/i, '').replace(/\s+Nubway$/i, '');
    let w = t.split(/\s+/); while (w.length > 2 && TAIL.has(w[w.length - 1].replace(/[-–]$/, ''))) w.pop(); t = w.join(' ').replace(/[\s"“-]+$/, m => m.includes('"') ? '"' : '');
    const letters = t.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, ''); if (letters && letters === letters.toUpperCase()) t = t.split(' ').map(tc).join(' ');
    return t.replace(/\bFULL HD\b/g, 'Full HD'); };
  const sentence = s => s.replace(/\b([A-ZÁÉÍÓÚÑ]{3,}(?:\s+[A-ZÁÉÍÓÚÑ]{1,}){1,})\b/g, m => { const l = m.toLowerCase(); return l; }).replace(/^\s*([a-záéíóúñ])/, (m, c) => c.toUpperCase());
  // Short description for cards: first clean sentence of the store excerpt (no invented copy).
  const blurb = (p, n) => { let t = (p.ex || '').replace(/\s+/g, ' ').trim(); for (const name of [K.shortName(p), nm(p), nm(p).replace(/^Ultrasonido\s+/i, '')]) if (t.toLowerCase().startsWith(name.toLowerCase())) { t = t.slice(name.length).trim(); break; } t = sentence(t).replace(/^Detalles del equipo\s+/i, '').replace(/^Refurbished\s+/i, 'Reacondicionado. ').replace(/^[-–:·\s]+/, ''); if (t.length < 14) t = ''; if (t && (p.ex || '').length >= 200 && !/[.!?]$/.test(t)) t = t.slice(0, t.lastIndexOf(' ')) + '…'; if (!t) t = `${vendorName(p.vendor)} · ${typeLabel(p)}`; n = n || 110; return t.length > n ? t.slice(0, t.lastIndexOf(' ', n)) + '…' : t; };

  const I = {
    arrow: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10h13m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrowS: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10h13m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevR: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevL: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m10 3-5 5 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevD: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 6 5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.5"/><path d="m15.5 15.5 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M4 21c1.2-4 4.4-6 8-6s6.8 2 8 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.5"/></svg>',
    burger: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    close: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.6 3.5 9 3l2 4.5-2 1.5a11 11 0 0 0 6 6l1.5-2L21 15l-.5 2.4A2.4 2.4 0 0 1 18 19.5 15.5 15.5 0 0 1 4.5 6 2.4 2.4 0 0 1 6.6 3.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="9.5" r="2.5" stroke="currentColor" stroke-width="1.5"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 8.5 3 3 7-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    x: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 4 8 8m0-8-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    truck: '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M4 11h20v15H4zM24 16h7l5 5v5H24z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="11" cy="28" r="3" fill="#fff" stroke="currentColor" stroke-width="1.6"/><circle cx="30" cy="28" r="3" fill="#fff" stroke="currentColor" stroke-width="1.6"/></svg>',
    shield: '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 5 7 10v9c0 8 5.6 13.6 13 16 7.4-2.4 13-8 13-16v-9L20 5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m14 20 4 4 8-8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cap: '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M3 15 20 8l17 7-17 7L3 15Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M10 19v8c3 3 7 4 10 4s7-1 10-4v-8M35 16v9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    card: '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect x="5" y="10" width="30" height="21" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M5 16h30M10 25h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M28 4v5m-3-2.5h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    tool: '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M25 6a8 8 0 0 0-7.6 10.4L6 27.8 12.2 34l11.4-11.4A8 8 0 0 0 34 15l-5 5-5.5-1.5L22 13l5-5-2-2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    chat: '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M7 9h26v17H17l-7 6v-6H7z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M13 16h14M13 21h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    factory: '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M5 34V18l9 5v-5l9 5v-5l9 5V6h3v28z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    store: '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M6 15 9 6h22l3 9M6 15h28v4a4 4 0 0 1-7 2.6 4 4 0 0 1-7 0 4 4 0 0 1-7 0A4 4 0 0 1 6 19v-4ZM8 22v12h24V22M17 34v-7h6v7" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    bolt: '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M9 1 3 9h4l-1 6 6-8H8l1-6Z"/></svg>',
    flask: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M7.5 15h9" stroke="currentColor" stroke-width="1.5"/></svg>',
    play: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    playS: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg>',
    mute: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m16 9 5 6m0-6-5 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    fb: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.6V4.4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.4-4 4.1v2.4H7.7V14h2.6v8h3.2Z"/></svg>',
    ig: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor"/></svg>',
    yt: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>',
  };

  /* media block: muted in-view loop with poster; falls back to a still photo when the clip isn't available */
  function media(name, still, opts) {
    opts = opts || {};
    if (name && hasVid(name) && !RM) {
      const mob = opts.mobile && hasVid(opts.mobile);
      return `<video muted playsinline loop preload="metadata" ${opts.autoplay ? 'autoplay' : 'data-inview'} poster="${B}assets/vid/${name}.jpg"${mob ? ` data-src-m="${B}assets/vid/${opts.mobile}.mp4" data-src-d="${B}assets/vid/${name}.mp4"` : ''} src="${B}assets/vid/${mob && innerWidth < 750 ? opts.mobile : name}.mp4"></video>`;
    }
    if (name && hasVid(name)) return `<img src="${B}assets/vid/${name}.jpg" alt="${esc(opts.alt || '')}" loading="lazy">`;
    return `<img src="${still}" alt="${esc(opts.alt || '')}" loading="${opts.eager ? 'eager' : 'lazy'}">`;
  }

  function tile(p, o) {
    o = o || {};
    const v = defVar(p), q = K.isQuote(p);
    const alt = p.img[1] ? `<img class="alt" src="${K.img(p.img[1], 600)}" alt="" loading="lazy">` : '';
    const studio = (window.V3_PROD || []).includes(p.h);
    const main = studio ? `<img class="main studio${alt ? ' has-alt' : ''}" src="${B}assets/photo/prod/${p.h}.webp" alt="${esc(nm(p))}" loading="lazy">` : p.img[0] ? `<img class="main${alt ? ' has-alt' : ''}" src="${K.img(p.img[0], 600)}" alt="${esc(nm(p))}" loading="lazy">` : `<span class="ph"><img src="${B}assets/brand/logo-navy.png" alt=""></span>`;
    return `<div class="tile">
      <a class="tile__media" href="${K.pdp(p.h)}" tabindex="-1" aria-hidden="true">${main}${alt}
        <span class="tile__badge">${esc(vendorName(p.vendor))}</span>
        <span class="tile__pill">${esc(typeLabel(p))}</span></a>
      <div class="tile__info">
        <a class="tile__t" href="${K.pdp(p.h)}">${esc(nm(p))}</a>
        ${o.noDesc ? '' : `<p class="tile__d">${esc(blurb(p))}</p>`}
        <div class="tile__row"><span class="tile__p${q ? ' q' : ''}">${K.priceLabel(p)}</span>
        <button type="button" class="btn btn--sm ${q ? 'btn--ghost' : 'btn--navy'}" data-add="${p.h}" data-vid="${v.id}" aria-label="${q ? 'Cotizar' : 'Agregar'} ${esc(nm(p))}">${q ? 'Cotizar' : 'Agregar'}</button></div>
      </div></div>`;
  }

  /* ---------- menu model ---------- */
  const MENU = [
    { t: 'Productos', h: 'all', products: true },
    { t: 'Ultrasonido', h: 'ultrasonido', groups: [
      { t: 'Mindray', h: 'equipo-de-ultrasonido-mindray', subs: [['Portátiles', ['radiologia-portatil-humano', 'ultrasonidos-portatiles-para-ginecologia-de-uso-humano-mindray']], ['Gabinete', ['ginecologia-mindray', 'imagenes-generales-mindray', 'ultrasonidos-de-gabinete-uso-humano']]] },
      { t: 'Samsung', h: 'equipo-de-ultrasonido-samsung', subs: [['Ginecología', ['samsung-gabinete-ginecologia', 'ginecologia-portatil-samsung']]] },
      { t: 'Transductores y accesorios', h: 'transductores-de-uso-humano', subs: [['Transductores', ['transductores-de-uso-humano']], ['Accesorios Mindray', ['accesorios']]] },
      { t: 'Veterinario', h: 'ultrasonido-veterinario', subs: [['Ultrasonido veterinario', ['ultrasonido-veterinario']], ['Equipo veterinario', ['equipo-veterinario']]] },
    ] },
    { t: 'Aparatología estética', h: 'aparatologia', groups: [
      { t: 'Antienvejecimiento', h: 'serie-antienvejecimiento', subs: [['HIFU, CO2 y más', ['serie-antienvejecimiento']]] },
      { t: 'Moldeado corporal', h: 'serie-para-adelgazar-y-dar-forma', subs: [['Adelgazar y dar forma', ['serie-para-adelgazar-y-dar-forma']], ['Terapia en frío', ['serie-terapia-en-frio']]] },
      { t: 'Cuidado de la piel', h: 'serie-cuidado-de-la-piel', subs: [['Faciales', ['serie-cuidado-de-la-piel']], ['Venas', ['serie-tratamiento-de-venas']]] },
      { t: 'Láser', h: 'gilaser', subs: [['Depilación', ['serie-para-depilacion']], ['Tatuajes y pigmentación', ['serie-removedor-de-tatuajes-y-pigmentacion']], ['GiLáser', ['gilaser']]] },
    ] },
    { t: 'Imagenología', h: 'imagenologia', groups: [
      { t: 'Tomografía', h: 'tomografos', subs: [['Tomógrafos', ['tomografos']], ['PET y PET-CT', ['tomografia-pet-pet-ct']]] },
      { t: 'Resonancia y nuclear', h: 'resonancia-magnetica', subs: [['Resonancia magnética', ['resonancia-magnetica']], ['Medicina nuclear', ['medicina-nuclear']]] },
      { t: 'Rayos X', h: 'rayos-x-y-digitalizadores', subs: [['Arco en C', ['arco-en-c']], ['Rayos X y digitalizadores', ['rayos-x-y-digitalizadores']], ['Mastógrafos', ['mastografos']]] },
      { t: 'Hospital', h: 'quirofano', subs: [['Quirófano', ['quirofano']], ['Desfibriladores', ['desfibriladores-mindray']], ['Electrocardiógrafos', ['electrocardiografos-uso-humano']]] },
    ] },
    { t: 'Fillers', h: 'fillers', groups: [
      { t: 'Rejubeau', h: 'rejubeau', subs: [['Bioestimuladores y skinboosters', ['rejubeau']]] },
      { t: 'YouthFill', h: 'youthfill', subs: [['Ácido hialurónico', ['youthfill']]] },
      { t: 'Todos los fillers', h: 'fillers', subs: [['Catálogo completo', ['fillers']]] },
    ] },
    { t: 'Veterinario', href: catUrl('veterinario') },
    { t: 'Financiamiento', href: 'index.html#financiamiento' },
    { t: 'Showrooms', href: 'index.html#showrooms' },
  ];
  const linkList = (hs, n) => inC(hs, n).map(p => `<li><a href="${K.pdp(p.h)}">${esc(nm(p).replace(/^Ultrasonido\s+(?=Mindray|Samsung|Portátil)/i, ''))}</a></li>`).join('');

  function megaHTML(m) {
    const groups = m.groups.map(g => `<div class="mega__g"><h3><a href="${catUrl(g.h)}">${esc(g.t)}</a></h3>${g.subs.map(([t, hs]) => { const l = linkList(hs, 4); return l ? `<h4>${esc(t)}</h4><ul>${l}</ul>` : ''; }).join('')}</div>`).join('');
    return `<div class="mega" role="region" aria-label="${esc(m.t)}"><div class="mega__in"><div class="mega__groups">${groups}</div>
      <div class="mega__rail"><ul><li><a href="${catUrl(m.h)}">Ver todo ${esc(m.t.toLowerCase())}</a></li><li><a href="index.html#financiamiento">Financiamiento</a></li><li><a href="index.html#showrooms">Showrooms</a></li><li><a href="index.html#cotizacion">Cotización en 24 horas</a></li><li><a href="${STORE}/pages/faq" target="_blank" rel="noopener">Preguntas frecuentes</a></li></ul>
      <div class="sup"><a href="tel:${K.TEL}">${I.phone}800 462 2749</a><a href="${WA()}" target="_blank" rel="noopener">${I.wa}WhatsApp</a><a href="index.html#showrooms">${I.pin}Showrooms</a></div></div></div></div>`;
  }

  function productsMega() {
    const g = GROUPS.map(gr => { const subs = gr.cols.filter(c => K.P.some(p => p.cols.includes(c))).slice(0, 6);
      const title = colTitle;
      return `<div class="mega__g"><h3><a href="${catUrl(gr.k)}">${esc(gr.t)}</a></h3><ul>${subs.map(c => `<li><a href="${catUrl(c)}">${esc(title(c))}</a></li>`).join('')}</ul></div>`; }).join('');
    return `<div class="mega" role="region" aria-label="Productos"><div class="mega__in"><div class="mega__groups">${g}</div>
      <div class="mega__rail"><ul><li><a href="coleccion.html"><b>Ver todos los productos</b></a></li><li><a href="coleccion.html?price=linea">Con precio en línea</a></li><li><a href="coleccion.html?price=cotizacion">Precio bajo cotización</a></li><li><a href="index.html#financiamiento">Financiamiento</a></li><li><a href="index.html#showrooms">Showrooms</a></li></ul>
      <div class="sup"><a href="tel:${K.TEL}">${I.phone}800 462 2749</a><a href="${WA()}" target="_blank" rel="noopener">${I.wa}WhatsApp</a></div></div></div></div>`;
  }
  function headerHTML() {
    const nav = MENU.map((m, i) => m.products
      ? `<li data-mega="${i}"><a href="coleccion.html" aria-haspopup="true" aria-expanded="false">${esc(m.t)}</a>${productsMega()}</li>`
      : m.groups
      ? `<li data-mega="${i}"><a href="${catUrl(m.h)}" aria-haspopup="true" aria-expanded="false">${esc(m.t)}</a>${megaHTML(m)}</li>`
      : `<li><a href="${m.href}">${esc(m.t)}</a></li>`).join('');
    return `<a class="skip" href="#main">Saltar al contenido</a>
    <div class="promo" role="region" aria-label="Avisos">
      <a class="promo__msg is-on" href="index.html#financiamiento">Financiamiento con aprobación en 24 horas ${I.arrowS}</a>
      <a class="promo__msg" href="${WA('Hola Inbasix, quiero una cotización formal')}" target="_blank" rel="noopener">Cotizaciones flash: tu propuesta formal en menos de 24 horas ${I.arrowS}</a>
      <a class="promo__msg" href="index.html#showrooms">Envíos a todo México · Showrooms en CDMX, Guadalajara, Monterrey y Chihuahua ${I.arrowS}</a>
    </div>
    <div class="hdr-wrap" data-hdr><header class="hdr"><div class="hdr__in">
      <a class="hdr__logo" href="index.html" aria-label="Inbasix Medical, inicio"><img src="${B}assets/brand/logo-navy.png" alt="Inbasix Medical" width="150" height="45"></a>
      <nav aria-label="Principal"><ul class="hdr__nav">${nav}</ul></nav>
      <div class="hdr__icons">
        <a class="hdr__tel" href="tel:${K.TEL}">800 462 2749</a><span class="hdr__sep"></span>
        <a class="hdr__ic" href="coleccion.html?buscar=1" aria-label="Buscar en el catálogo" data-search>${I.search}</a>
        <a class="hdr__ic hdr__ic--acc" href="${WA()}" target="_blank" rel="noopener" aria-label="Hablar con un asesor por WhatsApp">${I.user}</a>
        <a class="hdr__ic" href="#" data-cart-open aria-label="Carrito">${I.bag}<span data-count hidden>0</span></a>
        <button class="hdr__ic hdr__burger" type="button" data-mnav-open aria-label="Abrir menú">${I.burger}</button>
      </div></div></header></div>
    <div class="mega-scrim" data-mega-scrim></div>`;
  }

  function mnavHTML() {
    const items = MENU.map(m => m.products ? `<details><summary>${esc(m.t)}${I.chevR}</summary><ul><li><a href="coleccion.html"><b>Ver todos los productos</b></a></li>${GROUPS.map(g => `<li><a href="${catUrl(g.k)}">${esc(g.t)}</a></li>`).join('')}</ul></details>` : m.groups ? `<details><summary>${esc(m.t)}${I.chevR}</summary><ul>${m.groups.map(g => `<li><a href="${catUrl(g.h)}">${esc(g.t)}</a></li>`).join('')}<li><a href="${catUrl(m.h)}"><b>Ver todo</b></a></li></ul></details>` : `<a href="${m.href}">${esc(m.t)}${I.chevR}</a>`).join('');
    return `<div class="mnav" data-mnav aria-hidden="true"><div class="mnav__scrim" data-mnav-close></div><div class="mnav__panel" role="dialog" aria-label="Menú">
      <div class="mnav__top"><img src="${B}assets/brand/logo-navy.png" alt="Inbasix Medical"><button type="button" data-mnav-close aria-label="Cerrar menú">${I.close}</button></div>
      <nav class="mnav__list">${items}</nav>
      <div class="mnav__foot"><a href="tel:${K.TEL}">${I.phone.replace('<svg', '<svg width="22" height="22"')}800 462 2749</a><a href="${WA()}" target="_blank" rel="noopener">${I.wa.replace('<svg', '<svg width="22" height="22"')}WhatsApp 55 22 33 22 33</a><a href="index.html#showrooms">${I.pin.replace('<svg', '<svg width="22" height="22"')}Showrooms</a></div>
    </div></div>`;
  }

  function cartHTML() {
    return `<div class="cart" data-cart aria-hidden="true"><div class="cart__scrim" data-cart-close></div>
      <div class="cart__panel" role="dialog" aria-modal="true" aria-label="Tu carrito">
        <aside class="cart__up" data-cart-upwrap hidden><h2>Complementa tu equipo</h2><div data-cart-up></div></aside>
        <div class="cart__bag">
          <div class="cart__hd"><h2>Tu carrito <span data-cart-count>0</span></h2><button class="cart__x" type="button" data-cart-close aria-label="Cerrar carrito">${I.close}</button></div>
          <div class="cart__msg">${I.check}Envíos a todo México · Capacitación incluida</div>
          <div class="cart__lines" data-cart-lines></div>
          <div class="cart__ft" data-cart-foot hidden>
            <div class="cart__tot"><span>Subtotal</span><span data-cart-sub>$0.00</span></div>
            <p class="cart__note" data-cart-note></p>
            <button class="ib-btn" type="button" data-checkout>Finalizar compra</button>
            <div class="cart__pay"><span>Transferencia BBVA</span><span>Tarjeta</span><span>Arrendamiento</span><span>Crédito</span></div>
          </div>
        </div>
      </div></div>
      <div class="ytm" data-ytm role="dialog" aria-modal="true" aria-label="Video"><button class="ytm__x" type="button" data-ytm-close aria-label="Cerrar video">×</button><div class="ytm__box" data-ytm-box></div></div>`;
  }

  const POL = [['aviso-de-privacidad-de-inbasix-medical', 'Aviso de privacidad'], ['politicas-de-venta', 'Políticas de venta'], ['politicas-de-devolucion', 'Devoluciones'], ['politicas-de-envio', 'Envíos'], ['politicas-de-cancelacion', 'Cancelaciones'], ['politica-de-costos-extras', 'Costos extras']];
  function footerHTML() {
    const c = (t, links) => `<div class="ftr__col"><h3>${t}</h3><ul>${links.map(([h, l, ext]) => `<li><a href="${h}"${ext ? ' target="_blank" rel="noopener"' : ''}>${l}</a></li>`).join('')}</ul></div>`;
    return `<section class="news" aria-labelledby="news-h"><div class="pw news__in">
        <div><h2 class="h2" id="news-h">Recibe tu cotización en menos de 24 horas</h2><p class="t-m">Déjanos tu WhatsApp y un especialista te contacta. Soporte humano, no robots.</p>
        <form data-news><label class="vh" for="news-in">Tu WhatsApp</label><input id="news-in" type="tel" inputmode="tel" placeholder="Tu WhatsApp (10 dígitos)" autocomplete="tel" required><button class="btn btn--navy" type="submit">Quiero asesoría</button></form>
        <small>Se abre WhatsApp con tu mensaje listo para enviar a Inbasix Medical.</small></div>
        <div class="news__contact"><a href="tel:${K.TEL}"><span>Llámanos</span>800 462 2749</a><a href="${WA()}" target="_blank" rel="noopener"><span>WhatsApp</span>55 22 33 22 33</a><a href="mailto:contacto@importacionesinbasix.com"><span>Correo</span>contacto@importacionesinbasix.com</a></div>
      </div></section>
      <footer class="ftr"><div class="ftr__cols">
        ${c('Ultrasonido', [[catUrl('equipo-de-ultrasonido-mindray'), 'Mindray'], [catUrl('equipo-de-ultrasonido-samsung'), 'Samsung'], [catUrl('transductores-de-uso-humano'), 'Transductores'], [catUrl('accesorios'), 'Accesorios'], [catUrl('ultrasonido-veterinario'), 'Ultrasonido veterinario']])}
        ${c('Aparatología', [[catUrl('nubway'), 'Nubway'], [catUrl('gilaser'), 'GiLáser'], [catUrl('serie-antienvejecimiento'), 'Antienvejecimiento'], [catUrl('serie-para-adelgazar-y-dar-forma'), 'Moldeado corporal'], [catUrl('serie-para-depilacion'), 'Depilación']])}
        ${c('Imagenología', [[catUrl('tomografos'), 'Tomógrafos'], [catUrl('resonancia-magnetica'), 'Resonancia magnética'], [catUrl('medicina-nuclear'), 'Medicina nuclear'], [catUrl('arco-en-c'), 'Arco en C'], [catUrl('rayos-x-y-digitalizadores'), 'Rayos X'], [catUrl('mastografos'), 'Mastógrafos'], [catUrl('quirofano'), 'Quirófano']])}
        ${c('Fillers', [[catUrl('rejubeau'), 'Rejubeau'], [catUrl('youthfill'), 'YouthFill'], [catUrl('fillers'), 'Todos los fillers'], [catUrl('equipo-veterinario'), 'Equipo veterinario']])}
        ${c('Inbasix', [['index.html#financiamiento', 'Financiamiento'], ['index.html#showrooms', 'Showrooms'], ['index.html#cotizacion', 'Cotización en 24 horas'], ['index.html#aprende', 'Capacitación'], ['https://www.youtube.com/@inbasixmedical', 'Canal de YouTube', 1], [`${STORE}/pages/faq`, 'Preguntas frecuentes', 1]])}
        ${c('Contacto', [[`tel:${K.TEL}`, 'Tel. 800 462 2749'], [WA(), 'WhatsApp 55 22 33 22 33', 1], ['mailto:contacto@importacionesinbasix.com', 'Correo'], ['index.html#showrooms', 'Showroom Guadalajara']])}
      </div>
      <div class="ftr__bot"><div class="pw">
        <div class="ftr__soc"><a href="https://www.instagram.com/inbasix_medical" target="_blank" rel="noopener" aria-label="Instagram">${I.ig}</a><a href="https://www.facebook.com/INBASIXMEDICAL/" target="_blank" rel="noopener" aria-label="Facebook">${I.fb}</a><a href="https://www.youtube.com/@inbasixmedical" target="_blank" rel="noopener" aria-label="YouTube">${I.yt}</a></div>
        <nav class="ftr__legal" aria-label="Políticas">${POL.map(([h, l]) => `<a href="${STORE}/pages/${h}" target="_blank" rel="noopener">${l}</a>`).join('')}</nav>
        <span class="ftr__copy">© ${new Date().getFullYear()} Importaciones Inbasix S.A. de C.V.</span>
      </div><p class="ftr__warn">INFORMACIÓN DIRIGIDA EXCLUSIVAMENTE AL PROFESIONAL DE LA SALUD</p></div></footer>`;
  }

  /* ---------- behaviours ---------- */
  function initHeader() {
    const wrap = document.querySelector('[data-hdr]'); if (!wrap) return;
    let last = scrollY, ticking = false;
    addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => {
      const y = scrollY, h = wrap.offsetHeight + 39;
      if (y > h && y > last + 2 && !document.querySelector('.hdr__nav > li.is-open')) wrap.classList.add('is-hidden');
      else if (y < last - 2 || y <= h) wrap.classList.remove('is-hidden');
      last = y; ticking = false; }); }, { passive: true });
    // promo rotator
    const msgs = [...document.querySelectorAll('.promo__msg')]; let mi = 0;
    if (msgs.length > 1 && !RM) setInterval(() => { msgs[mi].classList.remove('is-on'); mi = (mi + 1) % msgs.length; msgs[mi].classList.add('is-on'); }, 5000);
    // mega menu (hover intent + keyboard)
    const scrim = document.querySelector('[data-mega-scrim]'); let tOpen, tClose;
    const items = [...document.querySelectorAll('.hdr__nav > li[data-mega]')];
    const close = () => { items.forEach(li => { li.classList.remove('is-open'); li.firstElementChild.setAttribute('aria-expanded', 'false'); }); scrim.classList.remove('is-on'); };
    const open = li => { items.forEach(x => x !== li && x.classList.remove('is-open')); li.classList.add('is-open'); li.firstElementChild.setAttribute('aria-expanded', 'true'); scrim.classList.add('is-on'); };
    items.forEach(li => {
      li.addEventListener('mouseenter', () => { clearTimeout(tClose); tOpen = setTimeout(() => open(li), 90); });
      li.addEventListener('mouseleave', () => { clearTimeout(tOpen); tClose = setTimeout(close, 160); });
      li.firstElementChild.addEventListener('focus', () => open(li));
      li.addEventListener('focusout', e => { if (!li.contains(e.relatedTarget)) close(); });
    });
    document.querySelectorAll('.hdr__nav > li:not([data-mega])').forEach(li => li.addEventListener('mouseenter', close));
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    // mobile menu
    const mn = document.querySelector('[data-mnav]');
    const mOpen = () => { mn.classList.add('is-open'); mn.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('ib-lock'); };
    const mClose = () => { mn.classList.remove('is-open'); mn.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('ib-lock'); };
    document.addEventListener('click', e => {
      if (e.target.closest('[data-mnav-open]')) mOpen();
      else if (e.target.closest('[data-mnav-close]') || (mn.classList.contains('is-open') && e.target.closest('.mnav a'))) mClose();
    });
    // cart a11y mirror
    const cart = document.querySelector('[data-cart]');
    new MutationObserver(() => cart.setAttribute('aria-hidden', cart.classList.contains('is-open') ? 'false' : 'true')).observe(cart, { attributes: true, attributeFilter: ['class'] });
    // newsletter → WhatsApp
    const nf = document.querySelector('[data-news]');
    if (nf) nf.addEventListener('submit', e => { e.preventDefault(); const v = nf.querySelector('input').value.trim(); window.open(WA(`Hola Inbasix, quiero recibir asesoría y cotizaciones. Mi WhatsApp: ${v}`), '_blank', 'noopener'); });
    // search icon → catalog search focus
    document.addEventListener('click', e => { const s = e.target.closest('[data-search]'); if (!s) return; const box = document.querySelector('[data-plp-q]'); if (box) { e.preventDefault(); box.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' }); setTimeout(() => box.focus(), 400); } });
  }

  /* YouTube: click-to-load facade + modal */
  const ytThumb = id => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const ytEmbed = id => `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1" title="Video de YouTube" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
  function ytFacade(id, cap) { return `<button type="button" class="ytf" data-yt="${id}" aria-label="Reproducir video${cap ? ': ' + esc(cap) : ''}"><img src="${ytThumb(id)}" alt="" loading="lazy"><span class="pl">${I.play}</span>${cap ? `<span class="cap">${esc(cap)}</span>` : ''}</button>`; }
  document.addEventListener('click', e => {
    const f = e.target.closest('.ytf[data-yt]'); if (f) { e.preventDefault(); const wrap = document.createElement('div'); wrap.className = 'ytf'; wrap.innerHTML = ytEmbed(f.dataset.yt); f.replaceWith(wrap); return; }
    const m = e.target.closest('[data-ytm-open]'); const box = document.querySelector('[data-ytm]');
    if (m && box) { e.preventDefault(); box.querySelector('[data-ytm-box]').innerHTML = ytEmbed(m.dataset.ytmOpen); box.classList.add('is-open'); document.documentElement.classList.add('ib-lock'); return; }
    if (e.target.closest('[data-ytm-close]') || e.target === box) { box.classList.remove('is-open'); box.querySelector('[data-ytm-box]').innerHTML = ''; document.documentElement.classList.remove('ib-lock'); }
  });
  addEventListener('keydown', e => { const box = document.querySelector('[data-ytm].is-open'); if (e.key === 'Escape' && box) { box.classList.remove('is-open'); box.querySelector('[data-ytm-box]').innerHTML = ''; document.documentElement.classList.remove('ib-lock'); } });

  /* reels: muted autoplay in view, tap for sound */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-snd]'); if (!b) return;
    const v = b.closest('.reel').querySelector('video'); if (!v) return;
    document.querySelectorAll('.reel video').forEach(o => { if (o !== v) { o.muted = true; const ob = o.closest('.reel').querySelector('[data-snd]'); if (ob) ob.innerHTML = I.mute; } });
    v.muted = !v.muted; if (!v.muted) v.play().catch(() => {}); b.innerHTML = v.muted ? I.mute : I.sound; b.setAttribute('aria-label', v.muted ? 'Activar sonido' : 'Silenciar');
  });

  /* simple tabs: [data-tabs] buttons[aria-controls] */
  function tabs(root, onChange) {
    const btns = [...root.querySelectorAll('[role=tab]')];
    btns.forEach((b, i) => {
      b.addEventListener('click', () => select(i));
      b.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + btns.length) % btns.length; btns[n].focus(); select(n); } });
    });
    function select(i) { btns.forEach((b, k) => { b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; const p = document.getElementById(b.getAttribute('aria-controls')); if (p) { p.hidden = k !== i; if (k === i) { p.classList.remove('fade-in'); void p.offsetWidth; p.classList.add('fade-in'); } } }); if (onChange) onChange(i); }
    return select;
  }

  /* mount chrome */
  function mount() {
    const top = document.getElementById('v3-top'), foot = document.getElementById('v3-foot');
    if (top) top.outerHTML = headerHTML() + mnavHTML();
    if (foot) foot.outerHTML = footerHTML() + cartHTML();
    initHeader();
  }
  mount();

  /* branded photo kit (assets/photo): slots marked [data-photo=key] swap to the photo when V3_PHOTOS maps the key */
  function photos(root) {
    const M = window.V3_PHOTOS || {};
    (root || document).querySelectorAll('[data-photo]').forEach(el => { const f = M[el.dataset.photo]; if (!f) return;
      el.classList.add('photo'); el.querySelectorAll('img:not(.keep),video').forEach(n => n.remove());
      el.insertAdjacentHTML('afterbegin', `<img src="${B}assets/photo/${f}" alt="${esc(el.dataset.photoAlt || '')}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">`);
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; });
  }
  /* "Lo que opinan nuestros clientes" — portrait cards carousel (placeholder render: photos/reviews replaced by the client) */
  function reviews(el) {
    const R = window.IB_REVIEWS || [], PL = window.IB_REVIEW_PLATFORMS || {};
    const stars = pl => `<img class="rvw__stars" src="${B}assets/brand/reviews/${pl === 'trustpilot' ? 'stars-trustpilot' : 'stars-google'}.svg" alt="5 de 5 estrellas" width="84" height="16">`;
    const logo = pl => PL[pl] ? `<img class="rvw__pl rvw__pl--${pl}" src="${B}${PL[pl].logo}" alt="${PL[pl].name}" loading="lazy">` : '';
    const head = el.dataset.nohead ? '' : `<div class="rvw__head"><div><h2 class="h2">Lo que opinan nuestros clientes</h2>${el.dataset.sub ? `<p class="t-l">${esc(el.dataset.sub)}</p>` : ''}</div></div>`;
    const sum = `<div class="rvw__sum">${['google', 'facebook', 'trustpilot'].map(pl => `<span class="rvw__si">${logo(pl)}${stars(pl)}<b>${PL[pl] ? PL[pl].name : ''}</b></span>`).join('')}</div>`;
    const card = r => `<article class="rvc" data-placeholder="true" data-group="${r.group}">
      <div class="rvc__img"><img src="${B}assets/people/${r.slug}.webp" alt="${esc(r.name)}" loading="lazy" onerror="this.style.visibility='hidden'"></div>
      <div class="rvc__b"><div class="rvc__top">${stars(r.platform)}${logo(r.platform)}</div>
        <p class="rvc__q">“${esc(r.quote)}”</p><p class="rvc__n">${esc(r.name)}</p><p class="rvc__r">${esc(r.role)}</p></div></article>`;
    el.classList.add('rvw');
    el.innerHTML = `${head}<div class="rvw__bar">${sum}<div class="chips" role="group" aria-label="Filtrar opiniones">${[['all', 'Todos'], ['medicos', 'Médicos'], ['negocios', 'Negocios']].map(([k, t], i) => `<button type="button" data-rg="${k}" aria-pressed="${!i}">${t}</button>`).join('')}</div></div>
      <div class="rvw__vp" data-rvp>${R.map(card).join('')}</div>
      <div class="rvw__ctl"><div class="rvw__prog"><i data-rprog></i></div><div class="pcar__arr"><button type="button" data-rprev aria-label="Anterior">${I.chevL}</button><button type="button" data-rnext aria-label="Siguiente">${I.chevR}</button></div></div>`;
    const vp = el.querySelector('[data-rvp]'), prog = el.querySelector('[data-rprog]'), prev = el.querySelector('[data-rprev]'), next = el.querySelector('[data-rnext]');
    const upd = () => { const max = vp.scrollWidth - vp.clientWidth; const vis = vp.clientWidth / vp.scrollWidth; prog.style.width = Math.min(100, vis * 100) + '%'; prog.style.transform = `translateX(${max > 0 ? (vp.scrollLeft / max) * ((1 - vis) / vis) * 100 : 0}%)`; prev.disabled = vp.scrollLeft < 4; next.disabled = vp.scrollLeft > max - 4; el.querySelector('.rvw__ctl').hidden = max <= 4; };
    const step = () => { const c = vp.querySelector('.rvc:not([hidden])'); return c ? c.offsetWidth + 20 : 340; };
    prev.addEventListener('click', () => vp.scrollBy({ left: -step(), behavior: RM ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => vp.scrollBy({ left: step(), behavior: RM ? 'auto' : 'smooth' }));
    vp.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true }); addEventListener('resize', upd);
    el.querySelector('.chips').addEventListener('click', e => { const b = e.target.closest('[data-rg]'); if (!b) return; el.querySelectorAll('[data-rg]').forEach(x => x.setAttribute('aria-pressed', x === b)); const g = b.dataset.rg; vp.querySelectorAll('.rvc').forEach(c => c.hidden = g !== 'all' && c.dataset.group !== g); vp.scrollLeft = 0; upd(); });
    upd();
  }
  window.V3 = { inCol, reviews, colTitle, GROUPS, groupOf, inGroup, photos, logoItem, nm, K, B, esc, catUrl, WA, col, inC, byPrice, defVar, typeLabel, vendorName, logoOf, LOGOS, blurb, I, media, tile, tabs, ytFacade, ytThumb, hasVid, RM, POL };
})();
