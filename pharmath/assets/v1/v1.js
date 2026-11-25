
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desk = () => innerWidth > 1024;

  
  const hdr = $('[data-hdr]');
  if (hdr) {
    const onScroll = () => hdr.classList.toggle('is-scrolled', scrollY > 0 || document.body.classList.contains('no-bn'));
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  
  let openKey = null, tOpen, tClose;
  const setMega = key => {
    openKey = key;
    $$('[data-mega]').forEach(b => b.setAttribute('aria-expanded', String(b.dataset.mega === key)));
    $$('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== key; });
    hdr && hdr.classList.toggle('is-panel', !!key);
  };
  $$('[data-mega]').forEach(b => {
    b.addEventListener('mouseenter', () => { if (!desk()) return; clearTimeout(tClose); clearTimeout(tOpen); tOpen = setTimeout(() => setMega(b.dataset.mega), openKey ? 0 : 140); });
    b.addEventListener('mouseleave', () => clearTimeout(tOpen));
    b.addEventListener('click', () => setMega(openKey === b.dataset.mega ? null : b.dataset.mega));
  });
  if (hdr) {
    hdr.addEventListener('mouseleave', () => { clearTimeout(tOpen); tClose = setTimeout(() => setMega(null), 180); });
    hdr.addEventListener('mouseenter', () => clearTimeout(tClose));
    $$('.hdr__nav > a, .hdr__logo, .hdr__r').forEach(a => a.addEventListener('mouseenter', () => { if (desk()) { clearTimeout(tOpen); tClose = setTimeout(() => setMega(null), 120); } }));
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { setMega(null); closeDraw(); } });

  
  const burger = $('[data-burger]'), draw = $('[data-mdraw]');
  function closeDraw() { if (!draw || draw.hidden) return; draw.hidden = true; hdr.classList.remove('is-menu'); burger.setAttribute('aria-expanded', 'false'); document.documentElement.classList.remove('ph-lock'); }
  if (burger && draw) burger.addEventListener('click', () => {
    if (!draw.hidden) return closeDraw();
    const r = hdr.getBoundingClientRect(); draw.style.top = r.bottom + 'px';
    draw.hidden = false; hdr.classList.add('is-menu'); burger.setAttribute('aria-expanded', 'true'); document.documentElement.classList.add('ph-lock');
  });
  $$('.macc__b').forEach(b => b.addEventListener('click', () => { const m = b.parentElement, o = !m.classList.contains('is-open'); m.classList.toggle('is-open', o); b.setAttribute('aria-expanded', String(o)); }));

  
  $$('[data-acc-group]').forEach(g => {
    const items = $$(':scope > li, :scope > .acc', g);
    items.forEach(it => { const b = $('button', it); if (!b) return;
      b.addEventListener('click', () => { const o = !it.classList.contains('is-open');
        if (!g.hasAttribute('data-multi')) items.forEach(x => { x.classList.remove('is-open'); const xb = $('button', x); xb && xb.setAttribute('aria-expanded', 'false'); });
        it.classList.toggle('is-open', o); b.setAttribute('aria-expanded', String(o)); }); });
  });

  
  $$('.wpc__steps').forEach(list => {
    const steps = $$('.wpc__step', list);
    const open = s => steps.forEach(x => { const on = x === s; x.classList.toggle('is-open', on); $('.wpc__tr', x).setAttribute('aria-expanded', String(on)); });
    steps.forEach(s => { $('.wpc__tr', s).addEventListener('click', () => open(s)); s.addEventListener('mouseenter', () => { if (desk()) open(s); }); });
  });

  
  $$('.ftr__ch').forEach(b => b.addEventListener('click', () => { if (innerWidth > 768) return; const c = b.parentElement, o = !c.classList.contains('is-open'); c.classList.toggle('is-open', o); b.setAttribute('aria-expanded', String(o)); }));

  
  $$('[data-news]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); const em = f.elements.email;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim())) { em.focus(); em.style.boxShadow = '0 0 0 2px #f1b3a8'; return; }
    em.style.boxShadow = ''; $('.ftr__ok', f).hidden = false; f.reset(); }));

  
  const rev = $$('[data-reveal="pending"]');
  if (RM || !('IntersectionObserver' in window)) rev.forEach(e => e.dataset.reveal = 'revealed');
  else { const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.dataset.reveal = 'revealed'; io.unobserve(en.target); } }), { threshold: .25 }); rev.forEach(e => io.observe(e)); }
  const fades = $$('.fade');
  if (RM || !('IntersectionObserver' in window)) fades.forEach(e => e.classList.add('is-in'));
  else { const fo = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); fo.unobserve(en.target); } }), { threshold: .12 }); fades.forEach(e => fo.observe(e)); }

  
  $$('[data-car]').forEach(c => { const tr = $('[data-car-track]', c); if (!tr) return;
    $$('[data-car-prev],[data-car-next]', c).forEach(b => b.addEventListener('click', () => { const it = tr.firstElementChild; const w = it ? it.getBoundingClientRect().width + 24 : 300; tr.scrollBy({ left: b.hasAttribute('data-car-next') ? w : -w, behavior: RM ? 'auto' : 'smooth' }); })); });

  
  $$('[data-mini]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); const em = f.elements.email;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim())) { em.focus(); em.style.boxShadow = 'inset 0 0 0 2px #d16aa9'; return; }
    em.style.boxShadow = ''; const ok = $('.fres__ok', f); if (ok) ok.hidden = false; f.reset(); }));
  
  $$('[data-exs]').forEach(x => { const sl = $$('.exs__s', x); let i = 0;
    const go = d => { sl[i].classList.toggle('is-on', false); i = (i + d + sl.length) % sl.length; sl[i].classList.toggle('is-on', true); };
    $$('[data-exs-prev]', x).forEach(b => b.addEventListener('click', () => go(-1)));
    $$('[data-exs-next]', x).forEach(b => b.addEventListener('click', () => go(1))); });
  window.PHV1 = { $, $$, RM, desk };
})();


