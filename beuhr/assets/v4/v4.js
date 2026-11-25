
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  const B = window.BEUHR;
  const L = (o) => (o && typeof o === 'object' && ('es' in o || 'en' in o)) ? (o[LANG] ?? o.es) : o;
  const money = (n) => '$' + Number(n).toLocaleString('en-US') + ' MXN';
  const act = (x) => (LANG === 'en' && x.activesEn) ? x.activesEn : (x.actives || []);
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  
  const nav = $('.nav');
  if (nav) {
    const dd = $('.nav__dd', nav), ddt = $('.nav__ddt', nav);
    const setDD = (o) => { if (!dd) return; dd.classList.toggle('is-open', o); nav.classList.toggle('dd-open', o); ddt.setAttribute('aria-expanded', o); };
    ddt && ddt.addEventListener('click', (e) => { e.stopPropagation(); setDD(!dd.classList.contains('is-open')); });
    document.addEventListener('click', (e) => { if (dd && !dd.contains(e.target)) setDD(false); });
    const mn = $('#mnav'), burger = $('.nav__burger', nav);
    const setMN = (o) => { if (!mn) return; mn.classList.toggle('is-open', o); mn.setAttribute('aria-hidden', !o); burger && burger.setAttribute('aria-expanded', o); document.documentElement.classList.toggle('mnav-lock', o); if (o) { const x = $('.mnav__x', mn); x && x.focus({ preventScroll: true }); } };
    burger && burger.addEventListener('click', () => setMN(true));
    mn && mn.addEventListener('click', (e) => { if (e.target.closest('[data-mnav-close]') || e.target.closest('.mnav__panel a')) setMN(false); const t = e.target.closest('.mnav__ddt'); if (t) { const o = t.parentElement.classList.toggle('is-open'); t.setAttribute('aria-expanded', o); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setMN(false); setDD(false); } });
    matchMedia('(min-width: 992px)').addEventListener('change', (m) => { if (m.matches) setMN(false); });
  }

  
  function slider(root) {
    const track = $('[data-track]', root); if (!track) return;
    const slides = () => $$('[data-slide]', track);
    let i = 0;
    const go = (n) => {
      const s = slides(); if (!s.length) return;
      i = (n + s.length) % s.length;
      const sc = root.querySelector('[data-scroller]');
      if (sc && getComputedStyle(sc).overflowX === 'auto') { track.style.transform = ''; sc.scrollTo({ left: s[i].offsetLeft - s[0].offsetLeft, behavior: 'smooth' }); }
      else track.style.transform = `translateX(${-100 * i}%)`;
      if (root.classList.contains('tl__card')) { const box = $('.tl__box'); const rows = box ? $$('.tl__row', box) : []; if (rows[i] && box.scrollHeight > box.clientHeight + 4) box.scrollTo({ top: rows[i].offsetTop - rows[0].offsetTop, behavior: 'smooth' }); }
      const dots = $$('[data-dots] > button', root); dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
      root.dispatchEvent(new CustomEvent('v4:slide', { detail: i }));
      const on = dots[i]; if (on && on.parentElement.scrollWidth > on.parentElement.clientWidth) on.parentElement.scrollTo({ left: on.offsetLeft - 60, behavior: 'smooth' });
    };
    root.addEventListener('click', (e) => {
      if (e.target.closest('[data-next]')) go(i + 1);
      else if (e.target.closest('[data-prev]')) go(i - 1);
      else { const d = e.target.closest('[data-dots] > button'); if (d) go($$('[data-dots] > button', root).indexOf(d)); }
    });
    let x0 = null;
    track.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => { const sc0 = root.querySelector('[data-scroller]'); if (x0 === null || (sc0 && getComputedStyle(sc0).overflowX === 'auto')) { x0 = null; return; } const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); x0 = null; });
    root._go = go;
    
    const auto = +root.dataset.auto;
    if (auto && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let tm = 0, seen = false, stopped = false;
      const arm = () => { clearTimeout(tm); if (seen && !stopped) tm = setTimeout(() => { go(i + 1); arm(); }, auto); };
      root.addEventListener('pointerdown', () => { stopped = true; clearTimeout(tm); });
      root.addEventListener('keydown', () => { stopped = true; clearTimeout(tm); });
      new IntersectionObserver((es) => { seen = es[0].isIntersecting; if (seen) arm(); else clearTimeout(tm); }, { threshold: .4 }).observe(root);
    }
    const sc = root.querySelector('[data-scroller]');
    if (sc) sc.addEventListener('scroll', () => {
      if (getComputedStyle(sc).overflowX !== 'auto') return;
      const s = slides(); let best = 0;
      s.forEach((el, k) => { if (Math.abs(el.offsetLeft - s[0].offsetLeft - sc.scrollLeft) < Math.abs(s[best].offsetLeft - s[0].offsetLeft - sc.scrollLeft)) best = k; });
      i = best; $$('[data-dots] > button', root).forEach((d, k) => d.classList.toggle('is-on', k === i));
    }, { passive: true });
  }

  
  $$('.ft__t').forEach((b) => b.addEventListener('click', () => { if (innerWidth > 767) return; const c = b.parentElement; const o = c.classList.toggle('is-open'); b.setAttribute('aria-expanded', o); }));

  
  document.addEventListener('click', (e) => {
    const h = e.target.closest('.rx__h'); if (h && !h.disabled) { const c = h.parentElement; const o = c.classList.toggle('is-open'); h.setAttribute('aria-expanded', o); return; }
    const a = e.target.closest('.acc__h'); if (a) { const it = a.parentElement; const o = it.classList.toggle('is-open'); a.setAttribute('aria-expanded', o); }
  });

  
  const rot = $('[data-rot]');
  if (rot && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const words = $$('span', rot); let k = 0;
    setInterval(() => { words[k].classList.remove('is-on'); k = (k + 1) % words.length; words[k].classList.add('is-on'); }, 2200);
  }

  
  const pdp = $('[data-pdp]');
  if (pdp && B) {
    const C = JSON.parse($('#v4-pdp').textContent);
    const id = new URLSearchParams(location.search).get('p') || pdp.dataset.default;
    const p = B.byId(id) || B.byId(pdp.dataset.default);
    const kind = !p.rx ? 'otc' : p.line === 'sex' ? 'sex' : 'hair';
    const K = C.kind[kind];
    const asset = (f) => '../../assets/' + f;
    const cut = (x) => asset('v4/img/' + x.id.replace(/-/g, '') + '-cut.webp');
    document.body.dataset.kind = kind;
    document.title = p.name + ' | BEUHR';
    const set = (k, v, html) => $$(`[data-f="${k}"]`).forEach((el) => { if (html) el.innerHTML = v; else el.textContent = v; });
    set('badge', K.badge, true);
    set('name', p.name);
    { const w = p.name.split(' '); const last = w.pop(); set('name2', w.length ? esc(w.join(' ')) + '<br>' + esc(last) : esc(last), true); }
    set('mono', act(p).join(' | '));
    set('desc', L(p.blurb));
    set('price', money(kind === 'otc' ? 799 : p.price).replace(' MXN', ''));
    set('supply', L(p.format) + ' · ' + K.supply);
    set('note', K.note, true);
    set('dose', L(p.dose));
    const stats = (kind === 'hair' && p.route === 'topical') ? K.stats_top : K.stats;
    $$('[data-f="stats"] .st').forEach((el, k) => { const s = stats[k]; if (!s) return; $('.st__n', el).textContent = s[0]; $('.st__l', el).textContent = s[1]; });
    // CTA
    $$('[data-f="cta"]').forEach((a) => {
      a.textContent = K.btn;
      if (kind === 'otc') { a.setAttribute('href', '#'); a.dataset.add = ''; a.dataset.id = p.id; a.dataset.qty = '1'; if (p.stock === false) { a.classList.add('is-off'); a.textContent = C.soldout; a.removeAttribute('data-add'); } }
      else a.setAttribute('href', 'quiz.html?goal=' + (kind === 'sex' ? 'sex' : 'hair'));
    });
    $$('[data-f="ringimg"]').forEach((im) => { im.src = kind === 'otc' ? asset(p.img.card) : cut(p); im.classList.toggle('ring__img--cover', kind === 'otc'); });
    // gallery
    const gal = $('[data-f="gallery"]');
    if (gal) {
      const imgs = kind === 'otc' ? [p.img.card, p.img.ad || p.img.hand, p.img.hand || p.img.open, p.img.panel].filter(Boolean)
        : [null, p.img.scene, p.img.trio].filter((x) => x !== undefined);
      $('[data-track]', gal).innerHTML = imgs.map((src, k) => src === null
        ? `<div class="gal__slide gal__slide--a" data-slide><img src="${cut(p)}" alt="${esc(p.name)}" width="420" height="560"></div>`
        : `<div class="gal__slide" data-slide><img src="${asset(src)}" alt="${esc(p.name)}" width="560" height="417" ${k ? 'loading="lazy"' : ''}></div>`).join('');
      $('[data-dots]', gal).innerHTML = imgs.map((_, k) => `<button type="button" class="${k ? '' : 'is-on'}" aria-label="${k + 1}"></button>`).join('');
    }
    // bundles (OTC)
    const bun = $('[data-f="bundles"]');
    if (bun && kind === 'otc') {
      bun.hidden = false;
      const cta = $('[data-f="cta"]');
      $('.bun__opts', bun).innerHTML = B.bundles.map((b, k) => `<button type="button" class="bun__o${b.popular ? ' is-on' : ''}" data-q="${b.n}" aria-pressed="${!!b.popular}">${b.popular ? `<span class="bun__pop">${C.popular}</span>` : ''}<span class="bun__n">${b.n} ${b.n > 1 ? C.bundle[1] : C.bundle[0]}</span><span class="bun__m">${b.months} ${b.months > 1 ? C.bundle_m[1] : C.bundle_m[0]}</span><span class="bun__p">${money(b.price).replace(' MXN', '')}</span>${b.save ? `<span class="bun__s">${C.save} $${b.save}</span>` : '<span class="bun__s">&nbsp;</span>'}</button>`).join('');
      const pick = (n) => { $$('.bun__o', bun).forEach((o) => { const on = +o.dataset.q === n; o.classList.toggle('is-on', on); o.setAttribute('aria-pressed', on); }); const b = B.bundles.find((x) => x.n === n); set('price', money(b.price).replace(' MXN', '')); if (cta && cta.dataset.add !== undefined) cta.dataset.qty = n; };
      bun.addEventListener('click', (e) => { const o = e.target.closest('.bun__o'); if (o) pick(+o.dataset.q); });
      pick(2);
    }
    // accordions
    const fill = (s) => s.replace('{does}', L(p.does) || '').replace('{actives}', act(p).join(', ') + '.').replace('{format}', L(p.format) || '').replace('{purpose}', L(p.purpose) || '');
    $$('[data-f="acc"] .acc__i').forEach((el, k) => { const a = K.acc[k]; if (!a) return; $('.acc__t', el).textContent = a[0]; $('.acc__b p', el).textContent = fill(a[1]); });
    // ingredient cards
    const ingWrap = $('[data-f="ing1"]');
    if (ingWrap) {
      const actKey = (a) => { const s = a.toLowerCase(); if (s.includes('minoxidil')) return s.includes('%') ? 'minoxidil-top' : 'minoxidil-oral'; if (s.includes('finasterid')) return s.includes('%') ? 'finasterida-top' : 'finasterida-oral'; if (s.includes('sildenafil')) return 'sildenafil'; return 'otc'; };
      const n = (p.actives || []).length;
      ingWrap.innerHTML = (p.actives || []).map((a, k) => {
        const shown = act(p)[k] || a; const m = shown.match(/^(.*?)\s([\d.,]+\s?(?:mg|%))$/); const nm = m ? m[1] : shown; const dose = m ? m[2] : '';
        const A = C.act[actKey(a)]; const body = A.a ? `<div class="rx__b"><div class="rx__bi"><div class="rx__in"><p class="rx__q">${A.q}</p><p class="rx__a">${A.a}</p>${A.q2 ? `<p class="rx__q">${A.q2}</p><p class="rx__a">${A.a2}</p>` : ''}</div></div></div>` : '';
        const img = kind === 'otc' ? asset(p.img.card) : cut(p);
        return `<div class="rx${k === 0 && body ? ' is-open' : ''}"><button class="rx__h" type="button" aria-expanded="${k === 0 && !!body}" ${body ? '' : 'disabled'}><span class="rx__ic"><span class="rx__img${kind === 'otc' ? ' rx__img--cover' : ''}"><img src="${img}" alt="" width="52" height="52" loading="lazy"></span><span class="rx__tag">${A.tag}</span></span><span class="rx__t"><span class="rx__n">${esc(nm)}</span><span class="rx__s">${kind === 'otc' ? esc(L(p.dose)) : A.s}</span></span><span class="rx__r"><span class="rx__d">${dose || '·'}</span><span class="rx__k">${k + 1}/${n}</span>${body ? '<span class="rx__x" aria-hidden="true">+</span>' : ''}</span></button>${body}</div>`;
      }).join('');
      set('g1', C.g1[kind]); set('g2', C.g2[kind]); set('g2p', C.g2p[kind], true);
      const others = kind === 'hair' ? B.products.filter((x) => x.line === 'hair' && x.id !== p.id).slice(0, 5)
        : kind === 'sex' ? B.products.filter((x) => x.id === 'ascend') : B.products.filter((x) => !x.rx && x.id !== p.id);
      $('[data-f="ing2"]').innerHTML = others.map((o, k) => `<div class="rx${k === 0 ? ' is-open' : ''}"><button class="rx__h" type="button" aria-expanded="${k === 0}"><span class="rx__ic"><span class="rx__img${o.rx ? '' : ' rx__img--cover'}"><img src="${o.rx ? cut(o) : asset(o.img.card)}" alt="" width="52" height="52" loading="lazy"></span><span class="rx__tag">${o.rx ? (o.route === 'topical' ? C.route.topical : C.route.oral) : C.route.otc}</span></span><span class="rx__t"><span class="rx__n">${esc(o.name)}</span><span class="rx__s">${esc(L(o.dose))}</span></span><span class="rx__r"><span class="rx__d">${money(o.price).replace(' MXN', '')}</span><span class="rx__k">${k + 1}/${others.length}</span><span class="rx__x" aria-hidden="true">+</span></span></button><div class="rx__b"><div class="rx__bi"><div class="rx__in rx__in--nut"><p class="rx__a">${o.ideal ? `<b>${C.ideal}</b> ` : ''}${esc(L(o.ideal || o.purpose || o.blurb))} <a href="product.html?p=${o.id}">${C.more}</a></p></div></div></div></div>`).join('');
    }
    // comparison table by kind
    const tbl = $('[data-f="tbl"]');
    if (tbl && kind !== 'hair') {
      set('cmp_h', C.cmp_h[kind], true); set('cmp_p', C.cmp_p[kind]);
      const cols = kind === 'otc' ? ['ascend', 'zen', 'core'] : ['apex', 'ascend'];
      const ps = cols.map((c) => B.byId(c));
      const ck = '<svg class="tbl__ic" viewBox="0 0 13 10" width="13" height="10"><path d="M1 5l4 4 7-8" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
      const xx = '<svg class="tbl__ic tbl__ic--x" viewBox="0 0 18 18" width="18" height="18"><path d="M5 5l8 8M13 5l-8 8" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
      const td = (o, v, cls = '') => `<div class="tbl__td${cls}${o.id === p.id ? ' tbl__td--ll' : ''}">${v}</div>`;
      tbl.style.gridTemplateColumns = `204.66fr ${ps.map(() => '140fr').join(' ')}`;
      tbl.innerHTML = `<div class="tbl__th tbl__th--c">${C.cmp_th}</div>` + ps.map((o) => `<div class="tbl__th${o.id === p.id ? ' tbl__th--ll' : ''}">${o.name}</div>`).join('')
        + `<div class="tbl__td tbl__td--k">${C.cmp_rows[0]}</div>` + ps.map((o) => td(o, money(o.price).replace(' MXN', ''))).join('')
        + `<div class="tbl__td tbl__td--k tbl__td--tall">${C.cmp_rows[1]}</div>` + ps.map((o) => td(o, `${o.actives.length}<span class="tbl__mg">${C.cmp_act}</span>`, ' tbl__td--tall')).join('')
        + `<div class="tbl__td tbl__td--k">${C.cmp_rows[2]}</div>` + ps.map((o) => td(o, o.rx ? ck : xx)).join('')
        + `<div class="tbl__td tbl__td--k">${C.cmp_rows[3]}</div>` + ps.map((o) => td(o, esc(L(o.format).split('·')[0].trim()), ' tbl__td--g')).join('');
    }
    // side effects
    const se = C.se[kind]; set('se_h3', se[0]); set('se_p', se[1], true);
    // legal line
    set('legal', kind === 'otc' ? C.legal_supp : C.legal_rx);
    $$('[data-kind-only]').forEach((el) => { el.hidden = !el.dataset.kindOnly.split(' ').includes(kind); });
  }

  
  const rv = $('[data-reviews]');
  if (rv && window.BEUHR_REVIEWS) {
    const C = JSON.parse($('#v4-pdp').textContent);
    const R = window.BEUHR_REVIEWS[LANG].filter((r) => r.img);
    const scenes = ['img/products/densemax25-scene.jpg', 'img/products/restoremax-scene.jpg', 'img/products/zen-scene.jpg'];
    const packs = ['v4/img/densemax25-cut.webp', 'v4/img/restoremax-cut.webp', 'img/products/zen-hand.jpg'];
    const star = '<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8z" fill="currentColor"/></svg>';
    $('[data-dots]', rv).innerHTML = R.map((r, k) => `<button type="button" class="ms__thumb${k ? '' : ' is-on'}" aria-label="${esc(r.name)}"><img src="../../assets/${r.img}" alt="" width="40" height="40"><span class="ms__dot"></span></button>`).join('');
    $('[data-track]', rv).innerHTML = R.map((r, k) => `<article class="ms__card" data-slide><div class="ms__grid"><div class="ms__ba"><img src="../../assets/${scenes[k % 3]}" alt="" width="244" height="295" loading="lazy"><span class="ms__lab">${esc(r.product)}</span></div><div class="ms__ba ms__ba--pack"><img src="../../assets/${packs[k % 3]}" alt="" width="244" height="295" loading="lazy"><span class="ms__lab">BEUHR</span></div><div class="ms__tile"><img class="kb" src="../../assets/${r.img}" alt="${esc(r.name)}" width="331" height="595" loading="lazy"><span class="ms__lab ms__lab--w ms__stars">${star.repeat(r.stars)}</span></div></div><div class="ms__info"><div class="ms__row"><p class="ms__name">${esc(r.name)} <span>| ${esc(r.city)}</span></p><p class="ms__age">${C.rev_age} ${r.age}</p></div><div class="ms__body"><p class="ms__meta">“${esc(r.t)}”</p><a class="ms__watch" href="quiz.html"><svg viewBox="0 0 10 10" width="8" height="8" aria-hidden="true"><path d="M2 1l7 4-7 4z" fill="currentColor"/></svg>${C.rev_btn}</a><p class="ms__ver"><span class="ms__stars">${star.repeat(r.stars)}</span> ${esc(r.product)}</p></div></div></article>`).join('');
  }

  
  const otc = $('[data-otc]');
  if (otc && B) {
    const chips = $$('.otc__chip', otc);
    const pick = (id) => {
      const p = B.byId(id);
      chips.forEach((c) => { const on = c.dataset.id === id; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on); });
      $$('[data-add]', otc).forEach((b) => { b.dataset.id = id; b.classList.toggle('is-off', p.stock === false); });
      $$('.otc__out', otc).forEach((o) => { o.hidden = p.stock !== false; });
      const img = $('.otc__img img', otc); if (img) { img.src = '../../assets/' + p.img.card; img.alt = p.name; }
      $$('[data-otc-name]', otc).forEach((n) => { n.textContent = p.name; });
      $$('[data-otc-dose]', otc).forEach((n) => { n.textContent = L(p.dose) + ' · ' + act(p).join(', '); });
    };
    otc.addEventListener('click', (e) => { const c = e.target.closest('.otc__chip'); if (c) pick(c.dataset.id); });
    pick('ascend');
  }

  
  const tl = $$('.tl__row');
  if (tl.length && 'IntersectionObserver' in window) {
    const box = $('.tl__box'); const own = box && box.scrollHeight > box.clientHeight + 4;
    const io = new IntersectionObserver((es) => es.forEach((en) => en.target.classList.toggle('is-in', en.isIntersecting)), own ? { root: box, rootMargin: '0px 0px -55% 0px' } : { rootMargin: '-35% 0px -45% 0px' });
    tl.forEach((r) => io.observe(r));
  }

  
  const CALM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!CALM && 'IntersectionObserver' in window) {
    const RV = '.new__k,.new__h,.new__sub,.new__box,.new__link,.seven__h,.vid,.vid__cap,.ing__h,.ing__mono,.ing__h2,.ing__p,.ing .rx,.pi .rx,.ing__end,.cmp__h,.cmp__p,.tbl,.cmp__in > .btn,'
      + '.lock__h,.lock__p,.lock__btn,.gauge,.g365__h,.g365__p,.g365__cap,.g365__br,.g365__card,.g365__fn,.ping__h,.ping__mono,.pi__h,.pi__p';
    document.documentElement.classList.add('rv-js');
    const els = $$(RV).filter((el) => { if (el.closest('.hero')) return false; const r = el.getBoundingClientRect(); return !(r.top < innerHeight * .9 && r.bottom > 0); });
    els.forEach((el) => el.classList.add('rv'));
    const io = new IntersectionObserver((es) => { let k = 0; es.forEach((e) => { if (!e.isIntersecting) return; io.unobserve(e.target); const t = e.target;
      t.style.transitionDelay = (k++ * .08) + 's'; t.classList.add('is-in'); setTimeout(() => { t.style.transitionDelay = ''; }, 1400); }); }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));

    const cl = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
    const M = (r, vh) => { const q = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2); return q < -1 ? -1 : q > 1 ? 1 : q; };
    const f = (n) => n.toFixed(2);
    const items = [];
    const D = (sel, ty, rot) => $$(sel).forEach((e) => items.push(() => { const m = M(e.parentNode.getBoundingClientRect(), innerHeight); e.style.translate = '0 ' + f(m * ty) + 'px'; if (rot) e.style.rotate = f(m * rot) + 'deg'; }));
    D('.hero__img', -22, -3); D('.new__img', -36, 4);
    $$('.ring__arcs').forEach((e) => items.push(() => { e.style.rotate = f(M(e.getBoundingClientRect(), innerHeight) * -30) + 'deg'; }));
    $$('.lock__base').forEach((e) => items.push(() => { const m = M(e.parentNode.getBoundingClientRect(), innerHeight); e.style.translate = '0 ' + f(Math.max(0, m) * 110) + 'px'; }));
    $$('.new__list').forEach((box) => $$('.new__line', box).forEach((el, i) => items.push(() => { const b = box.getBoundingClientRect(); const t = cl((innerHeight * .95 - b.top) / (innerHeight * .45) * 1.3 - i * .12); el.style.clipPath = 'inset(0 ' + f((1 - t) * 100) + '% 0 0)'; })));
    let ticking = false;
    const draw = () => { ticking = false; items.forEach((fn) => fn()); };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }, { passive: true });
    addEventListener('resize', draw); draw();

    $$('.gauge__fg, .ring24__b').forEach((b) => { b.style.transition = 'none'; b.style.strokeDashoffset = b.classList.contains('gauge__fg') ? (parseFloat(b.style.strokeDasharray) || 100) : 100; });
    const rio = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; rio.unobserve(e.target);
      $$('.gauge__fg, .ring24__b', e.target).forEach((b) => requestAnimationFrame(() => { b.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.25,.8,.25,1) .15s'; b.style.strokeDashoffset = '0'; })); }), { threshold: .5 });
    $$('.gauge__ring, .ring24').forEach((r) => rio.observe(r));
  }

  $$('[data-slider]').forEach(slider);

  
  const loops = $$('video.loop');
  if (loops.length && !CALM && 'IntersectionObserver' in window) {
    const vis = new Map();
    const active = (v) => { const sl = v.closest('[data-slide]'); if (!sl) return true; const tr = sl.parentElement; const all = $$('[data-slide]', tr); const root = tr.closest('[data-slider]'); const on = root && $('[data-dots] > button.is-on', root); const idx = on ? $$('[data-dots] > button', root).indexOf(on) : 0; return all.indexOf(sl) === idx; };
    const sync = () => loops.forEach((v) => { const play = vis.get(v) && active(v); if (play) { if (v.preload === 'none') v.preload = 'auto'; if (v.paused) v.play().catch(() => {}); } else if (!v.paused) v.pause(); });
    const lio = new IntersectionObserver((es) => { es.forEach((e) => vis.set(e.target, e.isIntersecting)); sync(); }, { threshold: .25 });
    loops.forEach((v) => lio.observe(v));
    $$('[data-slider]').forEach((r) => r.addEventListener('v4:slide', () => setTimeout(sync, 320)));
  }
})();
