/* God's Nutrition v2 — page rendering + motion. Commerce (cart, popup, checkout) lives in assets/gn/core.js. */
(function () {
  const G = window.GNC; if (!G) return;
  const EN = G.LANG === 'en';
  const t = (es, en) => (EN ? en : es);
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const B = G.base;
  const A = p => B + p;
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ARR = '<svg class="arr" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 6h10M7 2l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>';
  const STAR = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M7 .8l1.9 4 4.3.5-3.2 3 .9 4.3L7 10.4l-3.9 2.2.9-4.3-3.2-3 4.3-.5z" fill="currentColor"/></svg>';
  const STAR_O = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M7 .8l1.9 4 4.3.5-3.2 3 .9 4.3L7 10.4l-3.9 2.2.9-4.3-3.2-3 4.3-.5z" fill="none" stroke="currentColor" stroke-width="1"/></svg>';
  const stars = (r) => { const n = Math.round(r); return `<span class="stars" aria-label="${r} ${t('de 5 estrellas', 'out of 5 stars')}">${Array.from({ length: 5 }, (_, i) => i < n ? STAR : STAR_O).join('')}</span>`; };
  const money = G.money;
  const per = (price, n) => '$' + (price / n).toFixed(2) + (EN ? ' MXN' : '');
  const nm = G.nm;
  const L = (p, k) => G.L(p, k);

  /* ---------- per-product editorial content (facts only) ---------- */
  const CHIP = { 'gods-whey-protein': '5 lb', 'gods-creatine-1kg': '1 kg', 'creatina': '500 g', 'ares': '90 caps', 'gods-omega-3': '180 caps', 'preventa-gods-demeter-450g': '450 g', 'gods-ceres-450g-p': '450 g', 'gods-full-protein-5-lbs': '5 lb', 'themis-vegan-protein-1-kg': '2 lb' };
  const SERV = { 'gods-whey-protein': ['35 g', '35 g'], 'gods-creatine-1kg': ['6 g', '6 g'], 'creatina': ['6 g', '6 g'], 'ares': ['1 cápsula', '1 capsule'], 'gods-omega-3': ['3 cápsulas', '3 softgels'], 'preventa-gods-demeter-450g': ['6 g', '6 g'], 'gods-ceres-450g-p': ['5 g', '5 g'], 'gods-full-protein-5-lbs': ['30 g', '30 g'], 'themis-vegan-protein-1-kg': ['31 g', '31 g'] };
  const LABEL = { 'gods-whey-protein': 'gods-whey-protein/informacion_nutrimental.png', 'gods-creatine-1kg': 'gods-creatine-1kg/Creatine1kg.jpg', 'creatina': 'creatina/Creatine500_2.jpg', 'ares': 'ares/Ares3.jpg', 'gods-omega-3': 'gods-omega-3/Omega3.jpg', 'preventa-gods-demeter-450g': 'preventa-gods-demeter-450g/DEMETER.png', 'gods-ceres-450g-p': 'gods-ceres-450g-p/gods-CERES-1.jpg', 'gods-full-protein-5-lbs': 'gods-full-protein-5-lbs/Full3.jpg', 'themis-vegan-protein-1-kg': 'themis-vegan-protein-1-kg/Themis.jpg' };
  const PACK = { 'gods-whey-protein': 'gods-whey-protein/c2911b8d-dbd7-483b-b203-fe6c99684459.jpeg', 'gods-creatine-1kg': 'gods-creatine-1kg/Creatine.jpg', 'creatina': 'creatina/creatine-500g.jpg', 'ares': 'ares/ares.png', 'gods-omega-3': 'gods-omega-3/Gods-Omeg.png', 'preventa-gods-demeter-450g': null, 'gods-ceres-450g-p': 'gods-ceres-450g-p/Ceres-1.png', 'gods-full-protein-5-lbs': 'gods-full-protein-5-lbs/Full1.jpg', 'themis-vegan-protein-1-kg': 'themis-vegan-protein-1-kg/themis-1.png' };
  const CATPHOTO = { proteinas: 'stock/goal-musculo.jpg', creatinas: 'stock/goal-recomposicion.jpg', 'pre-entreno': 'stock/goal-rendimiento.jpg', bienestar: 'stock/goal-bienestar.jpg' };
  const DETAIL = { 'gods-whey-protein': 'texture-scoop.jpg', 'gods-creatine-1kg': 'creatine-fruit.jpg', 'creatina': 'creatine-fruit.jpg', 'ares': 'ares-dark.jpg', 'gods-omega-3': 'omega-softgels.jpg', 'preventa-gods-demeter-450g': 'hero-woman.jpg', 'gods-ceres-450g-p': 'texture-scoop.jpg', 'gods-full-protein-5-lbs': 'texture-scoop.jpg', 'themis-vegan-protein-1-kg': 'texture-scoop.jpg' };
  const UPS = { 'gods-whey-protein': 'gods-creatine-1kg', 'gods-creatine-1kg': 'gods-whey-protein', 'creatina': 'gods-whey-protein', 'ares': 'gods-creatine-1kg', 'gods-omega-3': 'gods-whey-protein', 'preventa-gods-demeter-450g': 'gods-omega-3', 'gods-ceres-450g-p': 'gods-omega-3', 'gods-full-protein-5-lbs': 'gods-whey-protein', 'themis-vegan-protein-1-kg': 'gods-whey-protein' };
  const WHEN = {
    proteinas: [['Después de entrenar', 'O cuando te falte proteína en el día', 'Con agua o leche, como prefieras'], ['After training', 'Or whenever your day is short on protein', 'With water or milk, your call']],
    creatinas: [['Todos los días a la misma hora', 'Entrenes o no ese día', 'Natural se mezcla con cualquier bebida'], ['Every day at the same time', 'Whether you train that day or not', 'Unflavored mixes into any drink']],
    'pre-entreno': [['30–45 minutos antes de entrenar', 'Con un vaso de agua', 'No más de 1 cápsula al día'], ['30–45 minutes before training', 'With a glass of water', 'No more than 1 capsule a day']],
    bienestar: [['Una vez al día', 'Con tus alimentos o en agua, según la etiqueta', 'A la misma hora para no olvidarla'], ['Once a day', 'With food or in water, as the label says', 'Same time so you don’t forget']]
  };
  const C = {
    'gods-whey-protein': {
      h: ['Proteína que se disuelve sin grumos.', 'Protein that mixes without clumps.'],
      f: [[['28 g de proteína', 'En cada medida de 35 g, de suero de leche concentrada.'], ['28 g protein', 'In every 35 g scoop, from whey protein concentrate.']],
          [['1 g de carbohidratos', 'Y 0.5 g de grasa por porción, según la etiqueta.'], ['1 g carbs', 'And 0.5 g fat per serving, per the label.']],
          [['2.6 g de leucina', 'Por porción, dentro del perfil de aminoácidos impreso.'], ['2.6 g leucine', 'Per serving, from the printed amino acid profile.']],
          [['7 sabores', 'De Café Caramelo a Piña Colada, con agua o leche.'], ['7 flavors', 'From Caramel Coffee to Piña Colada, with water or milk.']]],
      card: [['Fórmula 2026 de Whey, en la misma bolsa de 5 lb.', '64 porciones de 35 g en 2.27 kg, con la tabla nutrimental completa en la ficha.'], ['The 2026 Whey Protein formula, in the same 5 lb bag.', '64 servings of 35 g in 2.27 kg, with the full nutrition table on this page.']]
    },
    'gods-creatine-1kg': {
      h: ['Creatina monohidratada, en el formato que más rinde.', 'Creatine monohydrate in the format that lasts longest.'],
      f: [[['5 g por porción', 'De creatina monohidratada en cada medida de 6 g.'], ['5 g per serving', 'Of creatine monohydrate in every 6 g scoop.']],
          [['166 porciones', 'Un bote de 1 kg, más de cinco meses a una toma diaria.'], ['166 servings', 'One 1 kg tub, over five months at one scoop a day.']],
          [['5 sabores + natural', 'Mora Azul, Fresa Kiwi, Mango, Manzana Verde o sin sabor.'], ['5 flavors + unflavored', 'Blueberry, Strawberry Kiwi, Mango, Green Apple or plain.']],
          [['0 mg de sodio', 'Y 22 kcal por porción, según la etiqueta.'], ['0 mg sodium', 'And 22 kcal per serving, per the label.']]],
      card: [['La misma fórmula que la de 500 g, al doble de porciones.', '166 porciones contra 83: el precio por porción baja.'], ['The same formula as the 500 g, with twice the servings.', '166 servings versus 83: the price per serving drops.']]
    },
    'creatina': {
      h: ['5 g de creatina micronizada, en bote de 500 g.', '5 g of micronized creatine in a 500 g tub.'],
      f: [[['5 g por porción', 'De creatina monohidratada micronizada en cada medida de 6 g.'], ['5 g per serving', 'Of micronized creatine monohydrate in every 6 g scoop.']],
          [['83 porciones', 'Casi tres meses a una toma diaria.'], ['83 servings', 'Almost three months at one scoop a day.']],
          [['5 sabores + natural', 'El formato para probar tu sabor favorito.'], ['5 flavors + unflavored', 'The format to try your favorite flavor.']],
          [['Micronizada', 'Partícula fina para que se disuelva mejor en agua.'], ['Micronized', 'Fine particles so it mixes better in water.']]],
      card: [['¿Primera vez con creatina? Empieza aquí.', 'Si ya sabes tu sabor, el bote de 1 kg trae el doble de porciones.'], ['First time with creatine? Start here.', 'Once you know your flavor, the 1 kg tub has twice the servings.']]
    },
    'ares': {
      h: ['Pre-entreno en cápsula. Sin polvos, sin medidas.', 'Pre-workout in a capsule. No powder, no scoops.'],
      f: [[['200 mg de cafeína', 'Cafeína anhidra en cada cápsula de 750 mg.'], ['200 mg caffeine', 'Caffeine anhydrous in every 750 mg capsule.']],
          [['200 mg de L-teanina', 'En la misma cápsula, junto con la cafeína.'], ['200 mg L-theanine', 'In the same capsule, alongside the caffeine.']],
          [['200 mg de Panax ginseng', 'El tercer ingrediente activo de la fórmula.'], ['200 mg Panax ginseng', 'The third active ingredient in the formula.']],
          [['90 cápsulas', 'Sin sabor ni shaker: cabe en tu mochila.'], ['90 capsules', 'No flavor, no shaker: fits in your gym bag.']]],
      card: [['Una cápsula, 30–45 minutos antes de entrenar.', 'No excedas 1 cápsula al día. Contiene cafeína.'], ['One capsule, 30–45 minutes before training.', 'Do not exceed 1 capsule a day. Contains caffeine.']]
    },
    'gods-omega-3': {
      h: ['Omega-3 de aceite de salmón, con la dosis clara.', 'Omega-3 from salmon oil, with a clear dose.'],
      f: [[['1200 mg de EPA', 'Por porción de 3 cápsulas blandas.'], ['1200 mg EPA', 'Per 3-softgel serving.']],
          [['600 mg de DHA', 'En la misma porción de 3 cápsulas.'], ['600 mg DHA', 'In the same 3-softgel serving.']],
          [['3000 mg de aceite de salmón', 'Con vitamina E (6 mg por porción).'], ['3000 mg salmon oil', 'With vitamin E (6 mg per serving).']],
          [['180 cápsulas blandas', '60 porciones: dos meses a una porción diaria.'], ['180 softgels', '60 servings: two months at one serving a day.']]],
      card: [['3 cápsulas al día, con alimentos.', '1200 mg de EPA y 600 mg de DHA por porción.'], ['3 softgels a day, with food.', '1200 mg EPA and 600 mg DHA per serving.']]
    },
    'preventa-gods-demeter-450g': {
      h: ['Inositol 40:1, en polvo y con sabor sutil.', '40:1 inositol, as a lightly flavored powder.'],
      f: [[['4000 mg de myo-inositol', 'Con 100 mg de D-chiro-inositol: proporción 40:1.'], ['4000 mg myo-inositol', 'With 100 mg D-chiro-inositol: a 40:1 ratio.']],
          [['1000 mg de L-carnitina', 'L-carnitina tartrato en cada porción de 6 g.'], ['1000 mg L-carnitine', 'L-carnitine tartrate in every 6 g serving.']],
          [['Magnesio y zinc', '51 mg de magnesio y 20 mg de zinc por porción.'], ['Magnesium and zinc', '51 mg magnesium and 20 mg zinc per serving.']],
          [['400 µg de metilfolato', '5-MTHF, la forma activa del folato.'], ['400 µg methylfolate', '5-MTHF, the active form of folate.']]],
      card: [['90 porciones en un bote de 450 g.', 'Una medida de 6 g en 250 ml de agua, una vez al día.'], ['90 servings in a 450 g tub.', 'One 6 g scoop in 250 ml of water, once a day.']]
    },
    'gods-ceres-450g-p': {
      h: ['Fibra, glutamina y probióticos, sabor piña.', 'Fiber, glutamine and probiotics, pineapple flavor.'],
      f: [[['2.7 g de fibra', 'De psyllium (Plantago) en cada porción de 5 g.'], ['2.7 g fiber', 'From psyllium (Plantago) in every 5 g serving.']],
          [['1.7 g de glutamina', 'En la misma porción.'], ['1.7 g glutamine', 'In the same serving.']],
          [['Bacillus coagulans', '112 mg por porción, más enzimas proteasa y peptidasa.'], ['Bacillus coagulans', '112 mg per serving, plus protease and peptidase enzymes.']],
          [['6.8 kcal', 'Por porción, sabor piña.'], ['6.8 kcal', 'Per serving, pineapple flavor.']]],
      card: [['Mézclalo y tómalo de inmediato.', 'Una medida de 5 g en 250 ml de agua.'], ['Mix it and drink it right away.', 'One 5 g scoop in 250 ml of water.']]
    },
    'gods-full-protein-5-lbs': {
      h: ['Proteína de leche y suero, textura tipo malteada.', 'Milk and whey protein with a shake-like texture.'],
      f: [[['21 g de proteína', 'Por porción de 30 g, de leche y suero de leche.'], ['21 g protein', 'Per 30 g serving, from milk and whey.']],
          [['75 porciones', 'En 2.27 kg.'], ['75 servings', 'In 2.27 kg.']],
          [['Con lactasa añadida', 'Según la lista de ingredientes.'], ['With added lactase', 'Per the ingredient list.']],
          [['3 sabores', 'Vainilla, Fresa y Chocolate.'], ['3 flavors', 'Vanilla, Strawberry and Chocolate.']]],
      card: [['Agotada por ahora.', 'Déjanos tu correo y te avisamos cuando vuelva.'], ['Sold out for now.', 'Leave your email and we’ll tell you when it’s back.']]
    },
    'themis-vegan-protein-1-kg': {
      h: ['Proteína vegetal de chícharo y arroz.', 'Plant protein from pea and rice.'],
      f: [[['23 g de proteína', 'Vegetal, por porción de 31 g.'], ['23 g protein', 'Plant-based, per 31 g serving.']],
          [['Sin lácteos', 'Chícharo + arroz como fuentes de proteína.'], ['Dairy-free', 'Pea + rice as protein sources.']],
          [['1.5 g de carbohidratos', 'Y 1 g de fibra por porción.'], ['1.5 g carbs', 'And 1 g fiber per serving.']],
          [['Chocolate o vainilla', 'Mézclala con agua o bebida vegetal.'], ['Chocolate or vanilla', 'Mix with water or plant milk.']]],
      card: [['Agotada por ahora.', 'Déjanos tu correo y te avisamos cuando vuelva.'], ['Sold out for now.', 'Leave your email and we’ll tell you when it’s back.']]
    }
  };
  const ci = (p) => C[p.slug] || C['gods-whey-protein'];
  const ICONS = [
    '<svg viewBox="0 0 48 48"><path d="M10 20h24v6a12 12 0 0 1-24 0z"/><path d="M34 22h5"/><path d="M16 13c0-3 3-3 3-6M24 13c0-3 3-3 3-6"/></svg>',
    '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16"/><path d="M24 14v10l7 4"/></svg>',
    '<svg viewBox="0 0 48 48"><path d="M18 6h12M20 6v12L10 36a4 4 0 0 0 4 6h20a4 4 0 0 0 4-6L28 18V6"/><path d="M14 30h20"/></svg>',
    '<svg viewBox="0 0 48 48"><rect x="12" y="10" width="24" height="32" rx="4"/><path d="M10 6h28v4H10zM18 22h12M18 28h12M18 34h7"/></svg>'
  ];
  const BAD = /\b(sop|ovario|menstru|regla|acn[eé]|colitis|depresi|ansiedad|tdah|inflam|cabello|taquicard|baj[eéa] de peso|bajar de peso|grasa corporal|hormon|ciclo|fertil|embaraz|birdman|ntlab|cur[aó]|enfermedad|m[eé]dic)/i;
  const safeRevs = p => (p.reviews || []).filter(r => !BAD.test(r.t || ''));
  const prodBy = s => G.bySlug[s];
  const PRIMARY = {};
  const cutFor = (p, i) => A(p.img[i == null ? (PRIMARY[p.slug] || 0) : i] || p.img[0]);

  /* ---------- header ---------- */
  const hdr = $('[data-hdr-el]');
  const page = document.body.dataset.page;
  function hdrState() {
    if (!hdr) return;
    const y = window.scrollY;
    const lim = page === 'shop' ? 260 : 40; // glass as soon as content scrolls under the header (avoids text overlapping the nav)
    hdr.classList.toggle('is-glass', y > lim);
  }
  function menuRows() {
    const box = $('[data-menu-rows]'); if (!box) return;
    box.innerHTML = G.P.map(p => `<a class="menu__row" href="${G.pdp(p)}"><span class="menu__th"><img src="${cutFor(p)}" alt="" loading="lazy"></span><span><span class="menu__sm">${esc(CHIP[p.slug] || '')} · ${esc(L(p, 'tag'))}</span><span class="menu__nm" style="display:block">${esc(nm(p))}</span></span>${p.stock === false ? `<span class="pill pill--out">${t('Agotado', 'Sold out')}</span>` : p.badge ? `<span class="pill">${esc(p.badge[EN ? 1 : 0])}</span>` : '<span></span>'}</a>`).join('');
  }
  function menu() {
    if (!hdr) return;
    const btns = $$('[data-menu-btn]');
    let hoverT;
    const set = (on) => { hdr.classList.toggle('is-open', on); btns.forEach(b => b.setAttribute('aria-expanded', on)); };
    btns.forEach(b => b.addEventListener('click', e => { e.stopPropagation(); set(!hdr.classList.contains('is-open')); }));
    const desk = $('.hdr__nav [data-menu-btn]');
    const mq = window.matchMedia('(hover: hover) and (min-width: 901px)');
    if (desk) {
      desk.addEventListener('mouseenter', () => { if (mq.matches) { clearTimeout(hoverT); set(true); } });
      [desk, $('.menu')].forEach(el => el && el.addEventListener('mouseleave', () => { if (mq.matches) hoverT = setTimeout(() => set(false), 220); }));
      $('.menu').addEventListener('mouseenter', () => clearTimeout(hoverT));
    }
    document.addEventListener('click', e => { if (!e.target.closest('.menu') && !e.target.closest('[data-menu-btn]')) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }
  // keep ?p= / ?c= when switching language
  $$('[data-alt]').forEach(a => { const base = a.getAttribute('href').split('#')[0].split('?')[0]; a.setAttribute('href', base + location.search + location.hash); });

  /* ---------- reveal ---------- */
  function reveal() {
    const els = $$('[data-rv]');
    if (RM || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(e => io.observe(e));
  }

  /* ---------- footer reveal + newsletter + lightbox ---------- */
  function footer() {
    const f = $('[data-foot]'); if (!f) return;
    const fit = () => f.classList.toggle('is-reveal', window.innerWidth >= 900 && f.offsetHeight < window.innerHeight - 24);
    fit(); window.addEventListener('resize', fit);
    const nl = $('[data-nl]');
    if (nl) nl.addEventListener('submit', e => { e.preventDefault(); const v = nl.querySelector('input').value; if (!/\S+@\S+\.\S+/.test(v)) { nl.querySelector('input').focus(); return; } document.dispatchEvent(new CustomEvent('gn:lead', { detail: { lead: { email: v }, source: 'newsletter' } })); nl.hidden = true; $('[data-nl-ok]').hidden = false; });
  }
  const lbx = $('[data-lbx]');
  const openLbx = (src, alt) => { if (!lbx) return; const i = lbx.querySelector('img'); i.src = src; i.alt = alt || ''; lbx.classList.add('is-on'); document.documentElement.classList.add('gn-lock'); };
  if (lbx) {
    lbx.addEventListener('click', e => { if (e.target === lbx || e.target.closest('[data-lbx-x]')) { lbx.classList.remove('is-on'); document.documentElement.classList.remove('gn-lock'); } });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lbx.classList.contains('is-on')) { lbx.classList.remove('is-on'); document.documentElement.classList.remove('gn-lock'); } });
  }

  /* ---------- shared: product jar module ---------- */
  const jar = (p, second) => `<span class="jar"><span class="jar__in"><img src="${cutFor(p)}" alt="${esc(nm(p))}" loading="lazy">${second ? `<img src="${A(second)}" alt="" loading="lazy" aria-hidden="true">` : ''}</span></span>`;

  /* ================= HOME ================= */
  function home() {
    // hero media
    const hero = $('[data-hero]');
    const v = $('[data-hero-video]');
    const toggle = $('[data-vid-toggle]');
    const heroLight = () => hdr && hdr.classList.toggle('hero-light', hero.classList.contains('is-fb') || hero.classList.contains('hero--ink'));
    if (v) {
      if (RM) { v.removeAttribute('autoplay'); try { v.pause(); } catch (e) {} }
      v.addEventListener('playing', () => { hero.classList.remove('is-fb'); hero.classList.add('has-media'); heroLight(); });
      v.addEventListener('error', () => v.classList.add('is-off'), true);
      if (toggle) toggle.addEventListener('click', () => { if (v.paused) { v.play(); toggle.classList.remove('is-paused'); } else { v.pause(); toggle.classList.add('is-paused'); } });
    }
    heroLight(); new MutationObserver(heroLight).observe(hero, { attributes: true, attributeFilter: ['class'] });

    // S4 range
    const r = $('[data-range]');
    if (r) {
      const SHORTNAME = { 'gods-whey-protein': 'Whey Protein', 'gods-creatine-1kg': 'Creatine 1 kg', ares: 'Ares', 'gods-omega-3': 'Omega-3' };
      const SHORTTAG = { 'gods-whey-protein': ['28 g de proteína', '28 g of protein'], 'gods-creatine-1kg': ['5 g por porción', '5 g per serving'], ares: ['200 mg de cafeína', '200 mg of caffeine'], 'gods-omega-3': ['1200 mg de EPA', '1200 mg of EPA'] };
      const picks = [['gods-whey-protein', 'assets/img/cut/whey-choco-avellana.png'], ['gods-creatine-1kg', 'assets/img/cut/c1k-mango.png'], ['ares', null], ['gods-omega-3', null]];
      r.innerHTML = picks.map(([s, h], i) => { const p = prodBy(s); return `<a class="pmod" href="${G.pdp(p)}" data-rv="${i + 1}">${jar(p, h)}<span class="pmod__d"><span class="pmod__copy"><span class="chip">${esc(CHIP[s])}</span><h3>${esc(SHORTNAME[s] || nm(p))}</h3><p>${esc(SHORTTAG[s][EN ? 1 : 0])}</p></span><span class="btn">${t('Comprar', 'Shop now')}</span></span></a>`; }).join('');
      $$('.jar__in', r).forEach((el, i) => el.style.animationDelay = (-i * 2.2) + 's');
    }

    // S5 assembled temple (scroll-linked)
    const svg = $('[data-asm-svg]');
    if (svg) {
      const pcs = [
        ['<path class="ln" d="M60 92 L200 42 L340 92 Z"/>', 0, -140, -18],
        ['<rect class="ln" x="60" y="92" width="280" height="14"/><path class="ln" d="M60 112 H340"/>', 0, -90, 8],
        ['<rect class="ln" x="72" y="118" width="56" height="8"/><circle class="ln" cx="78" cy="133" r="6"/><circle class="ln" cx="122" cy="133" r="6"/>', -160, -40, -30],
        ['<rect class="ln" x="84" y="140" width="32" height="176"/><path class="ln" d="M92 146V310M100 146V310M108 146V310"/>', -200, 30, -14],
        ['<rect class="ln" x="76" y="316" width="48" height="8"/>', -120, 90, 20],
        ['<rect class="ln" x="272" y="118" width="56" height="8"/><circle class="ln" cx="278" cy="133" r="6"/><circle class="ln" cx="322" cy="133" r="6"/>', 160, -50, 26],
        ['<rect class="ln" x="284" y="140" width="32" height="176"/><path class="ln" d="M292 146V310M300 146V310M308 146V310"/>', 210, 20, 16],
        ['<rect class="ln" x="276" y="316" width="48" height="8"/>', 130, 100, -22],
        ['<rect class="ln" x="52" y="324" width="296" height="10"/>', -40, 140, 6],
        ['<rect class="ln" x="40" y="334" width="320" height="10"/>', 60, 170, -6]
      ];
      svg.innerHTML = pcs.map(([d, dx, dy, rr]) => `<g class="pc" style="--dx:${dx};--dy:${dy};--r:${rr}">${d}</g>`).join('');
      const card = $('[data-asm]');
      const upd = () => { const b = card.getBoundingClientRect(); const vh = window.innerHeight; const p = Math.max(0, Math.min(1, 1 - (b.top - vh * 0.12) / (vh * 0.7))); card.style.setProperty('--p', RM ? 1 : p.toFixed(3)); };
      upd(); scrollers.push(upd);
    }

    // S6 stack
    const sb = $('[data-stack]');
    if (sb) {
      const ss = sb.dataset.stack.split(',').map(prodBy).filter(Boolean);
      const sum = ss.reduce((a, p) => a + p.price, 0);
      const el = $('[data-stack-sum]'); if (el) el.remove(); sb.textContent = sb.textContent.trim() + ' · ' + money(sum);
      sb.addEventListener('click', () => { ss.forEach(p => G.add(p.slug, null, 1, { silent: true })); G.Cart.open(ss[0].slug); });
    }

    // S7 reviews carousel
    const track = $('[data-car-track]');
    if (track) {
      const revs = G.reviews.filter(r => (r.es || '').length < 240 && !BAD.test(r.es)).slice(0, 8);
      track.innerHTML = revs.map((r, i) => { const p = prodBy(r.slug); const q = EN && r.en ? r.en : r.es; return `<article class="rslide${i === 0 ? ' is-on' : ''}" data-i="${i}" aria-roledescription="${t('reseña', 'review')}">
        <div class="rslide__q">${stars(r.r)}<blockquote>“${esc(q)}”</blockquote>${EN ? `<p class="rslide__note">${r.en ? 'Translated from Spanish' : 'Original in Spanish'}</p>` : ''}
          <p class="rslide__meta">${r.ph ? `<img class="rav" src="${A(r.ph)}" alt="" loading="lazy">` : ''}<b style="font-weight:500">${esc(r.n)}</b>${r.v ? `<span class="mono">● ${t('Compra verificada', 'Verified purchase')} · godsnutrition.com.mx</span>` : ''}</p></div>
        ${p ? `<a class="rslide__p" href="${G.pdp(p)}" tabindex="-1"><img src="${cutFor(p)}" alt="" loading="lazy"><span>${esc(nm(p))}</span></a>` : '<div class="rslide__p"></div>'}</article>`; }).join('');
      const slides = $$('.rslide', track); const who = $('[data-car-who]');
      let cur = 0;
      const go = (i) => {
        cur = (i + slides.length) % slides.length;
        slides.forEach((s, k) => s.classList.toggle('is-on', k === cur));
        const w = slides[0].offsetWidth, gap = parseFloat(getComputedStyle(track).gap) || 0;
        track.style.transform = `translateX(${-(cur * (w + gap) + w / 2)}px)`;
        const r = revs[cur], p = prodBy(r.slug);
        who.innerHTML = `<span class="car__nm">${esc(r.n.split(/[ .]/)[0])}</span>${p ? `<img src="${cutFor(p)}" alt="${esc(nm(p))}">` : ''}`;
      };
      $('[data-car-prev]').addEventListener('click', () => go(cur - 1));
      $('[data-car-next]').addEventListener('click', () => go(cur + 1));
      track.addEventListener('click', e => { const s = e.target.closest('.rslide'); if (s && !s.classList.contains('is-on')) { e.preventDefault(); go(+s.dataset.i); } });
      let x0 = null; track.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
      track.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1)); x0 = null; });
      go(0); window.addEventListener('resize', () => go(cur));
    }

    // S9 strip
    const ugc = $('[data-ugc]');
    if (ugc) {
      const ph = (cls, photo, cut) => `<div class="ugc__t ${cls} ph is-fb"><img class="ph-media" src="${A('assets/photo/' + photo)}" alt="" loading="lazy" onload="this.parentNode.classList.remove('is-fb')" onerror="this.remove()"><img class="ph-fb" src="${A(cut)}" alt="" loading="lazy"></div>`;
      const qs = G.reviews.filter(r => (r.es || '').length < 150 && !BAD.test(r.es));
      const qc = (r) => { const p = prodBy(r.slug); return `<a class="qcard" href="${p ? G.pdp(p) : 'coleccion.html'}">${stars(r.r)}<p>“${esc(EN && r.en ? r.en : r.es)}”</p><small>${esc(r.n)} · ${esc(p ? nm(p) : r.product)}</small></a>`; };
      ugc.innerHTML = [
        ph('ugc__t--c', '../stock/athlete-a.jpg', 'assets/img/cut/whey-cookies-and-cream.png'),
        ph('ugc__t--p', '../stock/athlete-b.jpg', 'assets/img/cut/c1k-manzana-verde.png'),
        ph('ugc__t--p', 'creatine-fruit.jpg', 'assets/img/cut/c1k-fresa-kiwi.png'),
        `<div class="ugc__col">${ph('ugc__t--s', '../stock/gym-interior.jpg', 'assets/img/cut/omega.png')}${qs[0] ? qc(qs[0]) : ''}</div>`,
        ph('ugc__t--p', '../stock/athlete-c.jpg', 'assets/img/cut/ares.png'),
        ph('ugc__t--p', '../stock/athlete-d.jpg', 'assets/img/cut/whey-pina-colada.png'),
        `<div class="ugc__col">${qs[1] ? qc(qs[1]) : ''}${ph('ugc__t--s', 'omega-softgels.jpg', 'assets/img/cut/ceres.png')}</div>`
      ].join('');
      const sec = ugc.parentNode;
      const upd = () => {
        const b = sec.getBoundingClientRect(); const vh = window.innerHeight;
        if (b.bottom < -200 || b.top > vh + 200) return;
        const max = Math.max(0, ugc.scrollWidth - window.innerWidth + 32);
        const x = Math.min(max, Math.max(-120, (vh - b.top) * 0.5 - 160));
        ugc.style.transform = `translate3d(${-x}px,0,0)`;
      };
      if (!RM) { upd(); scrollers.push(upd); }
    }
  }

  /* ================= SHOP ================= */
  function shop() {
    const q = new URLSearchParams(location.search);
    const cat = G.cats.find(c => c.id === q.get('c'));
    const list = cat ? G.P.filter(p => p.cat === cat.id) : G.P;
    if (cat) {
      $('[data-chero-h]').textContent = cat[G.LANG];
      $('[data-chero-p]').textContent = cat[G.LANG + '_d'];
      const im = $('[data-chero-img]'); if (im && CATPHOTO[cat.id]) im.src = A('assets/' + CATPHOTO[cat.id]);
      document.title = `${cat[G.LANG]} — God’s Nutrition`;
    }
    // filters
    const f = $('[data-filters]');
    f.innerHTML = [`<a class="fchip${!cat ? ' is-on' : ''}" href="coleccion.html#productos"${!cat ? ' aria-current="page"' : ''}>${t('Todos', 'All')}<small>${G.P.length}</small></a>`]
      .concat(G.cats.map(c => `<a class="fchip${cat && cat.id === c.id ? ' is-on' : ''}" href="coleccion.html?c=${c.id}#productos"${cat && cat.id === c.id ? ' aria-current="page"' : ''}>${esc(c[G.LANG])}<small>${G.P.filter(p => p.cat === c.id).length}</small></a>`)).join('');
    // featured
    const fp = list.find(p => p.stock !== false) || list[0];
    const feat = $('[data-feat]');
    if (fp && feat) {
      const second = fp.img[1] || null;
      feat.innerHTML = `<div class="fcard">
        ${fp.badge ? `<span class="pill">${esc(fp.badge[EN ? 1 : 0])}</span>` : ''}
        <a class="fcard__img" href="${G.pdp(fp)}" aria-label="${esc(nm(fp))}">${jar(fp, second)}</a>
        <div class="fcard__c"><span class="chip">${esc(CHIP[fp.slug])}</span><h2 class="d-m">${esc(/\d/.test(nm(fp)) ? nm(fp) : nm(fp).replace(/ Protein$/, '') + ' ' + CHIP[fp.slug].replace(' ', ''))}</h2><p>${esc(L(fp, 'short'))}</p>
          <p class="price">${money(fp.price)}</p>
          <div class="ctarow"><a class="btn btn--light" href="${G.pdp(fp)}" style="background:#fff">${t('Ver producto', 'Learn more')}</a><button type="button" class="tlink" data-add="${fp.slug}">${t('Agregar al carrito', 'Add to cart')}</button></div></div></div>
        <a class="qbox ph is-fb" href="index.html#stack"><img class="ph-media" src="${A('assets/photo/stack.jpg')}" alt="" loading="lazy" onload="this.parentNode.classList.remove('is-fb')" onerror="this.remove()"><img class="ph-fb" src="${A('assets/img/cut/whey-tub.png')}" alt="" loading="lazy">
          <span class="qbox__cap">${t('¿No sabes por dónde empezar con God’s?', 'Not sure where to start with God’s?')} <u>${t('Arma tu stack', 'Build your stack')}</u></span></a>`;
    }
    // grid
    const g = $('[data-grid]');
    const rest = list.filter(p => p !== fp);
    g.innerHTML = rest.length ? rest.map(p => {
      const oos = p.stock === false;
      const pill = oos ? `<span class="pill pill--out">${t('Agotado', 'Sold out')}</span>` : p.badge ? `<span class="pill">${esc(p.badge[EN ? 1 : 0])}</span>` : '';
      return `<article class="scard${oos ? ' is-oos' : ''}">${pill}
        <a class="scard__img" href="${G.pdp(p)}" tabindex="-1" aria-hidden="true"><img src="${cutFor(p)}" alt="" loading="lazy">${p.img[1] ? `<img src="${cutFor(p, 1)}" alt="" loading="lazy">` : ''}</a>
        <div class="scard__c"><div class="scard__info"><span class="chip">${esc(CHIP[p.slug])}</span><h3 class="t-title"><a href="${G.pdp(p)}">${esc(nm(p))}</a></h3><p><span class="dsk">${esc(L(p, 'short'))}</span><span class="mob">${esc(L(p, 'tag'))} · ${esc(L(p, 'size').split(' · ')[0])}</span></p></div>
          <p class="price">${money(p.price)}</p>
          <div class="ctarow">${oos ? `<button type="button" class="btn" data-notify="${p.slug}">${t('Avísame cuando vuelva', 'Notify me')}</button><a class="tlink" href="${G.pdp(p)}">${t('Ver producto', 'Learn more')}</a>` : `<a class="btn" href="${G.pdp(p)}">${t('Ver producto', 'Learn more')}</a><button type="button" class="tlink" data-add="${p.slug}">${t('Agregar', 'Add to cart')}</button>`}</div></div></article>`;
    }).join('') : (list.length ? '' : `<p class="empty">${t('No hay productos en esta categoría.', 'No products in this category.')}</p>`);
  }

  /* ================= PDP ================= */
  function pdp() {
    const q = new URLSearchParams(location.search);
    const p = prodBy(q.get('p')) || G.P[0];
    const c = ci(p); const k = EN ? 1 : 0;
    const oos = p.stock === false;
    const name = nm(p);
    document.title = `${name} — God’s Nutrition`;
    const md = document.querySelector('meta[name=description]'); if (md) md.content = L(p, 'short');
    const fl = p.flavors || [];
    let sel = fl.find(f => f.stock) || fl[0] || null;
    const curImg = () => (sel && sel.img) ? A(sel.img) : cutFor(p);

    // gallery
    const tiles = [];
    tiles.push({ cls: 'gal__hero', html: `<img data-hero-img src="${curImg()}" alt="${esc(name)}" fetchpriority="high">`, src: curImg() });
    if (p.img[1]) tiles.push({ html: `<img src="${cutFor(p, 1)}" alt="${esc(name)}" loading="lazy">`, src: cutFor(p, 1) });
    if (PACK[p.slug]) tiles.push({ cls: 'is-pack', html: `<img src="${A('assets/img/products/' + PACK[p.slug])}" alt="${esc(name)}" loading="lazy">`, src: A('assets/img/products/' + PACK[p.slug]) });
    tiles.push({ cls: 'is-label', html: `<img src="${A('assets/img/products/' + LABEL[p.slug])}" alt="${t('Información nutrimental', 'Nutrition facts')} — ${esc(name)}" loading="lazy"><span class="tag">${t('Información nutrimental', 'Nutrition facts')}</span>`, src: A('assets/img/products/' + LABEL[p.slug]) });
    tiles.push({ cls: 'ph is-fb is-cover', html: `<img class="ph-media" src="${A('assets/' + (CATPHOTO[p.cat] || 'stock/gym-interior.jpg'))}" alt="" loading="lazy" onload="this.parentNode.classList.remove('is-fb')" onerror="this.remove()"><img class="ph-fb" style="object-fit:contain;padding:28px" src="${cutFor(p, p.img.length > 2 ? 2 : 0)}" alt="" loading="lazy">`, src: null });
    const gal = $('[data-gal]');
    gal.innerHTML = tiles.slice(0, 5).map((tl, i) => `<button type="button" class="gal__it ${tl.cls || ''}" data-zoom="${i}" aria-label="${t('Ampliar imagen', 'Enlarge image')} ${i + 1}">${tl.html}</button>`).join('');
    gal.addEventListener('click', e => { const b = e.target.closest('[data-zoom]'); if (!b) return; const im = b.querySelector('img:not(.is-off)'); if (im && im.complete && im.naturalWidth) openLbx(im.src, im.alt); });

    // buy box
    const set = (f, h) => { const el = $(`[data-f="${f}"]`); if (el) el.innerHTML = h; };
    set('size', esc(CHIP[p.slug]));
    set('name', esc(name));
    set('stars', stars(p.rating).replace(/^<span class="stars"[^>]*>|<\/span>$/g, ''));
    $('[data-f="stars"]').setAttribute('aria-label', `${p.rating} ${t('de 5 estrellas', 'out of 5 stars')}`);
    set('count', `${p.count} ${t('reseñas', 'reviews')}`);
    set('short', esc(L(p, 'short') + ' ' + L(p, 'tag') + '.'));
    set('price', money(p.price));
    set('badge', oos ? `<span class="pill pill--out">${t('Agotado', 'Sold out')}</span>` : p.badge ? `<span class="pill">${esc(p.badge[k])}</span>` : '');
    const setMeta = () => set('meta', `${esc(sel ? L(p, 'size').split(' · ').slice(1).join(' · ') : L(p, 'size'))}${sel ? ` · <span data-flav-name>${esc(sel[G.LANG] || sel.name)}${sel.stock === false ? ` (${t('agotado', 'sold out')})` : ''}</span>` : ''}<br>${per(p.price, p.servings)} ${t('por porción', 'per serving')}`);
    setMeta();
    const flBox = $('[data-flav]');
    function renderFlav() {
      if (!fl.length) return;
      flBox.hidden = false;
      setMeta();
      $('[data-flav-list]').innerHTML = fl.map(f => `<button type="button" class="fl${f === sel ? ' is-on' : ''}${f.stock === false ? ' is-oos' : ''}" role="radio" aria-checked="${f === sel}" aria-label="${esc(f[G.LANG] || f.name)}" title="${esc(f[G.LANG] || f.name)}" data-vid="${f.vid}">${f.img ? `<img src="${A(f.img)}" alt="" loading="lazy">` : `<span>${esc((f[G.LANG] || f.name).split(' ')[0])}</span>`}</button>`).join('');
    }
    const ctaHtml = (cls) => (oos || (sel && sel.stock === false))
      ? `<button type="button" class="btn ${cls}" data-notify="${p.slug}">${t('Avísame cuando vuelva', 'Notify me when it’s back')}</button>`
      : `<button type="button" class="btn ${cls}" data-add="${p.slug}"${sel ? ` data-vid="${sel.vid}"` : ''}>${t('Agregar al carrito', 'Add to cart')} · ${money(p.price)}</button>`;
    const satc = $('[data-satc]');
    function renderCta() {
      $('[data-cta]').innerHTML = ctaHtml('btn--block');
      satc.innerHTML = `<img src="${curImg()}" alt=""><p class="satc__n">${esc(name)}${sel ? `<small>${esc(sel[G.LANG] || sel.name)}</small>` : ''}</p>${ctaHtml('btn--light').replace(/ · \$[\d,]+( MXN)?/, '').replace(t('Agregar al carrito', 'Add to cart'), t('Agregar', 'Add')).replace(t('Avísame cuando vuelva', 'Notify me when it’s back'), t('Avísame', 'Notify me'))}`;
      const hi = $('[data-hero-img]'); if (hi && hi.getAttribute('src') !== curImg()) { hi.style.opacity = 0; setTimeout(() => { hi.src = curImg(); hi.onload = () => { hi.style.opacity = 1; }; }, 180); }
    }
    renderFlav(); renderCta();
    flBox.addEventListener('click', e => { const b = e.target.closest('[data-vid]'); if (!b) return; sel = fl.find(f => String(f.vid) === b.dataset.vid); renderFlav(); renderCta(); });

    // accordions
    const accIt = (title, body, open) => `<div class="acc__it${open ? ' is-open' : ''}"><button type="button" class="acc__b" aria-expanded="${!!open}"><span class="acc__t">${title}</span><span class="pm"></span></button><div class="acc__p"><div><div class="in">${body}</div></div></div></div>`;
    const facts = `<table class="facts"><tbody><tr><td>${t('Porción', 'Serving')}</td><td>${esc(SERV[p.slug][k])}</td></tr>${p.facts.map(f => `<tr><td>${esc(f[G.LANG])}</td><td>${esc(f.v)}</td></tr>`).join('')}</tbody></table><button type="button" class="tlink label-btn" data-label>${t('Ver etiqueta completa', 'View full label')} ${ARR}</button>`;
    const warn = L(p, 'warn');
    const legend = `<p class="legend">${t('Este producto no es un medicamento y es responsabilidad de quien lo recomienda y de quien lo usa.', 'This product is not a medicine; responsibility lies with whoever recommends it and whoever uses it.')}</p>`;
    $('[data-acc]').innerHTML = [
      accIt(t('Lo que trae', 'What’s inside'), `<ul class="bul">${(L(p, 'bullets') || []).slice(0, 4).map(x => `<li>${esc(x)}</li>`).join('')}</ul>${warn ? `<p class="warn">${esc(warn)}</p>` : ''}<button type="button" class="tlink label-btn" data-label>${t('Ver información nutrimental', 'View nutrition facts')} ${ARR}</button>`, true),
      accIt(t('Información nutrimental', 'Nutrition facts'), `${facts}<p class="acc__h">${t('Ingredientes', 'Ingredients')}</p><p>${esc(L(p, 'ingredients'))}</p><p class="acc__h">${t('Modo de uso', 'How to use')}</p><p>${esc(L(p, 'how'))}</p>${legend}`)
    ].join('');
    // upsell
    const u = prodBy(UPS[p.slug]);
    if (u) $('[data-ups]').innerHTML = `<div class="ups"><a class="ups__img" href="${G.pdp(u)}"><img src="${cutFor(u)}" alt="" loading="lazy"></a><div><p class="ups__t">${t('Combínalo con', 'Pair it with')} ${esc(nm(u))}</p><p class="ups__d">${esc(L(u, 'tag'))} · ${esc(L(u, 'size'))}</p><div class="ups__r"><span>${money(u.price)}</span><button type="button" class="btn btn--out" data-add="${u.slug}">${t('Agregar', 'Add')}</button></div></div></div>`;

    // P3 feature band
    const catPh = A('assets/' + (CATPHOTO[p.cat] || 'stock/gym-interior.jpg'));
    $('[data-p3]').innerHTML = `<div class="fb__grid">
      <div class="fb__hero ph is-fb"><img class="ph-media" src="${catPh}" alt="" loading="lazy" onload="this.parentNode.classList.remove('is-fb')" onerror="this.remove()">
        <h2 class="d-xl" data-rv>${esc(c.h[k])}</h2>
        <div class="fb__glass">${c.f.map((f, i) => `<div class="fb__f" data-rv="${i + 1}">${ICONS[i]}<h3>${esc(f[k][0])}</h3><p>${esc(f[k][1])}</p></div>`).join('')}</div></div>
      <div class="fb__row">
        <div class="fb__tile"><div class="ph"><img class="ph-media" src="${A('assets/photo/' + DETAIL[p.slug])}" alt="" loading="lazy" onerror="this.remove()"></div><div><img src="${cutFor(p, p.img.length > 1 ? 1 : 0)}" alt="" loading="lazy"></div></div>
        <div class="fb__card"><div data-rv><h2 class="d-m">${esc(c.card[k][0])}</h2><p>${esc(c.card[k][1])}</p><a class="tlink" href="#info" data-open-info>${t('Ver información nutrimental', 'See nutrition facts')} ${ARR}</a></div>
          <div class="anno"><img src="${cutFor(p)}" alt="${esc(name)}" loading="lazy">
            ${p.facts[0] ? `<p class="anno__l anno__l--a"><b>${esc(p.facts[0][G.LANG])}</b><span class="mono">${esc(p.facts[0].v)}</span> ${t('por porción', 'per serving')}</p>` : ''}
            ${p.facts[1] ? `<p class="anno__l anno__l--b"><b>${esc(p.facts[1][G.LANG])}</b><span class="mono">${esc(p.facts[1].v)}</span> ${t('por porción', 'per serving')}</p>` : ''}</div></div>
      </div></div>`;

    // P4 usage timeline
    const how = L(p, 'how').split(/(?<=\.)\s+/).filter(Boolean);
    const when = (WHEN[p.cat] || WHEN.bienestar)[k];
    const WATER = { proteinas: ['Con agua o leche, en shaker', 'With water or milk, in a shaker'], creatinas: ['En agua o en tu bebida', 'In water or your drink'], 'pre-entreno': ['Con un vaso de agua', 'With a glass of water'], bienestar: ['Sigue el modo de uso', 'Follow the directions'] };
    const days = p.servings;
    const steps = [
      [t('Día 1', 'Day 1'), t('Tu primera porción', 'Your first serving'), [t(`Porción: ${SERV[p.slug][0]}`, `Serving: ${SERV[p.slug][1]}`), (WATER[p.cat] || WATER.bienestar)[k], fl.length ? t(`${fl.length} sabores para elegir`, `${fl.length} flavors to pick from`) : t('Sin sabor, sin medidas', 'No flavor, no scoops')]],
      [t('Semana 1', 'Week 1'), t('Encuentra tu momento', 'Find your moment'), when],
      [t('Mes 1', 'Month 1'), t(`Un bote, ${days} porciones`, `One tub, ${days} servings`), [t(`A una porción diaria te dura ${days} días`, `At one serving a day it lasts ${days} days`), t('Ciérralo bien después de cada uso', 'Close it tightly after each use'), t('Guárdalo en un lugar fresco y seco', 'Store it in a cool, dry place')]],
      [t('Constancia', 'Consistency'), t('El hábito hace el trabajo', 'The habit does the work'), [t('Acompáñalo de tu alimentación y entrenamiento', 'Pair it with your food and training'), t('No sustituye una alimentación equilibrada', 'It doesn’t replace a balanced diet'), t('Respeta la porción indicada en la etiqueta', 'Stick to the serving on the label')]]
    ];
    $('[data-p4]').innerHTML = `
      <div class="tl__head" data-rv><h2 class="d-xl">${t('Así se integra a tu día:<br>un hábito, semana a semana', 'How it fits your day:<br>a habit, week by week')}</h2><p>${t('Solo cómo usarlo, día con día.', 'Just how to use it, day by day.')}</p><a class="tlink" href="#preguntas">${t('Preguntas frecuentes', 'Frequently asked questions')} ${ARR}</a></div>
      <div class="tl__in"><div class="tl__l">
        <div class="steps">${steps.map((s, i) => `<div class="step${i === 0 ? ' on' : ''}"><div class="step__h"><span class="step__tag">${esc(s[0])}</span><span class="step__t">${esc(s[1])}</span></div><ul>${s[2].map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>`).join('')}</div>
          <div class="howcard"><img src="${cutFor(p)}" alt="" loading="lazy"><div><b>${t('Modo de uso', 'How to use')}</b><p>${esc(how[0] || '')}</p></div></div></div>
        <div class="tl__media">
          <div class="m1 ph"><img class="ph-media" src="${A('assets/stock/athlete-f.jpg')}" alt="" loading="lazy" onerror="this.remove()"></div>
          <div class="m2 ph"><img class="ph-media" src="${A('assets/photo/' + DETAIL[p.slug])}" alt="" loading="lazy" onerror="this.remove()"></div>
          <div class="m3"><img src="${cutFor(p, p.img.length > 2 ? 2 : 0)}" alt="" loading="lazy"></div>
        </div>
      </div>`;

    // P5 formula
    const sv = SERV[p.slug][k];
    $('[data-p5]').innerHTML = `
      <div class="form__head" data-rv><h2 class="d-xl">${t('Lo que hay en cada porción, tal como dice la etiqueta', 'What’s in every serving, exactly as the label says')}</h2><button type="button" class="tlink" data-label>${t('Ver etiqueta completa', 'View full label')} ${ARR}</button></div>
      <div class="form__in">
        <div class="form__img" data-rv><img src="${curImg()}" alt="${esc(name)}" loading="lazy"></div>
        <div>
          <div class="ing">${p.facts.slice(0, 4).map(f => accIt(`<span>${esc(f[G.LANG])}</span><span class="dose">${esc(f.v)}</span>`, /porci|serving|cápsulas|capsules/i.test(f[G.LANG]) ? esc(L(p, 'size')) + '.' : t(`${f.v} de ${f.es.toLowerCase()} en cada porción de ${sv}, según la etiqueta.`, `${f.v} of ${f.en.toLowerCase()} in every ${sv} serving, per the label.`))).join('')}</div>
          <div class="icg">${(() => {
            const IC = '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18"/><path d="M13 21l5 5 9-11"/></svg>';
            const items = p.facts.slice(4).map(f => `${f.v} · ${f[G.LANG]}`).concat([
              `${p.servings} ${t('porciones', 'servings')}`, fl.length ? `${fl.length} ${t('sabores', 'flavors')}` : t('Sin sabor', 'No flavor'),
              `${t('Porción', 'Serving')}: ${sv}`, L(p, 'size').split(' · ')[0], t('Ingredientes en la etiqueta', 'Ingredients on the label'),
              t('Empresa mexicana', 'Mexican company'), `${per(p.price, p.servings)} / ${t('porción', 'serving')}`, t('Ciencia · Pureza · Calidad', 'Science · Purity · Quality'),
              t('Pago con Mercado Pago', 'Pay with Mercado Pago'), t('Envíos a todo México', 'Ships across Mexico')]).slice(0, 10);
            return items.map(x => `<p class="icg__it">${IC}${esc(x)}</p>`).join(''); })()}
          </div>
        </div>
      </div>`;

    // P6 compare (God's formats only, real numbers)
    const groups = { proteinas: ['gods-whey-protein', 'gods-full-protein-5-lbs', 'themis-vegan-protein-1-kg'], creatinas: ['gods-creatine-1kg', 'creatina'], 'pre-entreno': ['ares', 'gods-creatine-1kg'], bienestar: ['gods-omega-3', 'preventa-gods-demeter-450g', 'gods-ceres-450g-p'] };
    const cols = [p].concat((groups[p.cat] || []).filter(s => s !== p.slug).map(prodBy).filter(Boolean));
    const rows = [
      [t('Dato clave por porción', 'Key amount per serving'), x => `<span class="mono">${esc(x.facts[0].v)}</span><br><small>${esc(x.facts[0][G.LANG])}</small>`],
      [t('Porciones por bote', 'Servings per tub'), x => x.servings],
      [t('Precio', 'Price'), x => money(x.price)],
      [t('Precio por porción', 'Price per serving'), x => per(x.price, x.servings)],
      [t('Disponibilidad', 'Availability'), x => x.stock === false ? `<span class="soon">${t('Agotado', 'Sold out')}</span>` : '<span class="dot" aria-label="✓"></span>']
    ];
    $('[data-p6]').innerHTML = `<div class="cmp__in"><h2 class="d-xl cmp__t">${t('Así se comparan:', 'How they compare:')}</h2>
      <div class="ctab" data-rv="2"><table><thead><tr><th scope="col"><span class="sr">${t('Concepto', 'Item')}</span></th>${cols.map((x, i) => `<th scope="col" class="${i === 0 ? 'hl' : ''}">${i === 0 ? `<span class="chip">${esc(CHIP[x.slug])}</span><span class="sr">${esc(nm(x))}</span>` : `<a href="${G.pdp(x)}">${esc(x.name.replace(/^God's /, ''))}</a>`}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr><td>${r[0]}</td>${cols.map((x, i) => `<td class="${i === 0 ? 'hl' : ''}">${r[1](x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;

    // P9 FAQ
    const flList = fl.map(f => (f[G.LANG] || f.name) + (f.stock === false ? ` (${t('agotado', 'sold out')})` : '')).join(', ');
    const faqs = [
      [t('¿Cómo y cuándo debo tomarlo?', 'How and when should I take it?'), L(p, 'how') + ' ' + t(`Cada bote trae ${L(p, 'size')}, así que a una porción diaria te dura ${p.servings} días. Respeta la porción de la etiqueta y, si tienes dudas sobre cómo integrarlo a tu alimentación, consulta a un profesional de la nutrición.`, `Each tub has ${L(p, 'size')}, so at one serving a day it lasts ${p.servings} days. Stick to the serving on the label and, if you’re unsure how to fit it into your diet or training, ask a nutrition professional.`)],
      fl.length ? [t('¿Qué sabores hay?', 'Which flavors are there?'), flList + '.'] : warn ? [t('¿Cuánta cafeína tiene?', 'How much caffeine does it have?'), t('200 mg de cafeína anhidra por cápsula. ', '200 mg of caffeine anhydrous per capsule. ') + warn] : [t('¿Qué ingredientes tiene?', 'What are the ingredients?'), L(p, 'ingredients')],
      [t('¿Cuánto tarda el envío?', 'How long does shipping take?'), t('Nuestros clientes reportan entregas de 2 a 3 días hábiles; depende de tu ciudad. El costo y la fecha estimada los ves en el checkout.', 'Customers report deliveries in 2–3 business days, depending on your city. You’ll see the cost and estimated date at checkout.')]
    ];
    $('[data-p9]').id = 'preguntas';
    $('[data-p9]').innerHTML = `<div class="faq__in"><h2 class="d-xl" data-rv>${t('¿Preguntas?<br>Aquí te ayudamos.', 'Questions?<br>We’re here to help.')}</h2><div><div class="acc">${faqs.map((f, i) => accIt(esc(f[0]), esc(f[1]), i === 0)).join('')}</div>
      <a class="faq__more" href="mailto:hola@godsnutrition.com.mx"><i>→</i>${t('Escríbenos', 'Email us')}</a></div></div>`;

    // P10 reviews
    const all = safeRevs(p);
    const dist = [5, 4, 3, 2, 1].map(s => all.filter(r => Math.round(r.r) === s).length);
    $('[data-p10]').innerHTML = `<div class="prev__in"><h2>${t('Reseñas de clientes', 'Customer reviews')}</h2>
      <div class="rsum"><div class="rsum__avg"><b>${p.rating.toFixed(2).replace(/0$/, '')}</b><div>${stars(p.rating)}<small>${t(`Basado en ${p.count} reseñas`, `Based on ${p.count} reviews`)}</small></div></div>
        ${all.length ? `<div class="dist" aria-label="${t('Distribución de estrellas', 'Star distribution')}">${dist.map((n, i) => `<div><span>${5 - i}★</span><i><b style="width:${all.length ? (n / all.length * 100) : 0}%"></b></i><span>${n}</span></div>`).join('')}</div>` : ''}</div>
      ${all.length ? `<div class="rtools"><label class="sr" for="rq">${t('Buscar en reseñas', 'Search reviews')}</label><input id="rq" type="search" placeholder="${t('Buscar en reseñas', 'Search reviews')}" data-rq><span class="muted" style="font-size:13px" data-rn></span><label class="sr" for="rs">${t('Ordenar', 'Sort')}</label><select id="rs" data-rs><option value="new">${t('Más recientes', 'Most recent')}</option><option value="top">${t('Mejor calificación', 'Highest rated')}</option></select></div><div data-rl></div><div class="pager" data-rp></div>` : `<p class="empty">${t('Aún no hay reseñas publicadas en esta página.', 'No reviews published on this page yet.')}</p>`}</div>`;
    if (all.length) {
      let pg = 0; const PER = 5;
      const draw = () => {
        const term = ($('[data-rq]').value || '').toLowerCase();
        let l = all.filter(r => !term || (r.t + ' ' + (r.en || '') + ' ' + r.n).toLowerCase().includes(term));
        l = l.slice().sort($('[data-rs]').value === 'top' ? (a, b) => b.r - a.r || b.d.localeCompare(a.d) : (a, b) => b.d.localeCompare(a.d));
        const pages = Math.max(1, Math.ceil(l.length / PER)); pg = Math.min(pg, pages - 1);
        $('[data-rn]').textContent = t(`${l.length} de ${p.count} reseñas`, `${l.length} of ${p.count} reviews`);
        const fmt = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString(EN ? 'en-US' : 'es-MX', { year: 'numeric', month: 'short', day: 'numeric' }); } catch (e) { return d; } };
        $('[data-rl]').innerHTML = l.slice(pg * PER, pg * PER + PER).map(r => `<div class="rrow"><div class="rrow__who"><b>${esc(r.n)}</b>${r.v ? `<span class="vb"><svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="5.5" fill="currentColor"/><path d="M3.5 6l1.8 1.8L8.6 4.4" stroke="#fff" fill="none" stroke-width="1.2"/></svg>${t('Compra verificada', 'Verified buyer')}</span>` : ''}</div>
          <div class="rrow__body">${stars(r.r)}<p>${esc(EN && r.en ? r.en : r.t)}</p>${EN ? `<small>${r.en ? 'Translated from Spanish' : 'Original in Spanish'}</small>` : ''}</div><span class="rrow__d">${fmt(r.d)}</span></div>`).join('') || `<p class="empty">${t('Sin resultados.', 'No results.')}</p>`;
        $('[data-rp]').innerHTML = pages > 1 ? Array.from({ length: pages }, (_, i) => `<button type="button" class="${i === pg ? 'is-on' : ''}" data-pg="${i}" aria-label="${t('Página', 'Page')} ${i + 1}">${i + 1}</button>`).join('') : '';
      };
      $('[data-rq]').addEventListener('input', () => { pg = 0; draw(); });
      $('[data-rs]').addEventListener('change', () => { pg = 0; draw(); });
      $('[data-rp]').addEventListener('click', e => { const b = e.target.closest('[data-pg]'); if (b) { pg = +b.dataset.pg; draw(); $('[data-p10]').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); } });
      draw();
    }

    // accordion behaviour (all on page)
    document.addEventListener('click', e => {
      const b = e.target.closest('.acc__b'); if (b) { const it = b.parentNode; const on = !it.classList.contains('is-open'); it.classList.toggle('is-open', on); b.setAttribute('aria-expanded', on); return; }
      if (e.target.closest('[data-label]')) { openLbx(A('assets/img/products/' + LABEL[p.slug]), t('Información nutrimental', 'Nutrition facts') + ' — ' + name); return; }
      if (e.target.closest('[data-open-info]')) { e.preventDefault(); const it = $('[data-acc] .acc__it'); it.classList.add('is-open'); $('[data-buybox]').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); }
    });

    // sticky ATC
    if ('IntersectionObserver' in window) {
      let ctaOut = false, footIn = false;
      const upd = () => { const on = ctaOut && !footIn; satc.classList.toggle('is-on', on); satc.setAttribute('aria-hidden', !on); };
      new IntersectionObserver(es => { ctaOut = !es[0].isIntersecting && es[0].boundingClientRect.top < 0; upd(); }).observe($('[data-cta]'));
      new IntersectionObserver(es => { footIn = es[0].isIntersecting; upd(); }).observe($('[data-foot]'));
    }

    // timeline steps highlight
    const stepsEl = $$('.step');
    const tlUpd = () => { const vh = window.innerHeight; stepsEl.forEach(s => { if (s.getBoundingClientRect().top < vh * 0.62) s.classList.add('on'); }); };
    scrollers.push(tlUpd);

    // JSON-LD
    const ld = document.createElement('script'); ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name, image: curImg(), description: L(p, 'short'), brand: { '@type': 'Brand', name: 'God’s Nutrition' }, aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.count }, offers: { '@type': 'Offer', priceCurrency: 'MXN', price: p.price, availability: oos ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock' } });
    document.head.appendChild(ld);
  }

  /* ---------- boot ---------- */
  const scrollers = [hdrState];
  let ticking = false;
  const onScroll = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { scrollers.forEach(f => f()); ticking = false; }); };
  menuRows(); menu();
  if (page === 'home') home();
  if (page === 'shop') shop();
  if (page === 'pdp') pdp();
  footer(); reveal();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  scrollers.forEach(f => f());
})();
