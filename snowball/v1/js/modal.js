/* Snowball Partners v1 · booking popup. Step 1: short form (stays in the browser, nothing is sent). Step 2: Calendly inline. */
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  var CALENDLY_URL = 'https://calendly.com/d/cqcm-7j9-w2z/snowball-partners-web';
  var el = d.getElementById('booking'); if (!el) return;
  var card = el.querySelector('.bk__card'), form = el.querySelector('[data-bk-form]'), cal = el.querySelector('.bk__cal');
  var frame = el.querySelector('[data-bk-frame]');
  var lastTrigger = null, isOpen = false, scriptAsked = false, mounted = false;

  function lock(on) {
    if (on) {
      var sbw = w.innerWidth - root.clientWidth;
      root.style.overflow = 'hidden';
      if (sbw > 0) { d.body.style.paddingRight = sbw + 'px'; var h = d.getElementById('hdr'); if (h) h.style.paddingRight = sbw + 'px'; }
      if (w.__lenis) w.__lenis.stop();
    } else {
      root.style.overflow = '';
      d.body.style.paddingRight = '';
      var h2 = d.getElementById('hdr'); if (h2) h2.style.paddingRight = '';
      if (w.__lenis) w.__lenis.start();
    }
  }
  function step(n) {
    card.setAttribute('data-step', String(n));
    form.hidden = n !== 1;
    cal.hidden = n !== 2;
    if (n === 2) mountCalendly();
  }
  function mountCalendly() {
    if (mounted) return;
    mounted = true;
    // No form values are added to the URL: the visitor types them again in Calendly, so nothing leaves this page by our hand.
    var url = CALENDLY_URL + '?hide_gdpr_banner=1&background_color=ffffff&text_color=070a13&primary_color=022afd';
    var build = function () {
      if (w.Calendly && typeof w.Calendly.initInlineWidget === 'function') {
        w.Calendly.initInlineWidget({ url: url, parentElement: frame });
      } else {
        var f = d.createElement('iframe');
        f.src = url + '&embed_type=Inline&embed_domain=' + encodeURIComponent(w.location.hostname || 'localhost');
        f.title = 'Calendario para agendar una llamada con Snowball Partners';
        frame.appendChild(f);
      }
    };
    if (w.Calendly) return build();
    if (!scriptAsked) {
      scriptAsked = true;
      var s = d.createElement('script');
      s.src = 'https://assets.calendly.com/assets/external/widget.js';
      s.async = true;
      s.onload = build; s.onerror = build;
      d.head.appendChild(s);
      w.setTimeout(function () { if (!frame.firstChild) build(); }, 4000);
    }
  }
  function open(email, trigger) {
    lastTrigger = trigger || d.activeElement;
    isOpen = true;
    el.hidden = false;
    lock(true);
    step(1);
    if (email) el.querySelector('#bk-correo').value = email;
    w.requestAnimationFrame(function () { w.requestAnimationFrame(function () { el.classList.add('is-open'); }); });
    w.setTimeout(function () { var first = el.querySelector('#bk-nombre'); if (first) first.focus({ preventScroll: true }); }, 60);
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    el.classList.remove('is-open');
    lock(false);
    w.setTimeout(function () { if (!isOpen) el.hidden = true; }, 320);
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus({ preventScroll: true });
  }
  function validate() {
    var ok = true, firstBad = null;
    Array.prototype.forEach.call(form.querySelectorAll('.bk__f'), function (f) {
      var input = f.querySelector('input,select'), err = f.querySelector('.bk__err'), msg = '';
      var v = (input.value || '').trim();
      if (!v) msg = 'Este campo es obligatorio.';
      else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = 'Ingresa un correo válido.';
      err.textContent = msg;
      f.classList.toggle('has-err', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) { ok = false; if (!firstBad) firstBad = input; }
    });
    if (firstBad) firstBad.focus();
    return ok;
  }

  d.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-book]');
    if (t) { e.preventDefault(); open('', t); return; }
    if (e.target.closest && e.target.closest('[data-bk-close]')) close();
    if (e.target.closest && e.target.closest('[data-bk-back]')) { step(1); el.querySelector('#bk-nombre').focus(); }
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    step(2);
    var b = el.querySelector('[data-bk-back]'); if (b) b.focus();
  });
  form.addEventListener('input', function (e) {
    var f = e.target.closest('.bk__f');
    if (f && f.classList.contains('has-err')) { f.classList.remove('has-err'); f.querySelector('.bk__err').textContent = ''; e.target.setAttribute('aria-invalid', 'false'); }
  });
  d.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    var f = Array.prototype.filter.call(card.querySelectorAll('a[href],button:not([disabled]),input,select,iframe,[tabindex]:not([tabindex="-1"])'), function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!card.contains(d.activeElement)) { e.preventDefault(); first.focus(); }
  });
  w.SBBooking = { open: open, close: close };
})();
