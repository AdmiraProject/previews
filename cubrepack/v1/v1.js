/* Cubre Pack v1 — interactions (FrogTape structure). No dependencies. */
(function () {
  var d = document, html = d.documentElement;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- videos: play when visible, fade in when playing ---------- */
  var vids = $$('.media > video');
  function canPlay(v) {
    if (RM || !v._vis) return false;
    var s = v.closest('.hs-slide'); if (s && !s.classList.contains('is-active')) return false;
    var c = v.closest('.pj'); if (c && !c.classList.contains('is-active')) return false;
    return true;
  }
  function sync(v) {
    if (canPlay(v)) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    else if (!v.paused) v.pause();
  }
  window.CPsyncVideos = function () { vids.forEach(sync); };
  vids.forEach(function (v) {
    v.muted = true;
    v.addEventListener('playing', function () { v.classList.add('on'); });
  });
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target._vis = e.isIntersecting; sync(e.target); });
    }, { rootMargin: '120px 0px' });
    vids.forEach(function (v) { vio.observe(v); });
  } else vids.forEach(function (v) { v._vis = true; sync(v); });

  /* ---------- reveal on scroll ---------- */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window && !RM) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    rv.forEach(function (el) { rio.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  /* ---------- sticky nav ---------- */
  var nav = $('.nav'), bar = $('.persona');
  function onScroll() { nav.classList.toggle('is-fixed', scrollY > (bar ? bar.offsetHeight : 0) + 2); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- desktop dropdowns ---------- */
  var items = $$('.nv-item'), closeT;
  function setOpen(it) {
    items.forEach(function (x) {
      var on = x === it; x.classList.toggle('is-open', on);
      var b = $('.nv-caret', x); if (b) b.setAttribute('aria-expanded', on);
    });
    nav.classList.toggle('has-open', !!it);
    if (it) placePanel(it);
  }
  function placePanel(it) {
    var p = $('.panel', it); if (!p) return;
    p.style.marginLeft = '0px';
    var r = p.getBoundingClientRect(), pad = 16, shift = 0;
    if (r.left < pad) shift = pad - r.left; else if (r.right > innerWidth - pad) shift = innerWidth - pad - r.right;
    p.style.marginLeft = shift + 'px';
    p.style.setProperty('--notch', 'calc(50% - ' + shift + 'px)');
  }
  items.forEach(function (it) {
    var b = $('.nv-caret', it);
    b.addEventListener('click', function (e) { e.stopPropagation(); setOpen(it.classList.contains('is-open') ? null : it); });
    it.addEventListener('mouseenter', function (e) { if (matchMedia('(hover:hover)').matches) { clearTimeout(closeT); setOpen(it); } });
    it.addEventListener('mouseleave', function () { if (matchMedia('(hover:hover)').matches) closeT = setTimeout(function () { setOpen(null); }, 160); });
    $$('a,button', $('.panel', it)).forEach(function (a) { a.addEventListener('click', function () { setOpen(null); }); });
  });
  d.addEventListener('click', function (e) {
    if (!e.target.closest('.nv-item')) setOpen(null);
    if (!e.target.closest('.search-pop,.nv-search,.dr-search')) closeSearch();
  });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setOpen(null); closeSearch(); setDrawer(false); closeVideo(); }
  });

  /* ---------- mobile drawer ---------- */
  var burger = $('.burger');
  function setDrawer(on) {
    nav.classList.toggle('m-open', on); if (burger) burger.setAttribute('aria-expanded', on);
  }
  if (burger) burger.addEventListener('click', function () { setDrawer(!nav.classList.contains('m-open')); });
  $$('.dr-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var row = b.parentNode, on = !row.classList.contains('is-open');
      $$('.dr-row').forEach(function (r) { r.classList.remove('is-open'); var x = $('.dr-btn', r); x && x.setAttribute('aria-expanded', false); });
      row.classList.toggle('is-open', on); b.setAttribute('aria-expanded', on);
    });
  });
  $$('.drawer a, .drawer [data-lead], .drawer [data-video], .scrim').forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); }); });

  /* ---------- hero slider ---------- */
  var hs = $('.hs'), slides = $$('.hs-slide'), dots = $$('.hs-dots button'), cur = 0, timer, busy = false;
  function paint(n) {
    dots.forEach(function (b, i) { b.setAttribute('aria-current', i === n ? 'true' : 'false'); });
    slides.forEach(function (s, i) { s.setAttribute('aria-hidden', i !== n); s.inert = i !== n; });
  }
  function go(n, dir, instant) {
    n = (n + slides.length) % slides.length;
    if (n === cur || busy) return;
    dir = dir || (n > cur ? 1 : -1);
    var a = slides[cur], b = slides[n], off = 'calc(' + (dir * 100) + '% + ' + (dir * 32) + 'px)';
    if (instant || RM) {
      a.classList.remove('is-active'); b.classList.add('is-active'); b.style.transform = '';
    } else {
      busy = true;
      b.style.transition = 'none'; b.style.transform = 'translateX(' + off + ')'; b.classList.add('is-active');
      void b.offsetWidth;
      b.style.transition = ''; a.classList.add('is-out');
      a.style.transform = 'translateX(calc(' + (-dir * 100) + '% - ' + (dir * 32) + 'px))'; b.style.transform = 'translateX(0)';
      setTimeout(function () { a.classList.remove('is-active', 'is-out'); a.style.transform = ''; busy = false; }, 720);
      a.classList.remove('is-active');
    }
    cur = n; paint(n); window.CPsyncVideos();
  }
  function auto() { clearInterval(timer); if (!RM) timer = setInterval(function () { go(cur + 1, 1); }, 7000); }
  if (hs && slides.length) {
    paint(0); auto();
    dots.forEach(function (b, i) { b.addEventListener('click', function () { go(i); auto(); }); });
    hs.addEventListener('mouseenter', function () { clearInterval(timer); });
    hs.addEventListener('mouseleave', auto);
    var sx = null, sy = 0;
    hs.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; });
    hs.addEventListener('pointerup', function (e) {
      if (sx === null) return; var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { go(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); auto(); }
    });
    hs.addEventListener('pointercancel', function () { sx = null; });
    hs.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }
  window.CPhero = function (n) { go(n, 0, true); auto(); };

  /* ---------- product carousels ---------- */
  var catSel = $('.cat-sel'), tracks = $$('.car-track'), car = $('.car'), fill = $('.prog-f');
  var prev = $('.car-prev'), next = $('.car-next');
  function active() { return tracks.filter(function (t) { return !t.hidden; })[0]; }
  function metrics(t) {
    var c = t.children[0]; if (!c) return null;
    var gap = parseFloat(getComputedStyle(t).columnGap) || 0, w = c.getBoundingClientRect().width + gap;
    var pp = Math.max(1, Math.floor((t.clientWidth + gap + 2) / w)), max = Math.max(0, t.children.length - pp);
    return { w: w, max: max, i: Math.min(max, Math.round(t.scrollLeft / w)) };
  }
  function progress() {
    var t = active(); if (!t) return; var m = metrics(t); if (!m) return;
    var atEnd = t.scrollLeft + t.clientWidth >= t.scrollWidth - 4;
    var i = atEnd ? m.max : m.i;
    fill.style.width = ((i + 1) / (m.max + 1) * 100) + '%';
    if (prev) prev.disabled = t.scrollLeft < 4;
    if (next) next.disabled = atEnd;
  }
  function autosize() {
    if (!catSel) return;
    var s = d.createElement('span'), cs = getComputedStyle(catSel);
    s.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily + ';letter-spacing:' + cs.letterSpacing;
    s.textContent = catSel.options[catSel.selectedIndex].text; d.body.appendChild(s);
    catSel.style.width = Math.min(s.getBoundingClientRect().width + parseFloat(cs.fontSize) * 1.05, catSel.parentNode.clientWidth) + 'px';
    s.remove();
  }
  function showCat(key, first) {
    if (catSel && catSel.value !== key) catSel.value = key;
    tracks.forEach(function (t) {
      t.hidden = t.dataset.cat !== key;
      if (!t.hidden && first) { var c = $('[data-prod="' + first + '"]', t); if (c && c !== t.firstElementChild) t.insertBefore(c, t.firstElementChild); }
      if (!t.hidden) t.scrollLeft = 0;
    });
    autosize(); progress();
  }
  window.CPcat = showCat;
  if (catSel) {
    catSel.addEventListener('change', function () { showCat(catSel.value); });
    tracks.forEach(function (t) {
      t.addEventListener('scroll', function () { requestAnimationFrame(progress); }, { passive: true });
      // mouse drag (touch uses native scroll)
      var down = false, x0 = 0, l0 = 0, moved = false;
      t.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        down = true; moved = false; x0 = e.clientX; l0 = t.scrollLeft;
      });
      addEventListener('pointermove', function (e) {
        if (!down) return; var dx = e.clientX - x0;
        if (!moved && Math.abs(dx) > 6) { moved = true; t.classList.add('is-drag'); }
        if (moved) t.scrollLeft = l0 - dx;
      });
      addEventListener('pointerup', function () {
        if (!down) return; down = false;
        if (moved) {
          var m = metrics(t), target = Math.round(t.scrollLeft / m.w) * m.w;
          t.classList.remove('is-drag'); t.scrollLeft = t.scrollLeft;
          t.scrollTo({ left: target, behavior: RM ? 'auto' : 'smooth' });
          setTimeout(function () { moved = false; }, 0);
        }
      });
      t.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
      t.addEventListener('dragstart', function (e) { e.preventDefault(); });
    });
    function step(dir) { var t = active(), m = metrics(t); t.scrollTo({ left: (m.i + dir) * m.w, behavior: RM ? 'auto' : 'smooth' }); }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    addEventListener('resize', function () { autosize(); progress(); });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { autosize(); progress(); });
    autosize(); progress();
  }

  /* ---------- nav product links → select category + scroll ---------- */
  $$('[data-goto-cat]').forEach(function (a) {
    a.addEventListener('click', function () { showCat(a.dataset.gotoCat, a.dataset.prod); });
  });

  /* ---------- band tabs ---------- */
  var tabs = $$('.tab'), cards = $$('.pj');
  function setTab(n) {
    tabs.forEach(function (t, i) { t.setAttribute('aria-selected', i === n); t.tabIndex = i === n ? 0 : -1; });
    cards.forEach(function (c, i) { c.classList.toggle('is-active', i === n); c.setAttribute('aria-hidden', i !== n); c.inert = i !== n; });
    var t = tabs[n]; if (t && t.parentNode.scrollWidth > t.parentNode.clientWidth) {
      var ul = t.parentNode.parentNode.closest('.tabs') || t.closest('.tabs');
      ul.scrollTo({ left: t.offsetLeft - 24, behavior: RM ? 'auto' : 'smooth' });
    }
    window.CPsyncVideos();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { setTab(i); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; setTab(n); tabs[n].focus(); }
    });
  });
  $$('[data-goto-tab]').forEach(function (a) { a.addEventListener('click', function () { setTab(+a.dataset.gotoTab); }); });
  if (tabs.length) setTab(0);

  /* ---------- persona bar ---------- */
  var role = $('#p-role'), surf = $('#p-surf');
  var MAP = { pisos: [0, 'pisos'], vidrio: [1, 'superficies', 'vidrio'], alfombra: [1, 'superficies', 'alfombra'], nuevo: [2, 'pisos'] };
  function applySurf(v, instant) {
    var m = MAP[v]; if (!m) return;
    if (window.CPhero) go(m[0], 0, instant);
    showCat(m[1], m[2]);
    if (v === 'alfombra' || v === 'vidrio') setTab(0);
  }
  if (role) {
    var r0 = store.get('cp_role'); if (r0 && $$('option', role).some(function (o) { return o.value === r0; })) role.value = r0;
    window.CP_ROLE = role.value;
    role.addEventListener('change', function () { window.CP_ROLE = role.value; store.set('cp_role', role.value); });
  }
  if (surf) {
    var s0 = store.get('cp_surf'); if (s0 && MAP[s0]) { surf.value = s0; applySurf(s0, true); }
    surf.addEventListener('change', function () {
      store.set('cp_surf', surf.value);
      bar.style.opacity = '.5'; setTimeout(function () { bar.style.opacity = ''; }, 260);
      applySurf(surf.value, false); auto();
    });
  }

  /* ---------- search ---------- */
  var sBtn = $('.nv-search'), sPop = $('.search-pop'), sIn = sPop && $('input', sPop), sList = sPop && $('ul', sPop);
  var prods = $$('.pc').map(function (c) { return { id: c.dataset.prod, cat: c.parentNode.dataset.cat, name: $('h3', c).textContent, img: $('.pc-img img', c).getAttribute('src'), txt: (c.textContent + ' ' + (c.dataset.k || '')).toLowerCase() }; });
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function renderSearch() {
    var q = norm(sIn.value.trim());
    var hit = prods.filter(function (p) { return !q || norm(p.txt).indexOf(q) > -1; });
    sList.innerHTML = hit.length ? hit.map(function (p) { return '<li><button type="button" data-id="' + p.id + '" data-cat="' + p.cat + '"><img src="' + p.img + '" alt="">' + p.name + '</button></li>'; }).join('') : '<li class="none">' + sPop.dataset.none + '</li>';
  }
  function closeSearch() { if (sPop) { sPop.classList.remove('is-open'); sBtn.setAttribute('aria-expanded', false); } }
  if (sBtn && sPop) {
    var toggleSearch = function (e, force) {
      e.stopPropagation(); setOpen(null);
      var on = force || !sPop.classList.contains('is-open'); sPop.classList.toggle('is-open', on); sBtn.setAttribute('aria-expanded', on);
      if (on) { renderSearch(); sIn.focus({ preventScroll: true }); }
    };
    sBtn.addEventListener('click', toggleSearch);
    var ds = $('.dr-search'); if (ds) ds.addEventListener('click', function (e) { setDrawer(false); toggleSearch(e, true); });
    sIn.addEventListener('input', renderSearch);
    sList.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      closeSearch(); showCat(b.dataset.cat, b.dataset.id);
      $('#productos').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
    });
  }

  /* ---------- video modal ---------- */
  var vm = $('.vm'), vmv = vm && $('video', vm), lastF;
  function openVideo() {
    if (!vm) return; lastF = d.activeElement; vm.hidden = false; html.classList.add('lf-lock');
    if (!vmv.getAttribute('src')) vmv.setAttribute('src', vmv.dataset.src);
    var p = vmv.play(); if (p && p.catch) p.catch(function () {});
    $('.vm-x', vm).focus();
  }
  function closeVideo() {
    if (!vm || vm.hidden) return; vmv.pause(); vm.hidden = true; html.classList.remove('lf-lock');
    if (lastF && lastF.focus) lastF.focus({ preventScroll: true });
  }
  $$('[data-video]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); openVideo(); }); });
  if (vm) $$('[data-vclose]', vm).forEach(function (b) { b.addEventListener('click', closeVideo); });

  /* ---------- sample form in footer ---------- */
  var nf = $('.news-f');
  if (nf) nf.addEventListener('submit', function (e) {
    e.preventDefault();
    if (window.CPLead) window.CPLead.open({ need: 'muestra', role: window.CP_ROLE || '' });
  });
})();
