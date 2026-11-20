(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var desk = function () { return matchMedia('(min-width:1024px)').matches; };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav: sliding 2px line + mega panels ---------- */
  var nav = $('.hd__nav ul'), line = $('.hd__line'), openMM = null, mmT;
  function moveLine(li) {
    if (!line) return;
    if (!li) { line.style.opacity = 0; return; }
    var a = li.querySelector('a'), r = a.getBoundingClientRect(), p = nav.getBoundingClientRect();
    line.style.left = (r.left - p.left) + 'px'; line.style.width = r.width + 'px'; line.style.opacity = 1;
  }
  function showMM(k) {
    $$('.mm').forEach(function (m) {
      var on = m.dataset.panel === k;
      if (on) { m.hidden = false; requestAnimationFrame(function () { m.classList.add('on'); }); }
      else { m.classList.remove('on'); setTimeout(function () { if (!m.classList.contains('on')) m.hidden = true; }, 200); }
    });
    $$('.hd__nav li[data-mm]').forEach(function (li) { var a = li.querySelector('a[aria-haspopup]'); if (a) a.setAttribute('aria-expanded', li.dataset.mm === k && !!k); });
    openMM = k || null;
  }
  if (nav) {
    $$('li[data-mm]', nav).forEach(function (li) {
      li.addEventListener('mouseenter', function () { if (!desk()) return; clearTimeout(mmT); moveLine(li); showMM(li.dataset.mm); });
      var a = li.querySelector('a[aria-haspopup]');
      if (a) a.addEventListener('click', function (e) { e.preventDefault(); showMM(openMM === li.dataset.mm ? null : li.dataset.mm); moveLine(openMM ? li : null); });
    });
    var leave = function () { mmT = setTimeout(function () { showMM(null); moveLine(null); }, 160); };
    $('.hd__mid').addEventListener('mouseleave', leave);
    $$('.mm').forEach(function (m) { m.addEventListener('mouseenter', function () { clearTimeout(mmT); }); m.addEventListener('mouseleave', leave); m.addEventListener('click', function (e) { if (e.target.closest('a')) { showMM(null); moveLine(null); } }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { showMM(null); moveLine(null); closeBook(); } });
  }

  /* ---------- Book Now dropdown ---------- */
  var book = $('.hd__book'), bookBtn = book && $('button', book);
  function closeBook() { if (!book) return; book.classList.remove('open'); bookBtn.setAttribute('aria-expanded', 'false'); }
  if (book) {
    bookBtn.addEventListener('click', function (e) { e.stopPropagation(); var o = !book.classList.contains('open'); book.classList.toggle('open', o); bookBtn.setAttribute('aria-expanded', o); });
    document.addEventListener('click', function (e) { if (!e.target.closest('.hd__book')) closeBook(); });
    $('.hd__dd', book).addEventListener('click', function () { closeBook(); });
  }

  /* ---------- mobile menu ---------- */
  var burger = $('.hd__burger'), mnav = $('#mnav');
  function setM(o) { burger.setAttribute('aria-expanded', o); mnav.hidden = !o; document.documentElement.style.overflow = o ? 'hidden' : ''; }
  if (burger) {
    burger.addEventListener('click', function () { setM(burger.getAttribute('aria-expanded') !== 'true'); });
    mnav.addEventListener('click', function (e) {
      var acc = e.target.closest('.mnav__acc');
      if (acc) { var o = acc.getAttribute('aria-expanded') !== 'true'; acc.setAttribute('aria-expanded', o); acc.nextElementSibling.hidden = !o; return; }
      if (e.target.closest('a')) setM(false);
    });
    addEventListener('resize', function () { if (desk() && !mnav.hidden) setM(false); });
  }

  /* ---------- concern tabs (+ select on mobile, + deep links from menus) ---------- */
  var tabs = $$('.tabs [role=tab]'), sel = $('#tr-select');
  function selectTab(k, focus) {
    tabs.forEach(function (t) { var on = t.id === 'tab-' + k; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
    $$('.tr__pan').forEach(function (p) { p.hidden = p.id !== 'pan-' + k; p.classList.toggle('anim', false); if (!p.hidden) { void p.offsetWidth; p.classList.toggle('anim', true); } });
    if (sel) sel.value = k;
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t.id.slice(4)); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      e.preventDefault(); var n = tabs[(i + d + tabs.length) % tabs.length]; selectTab(n.id.slice(4), true);
    });
  });
  if (sel) sel.addEventListener('change', function () { selectTab(sel.value); });
  document.addEventListener('click', function (e) { var a = e.target.closest('[data-tab]'); if (a) selectTab(a.dataset.tab); });

  /* ---------- testimonial slider: centred, looping, drag/swipe, 300ms ---------- */
  var vp = $('.ts__vp'), track = vp && $('.ts__track');
  if (track) {
    var orig = $$('.tsi', track), N = orig.length, dots = $('.ts__dots');
    // clone sets either side for seamless looping
    var pre = orig.map(function (s) { var c = s.cloneNode(true); c.setAttribute('aria-hidden', 'true'); return c; });
    var post = orig.map(function (s) { var c = s.cloneNode(true); c.setAttribute('aria-hidden', 'true'); return c; });
    pre.forEach(function (c) { track.insertBefore(c, orig[0]); }); post.forEach(function (c) { track.appendChild(c); });
    $$('.tsi[aria-hidden] a', track).forEach(function (a) { a.tabIndex = -1; });
    var all = $$('.tsi', track), idx = N + 2, x0 = 0;
    dots.innerHTML = orig.map(function () { return '<i></i>'; }).join('');
    function pos(anim) {
      var s = all[idx], vw = vp.clientWidth;
      var off = s.offsetLeft + s.offsetWidth / 2 - vw / 2;
      track.style.transition = anim === false ? 'none' : '';
      track.style.transform = 'translateX(' + (-off) + 'px)'; x0 = -off;
      all.forEach(function (el, i) { el.classList.toggle('on', i === idx); });
      $$('i', dots).forEach(function (d, i) { d.classList.toggle('on', i === idx % N); });
    }
    function go(d) { idx += d; pos(); }
    track.addEventListener('transitionend', function (e) {
      if (e.target !== track) return;
      if (idx < N) { idx += N; pos(false); } else if (idx >= 2 * N) { idx -= N; pos(false); }
    });
    $$('.ts__a').forEach(function (b) { b.addEventListener('click', function () { go(+b.dataset.d); }); });
    // drag
    var sx = null, dx = 0, moved = false;
    track.addEventListener('pointerdown', function (e) { if (e.button !== 0) return; sx = e.clientX; dx = 0; moved = false; track.classList.add('drag'); track.setPointerCapture(e.pointerId); });
    track.addEventListener('pointermove', function (e) { if (sx === null) return; dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; track.style.transform = 'translateX(' + (x0 + dx) + 'px)'; });
    var end = function () { if (sx === null) return; track.classList.remove('drag'); sx = null; if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1); else pos(); };
    track.addEventListener('pointerup', end); track.addEventListener('pointercancel', end);
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } var s = e.target.closest('.tsi'); if (!moved && s && !s.classList.contains('on') && !e.target.closest('a')) { idx = all.indexOf(s); pos(); } }, true);
    vp.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); });
    addEventListener('resize', function () { pos(false); });
    pos(false); requestAnimationFrame(function () { pos(false); });
    if (document.fonts) document.fonts.ready.then(function () { pos(false); });
  }

  /* ---------- FAQ accordion (single open, slide) ---------- */
  var faqBtns = $$('.faq__l button');
  function setFaq(b, o) {
    var p = document.getElementById(b.getAttribute('aria-controls'));
    b.setAttribute('aria-expanded', o);
    if (o) { p.hidden = false; var h = p.scrollHeight; p.style.height = '0px'; requestAnimationFrame(function () { p.style.height = h + 'px'; }); }
    else { p.style.height = p.scrollHeight + 'px'; requestAnimationFrame(function () { p.style.height = '0px'; }); }
    var done = function () { p.removeEventListener('transitionend', done); if (b.getAttribute('aria-expanded') === 'true') p.style.height = 'auto'; else p.hidden = true; };
    p.addEventListener('transitionend', done);
    if (RM) done();
  }
  faqBtns.forEach(function (b) { b.addEventListener('click', function () { var o = b.getAttribute('aria-expanded') !== 'true'; faqBtns.forEach(function (x) { if (x !== b && x.getAttribute('aria-expanded') === 'true') setFaq(x, false); }); setFaq(b, o); }); });

  /* ---------- footer: accordion (mobile) + rotating city label every 4s ---------- */
  $$('.ft__t').forEach(function (t) { t.addEventListener('click', function () { if (desk()) return; var c = t.parentNode, o = !c.classList.contains('open'); c.classList.toggle('open', o); t.setAttribute('aria-expanded', o); }); });
  var city = $$('.ft__city i'), ci = 0;
  if (city.length > 1 && !RM) setInterval(function () { city[ci].classList.remove('on'); ci = (ci + 1) % city.length; city[ci].classList.add('on'); }, 4000);

  /* ---------- real clinic reels: click to play with sound (one at a time) ---------- */
  $$('.reel').forEach(function (r) {
    var v = $('video', r), b = $('.reel__p', r), play = b.innerHTML;
    var pauseIco = '<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="21" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M17 15h3.5v14H17zM23.5 15H27v14h-3.5z" fill="currentColor"/></svg>';
    function stop() { v.pause(); r.classList.remove('playing'); b.innerHTML = play; }
    function toggle() {
      if (!v.src) v.src = v.dataset.src;
      if (v.paused) { $$('.reel.playing').forEach(function (o) { if (o !== r) { $('video', o).pause(); o.classList.remove('playing'); $('.reel__p', o).innerHTML = play; } }); v.muted = false; v.play().catch(function () {}); r.classList.add('playing'); b.innerHTML = pauseIco; if (v.textTracks[0]) v.textTracks[0].mode = 'showing'; }
      else stop();
    }
    b.addEventListener('click', toggle); v.addEventListener('click', toggle); v.addEventListener('ended', stop);
  });
})();
