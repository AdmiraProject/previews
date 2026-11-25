
(function () {
  var root = document.querySelector('[data-tpha]');
  if (!root || root.__tpha) return; root.__tpha = 1;
  var IMG = root.getAttribute('data-img') || 'assets/img/';
  var I = {
    mail: '<path d="M3 6h18v12H3z"/><path d="m3 7 9 6 9-6"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8"/>',
    phone: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
    db: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
    usb: '<path d="M9 3h6v6H9zM7 9h10v8a5 5 0 0 1-10 0z"/>',
    cloud: '<path d="M7 18h10a4 4 0 0 0 .6-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9z"/>',
    cam: '<path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    laptop: '<path d="M5 5h14v10H5zM3 19h18"/>',
    finger: '<path d="M8 20c-1-2-1.5-4-1.5-7a5.5 5.5 0 0 1 11 0M12 20c-.8-2-1-4-1-7a1 1 0 0 1 2 0c0 3 .6 5 1.6 7M16.5 19c-.4-1.4-.5-3-.5-5"/>',
    invoice: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'
  };
  var A = { mail: ['#f45d48', 'mail'], doc: ['#fff', 'doc'], chat: ['#000', 'chat'], db: ['#2684ff', 'db'], inv: ['#635bff', 'invoice'], phone: ['#d0271d', 'phone'],
    laptop: ['#fff', 'laptop'], usb: ['#000', 'usb'], cloud: ['#223040', 'cloud'], cam: ['#4a154b', 'cam'], finger: ['#d97757', 'finger'] };
  var ROWS = [[0, 'mail', 'doc', 0, 'chat', 'db', 0], [0, 'inv', 'phone', 0, 'laptop', 'usb'], [0, 'cloud', 0, 'cam', 0, 'finger', 0]];
  function ico(n, col) { return '<svg viewBox="0 0 24 24" fill="none" stroke="' + col + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + I[n] + '</svg>' }
  var FW = ['ISO 37001', 'ISO 37301', 'ISO 27001', 'ISO 27701', 'ISO 42001', 'Antifraude'];
  var BG = [['#ff5a34', '#fd59b4'], ['#3f8ff2', '#00d37a'], ['#fd59b4', '#4e2fe5'], ['#4e2fe5', '#3f8ff2'], ['#00d37a', '#ffbe20'], ['#ffbe20', '#ff5a34']];
  function badge(i) {
    var f = FW[i].split(' '), g = 'tb' + i;
    var txt = f.length > 1 ? '<text x="71.5" y="66" text-anchor="middle" font-size="24" font-weight="700" fill="#fff" font-family="Poppins">' + f[0] + '</text><text x="71.5" y="92" text-anchor="middle" font-size="22" font-weight="600" fill="#fff" font-family="Poppins">' + f[1] + '</text>'
      : '<text x="71.5" y="79" text-anchor="middle" font-size="18" font-weight="700" fill="#fff" font-family="Poppins">' + f[0] + '</text>';
    return '<svg viewBox="0 0 143 143"><defs><linearGradient id="' + g + '" x1="0" y1="0" x2="143" y2="143" gradientUnits="userSpaceOnUse"><stop stop-color="' + BG[i][0] + '"/><stop offset="1" stop-color="' + BG[i][1] + '"/></linearGradient></defs><circle cx="71.5" cy="71.5" r="52" fill="url(#' + g + ')"/><circle cx="71.5" cy="71.5" r="46" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.5"/>' + txt + '</svg>';
  }
  var DOCL = ['Entendimiento', 'Preservación', 'Análisis', 'Validación', 'Hallazgos', 'Informe'];
  var ORO = '<div class="oro"><img src="' + IMG + 'brand/cropped-favicon.png" alt="" width="512" height="512"></div>';
  root.innerHTML =
    '<div class="tpha-stage">' +
    '<div class="tpha-glows">' +
    '<div class="tpha-glow" data-g="1" style="left:206px;top:40px;width:930px;height:420px;background:radial-gradient(closest-side,rgba(255,90,52,.16),rgba(255,90,52,0))"></div>' +
    '<div class="tpha-glow" data-g="1" style="left:720px;top:60px;width:600px;height:420px;background:radial-gradient(closest-side,rgba(245,87,182,.26),rgba(245,87,182,0))"></div>' +
    '<div class="tpha-glow" data-g="2" style="left:0;top:40px;width:900px;height:420px;background:radial-gradient(closest-side,rgba(82,123,239,.22),rgba(82,123,239,0))"></div>' +
    '<div class="tpha-glow" data-g="2" style="left:420px;top:90px;width:900px;height:440px;background:radial-gradient(closest-side,rgba(0,211,122,.16),rgba(63,143,242,0))"></div>' +
    '<div class="tpha-glow" data-g="3" style="left:420px;top:40px;width:900px;height:380px;background:radial-gradient(closest-side,rgba(255,90,52,.14),rgba(255,90,52,0))"></div>' +
    '<div class="tpha-glow" data-g="3" style="left:640px;top:100px;width:600px;height:450px;background:radial-gradient(closest-side,rgba(245,87,182,.28),rgba(245,87,182,0))"></div>' +
    '</div>' +
    '<div class="tpha-abs tpha-bg" data-bg>' +
    '<img src="' + IMG + 'hero-ring.svg" alt="" width="521" height="530" style="left:145.53px;top:0;width:521.07px;height:530.19px">' +
    '<img src="' + IMG + 'cut/fernando-bust.webp" alt="Fernando Cevallos, fundador y CEO de F&amp;C Consulting Group" width="1180" height="1219" fetchpriority="high" style="left:166px;top:54px;width:480px;height:496px">' +
    '</div>' +
    '<div class="tpha-s1">' +
    '<div class="tpha-shadow" data-o1s style="left:446px;top:110px;width:74px"></div>' +
    '<div class="tpha-oro" data-o1 style="left:436px;top:14px;width:90px">' + ORO + '</div>' +
    '<div class="tpha-abs" data-c1 style="left:290px;top:125px;width:314px;height:281px">' +
    '<div class="tpha-card" data-c1box style="inset:0"></div>' +
    '<div class="tpha-rows">' +
    '<div class="tpha-row"><div class="tpha-track" data-dir="1" data-speed="18"></div></div>' +
    '<div class="tpha-row"><div class="tpha-track" data-dir="-1" data-speed="22"></div></div>' +
    '<div class="tpha-row"><div class="tpha-track" data-dir="1" data-speed="20"></div></div>' +
    '</div>' +
    '<div class="tpha-count" data-cnt><svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" style="opacity:.8"><path fill="#705cf8" d="M12 0c.6 5.9 6.1 11.4 12 12-5.9.6-11.4 6.1-12 12-.6-5.9-6.1-11.4-12-12C5.9 11.4 11.4 5.9 12 0z"/></svg><span data-num>Evidencia con cadena de custodia</span></div>' +
    '</div>' +
    '<div class="tpha-ready" data-ready>Lista para el análisis</div>' +
    '</div>' +
    '<div class="tpha-s2">' +
    '<div class="tpha-shadow" data-o2s style="left:936px;top:224px;width:78px"></div>' +
    '<div class="tpha-oro" data-o2 style="left:924px;top:109px;width:98px">' + ORO + '</div>' +
    '<div class="tpha-abs" data-c2 style="left:688px;top:42px;width:213px;height:254px;transform-origin:50% 60%">' +
    '<div class="tpha-card tpha-s2card" style="inset:0"></div>' +
    '<div class="tpha-ringwrap" data-ring><svg viewBox="0 0 143 143" width="143" height="143" aria-hidden="true"><defs><linearGradient id="tphaRG" x1="0" y1="0" x2="143" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="#3F8FF2"/><stop offset="1" stop-color="#00D37A"/></linearGradient></defs>' +
    '<circle cx="71.5" cy="71.5" r="62.15" fill="none" stroke="#fff" stroke-width="18.7" opacity=".3"/><circle cx="71.5" cy="71.5" r="62.15" fill="none" stroke="url(#tphaRG)" stroke-width="18.7" opacity=".3"/>' +
    '<circle data-arc cx="71.5" cy="71.5" r="62.15" fill="none" stroke="url(#tphaRG)" stroke-width="18.7" stroke-linecap="round" transform="rotate(-90 71.5 71.5)" stroke-dasharray="390.5" stroke-dashoffset="390.5"/></svg>' +
    '<div class="tpha-lbls" data-lbls2></div></div>' +
    '</div>' +
    '<div class="tpha-pill" data-p2 style="left:725px;top:243px"><div class="tpha-pill-in"><img src="' + IMG + 'hero-icon-shield.webp" alt="" width="25" height="31" style="margin:0 7px;width:25px"><div class="tpha-pill-t"><b>Avance del programa</b><span>En tiempo</span></div></div></div>' +
    '</div>' +
    '<div class="tpha-s3">' +
    '<div class="tpha-abs" data-c3 style="left:793px;top:193px;width:210px;height:192px;transform-origin:50% 70%">' +
    '<div class="tpha-card tpha-s3card" style="inset:0"></div>' +
    '<div class="tpha-doc" data-doc><svg viewBox="0 0 114.2 159" width="114.2" height="159" aria-hidden="true"><defs><linearGradient id="tphaDG" x1="0" y1="0" x2="0" y2="159" gradientUnits="userSpaceOnUse"><stop stop-color="#fff" stop-opacity=".7"/><stop offset=".63" stop-color="#fff" stop-opacity=".95"/></linearGradient><filter id="tphaDS" x="-40%" y="-30%" width="180%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="12.5" flood-color="#000" flood-opacity=".15"/></filter></defs>' +
    '<path filter="url(#tphaDS)" fill="url(#tphaDG)" d="M0 16C0 7.2 7.2 0 16 0h69.1l29.1 28.9V143c0 8.8-7.2 16-16 16H16c-8.8 0-16-7.2-16-16z"/><path fill="#fff" filter="url(#tphaDS)" d="M85.1 0v17c0 6.6 5.3 11.9 11.9 11.9h17.2z"/></svg>' +
    '<div class="tpha-lbls" data-lbls3></div>' +
    '<svg class="tpha-lock" viewBox="0 0 24 24" aria-hidden="true"><path fill="#1c1b1f" d="M6 22c-.55 0-1.02-.2-1.41-.59C4.2 21.02 4 20.55 4 20V10c0-.55.2-1.02.59-1.41C4.98 8.2 5.45 8 6 8h1V6c0-1.38.49-2.56 1.46-3.54C9.44 1.49 10.62 1 12 1s2.56.49 3.54 1.46C16.51 3.44 17 4.62 17 6v2h1c.55 0 1.02.2 1.41.59.39.39.59.86.59 1.41v10c0 .55-.2 1.02-.59 1.41-.39.39-.86.59-1.41.59H6zm6-5c.55 0 1.02-.2 1.41-.59.39-.39.59-.86.59-1.41s-.2-1.02-.59-1.41C13.02 13.2 12.55 13 12 13s-1.02.2-1.41.59C10.2 13.98 10 14.45 10 15s.2 1.02.59 1.41c.39.39.86.59 1.41.59zM9 8h6V6c0-.83-.29-1.54-.88-2.13C13.54 3.29 12.83 3 12 3s-1.54.29-2.13.88C9.29 4.46 9 5.17 9 6v2z"/></svg>' +
    '</div><div class="tpha-fx" data-fx style="left:105px;top:105px"></div></div>' +
    '<div class="tpha-pill" data-p3 style="left:754px;top:365px"><div class="tpha-pill-in" style="border-color:#ff5a34"><img data-chk src="' + IMG + 'hero-icon-check.webp" alt="" width="32" height="32" style="margin:0 4px;width:32px"><div class="tpha-pill-t"><b>Informe ejecutivo listo</b><span>Hallazgos validados</span></div></div></div>' +
    '<div class="tpha-shadow" data-o3s style="left:994px;top:346px;width:74px"></div>' +
    '<div class="tpha-oro" data-o3 style="left:988px;top:253px;width:88px">' + ORO + '</div>' +
    '</div></div>';

  var stage = root.querySelector('.tpha-stage');
  function $(s) { return root.querySelector(s) } function $$(s) { return root.querySelectorAll(s) }
  var BP = 768, MW = 540, MH = 500, CAMX = [270, 560, 600], CAMY = 0, MOB = false, SC = 1, camX = CAMX[0];
  function place() { stage.style.transform = 'scale(' + SC + ')' + (MOB ? ' translate(' + (-camX).toFixed(2) + 'px,' + (-CAMY) + 'px)' : '') }
  function fit() { var w = root.clientWidth; MOB = w < BP; root.classList.toggle('is-mob', MOB); root.style.aspectRatio = MOB ? MW + '/' + MH : '1240/550'; SC = w / (MOB ? MW : 1240); place() }
  fit(); if (window.ResizeObserver) new ResizeObserver(fit).observe(root); else addEventListener('resize', fit);
  function cl(v) { return v < 0 ? 0 : v > 1 ? 1 : v } function pr(t, a, d) { return cl((t - a) / d) }
  function oc(p) { return 1 - Math.pow(1 - p, 3) } function io(p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2 }
  function ob(p) { var c = 1.9; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2) } function lerp(a, b, p) { return a + (b - a) * p }
  function set(el, o, tr) { el.style.opacity = o; el.style.transform = tr || ''; el.style.visibility = o < .003 ? 'hidden' : 'visible' }
  var tracks = [].slice.call($$('.tpha-track'));
  tracks.forEach(function (tr, i) {
    var html = '';
    for (var k = 0; k < 3; k++) ROWS[i].forEach(function (n) {
      if (!n) { html += '<div class="tpha-tile is-empty"></div>'; return }
      var a = A[n], col = a[0] === '#fff' ? '#000d14' : '#fff';
      html += '<div class="tpha-tile is-logo" style="background:' + a[0] + '">' + ico(a[1], col) + '</div>';
    });
    tr.innerHTML = html; tr.__w = ROWS[i].length * 56; tr.__x = 0; tr.__dir = +tr.getAttribute('data-dir'); tr.__sp = +tr.getAttribute('data-speed');
  });
  var rows = [].slice.call($$('.tpha-row'));
  var b2 = $('[data-lbls2]'); b2.innerHTML = FW.map(function (f, i) { return '<div class="tpha-badge" role="img" aria-label="' + f + '">' + badge(i) + '</div>' }).join('');
  var b3 = $('[data-lbls3]'); b3.innerHTML = DOCL.map(function (f) { return '<div class="tpha-lbl">' + f + '</div>' }).join('');
  var L2 = [].slice.call(b2.children), L3 = [].slice.call(b3.children);
  function cycle(els, t, t0, step, base) {
    for (var j = 0; j < els.length; j++) {
      var s = t0 + j * step, e = s + step, pin = j === 0 ? base : oc(pr(t, s, .34)), pout = j === els.length - 1 ? 0 : io(pr(t, e, .3));
      set(els[j], pin * (1 - pout), 'translateY(' + ((1 - pin) * 10 - pout * 10) + 'px) scale(' + (0.9 + 0.1 * pin) + ')');
    }
  }
  function oro(el, sh, t, o, cfg, reacts) {
    var fy = -7 * (.5 - .5 * Math.cos(t * Math.PI * 2 / 3.4)), rot = cfg.rot + 3.2 * Math.sin(t * Math.PI * 2 / 4.6), dx = 0, sc = 1, spin = 0;
    for (var i = 0; i < reacts.length; i++) {
      var r = reacts[i], p = pr(t, r[0], r[1]); if (p <= 0 || p >= 1) continue;
      var s = Math.sin(Math.PI * p); fy -= r[2] * s; rot += r[3] * s; dx += (r[4] || 0) * s; sc += (r[5] || 0) * s; if (r[6]) spin += r[6] * io(p);
    }
    var lift = -fy;
    set(el, o, 'translate(' + dx.toFixed(2) + 'px,' + fy.toFixed(2) + 'px) rotate(' + (rot + spin).toFixed(2) + 'deg) scale(' + (sc * (.85 + .15 * o)).toFixed(3) + ')');
    var k = Math.max(.35, 1 - lift / 46);
    set(sh, o * Math.max(.12, .9 - lift / 40), 'translateX(' + (dx * .6).toFixed(2) + 'px) scale(' + k.toFixed(3) + ',' + (k * .9 + .1).toFixed(3) + ')');
  }
  var fx = $('[data-fx]'), COL = ['#ff5a34', '#fd59b4', '#f557b6', '#ff8a3d', '#ffb02e'];
  function burst(big) {
    if (!fx.animate) return;
    var n = big ? 26 : 13;
    for (var i = 0; i < n; i++) {
      var kind = i % 5 === 0 ? 'ring' : i % 3 === 0 ? 'spark' : 'dot', el = document.createElement('div'), c = COL[i % COL.length];
      var ang = (i / n) * Math.PI * 2 + Math.random() * .5, dist = (big ? 78 : 62) + Math.random() * (big ? 70 : 38), sz = kind === 'dot' ? 4 + Math.random() * 4 : kind === 'ring' ? 10 + Math.random() * 8 : 11 + Math.random() * 6;
      el.className = 'tpha-p'; el.style.width = el.style.height = sz + 'px'; el.style.marginLeft = el.style.marginTop = (-sz / 2) + 'px';
      if (kind === 'dot') { el.style.borderRadius = '50%'; el.style.background = c }
      else if (kind === 'ring') { el.style.borderRadius = '50%'; el.style.border = '2px solid ' + c }
      else el.innerHTML = '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="' + c + '" d="M12 0c.6 5.9 6.1 11.4 12 12-5.9.6-11.4 6.1-12 12-.6-5.9-6.1-11.4-12-12C5.9 11.4 11.4 5.9 12 0z"/></svg>';
      fx.appendChild(el);
      var x = Math.cos(ang) * dist, y = Math.sin(ang) * dist * .8, d = ((big ? 1100 : 850) + Math.random() * 300) / SPEED;
      el.animate([{ transform: 'translate(0,0) scale(.2) rotate(0deg)', opacity: 0 }, { transform: 'translate(' + x * .55 + 'px,' + y * .55 + 'px) scale(1) rotate(40deg)', opacity: 1, offset: .25 }, { transform: 'translate(' + x + 'px,' + y + 'px) scale(.6) rotate(90deg)', opacity: 0 }], { duration: d, easing: 'cubic-bezier(.2,.7,.3,1)', delay: Math.random() * 80 / SPEED }).onfinish = function () { this.effect.target.remove() };
    }
    var rg = document.createElement('div'); rg.className = 'tpha-p';
    rg.style.cssText = 'width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;border:2px solid rgba(253,89,180,.55)';
    fx.appendChild(rg);
    rg.animate([{ transform: 'scale(.4)', opacity: .9 }, { transform: 'scale(' + (big ? 1.9 : 1.45) + ')', opacity: 0 }], { duration: (big ? 1000 : 750) / SPEED, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = function () { rg.remove() };
  }
  var E = { bg: $('[data-bg]'), c1: $('[data-c1]'), c1box: $('[data-c1box]'), cnt: $('[data-cnt]'), num: $('[data-num]'), ready: $('[data-ready]'),
    o1: $('[data-o1]'), o1s: $('[data-o1s]'), c2: $('[data-c2]'), p2: $('[data-p2]'), arc: $('[data-arc]'), ring: $('[data-ring]'), o2: $('[data-o2]'), o2s: $('[data-o2s]'),
    c3: $('[data-c3]'), p3: $('[data-p3]'), chk: $('[data-chk]'), doc: $('[data-doc]'), o3: $('[data-o3]'), o3s: $('[data-o3s]') };
  var glows = { 1: $$('[data-g="1"]'), 2: $$('[data-g="2"]'), 3: $$('[data-g="3"]') };
  var S2 = 9, S3 = 18, LOOP = 27.5, C = 207, SPEED = 1.5, R1 = [.3, 1.4, 2.5], FILL0 = 1.7, FILL = 6, STEP2 = FILL / 6, B0 = 2, STEP3 = 1.1;
  var react1 = [[R1[0] + .45, .5, 6, -4], [R1[1] + .45, .5, 6, 4], [R1[2] + .45, .5, 6, -4], [4.65, .75, 18, 8, 0, .06]];
  var react2 = [[0, 0, 0, 0]]; for (var j = 1; j < 6; j++) react2.push([FILL0 + j * STEP2, .55, 9, -9, -5]); react2.push([FILL0 + FILL, .8, 22, -10, -6, .06]);
  var react3 = []; for (j = 0; j < 5; j++) react3.push([B0 + j * STEP3, .55, 11, j % 2 ? 9 : -9]); react3.push([B0 + 5 * STEP3, 1.1, 30, 0, 0, .1, 360]);
  function glowSet(t) {
    var g1 = 1 - io(pr(t, 8.3, 1.1)) + io(pr(t, S3 + 8.4, 1.1)), g2 = io(pr(t, 8.3, 1.1)) * (1 - io(pr(t, S2 + 8.4, 1.1))), g3 = io(pr(t, S2 + 8.4, 1.1)) * (1 - io(pr(t, S3 + 8.4, 1.1)));
    [[1, g1], [2, g2], [3, g3]].forEach(function (p) { for (var i = 0; i < glows[p[0]].length; i++) glows[p[0]][i].style.opacity = cl(p[1]) });
  }
  var last3 = -1;
  function render(t, dt) {
    var m = io(pr(t, 8.3, 1.1)) * (1 - io(pr(t, S3 + 8.4, 1.1)));
    E.bg.style.transform = 'translate(' + lerp(368, 194, m).toFixed(2) + 'px,' + lerp(10, 2, m).toFixed(2) + 'px)';
    if (MOB) { var k1 = io(pr(t, 8.3, 1.1)), k2 = io(pr(t, S2 + 8.4, 1.1)), k3 = io(pr(t, S3 + 8.4, 1.1)); camX = CAMX[0] + (CAMX[1] - CAMX[0]) * k1 + (CAMX[2] - CAMX[1]) * k2 + (CAMX[0] - CAMX[2]) * k3; place() }
    glowSet(t);
    var out1 = 1 - io(pr(t, 8.1, .55));
    for (var i = 0; i < 3; i++) { var p = oc(pr(t, R1[i], .6)); set(rows[i], p, 'translateY(' + ((1 - p) * 14) + 'px)') }
    var box = oc(pr(t, 0, .55)); set(E.c1box, box, 'scale(' + (0.97 + .03 * box) + ')');
    set(E.c1, out1, 'scale(' + (0.96 + .04 * out1) + ')');
    var cp = oc(pr(t, .4, .5)); set(E.cnt, cp, 'translateY(' + ((1 - cp) * 8) + 'px)');
        var rp = pr(t, 4.6, .6), ro = out1 * cl(rp * 3);
    set(E.ready, ro, 'translateY(' + ((1 - oc(rp)) * 14) + 'px) scale(' + (0.7 + .3 * ob(rp)) + ')');
    if (t < S2 + .5) { oro(E.o1, E.o1s, t, oc(pr(t, .1, .7)) * out1, { rot: -15 }, react1) } else { set(E.o1, 0); set(E.o1s, 0) }
    if (t < S2) tracks.forEach(function (tr) { tr.__x += tr.__dir * tr.__sp * dt; var w = tr.__w, x = ((tr.__x % w) + w) % w; tr.style.transform = 'translateX(' + (x - w).toFixed(2) + 'px)' });
    var u = t - S2;
    if (u > -.5 && u < 9.5) {
      var out2 = 1 - io(pr(u, 8.4, .55)), cin = oc(pr(u, .2, .75));
      set(E.c2, cin * out2, 'translateY(' + ((1 - cin) * 12) + 'px) scale(' + (0.9 + .1 * cin) * (0.97 + .03 * out2) + ')');
      var pin = oc(pr(u, 1, .6)); set(E.p2, pin * out2, 'translateY(' + ((1 - pin) * 22) + 'px)');
      var f = pr(u, FILL0, FILL), fe = f * .85 + io(f) * .15;
      E.arc.setAttribute('stroke-dashoffset', (390.5 * (1 - fe)).toFixed(2)); E.arc.style.opacity = f > 0 ? 1 : 0;
      var done = pr(u, FILL0 + FILL, .7); E.ring.style.transform = 'scale(' + (1 + .06 * Math.sin(Math.PI * done)) + ')';
      cycle(L2, u, FILL0, STEP2, cin);
      oro(E.o2, E.o2s, u, oc(pr(u, 0, .7)) * out2, { rot: 0 }, react2);
    } else { set(E.c2, 0); set(E.p2, 0); set(E.o2, 0); set(E.o2s, 0) }
    var v = t - S3;
    if (v > -.5 && v < 9.5) {
      var out3 = 1 - io(pr(v, 8.4, .55)), din = oc(pr(v, .2, .75));
      set(E.c3, din * out3, 'translateY(' + ((1 - din) * 12) + 'px) scale(' + (0.9 + .1 * din) * (0.97 + .03 * out3) + ')');
      var qin = oc(pr(v, 1, .6)); set(E.p3, qin * out3, 'translateY(' + ((1 - qin) * 22) + 'px)');
      var kp = pr(v, 1.35, .55); E.chk.style.transform = 'scale(' + (kp <= 0 ? 0 : ob(kp)).toFixed(3) + ')';
      cycle(L3, v, B0, STEP3, din);
      var bi = Math.floor((v - B0) / STEP3);
      if (v >= B0 && bi <= 5 && bi !== last3) { last3 = bi; if (dt < .2) burst(bi === 5) }
      var sw = 0; for (j = 0; j < 6; j++) { var q = pr(v, B0 + j * STEP3, .4); if (q > 0 && q < 1) sw = Math.max(sw, Math.sin(Math.PI * q) * (j === 5 ? 1.6 : 1)) }
      E.doc.style.transform = 'translateY(' + (-4 * sw).toFixed(2) + 'px) scale(' + (1 + .035 * sw).toFixed(3) + ')';
      oro(E.o3, E.o3s, v, oc(pr(v, .3, .7)) * out3, { rot: 0 }, react3);
    } else { set(E.c3, 0); set(E.p3, 0); set(E.o3, 0); set(E.o3s, 0); last3 = -1 }
  }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { render(6.5, 0); return }
  var t = 0, prev = null, visible = true, paused = false;
  root.tpha = { seek: function (x) { t = x; render(t, 0) }, pause: function (b) { paused = b } };
  if (window.IntersectionObserver) new IntersectionObserver(function (e) { visible = e[0].isIntersecting }).observe(root);
  function tick(now) {
    if (prev === null) prev = now;
    var dt = Math.min(.1, (now - prev) / 1000); prev = now;
    if (visible && !paused) { dt *= SPEED; t += dt; if (t >= LOOP) t -= LOOP; render(t, dt) }
    requestAnimationFrame(tick);
  }
  render(0, 0); requestAnimationFrame(tick);
})();
