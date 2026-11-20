/* Baronil v1 — MeUndies-structure interactions (vanilla, no deps).
   Header marquee · mega menu · drawer · search · swipe rails · quick-add · banner slider · UGC coverflow ·
   media autoplay (IntersectionObserver, reduced-motion) · PDP render from data.js · reviews band + drawer · shop filters */
(function () {
  'use strict';
  var d = document, w = window, html = d.documentElement;
  var B = w.BARONIL || { products: [], colors: {}, fits: {}, cats: {}, contact: {} };
  var LANG = (html.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var RM = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var byId = function (id) { return B.products.find(function (p) { return p.id === id; }); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var rd = function (n) { return 'RD$' + Math.round(n).toLocaleString('en-US'); };
  var WA = 'https://wa.me/' + (B.contact.whatsapp || '18098574734');
  var desk = function () { return w.matchMedia('(min-width: 1024px)').matches; };

  /* ——— language switch keeps ?query and #hash ——— */
  $$('[data-lang-switch]').forEach(function (a) { a.href = a.getAttribute('href').split('?')[0] + location.search + location.hash; });

  /* ——— promo marquee: ~40px/s, pause toggle ——— */
  var mq = $('[data-marquee]');
  if (mq) {
    var list = $('.promo__list', mq);
    var setDur = function () { if (list) mq.style.setProperty('--mq', Math.max(20, list.offsetWidth / 40) + 's'); };
    setDur(); w.addEventListener('resize', setDur);
    var tg = $('[data-marquee-toggle]', mq);
    tg && tg.addEventListener('click', function () { var p = mq.classList.toggle('is-paused'); tg.setAttribute('aria-pressed', p); });
  }

  /* ——— mega menu (hover intent + keyboard) ——— */
  var mega = $('[data-mega]'), megaT;
  if (mega) {
    var openMega = function (li) { clearTimeout(megaT); $$('.nav__links li').forEach(function (x) { x.classList.toggle('is-open', x === li); }); mega.classList.add('is-open'); };
    var closeMega = function () { megaT = setTimeout(function () { mega.classList.remove('is-open'); $$('.nav__links li').forEach(function (x) { x.classList.remove('is-open'); }); }, 140); };
    $$('.nav__links li').forEach(function (li) {
      li.addEventListener('mouseenter', function () { li.classList.contains('has-mega') ? openMega(li) : closeMega(); });
      li.addEventListener('focusin', function () { li.classList.contains('has-mega') ? openMega(li) : (clearTimeout(megaT), mega.classList.remove('is-open')); });
    });
    $('.nav__row').addEventListener('mouseleave', closeMega);
    mega.addEventListener('mouseenter', function () { clearTimeout(megaT); });
    mega.addEventListener('focusout', function (e) { if (!mega.contains(e.relatedTarget) && !(e.relatedTarget && e.relatedTarget.closest('.has-mega'))) closeMega(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { mega.classList.remove('is-open'); } });
  }

  /* ——— mobile drawer ——— */
  var drawer = $('[data-drawer]');
  var setDrawer = function (open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open); drawer.setAttribute('aria-hidden', !open);
    html.classList.toggle('menu-lock', open);
    $$('[data-menu-open]').forEach(function (b) { b.setAttribute('aria-expanded', open); });
    if (open) { var x = $('[data-menu-close].ib', drawer); x && x.focus(); }
  };
  d.addEventListener('click', function (e) {
    if (e.target.closest('[data-menu-open]')) setDrawer(true);
    else if (e.target.closest('[data-menu-close]')) setDrawer(false);
    var acc = e.target.closest('[data-acc]');
    if (acc) acc.setAttribute('aria-expanded', acc.getAttribute('aria-expanded') !== 'true');
  });

  /* ——— search panel ——— */
  var sp = $('[data-search]');
  var setSearch = function (open) { if (!sp) return; sp.hidden = !open; $$('[data-search-open]').forEach(function (b) { b.setAttribute('aria-expanded', open); }); if (open) { var i = $('input', sp); i && i.focus(); } };
  d.addEventListener('click', function (e) {
    if (e.target.closest('[data-search-open]')) setSearch(sp && sp.hidden);
    else if (e.target.closest('[data-search-close]')) setSearch(false);
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setSearch(false); setDrawer(false); } });

  /* ——— swipe rails: native overflow + mouse drag ——— */
  function dragScroll(el) {
    var down = false, sx = 0, sl = 0, moved = false;
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('button,input,select')) return;
      down = true; moved = false; sx = e.clientX; sl = el.scrollLeft;
    });
    w.addEventListener('pointermove', function (e) {
      if (!down) return; var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 6) { moved = true; el.classList.add('is-drag'); }
      if (moved) { el.scrollLeft = sl - dx; e.preventDefault(); }
    });
    w.addEventListener('pointerup', function () {
      if (!down) return; down = false;
      if (moved) { setTimeout(function () { el.classList.remove('is-drag'); }, 0); }
    });
    el.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    el.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }
  $$('[data-rail]').forEach(dragScroll);

  /* ——— quick-add: "Select size" pill opens the size row; a size adds to the shared bag ——— */
  var closeSizing = function (except) { $$('.is-sizing').forEach(function (x) { if (x !== except) { x.classList.remove('is-sizing'); var b = $('[data-qa]', x); b && b.setAttribute('aria-expanded', 'false'); } }); };
  d.addEventListener('click', function (e) {
    var qa = e.target.closest('[data-qa]');
    if (qa) {
      var host = qa.closest('.tile, .ugc__card');
      var on = !host.classList.contains('is-sizing');
      closeSizing(host); host.classList.toggle('is-sizing', on); qa.setAttribute('aria-expanded', on);
      if (on) { var f = $('.tile__sizes button', host); f && f.focus({ preventScroll: true }); }
      return;
    }
    if (e.target.closest('.tile__sizes [data-add]')) { setTimeout(closeSizing, 50); return; }
    if (!e.target.closest('.tile__sizes')) closeSizing();
  });

  /* ——— media slots: autoplay muted loops only while visible; poster-only under reduced motion ——— */
  var vids = $$('.mm__v');
  if (RM) { vids.concat($$('.tile__loop')).forEach(function (v) { v.pause(); v.removeAttribute('autoplay'); v.preload = 'none'; v.remove(); }); vids = []; }
  var visible = function (v) { return v.offsetParent !== null || getComputedStyle(v).display !== 'none' && v.getClientRects().length; };
  var playable = function (v) { var it = v.closest('[data-ugc-item]'); return !it || it.classList.contains('is-center'); };
  var tryPlay = function (v) { if (!visible(v) || !playable(v) || v.dataset.userPaused) return; if (v.preload === 'none') v.preload = 'metadata'; var p = v.play(); p && p.catch(function () {}); };
  var prep = function (v) {
    v.muted = true;
    var on = function () { v.classList.add('is-playing'); };
    v.addEventListener('playing', on);
    v.addEventListener('timeupdate', function tu() { if (v.currentTime > 0) { on(); v.removeEventListener('timeupdate', tu); } });
    if (!v.paused && v.readyState > 2) on();
    v.addEventListener('error', function () { v.classList.remove('is-playing'); }, true);
  };
  vids.forEach(prep);
  var io = null;
  if ('IntersectionObserver' in w) {
    io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { var v = en.target; v._in = en.isIntersecting; if (en.isIntersecting) tryPlay(v); else v.pause(); });
    }, { rootMargin: '120px 0px', threshold: 0.15 });
    vids.forEach(function (v) { io.observe(v); });
    w.addEventListener('resize', function () { vids.forEach(function (v) { if (!visible(v)) v.pause(); else if (v._in) tryPlay(v); }); });
  }
  /* register a video added after load (runtime UGC from products.json) */
  var watchVid = function (v) { if (RM) { v.remove(); return; } prep(v); vids.push(v); if (io) io.observe(v); };

  /* ——— product-card hover loops (4:5 mp4 where one exists): lazy src, play on hover, fade out on leave ——— */
  if (!RM && w.matchMedia('(hover: hover)').matches) {
    d.addEventListener('mouseover', function (e) {
      var t = e.target.closest('.tile'); if (!t || t._lp) return;
      var v = $('.tile__loop', t); if (!v) return;
      t._lp = 1;
      if (!v.src) { v.src = v.dataset.src; }
      v.muted = true; v.currentTime = 0;
      v.addEventListener('playing', function () { v.classList.add('is-playing'); }, { once: true });
      var pr = v.play(); pr && pr.catch(function () {});
      t.addEventListener('mouseleave', function out() { t._lp = 0; v.classList.remove('is-playing'); setTimeout(function () { if (!t._lp) v.pause(); }, 350); t.removeEventListener('mouseleave', out); });
    });
  }

  /* ——— banner slider: scroll-snap track, 8px dots, drag ——— */
  $$('[data-slider]').forEach(function (s) {
    var tr = $('[data-slider-track]', s), dots = $$('[data-dot]', s), slides = $$('.bnr__slide', s);
    var cur = 0;
    var set = function (i) {
      cur = i; dots.forEach(function (b, k) { b.setAttribute('aria-selected', k === i); });
      s.classList.toggle('on-blue', !!slides[i] && slides[i].classList.contains('bnr--blue'));
    };
    tr.addEventListener('scroll', function () { var i = Math.round(tr.scrollLeft / tr.clientWidth); if (i !== cur) set(i); }, { passive: true });
    dots.forEach(function (b, k) { b.addEventListener('click', function () { tr.scrollTo({ left: k * tr.clientWidth, behavior: RM ? 'auto' : 'smooth' }); }); });
    dragScroll(tr); set(0);
  });

  /* ——— UGC coverflow: centre item is taller and the only one that plays ——— */
  var ug = $('[data-ugc]');
  if (ug) {
    var items = $$('[data-ugc-item]', ug), ci = -1;
    var centre = function () {
      var mid = ug.scrollLeft + ug.clientWidth / 2, best = 0, bd = 1e9;
      items.forEach(function (it, k) { var c = it.offsetLeft + it.offsetWidth / 2, dd = Math.abs(c - mid); if (dd < bd) { bd = dd; best = k; } });
      if (best === ci) return; ci = best;
      items.forEach(function (it, k) {
        it.classList.toggle('is-center', k === best);
        $$('.mm__v', it).forEach(function (v) { k === best ? tryPlay(v) : v.pause(); });
      });
    };
    var goTo = function (k, smooth) { k = Math.max(0, Math.min(items.length - 1, k)); var it = items[k]; ug.scrollTo({ left: it.offsetLeft - (ug.clientWidth - it.offsetWidth) / 2, behavior: smooth && !RM ? 'smooth' : 'auto' }); };
    var st; ug.addEventListener('scroll', function () { clearTimeout(st); st = setTimeout(centre, 60); }, { passive: true });
    $('[data-ugc-prev]') && $('[data-ugc-prev]').addEventListener('click', function () { goTo(ci - 1, true); });
    $('[data-ugc-next]') && $('[data-ugc-next]').addEventListener('click', function () { goTo(ci + 1, true); });
    ug.addEventListener('click', function (e) {
      var m = e.target.closest('[data-ugc-mute]'), p = e.target.closest('[data-ugc-pause]');
      var v = (m || p) && $('.mm__v', (m || p).closest('[data-ugc-item]'));
      if (!v) return;
      if (m) { v.muted = !v.muted; m.classList.toggle('is-on', !v.muted); }
      if (p) { if (v.paused) { delete v.dataset.userPaused; v.play(); } else { v.dataset.userPaused = 1; v.pause(); } }
    });
    dragScroll(ug);
    var start = items.findIndex(function (it) { return it.classList.contains('is-center'); });
    requestAnimationFrame(function () { goTo(start < 0 ? 0 : start, false); ci = -1; centre(); });
    w.addEventListener('resize', function () { goTo(ci, false); });
  }

  /* ——— footer accordions (mobile) + newsletter ——— */
  d.addEventListener('click', function (e) {
    var h = e.target.closest('[data-facc]');
    if (h && !desk()) h.setAttribute('aria-expanded', h.getAttribute('aria-expanded') !== 'true');
  });
  $$('[data-nl]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var i = $('input', f);
      if (!i.value || !/.+@.+\..+/.test(i.value)) { i.focus(); i.setAttribute('aria-invalid', 'true'); return; }
      i.removeAttribute('aria-invalid'); i.value = ''; $('[data-nl-ok]', f).hidden = false;
    });
  });

  /* ======================================================================
     Shared bits for PDP / shop
     ====================================================================== */
  var V = w.V1 || {};
  var T = V.t || {};
  var AMZ = V.amz || {};
  function amzPack(id, c) {
    var a = AMZ[id]; if (!a || !a.pack) return '';
    var parts = a.pack.en.split(' · ');
    if (parts.length < 2) return parts[0];
    var hit = parts.find(function (s) { return (c === 'white') === (s.indexOf('white') > -1); });
    return hit ? hit.replace(' white', '').replace(' color', '') : '';
  }
  function amzSingle(id) { var a = AMZ[id]; return a && a.pack && a.pack.en.indexOf(' · ') < 0 && !a.priceAlt ? a.pack.en : ''; }
  function amzFrom(id) { var a = AMZ[id]; return a.priceAlt && parseFloat(a.priceAlt.slice(1)) < parseFloat(a.price.slice(1)) ? a.priceAlt : a.price; }
  function amzPriceHTML(id) {
    var pk = amzSingle(id);
    return pk ? '<span class="price__now">' + esc(AMZ[id].price) + '</span><span class="price__pk">· ' + esc(pk) + '</span>'
              : '<span class="price__now"><small>' + esc(T.card.from) + '</small> ' + esc(amzFrom(id)) + '</span><span class="price__pk">· ' + esc(T.card.multi) + '</span>';
  }
  function priceHTML(p, c, big) {
    var tg = big ? 'span' : 'div', h = '<' + tg + ' class="price' + (big ? ' price--lg' : '') + '">';
    if (LANG === 'es') {
      var n = (p.rdPack && p.rdPack[c]) || 1;
      h += '<span class="price__now">' + rd(p.rd[c]) + '</span>';
      if (n > 1) h += '<span class="badge">' + esc(T.card.pack) + ' ' + n + '</span>';
      if (p.isNew) h += '<span class="badge">' + esc(T.new) + '</span>';
      if (n > 1) h += '<span class="price__unit">(' + rd(p.rd[c] / n) + ' ' + esc(T.card.unit) + ')</span>';
      if (AMZ[p.id] && AMZ[p.id].rating) h += '<span class="price__amz">' + amzStars(AMZ[p.id].rating, 13) + '<b>' + AMZ[p.id].rating.toFixed(1) + '</b> (' + AMZ[p.id].count + ')<span class="amz-w"> ' + esc(T.card.amz_rating) + '</span></span>';
    } else if (p.asin && AMZ[p.id]) {
      h += amzPriceHTML(p.id);
      if (AMZ[p.id].rating) h += '<span class="price__amz">' + amzStars(AMZ[p.id].rating, 13) + '<b>' + AMZ[p.id].rating.toFixed(1) + '</b> (' + AMZ[p.id].count + ')<span class="amz-w"> ' + esc(T.card.amz_rating) + '</span></span>';
      if (p.isNew) h += '<span class="badge">' + esc(T.new) + '</span>';
    } else {
      h += '<span class="badge">' + esc(T.card.rd_only) + '</span>' + (p.isNew ? '<span class="badge">' + esc(T.new) + '</span>' : '') + '<span class="price__unit price__unit--full">' + esc(T.pdp.rd_only_note) + '</span>';
    }
    return h + '</' + tg + '>';
  }
  var IMG = w.V1_IMG || {};
  var cardImg = function (id, c) { return ((IMG[id] || {})[c] || {}).card || '../../assets/img/placeholder.svg'; };
  var pdpImgs = function (id, c) { var e = (IMG[id] || {})[c], l = (e && e.pdp) ? e.pdp.filter(function (u) { return u.indexOf('-detail-') < 0; }) : []; return l.length ? l : [cardImg(id, c)]; };
  var check = '<svg class="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  var amzStars = function (r, s) { return '<span class="astars" style="--pct:' + (r / 5 * 100).toFixed(1) + '%;--s:' + s + 'px" role="img" aria-label="' + r + '/5"><span class="astars__bg">' + starSVG(5, s) + '</span><span class="astars__fg">' + starSVG(5, s) + '</span></span>'; };
  var starSVG = function (n, s) { var o = '<span class="stars" role="img" aria-label="' + n + '/5">'; for (var i = 0; i < 5; i++) o += '<svg width="' + s + '" height="' + s + '" viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M10 1.6l2.5 5.3 5.8.7-4.3 4 1.1 5.8L10 14.6l-5.1 2.8 1.1-5.8-4.3-4 5.8-.7z"/></svg>'; return o + '</span>'; };

  /* ======================================================================
     PDP — rendered from data.js for ?p=<id>&c=<color>
     ====================================================================== */
  var pdp = $('[data-pdp]');
  var P, C, SIZE = null, OPT = null;
  function factTiles(p) {
    var F = T.facts || {}, keys = p.fit === 'stretch' || p.fit === 'fashion' ? ['stretch', 'waist', 'made'] : p.cat === 'undershirts' ? ['cotton', 'tagless', 'made'] : ['cotton', 'hem', 'made'];
    return keys.map(function (k) { return F[k]; }).filter(Boolean);
  }
  function renderGallery() {
    var g = $('[data-gal]'); if (!g) return;
    var imgs = pdpImgs(P.id, C), alt = P.name[LANG] + ' · ' + B.colors[C][LANG], fr = [];
    imgs.forEach(function (u, i) { fr.push('<figure class="pdp__img"><img src="' + esc(u) + '" alt="' + esc(alt) + '" width="1600" height="2000" ' + (i > 1 ? 'loading="lazy"' : 'fetchpriority="high"') + ' decoding="async"></figure>'); });
    var e = (IMG[P.id] || {})[C];
    if (e && e.loop && !RM) fr.splice(Math.min(1, fr.length), 0, '<figure class="pdp__img pdp__img--loop"><video autoplay muted loop playsinline preload="metadata" poster="' + esc(e.loopPoster || imgs[0]) + '" aria-hidden="true"><source src="' + esc(e.loop) + '" type="video/mp4"></video></figure>');
    if (fr.length < 4) fr.push('<figure class="pdp__img pdp__img--zoom"><img src="' + esc(imgs[0]) + '" alt="" loading="lazy" decoding="async"></figure>');
    var fills = [
      '<figure class="pdp__img pdp__fact pdp__fact--spec"><img class="pdp__fact-b" src="../../assets/brand/b-mark.svg" alt="" width="40" height="39"><figcaption><span class="pdp__fact-h">' + esc(P.name[LANG]) + '</span><span class="pdp__fact-k">' + esc(T.pdp.fabric_h) + '</span><strong>' + esc(P.fabric[LANG]) + '</strong><span class="pdp__fact-k">' + esc(T.pdp.sizes_h) + '</span><strong>' + esc(P.sizes.join(' · ')) + '</strong><span class="pdp__fact-c">' + P.colors.map(function (k) { return '<i class="chip" style="--c:' + B.colors[k].hex + '"></i>'; }).join('') + '</span></figcaption></figure>',
      '<figure class="pdp__img pdp__fact pdp__fact--made"><img src="../../assets/brand/hecho-rd-white.png" alt="" width="180" height="116"><figcaption><strong>' + esc((T.facts.made || {}).t || '') + '</strong><span>' + esc((T.facts.made || {}).d || '') + '</span></figcaption></figure>'
    ], k = 0;
    while ((fr.length < 4 || fr.length % 2) && k < fills.length) fr.push(fills[k++]);
    g.innerHTML = fr.join('');
  }
  function setATC() {
    var add = $('[data-atc]'), ext = $('[data-atc-ext]'), lab = $('[data-atc-l]');
    if (!add) return;
    add.dataset.id = P.id; add.dataset.color = C;
    var useExt = (LANG === 'es' && OPT === 'amz') || (LANG === 'en' && OPT === 'wa');
    add.hidden = useExt; ext.hidden = !useExt;
    if (useExt) {
      if (OPT === 'amz') { ext.href = P.amazon; ext.textContent = T.pdp.buy_amz; }
      else {
        var msg = T.pdp.wa_msg + ' ' + P.name[LANG] + ' — ' + B.colors[C][LANG] + (SIZE ? ', ' + T.pdp.size + ' ' + SIZE : '');
        ext.href = WA + '?text=' + encodeURIComponent(msg); ext.textContent = T.pdp.opt_wa.t;
      }
    }
    if (SIZE) { add.disabled = false; add.setAttribute('data-add', ''); add.dataset.size = SIZE; lab.textContent = T.pdp.add; }
    else { add.disabled = true; add.removeAttribute('data-add'); delete add.dataset.size; lab.textContent = T.pdp.choose; }
    if (typeof syncSbar === 'function') syncSbar();
  }
  function renderPDP() {
    $$('[data-f="name"]').forEach(function (e) { e.textContent = P.name[LANG]; });
    $$('[data-f="fabric"]').forEach(function (e) { e.textContent = P.fabric[LANG]; });
    $$('[data-f="price"]').forEach(function (e) { e.innerHTML = priceHTML(P, C, true); });
    d.title = P.name[LANG] + ' · Baronil';
    pdp.dataset.id = P.id; pdp.dataset.color = C;
    var sib = B.products.filter(function (q) { return q.cat === P.cat; });
    var tabs = $('[data-f="tabs"]');
    tabs.innerHTML = sib.map(function (q) { return '<a class="pdp__tabbtn" role="tab" href="product.html?p=' + q.id + '&amp;c=' + q.colors[0] + '" data-tab="' + q.id + '"' + (q.id === P.id ? ' aria-selected="true"' : '') + '>' + esc(T.pdp.short[q.id] || q.name[LANG]) + '</a>'; }).join('');
    tabs.style.setProperty('--n', sib.length);
    $('[data-f="colorname"]').textContent = B.colors[C][LANG];
    $('[data-f="swatches"]').innerHTML = P.colors.map(function (k) { return '<a class="sw__i sw__btn' + (k === C ? ' is-on' : '') + '" href="product.html?p=' + P.id + '&amp;c=' + k + '" data-sw="' + k + '" aria-label="' + esc(B.colors[k][LANG]) + '"' + (k === C ? ' aria-current="true"' : '') + ' style="--c:' + B.colors[k].hex + '"><img src="' + cardImg(P.id, k) + '" alt="" width="44" height="44" loading="lazy"></a>'; }).join('');
    if (SIZE && P.sizes.indexOf(SIZE) < 0) SIZE = null;
    $('[data-f="sizes"]').innerHTML = P.sizes.map(function (s) { return '<button type="button" role="radio" aria-checked="' + (s === SIZE) + '" data-sz="' + s + '">' + s + '</button>'; }).join('');
    // purchase options
    var hasAmz = !!(P.asin && AMZ[P.id]);
    $$('[data-opt]').forEach(function (o) { o.hidden = o.dataset.opt === 'amz' && !hasAmz; });
    if (!OPT || (OPT === 'amz' && !hasAmz)) OPT = (LANG === 'en' && hasAmz) ? 'amz' : 'wa';
    $$('[data-opt]').forEach(function (o) { var on = o.dataset.opt === OPT; o.classList.toggle('is-on', on); o.setAttribute('aria-checked', on); });
    var wp = $('[data-f="opt-wa-price"]'); if (wp) wp.textContent = rd(P.rd[C]) + (P.rdPack[C] > 1 ? ' · ' + T.pdp.pack_of + ' ' + P.rdPack[C] : '');
    var ap = $('[data-f="opt-amz-price"]'); if (ap) ap.textContent = hasAmz ? (amzSingle(P.id) ? AMZ[P.id].price : T.card.from + ' ' + amzFrom(P.id)) : '';
    var ac = $('[data-f="opt-amz-chip"]'); if (ac) ac.textContent = hasAmz ? (AMZ[P.id].pack ? AMZ[P.id].pack[LANG] : T.pdp.opt_amz.chip) : '';
    var A = AMZ[P.id] || {};
    $$('[data-f="stars"]').forEach(function (el) {
      el.innerHTML = (!A.rating && P.asin)
        ? '<a class="pdp__stars pdp__stars--read" href="#reviews" data-rev-open>' + esc(T.rev.read) + '</a>'
        : A.rating
        ? '<a class="pdp__stars pdp__stars--amz" href="' + P.amazon + '#customerReviews" target="_blank" rel="noopener">' + amzStars(A.rating, 16) + '<span>' + A.rating.toFixed(1) + ' (' + A.count + ') ' + esc(T.pdp.amz_rating) + '</span></a>'
        : '<a class="pdp__stars" href="#reviews" data-rev-open aria-label="' + esc(T.pdp.stars_aria) + '"><span class="rsum">' + starSVG(1, 16) + '<b>' + esc(T.rev.sum_r) + '</b><i aria-hidden="true">·</i><span>' + esc(T.rev.sum_n) + '</span></span></a>';
    });
    var ar = $('[data-f="opt-amz-rating"]'); if (ar) ar.innerHTML = A.rating ? amzStars(A.rating, 12) + ' ' + A.rating.toFixed(1) + ' (' + A.count + ')' : '';
    var al = $('[data-f="amzlink"]'); if (al) { al.hidden = !P.amazon; if (P.amazon) al.href = P.amazon; }
    setATC();
    // accordions
    $('[data-f="blurb"]').textContent = P.blurb[LANG];
    $('[data-f="fabricline"]').textContent = T.pdp.fabric_h + ': ' + P.fabric[LANG] + '. ' + ((T.facts.made || {}).d || '');
    $('[data-f="details"]').innerHTML = (P.cat === 'undershirts' ? T.pdp.details_top : P.fit === 'stretch' || P.fit === 'fashion' ? [T.facts.stretch.t + ': ' + T.facts.stretch.d].concat(T.pdp.details) : T.pdp.details).map(function (x) { return '<li>' + check + esc(x) + '</li>'; }).join('');
    $('[data-f="sizelist"]').textContent = P.sizes.join(' · ');
    $('[data-f="code"]').textContent = P.code;
    renderGallery();
    // hide the current product from "you may also like"
    $$('[data-also] .tile').forEach(function (t) { t.hidden = t.dataset.id === P.id; });
    renderRevBand();
    renderPDX();
    stickBox();
  }
  function renderPDX() {
    var X = T.pdx || {}, first = pdpImgs(P.id, C)[0];
    $$('[data-pdx]').forEach(function (b) { b.hidden = b.dataset.pdx !== P.id; });
    $$('[data-pdx="' + P.id + '"] [data-look-c]').forEach(function (el) { el.hidden = el.dataset.lookC !== C; });
    var det = ((IMG[P.id] || {})[C] || {}).det || {};
    $$('[data-pdx="' + P.id + '"] [data-dz]').forEach(function (im) {
      var real = im.dataset.dk && det[im.dataset.dk], src = real || first;
      im.style.setProperty('--o', real ? '50% 50%' : im.dataset.o); im.style.setProperty('--z', real ? 1 : im.dataset.z);
      if (im.getAttribute('src') !== src) im.src = src;
    });
    var cc = $('[data-f="crumb-cat"]'); if (cc) { cc.textContent = (V.cats[P.cat] || {})[LANG] || ''; cc.href = 'shop.html?cat=' + P.cat; }
    var cn = $('[data-f="crumb-name"]'); if (cn) cn.textContent = P.name[LANG];
    var si = $('[data-sbar-img]'); if (si) si.src = cardImg(P.id, C);
    var sn = $('[data-sbar-name]'); if (sn) sn.textContent = P.name[LANG];
    var sm = $('[data-sbar-meta]'); if (sm) sm.textContent = (LANG === 'es' ? rd(P.rd[C]) + (P.rdPack[C] > 1 ? ' · ' + T.pdp.pack_of + ' ' + P.rdPack[C] : '') : (P.asin && AMZ[P.id] ? (amzSingle(P.id) ? AMZ[P.id].price : T.card.from + ' ' + amzFrom(P.id)) : T.card.rd_only)) + ' · ' + B.colors[C][LANG];
    syncSbar();
    var gc = $('[data-gal-count]'); if (gc) gc.textContent = '1 / ' + $$('[data-gal] .pdp__img').length;
    // JSON-LD Product (no invented aggregate: only the real Amazon rating where one exists)
    var ld = $('script[data-ld]');
    if (ld) {
      var A = AMZ[P.id], o = { '@context': 'https://schema.org', '@type': 'Product', name: P.name[LANG], brand: { '@type': 'Brand', name: 'Baronil' }, sku: P.code, description: P.blurb[LANG], image: [first.replace('../../', '')] };
      if (LANG === 'es') o.offers = { '@type': 'Offer', priceCurrency: 'DOP', price: P.rd[C], availability: 'https://schema.org/InStock' };
      else if (P.asin && A) o.offers = { '@type': 'Offer', priceCurrency: 'USD', price: amzFrom(P.id).slice(1), url: P.amazon, availability: 'https://schema.org/InStock' };
      if (A && A.rating) o.aggregateRating = { '@type': 'AggregateRating', ratingValue: A.rating, reviewCount: A.count };
      ld.textContent = JSON.stringify(o);
    }
    // recently viewed
    try {
      var KEY = 'baronil-v1-recent', list = JSON.parse(localStorage.getItem(KEY) || '[]').filter(function (x) { return x && byId(x.id) && x.id !== P.id; });
      renderRecent(list);
      list.unshift({ id: P.id, c: C }); localStorage.setItem(KEY, JSON.stringify(list.slice(0, 12)));
    } catch (e) { renderRecent([]); }
  }
  function renderRecent(list) {
    var sec = $('[data-recent]'), box = $('[data-recent-list]'); if (!sec || !box) return;
    list = list.slice(0, 10);
    sec.hidden = !list.length; if (!list.length) return;
    box.innerHTML = list.map(function (x) {
      var q = byId(x.id), c = q.colors.indexOf(x.c) > -1 ? x.c : q.colors[0], url = 'product.html?p=' + q.id + '&c=' + c;
      return '<article class="tile"><div class="tile__media"><a class="tile__img" href="' + url + '" tabindex="-1" aria-hidden="true"><img src="' + esc(cardImg(q.id, c)) + '" alt="" width="720" height="900" loading="lazy"></a></div>' +
        '<a class="tile__txt" href="' + url + '"><span class="tile__eb">' + esc(B.fits[q.fit][LANG]) + '</span><p class="tile__name">' + esc(q.name[LANG]) + '</p></a>' + priceHTML(q, c) +
        '<div class="tile__clr"><span class="chip" style="--c:' + B.colors[c].hex + '"></span>' + esc(B.colors[c][LANG]) + '</div></article>';
    }).join('');
  }
  /* sticky add-to-bag: label follows the size state */
  function syncSbar() {
    var b = $('[data-sbar-btn]'); if (!b || !T.pdx) return;
    var ext = $('[data-atc-ext]'), useExt = ext && !ext.hidden;
    b.textContent = useExt ? ext.textContent : (SIZE ? T.pdp.add + ' · ' + SIZE : T.pdx.sticky_choose);
  }
  function stickBox() {
    var box = $('[data-box]'); if (!box) return;
    if (!desk() && !w.matchMedia('(min-width: 768px)').matches) { box.style.top = ''; return; }
    var hdr = desk() ? 150 : 63, h = box.offsetHeight, vh = w.innerHeight;
    box.style.top = (h + hdr + 32 > vh ? vh - h - 16 : hdr + 16) + 'px';
  }
  function initSbar() {
    var bar = $('[data-sbar]'), atc = $('.atc'); if (!bar || !atc) return;
    // scroll-driven (an IntersectionObserver misses jumps that skip past the button: anchor links, fast flings)
    var tick = false, upd = function () { tick = false; var on = atc.getBoundingClientRect().bottom < 0; if (on !== bar.classList.contains('is-on')) { bar.classList.toggle('is-on', on); bar.setAttribute('aria-hidden', !on); } };
    w.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    w.addEventListener('resize', upd); upd();
    $('[data-sbar-btn]', bar).addEventListener('click', function () {
      var ext = $('[data-atc-ext]');
      if (ext && !ext.hidden) { ext.click(); return; }
      if (SIZE) { $('[data-atc]').click(); return; }
      var sz = $('[data-f="sizes"]'), g = $('#size');
      w.scrollTo({ top: g.getBoundingClientRect().top + w.scrollY - (desk() ? 170 : 90), behavior: RM ? 'auto' : 'smooth' });
      sz.classList.remove('is-flash'); void sz.offsetWidth; sz.classList.add('is-flash');
    });
  }
  function initGalCount() {
    var g = $('[data-gal]'), c = $('[data-gal-count]'); if (!g || !c) return;
    g.addEventListener('scroll', function () {
      var items = $$('.pdp__img', g); if (!items.length) return;
      var i = Math.round(g.scrollLeft / (items[0].offsetWidth + 16));
      c.textContent = Math.min(items.length, i + 1) + ' / ' + items.length;
    }, { passive: true });
  }
  function initLightbox() {
    var lb = $('[data-lb]'), im = $('[data-lb-img]'), ct = $('[data-lb-count]'), list = [], i = 0, sx = null;
    if (!lb) return;
    var show = function (k) { i = (k + list.length) % list.length; im.src = list[i]; im.alt = P.name[LANG]; ct.textContent = (i + 1) + ' / ' + list.length; };
    var open = function (k) { list = pdpImgs(P.id, C); show(k); lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); html.classList.add('drawer-lock'); $('[data-lb-close]').focus(); };
    var close = function () { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); html.classList.remove('drawer-lock'); };
    $('[data-gal]').addEventListener('click', function (e) {
      var f = e.target.closest('.pdp__img'); if (!f || f.classList.contains('pdp__fact') || f.classList.contains('pdp__img--loop')) return;
      var src = $('img', f).getAttribute('src'), k = Math.max(0, pdpImgs(P.id, C).indexOf(src)); open(k);
    });
    lb.addEventListener('click', function (e) {
      if (e.target.closest('[data-lb-close]') || e.target === lb) close();
      else if (e.target.closest('[data-lb-prev]')) show(i - 1);
      else if (e.target.closest('[data-lb-next]')) show(i + 1);
    });
    d.addEventListener('keydown', function (e) { if (!lb.classList.contains('is-open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1); });
    lb.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    lb.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1)); });
  }
  /* per-product UGC from vid/ugc/products.json (produced separately); keeps the UGC.md fallback if missing */
  function loadUgcJson(go) {
    if (!w.fetch || !V.ugcJson) return;
    fetch('../../assets/vid/ugc/products.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
      if (!data) return;
      var RVall = (w.BARONIL_REVIEWS || {})[LANG] || [];
      var path = function (x) { if (!x) return ''; if (/^(https?:|\.\.\/)/.test(x)) return x; if (/^(vid|img)\//.test(x)) return '../../assets/' + x; if (/^assets\//.test(x)) return '../../' + x; return '../../assets/vid/ugc/' + x; };
      $$('[data-ugc-rail]').forEach(function (sec) {
        var pid = sec.dataset.pid, q = byId(pid), list = data[pid] || (data.products || {})[pid];
        if (!q || !list || !list.length) return;
        var box = $('[data-ugc-list]', sec);
        box.innerHTML = list.map(function (e) {
          var src = path(e.src || e.video || e.mp4 || e.file), poster = path(e.poster || e.jpg || e.image || (src ? src.replace(/\.mp4$/, '.jpg') : ''));
          var col = e.color || e.c, ph = e.photo || e.review || e.avatar, r = RVall.find(function (x) { return x.photo === ph || (e.name && x.name === e.name); }) || null;
          var nm = e.name || (r && r.name), city = e.city || (r && r.city);
          return '<article class="uc"><div class="uc__m"><div class="mm"><picture class="mm__p"><img src="' + esc(poster) + '" alt="" loading="lazy" decoding="async"></picture>' +
            (src ? '<video class="mm__v mm__v--d" preload="none" data-autoplay muted loop playsinline poster="' + esc(poster) + '" aria-hidden="true" tabindex="-1"><source src="' + esc(src) + '" type="video/mp4"></video>' : '') + '</div></div>' +
            '<div class="uc__foot">' + (nm ? '<p class="uc__n">' + (ph ? '<img src="../../assets/img/people/' + esc(ph) + '" alt="" width="28" height="28" loading="lazy">' : '') + esc(nm) + (city ? '<span>' + esc(city) + '</span>' : '') + '</p>' : '') +
            (col && q.colors.indexOf(col) > -1 ? '<button class="uc__chip" type="button" data-pick-color="' + col + '"><span class="chip" style="--c:' + B.colors[col].hex + '"></span>' + esc(e.kind && e.kind !== 'onbody' ? T.pdx.ugc_color : T.pdx.ugc_wears) + ': ' + esc(B.colors[col][LANG]) + '</button>' : '') + '</div></article>';
        }).join('');
        sec.hidden = false;
        $$('.mm__v', box).forEach(watchVid);
      });
    }).catch(function () {});
  }

  /* ——— size modal ——— */
  var sm = $('[data-size-modal]');
  function openSize(on) { if (!sm) return; sm.classList.toggle('is-open', on); sm.setAttribute('aria-hidden', !on); html.classList.toggle('drawer-lock', on); if (on) { var x = $('[data-size-close].rd__x', sm); x && x.focus(); } }
  d.addEventListener('click', function (e) { if (e.target.closest('[data-size-open]')) openSize(true); else if (e.target.closest('[data-size-close]')) openSize(false); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') openSize(false); });

  /* ======================================================================
     Reviews — window.BARONIL_REVIEWS rendered as full reviews (band + 600px drawer)
     ====================================================================== */
  var RV = (w.BARONIL_REVIEWS || {})[LANG] || [];
  var norm = function (s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  function matchesProduct(r) {
    if (!P) return false;
    return norm(r.product) === norm(P.name[LANG]);
  }
  function ago(iso) {
    var days = Math.max(1, Math.round((Date.now() - new Date(iso + 'T12:00:00').getTime()) / 864e5));
    try { var f = new Intl.RelativeTimeFormat(LANG, { numeric: 'auto' }); return days < 31 ? f.format(-days, 'day') : f.format(-Math.round(days / 30), 'month'); } catch (e) { return iso; }
  }
  var PL = { instagram: 'Instagram', google: 'Google', facebook: 'Facebook', tiktok: 'TikTok', amazon: 'Amazon' };
  function revCard(r, full) {
    var R = T.rev, ph = '../../assets/img/people/' + r.photo;
    var who = '<div class="rv__who"><img class="rv__ph" src="' + ph + '" alt="" width="48" height="48" loading="lazy"><div><strong class="rv__n">' + esc(r.name) + '</strong><span class="rv__city">' + esc(r.city) + '</span></div></div>';
    var plat = '<span class="rv__plat"><img src="../../assets/img/social/' + r.platform + '-color.svg" alt="" width="18" height="18">' + (full ? esc(R.on) + ' ' : '') + PL[r.platform] + '</span>';
    var meta = '<div class="rv__meta">' + starSVG(r.stars, full ? 18 : 16) + '<span class="rv__date">' + esc(ago(r.date)) + '</span></div>';
    var ver = r.verified ? '<span class="rv__ver">' + check + esc(R.verified) + '</span>' : '';
    if (!full) {
      return '<article class="rv">' + '<div class="rv__top">' + who + plat + '</div>' + meta +
        '<h3 class="rv__t">' + esc(r.title) + '</h3><p class="rv__x">' + esc(r.text) + '</p>' +
        '<div class="rv__foot"><span class="rv__prod">' + esc(R.bought) + ': ' + esc(r.product) + '</span>' + ver + '</div></article>';
    }
    return '<article class="rv rv--full"><div class="rv__side">' + who + plat + '</div><div class="rv__main">' +
      '<div class="rv__row">' + meta + ver + '</div><h3 class="rv__t">' + esc(r.title) + '</h3><p class="rv__x">' + esc(r.text) + '</p>' +
      '<p class="rv__prod">' + esc(R.bought) + ': ' + esc(r.product) + '</p>' +
      '<div class="rv__help"><span>' + esc(R.helpful) + '</span><button type="button" class="rv__pill" aria-pressed="false">' + esc(R.yes) + '</button><button type="button" class="rv__pill" aria-pressed="false">' + esc(R.no) + '</button></div></div></article>';
  }
  function sorted(mode) {
    var l = RV.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    if (mode === 'product' || mode === undefined) l.sort(function (a, b) { return (matchesProduct(b) ? 1 : 0) - (matchesProduct(a) ? 1 : 0); });
    return l;
  }
  function renderRevBand() {
    var band = $('[data-rev-band]'); if (!band || !RV.length) return;
    band.innerHTML = sorted('product').slice(0, 8).map(function (r) { return revCard(r, false); }).join('');
  }
  var rdEl = $('[data-rd]'), FILT = '', SORT = pdp ? 'product' : 'recent';
  function renderDrawer() {
    if (!rdEl) return;
    var l = sorted(SORT).filter(function (r) { return !FILT || r.platform === FILT; });
    $('[data-rev-list]', rdEl).innerHTML = l.map(function (r) { return revCard(r, true); }).join('');
  }
  if (rdEl) {
    var sum = (w.BARONIL_REVIEWS || {}).summary;
    var lbl = $('[data-rev-label]', rdEl); if (lbl && sum) lbl.textContent = sum.label[LANG];
    var plats = []; RV.forEach(function (r) { if (plats.indexOf(r.platform) < 0) plats.push(r.platform); });
    $('[data-rev-filters]', rdEl).innerHTML = '<button type="button" class="pill" data-rf="" aria-pressed="true">' + esc(T.rev.all) + '</button>' +
      plats.map(function (k) { return '<button type="button" class="pill" data-rf="' + k + '" aria-pressed="false"><img src="../../assets/img/social/' + k + '-color.svg" alt="" width="16" height="16">' + PL[k] + '</button>'; }).join('');
    rdEl.addEventListener('click', function (e) {
      var f = e.target.closest('[data-rf]');
      if (f) { FILT = f.dataset.rf; $$('[data-rf]', rdEl).forEach(function (b) { b.setAttribute('aria-pressed', b === f); }); renderDrawer(); }
      var h = e.target.closest('.rv__pill'); if (h) { var on = h.getAttribute('aria-pressed') !== 'true'; $$('.rv__pill', h.parentNode).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); h.setAttribute('aria-pressed', on); }
    });
    var srt = $('[data-rev-sort]', rdEl); if (srt) srt.value = SORT;
    $('[data-rev-sort]', rdEl).addEventListener('change', function (e) { SORT = e.target.value; renderDrawer(); });
    var setRD = function (on) {
      if (on) renderDrawer();
      rdEl.classList.toggle('is-open', on); rdEl.setAttribute('aria-hidden', !on); html.classList.toggle('drawer-lock', on);
      if (on) { var x = $('.rd__x', rdEl); x && x.focus(); }
    };
    d.addEventListener('click', function (e) { if (e.target.closest('[data-rev-open]')) { e.preventDefault(); setRD(true); } else if (e.target.closest('[data-rev-close]')) setRD(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && rdEl.classList.contains('is-open')) setRD(false); });
    if (!pdp) renderRevBand();
  }

  /* ======================================================================
     Shop / collection filters with URL state
     ====================================================================== */
  var shop = $('[data-shop]');
  if (shop) {
    var cells = $$('[data-cell]', shop), grid = $('[data-shop-grid]', shop), H = $('[data-shop-h]', shop);
    var S = new URLSearchParams(location.search);
    var st = { cat: S.get('cat') || '', fit: S.get('fit') || '', color: S.get('color') || '', new: S.get('new') || '', best: S.get('best') || '', pack: S.get('pack') || '', q: (S.get('q') || '').trim() };
    var apply = function () {
      var n = 0, qn = norm(st.q);
      var vis = cells.filter(function (c) {
        var x = c.dataset;
        var ok = (!st.cat || x.cat === st.cat) && (!st.fit || x.fit === st.fit) && (!st.new || x.new === '1') && (!st.best || +x.best > 0) && (!st.pack || x.pack === '1') && (!qn || norm(x.q).indexOf(qn) > -1);
        if (ok) ok = st.color ? x.color === st.color : (st.pack ? true : x.primary === '1');
        c.hidden = !ok; c.classList.toggle('is-alt', false); if (ok) n++;
        return ok;
      });
      if (st.best) vis.sort(function (a, b) { return a.dataset.best - b.dataset.best; }).forEach(function (c) { grid.appendChild(c); });
      $('[data-shop-n]', shop).textContent = n;
      $('[data-shop-empty]', shop).hidden = n > 0;
      $$('[data-f-cat]', shop).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.fCat === st.cat); });
      $$('[data-f-fit]', shop).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.fFit === st.fit); });
      $$('[data-f-color]', shop).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.fColor === st.color); });
      var hd = H.dataset, ht = st.q ? hd.hQ + ' “' + st.q + '”' : st.new ? hd.hNew : st.pack ? hd.hPack : st.best ? hd.hBest : st.cat ? hd['h' + st.cat.charAt(0).toUpperCase() + st.cat.slice(1)] : st.fit ? hd['hFit' + st.fit.charAt(0).toUpperCase() + st.fit.slice(1)] : hd.hAll;
      H.textContent = ht || hd.hAll;
      var u = new URLSearchParams(); Object.keys(st).forEach(function (k) { if (st[k]) u.set(k, st[k]); });
      var qs = u.toString(); history.replaceState(null, '', 'shop.html' + (qs ? '?' + qs : ''));
      $$('[data-lang-switch]').forEach(function (a) { a.href = a.getAttribute('href').split('?')[0] + (qs ? '?' + qs : ''); });
    };
    shop.addEventListener('click', function (e) {
      var b = e.target.closest('[data-f-cat],[data-f-fit],[data-f-color],[data-f-clear]'); if (!b) return;
      if (b.hasAttribute('data-f-clear')) { Object.keys(st).forEach(function (k) { st[k] = ''; }); }
      else if (b.hasAttribute('data-f-cat')) st.cat = b.dataset.fCat;
      else if (b.hasAttribute('data-f-fit')) st.fit = b.dataset.fFit;
      else st.color = st.color === b.dataset.fColor ? '' : b.dataset.fColor;
      apply();
    });
    apply();
  }
  function initPDP() {
    if (!pdp) return;
    var q = new URLSearchParams(location.search);
    P = byId(q.get('p')) || byId(pdp.dataset.id);
    C = P.colors.indexOf(q.get('c')) > -1 ? q.get('c') : P.colors[0];
    renderPDP();
    var go = function (id, c) {
      P = byId(id); C = c && P.colors.indexOf(c) > -1 ? c : P.colors[0];
      history.replaceState(null, '', 'product.html?p=' + P.id + '&c=' + C + location.hash);
      $$('[data-lang-switch]').forEach(function (a) { a.href = a.getAttribute('href').split('?')[0] + location.search; });
      renderPDP();
    };
    pdp.addEventListener('click', function (e) {
      var sw = e.target.closest('[data-sw]'); if (sw) { e.preventDefault(); go(P.id, sw.dataset.sw); return; }
      var tb = e.target.closest('[data-tab]'); if (tb) { e.preventDefault(); if (tb.dataset.tab !== P.id) go(tb.dataset.tab); return; }
      var sz = e.target.closest('[data-sz]'); if (sz) { SIZE = sz.dataset.sz; $$('[data-sz]').forEach(function (b) { b.setAttribute('aria-checked', b === sz); }); setATC(); return; }
      var op = e.target.closest('[data-opt]'); if (op) { OPT = op.dataset.opt; $$('[data-opt]').forEach(function (o) { var on = o === op; o.classList.toggle('is-on', on); o.setAttribute('aria-checked', on); }); setATC(); stickBox(); }
    });
    d.addEventListener('click', function (e) {
      var pc = e.target.closest('[data-pick-color]'); if (!pc) return;
      e.preventDefault(); go(P.id, pc.dataset.pickColor);
      var top = pdp.getBoundingClientRect().top + w.scrollY - (desk() ? 160 : 70);
      w.scrollTo({ top: top, behavior: RM ? 'auto' : 'smooth' });
    });
    initSbar(); initLightbox(); initGalCount(); loadUgcJson(go);
    pdp.addEventListener('keydown', function (e) { var op = e.target.closest('[data-opt]'); if (op && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); op.click(); } });
    w.addEventListener('resize', stickBox);
    w.addEventListener('load', stickBox);
    // accordion motion (opacity + translateY), chevron flips via CSS
    $$('.acc__i').forEach(function (dt) { dt.addEventListener('toggle', function () { if (dt.open) { var p = $('.acc__p', dt); p.classList.remove('is-in'); void p.offsetWidth; p.classList.add('is-in'); } }); });
    if (location.hash === '#size') setTimeout(function () { openSize(true); }, 300);
    if (location.hash === '#care') { var cd = $('#care'); cd && (cd.open = true); }
  }


  /* ======================================================================
     Grüns "social fan": same math as the live section (vanilla rAF, no GSAP).
     rotation = relativeIndex x 18deg (>=992px) / 15deg; phase += 1 card every 3s (linear, endless);
     runs only while intersecting (rootMargin -10% 0, threshold .2) and the tab is visible; static under reduced motion
     ====================================================================== */
  function initFan() {
    var s = $('[data-fan]'); if (!s) return;
    var orbits = $$('[data-fan-orbit]', s), n = orbits.length; if (!n) return;
    var phase = Math.max(0, Math.floor((Math.min(n, 5) - 1) / 2));
    var interval = Math.max(1.5, parseFloat(s.dataset.interval) || 3);
    var dq = w.matchMedia('(min-width: 992px)');
    var render = function () {
      var step = dq.matches ? 18 : 15, p = phase % n;
      orbits.forEach(function (o, i) {
        var rel = i - p; while (rel > n / 2) rel -= n; while (rel < -n / 2) rel += n;
        o.style.setProperty('--r', (rel * step).toFixed(3) + 'deg'); o.style.zIndex = i + 1;
      });
    };
    render();
    if (dq.addEventListener) dq.addEventListener('change', render); else dq.addListener(render);
    if (RM || n < 2) return;
    var raf = 0, last = 0, vis = false;
    var tick = function (ts) { if (!last) last = ts; phase = (phase + (ts - last) / 1000 / interval) % n; last = ts; render(); raf = requestAnimationFrame(tick); };
    var start = function () { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } };
    var stop = function () { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
    if ('IntersectionObserver' in w) {
      new IntersectionObserver(function (es) { vis = es.some(function (e) { return e.isIntersecting; }); if (vis && !d.hidden) start(); else stop(); }, { rootMargin: '-10% 0px -10% 0px', threshold: 0.2 }).observe(s);
    } else { vis = true; start(); }
    d.addEventListener('visibilitychange', function () { if (d.hidden) stop(); else if (vis) start(); });
  }
  initFan();

  /* --- WHOOP wall: play/pause per video card; floating "shop now" pill while the wall is in view --- */
  var wall = $('[data-wall]');
  if (wall) {
    $$('.wcard', wall).forEach(function (c) { if ($('.mm__v', c)) c.classList.add('has-video'); });
    wall.addEventListener('click', function (e) {
      var b = e.target.closest('[data-wplay]'); if (!b) return;
      var c = b.closest('.wcard'), v = $('.mm__v', c); if (!v) return;
      if (v.paused) { delete v.dataset.userPaused; var pr = v.play(); if (pr) pr.catch(function () {}); c.classList.remove('is-paused'); b.setAttribute('aria-label', b.dataset.lPause); }
      else { v.dataset.userPaused = 1; v.pause(); c.classList.add('is-paused'); b.setAttribute('aria-label', b.dataset.lPlay); }
    });
    var fl = $('[data-wall-float]', wall), cover = function () {};
    if (fl && 'IntersectionObserver' in w) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { fl.classList.toggle('is-on', e.isIntersecting); }); requestAnimationFrame(function () { cover(); }); }, { rootMargin: '-35% 0px -25% 0px', threshold: 0 }).observe($('.wall__grid', wall));
      var guards = $$('.wcard--q .wcard__qfoot, .wcard__prod, .wcard__foot, .wcard__r a', wall), tk = 0;
      cover = function () {
        tk = 0; if (!fl.classList.contains('is-on')) return;
        var f = fl.getBoundingClientRect(), hit = guards.some(function (g) { var r = g.getBoundingClientRect(); return r.bottom > f.top - 6 && r.top < f.bottom + 6 && r.right > f.left && r.left < f.right; });
        fl.classList.toggle('is-cover', hit);
      };
      w.addEventListener('scroll', function () { if (!tk) tk = requestAnimationFrame(cover); }, { passive: true });
    }
  }

  /* --- server-rendered review dates -> relative ("hace 9 dias") --- */
  $$('[data-date]').forEach(function (el) { el.textContent = ago(el.dataset.date); });
  initPDP();
})();
