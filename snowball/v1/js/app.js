/* Snowball Partners v1 · interactions and motion (no dependencies except optional Lenis from CDN) */
(function () {
  'use strict';
  var d = document, root = d.documentElement, w = window;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var reduced = w.matchMedia('(prefers-reduced-motion: reduce)');
  var desktop = w.matchMedia('(min-width: 1024px)');
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var safe = function (name, fn) { try { fn(); } catch (e) { if (w.console) console.warn('[v1] ' + name, e); } };
  var onScroll = [];
  var onResize = [];

  /* ---------- smooth scroll (Lenis) */
  var lenis = null;
  safe('lenis', function () {
    if (reduced.matches || typeof w.Lenis !== 'function') return;
    lenis = new w.Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    w.__lenis = lenis;
    var raf = function (t) { lenis.raf(t); w.requestAnimationFrame(raf); };
    w.requestAnimationFrame(raf);
  });
  safe('anchors', function () {
    d.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.hasAttribute('data-book')) return;
      var id = a.getAttribute('href').slice(1);
      var t = id ? d.getElementById(id) : null;
      if (!t) return;
      e.preventDefault();
      closeMenu();
      var y = id === 'top' ? 0 : t.getBoundingClientRect().top + w.pageYOffset - 96;
      if (lenis) lenis.scrollTo(y, { duration: 1.1 });
      else w.scrollTo({ top: y, behavior: reduced.matches ? 'auto' : 'smooth' });
    });
  });

  /* ---------- header: solid bar once scrolled, dropdowns */
  var hdr = $('#hdr');
  safe('header', function () {
    onScroll.push(function (y) { hdr.classList.toggle('is-scrolled', y > 8); });
    var groups = $$('.nav > ul > li').filter(function (li) { return $('.dd', li); });
    // like the benchmark, a closed panel is [hidden] (out of the tab order); it is unhidden first, then faded in
    var shut = function (panel, tog) {
      if (!panel.classList.contains('is-open')) return;
      panel.classList.remove('is-open'); tog.setAttribute('aria-expanded', 'false');
      w.clearTimeout(panel._ht); panel._ht = w.setTimeout(function () { if (!panel.classList.contains('is-open')) panel.hidden = true; }, 140);
    };
    var closeAll = function (except) {
      groups.forEach(function (li) { if (li !== except) shut($('.dd', li), $('.nav__tog', li)); });
    };
    groups.forEach(function (li) {
      var panel = $('.dd', li), tog = $('.nav__tog', li), timer = 0;
      panel.hidden = true;
      var open = function () {
        w.clearTimeout(timer); w.clearTimeout(panel._ht); closeAll(li);
        if (panel.classList.contains('is-open')) return;
        panel.hidden = false; void panel.offsetWidth;
        panel.classList.add('is-open'); tog.setAttribute('aria-expanded', 'true');
      };
      var close = function () { shut(panel, tog); };
      li.addEventListener('mouseenter', open);
      li.addEventListener('mouseleave', function () { timer = w.setTimeout(close, 120); });
      tog.addEventListener('click', function () { if (panel.classList.contains('is-open')) close(); else open(); });
      li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) close(); });
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
    d.addEventListener('click', function (e) { if (!e.target.closest('.nav')) closeAll(); });
  });

  /* ---------- mobile menu */
  var menu = $('#site-menu'), burger = $('.burger');
  var menuOpen = false;
  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
    root.style.overflow = '';
    w.setTimeout(function () { if (!menuOpen) menu.hidden = true; }, 300);
    burger.focus();
  }
  safe('menu', function () {
    var items = $$('.mi, .menu__foot', menu);
    items.forEach(function (el, i) { el.style.setProperty('--md', (80 + i * 50) + 'ms'); });
    var openMenu = function () {
      menuOpen = true;
      menu.hidden = false;
      burger.setAttribute('aria-expanded', 'true');
      if (lenis) lenis.stop();
      root.style.overflow = 'hidden';
      w.requestAnimationFrame(function () { w.requestAnimationFrame(function () { menu.classList.add('is-open'); }); });
      $('.menu__close', menu).focus();
    };
    burger.addEventListener('click', openMenu);
    $('.menu__close', menu).addEventListener('click', closeMenu);
    d.addEventListener('keydown', function (e) {
      if (!menuOpen) return;
      if (e.key === 'Escape') closeMenu();
      if (e.key === 'Tab') {
        var f = $$('a[href], button:not([disabled])', menu).filter(function (el) { return el.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    $$('.mi__tog', menu).forEach(function (b) {
      var acc = d.getElementById(b.getAttribute('aria-controls'));
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', String(open));
        acc.classList.toggle('is-open', open);
      });
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('[data-book]')) closeMenu(); });
    desktop.addEventListener('change', function () { if (desktop.matches) closeMenu(); });
  });

  /* ---------- scroll reveals */
  safe('reveal', function () {
    var els = $$('[data-reveal]');
    $$('[data-reveal=stagger]').forEach(function (el) {
      Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--i', i); });
    });
    var setLines = function () {
      $$('[data-reveal=lines]').forEach(function (el) {
        var line = -1, top = null;
        $$('.mk-word', el).forEach(function (wd) {
          var t = wd.offsetTop;
          if (top === null || Math.abs(t - top) > 4) { line++; top = t; }
          wd.firstElementChild.style.setProperty('--line', line);
        });
      });
    };
    setLines();
    onResize.push(setLines);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(setLines);
    if (reduced.matches || !('IntersectionObserver' in w)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.setAttribute('data-reveal-state', 'shown');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    els.forEach(function (el) { el.setAttribute('data-reveal-state', 'armed'); io.observe(el); });
  });

  /* ---------- hero reel: burst in, then drift */
  safe('reel', function () {
    var reel = $('.reel'); if (!reel) return;
    var btn = $('[data-reel-toggle]');
    var vids = $$('video', reel);
    var userPaused = false, inView = true;
    var syncVideos = function () {
      var fr = reel.getBoundingClientRect();
      var run = inView && !userPaused && !reduced.matches && !d.hidden;
      vids.forEach(function (v) {
        var r = v.getBoundingClientRect();
        var vis = run && r.right > fr.left + 8 && r.left < fr.right - 8 && r.bottom > fr.top && r.top < fr.bottom;
        if (vis && v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else if (!vis && !v.paused) v.pause();
      });
    };
    var applyPause = function () { reel.setAttribute('data-paused', String(userPaused || !inView)); };
    var setPaused = function (p) {
      userPaused = p;
      applyPause();
      if (btn) { btn.setAttribute('aria-pressed', String(p)); btn.setAttribute('aria-label', p ? 'Reanudar el muro de trabajos' : 'Pausar el muro de trabajos'); }
      syncVideos();
    };
    if (btn) btn.addEventListener('click', function () { setPaused(!userPaused); });
    if ('IntersectionObserver' in w) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; applyPause(); syncVideos(); }).observe(reel);
    d.addEventListener('visibilitychange', syncVideos);
    w.setInterval(syncVideos, 700);
    if (reduced.matches) { reel.setAttribute('data-phase', 'static'); setPaused(true); return; }
    var start = function () {
      var fr = reel.getBoundingClientRect();
      var cx = fr.left + fr.width / 2, cy = fr.top + fr.height / 2;
      var rots = [-10, 1, -6, 5, -12, -8, -4, 3, 7, -3, 9, -7];
      var vis = $$('.reel__set:last-child .tile', reel).map(function (t) { return { t: t, r: t.getBoundingClientRect() }; })
        .filter(function (o) { return o.r.left < fr.right && o.r.right > fr.left && o.r.top < fr.bottom && o.r.bottom > fr.top; });
      vis.forEach(function (o, i) {
        o.fx = cx - (o.r.left + o.r.width / 2); o.fy = cy - (o.r.top + o.r.height / 2); o.rot = rots[i % rots.length];
        o.dist = Math.sqrt(o.fx * o.fx + o.fy * o.fy);
      });
      vis.slice().sort(function (a, b) { return a.dist - b.dist; }).forEach(function (o, i) { o.bd = i * 0.032; });
      var maxBd = 0;
      vis.forEach(function (o) {
        o.t.style.cssText += '--fx:' + Math.round(o.fx) + 'px;--fy:' + Math.round(o.fy) + 'px;--r0:' + o.rot + 'deg;--bd:' + o.bd.toFixed(3) + 's;--burst-duration:720ms;';
        o.t.setAttribute('data-burst', 'true');
        maxBd = Math.max(maxBd, o.bd);
      });
      reel.setAttribute('data-phase', 'burst');
      w.setTimeout(function () { reel.setAttribute('data-phase', 'drift'); setPaused(false); }, (maxBd + 0.72) * 1000 + 150);
    };
    // like the benchmark (measured: its burst starts at the load event): wait for load and for the tiles in view to decode,
    // so they are painted while they scale out; capped so a slow image never holds the wall back
    var kick = function () {
      var fr = reel.getBoundingClientRect();
      var media = $$('.reel__set:last-child .tile img', reel).filter(function (im) { var r = im.getBoundingClientRect(); return r.left < fr.right && r.right > fr.left; });
      var waits = media.map(function (im) { return im.decode ? im.decode().catch(function () {}) : Promise.resolve(); });
      var cap = new Promise(function (res) { w.setTimeout(res, 1500); });
      // the benchmark's burst begins at its load event, measured 460 to 890 ms after navigation; ours loads sooner,
      // so it never starts before 800 ms, which lines the burst up with the benchmark's in side-by-side recordings
      Promise.race([Promise.all(waits), cap]).then(function () {
        w.setTimeout(function () { w.requestAnimationFrame(function () { w.requestAnimationFrame(start); }); }, Math.max(0, 800 - w.performance.now()));
      });
    };
    if (d.readyState === 'complete') kick(); else w.addEventListener('load', kick, { once: true });
  });

  /* ---------- logo marquee: runs once seen, pauses off screen, constant speed in px/s */
  safe('marquee', function () {
    var mq = $('.mq'); if (!mq) return;
    var wide = w.matchMedia('(min-width: 768px)');
    var setSpeed = function () {
      var pxs = wide.matches ? 32 : 20;
      $$('.mq__track', mq).forEach(function (t) {
        var half = t.scrollWidth / 2;
        if (half > 0) t.style.setProperty('--dur', (half / pxs).toFixed(2) + 's');
      });
    };
    setSpeed(); onResize.push(setSpeed); w.addEventListener('load', setSpeed);
    if (!('IntersectionObserver' in w)) { mq.setAttribute('data-running', 'true'); mq.setAttribute('data-offscreen', 'false'); return; }
    new IntersectionObserver(function (en) {
      var on = en[0].isIntersecting;
      if (on) mq.setAttribute('data-running', 'true');
      mq.setAttribute('data-offscreen', String(!on));
    }).observe(mq);
  });

  /* ---------- stacked panels */
  safe('stack', function () {
    var stack = $('.stack'); if (!stack) return;
    var panels = $$('[data-stack-panel]', stack);
    var active = false;
    var measure = function () {
      active = desktop.matches && !reduced.matches;
      if (!active) { stack.removeAttribute('data-active'); panels.forEach(function (p) { p.style.cssText = ''; }); return; }
      stack.setAttribute('data-active', '');
      var vh = w.innerHeight;
      panels.forEach(function (p) {
        var top = Math.min(0, vh - p.offsetHeight);
        p.style.setProperty('--stack-top', top + 'px');
        p.style.setProperty('--stack-origin', (-top) + 'px');
      });
      update();
    };
    var update = function () {
      if (!active) return;
      panels.forEach(function (p, i) {
        var next = panels[i + 1], v = 0;
        if (next) { var h = Math.min(p.offsetHeight, w.innerHeight); v = clamp((h - next.getBoundingClientRect().top) / h, 0, 1); }
        p.style.setProperty('--stack-p', v.toFixed(3));
      });
    };
    measure(); onResize.push(measure); onScroll.push(update);
    w.addEventListener('load', measure);
  });

  /* ---------- loop: pause, offscreen pause, active step, dock scale */
  safe('loop', function () {
    var stage = $('.stage'); if (!stage) return;
    var overlay = $('.lp-overlay', stage), btn = $('[data-loop-toggle]', stage);
    var frame = $('.loop__frame'), dock = $('[data-dock]'), parts = $$('.part');
    var userPaused = false, inView = false;
    var sync = function () { overlay.setAttribute('data-state', (userPaused || !inView) ? 'paused' : 'running'); };
    if (btn) btn.addEventListener('click', function () {
      userPaused = !userPaused;
      btn.setAttribute('aria-pressed', String(userPaused));
      btn.setAttribute('aria-label', userPaused ? 'Reanudar la animación del ciclo' : 'Pausar la animación del ciclo');
      sync();
    });
    if ('IntersectionObserver' in w) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; sync(); }).observe(stage); else inView = true;
    sync();
    onScroll.push(function () {
      var vh = w.innerHeight, pinned = desktop.matches && !reduced.matches, cur = null;
      parts.forEach(function (p) { var r = p.getBoundingClientRect(); if (r.top <= vh * 0.5 && r.bottom > vh * 0.5) cur = p.getAttribute('data-part'); });
      if (pinned) {
        var dr = dock.getBoundingClientRect();
        frame.style.setProperty('--dock-p', clamp((vh * 0.631 - dr.top) / (vh * 0.389), 0, 1).toFixed(3));
      }
      if (cur) stage.setAttribute('data-active', cur); else stage.removeAttribute('data-active');
      parts.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-part') === cur); });
      if (parts[0]) parts[0].parentNode.classList.toggle('stage-on', !!cur);
    });
  });

  /* ---------- work tile video */
  safe('tilevideo', function () {
    $$('video[data-autoplay]').forEach(function (v) {
      var btn = v.parentNode.querySelector('[data-vid-toggle]'), userPaused = reduced.matches, vis = false;
      var sync = function () {
        if (vis && !userPaused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
        if (btn) { btn.setAttribute('aria-pressed', String(userPaused)); btn.setAttribute('aria-label', (userPaused ? 'Reproducir' : 'Pausar') + ' video: Sarelly'); }
      };
      if (btn) btn.addEventListener('click', function () { userPaused = !userPaused; sync(); });
      if ('IntersectionObserver' in w) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; sync(); }, { threshold: 0.35 }).observe(v);
      sync();
    });
  });

  /* ---------- video: muted looping preview of the selected film while in view, pause, play with sound.
     YouTube privacy-enhanced embed through the IFrame API; the poster stays as the fallback if the embed cannot run. */
  safe('film', function () {
    var player = $('[data-player]'); if (!player) return;
    var films = JSON.parse(player.getAttribute('data-films'));
    var poster = $('[data-poster]', player), play = $('[data-play]', player), host = $('[data-yt]', player), tog = $('[data-film-toggle]', player);
    var cur = 0, yt = null, mode = '', inView = false, userPaused = false, apiState = 0, waiters = [], dog = 0, PRE = 4.5;
    // YouTube refuses to play without an http(s) referrer, so a page opened from disk keeps the poster and the plain link
    var failed = !/^https?:$/.test(w.location.protocol);
    if (failed) player.setAttribute('data-preview', 'fallback:file');
    var loadApi = function (cb) {
      if (w.YT && w.YT.Player) return cb(true);
      waiters.push(cb);
      if (apiState) return;
      apiState = 1;
      var done = function (ok) { if (apiState === 2) return; apiState = 2; if (!ok) failed = true; waiters.splice(0).forEach(function (f) { f(ok); }); };
      var prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = function () { if (prev) prev(); done(true); };
      var sc = d.createElement('script'); sc.src = 'https://www.youtube.com/iframe_api'; sc.async = true; sc.onerror = function () { done(false); };
      d.head.appendChild(sc);
      w.setTimeout(function () { done(!!(w.YT && w.YT.Player)); }, 6000);
    };
    var setTog = function (show) {
      if (!tog) return;
      tog.hidden = !show;
      tog.setAttribute('aria-pressed', String(userPaused));
      tog.setAttribute('aria-label', (userPaused ? 'Reanudar' : 'Pausar') + ' la vista previa de ' + films[cur].t);
    };
    var teardown = function () {
      w.clearTimeout(dog); w.clearTimeout(player._rv);
      if (yt && yt.destroy) { try { yt.destroy(); } catch (e) {} }
      yt = null; mode = '';
      while (host.firstChild) host.removeChild(host.firstChild);
      player.classList.remove('is-preview', 'is-sound');
      setTog(false);
    };
    var fallback = function (e) { failed = true; teardown(); player.setAttribute('data-preview', 'fallback' + (e && e.data ? ':' + e.data : '')); };
    var mount = function (m) {
      teardown();
      if (failed || !(w.YT && w.YT.Player)) return;
      var id = films[cur].id, el = d.createElement('div');
      host.appendChild(el);
      mode = m;
      // crop the embed (YouTube chrome, baked captions) per film
      host.style.setProperty('--z', films[cur].z || 1.25);
      host.style.setProperty('--ox', (films[cur].ox != null ? films[cur].ox : 50) + '%');
      host.style.setProperty('--oy', (films[cur].oy != null ? films[cur].oy : 50) + '%');
      // pre-roll PRE seconds under the poster: YouTube's own play/pause overlay shows for ~3-4s after every start or seek
      var vars = m === 'preview'
        ? { autoplay: 1, mute: 1, controls: 0, start: Math.max(0, Math.floor(films[cur].s - PRE)), playsinline: 1, rel: 0, modestbranding: 1, disablekb: 1, fs: 0, iv_load_policy: 3, cc_load_policy: 0 }
        : { autoplay: 1, mute: 0, controls: 1, playsinline: 1, rel: 0 };
      try {
        yt = new w.YT.Player(el, {
          host: 'https://www.youtube-nocookie.com', videoId: id, width: '100%', height: '100%', playerVars: vars,
          events: {
            onReady: function (e) {
              var f = e.target.getIframe && e.target.getIframe();
              if (f) { f.setAttribute('title', 'Testimonio en video de ' + films[cur].t); if (m === 'preview') f.setAttribute('tabindex', '-1'); }
              if (m === 'preview') { e.target.mute(); if (inView && !userPaused) e.target.playVideo(); }
              else { e.target.unMute(); e.target.setVolume(100); e.target.playVideo(); }
            },
            onStateChange: function (e) {
              // the preview loops only its chosen stretch: at the end, jump back to its start
              if (mode === 'preview' && e.data === 0) { e.target.seekTo(Math.max(0, films[cur].s - PRE), true); e.target.playVideo(); return; }
              if (e.data !== 1) return;
              w.clearTimeout(dog);
              player.setAttribute('data-preview', mode);
              if (mode === 'preview') {
                setTog(true);
                // the poster stays on top until a frame of the chosen stretch is really playing, then fades out;
                // it fades back in just before the stretch ends, while the player re-seeks and its overlay clears
                var tick = function () {
                  if (mode !== 'preview' || !yt || !yt.getCurrentTime) return;
                  var f = films[cur], t = yt.getCurrentTime(), st = yt.getPlayerState();
                  player.classList.toggle('is-preview', st === 1 && t >= f.s && t < f.e - 0.6);
                  if (st === 1 && t >= f.e) yt.seekTo(Math.max(0, f.s - PRE), true);
                  player._rv = w.setTimeout(tick, 100);
                };
                w.clearTimeout(player._rv); tick();
              } else player.classList.add('is-sound');
            },
            onError: fallback
          }
        });
      } catch (err) { fallback(); return; }
      // if nothing plays (blocked embed, file:// referrer, offline) keep the poster and the plain YouTube link
      dog = w.setTimeout(function () {
        var playing = player.classList.contains('is-preview') || player.classList.contains('is-sound');
        if (!playing && !(mode === 'preview' && userPaused)) fallback();
      }, 9000);
    };
    var preview = function () {
      if (reduced.matches || failed || !inView) return;
      if (yt && mode) { if (mode === 'preview' && !userPaused && yt.playVideo) yt.playVideo(); return; }
      loadApi(function (ok) { if (ok && inView && !mode) mount('preview'); });
    };
    var select = function (i) {
      cur = i; userPaused = false; teardown();
      poster.src = films[i].poster; poster.alt = 'Testimonio en video de ' + films[i].t;
      play.href = 'https://www.youtube.com/watch?v=' + films[i].id;
      play.setAttribute('aria-label', 'Reproducir ' + films[i].t + ' con sonido');
      $$('[data-film]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-film') === i)); });
      preview();
    };
    $$('[data-film]').forEach(function (b) { b.addEventListener('click', function () { select(+b.getAttribute('data-film')); }); });
    if (tog) tog.addEventListener('click', function () {
      userPaused = !userPaused;
      if (yt && mode === 'preview') { if (userPaused) yt.pauseVideo(); else yt.playVideo(); }
      setTog(true);
    });
    play.addEventListener('click', function (e) {
      // with the API ready the click (a user gesture) starts the film with sound in place; otherwise the link opens YouTube
      if (failed || !(w.YT && w.YT.Player)) return;
      e.preventDefault();
      mount('sound');
    });
    if ('IntersectionObserver' in w) new IntersectionObserver(function (en) {
      inView = en[0].isIntersecting;
      if (inView) preview();
      else if (yt && yt.pauseVideo && mode) { try { yt.pauseVideo(); } catch (e) {} }
    // start (muted, under the poster) a little before the player scrolls in, so the pre-roll is done when it arrives
    }, { rootMargin: '75% 0px 75% 0px', threshold: 0 }).observe(player);
  });

  /* ---------- scroll-linked: parallax (view timeline in JS). Anniversary walls + rim stay static, like MVR. */
  safe('scrolllinked', function () {
    var plx = $$('[data-parallax]');
    var viewT = function (el) { var r = el.getBoundingClientRect(), vh = w.innerHeight; return clamp((vh - r.top) / (vh + r.height), 0, 1); };
    onScroll.push(function () {
      if (reduced.matches) return;
      plx.forEach(function (el) {
        var host = el.parentNode, r = host.getBoundingClientRect();
        if (r.bottom < -200 || r.top > w.innerHeight + 200) return;
        el.style.setProperty('--py', (+el.getAttribute('data-parallax') * (0.5 - viewT(host))).toFixed(2) + 'px');
      });
    });
  });

  /* ---------- footer curtain: CTA stays pinned, footer slides over it */
  safe('curtain', function () {
    var panel = $('.curtain__panel'), layer = $('[data-footer-layer]'); if (!panel || !layer) return;
    var on = false, dist = 0;
    var measure = function () {
      on = desktop.matches && !reduced.matches;
      if (!on) { root.removeAttribute('data-curtain'); root.style.removeProperty('--curtain-d'); panel.style.removeProperty('--curtain-p'); return; }
      dist = Math.min(panel.offsetHeight, w.innerHeight);
      root.style.setProperty('--curtain-d', dist + 'px');
      root.setAttribute('data-curtain', '');
      update();
    };
    var update = function () {
      if (!on) return;
      var p = clamp(1 - layer.getBoundingClientRect().top / dist, 0, 1);
      panel.style.setProperty('--curtain-p', p.toFixed(3));
    };
    measure(); onResize.push(measure); onScroll.push(update);
    w.addEventListener('load', measure);
  });

  /* ---------- footer field opens the booking popup (nothing is posted) */
  safe('ftrform', function () {
    var f = $('[data-book-form]'); if (!f) return;
    f.addEventListener('submit', function (e) {
      if (!w.SBBooking) return;
      e.preventDefault();
      w.SBBooking.open($('input', f).value.trim(), $('button', f));
    });
  });

  /* ---------- scroll + resize loops */
  var ticking = false;
  var run = function () { ticking = false; var y = w.pageYOffset; for (var i = 0; i < onScroll.length; i++) { try { onScroll[i](y); } catch (e) {} } };
  var req = function () { if (!ticking) { ticking = true; w.requestAnimationFrame(run); } };
  w.addEventListener('scroll', req, { passive: true });
  var rt = 0;
  w.addEventListener('resize', function () { w.clearTimeout(rt); rt = w.setTimeout(function () { onResize.forEach(function (fn) { try { fn(); } catch (e) {} }); run(); }, 120); });
  run();
  w.addEventListener('load', run);
})();
