/* Snowball v2 motion. Every spring below uses the stiffness / damping / mass measured on the benchmark,
   solved numerically and played through the Web Animations API. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqMobile = window.matchMedia('(max-width: 809.98px)');
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  window.__sbReady = true;

  /* ---------- spring solver: returns progress samples at 60fps ---------- */
  var cache = {};
  function spring(k, c, m) {
    var key = k + '|' + c + '|' + m;
    if (cache[key]) return cache[key];
    var x = 0, v = 0, dt = 1 / 600, pts = [0], i = 0;
    while (i < 600 * 8) {
      var a = (-k * (x - 1) - c * v) / m;
      v += a * dt; x += v * dt; i++;
      if (i % 10 === 0) { pts.push(x); if (Math.abs(x - 1) < 0.0006 && Math.abs(v) < 0.006) break; }
    }
    pts[pts.length - 1] = 1;
    return (cache[key] = { pts: pts, dur: (pts.length - 1) / 60 * 1000 });
  }
  function play(el, sp, frame, delay) {
    if (!el.animate) { return null; }
    var kfs = sp.pts.map(frame);
    return el.animate(kfs, { duration: sp.dur, delay: delay || 0, easing: 'linear', fill: 'both' });
  }
  var clamp01 = function (n) { return n < 0 ? 0 : n > 1 ? 1 : n; };
  var SP = {
    hero: [80, 20, 1],      // hero appear, delay .3s
    reveal: [75, 23, 1],    // scroll-in panels and cards
    navOpen: [80, 20, 2],   // desktop pill opening
    navDrop: [100, 20, 2]   // mobile bar drop-in, delay .3s
  };

  /* ---------- no-motion path: show everything in its final state ---------- */
  function showAll() {
    $$('.is-pre').forEach(function (e) { e.classList.remove('is-pre'); });
    $$('.rv-pre').forEach(function (e) { e.classList.remove('rv-pre'); });
    var pill = $('.nav-pill'); if (pill) pill.classList.remove('is-closed');
  }

  /* ---------- nav: desktop pill opening ---------- */
  function openPill() {
    var pill = $('.nav-pill');
    if (!pill || !pill.classList.contains('is-closed')) return;
    var cta = $('.nav-cta', pill);
    pill.classList.remove('is-closed');
    var W = pill.getBoundingClientRect().width;
    var W0 = 149;
    if (!pill.animate || W <= W0) return;
    pill.classList.add('is-opening');
    var sp = spring.apply(null, SP.navOpen);
    var a = play(pill, sp, function (p) { return { width: (W0 + (W - W0) * p) + 'px' }; });
    if (cta) play(cta, sp, function (p) { return { transform: 'translateX(' + (-(W - W0) * (1 - p)) + 'px)', opacity: clamp01(p) }; }).onfinish = function () { this.cancel(); };
    a.onfinish = function () {
      a.cancel(); pill.classList.remove('is-opening');
      var now = pill.getBoundingClientRect().width;
      if (Math.abs(now - W) > 1) pill.animate([{ width: W + 'px' }, { width: now + 'px' }], { duration: 220, easing: 'ease-out' });
    };
  }
  function dropMobileBar() {
    var bar = $('.mnav');
    if (!bar || !bar.classList.contains('is-pre')) return;
    var sp = spring.apply(null, SP.navDrop);
    var a = play(bar, sp, function (p) { return { opacity: clamp01(0.001 + p), transform: 'translateY(' + (-250 * (1 - p)) + 'px)' }; }, 300);
    bar.classList.remove('is-pre');
    if (a) a.onfinish = function () { a.cancel(); };
  }

  /* ---------- hero appear ---------- */
  function heroIn(delay) {
    var hero = $('[data-hero]');
    if (!hero || !hero.classList.contains('is-pre')) return;
    var sp = spring.apply(null, SP.hero);
    var a = play(hero, sp, function (p) {
      return { opacity: clamp01(p), transform: 'perspective(1200px) translateY(' + (150 * (1 - p)) + 'px) rotateX(' + (-10 * (1 - p)) + 'deg)' };
    }, delay || 0);
    hero.classList.remove('is-pre');
    if (a) a.onfinish = function () { a.cancel(); };
  }

  /* ---------- scroll reveals (threshold = half of the element, capped at half the viewport) ---------- */
  function reveals() {
    var items = $$('[data-rv]').map(function (el) { return { el: el, kind: el.getAttribute('data-rv'), on: false, anim: null }; });
    if (!items.length) return;
    var spIn = spring.apply(null, SP.reveal);
    function enter(it) {
      var el = it.el;
      if (it.kind === 'fade') {
        // benchmark: the section fades in once (~0.35s) and never fades out
        el.classList.remove('rv-pre');
        if (el.animate) {
          var f = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: 'ease-out' });
          f.onfinish = function () { el.style.willChange = 'auto'; };
        }
        return;
      }
      var dx = it.kind === 'right' ? 150 : -150;
      var a = play(el, spIn, function (p) { return { opacity: clamp01(p), transform: 'perspective(1200px) translateX(' + (dx * (1 - p)) + 'px)' }; });
      el.classList.remove('rv-pre');
      if (a) a.onfinish = function () { a.cancel(); el.style.willChange = 'auto'; };
    }
    var ticking = false;
    function check() {
      ticking = false;
      var vh = window.innerHeight;
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (it.done) continue;
        var r = it.el.getBoundingClientRect();
        var vis = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        var need = 0.5 * Math.min(r.height, vh);
        var inView = vis >= need - 0.5;
        if (inView) { it.done = true; enter(it); }
      }
    }
    function req() { if (!ticking) { ticking = true; requestAnimationFrame(check); } }
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    check();
  }

  /* ---------- work ticker: 55 px/s, linear, infinite ---------- */
  function ticker() {
    var sec = $('[data-ticker]'); if (!sec) return;
    var track = $('.ticker-track', sec);
    var items = $$('.tk', track);
    var n = items.length;
    for (var c = 0; c < 2; c++) {
      items.forEach(function (li) {
        var cl = li.cloneNode(true);
        cl.setAttribute('aria-hidden', 'true');
        track.appendChild(cl);
      });
    }
    function measure() {
      var all = $$('.tk', track);
      var w = all[n].offsetLeft - all[0].offsetLeft;
      track.style.setProperty('--tick-w', w + 'px');
      track.style.setProperty('--tick-dur', (w / 55) + 's');
    }
    measure();
    window.addEventListener('resize', measure);
    sec.classList.remove('is-pre');
    if (reduce) return;
    track.classList.add('is-run');
    var vids = $$('video', track);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var v = e.target;
          if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
          else v.pause();
        });
      }, { rootMargin: '0px 80px 0px 80px', threshold: 0.01 });
      vids.forEach(function (v) { io.observe(v); });
    }
  }

  /* ---------- testimonials carousel ---------- */
  function carousel() {
    var sec = $('[data-carousel]'); if (!sec) return;
    var track = $('.car-track', sec), prev = $('.car-prev', sec), next = $('.car-next', sec);
    prev.hidden = false; next.hidden = false;
    function max() { return Math.max(0, track.scrollWidth - track.clientWidth); }
    function sync() {
      var m = max(), x = track.scrollLeft;
      var atStart = x <= 2, atEnd = x >= m - 2;
      prev.classList.toggle('is-off', atStart);
      next.classList.toggle('is-off', atEnd || m === 0);
      prev.tabIndex = atStart ? -1 : 0; next.tabIndex = atEnd ? -1 : 0;
      track.style.setProperty('--fl', atStart ? '0%' : '12.5%');
      track.style.setProperty('--fr', atEnd ? '0%' : '12.5%');
    }
    function page(dir) {
      var m = max(); if (!m) return;
      var pages = Math.max(2, Math.ceil(track.scrollWidth / track.clientWidth));
      var step = m / (pages - 1);
      var cur = Math.round(track.scrollLeft / step);
      var to = Math.max(0, Math.min(pages - 1, cur + dir)) * step;
      track.scrollTo({ left: to, behavior: reduce ? 'auto' : 'smooth' });
    }
    prev.addEventListener('click', function () { page(-1); });
    next.addEventListener('click', function () { page(1); });
    track.addEventListener('scroll', function () { requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  /* ---------- nav dropdowns + mobile menu ---------- */
  function navUI() {
    $$('[data-dd]').forEach(function (dd) {
      var btn = $('.nav-dd-btn', dd), timer = null;
      function set(open) {
        clearTimeout(timer);
        dd.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      dd.addEventListener('mouseenter', function () { set(true); });
      dd.addEventListener('mouseleave', function () { set(false); });
      btn.addEventListener('click', function () { set(!dd.classList.contains('is-open')); });
      dd.addEventListener('focusout', function (e) { if (!dd.contains(e.relatedTarget)) set(false); });
      doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dd.classList.contains('is-open')) { set(false); btn.focus(); } });
      doc.addEventListener('click', function (e) { if (!dd.contains(e.target)) set(false); });
    });
    var m = $('[data-mnav]');
    if (m) {
      var tog = $('.mnav-toggle', m);
      var setM = function (open) {
        m.classList.toggle('is-open', open);
        tog.setAttribute('aria-expanded', open ? 'true' : 'false');
        tog.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      };
      tog.addEventListener('click', function () { setM(!m.classList.contains('is-open')); });
      $$('.mnav-inner a', m).forEach(function (a) { a.addEventListener('click', function () { setM(false); }); });
      doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && m.classList.contains('is-open')) { setM(false); tog.focus(); } });
      $$('[data-acc]', m).forEach(function (acc) {
        var b = $('.mnav-acc-btn', acc);
        b.addEventListener('click', function () {
          var o = !acc.classList.contains('is-open');
          acc.classList.toggle('is-open', o);
          b.setAttribute('aria-expanded', o ? 'true' : 'false');
        });
      });
    }
  }

  function init() {
    navUI();
    carousel();
    ticker();
    if (reduce) { showAll(); return; }
    // the benchmark starts its opening sequence when the page becomes interactive
    var started = false;
    function start() {
      if (started) return; started = true;
      var b = $('.mnav'); if (b) b.classList.remove('is-pre');
      // benchmark: both springs carry a 0.3s delay and leave rest in the same frame on desktop
      setTimeout(openPill, 300);
      heroIn(300);
    }
    if (mqMobile.matches) {
      // mobile: the bar drops first, the hero follows ~0.4s later (benchmark)
      var p = $('.nav-pill'); if (p) p.classList.remove('is-closed');
      dropMobileBar();
      heroIn(700);
    } else {
      // desktop: measure the pill with the webfonts if they arrive quickly; never wait more than 0.4s
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(start);
      setTimeout(start, 400);
    }
    reveals();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
