(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header: scrolled state + mega menu ---------- */
  const hdr = $('#hdr'), mega = $('#mega'), scrim = $('#scrim');
  const onScroll = () => hdr.classList.toggle('is-scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  let megaT;
  const openMega = (name) => {
    clearTimeout(megaT);
    $$('.nav>li').forEach(li => { const on = li.dataset.mega === name; li.classList.toggle('on', on); const b = li.querySelector('button'); if (b) b.setAttribute('aria-expanded', on); });
    $$('.mega__in').forEach(p => p.classList.toggle('on', p.dataset.panel === name));
    mega.classList.add('on'); mega.setAttribute('aria-hidden', 'false'); scrim.classList.add('on'); hdr.classList.add('is-open');
  };
  const closeMega = () => {
    megaT = setTimeout(() => {
      $$('.nav>li').forEach(li => { li.classList.remove('on'); const b = li.querySelector('button'); if (b) b.setAttribute('aria-expanded', 'false'); });
      mega.classList.remove('on'); mega.setAttribute('aria-hidden', 'true'); scrim.classList.remove('on'); hdr.classList.remove('is-open');
    }, 160);
  };
  $$('.nav>li[data-mega]').forEach(li => {
    li.addEventListener('mouseenter', () => openMega(li.dataset.mega));
    li.addEventListener('mouseleave', closeMega);
    li.querySelector('button').addEventListener('click', () => li.classList.contains('on') ? closeMega() : openMega(li.dataset.mega));
  });
  $$('.nav>li:not([data-mega])').forEach(li => li.addEventListener('mouseenter', closeMega));
  mega.addEventListener('mouseenter', () => clearTimeout(megaT));
  mega.addEventListener('mouseleave', closeMega);
  scrim.addEventListener('click', closeMega);
  mega.addEventListener('click', e => { if (e.target.closest('a')) closeMega(); });

  /* ---------- mobile menu ---------- */
  const mob = $('#mob');
  $('#burger').addEventListener('click', () => mob.classList.add('on'));
  $('#mobx').addEventListener('click', () => mob.classList.remove('on'));
  mob.addEventListener('click', e => { if (e.target.closest('a,button.btn')) mob.classList.remove('on'); });

  /* ---------- hero: crossfading backgrounds driven by the words ---------- */
  const leys = $$('.ley'), words = $$('#sel h2'), bgs = $$('.hero__bg');
  if (innerWidth < 700) $$('.hero__bg video').forEach(v => { v.src = v.getAttribute('src').replace('-1080.mp4', '-540.mp4'); });
  let cur = 0, heroTimer;
  const setHero = (i) => {
    if (i === cur) return;
    cur = i;
    words.forEach(w => w.classList.toggle('active', +w.dataset.i === i));
    leys.forEach(l => l.classList.toggle('active', +l.dataset.i === i));
    bgs.forEach(bg => {
      const on = +bg.dataset.i === i, v = bg.querySelector('video');
      bg.classList.toggle('active', on);
      if (v) { if (on) { if (v.preload === 'none') v.preload = 'auto'; v.currentTime = 0; v.play().catch(() => {}); } else setTimeout(() => v.pause(), 900); }
    });
  };
  const auto = () => { clearInterval(heroTimer); if (!reduce) heroTimer = setInterval(() => setHero((cur + 1) % words.length), 6500); };
  if (reduce) bgs.forEach(bg => { const v = bg.querySelector('video'); if (v) { v.removeAttribute('autoplay'); v.pause(); } });
  words.forEach(w => w.addEventListener('mouseenter', () => { setHero(+w.dataset.i); auto(); }));
  auto();

  /* ---------- sliders: arrows, drag, counter + progress ---------- */
  const tracks = $$('.track');
  const visibleKids = t => [...t.children].filter(c => c.offsetParent !== null && getComputedStyle(c).display !== 'none');
  const updateTrack = t => {
    const kids = visibleKids(t); if (!kids.length) return;
    const max = t.scrollWidth - t.clientWidth;
    const step = kids[1] ? kids[1].offsetLeft - kids[0].offsetLeft : kids[0].offsetWidth;
    const idx = Math.min(kids.length, Math.round(t.scrollLeft / Math.max(step, 1)) + 1);
    if (t.dataset.count) $('#' + t.dataset.count).textContent = String(idx).padStart(2, '0') + '/' + String(kids.length).padStart(2, '0');
    if (t.dataset.bar) {
      const bar = $('#' + t.dataset.bar), frac = max > 0 ? t.scrollLeft / max : 1;
      const w = Math.max(100 / kids.length, Math.min(100, t.clientWidth / t.scrollWidth * 100));
      bar.style.width = w + '%'; bar.style.left = (100 - w) * frac + '%';
    }
    $$(`.arw[data-for="${t.id}"]`).forEach(b => { b.disabled = +b.dataset.dir < 0 ? t.scrollLeft < 4 : t.scrollLeft > max - 4; });
  };
  tracks.forEach(t => {
    t.addEventListener('scroll', () => updateTrack(t), { passive: true });
    let down = false, sx = 0, sl = 0, moved = false;
    t.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = t.scrollLeft; });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; t.classList.add('drag'); } t.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => t.classList.remove('drag'), 0); });
    t.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    t.addEventListener('dragstart', e => e.preventDefault());
    updateTrack(t);
  });
  $$('.arw').forEach(b => b.addEventListener('click', () => {
    const t = $('#' + b.dataset.for), kids = visibleKids(t);
    const step = kids[1] ? kids[1].offsetLeft - kids[0].offsetLeft : t.clientWidth;
    t.scrollBy({ left: +b.dataset.dir * step, behavior: reduce ? 'auto' : 'smooth' });
  }));
  addEventListener('resize', () => tracks.forEach(updateTrack));

  /* ---------- espacios tabs ---------- */
  const espTrack = $('#espTrack');
  const setEspTab = (k) => {
    $$('#espTabs button').forEach(b => b.classList.toggle('active', b.dataset.t === k));
    [...espTrack.children].forEach(c => c.style.display = c.dataset.g === k ? '' : 'none');
    espTrack.scrollLeft = 0; updateTrack(espTrack);
  };
  $$('#espTabs button').forEach(b => b.addEventListener('click', () => setEspTab(b.dataset.t)));
  $$('[data-tab]').forEach(a => a.addEventListener('click', () => setEspTab(a.dataset.tab)));
  setEspTab('residencial');

  /* ---------- líneas filter ---------- */
  const swTrack = $('#swTrack');
  $$('#lineFilter button').forEach(b => b.addEventListener('click', () => {
    $$('#lineFilter button').forEach(x => x.classList.toggle('active', x === b));
    [...swTrack.children].forEach(c => c.classList.toggle('hide', b.dataset.f !== 'all' && c.dataset.k !== b.dataset.f));
    swTrack.scrollLeft = 0; updateTrack(swTrack);
  }));
  // swatch / mega product → scroll to brand card and flash it
  $$('[data-line]').forEach(a => a.addEventListener('click', () => {
    const map = { ultra35: 'b-ultra35', clear: 'b-clear', colonial: 'b-colonial', palma: 'b-palma', therm: 'b-therm', aislante: 'b-aislante', accesorios: 'b-accesorios' };
    const card = document.getElementById(map[a.dataset.line]); if (!card) return;
    setTimeout(() => { const t = $('#brTrack'); t.scrollTo({ left: card.offsetLeft - t.offsetLeft, behavior: reduce ? 'auto' : 'smooth' }); }, 450);
  }));

  /* ---------- gallery filter + view ---------- */
  const grid = $('#galGrid');
  $$('#galTabs button').forEach(b => b.addEventListener('click', () => {
    $$('#galTabs button').forEach(x => x.classList.toggle('active', x === b));
    [...grid.children].forEach(c => c.classList.toggle('hide', b.dataset.t !== 'all' && c.dataset.c !== b.dataset.t));
    grid.scrollLeft = 0;
  }));
  $$('.gal__view button').forEach(b => b.addEventListener('click', () => {
    $$('.gal__view button').forEach(x => x.classList.toggle('active', x === b));
    grid.classList.toggle('big', b.dataset.v === 'big');
  }));
  { // drag for gallery grid
    let down = false, sx = 0, sl = 0, moved = false;
    grid.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = grid.scrollLeft; });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; grid.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { down = false; });
    grid.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    grid.addEventListener('dragstart', e => e.preventDefault());
  }

  /* ---------- modals ---------- */
  let lastFocus;
  const open = m => { lastFocus = document.activeElement; m.classList.add('on'); document.body.style.overflow = 'hidden'; setTimeout(() => (m.querySelector('input,button.mod__x') || m).focus({ preventScroll: true }), 60); };
  const close = m => {
    m.classList.remove('on'); document.body.style.overflow = '';
    const v = m.querySelector('video'); if (v) { v.pause(); }
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };
  $$('.mod').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) close(m); });
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') { $$('.mod.on').forEach(close); mob.classList.remove('on'); closeMega(); } });

  // video modal
  const vmod = $('#vmod'), vEl = $('#vEl');
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-video]'); if (!t) return;
    e.preventDefault();
    vEl.src = t.dataset.video; $('#vCap').textContent = t.dataset.cap || '';
    open(vmod); vEl.currentTime = 0; vEl.play().catch(() => {});
  });
  // lightbox
  const lmod = $('#lmod');
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-photo]'); if (!t) return;
    e.preventDefault();
    $('#lImg').src = t.dataset.photo; $('#lImg').alt = t.dataset.cap || ''; $('#lCap').textContent = t.dataset.cap || '';
    open(lmod);
  });

  // lead modal (2 steps, no network)
  const lead = $('#lead'), form = $('#leadForm');
  const setStep = n => { lead.dataset.step = n; $('#st1').classList.toggle('on', n >= 1); $('#st2').classList.toggle('on', n >= 2); };
  const openLead = (ctx, prefill = {}) => {
    setStep(1); $('#err1').textContent = '';
    if (prefill.tel) $('#fTel').value = prefill.tel;
    const prods = [...$('#fProd').options].map(o => o.text);
    if (ctx && prods.includes(ctx)) $('#fProd').value = ctx;
    if (ctx && /Comercial|Industrial|Bodegas|Naves|Plazas|Canchas|Hotel/i.test(ctx)) form.querySelector('input[name=tipo][value="Comercial / Industrial"]').checked = true;
    open(lead);
  };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-lead]'); if (!t) return;
    e.preventDefault(); openLead(t.dataset.lead);
  });
  $('#next').addEventListener('click', () => {
    const name = $('#fName').value.trim(), tel = $('#fTel').value.replace(/\D/g, ''), loc = $('#fLoc').value.trim();
    const miss = [];
    if (name.length < 3) miss.push('tu nombre');
    if (tel.length < 8) miss.push('un WhatsApp o teléfono de 8 dígitos');
    if (loc.length < 3) miss.push('la ubicación del proyecto');
    if (miss.length) { $('#err1').textContent = 'Falta ' + miss.join(', ') + '.'; return; }
    $('#err1').textContent = ''; setStep(2);
  });
  $('#back').addEventListener('click', () => setStep(1));
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (lead.dataset.step !== '2') { $('#next').click(); return; }
    $('#okName').textContent = $('#fName').value.trim().split(' ')[0] || 'gracias';
    setStep(3);
  });

  // asesoría (newsletter) form → opens lead modal prefilled
  $('#nlForm').addEventListener('submit', e => {
    e.preventDefault();
    const tel = $('#nlTel').value.trim();
    const perfil = e.target.perfil.value;
    openLead(perfil === 'Profesional' ? 'Comercial / Industrial' : '', { tel });
  });

  // footer accordion (mobile)
  $$('.ftr__cols h4').forEach(h => h.addEventListener('click', () => {
    if (innerWidth > 600) return;
    const p = h.parentElement; p.classList.toggle('open'); h.querySelector('.pm').textContent = p.classList.contains('open') ? '–' : '+';
  }));

  // CTA video: play muted while visible
  const ctaVid = $('#ctaVid');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting && !reduce) ctaVid.play().catch(() => {}); else ctaVid.pause(); }), { threshold: .35 }).observe(ctaVid);
    // reveals
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.rv').forEach(el => io.observe(el));
  } else { $$('.rv').forEach(el => el.classList.add('in')); }

  // lazy drone loops: load + play when visible
  if ('IntersectionObserver' in window) {
    const lv = new IntersectionObserver(es => es.forEach(en => { const v = en.target; if (en.isIntersecting) { if (!v.getAttribute('src')) v.src = v.dataset.src; if (!reduce) v.play().catch(() => {}); } else v.pause(); }), { rootMargin: '200px 0px' });
    $$('video.lazyv').forEach(v => lv.observe(v));
  }
  // bento: staggered reveal + video in view
  $$('.bnt__col').forEach((col, ci) => [...col.children].forEach((card, ri) => { card.style.transitionDelay = (ci * 90 + ri * 140) + 'ms'; }));
  const bxs = $$('.bx');
  if (reduce || !('IntersectionObserver' in window)) bxs.forEach(b => b.classList.add('in'));
  else {
    const bio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); bio.unobserve(en.target); } }), { rootMargin: '0px 0px -10% 0px' });
    bxs.forEach(b => bio.observe(b));
  }
  const bv = $('#bxVid video'), bpp = $('#bxVid .bx__pp');
  let bvUserPaused = false;
  if (bv) {
    if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting && !reduce && !bvUserPaused) { if (bv.preload === 'none') bv.preload = 'auto'; bv.play().catch(() => {}); bpp.classList.remove('paused'); }
      else { bv.pause(); bpp.classList.add('paused'); }
    }), { threshold: .4 }).observe(bv);
    bpp.addEventListener('click', () => {
      if (bv.paused) { bvUserPaused = false; bv.play().catch(() => {}); bpp.classList.remove('paused'); bpp.setAttribute('aria-label', 'Pausar video'); }
      else { bvUserPaused = true; bv.pause(); bpp.classList.add('paused'); bpp.setAttribute('aria-label', 'Reproducir video'); }
    });
    // pause the muted loop while the sound version plays in the lightbox
    document.addEventListener('click', e => { if (e.target.closest('[data-video]')) bv.pause(); });
  }
  // hide "¿Te ayudamos?" bubble after a while
  setTimeout(() => { const b = $('#helpB'); if (b) { b.style.opacity = 0; b.style.transform = 'translateY(6px)'; } }, 9000);
})();
