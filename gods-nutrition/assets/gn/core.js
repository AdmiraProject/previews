/* God's Nutrition shared commerce engine (v1 + v2, ES + EN).
   Flow: Agregar al carrito → drawer → "Finalizar compra" → popup (nombre, correo, teléfono) → real WooCommerce checkout.
   - 1 line in cart  → same tab: https://godsnutrition.com.mx/checkout/?add-to-cart=<id>&quantity=<q>   (verified Nov 19 2026)
   - 2+ lines        → WooCommerce has no multi-add URL, so a checkout tab we open is walked through each
                       ?add-to-cart=<id>&quantity=<q> (first-party, keeps the session cookie) and lands on /checkout/.
   Lead is saved locally and broadcast as `gn:lead` (hook for CRM/WhatsApp later). Never posts data anywhere.
   Data: window.GN (assets/gn/data.js). Markup hooks: [data-cart] drawer, [data-add], [data-buy], [data-cart-open], [data-count]. */
(function () {
  const D = window.GN || { products: [], reviews: [] };
  const P = D.products;
  const bySlug = Object.fromEntries(P.map(p => [p.slug, p]));
  const STORE = 'https://godsnutrition.com.mx';
  const LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  const FREE = (D.cfg && D.cfg.freeShipping) || 0;
  const BASE = (document.currentScript && document.currentScript.src.replace(/assets\/gn\/core\.js.*$/, '')) || '../';
  const T = {
    es: {
      empty: 'Tu carrito está vacío', shop: 'Ver productos', remove: 'Eliminar', less: 'Quitar uno', more: 'Agregar uno',
      sub: 'Subtotal', checkout: 'Finalizar compra', freeLeft: n => `Te faltan <b>${n}</b> para envío gratis`, freeOk: '¡Tienes <b>envío gratis</b>!', freeShip: 'Envío gratis', tierLeft: (n, t) => `Envío gratis ✓ · Te faltan <b>${n}</b> para <b>${t}</b>`, allOk: '¡Desbloqueaste <b>envío gratis + 20% de descuento</b>!',
      eyebrow: 'Último paso antes de pagar', h: '¿A quién le enviamos tu pedido?',
      lead: 'Te llevamos al pago seguro de God’s Nutrition con tu carrito listo.',
      name: 'Nombre completo', email: 'Correo electrónico', phone: 'Teléfono / WhatsApp',
      phName: 'Ana López', phEmail: 'tu@correo.com', phPhone: '55 1234 5678',
      err: 'Escribe tu nombre, un correo válido y un teléfono de 10 dígitos',
      go: 'Continuar al pago', going: 'Llevándote al pago seguro…', multi: (i, n) => `Armando tu carrito (${i}/${n})…`,
      multiNote: 'Abrimos tu checkout en una pestaña nueva.', blocked: 'Permite ventanas emergentes para continuar al pago.',
      trust: ['Pago 100% seguro', 'Envíos a todo México', 'Pagos con Mercado Pago'],
      notifyEy: 'Producto agotado', notifyH: 'Te avisamos cuando vuelva', notifySub: 'Déjanos tus datos y eres de los primeros en saber cuando regrese.',
      notifyGo: 'Avísame', notifyOk: '¡Listo! Te avisaremos en cuanto vuelva.', added: 'Agregado', flavor: 'Sabor', each: 'c/u', cart: 'Tu carrito',
      also: 'Complementa tu stack', close: 'Cerrar', soldout: 'Agotado'
    },
    en: {
      empty: 'Your cart is empty', shop: 'Shop products', remove: 'Remove', less: 'Remove one', more: 'Add one',
      sub: 'Subtotal', checkout: 'Checkout', freeLeft: n => `You’re <b>${n}</b> away from free shipping`, freeOk: 'You’ve unlocked <b>free shipping</b>!', freeShip: 'Free shipping', tierLeft: (n, t) => `Free shipping ✓ · You’re <b>${n}</b> away from <b>${t}</b>`, allOk: 'You unlocked <b>free shipping + 20% off</b>!',
      eyebrow: 'Last step before payment', h: 'Who are we shipping to?',
      lead: 'We’ll take you to God’s Nutrition’s secure checkout with your cart ready.',
      name: 'Full name', email: 'Email', phone: 'Phone / WhatsApp',
      phName: 'Ana López', phEmail: 'you@email.com', phPhone: '55 1234 5678',
      err: 'Enter your name, a valid email and a 10-digit phone number',
      go: 'Continue to payment', going: 'Taking you to secure checkout…', multi: (i, n) => `Building your cart (${i}/${n})…`,
      multiNote: 'Your checkout opens in a new tab.', blocked: 'Allow pop-ups to continue to checkout.',
      trust: ['100% secure payment', 'Shipping across Mexico', 'Pay with Mercado Pago'],
      notifyEy: 'Sold out', notifyH: 'Get notified when it’s back', notifySub: 'Leave your details and be the first to know when it returns.',
      notifyGo: 'Notify me', notifyOk: 'Done! We’ll let you know as soon as it’s back.', added: 'Added', flavor: 'Flavor', each: 'ea', cart: 'Your cart',
      also: 'Complete your stack', close: 'Close', soldout: 'Sold out'
    }
  }[LANG];
  const money = n => '$' + Number(n).toLocaleString('es-MX', { maximumFractionDigits: 0 }) + (LANG === 'en' ? ' MXN' : '');
  const L = (p, k) => (p[LANG] && p[LANG][k]) || (p.es && p.es[k]) || p[k] || '';
  const img = (p, i) => BASE + (p.img[i || 0] || 'assets/img/placeholder.svg');
  const nm = p => (LANG === 'en' && p.name_en) || p.name;
  const limg = l => (l.f && l.f.img) ? BASE + l.f.img : img(l.p);
  const TIERS = (D.cfg && D.cfg.tiers) || [];
  const pdp = p => `producto.html?p=${encodeURIComponent(p.slug)}`;

  /* ---------- cart ---------- */
  const KEY = 'gn-cart-v1';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || '[]').filter(l => bySlug[l.s]); } catch (e) { cart = []; }
  const listeners = [];
  const emit = () => listeners.forEach(f => f(cart));
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} emit(); };
  const varOf = (p, vid) => (p.flavors || []).find(f => String(f.vid) === String(vid)) || null;
  const lineOf = (s, vid) => cart.find(l => l.s === s && String(l.v || '') === String(vid || ''));
  function add(s, vid, qty, opts) {
    const p = bySlug[s]; if (!p || p.stock === false) return;
    if (!vid && p.flavors && p.flavors.length) vid = (p.flavors.find(f => f.stock) || p.flavors[0]).vid;
    const fv = varOf(p, vid); if (fv && fv.stock === false) { openModal('notify', s); return; }
    const l = lineOf(s, vid);
    if (l) l.q += qty || 1; else cart.push({ s, v: vid || '', q: qty || 1 });
    save();
    document.dispatchEvent(new CustomEvent('gn:add', { detail: { slug: s, vid, qty } }));
    if (!(opts && opts.silent)) Cart.open(s);
  }
  function setQty(s, vid, q) { const l = lineOf(s, vid); if (!l) return; l.q = q; if (l.q <= 0) cart = cart.filter(x => x !== l); save(); }
  const lines = () => cart.map(l => { const p = bySlug[l.s]; return p ? { ...l, p, f: varOf(p, l.v) } : null; }).filter(Boolean);
  const subtotal = () => lines().reduce((s, l) => s + l.p.price * l.q, 0);
  const count = () => cart.reduce((s, l) => s + l.q, 0);
  const wooId = l => (l.f && l.f.vid) || l.p.id;
  const addUrl = (l, page) => `${STORE}${page || '/'}?add-to-cart=${wooId(l)}&quantity=${l.q}`;

  /* ---------- drawer ---------- */
  const Cart = {
    el: null, lastAdded: null,
    open(s) { if (!this.el) return; this.lastAdded = s || null; this.render(); this.el.classList.add('is-open'); document.documentElement.classList.add('gn-lock'); },
    close() { if (!this.el) return; this.el.classList.remove('is-open'); document.documentElement.classList.remove('gn-lock'); },
    render() {
      const el = this.el; if (!el) return;
      const ls = lines(); const st = subtotal();
      el.querySelectorAll('[data-cart-count]').forEach(n => n.textContent = count());
      const fs = el.querySelector('[data-cart-free]');
      if (fs) {
        fs.hidden = !FREE || !ls.length;
        if (FREE) {
          const goals = [{ at: FREE, label: T.freeShip }].concat(TIERS.map(t => ({ at: t.at, label: t[LANG] })));
          const next = goals.find(g => st < g.at), top = goals[goals.length - 1].at;
          const msg = !next ? T.allOk : st < FREE ? T.freeLeft(money(FREE - st)) : T.tierLeft(money(next.at - st), next.label);
          fs.innerHTML = `<p>${msg}</p><div class="gn-bar"><i style="width:${Math.min(100, st / top * 100)}%"></i>${goals.map(g => `<span class="gn-bar__m${st >= g.at ? ' is-on' : ''}" style="left:${g.at / top * 100}%" title="${g.label}"></span>`).join('')}</div>`;
        }
      }
      const body = el.querySelector('[data-cart-lines]');
      body.innerHTML = ls.length ? ls.map(l => `
        <div class="gn-cl${l.s === this.lastAdded ? ' is-new' : ''}">
          <a class="gn-cl-img" href="${pdp(l.p)}"><img src="${limg(l)}" alt="${nm(l.p)}" loading="lazy"></a>
          <div class="gn-cl-info">
            <div class="gn-cl-top"><a class="gn-cl-t" href="${pdp(l.p)}">${nm(l.p)}</a><b class="gn-cl-p">${money(l.p.price * l.q)}</b></div>
            <div class="gn-cl-v">${l.f ? `${T.flavor}: ${l.f[LANG] || l.f.name}` : L(l.p, 'size')}</div>
            <div class="gn-cl-row">
              <div class="gn-qty"><button type="button" aria-label="${T.less}" data-q="${l.s}|${l.v}|${l.q - 1}">−</button><span>${l.q}</span><button type="button" aria-label="${T.more}" data-q="${l.s}|${l.v}|${l.q + 1}">+</button></div>
              <button type="button" class="gn-cl-rm" data-q="${l.s}|${l.v}|0">${T.remove}</button>
            </div>
          </div>
        </div>`).join('') : `<div class="gn-cart-empty"><p>${T.empty}</p><a class="gn-btn" href="coleccion.html" data-cart-close>${T.shop}</a></div>`;
      const sub = el.querySelector('[data-cart-sub]'); if (sub) sub.textContent = money(st);
      const foot = el.querySelector('[data-cart-foot]'); if (foot) foot.hidden = !ls.length;
      const up = el.querySelector('[data-cart-up]');
      if (up) {
        const inCart = new Set(cart.map(l => l.s));
        const picks = P.filter(p => p.stock !== false && !inCart.has(p.slug)).sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 3);
        const wrap = up.closest('[data-cart-upwrap]'); if (wrap) wrap.hidden = !picks.length || !ls.length;
        up.innerHTML = picks.map(p => `
          <div class="gn-cu">
            <a href="${pdp(p)}"><img src="${img(p)}" alt="" loading="lazy"></a>
            <div><div class="gn-cu-t">${nm(p)}</div><div class="gn-cu-p">${money(p.price)}</div></div>
            <button type="button" class="gn-cu-add" data-add="${p.slug}" aria-label="+ ${nm(p)}">+</button>
          </div>`).join('');
      }
    }
  };

  /* ---------- lead popup → checkout ---------- */
  const LEAD = 'gn-lead';
  const getLead = () => { try { return JSON.parse(localStorage.getItem(LEAD) || 'null'); } catch (e) { return null; } };
  const valid = l => l.name && l.name.trim().length > 2 && /\S+@\S+\.\S+/.test(l.email || '') && (l.phone || '').replace(/\D/g, '').length >= 10;
  function ensureModal() {
    let m = document.getElementById('gn-co');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'gn-co'; m.className = 'gn-co'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-labelledby', 'gn-co-h');
    m.innerHTML = `
      <div class="gn-co-scrim" data-co-close></div>
      <div class="gn-co-card">
        <button type="button" class="gn-co-x" data-co-close aria-label="${T.close}">×</button>
        <form class="gn-co-form" novalidate>
          <img class="gn-co-logo" src="${BASE}assets/img/brand/logo-dark.png" alt="God’s Nutrition">
          <p class="gn-co-eyebrow" data-co-ey></p>
          <h2 id="gn-co-h" data-co-h></h2>
          <p class="gn-co-sub" data-co-sub></p>
          <div class="gn-co-fields">
            <label><span>${T.name}</span><input name="name" autocomplete="name" required placeholder="${T.phName}"></label>
            <label><span>${T.email}</span><input name="email" type="email" autocomplete="email" required placeholder="${T.phEmail}"></label>
            <label><span>${T.phone}</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" required placeholder="${T.phPhone}"></label>
          </div>
          <p class="gn-co-err" role="alert" hidden>${T.err}</p>
          <button class="gn-btn gn-co-go" type="submit"></button>
          <p class="gn-co-ok" hidden></p>
          <div class="gn-co-sum" data-co-sum></div>
          <ul class="gn-co-trust">${T.trust.map(t => `<li>${t}</li>`).join('')}</ul>
        </form>
      </div>`;
    document.body.appendChild(m);
    m.addEventListener('click', e => { if (e.target.closest('[data-co-close]')) closeCo(); });
    m.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      const lead = Object.fromEntries(new FormData(e.target).entries());
      const ok = valid(lead);
      m.querySelector('.gn-co-err').hidden = ok; if (!ok) return;
      try { localStorage.setItem(LEAD, JSON.stringify(lead)); } catch (er) {}
      const btn = m.querySelector('.gn-co-go');
      if (m.dataset.mode === 'notify') {
        document.dispatchEvent(new CustomEvent('gn:lead', { detail: { lead, source: 'notify', product: m.dataset.slug } }));
        btn.hidden = true; const okEl = m.querySelector('.gn-co-ok'); okEl.hidden = false; okEl.textContent = T.notifyOk;
        setTimeout(closeCo, 1800); return;
      }
      const ls = lines(); if (!ls.length) return;
      document.dispatchEvent(new CustomEvent('gn:lead', { detail: { lead, source: 'checkout', lines: ls.map(l => ({ slug: l.s, id: wooId(l), q: l.q })) } }));
      btn.disabled = true;
      if (ls.length === 1) { btn.textContent = T.going; setTimeout(() => { location.href = addUrl(ls[0], '/checkout/'); }, 350); return; }
      // 2+ lines: walk a tab we open through each add-to-cart, then land on checkout.
      const w = window.open('about:blank', 'gn-checkout');
      if (!w) { btn.disabled = false; m.querySelector('.gn-co-err').hidden = false; m.querySelector('.gn-co-err').textContent = T.blocked; return; }
      let i = 0;
      const step = () => {
        if (i < ls.length) { btn.textContent = T.multi(i + 1, ls.length); w.location.href = addUrl(ls[i]); i++; setTimeout(step, 2600); }
        else { w.location.href = STORE + '/checkout/'; btn.textContent = T.multiNote; setTimeout(() => { closeCo(); btn.disabled = false; }, 1500); }
      };
      step();
    });
    return m;
  }
  function openModal(mode, slug) {
    const m = ensureModal();
    m.dataset.mode = mode; m.dataset.slug = slug || '';
    const lead = getLead() || {};
    m.querySelectorAll('input[name]').forEach(i => { i.value = lead[i.name] || ''; });
    const err = m.querySelector('.gn-co-err'); err.hidden = true; err.textContent = T.err;
    const btn = m.querySelector('.gn-co-go'); btn.disabled = false; btn.hidden = false;
    m.querySelector('.gn-co-ok').hidden = true;
    const sum = m.querySelector('[data-co-sum]');
    if (mode === 'notify') {
      const p = bySlug[slug];
      m.querySelector('[data-co-ey]').textContent = T.notifyEy;
      m.querySelector('[data-co-h]').textContent = T.notifyH;
      m.querySelector('[data-co-sub]').textContent = T.notifySub;
      btn.textContent = T.notifyGo;
      sum.innerHTML = p ? `<div class="gn-co-li"><img src="${img(p)}" alt=""><div>${nm(p)}<small>${T.soldout}</small></div><b>${money(p.price)}</b></div>` : '';
    } else {
      m.querySelector('[data-co-ey]').textContent = T.eyebrow;
      m.querySelector('[data-co-h]').textContent = T.h;
      m.querySelector('[data-co-sub]').textContent = T.lead;
      btn.textContent = T.go;
      sum.innerHTML = lines().map(l => `<div class="gn-co-li"><img src="${limg(l)}" alt=""><span class="gn-co-q">${l.q}</span><div>${nm(l.p)}<small>${l.f ? l.f[LANG] || l.f.name : L(l.p, 'size')}</small></div><b>${money(l.p.price * l.q)}</b></div>`).join('') +
        `<div class="gn-co-tot"><span>${T.sub}</span><b>${money(subtotal())}</b></div>`;
    }
    Cart.close();
    m.classList.add('is-open'); document.documentElement.classList.add('gn-lock');
    setTimeout(() => { const f = m.querySelector('input[name=name]'); if (f && !f.value) f.focus(); }, 80);
  }
  function closeCo() { const m = document.getElementById('gn-co'); if (m) m.classList.remove('is-open'); if (!Cart.el || !Cart.el.classList.contains('is-open')) document.documentElement.classList.remove('gn-lock'); }

  /* ---------- global wiring ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add]');
    if (a) { e.preventDefault(); const p = bySlug[a.dataset.add]; if (p && p.stock === false) { openModal('notify', p.slug); return; } add(a.dataset.add, a.dataset.vid, +(a.dataset.qty || 1)); return; }
    const b = e.target.closest('[data-buy]');
    if (b) { e.preventDefault(); add(b.dataset.buy, b.dataset.vid, +(b.dataset.qty || 1), { silent: true }); openModal('checkout'); return; }
    const n = e.target.closest('[data-notify]');
    if (n) { e.preventDefault(); openModal('notify', n.dataset.notify); return; }
    const q = e.target.closest('[data-q]');
    if (q) { const [s, vid, k] = q.dataset.q.split('|'); setQty(s, vid, +k); return; }
    if (e.target.closest('[data-cart-open]')) { e.preventDefault(); Cart.open(); return; }
    if (e.target.closest('[data-cart-close]')) { Cart.close(); return; }
    if (e.target.closest('[data-checkout]')) { e.preventDefault(); if (count()) openModal('checkout'); return; }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { Cart.close(); closeCo(); } });
  listeners.push(() => { Cart.render(); document.querySelectorAll('[data-count]').forEach(n => { n.textContent = count(); n.hidden = !count(); }); });
  const boot = () => { Cart.el = document.querySelector('[data-cart]'); emit(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.GNC = { P, bySlug, LANG, T, money, L, img, nm, pdp, cats: D.cats || [], stats: D.stats || {}, cfg: D.cfg || {}, add, lines, count, subtotal, Cart, openCheckout: () => openModal('checkout'), notify: s => openModal('notify', s), reviews: D.reviews || [], base: BASE, store: STORE };
})();
