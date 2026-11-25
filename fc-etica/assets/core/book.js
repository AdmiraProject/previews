
(function () {
  const C = Object.assign({ url: '', wa: '525548840688' }, window.FC_BOOK || {});
  const T = {
    eyebrow: 'Asesoría confidencial', title: 'Déjanos tus datos y agenda', sub: 'Tres datos y eliges tu horario. 100% confidencial.',
    name: 'Nombre completo', email: 'Correo de trabajo', phone: 'Teléfono', submit: 'Elegir horario', back: 'Regresar', title2: 'Elige el horario que te acomode',
    legal: 'Solo usamos tus datos para agendar tu asesoría.', errName: 'Escribe tu nombre', errEmail: 'Revisa tu correo', errPhone: 'Usa al menos 10 dígitos', close: 'Cerrar', nocal: 'Calendario en configuración. Te contactamos para agendar.',
    alt: '¿Prefieres WhatsApp?', alt2: 'Escríbenos directo',
    title3: 'Tu asesoría está agendada', title3b: 'Escríbenos por WhatsApp', sub3: 'Envíanos un mensaje y llega a tu asesoría con tu caso ya en contexto. Todo es confidencial.',
    wa: 'Abrir WhatsApp', done: 'Listo, cerrar'
  };
  const el = document.createElement('div');
  el.id = 'book'; el.className = 'bk'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-hidden', 'true'); el.dataset.step = '1';
  el.innerHTML = `<div class="bk__scrim" data-bk-close></div>
  <div class="bk__panel" role="document">
    <button class="bk__close" type="button" data-bk-close aria-label="${T.close}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    <div class="bk__progress" aria-hidden="true"><i></i><i></i><i></i></div>
    <section class="bk__step bk__step--form">
      <p class="bk__eyebrow">${T.eyebrow}</p><h2 class="bk__title">${T.title}</h2><p class="bk__sub">${T.sub}</p>
      <form class="bk__form" novalidate>
        <label class="bk__field"><span>${T.name}</span><input name="name" autocomplete="name" required></label>
        <label class="bk__field"><span>${T.email}</span><input name="email" type="email" autocomplete="email" required></label>
        <label class="bk__field"><span>${T.phone}</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" required></label>
        <p class="bk__err" aria-live="polite"></p>
        <button class="bk__submit" type="submit"><span>${T.submit}</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
        <p class="bk__legal">${T.legal}</p>
      </form>
    </section>
    <section class="bk__step bk__step--cal">
      <button class="bk__back" type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>${T.back}</button>
      <h2 class="bk__title">${T.title2}</h2><div class="bk__cal"></div>
      <p class="bk__alt">${T.alt} <button type="button" data-bk-wa>${T.alt2}</button></p>
    </section>
    <section class="bk__step bk__step--wa">
      <span class="bk__ok" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>
      <h2 class="bk__title"></h2><p class="bk__sub">${T.sub3}</p>
      <a class="bk__wa" target="_blank" rel="noopener"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/></svg><span>${T.wa}</span></a>
      <button class="bk__done" type="button" data-bk-close>${T.done}</button>
    </section>
  </div>`;
  const mount = () => document.body.appendChild(el);
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', mount) : mount();

  let src = 'site', last = null, who = { name: '', email: '', phone: '' };
  const toWa = (booked) => {
    el.querySelector('.bk__step--wa .bk__title').textContent = booked ? T.title3 : T.title3b;
    el.querySelector('.bk__ok').hidden = !booked;
    const msg = booked
      ? `Hola, soy ${who.name}. Acabo de agendar una asesoría con F&C. Mi correo es ${who.email} y mi teléfono ${who.phone}. Les comparto brevemente mi caso: `
      : `Hola, soy ${who.name}. Me interesa una asesoría con F&C. Mi correo es ${who.email} y mi teléfono ${who.phone}. Les comparto brevemente mi caso: `;
    el.querySelector('.bk__wa').href = `https://wa.me/${C.wa}?text=${encodeURIComponent(msg)}`;
    el.dataset.step = '3';
  };
  window.addEventListener('message', (e) => {
    if (typeof e.origin === 'string' && /calendly\.com$/.test(new URL(e.origin).hostname) && e.data && e.data.event === 'calendly.event_scheduled' && el.classList.contains('is-open')) toWa(true);
  });
  const f = el.querySelector('form'), err = el.querySelector('.bk__err'), cal = el.querySelector('.bk__cal');
  const open = (s) => { src = s || 'site'; last = document.activeElement; el.dataset.step = '1'; el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('bk-lock'); setTimeout(() => f.name.focus(), 60); };
  const close = () => { el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('bk-lock'); last && last.focus && last.focus(); };
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-book],a[href="#agendar"]');
    if (t) { e.preventDefault(); open(t.dataset.bookSrc); return; }
    if (e.target.closest('[data-bk-wa]')) { toWa(false); return; }
    if (e.target.closest('[data-bk-close]')) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && el.classList.contains('is-open')) close(); });
  el.querySelector('.bk__back').addEventListener('click', () => { el.dataset.step = '1'; });
  el.addEventListener('click', (e) => { if (e.target.closest('.bk__wa')) setTimeout(close, 400); });

  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = f.name.value.trim(), email = f.email.value.trim(), phone = f.phone.value.replace(/[^\d+]/g, '');
    const bad = !name ? [f.name, T.errName] : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? [f.email, T.errEmail] : phone.replace(/\D/g, '').length < 10 ? [f.phone, T.errPhone] : null;
    f.querySelectorAll('.is-bad').forEach((n) => n.classList.remove('is-bad'));
    if (bad) { bad[0].closest('.bk__field').classList.add('is-bad'); err.textContent = bad[1]; bad[0].focus(); return; }
    err.textContent = '';
    who = { name, email, phone };
    el.dataset.step = '2';
    if (!C.url) { cal.innerHTML = `<p class="bk__nocal">${T.nocal}</p>`; return; }
    const u = new URL(C.url);
    u.searchParams.set('name', name); u.searchParams.set('email', email); u.searchParams.set('a1', phone);
    u.searchParams.set('hide_gdpr_banner', '1'); u.searchParams.set('utm_source', 'web'); u.searchParams.set('utm_content', src);
    u.searchParams.set('embed_domain', location.hostname || 'localhost'); u.searchParams.set('embed_type', 'Inline');
    cal.innerHTML = `<iframe title="Calendly" src="${u}" loading="lazy" allow="payment"></iframe>`;
  });
  window.FCBook = { open, close };
})();
