(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* hero video: 720 on small/slow screens, 1080 otherwise */
  const hv = $('#heroVid');
  if (hv) {
    const big = window.innerWidth > 1100 && !(navigator.connection && navigator.connection.saveData);
    hv.src = big ? hv.dataset.srcLg : hv.dataset.srcSm;
    hv.play().catch(() => {});
    const pb = $('#vPause');
    pb && pb.addEventListener('click', () => { if (hv.paused) { hv.play(); pb.textContent = 'Pausa'; } else { hv.pause(); pb.textContent = 'Reproducir'; } });
  }

  /* lazy section videos: load when near, play only while visible */
  const vids = $$('video[data-src]');
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); }
    else if (v.src) v.pause();
  }), { rootMargin: '200px 0px' });
  vids.forEach(v => vio.observe(v));

  /* feature cards: fixed 671x451 stage scaled to the card (keeps overlay geometry 1:1 at any width) */
  $$('.card').forEach(card => {
    const st = document.createElement('div'); st.className = 'stage';
    while (card.firstChild) st.appendChild(card.firstChild); card.appendChild(st);
    const base = card.closest('.row.rev') ? 675 : 671;
    const fit = () => card.style.setProperty('--k', (card.clientWidth / base).toFixed(4));
    fit(); new ResizeObserver(fit).observe(card);
  });

  /* reveal */
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { threshold: .12 });
  $$('.rv').forEach(el => rio.observe(el));

  /* count-up (results strip) */
  const fmt = n => n.toLocaleString('en-US');
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, t0 = performance.now(), d = 1600;
    const tick = t => { const p = Math.min(1, (t - t0) / d), k = 1 - Math.pow(1 - p, 3); el.textContent = fmt(Math.round(to * k)); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* platform diagram connectors (motive) */
  const tr = $('#trunks'), pu = $('#pulses');
  if (tr) {
    const cx = 580, hubB = 168, hy = 214, top = 249, r = 24;
    const xs = [0, 1, 2, 3, 4, 5].map(i => 83 + 75.5 + i * 168.6);
    let s = '', p = '';
    xs.forEach((x, i) => {
      const left = x < cx, sgn = left ? -1 : 1;
      const d = `M${cx} ${hubB}V${hy - r}Q${cx} ${hy} ${cx + sgn * r} ${hy}H${x - sgn * r}Q${x} ${hy} ${x} ${hy + r}V${top}`;
      s += `<path d="${d}"/>`;
      p += `<path class="pulse" d="${d}" style="animation-delay:${(i * 0.45).toFixed(2)}s"/>`;
    });
    tr.innerHTML = s; pu.innerHTML = p;
  }

  /* sticky product bar + scroll spy */
  const bar = $('#pbar'), rows = $('#rows');
  const links = $$('#pbar a'), ids = links.map(a => a.getAttribute('href').slice(1));
  const onScroll = () => {
    if (!bar || !rows) return;
    const r = rows.getBoundingClientRect();
    bar.classList.toggle('show', r.top < 140 && r.bottom > 300);
    let cur = ids[0];
    ids.forEach(id => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) cur = id; });
    links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur));
  };
  document.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* logo sets crossfade */
  const sets = $$('.logo-set'); let li = 0;
  if (sets.length > 1) setInterval(() => { sets[li].classList.remove('on'); li = (li + 1) % sets.length; sets[li].classList.add('on'); }, 3200);

  /* quote CTAs -> form */
  $$('[data-quote]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); $('#cotiza').scrollIntoView({ behavior: 'smooth' }); setTimeout(() => $('#quoteForm input')?.focus({ preventScroll: true }), 700); }));
  $$('.fld select').forEach(s => s.addEventListener('change', () => s.classList.toggle('set', !!s.value)));
  const f = $('#quoteForm');
  f && f.addEventListener('submit', e => {
    e.preventDefault();
    const bad = $$('[required]', f).filter(i => !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value)));
    $$('[required]', f).forEach(i => i.style.borderColor = bad.includes(i) ? '#E5484D' : '');
    if (!bad.length) f.classList.add('sent');
  });

  /* solutions tiles: play clip only while hovered, reset on leave (formic) */
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) $$('.sol-tile').forEach(t => {
    const v = $('video.sol-anim', t); if (!v) return;
    t.addEventListener('mouseenter', () => { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); });
    t.addEventListener('mouseleave', () => { v.pause(); v.currentTime = 0; });
  });
})();
