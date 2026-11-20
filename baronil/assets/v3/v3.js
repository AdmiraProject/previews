(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const V = window.V3 || { lang: 'es', t: {}, g: {}, amz: {} };
  const T = V.t, G = V.g, LANG = V.lang;
  const B = window.BARONIL || { products: [], colors: {}, fits: {}, cats: {} };
  const byId = (id) => B.products.find((p) => p.id === id);
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
  const IMG = (id, c, k) => (window.BARONIL_IMG ? window.BARONIL_IMG(id, c, k) : '');
  const money = (n) => 'RD$' + Number(n).toLocaleString('en-US');
  const packEs = (n) => (n > 1 ? 'Paquete de ' + n : 'Unidad');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const lock = (on) => document.documentElement.classList.toggle('lock', on);

  /* ── Media slots: still first, loop fades in once playing; paused offscreen; poster-only under reduced motion ── */
  function startVideo(v) {
    if (RM) return;
    if (!v.getAttribute('src')) {
      const src = (isMobile() && v.dataset.srcM) || v.dataset.src || v.dataset.srcM;
      if (!src) return;
      if (isMobile() && v.dataset.posterM) v.poster = v.dataset.posterM;
      v.preload = 'auto'; v.src = src;
      v.addEventListener('playing', () => v.classList.add('is-playing'), { once: true });
    }
    const p = v.play(); if (p && p.catch) p.catch(() => {});
  }
  let mediaIO = null;
  function initMedia(root = document) {
    if (RM) return; // reduced motion → the still is all you get
    const vids = $$('video[data-autoplay]:not([data-lazy])', root);
    if (!vids.length) return;
    mediaIO = mediaIO || new IntersectionObserver((entries) => {
      entries.forEach((e) => { const v = e.target; if (e.isIntersecting) startVideo(v); else if (!v.paused) v.pause(); });
    }, { rootMargin: '200px 0px' });
    vids.forEach((v) => mediaIO.observe(v));
  }

  /* ── SMIL blobs: freeze under reduced motion, pause offscreen ── */
  function initBlobs() {
    const svgs = $$('svg.blob');
    if (RM) { svgs.forEach((s) => s.pauseAnimations && s.pauseAnimations()); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const s = e.target; if (!s.pauseAnimations) return;
      e.isIntersecting ? s.unpauseAnimations() : s.pauseAnimations();
    }));
    svgs.forEach((s) => io.observe(s));
  }

  /* ── Header: mega menu dim, mobile drawer, language switch keeps ?query ── */
  function initHeader() {
    const scrim = $('[data-scrim]');
    $$('[data-mega]').forEach((it) => {
      const a = $('.hdr__a', it);
      const on = () => { $$('video[data-lazy]', it).forEach(startVideo); it.classList.add('is-open'); a.setAttribute('aria-expanded', 'true'); if (scrim) { scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add('is-on')); } };
      const off = () => { it.classList.remove('is-open'); a.setAttribute('aria-expanded', 'false'); if (scrim) { scrim.classList.remove('is-on'); setTimeout(() => { if (!scrim.classList.contains('is-on')) scrim.hidden = true; }, 250); } };
      it.addEventListener('mouseenter', on); it.addEventListener('mouseleave', off);
      it.addEventListener('focusout', (e) => { if (!it.contains(e.relatedTarget)) off(); });
      it.addEventListener('keydown', (e) => { if (e.key === 'Escape') { off(); a.focus(); } });
    });
    const dr = $('[data-drawer]');
    const burger = $('[data-drawer-open]');
    const open = () => { dr.classList.add('is-open'); dr.setAttribute('aria-hidden', 'false'); burger && burger.setAttribute('aria-expanded', 'true'); lock(true); };
    const close = () => { dr.classList.remove('is-open'); dr.setAttribute('aria-hidden', 'true'); burger && burger.setAttribute('aria-expanded', 'false'); lock(false); };
    burger && burger.addEventListener('click', open);
    if (dr) dr.addEventListener('click', (e) => { if (e.target === dr || e.target.closest('[data-drawer-close]') || e.target.closest('a')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && dr && dr.classList.contains('is-open')) close(); });
    $$('[data-lang-switch]').forEach((a) => a.addEventListener('click', () => {
      const base = a.getAttribute('href').split('?')[0].split('#')[0];
      a.setAttribute('href', base + location.search + location.hash);
    }));
  }

  /* ── Modals (size guide global, PDP details) ── */
  let lastFocus = null;
  function openModal(m) {
    if (!m) return; lastFocus = document.activeElement;
    m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); lock(true);
    const x = $('.modal__x', m); x && setTimeout(() => x.focus(), 50);
  }
  function closeModals() {
    $$('.modal.is-open').forEach((m) => { m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); });
    closeQV(); lock(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function initModals() {
    document.addEventListener('click', (e) => {
      const sg = e.target.closest('[data-size-guide]');
      if (sg) { e.preventDefault(); openModal($('#size-modal')); return; }
      const mo = e.target.closest('[data-modal-open]');
      if (mo) { e.preventDefault(); const scope = mo.closest('[data-pdp]') || document; openModal($('[data-modal="' + mo.dataset.modalOpen + '"]', scope)); return; }
      if (e.target.closest('[data-modal-close]')) { e.preventDefault(); closeModals(); }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModals(); });
  }

  /* ── Product cards: swatch → image/price/links/quick-add color ── */
  function setCardColor(card, c) {
    const sw = $('[data-sw="' + c + '"]', card); if (!sw) return;
    $$('[data-sw]', card).forEach((b) => b.setAttribute('aria-checked', b === sw ? 'true' : 'false'));
    const im = $('[data-card-img]', card); if (im && sw.dataset.img) im.src = sw.dataset.img;
    const hv = $('[data-card-hover]', card); if (hv && sw.dataset.hover) hv.src = sw.dataset.hover;
    const lp = $('.card__loop', card); if (lp) { lp.pause(); lp.classList.remove('is-playing'); lp.removeAttribute('src'); lp.load(); lp.dataset.loop = sw.dataset.loop || ''; }
    const p = byId(card.dataset.id);
    if (im && p) im.alt = p.name[LANG] + ' — ' + (B.colors[c] ? B.colors[c][LANG] : c);
    $$('[data-card-link]', card).forEach((a) => { a.href = a.getAttribute('href').replace(/([?&]c=)[^&]*/, '$1' + c); });
    $$('[data-add]', card).forEach((b) => (b.dataset.color = c));
    if (sw.dataset.p) { const pr = $('[data-price]', card); if (pr) pr.textContent = sw.dataset.p; const pk = $('[data-pack]', card); if (pk) pk.textContent = sw.dataset.k; }
    card.dataset.cur = c;
  }
  function initCards() {
    if (!RM && window.matchMedia('(hover: hover) and (min-width: 1024px)').matches) {
      $$('[data-card]').forEach((card) => {
        const v = $('.card__loop', card); if (!v) return;
        let off = 0;
        v.addEventListener('playing', () => { if (card.matches(':hover')) v.classList.add('is-playing'); });
        card.addEventListener('mouseenter', () => {
          clearTimeout(off);
          if (!v.dataset.loop) return;
          if (!v.getAttribute('src')) v.src = v.dataset.loop;
          const pr = v.play(); if (pr && pr.catch) pr.catch(() => {});
          if (v.readyState > 2) v.classList.add('is-playing');
        });
        card.addEventListener('mouseleave', () => { v.classList.remove('is-playing'); clearTimeout(off); off = setTimeout(() => { if (!card.matches(':hover')) v.pause(); }, 350); });
      });
    }
    document.addEventListener('click', (e) => {
      const sw = e.target.closest('[data-sw]');
      if (sw) { const card = sw.closest('[data-card]'); card && setCardColor(card, sw.dataset.sw); }
    });
  }

  /* ── Quick View sheet (compact PDP) ── */
  const qv = () => $('[data-qv-root]');
  function closeQV() { const r = qv(); if (r && r.classList.contains('is-open')) { r.classList.remove('is-open'); r.setAttribute('aria-hidden', 'true'); } }
  function priceHTML(p, c) {
    if (LANG === 'es') return `<span class="price__v" data-qv-price>${money(p.rd[c])}</span><span class="price__note" data-qv-pack>${packEs(p.rdPack[c])}</span>`;
    const a = V.amz[p.id];
    if (p.asin && a) return `<span class="price__v">${esc(a.price)}</span><span class="price__note">${esc(a.pack.en)}</span>`;
    return `<span class="price__v price__v--rd">${esc(T.card.rd)}</span>`;
  }
  function waHref(p, c, s) {
    const msg = `${T.pdp.wa_msg} ${p.name[LANG]} — ${B.colors[c][LANG]}${s ? (LANG === 'es' ? ', talla ' : ', size ') + s : ''}`;
    return `https://wa.me/${V.wa}?text=${encodeURIComponent(msg)}`;
  }
  function openQV(id, color) {
    const p = byId(id); const r = qv(); if (!p || !r) return;
    let c = color && p.colors.includes(color) ? color : p.colors[0];
    let s = p.sizes.includes('M') ? 'M' : p.sizes[0];
    const rdonly = LANG === 'en' && !p.asin;
    const imgs = () => { const g = IMG(p.id, c, 'pdp'); const list = Array.isArray(g) && g.length ? g : [IMG(p.id, c, 'card'), IMG(p.id, c, 'hover')]; return [...new Set(list)]; };
    const galHTML = () => { const lp = IMG(p.id, c, 'loop'), po = IMG(p.id, c, 'lpo'); const list = imgs(); return (lp ? `<div class="qv__v"><img src="${po || list[0]}" alt="" width="1080" height="1350"><video class="media__v" autoplay muted loop playsinline preload="none" poster="${po || list[0]}" aria-hidden="true" data-autoplay data-src="${lp}"></video></div>` : '') + (lp && list.length > 1 ? list.slice(1) : list).map((u, i) => `<img src="${u}" alt="${esc(p.name[LANG])} ${i + 1}" width="1200" height="1200">`).join(''); };
    const alt = LANG === 'es'
      ? `<a class="btn-out" data-qv-wa href="${waHref(p, c, s)}" target="_blank" rel="noopener">${esc(G.whatsapp)}</a>`
      : (p.amazon ? `<a class="btn-out" href="${p.amazon}" target="_blank" rel="noopener">${esc(G.amazon)}</a>` : `<a class="btn-out btn-out--rd" href="${waHref(p, c)}" target="_blank" rel="noopener">Available in the DR — order on WhatsApp</a>`);
    $('[data-qv-body]', r).innerHTML = `
      <div class="qv__buy buy" style="position:static;width:auto">
        <div class="buy__head" style="display:block"><nav class="crumb"><a href="shop.html?cat=${p.cat}">${esc(B.cats[p.cat][LANG])}</a> / <span>${esc(T.fitl[p.fit])}</span></nav>
          <a class="qv__page u-link" href="product.html?p=${p.id}&c=${c}" data-qv-page>${esc(T.qv.page)} →</a>
          <h2 class="pdp__h1">${esc(p.name[LANG])}</h2></div>
        <div class="buy__price"><div class="price price--pdp">${priceHTML(p, c)}</div></div>
        <fieldset class="buy__colors"><legend><b>${esc(G.color)}:</b> <span data-qv-cname>${esc(B.colors[c][LANG])}</span></legend>
          <div class="buy__sw">${p.colors.map((k) => `<button type="button" class="sw sw--lg${k === 'white' ? ' sw--light' : ''}" role="radio" aria-checked="${k === c}" aria-label="${esc(B.colors[k][LANG])}" style="--sw:${B.colors[k].hex}" data-qc="${k}"></button>`).join('')}</div></fieldset>
        <fieldset class="buy__sizes"><legend class="buy__sl"><span><b>${esc(G.size)}:</b> <span data-qv-sname>${s}</span></span><a href="#tallas" class="u-link" data-size-guide>${esc(T.pdp.size_guide)}</a></legend>
          <div class="sizes">${p.sizes.map((k) => { const row = p.cat !== 'undershirts' && G.sizes && (G.sizes.rows || []).find((x) => x[0] === k); return `<button type="button" class="size${k === s ? ' is-on' : ''}" aria-pressed="${k === s}" data-qs="${k}"><b>${k}</b>${row ? `<span>${LANG === 'es' ? row[2] + ' cm' : row[1] + '″'}</span>` : ''}</button>`; }).join('')}</div></fieldset>
        ${rdonly ? `<a class="atc atc--wa" data-qv-wa href="${waHref(p, c, s)}" target="_blank" rel="noopener">${esc(T.card.wa)}</a><p class="buy__rdnote">Available in the Dominican Republic only</p>` : `<button type="button" class="atc" data-add data-id="${p.id}" data-color="${c}" data-size="${s}" data-qv-atc>${esc(G.add)}</button>${alt}`}
        <p class="buy__mission">${esc(T.pdp.mission)}</p>
      </div>
      <div class="qv__galw"><div class="qv__gal" data-qv-gal>${galHTML()}</div></div>`;
    const body = $('[data-qv-body]', r);
    const tpl = $('#qv-ctl'), galw = $('.qv__galw', body);
    if (tpl && galw) galw.appendChild(tpl.content.cloneNode(true));
    const qg = () => $('[data-qv-gal]', body);
    const qSlides = () => Array.from(qg().children);
    const qIdx = () => { const a = qSlides(); if (!a.length) return 0; const x = qg().scrollLeft, o = qg().offsetLeft; let best = 0; a.forEach((el, i) => { if (Math.abs(el.offsetLeft - o - x) < Math.abs(a[best].offsetLeft - o - x)) best = i; }); return best; };
    const qUpd = () => { const n = qSlides().length, i = qIdx(), cnt = $('[data-qv-count]', body); if (cnt) cnt.textContent = `${i + 1} / ${n}`; const pv = $('[data-qv-prev]', body), nx = $('[data-qv-next]', body); if (pv) pv.disabled = i <= 0; if (nx) nx.disabled = i >= n - 1; };
    const qGo = (d) => { const a = qSlides(), tg = a[Math.max(0, Math.min(a.length - 1, qIdx() + d))]; if (tg) qg().scrollTo({ left: tg.offsetLeft - qg().offsetLeft, behavior: RM ? 'auto' : 'smooth' }); };
    let qraf; qg().addEventListener('scroll', () => { cancelAnimationFrame(qraf); qraf = requestAnimationFrame(qUpd); }, { passive: true });
    body.onclick = (e) => {
      const qc = e.target.closest('[data-qc]');
      if (qc) {
        c = qc.dataset.qc;
        $$('[data-qc]', body).forEach((b) => b.setAttribute('aria-checked', b === qc));
        $('[data-qv-cname]', body).textContent = B.colors[c][LANG];
        const qa = $('[data-qv-atc]', body); if (qa) qa.dataset.color = c;
        $('[data-qv-page]', body).href = `product.html?p=${p.id}&c=${c}`;
        $('[data-qv-gal]', body).innerHTML = galHTML(); initMedia($('[data-qv-gal]', body)); qg().scrollLeft = 0; qUpd();
        if (LANG === 'es') { $('[data-qv-price]', body).textContent = money(p.rd[c]); $('[data-qv-pack]', body).textContent = packEs(p.rdPack[c]); }
      }
      if (e.target.closest('[data-qv-prev]')) qGo(-1);
      if (e.target.closest('[data-qv-next]')) qGo(1);
      const qs = e.target.closest('[data-qs]');
      if (qs) {
        s = qs.dataset.qs;
        $$('[data-qs]', body).forEach((b) => { b.classList.toggle('is-on', b === qs); b.setAttribute('aria-pressed', b === qs); });
        $('[data-qv-sname]', body).textContent = s; const qa2 = $('[data-qv-atc]', body); if (qa2) qa2.dataset.size = s;
      }
      const wa = $('[data-qv-wa]', body); if (wa) wa.href = waHref(p, c, s);
    };
    lastFocus = document.activeElement;
    r.classList.add('is-open'); r.setAttribute('aria-hidden', 'false'); lock(true); initMedia(r); qUpd();
    setTimeout(() => { const x = $('.qv__x', r); x && x.focus(); }, 60);
  }
  function initQV() {
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-qv]');
      if (b && !e.metaKey && !e.ctrlKey) { e.preventDefault(); const card = b.closest('[data-card]'); openQV(b.dataset.qv, card && card.dataset.cur); return; }
      if (e.target.closest('[data-qv-close]')) { closeQV(); lock(false); }
      // any add-to-bag closes sheets so the bag drawer is visible
      if (e.target.closest('[data-add]')) { closeQV(); $$('.modal.is-open').forEach((m) => m.classList.remove('is-open')); lock(false); }
    });
  }

  /* ── PDP ── */
  function initPDP() {
    const mount = $('[data-pdp-mount]'); if (!mount) return;
    const q = new URLSearchParams(location.search);
    const pid = q.get('p');
    let root = $('[data-pdp]', mount);
    if (pid && byId(pid) && root.dataset.id !== pid) {
      const tpl = document.getElementById('pdp-' + pid);
      if (tpl) { mount.innerHTML = ''; mount.appendChild(tpl.content.cloneNode(true)); root = $('[data-pdp]', mount); }
    }
    const p = byId(root.dataset.id); if (!p) return;
    const cdata = JSON.parse(root.dataset.c || '{}');
    document.title = p.name[LANG] + ' — Baronil';
    let c = q.get('c') && p.colors.includes(q.get('c')) ? q.get('c') : p.colors[0];
    let s = q.get('s') && p.sizes.includes(q.get('s')) ? q.get('s') : (p.sizes.includes('M') ? 'M' : p.sizes[0]);
    const strip = $('[data-gal-strip]', root), atc = $('[data-atc]', root), wa = $('[data-wa]', root);
    const sync = () => {
      if (atc) { atc.dataset.color = c; atc.dataset.size = s; }
      if (wa) wa.href = waHref(p, c, s);
      $('[data-cname]', root).textContent = cdata[c].name;
      $('[data-sname]', root).textContent = s;
      $$('[data-pc]', root).forEach((b) => b.setAttribute('aria-checked', b.dataset.pc === c ? 'true' : 'false'));
      $$('[data-ps]', root).forEach((b) => { const on = b.dataset.ps === s; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', on); });
      if (LANG === 'es') { const pr = $('[data-price]', root), pk = $('[data-pack]', root); if (pr) pr.textContent = cdata[c].price; if (pk) pk.textContent = cdata[c].pack; }
      $$('[data-line]', root).forEach((a) => { const sib = byId(a.dataset.line); const cc = sib && sib.colors.includes(c) ? c : ''; a.href = `product.html?p=${a.dataset.line}${cc ? '&c=' + cc : ''}&s=${s}`; });
      const u = new URL(location.href); u.searchParams.set('p', p.id); u.searchParams.set('c', c); history.replaceState(null, '', u);
      syncExtra();
    };
    const setGallery = () => {
      const d = cdata[c];
      let imgs = d.loop && d.imgs.length > 1 ? d.imgs.slice(1) : d.imgs.slice();
      const n0 = imgs.length + (d.loop ? 1 : 0);
      if (n0 < 2 && d.hover && d.hover !== imgs[0] && !/placeholder/.test(d.hover)) imgs.push(d.hover);
      if (imgs.length + (d.loop ? 1 : 0) < 2) imgs = imgs.concat(imgs);
      const vid = d.loop ? `<li class="gal__s gal__s--v"><img src="${d.lpo || d.imgs[0]}" alt="${esc(p.name[LANG])} — ${esc(d.name)}" width="1080" height="1350" decoding="async"><video class="media__v" autoplay muted loop playsinline preload="none" poster="${d.lpo || d.imgs[0]}" aria-hidden="true" tabindex="-1" data-autoplay data-src="${d.loop}"></video></li>` : '';
      strip.innerHTML = vid + imgs.map((u, i) => `<li class="gal__s"><img src="${u}" alt="${esc(p.name[LANG])} — ${esc(d.name)} (${i + 1})" width="1600" height="2000" ${i || vid ? 'loading="lazy"' : ''} decoding="async"></li>`).join('');
      const n = imgs.length + (vid ? 1 : 0);
      strip.scrollLeft = 0; $('[data-gal-dots]', root).innerHTML = Array.from({ length: n }, (_, i) => `<i${i ? '' : ' class="on"'}></i>`).join(''); galUpdate(); initMedia(strip);
    };
    const slides = () => $$('.gal__s', strip);
    const galIdx = () => { const w = slides()[0] ? slides()[0].getBoundingClientRect().width + 4 : 1; return Math.round(strip.scrollLeft / w); };
    function galUpdate() {
      const n = slides().length, i = Math.min(galIdx(), n - 1);
      $('[data-gal-count]', root).textContent = `${i + 1} / ${n}`;
      $$('[data-gal-dots] i', root).forEach((d, k) => d.classList.toggle('on', k === i));
      const pv = $('[data-gal-prev]', root), nx = $('[data-gal-next]', root);
      pv.disabled = i <= 0; nx.disabled = i >= n - 1;
    }
    const go = (d) => { const s0 = slides()[0]; if (!s0) return; strip.scrollTo({ left: (galIdx() + d) * (s0.getBoundingClientRect().width + 4), behavior: RM ? 'auto' : 'smooth' }); };
    $('[data-gal-prev]', root).addEventListener('click', () => go(-1));
    $('[data-gal-next]', root).addEventListener('click', () => go(1));
    let raf; strip.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(galUpdate); }, { passive: true });
    root.addEventListener('click', (e) => {
      const pc = e.target.closest('[data-pc]'); if (pc) { c = pc.dataset.pc; sync(); setGallery(); }
      const ps = e.target.closest('[data-ps]'); if (ps) { s = ps.dataset.ps; sync(); }
    });
    sync(); if (c !== p.colors[0]) setGallery(); else galUpdate();
    // related row: drop the current product so 4 others show
    const rel = $('[data-related]');
    if (rel) {
      const cur = $(`[data-card][data-id="${p.id}"]`, rel); cur && cur.remove();
      $$('[data-card]', rel).filter((c) => c.dataset.cat === p.cat).reverse().forEach((c) => $('.prow__head', rel).after(c));
    }
    function syncExtra() {
      const grids = $$('[data-feat-c]', mount);
      if (grids.length) { const has = grids.some((g) => g.dataset.featC === c); grids.forEach((g, i) => { g.hidden = has ? g.dataset.featC !== c : i > 0; }); initMedia($('[data-feat]', mount)); }
      $$('[data-pack-add]', mount).forEach((b) => { b.dataset.size = s; const sp = $('[data-pack-size]', b); if (sp) sp.textContent = s; });
      const sb = $('[data-sbar]', mount); if (!sb) return;
      const sa = $('[data-sbar-atc]', sb); if (sa) { sa.dataset.color = c; sa.dataset.size = s; }
      const sw = $('[data-sbar-wa]', sb); if (sw) sw.href = waHref(p, c, s);
      const meta = $('[data-sbar-meta]', sb); if (meta) meta.textContent = `${cdata[c].name} · ${G.size} ${s}`;
      const pr = $('[data-sbar-price]', sb); if (pr && LANG === 'es') pr.textContent = cdata[c].price;
      const im = $('[data-sbar-img]', sb); if (im) im.src = IMG(p.id, c, 'card');
    }
    // UGC chips switch the PDP colour, then bring the gallery into view
    $$('[data-pc-ext]', mount).forEach((b) => b.addEventListener('click', () => {
      const sw = $(`[data-pc="${b.dataset.pcExt}"]`, root); if (sw) sw.click();
      $('.pdp__gal', root).scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
    }));
    // FAQ: Amazon answer depends on the product
    $$('[data-faq-amz]').forEach((el) => { el.hidden = (el.dataset.faqAmz === 'yes') !== !!p.asin; });
    // sticky add-to-bag once the main CTA has scrolled away
    const sbar = $('[data-sbar]', mount), cta = $('[data-atc]', root) || $('.atc--wa', root);
    if (sbar && cta && 'IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        const on = !e.isIntersecting && e.boundingClientRect.top < 0;
        sbar.classList.toggle('is-on', on); sbar.setAttribute('aria-hidden', on ? 'false' : 'true');
        document.documentElement.classList.toggle('sbar-on', on);
      }).observe(cta);
    }
    syncExtra();
    // lightbox (click a slide or the zoom button; swipe/arrows/Esc)
    const lb = $('[data-lb]');
    if (lb) {
      const tr = $('[data-lb-track]', lb), cnt = $('[data-lb-count]', lb);
      const open = (i) => {
        const srcs = $$('.gal__s', strip).map((li) => { const v = $('video', li); return (v && (v.poster || '')) || ($('img', li) || {}).src; }).filter(Boolean);
        tr.innerHTML = srcs.map((u, k) => `<div class="lb__s"><img src="${u}" alt="${esc(p.name[LANG])} ${k + 1}"></div>`).join('');
        lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); lock(true);
        requestAnimationFrame(() => { tr.scrollLeft = (i || 0) * tr.clientWidth; upd(); });
        setTimeout(() => $('[data-lb-close]', lb).focus(), 50);
      };
      const close = () => { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); lock(false); };
      const upd = () => { const n = tr.children.length; cnt.textContent = n ? `${Math.round(tr.scrollLeft / tr.clientWidth) + 1} / ${n}` : ''; };
      tr.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true });
      $('[data-lb-close]', lb).addEventListener('click', close);
      $('[data-lb-prev]', lb).addEventListener('click', () => tr.scrollBy({ left: -tr.clientWidth, behavior: RM ? 'auto' : 'smooth' }));
      $('[data-lb-next]', lb).addEventListener('click', () => tr.scrollBy({ left: tr.clientWidth, behavior: RM ? 'auto' : 'smooth' }));
      lb.addEventListener('click', (e) => { if (e.target.classList.contains('lb__s')) close(); });
      document.addEventListener('keydown', (e) => { if (!lb.classList.contains('is-open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') tr.scrollBy({ left: tr.clientWidth }); if (e.key === 'ArrowLeft') tr.scrollBy({ left: -tr.clientWidth }); });
      root.addEventListener('click', (e) => {
        if (e.target.closest('[data-lb-open]')) { open(galIdx()); return; }
        const li = e.target.closest('.gal__s'); if (li) open($$('.gal__s', strip).indexOf(li));
      });
    }
    // recently viewed (per-browser convenience; safe if storage is blocked)
    const rv = $('[data-recent]');
    if (rv) {
      let ids = []; try { ids = JSON.parse(localStorage.getItem('baronil-recent-v3') || '[]'); } catch (e) { ids = []; }
      const others = ids.filter((x) => x !== p.id && byId(x)).slice(0, 6);
      try { localStorage.setItem('baronil-recent-v3', JSON.stringify([p.id, ...ids.filter((x) => x !== p.id)].slice(0, 8))); } catch (e) {}
      if (others.length) {
        $('[data-recent-track]', rv).innerHTML = others.map((id) => {
          const q = byId(id), cc = (T.card_c && T.card_c[id] && q.colors.includes(T.card_c[id])) ? T.card_c[id] : q.colors[0];
          const price = LANG === 'es' ? money(q.rd[cc]) : (q.asin && V.amz[id] ? V.amz[id].price : T.card.rd);
          return `<a class="rc" href="product.html?p=${id}&c=${cc}"><img src="${IMG(id, cc, 'card')}" alt="" width="720" height="900" loading="lazy"><b>${esc(q.name[LANG])}</b><span>${esc(price)}</span></a>`;
        }).join('');
        rv.hidden = false;
      }
    }
    if (root.hasAttribute('data-rdonly')) {
      const fa = $('.float__a'), ic = $('.atc--wa svg', root); if (fa) { fa.href = waHref(p, c); const sp = $('span', fa); if (sp) sp.textContent = T.card.wa; const old = $('svg', fa); if (old && ic) old.replaceWith(ic.cloneNode(true)); }
    }
  }

  /* ── Reviews (data: window.BARONIL_REVIEWS) ── */
  const STAR = '<svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2.6 2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.2l-5.8 3.2 1.2-6.5-4.8-4.5 6.5-.8z"/></svg>';
  const CHECK = (n) => `<svg width="${n}" height="${n}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="m7.5 12.3 3 3 6-6.3" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const PLAT = { instagram: 'Instagram', facebook: 'Facebook', google: 'Google', tiktok: 'TikTok', amazon: 'Amazon', youtube: 'YouTube', whatsapp: 'WhatsApp' };
  function pager(track, item, cnt, pv, nx) {
    if (!track || !cnt) return;
    const step = () => { const a = $(item, track); return a ? a.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : 300; };
    const per = () => Math.max(1, Math.round(track.clientWidth / step()));
    const upd = () => {
      const n = $$(item, track).length, pages = Math.max(1, Math.ceil(n / per()));
      const i = Math.min(pages, Math.round(track.scrollLeft / (step() * per())) + 1);
      cnt.textContent = `${i} / ${pages}`; pv.disabled = track.scrollLeft < 4; nx.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    pv.addEventListener('click', () => track.scrollBy({ left: -step() * per(), behavior: RM ? 'auto' : 'smooth' }));
    nx.addEventListener('click', () => track.scrollBy({ left: step() * per(), behavior: RM ? 'auto' : 'smooth' }));
    track.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true });
    window.addEventListener('resize', upd); upd();
  }
  function initReviews() {
    $$('[data-reviews]').forEach((sec) => {
      const track = $('[data-rev-track]', sec), vids = $('[data-rev-vids]', sec);
      const pdp = $('[data-pdp]'); const p = pdp ? byId(pdp.dataset.id) : null;
      if (p && track) { $$('.rv', track).filter((c) => c.dataset.prod === p.name[LANG]).reverse().forEach((c) => track.prepend(c)); }
      if (p && vids) { $$('.rvv', vids).filter((c) => (c.dataset.pids || '').split(' ').includes(p.id)).reverse().forEach((c) => vids.prepend(c)); }
      [track, vids].forEach((t) => { if (t) { t.scrollLeft = 0; requestAnimationFrame(() => { t.scrollLeft = 0; }); } });
      pager(track, '.rv', $('[data-rev-count]', sec), $('[data-rev-prev]', sec), $('[data-rev-next]', sec));
      pager(vids, '.rvv', $('[data-vrev-count]', sec), $('[data-vrev-prev]', sec), $('[data-vrev-next]', sec));
    });
  }


  /* ── Shop filters with URL state ── */
  function initShop() {
    const shop = $('[data-shop]'); if (!shop) return;
    const S = T.shop, keys = ['cat', 'fit', 'color', 'style'];
    const q = new URLSearchParams(location.search);
    const st = {}; keys.forEach((k) => (st[k] = new Set((q.get(k) || '').split(',').filter(Boolean))));
    const cards = $$('[data-card]', shop);
    const h = $('[data-shop-h]', shop), crumb = $('[data-shop-crumb]', shop);
    function apply(push) {
      let n = 0;
      cards.forEach((cd) => {
        const ok = (!st.cat.size || st.cat.has(cd.dataset.cat)) && (!st.fit.size || st.fit.has(cd.dataset.fit)) &&
          (!st.style.size || st.style.has(cd.dataset.style)) && (!st.color.size || cd.dataset.colors.split(' ').some((c) => st.color.has(c)));
        cd.classList.toggle('is-out', !ok); if (ok) n++;
        if (ok && st.color.size) { const c = cd.dataset.colors.split(' ').find((x) => st.color.has(x)); if (c && cd.dataset.cur !== c) setCardColor(cd, c); }
      });
      $$('[data-f]', shop).forEach((b) => b.setAttribute('aria-pressed', st[b.dataset.f].has(b.dataset.v)));
      $('[data-style-g]', shop).hidden = !st.style.size;
      $('[data-count]', shop).textContent = n; $('[data-count-l]', shop).textContent = n === 1 ? S.count1 : S.count;
      $('[data-empty]', shop).hidden = n > 0;
      const any = keys.some((k) => st[k].size); $('[data-clear]', shop).hidden = !any;
      // title follows the single active category/style
      const one = st.style.size === 1 ? [...st.style][0] : (st.cat.size === 1 && !st.fit.size ? [...st.cat][0] : '');
      const fitOne = !one && st.fit.size === 1 ? T.fitl[[...st.fit][0]] : '';
      h.textContent = (one && S.titles[one]) || fitOne || h.dataset.default;
      const hk = st.cat.size === 1 ? [...st.cat][0] : (st.style.has('sleeveless') ? 'undershirts' : (st.style.has('mini') ? 'briefs' : 'all'));
      const hero = $('[data-shop-hero]', shop);
      const sub = $('[data-shop-sub]', shop); if (sub) sub.textContent = (S.subs && S.subs[hk]) || sub.dataset.default;
      if (hero) { $$('[data-hero-k]', hero).forEach((sl) => sl.classList.toggle('is-on', sl.dataset.heroK === hk)); hero.classList.toggle('is-ink', !!$('.shop__slide.is-on.is-ink', hero)); }
      crumb.textContent = (one && S.titles[one]) || fitOne || T.pdp.crumb;
      const u = new URL(location.href); keys.forEach((k) => (st[k].size ? u.searchParams.set(k, [...st[k]].join(',')) : u.searchParams.delete(k)));
      history[push ? 'pushState' : 'replaceState'](null, '', u);
    }
    shop.addEventListener('click', (e) => {
      const f = e.target.closest('[data-f]');
      if (f) { const set = st[f.dataset.f]; set.has(f.dataset.v) ? set.delete(f.dataset.v) : set.add(f.dataset.v); apply(true); }
      if (e.target.closest('[data-clear]')) { keys.forEach((k) => st[k].clear()); apply(true); }
    });
    window.addEventListener('popstate', () => { const q2 = new URLSearchParams(location.search); keys.forEach((k) => (st[k] = new Set((q2.get(k) || '').split(',').filter(Boolean)))); apply(false); });
    apply(false);
  }

  /* ── Footer newsletter (front-end only) + floating pill ── */
  function initMisc() {
    $$('[data-news]').forEach((f) => f.addEventListener('submit', (e) => {
      e.preventDefault(); const i = $('input', f);
      if (!i.value || !/.+@.+\..+/.test(i.value)) { i.focus(); f.animate && !RM && f.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 260 }); return; }
      f.hidden = true; const ok = f.parentElement.querySelector('[data-news-ok]'); if (ok) ok.hidden = false;
    }));
    const fl = $('[data-float]');
    if (fl) {
      let gone = false; try { gone = sessionStorage.getItem('v3-float') === '0'; } catch (e) {}
      if (gone) fl.remove();
      else {
        $('[data-float-x]', fl).addEventListener('click', () => { fl.classList.add('is-hidden'); try { sessionStorage.setItem('v3-float', '0'); } catch (e) {} });
        const ftr = $('.ftr');
        if (ftr) new IntersectionObserver((es) => es.forEach((e) => fl.classList.toggle('is-hidden', e.isIntersecting))).observe(ftr);
      }
    }
  }

  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="radio"][tabindex],[role="button"][tabindex]')) { e.preventDefault(); e.target.click(); }
  });
  function boot() {
    initHeader(); initModals(); initCards(); initQV(); initPDP(); initMedia(); initBlobs(); initReviews(); initShop(); initMisc();
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
