/* Ultra Techos v5 — Figma 1:1 + motion */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* load choreography */
  const go = () => requestAnimationFrame(() => root.classList.add('is-loaded'));
  if (document.readyState === 'complete') go(); else addEventListener('load', go);
  setTimeout(go, 1200);

  /* nav */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const burger = $('#burger'), mnav = $('#mnav');
  burger.addEventListener('click', () => { const o = !mnav.classList.contains('is-open'); mnav.classList.toggle('is-open', o); burger.setAttribute('aria-expanded', o); });
  $$('a', mnav).forEach(a => a.addEventListener('click', () => { mnav.classList.remove('is-open'); burger.setAttribute('aria-expanded', false); }));
  // active link on scroll
  const links = $$('.nav__links > a[href^="#"]');
  const secs = [['#top', $('.hero')], ['#productos', $('#productos')], ['#proyectos', $('#proyectos')], ['#cotizar', $('#cotizar')]];
  addEventListener('scroll', () => {
    let cur = '#top'; secs.forEach(([h, el]) => { if (el && el.getBoundingClientRect().top < innerHeight * .4) cur = h; });
    links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === cur && a.textContent.trim() !== 'Dónde Comprar' && a.textContent.trim() !== 'Distribuidores' && a.textContent.trim() !== 'Blog'));
  }, { passive: true });

  /* hero carousel: crossfade + Ken Burns */
  const slides = $$('.hero__slide'), dots = $$('.hero__dots button');
  let cur = 0, t = null;
  const show = i => {
    slides[cur].classList.remove('is-on'); dots[cur].classList.remove('is-on');
    cur = (i + slides.length) % slides.length;
    const img = $('img', slides[cur]); if (img.loading === 'lazy') img.loading = 'eager';
    slides[cur].classList.add('is-on'); dots[cur].classList.add('is-on');
  };
  const auto = () => { clearInterval(t); if (!reduce) t = setInterval(() => show(cur + 1), 6500); };
  dots.forEach((d, i) => d.addEventListener('click', () => { show(i); auto(); }));
  document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(t) : auto());
  auto();

  /* reveals with stagger per group */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, sib = el.parentElement ? $$(':scope > [data-rv]', el.parentElement) : [el];
    const d = reduce ? 0 : Math.max(0, sib.indexOf(el)) * 110;
    setTimeout(() => el.classList.add('is-in'), d);
    io.unobserve(el);
  }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('[data-rv]').forEach(el => io.observe(el));
  // rail cards cascade in
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    $$(':scope > *', e.target).forEach((c, i) => {
      if (reduce) return;
      c.animate([{ opacity: 0, transform: 'translateX(60px)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: i * 90, easing: 'cubic-bezier(.22,.7,.2,1)', fill: 'backwards' });
    });
    cio.unobserve(e.target);
  }), { threshold: 0.2 });
  $$('[data-drag]').forEach(r => cio.observe(r));

  /* rails: arrows, drag, progress */
  const stepOf = rail => { const c = rail.firstElementChild; return c.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 24); };
  $$('[data-slide]').forEach(b => b.addEventListener('click', () => { const rail = document.getElementById(b.dataset.slide); rail.scrollBy({ left: stepOf(rail) * +b.dataset.dir, behavior: reduce ? 'auto' : 'smooth' }); }));
  const syncArrows = rail => {
    const max = rail.scrollWidth - rail.clientWidth - 2;
    $$(`[data-slide="${rail.id}"]`).forEach(b => { b.disabled = (+b.dataset.dir < 0 && rail.scrollLeft <= 2) || (+b.dataset.dir > 0 && rail.scrollLeft >= max); });
    if (rail.id === 'prod') { const p = $('#prodProg'); const n = rail.children.length; p.style.width = (100 / n) + '%'; p.style.transform = `translateX(${(rail.scrollLeft / Math.max(1, max)) * (n - 1) * 100}%)`; }
  };
  $$('[data-drag]').forEach(rail => {
    let down = false, x0 = 0, s0 = 0, moved = false;
    rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = rail.scrollLeft; rail.style.scrollSnapType = 'none'; rail.style.cursor = 'grabbing'; });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - x0; if (Math.abs(dx) > 4) moved = true; rail.scrollLeft = s0 - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; rail.style.cursor = ''; const st = stepOf(rail); const target = Math.round(rail.scrollLeft / st) * st; rail.scrollTo({ left: target, behavior: 'smooth' }); setTimeout(() => rail.style.scrollSnapType = '', 450); });
    rail.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    rail.addEventListener('scroll', () => { syncArrows(rail); if (rail.id === 'feat') parallaxFeat(); }, { passive: true });
    syncArrows(rail);
  });

  /* product image galleries (sub-dots) */
  $$('[data-gal]').forEach(g => {
    const imgs = $$(':scope > img', g), box = $('.pcard__dots', g);
    if (imgs.length < 2) { box.remove(); return; }
    let i = 0, timer = null;
    const set = n => { imgs[i].classList.remove('is-on'); box.children[i].classList.remove('is-on'); i = (n + imgs.length) % imgs.length; imgs[i].classList.add('is-on'); box.children[i].classList.add('is-on'); };
    imgs.forEach((_, n) => { const b = document.createElement('button'); b.setAttribute('aria-label', 'Imagen ' + (n + 1)); if (!n) b.classList.add('is-on'); b.addEventListener('click', e => { e.stopPropagation(); set(n); }); box.appendChild(b); });
    const card = g.closest('.pcard');
    if (!reduce) { card.addEventListener('mouseenter', () => { timer = setInterval(() => set(i + 1), 1800); }); card.addEventListener('mouseleave', () => clearInterval(timer)); }
  });

  /* featured projects: parallax (horizontal rail + vertical page) */
  const feat = $('#feat'), fimgs = $$('.fcard__img', feat);
  function parallaxFeat() {
    if (reduce) return;
    const vw = innerWidth, vh = innerHeight;
    fimgs.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      const px = ((r.left + r.width / 2) - vw / 2) / vw;
      const py = ((r.top + r.height / 2) - vh / 2) / vh;
      el.style.transform = `translate3d(${(-px * 40).toFixed(1)}px, ${(-py * 26).toFixed(1)}px, 0) scale(1.12)`;
    });
  }
  addEventListener('scroll', parallaxFeat, { passive: true }); addEventListener('resize', parallaxFeat); parallaxFeat();


  /* real drone b-roll on project cards: hover on desktop, centred-in-view on touch */
  const vcards = $$('.fcard').filter(c => $('.fcard__vid', c));
  if (!reduce) {
    const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
    const play = c => { const v = $('.fcard__vid', c); if (!v.src) v.src = v.dataset.src; c.dataset.want = '1'; v.play().then(() => { if (c.dataset.want) c.classList.add('is-playing'); }).catch(() => {}); };
    const stop = c => { delete c.dataset.want; c.classList.remove('is-playing'); const v = $('.fcard__vid', c); setTimeout(() => { if (!c.dataset.want) v.pause(); }, 700); };
    vcards.forEach(c => c.classList.add('has-vid'));
    if (fine) vcards.forEach(c => { c.addEventListener('mouseenter', () => play(c)); c.addEventListener('mouseleave', () => stop(c)); });
    else { const vo = new IntersectionObserver(es => es.forEach(e => e.intersectionRatio > .7 ? play(e.target) : stop(e.target)), { threshold: [0, .7, 1] }); vcards.forEach(c => vo.observe(c)); }
  }

  /* services: infinite vertical marquee (duplicate set) */
  const track = $('#servTrack');
  if (track && !reduce) $$(':scope > .scard', track).forEach(c => { const k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $$('img', k).forEach(i => i.alt = ''); track.appendChild(k); });


  /* reviews bento: column × row stagger, in-view autoplay, lightbox with sound */
  const rcols = $$('.rev__col');
  const rio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, col = el.parentElement;
    const d = reduce ? 0 : rcols.indexOf(col) * 90 + [...col.children].indexOf(el) * 140;
    setTimeout(() => el.classList.add('is-in'), d); rio.unobserve(el);
  }), { threshold: 0.15 });
  $$('[data-rc]').forEach(el => rio.observe(el));
  const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting && !reduce && !v.dataset.user) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); }), { threshold: 0.35 });
  $$('video[data-auto]').forEach(v => vio.observe(v));
  $$('.rc__pp').forEach(b => b.addEventListener('click', () => { const v = $('video', b.parentElement); if (v.paused) { delete v.dataset.user; v.play(); b.classList.remove('is-paused'); b.setAttribute('aria-label', 'Pausar video'); } else { v.dataset.user = '1'; v.pause(); b.classList.add('is-paused'); b.setAttribute('aria-label', 'Reproducir video'); } }));
  const vbox = $('#vbox'), vv = $('video', vbox);
  let vLast = null;
  const openV = src => { vLast = document.activeElement; $$('video[data-auto]').forEach(v => v.pause()); vv.src = src; vbox.hidden = false; document.body.style.overflow = 'hidden'; vv.play().catch(() => {}); $('.vbox__x', vbox).focus({ preventScroll: true }); };
  const closeV = () => { vv.pause(); vv.removeAttribute('src'); vv.load(); vbox.hidden = true; document.body.style.overflow = ''; vLast && vLast.focus({ preventScroll: true }); };
  document.addEventListener('click', e => { const t = e.target.closest('[data-vsrc]'); if (!t) return; e.preventDefault(); e.stopPropagation(); openV(t.dataset.vsrc); });
  $$('[data-vsrc][role=button]').forEach(t => t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openV(t.dataset.vsrc); } }));
  $$('[data-vclose]', vbox).forEach(b => b.addEventListener('click', closeV));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !vbox.hidden) closeV(); });

  /* forms */
  const tpl = $('#cotizar [data-form]');
  const modal = $('#modal'), slot = $('.modal__slot', modal);
  const mform = tpl.cloneNode(true); mform.removeAttribute('data-rv'); mform.classList.remove('is-in'); slot.appendChild(mform);
  function reset(f) {
    f.classList.remove('is-s2', 'is-done');
    $$('.form__step', f).forEach(s => s.classList.toggle('is-on', s.dataset.step === '1'));
    $$('.form__n', f).forEach((n, k) => n.classList.toggle('is-on', k === 0));
    $('form', f).reset();
  }
  function wire(f) {
    $('[data-next]', f).addEventListener('click', () => {
      let ok = true;
      $$('[data-step="1"] [required]', f).forEach(i => { const bad = !i.value.trim(); i.classList.toggle('is-err', bad); if (bad && ok) { i.focus(); ok = false; } });
      if (!ok) return;
      f.classList.add('is-s2');
      $$('.form__step', f).forEach(s => s.classList.toggle('is-on', s.dataset.step === '2'));
      $$('.form__n', f).forEach(n => n.classList.add('is-on'));
    });
    $('[data-back]', f).addEventListener('click', () => {
      f.classList.remove('is-s2');
      $$('.form__step', f).forEach(s => s.classList.toggle('is-on', s.dataset.step === '1'));
      $$('.form__n', f)[1].classList.remove('is-on');
    });
    $$('input', f).forEach(i => i.addEventListener('input', () => i.classList.remove('is-err')));
    $('form', f).addEventListener('submit', e => {
      e.preventDefault(); // prototype: nothing is posted anywhere
      try { localStorage.setItem('ut-v5-lead', JSON.stringify(Object.fromEntries(new FormData(e.target)))); } catch (_) {}
      f.classList.add('is-done');
    });
  }
  wire(tpl); wire(mform);
  let last = null;
  const open = sistema => {
    last = document.activeElement; reset(mform);
    $('input[name=sistema]', mform).value = sistema || '';
    modal.hidden = false; document.body.style.overflow = 'hidden';
    setTimeout(() => $('input', mform).focus({ preventScroll: true }), 80);
  };
  const close = () => { modal.hidden = true; document.body.style.overflow = ''; last && last.focus({ preventScroll: true }); };
  document.addEventListener('click', e => { const b = e.target.closest('[data-lead]'); if (!b) return; e.preventDefault(); mnav.classList.remove('is-open'); open(b.dataset.sistema); });
  $$('[data-close]', modal).forEach(b => b.addEventListener('click', close));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });
})();
