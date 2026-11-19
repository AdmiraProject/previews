/* Inbasix v2 — product detail page (any of the catalog's products) */
(function () {
  const I = window.IBK, K = window.K, { $, $$, esc, IC } = K;
  K.mountShell({ search: true });
  K.wireSearch(document);
  const root = $('[data-pdp]');
  const h = new URLSearchParams(location.search).get('p');
  const p = h && I.find(h);

  if (!p) {
    root.innerHTML = `<div class="k-wrap v-404"><img src="${K.A}brand/logo-navy.png" alt="" width="160"><h1>No encontramos este equipo</h1><p>Puede que el enlace haya cambiado. Busca el equipo por nombre o marca, o explora el catálogo completo.</p>
      <div style="width:min(520px,100%)">${'<div class="k-searchbox" data-search><label class="k-searchbox__f"><span class="sr">Buscar equipo</span>' + IC.search + '<input type="search" placeholder="Busca por equipo, marca o categoría" autocomplete="off"></label><div class="k-sugg" hidden></div></div>'}</div>
      <a class="k-btn" href="coleccion.html">Ver todos los productos</a></div>`;
    K.wireSearch(root); return;
  }
  document.title = I.shortName(p) + ' | Inbasix Medical';

  const vn = K.vendorName(p.vendor), tl = K.typeLabel(p), quote0 = I.isQuote(p);
  const mainCol = (K.CATS.find(([c]) => p.cols.includes(c)) || [p.cols[0] || 'equipo-medico'])[0];
  const brand = K.BRANDS.find(b => b.v.includes(p.vendor));
  const grp = K.groupOf(p);
  const opts = (p.opts || []).filter(o => o.v && o.v.length);
  // initial variant: first available with price, else first
  let cur = p.v.find(v => v.a && v.p) || p.v.find(v => v.a) || p.v[0];
  let sel = opts.map((o, i) => cur.o[i]);
  const findV = s => p.v.find(v => s.every((x, i) => v.o[i] === x));
  const imgs = p.img.slice(0, 24);
  // gallery URLs: studio card from the photo kit first (when available), then the store renders
  const G = (i, w) => i === 0 && K.studio(p) ? K.studio(p) : I.img(imgs[i], w);

  const money = n => I.money(n);
  const priceBig = v => { if (!v.p) return `<div class="k-price k-price--q"><b>Precio bajo cotización</b></div>`; const [a, b] = money(v.p).replace('$', '').split('.'); return `<div class="k-price"><i>$</i><b>${a}</b><u>.${b}</u></div>`; };
  const WA = msg => K.WA(msg);
  const qWA = WA(`Hola Inbasix, quiero cotizar: ${p.t}\n${I.STORE}/products/${p.h}`);

  /* ---------- related lists ---------- */
  const pool = I.P.filter(x => x.h !== p.h && x.img.length);
  const sameVendor = pool.filter(x => x.vendor === p.vendor);
  const sameCol = pool.filter(x => x.cols.includes(mainCol));
  const mp = I.minPrice(p);
  const similarPrice = mp != null ? pool.filter(x => I.minPrice(x) != null).sort((a, b) => Math.abs(I.minPrice(a) - mp) - Math.abs(I.minPrice(b) - mp)).slice(0, 10)
    : pool.filter(x => x.type === p.type && !sameCol.slice(0, 8).includes(x)).slice(0, 10);
  const rank = x => (x.type === p.type ? 0 : 2) + (I.isQuote(x) ? 1 : 0);
  const otherVendor = (sameVendor.length >= 3 ? sameVendor : sameCol).slice().sort((a, b) => rank(a) - rank(b)).slice(0, 3);
  const interest = sameCol.length >= 4 ? sameCol.slice(0, 12) : pool.filter(x => x.type === p.type).slice(0, 12);

  /* ---------- markup ---------- */
  const galHTML = imgs.length ? `
    <div class="v-gal">
      <div class="v-stage" data-stage>
        <div class="v-stage__t" data-stage-t>${imgs.map((s, i) => `<div><img src="${G(i, i ? 1000 : 1200)}" alt="${esc(p.t)} — imagen ${i + 1}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}></div>`).join('')}</div>
        ${imgs.length > 1 ? `<button class="v-nav v-nav--prev" type="button" aria-label="Imagen anterior" data-g="-1" hidden>${IC.left}</button><button class="v-nav v-nav--next" type="button" aria-label="Imagen siguiente" data-g="1">${IC.right}</button>` : ''}
        <span class="v-count" data-gcount>1 / ${imgs.length}</span>
      </div>
      ${imgs.length > 1 ? `<div class="v-thumbs" data-thumbs>${imgs.map((s, i) => `<button type="button" class="${i ? '' : 'is-on'}" data-gi="${i}" aria-label="Ver imagen ${i + 1}"><img src="${i === 0 && K.cut(p) ? K.cut(p) : I.img(s, 300)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
    </div>` : `<div class="v-noimg"><div><img src="${K.A}brand/logo-navy.png" alt="Inbasix Medical"><p>Pronto agregaremos fotos de este equipo.<br>Pídelas por WhatsApp y te las enviamos.</p></div></div>`;

  const selHTML = () => opts.map((o, i) => {
    const others = o.v.length - 1;
    return `<div class="v-sel__i"><button class="v-sel__h" type="button" aria-expanded="false"${o.v.length < 2 ? ' disabled style="cursor:default"' : ''}><div><small>${esc(cap(o.n))}</small><strong data-selv="${i}">${esc(sel[i])}</strong></div>${others ? `<em>${others} más</em>${IC.chev}` : ''}</button>
      ${others ? `<div class="v-sel__l">${o.v.map(val => { const t = sel.slice(); t[i] = val; const v = findV(t); return `<button type="button" data-opt="${i}" data-val="${esc(val)}" class="${sel[i] === val ? 'is-on' : ''}${v ? '' : ' is-x'}"><em style="font-style:normal">${esc(val)}</em><span>${v ? (v.p ? money(v.p) : 'Cotizar') : 'No disponible'}</span></button>`; }).join('')}</div>` : ''}</div>`;
  }).join('') + `<div class="v-sel__i"><div class="v-sel__h" style="cursor:default"><div><small>Marca</small><strong><a href="${K.plp({ brand: K.vendorSlug(p.vendor) })}" style="color:var(--cyan-d)">${esc(vn)}</a></strong></div></div></div>
    <div class="v-sel__i"><div class="v-sel__h" style="cursor:default"><div><small>Categoría</small><strong><a href="${K.plp({ cat: grp ? grp.k : mainCol })}" style="color:var(--cyan-d)">${esc(grp ? grp.t : K.catName(mainCol))}</a></strong></div></div></div>`;
  function cap(s) { s = (s || '').toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); }

  const ctas = v => v.p
    ? `<button class="k-btn k-btn--block" type="button" data-add="${p.h}" data-vid="${v.id}">Agregar al carrito</button><button class="k-btn k-btn--ghost k-btn--block" type="button" data-buy="${p.h}" data-vid="${v.id}">Comprar ahora</button>`
    : `<button class="k-btn k-btn--block" type="button" data-add="${p.h}" data-vid="${v.id}">Cotizar</button><a class="k-btn k-btn--ghost k-btn--block" href="${qWA}" target="_blank" rel="noopener">Hablar con un asesor</a>`;
  const boxHTML = () => `
    <div class="v-box" data-box>
      <div class="v-box__h"><h1>${esc(p.t)}</h1><div class="v-box__ic"><button type="button" data-share aria-label="Compartir">${IC.share}</button></div></div>
      <p class="v-box__m">${esc(vn)} • ${esc(tl)}</p>
      <div class="v-panel">
        <div class="v-pr"><div data-price>${priceBig(cur)}</div><p class="v-pr__lab" data-plab>${cur.p ? 'Compra en línea' : 'Cotización formal en menos de 24 h'}</p></div>
        <p class="v-pr__sub" data-psub>${subLine(cur)}</p>
        <a class="v-pr__row" href="#fin">${IC.cash}<span>Financia a 12–60 meses</span>${IC.right}</a>
      </div>
      <div class="v-panel v-mini"><div><b>Envío a todo México</b><span>Entrega estimada de 3 a 10 días hábiles</span></div><span class="k-chip" aria-hidden="true">${IC.truck}</span></div>
      <div class="v-panel v-panel--tint v-mini"><div><b>¿Renuevas tu equipo?</b><span>Te ayudamos a vender el actual</span></div><a class="k-chip" href="${WA('Hola Inbasix, quiero vender mi equipo actual para comprar: ' + p.t)}" target="_blank" rel="noopener">${IC.swap}Cotizar</a></div>
      <div class="v-ctas" data-ctas>${ctas(cur)}</div>
      <p class="v-foot">${cur.p ? 'Precios en MXN. Pago seguro en inbasixmedical.com' : 'Te enviamos tu cotización formal en menos de 24 horas'} · <a href="${I.STORE}/pages/politicas-de-venta" target="_blank" rel="noopener">Políticas de venta</a></p>
    </div>`;
  function subLine(v) { return v.p ? `${v.c && v.c > v.p ? `<s>${money(v.c)}</s>` : ''}${opts.length ? 'Configuración seleccionada' : 'Precio del equipo'}` : 'Un ingeniero biomédico te envía tu propuesta formal'; }

  const FEATS = [[IC.shield, 'Garantía de fábrica', '12 meses, ampliable a 48'], [IC.cap, 'Capacitación', 'Botón por botón, incluida'], [IC.tool, 'Instalación profesional', 'En toda la república'],
    [IC.user, 'Asesoría', 'Con ingenieros biomédicos'], [IC.truck, 'Envío a todo México', '3 a 10 días hábiles'], [IC.gear, 'Servicio postventa', 'Después de la garantía']];
  const kv = [['Marca', `<a href="${K.plp({ brand: K.vendorSlug(p.vendor) })}">${esc(vn)}</a>`], ['Categoría', esc(tl)], ['Configuraciones', p.v.length > 1 ? `${p.v.length} disponibles` : 'Única'],
    ['Disponibilidad', quote0 ? 'Precio bajo cotización' : 'Compra en línea'], ['Entrega estimada', '3 a 10 días hábiles'], ['Garantía', '12 meses de fábrica'], ['Showrooms', 'CDMX · Guadalajara · Monterrey · Chihuahua'], ['Capacitación', 'Incluida']];

  const yts = (p.yt || []).filter(Boolean);
  const loopN = K.loopFor(p);
  const dots = [[62, 30], [30, 62], [78, 70], [45, 18], [20, 30], [70, 45]];

  root.innerHTML = `
  <div class="v-top"><section class="k-wrap">
    <nav class="v-crumb" aria-label="Ruta"><a href="coleccion.html">Productos</a><i>&gt;</i><a href="${K.plp({ brand: K.vendorSlug(p.vendor) })}">${esc(vn)}</a><i>&gt;</i><a href="${K.plp({ cat: grp ? grp.k : mainCol })}">${esc(grp ? grp.t : K.catName(mainCol))}</a><i>&gt;</i><span>${esc(K.cardName(p))}</span></nav>
    <div class="v-main">
      <div class="v-left">
        ${galHTML}
        <div class="v-mob-box"></div>
        <article class="v-art"><h2>Descripción general</h2><dl class="v-kv">${kv.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl></article>
        <article class="v-art v-feats"><h2>Lo que incluye tu equipo</h2><div class="k-scroller"><div class="k-track">${FEATS.map(([i, t, s]) => `<div><div class="v-feat">${i}<b>${t}</b><span>${s}</span></div></div>`).join('')}</div>${K.arrows()}</div></article>
        <article class="v-art v-chars"><h2>Características principales</h2>
          <div class="k-acc">
            <div class="k-acc__i is-open"><button class="k-acc__h" type="button" aria-expanded="true"><span>${IC.doc}Descripción del equipo</span>${IC.chev}</button><div class="k-acc__b"><div><div class="k-acc__in"><div class="v-desc" data-desc>${p.ex ? `<p>${esc(p.ex)}…</p>` : '<p>Cargando descripción…</p>'}</div><button class="v-more" type="button" data-desc-more hidden>Leer más ${IC.chev}</button></div></div></div></div>
            ${opts.length ? `<div class="k-acc__i"><button class="k-acc__h" type="button" aria-expanded="false"><span>${IC.sliders}Configuraciones disponibles</span>${IC.chev}</button><div class="k-acc__b"><div><div class="k-acc__in v-opts">${opts.map(o => `<div><b>${esc(o.n)}</b><ul>${o.v.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div></div></div></div>` : ''}
            <div class="k-acc__i"><button class="k-acc__h" type="button" aria-expanded="false"><span>${IC.card}Formas de pago</span>${IC.chev}</button><div class="k-acc__b"><div><div class="k-acc__in">Transferencia bancaria BBVA a nombre de IMPORTACIONES INBASIX S.A. de C.V., tarjeta de crédito o débito, crédito bancario y arrendamiento puro.</div></div></div></div>
            <div class="k-acc__i"><button class="k-acc__h" type="button" aria-expanded="false"><span>${IC.shield}Garantía y servicio postventa</span>${IC.chev}</button><div class="k-acc__b"><div><div class="k-acc__in">Garantía estándar del fabricante de 12 meses, con ampliación a 24, 36 o 48 meses. Después de la garantía te damos servicio postventa.</div></div></div></div>
            <div class="k-acc__i"><button class="k-acc__h" type="button" aria-expanded="false"><span>${IC.truck}Envío, instalación y capacitación</span>${IC.chev}</button><div class="k-acc__b"><div><div class="k-acc__in">Entrega estimada de 3 a 10 días hábiles después de confirmado tu pedido, con envíos a todo México. Instalación profesional y capacitación botón por botón para tu personal en toda la república.</div></div></div></div>
          </div>
        </article>
      </div>
      <div class="v-right" data-right>
        ${boxHTML()}
        <div class="v-sel" data-sel>${selHTML()}</div>
        ${otherVendor.length ? `<div class="v-other"><h2>Descubre otros equipos ${esc(vn)}</h2><div class="v-other__l">${otherVendor.map(x => `<a class="v-ocard" href="${K.pdp(x.h)}"><span class="v-ocard__i"><img src="${K.pimg(x, 300)}" alt="" loading="lazy"></span><span class="v-ocard__b"><p>${esc(K.cardName(x))}</p><small>${I.isQuote(x) ? 'Precio' : I.priced(x).length > 1 ? 'Precio desde' : 'Precio'}</small>${K.priceHTML(x)}</span></a>`).join('')}</div>
          <a class="v-other__more" href="${K.plp({ brand: K.vendorSlug(p.vendor) })}">Ver todos los equipos ${esc(vn)}${IC.right}</a></div>` : ''}
        <ul class="v-vp">${[['Garantía de fábrica de 12 meses, ampliable a 48'], ['Capacitación botón por botón incluida'], ['Instalación profesional en toda la república'], ['Asesoría con ingenieros biomédicos'], ['Importación directa, sin intermediarios']].map(([t]) => `<li>${IC.checkC}${t}</li>`).join('')}</ul>
      </div>
    </div>
  </section></div>

  <div class="k-wrap v-gap" id="fin">
    <section class="v-finb">
      <div class="v-finb__c"><h2>Financia tu equipo de 12 a 60 meses</h2><p>Elige entre arrendamiento puro y crédito simple. Aprobación en 24 horas.</p><a class="k-btn" data-sim-go target="_blank" rel="noopener" href="#">Solicitar financiamiento</a></div>
      <div class="v-finb__art">${sameCol.slice(0, 3).map(x => `<img src="${I.img(x.img[0], 400)}" alt="" loading="lazy">`).join('')}</div>
      <div data-sim-slot></div>
    </section>
  </div>

  <section class="v-media v-gap" aria-labelledby="h-media">
    <div class="k-wrap">
      <h2 id="h-media">Míralo en acción</h2>
      <div class="v-media__c">
        <div class="v-media__l">
          <div class="v-tog" role="tablist"><button type="button" class="is-on" data-mt="v" role="tab" aria-selected="true"><i></i>VIDEO</button>${imgs.length ? `<button type="button" data-mt="f" role="tab" aria-selected="false"><i></i>FOTOS</button>` : ''}</div>
          <div class="v-schem"><img src="${imgs.length ? K.pimg(p, 600) : K.A + 'brand/logo-navy.png'}" alt="" loading="lazy">${(yts.length ? yts : [0]).slice(0, 6).map((_, i) => `<button type="button" class="v-dot${i ? '' : ' is-on'}" style="left:${dots[i][0]}%;top:${dots[i][1]}%" data-mi="${i}" aria-label="Ver video ${i + 1}">${i + 1}</button>`).join('')}</div>
        </div>
        <div class="v-media__r"><div class="v-player" data-player></div>
          <p class="v-disc">${yts.length ? '*Videos del canal oficial de Inbasix Medical en YouTube.' : '*Video de referencia de la línea de equipos que distribuye Inbasix Medical.'}</p></div>
      </div>
    </div>
  </section>

  <div class="k-wrap v-gap">
    <section class="v-sell" aria-labelledby="h-sell">
      <div class="v-sell__img"><img src="${(() => { const x = sameCol.find(y => K.PROD.has(y.h)) || sameCol[3] || sameCol[0] || p; return x.img.length ? K.pimg(x, 700) : K.A + 'brand/logo-navy.png'; })()}" alt="" loading="lazy"></div>
      <div class="v-sell__c"><h2 id="h-sell">¡Vende tu equipo y estrena otro!</h2>
        <form class="v-sell__f" data-sell novalidate>
          <div class="v-select"><select required name="tipo" aria-label="Tipo de equipo"><option value="" disabled selected hidden>Selecciona el tipo de equipo</option>${['Ultrasonido', 'Aparatología estética', 'Rayos X', 'Tomógrafo', 'Resonancia magnética', 'Arco en C', 'Quirófano', 'Equipo veterinario', 'Otro'].map(x => `<option>${x}</option>`).join('')}</select></div>
          <div class="v-select"><select required name="marca" aria-label="Marca"><option value="" disabled selected hidden>Selecciona la marca</option>${[...new Set(I.P.map(x => K.vendorName(x.vendor)))].sort().concat('Otra').map(x => `<option>${esc(x)}</option>`).join('')}</select></div>
          <div class="v-select"><select required name="anio" aria-label="Año"><option value="" disabled selected hidden>Selecciona el año</option>${Array.from({ length: 22 }, (_, i) => 2026 - i).map(y => `<option>${y}</option>`).join('')}<option>Antes de 2005</option></select></div>
          <button class="k-btn k-btn--block" type="submit" disabled>Cotizar venta</button>
        </form></div>
    </section>
  </div>

  ${interest.length ? `<section class="k-wrap v-gap v-lat" aria-labelledby="h-int"><h2 class="v-h2" id="h-int">También te podría interesar</h2><div class="k-scroller"><div class="k-track">${interest.map(x => `<div>${K.pcard(x)}</div>`).join('')}</div>${K.arrows()}</div></section>` : ''}
  ${similarPrice.length ? `<section class="k-wrap v-gap v-lat" aria-labelledby="h-sim"><h2 class="v-h2" id="h-sim">${mp != null ? 'Equipos con precio similar' : 'Más equipos de ' + esc(tl.toLowerCase())}</h2><div class="k-scroller"><div class="k-track">${similarPrice.map(x => `<div>${K.pcard(x)}</div>`).join('')}</div>${K.arrows()}</div></section>` : ''}
  ${sameVendor.length > 1 ? `<section class="k-wrap v-gap v-related" aria-labelledby="h-rel"><h2 class="v-h2" id="h-rel">Otros modelos ${esc(vn)}</h2><div class="k-scroller"><div class="k-track">${sameVendor.slice(0, 16).map(x => `<div><a class="v-rel" href="${K.pdp(x.h)}">${esc(K.cardName(x).replace(/\s*-\s*.*$/, ''))}</a></div>`).join('')}</div>${K.arrows()}</div></section>` : ''}

  <section class="k-sec" aria-labelledby="h-tst"><div class="k-wrap"><h2 class="v-h2" id="h-tst">Lo que opinan nuestros clientes</h2></div><div class="k-wrap">${K.testiHTML()}</div></section>
  <section class="k-wrap k-sec" aria-labelledby="h-br"><h2 class="v-h2" id="h-br">Marcas que distribuimos</h2>${K.brandsHTML(brand && brand.slug)}</section>

  <div class="k-wrap v-gap"><p class="v-note">*Precios en pesos mexicanos sujetos a la configuración elegida. Las imágenes son de referencia del fabricante. Financiamiento sujeto a aprobación. Información dirigida exclusivamente al profesional de la salud.</p></div>

  <section class="k-wrap v-gap" aria-label="Más información">
    <div class="v-tabs" role="tablist" data-tabs="v-tabp"><button type="button" class="is-on" data-tab="faq" role="tab" aria-selected="true">Preguntas frecuentes</button><button type="button" data-tab="about" role="tab" aria-selected="false">Sobre Inbasix</button></div>
    <div id="v-tabp">
      <div data-pane="faq">${K.acc(K.FAQ)}</div>
      <div data-pane="about" hidden class="v-seo"><h3>${esc(I.shortName(p))} con Inbasix Medical</h3>
        <p>Inbasix Medical es importador directo de fábrica y distribuidor autorizado en México. Compra tu ${esc(tl.toLowerCase())} ${esc(vn)} con garantía de fábrica, capacitación botón por botón e instalación profesional en toda la república.</p>
        <p>Más de 45,000 médicos confían en Inbasix y tenemos 29 años de experiencia. Visita nuestros showrooms en CDMX, Guadalajara, Monterrey y Chihuahua, o escríbenos por <a href="https://wa.me/${I.WA}" target="_blank" rel="noopener">WhatsApp</a> para recibir tu cotización formal en menos de 24 horas.</p></div>
    </div>
  </section>

  <div class="v-sbar" data-sbar aria-hidden="true"><div class="v-sbar__in">
    <img src="${K.pimg(p, 200)}" alt="">
    <div class="v-sbar__t"><b>${esc(p.t)}</b><small>${esc(vn)} • ${esc(tl)}</small></div>
    <div class="v-sbar__p"><small data-sb-lab>${cur.p ? 'Precio' : 'Precio'}</small><b data-sb-price>${cur.p ? money(cur.p) : 'Bajo cotización'}</b></div>
    <button class="k-btn" type="button" data-add="${p.h}" data-vid="${cur.id}" data-sb-cta>${cur.p ? 'Agregar al carrito' : 'Cotizar'}</button>
  </div></div>`;

  /* mobile: move buy box under the gallery (benchmark mobile order) */
  const mobBox = $('.v-mob-box'), right = $('[data-right]');
  const mq = matchMedia('(max-width: 1023px)');
  const place = () => { const box = $('[data-box]'), s = $('[data-sel]'); if (mq.matches) { mobBox.append(box, s); mobBox.style.display = 'flex'; mobBox.style.flexDirection = 'column'; mobBox.style.gap = '24px'; } else { right.prepend(box, s); mobBox.style.display = 'none'; } };
  place(); mq.addEventListener('change', place);

  /* gallery */
  if (imgs.length) {
    let gi = 0; const t = $('[data-stage-t]'), cnt = $('[data-gcount]');
    const go = i => { gi = Math.max(0, Math.min(imgs.length - 1, i)); t.style.transform = `translateX(${-gi * 100}%)`; cnt.textContent = `${gi + 1} / ${imgs.length}`;
      $$('[data-gi]').forEach(b => b.classList.toggle('is-on', +b.dataset.gi === gi)); const on = $(`[data-gi="${gi}"]`); if (on) on.parentElement.scrollTo({ left: on.offsetLeft - on.parentElement.clientWidth / 2 + on.clientWidth / 2, behavior: 'smooth' });
      const pv = $('.v-nav--prev'), nx = $('.v-nav--next'); if (pv) { pv.hidden = gi === 0; nx.hidden = gi === imgs.length - 1; } };
    root.addEventListener('click', e => { const g = e.target.closest('[data-g]'); if (g) go(gi + +g.dataset.g); const th = e.target.closest('[data-gi]'); if (th) go(+th.dataset.gi); });
    let x0 = null; const st = $('[data-stage]');
    st.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true });
    st.addEventListener('touchend', e => { if (x0 == null) return; const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) go(gi + (d < 0 ? 1 : -1)); x0 = null; });
    st.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(gi + 1); if (e.key === 'ArrowLeft') go(gi - 1); }); st.tabIndex = 0;
  }

  /* variant selectors */
  function applyVariant() {
    const v = findV(sel); if (v) cur = v;
    $('[data-price]').innerHTML = priceBig(cur); $('[data-plab]').textContent = cur.p ? 'Compra en línea' : 'Cotización formal en menos de 24 h';
    $('[data-psub]').innerHTML = subLine(cur); $('[data-ctas]').innerHTML = ctas(cur);
    const sb = $('[data-sb-cta]'); sb.dataset.vid = cur.id; sb.textContent = cur.p ? 'Agregar al carrito' : 'Cotizar'; $('[data-sb-price]').textContent = cur.p ? money(cur.p) : 'Bajo cotización';
    const open = $$('.v-sel__i').map(x => x.classList.contains('is-open'));
    $('[data-sel]').innerHTML = selHTML(); $$('.v-sel__i').forEach((x, i) => open[i] && x.classList.add('is-open'));
  }
  root.addEventListener('click', e => {
    const hh = e.target.closest('button.v-sel__h'); if (hh) { const it = hh.parentElement; it.classList.toggle('is-open'); hh.setAttribute('aria-expanded', it.classList.contains('is-open')); return; }
    const o = e.target.closest('[data-opt]');
    if (o) { const i = +o.dataset.opt; sel[i] = o.dataset.val; if (!findV(sel)) { const alt = p.v.find(v => v.o[i] === sel[i]); if (alt) sel = opts.map((_, k) => alt.o[k]); } applyVariant(); return; }
    if (e.target.closest('[data-share]')) { const d = { title: p.t, url: location.href }; if (navigator.share) navigator.share(d).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(() => { const b = e.target.closest('[data-share]'); b.classList.add('is-on'); b.title = 'Enlace copiado'; }).catch(() => {}); }
  });

  /* description (sanitized) */
  I.body(p.h).then(d => {
    const el = $('[data-desc]'); if (!d || !d.body || d.text.trim().length < 3) { el.innerHTML = p.ex ? `<p>${esc(p.ex)}</p>` : `<p>Pide la ficha técnica completa de este equipo a un asesor por <a href="${qWA}" target="_blank" rel="noopener">WhatsApp</a>.</p>`; return; }
    const tpl = document.createElement('template'); tpl.innerHTML = d.body;
    tpl.content.querySelectorAll('script,style,iframe,link,meta,form,input,button,object,embed,noscript').forEach(n => n.remove());
    tpl.content.querySelectorAll('*').forEach(n => { [...n.attributes].forEach(a => { const k = a.name.toLowerCase(); if (!['href', 'src', 'alt', 'colspan', 'rowspan'].includes(k)) n.removeAttribute(a.name); if ((k === 'href' || k === 'src') && /^\s*javascript:/i.test(a.value)) n.removeAttribute(a.name); });
      if (n.tagName === 'A') { n.target = '_blank'; n.rel = 'noopener'; } if (n.tagName === 'IMG') { n.loading = 'lazy'; if (n.src && /cdn\.shopify/.test(n.src)) n.src = I.img(n.src.split('?')[0], 900); }
      if (/^H[1-2]$/.test(n.tagName)) { const h3 = document.createElement('h3'); h3.innerHTML = n.innerHTML; n.replaceWith(h3); } });
    tpl.content.querySelectorAll('p,span,div,strong').forEach(n => { if (!n.textContent.trim() && !n.querySelector('img')) n.remove(); });
    el.innerHTML = ''; el.appendChild(tpl.content);
    const first = el.firstElementChild; if (first && /^H3$/.test(first.tagName) && K.norm(p.t).includes(K.norm(first.textContent).slice(0, 12))) first.remove();
    if (el.scrollHeight > 640) { el.classList.add('is-clamp'); const b = $('[data-desc-more]'); b.hidden = false; b.onclick = () => { const c = el.classList.toggle('is-clamp'); b.innerHTML = (c ? 'Leer más ' : 'Leer menos ') + IC.chev; b.querySelector('svg').style.transform = c ? '' : 'rotate(180deg)'; }; }
  });

  /* financing */
  $('[data-sim-slot]').outerHTML = K.sim();
  const finArt = $('.v-finb__art'); if (finArt) finArt.style.display = 'none'; // sim replaces collage at all sizes (interactive real terms)
  K.wireSim(document);
  const simEl = $('[data-sim]'), sgo = $('[data-sim-go]'); const su = () => sgo.href = K.simWA(simEl).replace(encodeURIComponent('mi equipo.'), encodeURIComponent(p.t + '.')).replace(encodeURIComponent('meses.'), encodeURIComponent('meses para: ' + p.t + '.'));
  simEl.addEventListener('k:sim', su); su();

  /* media player */
  const player = $('[data-player]'); let mode = 'v', mi = 0, fi = 0;
  function renderPlayer() {
    if (mode === 'v') {
      if (yts.length) { const id = yts[mi]; player.innerHTML = `<img src="${K.ytThumb(id)}" alt="" loading="lazy"><button class="v-player__btn" type="button" data-ytload="${id}" aria-label="Reproducir video: ${esc(K.YT[id] || p.t)}"><span class="k-play">${IC.play}</span></button><span class="v-player__t">${esc(K.YT[id] || p.t)}</span>${yts.length > 1 ? `<span class="v-count">${mi + 1} / ${yts.length}</span><button class="v-nav v-nav--prev" type="button" data-mv="-1" aria-label="Video anterior"${mi ? '' : ' hidden'}>${IC.left}</button><button class="v-nav v-nav--next" type="button" data-mv="1" aria-label="Video siguiente"${mi < yts.length - 1 ? '' : ' hidden'}>${IC.right}</button>` : ''}`; }
      else { player.innerHTML = (K.RM ? `<img src="${K.vids(loopN).jpg}" alt="">` : K.loopVideo(loopN)) + `<span class="v-player__t">${esc(vn)} · ${esc(tl)}</span>`; I.watch(player); }
    } else {
      player.innerHTML = `<img src="${G(fi, 1200)}" alt="${esc(p.t)}" style="object-fit:contain;background:#fff;padding:16px"><span class="v-count">${fi + 1} / ${imgs.length}</span>${imgs.length > 1 ? `<button class="v-nav v-nav--prev" type="button" data-mf="-1" aria-label="Foto anterior"${fi ? '' : ' hidden'}>${IC.left}</button><button class="v-nav v-nav--next" type="button" data-mf="1" aria-label="Foto siguiente"${fi < imgs.length - 1 ? '' : ' hidden'}>${IC.right}</button>` : ''}`;
    }
    $$('.v-dot').forEach(d => d.classList.toggle('is-on', mode === 'v' && +d.dataset.mi === mi));
  }
  renderPlayer();
  $('.v-media').addEventListener('click', e => {
    const t = e.target.closest('[data-mt]'); if (t) { mode = t.dataset.mt; $$('[data-mt]').forEach(b => { b.classList.toggle('is-on', b === t); b.setAttribute('aria-selected', b === t); }); renderPlayer(); return; }
    const d = e.target.closest('[data-mi]'); if (d) { mode = 'v'; mi = +d.dataset.mi; $$('[data-mt]').forEach(b => b.classList.toggle('is-on', b.dataset.mt === 'v')); renderPlayer(); return; }
    const mv = e.target.closest('[data-mv]'); if (mv) { mi = Math.max(0, Math.min(yts.length - 1, mi + +mv.dataset.mv)); renderPlayer(); return; }
    const mf = e.target.closest('[data-mf]'); if (mf) { fi = Math.max(0, Math.min(imgs.length - 1, fi + +mf.dataset.mf)); renderPlayer(); return; }
    const yl = e.target.closest('[data-ytload]'); if (yl) { player.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(yl.dataset.ytload)}?autoplay=1&rel=0" title="${esc(K.YT[yl.dataset.ytload] || p.t)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`; }
  });

  /* sell widget → WhatsApp */
  const sf = $('[data-sell]');
  sf.addEventListener('change', () => { sf.querySelector('button').disabled = !sf.checkValidity(); });
  sf.addEventListener('submit', e => { e.preventDefault(); if (!sf.checkValidity()) return; const f = new FormData(sf);
    window.open(WA(`Hola Inbasix, quiero vender mi equipo:\n• Tipo: ${f.get('tipo')}\n• Marca: ${f.get('marca')}\n• Año: ${f.get('anio')}\nMe interesa: ${p.t}`), '_blank', 'noopener'); });

  /* sticky bottom bar once the buy-box CTAs leave the viewport */
  const sbar = $('[data-sbar]');
  const io = new IntersectionObserver(([en]) => { const on = !en.isIntersecting && en.boundingClientRect.top < 0; sbar.classList.toggle('is-on', on); sbar.setAttribute('aria-hidden', !on); document.body.classList.toggle('has-sbar', on); });
  io.observe($('[data-ctas]'));

  K.carousel(document);
  I.watch(document);
})();