(function () {
  const { $, $$ } = window.PHV1 || {}; if (!$) return;
  const kits = $$('[data-kit]'); if (!kits.length) return;
  let cur = null, sio = null;
  function watchAtc() {
    $$('.sbar').forEach(b => b.classList.remove('is-on'));
    if (sio) sio.disconnect();
    const atc = $('.buy__atc', cur), bar = $('.sbar', cur); if (!atc || !bar) return;
    sio = new IntersectionObserver(([e]) => {
      const past = !e.isIntersecting && e.boundingClientRect.top < 0;
      bar.classList.toggle('is-on', past); bar.setAttribute('aria-hidden', String(!past));
      $$('[tabindex]', bar).forEach(x => { x.tabIndex = past ? 0 : -1; });
    }, { threshold: 0 });
    sio.observe(atc);
  }
  function show(h, push) {
    const k = kits.find(x => x.dataset.kit === h) || kits.find(x => !x.hidden) || kits[0];
    kits.forEach(x => { x.hidden = x !== k; });
    cur = k; document.title = k.dataset.title;
    if (push) history.pushState({ p: k.dataset.kit }, '', '?p=' + k.dataset.kit);
    k.querySelectorAll('.fade').forEach(f => f.classList.add('is-in'));
    watchAtc();
  }
  show(new URLSearchParams(location.search).get('p'), false);
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-opt]'); if (!a || e.metaKey || e.ctrlKey) return;
    e.preventDefault(); show(a.dataset.opt, true); scrollTo({ top: 0, behavior: 'auto' });
  });
  addEventListener('popstate', () => show(new URLSearchParams(location.search).get('p'), false));
  $$('[data-gal]').forEach(g => {
    const tr = $('.gal__track', g), dots = $$('.gal__dots span', g);
    tr.addEventListener('scroll', () => {
      const i = Math.round(tr.scrollLeft / (tr.firstElementChild.getBoundingClientRect().width + 8));
      dots.forEach((d, j) => d.classList.toggle('is-on', j === i));
    }, { passive: true });
  });
  const tio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) en.target.classList.add('is-in'); }), { rootMargin: '0px 0px -40% 0px' });
  $$('.tl__it').forEach(i => tio.observe(i));
})();


