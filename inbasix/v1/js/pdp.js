/* Inbasix v1 · product page: product.html?p=<handle> renders any of the 186 products */
(function () {
  const K = window.IBK, V = window.V1;
  const { $, $$, esc, IC } = V;
  const STORE = K.STORE, WA = 'https://wa.me/' + K.WA;

  const FAQ = [
    ['¿Cómo me aseguran que tienen el mejor precio?', 'Somos importadores directos de fábrica y distribuidor autorizado de la marca en México. Compras sin intermediarios y recibes tu cotización formal en menos de 24 horas.'],
    ['No soy médico, soy dueño de un spa, ¿puedo comprar?', 'Sí. Spas y centros de bienestar también pueden comprar aparatología estética con nosotros.'],
    ['¿Dónde puedo ver el equipo?', 'En nuestros showrooms de CDMX, Guadalajara, Monterrey y Chihuahua, con salas de ultrasonido, quirófano, laparoscopía, endoscopía, neonatología y aparatología estética.'],
    ['¿Qué formas de pago tienen?', 'Transferencia BBVA a IMPORTACIONES INBASIX S.A. de C.V., tarjeta de crédito o débito, crédito bancario y arrendamiento puro.'],
    ['¿Qué garantía dan?', 'La garantía estándar del fabricante es de 12 meses y puedes ampliarla a 24, 36 o 48 meses. También te damos servicio postventa después de la garantía.'],
    ['¿Pueden recomprarme el equipo?', 'Te ayudamos a revender tu equipo directo con el cliente final.'],
    ['¿Incluye capacitación?', 'Sí. Incluye capacitación botón por botón, instalación profesional y capacitación técnica a tu personal en toda la república.'],
    ['¿Cuál es el tiempo de entrega?', 'La entrega estimada es de 3 a 10 días hábiles después de confirmado tu pedido. Enviamos a todo México.'],
    ['¿Envían fuera del país?', 'Sí, contáctanos para revisar tu envío fuera de México.'],
    ['¿Me dan asesoramiento técnico?', 'Sí. Te asesoran ingenieros biomédicos para elegir el equipo que mejor se adapta a tu práctica.'],
  ];
  const ACC = [
    ['Garantía y servicio', '<p>Garantía estándar del fabricante de 12 meses. Puedes ampliarla a 24, 36 o 48 meses.</p><p style="margin-top:8px">Servicio postventa también después de la garantía.</p>'],
    ['Capacitación e instalación', '<ul><li>Capacitación botón por botón incluida</li><li>Instalación profesional y capacitación técnica a tu personal en toda la república</li><li>Asesoría con ingenieros biomédicos</li></ul>'],
    ['Envío y entrega', '<p>Entrega estimada de 3 a 10 días hábiles después de confirmado tu pedido. Envíos a todo México; para envíos fuera del país, contáctanos.</p>'],
    ['Formas de pago', '<ul><li>Transferencia BBVA (IMPORTACIONES INBASIX S.A. de C.V.)</li><li>Tarjeta de crédito o débito</li><li>Crédito bancario</li><li>Arrendamiento puro</li></ul>'],
  ];

  const tcase = s => s.toLowerCase().replace(/^\p{L}/u, c => c.toUpperCase());
  const accHTML = (items, open) => `<div class="acc">${items.map(([q, a], i) => `<div class="acc-i${open === i ? ' is-open' : ''}"><button class="acc-b" type="button" aria-expanded="${open === i}">${esc(q)}${IC.chev}</button><div class="acc-c"><div>${a.startsWith('<') ? a : `<p>${esc(a)}</p>`}</div></div></div>`).join('')}</div>`;

  /* ---------- description sanitizer: keep headings/lists/tables/images, drop inline styles/fonts/iframes ---------- */
  function sanitize(html) {
    const doc = new DOMParser().parseFromString(`<div id="r">${html || ''}</div>`, 'text/html');
    const r = doc.getElementById('r');
    r.querySelectorAll('script,style,iframe,object,embed,form,input,button,meta,link,noscript,svg').forEach(n => n.remove());
    const unwrap = n => { while (n.firstChild) n.parentNode.insertBefore(n.firstChild, n); n.remove(); };
    r.querySelectorAll('font,span,u,center,o\\:p').forEach(unwrap);
    r.querySelectorAll('h1,h2').forEach(h => { const n = doc.createElement('h3'); n.innerHTML = h.innerHTML; h.replaceWith(n); });
    r.querySelectorAll('h3 + h3').forEach(h => { const n = doc.createElement('h4'); n.innerHTML = h.innerHTML; h.replaceWith(n); });
    r.querySelectorAll('h5,h6').forEach(h => { const n = doc.createElement('h4'); n.innerHTML = h.innerHTML; h.replaceWith(n); });
    r.querySelectorAll('*').forEach(el => {
      [...el.attributes].forEach(a => { if (!['href', 'src', 'alt', 'colspan', 'rowspan'].includes(a.name)) el.removeAttribute(a.name); });
      if (el.tagName === 'IMG') { let s = el.getAttribute('src') || ''; if (s.startsWith('//')) s = 'https:' + s; if (!/^https?:/.test(s)) { el.remove(); return; } el.src = s; el.loading = 'lazy'; el.alt = el.alt || ''; }
      if (el.tagName === 'A') { const h = el.getAttribute('href') || ''; if (!/^(https?:|mailto:|tel:)/.test(h)) { unwrap(el); return; } el.target = '_blank'; el.rel = 'noopener'; }
    });
    // headings: strip nested strong
    r.querySelectorAll('h3 strong,h4 strong,h3 b,h4 b').forEach(unwrap);
    // divs → paragraphs when they only hold inline content
    r.querySelectorAll('div').forEach(d => { if (![...d.children].some(c => /^(DIV|P|UL|OL|TABLE|H\d|IMG)$/.test(c.tagName))) { const p = doc.createElement('p'); p.innerHTML = d.innerHTML; d.replaceWith(p); } else unwrap(d); });
    // remove empties
    for (let k = 0; k < 2; k++) r.querySelectorAll('p,h3,h4,li,ul,ol,strong,b,em').forEach(n => { if (!n.textContent.replace(/\s| /g, '') && !n.querySelector('img,table')) n.remove(); });
    r.querySelectorAll('br + br').forEach(b => b.remove());
    r.querySelectorAll('table').forEach(t => { const w = doc.createElement('div'); w.className = 'tw'; t.replaceWith(w); w.appendChild(t); });
    return r;
  }
  function chunks(root) {
    const out = []; let cur = null;
    [...root.children].forEach(n => {
      if (/^H[34]$/.test(n.tagName)) { cur = { h: n.textContent.trim(), nodes: [] }; out.push(cur); }
      else if (cur) cur.nodes.push(n);
      else { cur = { h: '', nodes: [n] }; out.push(cur); }
    });
    return out.map(c => ({ ...c, text: c.nodes.map(n => n.textContent).join(' ').replace(/\s+/g, ' ').trim() }));
  }

  /* ---------- helpers ---------- */
  const specificCol = p => {
    const c = p.cols.filter(c => !['equipo-medico', 'frontpage'].includes(c)).map(c => ({ c, n: K.P.filter(x => x.cols.includes(c) && x.img.length && x.h !== p.h).length })).filter(x => x.n >= 2).sort((a, b) => a.n - b.n);
    return c.length ? c[0].c : null;
  };
  const related = (p, n) => {
    const out = []; const seen = new Set([p.h]);
    const cols = p.cols.filter(c => c !== 'frontpage').map(c => ({ c, n: K.P.filter(x => x.cols.includes(c)).length })).sort((a, b) => a.n - b.n).map(x => x.c);
    for (const c of cols) for (const x of K.P) { if (out.length >= n) break; if (!seen.has(x.h) && x.img.length && x.cols.includes(c)) { seen.add(x.h); out.push(x); } }
    return out;
  };
  const loopFor = p => {
    const t = (p.t + ' ' + p.h).toLowerCase();
    if (p.cols.includes('fillers') || /filler|hialur|lactico/.test(t)) return 'loop-plla';
    if (p.cols.includes('aparatologia-estetica')) return /co2/.test(t) ? 'loop-co2' : /hifu/.test(t) ? 'loop-hifu' : /micronee/.test(t) ? 'loop-microneedle' : 'loop-co2';
    if (/samsung/.test(t)) return 'loop-samsung';
    if (/mx7/.test(t)) return 'loop-mx7';
    if (/nuewa/.test(t)) return 'loop-nuewa';
    if (p.cols.includes('sistemas-de-diagnostico-por-ultrasonido') || /ultrason/.test(t)) return 'loop-consona';
    return 'loop-curso';
  };
  const reelsFor = p => {
    const t = (p.t + ' ' + p.h + ' ' + p.cols.join(' ')).toLowerCase();
    const score = r => r.k.reduce((s, k) => s + (t.includes(k) ? (k.length > 6 ? 1 : 3) : 0), 0);
    return V.REELS.slice().sort((a, b) => score(b) - score(a)).slice(0, 4);
  };

  /* ---------- render ---------- */
  async function render() {
    const main = $('[data-pdp]');
    const h = new URLSearchParams(location.search).get('p');
    const p = h && K.find(h);
    if (!p) {
      main.innerHTML = `<div class="nf"><img src="../assets/brand/logo-navy.png" alt="Inbasix Medical" width="170" height="51"><h1>No encontramos este equipo</h1><p>Puede que el enlace haya cambiado. Revisa el catálogo completo o escríbenos y te ayudamos a encontrarlo.</p><a class="btn-y" href="coleccion.html">Ver catálogo</a><p style="margin-top:18px"><a href="${WA}" target="_blank" rel="noopener">Escribir por WhatsApp</a></p></div>`;
      return;
    }
    const name = K.shortName(p), quote = K.isQuote(p);
    const imgs = p.img.slice(0, 9);
    const sel = (p.v.find(v => v.a) || p.v[0]).o.slice();
    const opts = p.opts.filter(o => !(o.v.length === 1 && /default title/i.test(o.v[0])));
    const findVar = s => p.v.find(v => opts.every((o, i) => v.o[i] === s[i]));
    let cur = findVar(sel) || p.v[0];
    let qty = 1;

    const gal = imgs.length ? `
      <div class="gal-main" data-lb="0"><img src="${K.img(imgs[0], 1200)}" alt="${esc(name)}" fetchpriority="high"><button class="gal-btn sh" type="button" data-share aria-label="Compartir">${SHARE}</button><button class="gal-btn zm" type="button" aria-label="Ampliar imagen">${ZOOM}</button></div>
      ${imgs.length > 1 ? `<div class="gal-grid">${imgs.slice(1, 7).map((s, i) => `<div class="gi" data-lb="${i + 1}"><img src="${K.img(s, 800)}" alt="${esc(name)}, imagen ${i + 2}" loading="lazy"><button class="gal-btn zm" type="button" aria-label="Ampliar imagen">${ZOOM}</button></div>`).join('')}</div>` : ''}
      <div class="gal-wrap"><div class="gal-m" data-galm>${imgs.map((s, i) => `<div data-lb="${i}"><img src="${K.img(s, 800)}" alt="${esc(name)}" ${i ? 'loading="lazy"' : ''}></div>`).join('')}</div>${imgs.length > 1 ? `<div class="gal-dots">${imgs.map((_, i) => `<button type="button" aria-label="Imagen ${i + 1}"${i ? '' : ' class="is-on"'} data-dot="${i}"></button>`).join('')}</div>` : ''}</div>`
      : `<div class="gal-ph"><img src="../assets/brand/logo-navy.png" alt="Inbasix Medical" width="170" height="51"><p>Imágenes disponibles bajo solicitud</p></div>`;

    const optHTML = opts.map((o, i) => {
      const maxL = Math.max(...o.v.map(v => v.length));
      const cls = maxL > 22 ? 'c1' : (o.v.length % 3 === 0 && maxL <= 12 ? 'c3' : '');
      return `<div class="opt"><h6>${esc(tcase(o.n))}</h6><div class="opt-g ${cls}" role="radiogroup" aria-label="${esc(tcase(o.n))}">${o.v.map(v => `<button class="ot" type="button" role="radio" data-oi="${i}" data-ov="${esc(v)}">${IC.check}<span>${esc(v)}</span></button>`).join('')}</div></div>`;
    }).join('');

    const priceHTML = () => quote ? `<span class="q">Precio bajo cotización</span><span class="pill l">A cotizar</span>`
      : `<span class="p">${V.fmt(cur.p)}</span>${p.v.length > 1 && cur.t !== 'Default Title' ? `<span class="pill l">${esc(cur.t.split(' / ').pop())}</span>` : ''}`;
    const promo = `<a class="promo" href="${WA}?text=${encodeURIComponent('Hola Inbasix, quiero cotizar: ' + p.t + '\n' + STORE + '/products/' + p.h)}" target="_blank" rel="noopener">
      <div class="promo-l"><span class="promo-ic">${V.IC.tick}</span><p>Cotización formal en <b>menos de 24 h</b><br>Financiamiento: <b>aprobación en 24 h</b></p></div>
      <div class="promo-r"><b>WHATSAPP</b><span>${WAI}Escribir</span></div></a><small>*Te atiende un asesor de Inbasix Medical. Consulta las <span style="text-decoration:underline">políticas de venta</span> en inbasixmedical.com</small>`;
    const head = `<h1>${esc(p.t)}</h1><div class="bb-meta"><span class="vchip">${esc(V.vendor(p))}</span>${p.yt.length ? '<a href="#video">Ver video del equipo</a>' : `<a href="coleccion.html?cat=${specificCol(p) || ''}">${esc(p.type)}</a>`}</div><div class="bb-price" data-price>${priceHTML()}</div>${quote ? '<p class="bb-sub">Recibe tu propuesta formal por WhatsApp en menos de 24 horas</p>' : ''}`;

    const relList = related(p, 4);
    const cmpList = [p, ...related(p, 2)].filter(x => x.img.length || x === p).slice(0, 3);
    const cmpCard = x => `<a class="cmp-c${x === p ? ' is-cur' : ''}" href="${K.pdp(x.h)}"><div class="hd">${esc(V.vendor(x))}</div><div class="im">${x.img.length ? `<img src="${V.cardImg(x, 400)}" alt="" loading="lazy">` : '<img src="../assets/brand/logo-navy.png" alt="" style="width:50%;opacity:.4">'}</div><h4>${esc(K.shortName(x))}</h4>
      <div class="lb">Precio</div><div class="vl">${K.isQuote(x) ? 'Bajo cotización' : (K.priced(x).length > 1 ? 'Desde ' : '') + V.fmt(K.minPrice(x))}</div>
      <div class="lb">Tipo</div><div class="vl">${esc(x.type)}</div>
      <div class="lb">Configuraciones</div><div class="vl">${x.v.length > 1 ? x.v.length + ' opciones' : 'Única'}</div>
      <div class="lb end">${x === p ? 'Estás viendo este equipo' : 'Ver equipo →'}</div></a>`;

    main.innerHTML = `
      <div class="pdp-head">${head.replace('<h1>', '<h1 class="ph1">')}${promo}</div>
      <div class="pdp">
        <div class="gal">${gal}</div>
        <div class="bb">${head}${promo}
          ${optHTML}
          <div class="qty"><div class="qty-h"><b>Cantidad</b><span>${quote ? '(Equipos a cotizar)' : ''}</span></div>
            <label class="qty-box"><span class="u" data-qtyl>1 unidad</span><span class="pr" data-qtyp></span>${IC.chev}<select data-qty aria-label="Cantidad">${[1, 2, 3, 4, 5, 6, 8, 10].map(n => `<option value="${n}">${n}</option>`).join('')}</select></label></div>
          <div class="bb-cta" data-cta-wrap>
            <button class="btn-t" type="button" data-cta data-add="${p.h}">${quote ? 'Cotizar' : 'Agregar al carrito'}</button>
            ${quote ? `<a class="btn-to" href="${WA}?text=${encodeURIComponent('Hola Inbasix, quiero hablar con un asesor sobre: ' + p.t)}" target="_blank" rel="noopener">${WAI} Hablar con un asesor</a>` : `<button class="btn-to" type="button" data-buy2 data-buy="${p.h}">Comprar ahora</button>`}
          </div>
          <p class="bb-fin">Financia tu equipo con <a href="#financiamiento">arrendamiento puro o crédito simple*</a></p>
          <p class="bb-ship">${TRUCK}Entrega estimada de 3 a 10 días hábiles después de confirmado tu pedido. Envíos a todo México</p>
          ${accHTML(ACC)}
          <div class="need"><h2>¿Necesitas ayuda?</h2><p>Nuestros especialistas están disponibles para responder tus dudas.</p><div><a class="btn-to" href="tel:8004622749">${PHONE}Llámanos</a><a class="btn-to" href="${WA}" target="_blank" rel="noopener">${WAI}Escríbenos</a></div></div>
        </div>
      </div>
      <div class="sbar" data-sbar><div class="sbar-in"><p class="sbar-t">${esc(name)}</p><div class="sbar-l"><span class="sbar-v" data-sbar-v></span><span class="sbar-p" data-sbar-p></span></div><button class="btn-t" type="button" data-sbar-btn data-add="${p.h}">${quote ? 'Cotizar' : 'Agregar al carrito'}</button></div></div>

      <section class="think" aria-labelledby="h-think"><h2 class="h34" id="h-think">Pensamos en todo</h2><p>Con tu ${esc(name)} recibes el respaldo completo de Inbasix Medical</p>
        <ul>${['Garantía de fábrica', 'Capacitación incluida', 'Envíos a todo México', 'Soporte con ingenieros biomédicos'].map(t => `<li>${V.IC.tick}${t}</li>`).join('')}</ul></section>

      <section class="band" id="video" aria-labelledby="h-band"><div class="band-in">
        <div class="band-m" data-band>${p.yt.length ? `<div class="yt" role="button" tabindex="0" aria-label="Reproducir video de ${esc(name)}" data-yt="${esc(p.yt[0])}"><img src="https://i.ytimg.com/vi/${esc(p.yt[0])}/hqdefault.jpg" alt="" loading="lazy"><span class="yt-play">${IC.play}</span></div>`
          : `<div data-v="${loopFor(p)}" style="position:absolute;inset:0">${imgs.length ? `<img src="${K.img(imgs[Math.min(1, imgs.length - 1)], 900)}" alt="" loading="lazy" style="object-fit:contain;background:#fff">` : `<img src="../assets/photo/banners/showroom-16x9.webp" alt="" loading="lazy">`}</div>`}</div>
        <div class="band-t"><p class="k">${p.yt.length ? '¿Quieres verlo en acción?' : '¿Por qué con Inbasix?'}</p><h2 id="h-band">Conoce el ${esc(name)}</h2><hr><h3>Lo que te llevas</h3>
          <ol class="steps"><li><b>1</b><span>${/inbasix/i.test(p.vendor) ? 'Equipo importado directo de fábrica' : `Distribuidor autorizado ${esc(V.vendor(p))} en México`}</span></li><li><b>2</b><span>Capacitación botón por botón para ti y tu personal</span></li><li><b>3</b><span>Garantía de fábrica de 12 meses, ampliable a 48</span></li></ol></div>
      </div></section>

      <section class="feat" data-feat aria-labelledby="h-feat"><h2 id="h-feat">Todo sobre el ${esc(name)}</h2><div data-feat-rows></div><div class="spec" data-spec></div></section>

      ${cmpList.length > 1 ? `<section class="cmp" aria-labelledby="h-cmp"><h2 class="h34" id="h-cmp">Compara opciones de la misma línea</h2><p>Encuentra el que mejor se acomoda a tu práctica</p><div class="cmp-g">${cmpList.map(cmpCard).join('')}</div></section>` : ''}

      <div class="pdp-fin" data-fin-slot></div>

      <section class="faq" aria-labelledby="h-faq"><h2 class="h34" id="h-faq">Preguntas frecuentes</h2>${accHTML(FAQ)}</section>

      <section class="revs" aria-labelledby="h-revs"><h2 id="h-revs">Lo que opinan nuestros clientes</h2><div class="rsum" data-rsum2></div>
        <div class="revs-tb"><div class="revs-pills"><button type="button" class="is-on" data-rf="all">Todos</button><button type="button" data-rf="medicos">Médicos</button><button type="button" data-rf="negocios">Negocios</button><button type="button" data-rf="videos">Videos</button></div></div>
        <div class="revs-l" data-revs></div><div class="reels" data-reels></div></section>

      ${relList.length ? `<section class="rel" aria-labelledby="h-rel"><h2 class="h34" id="h-rel">También te puede interesar</h2><div class="grid4">${relList.map(V.card).join('')}</div></section>` : ''}
      <div data-help-slot></div><div data-logos-slot></div>`;

    // move shared blocks (financing, contact, logos) into place
    const mv = (tpl, slot) => { const t = $(tpl), s = $(slot, main); if (t && s) { [...t.children].forEach(c => s.appendChild(c)); t.remove(); } };
    mv('[data-tpl-fin]', '[data-fin-slot]'); mv('[data-tpl-help]', '[data-help-slot]'); mv('[data-tpl-logos]', '[data-logos-slot]');
    $('[data-revs]', main).innerHTML = V.RV.map(V.reviewRow).join('');
    const rs = $('[data-rsum2]', main); if (rs) rs.innerHTML = V.reviewSummary();
    V.$$('[data-mq]', main).forEach(t => { const w = t.scrollWidth / 2; if (w) t.style.setProperty('--mq-d', (w / (+t.dataset.mq || 60)).toFixed(2) + 's'); });

    /* description */
    const data = await K.body(p.h);
    const root = sanitize(data && data.body);
    const ch = chunks(root).filter(c => c.h && c.text.length > 50 && c.text.length < 900);
    const rowsBox = $('[data-feat-rows]', main), spec = $('[data-spec]', main);
    const rowImgs = imgs.slice(1).length ? imgs.slice(1) : imgs;
    const nRows = Math.min(3, ch.length, rowImgs.length);
    const used = new Set();
    for (let i = 0; i < nRows; i++) {
      const c = ch[i]; used.add(c);
      const row = document.createElement('div'); row.className = 'fr' + (i % 2 ? ' rev' : ''); row.setAttribute('data-reveal', '');
      row.innerHTML = `<div class="fr-m"><img src="${K.img(rowImgs[i], 900)}" alt="" loading="lazy"></div><div class="fr-t"><h3>${esc(c.h)}</h3><div class="rx"></div></div>`;
      c.nodes.forEach(n => row.querySelector('.rx').appendChild(n.cloneNode(true)));
      rowsBox.appendChild(row);
    }
    const hasRest = root.textContent.replace(/\s/g, '').length > 0;
    if (hasRest) {
      spec.innerHTML = `<details${nRows ? '' : ' open'}><summary>Ficha técnica completa${IC.chev}</summary><div class="prose"></div></details>`;
      $('.prose', spec).appendChild(root);
    } else if (!nRows) {
      spec.innerHTML = `<div class="prose"><p>Pide la ficha técnica completa de este equipo a un asesor por <a href="${WA}" target="_blank" rel="noopener">WhatsApp</a>.</p></div>`;
    }

    /* reels + testimonials filter */
    const reels = await V.reelCards(reelsFor(p));
    const rbox = $('[data-reels]', main); reels.forEach(r => { r.dataset.tag = 'videos'; rbox.appendChild(r); });
    if (!reels.length) { const vb = $('[data-rf="videos"]', main); if (vb) vb.remove(); }
    $$('[data-rf]', main).forEach(b => b.addEventListener('click', () => {
      $$('[data-rf]', main).forEach(o => o.classList.toggle('is-on', o === b));
      const f = b.dataset.rf;
      $('[data-revs]', main).hidden = f === 'videos'; rbox.hidden = f !== 'all' && f !== 'videos';
      $$('[data-revs] .rr', main).forEach(r => { r.hidden = !(f === 'all' || f === 'videos' || r.dataset.tag === f); });
    }));

    /* variant + qty wiring */
    const cta = $('[data-cta]', main), sbtn = $('[data-sbar-btn]', main), buy2 = $('[data-buy2]', main);
    const sync = () => {
      $$('.ot', main).forEach(b => {
        const i = +b.dataset.oi, v = b.dataset.ov;
        b.classList.toggle('is-on', sel[i] === v); b.setAttribute('aria-checked', String(sel[i] === v));
        const test = sel.slice(); test[i] = v; b.classList.toggle('is-na', !findVar(test));
      });
      [cta, sbtn, buy2].forEach(b => { if (!b) return; b.dataset.vid = cur.id; b.dataset.qty = qty; });
      $$('[data-price]').forEach(n => n.innerHTML = priceHTML());
      $('[data-qtyl]', main).textContent = qty === 1 ? '1 unidad' : qty + ' unidades';
      $('[data-qtyp]', main).textContent = quote ? 'A cotizar' : V.fmt(cur.p * qty);
      $('[data-sbar-p]', main).textContent = quote ? 'Precio bajo cotización' : V.fmt(cur.p);
      $('[data-sbar-v]', main).textContent = cur.t !== 'Default Title' ? cur.t.split(' / ')[0] : V.vendor(p);
    };
    main.addEventListener('click', e => {
      const b = e.target.closest('.ot'); if (!b) return;
      sel[+b.dataset.oi] = b.dataset.ov;
      let v = findVar(sel);
      if (!v) { v = p.v.find(x => x.o[+b.dataset.oi] === b.dataset.ov); if (v) v.o.forEach((o, i) => { if (i < sel.length) sel[i] = o; }); }
      if (v) cur = v; sync();
    });
    $('[data-qty]', main).addEventListener('change', e => { qty = +e.target.value; sync(); });
    sync();

    /* accordions */
    main.addEventListener('click', e => {
      const b = e.target.closest('.acc-b'); if (!b) return;
      const it = b.parentElement, o = !it.classList.contains('is-open');
      it.classList.toggle('is-open', o); b.setAttribute('aria-expanded', String(o));
    });

    /* sticky add-to-cart bar after the main CTA scrolls out */
    const sbar = $('[data-sbar]', main), wrap = $('[data-cta-wrap]', main);
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => sbar.classList.toggle('is-on', !en.isIntersecting && en.boundingClientRect.top < 0), { rootMargin: '-68px 0px 0px 0px' }).observe(wrap);

    /* YouTube facade */
    const yt = $('[data-yt]', main);
    if (yt) { const go = () => { yt.outerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt.dataset.yt)}?autoplay=1&rel=0" title="Video de ${esc(name)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`; };
      yt.addEventListener('click', go); yt.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); }

    /* share */
    const sh = $('[data-share]', main);
    if (sh) sh.addEventListener('click', async e => { e.stopPropagation(); try { if (navigator.share) await navigator.share({ title: p.t, url: location.href }); else { await navigator.clipboard.writeText(location.href); sh.title = 'Enlace copiado'; } } catch (er) {} });

    /* mobile gallery dots */
    const gm = $('[data-galm]', main);
    if (gm) gm.addEventListener('scroll', () => { const i = Math.round(gm.scrollLeft / gm.clientWidth); $$('[data-dot]', main).forEach(d => d.classList.toggle('is-on', +d.dataset.dot === i)); }, { passive: true });
    main.addEventListener('click', e => { const d = e.target.closest('[data-dot]'); if (d && gm) gm.scrollTo({ left: gm.clientWidth * +d.dataset.dot, behavior: 'smooth' }); });

    /* lightbox */
    if (imgs.length) {
      const lb = document.createElement('div'); lb.className = 'lbx'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Galería');
      lb.innerHTML = `<img alt=""><button class="x" type="button" aria-label="Cerrar">${CLOSE}</button>${imgs.length > 1 ? `<button class="pv" type="button" aria-label="Anterior">${PREV}</button><button class="nx" type="button" aria-label="Siguiente">${NEXT}</button>` : ''}`;
      document.body.appendChild(lb);
      let li = 0; const show = i => { li = (i + imgs.length) % imgs.length; lb.querySelector('img').src = K.img(imgs[li], 1600); };
      const close = () => { lb.classList.remove('is-open'); document.documentElement.classList.remove('ib-lock'); };
      main.addEventListener('click', e => { const t = e.target.closest('[data-lb]'); if (!t || e.target.closest('[data-share]')) return; show(+t.dataset.lb); lb.classList.add('is-open'); document.documentElement.classList.add('ib-lock'); });
      lb.addEventListener('click', e => { if (e.target.closest('.pv')) show(li - 1); else if (e.target.closest('.nx')) show(li + 1); else if (e.target.closest('.x') || e.target === lb) close(); });
      document.addEventListener('keydown', e => { if (!lb.classList.contains('is-open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(li - 1); if (e.key === 'ArrowRight') show(li + 1); });
    }

    // cart upsell: same line
    K.Cart.upsell = relList.map(x => x.h);
    V.mountVideos(main);
    K.watch(main);
    document.title = 'Inbasix Medical';
  }

  const SHARE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 13v7h14v-7"/></svg>';
  const ZOOM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.5-4.5M10.5 7.5v6M7.5 10.5h6"/></svg>';
  const WAI = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="16" height="16"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.24 8.24 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23z"/></svg>';
  const PHONE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="16" height="16"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1A17 17 0 0 1 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02z"/></svg>';
  const TRUCK = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5zM18 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>';
  const CLOSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
  const PREV = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
  const NEXT = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
