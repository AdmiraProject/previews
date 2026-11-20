/* Facturador.com — shared behaviour (fx.js). No dependencies. */
(() => {
  const d = document, root = d.documentElement;
  root.classList.remove('no-js');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LANG = root.lang || 'es';

  /* ------------------------------------------------------------------
     CONFIG — single place to wire the real trial endpoint later.
     Today Facturador's site POSTs {nombre,rfc,correo,telefono,idPlan} to
     https://admin-api.facturador.com/api/v1/Usuario and then redirects to the
     login_url it returns. This preview NEVER calls that API (no real accounts).
  ------------------------------------------------------------------- */
  const CONFIG = window.FX_CONFIG = Object.assign({
    redirect: 'https://auth.facturador.com/',
    redirectDelay: 6000,
    whatsapp: 'https://api.whatsapp.com/send?phone=5219984955506&text=' + encodeURIComponent(LANG === 'es' ? 'Hola, quiero activar mi prueba gratis de Facturador.com' : 'Hi, I want to activate my Facturador.com free trial'),
    phone: '+52 998 872 3293'
  }, window.FX_CONFIG || {});

  /* ---------- nav: scrolled state + theme from section under it ---------- */
  const nav = d.querySelector('[data-nav]');
  if (nav) {
    const themed = [...d.querySelectorAll('[data-nav-theme]')];
    const onScroll = () => {
      nav.classList.toggle('is-scrolled', scrollY > 8);
      if (themed.length) {
        const y = nav.getBoundingClientRect().bottom - 4;
        let theme = 'light';
        for (const s of themed) { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) { theme = s.dataset.navTheme; break; } }
        nav.dataset.theme = theme;
      }
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    const burger = nav.querySelector('[data-burger]');
    burger && burger.addEventListener('click', () => {
      const open = nav.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
      d.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('[data-mega]').forEach(item => {
      const btn = item.querySelector('button');
      btn && btn.addEventListener('click', () => item.classList.toggle('open'));
      item.addEventListener('mouseenter', () => matchMedia('(min-width:1024px)').matches && item.classList.add('open'));
      item.addEventListener('mouseleave', () => item.classList.remove('open'));
    });
  }

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  d.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

  /* ---------- media: poster image → autoplay muted loop on load ---------- */
  // Only visible, on-screen loops play (hidden tabs/panels/modals stay paused). Lazy src via data-src.
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target, shown = e.isIntersecting && v.offsetParent !== null;
    if (shown) { if (!v.src && v.dataset.src) v.src = v.dataset.src; v.play().catch(() => {}); }
    else if (!v.paused) v.pause();
  }), { rootMargin: '150px' });
  const vids = [...d.querySelectorAll('.media video')];
  vids.forEach(v => {
    v.muted = true; v.playsInline = true; v.removeAttribute('autoplay');
    if (RM) return;
    const fig = v.closest('.media');
    v.addEventListener('playing', () => fig.classList.add('is-playing'));
    vio.observe(v);
  });
  // re-check after tab/persona/modal switches (visibility changes don't fire IO)
  const recheck = () => vids.forEach(v => { vio.unobserve(v); vio.observe(v); });
  d.addEventListener('click', () => setTimeout(recheck, 60));
  d.addEventListener('tab', () => setTimeout(recheck, 60), true);
  window.FX_recheckMedia = recheck;

  /* ---------- tabs with auto-advance + progress ---------- */
  d.querySelectorAll('[data-tabs]').forEach(box => {
    const tabs = [...box.querySelectorAll('[data-tab]')];
    const panels = [...box.querySelectorAll('[data-panel]')];
    const ms = +box.dataset.interval || 8000;
    let i = 0, t0 = 0, raf, paused = false, visible = false;
    const set = n => {
      i = (n + tabs.length) % tabs.length;
      tabs.forEach((t, k) => { t.classList.toggle('on', k === i); t.setAttribute('aria-selected', k === i); t.style.setProperty('--p', 0); });
      panels.forEach((p, k) => { p.classList.toggle('on', k === i); p.toggleAttribute('hidden', k !== i); if (k === i) replay(p); });
      box.dispatchEvent(new CustomEvent('tab', { detail: i }));
      t0 = performance.now();
    };
    const loop = now => {
      if (!paused && visible && !RM) {
        const p = Math.min(1, (now - t0) / ms);
        tabs[i].style.setProperty('--p', p);
        if (p >= 1) set(i + 1);
      } else t0 = now - (+tabs[i].style.getPropertyValue('--p') || 0) * ms;
      raf = requestAnimationFrame(loop);
    };
    tabs.forEach((t, k) => t.addEventListener('click', () => { set(k); }));
    box.addEventListener('mouseenter', () => paused = true);
    box.addEventListener('mouseleave', () => paused = false);
    new IntersectionObserver(es => es.forEach(e => visible = e.isIntersecting), { threshold: .25 }).observe(box);
    set(0); raf = requestAnimationFrame(loop);
  });

  /* ---------- scripted UI scenes: [data-scene] children with data-at="ms" get .on ---------- */
  function replay(scope) {
    scope.querySelectorAll('[data-scene]').forEach(runScene);
  }
  function runScene(sc) {
    clearTimeout(sc._t); (sc._ts || []).forEach(clearTimeout);
    const steps = [...sc.querySelectorAll('[data-at]')];
    steps.forEach(s => s.classList.remove('on'));
    sc.querySelectorAll('[data-type]').forEach(el => el.textContent = '');
    if (RM) { steps.forEach(s => s.classList.add('on')); sc.querySelectorAll('[data-type]').forEach(el => el.textContent = el.dataset.type); return; }
    sc._ts = steps.map(s => setTimeout(() => {
      s.classList.add('on');
      s.querySelectorAll(':scope [data-type]').forEach(typeIn);
      if (s.hasAttribute('data-type')) typeIn(s);
    }, +s.dataset.at));
    const loop = +sc.dataset.loop;
    if (loop) sc._t = setTimeout(() => runScene(sc), loop);
  }
  function typeIn(el) {
    const txt = el.dataset.type; let k = 0; el.textContent = '';
    const speed = +el.dataset.speed || 38;
    const tick = () => { el.textContent = txt.slice(0, ++k); if (k < txt.length) el._ti = setTimeout(tick, speed); };
    clearTimeout(el._ti); tick();
  }
  const sio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && !e.target._started && !e.target.closest('[data-panel]:not(.on)')) { e.target._started = 1; runScene(e.target); }
  }), { threshold: .2 });
  d.querySelectorAll('[data-scene]').forEach(s => sio.observe(s));

  /* ---------- count-up ---------- */
  const fmt = new Intl.NumberFormat(LANG === 'es' ? 'es-MX' : 'en-US');
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    if (RM) { el.textContent = pre + fmt.format(to) + suf; return; }
    const t0 = performance.now(), dur = 1400;
    const step = now => { const p = Math.min(1, (now - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - p, 3))); el.textContent = pre + fmt.format(v) + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  d.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

  /* ---------- segmented toggles (e.g. monthly/annual, persona) ---------- */
  d.querySelectorAll('[data-toggle]').forEach(g => {
    const btns = [...g.querySelectorAll('button')];
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.setAttribute('aria-pressed', x === b));
      const key = g.dataset.toggle, val = b.dataset.value;
      d.querySelectorAll(`[data-when-${key}]`).forEach(el => el.hidden = el.getAttribute(`data-when-${key}`) !== val);
    }));
  });

  /* ---------- mobile sticky bar ---------- */
  const mbar = d.querySelector('.mbar');
  if (mbar) {
    const hero = d.querySelector('[data-hero]');
    const upd = () => mbar.classList.toggle('on', hero ? hero.getBoundingClientRect().bottom < 80 : scrollY > 500);
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* ================== ACTIVATION FLOW ================== */
  const act = d.getElementById('activate');
  if (!act) return;
  const T = (es, en) => LANG === 'es' ? es : en;
  const steps = [...act.querySelectorAll('.act__step')];
  const bars = [...act.querySelectorAll('.act__progress i')];
  const lead = { goal: [], email: '', name: '', phone: '', source: location.pathname };
  let lastFocus, timer;

  const go = n => {
    steps.forEach((s, k) => s.classList.toggle('on', k === n));
    bars.forEach((b, k) => b.classList.toggle('done', k <= n));
    const f = steps[n].querySelector('input:not([type=hidden]),button.act__choice');
    f && setTimeout(() => f.focus({ preventScroll: true }), 60);
  };
  const open = (email = '') => {
    lastFocus = d.activeElement;
    if (email) { lead.email = email; act.querySelectorAll('[name=email]').forEach(i => i.value = email); }
    act.classList.add('open'); requestAnimationFrame(() => { act.classList.add('show'); recheck(); });
    d.body.style.overflow = 'hidden';
    go(0);
    window.dataLayer && dataLayer.push({ event: 'trial_open', page: location.pathname });
  };
  const close = () => {
    act.classList.remove('show'); clearTimeout(timer);
    setTimeout(() => { act.classList.remove('open'); d.body.style.overflow = ''; lastFocus && lastFocus.focus(); }, 300);
  };
  act.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
  addEventListener('keydown', e => { if (e.key === 'Escape' && act.classList.contains('open')) close(); });

  d.addEventListener('click', e => {
    const a = e.target.closest('[data-activate]');
    if (!a || a.tagName === 'FORM') return;
    e.preventDefault();
    const form = a.closest('form');
    open(form ? (form.querySelector('input[type=email]') || {}).value || '' : '');
  });
  d.querySelectorAll('form[data-activate]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault(); open((f.querySelector('input[type=email]') || {}).value || '');
  }));
  d.querySelectorAll('[data-wa]').forEach(a => a.href = CONFIG.whatsapp);

  // step 1: goals
  act.querySelectorAll('.act__choice').forEach(c => c.addEventListener('click', () => {
    c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') !== 'true');
  }));
  const valid = {
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
    name: v => v.trim().length >= 3,
    phone: v => v.replace(/\D/g, '').length === 10
  };
  const check = (inp) => { const ok = valid[inp.name](inp.value); inp.closest('.fld').classList.toggle('err', !ok); return ok; };
  act.querySelectorAll('.fld input').forEach(i => i.addEventListener('blur', () => i.value && check(i)));
  const phone = act.querySelector('[name=phone]');
  phone && phone.addEventListener('input', () => {
    const n = phone.value.replace(/\D/g, '').slice(0, 10);
    // MX: CDMX/GDL/MTY use 2-digit area codes (55 1234 5678); the rest 3-3-4 (998 123 4567)
    const re = /^(55|56|33|81)/.test(n) ? /^(\d{0,2})(\d{0,4})(\d{0,4}).*/ : /^(\d{0,3})(\d{0,3})(\d{0,4}).*/;
    phone.value = n.replace(re, (m, a, b, c) => [a, b, c].filter(Boolean).join(' '));
  });

  act.querySelector('[data-next]').addEventListener('click', () => {
    lead.goal = [...act.querySelectorAll('.act__choice[aria-pressed=true]')].map(c => c.dataset.goal);
    if (!lead.goal.length) lead.goal = ['facturar'];
    const e1 = act.querySelector('#act-email'), e2 = act.querySelector('#act-email2');
    if (e1.value && valid.email(e1.value)) { lead.email = e1.value.trim(); e2.value = lead.email; }
    else if (e1.value) { check(e1); return; }
    go(1);
  });
  act.querySelector('[data-back]').addEventListener('click', () => go(0));
  act.querySelector('#act-form').addEventListener('submit', e => {
    e.preventDefault();
    const ins = [...e.target.querySelectorAll('.fld input')];
    const ok = ins.map(check).every(Boolean);
    if (!ok) { ins.find(i => i.closest('.fld').classList.contains('err')).focus(); return; }
    ins.forEach(i => lead[i.name] = i.value.trim());
    try { localStorage.setItem('fx_lead', JSON.stringify({ ...lead, ts: Date.now() })); } catch (_) {}
    window.dataLayer && dataLayer.push({ event: 'trial_activation', goal: lead.goal.join(','), page: location.pathname });
    act.querySelector('[data-name]').textContent = lead.name.split(' ')[0];
    go(2); runDone();
  });

  function runDone() {
    const items = [...act.querySelectorAll('.act__list li')];
    items.forEach(li => li.className = '');
    let k = 0;
    const next = () => {
      if (k > 0) items[k - 1].className = 'ok';
      if (k < items.length) { items[k].className = 'run'; k++; timer = setTimeout(next, RM ? 50 : 900); }
      else startRedirect();
    };
    next();
  }
  function startRedirect() {
    const bar = act.querySelector('.act__bar i'), sec = act.querySelector('[data-sec]');
    const ms = CONFIG.redirectDelay, t0 = Date.now();
    bar.style.transition = 'none'; bar.style.width = '0';
    requestAnimationFrame(() => { bar.style.transition = `width ${ms}ms linear`; bar.style.width = '100%'; });
    const tick = () => {
      const left = Math.max(0, Math.ceil((ms - (Date.now() - t0)) / 1000));
      sec.textContent = left;
      if (left > 0) timer = setTimeout(tick, 250); else location.href = CONFIG.redirect;
    };
    tick();
  }
  act.querySelector('[data-go]').addEventListener('click', () => { location.href = CONFIG.redirect; });
})();
