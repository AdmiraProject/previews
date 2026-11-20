/* Zoom Académie v1 — page behaviour (nav, tabs, sliders, pinned path, inline lead form). */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EN = (document.documentElement.lang || 'es').startsWith('en');
  const mobile = () => innerWidth < 768;

  /* ---------- nav: click dropdowns + mobile sheet ---------- */
  $$('.dd').forEach(dd => {
    const b = $('.dd__btn', dd);
    b.addEventListener('click', e => {
      e.stopPropagation();
      const open = !dd.classList.contains('is-open');
      $$('.dd.is-open').forEach(x => { x.classList.remove('is-open'); $('.dd__btn', x).setAttribute('aria-expanded', 'false'); });
      if (open) { dd.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.dd__panel')) $$('.dd.is-open').forEach(x => x.classList.remove('is-open')); });
  $$('.dd__panel a').forEach(a => a.addEventListener('click', () => $$('.dd.is-open').forEach(x => x.classList.remove('is-open'))));
  const sheet = $('.sheet'), burger = $('.hd__burger');
  const sheetSet = on => { if (!sheet) return; sheet.setAttribute('aria-hidden', on ? 'false' : 'true'); burger && burger.setAttribute('aria-expanded', on); document.documentElement.classList.toggle('za-lock', on); };
  burger && burger.addEventListener('click', () => sheetSet(true));
  sheet && $('.sheet__x', sheet).addEventListener('click', () => sheetSet(false));
  sheet && $$('a', sheet).forEach(a => a.addEventListener('click', () => sheetSet(false)));

  /* ---------- lazy autoplay for muted loops ---------- */
  const vio = new IntersectionObserver(es => es.forEach(x => {
    const v = x.target;
    if (x.isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; if (!RM && v.hasAttribute('autoplay')) v.play().catch(() => {}); }
    else if (!v.paused) v.pause();
  }), { rootMargin: '200px' });
  $$('video[autoplay]').forEach(v => { if (RM) { v.removeAttribute('autoplay'); v.pause(); } vio.observe(v); });
  /* testimonial cards: play loop on hover (desktop) / when visible (mobile) */
  $$('video[data-hover]').forEach(v => {
    const card = v.closest('article') || v.parentElement;
    card.addEventListener('mouseenter', () => { if (!RM) { v.preload = 'auto'; v.play().catch(() => {}); } });
    card.addEventListener('mouseleave', () => v.pause());
  });
  const hov = new IntersectionObserver(es => es.forEach(x => { if (!mobile() || RM) return; const v = x.target; if (x.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); }), { threshold: .6 });
  $$('video[data-hover]').forEach(v => hov.observe(v));

  /* ---------- auto-advancing vertical tabs (programs) ---------- */
  $$('.car').forEach(sec => {
    const tabs = $$('.car__tab', sec), items = $$('.car__it', sec); if (!tabs.length) return;
    let i = 0, inView = false;
    const DUR = 10000;
    const set = n => {
      i = (n + tabs.length) % tabs.length;
      tabs.forEach((t, k) => { t.classList.toggle('is-on', k === i); t.setAttribute('aria-selected', k === i); const f = $('i', t); f.style.animation = 'none'; f.offsetWidth; f.style.animation = ''; });
      items.forEach((t, k) => t.classList.toggle('is-on', k === i));
    };
    tabs.forEach((t, k) => {
      t.style.setProperty('--dur', DUR / 1000 + 's');
      t.addEventListener('click', () => set(k));
      $('i', t).addEventListener('animationend', () => { if (inView && !RM) set(i + 1); });
    });
    const pause = on => tabs.forEach(t => t.classList.toggle('is-paused', on));
    new IntersectionObserver(es => es.forEach(x => { inView = x.isIntersecting; pause(!inView || RM); }), { threshold: .35 }).observe(sec);
    if (RM) pause(true);
  });

  /* ---------- pill tabs (launch kit, team) ---------- */
  $$('[data-pills], .acc').forEach(box => {
    const pills = $$('.pill', box), panes = $$('.acc__pane, [data-pane]', box);
    pills.forEach((p, k) => p.addEventListener('click', () => {
      pills.forEach((x, j) => { x.classList.toggle('is-on', j === k); x.setAttribute('aria-selected', j === k); });
      panes.forEach((x, j) => x.classList.toggle('is-on', j === k));
      box.dispatchEvent(new CustomEvent('pill', { detail: k }));
    }));
  });

  /* ---------- horizontal sliders with arrows ---------- */
  $$('[data-slider], .alu, [data-team]').forEach(sec => {
    const track = $('.alu__track, [data-track]', sec); if (!track) return;
    const prev = $('[data-prev]', sec), next = $('[data-next]', sec); let n = 0;
    const cards = [...track.children];
    const step = () => +sec.dataset.step || (cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 16));
    const max = () => { const vp = track.parentElement.getBoundingClientRect().width; return Math.max(0, Math.ceil((track.scrollWidth - vp) / step())); };
    const go = k => { if (mobile()) return; n = Math.max(0, Math.min(max(), k)); track.style.transform = `translateX(${-n * step()}px)`; prev && (prev.disabled = n === 0); next && (next.disabled = n >= max()); };
    sec.__go = go;
    prev && prev.addEventListener('click', () => go(n - 1));
    next && next.addEventListener('click', () => go(n + 1));
    addEventListener('resize', () => go(n));
    go(0);
  });

  /* ---------- pinned horizontal path: 1:1 linear scroll ---------- */
  $$('.pth').forEach(sec => {
    const pin = $('.pth__pin', sec), clip = $('.pth__clip', sec), track = $('.pth__track', sec);
    let travel = 0;
    const LEAD = 97; // horizontal travel starts when the section top is 97px below the viewport top
    const layout = () => {
      if (mobile()) { sec.style.height = ''; track.style.transform = ''; return; }
      track.style.transform = '';
      const items = track.children, last = items[items.length - 1];
      // the last step comes to rest with its left edge 632px from the viewport's right edge
      travel = Math.max(0, last.getBoundingClientRect().left - (innerWidth - 632));
      sec.style.height = (pin.offsetHeight + travel - LEAD) + 'px';
      tick();
    };
    const tick = () => {
      if (mobile()) return;
      const top = sec.getBoundingClientRect().top;
      const x = Math.min(travel, Math.max(0, LEAD - top));
      track.style.transform = `translate3d(${-x}px,0,0)`;
    };
    addEventListener('scroll', tick, { passive: true });
    addEventListener('resize', layout);
    addEventListener('load', layout);
    layout();
  });

  /* ---------- inline lead form: contact → questions → choose a time ---------- */
  const T = EN ? {
    q1: 'What brings you to Zoom Academy?', q2: 'When would you like to start?', step: 'Step', of: 'of', back: '← Back',
    ready: 'You’re all set, {n}!', go: 'Choose my time slot', to: 'Taking you to the admissions calendar to pick your 15-minute Zoom call in', s: 's',
    errName: 'Enter your name', errEmail: 'Check your email', errPhone: 'Check your phone number'
  } : {
    q1: '¿Qué te trae a Zoom Académie?', q2: '¿Cuándo te gustaría empezar?', step: 'Paso', of: 'de', back: '← Atrás',
    ready: '¡Listo, {n}!', go: 'Elegir mi horario', to: 'Te llevamos a la agenda de admisiones para elegir tu llamada de 15 minutos por Zoom en', s: ' s',
    errName: 'Escribe tu nombre', errEmail: 'Revisa tu correo', errPhone: 'Revisa tu teléfono'
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const TEST = /[?&]test=1/.test(location.search);
  const redirect = url => { window.__zaLast = url; console.info('[ZA] redirect →', url); if (!TEST) location.href = url; };
  $$('[data-lf]').forEach(lf => {
    const f = $('.lf__s1', lf), box = $('.lf__step', lf);
    const trk = lf.closest('.fin') ? $$('[data-trk] li', lf.closest('.fin')) : [];
    const mark = k => trk.forEach((li, j) => li.classList.toggle('is-on', j <= k));
    let lead = null, st = {}, timer;
    const bad = (name, msg) => { const l = $(`[name=${name}]`, f).closest('.lf__f'); l.classList.add('is-bad'); l.dataset.err = msg; };
    f.addEventListener('submit', e => {
      e.preventDefault();
      $$('.lf__f', f).forEach(x => x.classList.remove('is-bad'));
      const v = Object.fromEntries(new FormData(f)); let ok = true;
      if ((v.name || '').trim().length < 2) { bad('name', T.errName); ok = false; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v.email || '')) { bad('email', T.errEmail); ok = false; }
      if ((v.phone || '').replace(/\D/g, '').length < 8) { bad('phone', T.errPhone); ok = false; }
      if (!ok) return;
      lead = { name: v.name.trim(), email: v.email.trim(), phone: (v.cc || '') + ' ' + v.phone.trim() };
      q(1);
    });
    const E = (window.ZA && ZA.enroll) || { goal: { es: [], en: [] }, when: { es: [], en: [] } };
    const L = EN ? 'en' : 'es';
    function q(n) {
      mark(n);
      const key = n === 1 ? 'goal' : 'when', opts = E[key][L];
      f.hidden = true; box.hidden = false;
      box.innerHTML = `<div class="lf__step"><p class="lf__prog">${T.step} ${n + 1} ${T.of} 3 <i><b style="width:${(n + 1) * 33.34}%"></b></i></p><p class="lf__q">${n === 1 ? T.q1 : T.q2}</p><div class="lf__opts">${opts.map((o, i) => `<button type="button" class="lf__opt" data-i="${i}"><span>${esc(o)}</span><i>→</i></button>`).join('')}</div><button type="button" class="lf__back">${T.back}</button></div>`;
      $$('.lf__opt', box).forEach(b => b.addEventListener('click', () => { st[key] = +b.dataset.i; b.classList.add('is-on'); setTimeout(() => n === 1 ? q(2) : done(), 160); }));
      $('.lf__back', box).addEventListener('click', () => { if (n === 1) { box.hidden = true; f.hidden = false; mark(0); } else q(1); });
    }
    function done() {
      mark(2);
      try { localStorage.setItem('za_lead', JSON.stringify({ ...lead, goal: E.goal.en[st.goal], when: E.when.en[st.when], ids: ['event-live'], src: 'inline-form', lang: L, t: Date.now() })); } catch (e) {}
      const d = window.ZAC ? ZAC.destinations(['event-live'])[0] : { url: (window.ZA ? ZA.booking[L] : '/') };
      let s = 5;
      box.innerHTML = `<div class="lf__step lf__done"><p class="lf__prog">${T.step} 3 ${T.of} 3 <i><b style="width:100%"></b></i></p><h3>${T.ready.replace('{n}', esc(lead.name.split(' ')[0]))}</h3><p>${T.to} <b class="lf__s">${s}${T.s}</b></p><div class="lf__bar"><i></i></div><a class="btn btn--dark" href="${esc(d.url)}">${T.go} →</a></div>`;
      requestAnimationFrame(() => requestAnimationFrame(() => { const bar = $('.lf__bar i', box); if (bar) bar.style.transform = 'scaleX(1)'; }));
      $('.btn', box).addEventListener('click', e => { e.preventDefault(); clearInterval(timer); redirect(d.url); });
      clearInterval(timer);
      timer = setInterval(() => { s--; const el = $('.lf__s', box); if (el) el.textContent = Math.max(0, s) + T.s; if (s <= 0) { clearInterval(timer); redirect(d.url); } }, 1000);
    }
  });

  /* ---------- program: team pills -> text + slide ---------- */
  $$('[data-team]').forEach(sec => {
    const pills = $$('.pill', sec), txt = $$('.team__txt', sec), cards = $$('.coach', sec), vp = $('.team__vp', sec);
    pills.forEach((p, k) => p.addEventListener('click', () => {
      pills.forEach((x, j) => { x.classList.toggle('is-on', j === k); x.setAttribute('aria-selected', j === k); });
      txt.forEach((x, j) => x.classList.toggle('is-on', j === k));
      const to = +p.dataset.go || 0;
      if (mobile()) { const c = cards[to]; c && vp.scrollTo({ left: c.offsetLeft - cards[0].offsetLeft, behavior: RM ? 'auto' : 'smooth' }); }
      else sec.__go && sec.__go(to);
    }));
  });
  /* ---------- program: folder tabs ---------- */
  $$('.fld').forEach(sec => {
    const tabs = $$('.fld__tab', sec), ps = $$('.fld__p', sec);
    tabs.forEach((t, k) => t.addEventListener('click', () => { tabs.forEach((x, j) => { x.classList.toggle('is-on', j === k); x.setAttribute('aria-selected', j === k); }); ps.forEach((x, j) => x.classList.toggle('is-on', j === k)); }));
  });
  /* ---------- program: curriculum see-all ---------- */
  $$('[data-cur]').forEach(list => {
    const b = $('[data-cur-more]', list), lbl = $('span', b), t0 = lbl.textContent;
    b.addEventListener('click', () => { const all = list.classList.toggle('is-all'); b.setAttribute('aria-expanded', all); lbl.textContent = all ? (EN ? 'Show less' : 'Ver menos') : t0; if (!all) list.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); });
  });
  /* ---------- program: mini exercise feedback ---------- */
  $$('[data-ex]').forEach(ex => { const fb = $('.ex__fb', ex); $$('input', ex).forEach(i => i.addEventListener('change', () => { fb.hidden = false; })); });

  /* ---------- program hero: dark badge sits on the end of the H1's last line ---------- */
  const badge = $('.phero__badge'), h1 = $('.phero__t');
  const placeBadge = () => {
    if (!badge || !h1) return;
    if (mobile()) { badge.style.left = badge.style.top = ''; return; }
    const r = document.createRange(); r.selectNodeContents(h1);
    const rects = [...r.getClientRects()].filter(x => x.width > 2), last = rects[rects.length - 1], box = h1.parentElement.getBoundingClientRect();
    if (!last) return;
    const bw = badge.offsetWidth, maxL = box.width - bw;
    badge.style.left = Math.max(0, Math.min(maxL, last.right - box.left + 20)) + 'px';
    badge.style.top = (last.bottom - box.top - 44) + 'px';
  };
  addEventListener('resize', placeBadge); addEventListener('load', placeBadge); document.fonts && document.fonts.ready.then(placeBadge); placeBadge();

  /* ---------- keyboard for role=button cards ---------- */
  $$('[role="button"][data-video]').forEach(c => c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.click(); } }));
})();
