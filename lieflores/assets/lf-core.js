/* Liefloré shared commerce engine (all versions).
   Real data only: window.LF from data.js (42 products from lieflores.com WooCommerce Store API).
   Checkout: popup captures name/phone/email + delivery details, then
   (a) WhatsApp with the full order prefilled (their main sales channel), or
   (b) real lieflores.com checkout via WooCommerce ?add-to-cart (one product per order, as WooCommerce links allow). */
(function () {
  const LF = window.LF || [];
  const byH = Object.fromEntries(LF.map(p => [p.h, p]));
  const STORE = 'https://www.lieflores.com';
  const WA = '526864321342';
  // Every WhatsApp link or window.open to wa.me goes through the lead popup (name, phone, email) first
  const _open = window.open;
  window.open = function (url, ...r) { if (typeof url === 'string' && /wa\.me\//.test(url)) { openCheckout(url); return null; } return _open.call(window, url, ...r); };
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href*="wa.me/"]');
    if (!a || a.closest('#lf-co') || e.metaKey || e.ctrlKey) return;
    e.preventDefault(); e.stopPropagation(); openCheckout(a.href);
  }, true);
  document.head.insertAdjacentHTML('beforeend', '<style>.lf-co-card.lf-co-card--solo{grid-template-columns:1fr!important;width:calc(100% - 32px)!important;max-width:480px!important;height:auto!important;max-height:calc(100% - 32px)!important;align-self:center!important;justify-self:center!important;margin:auto!important;border-radius:10px!important}.lf-co-card--solo .lf-co-actions{grid-template-columns:1fr!important}</style>');
  const SHIP = 150; // "entrega en Mexicali tiene un costo de $150 MXN" (servicio estándar)
  const money = n => '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const find = h => byH[h];
  const inCat = (c, n) => LF.filter(p => p.cats.includes(c)).slice(0, n || 99);
  const minPrice = p => p.v.length ? Math.min(...p.v.map(v => v.p)) : p.p;
  const hasRange = p => p.v.length > 1 && new Set(p.v.map(v => v.p)).size > 1;
  const priceLabel = p => (hasRange(p) ? 'Desde ' : '') + money(minPrice(p));

  /* ---------- cart ---------- */
  const KEY = 'lf-cart-v1';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { cart = []; }
  const subs = [];
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} subs.forEach(f => f(cart)); };
  // default variant: cheapest in stock (matches the "Desde $X" label); red wins ties (most photos show red roses)
  const defaultVariant = p => { const vs = p.v.filter(v => v.a); if (!vs.length) return p.v[0] || null; const min = Math.min(...vs.map(v => v.p)); const cheap = vs.filter(v => v.p === min); return cheap.find(v => /\brojo/i.test(v.t)) || cheap[0]; };
  const variantOf = (p, vid) => (vid && p.v.find(v => String(v.id) === String(vid))) || defaultVariant(p);
  function add(h, vid, q) {
    const p = byH[h]; if (!p) return;
    const v = variantOf(p, vid);
    const key = h + '|' + (v ? v.id : '');
    const l = cart.find(x => x.k === key);
    if (l) l.q += q || 1; else cart.push({ k: key, h, vid: v ? v.id : null, q: q || 1 });
    save(); Cart.open();
  }
  const setQty = (k, q) => { const l = cart.find(x => x.k === k); if (!l) return; l.q = q; if (q <= 0) cart = cart.filter(x => x !== l); save(); };
  const lines = () => cart.map(l => { const p = byH[l.h]; if (!p) return null; const v = variantOf(p, l.vid); return { ...l, p, v, price: v ? v.p : p.p, label: v && v.t ? v.t : '' }; }).filter(Boolean);
  const subtotal = () => lines().reduce((s, l) => s + l.price * l.q, 0);
  const count = () => cart.reduce((s, l) => s + l.q, 0);
  const onChange = f => subs.push(f);

  /* ---------- drawer (versions style it; markup hooks below) ---------- */
  const Cart = {
    el: null, upsell: [],
    open() { if (!this.el) return; this.render(); this.el.classList.add('is-open'); this.el.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('lf-lock'); },
    close() { if (!this.el) return; this.el.classList.remove('is-open'); this.el.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('lf-lock'); },
    render() {
      const el = this.el; if (!el) return;
      const ls = lines();
      const q = s => el.querySelector(s);
      if (q('[data-cart-count]')) q('[data-cart-count]').textContent = count();
      if (q('[data-cart-lines]')) q('[data-cart-lines]').innerHTML = ls.length ? ls.map(l => `
        <div class="lfl">
          <a class="lfl-img" href="${pdpUrl(l.p)}"><img src="${rel(l.p.img[0])}" alt="${esc(l.p.t)}" loading="lazy"></a>
          <div class="lfl-info">
            <a class="lfl-t" href="${pdpUrl(l.p)}">${esc(l.p.t)}</a>
            ${l.label ? `<div class="lfl-v">${esc(l.label)}</div>` : ''}
            <div class="lfl-row">
              <div class="lfl-qty"><button type="button" aria-label="Quitar uno" data-lfq="${l.k}|${l.q - 1}">−</button><span>${l.q}</span><button type="button" aria-label="Agregar uno" data-lfq="${l.k}|${l.q + 1}">+</button></div>
              <div class="lfl-p">${money(l.price * l.q)}</div>
            </div>
            <button type="button" class="lfl-rm" data-lfq="${l.k}|0">Quitar</button>
          </div>
        </div>`).join('') : `<div class="lf-empty"><p>Tu carrito está vacío</p><a href="#tienda" data-cart-close class="lf-empty-btn">Ver arreglos</a></div>`;
      if (q('[data-cart-sub]')) q('[data-cart-sub]').textContent = money(subtotal());
      if (q('[data-cart-foot]')) q('[data-cart-foot]').hidden = !ls.length;
      const up = q('[data-cart-up]');
      if (up) {
        const inCart = new Set(cart.map(l => l.h));
        const picks = (this.upsell.length ? this.upsell : inCat('complementos', 7).map(p => p.h)).map(find).filter(p => p && !inCart.has(p.h)).slice(0, 6);
        // no gift upsells (vino, globos, ositos) next to a condolencias order — client rule: sober tone
        const wrap = up.closest('[data-cart-upwrap]'); if (wrap) wrap.hidden = !picks.length || !ls.length || ls.some(l => l.p.cats.includes('condolencias'));
        up.innerHTML = picks.map(p => `<div class="lfu"><img src="${rel(p.img[0])}" alt="" loading="lazy"><div><div class="lfu-t">${esc(p.t)}</div><div class="lfu-p">${priceLabel(p)}</div></div><button type="button" class="lfu-add" data-lf-add="${p.h}" aria-label="Agregar ${esc(p.t)}">+</button></div>`).join('');
      }
    }
  };

  /* ---------- checkout popup ---------- */
  const LEAD = 'lf-lead';
  const getLead = () => { try { return JSON.parse(localStorage.getItem(LEAD) || '{}'); } catch (e) { return {}; } };
  const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  function waText(lead) {
    const ls = lines();
    const items = ls.map(l => `• ${l.q} × ${l.p.t}${l.label ? ' (' + l.label + ')' : ''} — ${money(l.price * l.q)}`).join('\n');
    const fechaTxt = lead.fecha && lead.fecha >= isoOf(firstDeliveryDate()) ? new Date(lead.fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
    const extra = [fechaTxt && `Entrega: ${fechaTxt}`, lead.dir && `Dirección: ${lead.dir}`, lead.msg && `Mensaje de tarjeta: ${lead.msg}`].filter(Boolean).join('\n');
    return `Hola Liefloré, quiero hacer este pedido:\n${items}\nSubtotal: ${money(subtotal())} (envío aparte)\n${extra ? '\n' + extra + '\n' : ''}\n${dataLine(lead)}`;
  }
  const dataLine = lead => `Mis datos: ${lead.nombre || ''} · ${lead.tel || ''} · ${lead.email || ''}`;
  // a WhatsApp link from anywhere on the site: keep its prefilled text, add the contact data
  const withLead = (href, lead) => { let t = 'Hola Liefloré'; try { t = new URL(href).searchParams.get('text') || t; } catch (e) {} return `https://wa.me/${WA}?text=${encodeURIComponent(`${t}\n\n${dataLine(lead)}`)}`; };
  const waUrl = lead => `https://wa.me/${WA}?text=${encodeURIComponent(waText(lead))}`;
  // WooCommerce links add one product: send the main arrangement (not an add-on), highest value first
  const mainLine = () => { const ls = lines(); const flowers = ls.filter(l => !l.p.cats.includes('complementos')); return (flowers.length ? flowers : ls).sort((a, b) => b.price * b.q - a.price * a.q)[0]; };
  const webCheckoutUrl = () => { const l = mainLine(); if (!l) return STORE + '/tienda/'; return `${STORE}/finalizar-compra/?add-to-cart=${l.vid || l.p.id}&quantity=${l.q}`; };
  // Same-day only for web orders before 3:30 p. m. Mexicali time; no regular Sunday service
  const mxNow = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Tijuana' }));
  const firstDeliveryDate = () => { const d = mxNow(); if (d.getHours() * 60 + d.getMinutes() >= 15 * 60 + 30) d.setDate(d.getDate() + 1); if (d.getDay() === 0) d.setDate(d.getDate() + 1); return d; };
  const isoOf = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  let PENDING = null; // wa.me link the visitor clicked; null = cart checkout
  function go(url) { const w = _open.call(window, url, '_blank', 'noopener'); if (!w) location.href = url; }
  function openCheckout(href) {
    PENDING = typeof href === 'string' ? href : null;
    if (!PENDING && !count()) return;
    let m = document.getElementById('lf-co');
    if (!m) {
      m = document.createElement('div'); m.id = 'lf-co'; m.className = 'lf-co';
      m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-labelledby', 'lf-co-h');
      m.innerHTML = `<div class="lf-co-scrim" data-co-close></div>
        <div class="lf-co-card">
          <button type="button" class="lf-co-x" data-co-close aria-label="Cerrar">×</button>
          <aside class="lf-co-sum" data-co-sum></aside>
          <form class="lf-co-form" novalidate>
            <p class="lf-co-eb">Último paso</p>
            <h2 id="lf-co-h">¿A quién sorprendemos?</h2>
            <p class="lf-co-sub">Déjanos tus datos y seguimos tu pedido por WhatsApp: ahí confirmamos fecha, dirección y mensaje de la tarjeta</p>
            <div class="lf-co-grid">
              <label class="full">Tu nombre<input name="nombre" autocomplete="name" required></label>
              <label class="full">Tu WhatsApp<input name="tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="10 dígitos" required></label>
              <label class="full">Tu correo<input name="email" type="email" autocomplete="email" required></label>
            </div>
            <p class="lf-co-err" role="alert" hidden>Completa tu nombre, un WhatsApp de 10 dígitos y tu correo</p>
            <div class="lf-co-actions">
              <button type="submit" class="lf-co-wa" value="wa">Enviar pedido por WhatsApp</button>
              <button type="submit" class="lf-co-pay" value="web">Pagar en línea</button>
            </div>
            <p class="lf-co-note" data-co-note></p>
            <p class="lf-co-fine">Envío estándar en Mexicali $150 MXN · Entrega el mismo día en pedidos antes de las 3:30 p. m.</p>
          </form>
        </div>`;
      document.body.appendChild(m);
      m.addEventListener('click', e => { if (e.target.closest('[data-co-close]')) closeCheckout(); });
      const f = m.querySelector('form');
      f.addEventListener('submit', e => {
        e.preventDefault();
        const how = (e.submitter && e.submitter.value) || 'wa';
        const lead = Object.assign(getLead(), Object.fromEntries(new FormData(f).entries()));
        const ok = lead.nombre && (lead.tel || '').replace(/\D/g, '').length >= 10 && /\S+@\S+\.\S+/.test(lead.email || '');
        m.querySelector('.lf-co-err').hidden = !!ok; if (!ok) return;
        try { localStorage.setItem(LEAD, JSON.stringify(lead)); } catch (er) {}
        document.dispatchEvent(new CustomEvent('lf:lead', { detail: { lead, how, href: PENDING, lines: PENDING ? [] : lines() } }));
        const url = PENDING ? withLead(PENDING, lead) : how === 'wa' ? waUrl(lead) : webCheckoutUrl();
        closeCheckout(); go(url);
      });
    }
    const lead = getLead();
    m.querySelectorAll('[name]').forEach(i => { if (lead[i.name]) i.value = lead[i.name]; });
    // condolencias orders: sober wording (client rule)
    const sober = lines().some(l => l.p.cats.includes('condolencias'));
    m.querySelector('#lf-co-h').textContent = sober ? 'Datos de entrega' : '¿A quién sorprendemos?';
    m.querySelector('.lf-co-eb').textContent = sober ? 'Con respeto, nos encargamos' : 'Último paso';
    const link = !!PENDING;
    if (link && !sober) { m.querySelector('#lf-co-h').textContent = 'Antes de ir a WhatsApp'; m.querySelector('.lf-co-eb').textContent = 'Te atendemos en minutos'; }
    m.querySelector('.lf-co-pay').style.display = link ? 'none' : '';
    m.querySelector('.lf-co-wa').textContent = link ? 'Continuar a WhatsApp' : 'Enviar pedido por WhatsApp';
    m.querySelector('[data-co-sum]').style.display = link ? 'none' : '';
    m.querySelector('.lf-co-card').classList.toggle('lf-co-card--solo', link);
    m.querySelector('[data-co-sum]').innerHTML = `<img class="lf-co-logo" src="${ASSET}brand/logo.png" alt="Liefloré">` + lines().map(l => `<div class="lf-co-li"><img src="${rel(l.p.img[0])}" alt=""><span>${l.q}</span><div>${esc(l.p.t)}<small>${esc(l.label)}</small></div><b>${money(l.price * l.q)}</b></div>`).join('') + `<div class="lf-co-tot"><span>Subtotal</span><b>${money(subtotal())}</b></div><p class="lf-co-ship">+ envío estándar $150 en Mexicali</p>`;
    m.querySelector('[data-co-note]').textContent = !link && lines().length > 1 ? 'El pago en línea abre lieflores.com con tu primer arreglo; para pedidos con varios productos te recomendamos WhatsApp' : '';
    Cart.close(); m.classList.add('is-open'); document.documentElement.classList.add('lf-lock');
    setTimeout(() => m.querySelector('[name=nombre]').focus(), 60);
  }
  function closeCheckout() { const m = document.getElementById('lf-co'); if (m) m.classList.remove('is-open'); document.documentElement.classList.remove('lf-lock'); }

  /* ---------- helpers ---------- */
  // pages live in site/vN/ (or deeper); assets in site/assets/. Each page sets <meta name="lf-assets" content="../assets/">
  const ASSET = (document.querySelector('meta[name=lf-assets]') || {}).content || '../assets/';
  const rel = p => p ? (p.startsWith('http') ? p : ASSET + p.replace(/^assets\//, '')) : '';
  const pdpUrl = p => 'producto.html?p=' + encodeURIComponent(p.h);
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const occasionOf = p => { const t = (p.t + ' ' + p.sd).toLowerCase(); const o = []; if (/funeral|condolenc|corona/.test(t)) o.push('condolencias'); if (/aniversario|amor|rom[aá]nt|coraz[oó]n|san valent|te amo/.test(t)) o.push('aniversario'); if (/cumplea/.test(t)) o.push('cumpleanos'); if (/graduac/.test(t)) o.push('graduacion'); if (/mam[aá]|madre/.test(t)) o.push('mama'); if (/nacimiento|beb[eé]/.test(t)) o.push('nacimiento'); return o; };

  /* ---------- global wiring ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-lf-add]'); if (a) { e.preventDefault(); add(a.dataset.lfAdd, a.dataset.vid, +(a.dataset.qty || 1)); return; }
    const q = e.target.closest('[data-lfq]'); if (q) { const i = q.dataset.lfq.lastIndexOf('|'); setQty(q.dataset.lfq.slice(0, i), +q.dataset.lfq.slice(i + 1)); return; }
    if (e.target.closest('[data-cart-open]')) { e.preventDefault(); Cart.open(); return; }
    if (e.target.closest('[data-cart-close]')) { Cart.close(); return; }
    if (e.target.closest('[data-checkout]')) { e.preventDefault(); openCheckout(); return; }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { Cart.close(); closeCheckout(); } });
  onChange(() => { Cart.render(); document.querySelectorAll('[data-count]').forEach(n => { n.textContent = count(); n.hidden = !count(); }); });
  const boot = () => { Cart.el = document.querySelector('[data-cart]'); subs.forEach(f => f(cart)); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0)); else setTimeout(boot, 0);

  window.LFK = { defaultVariant, firstDeliveryDate, mxNow, isoOf, mainLine, LF, find, inCat, money, minPrice, priceLabel, add, setQty, lines, subtotal, count, onChange, Cart, openCheckout, closeCheckout, waUrl, webCheckoutUrl, rel, pdpUrl, esc, occasionOf, STORE, WA, SHIP, ASSET };
})();
