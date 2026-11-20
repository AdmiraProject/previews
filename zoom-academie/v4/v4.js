/* Zoom Académie v4 — page interactions (header, mega panel, tabs, sub-nav, forms → engine). */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => innerWidth < 768;

  /* ---------- hero video: mobile source, eager ---------- */
  $$('[data-hero-v]').forEach(v => {
    const m = mobile();
    if (m && v.dataset.posterM) v.poster = v.dataset.posterM;
    v.src = m ? (v.dataset.srcM || v.dataset.srcD) : v.dataset.srcD;
    // file itself opens on the wide crowd shot (no seeking needed)
    if (RM) { v.removeAttribute('autoplay'); v.pause(); } else v.play().catch(() => {});
  });
  /* lazy background / card videos: load + play in view */
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { if (!v.src && v.dataset.src) v.src = v.dataset.src; if (!RM) v.play().catch(() => {}); }
    else if (v.src) v.pause();
  }), { rootMargin: '200px 0px' });
  $$('[data-lazyv]').forEach(v => vio.observe(v));

  /* ---------- header: utility bar scroll-away, solid after hero ---------- */
  const top = $('[data-top]'), sub = $('[data-sub]'), heroEnd = $('[data-hero-end]');
  let lastY = scrollY;
  function onScroll() {
    const y = scrollY;
    top.classList.toggle('is-scrolled', y > 28);
    top.classList.toggle('is-solid', y > 400);
    if (sub && heroEnd) {
      const past = heroEnd.getBoundingClientRect().bottom < 82;
      const down = y > lastY;
      if (past && down) { sub.classList.add('on'); top.classList.add('is-hidden'); }
      else if (!past || (!down && lastY - y > 4)) { sub.classList.remove('on'); top.classList.remove('is-hidden'); }
      if (!past) sub.classList.remove('on');
    }
    lastY = y;
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- mega panel (click to open) ---------- */
  const megaBtn = $('[data-mega]'), mega = $('#mega'), blur = $('[data-blur]');
  function mega_(on) { if (!mega) return; mega.classList.toggle('on', on); blur.classList.toggle('on', on); megaBtn.setAttribute('aria-expanded', on); }
  if (megaBtn) megaBtn.addEventListener('click', e => { e.stopPropagation(); mega_(!mega.classList.contains('on')); });
  if (blur) blur.addEventListener('click', () => mega_(false));
  if (mega) mega.addEventListener('click', e => { if (e.target.closest('a,button')) mega_(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { mega_(false); mm_(false); } });

  /* ---------- mobile menu ---------- */
  const mm = $('[data-mm]');
  function mm_(on) { if (!mm) return; mm.classList.toggle('on', on); mm.setAttribute('aria-hidden', !on); document.documentElement.classList.toggle('za-lock', on); }
  $$('[data-mm-open]').forEach(b => b.addEventListener('click', () => mm_(true)));
  $$('[data-mm-close]').forEach(b => b.addEventListener('click', () => mm_(false)));
  if (mm) mm.addEventListener('click', e => { if (e.target.closest('[data-enroll],[data-cart-open]')) mm_(false); });

  /* ---------- catalogue tabs + inline selector ---------- */
  const tabs = $$('.tab[data-tab]'), csel = $('[data-csel]');
  function tab_(i) {
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i); const p = document.getElementById(t.getAttribute('aria-controls')); if (p) p.hidden = k !== i; });
    if (csel) { const o = $$('.csel-m [data-tabto]')[i]; $('[data-csel-l]').textContent = o.textContent; }
  }
  tabs.forEach((t, i) => t.addEventListener('click', () => tab_(i)));
  if (csel) {
    const menu = csel.parentElement.querySelector('.csel-m');
    csel.addEventListener('click', e => { e.stopPropagation(); const on = !menu.classList.contains('on'); menu.classList.toggle('on', on); csel.setAttribute('aria-expanded', on); });
    menu.addEventListener('click', e => { const b = e.target.closest('[data-tabto]'); if (!b) return; tab_(+b.dataset.tabto); menu.classList.remove('on'); csel.setAttribute('aria-expanded', false); });
    document.addEventListener('click', () => { menu.classList.remove('on'); csel.setAttribute('aria-expanded', false); });
  }

  /* ---------- generic tab groups (stories / kit) with prev-next ---------- */
  $$('[data-tg]').forEach(g => {
    const ts = $$('[role=tab]', g), ps = ts.map(t => document.getElementById(t.getAttribute('aria-controls')));
    let cur = Math.max(0, ts.findIndex(t => t.getAttribute('aria-selected') === 'true'));
    const set = i => { cur = (i + ts.length) % ts.length; ts.forEach((t, k) => { t.setAttribute('aria-selected', k === cur); t.tabIndex = k === cur ? 0 : -1; if (ps[k]) ps[k].hidden = k !== cur; }); };
    ts.forEach((t, i) => t.addEventListener('click', () => set(i)));
    $$('[data-prev]', g.closest('[data-tgw]') || g).forEach(b => b.addEventListener('click', () => set(cur - 1)));
    $$('[data-next]', g.closest('[data-tgw]') || g).forEach(b => b.addEventListener('click', () => set(cur + 1)));
    set(cur);
  });

  /* ---------- program sub-nav: scroll-spy + jump-to ---------- */
  if (sub) {
    const links = $$('nav a', sub), secs = links.map(a => document.querySelector(a.getAttribute('href')));
    const spy = () => {
      let k = -1; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < 140) k = i; });
      links.forEach((a, i) => a.classList.toggle('is-on', i === k));
      const lab = $('[data-jump-l]'); if (lab) lab.textContent = k >= 0 ? links[k].textContent : lab.dataset.def;
    };
    addEventListener('scroll', spy, { passive: true }); spy();
    const j = $('.jump', sub);
    if (j) { $('button', j).addEventListener('click', e => { e.stopPropagation(); j.classList.toggle('on'); }); j.addEventListener('click', e => { if (e.target.closest('a')) j.classList.remove('on'); }); document.addEventListener('click', () => j.classList.remove('on')); }
  }
  $$('[data-focus-form]').forEach(b => b.addEventListener('click', e => {
    e.preventDefault(); const f = $('#empezar'); if (!f) return;
    f.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' });
    setTimeout(() => { const i = $('input:not([type=hidden])', f); if (i) i.focus({ preventScroll: true }); }, RM ? 0 : 500);
  }));

  /* ---------- custom listboxes ---------- */
  const ZA = window.ZA || {}, LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  $$('[data-lb]').forEach(f => {
    const key = f.dataset.lb, opts = ((ZA.enroll || {})[key] || {})[LANG] || [];
    const btn = $('.sel', f), ul = $('ul', f), hid = $('input[type=hidden]', f);
    ul.innerHTML = opts.map((o, i) => `<li role="option" data-i="${i}" aria-selected="false">${o}</li>`).join('');
    const close = () => { f.classList.remove('open'); btn.setAttribute('aria-expanded', false); };
    btn.addEventListener('click', e => { e.stopPropagation(); $$('[data-lb].open').forEach(x => x !== f && x.classList.remove('open')); const on = !f.classList.contains('open'); f.classList.toggle('open', on); btn.setAttribute('aria-expanded', on); });
    ul.addEventListener('click', e => {
      const li = e.target.closest('li'); if (!li) return;
      hid.value = li.dataset.i; btn.textContent = li.textContent; f.classList.add('has'); f.classList.remove('bad');
      $$('li', ul).forEach(x => x.setAttribute('aria-selected', x === li)); close();
    });
    document.addEventListener('click', close);
  });

  /* ---------- inline lead forms → engine activation flow ---------- */
  const T = LANG === 'en'
    ? { name: 'Enter your name', email: 'Check your email', phone: 'Check your phone', pick: 'Choose an option' }
    : { name: 'Escribe tu nombre', email: 'Revisa tu correo', phone: 'Revisa tu teléfono', pick: 'Elige una opción' };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function runEngine(goal, when, v) {
    const Z = window.ZAC; if (!Z) return;
    Z.enroll('event-live');
    const modal = $('.za-modal');
    const pick = async (i) => { await wait(60); const b = $$('.za-opt', modal)[i]; if (b) b.click(); await wait(240); };
    await pick(goal); await pick(when);
    const f = $('.za-form', modal); if (!f) return;
    f.querySelector('[name=name]').value = v.name; f.querySelector('[name=email]').value = v.email; f.querySelector('[name=phone]').value = v.phone;
    f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', { cancelable: true }));
  }
  $$('form[data-lead]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    if ((f.querySelector('[name=extraNotes]') || {}).value) return; // honeypot
    const d = Object.fromEntries(new FormData(f)); let ok = true;
    const bad = (n, m) => { ok = false; const fl = f.querySelector(`[name=${n}]`).closest('.fld'); fl.classList.add('bad'); fl.dataset.err = m; };
    $$('.fld', f).forEach(x => x.classList.remove('bad'));
    if ((d.firstName || '').trim().length < 2) bad('firstName', T.name);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(d.email || '')) bad('email', T.email);
    if ((d.phone || '').replace(/\D/g, '').length < 7) bad('phone', T.phone);
    if (d.goal === '') bad('goal', T.pick);
    if (d.when === '') bad('when', T.pick);
    if (!ok) { const b = $('.fld.bad input:not([type=hidden]), .fld.bad .sel', f); if (b) b.focus(); return; }
    const name = [d.firstName, d.lastName].map(s => (s || '').trim()).filter(Boolean).join(' ');
    const phone = (d.cc || '') + ' ' + d.phone.trim();
    runEngine(+d.goal, +d.when, { name, email: d.email.trim(), phone });
  }));
  $$('form[data-lead] input').forEach(i => i.addEventListener('input', () => i.closest('.fld').classList.remove('bad')));

  /* ---------- marquees: pause offscreen ---------- */
  const mio = new IntersectionObserver(es => es.forEach(e => e.target.style.animationPlayState = e.isIntersecting ? '' : 'paused'));
  $$('.wall-t,.mq-t,.tmq-t,.lmq-t').forEach(t => mio.observe(t));
})();
