
(function () {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const lg = () => innerWidth >= 1280;

  
  const hdr = $('.hdr'), hero = $('.hero');
  const onHdr = () => { const lim = hero ? hero.offsetHeight - hdr.offsetHeight : 0; hdr.classList.toggle('solid', scrollY > lim); };
  addEventListener('scroll', onHdr, { passive: true }); addEventListener('resize', onHdr); onHdr();

  
  const mega = $('.mega'), scrim = $('.scrim');
  if (mega) {
    let t;
    const trig = $$('[data-mega]');
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
  const acc = (g, head, body) => {
    head.addEventListener('click', () => {
      if (body.closest('.ftr') && lg()) return;
      const o = !g.classList.contains('open'); g.classList.toggle('open', o);
      body.style.height = body.scrollHeight + 'px';
      if (o) { body.style.opacity = 1; body.addEventListener('transitionend', function f() { if (g.classList.contains('open')) body.style.height = 'auto'; body.removeEventListener('transitionend', f); }); }
      else { requestAnimationFrame(() => { body.style.height = '0px'; body.style.opacity = 0; }); }
    });
  };
  $$('.mm__g').forEach((g) => acc(g, $('.mm__h', g), $('.mm__b', g)));
  $$('.fg').forEach((g) => { const b = $('.fg__b', g); b.style.opacity = 1; acc(g, $('.fg__h', g), b); });
  $$('.mm a').forEach((a) => a.addEventListener('click', () => { if (mm.classList.contains('open')) burger.click(); }));

  
  $$('.alink').forEach((a) => { a.addEventListener('mouseleave', () => { a.classList.add('out'); setTimeout(() => a.classList.remove('out'), 320); }); });

  
  let scrollDir = -1, lastY = scrollY, scrollVel = 0, lastT = performance.now();
  addEventListener('scroll', () => {
    const now = performance.now(), dy = scrollY - lastY, dt = Math.max(16, now - lastT);
    if (dy > 0) scrollDir = -1; else if (dy < 0) scrollDir = 1;
    scrollVel = Math.abs(dy / dt * 1000); lastY = scrollY; lastT = now;
  }, { passive: true });
  const marquees = [];
  $$('.mq').forEach((m) => {
    const tr = $('.mq__t', m); const speed = +m.dataset.speed || 30;
    const items = [...tr.children];
    const fill = () => { // repeat until the track covers 2x viewport + one set
      while (tr.scrollWidth < innerWidth * 2 + 400) items.forEach((n) => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); tr.appendChild(c); });
      const set = items.map((n) => n.getBoundingClientRect().width + parseFloat(getComputedStyle(n).marginRight)).reduce((a, b) => a + b, 0);
      return set;
    };
    // duplicate one full set so wrap is seamless
    items.forEach((n) => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); tr.appendChild(c); });
    const st = { m, tr, speed, x: 0, hf: 1, hfT: 1, setW: 0, drag: null, vel: 0, vis: false };
    st.setW = fill();
    m.addEventListener('mouseenter', () => { st.hfT = 0.3; }); m.addEventListener('mouseleave', () => { st.hfT = 1; });
    m.addEventListener('pointerdown', (e) => { st.drag = { x: e.clientX, last: e.clientX, t: performance.now() }; st.vel = 0; m.classList.add('dragging'); m.setPointerCapture(e.pointerId); });
    m.addEventListener('pointermove', (e) => { if (!st.drag) return; const dx = e.clientX - st.drag.last, now = performance.now(); st.x += dx; st.vel = dx / Math.max(1, now - st.drag.t) * 16; st.drag.last = e.clientX; st.drag.t = now; });
    const up = () => { if (!st.drag) return; st.drag = null; m.classList.remove('dragging'); };
    m.addEventListener('pointerup', up); m.addEventListener('pointercancel', up);
    new IntersectionObserver(([en]) => { st.vis = en.isIntersecting; if (en.isIntersecting) m.classList.add('shown'); }, { rootMargin: '100px' }).observe(m);
    addEventListener('resize', () => { st.setW = fill(); });
    marquees.push(st);
  });
  let prev = performance.now();
  const loop = (now) => {
    const dt = Math.min(64, now - prev) / 1000; prev = now;
    scrollVel *= 0.9;
    for (const s of marquees) {
      s.hf += (s.hfT - s.hf) * Math.min(1, dt * 8);
      if (!s.drag) {
        if (Math.abs(s.vel) > 0.05) { s.x += s.vel; s.vel *= 0.96; }
        if (!RM) s.x += scrollDir * s.speed * dt * s.hf * (1 + scrollVel / 1000 * 5);
      }
      if (s.setW) { s.x = ((s.x % s.setW) + s.setW) % s.setW - s.setW; }
      if (s.vis) s.tr.style.transform = `translate3d(${s.x.toFixed(2)}px,0,0)`;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  
  $$('.cnt[data-v]').forEach((c) => {
    const v = c.dataset.v, sx = c.dataset.sx || '';
    c.innerHTML = v.split('').map((d) => `<span class="dg"><span>${'0123456789'.split('').map((n) => `<i>${n}</i>`).join('')}</span></span>`).join('') + (sx ? `<span class="sx">${sx}</span>` : '') + `<span class="sr">${v}${sx}</span>`;
    const cols = $$('.dg>span', c);
    const dgs = $$('.dg', c);
    const probe = document.createElement('span'); probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre'; c.appendChild(probe);
    const wOf = (ch) => { probe.textContent = ch; return probe.getBoundingClientRect().width; };
    dgs.forEach((d) => { d.style.width = wOf('0') + 'px'; });
    const go = () => cols.forEach((col, i) => { col.style.transform = `translateY(-${v[i]}em)`; dgs[i].style.width = wOf(v[i]) + 'px'; });
    if (RM) { cols.forEach((col) => col.style.transition = 'none'); go(); return; }
    new IntersectionObserver(([en], o) => { if (en.isIntersecting) { go(); o.disconnect(); } }, { threshold: 0.4 }).observe(c);
  });

  
  $$('.tl').forEach((tl) => {
    const rail = $('.tl__rail', tl), fill = $('.tl__fill', tl), marks = $$('.tl__m', tl);
    const lay = () => { const a = marks[0].offsetTop + 28, b = marks[marks.length - 1].offsetTop + 28; rail.style.top = a + 'px'; rail.style.height = (b - a) + 'px'; };
    const upd = () => {
      const r = rail.getBoundingClientRect(), mid = innerHeight / 2;
      fill.style.height = Math.max(0, Math.min(r.height, mid - r.top)) + 'px';
      marks.forEach((mk) => { const s = mid - mk.getBoundingClientRect().top; let t = 0; if (s > 0) { t = Math.min(1, Math.max(0, 2 * s / 100)); t = 1 - (1 - t) * (1 - t); mk.style.setProperty('--scale', (0.4 + 0.6 * t).toFixed(3)); } else mk.style.setProperty('--scale', 0); });
    };
    lay(); upd(); addEventListener('scroll', upd, { passive: true }); addEventListener('resize', () => { lay(); upd(); }); addEventListener('load', () => { lay(); upd(); });
  });

  
  $$('.pills').forEach((p) => {
    const ps = $$('.pill', p);
    ps.forEach((x, i) => x.style.transitionDelay = (i * 0.2) + 's');
    new IntersectionObserver(([en]) => ps.forEach((x) => x.classList.toggle('in-view', en.isIntersecting)), { threshold: 0.01 }).observe(p);
  });

  
  $$('[data-tabs]').forEach((w) => {
    const tags = $$('.tag', w), box = $('.tabc', w), panels = $$('.tabp', w);
    const show = (i, first) => {
      const cur = panels.find((p) => p.classList.contains('on'));
      if (!first) box.style.height = cur.offsetHeight + 'px';
      tags.forEach((t, j) => { t.classList.toggle('on', j === i); t.setAttribute('aria-selected', j === i); });
      panels.forEach((p, j) => p.classList.toggle('on', j === i));
      if (first) return;
      requestAnimationFrame(() => { box.style.height = panels[i].offsetHeight + 'px'; });
      clearTimeout(box._t); box._t = setTimeout(() => { box.style.height = ''; }, 720);
      tags[i].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    };
    tags.forEach((t, i) => t.addEventListener('click', () => { if (!t.classList.contains('on')) show(i); }));
  });

  
  $$('.fq').forEach((q) => {
    const b = $('.fq__q', q), a = $('.fq__a', q);
    b.addEventListener('click', () => {
      const o = !q.classList.contains('open');
      a.style.height = (o ? 0 : a.scrollHeight) + 'px';
      q.classList.toggle('open', o); b.setAttribute('aria-expanded', o);
      requestAnimationFrame(() => { a.style.height = (o ? a.scrollHeight : 0) + 'px'; });
    });
  });

  
  $$('.lstrip').forEach((s) => {
    let d = null;
    s.addEventListener('pointerdown', (e) => { d = { x: e.clientX, l: s.scrollLeft }; });
    addEventListener('pointermove', (e) => { if (d) s.scrollLeft = d.l - (e.clientX - d.x); });
    addEventListener('pointerup', () => { d = null; });
  });

  
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
