/* Lealto v1 — interactions. Everything is visible without JS; JS only adds motion and state. */
const LEALTO_CALENDLY_URL = ""; // VALIDAR: Lealto's Calendly event URL (e.g. https://calendly.com/lealto/demo). Empty = fallback card.
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- header height var (for sticky offsets) ---------- */
  var header = $('.site-header');
  function setHH() { if (header) doc.style.setProperty('--hh', header.offsetHeight + 'px'); }
  setHH();
  window.addEventListener('resize', setHH);

  /* ---------- header turns dark over dark sections (Attio) ---------- */
  var darkSecs = $$('.dark, .final, .foot');
  if (header && darkSecs.length && 'IntersectionObserver' in window) {
    var darkOn = [];
    var mkDarkIO = function () {
      var hh = header.offsetHeight, half = Math.round(hh / 2);
      var o = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var k = darkOn.indexOf(en.target);
          if (en.isIntersecting && k < 0) darkOn.push(en.target);
          if (!en.isIntersecting && k > -1) darkOn.splice(k, 1);
        });
        header.classList.toggle('is-dark', darkOn.length > 0);
      }, { rootMargin: '-' + half + 'px 0px -' + Math.max(0, window.innerHeight - half - 1) + 'px 0px', threshold: 0 });
      darkSecs.forEach(function (d) { o.observe(d); });
      return o;
    };
    var dio = mkDarkIO();
    window.addEventListener('resize', function () { dio.disconnect(); darkOn = []; dio = mkDarkIO(); });
  }

  /* ---------- announcement close ---------- */
  var bannerClose = $('[data-banner-close]');
  if (bannerClose) bannerClose.addEventListener('click', function () {
    var b = $('#banner'); if (b) b.hidden = true; setHH();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });

  /* ---------- mobile menu ---------- */
  var burger = $('[data-burger]'), nav = $('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    $$('#nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menú');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.focus(); }
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = $$('[data-reveal], .well, .cap');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- hero flow: nodes light up in sequence ---------- */
  var nodes = $$('[data-flow] .node');
  if (nodes.length && !reduce) {
    var ni = 0, flowTimer = null, flowVisible = true;
    var step = function () { nodes.forEach(function (n) { n.classList.remove('is-live'); }); nodes[ni % nodes.length].classList.add('is-live'); ni++; };
    var startFlow = function () { if (!flowTimer) { step(); flowTimer = setInterval(step, 1400); } };
    var stopFlow = function () { clearInterval(flowTimer); flowTimer = null; };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { flowVisible = en[0].isIntersecting; flowVisible ? startFlow() : stopFlow(); }).observe($('[data-flow]'));
    } else startFlow();
  }

  /* ---------- platform sticky side tabs ---------- */
  var tabLinks = $$('[data-tab]');
  var panels = $$('[data-panel]');
  var tabList = $('.side-tabs ol');
  function activate(id) {
    tabLinks.forEach(function (a) {
      var on = a.getAttribute('data-tab') === id;
      a.classList.toggle('is-active', on);
      if (on) { a.setAttribute('aria-current', 'true'); } else { a.removeAttribute('aria-current'); }
      if (on && tabList && tabList.scrollWidth > tabList.clientWidth) {
        tabList.scrollTo({ left: a.parentNode.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
      }
    });
  }
  if (panels.length && 'IntersectionObserver' in window) {
    var pio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) activate(en.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    panels.forEach(function (p) { pio.observe(p); });
  }
  tabLinks.forEach(function (a) { a.addEventListener('click', function () { activate(a.getAttribute('data-tab')); }); });

  /* ---------- loyalty mechanics switcher (real app screens) ---------- */
  var MECH = {
    sellos: ['Sellos', 'Lo más simple para que tus clientes regresen seguido y vuelvan a comprar.', 'Sellos-1000.webp', 930],
    cashback: ['Cashback', 'Cada compra le devuelve algo a tu cliente y le da una razón para regresar.', 'Cashback-1000.webp', 930],
    premios: ['Premios', 'Tus clientes juntan puntos con el tiempo y los cambian por premios.', 'Premios-1000.webp', 930],
    cuponera: ['Cuponera', 'Lanza promociones y descuentos que controlas y puedes medir.', 'Cuponera-1000.webp', 906],
    rifas: ['Rifas electrónicas', 'Sorteos en los que tus clientes participan con sus compras o acciones, con trazabilidad.', 'Gasolineras-1000.webp', 930],
    membresias: ['Membresías', 'Para acceso exclusivo, suscripciones o beneficios que se repiten.', 'Membresias-1000.webp', 905],
    personalizado: ['Personalizado', 'Si tu negocio necesita una lógica distinta, la diseñamos contigo.', 'Personalizado-1000.webp', 960]
  };
  var mech = $('[data-mech]');
  if (mech) {
    var mBtns = $$('[data-mech-btn]', mech), mImg = $('[data-mech-img]', mech), mTitle = $('[data-mech-title]', mech), mDesc = $('[data-mech-desc]', mech);
    // preload
    var preloaded = false;
    var preload = function () { if (preloaded) return; preloaded = true; Object.keys(MECH).forEach(function (k) { var im = new Image(); im.src = '../assets/product/' + MECH[k][2]; }); };
    var mList = $('.mech__list', mech);
    if (mList) { mList.addEventListener('pointerenter', preload, { once: true }); mList.addEventListener('focusin', preload, { once: true }); }
    if ('IntersectionObserver' in window) {
      var mio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { preload(); mio.disconnect(); } }, { rootMargin: '300px 0px' });
      mio.observe(mech);
    }
    var setMech = function (key, focus) {
      var d = MECH[key]; if (!d) return;
      mBtns.forEach(function (b) { var on = b.getAttribute('data-mech-btn') === key; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
      mTitle.textContent = d[0]; mDesc.textContent = d[1];
      var swap = function () { mImg.src = '../assets/product/' + d[2]; mImg.width = d[3]; mImg.alt = 'Pantalla de ejemplo de la mecánica ' + d[0] + ' en una app de Lealto'; mImg.classList.remove('is-swapping'); };
      if (reduce) swap(); else { mImg.classList.add('is-swapping'); setTimeout(swap, 180); }
    };
    mBtns.forEach(function (b, i) {
      if (i) b.tabIndex = -1;
      b.addEventListener('click', function () { setMech(b.getAttribute('data-mech-btn')); });
      b.addEventListener('keydown', function (e) {
        var dir = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 0;
        if (!dir) return; e.preventDefault();
        var n = mBtns[(i + dir + mBtns.length) % mBtns.length]; setMech(n.getAttribute('data-mech-btn'), true);
      });
    });
  }

  /* ---------- dark section accordion with progress (Attio "signals" pattern) ---------- */
  var acc = $('[data-acc]');
  if (acc) {
    var items = $$('.acc__item', acc);
    var openItem = function (idx) {
      items.forEach(function (it, j) {
        var on = j === idx; it.classList.toggle('is-open', on);
        var b = $('button', it); b.setAttribute('aria-expanded', on ? 'true' : 'false');
        var bar = $('.acc__bar i', it); if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
      });
    };
    items.forEach(function (it, j) {
      $('button', it).addEventListener('click', function () { acc.classList.add('is-paused'); openItem(j); });
      var bar = $('.acc__bar i', it);
      if (bar) bar.addEventListener('animationend', function () { if (!acc.classList.contains('is-paused')) openItem((j + 1) % items.length); });
    });
    if (reduce) acc.classList.add('is-paused');
    else if ('IntersectionObserver' in window) {
      acc.style.setProperty('--play', 'paused');
      new IntersectionObserver(function (en) {
        $$('.acc__bar i', acc).forEach(function (i) { i.style.animationPlayState = en[0].isIntersecting ? 'running' : 'paused'; });
      }).observe(acc);
    }
  }

  /* ---------- customer stories tabs ---------- */
  var stories = $('[data-stories]');
  if (stories) {
    var sTabs = $$('[role="tab"]', stories);
    var selectStory = function (tab, focus) {
      sTabs.forEach(function (t) {
        var on = t === tab; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
        var p = document.getElementById(t.getAttribute('aria-controls')); if (p) p.hidden = !on;
      });
      if (focus) tab.focus();
    };
    selectStory(sTabs[0]);
    sTabs.forEach(function (t, i) {
      t.addEventListener('click', function () { selectStory(t); });
      t.addEventListener('keydown', function (e) {
        var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!dir) return;
        e.preventDefault(); selectStory(sTabs[(i + dir + sTabs.length) % sTabs.length], true);
      });
    });
  }

  /* ---------- mobile signature: one-shot staggered reveal ---------- */
  var mScene = $('.scene');
  if (mScene && !reduce && 'IntersectionObserver' in window && window.matchMedia('(max-width: 767px)').matches) {
    mScene.classList.add('m-anim');
    $$('.mod, .sys, .realapps', mScene).forEach(function (el, i) { el.style.transitionDelay = (0.08 * i) + 's'; });
    var sio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { mScene.classList.add('in'); sio.disconnect(); } }, { threshold: 0.25 });
    sio.observe(mScene);
  }

  /* ---------- GSAP: signature scroll story + stats curve (progressive enhancement) ---------- */
  function initGsap() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    var gsap = window.gsap; gsap.registerPlugin(window.ScrollTrigger);
    var stage = $('[data-sig]');
    var scene = stage && $('.scene', stage);
    if (stage && scene) {
      var mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', function () {
        var lmark = $('[data-lmark]', stage), phone = $('[data-phone]', stage);
        var snaps = $$('[data-snap]', stage), mods = $$('[data-mod]', stage), lines = $$('[data-line]', stage), sys = $$('[data-sys]', stage);
        var ctrl = $('[data-ctrl]', stage), real = $('[data-real]', stage);
        // Plays while the scene is on screen: starts when the scene top reaches 60% of the viewport.
        var tl = gsap.timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: { trigger: scene, start: 'top 50%', end: 'top 22%', scrub: 0.6 } });
        tl.fromTo(lmark, { opacity: 1, scale: 1.6 }, { opacity: 1, scale: 1, duration: 1.5 })
          .to(lmark, { opacity: 0, scale: 0.55, duration: 0.6 })
          .fromTo(phone, { opacity: 0, scale: 0.5, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.8 }, '<0.1')
          .fromTo(mods, { opacity: 0, scale: 0.7 }, { opacity: 0, scale: 0.7, duration: 0.01 }, '<')
          .fromTo(snaps, { opacity: 0, x: function (i) { return i % 2 ? 140 : -140; }, y: function (i) { return i < 2 ? -60 : 60; } },
            { opacity: 1, x: 0, y: 0, stagger: 0.12, duration: 0.6 })
          .to(snaps, { opacity: 0, x: function (i) { return i % 2 ? -110 : 110; }, y: function (i) { return i < 2 ? 70 : -40; }, scale: 0.6, stagger: 0.08, duration: 0.5 })
          .to(mods, { opacity: 1, scale: 1, stagger: 0.08, duration: 0.4 }, '<0.2')
          .fromTo(lines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.06, duration: 0.7, ease: 'none' })
          .fromTo(sys, { opacity: 0, x: function (i) { return i < 3 ? -24 : 24; } }, { opacity: 1, x: 0, stagger: 0.06, duration: 0.5 }, '<0.2')
          .fromTo(ctrl, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 })
          .fromTo(real, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 });
        return function () { gsap.set([lmark, phone, snaps, mods, lines, sys, ctrl, real], { clearProps: 'all' }); };
      });
    }
    var curve = $('.stats__line');
    if (curve) gsap.fromTo(curve, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.stats', start: 'top 85%', end: 'center 45%', scrub: 0.5 } });
  }
  if (document.readyState === 'complete') initGsap(); else window.addEventListener('load', initGsap);
})();


