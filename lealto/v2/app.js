/* Lealto v2 — progressive enhancement only. All content is visible without this file. */
const LEALTO_CALENDLY_URL = ""; // VALIDAR: Lealto's Calendly event URL (e.g. https://calendly.com/lealto/demo)
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  root.classList.add('js'); // hide-for-animation only once this file actually runs
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  var store = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
                set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };

  /* ---- promo bar: height var (mobile sticky offset) + close ---- */
  var promo = $('#promo');
  function setPromoH() { root.style.setProperty('--promo-h', (promo && !promo.classList.contains('is-closed') ? promo.offsetHeight : 0) + 'px'); }
  if (promo) {
    if (store.get('lealto-promo') === 'closed') promo.classList.add('is-closed');
    $('.promo-x', promo).addEventListener('click', function () { promo.classList.add('is-closed'); store.set('lealto-promo', 'closed'); setPromoH(); });
  }
  setPromoH();
  window.addEventListener('resize', setPromoH);

  /* ---- nav: transparent over hero, solid after scroll ---- */
  var nav = $('#nav'), hero = $('.hero');
  function onScroll() {
    var y = window.scrollY || 0, menuOpen = burger && burger.getAttribute('aria-expanded') === 'true';
    nav.classList.toggle('at-top', y < 8 && !menuOpen);
    nav.classList.toggle('is-scrolled', y >= 8);
  }
  var burger = $('.nav-burger'), mnav = $('#mnav');
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      mnav.hidden = !open;
      onScroll();
    });
    $$('a', mnav).forEach(function (a) { a.addEventListener('click', function () { burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menú'); mnav.hidden = true; onScroll(); }); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mnav.hidden) { burger.click(); burger.focus(); } });
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- hero: module cards snap into the app ---- */
  if (hero) requestAnimationFrame(function () { hero.classList.add('play'); });

  /* ---- reveal + purposeful UI animations on enter ---- */
  var targets = $$('.rv, [data-anim]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    targets.forEach(function (t) { io.observe(t); });
    // safety: never leave content hidden (G5)
    setTimeout(function () { $$('.rv').forEach(function (t) { var r = t.getBoundingClientRect(); if (r.top < window.innerHeight) t.classList.add('in'); }); }, 1200);
  } else {
    targets.forEach(function (t) { t.classList.add('in'); });
  }

  /* typed values in the POS mockup */
  var pos = $('.ui-pos');
  if (pos && !reduce && 'IntersectionObserver' in window) {
    var typed = $$('.typed', pos);
    typed.forEach(function (el) { el.textContent = ''; });
    var started = false;
    new IntersectionObserver(function (en, ob) {
      if (!en[0].isIntersecting || started) return; started = true; ob.disconnect();
      typed.forEach(function (el, i) {
        var txt = el.getAttribute('data-text'), n = 0;
        setTimeout(function step() { el.textContent = txt.slice(0, ++n); if (n < txt.length) setTimeout(step, 45); }, 250 + i * 520);
      });
    }, { threshold: 0.3 }).observe(pos);
  }

  /* ---- email forms: go to Lealto's demo form, never send data ---- */
  $$('form[data-goto]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('input', f);
      if (input && !input.checkValidity()) { input.reportValidity(); return; }
      if (f.hasAttribute('data-demo-form') && window.__lealtoDemo) { window.__lealtoDemo.open(f.querySelector('button') || f, input ? input.value : ''); return; }
      window.location.href = f.getAttribute('data-goto');
    });
  });

  /* ---- demo popup: qualifying form → Calendly (fallback card while the URL is empty) ---- */
  (function demoPopup() {
    var dm = $('#dmodal'); if (!dm) return;
    var card = $('.dmodal-card', dm), form = $('#dmForm'), s1 = $('.dm-step1', dm), s2 = $('.dm-step2', dm);
    var cal = $('#dmCal'), fb = $('#dmFallback'), lastTrigger = null, calLoaded = null;
    var F = function (id) { return document.getElementById(id); };

    function lock(on) {
      if (on) {
        var sb = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.classList.add('dm-lock');
        document.body.style.paddingRight = sb > 0 ? sb + 'px' : '';
      } else {
        document.documentElement.classList.remove('dm-lock');
        document.body.style.paddingRight = '';
      }
    }
    function focusables() {
      return $$('a[href],button:not([disabled]),input,select,textarea,iframe,[tabindex]:not([tabindex="-1"])', card)
        .filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
    }
    function showStep(n) {
      card.setAttribute('data-step', String(n));
      s1.hidden = n !== 1; s2.hidden = n !== 2;
    }
    function open(trigger, email) {
      lastTrigger = trigger || document.activeElement;
      showStep(1);
      if (email) F('dm-email').value = email;
      dm.hidden = false;
      requestAnimationFrame(function () { dm.classList.add('is-open'); });
      lock(true);
      var first = email ? F('dm-name') : F('dm-name');
      setTimeout(function () { first.focus(); }, 30);
    }
    function close() {
      dm.classList.remove('is-open');
      dm.hidden = true;
      lock(false);
      if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
    }
    window.__lealtoDemo = { open: open, close: close };

    // triggers: every [data-demo] link (works as a normal link without JS)
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-demo]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      // close the mobile menu if the trigger lives there
      var mn = $('#mnav'); if (mn && !mn.hidden && mn.contains(a)) { var bg = $('.nav-burger'); if (bg) bg.click(); }
      open(a);
    });
    $$('[data-demo-close]', dm).forEach(function (b) { b.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (dm.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') {
        var f = focusables(); if (!f.length) return;
        var i = f.indexOf(document.activeElement);
        if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && (i === f.length - 1 || i === -1)) { e.preventDefault(); f[0].focus(); }
      }
    });

    // validation (Spanish, inline)
    var rules = [
      ['dm-name', function (v) { return v.trim() ? '' : 'Este campo es obligatorio.'; }],
      ['dm-email', function (v) { return !v.trim() ? 'Este campo es obligatorio.' : (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Ingresa un correo válido.'); }],
      ['dm-phone', function (v) { return !v.trim() ? 'Este campo es obligatorio.' : (v.replace(/\D/g, '').length >= 7 ? '' : 'Ingresa un teléfono válido.'); }],
      ['dm-company', function (v) { return v.trim() ? '' : 'Este campo es obligatorio.'; }],
      ['dm-pos', function (v) { return v ? '' : 'Este campo es obligatorio.'; }],
      ['dm-ind', function (v) { return v ? '' : 'Este campo es obligatorio.'; }]
    ];
    function check(id, fn) {
      var el = F(id), msg = fn(el.value), err = F(id + '-err');
      err.textContent = msg; el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    rules.forEach(function (r) {
      var el = F(r[0]);
      el.addEventListener('blur', function () { if (el.value || el.getAttribute('aria-invalid') === 'true') check(r[0], r[1]); });
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') check(r[0], r[1]); });
      el.addEventListener('change', function () { if (el.getAttribute('aria-invalid') === 'true') check(r[0], r[1]); });
    });

    function calendlyUrl() {
      var cc = F('dm-cc').value, phone = (cc ? cc + ' ' : '') + F('dm-phone').value.trim();
      var a2 = F('dm-company').value.trim() + ' · ' + F('dm-pos').value + ' puntos de venta · ' + F('dm-ind').value;
      var params = { name: F('dm-name').value.trim(), email: F('dm-email').value.trim(), a1: phone, a2: a2, primary_color: '41b6e6', hide_gdpr_banner: '1' };
      // encodeURIComponent (spaces as %20, not "+") so Calendly shows the values as typed
      var q = Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
      return LEALTO_CALENDLY_URL + (LEALTO_CALENDLY_URL.indexOf('?') > -1 ? '&' : '?') + q;
    }
    function loadCalendly(cb) {
      if (window.Calendly) return cb();
      if (!calLoaded) {
        calLoaded = document.createElement('script');
        calLoaded.src = 'https://assets.calendly.com/assets/external/widget.js';
        calLoaded.async = true;
        document.head.appendChild(calLoaded);
      }
      calLoaded.addEventListener('load', cb, { once: true });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, firstBad = null;
      rules.forEach(function (r) { if (!check(r[0], r[1])) { ok = false; if (!firstBad) firstBad = F(r[0]); } });
      if (!ok) { firstBad.focus(); return; }
      showStep(2);
      cal.innerHTML = '';
      if (LEALTO_CALENDLY_URL) {
        fb.hidden = true;
        var url = calendlyUrl();
        cal.setAttribute('data-url', url);
        loadCalendly(function () {
          if (window.Calendly && window.Calendly.initInlineWidget) window.Calendly.initInlineWidget({ url: url, parentElement: cal });
        });
      } else {
        fb.hidden = false;
      }
      setTimeout(function () { var b = $('.dm-back', dm); if (b) b.focus(); }, 30);
    });
    $('.dm-back', dm).addEventListener('click', function () { showStep(1); F('dm-name').focus(); });
  })();

  /* ---- video: inline click-to-load + modal (youtube-nocookie, loaded only on click) ---- */
  var VID = 'rV9qcg3blW4';
  function iframe() {
    var f = doc.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + VID + '?autoplay=1&rel=0&modestbranding=1';
    f.title = 'Video de Lealto';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.setAttribute('allowfullscreen', '');
    return f;
  }
  var inline = $('[data-video-inline]');
  if (inline) inline.addEventListener('click', function (e) {
    e.preventDefault();
    var frame = $('#videoFrame');
    frame.appendChild(iframe());
    frame.classList.add('is-playing');
    inline.remove();
  });
  var modal = $('#vmodal'), mframe = $('#vmodalFrame'), lastFocus = null;
  function openModal() {
    lastFocus = doc.activeElement;
    mframe.innerHTML = ''; mframe.appendChild(iframe());
    modal.hidden = false; doc.body.style.overflow = 'hidden';
    $('.vmodal-x', modal).focus();
  }
  function closeModal() {
    modal.hidden = true; mframe.innerHTML = ''; doc.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $$('[data-video-open]').forEach(function (b) { b.addEventListener('click', openModal); });
  $$('[data-video-close]').forEach(function (b) { b.addEventListener('click', closeModal); });
  doc.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') { e.preventDefault(); $('.vmodal-x', modal).focus(); }
  });

  /* ---- testimonial carousel (scroll-snap; JS adds arrows/dots) ---- */
  var track = $('#tstTrack');
  if (track) {
    var slides = $$('.tst-slide', track), dots = $('.tst-dots'), prev = $('.tst-prev'), next = $('.tst-next');
    slides.forEach(function (s, i) {
      var b = doc.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', 'Ver caso ' + (i + 1));
      b.addEventListener('click', function () { go(i); });
      dots.appendChild(b);
    });
    var dotBtns = $$('button', dots);
    function idx() { return Math.round(track.scrollLeft / track.clientWidth); }
    function go(i) { i = Math.max(0, Math.min(slides.length - 1, i)); track.scrollTo({ left: i * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' }); }
    function update() {
      var i = idx();
      dotBtns.forEach(function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      prev.disabled = i === 0; next.disabled = i === slides.length - 1;
    }
    prev.addEventListener('click', function () { go(idx() - 1); });
    next.addEventListener('click', function () { go(idx() + 1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx() - 1); }
    });
    var t; track.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(update, 60); }, { passive: true });
    update();
  }

  /* ---- sticky mobile bar: only after the hero CTA leaves the viewport (and not over the footer form) ---- */
  var mbar = $('#mbar'), heroForm = $('.hero-form-wrap');
  var others = [$('.foot-cap'), $('#demo'), $('.ind-cta')].filter(Boolean);
  if (mbar && 'IntersectionObserver' in window && heroForm) {
    var heroVis = true, otherVis = new Map();
    var mo = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.target === heroForm) heroVis = e.isIntersecting || e.boundingClientRect.top > 0;
        else otherVis.set(e.target, e.isIntersecting);
      });
      var anyOther = false; otherVis.forEach(function (v) { if (v) anyOther = true; });
      mbar.classList.toggle('show', !heroVis && !anyOther);
    });
    mo.observe(heroForm); others.forEach(function (o) { mo.observe(o); });
  } else if (mbar) { mbar.classList.add('show'); }

  /* ---- loyalty mechanics: pills switch real example screens (scroll-snap fallback without JS) ---- */
  var mt = $('#mechTrack');
  if (mt) {
    var pills = $$('.mech-pill'), mp = $$('.mech-panel', mt), auto = null, userTouched = false;
    var mIdx = function () { return Math.round(mt.scrollLeft / mt.clientWidth); };
    var pillRow = $('.mech-pills');
    var mSet = function (i) {
      pills.forEach(function (p, k) { p.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      var pl = pills[i]; if (!pl || !pillRow) return;
      var l = pl.offsetLeft - pillRow.offsetLeft, r = l + pl.offsetWidth;
      if (l < pillRow.scrollLeft || r > pillRow.scrollLeft + pillRow.clientWidth - 40) pillRow.scrollTo({ left: Math.max(0, l - 20), behavior: reduce ? 'auto' : 'smooth' });
    };
    var mGo = function (i, smooth) { mt.scrollTo({ left: i * mt.clientWidth, behavior: smooth && !reduce ? 'smooth' : 'auto' }); mSet(i); };
    var stopAuto = function () { if (auto) { clearInterval(auto); auto = null; } };
    pills.forEach(function (p, i) { p.addEventListener('click', function (e) { e.preventDefault(); userTouched = true; stopAuto(); mGo(i, true); }); });
    var mtT; mt.addEventListener('scroll', function () { clearTimeout(mtT); mtT = setTimeout(function () { mSet(mIdx()); }, 60); }, { passive: true });
    mt.addEventListener('pointerdown', function () { userTouched = true; stopAuto(); });
    mt.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); stopAuto(); mGo(Math.min(mp.length - 1, mIdx() + 1), true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); stopAuto(); mGo(Math.max(0, mIdx() - 1), true); }
    });
    var box = $('.mech'), hovering = false, inView = false;
    var startAuto = function () {
      if (reduce || userTouched || hovering || auto || !inView) return;
      auto = setInterval(function () { mGo((mIdx() + 1) % mp.length, true); }, 3200);
    };
    if (box) {
      box.addEventListener('mouseenter', function () { hovering = true; stopAuto(); });
      box.addEventListener('mouseleave', function () { hovering = false; startAuto(); });
      box.addEventListener('focusin', function () { userTouched = true; stopAuto(); });
    }
    if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        inView = en[0].isIntersecting;
        if (inView) startAuto(); else stopAuto();
      }, { threshold: 0.6 }).observe(mt);
    }
  }

  /* ---- blog carousel: arrows + progress ---- */
  var bt = $('#blogTrack');
  if (bt) {
    var bp = $('.blog-prev'), bn = $('.blog-next'), prog = $('#blogProg');
    function step() { var c = $('.bcard', bt); return c ? c.offsetWidth + 24 : 300; }
    function upd() {
      var max = bt.scrollWidth - bt.clientWidth;
      var vis = bt.clientWidth / bt.scrollWidth;
      prog.style.width = (vis * 100) + '%';
      prog.style.left = (max > 0 ? (bt.scrollLeft / max) * (100 - vis * 100) : 0) + '%';
      bp.disabled = bt.scrollLeft <= 2; bn.disabled = bt.scrollLeft >= max - 2;
      $('.car-foot').style.visibility = max > 2 ? 'visible' : 'hidden';
    }
    bp.addEventListener('click', function () { bt.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    bn.addEventListener('click', function () { bt.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    bt.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }
})();
