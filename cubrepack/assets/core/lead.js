/* Cubre Pack — activation flow ("Pruébalo / Cotiza")
   Any element with [data-lead] (or href="#cotizar" / "#muestra") opens a 3-step form.
   Step 1 what to protect → Step 2 obra (m², etapa, ciudad, inicio) + live roll estimate → Step 3 contact
   → success screen → redirect to Cubre Pack WhatsApp with every answer prefilled.
   data-lead="muestra" preselects the free-sample path; data-need="pisos|vidrio|..." preselects a need. */
(function () {
  var WA = '525550515145';
  var EN = (document.documentElement.lang || 'es').slice(0, 2) === 'en';
  var T = EN ? {
    kicker: 'Try Cubre Pack', s: ['Your details', 'What to protect', 'Your project'],
    q1: 'What do you need to protect?', q1s: 'Pick one or more. We will recommend the right material.',
    needs: [['pisos', 'Floors', 'Porcelain, marble, wood, concrete'], ['vidrio', 'Glass & frames', 'Windows, curtain walls, doors'], ['alfombra', 'Carpet', 'Hotels, offices, corridors'], ['muros', 'Walls, doors & elevators', 'Corners, frames, cabins'], ['autonivelante', 'New floor', 'Self-leveling or epoxy'], ['muestra', 'Free Petropack sample', 'Try it on your site first']],
    q2: 'Tell us about the job', area: 'Area to protect (m²)', stage: 'Stage', stages: ['Structure', 'Finishes', 'Remodel', 'Handover'], city: 'Delivery city', cityPh: 'Mexico City, Monterrey, Guadalajara…', start: 'Start', starts: ['This week', 'This month', '1–3 months'],
    est: function (r) { return '≈ <b>' + r + '</b> Petropack roll' + (r > 1 ? 's' : '') + ' (100 m² each)'; }, estNote: 'Estimate only. We confirm with your plans.',
    opt: '(optional)', q3: 'Who should we send the quote to?', q3s: 'A Cubre Pack advisor replies the same business day.', name: 'Full name', company: 'Company / project', role: 'Your role', roles: ['Architect', 'Site manager', 'Contractor', 'Developer', 'Other'], phone: 'WhatsApp / phone', email: 'Work email',
    next: 'Continue', back: 'Back', send: 'Send and open WhatsApp', req: 'Please complete this field.',
    okT: 'Got it, ', okS: 'We are opening WhatsApp with your request so an advisor can confirm it.', okBtn: 'Open WhatsApp now', okAlt: 'Or call 55 1106 3868',
    msg: 'Hi Cubre Pack! I want a quote.', mNeed: 'Protect', mArea: 'Area', mStage: 'Stage', mCity: 'City', mStart: 'Start', mName: 'Name', mCo: 'Company', mRole: 'Role', mEmail: 'Email', mPhone: 'Phone', close: 'Close'
  } : {
    kicker: 'Pruébalo con Cubre Pack', s: ['Tus datos', 'Qué proteges', 'Tu obra'],
    q1: '¿Qué necesitas proteger?', q1s: 'Elige una o varias. Te recomendamos el material exacto.',
    needs: [['pisos', 'Pisos', 'Porcelanato, mármol, madera, concreto'], ['vidrio', 'Vidrio y cancelería', 'Ventanas, fachadas, puertas'], ['alfombra', 'Alfombra', 'Hoteles, oficinas, pasillos'], ['muros', 'Muros, puertas y elevadores', 'Esquinas, marcos, cabinas'], ['autonivelante', 'Piso nuevo', 'Autonivelante o epóxico'], ['muestra', 'Muestra gratis de Petropack', 'Pruébalo primero en tu obra']],
    q2: 'Cuéntanos de tu obra', area: 'Superficie a proteger (m²)', stage: 'Etapa', stages: ['Obra negra', 'Acabados', 'Remodelación', 'Entrega'], city: 'Ciudad de entrega', cityPh: 'CDMX, Monterrey, Guadalajara…', start: 'Inicio', starts: ['Esta semana', 'Este mes', '1–3 meses'],
    est: function (r) { return '≈ <b>' + r + '</b> rollo' + (r > 1 ? 's' : '') + ' de Petropack (100 m² c/u)'; }, estNote: 'Estimado. Lo confirmamos con tus planos.',
    opt: '(opcional)', q3: '¿A quién le enviamos la cotización?', q3s: 'Un asesor de Cubre Pack te responde el mismo día hábil.', name: 'Nombre completo', company: 'Empresa / obra', role: 'Tu rol', roles: ['Arquitecto', 'Residente de obra', 'Contratista', 'Desarrollador', 'Otro'], phone: 'WhatsApp / teléfono', email: 'Correo de trabajo',
    next: 'Continuar', back: 'Atrás', send: 'Enviar y abrir WhatsApp', req: 'Completa este campo.',
    okT: 'Listo, ', okS: 'Te abrimos WhatsApp con tu solicitud para que un asesor la confirme.', okBtn: 'Abrir WhatsApp ahora', okAlt: 'O llámanos al 55 1106 3868',
    msg: '¡Hola Cubre Pack! Quiero cotizar.', mNeed: 'Proteger', mArea: 'Superficie', mStage: 'Etapa', mCity: 'Ciudad', mStart: 'Inicio', mName: 'Nombre', mCo: 'Empresa', mRole: 'Rol', mEmail: 'Correo', mPhone: 'Teléfono', close: 'Cerrar'
  };
  var ICON = {
    pisos: '<path d="M3 16l9 5 9-5-9-5-9 5z"/><path d="M3 12l9 5 9-5"/><path d="M12 3l9 5-9 5-9-5 9-5z" opacity=".35"/>',
    vidrio: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M12 3v18M4 12h16"/><path d="M7 7l3-2M14 15l3-2" opacity=".5"/>',
    alfombra: '<rect x="3" y="6" width="18" height="12" rx="1.5"/><path d="M6 6v12M18 6v12" stroke-dasharray="1.5 2"/>',
    muros: '<path d="M4 21V4h11v17"/><path d="M15 8h5v13"/><circle cx="12" cy="13" r=".8" fill="currentColor"/>',
    autonivelante: '<path d="M3 17c3-2 6 2 9 0s6 2 9 0"/><path d="M3 13c3-2 6 2 9 0s6 2 9 0" opacity=".45"/><path d="M7 9V4h10v5"/>',
    muestra: '<path d="M4 9l8-5 8 5v9l-8 4-8-4z"/><path d="M4 9l8 4 8-4M12 13v9"/>'
  };
  var AREAS = ['< 500', '500 – 2,000', '2,000 – 10,000', '+10,000'];
  var MID = [300, 1200, 6000, 15000];
  var st = { step: 0, needs: [], area: null, stage: null, start: null };

  function h(tag, attrs, html) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  function chips(name, list) { return '<div class="lf-chips" data-name="' + name + '">' + list.map(function (v, i) { return '<button type="button" class="lf-chip" data-i="' + i + '">' + v + '</button>'; }).join('') + '</div>'; }

  var ov = h('div', { class: 'lf', role: 'dialog', 'aria-modal': 'true', 'aria-label': T.kicker, hidden: '' });
  ov.innerHTML =
    '<div class="lf-scrim" data-close></div>' +
    '<div class="lf-panel">' +
    '<div class="lf-top"><span class="lf-kicker"><i class="lf-dot"></i>' + T.kicker + '</span><button class="lf-x" type="button" data-close aria-label="' + T.close + '">&times;</button></div>' +
    '<div class="lf-steps">' + T.s.map(function (s, i) { return '<div class="lf-step" data-s="' + i + '"><b>' + (i + 1) + '</b><span>' + s + '</span></div>'; }).join('') + '<div class="lf-bar"><i></i></div></div>' +
    '<form class="lf-form" novalidate>' +
    '<section class="lf-pane" data-p="0"><h3>' + T.q3 + '</h3><p class="lf-sub">' + T.q3s + '</p>' +
    '<div class="lf-grid lf-grid1">' +
    '<div><label class="lf-l" for="lf-name">' + T.name + '</label><input id="lf-name" name="name" class="lf-in" required autocomplete="name"></div>' +
    '<div><label class="lf-l" for="lf-email">' + T.email + '</label><input id="lf-email" name="email" type="email" class="lf-in" required autocomplete="email" inputmode="email"></div>' +
    '<div><label class="lf-l" for="lf-phone">' + T.phone + '</label><input id="lf-phone" name="phone" type="tel" class="lf-in" required autocomplete="tel" inputmode="tel"></div>' +
    '</div></section>' +
    '<section class="lf-pane" data-p="1" hidden><h3>' + T.q1 + '</h3><p class="lf-sub">' + T.q1s + '</p><div class="lf-needs">' +
    T.needs.map(function (n) { return '<button type="button" class="lf-need" data-need="' + n[0] + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + ICON[n[0]] + '</svg><b>' + n[1] + '</b><small>' + n[2] + '</small><span class="lf-tick"></span></button>'; }).join('') +
    '</div></section>' +
    '<section class="lf-pane" data-p="2" hidden><h3>' + T.q2 + '</h3>' +
    '<label class="lf-l">' + T.area + '</label>' + chips('area', AREAS) +
    '<div class="lf-est" aria-live="polite"></div>' +
    '<label class="lf-l">' + T.stage + '</label>' + chips('stage', T.stages) +
    '<div class="lf-row"><div><label class="lf-l" for="lf-city">' + T.city + '</label><input id="lf-city" name="city" class="lf-in" placeholder="' + T.cityPh + '" autocomplete="address-level2"></div>' +
    '<div><label class="lf-l">' + T.start + '</label>' + chips('start', T.starts) + '</div></div>' +
    '<div class="lf-row"><div><label class="lf-l" for="lf-co">' + T.company + ' <em>' + T.opt + '</em></label><input id="lf-co" name="company" class="lf-in" autocomplete="organization"></div>' +
    '<div><label class="lf-l" for="lf-role">' + T.role + '</label><select id="lf-role" name="role" class="lf-in">' + T.roles.map(function (r) { return '<option>' + r + '</option>'; }).join('') + '</select></div></div></section>' +
    '<section class="lf-pane lf-done" data-p="3" hidden><div class="lf-check"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-16"/></svg></div><h3 class="lf-okt"></h3><p class="lf-sub">' + T.okS + '</p><div class="lf-sum"></div><a class="lf-btn lf-wa" target="_blank" rel="noopener">' + T.okBtn + '</a><a class="lf-alt" href="tel:+525511063868">' + T.okAlt + '</a></section>' +
    '<div class="lf-nav"><button type="button" class="lf-back">' + T.back + '</button><button type="submit" class="lf-btn lf-next">' + T.next + '</button></div>' +
    '</form></div>';
  document.body.appendChild(ov);

  var form = ov.querySelector('.lf-form'), next = ov.querySelector('.lf-next'), back = ov.querySelector('.lf-back'), lastFocus;

  function setStep(n) {
    st.step = n;
    ov.querySelectorAll('.lf-pane').forEach(function (p) { p.hidden = +p.dataset.p !== n; });
    ov.querySelectorAll('.lf-step').forEach(function (s) { var i = +s.dataset.s; s.classList.toggle('is-on', i === n); s.classList.toggle('is-done', i < n); });
    ov.querySelector('.lf-bar i').style.width = (Math.min(n, 3) / 3 * 100) + '%';
    ov.querySelector('.lf-nav').hidden = n === 3;
    back.style.visibility = n === 0 ? 'hidden' : 'visible';
    next.textContent = n === 2 ? T.send : T.next;
    validate();
    var f = ov.querySelector('.lf-pane[data-p="' + n + '"] input, .lf-pane[data-p="' + n + '"] button');
    if (f && n > 0 && n < 3) setTimeout(function () { f.focus({ preventScroll: true }); }, 60);
  }
  function validate() {
    var ok = true;
    if (st.step === 1) ok = st.needs.length > 0;
    if (st.step === 2) ok = st.area !== null;
    next.disabled = !ok;
  }
  function estimate() {
    var box = ov.querySelector('.lf-est');
    if (st.area === null) { box.innerHTML = ''; return; }
    var r = Math.max(1, Math.ceil(MID[st.area] / 100));
    box.innerHTML = '<span>' + T.est(st.area === 3 ? r + '+' : r) + '</span><small>' + T.estNote + '</small>';
  }
  ov.addEventListener('click', function (e) {
    var t = e.target.closest('[data-close]'); if (t) return close();
    var n = e.target.closest('.lf-need');
    if (n) { var k = n.dataset.need, i = st.needs.indexOf(k); if (i < 0) st.needs.push(k); else st.needs.splice(i, 1); n.classList.toggle('is-on', i < 0); validate(); return; }
    var c = e.target.closest('.lf-chip');
    if (c) { var g = c.parentNode; g.querySelectorAll('.lf-chip').forEach(function (x) { x.classList.toggle('is-on', x === c); }); st[g.dataset.name] = +c.dataset.i; if (g.dataset.name === 'area') estimate(); validate(); }
  });
  back.addEventListener('click', function () { setStep(Math.max(0, st.step - 1)); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (st.step === 0) {
      var bad = null;
      form.querySelectorAll('[data-p="0"] [required]').forEach(function (i) {
        var v = i.value.trim(), okv = v && (i.type !== 'email' || /.+@.+\..+/.test(v)) && (i.type !== 'tel' || v.replace(/\D/g, '').length >= 8);
        i.classList.toggle('is-bad', !okv); i.setAttribute('aria-invalid', !okv); if (!okv && !bad) bad = i;
      });
      if (bad) { bad.focus(); return; }
      try { localStorage.setItem('cp_lead_contact', JSON.stringify({ t: Date.now(), name: val('name'), email: val('email'), phone: val('phone'), page: location.pathname })); } catch (e) {}
      if (window.dataLayer) window.dataLayer.push({ event: 'lead_contact' });
      return setStep(1);
    }
    if (st.step === 1) return setStep(2);
    finish();
  });
  function val(n) { var e = form.elements[n]; return e ? e.value.trim() : ''; }
  function finish() {
    var needs = st.needs.map(function (k) { for (var i = 0; i < T.needs.length; i++) if (T.needs[i][0] === k) return T.needs[i][1]; return k; }).join(', ');
    var rows = [[T.mNeed, needs], [T.mArea, st.area !== null ? AREAS[st.area] + ' m²' : ''], [T.mStage, st.stage !== null ? T.stages[st.stage] : ''], [T.mCity, val('city')], [T.mStart, st.start !== null ? T.starts[st.start] : ''], [T.mName, val('name')], [T.mCo, val('company')], [T.mRole, val('role')], [T.mPhone, val('phone')], [T.mEmail, val('email')]].filter(function (r) { return r[1]; });
    var text = T.msg + '\n\n' + rows.map(function (r) { return '• ' + r[0] + ': ' + r[1]; }).join('\n');
    var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
    try { localStorage.setItem('cp_lead', JSON.stringify({ t: Date.now(), rows: rows, page: location.pathname })); } catch (e) {}
    if (window.dataLayer) window.dataLayer.push({ event: 'generate_lead', lead_need: needs });
    ov.querySelector('.lf-okt').textContent = T.okT + (val('name').split(' ')[0] || '') + '.';
    ov.querySelector('.lf-sum').innerHTML = rows.slice(0, 5).map(function (r) { return '<div><span>' + r[0] + '</span><b>' + r[1].replace(/</g, '&lt;') + '</b></div>'; }).join('');
    var wa = ov.querySelector('.lf-wa'); wa.href = url;
    setStep(3);
    setTimeout(function () { if (!ov.hidden) { var w = window.open(url, '_blank', 'noopener'); if (!w) location.href = url; } }, 1600);
  }
  function open(opts) {
    lastFocus = document.activeElement;
    st = { step: 0, needs: [], area: null, stage: null, start: null };
    form.reset(); ov.querySelectorAll('.is-on,.is-bad').forEach(function (x) { x.classList.remove('is-on', 'is-bad'); });
    estimate();
    var pre = (opts && opts.need) || null;
    if (pre) pre.split(',').forEach(function (k) { var b = ov.querySelector('.lf-need[data-need="' + k + '"]'); if (b) { b.classList.add('is-on'); st.needs.push(k); } });
    if (opts && opts.role) { var sel = form.elements.role; for (var i = 0; i < sel.options.length; i++) if (sel.options[i].text === opts.role) sel.selectedIndex = i; }
    ov.hidden = false; document.documentElement.classList.add('lf-lock');
    requestAnimationFrame(function () { ov.classList.add('is-open'); });
    setStep(0);
    setTimeout(function () { var b = ov.querySelector('#lf-name'); b && b.focus({ preventScroll: true }); }, 80);
  }
  function close() {
    ov.classList.remove('is-open'); document.documentElement.classList.remove('lf-lock');
    setTimeout(function () { ov.hidden = true; }, 260);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !ov.hidden) close(); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-lead], a[href="#cotizar"], a[href="#muestra"], a[href^="https://wa.me/"]');
    if (!a || ov.contains(a)) return;
    e.preventDefault();
    var kind = a.getAttribute('data-lead') || (a.getAttribute('href') === '#muestra' ? 'muestra' : '');
    open({ need: kind === 'muestra' ? 'muestra' : (a.getAttribute('data-need') || ''), role: window.CP_ROLE || '' });
  });
  window.CPLead = { open: open, close: close };
})();
