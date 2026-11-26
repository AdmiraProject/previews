
(function () {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const lg = () => innerWidth >= 1280;

  
  const hdr = $('.hdr');
  const onHdr = () => hdr.classList.toggle('solid', scrollY > 0);
  addEventListener('scroll', onHdr, { passive: true }); onHdr();

  
  const mega = $('.mega'), scrim = $('.scrim');
  if (mega) {
    let t; const trig = $$('[data-mega]');
    const open = (el) => { clearTimeout(t); trig.forEach((x) => x.classList.toggle('on', x === el)); mega.classList.add('open'); scrim.classList.add('open'); hdr.classList.add('menu-open'); };
    const close = () => { t = setTimeout(() => { trig.forEach((x) => x.classList.remove('on')); mega.classList.remove('open'); scrim.classList.remove('open'); hdr.classList.remove('menu-open'); onHdr(); }, 120); };
    trig.forEach((el) => { el.addEventListener('mouseenter', () => open(el)); el.addEventListener('mouseleave', close); el.addEventListener('click', (e) => { e.preventDefault(); mega.classList.contains('open') ? close() : open(el); }); });
    mega.addEventListener('mouseenter', () => clearTimeout(t)); mega.addEventListener('mouseleave', close);
    $$('.ni:not([data-mega])').forEach((el) => el.addEventListener('mouseenter', close));
    scrim.addEventListener('click', close);
  }
  
  const burger = $('.hdr__burger'), mm = $('.mm');
  if (burger) burger.addEventListener('click', () => {
    const o = !mm.classList.contains('open');
    mm.classList.toggle('open', o); hdr.classList.toggle('menu-open', o); burger.setAttribute('aria-expanded', o);
    document.documentElement.style.overflow = o ? 'hidden' : ''; if (!o) onHdr();
  });
  const acc = (g, head, body) => head.addEventListener('click', () => {
    if (body.closest('.ftr') && lg()) return;
    const o = !g.classList.contains('open'); g.classList.toggle('open', o);
    body.style.height = body.scrollHeight + 'px';
    if (o) { body.style.opacity = 1; body.addEventListener('transitionend', function f() { if (g.classList.contains('open')) body.style.height = 'auto'; body.removeEventListener('transitionend', f); }); }
    else requestAnimationFrame(() => { body.style.height = '0px'; body.style.opacity = 0; });
  });
  $$('.mm__g').forEach((g) => acc(g, $('.mm__h', g), $('.mm__b', g)));
  $$('.fg').forEach((g) => { const b = $('.fg__b', g); b.style.opacity = 1; acc(g, $('.fg__h', g), b); });
  $$('.mm a').forEach((a) => a.addEventListener('click', () => { if (mm.classList.contains('open')) burger.click(); }));

  
  $$('.alink').forEach((a) => a.addEventListener('mouseleave', () => { a.classList.add('out'); setTimeout(() => a.classList.remove('out'), 320); }));

  
  let gDir = 1, lastY = scrollY, lastT = performance.now(), vRaw = 0, vS = 0;
  addEventListener('scroll', () => {
    const now = performance.now(), dy = scrollY - lastY, dt = Math.min(200, Math.max(8, now - lastT)); // a jump after idle counts as one ~200ms step
    if (dy > 0) gDir = 1; else if (dy < 0) gDir = -1;
    vRaw = Math.abs(dy / dt * 1000); lastY = scrollY; lastT = now;
  }, { passive: true });
  const MQ = [];
  const mk = (box, track, vertical) => {
    const dir = box.dataset.dir, speed = +box.dataset.speed || 30;
    const native = (dir === 'right' || dir === 'down') ? 1 : -1;
    const items = [...track.children];
    const size = (n) => { const r = n.getBoundingClientRect(); return vertical ? r.height : r.width; };
    const clone = () => items.forEach((n) => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); $$('a,button', c).forEach((x) => x.tabIndex = -1); track.appendChild(c); });
    const st = { box, track, vertical, native, speed, x: 0, hf: 1, hfT: 1, setW: 0, drag: null, vel: 0, vis: false, hover: !('nohover' in box.dataset) };
    const fill = () => {
      const view = vertical ? box.clientHeight : innerWidth;
      st.setW = items.reduce((a, n) => a + size(n), 0);
      if (!st.setW) return;
      let tot = vertical ? track.scrollHeight : track.scrollWidth, guard = 0;
      while (tot < view * 2 + st.setW && guard++ < 12) { clone(); tot += st.setW; }
    };
    clone(); fill();
    if (st.hover) { box.addEventListener('mouseenter', () => { st.hfT = 0.3; }); box.addEventListener('mouseleave', () => { st.hfT = 1; }); }
    let moved = false;
    box.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; st.drag = { p: vertical ? e.clientY : e.clientX, t: performance.now() }; st.vel = 0; moved = false; });
    addEventListener('pointermove', (e) => { if (!st.drag) return; const p = vertical ? e.clientY : e.clientX, d = p - st.drag.p, now = performance.now(); if (Math.abs(d) > 0) moved = true; st.x += d; st.vel = d / Math.max(1, now - st.drag.t) * 16; st.drag.p = p; st.drag.t = now; if (moved) box.classList.add('dragging'); });
    addEventListener('pointerup', () => { if (!st.drag) return; st.drag = null; box.classList.remove('dragging'); });
    box.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    new IntersectionObserver(([en]) => { st.vis = en.isIntersecting; if (en.isIntersecting) box.classList.add('shown'); }, { rootMargin: '100px' }).observe(box);
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fill, 120); });
    addEventListener('load', fill);
    MQ.push(st);
  };
  $$('.mq').forEach((m) => mk(m, $('.mq__t', m), false));
  $$('.hq').forEach((m) => mk(m, $('.hq__t', m), false));
  $$('.vq').forEach((m) => mk(m, $('.vq__t', m), true));
  let prev = performance.now();
  const loop = (now) => {
    const dt = Math.min(64, now - prev) / 1000; prev = now;
    if (now - lastT > 80) vRaw *= 0.9;                        // no scroll events -> velocity decays
    vS += (vRaw - vS) * Math.min(1, dt * 10);                 // ~ overdamped spring (damping 50 / stiffness 400, ~100ms lag)
    const boost = 1 + vS / 1000 * 5;
    for (const s of MQ) {
      s.hf += (s.hfT - s.hf) * Math.min(1, dt * 10);
      if (!s.drag) {
        if (Math.abs(s.vel) > 0.05) { s.x += s.vel; s.vel *= 0.96; }
        if (!RM) s.x += s.native * gDir * s.speed * dt * s.hf * boost;
      }
      if (s.setW) s.x = ((s.x % s.setW) + s.setW) % s.setW - s.setW;
      if (s.vis) s.track.style.transform = s.vertical ? `translate3d(0,${s.x.toFixed(2)}px,0)` : `translate3d(${s.x.toFixed(2)}px,0,0)`;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  
  $$('.cnt[data-v]').forEach((c) => {
    const v = c.dataset.v, sx = c.dataset.sx || '';
    c.innerHTML = v.split('').map((d) => `<span class="dg"><span>${'0123456789'.split('').map((n) => `<i${n === d ? ' class="v"' : ''}>${n}</i>`).join('')}</span></span>`).join('') + (sx ? `<span class="sx">${sx}</span>` : '') + `<span class="sr">${v}${sx}</span>`;
    const cols = $$('.dg>span', c), dgs = $$('.dg', c);
    const probe = document.createElement('span'); probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre'; c.appendChild(probe);
    const wOf = (ch) => { probe.textContent = ch; return probe.getBoundingClientRect().width; };
    const size = () => dgs.forEach((d, i) => { d.style.width = wOf(c.classList.contains('on') ? v[i] : '0') + 'px'; });
    document.fonts && document.fonts.ready.then(size); size();
    const go = () => { c.classList.add('on'); cols.forEach((col, i) => { col.style.transform = `translateY(-${v[i]}em)`; dgs[i].style.width = wOf(v[i]) + 'px'; }); };
    if (RM) { cols.forEach((col) => col.style.transition = 'none'); go(); return; }
    new IntersectionObserver(([en], o) => { if (en.isIntersecting) { setTimeout(go, 240); o.disconnect(); } }, { threshold: 0.4 }).observe(c);
  });

  
  $$('.sv').forEach((sv) => {
    if (RM) { sv.classList.add('is-in'); return; }
    let timers = [], running = false;
    const cycle = () => {
      sv.classList.remove('is-in', 'is-out');
      timers.push(setTimeout(() => sv.classList.add('is-in'), 500));
      timers.push(setTimeout(() => sv.classList.add('is-out'), 10500));
      timers.push(setTimeout(() => sv.classList.remove('is-in'), 11000));
      timers.push(setTimeout(cycle, 11500));
    };
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !running) { running = true; cycle(); }
      else if (!en.isIntersecting && running) { running = false; timers.forEach(clearTimeout); timers = []; }
    }, { threshold: 0.2 }).observe(sv);
  });

  
  const mpv = $('#mpv');
  if (mpv) {
    let last = null;
    const close = () => { mpv.classList.remove('is-open'); mpv.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('bk-lock'); last && last.focus && last.focus(); };
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-mpv]');
      if (b) {
        last = b; const fig = $('.mpv__fig', mpv); fig.innerHTML = ''; const im = new Image(); im.src = b.dataset.mpv; im.alt = b.querySelector('img')?.alt || ''; fig.appendChild(im);
        $('.mpv__h', mpv).textContent = b.dataset.t; $('.mpv__c', mpv).textContent = b.dataset.c; $('.mpv__d', mpv).textContent = b.dataset.d;
        $('.mpv__tags', mpv).innerHTML = (b.dataset.tags || '').split('|').filter(Boolean).map((t) => `<span>${t}</span>`).join('');
        mpv.classList.add('is-open'); mpv.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('bk-lock'); setTimeout(() => $('.mpv__x', mpv).focus(), 50); return;
      }
      if (e.target.closest('[data-mpv-close]')) close();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mpv.classList.contains('is-open')) close(); });
  }

  
  const skin = () => {
    const bk = $('#book'); if (!bk || bk.dataset.skinned) return; bk.dataset.skinned = 1;
    $('.bk__step--form .bk__title', bk).innerHTML = '<em>Agenda una asesoría</em> confidencial';
    $('.bk__step--cal .bk__title', bk).innerHTML = '<em>Elige</em> el horario que te acomode';
    const ph = { name: 'Escribe tu nombre completo', email: 'tu@empresa.com', phone: '+52 55 0000 0000' };
    $$('.bk__field input', bk).forEach((i) => { i.placeholder = ph[i.name] || ''; });
    const s = $('.bk__submit span', bk); if (s) s.textContent = 'Agenda una asesoría';
  };
  skin(); document.addEventListener('DOMContentLoaded', skin); addEventListener('load', skin);
})();
