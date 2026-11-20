/* Baronil shared bag.
   ES (República Dominicana): the bag becomes a WhatsApp order to Baronil's order line with every item, size, color and RD$ total.
   EN (USA): Baronil sells in the US through Amazon, so checkout opens the Amazon listing(s); RD-only items are flagged.
   Markup contract (each version styles it): any [data-add] button with data-id, data-color, data-size(optional), data-qty(optional);
   [data-bag-open], [data-bag-count]; the drawer is injected as #bag (classes .bag, .bag__*). */
(function () {
  const B = window.BARONIL; if (!B) return;
  const LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  const KEY = 'baronil-bag-v1';
  const T = {
    es: { bag: 'Tu bolsa', empty: 'Tu bolsa está vacía.', keep: 'Seguir comprando', subtotal: 'Subtotal', checkout: 'Pedir por WhatsApp',
          note: 'Te confirmamos disponibilidad, envío a domicilio y forma de pago por WhatsApp.', size: 'Talla', color: 'Color', remove: 'Quitar',
          pack: (n) => n > 1 ? `Paquete de ${n}` : 'Unidad', added: 'Agregado a tu bolsa', choose: 'Elige tu talla',
          msg: 'Hola Baronil 👋 Quiero hacer este pedido:', total: 'Total estimado', amazonNote: '¿Estás en EE.UU.? Este producto también está en Amazon.' },
    en: { bag: 'Your bag', empty: 'Your bag is empty.', keep: 'Keep shopping', subtotal: 'Items', checkout: 'Checkout on Amazon',
          note: 'Baronil ships in the US through Amazon. We’ll open each product on Amazon to complete your order.', size: 'Size', color: 'Color', remove: 'Remove',
          pack: () => '', added: 'Added to your bag', choose: 'Choose your size',
          rdOnly: 'Available in the Dominican Republic only — order via WhatsApp', msg: '', total: '' },
  }[LANG];
  const money = (n) => 'RD$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const byId = (id) => B.products.find(p => p.id === id);
  let bag = [];
  try { bag = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { bag = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch (e) {} };
  const count = () => bag.reduce((s, i) => s + i.qty, 0);
  const priceOf = (it) => { const p = byId(it.id); return p && p.rd ? (p.rd[it.color] || 0) * it.qty : 0; };
  const imgOf = (p, color) => (window.BARONIL_IMG && window.BARONIL_IMG(p.id, color, 'card')) || '';

  function syncCount() {
    document.querySelectorAll('[data-bag-count]').forEach(el => { const n = count(); el.textContent = n; el.toggleAttribute('hidden', n === 0); });
  }
  function ensureDrawer() {
    let d = document.getElementById('bag'); if (d) return d;
    d = document.createElement('div'); d.id = 'bag'; d.className = 'bag'; d.setAttribute('aria-hidden', 'true');
    d.innerHTML = `<div class="bag__scrim" data-bag-close></div>
      <aside class="bag__panel" role="dialog" aria-modal="true" aria-label="${T.bag}">
        <header class="bag__head"><h2 class="bag__title">${T.bag} <span class="bag__n" data-bag-count></span></h2>
          <button class="bag__x" data-bag-close aria-label="${LANG === 'es' ? 'Cerrar' : 'Close'}">&times;</button></header>
        <div class="bag__body"></div>
        <footer class="bag__foot"></footer>
      </aside>`;
    document.body.appendChild(d);
    d.addEventListener('click', (e) => {
      if (e.target.closest('[data-bag-close]')) close();
      const rm = e.target.closest('[data-rm]'); if (rm) { bag.splice(+rm.dataset.rm, 1); save(); render(); }
      const q = e.target.closest('[data-q]'); if (q) { const i = +q.dataset.i; bag[i].qty = Math.max(1, bag[i].qty + (+q.dataset.q)); save(); render(); }
      if (e.target.closest('[data-checkout]')) checkout();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    return d;
  }
  function render() {
    const d = ensureDrawer(); syncCount();
    const body = d.querySelector('.bag__body'), foot = d.querySelector('.bag__foot');
    if (!bag.length) { body.innerHTML = `<p class="bag__empty">${T.empty}</p>`; foot.innerHTML = `<button class="bag__cta" data-bag-close>${T.keep}</button>`; return; }
    body.innerHTML = bag.map((it, i) => {
      const p = byId(it.id); if (!p) return '';
      const c = B.colors[it.color];
      const pack = LANG === 'es' ? T.pack(p.rdPack[it.color] || 1) : '';
      const price = LANG === 'es' ? `<span class="bag__price">${money(priceOf(it))}</span>` : (p.asin ? `<span class="bag__amz">Amazon</span>` : `<span class="bag__flag">${T.rdOnly}</span>`);
      return `<div class="bag__item">
        <img class="bag__img" src="${imgOf(p, it.color)}" alt="">
        <div class="bag__info"><strong class="bag__name">${p.name[LANG]}</strong>
          <span class="bag__meta">${c[LANG]} · ${T.size} ${it.size}${pack ? ' · ' + pack : ''}</span>
          <div class="bag__row"><span class="bag__qty"><button data-q="-1" data-i="${i}" aria-label="-">−</button><b>${it.qty}</b><button data-q="1" data-i="${i}" aria-label="+">+</button></span>${price}</div>
          <button class="bag__rm" data-rm="${i}">${T.remove}</button></div></div>`;
    }).join('');
    const sub = bag.reduce((s, it) => s + priceOf(it), 0);
    foot.innerHTML = (LANG === 'es' ? `<div class="bag__sub"><span>${T.subtotal}</span><strong>${money(sub)}</strong></div>` : '') +
      `<button class="bag__cta" data-checkout>${LANG === 'es' ? waIcon() : ''}${T.checkout}</button><p class="bag__note">${T.note}</p>`;
  }
  function waIcon() { return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2Z"/></svg>'; }
  function open() { render(); const d = ensureDrawer(); d.classList.add('is-open'); d.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('bag-lock'); }
  function close() { const d = document.getElementById('bag'); if (!d) return; d.classList.remove('is-open'); d.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('bag-lock'); }
  function add(it) {
    const p = byId(it.id); if (!p) return;
    it.color = it.color || p.colors[0]; it.size = it.size || 'M'; it.qty = it.qty || 1;
    const ex = bag.find(b => b.id === it.id && b.color === it.color && b.size === it.size);
    ex ? ex.qty += it.qty : bag.push(it); save(); open();
  }
  function checkout() {
    if (LANG === 'es') {
      const lines = bag.map(it => { const p = byId(it.id); return `• ${it.qty} × ${p.name.es} — ${B.colors[it.color].es}, talla ${it.size} (${T.pack(p.rdPack[it.color] || 1)}) — ${money(priceOf(it))}`; });
      const msg = `${T.msg}\n${lines.join('\n')}\n${T.total}: ${money(bag.reduce((s, it) => s + priceOf(it), 0))}`;
      window.open(`https://wa.me/${B.contact.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    } else {
      const ps = [...new Set(bag.map(it => it.id))].map(byId).filter(Boolean);
      const amz = ps.filter(p => p.amazon), rd = ps.filter(p => !p.amazon);
      if (amz.length === 1 && !rd.length) { window.open(amz[0].amazon, '_blank', 'noopener'); return; }
      // Mixed or multi-item bag: browsers block multiple popups, so list one button per destination.
      const wa = rd.length ? `https://wa.me/${B.contact.whatsapp}?text=${encodeURIComponent('Hi Baronil! I would like to order: ' + bag.filter(it => rd.some(p => p.id === it.id)).map(it => `${it.qty} x ${byId(it.id).name.en} (${B.colors[it.color].en}, size ${it.size})`).join('; '))}` : '';
      const foot = document.querySelector('#bag .bag__foot');
      foot.innerHTML = `<p class="bag__note">${amz.length ? 'Open each item on Amazon to choose your pack and size.' : ''}${rd.length ? ' Items available in the Dominican Republic only are ordered on WhatsApp.' : ''}</p>` +
        amz.map(p => `<a class="bag__cta bag__cta--amz" href="${p.amazon}" target="_blank" rel="noopener">${p.name.en} on Amazon →</a>`).join('') +
        (rd.length ? `<a class="bag__cta bag__cta--wa" href="${wa}" target="_blank" rel="noopener">${waIcon()}Order DR items on WhatsApp</a>` : '');
    }
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-add]');
    if (a) { e.preventDefault(); add({ id: a.dataset.id, color: a.dataset.color, size: a.dataset.size, qty: +(a.dataset.qty || 1) }); }
    if (e.target.closest('[data-bag-open]')) { e.preventDefault(); open(); }
  });
  document.addEventListener('DOMContentLoaded', syncCount);
  window.BaronilBag = { add, open, close, list: () => bag.slice(), count };
})();
