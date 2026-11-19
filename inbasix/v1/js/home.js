/* Inbasix v1 · home: más pedidos, category counts, stories masonry, catalog (?cat=) */
(function () {
  const K = window.IBK, V = window.V1;
  const { $, $$, esc } = V;

  /* Los más pedidos: real priced products across lines (no invented discounts) */
  const POP = ['ultrasonido-mindray-consona-n5', 'ultrasonido-mindray-mx7', 'laser-co2-70w', 'acido-poli-l-lactico-le-ciel-rosy'];
  function popular() {
    const box = $('[data-pop]'); if (!box) return;
    box.innerHTML = POP.map(K.find).filter(p => p && p.img.length).map(V.card).join('');
  }

  /* category bubble counts from live collection data */
  function counts() {
    $$('[data-count-col]').forEach(b => { const n = V.listFor(b.dataset.countCol).length; if (n) b.textContent = n; });
  }

  /* stories: testimonials (static) + real reels, masonry + chips */
  async function stories() {
    const mas = $('[data-mas]'); if (!mas) return;
    const sum = $('[data-rsum]'); if (sum) sum.innerHTML = V.reviewSummary();
    const tpl = document.createElement('div'); tpl.innerHTML = V.RV.map(V.reviewCard).join('');
    const t = [...tpl.children];
    const reels = await V.reelCards(V.REELS);
    const order = []; // interleave like the benchmark: text, text, video, video…
    for (let i = 0, j = 0; i < t.length || j < reels.length;) { if (t[i]) order.push(t[i++]); if (t[i]) order.push(t[i++]); if (reels[j]) order.push(reels[j++]); if (reels[j]) order.push(reels[j++]); }
    order.forEach(n => mas.appendChild(n));
    K.watch(mas);
    const chips = $$('[data-chips] .chip-y');
    chips.forEach(c => c.addEventListener('click', () => {
      chips.forEach(o => o.classList.toggle('is-on', o === c));
      const f = c.dataset.f;
      $$('.mi', mas).forEach(m => { m.hidden = !(f === 'all' || m.dataset.tag === f); });
    }));
    // hide chips with no items
    chips.forEach(c => { if (c.dataset.f !== 'all' && !$$(`.mi[data-tag="${c.dataset.f}"]`, mas).length) c.hidden = true; });
  }

  /* catalog: every product reachable, filterable by ?cat=<group|collection> */
  const CHIPS = [['all', 'Todos'], ['ultrasonido', 'Ultrasonido'], ['aparatologia', 'Aparatología estética'], ['imagenologia', 'Imagenología'], ['fillers', 'Fillers'],
    ['veterinario', 'Veterinario'], ['quirofano', 'Quirófano'], ['transductores', 'Transductores y accesorios'], ['cardiologia', 'Cardiología']];
  function catalog() {
    const grid = $('[data-cat-grid]'); if (!grid) return;
    const chipsBox = $('[data-cat-chips]'), more = $('[data-cat-more]'), title = $('[data-cat-title]'), count = $('[data-cat-count]');
    const qs = new URLSearchParams(location.search);
    let cur = qs.get('cat') || 'all';
    if (cur !== 'all' && !V.colTitle(cur)) cur = 'all';
    const chips = CHIPS.slice();
    if (!chips.some(c => c[0] === cur)) chips.splice(1, 0, [cur, V.colTitle(cur)]);
    chipsBox.innerHTML = chips.map(([k, t]) => `<button class="chip-y${k === cur ? ' is-on' : ''}" type="button" data-k="${k}">${esc(t)}</button>`).join('');
    let shown = 12, list = [];
    const render = () => {
      grid.innerHTML = list.slice(0, shown).map(V.card).join('') || '<p class="cat2-empty">No hay equipos en esta categoría por ahora</p>';
      more.hidden = shown >= list.length;
      count.textContent = `${list.length} ${list.length === 1 ? 'equipo' : 'equipos'}`;
    };
    const set = (k, push) => {
      cur = k; shown = 12;
      list = V.listFor(k).sort((a, b) => (!a.img.length - !b.img.length) || (K.isQuote(a) - K.isQuote(b)));
      title.textContent = k === 'all' ? 'Catálogo completo' : V.colTitle(k);
      $$('.chip-y', chipsBox).forEach(c => c.classList.toggle('is-on', c.dataset.k === k));
      render();
      if (push) { const u = new URL(location.href); if (k === 'all') u.searchParams.delete('cat'); else u.searchParams.set('cat', k); u.hash = 'catalogo'; history.replaceState(null, '', u); }
    };
    chipsBox.addEventListener('click', e => { const c = e.target.closest('[data-k]'); if (c) set(c.dataset.k, true); });
    more.addEventListener('click', () => { shown += 12; render(); });
    set(cur, false);
    const on = chipsBox.querySelector('.is-on'); if (on && on.offsetLeft > chipsBox.clientWidth) chipsBox.scrollLeft = on.offsetLeft - 18; // never scroll the page on load
    // nav links to ?cat= on this same page: re-filter without reload
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href*="index.html?cat="]'); if (!a) return;
      const k = new URL(a.href).searchParams.get('cat'); if (!k || !V.colTitle(k)) return;
      e.preventDefault();
      if (!chips.some(c => c[0] === k)) { chips.splice(1, 0, [k, V.colTitle(k)]); chipsBox.insertAdjacentHTML('afterbegin', ''); chipsBox.children[0].insertAdjacentHTML('afterend', `<button class="chip-y" type="button" data-k="${k}">${esc(V.colTitle(k))}</button>`); }
      set(k, true);
      document.getElementById('catalogo').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      $$('.nav-i.is-open').forEach(i => i.classList.remove('is-open'));
    });
    if (qs.get('cat')) requestAnimationFrame(() => document.getElementById('catalogo').scrollIntoView());
  }

  document.addEventListener('DOMContentLoaded', () => { popular(); counts(); stories(); catalog(); });
})();