(function () {
  const { $, $$ } = window.PHV1 || {}; if (!$) return;
  const cat = $('[data-cat]');
  if (cat) {
    const apply = () => { const tag = (location.hash || '#todos').slice(1) || 'todos';
      const ok = $$('.snav__a').some(a => a.dataset.tab === tag) ? tag : 'todos';
      $$('.snav__a').forEach(a => a.classList.toggle('is-on', a.dataset.tab === ok));
      $$('.pcard', cat).forEach(c => { c.hidden = !c.dataset.tags.split(' ').includes(ok); }); };
    addEventListener('hashchange', apply); apply();
    $$('.snav__a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); history.replaceState(null, '', '#' + a.dataset.tab); apply(); }));
  }
  const toc = $('[data-toc]');
  if (toc) { const b = $('.toc__b', toc); b.addEventListener('click', () => { const o = !toc.classList.contains('is-open'); toc.classList.toggle('is-open', o); b.setAttribute('aria-expanded', String(o)); });
    $$('.toc__c a', toc).forEach(a => a.addEventListener('click', () => { toc.classList.toggle('is-open', false); b.setAttribute('aria-expanded', 'false'); })); }
  $$('[data-ltabs]').forEach(w => { const bs = $$('.ltabs__b', w), ps = $$('.ltabs__p', w); let i = 0;
    const go = n => { i = (n + bs.length) % bs.length; bs.forEach((b, j) => { b.classList.toggle('is-on', j === i); b.setAttribute('aria-selected', String(j === i)); }); ps.forEach((p, j) => p.classList.toggle('is-on', j === i)); };
    bs.forEach((b, j) => b.addEventListener('click', () => go(j)));
    const pv = $('[data-lt-prev]', w), nx = $('[data-lt-next]', w); if (pv) pv.addEventListener('click', () => go(i - 1)); if (nx) nx.addEventListener('click', () => go(i + 1)); });
  const st = $('[data-stabs]');
  if (st) { const links = $$('a', st), secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(a => a.classList.toggle('is-on', a.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(s => io.observe(s)); }
  const bm = $('[data-board-more]'); if (bm) bm.addEventListener('click', () => bm.closest('.board').classList.add('is-all'));

  const reg = $('[data-reg]');
  if (reg) {
    const steps = $$('.auth__step', reg), dots = $$('.auth__steps li', reg);
    const go = n => { steps.forEach(s => s.classList.toggle('is-on', s.dataset.step === String(n))); dots.forEach((d, j) => d.classList.toggle('is-on', j < n));
      const cur = steps.find(s => s.dataset.step === String(n)); const f = cur && cur.querySelector('input, select, [tabindex]'); if (f) f.focus({ preventScroll: true }); scrollTo({ top: 0, behavior: 'auto' }); };
    const fmt = v => { const d = v.replace(/\D/g, '').replace(/^52(?=\d{10})/, '').slice(0, 10); return d.length > 6 ? d.slice(0, 2) + ' ' + d.slice(2, 6) + ' ' + d.slice(6) : d.length > 2 ? d.slice(0, 2) + ' ' + d.slice(2) : d; };
    const V = { kit: v => !!v, code: v => v.replace(/[\s-]/g, '').length >= 6, name: v => v.trim().split(/\s+/).filter(w => w.length > 1).length >= 2,
      phone: v => v.replace(/\D/g, '').length === 10, email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), date: v => !!v, age: (v, el) => el.checked, consent: (v, el) => el.checked };
    const check = (form, k) => { const el = form.elements[k]; const ok = V[k](el.value, el); const w = el.closest('[data-f]'); w.classList.toggle('is-bad', !ok); el.setAttribute('aria-invalid', String(!ok)); return ok; };
    const [f1, f2] = steps;
    const tel = f2.elements.phone; tel.addEventListener('input', () => { tel.value = fmt(tel.value); });
    const code = f1.elements.code; code.addEventListener('input', () => { code.value = code.value.toUpperCase(); });
    const today = new Date(); f2.elements.date.min = today.toISOString().slice(0, 10);
    [f1, f2].forEach(f => $$('input, select', f).forEach(el => el.addEventListener('change', () => { const w = el.closest('[data-f]'); if (w && w.classList.contains('is-bad')) check(f, el.name); })));
    const pre = new URLSearchParams(location.search).get('kit'); if (pre) f1.elements.kit.value = pre;
    f1.addEventListener('submit', e => { e.preventDefault(); const bad = ['kit', 'code'].filter(k => !check(f1, k)); if (bad.length) { f1.elements[bad[0]].focus(); return; } go(2); });
    f2.addEventListener('submit', e => { e.preventDefault(); const bad = ['name', 'phone', 'date', 'email', 'age', 'consent'].filter(k => !check(f2, k)); if (bad.length) { f2.elements[bad[0]].focus(); return; }
      const sel = f1.elements.kit.selectedOptions[0]; const lab = sel && sel.dataset.type === 'lab';
      $('[data-next-lab]', reg).hidden = !lab; $('[data-next-rapid]', reg).hidden = lab;
      
      document.dispatchEvent(new CustomEvent('ph:register', { detail: { kit: f1.elements.kit.value, code: f1.elements.code.value } }));
      go(3); });
    $('[data-back]', reg).addEventListener('click', () => go(1));
  }
})();
