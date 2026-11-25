
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = !!window.gsap;
  if (hasG && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, anchors: true, stopInertiaOnNavigate: true, autoToggle: true, autoRaf: false });
    if (hasG) { gsap.ticker.add(function (t) { lenis.raf(t * 1000) }); gsap.ticker.lagSmoothing(0); if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update) }
    else { (function r(t) { lenis.raf(t); requestAnimationFrame(r) })(0) }
    window.__lenis = lenis;
  }
  // keep Lenis paused while the booking popup is open
  new MutationObserver(function () { if (!lenis) return; document.documentElement.classList.contains('bk-lock') ? lenis.stop() : (document.body.classList.contains('modal-open') || lenis.start()) }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  
  var fits = [].slice.call(document.querySelectorAll('[data-fit]'));
  function fitAll() { fits.forEach(function (b) { var st = b.querySelector(':scope>[class$="-stage"]'); if (!st) return;
    var W = +b.getAttribute('data-fit'), H = st.offsetHeight, s = Math.min(b.clientWidth / W, b.clientHeight / H); st.style.transform = 'translate(' + ((b.clientWidth - W * s) / 2) + 'px,' + ((b.clientHeight - H * s) / 2) + 'px) scale(' + s + ')' }) }
  fitAll(); addEventListener('resize', fitAll); if (window.ResizeObserver) { var ro = new ResizeObserver(fitAll); fits.forEach(function (b) { ro.observe(b) }) }

  
  var nav = document.querySelector('.nav');
  if (nav) {
    var lastY = scrollY, ticking = false;
    var anyOpen = function () { return nav.classList.contains('menu-open') || nav.querySelector('.dd.is-open') };
    addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = scrollY, d = y - lastY, h = nav.offsetHeight;
        if (anyOpen() || y <= h) nav.classList.remove('is-hidden');
        else if (d > 5) nav.classList.add('is-hidden');
        else if (d < -5) nav.classList.remove('is-hidden');
        if (Math.abs(d) > 5) lastY = y; ticking = false;
      });
    }, { passive: true });
    nav.addEventListener('focusin', function () { nav.classList.remove('is-hidden') });
    nav.querySelectorAll('.dd').forEach(function (dd) {
      dd.querySelector('.toggle').addEventListener('click', function (e) {
        e.stopPropagation(); var open = dd.classList.contains('is-open');
        nav.querySelectorAll('.dd.is-open').forEach(function (o) { o.classList.remove('is-open'); o.querySelector('.toggle').setAttribute('aria-expanded', 'false') });
        if (!open) { dd.classList.add('is-open'); this.setAttribute('aria-expanded', 'true') }
      });
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.dd') && innerWidth > 991) nav.querySelectorAll('.dd.is-open').forEach(function (o) { o.classList.remove('is-open') }) });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') nav.querySelectorAll('.dd.is-open').forEach(function (o) { o.classList.remove('is-open') }) });
    var burger = nav.querySelector('.burger');
    if (burger) burger.addEventListener('click', function () { var o = nav.classList.toggle('menu-open'); burger.setAttribute('aria-expanded', o) });
    nav.querySelectorAll('[data-book]').forEach(function (b) { b.addEventListener('click', function () { nav.classList.remove('menu-open'); nav.querySelectorAll('.dd.is-open').forEach(function (o) { o.classList.remove('is-open') }) }) });
  }

  
  document.querySelectorAll('[data-mq]').forEach(function (box) {
    var track = box.querySelector('.mq-track'), set = [].slice.call(track.children), setW = 0, x = 0, prev = null;
    var speed = +box.getAttribute('data-mq') || 40;
    function setup() {
      track.querySelectorAll('[data-clone]').forEach(function (c) { c.remove() });
      setW = set.reduce(function (a, el) { return a + el.getBoundingClientRect().width + 48 }, 0);
      if (!setW) return;
      var n = Math.ceil(Math.max(box.offsetWidth, innerWidth) / setW) + 1;
      for (var i = 0; i < n; i++) set.forEach(function (el) { var c = el.cloneNode(true); c.setAttribute('data-clone', ''); c.setAttribute('aria-hidden', 'true'); track.appendChild(c) });
    }
    track.querySelectorAll('img').forEach(function (im) { if (!im.complete) im.addEventListener('load', setup) });
    setup(); addEventListener('resize', setup);
    (function tick(now) { if (prev === null) prev = now; var dt = Math.min(.1, (now - prev) / 1000); prev = now; if (setW) { x = (x + speed * dt) % setW; track.style.transform = 'translate3d(' + (-x) + 'px,0,0)' } requestAnimationFrame(tick) })(performance.now());
  });

  
  document.querySelectorAll('[data-xmq]').forEach(function (box) {
    var track = box.querySelector('.xmq-track'), set = [].slice.call(track.children), setW = 0, x = 0, prev = null, paused = false;
    function setup() {
      track.querySelectorAll('[data-clone]').forEach(function (c) { c.remove() });
      setW = set.reduce(function (a, el) { return a + el.getBoundingClientRect().width + 20 }, 0);
      var n = Math.ceil(innerWidth / setW) + 1;
      for (var i = 0; i < n; i++) set.forEach(function (el) { var c = el.cloneNode(true); c.setAttribute('data-clone', ''); c.setAttribute('tabindex', '-1'); track.appendChild(c) });
    }
    setup(); addEventListener('resize', setup);
    box.addEventListener('mouseenter', function () { paused = true }); box.addEventListener('mouseleave', function () { paused = false });
    box.addEventListener('focusin', function () { paused = true }); box.addEventListener('focusout', function () { paused = false });
    (function tick(now) { if (prev === null) prev = now; var dt = Math.min(.1, (now - prev) / 1000); prev = now; if (setW && !paused) { x = (x + 30 * dt) % setW; track.style.transform = 'translate3d(' + (-x) + 'px,0,0)' } requestAnimationFrame(tick) })(performance.now());
  });

  
  var vx = document.querySelector('.vx');
  if (vx && hasG && window.ScrollTrigger) {
    var mm = gsap.matchMedia();
    mm.add('(min-width: 992px)', function () {
      gsap.fromTo('.vx-thumb', { width: '30vw', height: '16.875vw' }, { width: '100vw', height: '100vh', ease: 'none', duration: 1,
        scrollTrigger: { trigger: '.vx', start: 'top top', end: 'bottom bottom', scrub: 0.5 } });
    });
  }

  
  document.querySelectorAll('.vid-facade').forEach(function (el) {
    var src = el.getAttribute('data-src'); if (!src) return;
    var img = el.querySelector('img'), btn = el.querySelector('.vid-play'), title = el.getAttribute('data-title'), v = null, sysPause = false, userPaused = false;
    function setLabel(t, verb) { btn.textContent = t; btn.setAttribute('aria-label', verb + ' video: ' + title) }
    function mount() {
      if (v) return v; v = document.createElement('video'); var wb = el.getAttribute('data-webm'); if (wb && v.canPlayType('video/webm; codecs="vp9"') && !/Safari/.test(navigator.userAgent.replace('Chrome', ''))) v.src = wb; else v.src = src; v.poster = img.currentSrc || img.src; v.muted = true; v.playsInline = true; v.controls = true; v.preload = 'auto'; v.setAttribute('controlslist', 'nodownload noplaybackrate'); v.disablePictureInPicture = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-label', title);
      v.addEventListener('pause', function () { if (!sysPause && !v.ended) userPaused = true; sysPause = false });
      v.addEventListener('play', function () { userPaused = false; el.classList.add('is-playing') });
      v.addEventListener('ended', function () { el.classList.remove('is-playing'); setLabel('Repetir', 'Repetir') });
      el.insertBefore(v, img); return v;
    }
    function play() { var p = mount().play(); if (p && p.catch) p.catch(function () { el.classList.remove('is-playing') }); img.style.display = 'none' }
    el.addEventListener('click', function (e) { if (e.target === v) return; mount(); if (v.ended) { v.currentTime = 0; setLabel('Ver video', 'Reproducir') } v.muted = false; play(); v.focus() });
    if (reduce || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (en) { var e = en[0]; if (e.isIntersecting) { if (!userPaused && !(v && v.ended)) play() } else if (v && !v.paused) { sysPause = true; v.pause() } }, { rootMargin: '200px 0px', threshold: .25 }).observe(el);
  });

  
  var ring = document.querySelector('.ring');
  if (ring && hasG && window.ScrollTrigger) {
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.footer', start: 'clamp(top bottom)', end: 'clamp(bottom bottom)', scrub: 0.8 } });
    tl.fromTo(ring, { xPercent: -200 }, { xPercent: 0, duration: 0.005, ease: 'none' }, 0)
      .to(ring, { opacity: 1, duration: 0.79, ease: 'none' }, 0.02)
      .fromTo(ring, { rotation: 0, y: 0, scale: 1 }, { rotation: 280, y: 100, scale: 0.8, duration: 0.83, ease: 'none' }, 0.02)
      .fromTo(ring, { rotation: 280 }, { rotation: 360, duration: 0.15, ease: 'none', immediateRender: false }, 0.85);
  }

  
  document.querySelectorAll('[data-tabs]').forEach(function (w) {
    var tabs = w.querySelectorAll('.tab'), panes = w.querySelectorAll('.pane'), busy = false;
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        if (busy || tab.classList.contains('is-current')) return; busy = true;
        var cur = w.querySelector('.pane.is-active');
        tabs.forEach(function (t) { t.classList.remove('is-current'); t.setAttribute('aria-selected', 'false') }); tab.classList.add('is-current'); tab.setAttribute('aria-selected', 'true');
        cur.style.transition = 'opacity .1s ease'; cur.style.opacity = 0;
        setTimeout(function () {
          cur.classList.remove('is-active'); var nx = panes[i]; nx.style.transition = 'none'; nx.style.opacity = 0; nx.classList.add('is-active');
          requestAnimationFrame(function () { nx.style.transition = 'opacity .3s ease'; nx.style.opacity = 1; setTimeout(function () { busy = false }, 300) });
        }, 100);
      });
    });
  });

  
  if (window.Swiper) {
    document.querySelectorAll('.blog .swiper').forEach(function (el) {
      new Swiper(el, { slidesPerView: 1, spaceBetween: 16, speed: 600, grabCursor: true, watchOverflow: true, breakpoints: { 768: { slidesPerView: 2, spaceBetween: 20 }, 992: { slidesPerView: 3, spaceBetween: 24 } } });
    });
    document.querySelectorAll('.steps .swiper').forEach(function (el) {
      var off = function () { var c = document.querySelector('.steps-sec .steps-c'); if (!c) return 0; var r = c.getBoundingClientRect(); return r.left + parseFloat(getComputedStyle(c).paddingLeft) };
      var sw = new Swiper(el, { slidesPerView: 'auto', spaceBetween: 0, speed: 800, grabCursor: true, slidesOffsetBefore: off(), slidesOffsetAfter: off(),
        navigation: { prevEl: el.closest('.steps-sec').querySelector('.st-arrow.prev'), nextEl: el.closest('.steps-sec').querySelector('.st-arrow.next'), disabledClass: 'is-disabled' } });
      addEventListener('resize', function () { sw.params.slidesOffsetBefore = sw.params.slidesOffsetAfter = off(); sw.update() });
    });
  }

  
  var xm = document.getElementById('experts-modal');
  if (xm) {
    var items = xm.querySelectorAll('.xm-item'), thumbs = [].slice.call(xm.querySelectorAll('.xm-thumb')), idx = 0, lastFocus = null;
    function show(i) {
      idx = (i + items.length) % items.length;
      items.forEach(function (it, k) { it.classList.toggle('is-active', k === idx) });
      thumbs.forEach(function (t, k) { t.classList.toggle('is-active', k === idx); if (hasG && !reduce) gsap.to(t, { scale: k === idx ? 1 : .9, y: 0, duration: .4, ease: 'power3.out' }) });
      thumbs[idx].scrollIntoView({ block: 'nearest', inline: 'center' });
    }
    function open(slug) {
      var i = [].findIndex.call(items, function (it) { return it.dataset.slug === slug });
      lastFocus = document.activeElement; xm.classList.add('is-open'); document.body.classList.add('modal-open'); lenis && lenis.stop(); show(i < 0 ? 0 : i);
      setTimeout(function () { xm.querySelector('.xm-close').focus() }, 30);
    }
    function close() { xm.classList.remove('is-open'); document.body.classList.remove('modal-open'); lenis && lenis.start(); lastFocus && lastFocus.focus() }
    document.addEventListener('click', function (e) {
      var c = e.target.closest('[data-expert-item]'); if (c) { e.preventDefault(); open(c.getAttribute('data-expert-item')); return }
      if (e.target.closest('[data-xm-close]')) close();
    });
    xm.querySelector('.xm-arrow.prev').addEventListener('click', function () { show(idx - 1) });
    xm.querySelector('.xm-arrow.next').addEventListener('click', function () { show(idx + 1) });
    thumbs.forEach(function (t, k) {
      t.addEventListener('click', function () { show(k) });
      if (!hasG || reduce) return;
      t.addEventListener('mouseenter', function () {
        gsap.to(t, { y: -10, scale: 1, duration: .3, ease: 'power3.out' });
        thumbs.forEach(function (o, j) { if (j === k) return; var d = Math.abs(j - k); gsap.to(o, { y: 6 * Math.pow(.65, d - 1), duration: .18, ease: 'power2.out', delay: d * .035, onComplete: function () { gsap.to(o, { y: 0, duration: .4, ease: 'power2.inOut' }) } }) });
      });
      t.addEventListener('mouseleave', function () { gsap.to(t, { y: 0, scale: k === idx ? 1 : .9, duration: .4, ease: 'power3.out' }) });
    });
    document.addEventListener('keydown', function (e) {
      if (!xm.classList.contains('is-open')) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(idx - 1); else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'Tab') { var f = xm.querySelectorAll('button'), a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() } }
    });
  }
})();
