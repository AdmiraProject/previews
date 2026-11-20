/* Zoom Académie — shared commerce + activation engine.
   Hooks (any element):
     data-add="<id>"        add program/course to cart, open drawer
     data-buy="<id>"        add + go straight to the checkout popup
     data-enroll[="<id>"]   open the activation flow (free consultation)
     data-cart-open         open the drawer ; <span data-count hidden></span> = cart badge
     data-video="<src>"     open the video lightbox (optional data-video-title)
     data-reveal            fade-up when scrolled into view (adds .is-in) ; data-reveal-delay="120"
     data-countup="800" data-prefix="$" data-suffix="+"   animated number when visible
   Test mode: ?test=1 in the URL → no navigation, destination stored in window.__zaLast + console. */
(function () {
  const ZA = window.ZA || {}, LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  const ROOT = (document.currentScript && document.currentScript.src.replace(/assets\/za\/core\.js.*$/, '')) || '/';
  const TEST = /[?&]test=1/.test(location.search);
  const T = {
    es: { cart: 'Tu inscripción', empty: 'Aún no agregas ningún programa.', browse: 'Ver programas', today: 'Pagas hoy', checkout: 'Continuar', remove: 'Quitar', consult: 'Se confirma en tu llamada', items: 'programas', secure: 'Pago seguro en la plataforma oficial de Zoom Académie', planFree: 'Reservar lugar: $0 hoy',
      formTitle: 'Último paso: tus datos', formSub: 'Los usamos para tu inscripción y para que un asesor te confirme tu lugar.', name: 'Nombre completo', email: 'Correo', phone: 'Teléfono', go: 'Ir al pago seguro', goBook: 'Reservar mi llamada', privacy: 'Sin spam. Solo te contactamos por tu inscripción.',
      errName: 'Escribe tu nombre', errEmail: 'Revisa tu correo', errPhone: 'Revisa tu teléfono',
      redirect: 'Te llevamos a', redirectIn: 'en', sec: 's', now: 'Ir ahora', ready: '¡Listo, {n}!',
      dest_book: 'agendar tu llamada de admisión', dest_pay: 'el pago seguro de',
      e1: '¿Qué quieres lograr con la formación?', e2: '¿Cuándo te gustaría empezar?', e3: '¿A dónde te mandamos tu plan?', e4: 'Tu plan está listo', step: 'Paso', of: 'de', next: 'Siguiente', back: 'Atrás',
      c1: 'Asesor de admisiones asignado', c2: 'Ruta recomendada', c3: 'Opciones de pago revisadas', c4: 'Llamada gratuita de 15 min por Zoom', enrollCta: 'Ver mi plan', close: 'Cerrar', fr: 'En francés' },
    en: { cart: 'Your enrollment', empty: "You haven't added a program yet.", browse: 'See programs', today: 'Due today', checkout: 'Continue', remove: 'Remove', consult: 'Confirmed on your call', items: 'programs', secure: "Secure payment on Zoom Academy's official platform", planFree: 'Reserve your spot: $0 today',
      formTitle: 'Last step: your details', formSub: 'We use them for your enrollment and so an advisor can confirm your spot.', name: 'Full name', email: 'Email', phone: 'Phone', go: 'Go to secure checkout', goBook: 'Book my call', privacy: 'No spam. We only contact you about your enrollment.',
      errName: 'Enter your name', errEmail: 'Check your email', errPhone: 'Check your phone',
      redirect: 'Taking you to', redirectIn: 'in', sec: 's', now: 'Go now', ready: "You're all set, {n}!",
      dest_book: 'book your admissions call', dest_pay: 'secure checkout for',
      e1: 'What do you want the program to do for you?', e2: 'When would you like to start?', e3: 'Where should we send your plan?', e4: 'Your plan is ready', step: 'Step', of: 'of', next: 'Next', back: 'Back',
      c1: 'Admissions advisor assigned', c2: 'Recommended path', c3: 'Payment options reviewed', c4: 'Free 15-min Zoom call', enrollCta: 'See my plan', close: 'Close', fr: 'In French' }
  }[LANG];
  const P = (ZA.products || []), byId = id => P.find(p => p.id === id);
  const money = n => '$' + Number(n).toLocaleString('en-US');
  const L = p => p[LANG];
  const KEY = 'za_cart_v1';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || '[]').filter(l => byId(l.id)); } catch (e) { cart = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const el = (h) => { const d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; };
  const lock = on => document.documentElement.classList.toggle('za-lock', on);

  /* ---------- DOM ---------- */
  const X = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const drawer = el(`<aside class="za-drawer" aria-hidden="true" role="dialog" aria-label="${T.cart}"><div class="za-scrim" data-za-close></div><div class="za-panel"><header class="za-dh"><h3>${T.cart} <span class="za-dn"></span></h3><button class="za-x" data-za-close aria-label="${T.close}">${X}</button></header><div class="za-lines"></div><footer class="za-df"><div class="za-sum"><span>${T.today}</span><strong class="za-total"></strong></div><button class="za-btn za-btn--primary za-go" type="button">${T.checkout}<i>→</i></button><p class="za-secure">🔒 ${T.secure}</p></footer></div></aside>`);
  const modal = el(`<div class="za-modal" aria-hidden="true" role="dialog"><div class="za-scrim" data-za-close></div><div class="za-card"><button class="za-x" data-za-close aria-label="${T.close}">${X}</button><div class="za-body"></div></div></div>`);
  const light = el(`<div class="za-light" aria-hidden="true" role="dialog"><div class="za-scrim" data-za-close></div><div class="za-lv"><button class="za-x" data-za-close aria-label="${T.close}">${X}</button><video playsinline controls></video><p class="za-lt"></p></div></div>`);
  document.addEventListener('DOMContentLoaded', () => { document.body.append(drawer, modal, light); render(); });
  document.addEventListener('click', e => { if (e.target.closest('[data-za-close]')) closeAll(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

  function closeAll() {
    [drawer, modal, light].forEach(n => n.setAttribute('aria-hidden', 'true'));
    const v = light.querySelector('video'); v.pause(); v.removeAttribute('src'); v.load();
    lock(false); clearInterval(timer);
  }
  const open = n => { closeAll(); n.setAttribute('aria-hidden', 'false'); lock(true); };

  /* ---------- cart ---------- */
  function add(id, qty) {
    const p = byId(id); if (!p) return;
    const line = cart.find(l => l.id === id);
    if (line) { if (p.kind === 'paid') line.q += qty || 1; } else cart.push({ id, q: p.kind === 'paid' ? (qty || 1) : 1 });
    save(); render();
  }
  function render() {
    const n = cart.reduce((a, l) => a + l.q, 0);
    document.querySelectorAll('[data-count]').forEach(b => { b.textContent = n; b.hidden = !n; });
    const box = drawer.querySelector('.za-lines'); if (!box) return;
    drawer.querySelector('.za-dn').textContent = n ? `(${n})` : '';
    if (!cart.length) {
      box.innerHTML = `<div class="za-empty"><p>${T.empty}</p><a class="za-btn za-btn--ghost" href="${ROOT}${location.pathname.includes('/en/') ? '' : ''}" data-za-browse>${T.browse}</a></div>`;
      box.querySelector('[data-za-browse]').addEventListener('click', e => { e.preventDefault(); closeAll(); const t = document.querySelector('#programas,#programs,[data-programs]'); if (t) t.scrollIntoView({ behavior: 'smooth' }); });
    } else box.innerHTML = cart.map(l => {
      const p = byId(l.id), t = L(p);
      const price = p.kind === 'paid' ? money(p.price * l.q) : '';
      const qty = p.kind === 'paid' ? `<div class="za-q"><button data-q="-1" aria-label="-">−</button><span>${l.q}</span><button data-q="1" aria-label="+">+</button></div>` : `<span class="za-tag">${T.planFree}</span>`;
      return `<div class="za-line" data-id="${p.id}"><img src="${ROOT}${p.img}" alt="" loading="lazy"><div class="za-li"><strong>${esc(t.name)}</strong><span class="za-var">${esc(t.variant)}</span>${t.note ? `<small>${esc(t.note)}</small>` : ''}<div class="za-row">${qty}<span class="za-price">${price}</span></div><button class="za-rm" data-rm>${T.remove}</button></div></div>`;
    }).join('');
    box.querySelectorAll('.za-line').forEach(row => {
      const id = row.dataset.id;
      row.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { const l = cart.find(x => x.id === id); l.q = Math.max(1, l.q + +b.dataset.q); save(); render(); }));
      row.querySelector('[data-rm]').addEventListener('click', () => { cart = cart.filter(x => x.id !== id); save(); render(); });
    });
    const tot = cart.reduce((a, l) => { const p = byId(l.id); return a + (p.kind === 'paid' ? p.price * l.q : 0); }, 0);
    drawer.querySelector('.za-total').textContent = money(tot);
    drawer.querySelector('.za-go').disabled = !cart.length;
  }
  drawer.querySelector('.za-go').addEventListener('click', () => contactForm('cart'));

  /* ---------- destinations ---------- */
  function destinations(ids) {
    const out = [];
    const consult = ids.map(byId).filter(p => p && p.kind === 'consult');
    const paid = ids.map(byId).filter(p => p && p.kind === 'paid');
    consult.forEach(p => out.push({ label: T.dest_book, sub: L(p).name, url: (p.url || ZA.booking[LANG]) + (/\?/.test(p.url || ZA.booking[LANG]) ? '&' : '?') + 'program=' + p.id + '&utm_source=site&utm_medium=enroll' }));
    paid.forEach(p => out.push({ label: T.dest_pay, sub: L(p).name, url: p.url }));
    return out;
  }
  let timer;
  function go(url) {
    window.__zaLast = url; console.info('[ZA] redirect →', url);
    if (TEST) return;
    location.href = url;
  }
  function redirectScreen(name, dests, extra) {
    const body = modal.querySelector('.za-body'); let s = 5;
    const first = dests[0];
    body.innerHTML = `<div class="za-done">${extra || ''}<h3>${T.ready.replace('{n}', esc(name.split(' ')[0]))}</h3><p class="za-to">${T.redirect} <b>${esc(first.label)}</b> · ${esc(first.sub)} ${T.redirectIn} <b class="za-s">${s}${T.sec}</b></p><div class="za-bar"><i></i></div><div class="za-dests">${dests.map((d, i) => `<a class="za-btn ${i ? 'za-btn--ghost' : 'za-btn--primary'}" href="${esc(d.url)}" data-go="${i}">${i ? esc(d.sub) + ' →' : T.now + ' →'}</a>`).join('')}</div></div>`;
    body.querySelectorAll('[data-go]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); clearInterval(timer); go(dests[+a.dataset.go].url); }));
    requestAnimationFrame(() => body.querySelector('.za-bar i').style.transform = 'scaleX(1)');
    clearInterval(timer);
    timer = setInterval(() => { s--; const n = body.querySelector('.za-s'); if (n) n.textContent = Math.max(s, 0) + T.sec; if (s <= 0) { clearInterval(timer); go(first.url); } }, 1000);
  }

  /* ---------- contact popup (nombre / correo / teléfono) ---------- */
  function fields() {
    return `<label class="za-f"><span>${T.name}</span><input name="name" autocomplete="name" required></label>
      <label class="za-f"><span>${T.email}</span><input name="email" type="email" autocomplete="email" required></label>
      <label class="za-f"><span>${T.phone}</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" required></label>`;
  }
  function validate(f) {
    const v = Object.fromEntries(new FormData(f)); let ok = true;
    const bad = (n, m) => { ok = false; const i = f.querySelector(`[name=${n}]`); i.closest('.za-f').classList.add('is-bad'); i.closest('.za-f').dataset.err = m; };
    f.querySelectorAll('.za-f').forEach(x => x.classList.remove('is-bad'));
    if ((v.name || '').trim().length < 2) bad('name', T.errName);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v.email || '')) bad('email', T.errEmail);
    if ((v.phone || '').replace(/\D/g, '').length < 8) bad('phone', T.errPhone);
    return ok ? v : null;
  }
  function saveLead(v, meta) { try { localStorage.setItem('za_lead', JSON.stringify({ ...v, ...meta, lang: LANG, t: Date.now() })); } catch (e) {} }
  function contactForm(src, ids) {
    ids = ids || cart.map(l => l.id);
    const dests = destinations(ids); if (!dests.length) return;
    const consult = dests[0].label === T.dest_book;
    open(modal);
    const body = modal.querySelector('.za-body');
    const sum = ids.map(byId).map(p => `<li><span>${esc(L(p).name)} · ${esc(L(p).variant)}</span><b>${p.kind === 'paid' ? money(p.price) : T.consult}</b></li>`).join('');
    body.innerHTML = `<form class="za-form" novalidate><h3>${T.formTitle}</h3><p class="za-sub">${T.formSub}</p><ul class="za-mini">${sum}</ul>${fields()}<button class="za-btn za-btn--primary" type="submit">${consult ? T.goBook : T.go}<i>→</i></button><p class="za-priv">${T.privacy}</p></form>`;
    const f = body.querySelector('form'); setTimeout(() => f.querySelector('input').focus(), 60);
    f.addEventListener('submit', e => { e.preventDefault(); const v = validate(f); if (!v) return; saveLead(v, { ids, src }); redirectScreen(v.name, dests); });
  }

  /* ---------- activation flow (free consultation) ---------- */
  function enroll(id) {
    id = id || 'event-live';
    const E = ZA.enroll, st = { goal: null, when: null };
    open(modal);
    const body = modal.querySelector('.za-body');
    const head = (n, t) => `<div class="za-steps"><span>${T.step} ${n} ${T.of} 3</span><div class="za-pg"><i style="width:${n * 33.34}%"></i></div></div><h3>${t}</h3>`;
    const opts = (arr, key) => `<div class="za-opts">${arr.map((o, i) => `<button type="button" class="za-opt" data-k="${key}" data-i="${i}"><span>${esc(o)}</span><i>→</i></button>`).join('')}</div>`;
    const s1 = () => { body.innerHTML = head(1, T.e1) + opts(E.goal[LANG], 'goal'); bind(); };
    const s2 = () => { body.innerHTML = head(2, T.e2) + opts(E.when[LANG], 'when') + `<button class="za-back" type="button">← ${T.back}</button>`; bind(); body.querySelector('.za-back').onclick = s1; };
    const s3 = () => {
      body.innerHTML = head(3, T.e3) + `<form class="za-form" novalidate>${fields()}<button class="za-btn za-btn--primary" type="submit">${T.enrollCta}<i>→</i></button><p class="za-priv">${T.privacy}</p></form><button class="za-back" type="button">← ${T.back}</button>`;
      body.querySelector('.za-back').onclick = s2;
      const f = body.querySelector('form'); setTimeout(() => f.querySelector('input').focus(), 60);
      f.addEventListener('submit', e => { e.preventDefault(); const v = validate(f); if (!v) return; saveLead(v, { goal: E.goal.en[st.goal], when: E.when.en[st.when], ids: [id], src: 'enroll' }); s4(v); });
    };
    const s4 = v => {
      const items = [T.c1, `${T.c2}: <b>${esc(E.path[LANG][st.goal])}</b>`, T.c3, T.c4];
      const list = `<h3 class="za-h4">${T.e4}</h3><ul class="za-check">${items.map((x, i) => `<li style="--d:${i * 380}ms"><i></i><span>${x}</span></li>`).join('')}</ul>`;
      redirectScreen(v.name, destinations([id]), list);
    };
    function bind() { body.querySelectorAll('.za-opt').forEach(b => b.onclick = () => { st[b.dataset.k] = +b.dataset.i; b.classList.add('is-on'); setTimeout(b.dataset.k === 'goal' ? s2 : s3, 180); }); }
    s1();
  }

  /* ---------- video lightbox ---------- */
  function video(src, title) {
    open(light); const v = light.querySelector('video');
    v.src = src.startsWith('http') || src.startsWith('/') ? src : ROOT + src; v.play().catch(() => {});
    light.querySelector('.za-lt').textContent = title || '';
  }

  /* ---------- delegated hooks ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add],[data-buy],[data-enroll],[data-cart-open],[data-video]'); if (!a) return;
    e.preventDefault();
    if (a.hasAttribute('data-add')) { add(a.dataset.add, +(a.dataset.qty || 1)); open(drawer); }
    else if (a.hasAttribute('data-buy')) { add(a.dataset.buy, 1); contactForm('buy', [a.dataset.buy]); }
    else if (a.hasAttribute('data-enroll')) enroll(a.dataset.enroll);
    else if (a.hasAttribute('data-cart-open')) open(drawer);
    else if (a.hasAttribute('data-video')) video(a.dataset.video, a.dataset.videoTitle);
  });

  /* ---------- reveal + countup ---------- */
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function countup(n) {
    const to = +n.dataset.countup, pre = n.dataset.prefix || '', suf = n.dataset.suffix || '', dur = +(n.dataset.dur || 1600);
    if (RM) { n.textContent = pre + to.toLocaleString('en-US') + suf; return; }
    const t0 = performance.now();
    const f = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); n.textContent = pre + Math.round(to * e).toLocaleString('en-US') + suf; if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  document.addEventListener('DOMContentLoaded', () => {
    const io = new IntersectionObserver(es => es.forEach(x => {
      if (!x.isIntersecting) return; const n = x.target; io.unobserve(n);
      if (n.hasAttribute('data-countup')) countup(n);
      else setTimeout(() => n.classList.add('is-in'), +(n.dataset.revealDelay || 0));
    }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-reveal],[data-countup]').forEach(n => io.observe(n));
  });

  window.ZAC = { LANG, ROOT, T, P, byId, money, L, add, open: () => open(drawer), enroll, contactForm, video, cart: () => cart.slice(), destinations };
})();
