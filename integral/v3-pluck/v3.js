/* Integral Design · v3 (Pluck structure). Plain JS, no dependencies. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqDesk = window.matchMedia('(min-width: 1001px)');

  /* ── Header: fixed compact state after the masthead scrolls away (desktop only) ── */
  var hd = document.querySelector('.hd');
  var toTop = document.querySelector('.totop');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (hd) hd.classList.toggle('is-fixed', mqDesk.matches && y > 160);
    if (toTop) toTop.classList.toggle('is-on', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ── Mobile menu (accordion) ── */
  var burger = document.querySelector('.hd__burger');
  var menu = document.getElementById('menu');
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('click', function (e) {
      var t = e.target.closest('.nav__toggle');
      if (t) {
        var sub = t.parentNode.querySelector('.sub');
        var open = !sub.classList.contains('is-open');
        sub.classList.toggle('is-open', open);
        t.setAttribute('aria-expanded', String(open));
        return;
      }
      if (e.target.closest('a')) closeMenu();
    });
  }

  /* ── Crossfade slideshows (Slick fade: hold 4000ms, fade 300ms, no pause on hover) ── */
  document.querySelectorAll('[data-fade]').forEach(function (stage) {
    var slides = Array.prototype.slice.call(stage.querySelectorAll(':scope > .hero__slide, :scope > .fade__slide'));
    if (slides.length < 2) return;
    var hold = +stage.getAttribute('data-hold') || 4000;
    var idx = 0, timer = null, visible = true;
    var dotsUl = stage.querySelector('.dots');
    var dots = [];
    if (dotsUl) {
      slides.forEach(function (s, i) {
        var li = document.createElement('li');
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Foto ' + (i + 1) + ' de ' + slides.length);
        b.addEventListener('click', function () { go(i); restart(); });
        li.appendChild(b); dotsUl.appendChild(li); dots.push(li);
      });
    }
    function syncVideo() {
      slides.forEach(function (s, i) {
        var v = s.querySelector('video');
        if (!v) return;
        if (i === idx && visible && !reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }
    function go(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        s.classList.toggle('is-active', k === idx);
        var img = s.querySelector('img[loading="lazy"]');
        if (img && (k === idx || k === (idx + 1) % slides.length)) img.loading = 'eager';
      });
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === idx); });
      syncVideo();
    }
    function restart() {
      clearInterval(timer);
      if (reduce) return;
      timer = setInterval(function () { if (visible && !document.hidden) go(idx + 1); }, hold);
    }
    // swipe / drag (Slick draggable)
    var x0 = null;
    stage.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    stage.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; syncVideo(); }, { threshold: 0.15 }).observe(stage);
    }
    go(0); restart();
  });

  /* ── Videos: play only while on screen ── */
  var vids = Array.prototype.slice.call(document.querySelectorAll('.row__media video, .reel video'));
  if (reduce) {
    vids.forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.2 });
    vids.forEach(function (v) { v.pause(); io.observe(v); });
  }

  /* ── Reels row: arrows page 4 at a time on desktop ── */
  var track = document.querySelector('.reels__track');
  var cur = document.querySelector('.reels__cur');
  var tot = document.querySelector('.reels__tot');
  var arws = document.querySelectorAll('.reels__arw');
  function pageInfo() {
    var item = track.querySelector('.reel');
    var per = Math.max(1, Math.round(track.clientWidth / item.offsetWidth));
    var pages = Math.ceil(track.children.length / per);
    var page = Math.round(track.scrollLeft / (item.offsetWidth * per));
    return { per: per, pages: pages, page: Math.min(page, pages - 1), w: item.offsetWidth };
  }
  function syncPager() {
    if (!track) return;
    var p = pageInfo();
    if (cur) cur.textContent = p.page + 1;
    if (tot) tot.textContent = p.pages;
    arws[0].disabled = p.page <= 0;
    arws[1].disabled = p.page >= p.pages - 1;
  }
  if (track) {
    arws.forEach(function (b) {
      b.addEventListener('click', function () {
        var p = pageInfo();
        var next = Math.max(0, Math.min(p.pages - 1, p.page + (+b.getAttribute('data-dir'))));
        track.scrollTo({ left: next * p.w * p.per, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    var st;
    track.addEventListener('scroll', function () { clearTimeout(st); st = setTimeout(syncPager, 60); }, { passive: true });
    window.addEventListener('resize', syncPager);
    syncPager();
  }

  /* ── Reel lightbox ── */
  var lb = document.querySelector('.lb');
  var lbv = lb && lb.querySelector('.lb__v');
  var lastReel = null;
  function lbOpen(a) {
    lastReel = a;
    var v = a.querySelector('video');
    lbv.poster = v.getAttribute('poster');
    lbv.src = a.getAttribute('href');
    lb.hidden = false;
    document.documentElement.classList.add('lb-open');
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    document.documentElement.style.overflow = 'hidden';
    var p = lbv.play(); if (p && p.catch) p.catch(function () {});
    lb.querySelector('.lb__x').focus({ preventScroll: true });
  }
  function lbClose() {
    lb.classList.remove('is-open');
    document.documentElement.classList.remove('lb-open');
    lbv.pause();
    document.documentElement.style.overflow = '';
    setTimeout(function () { lb.hidden = true; lbv.removeAttribute('src'); lbv.load(); }, reduce ? 0 : 300);
    if (lastReel) lastReel.focus({ preventScroll: true });
  }
  if (lb) {
    document.querySelectorAll('.reel').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); lbOpen(a); });
    });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.closest('.lb__x')) lbClose();
      else if (e.target === lbv) { if (lbv.paused) lbv.play(); else lbv.pause(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lb.hidden) lbClose();
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ── Footer box: phone → lead popup (pre-filled) → WhatsApp ── */
  var box = document.querySelector('.ft__box');
  if (box) {
    box.addEventListener('submit', function (e) {
      e.preventDefault();
      var tel = box.tel.value.trim();
      try {
        var saved = JSON.parse(localStorage.getItem('id_lead') || '{}');
        if (tel) saved.telefono = tel;
        localStorage.setItem('id_lead', JSON.stringify(saved));
      } catch (err) {}
      if (window.IDLead) {
        window.IDLead.open('Quiero cotizar mi cocina a la medida');
        var f = document.querySelector('.lead input[name="telefono"]');
        if (f && tel) f.value = tel;
      }
    });
  }
})();
