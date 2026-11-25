
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const LANG = document.documentElement.lang === 'en' ? 'en' : 'es';
  const B = window.BEUHR || { products: [] };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const money = (n) => '$' + Number(n).toLocaleString('en-US') + ' MXN';

  
  const rv = $$('[data-rv]');
  if (!reduce && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('rv-on');
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -15% 0px' });
    rv.forEach((el) => { if (el.getBoundingClientRect().top < innerHeight * 0.85) el.classList.add('is-in'); else io.observe(el); });
    const lines = $('[data-lines]'); if (lines) requestAnimationFrame(() => requestAnimationFrame(() => lines.classList.add('is-in')));
  }

  
  const vids = $$('video[data-loop]');
  if (vids.length) {
    if (reduce) vids.forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });
    else if ('IntersectionObserver' in window) { const vo = new IntersectionObserver((es) => es.forEach((e) => { const v = e.target; if (e.isIntersecting) { const p = v.play(); p && p.catch(() => {}); } else v.pause(); }), { threshold: 0.05 }); vids.forEach((v) => vo.observe(v)); }
  }

  
  const items = $$('[data-menu]');
  const closeAll = (except) => items.forEach((li) => { if (li === except) return; li.classList.remove('is-open'); li.querySelector('.mega').hidden = true; li.querySelector('.hd__btn').setAttribute('aria-expanded', 'false'); });
  const openMenu = (li) => { closeAll(li); li.classList.add('is-open'); li.querySelector('.mega').hidden = false; li.querySelector('.hd__btn').setAttribute('aria-expanded', 'true'); };
  items.forEach((li) => {
    const btn = li.querySelector('.hd__btn'); let t;
    btn.addEventListener('click', () => (li.classList.contains('is-open') ? closeAll() : openMenu(li)));
    li.addEventListener('mouseenter', () => { if (matchMedia('(hover:hover)').matches) { clearTimeout(t); openMenu(li); } });
    li.addEventListener('mouseleave', () => { if (matchMedia('(hover:hover)').matches) t = setTimeout(() => closeAll(), 120); });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('[data-menu]')) closeAll(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeAll(); closeDrawer(); } });
  const top = $('[data-top]'); let lastY = scrollY;
  if (top) addEventListener('scroll', () => { const y = scrollY; if (!items.some((i) => i.classList.contains('is-open'))) top.classList.toggle('is-hid', y > 400 && y > lastY + 4); if (y < lastY - 4 || y < 120) top.classList.remove('is-hid'); lastY = y; }, { passive: true });

  
  const drawer = $('[data-drawer]');
  let dT;
  function closeDrawer() { if (drawer && !drawer.hidden && drawer.classList.contains('is-open')) { drawer.classList.remove('is-open'); document.documentElement.classList.remove('drawer-lock'); clearTimeout(dT); dT = setTimeout(() => { drawer.hidden = true; }, reduce ? 0 : 320); } }
  $$('[data-drawer-open]').forEach((b) => b.addEventListener('click', () => { clearTimeout(dT); drawer.hidden = false; document.documentElement.classList.add('drawer-lock'); requestAnimationFrame(() => requestAnimationFrame(() => drawer.classList.add('is-open'))); const x = drawer.querySelector('.drawer__x'); x && x.focus({ preventScroll: true }); }));
  $$('[data-drawer-close]').forEach((b) => b.addEventListener('click', closeDrawer));

  
  const slides = $('[data-slides]');
  if (slides) {
    const lays = $$('[data-slide]', slides), dots = $$('[data-dot]', slides); let i = 0, timer;
    const go = (n) => { i = (n + lays.length) % lays.length; lays.forEach((l, k) => l.classList.toggle('is-on', k === i)); dots.forEach((d, k) => d.classList.toggle('is-on', k === i)); };
    const auto = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(i + 1), 5000); };
    dots.forEach((d) => d.addEventListener('click', (e) => { e.preventDefault(); go(+d.dataset.dot); auto(); }));
    auto();
  }

  
  $$('[data-car]').forEach((car) => {
    const tr = $('[data-track]', car), prev = $('[data-prev]', car), next = $('[data-next]', car);
    const step = () => { const c = tr.querySelector('.pc'); return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(c.parentElement).columnGap || 32) : 280; };
    const upd = () => { if (!prev) return; prev.disabled = tr.scrollLeft < 4; next.disabled = tr.scrollLeft + tr.clientWidth > tr.scrollWidth - 4; };
    prev && prev.addEventListener('click', () => tr.scrollBy({ left: -step(), behavior: 'smooth' }));
    next && next.addEventListener('click', () => tr.scrollBy({ left: step(), behavior: 'smooth' }));
    tr.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  });
  document.addEventListener('click', (e) => {
    const rm = e.target.closest('.pc__read'); if (!rm) return;
    const box = rm.closest('[data-more]'); const open = box.classList.toggle('is-open');
    rm.textContent = open ? rm.dataset.rl : rm.dataset.rm; rm.setAttribute('aria-expanded', open);
  });

  
  const proto = $('[data-proto]');
  if (proto) {
    const s = $$('[data-pslide]', proto), w = $$('[data-pwho]', proto), d = $$('[data-pdot]', proto); let i = 0, timer;
    const go = (n) => { i = (n + s.length) % s.length; [s, w, d].forEach((arr) => arr.forEach((el, k) => el.classList.toggle('is-on', k === i))); };
    const auto = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(i + 1), 6000); };
    $('[data-pprev]', proto).addEventListener('click', () => { go(i - 1); auto(); });
    $('[data-pnext]', proto).addEventListener('click', () => { go(i + 1); auto(); });
    let x0 = null; proto.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    proto.addEventListener('touchend', (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); auto(); } x0 = null; });
    auto();
  }

  
  document.addEventListener('click', (e) => {
    const q = e.target.closest('[data-acc] > button'); if (!q) return;
    const it = q.parentElement; const open = it.classList.toggle('is-open'); q.setAttribute('aria-expanded', open);
  });

  
  $$('[data-news]').forEach((f) => f.addEventListener('submit', (e) => { e.preventDefault(); const i = f.querySelector('input'); if (!i.checkValidity()) { i.focus(); return; } f.hidden = true; f.nextElementSibling.classList.add('is-on'); }));

  

  
  function initPdp(root) {
    const gal = $('[data-gal]', root);
    if (gal) {
      const tr = $('[data-galtrack]', gal), real = $$('.kh__slide', tr), bar = $('[data-galbar]', gal);
      if (real.length > 1 && !tr.dataset.cloned) { const a = real[real.length - 1].cloneNode(true), z = real[0].cloneNode(true); [a, z].forEach((c) => { c.classList.add('is-clone'); c.classList.remove('is-on'); c.setAttribute('aria-hidden', 'true'); c.querySelector('img').loading = 'lazy'; }); tr.prepend(a); tr.append(z); tr.dataset.cloned = '1'; }
      const sl = $$('.kh__slide', tr);
      const center = (el, smooth) => tr.scrollTo({ left: el.offsetLeft - (tr.clientWidth - el.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' });
      const upd = () => { const c = tr.scrollLeft + tr.clientWidth / 2; let best = 0, bd = 1e9; sl.forEach((s, k) => { const m = s.offsetLeft + s.offsetWidth / 2; const d = Math.abs(m - c); if (d < bd) { bd = d; best = k; } }); sl.forEach((s, k) => s.classList.toggle('is-on', k === best)); const ri = Math.max(0, real.indexOf(sl[best].classList.contains('is-clone') ? (best === 0 ? real[real.length - 1] : real[0]) : sl[best])); bar.style.marginLeft = (100 / real.length) * ri + '%'; };
      let t; tr.addEventListener('scroll', () => { requestAnimationFrame(upd); clearTimeout(t); t = setTimeout(() => { const on = sl.find((x) => x.classList.contains('is-on')); if (on && on.classList.contains('is-clone')) center(on === sl[0] ? real[real.length - 1] : real[0], false); }, 160); }, { passive: true });
      sl.forEach((s) => s.addEventListener('click', () => center(s, true)));
      center(real[0], false); upd(); addEventListener('resize', () => center(sl.find((x) => x.classList.contains('is-on')) || real[0], false));
    }
    const seg = $('[data-seg]', root);
    if (seg) {
      const add = $('.kh__panel [data-add]', root), price = $('.kh__price strong', root), was = $('.kh__price s', root), save = $('.kh__save', root);
      const set = (o) => {
        $$('.seg__o', seg).forEach((x) => { const on = x === o; x.classList.toggle('is-on', on); x.setAttribute('aria-checked', on); });
        price.textContent = money(o.dataset.price); was.textContent = o.dataset.was ? money(o.dataset.was) : ''; was.hidden = !o.dataset.was;
        save.textContent = o.dataset.save ? save.textContent.replace(/\$[\d,]+/, '$' + o.dataset.save) : ''; save.hidden = !o.dataset.save;
        if (add) add.dataset.qty = o.dataset.qty;
      };
      $$('.seg__o', seg).forEach((o) => o.addEventListener('click', () => set(o)));
      set($('.seg__o.is-on', seg));
    }
  }
  const pdpHost = $('[data-pdp]');
  if (pdpHost) {
    const swap = (id, push) => {
      const tpl = document.getElementById('tpl-' + id); const cur = $('[data-pdp]');
      if (!tpl || !cur || cur.dataset.pdp === id) return false;
      const node = tpl.content.firstElementChild.cloneNode(true);
      const tplOld = document.createElement('template'); tplOld.id = 'tpl-' + cur.dataset.pdp; tplOld.content.appendChild(cur.cloneNode(true));
      cur.replaceWith(node); tpl.remove(); node.parentElement.appendChild(tplOld);
      document.title = node.dataset.title; initPdp(node);
      if (push) history.replaceState(null, '', '?p=' + id);
      return true;
    };
    const q = new URLSearchParams(location.search).get('p');
    if (q && q !== pdpHost.dataset.pdp) swap(q); else initPdp(pdpHost);
    document.addEventListener('click', (e) => { const a = e.target.closest('[data-goto]'); if (a && swap(a.dataset.goto, true)) { e.preventDefault(); } });
  }


  
  const plans = $('[data-plans]');
  if (plans) {
    const tabs = $$('[data-ptab]', plans), cards = $$('[data-plan]', plans), track = $('.plans__track', plans), view = $('[data-pview]', plans); let cur = 1;
    const place = () => { const c = cards[cur]; const gap = parseFloat(getComputedStyle(track).columnGap) || 30; const x = view.clientWidth / 2 - c.offsetWidth / 2 - cur * (c.offsetWidth + gap); track.style.translate = x + 'px 0'; };
    const go = (n) => { cur = n; tabs.forEach((t, k) => { t.classList.toggle('is-on', k === n); t.setAttribute('aria-selected', k === n); }); cards.forEach((c, k) => c.classList.toggle('is-on', k === n)); place(); };
    tabs.forEach((t) => t.addEventListener('click', () => go(+t.dataset.ptab)));
    cards.forEach((c, k) => c.addEventListener('click', (e) => { if (k !== cur && !e.target.closest('a,button')) go(k); }));
    addEventListener('resize', place); go(1);
    cards.forEach((c) => $$('.plan__seg .seg__o', c).forEach((o) => o.addEventListener('click', () => {
      $$('.plan__seg .seg__o', c).forEach((x) => { x.classList.toggle('is-on', x === o); x.setAttribute('aria-checked', x === o); });
      $('[data-price]', c).textContent = $('[data-price]', c).textContent.replace(/\$[\d,]+ MXN/, o.dataset.price);
      $('[data-inc]', c).textContent = o.dataset.inc; $('[data-planmore]', c).href = 'product.html?p=' + o.dataset.pid;
      const pic = $('.plan__pics', c); pic.onclick = () => { location.href = 'product.html?p=' + o.dataset.pid; };
    })));
    cards.forEach((c) => { const pic = $('.plan__pics', c); pic.style.cursor = 'pointer'; pic.onclick = () => { location.href = $('[data-planmore]', c).href; }; });
  }
})();
