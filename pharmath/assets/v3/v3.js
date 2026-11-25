
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desk = matchMedia('(min-width: 990px)');

  
  const rv = $$('.rv-sec, .rv');
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -50px 0px' });
    rv.forEach(el => io.observe(el));
  } else rv.forEach(el => el.classList.add('is-in'));

  
  const hd = $('#hd'), mb = $('[data-menu]'), mn = $('#mnav');
  if (mb && mn) {
    const t = $('.hd__menu-t', mb);
    mb.addEventListener('click', () => {
      const open = !hd.classList.contains('is-open');
      if (open) mn.hidden = false;
      requestAnimationFrame(() => hd.classList.toggle('is-open', open));
      mb.setAttribute('aria-expanded', String(open)); t.textContent = open ? t.dataset.close : t.dataset.open;
      document.documentElement.classList.toggle('ph-lock', open);
    });
  }

  
  $$('[data-steps]').forEach(sec => {
    const track = $('.steps__track', sec), steps = $$('.step', sec);
    let mode = false, idx = -1, manual = false;
    const setActive = (i, force) => {
      if (!force && i === idx) return; idx = i; sec.dataset.active = String(i + 1);
      steps.forEach((s, k) => { if (k === i) s.open = true; else if (mode) s.open = false; });
    };
    const progress = () => { const top = track.getBoundingClientRect().top + scrollY, sc = Math.max(1, track.offsetHeight - innerHeight); return Math.min(1, Math.max(0, (scrollY - top) / sc)); };
    const onScroll = () => { if (!mode || manual) return; setActive(Math.min(steps.length - 1, Math.floor(progress() * steps.length))); };
    const refresh = () => {
      mode = desk.matches && !reduce;
      sec.classList.toggle('is-scroll', mode);
      track.style.height = mode ? `calc(${steps.length} * 100vh)` : '';
      if (mode) onScroll(); else if (idx < 0) setActive(0, true);
    };
    steps.forEach((s, i) => {
      $('summary', s).addEventListener('click', e => {
        if (!mode) { setTimeout(() => { if (s.open) sec.dataset.active = String(i + 1); }, 0); return; }
        e.preventDefault();
        const top = track.getBoundingClientRect().top + scrollY, sc = Math.max(1, track.offsetHeight - innerHeight);
        setActive(i, true); manual = true; scrollTo({ top: top + (i + .5) / steps.length * sc, behavior: 'smooth' });
        setTimeout(() => { manual = false; }, 600);
      });
    });
    addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
    desk.addEventListener('change', refresh); addEventListener('resize', refresh, { passive: true });
    refresh();
  });

  
  $$('[data-carousel]').forEach(tr => {
    const ui = () => { const sc = tr.scrollWidth > tr.clientWidth + 2; tr.classList.toggle('is-scrollable', sc); tr.classList.toggle('at-end', tr.scrollLeft >= tr.scrollWidth - tr.clientWidth - 2); };
    tr.addEventListener('scroll', ui, { passive: true }); addEventListener('resize', ui, { passive: true }); ui();
  });

  
  $$('details.faqs__item, details.acc').forEach(d => {
    const sum = $('summary', d);
    sum.addEventListener('click', e => {
      if (reduce) return; e.preventDefault();
      if (d.open) { d.classList.add('is-closing'); setTimeout(() => { d.open = false; d.classList.remove('is-closing'); }, 300); }
      else { d.open = true; }
    });
  });

  
  $$('[data-gallery]').forEach(g => {
    const panels = $$('.gal__panel', g), thumbs = $$('.gal__thumb', g), cnt = $('[data-gal-n]', g), prev = $('[data-gal-prev]', g), next = $('[data-gal-next]', g);
    let i = 0;
    const go = (n, scroll) => {
      i = Math.max(0, Math.min(panels.length - 1, n));
      panels.forEach((p, k) => p.classList.toggle('is-active', k === i)); thumbs.forEach((t, k) => t.classList.toggle('is-active', k === i));
      if (cnt) cnt.textContent = i + 1; if (prev) prev.disabled = i === 0; if (next) next.disabled = i === panels.length - 1;
      if (scroll && desk.matches) panels[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    };
    thumbs.forEach((t, k) => t.addEventListener('click', () => go(k, true)));
    prev && prev.addEventListener('click', () => go(i - 1, true)); next && next.addEventListener('click', () => go(i + 1, true));
    const dlg = $('dialog', g);
    panels.forEach(p => { const im = $('img', p); if (im && dlg) p.addEventListener('click', () => { if (!desk.matches) return; $('img', dlg).src = im.currentSrc || im.src; dlg.showModal(); }); });
    dlg && dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
    let sx = 0; g.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    g.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40 && e.target.closest('.gal__stage')) go(i + (dx < 0 ? 1 : -1)); }, { passive: true });
    go(0);
  });

  
  const cta = $('[data-main-cta]'), bar = $('.pbar'), fab = $('.fab');
  if (cta && (bar || fab) && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { const past = !e.isIntersecting && e.boundingClientRect.top < 0; bar && bar.classList.toggle('is-on', past); fab && fab.classList.toggle('is-on', past); }).observe(cta);
  }

  
  $$('.plan input').forEach(r => r.addEventListener('change', () => $$('.plan').forEach(p => p.classList.toggle('is-sel', $('input', p).checked))));

  
  $$('[data-tabs]').forEach(w => {
    const tabs = $$('[role=tab]', w), panes = $$('[role=tabpanel]', w);
    tabs.forEach(t => t.addEventListener('click', () => { tabs.forEach(x => x.setAttribute('aria-selected', String(x === t))); panes.forEach(p => p.hidden = p.id !== t.getAttribute('aria-controls')); }));
  });
})();


