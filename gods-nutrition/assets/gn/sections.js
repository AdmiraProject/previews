/* Shared God's Nutrition sections, used by every version.
   1) Authority strip  → <section data-gn-authority></section>   (optional data-theme="dark|light")
      Monochrome circular seals + wordmarks built ONLY from real, verifiable facts (no press/awards the brand doesn't have).
   2) Shoppable reels  → <section data-gn-reels></section>
      Vertical video carousel (center card larger + playing), each with a mini product card + Add to cart (core.js data-add).
      Videos: assets/reels/reels.json (AI EJEMPLO clips until the brand's creator/athlete videos arrive).
   Requires data.js + core.js loaded first (window.GNC). Styling: assets/gn/sections.css, themable via CSS vars. */
(function () {
  const G = window.GNC; if (!G) return;
  const ES = G.LANG !== 'en';
  const t = (es, en) => (ES ? es : en);
  const A = p => G.base + p;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- 1. authority strip ---------- */
  let sealN = 0;
  function seal(ring, big, small) {
    const id = 'gnSeal' + (++sealN);
    return `<svg class="gna__seal" viewBox="0 0 120 120" role="img" aria-label="${esc(big + ' ' + (small || '') + ' — ' + ring)}">
      <defs><path id="${id}" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0"/></defs>
      <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="60" cy="60" r="38" fill="none" stroke="currentColor" stroke-width="1"/>
      <text class="gna__ring"><textPath href="#${id}" startOffset="0">${esc(ring)}</textPath></text>
      <text x="60" y="${small ? 62 : 67}" text-anchor="middle" class="gna__big">${esc(big)}</text>
      ${small ? `<text x="60" y="78" text-anchor="middle" class="gna__small">${esc(small)}</text>` : ''}
    </svg>`;
  }
  const word = (main, sub) => `<div class="gna__word"><b>${esc(main)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div>`;
  const st = G.stats || {};
  const ITEMS = [
    seal(t('· CIENCIA · PUREZA · CALIDAD · EN CADA ETIQUETA ', '· SCIENCE · PURITY · QUALITY · ON EVERY LABEL '), 'C·P·C', ''),
    word('Fitness Científico', t('Cofundada por Aries Terrón', 'Co-founded by Aries Terrón')),
    seal(t('· RESEÑAS DE CLIENTES · COMPRAS VERIFICADAS ', '· CUSTOMER REVIEWS · VERIFIED PURCHASES '), String(st.avg || '4.95') + '★', `${st.count || 147} ${t('reseñas', 'reviews')}`),
    word(t('Marca mexicana', 'Mexican brand'), t('Envíos a todo el país', 'Shipping nationwide')),
    seal(t('· LA DOSIS EXACTA · IMPRESA EN LA ETIQUETA ', '· THE EXACT DOSE · PRINTED ON THE LABEL '), t('DOSIS', 'DOSE'), t('a la vista', 'on the label')),
    word('Mercado Pago', t('Hasta 12 pagos · OXXO', 'Up to 12 payments · OXXO'))
  ];
  document.querySelectorAll('[data-gn-authority]').forEach(el => {
    el.classList.add('gna');
    const row = `<div class="gna__row">${ITEMS.join('')}</div>`;
    el.innerHTML = `<div class="gna__track">${row}${row.replace('class="gna__row"', 'class="gna__row" aria-hidden="true"')}</div>`;
  });

  /* ---------- 0. every ★ on the page is yellow (text stars + star icons) ---------- */
  function paintStars(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.nodeValue.includes('★') && !n.parentNode.closest('.gn-star,script,style,svg,title') ? 1 : 2 });
    const hits = []; while (w.nextNode()) hits.push(w.currentNode);
    hits.forEach(n => { const f = document.createElement('span'); f.innerHTML = esc(n.nodeValue).replace(/★+/g, m => `<span class="gn-star">${m}</span>`); n.replaceWith(...f.childNodes); });
  }
  const runStars = () => paintStars(document.body);
  runStars(); setTimeout(runStars, 600); setTimeout(runStars, 2000);
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) paintStars(n); else if (n.nodeType === 3 && n.nodeValue.includes('★') && n.parentNode) paintStars(n.parentNode); }))).observe(document.body, { childList: true, subtree: true });

  /* ---------- 2. shoppable reels ---------- */
  const reelsEls = document.querySelectorAll('[data-gn-reels]');
  if (!reelsEls.length) return;
  const PLAY = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  const SOUND = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>';
  fetch(A('assets/reels/reels.json')).then(r => r.ok ? r.json() : []).catch(() => []).then(list => {
    list = (list || []).filter(x => G.bySlug[x.slug]);
    reelsEls.forEach(el => render(el, list));
  });
  function render(el, list) {
    el.classList.add('gnr');
    if (!list.length) { el.hidden = true; return; }
    const title = el.dataset.title || t('Así se vive God’s', 'God’s, in real routines');
    const sub = el.dataset.sub || t('Cómo y cuándo se toma cada fórmula, en el día a día.', 'How and when each formula fits into the day.');
    el.innerHTML = `
      <div class="gnr__hd"><h2>${esc(title)}</h2><p>${esc(sub)}</p></div>
      <div class="gnr__vp"><div class="gnr__track">${[...list, ...list, ...list].map((r, i) => {
        const p = G.bySlug[r.slug];
        const f = r.vid && (p.flavors || []).find(x => String(x.vid) === String(r.vid));
        const thumb = f && f.img ? f.img : p.img[0];
        const cta = p.stock === false ? `<button type="button" class="gnr__btn" data-notify="${p.slug}">${t('Avísame', 'Notify me')}</button>`
          : `<button type="button" class="gnr__btn" data-add="${p.slug}"${r.vid ? ` data-vid="${r.vid}"` : ''}>${t('Agregar al carrito', 'Add to cart')}</button>`;
        return `<article class="gnr__card" data-i="${i}">
          <div class="gnr__media">
            <video muted loop playsinline preload="none" poster="${A('assets/reels/' + r.file + '.jpg')}" data-src="${A('assets/reels/' + r.file + '.mp4')}"></video>
            <span class="gnr__play" aria-hidden="true">${PLAY}</span><span class="gnr__mute" aria-hidden="true">${SOUND}</span>
          </div>
          <div class="gnr__prod">
            <a class="gnr__p" href="${G.pdp(p)}"><img src="${A(thumb)}" alt="" loading="lazy"><span><b>${esc(G.nm(p))}</b><small>${f ? esc(f[G.LANG] || f.es) + ' · ' : ''}${G.money(p.price)}</small></span></a>
            ${cta}
          </div>
        </article>`; }).join('')}</div></div>
      <div class="gnr__nav"><button type="button" class="gnr__arr" data-d="-1" aria-label="${t('Anterior', 'Previous')}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 5l-7 7 7 7"/></svg></button><button type="button" class="gnr__arr" data-d="1" aria-label="${t('Siguiente', 'Next')}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 5l7 7-7 7"/></svg></button></div>`;
    const vp = el.querySelector('.gnr__vp'), cards = [...el.querySelectorAll('.gnr__card')]; const N = list.length;
    let cur = -1;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function activate(i) {
      i = (i + cards.length) % cards.length; if (i === cur) return; cur = i;
      cards.forEach((c, j) => {
        const v = c.querySelector('video'); const on = j === i;
        c.classList.toggle('is-on', on);
        if (on) { if (!v.src) v.src = v.dataset.src; if (!reduce) v.play().catch(() => {}); }
        else { v.pause(); }
      });
    }
    function center(i, smooth) {
      i = (i + cards.length) % cards.length;
      const c = cards[i];
      vp.scrollTo({ left: c.offsetLeft - (vp.clientWidth - c.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' });
      activate(i);
    }
    let raf;
    vp.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
      const mid = vp.scrollLeft + vp.clientWidth / 2; let best = 0, bd = Infinity;
      cards.forEach((c, j) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = j; } });
      activate(best);
      clearTimeout(vp._t); vp._t = setTimeout(() => { if (cur < N || cur >= 2 * N) { const j = cur < N ? cur + N : cur - N; const c = cards[j]; vp.scrollTo({ left: c.offsetLeft - (vp.clientWidth - c.offsetWidth) / 2, behavior: 'auto' }); activate(j); } }, 160);
    }); }, { passive: true });
    el.querySelectorAll('.gnr__arr').forEach(b => b.addEventListener('click', () => center(cur + +b.dataset.d, true)));
    cards.forEach((c, j) => c.querySelector('.gnr__media').addEventListener('click', () => {
      if (j !== cur) return center(j, true);
      const v = c.querySelector('video');
      if (v.paused) v.play().catch(() => {}); else if (v.muted) { v.muted = false; c.classList.add('is-sound'); } else { v.muted = true; c.classList.remove('is-sound'); }
    }));
    // start in the middle once visible; pause everything when off-screen
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { if (cur < 0) center(N + Math.min(2, N - 1), false); else { const v = cards[cur].querySelector('video'); if (!reduce) v.play().catch(() => {}); } }
      else cards.forEach(c => c.querySelector('video').pause());
    }), { threshold: .25 });
    io.observe(el);
  }
})();
