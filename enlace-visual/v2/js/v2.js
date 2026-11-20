/* Enlace Visual — v2 (One Medical structure) page behaviour.
 * Shared runtime (core.js / flow.js / reviews.js) loads first; this file only adds v2 UI. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var A = (document.querySelector('meta[name=ev-assets]') || {}).content || '../assets/';
  var root = document.documentElement;

  /* ---------- header: absolute under the banner → fixed once the banner scrolls away, shadow +100px (OM) ---------- */
  var nav = $('#nav'), bnr = $('.bnr');
  if (nav) {
    var ticking = false;
    var onScroll = function () {
      ticking = false;
      var bh = bnr ? bnr.offsetHeight : 0, y = window.scrollY;
      nav.classList.toggle('fix', y > bh);
      nav.classList.toggle('sh', y > bh + 100);
      if (menu && !menu.hidden) menu.style.setProperty('--mt', nav.getBoundingClientRect().bottom + 'px');
    };
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();
  }

  /* ---------- dropdowns: hover/focus via CSS, click/tap toggles ---------- */
  var dds = $$('.dd');
  function closeDd(except) { dds.forEach(function (d) { if (d !== except) { d.classList.remove('open'); $('.dd-b', d).setAttribute('aria-expanded', 'false'); } }); }
  dds.forEach(function (d) {
    var b = $('.dd-b', d);
    b.addEventListener('click', function (e) { e.stopPropagation(); var on = !d.classList.contains('open'); closeDd(d); d.classList.toggle('open', on); b.setAttribute('aria-expanded', on); });
    d.addEventListener('mouseenter', function () { b.setAttribute('aria-expanded', 'true'); });
    d.addEventListener('mouseleave', function () { if (!d.classList.contains('open')) b.setAttribute('aria-expanded', 'false'); });
    $$('.dd-p a', d).forEach(function (a) { a.addEventListener('click', function () { closeDd(); if (document.activeElement) document.activeElement.blur(); }); });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.dd')) closeDd(); });

  /* ---------- hamburger overlay ---------- */
  var menu = $('#menu'), burger = $('.burger');
  function openMenu() {
    menu.style.setProperty('--mt', nav.getBoundingClientRect().bottom + 'px');
    menu.hidden = false; root.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', burger.dataset.close);
    requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('on'); }); });
  }
  function closeMenu(focusBurger) {
    if (menu.hidden) return;
    menu.classList.remove('on'); root.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', burger.dataset.open);
    setTimeout(function () { if (!menu.classList.contains('on')) menu.hidden = true; }, 320);
    if (focusBurger) burger.focus();
  }
  if (menu && burger) {
    burger.addEventListener('click', function () { if (menu.hidden) openMenu(); else closeMenu(); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeDd(); closeMenu(true); } });
  }

  /* ---------- S1 hero: per-line mask reveal on the H1, then the "En tu visita" checks tick one by one ---------- */
  var h1 = $('.hero-h'), cardA = $('.hm-a');
  var goChecks = function () { if (cardA) cardA.classList.add('go'); };
  if (h1 && !RM) {
    var splitDone = false;
    var split = function () {
      if (splitDone) return; splitDone = true;
      var toks = [];
      [].forEach.call(h1.childNodes, function (n) {
        if (n.nodeType === 3) n.textContent.trim().split(/\s+/).forEach(function (w) { if (w) toks.push(w); });
        else if (n.nodeName === 'BR' && getComputedStyle(n).display !== 'none') toks.push('\n');
      });
      var words = toks.filter(function (w) { return w !== '\n'; });
      var escW = function (w) { return w.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); };
      // one balanced block per sentence (the <br> marks the desktop sentence break), words as measurable inline spans
      h1.innerHTML = '<span class="sb">' + toks.map(function (w) { return w === '\n' ? '</span><span class="sb">' : '<span class="w">' + escW(w) + '</span>'; }).join(' ') + '</span>';
      var lines = [], top = null;
      $$('.w', h1).forEach(function (s) { var t = s.offsetTop; if (top === null || Math.abs(t - top) > 4) { lines.push([]); top = t; } lines[lines.length - 1].push(escW(s.textContent)); });
      h1.setAttribute('aria-label', words.join(' '));
      h1.innerHTML = lines.map(function (l, i) { return '<span class="ln" aria-hidden="true"><span class="li" style="--l:' + i + '">' + l.join(' ') + '</span></span>'; }).join('');
      h1.classList.add('split');
      var last = $$('.li', h1).pop();
      if (last) last.addEventListener('animationend', function () { setTimeout(goChecks, 150); }, { once: true });
      setTimeout(goChecks, 2400); // safety
    };
    var fr = document.fonts && document.fonts.ready;
    if (fr) { Promise.race([fr, new Promise(function (r) { setTimeout(r, 1200); })]).then(split); } else split();
  } else goChecks();

  /* ---------- S1 hero parallax: arch at 0.92×, cards at 1.06× (translate only, rAF) ---------- */
  var pxEls = $$('.hero [data-px]'), hero = $('.hero');
  if (pxEls.length && !RM) {
    var pt = false;
    var para = function () {
      pt = false; var y = window.scrollY; if (y > hero.offsetTop + hero.offsetHeight) return;
      pxEls.forEach(function (e) { e.style.translate = '0 ' + (y * (1 - parseFloat(e.dataset.px))).toFixed(1) + 'px'; });
    };
    addEventListener('scroll', function () { if (!pt) { pt = true; requestAnimationFrame(para); } }, { passive: true });
  }

  /* ---------- S3 rotating word: every 2s, drop-out / drop-in .6s (OM) ---------- */
  var wrap = $('.rot-wrap');
  if (wrap && !RM) {
    var ws = $$('.rot-w', wrap), wi = 0;
    if (ws.length > 1) setInterval(function () {
      if (document.hidden) return;
      var cur = ws[wi]; wi = (wi + 1) % ws.length; var nx = ws[wi];
      wrap.classList.add('anim');
      ws.forEach(function (w) { if (w !== cur) w.classList.remove('is-hidden'); });
      cur.classList.remove('is-visible'); cur.classList.add('is-hidden'); cur.setAttribute('aria-hidden', 'true');
      nx.classList.add('is-visible'); nx.removeAttribute('aria-hidden');
    }, 2000);
  }

  /* ---------- S5 chat bubbles animate in when the phone is in view ---------- */
  var waArt = $('.wa-art');
  if (waArt) {
    if (RM || !('IntersectionObserver' in window)) waArt.classList.add('play');
    else { var wio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { waArt.classList.add('play'); wio.disconnect(); } }); }, { threshold: .35 }); wio.observe(waArt); }
  }

  /* ---------- S6 inline price expandable ---------- */
  var pm = $('.px-more'), px = $('#px-x');
  if (pm && px) pm.addEventListener('click', function () { var on = !px.classList.contains('open'); px.classList.toggle('open', on); pm.setAttribute('aria-expanded', on); });

  /* ---------- S7 player: ambient loop → real 9:16 reel with sound over a blurred copy ---------- */
  var vp = $('.vp');
  if (vp) {
    var amb = $('.vp-amb', vp), bg = $('.vp-bg', vp), mv = $('.vp-main', vp), chips = $$('.vp-chip'), cur = chips[0];
    var playBtn = $('.vp-play', vp), playLabel = (playBtn.getAttribute('aria-label') || '').split(':')[0];
    var src = function (id) { return A + 'video/full/' + id + '.mp4'; };
    function select(ch) {
      cur = ch; chips.forEach(function (c) { c.setAttribute('aria-pressed', c === ch ? 'true' : 'false'); });
      $('.vp-title', vp).textContent = ch.dataset.t; $('.vp-time', vp).textContent = ch.dataset.d;
      playBtn.setAttribute('aria-label', playLabel + ': ' + ch.dataset.t);
    }
    function start(ch) {
      if (ch) select(ch);
      var id = cur.dataset.v;
      mv.pause(); mv.innerHTML = '';
      mv.src = src(id); mv.poster = A + 'video/posters/' + id + '.jpg';
      if (cur.dataset.cc) { var t = document.createElement('track'); t.kind = 'captions'; t.srclang = 'es'; t.label = 'Español'; t.src = A + 'video/captions/' + id + '.vtt'; mv.appendChild(t); }
      bg.src = src(id); bg.muted = true;
      vp.dataset.state = 'play'; amb.pause();
      mv.controls = true; mv.muted = false; mv.setAttribute('aria-label', cur.dataset.t);
      var p = mv.play(); if (p) p.catch(function () { mv.muted = true; mv.play().catch(function () {}); });
      bg.play().catch(function () {});
    }
    function stop() { vp.dataset.state = 'idle'; mv.pause(); bg.pause(); mv.controls = false; if (!RM) amb.play().catch(function () {}); }
    vp.addEventListener('click', function (e) { if (vp.dataset.state !== 'play' && !e.target.closest('.vp-main')) start(); });
    chips.forEach(function (c) { c.addEventListener('click', function () { start(c); if (matchMedia('(max-width:767px)').matches) vp.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' }); }); });
    mv.addEventListener('play', function () { bg.play().catch(function () {}); });
    mv.addEventListener('pause', function () { bg.pause(); });
    mv.addEventListener('seeked', function () { bg.currentTime = mv.currentTime; });
    mv.addEventListener('ended', stop);
    amb.addEventListener('play', function () { if (vp.dataset.state === 'play') amb.pause(); });
  }

  /* ---------- reviews row: arrows, drag-to-scroll, snap ---------- */
  var row = $('.rv-row');
  if (row) {
    var la = $('.rv-l'), ra = $('.rv-r');
    var step = function () { var c = $('.ev-rc', row); return c ? c.getBoundingClientRect().width + 20 : 360; };
    var upd = function () { la.disabled = row.scrollLeft < 4; ra.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4; };
    la.addEventListener('click', function () { row.scrollBy({ left: -step(), behavior: RM ? 'auto' : 'smooth' }); });
    ra.addEventListener('click', function () { row.scrollBy({ left: step(), behavior: RM ? 'auto' : 'smooth' }); });
    row.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    row.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); ra.click(); } if (e.key === 'ArrowLeft') { e.preventDefault(); la.click(); } });
    var sx = 0, sl = 0, down = false, moved = false;
    row.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.button) return; down = true; moved = false; sx = e.clientX; sl = row.scrollLeft; });
    addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (!moved && Math.abs(dx) > 4) { moved = true; row.classList.add('drag'); } if (moved) row.scrollLeft = sl - dx; });
    addEventListener('pointerup', function () {
      if (!down) return; down = false;
      if (moved) { row.classList.remove('drag'); var s = step(), target = Math.round(row.scrollLeft / s) * s; row.scrollTo({ left: target, behavior: RM ? 'auto' : 'smooth' }); }
    });
    row.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }

  /* ---------- activation flow: OM-style split screen (image panel ≥1024px) ---------- */
  function decorate(f) {
    if (!f || $('.evf-art', f)) return;
    var cap = f.getAttribute('data-side') || document.body.dataset.evfCap || '';
    var a = document.createElement('aside');
    a.className = 'evf-art'; a.setAttribute('aria-hidden', 'true');
    a.innerHTML = '<img src="' + A + 'img/exam-1600.webp" alt="" loading="lazy"><p class="evf-cap"><img src="' + A + 'brand/mark-color.png" alt="">' + cap.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }) + '</p>';
    f.appendChild(a);
  }
  decorate($('.evf'));
  new MutationObserver(function (ms) { ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1 && n.classList.contains('evf')) decorate(n); }); }); }).observe(document.body, { childList: true });
})();