(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const act = $('[data-act]'); if (!act) return;
  const steps = $$('.act__step', act);
  const show = (name) => { steps.forEach(st => st.classList.toggle('is-on', st.dataset.step === name)); const on = $(`[data-step="${name}"]`, act); const f = on && $('input, select, [tabindex]', on); if (f) setTimeout(() => f.focus({ preventScroll: true }), 60); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); };
  const st = { name: '' };
  const qs = new URLSearchParams(location.search), pre = (qs.get('codigo') || qs.get('code') || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (pre) $('#ac-code').value = pre;
  const kitQ = qs.get('kit'); if (kitQ && $(`#ac-kit option[value="${kitQ}"]`)) $('#ac-kit').value = kitQ;
  $$('[data-go]', act).forEach(b => b.addEventListener('click', () => show(b.dataset.go)));
  const bad = (el, on) => { const f = el.closest('.fld'); if (f) f.classList.toggle('is-bad', on); el.setAttribute('aria-invalid', String(on)); return !on; };
  const email = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  const check = (form) => {
    const F = form.elements; let ok = true; const t = (el, cond) => { ok = bad(el, !cond) && ok; };
    if (F.email) t(F.email, email(F.email.value));
    if (F.pass) t(F.pass, F.pass.value.length >= 8);
    if (F.pass2) t(F.pass2, F.pass2.value === F.pass.value && F.pass2.value.length >= 8);
    if (F.first) t(F.first, F.first.value.trim().length > 1);
    if (F.last) t(F.last, F.last.value.trim().length > 1);
    if (F.day) { const d = +F.day.value, mo = +F.month.value, y = +F.year.value; const dt = new Date(y, mo - 1, d); const valid = !!(d && mo && y) && dt.getDate() === d; const age = valid ? (Date.now() - dt) / 31557600000 : 0; t(F.year, valid && age >= 18); }
    if (F.terms) t(F.terms, F.terms.checked);
    if (F.kit) t(F.kit, !!F.kit.value);
    if (F.code) { const c = F.code.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); F.code.value = c; t(F.code, /^[A-Z0-9]{6,16}$/.test(c)); }
    if (F.consent) t(F.consent, F.consent.checked);
    if (!ok) { const first = $('.is-bad input, .is-bad select', form); if (first) first.focus(); form.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 260 }); }
    return ok;
  };
  $$('input, select', act).forEach(i => i.addEventListener('input', () => { const f = i.closest('.fld'); if (f && f.classList.contains('is-bad')) f.classList.remove('is-bad'); }));
  $$('form.act__step', act).forEach(form => form.addEventListener('submit', e => {
    e.preventDefault(); if (!check(form)) return;
    const step = form.dataset.step, F = form.elements;
    if (step === 'signup') st.name = F.first.value.trim();
    if (step === 'signin') st.name = F.email.value.split('@')[0];
    if (step === 'signin' || step === 'signup') { $('[data-name]', act).textContent = st.name || 'bienvenido'; show('code'); return; }
    if (step === 'code') { $('[data-kit]', act).textContent = F.kit.options[F.kit.selectedIndex].text; $('[data-code]', act).textContent = F.code.value; show('done'); }
  }));
})();
(function () { if (!matchMedia('(min-width: 990px)').matches) document.querySelectorAll('.accs details[open]').forEach(d => { d.open = false; }); })();
(function () { const row = document.querySelector('[data-ugc]'); if (!row) return; const step = () => { const t = row.querySelector('.ugc__tile'); return t ? t.getBoundingClientRect().width + 16 : 300; };
  const p = document.querySelector('[data-ugc-prev]'), n = document.querySelector('[data-ugc-next]');
  const ui = () => { if (p) p.disabled = row.scrollLeft < 4; if (n) n.disabled = row.scrollLeft > row.scrollWidth - row.clientWidth - 4; };
  p && p.addEventListener('click', () => row.scrollBy({ left: -step() * 2 })); n && n.addEventListener('click', () => row.scrollBy({ left: step() * 2 }));
  row.addEventListener('scroll', ui, { passive: true }); ui(); })();
