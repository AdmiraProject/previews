/* Integral Design · v2 (Officine Gullo structure). Plain JS + GSAP 3.12.5/ScrollTrigger + Swiper 11.1.14. */
(function () {
  'use strict';
  var root = document.documentElement;
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MQ_M = window.matchMedia('(max-width: 800px)');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- GSAP reveal system (gs_reveal / _fromLeft / _fromRight) ----------------
     autoAlpha 0→1, x ±100 / y 100 → 0, 1.25s expo.out, once. */
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (!hasGsap || RM) {
    root.classList.remove('js');
  } else {
    gsap.registerPlugin(ScrollTrigger);
    var reveal = function (el) {
      var x = el.classList.contains('gs-l') ? -100 : el.classList.contains('gs-r') ? 100 : 0;
      var y = x === 0 ? 100 : 0;
      gsap.fromTo(el, { autoAlpha: 0, x: x, y: y }, {
        duration: 1.25, autoAlpha: 1, x: 0, y: 0, ease: 'expo', overwrite: 'auto',
        onStart: function () { if (el.classList.contains('single__media')) el.classList.add('is-in'); }
      });
    };
    $$('.gs, .gs-l, .gs-r').forEach(function (el) {
      if (el.classList.contains('gs-load')) { reveal(el); return; }
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () { reveal(el); } });
    });
  }

  /* ---------------- Header: .go after leaving the top; mega dropdown ---------------- */
  var hdr = $('#hdr');
  var onScroll = function () { hdr.classList.toggle('go', window.scrollY > 10); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var megaLi = $('.has-mega'), mega = $('#mega'), megaT;
  var megaLoaded = false;
  var loadMega = function () { if (megaLoaded) return; megaLoaded = true; $$('.mega__media img[data-src]').forEach(function (im) { im.src = im.dataset.src; }); };
  var openMega = function () { loadMega(); clearTimeout(megaT); hdr.classList.add('is-mega'); megaLi.classList.add('is-open'); mega.setAttribute('aria-hidden', 'false'); };
  var closeMega = function () { megaT = setTimeout(function () { hdr.classList.remove('is-mega'); megaLi.classList.remove('is-open'); mega.setAttribute('aria-hidden', 'true'); }, 120); };
  megaLi.addEventListener('mouseenter', openMega);
  hdr.addEventListener('mouseenter', loadMega);
  megaLi.addEventListener('mouseleave', closeMega);
  mega.addEventListener('mouseenter', openMega);
  mega.addEventListener('mouseleave', closeMega);
  megaLi.querySelector('a').addEventListener('focus', openMega);
  var megaImgs = $$('.mega__media img');
  $$('.mega a').forEach(function (a) {
    a.addEventListener('mouseenter', function () {
      $$('.mega a').forEach(function (b) { b.classList.toggle('on', b === a); });
      megaImgs.forEach(function (im, i) { im.classList.toggle('on', i === +a.dataset.img); });
    });
    a.addEventListener('click', function () {
      hdr.classList.remove('is-mega');
      if (swCol) swCol.slideTo(+a.dataset.slide);
    });
  });

  /* ---------------- Mobile menu ---------------- */
  var mm = $('#mmenu'), hamb = $('.hamb');
  var setMenu = function (open) {
    mm.classList.toggle('open', open); mm.setAttribute('aria-hidden', String(!open));
    hamb.setAttribute('aria-expanded', String(open));
  };
  hamb.addEventListener('click', function () { setMenu(true); });
  $('.mmenu__x').addEventListener('click', function () { setMenu(false); });
  $('.mmenu-dim').addEventListener('click', function () { setMenu(false); });
  $$('#mmenu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  /* On mobile, Cocinas / Taller live inside the vertical reel: route anchors to their slide */
  $$('a[data-m]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!MQ_M.matches) return;
      var slide = document.getElementById(a.dataset.m);
      if (!slide) return;
      e.preventDefault();
      $('#mreel').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
      var track = $('.mreel__track');
      track.scrollTo({ top: slide.offsetTop, behavior: RM ? 'auto' : 'smooth' });
    });
  });

  /* ---------------- Swipers ---------------- */
  var swCol = null;
  var A11Y = { prevSlideMessage: 'Anterior', nextSlideMessage: 'Siguiente', firstSlideMessage: 'Primera', lastSlideMessage: 'Última', paginationBulletMessage: 'Ir a {{index}}', slideLabelMessage: '{{index}} de {{slidesLength}}' };
  var row = function (id) {
    var el = document.getElementById(id);
    var wrap = el.closest('.slider');
    return new Swiper(el, {
      slidesPerView: 'auto', spaceBetween: 30, speed: 300, grabCursor: true, watchOverflow: true, a11y: A11Y,
      breakpoints: { 0: { spaceBetween: 20 }, 640: { spaceBetween: 30 } },
      pagination: { el: $('.ctrl__bar', wrap), type: 'progressbar' },
      navigation: { prevEl: $('.ctrl__prev', wrap), nextEl: $('.ctrl__next', wrap) },
      on: { init: function (s) { s.params.slidesOffsetAfter = parseFloat(getComputedStyle(root).getPropertyValue('--g')) || 0; } }
    });
  };
  var gutterPx = function () {
    var v = getComputedStyle(root).getPropertyValue('--g').trim();
    return v.indexOf('vw') > -1 ? parseFloat(v) * root.clientWidth / 100 : parseFloat(v);
  };
  if (window.Swiper) {
    swCol = row('sw-col');
    var swReels = row('sw-reels');
    var swPosts = row('sw-posts');
    var setOffsets = function () {
      [swCol, swReels, swPosts].forEach(function (s) { s.params.slidesOffsetAfter = gutterPx(); s.update(); });
    };
    setOffsets();
    window.addEventListener('resize', setOffsets);

    /* Ranges: image slider (loop, autoplay 6s) drives the text slider; bullets drive both.
       The section is hidden ≤800px (Gullo mobile), so init only when it is displayed. */
    var initRanges = function () {
      if (initRanges.done || MQ_M.matches) return; initRanges.done = true;
      var bullets = $('#r-bullets');
      var n = $$('#sw-rtext .swiper-slide').length;
      for (var i = 0; i < n; i++) {
        var b = document.createElement('button');
        b.type = 'button'; b.setAttribute('aria-label', 'Material ' + (i + 1));
        bullets.appendChild(b);
      }
      var bl = $$('button', bullets);
      var swText = new Swiper('#sw-rtext', { a11y: A11Y, effect: 'fade', fadeEffect: { crossFade: true }, speed: 300, allowTouchMove: false, autoHeight: false });
      var swImg = new Swiper('#sw-rimg', {
        a11y: A11Y, slidesPerView: 'auto', spaceBetween: 30, speed: 300, loop: true, loopAdditionalSlides: 2, grabCursor: true,
        autoplay: RM ? false : { delay: 6000, disableOnInteraction: false },
        on: {
          realIndexChange: function (s) {
            swText.slideTo(s.realIndex);
            bl.forEach(function (x, k) { x.classList.toggle('on', k === s.realIndex); });
          }
        }
      });
      bl[0].classList.add('on');
      bl.forEach(function (x, k) { x.addEventListener('click', function () { swImg.slideToLoop(k); }); });
    };
    initRanges();
    MQ_M.addEventListener('change', initRanges);
  }

  /* ---------------- S4: scale .5 → 1 toggle when section top ≤ 260px from viewport top ---------------- */
  var fs = $('.fullscreen');
  if (hasGsap && !RM) {
    ScrollTrigger.create({
      trigger: fs, start: 'top 260px',
      onEnter: function () { fs.classList.add('in'); },
      onLeaveBack: function () { fs.classList.remove('in'); }
    });
  } else {
    fs.classList.add('in');
  }

  /* ---------------- Deferred posters: desktop reel cards when near view; mobile reel only on mobile ---------------- */
  var setPoster = function (v) { if (v.dataset.poster && !v.getAttribute('poster')) v.poster = v.dataset.poster; };
  var mPosters = function () { if (MQ_M.matches) $$('.mreel video[data-poster]').forEach(setPoster); };
  mPosters(); MQ_M.addEventListener('change', mPosters);
  if ('IntersectionObserver' in window) {
    var pio = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { setPoster(e.target); pio.unobserve(e.target); } });
    }, { rootMargin: '300px 600px' });
    $$('.reel video[data-poster], .fullscreen video[data-poster], .single__media video[data-poster]').forEach(function (v) { pio.observe(v); });
  } else { $$('.reel video[data-poster], .fullscreen video[data-poster], .single__media video[data-poster]').forEach(setPoster); }

  /* ---------------- Lazy video play/pause by visibility ---------------- */
  var ensureSrc = function (v) {
    if (v.dataset.src && !v.getAttribute('src')) {
      var src = (MQ_M.matches && v.dataset.srcM) ? v.dataset.srcM : v.dataset.src;
      v.src = src;
    }
  };
  if (!RM && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { setPoster(v); ensureSrc(v); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else if (!v.paused) v.pause();
      });
    }, { threshold: 0.25 });
    $$('video[data-src]').forEach(function (v) { io.observe(v); });
  }

  /* ---------------- Mobile reel dots ---------------- */
  var track = $('.mreel__track');
  if (track) {
    var dots = $$('.mreel__dots li'), slides = $$('.mreel__slide');
    track.addEventListener('scroll', function () {
      var k = Math.round(track.scrollTop / Math.max(1, track.clientHeight));
      dots.forEach(function (d, j) { d.classList.toggle('on', j === k); });
    }, { passive: true });
  }

  /* ---------------- S1 hero: process montage, 2 stacked <video> crossfading ---------------- */
  var HERO = '../assets/hero/hero-';
  var clips = ['marmol-macro-parrilla', 'fab-corte-aserrin', 'fab-sierra-corte-macro', 'cajones-push-open', 'cocina-negra-cubierta-led'];
  var HOLD = 5.2, XFADE = 1.4;
  var vids = $$('.hero__v'), steps = $$('.hero__steps li');
  var heroOn = !MQ_M.matches;
  if (heroOn && RM) {
    vids[0].poster = HERO + clips[clips.length - 1] + '-16x9.jpg';
    steps.forEach(function (s, k) { s.classList.toggle('on', k === steps.length - 1); });
  } else if (heroOn) {
    var cur = 0, front = 0, switching = false;
    var load = function (v, idx) { v.src = HERO + clips[idx] + '-16x9.mp4'; v.poster = HERO + clips[idx] + '-16x9.jpg'; v.preload = 'auto'; v.load(); };
    var mark = function (idx) {
      steps.forEach(function (s, k) { s.classList.remove('on'); s.classList.toggle('done', k !== idx); });
      void steps[idx].offsetWidth;
      steps[idx].classList.remove('done'); steps[idx].classList.add('on');
    };
    root.style.setProperty('--hold', (HOLD + XFADE * 0.5) + 's');
    load(vids[0], 0);
    load(vids[1], 1);
    var play = function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    play(vids[0]); mark(0);
    var heroVisible = true;
    var tick = function () {
      if (!heroVisible) return;
      var a = vids[front];
      var dur = isFinite(a.duration) ? a.duration : 8;
      var limit = Math.min(HOLD, dur - XFADE - 0.2);
      if (!switching && a.currentTime >= limit) {
        switching = true;
        var b = vids[1 - front];
        b.currentTime = 0; play(b);
        b.classList.add('on'); a.classList.remove('on');
        cur = (cur + 1) % clips.length; mark(cur);
        setTimeout(function () {
          a.pause();
          load(a, (cur + 1) % clips.length);
          front = 1 - front; switching = false;
        }, XFADE * 1000 + 100);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    /* pause hero when out of view */
    new IntersectionObserver(function (en) {
      var vis = en[0].isIntersecting;
      if (vis && !heroVisible) { heroVisible = true; play(vids[front]); requestAnimationFrame(tick); }
      else if (!vis && heroVisible) { heroVisible = false; vids.forEach(function (v) { v.pause(); }); }
    }).observe($('.hero'));
  }

  /* ---------------- Lightbox (reels + taller video) ---------------- */
  var lb = $('#lb'), lbv = $('.lb__v'), lastFocus;
  var openLb = function (src, poster, vertical) {
    lastFocus = document.activeElement;
    lbv.src = src; if (poster) lbv.poster = poster;
    lbv.style.aspectRatio = vertical ? '9 / 16' : '16 / 9';
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    var p = lbv.play(); if (p && p.catch) p.catch(function () {});
    $('.lb__x').focus();
  };
  var closeLb = function () {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
    lbv.pause(); lbv.removeAttribute('src'); lbv.load();
    if (lastFocus) lastFocus.focus();
  };
  $$('.reel').forEach(function (r) {
    var go = function () { var s = '../assets/reels/' + r.dataset.reel; openLb(s + '.mp4', s + '.jpg', true); };
    r.addEventListener('click', function () { if (!r.closest('.swiper') || !r.closest('.swiper').swiper || !r.closest('.swiper').swiper.animating) go(); });
    r.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  $('.fullscreen__open').addEventListener('click', function () { openLb(this.dataset.video, null, false); });
  $('.lb__x').addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Tab' && lb.classList.contains('open')) { var f = [$('.lb__x'), lbv]; var i = f.indexOf(document.activeElement); e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus(); return; }
    if (e.key === 'Escape') { if (lb.classList.contains('open')) closeLb(); setMenu(false); hdr.classList.remove('is-mega'); }
  });

  /* ---------------- Footer accordions (mobile) ---------------- */
  $$('.ftr__t').forEach(function (t) {
    t.addEventListener('click', function () {
      if (!MQ_M.matches) return;
      var col = t.parentNode, open = !col.classList.contains('open');
      col.classList.toggle('open', open); t.setAttribute('aria-expanded', String(open));
    });
  });
})();
