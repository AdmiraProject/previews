
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const book = (o = {}) => window.PXLead ? window.PXLead.open(o) : null;

  
  const burger = $('.burger');
  if (burger) burger.addEventListener('click', () => { const on = document.body.classList.toggle('menu-open'); burger.setAttribute('aria-expanded', on); });
  $$('.nav__links a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));

  
  $$('video[data-fade]').forEach(v => { const on = () => v.classList.add('is-on'); if (v.readyState >= 3) on(); else v.addEventListener('canplay', on, { once: true }); });
  
  if ('IntersectionObserver' in window) {
    const vo = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause(); }), { threshold: .05 });
    $$('video[autoplay]').forEach(v => vo.observe(v));
  }

  
  const marq = () => document.querySelectorAll('.marq__tr').forEach(t => { const w = t.getBoundingClientRect().width / 2; if (w) t.style.setProperty('--marq-dur', (w / 39).toFixed(1) + 's'); });
  marq(); addEventListener('load', marq); if (document.fonts) document.fonts.ready.then(marq);

  
  const hb = $('.hb');
  if (hb) {
    const val = {};
    $$('.hb__fld', hb).forEach(f => {
      const btn = $('.hb__btn', f), v = $('.hb__v', f);
      btn.addEventListener('click', e => { e.stopPropagation(); const open = !f.classList.contains('is-open'); $$('.hb__fld', hb).forEach(x => x.classList.remove('is-open')); f.classList.toggle('is-open', open); });
      $$('.hb__opt', f).forEach(o => o.addEventListener('click', () => {
        val[f.dataset.k] = o.dataset.v; v.textContent = o.textContent.trim(); v.classList.add('is-set');
        $$('.hb__opt', f).forEach(x => x.classList.toggle('is-on', x === o)); f.classList.remove('is-open'); sum();
      }));
    });
    const mob = $('.hb__mob', hb), sum = () => { if (!mob) return; const s = $$('.hb__v', hb).map(x => x.textContent.trim()); $('small', mob).textContent = s.slice(0, 3).join(' · '); };
    if (mob) mob.addEventListener('click', () => hb.classList.toggle('is-open'));
    document.addEventListener('click', () => $$('.hb__fld', hb).forEach(x => x.classList.remove('is-open')));
    $('.hb__f', hb).addEventListener('submit', e => { e.preventDefault(); book({ centro: val.centro, motivo: val.motivo }); });
  }

  
  $$('[data-car]').forEach(root => {
    const car = $('.car', root) || root, tr = $('.car__track', car), slides = $$('.car__s', tr);
    const prev = $('[data-prev]', root), next = $('[data-next]', root), cnt = $('[data-count]', root), bar = $('[data-prog]', root);
    let i = 0;
    const gap = () => parseFloat(getComputedStyle(slides[0]).marginRight) || 0;
    const step = () => slides[0].getBoundingClientRect().width + gap();
    const maxI = () => { const vis = car.clientWidth - parseFloat(getComputedStyle(car).paddingLeft) - parseFloat(getComputedStyle(car).paddingRight); const total = slides.length * step() - gap(); return Math.max(0, Math.ceil((total - vis) / step() - .02)); };
    const maxX = () => { const cs = getComputedStyle(car); const vis = car.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); const tp = parseFloat(getComputedStyle(tr).paddingLeft) * 2; return Math.max(0, slides.length * step() - gap() - vis + tp * 0); };
    const dim = () => { const cr = car.getBoundingClientRect(); slides.forEach(s => { const r = s.getBoundingClientRect(); s.classList.toggle('is-out', r.right > cr.right + 2 || r.left < cr.left - 2); }); };
    const set = (n, anim = true) => {
      i = Math.max(0, Math.min(n, matchMedia('(max-width:639px)').matches ? slides.length - 1 : maxI()));
      const x = Math.min(i * step(), matchMedia('(max-width:639px)').matches ? Infinity : maxX());
      tr.style.transition = anim ? '' : 'none'; tr.style.transform = `translate3d(${-x}px,0,0)`;
      if (prev) prev.disabled = i === 0; if (next) next.disabled = i >= (matchMedia('(max-width:639px)').matches ? slides.length - 1 : maxI());
      if (cnt) cnt.innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b> / ${String(slides.length).padStart(2, '0')}`;
      if (bar) bar.style.width = `max(12%, ${((i + 1) / slides.length) * 100}%)`;
      setTimeout(dim, anim ? 420 : 0);
    };
    if (prev) prev.addEventListener('click', () => set(i - 1));
    if (next) next.addEventListener('click', () => set(i + 1));
    let sx = null, base = 0, moved = 0;
    tr.addEventListener('pointerdown', e => { if (e.button) return; sx = e.clientX; moved = 0; base = -i * step(); tr.classList.add('is-drag'); tr.setPointerCapture(e.pointerId); });
    tr.addEventListener('pointermove', e => { if (sx === null) return; moved = e.clientX - sx; tr.style.transform = `translate3d(${base + moved}px,0,0)`; });
    const end = () => { if (sx === null) return; tr.classList.remove('is-drag'); sx = null; if (Math.abs(moved) > 40) set(i + (moved < 0 ? Math.max(1, Math.round(-moved / step())) : -Math.max(1, Math.round(moved / step())))); else set(i); };
    tr.addEventListener('pointerup', end); tr.addEventListener('pointercancel', end);
    tr.addEventListener('click', e => { if (Math.abs(moved) > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    tr.addEventListener('dragstart', e => e.preventDefault());
    addEventListener('resize', () => set(i, false)); set(0, false);
  });

  
  const con = $('.con'), cp = $('.cp');
  if (con && cp) {
    const hero = $('[data-hero]');
    if (hero && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => con.classList.toggle('is-hid', e.intersectionRatio > .35 && !cp.classList.contains('is-open')), { threshold: [0, .35, .6, 1] }).observe(hero);
    const tog = on => { cp.classList.toggle('is-open', on); con.setAttribute('aria-expanded', on); if (on) { con.classList.remove('is-hid'); const inp = $('.cp__f input', cp); setTimeout(() => inp && inp.focus({ preventScroll: true }), 50); } };
    con.addEventListener('click', () => tog(!cp.classList.contains('is-open')));
    $('.x', cp).addEventListener('click', () => tog(false));
    const body = $('.cp__b', cp), say = (t, me) => { const d = document.createElement('div'); d.className = 'cp__m' + (me ? ' cp__m--me' : ''); d.textContent = t; body.appendChild(d); body.scrollTop = body.scrollHeight; };
    $$('.cp__chips button', cp).forEach(b => b.addEventListener('click', () => {
      say(b.textContent.trim(), true);
      const k = b.dataset.k;
      setTimeout(() => {
        if (k === 'book') { say('Perfecto. Te pido tus datos y eliges día y hora; al final confirmas por WhatsApp'); setTimeout(() => book({}), 700); }
        else if (k === 'first') { say('La promoción de primera vez incluye valoración con fisioterapeuta, una sesión Recovery y una sesión de rehabilitación o Deep Tissue, desde $1,199 MXN'); setTimeout(() => book({ plan: 'primera-vez', motivo: '' }), 1400); }
        else if (k === 'help') say('Cuéntame qué te duele o qué quieres mejorar y te recomiendo por dónde empezar. Escríbelo abajo');
        else { say('Te paso con el equipo por WhatsApp'); setTimeout(() => window.open('https://wa.me/525527548004?text=' + encodeURIComponent('Hola PHYX, tengo una pregunta'), '_blank'), 600); }
      }, 450);
    }));
    $('.cp__f', cp).addEventListener('submit', e => { e.preventDefault(); const i = $('input', e.target), t = i.value.trim(); if (!t) return; say(t, true); i.value = ''; setTimeout(() => { say('Gracias. Para responderte con tu caso, te paso con un especialista por WhatsApp'); setTimeout(() => window.open('https://wa.me/525527548004?text=' + encodeURIComponent(t), '_blank'), 700); }, 450); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') tog(false); });
  }

  
  const ax = $('.ax'), ap = $('.ap');
  if (ax && ap) {
    const H = document.documentElement; let size = +(store.get('px-a11y-size') || 100);
    const apply = () => { H.style.fontSize = size === 100 ? '' : size + '%'; document.body.style.zoom = size === 100 ? '' : size / 100; $('[data-size]', ap).textContent = size + '%'; };
    ['contrast', 'motion', 'font', 'links', 'cursor'].forEach(k => { const b = $(`[data-tg="${k}"]`, ap); const on = store.get('px-a11y-' + k) === '1'; H.classList.toggle('rpa-' + k, on); b.setAttribute('aria-pressed', on);
      b.addEventListener('click', () => { const v = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', v); H.classList.toggle('rpa-' + k, v); store.set('px-a11y-' + k, v ? '1' : '0'); }); });
    $('[data-zm="-"]', ap).addEventListener('click', () => { size = Math.max(90, size - 10); store.set('px-a11y-size', size); apply(); });
    $('[data-zm="+"]', ap).addEventListener('click', () => { size = Math.min(150, size + 10); store.set('px-a11y-size', size); apply(); });
    $('.ap__reset', ap).addEventListener('click', () => { size = 100; store.set('px-a11y-size', 100); apply(); $$('[data-tg]', ap).forEach(b => { b.setAttribute('aria-pressed', false); H.classList.remove('rpa-' + b.dataset.tg); store.set('px-a11y-' + b.dataset.tg, '0'); }); });
    if (size !== 100) apply();
    ax.addEventListener('click', () => ap.classList.toggle('is-open'));
    $('.x', ap).addEventListener('click', () => ap.classList.remove('is-open'));
  }

  
  const ck = $('.ck');
  if (ck) { if (!store.get('px-ck')) ck.hidden = false; $$('button', ck).forEach(b => b.addEventListener('click', () => { store.set('px-ck', b.dataset.v); ck.hidden = true; })); }
  $$('[data-cookie-prefs]').forEach(b => b.addEventListener('click', () => { if (ck) ck.hidden = false; }));

  
  $$('form[data-lead]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(f));
    try { const L = JSON.parse(store.get('px-lead') || '{}'); ['name', 'email', 'phone'].forEach(k => { if (d[k]) L[k] = d[k]; }); if (d.centro) L.centro = d.centro; store.set('px-lead', JSON.stringify(L)); } catch (er) {}
    book({ centro: d.centro || undefined, motivo: f.dataset.lead || d.motivo || '' });
  }));

  
  const tabs = $$('.tabs a[href^="#"]');
  if (tabs.length && 'IntersectionObserver' in window) {
    const map = new Map(tabs.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { tabs.forEach(a => a.removeAttribute('aria-current')); const a = map.get(e.target.id); if (a) a.setAttribute('aria-current', 'true'); } }), { rootMargin: '-45% 0px -50% 0px' });
    [...map.keys()].forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  
  $$('.acc__q').forEach(q => q.addEventListener('click', () => { const i = q.closest('.acc__i'); const on = !i.classList.contains('is-open'); i.classList.toggle('is-open', on); q.setAttribute('aria-expanded', on); }));

  
  const pills = $$('.pill'); const dpgo = $('.dp-go');
  pills.forEach(p => p.addEventListener('click', () => {
    pills.forEach(x => x.classList.toggle('is-on', x === p));
    if (dpgo) { dpgo.classList.add('is-on'); dpgo.textContent = 'Agendar en ' + p.dataset.name; dpgo.dataset.centro = p.dataset.c; dpgo.setAttribute('data-book', ''); }
    $$('[data-show-centro]').forEach(s => s.textContent = p.dataset.name);
    $$('[data-show-price]').forEach(s => s.textContent = p.dataset.price);
  }));

  
  const rv = $$('.rv');
  if (rv.length) { if (RM.matches || !('IntersectionObserver' in window)) rv.forEach(r => r.classList.add('is-in')); else { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' }); rv.forEach(r => io.observe(r)); } }

  
  const tl = $('.a-tl');
  if (tl) {
    const trk = $('.a-tl__tr', tl), fill = $('.a-tl__bar i', tl), yr = $('.a-tl__y', tl), cards = $$('.a-tc', tl);
    let raf = 0;
    const upd = () => { raf = 0; const r = tl.getBoundingClientRect(); const range = r.height - innerHeight; const p = Math.min(1, Math.max(0, -r.top / range));
      const dist = trk.scrollWidth - innerWidth + parseFloat(getComputedStyle(trk).paddingLeft); trk.style.transform = `translate3d(${-p * Math.max(0, dist)}px,0,0)`;
      fill.style.width = (p * 100) + '%'; const k = Math.min(cards.length - 1, Math.floor(p * cards.length)); if (cards[k]) yr.textContent = cards[k].dataset.y; };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true }); addEventListener('resize', upd); upd();
  }

  
  const bk = $('[data-bk]') ? document.body : null;
  if (bk) {
    const mod = $('.bk-mod'), cart = [], centros = (window.PHYX && window.PHYX.centers) || [];
    const st = { centro: new URLSearchParams(location.search).get('centro') || '', dia: 'Hoy', pac: 'Para mí' };
    const chip = k => $(`[data-chip="${k}"] span`, bk);
    const render = () => {
      const c = centros.find(x => x.id === st.centro); chip('centro').firstChild.textContent = (c ? c.name : 'Elige centro') + ' ';
      chip('dia').firstChild.textContent = st.dia + ' '; chip('pac').firstChild.textContent = st.pac + ' ';
      $('[data-cart-m]', bk).textContent = `${c ? c.name : 'Centro por elegir'} · ${st.dia} · Horario flexible`;
      const box = $('[data-cart-b]', bk);
      const ca = $('.bk-cart'); if (ca) ca.classList.toggle('has-items', cart.length > 0);
      if (!cart.length) { box.innerHTML = `<div class="bk-cart__e">Aún no agregas nada.<br>Agrega tratamientos del menú o pregúntale al asistente<br><button type="button" class="btn" data-book data-plan="primera-vez">Empieza con tu primera visita →</button></div>`; return; }
      const tot = cart.reduce((a, x) => a + (x.p || 0), 0);
      box.innerHTML = cart.map((x, n) => `<div class="bk-li"><span>${x.n}</span><span>${x.p ? '$' + x.p.toLocaleString('es-MX') : 'Valoración'}</span><button type="button" data-rm="${n}" aria-label="Quitar">×</button></div>`).join('') +
        `<div class="bk-up"><small>Combina bien · Mejora tu visita</small><b>Agrega Recovery después</b><p>Termina tu sesión con compresión o cámara hiperbárica para recuperarte mejor</p><button type="button" data-up>Agregar Recovery Zone</button></div>` +
        `<div class="bk-tot"><span>Total estimado</span><span>${tot ? '$' + tot.toLocaleString('es-MX') + ' MXN' : 'Se define en tu valoración'}</span></div><button type="button" class="bk-go" data-book data-centro="${st.centro}" data-motivo="${cart.map(x => x.n).join(', ')}">Continuar →</button>`;
      $$('[data-rm]', box).forEach(b => b.addEventListener('click', () => { const it = cart.splice(+b.dataset.rm, 1)[0]; const ab = $(`.bk-add[data-n="${it.n}"]`, bk); if (ab) ab.classList.remove('is-on'); render(); }));
      const up = $('[data-up]', box); if (up) up.addEventListener('click', () => { if (!cart.find(x => x.n === 'Recovery Zone')) cart.push({ n: 'Recovery Zone', p: 0 }); render(); });
    };
    const openMod = k => { mod.hidden = false; $$('[data-mod]', mod).forEach(p => p.hidden = p.dataset.mod !== k); };
    $$('[data-chip]', bk).forEach(b => b.addEventListener('click', () => openMod(b.dataset.chip)));
    mod.addEventListener('click', e => { if (e.target === mod || e.target.closest('.x')) mod.hidden = true; const o = e.target.closest('.bk-mod__o'); if (o) { st[o.dataset.k] = o.dataset.v; mod.hidden = true; render(); } });
    $$('.bk-add', bk).forEach(b => b.addEventListener('click', () => {
      const n = b.dataset.n, on = !b.classList.contains('is-on'); b.classList.toggle('is-on', on);
      if (on) { cart.push({ n, p: +b.dataset.p || 0 }); const t = document.createElement('span'); t.className = 'bk-toast'; t.textContent = n + ' agregado'; b.parentNode.appendChild(t); setTimeout(() => t.remove(), 1400); }
      else { const k = cart.findIndex(x => x.n === n); if (k > -1) cart.splice(k, 1); }
      render();
    }));
    $('.bk-search', bk).addEventListener('input', e => { const q = e.target.value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, ''); $$('.bk-it', bk).forEach(it => it.hidden = !!q && !it.textContent.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(q)); });
    $$('.bk-path', bk).forEach(p => p.addEventListener('click', () => $$('.bk-path', bk).forEach(x => x.classList.toggle('is-on', x === p))));
    render(); if (!st.centro) openMod('centro');
    bk.querySelectorAll('[data-open-con]').forEach(b => b.addEventListener('click', () => { const c = $('.con'); if (c) c.click(); }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') mod.hidden = true; });
  }
})();
