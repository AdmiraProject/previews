/* Enlace Visual — shared runtime: video autoplay-on-load/visible, scroll reveal, Luuna-style video coverflow,
 * review cards with channel logos. Versions style everything; this file only adds behaviour + markup. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var A = (document.querySelector('meta[name=ev-assets]') || {}).content || '../assets/';
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  document.documentElement.classList.add('js');

  /* ---------- channel marks (official colours) ---------- */
  var ICON = {
    google: '<svg viewBox="0 0 24 24" aria-label="Google"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" aria-label="Facebook"><circle cx="12" cy="12" r="12" fill="#0866FF"/><path fill="#fff" d="M16.7 15.5l.5-3.5h-3.3V9.8c0-1 .5-1.9 2-1.9h1.5v-3s-1.4-.2-2.7-.2c-2.7 0-4.5 1.7-4.5 4.7V12H7.2v3.5h3v8.4a12 12 0 0 0 3.7 0v-8.4z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-label="Instagram"><defs><radialGradient id="igg" cx="30%" cy="107%" r="150%"><stop offset="0" stop-color="#fdf497"/><stop offset=".05" stop-color="#fdf497"/><stop offset=".45" stop-color="#fd5949"/><stop offset=".6" stop-color="#d6249f"/><stop offset=".9" stop-color="#285AEB"/></radialGradient></defs><rect width="24" height="24" rx="6" fill="url(#igg)"/><rect x="5" y="5" width="14" height="14" rx="4.2" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="12" r="3.4" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="16.4" cy="7.6" r="1.1" fill="#fff"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-label="TikTok"><rect width="24" height="24" rx="6" fill="#000"/><path fill="#25F4EE" d="M10.3 10.6v-.8a5.6 5.6 0 0 0-.8 0 4.3 4.3 0 0 0-2.4 7.9 4.3 4.3 0 0 1 3.2-7.1z"/><path fill="#FE2C55" d="M10.4 16.9a2 2 0 0 0 2-1.9V5.3h1.7a3.3 3.3 0 0 1 0-.6h-2.4v9.7a2 2 0 0 1-2 1.9 2 2 0 0 1-.9-.2 2 2 0 0 0 1.6.8zm6.9-8.4v-.8a3.3 3.3 0 0 1-1.8-.5 3.3 3.3 0 0 0 1.8 1.3z"/><path fill="#fff" d="M15.5 7.2a3.3 3.3 0 0 1-.8-2.2h-.6a3.3 3.3 0 0 0 1.4 2.2zm-5.1 4.1a2 2 0 0 0-.9 3.7 2 2 0 0 1 1.7-3.2l.6.1V9.4h-.6a4.3 4.3 0 0 0-.8 0zm6.9-2.8V11a5.6 5.6 0 0 1-3.3-1v4.4a4.3 4.3 0 0 1-6.8 3.5 4.3 4.3 0 0 0 7.5-2.9V10.6a5.6 5.6 0 0 0 3.3 1V9.4a3.3 3.3 0 0 1-.7-.9z"/></svg>',
    doctoralia: '<svg viewBox="0 0 24 24" aria-label="Doctoralia"><rect width="24" height="24" rx="6" fill="#00C3A5"/><path fill="#fff" d="M7 6h4.6c3.6 0 6 2.4 6 6s-2.4 6-6 6H7zm2.6 2.4v7.2h1.9c2.1 0 3.4-1.4 3.4-3.6s-1.3-3.6-3.4-3.6z"/></svg>'
  };
  var NAME = { google: 'Google', facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', doctoralia: 'Doctoralia' };
  var STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z"/></svg>';
  var stars = function (n) { var s = ''; for (var i = 0; i < (n || 5); i++) s += STAR; return '<span class="ev-stars" role="img" aria-label="' + (LANG === 'en' ? '5 out of 5 stars' : '5 de 5 estrellas') + '">' + s + '</span>'; };
  window.EV = { ICON: ICON, NAME: NAME, stars: stars, LANG: LANG, A: A, esc: esc };

  /* ---------- review cards: [data-reviews="wall|row"] ---------- */
  function card(r) {
    var p = A + 'people/' + r.id + '-a.webp';
    return '<article class="ev-rc"><header><img class="ev-av" src="' + p + '" alt="" loading="lazy" width="48" height="48"><div class="ev-who"><b>' + esc(r.name) + '</b><small>' + esc(r.proc[LANG]) + '</small></div><span class="ev-src" title="' + NAME[r.src] + '">' + ICON[r.src] + '</span></header>' +
      '<div class="ev-meta">' + stars(5) + '<time>' + esc(r.when[LANG]) + '</time></div><p>“' + esc(r.q[LANG]) + '”</p></article>';
  }
  $$('[data-reviews]').forEach(function (el) {
    var D = window.EV_REVIEWS; if (!D) return;
    el.innerHTML = D.cards.map(card).join('');
  });

  /* ---------- Luuna-style video coverflow: [data-cf] ---------- */
  $$('[data-cf]').forEach(function (cf) {
    var D = window.EV_REVIEWS; if (!D) return;
    var lab = LANG === 'en' ? { p: 'Previous', n: 'Next', play: 'Play testimonial from ' } : { p: 'Anterior', n: 'Siguiente', play: 'Ver testimonio de ' };
    cf.innerHTML = '<div class="cf-track">' + D.videos.map(function (v, i) {
      return '<figure class="cf-c" data-i="' + i + '" tabindex="0" role="button" aria-label="' + lab.play + esc(v.name) + '">' +
        '<video muted loop playsinline preload="metadata" poster="' + A + 'people/' + v.id + '-v.webp"><source src="' + A + 'video/t-' + v.id + '.mp4" type="video/mp4"></video>' +
        '<span class="cf-pb" aria-hidden="true"></span>' +
        '<figcaption><span class="cf-q">“' + esc(v.q[LANG]) + '”</span><b>' + esc(v.name) + '</b><small>' + esc(v.proc[LANG]) + '</small></figcaption></figure>';
    }).join('') + '</div><button class="cf-a l" type="button" aria-label="' + lab.p + '"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button><button class="cf-a r" type="button" aria-label="' + lab.n + '"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button>';
    var cards = $$('.cf-c', cf), ci = Math.min(1, cards.length - 1), n = cards.length;
    function layout() {
      var w = cf.clientWidth, mob = w < 700;
      // Luuna measures: centre 320×450, sides 250×350, 20px gap (mobile scales ×0.78)
      var k = mob ? .78 : 1, cw = 320 * k, sw = 250 * k, gap = 20 * k;
      cards.forEach(function (c, i) {
        var d = i - ci; if (d > n / 2) d -= n; if (d < -n / 2) d += n;
        var ad = Math.abs(d), x = d === 0 ? 0 : Math.sign(d) * (cw / 2 + gap + sw / 2 + (ad - 1) * (sw + gap));
        c.classList.toggle('on', d === 0);
        c.style.transform = 'translate(calc(-50% + ' + x + 'px), -50%) scale(' + (d === 0 ? 1 : 1) + ')';
        c.style.opacity = ad > 3 ? 0 : 1; c.style.zIndex = 10 - ad; c.style.pointerEvents = ad > 3 ? 'none' : '';
        var v = $('video', c);
        if (!RM && ad <= 2) { if (v.paused) v.play().catch(function () {}); } else v.pause();
      });
    }
    cf.addEventListener('click', function (e) {
      if (e.target.closest('.cf-a.l')) { ci = (ci - 1 + n) % n; return layout(); }
      if (e.target.closest('.cf-a.r')) { ci = (ci + 1) % n; return layout(); }
      var c = e.target.closest('.cf-c'); if (!c) return;
      if (+c.dataset.i !== ci) { ci = +c.dataset.i; layout(); }
      else { var v = $('video', c); c.classList.toggle('paused'); if (v.paused) v.play().catch(function () {}); else v.pause(); }
    });
    cf.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') { ci = (ci - 1 + n) % n; layout(); } if (e.key === 'ArrowRight') { ci = (ci + 1) % n; layout(); } if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.cf-c')) { e.preventDefault(); e.target.click(); } });
    var sx = null; cf.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    cf.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) { ci = (ci + (dx < 0 ? 1 : -1) + n) % n; layout(); } sx = null; });
    layout(); addEventListener('resize', layout);
  });

  /* ---------- background/inline videos: play on load when visible, pause off-screen ---------- */
  var vids = $$('video[data-auto]');
  vids.forEach(function (v) { v.muted = true; v.playsInline = true; v.setAttribute('muted', ''); if (RM) { v.removeAttribute('autoplay'); v.pause(); } });
  if (!RM && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { var v = e.target; if (e.isIntersecting) { var p = v.play(); if (p) p.catch(function () {}); v.classList.add('playing'); } else v.pause(); }); }, { threshold: .15 });
    vids.forEach(function (v) { io.observe(v); });
  }

  /* ---------- scroll reveal: [data-reveal] (+ data-reveal-stagger on parent) ---------- */
  var rv = $$('[data-reveal]');
  if (RM || !('IntersectionObserver' in window)) { rv.forEach(function (e) { e.classList.add('in'); }); }
  else {
    $$('[data-stagger]').forEach(function (p) { var st = +p.dataset.stagger || 80; $$('[data-reveal]', p).forEach(function (c, i) { c.style.transitionDelay = (i * st) + 'ms'; }); });
    var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    rv.forEach(function (e) { ro.observe(e); });
  }
})();
