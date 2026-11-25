
(function () {
  const D = window.PHARMATH; if (!D) return;
  const LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  const SRC = (document.currentScript && document.currentScript.src) || '';
  const BASE = SRC ? SRC.replace(/core\/cart\.js.*$/, '') : '../../assets/';
  const KEY = 'ph-bag', LEAD = 'ph-lead';
  const T = {
    es: { bag: 'Tu carrito', empty: 'Tu carrito está vacío', emptySub: 'Elige la prueba que necesitas y recíbela en casa.', shop: 'Ver pruebas', sub: 'Subtotal', ship: 'Envío e impuestos calculados en el pago', checkout: 'Finalizar compra', added: 'Agregado al carrito', rm: 'Quitar', close: 'Cerrar', qty: 'Cantidad',
      eyebrow: 'Último paso antes de pagar', h: '¿A dónde te enviamos tu prueba?', p: 'Escribe tus datos y te llevamos al pago seguro con todo ya capturado.',
      name: 'Nombre completo', namePh: 'Ana López', email: 'Correo electrónico', emailPh: 'tu@correo.com', phone: 'Celular', phonePh: '55 1234 5678',
      errName: 'Escribe tu nombre y apellido', errEmail: 'Revisa tu correo', errPhone: 'Escribe un celular de 10 dígitos',
      go: 'Continuar al pago seguro', going: 'Llevándote al pago seguro…', total: 'Total', privacy: 'Usamos tus datos solo para enviarte tu pedido.', privacyLink: 'Aviso de privacidad', secure: 'Pago seguro en tiendapharmath.com', soldout: 'Agotado' },
    en: { bag: 'Your cart', empty: 'Your cart is empty', emptySub: 'Pick the test you need and get it at home.', shop: 'Shop tests', sub: 'Subtotal', ship: 'Shipping and taxes calculated at checkout', checkout: 'Check out', added: 'Added to cart', rm: 'Remove', close: 'Close', qty: 'Quantity',
      eyebrow: 'One last step before payment', h: 'Where should we ship your test?', p: "Add your details and we'll take you to secure checkout with everything filled in.",
      name: 'Full name', namePh: 'Ana López', email: 'Email', emailPh: 'you@email.com', phone: 'Mobile', phonePh: '55 1234 5678',
      errName: 'Enter your first and last name', errEmail: 'Check your email', errPhone: 'Enter a 10-digit mobile number',
      go: 'Continue to secure checkout', going: 'Taking you to secure checkout…', total: 'Total', privacy: 'We only use your details to ship your order.', privacyLink: 'Privacy notice', secure: 'Secure checkout on tiendapharmath.com', soldout: 'Sold out' }
  }[LANG];
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const money = n => '$' + Math.round(n).toLocaleString('es-MX') + ' MXN';
  const P = id => D.byId[id];
  const name = p => (p.name && (p.name[LANG] || p.name.es)) || p.id;
  const thumb = p => { const i = p.thumb || (p.images && p.images[0]) || p.img; return i ? (/^https?:/.test(i) ? i : BASE + i) : ''; };

  
  let bag = []; try { bag = JSON.parse(localStorage.getItem(KEY) || '[]').filter(l => P(l.id) && P(l.id).available !== false && l.q > 0); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch (e) {} render(); };
  const count = () => bag.reduce((n, l) => n + l.q, 0);
  const subtotal = () => bag.reduce((n, l) => n + P(l.id).price * l.q, 0);
  function add(id, qty = 1) {
    const p = P(id); if (!p || p.available === false) return false;
    const l = bag.find(x => x.id === id); if (l) l.q = Math.min(l.q + qty, 10); else bag.push({ id, q: Math.min(qty, 10) });
    save(); document.dispatchEvent(new CustomEvent('ph:add', { detail: { id, qty } })); return true;
  }
  const setQ = (id, q) => { const l = bag.find(x => x.id === id); if (!l) return; l.q = Math.max(0, Math.min(q, 10)); bag = bag.filter(x => x.q > 0); save(); };

  
  function checkoutUrl(lead) {
    if (!bag.length) return null;
    const q = new URLSearchParams();
    if (lead) {
      const parts = lead.name.trim().split(/\s+/), first = parts.shift();
      q.set('checkout[email]', lead.email.trim());
      q.set('checkout[shipping_address][first_name]', first);
      if (parts.length) q.set('checkout[shipping_address][last_name]', parts.join(' '));
      q.set('checkout[shipping_address][phone]', '+52' + lead.phone.replace(/\D/g, '').slice(-10));
      q.set('checkout[shipping_address][country]', 'MX');
    }
    q.set('attributes[Origen]', 'Sitio web · datos capturados antes del pago');
    return `${D.store}/cart/${bag.map(l => `${P(l.id).variant}:${l.q}`).join(',')}?${q.toString()}`;
  }

  
  function ensureBag() {
    let b = $('#bag');
    if (!b) {
      b = document.createElement('div'); b.id = 'bag'; b.className = 'bag';
      b.innerHTML = `<div class="bag__scrim" data-bag-close></div>
        <aside class="bag__panel" role="dialog" aria-modal="true" aria-labelledby="bag-h" tabindex="-1">
          <header class="bag__head"><h2 id="bag-h" class="bag__title">${T.bag} <span class="bag__n" data-bag-count></span></h2><button type="button" class="bag__x" data-bag-close aria-label="${T.close}"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="1.5"/></svg></button></header>
          <div class="bag__empty" data-bag-empty><p class="bag__empty-h">${T.empty}</p><p class="bag__empty-p">${T.emptySub}</p><a class="bag__shop" href="${D.shopUrl || 'tienda.html'}">${T.shop}</a></div>
          <div class="bag__lines" data-bag-lines></div>
          <footer class="bag__foot"><div class="bag__row"><span>${T.sub}</span><b data-bag-total></b></div><p class="bag__note">${T.ship}</p><button type="button" class="bag__go" data-checkout>${T.checkout}</button><p class="bag__secure">${lockSvg()}${T.secure}</p></footer>
        </aside><div class="bag__toast" role="status" aria-live="polite"></div>`;
      document.body.appendChild(b);
    }
    return b;
  }
  const lockSvg = () => '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="5.5" width="8" height="5.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
  function render() {
    const n = count();
    $$('[data-bag-count]').forEach(e => { e.textContent = n; e.classList.toggle('is-empty', !n); });
    const b = $('#bag'); if (!b) return;
    const lines = $('[data-bag-lines]', b);
    if (lines) lines.innerHTML = bag.map(l => { const p = P(l.id), t = thumb(p);
      return `<div class="bag__line" data-id="${esc(l.id)}">${t ? `<img class="bag__img" src="${esc(t)}" alt="" width="80" height="80" loading="lazy">` : '<span class="bag__img"></span>'}
        <div class="bag__info"><p class="bag__name">${esc(name(p))}</p>${p.compare > p.price ? `<p class="bag__meta"><s>${money(p.compare * l.q)}</s></p>` : ''}
        <div class="bag__qty" aria-label="${T.qty}"><button type="button" data-dec aria-label="−">−</button><span>${l.q}</span><button type="button" data-inc aria-label="+">+</button></div></div>
        <div class="bag__end"><p class="bag__price">${money(p.price * l.q)}</p><button type="button" class="bag__rm" data-rm>${T.rm}</button></div></div>`; }).join('');
    $$('[data-bag-total]', b).forEach(e => e.textContent = money(subtotal()));
    $$('[data-bag-empty]', b).forEach(e => e.hidden = !!n);
    $$('.bag__foot, [data-checkout]', b).forEach(e => e.hidden = !n);
    b.classList.toggle('has-items', !!n);
  }
  let lastFocus = null;
  function openBag() { const b = ensureBag(); render(); lastFocus = document.activeElement; b.classList.add('is-open'); document.documentElement.classList.add('ph-lock'); setTimeout(() => { const pnl = $('.bag__panel', b) || b; pnl.focus({ preventScroll: true }); }, 30); }
  function closeBag() { const b = $('#bag'); if (!b || !b.classList.contains('is-open')) return; b.classList.remove('is-open'); if (!$('#co.is-open')) document.documentElement.classList.remove('ph-lock'); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
  function toast(msg) { const t = $('#bag .bag__toast'); if (!t) return; t.textContent = msg; t.classList.add('is-on'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('is-on'), 2200); }

  
  const getLead = () => { try { return JSON.parse(localStorage.getItem(LEAD) || 'null'); } catch (e) { return null; } };
  const fmtPhone = v => { const d = v.replace(/\D/g, '').replace(/^52(?=\d{10})/, '').slice(0, 10); return d.length > 6 ? `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}` : d.length > 2 ? `${d.slice(0, 2)} ${d.slice(2)}` : d; };
  const valid = {
    name: v => v.trim().split(/\s+/).filter(w => w.length > 1).length >= 2,
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    phone: v => v.replace(/\D/g, '').replace(/^52(?=\d{10})/, '').length === 10
  };
  function ensureCo() {
    let m = $('#co'); if (m) return m;
    m = document.createElement('div'); m.id = 'co'; m.className = 'co';
    m.innerHTML = `<div class="co__scrim" data-co-close></div>
      <div class="co__card" role="dialog" aria-modal="true" aria-labelledby="co-h" aria-describedby="co-p">
        <button type="button" class="co__x" data-co-close aria-label="${T.close}"><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="1.6"/></svg></button>
        <form class="co__form" novalidate>
          ${D.logo ? `<img class="co__logo" src="${BASE + D.logo}" alt="Pharmath" height="24">` : ''}
          <p class="co__eyebrow">${T.eyebrow}</p>
          <h2 class="co__h" id="co-h">${T.h}</h2>
          <p class="co__p" id="co-p">${T.p}</p>
          <div class="co__sum" data-co-sum></div>
          <div class="co__field" data-f="name"><label for="co-name">${T.name}</label><input id="co-name" name="name" autocomplete="name" placeholder="${T.namePh}" required><small>${T.errName}</small></div>
          <div class="co__field" data-f="email"><label for="co-email">${T.email}</label><input id="co-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="${T.emailPh}" required><small>${T.errEmail}</small></div>
          <div class="co__field co__field--tel" data-f="phone"><label for="co-phone">${T.phone}</label><div class="co__tel"><span class="co__cc" aria-hidden="true">+52</span><input id="co-phone" name="phone" type="tel" autocomplete="tel-national" inputmode="numeric" placeholder="${T.phonePh}" required></div><small>${T.errPhone}</small></div>
          <button type="submit" class="co__go"><span class="co__go-t">${T.go}</span><span class="co__spin" aria-hidden="true"></span></button>
          <p class="co__secure">${lockSvg()}${T.secure}</p>
          <p class="co__legal">${T.privacy} <a href="${D.privacy}" target="_blank" rel="noopener">${T.privacyLink}</a></p>
        </form>
      </div>`;
    document.body.appendChild(m);
    const f = $('form', m), tel = $('#co-phone', m);
    m.addEventListener('click', e => { if (e.target.closest('[data-co-close]')) closeCo(); });
    tel.addEventListener('input', () => { const pos = tel.value.length; tel.value = fmtPhone(tel.value); if (pos === tel.value.length) {} });
    $$('input', m).forEach(i => i.addEventListener('blur', () => { if (i.value) check(i.name); }));
    $$('input', m).forEach(i => i.addEventListener('input', () => { const fl = i.closest('.co__field'); if (fl.classList.contains('is-bad') && valid[i.name](i.value)) fl.classList.remove('is-bad'); }));
    function check(k) { const i = f.elements[k], ok = valid[k](i.value); i.closest('.co__field').classList.toggle('is-bad', !ok); i.setAttribute('aria-invalid', String(!ok)); return ok; }
    f.addEventListener('submit', e => {
      e.preventDefault();
      const bad = ['name', 'email', 'phone'].filter(k => !check(k));
      if (bad.length) { f.elements[bad[0]].focus(); m.querySelector('.co__card').animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 260, easing: 'ease-out' }); return; }
      const lead = { name: f.elements.name.value.trim().replace(/\s+/g, ' '), email: f.elements.email.value.trim(), phone: f.elements.phone.value.replace(/\D/g, '').slice(-10) };
      try { localStorage.setItem(LEAD, JSON.stringify(lead)); } catch (er) {}
      const url = checkoutUrl(lead);
      document.dispatchEvent(new CustomEvent('ph:lead', { detail: { lead, lines: bag.slice(), url } }));
      const go = $('.co__go', m); go.disabled = true; go.classList.add('is-loading'); $('.co__go-t', m).textContent = T.going;
      setTimeout(() => { location.href = url; }, 650);
    });
    m.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeCo();
      if (e.key === 'Tab') { const fs = $$('button, input, a[href]', m).filter(x => !x.disabled && x.offsetParent); const a = fs[0], z = fs[fs.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    });
    return m;
  }
  function openCo() {
    if (!bag.length) return;
    const m = ensureCo(), lead = getLead() || {};
    ['name', 'email', 'phone'].forEach(k => { const i = m.querySelector(`[name=${k}]`); if (lead[k] && !i.value) i.value = k === 'phone' ? fmtPhone(lead[k]) : lead[k]; i.closest('.co__field').classList.remove('is-bad'); });
    const go = $('.co__go', m); go.disabled = false; go.classList.remove('is-loading'); $('.co__go-t', m).textContent = T.go;
    $('[data-co-sum]', m).innerHTML = bag.map(l => { const p = P(l.id), t = thumb(p);
      return `<div class="co__li">${t ? `<img src="${esc(t)}" alt="" width="48" height="48">` : '<span></span>'}<span class="co__li-n">${esc(name(p))}${l.q > 1 ? ` <em>× ${l.q}</em>` : ''}</span><b>${money(p.price * l.q)}</b></div>`; }).join('') +
      `<div class="co__tot"><span>${T.total}</span><b>${money(subtotal())}</b></div>`;
    const b = $('#bag'); if (b) b.classList.remove('is-open');
    if (!lastFocus || !m.contains(lastFocus)) lastFocus = document.activeElement;
    m.classList.add('is-open'); document.documentElement.classList.add('ph-lock');
    setTimeout(() => { const first = ['name', 'email', 'phone'].map(k => m.querySelector(`[name=${k}]`)).find(i => !i.value) || $('.co__go', m); first.focus({ preventScroll: true }); }, 80);
  }
  function closeCo() { const m = $('#co'); if (!m) return; m.classList.remove('is-open'); if (!$('#bag.is-open')) document.documentElement.classList.remove('ph-lock'); }

  
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add], [data-buy]');
    if (a) {
      e.preventDefault();
      let q = +a.dataset.qty || 1; if (a.dataset.qtyFrom) { const s = $(a.dataset.qtyFrom); if (s) q = +s.value || 1; }
      if (!add(a.dataset.id, q)) { a.classList.add('is-soldout'); return; }
      a.classList.add('is-added'); setTimeout(() => a.classList.remove('is-added'), 1400);
      if (a.hasAttribute('data-buy')) { ensureBag(); render(); openCo(); return; }
      if (a.hasAttribute('data-no-drawer')) { ensureBag(); render(); toast(T.added); return; }
      openBag(); return;
    }
    if (e.target.closest('[data-bag-open]')) { e.preventDefault(); openBag(); return; }
    if (e.target.closest('[data-bag-close]')) { e.preventDefault(); closeBag(); return; }
    if (e.target.closest('[data-checkout]')) { e.preventDefault(); openCo(); return; }
    const line = e.target.closest('.bag__line');
    if (line) { const id = line.dataset.id, l = bag.find(x => x.id === id); if (!l) return;
      if (e.target.closest('[data-inc]')) setQ(id, l.q + 1); else if (e.target.closest('[data-dec]')) setQ(id, l.q - 1); else if (e.target.closest('[data-rm]')) setQ(id, 0); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#co.is-open')) closeBag(); });
  window.addEventListener('pageshow', () => { const go = $('#co .co__go'); if (go) { go.disabled = false; go.classList.remove('is-loading'); $('.co__go-t', $('#co')).textContent = T.go; } });
  const init = () => { ensureBag(); render(); $$('[data-add], [data-buy]').forEach(b => { const p = P(b.dataset.id); if (p && p.available === false) { b.disabled = true; b.classList.add('is-soldout'); } }); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
  window.PHCart = { add, open: openBag, close: closeBag, checkout: openCo, checkoutUrl, lines: () => bag.slice(), count, subtotal, money, T };
})();
