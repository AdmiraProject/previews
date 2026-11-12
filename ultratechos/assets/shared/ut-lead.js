/* Ultra Techos — shared quote pop-up (Figma "FORM" 2-step). Loaded by v2–v6.
   Takes over every quote CTA in capture phase so each version's old lead modal never opens.
   Prototype only: nothing is sent anywhere; the lead is kept in localStorage('ut-lead'). */
(() => {
  if (window.__utLead) return; window.__utLead = true;

  // fonts the Figma form uses (no-op if the page already loads them)
  if (!document.querySelector('link[href*="Hanken+Grotesk"][href*="Inter"]')) {
    const f = document.createElement('link'); f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@700;800&family=Inter:wght@400;700&display=swap';
    document.head.appendChild(f);
  }

  const X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const root = document.createElement('div');
  root.className = 'utl'; root.hidden = true;
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Cotizá tu techo');
  root.innerHTML = `
  <div class="utl__scrim" data-utl-close></div>
  <div class="utl__wrap">
    <button class="utl__x" type="button" data-utl-close aria-label="Cerrar">${X}</button>
    <form class="utl__card" novalidate>
      <div class="utl__steps" aria-hidden="true"><span class="utl__dot is-on">1</span><span class="utl__line"></span><span class="utl__dot">2</span></div>

      <div class="utl__step is-on" data-s="1">
        <div class="utl__grid">
          <label class="utl__f"><span class="utl__lab">Nombre completo *</span><input type="text" name="nombre" placeholder="Ej: Juan Pérez" autocomplete="name" required></label>
          <label class="utl__f"><span class="utl__lab">WhatsApp / Teléfono *</span><input type="tel" name="telefono" placeholder="+506 0000-0000" autocomplete="tel" inputmode="tel" required></label>
          <label class="utl__f"><span class="utl__lab">Ubicación del proyecto *</span><input type="text" name="ubicacion" placeholder="Ej: San José, Santa Ana" required></label>
          <label class="utl__f"><span class="utl__lab">Área aproximada (m2)</span><input type="text" name="area" placeholder="Ej: 150" inputmode="numeric"></label>
        </div>
        <div class="utl__f utl__mt"><p class="utl__lab">Tipo de Proyecto *</p>
          <fieldset class="utl__radios"><label><input type="radio" name="tipo" value="Residencial" checked> Residencial</label><label><input type="radio" name="tipo" value="Comercial / Industrial"> Comercial / Industrial</label></fieldset>
        </div>
        <div class="utl__act">
          <button class="utl__btn utl__btn--go" type="button" data-utl-next>Continuar</button>
          <p class="utl__legal">Al enviar este formulario acepta nuestra política de privacidad.</p>
        </div>
      </div>

      <div class="utl__step utl__s2" data-s="2">
        <div class="utl__f"><p class="utl__lab">¿Requiere servicio de instalación?</p>
          <fieldset class="utl__radios"><label><input type="radio" name="instalacion" value="Sí"> Sí</label><label><input type="radio" name="instalacion" value="No, solo material" checked> No, solo material</label></fieldset>
        </div>
        <label class="utl__f"><span class="utl__lab">Información adicional / Dudas</span><textarea name="mensaje" placeholder="Cuéntenos más sobre su proyecto..."></textarea></label>
        <input type="hidden" name="interes"><input type="hidden" name="origen">
        <div class="utl__act">
          <div class="utl__btns"><button class="utl__btn utl__btn--back" type="button" data-utl-back>Atrás</button><button class="utl__btn utl__btn--go" type="submit">Solicitar Cotización Técnica</button></div>
          <p class="utl__legal">Al enviar este formulario acepta nuestra política de privacidad.</p>
        </div>
      </div>

      <div class="utl__ok" role="status">
        <span class="utl__check"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
        <h3>¡Recibimos su solicitud!</h3>
        <p>Un asesor técnico de Ultra Techos le responderá en menos de 24 horas hábiles con la propuesta para su proyecto.</p>
        <div class="utl__btns"><a class="utl__btn utl__btn--back" href="https://wa.me/50670121636" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;text-decoration:none">Escribir por WhatsApp</a><button class="utl__btn utl__btn--go" type="button" data-utl-close>Listo</button></div>
      </div>
    </form>
  </div>`;
  const mount = () => document.body.appendChild(root);
  document.body ? mount() : document.addEventListener('DOMContentLoaded', mount);

  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const form = $('form'), dots = $$('.utl__dot');
  let last = null;

  const go = (n, back) => {
    $$('.utl__step').forEach(s => { const on = s.dataset.s === String(n); s.classList.toggle('is-on', on); s.classList.toggle('is-back', on && !!back); });
    dots.forEach((d, i) => d.classList.toggle('is-on', i === n - 1));
    form.scrollTop = 0;
    setTimeout(() => $(`[data-s="${n}"] input:not([type=radio]):not([type=hidden]), [data-s="${n}"] textarea`)?.focus({ preventScroll: true }), 80);
  };

  const COMMERCIAL = /industri|comerc|bodega|nave|hotel|plaza|supermerc|cancha|empresa|distribu|taller|b2b|proyecto industrial/i;
  function open(ctx = {}) {
    last = document.activeElement;
    form.reset(); root.classList.remove('is-done'); $$('.is-err').forEach(e => e.classList.remove('is-err')); go(1);
    const hint = [ctx.tipo, ctx.label].filter(Boolean).join(' ');
    if (COMMERCIAL.test(hint)) form.tipo.value = 'Comercial / Industrial';
    form.interes.value = ctx.sistema || ctx.label || '';
    form.origen.value = location.pathname;
    root.hidden = false; document.documentElement.classList.add('utl-lock');
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-open')));
  }
  function close() {
    root.classList.remove('is-open'); document.documentElement.classList.remove('utl-lock');
    setTimeout(() => { root.hidden = true; }, 320);
    last && last.focus && last.focus({ preventScroll: true });
  }
  window.utLead = { open, close };

  // validation
  const check = scope => {
    let ok = true;
    $$(`[data-s="${scope}"] [required]`).forEach(i => {
      const bad = !i.value.trim(); i.classList.toggle('is-err', bad);
      if (bad && ok) { i.focus(); ok = false; }
    });
    return ok;
  };
  root.addEventListener('input', e => e.target.classList?.remove('is-err'));
  root.addEventListener('click', e => {
    if (e.target.closest('[data-utl-close]')) { e.preventDefault(); close(); }
    else if (e.target.closest('[data-utl-next]')) { if (check(1)) go(2); }
    else if (e.target.closest('[data-utl-back]')) go(1, true);
  });
  form.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && $('[data-s="1"]').classList.contains('is-on')) { e.preventDefault(); if (check(1)) go(2); }
  });
  form.addEventListener('submit', e => {
    e.preventDefault(); // prototype: nothing is sent
    try { localStorage.setItem('ut-lead', JSON.stringify({ ...Object.fromEntries(new FormData(form)), t: Date.now() })); } catch (_) {}
    root.classList.add('is-done');
  });
  addEventListener('keydown', e => {
    if (root.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { // keep focus inside the pop-up
      const f = [...root.querySelectorAll('button,a[href],input:not([type=hidden]),textarea')].filter(el => el.offsetParent !== null);
      if (!f.length) return; const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  // every quote CTA on every version → this pop-up (capture phase beats each page's own handlers)
  const CTA = '[data-lead],[data-ut-lead],[data-open="quote"],a[href="#cotizar"],a[href="#quote"],a[href="#asesoria"]';
  const QUOTE_TXT = /cotiz|asesor|agend|solicit|presupuesto|propuesta|contacten/i;
  addEventListener('click', e => {
    const t = e.target.closest && e.target.closest(CTA);
    if (!t || root.contains(t)) return;
    const href = t.getAttribute('href') || '';
    // plain section links (e.g. "Contacto" → #asesoria) keep scrolling unless they read like a quote CTA
    if (/^#(asesoria|cotizar|quote)$/.test(href) && !t.hasAttribute('data-lead') && !QUOTE_TXT.test(t.textContent)) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    open({ tipo: t.dataset.tipo, sistema: t.dataset.sistema, label: (t.dataset.lead && t.dataset.lead.length > 2 ? t.dataset.lead : '') || t.textContent.trim().slice(0, 60) });
  }, true);
})();
