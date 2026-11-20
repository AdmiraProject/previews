/* Enlace Visual v3 — page behaviour (Sofía interactions): click-to-open mega menus, mobile accordion menu,
 * seamless marquees (40 px/s), tab cross-fade (out 100 ms / in 300 ms), review-row arrows + drag.
 * Booking (book.js) and video/coverflow/reviews (core.js) are shared runtime files. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- desktop mega menus: click to open, one at a time, instant ---------- */
  var dds = $$('.dd-b');
  function closeAll(except) {
    dds.forEach(function (b) { if (b === except) return; b.setAttribute('aria-expanded', 'false'); var p = document.getElementById(b.getAttribute('aria-controls')); if (p) p.hidden = true; });
  }
  dds.forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = b.getAttribute('aria-expanded') === 'true';
      closeAll(b);
      b.setAttribute('aria-expanded', String(!open));
      document.getElementById(b.getAttribute('aria-controls')).hidden = open;
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.mm-c') || e.target.closest('a')) closeAll();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var o = $('.dd-b[aria-expanded=true]'); closeAll(); if (o) o.focus();
    if (burger && burger.getAttribute('aria-expanded') === 'true') toggleMob(false);
  });

  /* ---------- mobile full-screen accordion menu ---------- */
  var burger = $('.burger'), mob = $('#mob');
  function toggleMob(on) {
    if (!burger) return;
    burger.setAttribute('aria-expanded', String(on));
    burger.setAttribute('aria-label', on ? burger.dataset.close : burger.dataset.open);
    document.documentElement.classList.toggle('mob-open', on);
    if (on) { mob.hidden = false; requestAnimationFrame(function () { mob.classList.add('on'); }); }
    else { mob.classList.remove('on'); setTimeout(function () { if (!mob.classList.contains('on')) mob.hidden = true; }, RM ? 0 : 400); }
  }
  if (burger) {
    burger.addEventListener('click', function () { toggleMob(burger.getAttribute('aria-expanded') !== 'true'); });
    mob.addEventListener('click', function (e) {
      var b = e.target.closest('.mob-b');
      if (b) {
        var on = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', String(on));
        document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
        return;
      }
      if (e.target.closest('a')) toggleMob(false);
    });
    addEventListener('resize', function () { if (innerWidth >= 1200 && burger.getAttribute('aria-expanded') === 'true') toggleMob(false); });
  }

  /* ---------- seamless marquees: two identical sets, translate −50% at 40 px/s ---------- */
  var mqs = $$('[data-mq]');
  function sizeMq() {
    mqs.forEach(function (m) {
      var s = $('.mq-s', m); if (!s) return;
      var w = s.getBoundingClientRect().width;
      if (w) m.querySelector('.mq-t').style.setProperty('--d', (w / 40).toFixed(2) + 's');
    });
  }
  sizeMq();
  addEventListener('load', sizeMq);
  addEventListener('resize', sizeMq);
  $$('[data-mq] img').forEach(function (i) { if (!i.complete) i.addEventListener('load', sizeMq, { once: true }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeMq);

  /* ---------- tabs: Webflow cross-fade (out 100 ms, in 300 ms, ease) ---------- */
  $$('[data-tabs]').forEach(function (t) {
    var tabs = $$('[role=tab]', t), busy = false;
    function show(i, focus) {
      var cur = tabs.findIndex(function (x) { return x.getAttribute('aria-selected') === 'true'; });
      if (i === cur || busy) return;
      tabs.forEach(function (x, k) { x.setAttribute('aria-selected', String(k === i)); x.tabIndex = k === i ? 0 : -1; });
      if (focus) tabs[i].focus();
      var a = document.getElementById(tabs[cur].getAttribute('aria-controls')), b = document.getElementById(tabs[i].getAttribute('aria-controls'));
      if (RM) { a.hidden = true; b.hidden = false; return; }
      busy = true; a.classList.remove('fin'); a.classList.add('out');
      setTimeout(function () { a.hidden = true; a.classList.remove('out'); b.hidden = false; b.classList.remove('fin'); void b.offsetWidth; b.classList.add('fin'); busy = false; }, 100);
    }
    tabs.forEach(function (x, i) {
      x.addEventListener('click', function () { show(i); });
      x.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); show((i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length, true); }
      });
    });
  });

  /* ---------- review row: arrows + mouse drag ---------- */
  var row = $('.rv-row');
  if (row) {
    var la = $('.rv-l'), ra = $('.rv-r');
    var step = function () { var c = $('.ev-rc', row); return c ? c.getBoundingClientRect().width + 20 : 340; };
    var upd = function () { la.disabled = row.scrollLeft < 4; ra.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4; };
    la.addEventListener('click', function () { row.scrollBy({ left: -step(), behavior: RM ? 'auto' : 'smooth' }); });
    ra.addEventListener('click', function () { row.scrollBy({ left: step(), behavior: RM ? 'auto' : 'smooth' }); });
    row.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); setTimeout(upd, 300);
    var sx = 0, sl = 0, down = false, moved = false;
    row.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = row.scrollLeft; });
    addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; row.classList.add('drag'); } row.scrollLeft = sl - dx; });
    addEventListener('pointerup', function () { if (!down) return; down = false; row.classList.remove('drag'); });
    row.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  }
})();
