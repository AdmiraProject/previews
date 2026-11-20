/* Serna activation flow: qualifying multi-step form → redirect to gracias/ (thank-you) with WhatsApp handoff.
   Mounted on <div id="sf-flow" data-lang="es|en" data-next="../gracias/">. Pure static; lead kept in localStorage
   (key sf-lead) and handed to the advisor via WhatsApp prefill. To connect a CRM, set window.SF_WEBHOOK = 'https://…'. */
(() => {
  const root = document.getElementById('sf-flow'); if (!root) return;
  const L = root.dataset.lang === 'en' ? 'en' : 'es';
  const NEXT = root.dataset.next || '../gracias/';
  const TEL = '+528717178585', TELH = '871 717 8585';
  const t = (es, en) => (L === 'en' ? en : es);
  const qs = new URLSearchParams(location.search);
  const icon = n => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${n}"/></svg>`;

  const S = {
    need: { q: t('¿En qué podemos ayudarte?', 'How can we help you?'), sub: t('Elige una opción. Toma menos de un minuto.', 'Choose one option. It takes less than a minute.'), key: 'need',
      opts: [
        { v: 'prevision', i: 'plan', l: t('Quiero planear a futuro', 'I want to plan ahead'), d: t('Precio congelado, hasta 36 meses sin intereses', 'Price locked in, up to 36 months interest-free') },
        { v: 'inmediato', i: 'phone', l: t('Alguien acaba de fallecer', 'Someone has just passed away'), d: t('Te atendemos ahora mismo, 24 h', 'We can help right now, 24 h') },
        { v: 'nichos', i: 'niche', l: t('Busco un nicho para cenizas', 'I’m looking for a cremation niche'), d: t('Un lugar digno para visitarlos', 'A dignified place to visit them') },
        { v: 'convenio', i: 'building', l: t('Convenio para mi empresa', 'A partnership for my company'), d: t('Empresas, sindicatos y gobierno', 'Companies, unions and government') },
      ] },
    who: { q: t('¿Para quién sería el plan?', 'Who would the plan be for?'), key: 'who',
      opts: [
        { v: 'yo', i: 'user', l: t('Para mí', 'For me') },
        { v: 'pareja', i: 'users', l: t('Para mi pareja y yo', 'For my partner and me') },
        { v: 'papas', i: 'heart', l: t('Para mis papás', 'For my parents') },
        { v: 'familiar', i: 'family', l: t('Para otro familiar', 'For another relative') },
      ] },
    type: { q: t('¿Qué tipo de servicio prefieres?', 'Which type of service do you prefer?'), sub: t('Puedes cambiarlo después con tu asesor.', 'You can change it later with your advisor.'), key: 'type',
      opts: [
        { v: 'inhumacion', i: 'cross', l: t('Inhumación', 'Burial'), d: t('Velación, carroza y oratorio', 'Viewing, hearse and chapel') },
        { v: 'cremacion', i: 'urn', l: t('Cremación', 'Cremation'), d: t('Incluye urna en previsión', 'Urn included when pre-planned') },
        { v: 'nose', i: 'help', l: t('Aún no lo sé', 'I’m not sure yet'), d: t('Te explicamos las dos opciones', 'We’ll explain both options') },
      ] },
    niches: { q: t('¿Cuántos nichos te interesan?', 'How many niches are you interested in?'), key: 'qty',
      opts: [ { v: '1', i: 'niche', l: t('1 nicho', '1 niche') }, { v: '2', i: 'niche', l: t('2 nichos', '2 niches') }, { v: '3+', i: 'family', l: t('3 o más', '3 or more') } ] },
    staff: { q: t('¿Cuántas personas trabajan en tu organización?', 'How many people work at your organisation?'), key: 'staff',
      opts: [ { v: '1-50', i: 'user', l: '1 – 50' }, { v: '51-200', i: 'users', l: '51 – 200' }, { v: '200+', i: 'building', l: t('Más de 200', 'More than 200') } ] },
    when: { q: t('¿Cuándo te gustaría dejarlo listo?', 'When would you like to have it ready?'), sub: t('Así sabemos cómo ayudarte mejor.', 'This helps us support you better.'), key: 'when',
      opts: [
        { v: 'este-mes', i: 'bolt', l: t('Este mes', 'This month') },
        { v: '1-3', i: 'calendar', l: t('En 1 a 3 meses', 'In 1 to 3 months') },
        { v: 'explorando', i: 'search', l: t('Solo estoy explorando', 'I’m just exploring') },
      ] },
    branch: { q: t('¿Qué sucursal te queda mejor?', 'Which location suits you best?'), key: 'branch',
      opts: [
        { v: 'juarez', i: 'pin', l: t('Torreón · Av. Juárez', 'Torreón · Av. Juárez') },
        { v: 'matamoros', i: 'pin', l: t('Torreón · Av. Matamoros', 'Torreón · Av. Matamoros') },
        { v: 'gomez', i: 'pin', l: 'Gómez Palacio' },
        { v: 'cualquiera', i: 'check', l: t('Me da igual', 'Any is fine') },
      ] },
    contact: { q: t('¿A dónde te mandamos tus opciones?', 'Where should we send your options?'), sub: t('Un asesor de la familia Serna te escribe por WhatsApp. Sin llamadas insistentes.', 'An advisor from the Serna family will message you on WhatsApp. No pushy calls.'), key: 'contact' },
  };
  const ROUTES = {
    prevision: ['need', 'who', 'type', 'when', 'branch', 'contact'],
    nichos: ['need', 'niches', 'when', 'branch', 'contact'],
    convenio: ['need', 'staff', 'branch', 'contact'],
    inmediato: ['need', 'urgent'],
  };
  const st = { a: {}, i: 0, route: ROUTES.prevision };
  const pre = qs.get('need'); if (pre && ROUTES[pre]) { st.a.need = pre; st.route = ROUTES[pre]; st.i = 1; }

  const scope = root.closest('.fl-wrap') || document, bar = scope.querySelector('.fl-bar i'), stepTxt = scope.querySelector('.fl-count'), card = root.querySelector('.fl-card'), back = scope.querySelector('.fl-back');

  function progress() {
    const n = st.route.length, k = Math.min(st.i + 1, n);
    bar.style.width = (k / n * 100) + '%';
    stepTxt.textContent = t(`Paso ${k} de ${n}`, `Step ${k} of ${n}`);
    back.hidden = st.i === 0;
  }
  function render(dir = 1) {
    progress();
    const id = st.route[st.i];
    let html = '';
    if (id === 'urgent') html = urgent();
    else if (id === 'contact') html = contact();
    else {
      const s = S[id];
      html = `<h1 class="fl-q">${s.q}</h1>${s.sub ? `<p class="fl-sub">${s.sub}</p>` : ''}<div class="fl-opts ${s.opts.length > 3 ? 'g2' : 'g1'}" role="radiogroup">` +
        s.opts.map(o => `<button type="button" role="radio" aria-checked="${st.a[s.key] === o.v}" class="fl-opt${st.a[s.key] === o.v ? ' on' : ''}" data-k="${s.key}" data-v="${o.v}">
          <span class="fl-oi">${icon(o.i)}</span><span class="fl-ot"><b>${o.l}</b>${o.d ? `<small>${o.d}</small>` : ''}</span><span class="fl-radio"></span></button>`).join('') + '</div>';
    }
    card.classList.remove('in'); card.style.setProperty('--dir', dir);
    card.innerHTML = html; void card.offsetWidth; card.classList.add('in');
    const f = card.querySelector('input,button'); if (f && st.i) f.focus({ preventScroll: true });
    card.querySelectorAll('.fl-opt').forEach(b => b.addEventListener('click', () => pick(b.dataset.k, b.dataset.v)));
    const form = card.querySelector('form'); if (form) form.addEventListener('submit', submit);
  }
  function pick(k, v) {
    st.a[k] = v;
    if (k === 'need') st.route = ROUTES[v];
    card.querySelectorAll('.fl-opt').forEach(b => { const on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    setTimeout(() => { st.i++; render(1); }, 260);
  }
  back.addEventListener('click', () => { if (st.i > 0) { st.i--; render(-1); } });

  function urgent() {
    return `<div class="fl-urgent"><span class="fl-pulse"></span><h1 class="fl-q">${t('Lo sentimos mucho. Estamos contigo ahora.', 'We are so sorry. We are with you now.')}</h1>
      <p class="fl-sub">${t('En estos momentos lo más rápido es una llamada. Te contesta una persona de nuestro equipo, a cualquier hora, y te dice exactamente qué hacer.', 'Right now the quickest way is a phone call. A real person from our team answers at any hour and tells you exactly what to do.')}</p>
      <a class="fl-btn fl-btn-xl" href="tel:${TEL}" data-ev="call-urgent">${icon('phone')} ${t('Llamar al', 'Call')} ${TELH}</a>
      <a class="fl-link" href="https://wa.me/5218715732093?text=${encodeURIComponent(t('Hola, necesito ayuda con un servicio funerario de uso inmediato.', 'Hello, I need help with an immediate-need funeral service.'))}" target="_blank" rel="noopener">${icon('wa')} ${t('Prefiero escribir por WhatsApp', 'I’d rather message on WhatsApp')}</a>
      <ul class="fl-reassure"><li>${icon('check')} ${t('Pasamos por tu ser querido', 'We bring your loved one into our care')}</li><li>${icon('check')} ${t('Nos encargamos de los trámites', 'We handle every formality')}</li><li>${icon('check')} ${t('3 sucursales en Torreón y Gómez Palacio', '3 locations in Torreón and Gómez Palacio')}</li></ul></div>`;
  }
  function contact() {
    const s = S.contact, v = st.a;
    return `<h1 class="fl-q">${s.q}</h1><p class="fl-sub">${s.sub}</p>
      <form class="fl-form" novalidate>
        <label class="fl-field"><span>${t('Nombre completo', 'Full name')}</span><input name="name" autocomplete="name" required value="${v.name || ''}" placeholder="${t('Ej. María López', 'e.g. María López')}"></label>
        <label class="fl-field"><span>WhatsApp</span><div class="fl-tel"><em>+52</em><input name="phone" inputmode="tel" autocomplete="tel-national" required maxlength="14" value="${v.phone || ''}" placeholder="871 000 0000"></div></label>
        ${v.need === 'convenio' ? `<label class="fl-field"><span>${t('Empresa u organización', 'Company or organisation')}</span><input name="org" autocomplete="organization" required value="${v.org || ''}"></label>` : ''}
        <label class="fl-field"><span>${t('Correo (opcional)', 'Email (optional)')}</span><input name="email" type="email" autocomplete="email" value="${v.email || ''}" placeholder="tu@correo.com"></label>
        <label class="fl-check"><input type="checkbox" name="ok" required checked><span>${t('Acepto el <a href="https://sernafunerales.com/politica-de-privacidad/" target="_blank" rel="noopener">aviso de privacidad</a> y que me contacten por WhatsApp.', 'I accept the <a href="https://sernafunerales.com/politica-de-privacidad/" target="_blank" rel="noopener">privacy notice</a> and agree to be contacted on WhatsApp.')}</span></label>
        <p class="fl-err" role="alert" hidden></p>
        <button class="fl-btn fl-btn-xl" type="submit">${t('Ver mis opciones', 'See my options')} ${icon('arrow')}</button>
        <p class="fl-lock">${icon('lock')} ${t('Tus datos están seguros. Nunca los compartimos.', 'Your details are safe. We never share them.')}</p>
      </form>`;
  }
  function score(a) { // lead temperature for the sales team (client asked to filter "curiosos")
    let s = 0; if (a.when === 'este-mes') s += 3; else if (a.when === '1-3') s += 2;
    if (a.need === 'convenio') s += a.staff === '200+' ? 3 : 2; if (a.need === 'nichos') s += 1; if (a.type && a.type !== 'nose') s += 1; if (a.email) s += 1;
    return s >= 4 ? 'caliente' : s >= 2 ? 'tibio' : 'frio';
  }
  function submit(e) {
    e.preventDefault();
    const f = e.target, d = Object.fromEntries(new FormData(f)), err = f.querySelector('.fl-err');
    const ph = (d.phone || '').replace(/\D/g, '');
    const bad = !d.name || d.name.trim().length < 3 ? t('Escribe tu nombre completo.', 'Please enter your full name.')
      : ph.length !== 10 ? t('Escribe un WhatsApp de 10 dígitos.', 'Please enter a 10-digit WhatsApp number.')
      : f.org && !d.org ? t('Escribe el nombre de tu empresa.', 'Please enter your company name.')
      : !f.ok.checked ? t('Necesitamos tu autorización para contactarte.', 'We need your permission to contact you.') : '';
    if (bad) { err.textContent = bad; err.hidden = false; return; }
    Object.assign(st.a, { name: d.name.trim(), phone: ph, email: d.email || '', org: d.org || '' });
    const lead = { ...st.a, lang: L, temp: score(st.a), ts: new Date().toISOString(), src: location.pathname, utm: Object.fromEntries([...qs].filter(([k]) => k.startsWith('utm_'))) };
    try { localStorage.setItem('sf-lead', JSON.stringify(lead)); } catch {}
    if (window.SF_WEBHOOK) { try { navigator.sendBeacon(window.SF_WEBHOOK, JSON.stringify(lead)); } catch {} }
    const btn = f.querySelector('[type=submit]'); btn.disabled = true; btn.classList.add('busy');
    setTimeout(() => { location.href = NEXT + '?n=' + encodeURIComponent(lead.name.split(' ')[0]) + '&need=' + lead.need; }, 650);
  }
  render(1);
})();

/* Thank-you page: reads sf-lead, builds the WhatsApp handoff summary. */
(() => {
  const g = document.getElementById('sf-thanks'); if (!g) return;
  const L = g.dataset.lang === 'en' ? 'en' : 'es', t = (es, en) => (L === 'en' ? en : es);
  let a = {}; try { a = JSON.parse(localStorage.getItem('sf-lead') || '{}'); } catch {}
  const q = new URLSearchParams(location.search); const name = q.get('n') || (a.name || '').split(' ')[0] || '';
  g.querySelectorAll('[data-name]').forEach(el => el.textContent = name ? (L === 'en' ? `, ${name}` : `, ${name}`) : '');
  const M = {
    need: { prevision: t('Previsión', 'Pre-planning'), nichos: t('Nichos', 'Niches'), convenio: t('Convenio', 'Partnership'), inmediato: t('Uso inmediato', 'Immediate need') },
    who: { yo: t('Para mí', 'For me'), pareja: t('Para mi pareja y yo', 'For my partner and me'), papas: t('Para mis papás', 'For my parents'), familiar: t('Para otro familiar', 'For another relative') },
    type: { inhumacion: t('Inhumación', 'Burial'), cremacion: t('Cremación', 'Cremation'), nose: t('Aún no lo sé', 'Not sure yet') },
    when: { 'este-mes': t('Este mes', 'This month'), '1-3': t('En 1 a 3 meses', 'In 1–3 months'), explorando: t('Explorando', 'Exploring') },
    branch: { juarez: 'Torreón · Av. Juárez', matamoros: 'Torreón · Av. Matamoros', gomez: 'Gómez Palacio', cualquiera: t('Cualquiera', 'Any') },
  };
  const rows = [[t('Necesito', 'I need'), M.need[a.need]], [t('Para', 'For'), M.who[a.who]], [t('Servicio', 'Service'), M.type[a.type]], [t('Nichos', 'Niches'), a.qty], [t('Personas', 'Staff'), a.staff], [t('Empresa', 'Company'), a.org], [t('Cuándo', 'When'), M.when[a.when]], [t('Sucursal', 'Location'), M.branch[a.branch]]].filter(r => r[1]);
  const box = g.querySelector('.th-sum'); if (box && rows.length) box.innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  const msg = t('Hola, soy ', 'Hello, I’m ') + (a.name || '') + t('. Acabo de llenar el formulario en su página web. ', '. I just filled in the form on your website. ') + rows.map(([k, v]) => `${k}: ${v}`).join(' · ');
  g.querySelectorAll('[data-wa]').forEach(el => el.href = 'https://wa.me/5218715732093?text=' + encodeURIComponent(msg));
})();
