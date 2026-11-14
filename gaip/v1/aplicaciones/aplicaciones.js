(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  /* player timecode + pause (formic db-player) */
  const v = $('#pv'), tc = $('#tc'), pp = $('#pp');
  if (v) {
    const tick = () => { tc.textContent = v.currentTime.toFixed(1).padStart(4, '0') + ' s'; requestAnimationFrame(tick); }; tick();
    pp.addEventListener('click', () => { if (v.paused) { v.play(); pp.textContent = 'Pausa'; } else { v.pause(); pp.textContent = 'Reproducir'; } });
  }
  /* subnav scroll spy */
  const links = $$('.db-subnav ul a'), secs = links.map(a => document.getElementById(a.getAttribute('href').slice(1)));
  const spy = () => { let cur = 0; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < 160) cur = i; }); links.forEach((a, i) => a.classList.toggle('on', i === cur)); };
  addEventListener('scroll', spy, { passive: true }); spy();
  /* pause SMIL illustrations offscreen (perf) */
  const io = new IntersectionObserver(es => es.forEach(e => { const s = e.target; try { e.isIntersecting ? s.unpauseAnimations() : s.pauseAnimations(); } catch (_) {} }), { rootMargin: '100px' });
  $$('svg.gpr-ill').forEach(s => io.observe(s));
  /* form */
  const box = $('#dbForm'), f = box && $('form', box);
  f && f.addEventListener('submit', e => {
    e.preventDefault();
    const bad = $$('[required]', f).filter(i => !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value)));
    $$('[required]', f).forEach(i => i.style.borderColor = bad.includes(i) ? '#E5484D' : '');
    if (!bad.length) box.classList.add('sent');
  });
})();
