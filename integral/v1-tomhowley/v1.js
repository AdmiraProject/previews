/* Integral Design · v1 (Tom Howley structure). Vanilla: mega menu, drawer, hero sequence,
   Slick-style sliders (infinite, 2-up / 4-up, bar dots, drag; unslick ≤767), tabs, video IO, reels lightbox. */
(function () {
  'use strict';
  var html = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqMob = matchMedia('(max-width: 767px)');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- mega menu (instant, with page dimmer) ---------------- */
  var hdr = $('.hdr'), dim = $('.dim'), openMega = null;
  function showMega(id) {
    if (openMega && openMega.id === id) return;
    hideMega();
    var m = document.getElementById(id); if (!m) return;
    m.hidden = false; openMega = m; dim.classList.add('is-on');
    $$('.nav li').forEach(function (li) { li.classList.toggle('is-open', li.dataset.mega === id); });
  }
  function hideMega() {
    if (openMega) openMega.hidden = true;
    openMega = null; dim.classList.remove('is-on');
    $$('.nav li.is-open').forEach(function (li) { li.classList.remove('is-open'); });
  }
  $$('.nav li').forEach(function (li) {
    var on = function () { if (li.dataset.mega) showMega(li.dataset.mega); else hideMega(); };
    li.addEventListener('mouseenter', on);
    li.addEventListener('mousemove', on);
    li.addEventListener('focusin', on);
  });
  [$('.bar__logo'), $('.bar__cta')].forEach(function (el) { el && el.addEventListener('mouseenter', hideMega); });
  hdr.addEventListener('mouseleave', hideMega);
  dim.addEventListener('click', hideMega);
  $$('.mega a').forEach(function (a) { a.addEventListener('click', hideMega); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { hideMega(); closeMenu(); } });

  /* ---------------- mobile drawer ---------------- */
  var burger = $('.burger'), drawer = $('#drawer');
  function closeMenu() {
    if (!html.classList.contains('is-menu')) return;
    html.classList.remove('is-menu'); burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menú'); drawer.setAttribute('aria-hidden', 'true');
  }
  burger.addEventListener('click', function () {
    var open = !html.classList.contains('is-menu');
    if (!open) return closeMenu();
    html.classList.add('is-menu'); burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Cerrar menú'); drawer.setAttribute('aria-hidden', 'false');
  });
  $$('.plus', drawer).forEach(function (b) {
    b.addEventListener('click', function () {
      var li = b.closest('li'), on = !li.classList.contains('is-sub');
      li.classList.toggle('is-sub', on); b.setAttribute('aria-expanded', on);
    });
  });
  $$('a', drawer).forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ---------------- hero: sequence of real clips with crossfade ---------------- */
  (function hero() {
    var box = $('.hero'); if (!box) return;
    var vids = $$('.hero__v', box), cur = 0, visible = true;
    var fmt = function () { return mqMob.matches ? '4x5' : '16x9'; };
    var srcOf = function (v) { return '../assets/hero/' + v.dataset.name + '-' + fmt() + '.mp4'; };
    var first = vids[0];
    // guard for browsers that ignore <source media>
    if (first.currentSrc && first.currentSrc.indexOf(fmt()) === -1) { first.src = srcOf(first); }
    if (mqMob.matches) first.poster = '../assets/hero/' + first.dataset.name + '-4x5.jpg';
    if (reduce) { vids.forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); }); return; }
    function prep(v) {
      if (v.getAttribute('src')) return;
      v.poster = '../assets/hero/' + v.dataset.name + '-' + fmt() + '.jpg';
      v.preload = 'auto'; v.src = srcOf(v); v.load();
    }
    function next() {
      var a = vids[cur], ni = (cur + 1) % vids.length, b = vids[ni];
      prep(b);
      try { b.currentTime = 0; } catch (e) {}
      var p = b.play();
      var swap = function () {
        b.classList.add('is-on'); a.classList.remove('is-on'); cur = ni;
        setTimeout(function () { a.pause(); }, 950);
        prep(vids[(ni + 1) % vids.length]);
      };
      if (p && p.then) p.then(swap).catch(function () { cur = ni; next(); }); else swap();
    }
    vids.forEach(function (v) {
      v.addEventListener('ended', function () { if (v === vids[cur]) next(); });
      v.addEventListener('error', function () { if (v === vids[cur]) next(); }, true);
    });
    first.addEventListener('playing', function once() { first.removeEventListener('playing', once); prep(vids[1]); });
    var p0 = first.play(); if (p0 && p0.catch) p0.catch(function () {});
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        var v = vids[cur];
        if (visible) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
      }, { threshold: 0.05 }).observe(box);
    }
  })();

  /* ---------------- Slick-style slider ---------------- */
  var dragged = false;
  window.addEventListener('click', function (e) {
    if (dragged) { e.preventDefault(); e.stopImmediatePropagation(); dragged = false; }
  }, true);

  function Slider(el) {
    var show = +el.dataset.show || 1, step = +el.dataset.scroll || 1;
    var list = $('.sl__list', el), track = $('.sl__track', el);
    var orig = $$('.sl__slide', track), n = orig.length;
    var dotsUl = $('.sl__dots', el), dots = [];
    var idx = 0, built = false, active = false, w = 0;
    $$('img', el).forEach(function (i) { i.draggable = false; });

    function build() {
      if (built) return; built = true;
      for (var i = 0; i < show; i++) {
        var a = orig[n - 1 - i].cloneNode(true), b = orig[i].cloneNode(true);
        [a, b].forEach(function (c) { c.classList.add('is-clone'); c.setAttribute('aria-hidden', 'true'); c.setAttribute('inert', ''); });
        track.insertBefore(a, track.firstChild); track.appendChild(b);
      }
      if (dotsUl) {
        var count = Math.ceil(n / step);
        for (var k = 0; k < count; k++) {
          var li = document.createElement('li'), bt = document.createElement('button');
          bt.type = 'button'; bt.setAttribute('aria-label', 'Ir a ' + (k + 1) + ' de ' + count);
          (function (k) { bt.addEventListener('click', function () { go(k * step); }); })(k);
          li.appendChild(bt); dotsUl.appendChild(li); dots.push(li);
        }
      }
      el.__clonesReady = true;
    }
    function pos(i, anim) {
      track.style.transition = anim ? 'transform .5s ease' : 'none';
      track.style.transform = 'translate3d(' + (-(i + show) * w) + 'px,0,0)';
    }
    function go(i, anim) {
      idx = i; pos(idx, anim !== false && !reduce);
      var d = Math.floor((((idx % n) + n) % n) / step);
      dots.forEach(function (li, k) { li.classList.toggle('is-on', k === d); });
      if (reduce) fix();
    }
    function fix() {
      if (idx >= n) { idx -= n; pos(idx, false); }
      else if (idx < 0) { idx += n; pos(idx, false); }
    }
    track.addEventListener('transitionend', function (e) { if (e.target === track) fix(); });
    function layout() {
      w = list.clientWidth / show; pos(idx, false);
      var m = orig[0].querySelector('.story__img,.qcard,img,.reel__b');
      if (m) el.style.setProperty('--arr', (m.getBoundingClientRect().top - el.getBoundingClientRect().top + m.offsetHeight / 2) + 'px');
    }
    function setup() {
      if (mqMob.matches) {
        active = false; el.classList.remove('is-slick');
        track.style.transform = ''; track.style.transition = '';
      } else {
        build(); active = true; el.classList.add('is-slick'); layout(); go(idx, false);
      }
    }
    var prev = $('.sl__prev', el), nxt = $('.sl__next', el);
    prev && prev.addEventListener('click', function () { if (active) go(idx - step); });
    nxt && nxt.addEventListener('click', function () { if (active) go(idx + step); });

    // drag / swipe
    var sx = 0, sy = 0, dx = 0, down = false, moving = false, pid = null;
    list.addEventListener('pointerdown', function (e) {
      if (!active || (e.pointerType === 'mouse' && e.button !== 0)) return;
      fix(); down = true; moving = false; sx = e.clientX; sy = e.clientY; dx = 0; pid = e.pointerId;
    });
    list.addEventListener('pointermove', function (e) {
      if (!down || e.pointerId !== pid) return;
      dx = e.clientX - sx;
      if (!moving) {
        if (Math.abs(dx) < 6) return;
        if (Math.abs(e.clientY - sy) > Math.abs(dx)) { down = false; return; }
        moving = true; el.classList.add('is-drag');
        try { list.setPointerCapture(pid); } catch (er) {}
      }
      track.style.transition = 'none';
      track.style.transform = 'translate3d(' + (-(idx + show) * w + dx) + 'px,0,0)';
    });
    function up() {
      if (!down) return; down = false; el.classList.remove('is-drag');
      if (!moving) return;
      dragged = true; setTimeout(function () { dragged = false; }, 0);
      if (dx < -50) go(idx + step); else if (dx > 50) go(idx - step); else go(idx);
    }
    list.addEventListener('pointerup', up);
    list.addEventListener('pointercancel', up);
    el.addEventListener('keydown', function (e) {
      if (!active) return;
      if (e.key === 'ArrowLeft') go(idx - step); else if (e.key === 'ArrowRight') go(idx + step);
    });

    setup();
    mqMob.addEventListener ? mqMob.addEventListener('change', setup) : mqMob.addListener(setup);
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (active) layout(); }, 80); });
  }
  $$('.sl').forEach(Slider);

  /* ---------------- tabs (instant swap) + drag-to-scroll strip ---------------- */
  var tabs = $$('.tab'), panels = $$('.tp'), strip = $('.tabs');
  function activate(i, focus) {
    tabs.forEach(function (t, k) {
      var on = k === i; t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      panels[k].classList.toggle('is-on', on);
    });
    if (focus) tabs[i].focus();
    var t = tabs[i];
    if (strip.scrollWidth > strip.clientWidth) strip.scrollTo({ left: t.offsetLeft - (strip.clientWidth - t.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
  }
  var sDown = false, sX = 0, sL = 0, sMoved = false;
  strip.addEventListener('mousedown', function (e) { sDown = true; sMoved = false; sX = e.pageX; sL = strip.scrollLeft; });
  window.addEventListener('mousemove', function (e) { if (!sDown) return; var d = e.pageX - sX; if (Math.abs(d) > 4) sMoved = true; strip.scrollLeft = sL - d; });
  window.addEventListener('mouseup', function () { sDown = false; });
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function (e) { if (sMoved) { e.preventDefault(); sMoved = false; return; } activate(i); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') activate((i + 1) % tabs.length, true);
      if (e.key === 'ArrowLeft') activate((i - 1 + tabs.length) % tabs.length, true);
    });
  });
  $$('a[data-tab]').forEach(function (a) { a.addEventListener('click', function () { activate(+a.dataset.tab); }); });

  /* ---------------- videos: play only while visible ---------------- */
  $$('video[data-poster-m]').forEach(function (v) { if (mqMob.matches) v.poster = v.dataset.posterM; });
  function load(v) {
    if (v.getAttribute('src')) return;
    var s = v.dataset.src || (mqMob.matches ? v.dataset.srcM : v.dataset.srcD);
    if (s) { v.src = s; }
  }
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { load(v); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else if (!v.paused) v.pause();
      });
    }, { threshold: 0.25 });
    $$('video[data-io]').forEach(function (v) { io.observe(v); });
  }

  /* ---------------- reels lightbox ---------------- */
  var lb = $('#lb'), lbv = $('.lb__v', lb), lbc = $('.lb__c', lb), lastFocus = null, cur = 0;
  var reels = $$('.sl--reels .sl__slide:not(.is-clone) .reel__b').map(function (b) {
    return { name: b.dataset.reel, cap: b.parentNode.querySelector('.reel__c').textContent };
  });
  var pp = $('.lb__pp', lb), bar = $('.lb__bar i', lb);
  function syncPP() { var p = lbv.paused; pp.classList.toggle('is-paused', p); pp.setAttribute('aria-label', p ? 'Reproducir' : 'Pausar'); }
  function togglePlay() { if (lbv.paused) { var q = lbv.play(); if (q && q.catch) q.catch(function () {}); } else lbv.pause(); }
  pp.addEventListener('click', togglePlay);
  lbv.addEventListener('click', togglePlay);
  lbv.addEventListener('play', syncPP); lbv.addEventListener('pause', syncPP);
  lbv.addEventListener('timeupdate', function () { if (lbv.duration) bar.style.width = (lbv.currentTime / lbv.duration * 100) + '%'; });
  function setReel(i) {
    bar.style.width = '0';
    cur = (i + reels.length) % reels.length;
    var r = reels[cur];
    lbv.poster = '../assets/reels/' + r.name + '.jpg';
    lbv.src = '../assets/reels/' + r.name + '.mp4';
    lbc.textContent = r.cap;
    var p = lbv.play(); if (p && p.catch) p.catch(function () {});
  }
  function openLb(name) {
    var i = 0; reels.forEach(function (r, k) { if (r.name === name) i = k; });
    lastFocus = document.activeElement;
    lb.hidden = false; html.classList.add('lb-lock'); setReel(i);
    $('.lb__x', lb).focus({ preventScroll: true });
  }
  function closeLb() {
    if (lb.hidden) return;
    lb.hidden = true; html.classList.remove('lb-lock'); lbv.pause(); lbv.removeAttribute('src'); lbv.load();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-reel]');
    if (b) { e.preventDefault(); openLb(b.dataset.reel); }
  });
  $('.lb__x', lb).addEventListener('click', closeLb);
  $('.lb__prev', lb).addEventListener('click', function () { setReel(cur - 1); });
  $('.lb__next', lb).addEventListener('click', function () { setReel(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') setReel(cur - 1);
    if (e.key === 'ArrowRight') setReel(cur + 1);
    if (e.key === 'Tab') {
      var f = $$('button', lb), a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  /* ---------------- footer: mobile accordions + zone select ---------------- */
  $$('.fcol__h').forEach(function (h) {
    h.addEventListener('click', function () {
      if (!mqMob.matches) return;
      var c = h.parentNode, on = !c.classList.contains('is-open');
      c.classList.toggle('is-open', on); h.setAttribute('aria-expanded', on);
    });
  });
  var zone = $('#zone');
  zone && zone.addEventListener('change', function () {
    var v = zone.value; if (!v) return;
    if (window.IDLead) window.IDLead.open('Quiero agendar una visita técnica en ' + v);
    zone.value = '';
  });
})();
