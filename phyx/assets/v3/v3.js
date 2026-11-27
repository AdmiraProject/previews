
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mob = () => innerWidth < 810;

  
  const hdr = $('.hdr'), hero = $('[data-hero-dk]');
  const setHdr = () => { if (!hdr) return; const dk = hero && hero.getBoundingClientRect().bottom > 64 && !document.documentElement.classList.contains('mega-on'); hdr.classList.toggle('is-dk', !!dk); };
  addEventListener('scroll', setHdr, { passive: true }); addEventListener('resize', setHdr); setHdr();

  
  const mega = $('.mega'); let megaT;
  const megaOpen = (id) => { if (!mega) return; $$('.mega__in', mega).forEach(p => p.classList.toggle('is-on', p.dataset.mega === id)); $$('[data-mega-btn]').forEach(b => b.setAttribute('aria-expanded', b.dataset.megaBtn === id)); mega.classList.add('is-on'); document.documentElement.classList.add('mega-on'); hdr.classList.remove('is-dk');
    $$('.mega__in.is-on .mega__i', mega).forEach((it, i) => { it.style.transitionDelay = (60 + i * 40) + 'ms'; }); };
  const megaClose = () => { if (!mega) return; mega.classList.remove('is-on'); document.documentElement.classList.remove('mega-on'); $$('[data-mega-btn]').forEach(b => b.setAttribute('aria-expanded', 'false')); $$('.mega__i', mega).forEach(it => { it.style.transitionDelay = '0ms'; }); setHdr(); };
  $$('[data-mega-btn]').forEach(b => {
    b.addEventListener('click', () => (b.getAttribute('aria-expanded') === 'true' ? megaClose() : megaOpen(b.dataset.megaBtn)));
    b.addEventListener('mouseenter', () => { clearTimeout(megaT); megaOpen(b.dataset.megaBtn); });
    b.addEventListener('mouseleave', () => { megaT = setTimeout(() => { if (!$('.mega__p:hover')) megaClose(); }, 180); });
  });
  if (mega) { $('.mega__p', mega).addEventListener('mouseleave', () => { megaT = setTimeout(megaClose, 180); }); $('.mega__p', mega).addEventListener('mouseenter', () => clearTimeout(megaT)); $('.mega__scrim', mega).addEventListener('click', megaClose); }
  addEventListener('keydown', e => { if (e.key === 'Escape') { megaClose(); mmClose(); } });

  
  const mm = $('.mm');
  const mmClose = () => { if (!mm) return; mm.classList.remove('is-on'); document.documentElement.style.overflow = ''; };
  $$('[data-mm]').forEach(b => b.addEventListener('click', () => { if (!mm) return; mm.classList.add('is-on'); document.documentElement.style.overflow = 'hidden'; $$('.mm__list a', mm).forEach((a, i) => { a.style.transitionDelay = (120 + i * 45) + 'ms'; }); }));
  $$('[data-mm-x], .mm a', mm || document.createElement('i')).forEach(b => b.addEventListener('click', mmClose));

  
  const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { if (!RM) v.play().catch(() => {}); } else v.pause(); }), { rootMargin: '200px' });
  $$('video[data-auto]').forEach(v => { v.muted = true; const m = mob() && v.dataset.srcM; if (m && v.dataset.posterM) v.poster = v.dataset.posterM; if (v.dataset.src) v.src = m ? v.dataset.srcM : v.dataset.src; vio.observe(v); });

  
  $$('[data-qt]').forEach(q => {
    const s = $$('.qt__s', q), d = $$('.dots button', q); let i = 0, t;
    const go = n => { i = (n + s.length) % s.length; s.forEach((x, k) => x.classList.toggle('is-on', k === i)); d.forEach((x, k) => x.classList.toggle('is-on', k === i)); };
    const run = () => { clearInterval(t); if (!RM) t = setInterval(() => go(i + 1), 10000); };
    d.forEach((b, k) => b.addEventListener('click', () => { go(k); run(); })); go(0); run();
  });

  
  $$('.card[data-hold]').forEach(c => {
    const on = () => c.classList.add('is-held'), off = () => c.classList.remove('is-held');
    c.addEventListener('touchstart', on, { passive: true }); c.addEventListener('touchend', off); c.addEventListener('touchcancel', off);
  });
  
  $$('[data-fchip]').forEach(f => {
    const tr = $('.fchip__tr', f), n = tr.children.length; let i = 0;
    if (!RM) setInterval(() => { i = (i + 1) % n; tr.style.transform = `translateY(${-65 * i}px)`; }, 2600);
  });

  
  $$('[data-car]').forEach(car => {
    const tr = $('.car__tr', car), vp = $('.car__vp', car), items = [...tr.children], bar = $('.car__bar i', car), nx = $('.car__nav--n', car), pv = $('.car__nav--p', car), dots = $$('.car__dots button', car);
    let i = 0, x0 = 0, dx = 0, drag = false;
    const step = () => items[0].getBoundingClientRect().width + parseFloat(getComputedStyle(tr).columnGap || getComputedStyle(tr).gap || 15);
    const max = () => Math.max(0, items.length - (mob() ? 1 : Math.max(1, Math.floor(vp.clientWidth / step()) - 0)));
    const lim = () => items.length - 1;
    const go = n => { i = Math.max(0, Math.min(lim(), n)); tr.style.transform = `translateX(${-i * step()}px)`; if (bar) bar.style.transform = `translateX(${i * 100}%)`; if (pv) pv.classList.toggle('is-on', i > 0); if (nx) nx.style.opacity = i >= lim() ? '0' : '1'; dots.forEach((d, k) => d.classList.toggle('is-on', k === i)); };
    if (bar) bar.style.width = (100 / items.length) + '%';
    nx && nx.addEventListener('click', () => go(i + 1)); pv && pv.addEventListener('click', () => go(i - 1)); dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
    vp.addEventListener('pointerdown', e => { if (e.target.closest('button,a')) return; drag = true; x0 = e.clientX; dx = 0; vp.classList.add('is-drag'); tr.style.transition = 'none'; vp.setPointerCapture(e.pointerId); });
    vp.addEventListener('pointermove', e => { if (!drag) return; dx = e.clientX - x0; tr.style.transform = `translateX(${-i * step() + dx}px)`; });
    const end = () => { if (!drag) return; drag = false; vp.classList.remove('is-drag'); tr.style.transition = ''; go(Math.abs(dx) > 60 ? i + (dx < 0 ? 1 : -1) : i); };
    vp.addEventListener('pointerup', end); vp.addEventListener('pointercancel', end);
    addEventListener('resize', () => go(i)); go(0); void max;
  });
  
  $$('.pcard__i').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const c = b.closest('.pcard'); c.classList.toggle('is-info'); b.setAttribute('aria-expanded', c.classList.contains('is-info')); }));

  
  $$('[data-orb]').forEach(o => {
    const c = $('.orb__c', o), imgs = $$('img', c);
    const N = 44, base = imgs.map(i => i.getAttribute('src'));
    while (imgs.length < N) { const im = document.createElement('img'); im.src = base[imgs.length % base.length]; im.alt = ''; im.loading = 'lazy'; c.appendChild(im); imgs.push(im); }
    const R = c.clientWidth / 2, w = imgs[0].offsetWidth || 106;
    imgs.forEach((im, k) => { const d = [0, 70, 25, 95, 45, 10, 80, 55][k % 8], sc = [1, .85, .95, .8, 1.05, .9, .82, 1][k % 8], th = (2 * Math.PI / N) * k, r = R - 60 - d;
      im.style.left = (R + r * Math.sin(th) - w / 2) + 'px'; im.style.top = (R - r * Math.cos(th) - w / 2) + 'px'; im.style.margin = '0'; im.style.transformOrigin = '50% 50%';
      im.style.transform = `rotate(${(th * 57.2958 + [-8, 6, -14, 10, 4, -6, 12, -3][k % 8]).toFixed(1)}deg) scale(${sc})`; });
    let a = 0, last = performance.now(), vis = false;
    new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(o.parentElement);
    const tick = now => { const dt = Math.min(64, now - last); last = now; if (vis && !RM) a += 2.4 * dt / 1000; const s = o.parentElement.getBoundingClientRect().top * -0.125; c.style.transform = `rotate(${(a + (RM ? 0 : s)).toFixed(3)}deg)`; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  
  $$('[data-more]').forEach(b => b.addEventListener('click', () => { const g = document.getElementById(b.dataset.more); const open = g.classList.toggle('is-open'); const t = b.querySelector('[data-lbl]'); if (t) t.textContent = open ? t.dataset.less : t.dataset.lbl; }));

  
  $$('[data-slides]').forEach((s, k) => {
    const im = $$('img', s); if (im.length < 2 || RM) return; let i = 0;
    setTimeout(() => setInterval(() => { im[i].classList.remove('is-on'); i = (i + 1) % im.length; im[i].classList.add('is-on'); }, 4000), k * 1300);
  });

  
  $$('[data-mq]').forEach(row => {
    const sp = +row.dataset.mq || 36; row.innerHTML += row.innerHTML; let x = sp > 0 ? 0 : -row.scrollWidth / 2, last = performance.now(), vis = true;
    new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(row);
    const tick = now => { const dt = Math.min(64, now - last); last = now; if (vis && !RM) { const w = row.scrollWidth / 2; x -= sp * dt / 1000; if (x <= -w) x += w; if (x > 0) x -= w; row.style.transform = `translateX(${x.toFixed(2)}px)`; } requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });

  
  $$('.acc__q').forEach(q => q.addEventListener('click', () => {
    const it = q.parentElement, a = $('.acc__a', it), open = !it.classList.contains('is-on');
    a.style.height = a.scrollHeight + 'px'; if (!open) requestAnimationFrame(() => { a.style.height = '0px'; });
    it.classList.toggle('is-on', open); q.setAttribute('aria-expanded', open);
    if (open) a.addEventListener('transitionend', function f() { if (it.classList.contains('is-on')) a.style.height = 'auto'; a.removeEventListener('transitionend', f); });
  }));

  
  $$('[data-tm-more]').forEach(b => b.addEventListener('click', () => { const m = document.getElementById(b.dataset.tmMore); m.classList.add('is-open'); b.parentElement.remove(); }));

  
  $$('.seg').forEach(sg => {
    const bs = $$('button', sg), pill = $('i', sg);
    const set = b => { bs.forEach(x => x.classList.toggle('is-on', x === b)); pill.style.width = b.offsetWidth + 'px'; pill.style.transform = `translateX(${b.offsetLeft - 4}px)`; $$('.cmp__pane').forEach(p => { p.hidden = p.dataset.pane !== b.dataset.pane; }); };
    bs.forEach(b => b.addEventListener('click', () => set(b))); requestAnimationFrame(() => set(bs[0])); addEventListener('resize', () => set($('.is-on', sg) || bs[0]));
  });
  $$('.cmp__cat').forEach(c => c.addEventListener('click', () => { const r = c.nextElementSibling; const h = r.scrollHeight; if (r.style.height === '0px') { r.style.height = h + 'px'; r.addEventListener('transitionend', () => { r.style.height = ''; }, { once: true }); } else { r.style.height = h + 'px'; requestAnimationFrame(() => { r.style.height = '0px'; }); } }));
  $$('[data-expand-all]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); $$('.cmp__rows').forEach(r => { r.style.height = ''; }); }));

  
  $$('[data-arc]').forEach(box => {
    const it = $$('.arc__i', box), n = it.length, gap = 44; let off = 0, last = performance.now();
    const R = 520, cx = -330;
    const tick = now => { const dt = Math.min(64, now - last); last = now; if (!RM) off = (off + 14 * dt / 1000) % (n * gap);
      const H = box.clientHeight, mid = H / 2; let best = null, bd = 1e9;
      it.forEach((el, k) => { let y = ((k * gap - off) % (n * gap) + n * gap) % (n * gap) - (n * gap - H) / 2; const dy = y - mid; const ang = Math.asin(Math.max(-1, Math.min(1, dy / R))); const x = cx + R * Math.cos(ang) - 120;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(ang * 57.3 * .55).toFixed(2)}deg)`; if (Math.abs(dy) < bd) { bd = Math.abs(dy); best = el; } });
      it.forEach(el => el.classList.toggle('is-c', el === best)); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  
  $$('.avo').forEach(o => { const im = $$(':scope > img', o), n = im.length; im.forEach((m, k) => { const a = (k / n) * Math.PI * 2; m.style.left = (110 + 100 * Math.cos(a) - 21) + 'px'; m.style.top = (110 + 100 * Math.sin(a) - 21) + 'px'; }); });

  
  $$('[data-act]').forEach(f => {
    const sub = $('.act__sub', f); const ok = () => { const v = Object.fromEntries(new FormData(f)); sub.disabled = !(v.name && v.name.trim().split(/\s+/).length >= 2 && /\S+@\S+\.\S{2,}/.test(v.email || '') && (v.phone || '').replace(/\D/g, '').length >= 10 && v.centro); };
    f.addEventListener('input', ok); f.addEventListener('change', ok); ok();
    f.addEventListener('submit', e => { e.preventDefault(); const v = Object.fromEntries(new FormData(f)); try { localStorage.setItem('px-lead', JSON.stringify({ name: v.name, email: v.email, phone: v.phone, centro: v.centro, motivo: v.motivo })); } catch (er) {}
      if (window.PXLead) { window.PXLead.open({ centro: v.centro, motivo: v.motivo }); const lf = document.querySelector('#lf form'); if (lf) setTimeout(() => lf.requestSubmit(), 60); } });
  });
})();
