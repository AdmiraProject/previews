/* Inbasix v2 — home */
(function () {
  const I = window.IBK, K = window.K, { $, $$, esc, IC } = K;
  K.mountShell({ search: false });
  const P = I.P, withImg = P.filter(p => p.img.length);

  /* hero: video + rotating placeholder + search */
  K.heroVideo($('[data-hero]'));
  (function rotate() {
    const sp = $$('.k-ph span'); if (!sp.length || K.RM) return; let i = 0;
    setInterval(() => { const a = sp[i]; i = (i + 1) % sp.length; const b = sp[i]; a.classList.remove('is-on'); a.classList.add('is-out'); b.classList.remove('is-out'); b.classList.add('is-on'); setTimeout(() => a.classList.remove('is-out'), 500); }, 2600);
  })();
  K.wireSearch(document);

  /* promos */
  $('[data-count-eq]').textContent = `${Math.floor(withImg.length / 10) * 10} equipos`;
  const pp = I.find('ultrasonido-mindray-consona-n5') || withImg[0];
  const pi = $('[data-promo-prod]'); pi.src = K.pimg(pp, 500);
  const sellWA = K.WA('Hola Inbasix, quiero vender mi equipo. Marca / modelo / año: ');
  $$('[data-vende]').forEach(a => { if (a.classList.contains('k-promo')) { a.href = sellWA; a.target = '_blank'; a.rel = 'noopener'; } });
  $('[data-sell-wa]').href = sellWA;

  /* video cards (real Inbasix YouTube videos) */
  const vids = ['M4vJD808YYY', 'P8uv-w941hg', 'uDGo2DVzyas', '1e9kIhxFd2Q', 'e7ztaINKlx4', 'J-1CZizZhpo', 'qCjcrInufV4', 'wrQsnhz3Wdg'];
  $('[data-blog]').innerHTML = `<div class="k-track">${vids.map(id => { const p = K.ytOwner(id);
    return `<div><button class="k-bcard" type="button" data-yt="${id}" aria-label="Ver video: ${esc(K.YT[id])}">
      <span class="k-bcard__img"><img src="${K.ytThumb(id)}" alt="" loading="lazy"><span class="k-play">${IC.play}</span></span>
      <span class="k-bcard__b"><span class="k-chip">${esc(p ? K.typeLabel(p) : 'Video')}</span><span class="k-bcard__t">${esc(K.YT[id])}</span>
      <span class="k-author"><img src="${K.A}brand/logo-navy.png" alt=""><span><b>Inbasix Medical</b><small>Video en YouTube${p ? ' • ' + esc(K.vendorName(p.vendor)) : ''}</small></span></span></span></button></div>`; }).join('')}</div>${K.arrows()}`;

  /* financing */
  $('[data-sim-slot]').outerHTML = K.sim();
  K.wireSim(document);
  const sim = $('[data-sim]'), go = $('[data-sim-go]');
  const upd = () => { go.href = K.simWA(sim); go.textContent = $('[data-s="cre"].is-on', sim) ? 'Solicitar crédito' : 'Solicitar arrendamiento'; };
  sim.addEventListener('k:sim', upd); upd();

  /* value props */
  const VP = [
    [IC.box, 'Directo de fábrica', 'Importadores directos y distribuidor autorizado, sin intermediarios'],
    [IC.shield, 'Garantía que crece contigo', '12 meses de fábrica, ampliable a 24, 36 o 48 meses'],
    [IC.cap, 'Capacitación botón por botón', 'Instalación profesional y capacitación a tu personal en toda la república']
  ];
  $('[data-vp]').innerHTML = VP.map(([i, t, d]) => `<article data-reveal><div class="k-vp__i">${i.replace('stroke-width="1.6"', 'stroke-width="1.4"')}</div><h3>${t}</h3><p>${d}</p></article>`).join('');

  /* advisor banner art: real products */
  const art = ['ultrasonido-mindray-mx7', 'ultrasonido-mindray-consona-n5', 'cryolipolisis-360-nubway', 'laser-co2-70w'].map(I.find).filter(Boolean);
  $('[data-ai-art]').innerHTML = art.map((p, i) => `<div class="k-stack k-stack--${[2, 1, 3, 4][i]}">${i === 0 ? `<span class="k-check">${IC.check}</span>` : ''}<b>${esc(I.shortName(p))}</b><small>${esc(K.vendorName(p.vendor))} • ${esc(K.typeLabel(p))}</small><img src="${K.pimg(p, 360)}" alt=""></div>`).join('');
  $('[data-ai-go]').href = K.WA('Hola Inbasix, quiero hablar con un ingeniero biomédico para elegir mi equipo.');

  /* carousels */
  const us = withImg.filter(p => (p.type === 'Ultrasonido' || p.type === 'Ultrasonido veterinario') && !I.isQuote(p)).sort((a, b) => I.minPrice(b) - I.minPrice(a));
  const est = withImg.filter(p => p.type === 'Aparatología Estética').sort((a, b) => (I.isQuote(a) - I.isQuote(b)) || (I.minPrice(b) || 0) - (I.minPrice(a) || 0));
  const car = (el, list) => { el.innerHTML = `<div class="k-track">${list.slice(0, 14).map(p => `<div>${K.mcard(p)}</div>`).join('')}</div>${K.arrows()}`; };
  car($('[data-car="us"]'), us); car($('[data-car="est"]'), est);

  /* reels */
  const REELS = [
    ['reel-mx7', 'Conoce el Mindray MX7', 'Ultrasonido', 'ultrasonido-mindray-mx7'],
    ['reel-consona-n5', 'Conoce el Consona N5', 'Ultrasonido', 'ultrasonido-mindray-consona-n5'],
    ['reel-codestetica', 'Inbasix en CODESTÉTICA CDMX', 'Congresos', null, 'coleccion.html?cat=aparatologia-estetica'],
    ['reel-fillers', 'Fillers Rejubeau en congreso', 'Fillers', null, 'coleccion.html?cat=fillers']
  ];
  $('[data-tips]').innerHTML = REELS.map(([n, t, tag, h, href]) => `<a class="k-tip" href="${h && I.find(h) ? K.pdp(h) : href}" data-reveal>
      <img src="${K.vids(n).jpg}" alt="" loading="lazy">${K.RM ? '' : `<video muted playsinline loop preload="none" poster="${K.vids(n).jpg}" data-inview><source src="${K.vids(n).mp4}" type="video/mp4"></video>`}
      ${K.RM ? '' : `<button class="k-tip__snd" type="button" aria-label="Activar sonido" data-snd>${IC.mute}</button>`}
      <span class="k-tip__t"><small>${tag}</small>${t}</span></a>`).join('');
  document.addEventListener('click', e => { const b = e.target.closest('[data-snd]'); if (!b) return; e.preventDefault(); e.stopPropagation();
    const v = b.parentElement.querySelector('video'); if (!v) return;
    $$('.k-tip video').forEach(x => { if (x !== v) { x.muted = true; const bb = x.parentElement.querySelector('[data-snd]'); if (bb) { bb.innerHTML = IC.mute; bb.setAttribute('aria-label', 'Activar sonido'); } } });
    v.muted = !v.muted; if (!v.muted) v.play().catch(() => {}); b.innerHTML = v.muted ? IC.mute : IC.sound; b.setAttribute('aria-label', v.muted ? 'Activar sonido' : 'Silenciar'); }, true);

  /* steps: mobile CTA follows tab */
  $$('#k-steps [data-tab]').forEach(t => t.addEventListener('click', () => { const m = $('.k-steps__m'); if (t.dataset.tab === 'v') { m.href = sellWA; m.target = '_blank'; m.textContent = 'Cotizar venta'; } else { m.href = 'coleccion.html'; m.removeAttribute('target'); m.textContent = 'Ver productos'; } }));

  /* testimonials, showrooms, brands, faq */
  $('[data-testi]').innerHTML = K.testiHTML();
  $('[data-shows]').innerHTML = `<div class="k-track">${K.SHOWS.map(s => `<div><article class="k-show"><div class="k-show__img"><img src="${K.A}img/${s.img}" alt="Edificio del showroom Inbasix ${s.c}" loading="lazy"></div><div class="k-show__b"><span class="k-chip" style="align-self:flex-start">Showroom</span><h3>${s.c}</h3><p>${s.a || 'Salas de ultrasonido, quirófano, laparoscopía, endoscopía, neonatología y aparatología estética'}</p>
    <a class="k-link" href="${s.a ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Inbasix Medical ' + s.a) : K.WA('Hola Inbasix, quiero agendar una visita al showroom de ' + s.c + '.')}" target="_blank" rel="noopener">${s.a ? 'Cómo llegar' : 'Agenda tu visita'} ${IC.right}</a></div></article></div>`).join('')}</div>${K.arrows()}`;
  $('[data-faq]').innerHTML = K.acc(K.FAQ);
  $('[data-allcount]').textContent = P.length;

  $('[data-brands]').innerHTML = K.brandsHTML();

  /* internal links accordion → category page */
  const L = (arr) => `<div class="k-links">${arr.map(([u, t]) => `<a href="${u}">${esc(t)}</a>`).join('')}</div>`;
  const vendors = [...new Set(P.map(p => p.vendor))].map(v => [K.vendorSlug(v), K.vendorName(v)]).sort((a, b) => a[1].localeCompare(b[1]));
  $('[data-links]').innerHTML = K.acc([
    ['Busca por categoría', L(K.GROUPS.map(g => [K.plp({ cat: g.k }), g.t]))],
    ['Busca por subcategoría', L(K.GROUPS.flatMap(g => g.c.slice(1).map(([c, t]) => [K.plp({ cat: c }), t])))],
    ['Busca por marca', L(vendors.map(([s, n]) => [K.plp({ brand: s }), n]))],
    ['Busca por rango de precio', L([[K.plp({ price: 'online' }), 'Con precio en línea'], [K.plp({ price: 'quote' }), 'Precio bajo cotización'], [K.plp({ price: '0-100000' }), 'Hasta $100,000'], [K.plp({ price: '100000-250000' }), '$100,000 a $250,000'], [K.plp({ price: '250000-500000' }), '$250,000 a $500,000'], [K.plp({ price: '500000-' }), 'Más de $500,000']])],
    ['Busca por especialidad', L([[K.plp({ q: 'ginecologia' }), 'Ginecología y obstetricia'], [K.plp({ q: 'radiologia' }), 'Radiología'], [K.plp({ cat: 'veterinario' }), 'Veterinaria'], [K.plp({ cat: 'aparatologia-estetica' }), 'Medicina estética'], [K.plp({ q: 'portatil' }), 'Ultrasonido portátil'], [K.plp({ cat: 'quirofano' }), 'Quirófano']])],
    ['Busca por showroom', L(K.SHOWS.map(s => ['#showrooms', 'Showroom ' + s.c]))]
  ]);

  K.carousel(document);
  I.watch(document);
})();