/* ---------- Demo popup (getadmira.com pattern): form -> Calendly inline, fallback while URL is empty ---------- */
(function () {
  'use strict';
  var modal = document.getElementById('demo-modal');
  if (!modal) return;
  var card = modal.querySelector('.dm__card');
  var form = modal.querySelector('[data-dm-step="1"]');
  var step2 = modal.querySelector('[data-dm-step="2"]');
  var calWrap = modal.querySelector('[data-dm-cal]');
  var fallback = modal.querySelector('[data-dm-fallback]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lastTrigger = null, closeTimer = null, calendlyLoading = null;
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea,[tabindex]:not([tabindex="-1"])';

  function lockScroll(on) {
    var b = document.body;
    if (on) {
      var sw = window.innerWidth - document.documentElement.clientWidth;
      if (sw > 0) b.style.paddingRight = sw + 'px';
      b.classList.add('dm-lock');
    } else {
      b.classList.remove('dm-lock'); b.style.paddingRight = '';
    }
  }
  function showStep(n) {
    form.hidden = n !== 1; step2.hidden = n !== 2;
    modal.classList.toggle('is-wide', n === 2);
  }
  function open(trigger) {
    clearTimeout(closeTimer);
    lastTrigger = trigger || document.activeElement;
    if (LEALTO_CALENDLY_URL) loadCalendly().catch(function () {});
    showStep(1);
    modal.hidden = false;
    lockScroll(true);
    void modal.offsetWidth;
    modal.classList.add('is-open');
    var first = form.querySelector('input');
    setTimeout(function () { (first || card).focus(); }, reduce ? 0 : 60);
  }
  function close() {
    modal.classList.remove('is-open');
    var done = function () { modal.hidden = true; lockScroll(false); if (lastTrigger && lastTrigger.focus) lastTrigger.focus(); };
    if (reduce) done(); else closeTimer = setTimeout(done, 260);
  }

  // Triggers: every <a data-demo> (link still works without JS)
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-demo]');
    if (!t) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let "open in new tab" through
    e.preventDefault();
    open(t);
  });
  modal.addEventListener('click', function (e) { if (e.target.closest('[data-dm-close]')) close(); });
  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab') {
      var f = Array.prototype.filter.call(card.querySelectorAll(FOCUSABLE), function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === card)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Validation (Spanish, inline)
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function setErr(field, msg) {
    var wrap = field.closest('.dm__field'), err = document.getElementById(field.id + '-err');
    if (wrap) wrap.classList.toggle('is-bad', !!msg);
    if (err) err.textContent = msg || '';
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) field.setAttribute('aria-describedby', err.id);
  }
  function validate() {
    var ok = true, firstBad = null;
    ['dm-name', 'dm-email', 'dm-phone', 'dm-company', 'dm-pos', 'dm-ind'].forEach(function (id) {
      var el = document.getElementById(id), v = (el.value || '').trim(), msg = '';
      if (!v) msg = 'Este campo es obligatorio.';
      else if (id === 'dm-email' && !EMAIL.test(v)) msg = 'Ingresa un correo válido.';
      else if (id === 'dm-phone' && v.replace(/\D/g, '').length < 6) msg = 'Ingresa un teléfono válido.';
      setErr(el, msg);
      if (msg) { ok = false; firstBad = firstBad || el; }
    });
    if (firstBad) firstBad.focus();
    return ok;
  }
  form.addEventListener('input', function (e) { if (e.target.closest('.is-bad')) setErr(e.target, ''); });

  function loadCalendly() {
    if (window.Calendly) return Promise.resolve();
    if (calendlyLoading) return calendlyLoading;
    calendlyLoading = new Promise(function (res, rej) {
      var sc = document.createElement('script');
      sc.src = 'https://assets.calendly.com/assets/external/widget.js';
      sc.async = true; sc.onload = res; sc.onerror = rej;
      document.head.appendChild(sc);
    });
    return calendlyLoading;
  }
  function calendlyUrl() {
    var v = function (id) { return (document.getElementById(id).value || '').trim(); };
    var p = new URLSearchParams();
    p.set('name', v('dm-name'));
    p.set('email', v('dm-email'));
    p.set('a1', (v('dm-cc') ? v('dm-cc') + ' ' : '') + v('dm-phone'));
    p.set('a2', v('dm-company') + ' · ' + v('dm-pos') + ' puntos de venta · ' + v('dm-ind'));
    p.set('primary_color', '41b6e6');
    p.set('hide_gdpr_banner', '1');
    var q = []; p.forEach(function (val, key) { q.push(key + '=' + encodeURIComponent(val)); });
    return LEALTO_CALENDLY_URL + (LEALTO_CALENDLY_URL.indexOf('?') > -1 ? '&' : '?') + q.join('&');
  }
  function showFallback() { calWrap.innerHTML = ''; fallback.hidden = false; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    showStep(2);
    calWrap.innerHTML = ''; fallback.hidden = true;
    if (!LEALTO_CALENDLY_URL) { showFallback(); }
    else {
      var url = calendlyUrl();
      loadCalendly().then(function () {
        calWrap.innerHTML = '';
        window.Calendly.initInlineWidget({ url: url, parentElement: calWrap });
      }).catch(showFallback);
    }
    var back = modal.querySelector('[data-dm-back]');
    setTimeout(function () { back.focus(); }, 30);
  });
  modal.querySelector('[data-dm-back]').addEventListener('click', function () {
    calWrap.innerHTML = ''; showStep(1);
    var first = form.querySelector('input'); if (first) first.focus();
  });
})();
