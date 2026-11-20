(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var EN = (root.lang || 'es').slice(0, 2) === 'en';
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function on(el, ev, fn, o) { if (el) el.addEventListener(ev, fn, o); }
  var IO = 'IntersectionObserver' in window;

  /* ---------- reveal (fade-up 24px, .65s) ---------- */
  var rv = $$('.rv');
  if (IO && !RM) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rv.forEach(function (el) { rio.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  /* ---------- videos: play in view, pause offscreen, fade in when playing ---------- */
  var vids = $$('video[data-v]');
  var MOB = window.matchMedia && matchMedia('(max-width: 767px)').matches;
  vids.forEach(function (v) { if (MOB && v.getAttribute('data-m-src')) { v.poster = v.getAttribute('data-m-poster'); v.src = v.getAttribute('data-m-src'); } });
  vids.forEach(function (v) {
    v.muted = true; v.setAttribute('muted', '');
    on(v, 'playing', function () { v.classList.add('on'); });
    if (v.readyState > 2 && !v.paused) v.classList.add('on');
  });
  if (!RM && IO) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else if (!v.paused) v.pause();
      });
    }, { rootMargin: '200px 0px' });
    vids.forEach(function (v) { vio.observe(v); });
  }

  /* ---------- sliders: arrows only when scrollable ---------- */
  function initSlider(sl) {
    var prev = $('[data-prev]', sl), next = $('[data-next]', sl);
    function track() { var ts = $$('[data-track]', sl).filter(function (t) { return t.offsetParent !== null; }); return ts[0]; }
    function upd() {
      var t = track(); if (!t) return;
      var max = t.scrollWidth - t.clientWidth - 2;
      if (prev) prev.hidden = t.scrollLeft <= 2;
      if (next) next.hidden = t.scrollLeft >= max || max <= 0;
      t.classList.toggle('at-end', t.scrollLeft >= max);
    }
    function go(d) { var t = track(); if (!t) return; var c = t.firstElementChild; var step = c ? (c.getBoundingClientRect().width + 16) * Math.max(1, Math.floor(t.clientWidth / ((c.getBoundingClientRect().width + 16) * 1.4))) : t.clientWidth * .8; t.scrollBy({ left: d * step, behavior: RM ? 'auto' : 'smooth' }); }
    on(prev, 'click', function () { go(-1); });
    on(next, 'click', function () { go(1); });
    $$('[data-track]', sl).forEach(function (t) { on(t, 'scroll', upd, { passive: true }); });
    on(window, 'resize', upd);
    sl._upd = upd; upd(); setTimeout(upd, 400);
  }
  $$('[data-sl]').forEach(initSlider);

  /* ---------- pill tabs: panes / filter / sort ---------- */
  $$('[data-tabs]').forEach(function (g) {
    var kind = g.getAttribute('data-tabs'), mode = g.getAttribute('data-mode');
    var btns = $$('button', g);
    function act(b) {
      btns.forEach(function (x) { var o = x === b; x.classList.toggle('is-on', o); x.setAttribute('aria-selected', o); });
      var sec = g.closest('section'), sl = $('[data-sl]', sec);
      if (kind === 'cat') {
        var i = b.getAttribute('data-t');
        $$('[data-pane]', sec).forEach(function (p) { var o = p.getAttribute('data-pane') === i; p.hidden = !o; if (o) { var t = $('[data-track]', p); t.scrollLeft = 0; p.classList.remove('pane-in'); void p.offsetWidth; p.classList.add('pane-in'); } });
      } else {
        var f = b.getAttribute('data-f'), tr = $('[data-cards]', sec), cards = $$('.card', tr);
        if (mode === 'filter') {
          var k = 0;
          cards.forEach(function (c) { var m = (' ' + c.getAttribute('data-tags') + ' ').indexOf(' ' + f + ' ') > -1; c.classList.toggle('is-hide', !m); c.classList.remove('is-in'); if (m) { c.style.setProperty('--k', k++); void c.offsetWidth; c.classList.add('is-in'); } });
        } else {
          var hit = [], miss = [];
          cards.forEach(function (c) { ((' ' + c.getAttribute('data-tags') + ' ').indexOf(' ' + f + ' ') > -1 ? hit : miss).push(c); });
          hit.concat(miss).forEach(function (c, k) { tr.appendChild(c); c.classList.remove('is-in'); c.style.setProperty('--k', k); void c.offsetWidth; c.classList.add('is-in'); });
        }
        tr.scrollLeft = 0;
      }
      if (sl && sl._upd) setTimeout(sl._upd, 30);
    }
    btns.forEach(function (b) { on(b, 'click', function () { act(b); }); });
    if (mode === 'filter') act(btns[0]);
  });

  /* ---------- cards as buttons (keyboard) ---------- */
  $$('.card[role="button"]').forEach(function (c) { on(c, 'keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.click(); } }); });

  /* ---------- accordion: smooth height, one open ---------- */
  $$('.acc details').forEach(function (d) {
    var s = $('summary', d), body = $('.ac', d);
    on(s, 'click', function (e) {
      e.preventDefault();
      if (d._busy) return;
      if (d.open) close(d); else {
        $$('.acc details[open]').forEach(function (o) { if (o !== d) close(o); });
        d.open = true; var h = body.scrollHeight; body.style.height = '0px';
        anim(d, body, 0, h, function () { body.style.height = ''; });
      }
    });
  });
  function close(d) { var body = $('.ac', d); anim(d, body, body.scrollHeight, 0, function () { d.open = false; body.style.height = ''; }); }
  function anim(d, el, a, b, done) {
    if (RM || !el.animate) { done(); return; }
    d._busy = true;
    var x = el.animate([{ height: a + 'px' }, { height: b + 'px' }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
    x.onfinish = function () { d._busy = false; done(); };
  }

  /* ---------- mega menus ---------- */
  var dim = $('[data-dim]'), megaT;
  function megaOpen(k) {
    clearTimeout(megaT);
    $$('[data-mega]').forEach(function (m) { m.classList.toggle('is-open', m.getAttribute('data-mega') === k); });
    $$('[data-mega-tab]').forEach(function (t) { var o = t.getAttribute('data-mega-tab') === k; t.classList.toggle('is-on', o); t.setAttribute('aria-expanded', o); });
    if (dim) dim.classList.toggle('is-on', !!k);
  }
  function megaLater() { clearTimeout(megaT); megaT = setTimeout(function () { megaOpen(null); }, 140); }
  $$('[data-mega-tab]').forEach(function (t) {
    on(t, 'mouseenter', function () { megaOpen(t.getAttribute('data-mega-tab')); });
    on(t, 'mouseleave', megaLater);
    on(t, 'focus', function () { megaOpen(t.getAttribute('data-mega-tab')); });
  });
  $$('.tabs .tab:not([data-mega-tab])').forEach(function (t) { on(t, 'mouseenter', function () { megaOpen(null); }); on(t, 'focus', function () { megaOpen(null); }); });
  $$('[data-mega]').forEach(function (m) { on(m, 'mouseenter', function () { clearTimeout(megaT); }); on(m, 'mouseleave', megaLater); on(m, 'click', function (e) { if (e.target.closest('a')) megaOpen(null); }); });
  on(dim, 'click', function () { megaOpen(null); });

  /* ---------- lead helpers ---------- */
  function lead(need, opts) {
    if (!window.CPLead) { location.href = EN ? 'quote.html' : 'cotizar.html'; return; }
    window.CPLead.open({ need: need || '', role: window.CP_ROLE || '' });
    if (opts) setTimeout(function () {
      var lf = $('.lf'); if (!lf) return;
      if (opts.area != null) { var a = $('.lf-chips[data-name="area"] .lf-chip[data-i="' + opts.area + '"]', lf); if (a) a.click(); }
      if (opts.stage != null) { var s = $('.lf-chips[data-name="stage"] .lf-chip[data-i="' + opts.stage + '"]', lf); if (s) s.click(); }
    }, 30);
  }

  /* ---------- search layer ---------- */
  var srch = $('[data-search]');
  if (srch) {
    var data = []; try { data = JSON.parse($('#cp-products').textContent); } catch (e) {}
    var A = (($('link[rel="icon"]') || {}).getAttribute ? $('link[rel="icon"]').getAttribute('href') : '').replace(/client\/logo\/.*$/, '');
    var inp = $('[data-search-input]', srch), chipsEl = $('[data-search-chips]', srch), res = $('[data-search-res]', srch), hl = 0, lastF;
    chipsEl.innerHTML = data.slice(0, 8).map(function (d) { return '<button type="button" data-q="' + d.n.split(' · ')[0] + '">' + d.n.split(' · ')[0] + '</button>'; }).join('');
    function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
    function render() {
      var q = norm(inp.value.trim());
      var list = data.filter(function (d) { return !q || norm(d.n + ' ' + d.l + ' ' + d.k).indexOf(q) > -1; });
      hl = 0;
      if (!list.length) { res.innerHTML = '<p class="srch-empty">' + (EN ? 'No product matches that. ' : 'Ningún producto coincide. ') + '<button type="button" data-ask>' + (EN ? 'Ask an advisor' : 'Pregunta a un asesor') + '</button></p>'; return; }
      res.innerHTML = list.map(function (d, i) { return '<button type="button" data-need="' + d.need + '"' + (i === 0 && q ? ' class="is-hl"' : '') + '><img src="' + A + d.img + '" alt=""><span><b>' + d.n + '</b><small>' + d.l + '</small></span></button>'; }).join('');
    }
    function sOpen() { lastF = doc.activeElement; megaOpen(null); srch.classList.add('is-open'); root.style.overflow = 'hidden'; render(); setTimeout(function () { inp.focus(); }, 30); }
    function sClose() { srch.classList.remove('is-open'); root.style.overflow = ''; if (lastF && lastF.focus) lastF.focus({ preventScroll: true }); }
    $$('[data-search-open]').forEach(function (b) { on(b, 'click', sOpen); });
    $$('[data-search-close]', srch).forEach(function (b) { on(b, 'click', sClose); });
    on(inp, 'input', render);
    on(inp, 'keydown', function (e) {
      if (e.key === 'Escape') sClose();
      if (e.key === 'Enter') { e.preventDefault(); var f = $('button[data-need]', res); if (f) f.click(); }
    });
    on(chipsEl, 'click', function (e) { var b = e.target.closest('button'); if (!b) return; inp.value = b.getAttribute('data-q'); render(); inp.focus(); });
    on(res, 'click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var need = b.getAttribute('data-need') || ''; sClose();
      lead(need === 'muestra' ? 'muestra' : need);
    });
    on(doc, 'keydown', function (e) { if (e.key === 'Escape' && srch.classList.contains('is-open')) sClose(); });
  }

  /* ---------- mobile drawer ---------- */
  var drw = $('[data-drawer]');
  if (drw) {
    var main = $('.drw-pane.main', drw);
    function dOpen() { drw.classList.add('is-open'); root.style.overflow = 'hidden'; }
    function dClose() { drw.classList.remove('is-open'); root.style.overflow = ''; $$('.drw-pane.dsub', drw).forEach(function (p) { p.classList.remove('is-on'); }); main.classList.remove('is-off'); }
    $$('[data-drawer-open]').forEach(function (b) { on(b, 'click', dOpen); });
    on(drw, 'click', function (e) {
      if (e.target.closest('[data-drawer-close]')) { dClose(); return; }
      var s = e.target.closest('[data-sub]');
      if (s) { $('[data-subpane="' + s.getAttribute('data-sub') + '"]', drw).classList.add('is-on'); main.classList.add('is-off'); }
      if (e.target.closest('[data-back]')) { $$('.drw-pane.dsub', drw).forEach(function (p) { p.classList.remove('is-on'); }); main.classList.remove('is-off'); }
    });
    on(doc, 'keydown', function (e) { if (e.key === 'Escape' && drw.classList.contains('is-open')) dClose(); });
  }

  /* ---------- calculator (section 11) ---------- */
  var calc = $('[data-calc]');
  if (calc) {
    var rng = $('[data-calc-rng]', calc), out = $('[data-calc-out]', calc), rolls = $('[data-calc-rolls]', calc),
      x = $('[data-calc-x]', calc), stage = 1, lastR = -1;
    var fmt = function (n) { return n.toLocaleString(EN ? 'en-US' : 'es-MX'); };
    function upd() {
      var m = +rng.value, r = Math.max(1, Math.ceil(m / 100));
      out.textContent = fmt(m); rolls.textContent = fmt(r); x.textContent = '×' + fmt(r);
      rng.style.setProperty('--p', ((m - rng.min) / (rng.max - rng.min) * 100) + '%');
      if (r !== lastR) { x.classList.remove('bump'); void x.offsetWidth; x.classList.add('bump'); lastR = r; }
    }
    on(rng, 'input', upd);
    on($('[data-calc-qk]', calc), 'click', function (e) { var b = e.target.closest('button'); if (b) { rng.value = b.getAttribute('data-v'); upd(); } });
    function single(g, cb) { on(g, 'click', function (e) { var b = e.target.closest('button'); if (!b) return; $$('button', g).forEach(function (y) { y.classList.toggle('on', y === b); }); if (cb) cb(b); }); }
    single($('[data-calc-stage]', calc), function (b) { stage = +b.getAttribute('data-i'); });
    on($('[data-calc-cta]', calc), 'click', function () {
      var m = +rng.value, area = m < 500 ? 0 : m < 2000 ? 1 : m <= 10000 ? 2 : 3;
      lead('pisos', { area: area, stage: stage });
    });
    upd();
  }

  /* ---------- project tile cycler ---------- */
  $$('[data-proj]').forEach(function (p) {
    var slides = $$('.ps', p), ds = $$('.pdots button', p), i = 0, t;
    function go(n) { i = (n + slides.length) % slides.length; slides.forEach(function (s, k) { s.classList.toggle('on', k === i); }); ds.forEach(function (d, k) { d.classList.toggle('on', k === i); }); }
    function auto() { clearInterval(t); if (!RM) t = setInterval(function () { go(i + 1); }, 4500); }
    ds.forEach(function (d, k) { on(d, 'click', function () { go(k); auto(); }); });
    auto();
  });

  /* ---------- film modal ---------- */
  var vm = $('[data-vm]');
  if (vm) {
    var fv = $('video', vm);
    $$('[data-film]').forEach(function (b) { on(b, 'click', function () { if (!fv.src) fv.src = fv.getAttribute('data-src'); vm.classList.add('is-open'); root.style.overflow = 'hidden'; var p = fv.play(); if (p && p.catch) p.catch(function () {}); }); });
    function vClose() { vm.classList.remove('is-open'); fv.pause(); root.style.overflow = ''; }
    on($('[data-vm-close]', vm), 'click', vClose);
    on(vm, 'click', function (e) { if (e.target === vm) vClose(); });
    on(doc, 'keydown', function (e) { if (e.key === 'Escape' && vm.classList.contains('is-open')) vClose(); });
  }

  /* ---------- footer sample form → lead flow (sample path) ---------- */
  $$('[data-sub]').forEach(function (f) { on(f, 'submit', function (e) { e.preventDefault(); lead('muestra'); setTimeout(function () { var em = $('#lf-email'), v = $('input', f).value; if (em && v) em.value = v; }, 40); }); });

  /* ======================================================================
     Full-page quote flow (cotizar.html / en/quote.html)
     Same steps, data and WhatsApp hand-off as assets/core/lead.js.
     ====================================================================== */
  var qf = $('[data-quote]');
  if (qf) {
    var WA = '525550515145';
    var T = EN ? {
      needs: [['pisos', 'Floors', 'Porcelain, marble, wood, concrete'], ['vidrio', 'Glass & frames', 'Windows, curtain walls, doors'], ['alfombra', 'Carpet', 'Hotels, offices, corridors'], ['muros', 'Walls, doors & elevators', 'Corners, frames, cabins'], ['autonivelante', 'New floor', 'Self-leveling or epoxy'], ['muestra', 'Free Petropack sample', 'Try it on your site first']],
      stages: ['Structure', 'Finishes', 'Remodel', 'Handover'], starts: ['This week', 'This month', '1–3 months'], roles: ['Architect', 'Site manager', 'Contractor', 'Developer', 'Other'],
      est: function (r) { return '≈ <b>' + r + '</b> Petropack roll' + (r > 1 || typeof r === 'string' ? 's' : '') + ' (100 m² each)'; }, estNote: 'Estimate only. We confirm with your plans.',
      next: 'Continue', send: 'Send and open WhatsApp', okT: 'Got it, ', msg: 'Hi Cubre Pack! I want a quote.',
      mNeed: 'Protect', mArea: 'Area', mStage: 'Stage', mCity: 'City', mStart: 'Start', mName: 'Name', mCo: 'Company', mRole: 'Role', mEmail: 'Email', mPhone: 'Phone', mNotes: 'Notes'
    } : {
      needs: [['pisos', 'Pisos', 'Porcelanato, mármol, madera, concreto'], ['vidrio', 'Vidrio y cancelería', 'Ventanas, fachadas, puertas'], ['alfombra', 'Alfombra', 'Hoteles, oficinas, pasillos'], ['muros', 'Muros, puertas y elevadores', 'Esquinas, marcos, cabinas'], ['autonivelante', 'Piso nuevo', 'Autonivelante o epóxico'], ['muestra', 'Muestra gratis de Petropack', 'Pruébalo primero en tu obra']],
      stages: ['Obra negra', 'Acabados', 'Remodelación', 'Entrega'], starts: ['Esta semana', 'Este mes', '1–3 meses'], roles: ['Arquitecto', 'Residente de obra', 'Contratista', 'Desarrollador', 'Otro'],
      est: function (r) { return '≈ <b>' + r + '</b> rollo' + (r > 1 || typeof r === 'string' ? 's' : '') + ' de Petropack (100 m² c/u)'; }, estNote: 'Estimado. Lo confirmamos con tus planos.',
      next: 'Continuar', send: 'Enviar y abrir WhatsApp', okT: 'Listo, ', msg: '¡Hola Cubre Pack! Quiero cotizar.',
      mNeed: 'Proteger', mArea: 'Superficie', mStage: 'Etapa', mCity: 'Ciudad', mStart: 'Inicio', mName: 'Nombre', mCo: 'Empresa', mRole: 'Rol', mEmail: 'Correo', mPhone: 'Teléfono', mNotes: 'Notas'
    };
    var ICON = {
      pisos: '<path d="M3 16l9 5 9-5-9-5-9 5z"/><path d="M3 12l9 5 9-5"/><path d="M12 3l9 5-9 5-9-5 9-5z" opacity=".35"/>',
      vidrio: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M12 3v18M4 12h16"/><path d="M7 7l3-2M14 15l3-2" opacity=".5"/>',
      alfombra: '<rect x="3" y="6" width="18" height="12" rx="1.5"/><path d="M6 6v12M18 6v12" stroke-dasharray="1.5 2"/>',
      muros: '<path d="M4 21V4h11v17"/><path d="M15 8h5v13"/><circle cx="12" cy="13" r=".8" fill="currentColor"/>',
      autonivelante: '<path d="M3 17c3-2 6 2 9 0s6 2 9 0"/><path d="M3 13c3-2 6 2 9 0s6 2 9 0" opacity=".45"/><path d="M7 9V4h10v5"/>',
      muestra: '<path d="M4 9l8-5 8 5v9l-8 4-8-4z"/><path d="M4 9l8 4 8-4M12 13v9"/>'
    };
    var AREAS = ['< 500', '500 – 2,000', '2,000 – 10,000', '+10,000'], MID = [300, 1200, 6000, 15000];
    var st = { step: 0, needs: [], area: null, stage: null, start: null };
    var nextB = $('[data-qnext]', qf), lab = $('[data-qlabel]', qf), backB = $('[data-qback]', qf), bar = $('[data-bar]', qf), dotsQ = $$('.q-dots i', qf);
    function chipsHTML(list) { return list.map(function (v, i) { return '<button type="button" class="q-chip2" data-i="' + i + '">' + v + '</button>'; }).join(''); }
    $('[data-needs]', qf).innerHTML = T.needs.map(function (n) { return '<button type="button" class="q-need" data-need="' + n[0] + '" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + ICON[n[0]] + '</svg><b>' + n[1] + '</b><small>' + n[2] + '</small><span class="q-tick"></span></button>'; }).join('');
    $('[data-name="area"]', qf).innerHTML = chipsHTML(AREAS);
    $('[data-name="stage"]', qf).innerHTML = chipsHTML(T.stages);
    $('[data-name="start"]', qf).innerHTML = chipsHTML(T.starts);
    $('#q-role').innerHTML = T.roles.map(function (r) { return '<option>' + r + '</option>'; }).join('');

    function setStep(n) {
      st.step = n;
      $$('.q-pane', qf).forEach(function (p) { var o = +p.getAttribute('data-p') === n; p.hidden = !o; if (o) { p.classList.remove('q-in-a'); void p.offsetWidth; p.classList.add('q-in-a'); } });
      dotsQ.forEach(function (d, i) { d.className = i === n ? 'on' : i < n ? 'done' : ''; });
      bar.hidden = n === 3; root.classList.toggle('q-finished', n === 3);
      backB.style.visibility = n === 0 ? 'hidden' : 'visible';
      lab.textContent = n === 2 ? T.send : T.next;
      validate();
      if (n) { var f = $('.q-pane[data-p="' + n + '"] button, .q-pane[data-p="' + n + '"] input', qf); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 60); }
      var top = $('.q-left'); if (top && top.scrollTo) top.scrollTo({ top: 0, behavior: 'smooth' }); window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function validate() { var ok = true; if (st.step === 1) ok = st.needs.length > 0; if (st.step === 2) ok = st.area !== null; nextB.disabled = !ok; }
    function estimate() {
      var box = $('.q-est', qf);
      if (st.area === null) { box.innerHTML = ''; return; }
      var r = Math.max(1, Math.ceil(MID[st.area] / 100));
      box.innerHTML = '<span>' + T.est(st.area === 3 ? r + '+' : r) + '</span><small>' + T.estNote + '</small>';
    }
    on(qf, 'click', function (e) {
      var n = e.target.closest('.q-need');
      if (n) { var k = n.getAttribute('data-need'), i = st.needs.indexOf(k); if (i < 0) st.needs.push(k); else st.needs.splice(i, 1); n.classList.toggle('is-on', i < 0); n.setAttribute('aria-pressed', i < 0); validate(); return; }
      var c = e.target.closest('.q-chip2');
      if (c) { var g = c.parentNode; $$('.q-chip2', g).forEach(function (x) { x.classList.toggle('is-on', x === c); }); st[g.getAttribute('data-name')] = +c.getAttribute('data-i'); if (g.getAttribute('data-name') === 'area') estimate(); validate(); }
    });
    on(backB, 'click', function () { setStep(Math.max(0, st.step - 1)); });
    on(qf, 'submit', function (e) {
      e.preventDefault();
      if (st.step === 0) {
        var bad = null;
        $$('[data-p="0"] [required]', qf).forEach(function (i) {
        var v = i.value.trim(), okv = v && (i.type !== 'email' || /.+@.+\..+/.test(v)) && (i.type !== 'tel' || v.replace(/\D/g, '').length >= 8);
        i.classList.toggle('is-bad', !okv); i.setAttribute('aria-invalid', !okv); if (!okv && !bad) bad = i;
      });
      if (bad) { bad.focus(); return; }
        try { localStorage.setItem('cp_lead_contact', JSON.stringify({ t: Date.now(), name: val('name'), email: val('email'), phone: val('phone'), page: location.pathname })); } catch (e2) {}
        if (window.dataLayer) window.dataLayer.push({ event: 'lead_contact' });
        return setStep(1);
      }
      if (st.step === 1) return setStep(2);
      finish();
    });
    function val(n) { var el = qf.elements[n]; return el ? el.value.trim() : ''; }
    function finish() {
      var needs = st.needs.map(function (k) { for (var i = 0; i < T.needs.length; i++) if (T.needs[i][0] === k) return T.needs[i][1]; return k; }).join(', ');
      var rows = [[T.mNeed, needs], [T.mArea, st.area !== null ? AREAS[st.area] + ' m²' : ''], [T.mStage, st.stage !== null ? T.stages[st.stage] : ''], [T.mCity, val('city')], [T.mStart, st.start !== null ? T.starts[st.start] : ''], [T.mName, val('name')], [T.mCo, val('company')], [T.mRole, val('role')], [T.mPhone, val('phone')], [T.mEmail, val('email')], [T.mNotes, val('notes')]].filter(function (r) { return r[1]; });
      var text = T.msg + '\n\n' + rows.map(function (r) { return '• ' + r[0] + ': ' + r[1]; }).join('\n');
      var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
      try { localStorage.setItem('cp_lead', JSON.stringify({ t: Date.now(), rows: rows, page: location.pathname })); } catch (e) {}
      if (window.dataLayer) window.dataLayer.push({ event: 'generate_lead', lead_need: needs });
      $('[data-okt]', qf).textContent = T.okT + (val('name').split(' ')[0] || '') + '.';
      $('[data-sum]', qf).innerHTML = rows.slice(0, 5).map(function (r) { return '<div><span>' + r[0] + '</span><b>' + r[1].replace(/</g, '&lt;') + '</b></div>'; }).join('');
      $('[data-wa]', qf).href = url;
      setStep(3);
      setTimeout(function () { var w = window.open(url, '_blank', 'noopener'); if (!w) location.href = url; }, 1600);
    }
    // ?need=vidrio preselects like data-need on the modal
    var pre = (location.search.match(/[?&]need=([a-z,]+)/) || [])[1];
    if (pre) pre.split(',').forEach(function (k) { var b = $('.q-need[data-need="' + k + '"]', qf); if (b) { b.classList.add('is-on'); st.needs.push(k); } });
    setStep(0);
  }
})();
