/* Inbasix shared commerce engine (all versions).
   Luuna-style flow: Agregar al carrito → drawer → "Finalizar compra" → popup (nombre, teléfono, correo) → checkout.
   - Lines with a real price  → real Shopify cart permalink on inbasixmedical.com with the checkout prefilled.
   - Lines "precio bajo cotización" (price 0 / 99,999,999 placeholders on their store) → quote sent to Inbasix WhatsApp.
   Data: window.IBX (assets/data.js, scraped from inbasixmedical.com). Markup is themed by each version's CSS. */
(function () {
  const P = window.IBX || [];
  const byH = Object.fromEntries(P.map(p => [p.h, p]));
  const STORE = 'https://inbasixmedical.com';
  const WA = '525522332233';           // "Envíenos un WhatsApp 55 22 33 22 33" (inbasixmedical.com/pages/dm)
  const TEL = '8004622749';            // "Llámenos 800 462 2749"
  const BASE = (document.currentScript && document.currentScript.src.replace(/assets\/core\.js.*$/, '')) || '../';
  const money = n => '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const money0 = n => '$' + Number(n).toLocaleString('es-MX', { maximumFractionDigits: 0 });
  const img = (src, w) => src ? src + (src.includes('?') ? '&' : '?') + 'width=' + (w || 800) : BASE + 'assets/img/placeholder.svg';
  const priced = p => p.v.filter(v => v.p);
  const minPrice = p => { const a = priced(p).map(v => v.p); return a.length ? Math.min(...a) : null; };
  const maxCompare = p => { const a = p.v.map(v => v.c).filter(Boolean); return a.length ? Math.max(...a) : null; };
  const isQuote = p => minPrice(p) == null;
  const find = h => byH[h];
  const inCol = (c, n) => P.filter(p => p.cols.includes(c) && p.img.length).slice(0, n || 12);
  const pdp = (h, ver) => `product.html?p=${encodeURIComponent(h)}`;
  // Card-friendly name: drop the long " - CATEGORÍA" tail Inbasix appends to many titles.
  const shortName = p => p.t.replace(/\s+-\s+[A-ZÁÉÍÓÚÑ ]{6,}.*$/u, '').replace(/\s+/g, ' ').trim();
  const priceLabel = p => { const m = minPrice(p); if (m == null) return 'Precio bajo cotización'; return (priced(p).length > 1 ? 'Desde ' : '') + money(m); };

  /* ---------- cart ---------- */
  const KEY = 'inbasix-cart-v1';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { cart = []; }
  const listeners = [];
  const emit = () => listeners.forEach(f => f(cart));
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} emit(); };
  const lineOf = (h, vid) => cart.find(l => l.h === h && l.vid == vid);
  function add(h, vid, qty, opts) {
    const p = byH[h]; if (!p) return;
    const v = p.v.find(x => x.id == vid) || p.v.find(x => x.a) || p.v[0];
    const l = lineOf(h, v.id);
    if (l) l.q += qty || 1; else cart.push({ h, vid: v.id, q: qty || 1 });
    save();
    if (!(opts && opts.silent)) Cart.open(h);
  }
  function setQty(h, vid, q) { const l = lineOf(h, vid); if (!l) return; l.q = q; if (l.q <= 0) cart = cart.filter(x => x !== l); save(); }
  const lines = () => cart.map(l => { const p = byH[l.h]; const v = p && p.v.find(x => x.id == l.vid); return p && v ? { ...l, p, v, quote: !v.p } : null; }).filter(Boolean);
  const subtotal = () => lines().reduce((s, l) => s + (l.v.p || 0) * l.q, 0);
  const count = () => cart.reduce((s, l) => s + l.q, 0);
  const clear = () => { cart = []; save(); };

  function checkoutUrl(lead) {
    const ls = lines().filter(l => !l.quote);
    if (!ls.length) return null;
    const q = new URLSearchParams();
    if (lead) {
      const [first, ...rest] = (lead.name || '').trim().split(/\s+/);
      if (lead.email) q.set('checkout[email]', lead.email.trim());
      if (first) q.set('checkout[shipping_address][first_name]', first);
      if (rest.length) q.set('checkout[shipping_address][last_name]', rest.join(' '));
      if (lead.phone) q.set('checkout[shipping_address][phone]', lead.phone);
      q.set('checkout[shipping_address][country]', 'MX');
    }
    const quotes = lines().filter(l => l.quote);
    if (quotes.length) q.set('attributes[Cotizar también]', quotes.map(l => `${l.q} × ${l.p.t}${l.v.t !== 'Default Title' ? ' (' + l.v.t + ')' : ''}`).join(' | '));
    q.set('attributes[Origen]', 'Sitio preview Dinametra · popup antes del checkout');
    return STORE + '/cart/' + ls.map(l => l.vid + ':' + l.q).join(',') + '?' + q.toString();
  }
  function quoteUrl(lead) {
    const ls = lines().filter(l => l.quote);
    const msg = `Hola Inbasix 👋 Quiero cotizar:\n` + ls.map(l => `• ${l.q} × ${l.p.t}${l.v.t !== 'Default Title' ? ' (' + l.v.t + ')' : ''}\n  ${STORE}/products/${l.p.h}`).join('\n') +
      (lead ? `\n\nMis datos:\n${lead.name}\n${lead.phone}\n${lead.email}` : '');
    return `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
  }

  /* ---------- drawer (each version supplies [data-cart] markup with these hooks) ---------- */
  const Cart = {
    el: null, upsell: null, lastAdded: null,
    open(h) { if (!this.el) return; this.lastAdded = h || null; this.render(); this.el.classList.add('is-open'); document.documentElement.classList.add('ib-lock'); },
    close() { if (!this.el) return; this.el.classList.remove('is-open'); document.documentElement.classList.remove('ib-lock'); },
    render() {
      const el = this.el; if (!el) return;
      const ls = lines(); const st = subtotal(); const hasQuote = ls.some(l => l.quote); const hasPaid = ls.some(l => !l.quote);
      el.querySelectorAll('[data-cart-count]').forEach(n => n.textContent = count());
      const body = el.querySelector('[data-cart-lines]');
      body.innerHTML = ls.length ? ls.map(l => `
        <div class="ib-cl${l.p.h === this.lastAdded ? ' is-new' : ''}">
          <a class="ib-cl-img" href="${pdp(l.h)}"><img src="${img(l.p.img[0], 240)}" alt="${l.p.t}" loading="lazy"></a>
          <div class="ib-cl-info">
            <span class="ib-cl-vendor">${l.p.vendor}</span>
            <a class="ib-cl-t" href="${pdp(l.h)}">${shortName(l.p)}</a>
            ${l.v.t !== 'Default Title' ? `<div class="ib-cl-v">${l.v.t}</div>` : ''}
            <div class="ib-cl-row">
              <div class="ib-qty"><button type="button" aria-label="Quitar uno" data-q="${l.h}|${l.vid}|${l.q - 1}">−</button><span>${l.q}</span><button type="button" aria-label="Agregar uno" data-q="${l.h}|${l.vid}|${l.q + 1}">+</button></div>
              <div class="ib-cl-p">${l.quote ? '<em>A cotizar</em>' : (l.v.c ? `<s>${money(l.v.c * l.q)}</s>` : '') + money(l.v.p * l.q)}</div>
            </div>
            <button type="button" class="ib-cl-rm" data-q="${l.h}|${l.vid}|0">Eliminar</button>
          </div>
        </div>`).join('') : `<div class="ib-cart-empty"><p>Tu carrito está vacío</p><a class="ib-btn" href="coleccion.html" data-cart-close>Ver productos</a></div>`;
      const sub = el.querySelector('[data-cart-sub]'); if (sub) sub.textContent = hasPaid ? money(st) : 'A cotizar';
      const note = el.querySelector('[data-cart-note]');
      if (note) note.innerHTML = hasQuote && hasPaid ? 'Pagas en línea los equipos con precio; los equipos a cotizar te los confirma un asesor por WhatsApp.'
        : hasQuote ? 'Un asesor te envía la cotización formal en menos de 24 horas.' : 'Envíos a todo México · Pago seguro en inbasixmedical.com';
      const go = el.querySelector('[data-checkout]'); if (go) go.textContent = hasPaid ? 'Finalizar compra' : 'Solicitar cotización';
      const foot = el.querySelector('[data-cart-foot]'); if (foot) foot.hidden = !ls.length;
      const up = el.querySelector('[data-cart-up]');
      if (up) {
        const inCart = new Set(cart.map(l => l.h));
        const base = ls[0] ? ls[0].p : null;
        const picks = (this.upsell || (base ? P.filter(p => p.h !== base.h && p.img.length && p.cols.some(c => base.cols.includes(c))).map(p => p.h) : []))
          .map(find).filter(p => p && !inCart.has(p.h)).slice(0, 4);
        const wrap = up.closest('[data-cart-upwrap]'); if (wrap) wrap.hidden = !picks.length || !ls.length;
        up.innerHTML = picks.map(p => `
          <div class="ib-cu">
            <a href="${pdp(p.h)}"><img src="${img(p.img[0], 200)}" alt="" loading="lazy"></a>
            <div><div class="ib-cu-t">${shortName(p)}</div><div class="ib-cu-p">${priceLabel(p)}</div></div>
            <button type="button" class="ib-cu-add" data-add="${p.h}" aria-label="Agregar ${p.t}">+</button>
          </div>`).join('');
      }
    }
  };

  /* ---------- lead popup → checkout ---------- */
  const LEAD = 'inbasix-lead';
  const getLead = () => { try { return JSON.parse(localStorage.getItem(LEAD) || 'null'); } catch (e) { return null; } };
  const phoneOk = ph => (ph || '').replace(/\D/g, '').length >= 10;
  const isWa = u => /^(https?:)?\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i.test(u || '') || /^whatsapp:/i.test(u || '');
  const nativeOpen = window.open.bind(window);
  // Adds the captured lead to the WhatsApp message so the advisor gets it in the first message.
  function waWithLead(url, lead) {
    try {
      const u = new URL(url, location.href);
      let t = u.searchParams.get('text') || 'Hola Inbasix 👋';
      if (!/Mis datos:/.test(t)) t = `${t}\n\nMis datos:\n${lead.name}\n${lead.phone}\n${lead.email}`;
      u.searchParams.delete('text');
      const rest = u.searchParams.toString();
      return `${u.origin}${u.pathname}?text=${encodeURIComponent(t)}${rest ? '&' + rest : ''}`; // %20 encoding (not '+') so WhatsApp renders spaces
    } catch (e) { return url; }
  }
  function ensureModal() {
    let m = document.getElementById('ib-co');
    if (!m) {
      m = document.createElement('div');
      m.id = 'ib-co'; m.className = 'ib-co'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-labelledby', 'ib-co-h');
      m.innerHTML = `
        <div class="ib-co-scrim" data-co-close></div>
        <div class="ib-co-card">
          <button type="button" class="ib-co-x" data-co-close aria-label="Cerrar">×</button>
          <form class="ib-co-form" novalidate>
            <img class="ib-co-logo" src="${BASE}assets/brand/logo-navy.png" alt="Inbasix Medical" width="140" height="42">
            <p class="ib-co-eyebrow">Último paso antes de pagar</p>
            <h2 id="ib-co-h">¿A quién le enviamos tu pedido?</h2>
            <p class="ib-co-sub" data-co-sub></p>
            <label>Nombre completo<input name="name" autocomplete="name" required placeholder="Dra. Ana López"></label>
            <label>Teléfono / WhatsApp<input name="phone" type="tel" autocomplete="tel" inputmode="tel" required placeholder="55 1234 5678"></label>
            <label>Correo electrónico<input name="email" type="email" autocomplete="email" required placeholder="tu@clinica.com"></label>
            <p class="ib-co-err" role="alert" hidden>Escribe tu nombre, un teléfono de 10 dígitos y un correo válido</p>
            <button class="ib-btn ib-co-go" type="submit">Continuar al pago</button>
            <div class="ib-co-sum" data-co-sum></div>
            <ul class="ib-co-trust"><li>Garantía de fábrica de 12 meses</li><li>Envíos a todo México</li><li>Capacitación incluida</li></ul>
          </form>
        </div>`;
      document.body.appendChild(m);
      m.addEventListener('click', e => { if (e.target.closest('[data-co-close]')) closeCo(); });
      m.querySelector('form').addEventListener('submit', e => {
        e.preventDefault();
        const lead = Object.fromEntries(new FormData(e.target).entries());
        const ok = lead.name && lead.name.trim().length > 2 && phoneOk(lead.phone) && /\S+@\S+\.\S+/.test(lead.email);
        m.querySelector('.ib-co-err').hidden = !!ok; if (!ok) return;
        try { localStorage.setItem(LEAD, JSON.stringify(lead)); } catch (er) {}
        const btn0 = m.querySelector('.ib-co-go');
        if (m.dataset.mode === 'wa') { // WhatsApp gate: lead captured → open the original WhatsApp link
          document.dispatchEvent(new CustomEvent('inbasix:lead', { detail: { lead, source: 'whatsapp', url: m._waUrl } }));
          const url = waWithLead(m._waUrl, lead);
          btn0.disabled = true; btn0.textContent = 'Abriendo WhatsApp…';
          const w = nativeOpen(url, '_blank', 'noopener');
          if (!w) location.href = url; // popup blocked → same tab
          setTimeout(closeCo, 300);
          return;
        }
        document.dispatchEvent(new CustomEvent('inbasix:lead', { detail: { lead, lines: lines() } }));
        const pay = checkoutUrl(lead), wa = lines().some(l => l.quote) ? quoteUrl(lead) : null;
        const btn = m.querySelector('.ib-co-go'); btn.disabled = true; btn.textContent = pay ? 'Llevándote al pago seguro…' : 'Abriendo WhatsApp…';
        if (wa && pay) nativeOpen(wa, '_blank', 'noopener');
        setTimeout(() => { location.href = pay || wa; }, 450);
      });
    }
    return m;
  }
  function showModal(m) {
    const lead = getLead() || {};
    m.querySelectorAll('input[name]').forEach(i => { if (lead[i.name]) i.value = lead[i.name]; });
    m.querySelector('.ib-co-err').hidden = true;
    m.querySelector('.ib-co-go').disabled = false;
    Cart.close();
    m.classList.add('is-open'); document.documentElement.classList.add('ib-lock');
    setTimeout(() => { const f = m.querySelector('input[name=name]'); if (f) f.focus(); }, 60);
  }
  /* WhatsApp gate: every WhatsApp link/button on the site asks nombre, teléfono, correo first, then opens WhatsApp. */
  function openWhatsAppPopup(url) {
    const m = ensureModal();
    m.dataset.mode = 'wa'; m._waUrl = url || `https://wa.me/${WA}`;
    m.querySelector('.ib-co-eyebrow').textContent = 'Antes de abrir WhatsApp';
    m.querySelector('#ib-co-h').textContent = '¿Con quién tenemos el gusto?';
    m.querySelector('[data-co-sub]').textContent = 'Déjanos tus datos y un asesor de Inbasix te responde por WhatsApp. Habla con expertos, no con robots.';
    m.querySelector('.ib-co-go').textContent = 'Continuar a WhatsApp';
    m.querySelector('[data-co-sum]').innerHTML = '';
    m.querySelector('[data-co-sum]').hidden = true;
    showModal(m);
  }
  function openCheckoutPopup() {
    const m = ensureModal();
    m.dataset.mode = 'checkout'; m.querySelector('[data-co-sum]').hidden = false;
    m.querySelector('#ib-co-h').textContent = '¿A quién le enviamos tu pedido?';
    const ls = lines(); const hasPaid = ls.some(l => !l.quote), hasQuote = ls.some(l => l.quote);
    m.querySelector('[data-co-sub]').textContent = hasPaid
      ? (hasQuote ? 'Te llevamos al pago seguro de inbasixmedical.com y un asesor te envía por WhatsApp la cotización de los equipos sin precio.' : 'Te llevamos al pago seguro de inbasixmedical.com con tus datos ya capturados.')
      : 'Un especialista te envía tu cotización formal por WhatsApp en menos de 24 horas.';
    m.querySelector('.ib-co-go').textContent = hasPaid ? 'Continuar al pago' : 'Enviar solicitud de cotización';
    m.querySelector('.ib-co-eyebrow').textContent = hasPaid ? 'Último paso antes de pagar' : 'Último paso para tu cotización';
    m.querySelector('[data-co-sum]').innerHTML = ls.map(l => `<div class="ib-co-li"><img src="${img(l.p.img[0], 120)}" alt=""><span class="ib-co-q">${l.q}</span><div>${shortName(l.p)}<small>${l.v.t !== 'Default Title' ? l.v.t : l.p.vendor}</small></div><b>${l.quote ? 'A cotizar' : money(l.v.p * l.q)}</b></div>`).join('') +
      (hasPaid ? `<div class="ib-co-tot"><span>Subtotal</span><b>${money(subtotal())}</b></div>` : '');
    showModal(m);
  }
  // Catch every WhatsApp link (capture phase, before any version's own handlers) and any script that opens WhatsApp.
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.closest('#ib-co') || !isWa(a.getAttribute('href'))) return;
    e.preventDefault(); e.stopImmediatePropagation();
    openWhatsAppPopup(a.href);
  }, true);
  window.open = function (url, ...rest) {
    if (isWa(String(url || ''))) { openWhatsAppPopup(String(url)); return null; }
    return nativeOpen(url, ...rest);
  };
  function closeCo() { const m = document.getElementById('ib-co'); if (m) m.classList.remove('is-open'); document.documentElement.classList.remove('ib-lock'); }

  /* ---------- global wiring ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add]');
    if (a) { e.preventDefault(); add(a.dataset.add, a.dataset.vid, +(a.dataset.qty || 1)); return; }
    const b = e.target.closest('[data-buy]'); // "Comprar ahora": add + straight to the popup
    if (b) { e.preventDefault(); add(b.dataset.buy, b.dataset.vid, +(b.dataset.qty || 1), { silent: true }); openCheckoutPopup(); return; }
    const q = e.target.closest('[data-q]');
    if (q) { const [h, vid, n] = q.dataset.q.split('|'); setQty(h, vid, +n); return; }
    if (e.target.closest('[data-cart-open]')) { e.preventDefault(); Cart.open(); return; }
    if (e.target.closest('[data-cart-close]')) { Cart.close(); return; }
    if (e.target.closest('[data-checkout]')) { e.preventDefault(); if (count()) openCheckoutPopup(); return; }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { Cart.close(); closeCo(); } });
  listeners.push(() => { Cart.render(); document.querySelectorAll('[data-count]').forEach(n => { n.textContent = count(); n.hidden = !count(); }); });
  const boot = () => { Cart.el = document.querySelector('[data-cart]'); emit(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  // In-view autoplay for muted loops (respects reduced motion) + reveal-on-scroll helper ([data-reveal]).
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => {
    const t = en.target;
    if (t.tagName === 'VIDEO') { if (RM.matches) return; en.isIntersecting ? t.play().catch(() => {}) : t.pause(); }
    else if (en.isIntersecting) { t.classList.add('is-in'); io.unobserve(t); }
  }), { threshold: .2 }) : null;
  const watch = root => { if (!io) { (root || document).querySelectorAll('[data-reveal]').forEach(n => n.classList.add('is-in')); return; } (root || document).querySelectorAll('video[data-inview], [data-reveal]').forEach(n => io.observe(n)); };
  document.addEventListener('DOMContentLoaded', () => watch());

  async function body(h) { try { return await (await fetch(BASE + 'assets/p/' + encodeURIComponent(h) + '.json')).json(); } catch (e) { return null; } }

  window.IBK = { P, find, inCol, money, money0, img, minPrice, maxCompare, priced, isQuote, priceLabel, shortName, pdp, add, setQty, lines, subtotal, count, clear,
    checkoutUrl, quoteUrl, getLead, Cart, openCheckoutPopup, openWhatsAppPopup, STORE, WA, TEL, body, watch, BASE, COLS: window.IBX_COLS || [] };
})();
