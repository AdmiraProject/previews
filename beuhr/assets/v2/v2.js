
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const B = window.BEUHR || {};
  const LANG = (document.documentElement.lang || 'es').slice(0, 2);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  
  const dr = $('#drawer');
  const setDr = (on) => { if (!dr) return; dr.classList.toggle('is-open', on); dr.setAttribute('aria-hidden', !on); document.documentElement.classList.toggle('dr-lock', on); $$('[data-drawer-open]').forEach((b) => b.setAttribute('aria-expanded', on)); };
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-drawer-open]')) { setDr(true); return; }
    if (e.target.closest('[data-drawer-close]') || (e.target.closest('.dr__row'))) setDr(false);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setDr(false); });

  
  const rot = $('[data-rot]');
  if (rot && !reduce) {
    const words = JSON.parse(rot.dataset.rot); const w = $('.hm-rot__w', rot); let k = 0;
    const tick = () => 60 + Math.random() * 30;
    const type = (txt, i, cb) => { w.textContent = txt.slice(0, i); if (i < txt.length) setTimeout(() => type(txt, i + 1, cb), tick()); else cb(); };
    const erase = (cb) => { const t = w.textContent; if (t.length) { w.textContent = t.slice(0, -1); setTimeout(() => erase(cb), tick()); } else setTimeout(cb, 80); };
    const loop = () => setTimeout(() => erase(() => { k = (k + 1) % words.length; rot.href = words[k][1]; type(words[k][0], 1, loop); }), 3000);
    loop();
  }

  
  document.documentElement.classList.add('v2js');
  const bars = $$('.hm-st2, .hm-st4');
  if (reduce || !('IntersectionObserver' in window)) bars.forEach((x) => x.classList.add('is-ani'));
  else { const bio = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-ani'); bio.unobserve(en.target); } }), { threshold: 0.3 }); bars.forEach((x) => bio.observe(x)); }

  
  const vids = $$('video[data-loop]');
  if (vids.length) {
    if (reduce) vids.forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });
    else if ('IntersectionObserver' in window) {
      const vio = new IntersectionObserver((es) => es.forEach((en) => { const v = en.target; if (en.isIntersecting && v.offsetParent !== null) v.play().catch(() => {}); else v.pause(); }), { rootMargin: '100px' });
      vids.forEach((v) => vio.observe(v));
    }
  }

  
  const faqAnim = (d, open) => {
    const a = d.querySelector('.hm-fq__a, .hr-fq__p');
    if (!a || reduce) { d.open = open; return; }
    if (open) d.open = true;
    const from = open ? 0 : a.getBoundingClientRect().height, to = open ? a.scrollHeight : 0;
    a.style.overflow = 'hidden';
    const an = a.animate([{ height: from + 'px' }, { height: to + 'px' }], { duration: 300, easing: 'ease-out' });
    an.onfinish = () => { a.style.overflow = ''; if (!open) d.open = false; };
  };
  $$('.hm-fq, .hr-fq').forEach((d) => {
    $('summary', d).addEventListener('click', (e) => {
      e.preventDefault(); const opening = !d.open;
      if (opening) $$(':scope > details[open]', d.parentElement).forEach((o) => { if (o !== d) faqAnim(o, false); });
      faqAnim(d, opening);
    });
  });

  
  $$('[data-fake-form]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault(); const ok = f.dataset.ok; if (!ok) return;
    const p = document.createElement('p'); p.className = 'is-sent'; p.textContent = ok; f.replaceWith(p);
  }));

  
  $$('[data-swipe]').forEach((sw) => {
    const track = $('.sw__track', sw); const dots = $('.sw__dots', sw); if (!track || !dots) return;
    const n = track.children.length; dots.innerHTML = Array.from({ length: n }, (_, i) => `<button type="button" aria-label="${i + 1}"${i ? '' : ' class="is-on"'}></button>`).join('');
    const upd = () => { const w = track.children[0].getBoundingClientRect().width + 16; const i = Math.round(track.scrollLeft / w); $$('button', dots).forEach((b, j) => b.classList.toggle('is-on', j === i)); };
    track.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true });
    dots.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; const i = $$('button', dots).indexOf(b); track.scrollTo({ left: i * (track.children[0].getBoundingClientRect().width + 16), behavior: 'smooth' }); });
  });

  
  const tabs = $$('.hr-tab');
  if (tabs.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) tabs.forEach((t) => t.classList.toggle('is-on', t.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
    $$('.hr-line').forEach((l) => io.observe(l));
  }

  
  const pdp = $('[data-pdp]');
  if (pdp && B.byId) {
    const id = new URLSearchParams(location.search).get('p');
    const p = B.byId(id) || B.byId(pdp.dataset.pdp);
    const g = p.rx ? (p.line === 'sex' ? 'sex' : 'hair') : 'otc';
    const show = (attr, val) => $$(`[${attr}]`).forEach((el) => { const on = el.getAttribute(attr).split(' ').includes(val); el.hidden = !on; });
    show('data-p', p.id); show('data-g', g); show('data-k', p.rx ? 'rx' : 'otc');
    // OTC nutrition panel image: only fetched when that SKU is on screen
    $$('[data-p]:not([hidden]) .pd-panel[data-img]').forEach((sp) => { const im = new Image(560, 590); im.src = sp.dataset.img; im.alt = sp.dataset.alt; im.loading = 'lazy'; sp.parentNode.insertBefore(im, sp); sp.hidden = true; });
    document.title = p.name + ' | BEUHR';
    $$('[data-lang-link]').forEach((a) => { a.href = a.getAttribute('href').split('?')[0] + '?p=' + p.id; });
    // bundle selector (OTC)
    $$('.pd-bund').forEach((wrap) => {
      const add = $('[data-add]', wrap.closest('.pd-text')); const price = $('.pd-bund__total', wrap.closest('.pd-text'));
      wrap.addEventListener('change', (e) => { const r = e.target.closest('input'); if (!r) return; if (add) add.dataset.qty = r.value; if (price) price.textContent = r.dataset.price; $$('.pd-bund__o', wrap).forEach((o) => o.classList.toggle('is-on', $('input', o).checked)); });
    });
  }

  
  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-modal]'); if (o) { e.preventDefault(); const m = document.getElementById(o.dataset.modal); if (m && m.showModal) m.showModal(); return; }
    const c = e.target.closest('[data-modal-close]'); if (c) c.closest('dialog').close();
    if (e.target.tagName === 'DIALOG') e.target.close();
  });

  
  $$('.pd-ing__item').forEach((it) => { const b = $('.pd-ing__name', it); if (b) b.addEventListener('click', () => { if (innerWidth < 768) it.classList.toggle('is-open'); }); });

  
  const qi = $('.qi');
  if (qi) {
    const goal = new URLSearchParams(location.search).get('goal');
    const key = goal === 'hair' || goal === 'sex' ? goal : 'any';
    $$('[data-qi-img]').forEach((el) => { el.hidden = el.dataset.qiImg !== (key === 'sex' ? 'sex' : 'hair'); });
    $$('[data-qi]').forEach((el) => { el.hidden = el.dataset.qi !== key; });
    const start = () => { document.body.classList.add('qz-on'); window.scrollTo(0, 0); const f = $('.qz-col .qz__opt, .qz-col input'); if (f) f.focus({ preventScroll: true }); };
    $$('[data-qi-start]').forEach((b) => b.addEventListener('click', start));
    if (goal === 'sleep' || goal === 'energy') start(); // no-Rx route: straight to the OTC screen, no medical intro
    $$('[data-keep-q]').forEach((a) => { a.href = a.getAttribute('href') + location.search; });
    const root = $('[data-quiz]');
    if (root) root.addEventListener('qz:render', (e) => { document.body.dataset.qzState = e.detail.id; });
  }
})();
