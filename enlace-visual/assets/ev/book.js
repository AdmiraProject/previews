/* Enlace Visual — v3 booking flow: 1) name, email, phone → 2) Calendly → 3) WhatsApp.
 * Markup hooks (any page):
 *   [data-book]                 → opens the booking modal (optional data-book="<need key>")
 *   form[data-book-form]        → an inline step-1 form (hero) — on submit continues in the modal at step 2
 * Config: <meta name="ev-calendly" content="https://calendly.com/<user>/<event>">  (empty = built-in preview scheduler)
 * Step 1 also POSTs the lead to the client's Zapier→Kommo webhook (skipped on localhost / ?test=1), so a lead is
 * captured even if the person never books. Calendly's `calendly.event_scheduled` postMessage advances to step 3.
 */
(function () {
  'use strict';
  var WEBHOOK = 'https://hooks.zapier.com/hooks/catch/27072868/494grdf/';
  var WA = '5215547125479';
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var CAL = ((document.querySelector('meta[name=ev-calendly]') || {}).content || '').trim();
  var LOGO = (document.querySelector('meta[name=ev-logo]') || {}).content || '';
  var TEST = /^(localhost|127\.0\.0\.1)$|github\.io$/.test(location.hostname) || /[?&]test=1/.test(location.search);
  var T = {
    es: {
      steps: ['Tus datos', 'Elige tu horario', 'Confirma por WhatsApp'],
      h1: 'Agenda tu valoración', s1: 'Déjanos tus datos y elige el horario que te acomode. Toma menos de un minuto.',
      name: 'Nombre completo', email: 'Correo electrónico', phone: 'WhatsApp (10 dígitos)', need: '¿Qué te gustaría revisar?',
      needs: [['catarata', 'Veo nublado / catarata'], ['lentes', 'Dejar de usar lentes'], ['queratocono', 'Queratocono'], ['pterigion', 'Carnosidad (pterigión)'], ['retina', 'Diabetes, glaucoma o retina'], ['revision', 'Revisión completa']],
      consent: 'Acepto el <a href="https://enlacevisual.com.mx/aviso-privacidad.html" target="_blank" rel="noopener">aviso de privacidad</a>.',
      next: 'Continuar', h2: 'Elige día y hora', s2: 'Lunes a viernes de 13:00 a 20:00 · Av. Insurgentes Sur 427, Condesa.',
      prev: 'Vista previa del calendario', confirm: 'Confirmar', back: 'Atrás',
      h3: '¡Listo, {n}! Tu cita quedó agendada.', s3: 'Último paso: confírmala por WhatsApp para que te enviemos indicaciones y la ubicación.',
      wa: 'Confirmar por WhatsApp', waMsg: 'Hola, soy {n}. Acabo de agendar mi valoración{w} desde su sitio. Quiero confirmar mi cita.',
      when: ' para el {d} a las {t}', redirect: 'Te llevamos a WhatsApp en {s} s…', stay: 'Quedarme aquí',
      errName: 'Escribe tu nombre.', errEmail: 'Revisa tu correo.', errPhone: 'Escribe 10 dígitos.', errConsent: 'Acepta el aviso para continuar.',
      days: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'], months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
      close: 'Cerrar', tz: 'Hora de la Ciudad de México', slot: 'Horario'
    },
    en: {
      steps: ['Your details', 'Pick a time', 'Confirm on WhatsApp'],
      h1: 'Book your eye exam', s1: 'Leave your details and pick a time that works for you. It takes less than a minute.',
      name: 'Full name', email: 'Email', phone: 'WhatsApp (10 digits)', need: 'What would you like checked?',
      needs: [['catarata', 'Cloudy vision / cataracts'], ['lentes', 'Stop wearing glasses'], ['queratocono', 'Keratoconus'], ['pterigion', 'Growth on the eye (pterygium)'], ['retina', 'Diabetes, glaucoma or retina'], ['revision', 'Full eye exam']],
      consent: 'I accept the <a href="https://enlacevisual.com.mx/aviso-privacidad.html" target="_blank" rel="noopener">privacy notice</a>.',
      next: 'Continue', h2: 'Pick a day and time', s2: 'Monday to Friday, 1–8 pm · Av. Insurgentes Sur 427, Condesa, Mexico City.',
      prev: 'Calendar preview', confirm: 'Confirm', back: 'Back',
      h3: 'All set, {n}! Your appointment is booked.', s3: 'Last step: confirm it on WhatsApp so we can send you directions and instructions.',
      wa: 'Confirm on WhatsApp', waMsg: 'Hi, I’m {n}. I just booked my eye exam{w} on your website. I’d like to confirm my appointment.',
      when: ' for {d} at {t}', redirect: 'Taking you to WhatsApp in {s} s…', stay: 'Stay here',
      errName: 'Please enter your name.', errEmail: 'Check your email.', errPhone: 'Enter 10 digits.', errConsent: 'Please accept the notice to continue.',
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      close: 'Close', tz: 'Mexico City time', slot: 'Time'
    }
  }[LANG];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var TRACK = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ttclid'];
  (function capture() { try { var p = new URLSearchParams(location.search), t = JSON.parse(localStorage.getItem('tracking_params') || '{}'), hit = 0; TRACK.forEach(function (k) { var v = p.get(k); if (v) { t[k] = v; hit = 1; } }); if (hit) { t.landing_url = location.href; localStorage.setItem('tracking_params', JSON.stringify(t)); } } catch (e) {} })();
  var lead = { name: '', email: '', phone: '', need: '' }, slot = null, root, lastFocus, timer;
  var check = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10.5l3.2 3L15 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var waIco = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>';

  /* ---------- step 1 form markup (reused inline + in modal) ---------- */
  function formHTML(id, pre) {
    return '<form class="evb-form" data-book-form novalidate id="' + id + '">' +
      '<label class="evb-f"><span>' + T.name + '</span><input name="name" autocomplete="name" required></label>' +
      '<label class="evb-f"><span>' + T.email + '</span><input name="email" type="email" autocomplete="email" required></label>' +
      '<label class="evb-f"><span>' + T.phone + '</span><input name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" required maxlength="14"></label>' +
      '<label class="evb-f"><span>' + T.need + '</span><select name="need">' + T.needs.map(function (n) { return '<option value="' + n[0] + '"' + (n[0] === pre ? ' selected' : '') + '>' + esc(n[1]) + '</option>'; }).join('') + '</select></label>' +
      '<label class="evb-c"><input type="checkbox" name="aviso_privacidad" value="Acepto" checked><span class="evb-box">' + check + '</span><span>' + T.consent + '</span></label>' +
      '<p class="evb-err" role="alert" aria-live="polite"></p>' +
      '<button class="evb-btn" type="submit"><span>' + T.next + '</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '</form>';
  }
  function validate(f) {
    var e = f.querySelector('.evb-err'), n = f.name.value.trim(), m = f.email.value.trim(), p = f.phone.value.replace(/\D/g, '');
    var msg = n.length < 2 ? T.errName : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m) ? T.errEmail : p.length !== 10 ? T.errPhone : !f.aviso_privacidad.checked ? T.errConsent : '';
    e.textContent = msg; [].forEach.call(f.querySelectorAll('.evb-f'), function (l) { l.classList.remove('bad'); });
    if (msg) { var bad = n.length < 2 ? 'name' : msg === T.errEmail ? 'email' : msg === T.errPhone ? 'phone' : ''; if (bad) { f[bad].parentNode.classList.add('bad'); f[bad].focus(); } return false; }
    lead = { name: n, email: m, phone: p, need: f.need.value }; return true;
  }
  function needLabel(k) { for (var i = 0; i < T.needs.length; i++) if (T.needs[i][0] === k) return T.needs[i][1]; return ''; }
  function send() {
    var t = {}; try { t = JSON.parse(localStorage.getItem('tracking_params') || '{}'); } catch (e) {}
    var p = { name: lead.name, email: lead.email, phone: '52' + lead.phone, reason: needLabel(lead.need), aviso_privacidad: 'Acepto', idioma: LANG, lead_id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36), form_id: 'agenda-calendly', form_origin: (document.body.dataset.version || 'v3') + '-' + LANG, page_url: location.href, page_path: location.pathname, page_title: document.title, referrer: document.referrer || '', submitted_at: new Date().toISOString() };
    Object.keys(t).forEach(function (k) { p[k] = t[k]; });
    window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'lp_lead_submit', lead_id: p.lead_id, form_id: p.form_id, form_origin: p.form_origin, page_path: p.page_path, utm_source: p.utm_source || '', utm_medium: p.utm_medium || '', utm_campaign: p.utm_campaign || '' });
    if (TEST) { window.__evLastLead = p; console.info('[evb] test mode, webhook skipped', p); return; }
    var body = new URLSearchParams(p).toString();
    try { if (navigator.sendBeacon && navigator.sendBeacon(WEBHOOK, new Blob([body], { type: 'application/x-www-form-urlencoded;charset=UTF-8' }))) return; } catch (e) {}
    fetch(WEBHOOK, { method: 'POST', mode: 'no-cors', keepalive: true, body: body }).catch(function () {});
  }

  /* ---------- modal ---------- */
  function build() {
    root = document.createElement('div'); root.className = 'evb'; root.hidden = true;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'evb-title');
    root.innerHTML = '<div class="evb-scrim" data-evb-close></div><div class="evb-panel">' +
      '<header class="evb-hd">' + (LOGO ? '<img src="' + LOGO + '" alt="Enlace Visual" class="evb-logo">' : '') +
      '<ol class="evb-steps">' + T.steps.map(function (s, i) { return '<li data-i="' + i + '"><i>' + (i + 1) + '</i><span>' + s + '</span></li>'; }).join('') + '</ol>' +
      '<button type="button" class="evb-x" data-evb-close aria-label="' + T.close + '"><svg viewBox="0 0 20 20"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></header>' +
      '<div class="evb-body">' +
      '<section class="evb-s" data-s="0"><h2 id="evb-title">' + T.h1 + '</h2><p class="evb-sub">' + T.s1 + '</p>' + formHTML('evb-f1', '') + '</section>' +
      '<section class="evb-s" data-s="1" hidden><button type="button" class="evb-back" data-evb-go="0">← ' + T.back + '</button><h2>' + T.h2 + '</h2><p class="evb-sub">' + T.s2 + '</p><div class="evb-cal"></div></section>' +
      '<section class="evb-s evb-s--done" data-s="2" hidden><div class="evb-ok">' + check + '</div><h2 class="evb-h3"></h2><p class="evb-sub">' + T.s3 + '</p><div class="evb-sum"></div><a class="evb-btn evb-btn--wa" target="_blank" rel="noopener">' + waIco + '<span>' + T.wa + '</span></a><p class="evb-red"><span></span> <button type="button" class="evb-stay">' + T.stay + '</button></p></section>' +
      '</div></div>';
    document.body.appendChild(root);
    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-evb-close]')) { close(); return; }
      var g = e.target.closest('[data-evb-go]'); if (g) { go(+g.dataset.evbGo); return; }
      if (e.target.closest('.evb-stay')) { clearInterval(timer); root.querySelector('.evb-red span').textContent = ''; e.target.closest('.evb-stay').hidden = true; }
    });
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }
  function go(i) {
    [].forEach.call(root.querySelectorAll('.evb-s'), function (s) { s.hidden = +s.dataset.s !== i; });
    [].forEach.call(root.querySelectorAll('.evb-steps li'), function (l) { var k = +l.dataset.i; l.classList.toggle('on', k === i); l.classList.toggle('done', k < i); });
    root.dataset.step = i;
    var s = root.querySelector('.evb-s[data-s="' + i + '"]'); s.classList.remove('in'); void s.offsetWidth; s.classList.add('in');
    if (i === 1) cal();
    if (i === 2) done();
    var h = s.querySelector('h2'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }
  function open(step, pre) {
    if (!root) build();
    lastFocus = document.activeElement; root.hidden = false; document.documentElement.classList.add('evb-open');
    requestAnimationFrame(function () { root.classList.add('on'); });
    if (pre) { var sel = root.querySelector('#evb-f1 select'); if (sel) sel.value = pre; }
    go(step || 0);
  }
  function close() { clearInterval(timer); root.classList.remove('on'); document.documentElement.classList.remove('evb-open'); setTimeout(function () { root.hidden = true; }, 300); if (lastFocus && lastFocus.focus) lastFocus.focus(); }

  /* ---------- step 2: Calendly or built-in preview ---------- */
  function cal() {
    var box = root.querySelector('.evb-cal'); slot = null;
    if (CAL) {
      var u = CAL + (CAL.indexOf('?') > -1 ? '&' : '?') + 'hide_gdpr_banner=1&embed_type=Inline&embed_domain=' + encodeURIComponent(location.host) + '&name=' + encodeURIComponent(lead.name) + '&email=' + encodeURIComponent(lead.email) + '&a1=' + encodeURIComponent('+52' + lead.phone) + '&a2=' + encodeURIComponent(needLabel(lead.need));
      box.innerHTML = '<iframe class="evb-iframe" src="' + u + '" title="Calendly" loading="lazy"></iframe>';
      return;
    }
    // preview scheduler that mirrors Calendly's layout (month grid → time list → confirm)
    var now = new Date(), days = [], d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    while (days.length < 12) { if (d.getDay() > 0 && d.getDay() < 6) days.push(new Date(d)); d.setDate(d.getDate() + 1); }
    var times = []; for (var h = 13; h < 20; h++) { times.push(h + ':00'); times.push(h + ':30'); }
    box.innerHTML = '<div class="evb-pv"><p class="evb-pv-tag">' + T.prev + '</p><div class="evb-pv-g"><div class="evb-days" role="listbox" aria-label="' + T.h2 + '">' +
      days.map(function (x, i) { return '<button type="button" role="option" data-d="' + i + '"><small>' + T.days[x.getDay()] + '</small><b>' + x.getDate() + '</b><small>' + T.months[x.getMonth()].slice(0, 3) + '</small></button>'; }).join('') +
      '</div><div class="evb-times"><p class="evb-tz">' + T.tz + '</p><div class="evb-tl"></div></div></div></div>';
    var dEl = box.querySelector('.evb-days'), tl = box.querySelector('.evb-tl');
    function pickDay(i) {
      [].forEach.call(dEl.children, function (b) { b.setAttribute('aria-selected', +b.dataset.d === i); });
      var seed = days[i].getDate();
      tl.innerHTML = times.filter(function (t, k) { return (k * 7 + seed) % 5 !== 0; }).map(function (t) { return '<div class="evb-t"><button type="button" data-t="' + t + '">' + t + '</button><button type="button" class="evb-tc" data-c="' + t + '">' + T.confirm + '</button></div>'; }).join('');
      tl.dataset.day = i;
    }
    dEl.addEventListener('click', function (e) { var b = e.target.closest('[data-d]'); if (b) pickDay(+b.dataset.d); });
    tl.addEventListener('click', function (e) {
      var t = e.target.closest('[data-t]'); if (t) { [].forEach.call(tl.querySelectorAll('.evb-t'), function (r) { r.classList.toggle('sel', r.contains(t)); }); return; }
      var c = e.target.closest('[data-c]'); if (c) { var dd = days[+tl.dataset.day]; slot = { d: T.days[dd.getDay()] + ' ' + dd.getDate() + ' ' + T.months[dd.getMonth()], t: c.dataset.c }; go(2); }
    });
    pickDay(0);
  }
  addEventListener('message', function (e) {
    if (!/calendly\.com$/.test((e.origin || '').replace(/^https?:\/\//, '').split(':')[0])) return;
    if (e.data && e.data.event === 'calendly.event_scheduled') { slot = slot || null; go(2); }
  });

  /* ---------- step 3: WhatsApp ---------- */
  function done() {
    var first = (lead.name || '').split(' ')[0];
    root.querySelector('.evb-h3').textContent = T.h3.replace('{n}', first);
    root.querySelector('.evb-sum').innerHTML = '<dl><div><dt>' + T.name + '</dt><dd>' + esc(lead.name) + '</dd></div>' + (slot ? '<div><dt>' + T.slot + '</dt><dd>' + esc(slot.d + ' · ' + slot.t) + '</dd></div>' : '') + '<div><dt>' + T.need + '</dt><dd>' + esc(needLabel(lead.need)) + '</dd></div></dl>';
    var msg = T.waMsg.replace('{n}', lead.name).replace('{w}', slot ? T.when.replace('{d}', slot.d).replace('{t}', slot.t) : '');
    var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    var a = root.querySelector('.evb-btn--wa'); a.href = url;
    var n = 6, red = root.querySelector('.evb-red span'), stay = root.querySelector('.evb-stay'); stay.hidden = false;
    clearInterval(timer);
    red.textContent = T.redirect.replace('{s}', n);
    timer = setInterval(function () { n--; if (n <= 0) { clearInterval(timer); red.textContent = ''; stay.hidden = true; if (!TEST) location.href = url; else console.info('[evb] would redirect to', url); return; } red.textContent = T.redirect.replace('{s}', n); }, 1000);
  }

  /* ---------- wiring ---------- */
  document.addEventListener('submit', function (e) {
    var f = e.target.closest('[data-book-form]'); if (!f) return; e.preventDefault();
    if (!validate(f)) return; send();
    open(1);
  });
  document.addEventListener('input', function (e) {
    var f = e.target.closest('[data-book-form]'); if (!f) return;
    if (e.target.name === 'phone') e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    var l = e.target.closest('.evb-f'); if (l) l.classList.toggle('bad', false);
    var er = f.querySelector('.evb-err'); if (er) er.textContent = '';
  });
  document.addEventListener('click', function (e) { var t = e.target.closest('[data-book]'); if (!t) return; e.preventDefault(); open(0, t.getAttribute('data-book')); });
  // render inline forms declared as <div data-book-inline="need?"></div>
  [].forEach.call(document.querySelectorAll('[data-book-inline]'), function (el, i) { el.innerHTML = formHTML('evb-inline-' + i, el.getAttribute('data-book-inline')); });
  window.EVBook = { open: open, T: T, WA: WA };
})();
