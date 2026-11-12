/* Booking modal. Step 1 validates locally and never leaves the page; step 2 mounts the real Calendly inline page.
   Nothing is posted anywhere and no form value is added to the Calendly URL. */
(function () {
  'use strict';
  var root = document.getElementById('bk');
  if (!root) return;
  var card = root.querySelector('.bk-card');
  var form = root.querySelector('.bk-step1');
  var step2 = root.querySelector('.bk-step2');
  var cal = root.querySelector('.bk-cal');
  var lastFocus = null;
  var open = false;

  function focusables() {
    return Array.prototype.filter.call(card.querySelectorAll('a[href],button,input,select,textarea,iframe,[tabindex]:not([tabindex="-1"])'), function (el) {
      return !el.disabled && el.offsetParent !== null;
    });
  }
  function lock(on) {
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.classList.toggle('bk-lock', on);
    document.body.style.paddingRight = on && sbw > 0 ? sbw + 'px' : '';
    var nav = document.querySelector('.nav');
    if (nav) nav.style.paddingRight = on && sbw > 0 ? sbw + 'px' : '';
  }
  function showStep(n) {
    var two = n === 2;
    form.hidden = two;
    step2.hidden = !two;
    root.classList.toggle('is-step2', two);
    if (two && !cal.firstChild) {
      var f = document.createElement('iframe');
      f.title = 'Calendario para agendar una llamada con Snowball Partners';
      f.loading = 'lazy';
      f.src = cal.getAttribute('data-calendly') + '?embed_type=Inline&hide_gdpr_banner=1&primary_color=022afd';
      cal.appendChild(f);
    }
  }
  function openModal(trigger) {
    if (open) return;
    open = true;
    lastFocus = trigger || document.activeElement;
    root.hidden = false;
    lock(true);
    showStep(1);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { root.classList.add('is-in'); });
    });
    setTimeout(function () {
      var first = form.querySelector('input');
      (first || card).focus({ preventScroll: true });
    }, 60);
  }
  function closeModal() {
    if (!open) return;
    open = false;
    root.classList.remove('is-in');
    setTimeout(function () {
      root.hidden = true;
      lock(false);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }, 260);
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-book]') : null;
    if (t) { e.preventDefault(); openModal(t); return; }
    if (e.target.closest && e.target.closest('[data-bk-close]')) { e.preventDefault(); closeModal(); }
  });
  document.addEventListener('keydown', function (e) {
    if (!open) return;
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (e.key === 'Tab') {
      var f = focusables();
      if (!f.length) { e.preventDefault(); return; }
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || !card.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function check(field) {
    var input = field.querySelector('input,select');
    var msg = field.querySelector('em');
    var v = (input.value || '').trim();
    var ok = v.length > 0;
    if (ok && input.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    field.classList.toggle('is-bad', !ok);
    if (msg) {
      msg.hidden = ok;
      if (input.type === 'email') msg.textContent = v.length ? 'Ingresa un correo válido.' : 'Este campo es obligatorio.';
    }
    input.setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = form.querySelectorAll('.bk-f');
    var firstBad = null;
    Array.prototype.forEach.call(fields, function (f) { if (!check(f) && !firstBad) firstBad = f; });
    if (firstBad) { firstBad.querySelector('input,select').focus(); return; }
    showStep(2);
    var back = step2.querySelector('.bk-back');
    if (back) back.focus({ preventScroll: true });
  });
  form.addEventListener('input', function (e) {
    var f = e.target.closest('.bk-f');
    if (f && f.classList.contains('is-bad')) check(f);
  });
  step2.querySelector('.bk-back').addEventListener('click', function () {
    showStep(1);
    var first = form.querySelector('input');
    if (first) first.focus({ preventScroll: true });
  });
})();
