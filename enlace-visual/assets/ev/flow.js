/* Enlace Visual — activation flow (shared by v1/v2, ES/EN)
 * Multi-step takeover: need → diagnosis → timing → contact → POST webhook → redirect to gracias page.
 * Payload contract = existing LP tracker (Zapier → Kommo): name, phone, email, reason, aviso_privacidad
 * + UTMs/click ids, lead_id, form_id, page_url, submitted_at. dataLayer event: lp_lead_submit.
 * Any element with [data-flow] opens it; data-flow="<need key>" preselects step 1.
 * On localhost / ?test=1 the webhook is NOT called (logged instead) so QA never creates fake leads.
 */
(function () {
  'use strict';
  var WEBHOOK = 'https://hooks.zapier.com/hooks/catch/27072868/494grdf/';
  var WA = '5215547125479';
  var TRACK = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'ad_id', 'msclkid', 'ttclid'];
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var T = {
    es: {
      close: 'Cerrar', back: 'Atrás', next: 'Continuar', send: 'Solicitar mi valoración', sending: 'Enviando…',
      step: 'Paso', of: 'de',
      q1: '¿Qué te trae a Enlace Visual?', s1: 'Elige lo que más se parece a tu caso. Si no estás seguro, también está bien.',
      q2: '¿Ya tienes un diagnóstico de un oftalmólogo?', s2: 'Así sabemos qué estudios preparar para tu visita.',
      q3: '¿Cuándo te gustaría venir?', s3: 'Consultas de lunes a viernes en Av. Insurgentes Sur 427, Condesa.',
      q4: 'Empecemos: ¿cómo te contactamos?', s4: 'Te escribimos por WhatsApp para confirmar tu valoración. Después te hacemos 3 preguntas rápidas sobre tu caso.',
      name: 'Nombre completo', phone: 'WhatsApp (10 dígitos)', email: 'Correo electrónico',
      consent: 'Acepto el <a href="https://enlacevisual.com.mx/aviso-privacidad.html" target="_blank" rel="noopener">aviso de privacidad</a> y que Enlace Visual me contacte para dar seguimiento.',
      errName: 'Escribe tu nombre.', errPhone: 'Escribe un número de 10 dígitos.', errEmail: 'Revisa tu correo.', errConsent: 'Necesitamos tu autorización para contactarte.',
      side: 'En una sola visita: estudios, diagnóstico con oftalmólogo y tu plan con precio.',
      needs: [
        ['lentes', 'Quiero dejar de usar lentes', 'Cirugía refractiva LASIK / PRK'],
        ['catarata', 'Veo nublado o me dijeron que tengo catarata', 'Cirugía de catarata con lente intraocular'],
        ['queratocono', 'Tengo queratocono', 'Cross-linking y lentes esclerales'],
        ['pterigion', 'Tengo una carnosidad en el ojo', 'Resección de pterigión'],
        ['retina', 'Tengo diabetes, glaucoma o algo en la retina', 'Diagnóstico y tratamiento especializado'],
        ['revision', 'Quiero una revisión completa', 'Valoración oftalmológica']
      ],
      dx: [['si', 'Sí, ya tengo diagnóstico'], ['no', 'No, quiero que me revisen'], ['nose', 'No estoy seguro']],
      when: [['semana', 'Esta semana'], ['mes', 'En las próximas semanas'], ['info', 'Solo quiero informarme por ahora']],
      thanks: 'gracias.html'
    },
    en: {
      close: 'Close', back: 'Back', next: 'Continue', send: 'Request my eye exam', sending: 'Sending…',
      step: 'Step', of: 'of',
      q1: 'What brings you to Enlace Visual?', s1: 'Pick the one closest to your case. Not sure yet? That works too.',
      q2: 'Has an ophthalmologist already diagnosed you?', s2: 'This tells us which tests to have ready for your visit.',
      q3: 'When would you like to come in?', s3: 'Appointments Monday to Friday at Av. Insurgentes Sur 427, Condesa, Mexico City.',
      q4: 'Let’s start: how can we reach you?', s4: 'We’ll message you on WhatsApp to confirm your exam. Then 3 quick questions about your case.',
      name: 'Full name', phone: 'WhatsApp (10 digits)', email: 'Email',
      consent: 'I accept the <a href="https://enlacevisual.com.mx/aviso-privacidad.html" target="_blank" rel="noopener">privacy notice</a> and agree to be contacted by Enlace Visual.',
      errName: 'Please enter your name.', errPhone: 'Enter a 10-digit number.', errEmail: 'Check your email.', errConsent: 'We need your permission to contact you.',
      side: 'One visit: tests, diagnosis with an ophthalmologist and your plan with a price.',
      needs: [
        ['lentes', 'I want to stop wearing glasses', 'LASIK / PRK refractive surgery'],
        ['catarata', 'My vision is cloudy or I was told I have cataracts', 'Cataract surgery with intraocular lens'],
        ['queratocono', 'I have keratoconus', 'Cross-linking and scleral lenses'],
        ['pterigion', 'I have a growth on my eye', 'Pterygium removal'],
        ['retina', 'I have diabetes, glaucoma or a retina issue', 'Specialized diagnosis and treatment'],
        ['revision', 'I want a full eye exam', 'Comprehensive eye exam']
      ],
      dx: [['si', 'Yes, I have a diagnosis'], ['no', 'No, I want to get checked'], ['nose', 'I’m not sure']],
      when: [['semana', 'This week'], ['mes', 'In the next few weeks'], ['info', 'Just gathering information']],
      thanks: 'gracias.html'
    }
  }[LANG];

  /* ---------- tracking params (same storage key as the existing LP tracker) ---------- */
  var KEY = 'tracking_params';
  function readTrack() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  (function capture() {
    var p = new URLSearchParams(location.search), t = readTrack(), hit = false;
    TRACK.forEach(function (k) { var v = (p.get(k) || '').trim(); if (v) { t[k] = v; hit = true; } });
    if (hit) { t.captured_at = new Date().toISOString(); t.landing_url = location.href; t.referrer = document.referrer || ''; try { localStorage.setItem(KEY, JSON.stringify(t)); } catch (e) {} }
  })();

  var state = { need: '', dx: '', when: '', i: 0 };
  var root, lastFocus;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var tick = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10.5l3.2 3L15 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var arrow = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function opts(name, list, sub) {
    return '<div class="evf-opts" role="radiogroup">' + list.map(function (o) {
      return '<button type="button" class="evf-opt" role="radio" aria-checked="false" data-k="' + name + '" data-v="' + o[0] + '"><span class="evf-ot"><b>' + esc(o[1]) + '</b>' + (sub && o[2] ? '<small>' + esc(o[2]) + '</small>' : '') + '</span><span class="evf-ck">' + tick + '</span></button>';
    }).join('') + '</div>';
  }
  /* Steps: 0 contact (name, email, phone) → 1 need → 2 diagnosis → 3 timing → submit + redirect.
     The contact step already POSTs the lead (etapa "datos") so nobody is lost mid-flow; the final submit
     re-POSTs the same lead_id with every answer (etapa "completo"). */
  var KEYS = [null, 'need', 'dx', 'when'];
  function build() {
    var base = (document.querySelector('meta[name=ev-logo]') || {}).content || '../assets/brand/logo-blue.png';
    root = document.createElement('div');
    root.className = 'evf'; root.setAttribute('data-side', T.side); root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'evf-q0'); root.hidden = true;
    root.innerHTML =
      '<div class="evf-top"><div class="evf-bar"><a class="evf-logo" href="#" data-evf-close aria-label="Enlace Visual"><img src="' + base + '" alt="Enlace Visual"></a>' +
      '<span class="evf-count" aria-live="polite"></span><button type="button" class="evf-x" data-evf-close aria-label="' + T.close + '"><svg viewBox="0 0 20 20"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></div>' +
      '<div class="evf-prog"><i></i></div></div>' +
      '<form class="evf-body lead-form" id="evf-form" data-lp-form-id="activacion" novalidate>' +
      '<section class="evf-step" data-s="0"><h2 id="evf-q0">' + T.q4 + '</h2><p>' + T.s4 + '</p>' +
      '<div class="evf-fields">' +
      '<label class="evf-f"><input name="name" autocomplete="name" required placeholder=" "><span>' + T.name + '</span><em data-err="name"></em></label>' +
      '<label class="evf-f"><input name="email" type="email" autocomplete="email" required placeholder=" "><span>' + T.email + '</span><em data-err="email"></em></label>' +
      '<label class="evf-f"><input name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" required placeholder=" " maxlength="14"><span>' + T.phone + '</span><em data-err="phone"></em></label>' +
      '<label class="evf-c"><input type="checkbox" name="aviso_privacidad" value="Acepto" checked><span class="evf-box">' + tick + '</span><span>' + T.consent + '</span></label><em data-err="consent" class="evf-ec"></em>' +
      '</div></section>' +
      '<section class="evf-step" data-s="1" hidden><h2 id="evf-q1">' + T.q1 + '</h2><p>' + T.s1 + '</p>' + opts('need', T.needs, true) + '</section>' +
      '<section class="evf-step" data-s="2" hidden><h2>' + T.q2 + '</h2><p>' + T.s2 + '</p>' + opts('dx', T.dx) + '</section>' +
      '<section class="evf-step" data-s="3" hidden><h2>' + T.q3 + '</h2><p>' + T.s3 + '</p>' + opts('when', T.when) + '</section>' +
      '<input type="hidden" name="reason"><input type="hidden" name="diagnostico"><input type="hidden" name="cuando"><input type="hidden" name="idioma" value="' + LANG + '">' +
      '</form>' +
      '<div class="evf-foot"><div class="evf-fin"><button type="button" class="evf-back" data-evf-back>' + T.back + '</button>' +
      '<p class="evf-side">' + T.side + '</p>' +
      '<button type="button" class="evf-next" data-evf-next><span>' + T.next + '</span>' + arrow + '</button></div></div>';
    document.body.appendChild(root);

    root.addEventListener('click', function (e) {
      var o = e.target.closest('.evf-opt');
      if (o) {
        var k = o.dataset.k;
        root.querySelectorAll('.evf-opt[data-k="' + k + '"]').forEach(function (b) { b.setAttribute('aria-checked', b === o ? 'true' : 'false'); });
        state[k] = o.dataset.v; sync();
        setTimeout(function () { if (state.i < 3) go(state.i + 1); else submit(); }, 260); // auto-advance; last answer submits
        return;
      }
      if (e.target.closest('[data-evf-close]')) { e.preventDefault(); close(); return; }
      if (e.target.closest('[data-evf-back]')) { if (state.i > 0) go(state.i - 1); else close(); return; }
      if (e.target.closest('[data-evf-next]')) next();
    });
    root.addEventListener('input', function (e) {
      var f = e.target; if (f.name === 'phone') f.value = f.value.replace(/\D/g, '').slice(0, 10);
      var em = root.querySelector('[data-err="' + (f.name === 'aviso_privacidad' ? 'consent' : f.name) + '"]'); if (em) em.textContent = '';
      sync();
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Enter' && state.i === 0 && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { e.preventDefault(); next(); }
      if (e.key === 'Tab') { // focus trap
        var f = [].filter.call(root.querySelectorAll('button:not([disabled]),input,a[href]'), function (x) { return x.offsetParent !== null; });
        if (!f.length) return; var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    root.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); next(); });
  }
  function next() {
    if (state.i === 0) {
      if (!valid(true)) { var e = root.querySelector('.evf-f em:not(:empty)'); if (e) e.parentNode.querySelector('input').focus(); return; }
      post('datos');
      go(state.need ? 2 : 1); // a preselected condition skips its own question
      return;
    }
    if (state.i < 3) go(state.i + 1); else submit();
  }
  function valid(show) {
    var f = root.querySelector('form'), ok = true;
    var n = f.name.value.trim(), p = f.phone.value.replace(/\D/g, ''), m = f.email.value.trim(), c = f.aviso_privacidad.checked;
    var set = function (k, msg) { if (show) root.querySelector('[data-err="' + k + '"]').textContent = msg; ok = false; };
    if (n.length < 2) set('name', T.errName);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m)) set('email', T.errEmail);
    if (p.length !== 10) set('phone', T.errPhone);
    if (!c) set('consent', T.errConsent);
    return ok;
  }
  function sync() {
    var nx = root.querySelector('[data-evf-next]');
    nx.disabled = state.i > 0 && !state[KEYS[state.i]];
    nx.querySelector('span').textContent = state.i === 3 ? T.send : T.next;
    root.querySelector('.evf-count').textContent = T.step + ' ' + (state.i + 1) + ' ' + T.of + ' 4';
    root.querySelector('.evf-prog i').style.transform = 'scaleX(' + ((state.i + 1) / 4) + ')';
    root.querySelector('[data-evf-back]').style.visibility = state.i ? 'visible' : 'hidden';
    root.classList.toggle('is-last', state.i === 3);
  }
  function go(i) {
    var cur = root.querySelector('.evf-step[data-s="' + state.i + '"]'), nxt = root.querySelector('.evf-step[data-s="' + i + '"]');
    var dir = i > state.i ? 1 : -1;
    cur.hidden = true; nxt.hidden = false;
    nxt.style.setProperty('--d', dir); nxt.classList.remove('in'); void nxt.offsetWidth; nxt.classList.add('in');
    state.i = i; sync();
    var h = nxt.querySelector('h2'); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true });
    root.querySelector('.evf-body').scrollTop = 0;
    if (i === 0) setTimeout(function () { var x = root.querySelector('input[name=name]'); if (x && !x.value && matchMedia('(min-width:768px)').matches) x.focus(); }, 320);
  }
  function open(pre) {
    if (!root) build();
    lastFocus = document.activeElement;
    root.hidden = false; document.documentElement.classList.add('evf-open');
    requestAnimationFrame(function () { root.classList.add('on'); });
    if (pre) { // remember the condition; it is asked after the contact step
      var b = root.querySelector('.evf-opt[data-k="need"][data-v="' + pre + '"]');
      if (b) { root.querySelectorAll('.evf-opt[data-k="need"]').forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); state.need = pre; }
    }
    if (state.i > 0 && !leadId) state.i = 0;
    go(state.i); sync();
  }
  function close() {
    root.classList.remove('on'); document.documentElement.classList.remove('evf-open');
    setTimeout(function () { root.hidden = true; }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function label(list, v) { for (var i = 0; i < list.length; i++) if (list[i][0] === v) return list[i][1]; return ''; }
  var leadId = null;
  var TESTMODE = /^(localhost|127\.0\.0\.1)$|github\.io$/.test(location.hostname) || /[?&]test=1/.test(location.search);
  function payload(stage) {
    var f = root.querySelector('form');
    f.reason.value = label(T.needs, state.need); f.diagnostico.value = label(T.dx, state.dx); f.cuando.value = label(T.when, state.when);
    var p = {}; new FormData(f).forEach(function (v, k) { p[k] = String(v).trim(); });
    p.phone = '52' + p.phone.replace(/\D/g, '');
    var t = readTrack(); Object.keys(t).forEach(function (k) { p[k] = t[k]; });
    leadId = leadId || ((window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36));
    p.lead_id = leadId; p.etapa = stage;
    p.form_id = 'activacion'; p.form_origin = (document.body.dataset.version || 'web') + '-' + LANG;
    p.page_url = location.href; p.page_path = location.pathname; p.page_title = document.title; p.referrer = document.referrer || ''; p.submitted_at = new Date().toISOString();
    return p;
  }
  function post(stage, done) {
    var p = payload(stage);
    if (stage === 'datos') { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'lp_lead_submit', lead_id: p.lead_id, form_id: p.form_id, form_origin: p.form_origin, page_path: p.page_path, utm_source: p.utm_source || '', utm_medium: p.utm_medium || '', utm_campaign: p.utm_campaign || '' }); }
    if (TESTMODE) { (window.__evLeads = window.__evLeads || []).push(p); window.__evLastLead = p; console.info('[evf] test mode, webhook skipped', stage, p); if (done) setTimeout(done, 400); return p; }
    var body = new URLSearchParams(p).toString(), sent = false;
    try { sent = navigator.sendBeacon && navigator.sendBeacon(WEBHOOK, new Blob([body], { type: 'application/x-www-form-urlencoded;charset=UTF-8' })); } catch (e) {}
    (sent ? Promise.resolve() : fetch(WEBHOOK, { method: 'POST', mode: 'no-cors', keepalive: true, body: body }).catch(function () {})).then(function () { if (done) setTimeout(done, 400); });
    return p;
  }
  function submit() {
    var btn = root.querySelector('[data-evf-next]'); btn.disabled = true; btn.querySelector('span').textContent = T.sending;
    var name = root.querySelector('input[name=name]').value.trim();
    var q = new URLSearchParams({ n: name.split(' ')[0], s: state.need, w: state.when });
    post('completo', function () { location.href = T.thanks + '?' + q.toString(); });
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-flow]'); if (!t) return;
    e.preventDefault(); open(t.getAttribute('data-flow'));
  });
  window.EVFlow = { open: open, WA: WA, T: T };
})();
