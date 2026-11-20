/* Serna lead gate: every CTA (links to activar/, wa.me links, [data-lead]) opens a popup form
   (nombre, correo, teléfono) → on submit redirects to WhatsApp with the lead's data prefilled.
   Lead also kept in localStorage `sf-lead`; set window.SF_WEBHOOK = 'https://…' to beacon it to a CRM. */
(() => {
  const d = document, EN = (d.documentElement.lang || 'es').startsWith('en'), t = (es, en) => (EN ? en : es);
  const WA = '5218715732093';
  const NEED = {
    prevision: [t('Planea tu previsión', 'Plan ahead'), t('Déjanos tus datos y un asesor de la familia Serna te escribe por WhatsApp con opciones y precios congelados.', 'Leave your details and a Serna family advisor will message you on WhatsApp with options and locked-in prices.'), t('planear mi previsión', 'planning ahead (pre-need plan)')],
    nichos: [t('Información de nichos', 'Niche information'), t('Te mandamos por WhatsApp disponibilidad, ubicación y formas de pago.', 'We’ll send availability, location and payment options on WhatsApp.'), t('información de nichos', 'niche information')],
    convenio: [t('Convenios para empresas', 'Company partnerships'), t('Cuéntanos de tu empresa y te contactamos por WhatsApp.', 'Tell us about your company and we’ll reach you on WhatsApp.'), t('un convenio para mi empresa', 'a partnership for my company')],
    inmediato: [t('Estamos contigo ahora', 'We are with you now'), t('Déjanos tus datos y te atendemos de inmediato por WhatsApp. Si es urgente, llama al 871 717 8585.', 'Leave your details and we’ll help you right away on WhatsApp. If it’s urgent, call 871 717 8585.'), t('atención inmediata', 'immediate help')],
    sucursal: [t('Visítanos o pide informes', 'Visit us or ask for information'), t('Déjanos tus datos y te contactamos por WhatsApp desde esta sucursal.', 'Leave your details and this location will reach you on WhatsApp.'), t('información', 'information')],
    info: [t('Hablemos por WhatsApp', 'Let’s talk on WhatsApp'), t('Déjanos tus datos y un asesor de la familia Serna te escribe en minutos. Sin llamadas insistentes.', 'Leave your details and a Serna family advisor will message you shortly. No pushy calls.'), t('información', 'information')],
  };
  const BR = { juarez: 'Sucursal Juárez · Torreón', matamoros: 'Sucursal Matamoros · Torreón', gomez: 'Sucursal Gómez Palacio' };
  const ic = n => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const css = d.querySelector('link[href*="base.css"]'); const A = css ? css.getAttribute('href').replace(/css\/base\.css.*$/, '') : '';

  const formHTML = (inline) => `<form class="ld-form" novalidate>
      <label class="ld-f"><span>${t('Nombre', 'Name')}</span><input name="name" autocomplete="name" required placeholder="${t('Tu nombre y apellido', 'Your full name')}"></label>
      <label class="ld-f"><span>${t('Correo', 'Email')}</span><input name="email" type="email" autocomplete="email" required placeholder="${t('tu@correo.com', 'you@email.com')}"></label>
      <label class="ld-f"><span>${t('Teléfono (WhatsApp)', 'Phone (WhatsApp)')}</span><div class="ld-tel"><em>+52</em><input name="phone" inputmode="tel" autocomplete="tel-national" required maxlength="14" placeholder="871 000 0000"></div></label>
      <label class="ld-ok"><input type="checkbox" name="ok" checked required><span>${t('Acepto el <a href="https://sernafunerales.com/politica-de-privacidad/" target="_blank" rel="noopener">aviso de privacidad</a>.', 'I accept the <a href="https://sernafunerales.com/politica-de-privacidad/" target="_blank" rel="noopener">privacy notice</a>.')}</span></label>
      <p class="ld-err" role="alert" hidden></p>
      <button class="ld-btn" type="submit">${ic('wa')} ${t('Continuar en WhatsApp', 'Continue on WhatsApp')}</button>
      <p class="ld-lock">${ic('lock')} ${t('Tus datos están seguros. Nunca los compartimos.', 'Your details are safe. We never share them.')}</p>
    </form>`;

  const md = d.createElement('div'); md.className = 'ld'; md.setAttribute('role', 'dialog'); md.setAttribute('aria-modal', 'true'); md.setAttribute('aria-labelledby', 'ld-h');
  md.innerHTML = `<div class="ld-box"><button class="ld-x" type="button" aria-label="${t('Cerrar', 'Close')}">${ic('x')}</button>
    <div class="ld-side"><img src="${A}img/chapel.jpg" alt=""><div class="ld-side-in"><img class="ld-logo" src="${A}brand/logo-h-light.png" alt="Funerales J. Serna"><p>${t('Una familia lagunera atendiendo a familias laguneras desde 1935.', 'A La Laguna family caring for La Laguna families since 1935.')}</p>
      <ul><li>${ic('check')} ${t('Respuesta por WhatsApp', 'Reply on WhatsApp')}</li><li>${ic('check')} ${t('Sin llamadas insistentes', 'No pushy calls')}</li><li>${ic('check')} ${t('Atención 24 h · 871 717 8585', '24 h care · 871 717 8585')}</li></ul></div></div>
    <div class="ld-main"><p class="ld-eye"></p><h2 id="ld-h"></h2><p class="ld-sub"></p>${formHTML()}</div></div>`;
  d.body.appendChild(md);
  let ctx = { need: 'info', branch: '' };

  function open(need, branch) {
    ctx = { need: NEED[need] ? need : 'info', branch: branch || '' };
    const [h, s] = NEED[ctx.need];
    md.querySelector('#ld-h').textContent = h; md.querySelector('.ld-sub').textContent = s;
    md.querySelector('.ld-eye').textContent = ctx.branch ? BR[ctx.branch] || '' : t('Funerales J. Serna', 'J. Serna Funerals');
    md.querySelector('.ld-err').hidden = true;
    md.classList.add('on'); d.documentElement.classList.add('ld-lock-scroll');
    setTimeout(() => md.querySelector('input[name=name]').focus(), 250);
  }
  const close = () => { md.classList.remove('on'); d.documentElement.classList.remove('ld-lock-scroll'); };
  md.addEventListener('click', e => { if (e.target === md || e.target.closest('.ld-x')) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  window.SFlead = open;

  d.addEventListener('click', e => {
    const a = e.target.closest('a[href*="activar/"], a[href*="wa.me/"], [data-lead]');
    if (!a || a.closest('.ld') || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    let need = a.dataset.lead || 'info';
    try { const u = new URL(a.getAttribute('href') || '', location.href); need = u.searchParams.get('need') || need; } catch {}
    open(need, a.dataset.branch);
  });

  function submit(e) {
    e.preventDefault();
    const f = e.target, v = Object.fromEntries(new FormData(f)), err = f.querySelector('.ld-err');
    const ph = (v.phone || '').replace(/\D/g, ''), em = (v.email || '').trim();
    const bad = (v.name || '').trim().length < 3 ? t('Escribe tu nombre.', 'Please enter your name.')
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em) ? t('Escribe un correo válido.', 'Please enter a valid email.')
      : ph.length !== 10 ? t('Escribe un teléfono de 10 dígitos.', 'Please enter a 10-digit phone number.')
      : !f.ok.checked ? t('Necesitamos tu autorización para contactarte.', 'We need your permission to contact you.') : '';
    if (bad) { err.textContent = bad; err.hidden = false; return; }
    const need = (f.closest('[data-need]') || {}).dataset?.need || ctx.need, branch = (f.closest('[data-branch]') || {}).dataset?.branch || ctx.branch;
    const lead = { name: v.name.trim(), email: em, phone: ph, need, branch, lang: EN ? 'en' : 'es', ts: new Date().toISOString(), page: location.pathname,
      utm: Object.fromEntries([...new URLSearchParams(location.search)].filter(([k]) => k.startsWith('utm_'))) };
    try { localStorage.setItem('sf-lead', JSON.stringify(lead)); } catch {}
    if (window.SF_WEBHOOK) { try { navigator.sendBeacon(window.SF_WEBHOOK, JSON.stringify(lead)); } catch {} }
    const msg = t(`Hola, soy ${lead.name}. Me interesa ${NEED[need][2]}`, `Hello, I’m ${lead.name}. I’m interested in ${NEED[need][2]}`) + (branch ? ` (${BR[branch]})` : '') + '. ' +
      t(`Mi correo: ${em} · Mi teléfono: ${ph}`, `My email: ${em} · My phone: ${ph}`);
    const btn = f.querySelector('.ld-btn'); btn.classList.add('busy'); btn.innerHTML = `${ic('wa')} ${t('Abriendo WhatsApp…', 'Opening WhatsApp…')}`;
    setTimeout(() => { location.href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`; }, 350);
  }
  d.addEventListener('submit', e => { if (e.target.classList.contains('ld-form')) submit(e); });

  // Inline form on activar/ page
  const inl = d.getElementById('ld-inline'); if (inl) { const q = new URLSearchParams(location.search); const need = NEED[q.get('need')] ? q.get('need') : 'info'; inl.dataset.need = need; if (q.get('branch')) inl.dataset.branch = q.get('branch');
    inl.querySelector('.ld-h').textContent = NEED[need][0]; inl.querySelector('.ld-s').textContent = NEED[need][1]; inl.insertAdjacentHTML('beforeend', formHTML(true)); }
})();
