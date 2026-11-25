
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const D = window.PHARMATH || { byId: {} };
  const root = document.documentElement; root.classList.add('js'); root.classList.remove('nojs');
  const mq = matchMedia('(max-width: 767px)');
  const BASE = '../../assets/';

  
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; const el = e.target; const d = +el.dataset.aosDelay || 0;
    el.style.transitionDelay = d + 'ms'; el.classList.add('aos-animate'); io.unobserve(el);
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('[data-aos], .cu__card, .fb').forEach(el => io.observe(el));

  
  const tickSpeed = () => $$('.tick__track').forEach(tr => { const g = tr.firstElementChild; if (g) tr.style.animationDuration = (g.getBoundingClientRect().width / 31).toFixed(2) + 's'; });
  tickSpeed(); addEventListener('load', tickSpeed); addEventListener('resize', tickSpeed);

  
  const imgIO = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; const im = e.target; const on = () => im.classList.add('is-in'); if (im.complete) on(); else im.addEventListener('load', on, { once: true }); imgIO.unobserve(im); }), { rootMargin: '0px 0px -5% 0px' });
  $$('main img').forEach(im => imgIO.observe(im));

  
  const hdr = $('.hdr'), ann = $('.ann');
  const onScroll = () => { if (!hdr) return; const lim = ann ? ann.offsetHeight : 0; hdr.classList.toggle('is-fixed', scrollY > lim); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  
  const trig = $('[data-mega]'), mega = $('.mega');
  if (trig && mega) {
    let t; const open = v => { clearTimeout(t); mega.classList.toggle('is-open', v); trig.setAttribute('aria-expanded', v); };
    const canHover = matchMedia('(hover: hover)').matches;
    if (canHover) { [trig, mega].forEach(el => { el.addEventListener('mouseenter', () => open(true)); el.addEventListener('mouseleave', () => { t = setTimeout(() => open(false), 120); }); }); }
    trig.addEventListener('click', e => { e.preventDefault(); open(!mega.classList.contains('is-open')); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') open(false); });
    document.addEventListener('click', e => { if (!e.target.closest('.mega, [data-mega]')) open(false); });
  }

  
  $$('[data-car]').forEach(car => {
    const vp = $('.car__vp', car); if (!vp) return;
    const dots = $('.dots', car);
    const pages = () => Math.max(1, Math.round(vp.scrollWidth / Math.max(1, vp.clientWidth)));
    const build = () => { if (dots) dots.innerHTML = Array.from({ length: pages() }, (_, i) => `<button type="button" aria-label="${i + 1}"></button>`).join(''); sync(); };
    const idx = () => Math.min(pages() - 1, Math.round(vp.scrollLeft / Math.max(1, vp.clientWidth)));
    const go = i => { const n = pages(); i = (i + n) % n; vp.scrollTo({ left: i * vp.clientWidth, behavior: 'smooth' }); };
    function sync() { if (dots) [...dots.children].forEach((b, i) => b.classList.toggle('is-on', i === idx())); }
    vp.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true }); build(); addEventListener('resize', build); addEventListener('load', build);
    dots && dots.addEventListener('click', e => { const b = e.target.closest('button'); if (b) go([...dots.children].indexOf(b)); });
    $$('.car__arr', car).forEach(a => a.addEventListener('click', () => go(idx() + (a.classList.contains('car__arr--n') ? 1 : -1))));
  });

  
  function slider(el) {
    const track = $('[data-track]', el); if (!track) return; const n = track.children.length; let i = 0;
    const dots = $('.dots', el); if (dots) dots.innerHTML = Array.from({ length: n }, (_, k) => `<button type="button" aria-label="${k + 1}"></button>`).join('');
    const set = k => { i = (k + n) % n; track.style.transform = `translateX(${-100 * i}%)`; dots && [...dots.children].forEach((b, j) => b.classList.toggle('is-on', j === i)); };
    dots && dots.addEventListener('click', e => { const b = e.target.closest('button'); if (b) set([...dots.children].indexOf(b)); });
    $$('[data-prev]', el).forEach(b => b.addEventListener('click', () => set(i - 1)));
    $$('[data-next]', el).forEach(b => b.addEventListener('click', () => set(i + 1)));
    let x0 = null; track.addEventListener('pointerdown', e => { x0 = e.clientX; });
    track.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; if (Math.abs(dx) > 40) set(i + (dx < 0 ? 1 : -1)); x0 = null; });
    if (el.dataset.auto) setInterval(() => { if (!el.matches(':hover')) set(i + 1); }, +el.dataset.auto);
    set(0); el._set = set;
  }
  $$('[data-slider]').forEach(slider);

  
  $$('.ai__q').forEach(q => q.addEventListener('click', () => {
    const it = q.closest('.ai'), a = $('.ai__a', it), open = !it.classList.contains('is-open');
    a.style.height = a.scrollHeight + 'px'; if (!open) requestAnimationFrame(() => { a.style.height = '0px'; });
    else a.addEventListener('transitionend', function f() { if (it.classList.contains('is-open')) a.style.height = 'auto'; a.removeEventListener('transitionend', f); });
    it.classList.toggle('is-open', open); q.setAttribute('aria-expanded', open);
  }));

  
  const kits = $$('[data-kit]');
  if (kits.length) {
    const want = new URLSearchParams(location.search).get('p');
    const pick = kits.find(k => k.dataset.kit === want) || kits.find(k => !k.hidden);
    kits.forEach(k => { k.hidden = k !== pick; });
    if (pick) { const n = pick.dataset.name; if (n) document.title = n + ' · Pharmath'; $$('[data-slider]', pick).forEach(s => s._set && s._set(0)); }
    $$('[data-lang-link]').forEach(a => { if (want) a.href = a.getAttribute('href').split('?')[0] + '?p=' + encodeURIComponent(pick.dataset.kit); });
    $$('.qty').forEach(q => { const inp = $('input', q); q.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; inp.value = Math.max(1, Math.min(10, (+inp.value || 1) + (b.dataset.d === '+' ? 1 : -1))); }); });
  }

  
  $$('.sort').forEach(s => {
    const btn = $('button', s), grid = $('.cg');
    btn.addEventListener('click', () => s.classList.toggle('is-open'));
    $$('li button', s).forEach(o => o.addEventListener('click', () => {
      const k = o.dataset.k; const cards = $$('.gc', grid);
      cards.sort((a, b) => k === 'asc' ? a.dataset.price - b.dataset.price : k === 'desc' ? b.dataset.price - a.dataset.price : a.dataset.i - b.dataset.i).forEach(c => grid.appendChild(c));
      btn.firstChild.textContent = o.textContent + ' '; s.classList.remove('is-open');
    }));
    document.addEventListener('click', e => { if (!s.contains(e.target)) s.classList.remove('is-open'); });
  });

  
  $$('.nl').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); const i = $('input', f); if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value.trim())) { i.focus(); return; } f.classList.add('is-done'); }));

  
  const bag = $('#bag');
  if (bag) {
    const fix = () => $$('.bag__line', bag).forEach(l => { const p = D.byId[l.dataset.id], im = $('.bag__img', l); if (p && im && im.tagName === 'IMG') { const src = BASE + (p.thumb || p.box || 'img/kits/box.png'); if (im.getAttribute('src') !== src) im.setAttribute('src', src); } });
    new MutationObserver(fix).observe($('[data-bag-lines]', bag), { childList: true }); fix();
    const top = () => { const h = $('.hdr'); bag.style.setProperty('--bag-top', h ? Math.max(0, h.getBoundingClientRect().bottom) + 'px' : '0px'); };
    document.addEventListener('ph:add', top); addEventListener('scroll', top, { passive: true }); top();
    $$('[data-bag-open]').forEach(b => b.addEventListener('click', top));
  }

  
  const fd = $('[data-finder]');
  if (fd) {
    const steps = $$('.fd__step', fd), bar = $('.fd__bar i'), hist = []; const ans = {};
    const show = id => { steps.forEach(s => s.classList.toggle('is-on', s.dataset.step === id)); const k = steps.findIndex(s => s.dataset.step === id); bar.style.width = (id === 'intro' ? 4 : id.startsWith('r-') ? 100 : 18 + k * 18) + '%'; scrollTo({ top: 0, behavior: 'smooth' }); };
    fd.addEventListener('click', e => {
      const o = e.target.closest('.fd__o');
      if (o) { const st = o.closest('.fd__step'); $$('.fd__o', st).forEach(x => { x.classList.toggle('is-sel', x === o); x.setAttribute('aria-checked', x === o); }); $('.fd__go', st).disabled = false; ans[st.dataset.step] = o.dataset.next; return; }
      const g = e.target.closest('[data-go]');
      if (g) { const st = g.closest('.fd__step'); const nx = g.dataset.go === 'sel' ? ans[st.dataset.step] : g.dataset.go; if (!nx) return; hist.push(st.dataset.step); show(nx); return; }
      if (e.target.closest('[data-back]')) { const p = hist.pop(); if (p) show(p); }
    });
    show('intro');
  }
})();
