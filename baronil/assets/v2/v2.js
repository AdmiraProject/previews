(function () {
  'use strict';
  var V = window.V2 || {}, B = window.BARONIL || { products: [], colors: {}, fits: {}, cats: {}, contact: {} };
  var LANG = V.lang === 'en' ? 'en' : 'es', EN = LANG === 'en', T = V.t || {};
  var A = '../../assets/';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mqDesk = window.matchMedia('(min-width: 1180px)');
  var mqLg = window.matchMedia('(min-width: 1024px)');
  var mqMob = window.matchMedia('(max-width: 767px)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var byId = function (id) { return B.products.filter(function (p) { return p.id === id; })[0]; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var money = function (n) { return 'RD$' + Number(n).toLocaleString('en-US'); };
  var packLabel = function (n) { return LANG === 'es' ? (n > 1 ? 'Paquete de ' + n : 'Unidad') : ''; };
  var imgOf = function (id, c, k) { return window.BARONIL_IMG ? window.BARONIL_IMG(id, c, k) : V.placeholder; };
  var waURL = function (msg) { return 'https://wa.me/' + (B.contact.whatsapp || V.wa) + '?text=' + encodeURIComponent(msg || T.wa_hello || ''); };
  var STAR = '<svg class="i" width="S" height="S" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3-4.7-4.4 6.4-.8L12 2.8Z"/></svg>';
  var CHECK = '<svg class="i" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="m7.5 12.2 3 3 6-6.4" fill="none" stroke="#fff" stroke-width="2"/></svg>';
  var CLOSE = '<svg class="i" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19" stroke="currentColor" stroke-width="2"/></svg>';
  function stars(r, s) {
    var one = STAR.replace(/S/g, s), row = '';
    for (var i = 0; i < 5; i++) row += one;
    return '<span class="stars" style="--r:' + (r / 5 * 100).toFixed(1) + '%" role="img" aria-label="' + r + ' / 5"><span class="stars__base">' + row + '</span><span class="stars__fill">' + row + '</span></span>';
  }
  function ratingHTML(p, s) {
    var a = V.amz && V.amz[p.id];
    if (a && a.rating) return '<span class="rating">' + stars(a.rating, s) + '<span class="rating__n">' + a.rating.toFixed(1) + '<span class="rating__c"> (' + a.count + ')</span> <span class="rating__src">Amazon</span></span></span>';
    if (EN && p.asin) return '<span class="rating rating--none" aria-hidden="true"></span>';
    return '<span class="rating">' + stars(5, s) + '<span class="rating__n">5.0' + (EN ? ' <span class="rating__src rating__src--ph">· customer reviews</span>' : '') + '</span></span>';
  }
  function priceHTML(p, c, full) {
    if (!EN) return '<span class="price__v">' + money(p.rd[c]) + '</span><span class="price__pack">' + packLabel(p.rdPack[c] || 1) + '</span>';
    var a = V.amz && V.amz[p.id];
    if (a && p.asin) return '<span class="price__v">' + a.price + '</span><span class="price__pack">' + esc(a.pack.en) + '</span>';
    return '<span class="price__flag">' + esc(full ? T.pdp.rd_only : (T.card.dr_line || T.pdp.rd_only)) + '</span>';
  }
  function priceNum(p) {
    if (!EN) return Math.min.apply(null, Object.keys(p.rd).map(function (k) { return p.rd[k]; }));
    var a = V.amz && V.amz[p.id];
    return a && p.asin ? parseFloat(String(a.price).replace(/[^0-9.]/g, '')) : 9999;
  }
  function toast(msg) {
    var el = $('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('is-on'); clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove('is-on'); }, 2200);
  }

  /* ---------- language switch keeps the query (?p=&c=, filters) ---------- */
  function syncLang() {
    $$('[data-lang-switch]').forEach(function (a) { var base = a.getAttribute('href').split('?')[0].split('#')[0]; a.setAttribute('href', base + location.search); });
  }

  /* ---------- header: mega menu (one sliding track) ---------- */
  function initMega() {
    var hdr = $('[data-hdr]'), mega = $('[data-mega]'), track = $('[data-mega-track]'), clip = $('[data-mega-clip]'), scrim = $('[data-scrim]');
    if (!hdr || !mega) return;
    var trig = $$('[data-mega-to]'), openI = -1, timer;
    function setH(i) { var pnl = $('[data-mega-panel="' + i + '"]'); if (pnl) clip.style.height = pnl.offsetHeight + 'px'; }
    function open(i) {
      if (!mqDesk.matches) return;
      clearTimeout(timer);
      if (openI === -1) { mega.classList.add('is-instant'); requestAnimationFrame(function () { requestAnimationFrame(function () { mega.classList.remove('is-instant'); }); }); }
      openI = i; track.style.setProperty('--i', i); setH(i);
      mega.classList.add('is-open'); mega.setAttribute('aria-hidden', 'false'); scrim.style.top = Math.max(0, hdr.getBoundingClientRect().bottom) + 'px'; scrim.hidden = false;
      trig.forEach(function (t) { var on = +t.dataset.megaTo === i; t.classList.toggle('is-active', on); t.setAttribute('aria-expanded', on ? 'true' : 'false'); });
    }
    function close() {
      openI = -1; mega.classList.remove('is-open'); mega.setAttribute('aria-hidden', 'true'); scrim.hidden = true;
      trig.forEach(function (t) { t.classList.remove('is-active'); t.setAttribute('aria-expanded', 'false'); });
    }
    trig.forEach(function (t) {
      t.addEventListener('mouseenter', function () { open(+t.dataset.megaTo); });
      t.addEventListener('focus', function () { open(+t.dataset.megaTo); });
    });
    $$('.hdr__link:not([data-mega-to])').forEach(function (l) { l.addEventListener('mouseenter', function () { if (openI > -1) timer = setTimeout(close, 120); }); l.addEventListener('focus', close); });
    hdr.addEventListener('mouseleave', function () { timer = setTimeout(close, 160); });
    hdr.addEventListener('mouseenter', function () { clearTimeout(timer); });
    scrim.addEventListener('mouseenter', close); scrim.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    $$('.mega a').forEach(function (a) { a.addEventListener('blur', function () { setTimeout(function () { if (!mega.contains(document.activeElement) && !(document.activeElement && document.activeElement.dataset && document.activeElement.dataset.megaTo)) close(); }, 0); }); });
    mqDesk.addEventListener('change', close);
  }

  /* mobile nav strip: chevron scrolls, fades out at the end */
  function initStrip() {
    var ul = $('[data-navstrip]'), more = $('[data-navmore]'); if (!ul || !more) return;
    var upd = function () { more.classList.toggle('is-end', ul.scrollLeft + ul.clientWidth >= ul.scrollWidth - 4); };
    ul.addEventListener('scroll', upd, { passive: true }); upd();
    more.addEventListener('click', function () { ul.scrollBy({ left: ul.clientWidth * .6, behavior: 'smooth' }); });
  }

  /* ---------- drawer ---------- */
  function initDrawer() {
    var d = $('[data-drawer]'); if (!d) return;
    var btn = $('[data-drawer-open]');
    function set(on) { d.classList.toggle('is-open', on); d.setAttribute('aria-hidden', on ? 'false' : 'true'); document.documentElement.classList.toggle('lock', on); if (btn) btn.setAttribute('aria-expanded', on ? 'true' : 'false'); if (on) { var x = $('[data-drawer-close]', d); x && x.focus(); } }
    btn && btn.addEventListener('click', function () { set(true); });
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-drawer-close]')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && d.classList.contains('is-open')) set(false); });
  }

  /* ---------- search takeover ---------- */
  function initSearch() {
    var s = $('[data-search]'); if (!s) return;
    var input = $('[data-search-in]', s), res = $('[data-search-res]', s), empty = $('[data-search-empty]', s), label = $('[data-search-label]', s);
    var best = B.products.filter(function (p) { return p.best; }).sort(function (a, b) { return a.best - b.best; });
    function card(p) { var c = p.colors[0]; return '<a class="sres" href="product.html?p=' + p.id + '&c=' + c + '"><div class="sres__img"><img src="' + imgOf(p.id, c, 'card') + '" alt="" loading="lazy"></div><p class="sres__n">' + esc(p.name[LANG]) + '</p><p class="sres__p">' + (EN ? (V.amz[p.id] && p.asin ? V.amz[p.id].price : T.card.rd_only) : money(p.rd[c])) + '</p></a>'; }
    function run() {
      var q = input.value.trim().toLowerCase();
      var list = q ? B.products.filter(function (p) { return (p.name.es + ' ' + p.name.en + ' ' + p.fabric[LANG] + ' ' + (B.cats[p.cat] || {})[LANG] + ' ' + p.fit).toLowerCase().indexOf(q) > -1; }) : best.slice(0, 4);
      label.hidden = !!q; res.innerHTML = list.slice(0, 8).map(card).join(''); empty.hidden = !q || list.length > 0;
    }
    function set(on) { s.classList.toggle('is-open', on); s.setAttribute('aria-hidden', on ? 'false' : 'true'); document.documentElement.classList.toggle('lock', on); if (on) { run(); setTimeout(function () { input.focus(); }, 60); } }
    $$('[data-search-open]').forEach(function (b) { b.addEventListener('click', function () { set(true); }); });
    s.addEventListener('click', function (e) { if (e.target === s || e.target.closest('[data-search-close]')) set(false); });
    input.addEventListener('input', run);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && s.classList.contains('is-open')) set(false); });
  }

  /* ---------- media slots: play in view, pause off-screen, poster-only under reduced motion ---------- */
  var vidIO = null;
  function watch(v) {
    if (v._w) return; v._w = true;
    if (mqMob.matches && v.dataset.posterM) v.poster = v.dataset.posterM;
    var on = function () { v.classList.add('is-playing'); var f = v.closest('.gal__tile--film'); if (f) f.classList.add('is-live'); };
    v._on = on;
    v.addEventListener('playing', on); v.addEventListener('loadeddata', function () { if (!v.paused) on(); });
    v.addEventListener('timeupdate', on, { once: true });
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); v.preload = 'none'; return; }
    if (!v.paused && v.readyState >= 2) on();
    if (!vidIO) { var pr = v.play(); if (pr) pr.then(on).catch(function () {}); return; }
    vidIO.observe(v);
  }
  function initMedia() {
    if (!reduce && 'IntersectionObserver' in window) {
      vidIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) { var v = e.target; if (e.isIntersecting && !v.closest('[hidden]') && !v.dataset.userPaused) { if (v.preload === 'none') v.preload = 'metadata'; var p = v.play(); if (p) p.then(function () { if (v._on) v._on(); }).catch(function () {}); } else v.pause(); });
      }, { rootMargin: '160px 0px', threshold: 0.01 });
    }
    $$('video.media__video').forEach(watch);
  }

  /* ---------- carousels (arrow-driven on desktop, native swipe on mobile) ---------- */
  function initCarousels(root) {
    $$('[data-carousel]', root).forEach(function (c) {
      if (c._init) return; c._init = true;
      var tr = $('[data-track]', c), prev = $('[data-prev]', c), next = $('[data-next]', c); if (!tr) return;
      function upd() { if (!prev) return; prev.disabled = tr.scrollLeft <= 4; next.disabled = tr.scrollLeft + tr.clientWidth >= tr.scrollWidth - 4; }
      function step() { var first = $$('.rail__card, .rcard', tr).filter(function (x) { return !x.hidden; })[0]; var w = first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(tr).columnGap || 0) : tr.clientWidth; return Math.max(w, Math.floor(tr.clientWidth / w) * w); }
      prev && prev.addEventListener('click', function () { tr.scrollBy({ left: -step(), behavior: 'smooth' }); });
      next && next.addEventListener('click', function () { tr.scrollBy({ left: step(), behavior: 'smooth' }); });
      tr.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd(); c._upd = upd;
    });
  }

  /* ---------- product cards: swatches swap image / price / links / quick-add colour ---------- */
  function setCardColor(card, c) {
    var sw = $('[data-sw="' + c + '"]', card); if (!sw) return;
    var id = card.dataset.id;
    $$('[data-sw]', card).forEach(function (b) { var on = b === sw; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', on ? 'true' : 'false'); });
    var im = $('[data-card-img]', card), al = $('[data-card-alt]', card);
    if (im) im.src = sw.dataset.img; if (al) al.src = sw.dataset.alt;
    if (typeof cardLoop === 'function') cardLoop(card, card._hov);
    var nm = $('[data-card-color]', card); if (nm) nm.textContent = sw.dataset.name;
    $$('[data-card-link]', card).forEach(function (a) { a.href = 'product.html?p=' + id + '&c=' + c; });
    $$('[data-add]', card).forEach(function (b) { b.dataset.color = c; });
    if (!EN && sw.dataset.price) {
      var pr = $('[data-card-price]', card); if (pr) pr.innerHTML = '<span class="price__v">' + sw.dataset.price + '</span><span class="price__pack">' + sw.dataset.pack + '</span>';
      var note = $('[data-card-note]', card); if (note) { note.textContent = sw.dataset.pack; note.hidden = +sw.dataset.packn < 2; }
    }
  }
  document.addEventListener('click', function (e) {
    var qv = e.target.closest('[data-card-qv]'); if (qv) { var qc = qv.closest('[data-card]'), qo = !qc.classList.contains('is-quick'); qc.classList.toggle('is-quick', qo); qv.setAttribute('aria-expanded', qo ? 'true' : 'false'); return; }
    var sw = e.target.closest('[data-sw]'); if (sw) { var card = sw.closest('[data-card]'); card && setCardColor(card, sw.dataset.sw); }
  });

  /* card hover: play the product loop (4:5, same backdrop) when the selected colour has one */
  function cardLoop(card, on) {
    var v = $('[data-card-loop]', card); if (!v || reduce) return;
    var sw = $('[data-sw].is-on', card), src = sw && sw.dataset.loop;
    if (!on || !src) { v.pause(); card.classList.toggle('is-looping', false); return; }
    if (v.getAttribute('data-cur') !== src) { v.setAttribute('data-cur', src); v.poster = sw.dataset.loopPoster || ''; v.src = src; }
    v.onplaying = function () { if (card.matches(':hover')) card.classList.toggle('is-looping', true); };
    var pr = v.play(); if (pr) pr.catch(function () {});
  }
  if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mouseover', function (e) { var c = e.target.closest && e.target.closest('[data-card]'); if (c && !c._hov) { c._hov = true; cardLoop(c, true); } });
    document.addEventListener('mouseout', function (e) { var c = e.target.closest && e.target.closest('[data-card]'); if (c && (!e.relatedTarget || !c.contains(e.relatedTarget))) { c._hov = false; cardLoop(c, false); } });
  }

  /* ---------- reviews (designed placeholder content from reviews.js) ---------- */
  var PLAT = { instagram: 'Instagram', google: 'Google', facebook: 'Facebook', tiktok: 'TikTok', amazon: 'Amazon', youtube: 'YouTube', whatsapp: 'WhatsApp' };
  var fmtDate = function (d) { try { return new Intl.DateTimeFormat(EN ? 'en-US' : 'es-DO', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d + 'T12:00:00')); } catch (e) { return d; } };
  // person ↔ clip by the review's photo (men wear their reviewed product): [clip, object-position, colour shown]
  var CLIP = { 'p01.jpg': ['ugc-05', '50% 35%', 'white'], 'p02.jpg': ['ugc-01', '50% 40%', 'white'], 'p03.jpg': ['ugc-02', '50% 88%', 'grey'], 'p04.jpg': ['ugc-06', '50% 40%', 'white'], 'p06.jpg': ['ugc-07', '50% 72%', 'navy'], 'p07.jpg': ['ugc-04', '50% 86%', 'navy'], 'p09.jpg': ['ugc-03', '50% 40%', 'navy'], 'p11.jpg': ['ugc-08', '50% 35%', ''] };
  function prodByName(n) { return B.products.filter(function (x) { return x.name[LANG] === n || x.name.es === n || x.name.en === n; })[0]; }
  function revCard(r) {
    var R = T.rev, c = CLIP[r.photo], prod = prodByName(r.product);
    var col = c && prod && prod.colors.indexOf(c[2]) > -1 ? c[2] : (prod ? prod.colors[0] : '');
    var link = prod ? '<a href="product.html?p=' + prod.id + '&c=' + col + '">' + esc(r.product) + '</a>' : '<b>' + esc(r.product) + '</b>';
    var head = c ? '<div class="rcard__clip" style="--cp:' + c[1] + '"><img src="' + A + 'vid/ugc/' + c[0] + '.jpg" alt="" loading="lazy"><video class="media__video" autoplay muted loop playsinline preload="none" poster="' + A + 'vid/ugc/' + c[0] + '.jpg" aria-hidden="true" tabindex="-1"><source src="' + A + 'vid/ugc/' + c[0] + '.mp4" type="video/mp4"></video></div>'
                 : '<div class="rcard__clip rcard__clip--ava"><img src="' + A + 'img/people/' + r.photo + '" alt="" loading="lazy"></div>';
    return '<article class="rcard">' + head + '<div class="rcard__in"><div class="rcard__top">' +
      '<div class="rcard__who"><p class="rcard__name">' + esc(r.name) + '</p><p class="rcard__city">' + esc(r.city) + '</p></div>' +
      '<img class="rcard__plat" src="' + A + 'img/social/' + r.platform + '-color.svg" alt="' + (PLAT[r.platform] || '') + '" width="24" height="24" loading="lazy"></div>' +
      '<div class="rcard__stars">' + stars(r.stars || 5, 16) + '<span class="rcard__date">' + fmtDate(r.date) + '</span></div>' +
      '<p class="rcard__t">' + esc(r.title) + '</p><p class="rcard__x">' + esc(r.text) + '</p>' +
      '<div class="rcard__foot"><span>' + R.bought + ': ' + link + '</span>' + (r.verified ? '<span class="rcard__ver">' + CHECK + R.verified + '</span>' : '') + '</div></div></article>';
  }
  function revRow(r) {
    var R = T.rev;
    return '<article class="rrow"><div class="rrow__who"><img class="rrow__ph" src="' + A + 'img/people/' + r.photo + '" alt="" width="46" height="46" loading="lazy"><p class="rrow__name">' + esc(r.name) + '</p>' +
      (r.verified ? '<p class="rrow__ver">' + CHECK + R.verified + '</p>' : '') +
      '<div class="rrow__meta"><p><b>' + (EN ? 'Location' : 'Ciudad') + ':</b> ' + esc(r.city) + '</p><p><b>' + R.bought + ':</b> ' + esc(r.product) + '</p><p><b>' + R.on + ':</b> <img src="' + A + 'img/social/' + r.platform + '-color.svg" alt="" width="15" height="15" loading="lazy">' + (PLAT[r.platform] || '') + '</p></div></div>' +
      '<div><div class="rrow__top">' + stars(r.stars || 5, 18) + '<span class="rrow__date">' + fmtDate(r.date) + '</span></div><p class="rrow__t">' + esc(r.title) + '</p><p class="rrow__x">' + esc(r.text) + '</p>' +
      '<div class="rrow__foot"><span class="rrow__rec">' + R.recommend + '</span><span class="rrow__help">' + R.helpful + ' <button type="button" aria-label="+1">&#9650;</button><button type="button" aria-label="-1">&#9660;</button></span></div></div></article>';
  }
  function reviewsList() { var R = window.BARONIL_REVIEWS; return (R && R[LANG]) ? R[LANG].slice() : []; }
  function initHomeReviews() {
    var el = $('[data-reviews="home"]'); if (!el) return;
    var list = reviewsList().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    el.innerHTML = list.map(revCard).join('');
    $$('video.media__video', el).forEach(watch);
    var car = el.closest('[data-carousel]'); car && car._upd && car._upd();
  }
  var pdpRev = { list: [], shown: 5, plat: '' };
  function renderPdpReviews() {
    var el = $('[data-reviews="pdp"]'); if (!el) return;
    var l = pdpRev.list.filter(function (r) { return !pdpRev.plat || r.platform === pdpRev.plat; });
    el.innerHTML = l.slice(0, pdpRev.shown).map(revRow).join('');
    var more = $('[data-rev-more]'); if (more) more.parentNode.hidden = l.length <= pdpRev.shown;
  }
  function initPdpReviews(p) {
    var el = $('[data-reviews="pdp"]'); if (!el) return;
    var full = (p.name[LANG] || '').toLowerCase(), nm = full.split(' ')[0];
    var score = function (r) { var x = r.product.toLowerCase(); return x === full ? 0 : (full.indexOf(x) === 0 || x.indexOf(full) === 0) ? 1 : x.indexOf(nm) > -1 ? 2 : 3; };
    pdpRev.list = reviewsList().sort(function (a, b) {
      var am = score(a), bm = score(b);
      return am - bm || (a.date < b.date ? 1 : -1);
    });
    var f = $('[data-rev-filters]');
    if (f && !f._init) {
      f._init = true;
      var plats = []; reviewsList().forEach(function (r) { if (plats.indexOf(r.platform) < 0) plats.push(r.platform); });
      f.innerHTML = '<button type="button" class="pill is-on" data-plat="">' + T.rev.all + '</button>' + plats.map(function (k) { return '<button type="button" class="pill" data-plat="' + k + '"><img src="' + A + 'img/social/' + k + '-color.svg" alt="" width="16" height="16">' + PLAT[k] + '</button>'; }).join('');
      f.addEventListener('click', function (e) { var b = e.target.closest('[data-plat]'); if (!b) return; pdpRev.plat = b.dataset.plat; pdpRev.shown = 5; $$('[data-plat]', f).forEach(function (x) { x.classList.toggle('is-on', x === b); }); renderPdpReviews(); });
      var more = $('[data-rev-more]'); more && more.addEventListener('click', function () { pdpRev.shown += 5; renderPdpReviews(); });
      el.addEventListener('click', function (e) { var b = e.target.closest('.rrow__help button'); if (b) b.classList.toggle('is-on'); });
    }
    renderPdpReviews();
  }

  /* ---------- newsletter + footer accordions ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-acc-btn]'); if (!b) return;
    var it = b.closest('.acc__i'), on = !it.classList.contains('is-open');
    it.classList.toggle('is-open', on); b.setAttribute('aria-expanded', on ? 'true' : 'false');
  });
  function initFooter() {
    $$('[data-news]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault(); var i = $('input[type=email]', f);
        if (!i.value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value)) { i.classList.add('is-err'); i.focus(); return; }
        i.classList.remove('is-err'); $('[data-news-ok]', f).hidden = false; i.value = '';
      });
    });
    $$('[data-ftr-acc]').forEach(function (b) { b.addEventListener('click', function () { if (mqLg.matches) return; var col = b.closest('.ftr__col'), on = !col.classList.contains('is-open'); col.classList.toggle('is-open', on); b.setAttribute('aria-expanded', on ? 'true' : 'false'); }); });
  }

  /* ---------- PDP ---------- */
  function initPDP() {
    var root = $('[data-pdp]'); if (!root) return;
    var P = T.pdp, qs = new URLSearchParams(location.search);
    var p = byId(qs.get('p')) || byId(root.dataset.pdp);
    var color = p.colors.indexOf(qs.get('c')) > -1 ? qs.get('c') : p.colors[0];
    var size = null, qty = 1;
    var TOPS = ['undershirts', 'ashirts'];
    var isTop = function (x) { return TOPS.indexOf(V.type[x.id]) > -1; };
    var atc = $('[data-atc]'), lab = $('[data-size-lab]'), stk = $('[data-sticky]'), stkBtn = $('[data-sticky-btn]');

    function priceStr() { return EN ? '' : ' · ' + money(p.rd[color] * qty); }
    function updATC() {
      atc.dataset.id = p.id; atc.dataset.color = color; atc.dataset.size = size || '';
      atc.classList.toggle('is-wait', !size); atc.innerHTML = '<span class="cta__label">' + (size ? P.add : P.choose) + '</span>';
      stkBtn.classList.toggle('is-wait', !size); stkBtn.innerHTML = '<span class="cta__label">' + (size ? P.sticky_add + priceStr() : P.sticky_choose) + '</span>';
      var wa = $('[data-pdp-wa]');
      var line = (T.pdp.wa_msg || '') + '\n• ' + qty + ' × ' + p.name[LANG] + ' — ' + B.colors[color][LANG] + (size ? ', ' + (EN ? 'size ' : 'talla ') + size : '') + (EN ? '' : ' (' + packLabel(p.rdPack[color] || 1) + ') — ' + money(p.rd[color] * qty));
      if (wa) wa.href = waURL(line);
      var alt = $('[data-pdp-alt]');
      if (alt) { alt.href = p.amazon || waURL(line); alt.innerHTML = (p.asin ? ICON_AMZ + P.amazon : ICON_WA + P.wa); var dn = $('[data-pdp-drnote]'); if (dn) dn.hidden = !!p.asin; }
    }
    var ICON_WA = '<svg class="i" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2Z"/></svg>';
    var amzSvg = $('[data-pdp-alt] svg'); var ICON_AMZ = amzSvg && p.asin ? amzSvg.outerHTML : '';
    if (!ICON_AMZ) { var tmp = $('.ftr__social a[aria-label="Amazon"] svg'); ICON_AMZ = tmp ? tmp.outerHTML.replace(/width="22" height="22"/, 'width="18" height="18"') : ''; }

    function gallery() {
      var track = $('[data-gal-track]'), gal = $('[data-gal]'), G = V.galx || {}, type = V.type[p.id], top = isTop(p);
      var e = (V.img[p.id] || {})[color] || {};
      var photos = (e.pdp && e.pdp.length ? e.pdp : [e.large || e.card, e.hover]).filter(function (x, i, a) { return x && a.indexOf(x) === i; });
      var DROP = V.galdrop || [], SWAP = V.galswap || {}, swaps = [];
      photos = photos.filter(function (x) { var d = DROP.filter(function (k) { return x.indexOf(k) > -1; })[0]; if (d && SWAP[d]) swaps.push(SWAP[d]); return !d; });
      // the studio product photo always leads (never a lifestyle shot that hides the garment)
      photos = photos.map(function (x, i) { return [x, i]; }).sort(function (a, b) { var sa = a[0].indexOf('/products/') > -1, sb = b[0].indexOf('/products/') > -1; return sa === sb ? a[1] - b[1] : (sa ? -1 : 1); }).map(function (x) { return x[0]; });
      if (!photos.length) photos = [V.placeholder];
      var tiles = photos.map(function (src) { return { k: 'img', src: src }; });
      if (e.loop) tiles.push({ k: 'vid', mp4: e.loop, img: e.loopPoster, pos: '50% 50%' });
      // fabric macro only where it IS this garment: white classic rib waistband / grey BXCC2-style woven-B band
      var macro = null;
      if (!top && color === 'white' && ['boxer-clasico', 'brief-clasico', 'brief-relax'].indexOf(p.id) > -1) macro = G.rib;
      if (!top && color === 'grey' && ['boxer-clasico', 'boxer-stretch'].indexOf(p.id) > -1) macro = G.waist;
      if (macro) tiles.push({ k: 'vid', mp4: V.A + macro.mp4, img: V.A + macro.img, pos: macro.pos });
      // detail crops of this colour's own high-res photo (waistband / hem / fabric · neckline / armhole / hem / fabric)
      var src0 = photos.filter(function (x) { return x.indexOf('/products/') > -1; })[0] || e.large || photos[0];
      swaps.forEach(function (sw) { tiles.splice(photos.length, 0, { k: 'zoom', src: src0, origin: sw[0], z: sw[1] }); });
      // gallery crops never repeat the "Detalles que se sienten" crops (waistband/fly/fabric · neckline/fabric)
      var crops = top ? [{ o: '84% 30%', z: 2.3 }, { o: '50% 88%', z: 2.0 }, { o: '16% 60%', z: 2.6 }, { o: '72% 72%', z: 2.4 }]
                      : [{ o: '50% 84%', z: 2.0 }, { o: '84% 50%', z: 2.4 }, { o: '16% 50%', z: 2.4 }, { o: '50% 60%', z: 1.5 }];
      // detail crops only to reach ≥4 tiles and an even count (2-col grid); never two crops when real photos suffice
      var ci = 0;
      while ((tiles.length < 4 || tiles.length % 2) && ci < crops.length) { tiles.splice(ci ? tiles.length : photos.length, 0, { k: 'zoom', src: src0, origin: crops[ci].o, z: crops[ci].z }); ci++; }
      var alt = esc(p.name[LANG] + ' — ' + B.colors[color][LANG]);
      track.innerHTML = tiles.map(function (t, i) {
        if (t.k === 'vid') return '<figure class="gal__tile gal__tile--film"><img class="gal__poster" src="' + t.img + '" alt="" loading="lazy" style="object-position:' + t.pos + '"><video class="media__video" autoplay muted loop playsinline preload="metadata" poster="' + t.img + '" style="object-position:' + t.pos + '" aria-hidden="true" tabindex="-1"><source src="' + t.mp4 + '" type="video/mp4"></video><button class="gal__vc' + (reduce ? ' is-paused' : '') + '" type="button" aria-label="' + (reduce ? (LANG === 'es' ? 'Reproducir video' : 'Play video') : (LANG === 'es' ? 'Pausar video' : 'Pause video')) + '"><svg class="i i--pause" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path fill="currentColor" d="M3 2h3v10H3zM8 2h3v10H8z"/></svg><svg class="i i--play" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path fill="currentColor" d="M3.5 2v10l8.5-5z"/></svg></button>' + (t.cap ? '<figcaption class="gal__cap">' + t.cap + '</figcaption>' : '') + '</figure>';
        return '<figure class="gal__tile' + (i === 0 ? ' gal__tile--lead' : '') + (t.k === 'zoom' ? ' gal__tile--zoom' : '') + '"><img src="' + t.src + '" alt="' + alt + '" width="800" height="1000"' + (i > 1 ? ' loading="lazy"' : '') + ' decoding="async"' + (t.k === 'zoom' ? ' style="transform-origin:' + t.origin + ';transform:scale(' + t.z + ')"' : '') + '></figure>';
      }).join('');
      $$('video', track).forEach(watch);
      var th = $('[data-gal-thumbs]');
      if (th) th.innerHTML = tiles.map(function (t, i) { return '<button type="button" class="' + (i ? '' : 'is-on') + (t.k === 'zoom' ? ' is-zoom' : '') + '" data-thumb="' + i + '" tabindex="-1"><img src="' + (t.k === 'vid' ? t.img : t.src) + '" alt="" loading="lazy"' + (t.k === 'zoom' ? ' style="transform-origin:' + t.origin + ';transform:scale(' + t.z + ')"' : '') + '></button>'; }).join('');
      track.scrollLeft = 0;
      var ct = $('[data-gal-count]'); if (ct) ct.textContent = '1 / ' + tiles.length;
      gal.classList.remove('is-open'); $('[data-gal-w]').classList.remove('is-open'); galBar(); fitGallery();
    }
    function fitGallery() {
      var w = $('[data-gal-w]'), gal = $('[data-gal]');
      w.classList.remove('is-short'); w.style.top = '';
      requestAnimationFrame(function () {
        var short = mqLg.matches && gal.scrollHeight <= 1394 + 8;
        w.classList.toggle('is-short', short);
        // short galleries stay pinned under the header (bottom-anchored when taller than the viewport)
        if (short) { var hh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr-h')) || 109; w.style.top = Math.min(hh + 16, window.innerHeight - w.offsetHeight - 24) + 'px'; }
      });
    }
    function galBar() {
      var tr = $('[data-gal-track]'), bar = $('[data-gal-bar]'); if (!tr || !bar) return;
      var sw = tr.scrollWidth || 1; bar.style.width = Math.min(100, tr.clientWidth / sw * 100) + '%'; bar.style.transform = 'translateX(' + (tr.scrollLeft / (tr.clientWidth || 1) * 100) + '%)';
    }
    window.addEventListener('resize', function () { clearTimeout(fitGallery._t); fitGallery._t = setTimeout(fitGallery, 150); });
    window.addEventListener('load', fitGallery);

    /* ===== PDP expansion (PDP_SPEC.md) ===== */
    var X = T.pdp2 || {}, UGCDATA = null;
    UGCDATA = (V.ugcdata && typeof V.ugcdata === 'object') ? V.ugcdata : null; // vid/ugc/products.json, inlined at build time when it exists
    function bigOf(id, c) { var e = (V.img[id] || {})[c] || {}; return e.large || (e.pdp && e.pdp[0]) || e.card || V.placeholder; }
    function cardOf(id, c) { var e = (V.img[id] || {})[c] || {}; return e.card || V.placeholder; }
    function xFeat() {
      var el = $('[data-x-feat]'); if (!el) return;
      var big = bigOf(p.id, color), F = (V.feat || {})[p.id] || [];
      el.innerHTML = F.map(function (f, i) {
        var tpl = $('[data-x-labelstamp]'), media = f[0] === 'label' ? '<div class="xfeat__media xfeat__media--icon">' + (tpl ? tpl.innerHTML : '') + '</div>'
          : '<div class="xfeat__media"><img src="' + big + '" alt="" loading="lazy" decoding="async" style="transform-origin:' + f[1] + ';transform:scale(' + f[2] + ')"></div>';
        var c = (X.feat || {})[f[0]] || ['', ''];
        return '<article class="xfeat__card">' + media + '<h3 class="xfeat__t">' + esc(c[0]) + '</h3><p class="xfeat__d">' + esc(c[1]) + '</p></article>';
      }).join('');
      var lv = $('[data-x-love]');
      if (lv) lv.innerHTML = F.map(function (f) { var c = (X.feat || {})[f[0]] || ['', '']; return '<li>' + CHECK + '<span><b>' + esc(c[0]) + '</b> · ' + esc(c[1]) + '</span></li>'; }).join('');
    }
    var ICON_LABEL = null;
    function normUgc(list) {
      return (list || []).map(function (x) {
        if (typeof x === 'string') x = { mp4: x };
        var mp4 = x.mp4 || x.src || x.video || x.file || x.loop || '', poster = x.poster || x.jpg || x.still || '';
        var fix = function (u) { return !u ? '' : /^(https?:|\.\.\/)/.test(u) ? u : (/^(vid|img)\//.test(u) ? A + u : A + 'vid/ugc/' + u); };
        if (mp4 && !/\.mp4$/.test(mp4)) mp4 += '.mp4';
        if (!poster && mp4) poster = mp4.replace(/\.mp4$/, '.jpg');
        return { mp4: fix(mp4), poster: fix(poster), color: x.color || x.colour || '', alt: x['alt_' + LANG] || '' };
      }).filter(function (x) { return x.mp4; });
    }
    function xUgc() {
      var el = $('[data-x-ugc]'), sec = $('[data-x-ugcsec]'); if (!el || !sec) return;
      var list = UGCDATA && UGCDATA[p.id] ? normUgc(UGCDATA[p.id].clips || UGCDATA[p.id]) : ((V.ugcmap || {})[p.id] || []).map(function (u) { return { mp4: A + 'vid/ugc/' + u[0] + '.mp4', poster: A + 'vid/ugc/' + u[0] + '.jpg', color: u[1] }; });
      // the colour on screen first
      list.sort(function (a, b) { return (a.color === color ? 0 : 1) - (b.color === color ? 0 : 1); });
      sec.hidden = !list.length;
      var share = $('.xugc__share', el); share = share ? share.outerHTML : '';
      el.innerHTML = list.map(function (u) {
        var c = B.colors[u.color], ok = c && p.colors.indexOf(u.color) > -1;
        return '<figure class="xugc__card"><img class="xugc__poster" src="' + u.poster + '" alt="' + esc(u.alt || '') + '" loading="lazy"><video class="media__video" autoplay muted loop playsinline preload="none" poster="' + u.poster + '" aria-hidden="true" tabindex="-1"><source src="' + u.mp4 + '" type="video/mp4"></video>' +
          (ok ? '<figcaption class="xugc__cap"><button type="button" class="xugc__chip" data-x-color="' + u.color + '"><span class="xugc__dot' + (u.color === 'white' ? ' sw--light' : '') + '" style="--sw:' + c.hex + '"></span>' + esc(X.ugc_wear) + ' ' + esc(c[LANG]) + '</button></figcaption>' : '') + '</figure>';
      }).join('') + share;
      $$('video', el).forEach(watch);
      var car = sec; if (car._upd) car._upd(); else { car._init = false; initCarousels(sec.parentNode); }
      el.scrollLeft = 0;
    }
    function xFits() {
      var el = $('[data-x-fits]'); if (!el) return;
      el.innerHTML = Object.keys(B.fits).map(function (k) {
        var f = B.fits[k], rep = k === p.fit ? p : (B.products.filter(function (x) { return x.fit === k && x.cat === p.cat; })[0] || B.products.filter(function (x) { return x.fit === k; })[0]);
        return '<a class="xfit' + (k === p.fit ? ' is-on' : '') + '" href="product.html?p=' + rep.id + '&c=' + rep.colors[0] + '"><span class="xfit__img"><img src="' + cardOf(rep.id, rep.colors[0]) + '" alt="" loading="lazy"></span><span class="xfit__body">' + (k === p.fit ? '<span class="xfit__cur">' + esc(X.fits_cur) + '</span>' : '') + '<b class="xfit__t">' + esc(f[LANG]) + '</b><span class="xfit__d">' + esc(f.d[LANG]) + '</span><span class="xfit__l">' + esc(X.fits_see) + ' ' + esc(rep.name[LANG]) + '</span></span></a>';
      }).join('');
    }
    function xPacks() {
      var el = $('[data-x-packs]'), sec = $('[data-x-packsec]'); if (!el || !sec) return;
      var html = '', n = 0;
      if (!EN) {
        p.colors.forEach(function (c) {
          var k = p.rdPack[c] || 1, pr = p.rd[c]; n++;
          html += '<div class="xpack' + (c === color ? ' is-on' : '') + '"><span class="xpack__img"><img src="' + cardOf(p.id, c) + '" alt="" loading="lazy"></span><div class="xpack__b"><p class="xpack__t">' + packLabel(k) + ' · ' + esc(B.colors[c].es) + '</p><p class="xpack__p"><b>' + money(pr) + '</b>' + (k > 1 ? '<span>' + money(Math.round(pr / k)) + ' ' + esc(X.pack_unit) + '</span>' : '') + '</p>' +
            '<button type="button" class="btn btn--dark-2 xpack__btn" data-x-pack="' + c + '">' + esc(X.pack_add) + '</button></div></div>';
        });
      } else if (p.asin && V.amz[p.id]) {
        var a = V.amz[p.id]; n = 2;
        html = '<div class="xpack is-on xpack--amz"><span class="xpack__img"><img src="' + cardOf(p.id, color) + '" alt="" loading="lazy"></span><div class="xpack__b"><p class="xpack__t">' + esc(a.pack.en) + '</p><p class="xpack__p"><b>' + esc(a.price) + '</b>' + (a.priceAlt ? '<span>' + esc(a.priceAlt) + '</span>' : '') + '</p><a class="btn btn--dark xpack__btn" href="' + p.amazon + '" target="_blank" rel="noopener">' + esc(X.pack_add) + '</a></div></div>';
      }
      el.innerHTML = html; el.classList.toggle('xpacks__grid--one', EN); sec.hidden = n < 2 || (!EN && !p.colors.some(function (c) { return (p.rdPack[c] || 1) > 1; }));
    }
    function xCmp() {
      var el = $('[data-x-cmp]'); if (!el) return;
      var sib = B.products.filter(function (x) { return x.cat === p.cat; }), R0 = X.cmp_rows || [];
      var KEYS = ['fit', 'fabric', 'fly', 'leg', 'colors', 'sizes', 'price', 'where'];
      if (isTop(p)) KEYS = KEYS.filter(function (k) { return k !== 'fly' && k !== 'leg'; });
      var LAB = { fit: R0[0], fabric: R0[1], fly: X.cmp_fly, leg: X.cmp_leg, colors: R0[2], sizes: R0[3], price: R0[4], where: R0[5] };
      var R = KEYS.map(function (k) { return LAB[k]; });
      var hasF = function (x, f) { return ((V.feat || {})[x.id] || []).some(function (r) { return r[0] === f; }); };
      var cOf = function (x) { return x.id === p.id ? color : x.colors[0]; };
      var cell = function (x, ii) {
        var k = KEYS[ii];
        if (k === 'fly') return hasF(x, 'fly') ? esc(X.cmp_yes) : '—';
        if (k === 'leg') return (hasF(x, 'hem') || /double-stitched/i.test(x.blurb.en)) ? esc((X.feat.hem || [])[0] || '') : '—';
        var i = ['fit', 'fabric', 'colors', 'sizes', 'price', 'where'].indexOf(k);
        if (i === 0) return esc(B.fits[x.fit][LANG]);
        if (i === 1) return esc(x.fabric[LANG]);
        if (i === 2) return '<span class="xcmp__sws">' + x.colors.map(function (c) { return '<i class="' + (c === 'white' ? 'sw--light' : '') + '" style="--sw:' + B.colors[c].hex + '" title="' + esc(B.colors[c][LANG]) + '"></i>'; }).join('') + '</span>';
        if (i === 3) return x.sizes.join(' · ');
        if (i === 4) return EN ? (x.asin && V.amz[x.id] ? esc(V.amz[x.id].price) : esc(T.card.dr_line)) : esc(X.cmp_from) + ' ' + money(Math.min.apply(null, Object.keys(x.rd).map(function (k) { return x.rd[k]; })));
        return '<span class="xcmp__where">' + esc(X.cmp_where_rd) + (x.asin ? '<br>' + esc(X.cmp_where_us) : '') + '</span>';
      };
      el.innerHTML = '<table class="xcmp__t"><thead><tr><th scope="col"><span class="sr">—</span></th>' + sib.map(function (x) {
        return '<th scope="col" class="' + (x.id === p.id ? 'is-on' : '') + '"><a href="product.html?p=' + x.id + '&c=' + cOf(x) + '"><span class="xcmp__img"><img src="' + cardOf(x.id, cOf(x)) + '" alt="" loading="lazy"></span><b>' + esc(x.name[LANG]) + '</b></a>' + (x.id === p.id ? '<span class="xcmp__cur">' + esc(X.cmp_cur) + '</span>' : '') + '</th>';
      }).join('') + '</tr></thead><tbody>' + R.map(function (r, i) { return '<tr><th scope="row">' + esc(r) + '</th>' + sib.map(function (x) { return '<td class="' + (x.id === p.id ? 'is-on' : '') + '">' + cell(x, i) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
    }
    function xSize() {
      var tp = isTop(p);
      $$('[data-measure]').forEach(function (s) { s.toggleAttribute('hidden', (s.dataset.measure === 'top') !== tp); });
      var st = $('[data-x-steps]'); if (st) st.innerHTML = (tp ? X.size_steps_top : X.size_steps_bottom).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
    }
    function xDeliv() {
      var us = $('[data-x-us]'); if (us) us.hidden = !p.asin;
      var lnk = us && $('a', us); if (lnk) lnk.href = p.amazon || '#';
      $$('[data-faq="us"]').forEach(function (d) { d.hidden = !p.asin; });
    }
    function xSticky() {
      var im = $('[data-stk-img]'); if (im) im.src = cardOf(p.id, color);
      var nm = $('[data-stk-name]'); if (nm) nm.textContent = p.name[LANG];
      var mt = $('[data-stk-meta]'); if (mt) mt.textContent = B.colors[color][LANG] + (size ? ' · ' + (EN ? 'Size ' : 'Talla ') + size : '');
      var pr = $('[data-stk-price]'); if (pr) pr.innerHTML = priceHTML(p, color);
    }
    function xLd() {
      var el = $('[data-x-ld]'); if (!el) return;
      var a = V.amz[p.id], d = { '@context': 'https://schema.org', '@type': 'Product', name: p.name[LANG], brand: { '@type': 'Brand', name: 'Baronil' }, sku: p.code, description: ((V.blurb && V.blurb[p.id]) || p.blurb)[LANG], material: p.fabric[LANG], color: B.colors[color][LANG], countryOfOrigin: 'DO', image: [bigOf(p.id, color)] };
      d.offers = (EN && p.asin && a) ? { '@type': 'Offer', priceCurrency: 'USD', price: String(a.price).replace('$', ''), url: p.amazon, seller: { '@type': 'Organization', name: 'Amazon.com' } } : { '@type': 'Offer', priceCurrency: 'DOP', price: p.rd[color], seller: { '@type': 'Organization', name: 'Baronil · Puntex SRL' } };
      if (a && a.rating) d.aggregateRating = { '@type': 'AggregateRating', ratingValue: a.rating, ratingCount: a.count };
      el.textContent = JSON.stringify(d);
    }
    var RKEY = 'baronil-v2-recent';
    function xRecent() {
      var list = [];
      try { list = JSON.parse(localStorage.getItem(RKEY) || '[]'); } catch (e) { list = []; }
      list = list.filter(function (x) { return x && x.id !== p.id && byId(x.id); });
      var sec = $('[data-x-recent]'), tr = $('[data-x-recenttrack]');
      if (sec && tr) {
        var cards = $$('[data-card]', tr);
        cards.forEach(function (c) { c.hidden = true; });
        list.slice(0, 8).forEach(function (x) { var c = cards.filter(function (k) { return k.dataset.id === x.id; })[0]; if (c) { c.hidden = false; tr.appendChild(c); if (x.c) setCardColor(c, x.c); } });
        sec.hidden = !list.length;
        if (sec._upd) sec._upd();
      }
      try { var all = [{ id: p.id, c: color }].concat(list).slice(0, 10); localStorage.setItem(RKEY, JSON.stringify(all)); } catch (e) {}
    }
    function renderX() { xFeat(); xUgc(); xFits(); xPacks(); xCmp(); xSize(); xDeliv(); xSticky(); xLd(); }
    function render(first) {
      document.title = p.name[LANG] + ' — Baronil';
      var type = V.type[p.id], crumb = $('[data-pdp-crumb]');
      if (crumb) { crumb.href = 'shop.html?cat=' + type; crumb.textContent = T.shop.cat_titles[type]; }
      $('[data-pdp-crumbname]').textContent = p.name[LANG];
      $('[data-pdp-eyebrow]').textContent = p.isNew ? P.eyebrow_new : (p.best && p.best <= 3 ? P.eyebrow_best : P.eyebrow);
      $('[data-pdp-name]').textContent = p.name[LANG];
      $('[data-pdp-price]').innerHTML = priceHTML(p, color, true);
      var phHide = EN && p.asin && !(V.amz[p.id] && V.amz[p.id].rating);
      $('[data-pdp-rating]').innerHTML = ratingHTML(p, 18); $('[data-pdp-rating]').hidden = phHide; var bsep = $('.buy__sep'); if (bsep) bsep.hidden = phHide || (EN && !p.asin);
      $('[data-pdp-colorname]').textContent = B.colors[color][LANG];
      $('[data-pdp-colors]').innerHTML = p.colors.map(function (c) { return '<button type="button" class="sw sw--lg' + (c === color ? ' is-on' : '') + (c === 'white' ? ' sw--light' : '') + '" role="radio" aria-checked="' + (c === color) + '" aria-label="' + esc(B.colors[c][LANG]) + '" style="--sw:' + B.colors[c].hex + '" data-c="' + c + '"><img src="' + cardOf(p.id, c) + '" alt="" width="31" height="31"></button>'; }).join('');
      if (size && p.sizes.indexOf(size) < 0) size = null;
      $('[data-pdp-sizes]').innerHTML = p.sizes.map(function (s) { return '<label class="size' + (s === size ? ' is-on' : '') + '" data-s="' + s + '"><input class="sr" type="radio" name="pdp-size" value="' + s + '"' + (s === size ? ' checked' : '') + '>' + s + '</label>'; }).join('');
      lab.innerHTML = size ? '<b>' + P.size + ':</b> ' + size : '<b>' + P.select_size + '</b>';
      $('[data-pdp-blurb]').textContent = ((V.blurb && V.blurb[p.id]) || p.blurb)[LANG];
      $('[data-pdp-bullets]').innerHTML = (isTop(p) ? P.bullets_top : P.bullets_bottom).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');
      $('[data-pdp-code]').textContent = p.code;
      $('[data-pdp-fabric]').textContent = p.fabric[LANG];
      $('[data-pdp-fitname]').textContent = B.fits[p.fit][LANG];
      $('[data-pdp-fitd]').textContent = B.fits[p.fit].d[LANG];
      var w = $('[data-pdp-write]'); if (w) w.href = waURL((P.review_msg || '') + ' ' + p.name[LANG]);
      var sn = $('[data-pdp-sizenote]'); if (sn) sn.textContent = isTop(p) ? P.fit_note_top : P.fit_note;
      $$('[data-pdp-table]').forEach(function (t) { t.hidden = isTop(p); });
      var tn = $('[data-pdp-topnote]'); if (tn) tn.hidden = !isTop(p);
      var amz = V.amz && V.amz[p.id], avg = $('[data-prev-avg]'), al = $('[data-prev-amz]');
      if (al) { al.hidden = !(amz && amz.rating); if (amz && amz.rating) { al.href = p.amazon; al.innerHTML = '<b>Amazon US:</b> ' + stars(amz.rating, 16) + '<span>' + amz.rating.toFixed(1) + ' (' + amz.count + ')</span><span aria-hidden="true">→</span>'; } }
      var pv = $('.prev'); if (pv) pv.classList.toggle('prev--amz', !!(amz && amz.rating));
      var drOnly = EN && !p.asin;
      var pr = $('[data-pdp-promo]'); if (pr) pr.textContent = drOnly ? P.promo_dr : P.promo;
      var shp = $('[data-pdp-ship]'); if (shp) shp.textContent = drOnly ? P.ship_dr : P.ship;
      var sa = $('[data-pdp-shipalt]'); if (sa) sa.hidden = drOnly;
      var pf = $('[data-pvp-first]'), pd = $('[data-pvp-dr]'); if (pf && pd) { pf.hidden = drOnly; pd.hidden = !drOnly; if (drOnly) pf.parentNode.insertBefore(pd, pf); }
      var fine = $('[data-pdp-fine]'); if (fine) fine.innerHTML = (EN && !p.asin) ? esc(P.info_dr) : P.info1 + (P.info2 ? '<br>' + P.info2 : '');
      // complete the look: tops ↔ bottoms
      var shown = 0, wantTop = !isTop(p);
      $$('[data-mini]').forEach(function (m) { var ok = m.dataset.mini !== p.id && (m.dataset.top === '1') === wantTop && shown < 4; m.hidden = !ok; if (ok) shown++; });
      // carousel: hide current product
      $$('.rail--pdp [data-card]').forEach(function (c) { c.hidden = c.dataset.id === p.id; });
      gallery(); updATC(); initPdpReviews(p); renderX();
      if (!first) history.replaceState(null, '', '?p=' + p.id + '&c=' + color + location.hash);
      syncLang();
    }
    var initialColor = color;
    render(true); xRecent();
    if (location.search.indexOf('c=') < 0 && location.search.indexOf('p=') > -1) history.replaceState(null, '', '?p=' + p.id + '&c=' + initialColor + location.hash);

    document.addEventListener('click', function (e) {
      var c = e.target.closest('[data-pdp-colors] [data-c]'); if (c) { color = c.dataset.c; render(); return; }
      var xc = e.target.closest('[data-x-color]'); if (xc && p.colors.indexOf(xc.dataset.xColor) > -1) { color = xc.dataset.xColor; render(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var xp = e.target.closest('[data-x-pack]');
      if (xp) { if (!size) { lab.classList.add('is-err'); $('[data-pdp-sizes]').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); toast(P.choose); return; } window.BaronilBag && window.BaronilBag.add({ id: p.id, color: xp.dataset.xPack, size: size, qty: 1 }); return; }
      var s = e.target.closest('[data-pdp-sizes] [data-s]');
      if (s) { size = s.dataset.s; $$('[data-pdp-sizes] [data-s]').forEach(function (b) { b.classList.toggle('is-on', b === s); var ip = $('input', b); if (ip) ip.checked = b === s; }); lab.classList.remove('is-err'); lab.innerHTML = '<b>' + P.size + ':</b> ' + size; updATC(); xSticky(); return; }
      var q = e.target.closest('[data-qty]'); if (q) { qty = Math.max(1, Math.min(20, qty + (+q.dataset.qty))); $('[data-qty-v]').textContent = qty; updATC(); return; }
      if (e.target.closest('[data-atc]') || e.target.closest('[data-sticky-btn]')) {
        if (!size) { lab.classList.add('is-err'); var g = $('[data-pdp-sizes]'); g.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); var fb = $('[data-s]', g); fb && fb.focus({ preventScroll: true }); return; }
        window.BaronilBag && window.BaronilBag.add({ id: p.id, color: color, size: size, qty: qty }); return;
      }
      var mo = e.target.closest('[data-mini-open]'); if (mo) { var box = $('[data-mini-sizes]', mo.parentNode); var on = box.hidden; $$('[data-mini-sizes]').forEach(function (x) { x.hidden = true; }); box.hidden = !on; mo.setAttribute('aria-expanded', on ? 'true' : 'false'); return; }
      if (e.target.closest('[data-mini-sizes] [data-add]')) { $$('[data-mini-sizes]').forEach(function (x) { x.hidden = true; }); }
      var w = e.target.closest('[data-wish]'); if (w) { e.preventDefault(); var pr = w.getAttribute('aria-pressed') === 'true'; w.setAttribute('aria-pressed', pr ? 'false' : 'true'); toast(pr ? (EN ? 'Removed from saved' : 'Quitado de guardados') : (EN ? 'Saved for later' : 'Guardado')); return; }
      if (e.target.closest('[data-gal-more]')) { $('[data-gal-w]').classList.add('is-open'); $('[data-gal]').classList.add('is-open'); return; }
      var vc = e.target.closest('.gal__vc'); if (vc) { var vv = $('video', vc.parentNode); if (vv.paused) { delete vv.dataset.userPaused; vv.play(); } else { vv.dataset.userPaused = '1'; vv.pause(); } var ps = vv.paused; vc.classList.toggle('is-paused', ps); vc.setAttribute('aria-label', ps ? (LANG === 'es' ? 'Reproducir video' : 'Play video') : (LANG === 'es' ? 'Pausar video' : 'Pause video')); return; }
      var th = e.target.closest('[data-thumb]'); if (th) { var tr = $('[data-gal-track]'); tr.scrollTo({ left: tr.clientWidth * +th.dataset.thumb, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var tile = e.target.closest('.gal__tile:not(.gal__tile--film)'); if (tile && tile.closest('[data-gal-track]')) { openLb(tile); return; }
      var tab = e.target.closest('[data-tab]'); if (tab) { $$('[data-tab]').forEach(function (b) { var on = b === tab; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); $('#' + b.getAttribute('aria-controls')).hidden = !on; }); }
    });
    // thumbs follow the mobile swiper
    var tr = $('[data-gal-track]');
    tr.addEventListener('scroll', function () { galBar(); if (mqLg.matches) return; var i = Math.round(tr.scrollLeft / tr.clientWidth); $$('[data-thumb]').forEach(function (b) { b.classList.toggle('is-on', +b.dataset.thumb === i); }); var ct = $('[data-gal-count]'); if (ct) ct.textContent = (i + 1) + ' / ' + $$('.gal__tile', tr).length; }, { passive: true });
    // sticky add-to-bag once the in-flow ATC scrolls away (mobile only via CSS)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { var on = !e.isIntersecting && e.boundingClientRect.top < 0; stk.classList.toggle('is-on', on); stk.setAttribute('aria-hidden', on ? 'false' : 'true'); }); }).observe($('[data-atc-zone]'));
    }
    // size guide dialog + #guia/#guide deep link
    var dlg = $('[data-guide]');
    $$('[data-guide-open]').forEach(function (b) { b.addEventListener('click', function () { if (dlg.showModal) dlg.showModal(); else { var d = $('#guia, #guide'); d.classList.add('is-open'); d.scrollIntoView(); } }); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('[data-guide-close]')) dlg.close(); });
    var h = location.hash.slice(1); if (h) { var d = document.getElementById(h); if (d && d.classList.contains('acc__i')) { d.classList.add('is-open'); var bb = $('[data-acc-btn]', d); if (bb) bb.setAttribute('aria-expanded', 'true'); setTimeout(function () { d.scrollIntoView({ block: 'center' }); }, 300); } }
    document.addEventListener('click', function (e) { if (!e.target.closest('.mini')) $$('[data-mini-sizes]').forEach(function (x) { x.hidden = true; }); }, true);
  }

  /* lightbox: every gallery tile, arrows, counter, swipe, Esc */
  function openLb(tile) {
    var tiles = $$('.gal__tile', $('[data-gal-track]')), items = tiles.map(function (f) {
      var v = $('video source', f), im = $('img', f);
      return v ? { k: 'v', src: v.getAttribute('src'), poster: im ? im.getAttribute('src') : '' } : { k: 'i', src: im.getAttribute('src'), alt: im.alt, z: im.style.transform, o: im.style.transformOrigin };
    }), i = tiles.indexOf(tile);
    var lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<div class="lb__stage" data-lb-stage></div><p class="lb__count" data-lb-count></p><button class="lb__x" type="button" aria-label="Close">&times;</button><button class="lb__nav lb__nav--p" type="button" aria-label="Prev">&#8249;</button><button class="lb__nav lb__nav--n" type="button" aria-label="Next">&#8250;</button>';
    var stage = $('[data-lb-stage]', lb);
    function show() {
      var it = items[i];
      stage.innerHTML = it.k === 'v' ? '<video src="' + it.src + '" poster="' + it.poster + '" muted loop playsinline ' + (reduce ? '' : 'autoplay') + '></video>' : '<img src="' + it.src + '" alt="' + esc(it.alt || '') + '"' + (it.z ? ' style="transform:' + it.z + ';transform-origin:' + it.o + '"' : '') + '>';
      $('[data-lb-count]', lb).textContent = (i + 1) + ' / ' + items.length;
    }
    function go(d) { i = (i + d + items.length) % items.length; show(); }
    function close() { if (lb.parentNode) lb.parentNode.removeChild(lb); document.documentElement.classList.remove('lock'); document.removeEventListener('keydown', key); }
    function key(e) { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); }
    lb.addEventListener('click', function (e) { if (e.target.closest('.lb__x') || e.target === lb) close(); if (e.target.closest('.lb__nav--p')) go(-1); if (e.target.closest('.lb__nav--n')) go(1); });
    var x0 = null; lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); x0 = null; });
    document.addEventListener('keydown', key); document.documentElement.classList.add('lock'); document.body.appendChild(lb); show(); $('.lb__x', lb).focus();
  }
  function zoom(src, alt) {
    var z = document.createElement('div');
    z.className = 'zoom'; z.setAttribute('role', 'dialog'); z.setAttribute('aria-label', alt);
    z.style.cssText = 'position:fixed;inset:0;z-index:1900;background:#F3F2EE;display:grid;place-items:center;cursor:zoom-out';
    z.innerHTML = '<img src="' + src + '" alt="' + esc(alt) + '" style="max-height:100vh;width:auto;object-fit:contain">';
    z.addEventListener('click', function () { z.remove(); document.documentElement.classList.remove('lock'); });
    document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { z.remove(); document.documentElement.classList.remove('lock'); document.removeEventListener('keydown', k); } });
    document.documentElement.classList.add('lock'); document.body.appendChild(z);
  }

  /* ---------- collection / shop: filters with URL state ---------- */
  function initShop() {
    var root = $('[data-shop]'); if (!root) return;
    var S = T.shop, grid = $('[data-grid]'), cards = $$('[data-card]', grid), tile = $('[data-ptile]', grid);
    var st = { cat: '', fit: [], color: [], sort: 'best', q: '' };
    var qs = new URLSearchParams(location.search);
    st.cat = S.cat_titles[qs.get('cat')] ? qs.get('cat') : '';
    st.fit = (qs.get('fit') || '').split(',').filter(function (f) { return B.fits[f]; });
    st.color = (qs.get('color') || '').split(',').filter(function (c) { return B.colors[c]; });
    st.sort = ['best', 'low', 'high', 'new'].indexOf(qs.get('sort')) > -1 ? qs.get('sort') : 'best';
    st.q = (qs.get('q') || '').trim();
    function url() {
      var u = new URLSearchParams();
      if (st.cat) u.set('cat', st.cat); if (st.fit.length) u.set('fit', st.fit.join(',')); if (st.color.length) u.set('color', st.color.join(','));
      if (st.sort !== 'best') u.set('sort', st.sort); if (st.q) u.set('q', st.q);
      var s = u.toString(); history.replaceState(null, '', s ? '?' + s : location.pathname.split('/').pop()); syncLang();
    }
    function match(card) {
      var p = byId(card.dataset.id);
      if (st.cat && card.dataset.type !== st.cat) return false;
      if (st.fit.length && st.fit.indexOf(card.dataset.fit) < 0) return false;
      if (st.color.length && !card.dataset.colors.split(' ').some(function (c) { return st.color.indexOf(c) > -1; })) return false;
      if (st.q) { var hay = (p.name.es + ' ' + p.name.en + ' ' + p.fabric.es + ' ' + p.fabric.en + ' ' + S.cat_titles[card.dataset.type] + ' ' + p.fit).toLowerCase(); if (st.q.toLowerCase().split(/\s+/).some(function (w) { return hay.indexOf(w) < 0; })) return false; }
      return true;
    }
    function apply() {
      var vis = cards.filter(match);
      vis.sort(function (a, b) {
        var pa = byId(a.dataset.id), pb = byId(b.dataset.id);
        if (st.sort === 'low') return priceNum(pa) - priceNum(pb);
        if (st.sort === 'high') return (priceNum(pb) % 9999) - (priceNum(pa) % 9999);
        if (st.sort === 'new') return (+b.dataset.new - +a.dataset.new) || (+a.dataset.best - +b.dataset.best);
        return +a.dataset.best - +b.dataset.best;
      });
      cards.forEach(function (c) { c.hidden = vis.indexOf(c) < 0; });
      var tile2 = $('[data-ptile2]', grid);
      vis.forEach(function (c, i) { grid.appendChild(c); if (i === 3 && tile) grid.appendChild(tile); });
      if (tile2) grid.appendChild(tile2);
      cards.filter(function (c) { return c.hidden; }).forEach(function (c) { grid.appendChild(c); });
      if (tile) tile.hidden = vis.length < 5 || !!st.q;
      if (tile2) tile2.hidden = vis.length < 8 || vis.length % 2 === 1;
      if (st.color.length) vis.forEach(function (c) { var hit = c.dataset.colors.split(' ').filter(function (x) { return st.color.indexOf(x) > -1; })[0]; if (hit) setCardColor(c, hit); });
      $('[data-count]').textContent = vis.length; $('[data-count-l]').textContent = vis.length === 1 ? S.result : S.results;
      $('[data-empty]').hidden = vis.length > 0;
      var hero = $('[data-shop-hero]');
      if (hero) { var map = JSON.parse(hero.dataset.map || '{}'), key = map[st.cat] || map['']; $$('[data-media]', hero).forEach(function (m) { var on = m.dataset.media === key; m.hidden = !on; var v = $('video', m); if (v && !reduce) { if (on) { var pr = v.play(); if (pr) pr.catch(function () {}); } else v.pause(); } }); }
      var ttl = $('[data-shop-title]'); ttl.textContent = st.cat ? S.cat_titles[st.cat] : (st.q ? '“' + st.q + '”' : ttl.dataset.default);
      var cc = $('[data-crumb-cat]'); if (cc) { cc.hidden = !st.cat; $('[data-crumb-cat-l]').textContent = st.cat ? S.cat_titles[st.cat] : ''; }
      $$('[data-f-cat]').forEach(function (a) { a.classList.toggle('is-on', a.dataset.fCat === st.cat); a.setAttribute('aria-current', a.dataset.fCat === st.cat ? 'true' : 'false'); });
      $$('[data-f-fit]').forEach(function (i) { i.checked = st.fit.indexOf(i.value) > -1; });
      $$('[data-f-color]').forEach(function (i) { i.checked = st.color.indexOf(i.value) > -1; });
      $('[data-dd-n="fit"]').textContent = st.fit.length || ''; $('[data-dd-n="color"]').textContent = st.color.length || '';
      $('[data-f-sort]').value = st.sort;
      var tags = [];
      st.fit.forEach(function (f) { tags.push('<button type="button" class="tag" data-rm-fit="' + f + '">' + B.fits[f][LANG] + CLOSE + '</button>'); });
      st.color.forEach(function (c) { tags.push('<button type="button" class="tag" data-rm-color="' + c + '">' + B.colors[c][LANG] + CLOSE + '</button>'); });
      if (st.q) tags.push('<button type="button" class="tag" data-rm-q>“' + esc(st.q) + '”' + CLOSE + '</button>');
      if (tags.length || st.cat) tags.push('<button type="button" class="tag tag--clear" data-clear>' + S.clear + '</button>');
      $('[data-active]').innerHTML = tags.join('');
      url();
    }
    root.addEventListener('click', function (e) {
      var a = e.target.closest('[data-f-cat]'); if (a) { e.preventDefault(); st.cat = a.dataset.fCat; apply(); return; }
      var f = e.target.closest('[data-rm-fit]'); if (f) { st.fit = st.fit.filter(function (x) { return x !== f.dataset.rmFit; }); apply(); return; }
      var c = e.target.closest('[data-rm-color]'); if (c) { st.color = st.color.filter(function (x) { return x !== c.dataset.rmColor; }); apply(); return; }
      if (e.target.closest('[data-rm-q]')) { st.q = ''; apply(); return; }
      if (e.target.closest('[data-clear]')) { e.preventDefault(); st = { cat: '', fit: [], color: [], sort: st.sort, q: '' }; apply(); }
    });
    root.addEventListener('change', function (e) {
      var t = e.target;
      if (t.matches('[data-f-fit]')) st.fit = $$('[data-f-fit]').filter(function (i) { return i.checked; }).map(function (i) { return i.value; });
      if (t.matches('[data-f-color]')) st.color = $$('[data-f-color]').filter(function (i) { return i.checked; }).map(function (i) { return i.value; });
      if (t.matches('[data-f-sort]')) st.sort = t.value;
      apply();
    });
    document.addEventListener('click', function (e) { $$('[data-dd]').forEach(function (d) { if (!d.contains(e.target)) d.open = false; }); });
    apply();
  }

  function init() {
    syncLang(); initMega(); initStrip(); initDrawer(); initSearch(); initMedia(); initFooter();
    initHomeReviews(); initPDP(); initShop(); initCarousels(document);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
