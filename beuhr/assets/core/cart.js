
(function () {
  const B = window.BEUHR; if (!B) return;
  const LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  const KEY = 'beuhr-bag-v1';
  const T = {
    es: { bag: 'Tu carrito', empty: 'Tu carrito está vacío.', keep: 'Seguir viendo', subtotal: 'Subtotal', checkout: 'Pagar de forma segura', remove: 'Quitar',
          note: 'Pago con Visa, Mastercard o American Express en la tienda oficial de BEUHR. Envío a todo México en 5 a 7 días.', added: 'Agregado al carrito',
          out: 'Agotado por ahora', supp: 'Suplemento · no es un medicamento', rx: 'Los tratamientos con receta empiezan con tu valoración médica.', quiz: 'Iniciar valoración' },
    en: { bag: 'Your cart', empty: 'Your cart is empty.', keep: 'Keep browsing', subtotal: 'Subtotal', checkout: 'Secure checkout', remove: 'Remove',
          note: 'Pay with Visa, Mastercard or American Express on BEUHR’s official store. Ships anywhere in Mexico in 5–7 days.', added: 'Added to cart',
          out: 'Out of stock for now', supp: 'Supplement · not a medication', rx: 'Prescription treatments start with your medical review.', quiz: 'Start assessment' },
  }[LANG];
  const money = (n) => '$' + Number(n).toLocaleString('es-MX') + ' MXN';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const save = (b) => { try { localStorage.setItem(KEY, JSON.stringify(b)); } catch (e) {} };
  const base = (() => { const s = document.querySelector('script[src*="core/cart.js"]'); return s ? s.getAttribute('src').replace(/core\/cart\.js.*$/, '') : '../../assets/'; })();
  let bag = load();
  const priceFor = (p, qty) => { const b = B.bundles.find((x) => x.n === qty); return b ? b.price : p.price * qty; };
  const el = document.createElement('div'); el.id = 'bag'; el.className = 'bag'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<div class="bag__scrim" data-bag-close></div><aside class="bag__panel" role="dialog" aria-label="${T.bag}"><header class="bag__head"><h2 class="bag__title">${T.bag}</h2><button class="bag__x" type="button" data-bag-close aria-label="×">×</button></header><div class="bag__items"></div><footer class="bag__foot"><div class="bag__row"><span>${T.subtotal}</span><strong class="bag__sub"></strong></div><a class="bag__checkout" target="_blank" rel="noopener">${T.checkout}</a><p class="bag__note">${T.note}</p><p class="bag__rx">${T.rx} <a href="quiz.html">${T.quiz}</a></p></footer></aside>`;
  const toast = document.createElement('div'); toast.className = 'bag__toast'; toast.setAttribute('role', 'status');
  function draw() {
    const items = el.querySelector('.bag__items'); let sub = 0;
    items.innerHTML = bag.length ? bag.map((it, k) => { const p = B.byId(it.id); if (!p) return ''; const pr = priceFor(p, it.qty); sub += pr;
      return `<div class="bag__item"><img class="bag__img" src="${base}${p.img.card}" alt="" width="80" height="80"><div class="bag__info"><p class="bag__name">${p.name}</p><p class="bag__meta">${p.dose[LANG]}</p><p class="bag__meta">${T.supp}</p><div class="bag__qty"><button type="button" data-q="-1" data-k="${k}" aria-label="−">−</button><span>${it.qty}</span><button type="button" data-q="1" data-k="${k}" aria-label="+">+</button></div></div><div class="bag__price">${money(pr)}<button type="button" class="bag__rm" data-rm="${k}">${T.remove}</button></div></div>`; }).join('')
      : `<p class="bag__empty">${T.empty}</p>`;
    el.querySelector('.bag__sub').textContent = money(sub);
    const co = el.querySelector('.bag__checkout'); co.href = bag.length ? `${B.contact.shop}/cart/${bag.map((it) => B.byId(it.id).variant + ':' + it.qty).join(',')}` : '#';
    co.classList.toggle('is-off', !bag.length);
    const n = bag.reduce((a, it) => a + it.qty, 0);
    document.querySelectorAll('[data-bag-count]').forEach((c) => { c.textContent = n; c.hidden = !n; });
    save(bag);
  }
  function open() { el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('bag-lock'); }
  function close() { el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('bag-lock'); }
  function add(id, qty) {
    const p = B.byId(id); if (!p || p.rx) { location.href = 'quiz.html?goal=' + (p ? (p.line === 'sex' ? 'sex' : 'hair') : ''); return; }
    if (p.stock === false) { toast.textContent = T.out + ' · ' + p.name; toast.classList.add('is-on'); setTimeout(() => toast.classList.remove('is-on'), 1800); return; }
    const ex = bag.find((x) => x.id === id); if (ex) ex.qty = Math.min(3, ex.qty + qty); else bag.push({ id, qty: Math.min(3, qty) });
    draw(); toast.textContent = T.added + ' · ' + p.name; toast.classList.add('is-on'); setTimeout(() => toast.classList.remove('is-on'), 1800); open();
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-add]'); if (a) { e.preventDefault(); add(a.dataset.id, parseInt(a.dataset.qty || '1', 10)); return; }
    if (e.target.closest('[data-bag-open]')) { e.preventDefault(); draw(); open(); return; }
    if (e.target.closest('[data-bag-close]')) { close(); return; }
    const q = e.target.closest('[data-q]'); if (q) { const it = bag[+q.dataset.k]; it.qty = Math.max(1, Math.min(3, it.qty + +q.dataset.q)); draw(); return; }
    const rm = e.target.closest('[data-rm]'); if (rm) { bag.splice(+rm.dataset.rm, 1); draw(); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  const init = () => { document.body.append(el, toast); draw(); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
  window.BEUHR_BAG = { add, open, close, money };
})();
