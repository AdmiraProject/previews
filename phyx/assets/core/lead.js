
(function () {
  const D = window.PHYX || {}; const C = D.contact || {};
  const SRC = (document.currentScript && document.currentScript.src) || '';
  const BASE = SRC ? SRC.replace(/core\/lead\.js.*$/, '') : '../../assets/';
  const KEY = 'px-lead';
  const T = {
    s1: 'Tus datos', s2: 'Agenda', s3: 'Confirma',
    h1: 'Agenda tu valoración', p1: 'Déjanos tus datos y elige el día y la hora que mejor te queden',
    name: 'Nombre completo', namePh: 'Ana López', email: 'Correo electrónico', emailPh: 'tu@correo.com', phone: 'Celular', phonePh: '55 1234 5678',
    centro: '¿Qué centro te queda mejor?', motivo: '¿Qué te gustaría atender?', choose: 'Elige una opción',
    errName: 'Escribe tu nombre y apellido', errEmail: 'Revisa tu correo', errPhone: 'Escribe un celular de 10 dígitos', errCentro: 'Elige un centro',
    next: 'Continuar', h2: 'Elige día y hora', p2: 'Valoración inicial · 60 min', back: 'Atrás', noSlots: 'Sin horarios este día', pick: 'Elige un horario', confirmSlot: 'Confirmar horario',
    h3: '¡Listo, ya casi!', p3: 'Confirma tu cita por WhatsApp y un especialista te responde en minutos', go: 'Confirmar por WhatsApp', going: 'Abriendo WhatsApp…',
    sumWho: 'Paciente', sumWhere: 'Centro', sumWhen: 'Fecha y hora', sumWhy: 'Motivo', edit: 'Cambiar',
    privacy: 'Usamos tus datos solo para agendar tu cita', privacyLink: 'Aviso de privacidad', close: 'Cerrar',
    wa: 'Hola PHYX 👋 Quiero agendar mi valoración.', waData: 'Mis datos',
    days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'], months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    calendlyNote: 'Agenda con nuestro calendario'
  };
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const centros = (D.centers || []).filter(c => c.open !== false);
  const motivos = D.motivos || ['Dolor de espalda o columna', 'Rehabilitación después de una cirugía', 'Lesión deportiva', 'Entrenamiento para adulto mayor', 'Recuperación y bienestar', 'Cámara hiperbárica', 'Otro'];
  const fmtPhone = v => { const d = v.replace(/\D/g, '').replace(/^52(?=\d{10})/, '').slice(0, 10); return d.length > 6 ? `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}` : d.length > 2 ? `${d.slice(0, 2)} ${d.slice(2)}` : d; };
  const valid = { name: v => v.trim().split(/\s+/).filter(w => w.length > 1).length >= 2, email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), phone: v => v.replace(/\D/g, '').replace(/^52(?=\d{10})/, '').length === 10, centro: v => !centros.length || !!v };
  const getLead = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null') || {}; } catch (e) { return {}; } };
  const saveLead = l => { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {} };
  const isWa = u => /^(https?:)?\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i.test(u || '') || /^whatsapp:/i.test(u || '');
  const nativeOpen = window.open.bind(window);
  const waNumber = () => String(C.whatsapp || '').replace(/\D/g, '');
  let state = { lead: {}, slot: null, waUrl: null, month: null, day: null };

  function ensure() {
    let m = $('#lf'); if (m) return m;
    m = document.createElement('div'); m.id = 'lf'; m.className = 'lf'; m.dataset.step = '1';
    m.innerHTML = `<div class="lf__scrim" data-lf-close></div>
      <div class="lf__card" role="dialog" aria-modal="true" aria-labelledby="lf-h">
        <header class="lf__top">${D.logo ? `<img class="lf__logo" src="${BASE + D.logo}" alt="PHYX" height="22">` : '<b>PHYX</b>'}
          <ol class="lf__steps" aria-label="Pasos"><li data-s="1"><span>1</span>${T.s1}</li><li data-s="2"><span>2</span>${T.s2}</li><li data-s="3"><span>3</span>${T.s3}</li></ol>
          <button type="button" class="lf__x" data-lf-close aria-label="${T.close}"><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="1.6"/></svg></button></header>
        <div class="lf__bar"><i></i></div>
        <section class="lf__pane" data-pane="1">
          <h2 class="lf__h" id="lf-h">${T.h1}</h2><p class="lf__p">${T.p1}</p>
          <form class="lf__form" novalidate>
            <div class="lf__field" data-f="name"><label for="lf-name">${T.name}</label><input id="lf-name" name="name" autocomplete="name" placeholder="${T.namePh}"><small>${T.errName}</small></div>
            <div class="lf__row">
              <div class="lf__field" data-f="email"><label for="lf-email">${T.email}</label><input id="lf-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="${T.emailPh}"><small>${T.errEmail}</small></div>
              <div class="lf__field" data-f="phone"><label for="lf-phone">${T.phone}</label><div class="lf__tel"><span>+52</span><input id="lf-phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="${T.phonePh}"></div><small>${T.errPhone}</small></div>
            </div>
            ${centros.length ? `<div class="lf__field" data-f="centro"><label>${T.centro}</label><div class="lf__chips" role="radiogroup">${centros.map(c => `<label class="lf__chip"><input type="radio" name="centro" value="${esc(c.id)}"><span>${esc(c.name)}</span></label>`).join('')}</div><small>${T.errCentro}</small></div>` : ''}
            <div class="lf__field" data-f="motivo"><label for="lf-motivo">${T.motivo}</label><select id="lf-motivo" name="motivo"><option value="">${T.choose}</option>${motivos.map(x => `<option>${esc(x)}</option>`).join('')}</select></div>
            <button type="submit" class="lf__go">${T.next}<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" fill="none"/></svg></button>
            <p class="lf__legal">${T.privacy} ${D.privacy ? `<a href="${D.privacy}" target="_blank" rel="noopener">${T.privacyLink}</a>` : ''}</p>
          </form>
        </section>
        <section class="lf__pane" data-pane="2">
          <button type="button" class="lf__back" data-lf-back="1"><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>${T.back}</button>
          <h2 class="lf__h">${T.h2}</h2><p class="lf__p lf__p--meta"><span data-lf-where></span> · ${T.p2}</p>
          <div class="lf__cal" data-lf-cal></div>
        </section>
        <section class="lf__pane" data-pane="3">
          <button type="button" class="lf__back" data-lf-back="2"><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>${T.back}</button>
          <div class="lf__ok"><svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="13" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 14.5l4 4 8-9" stroke="currentColor" stroke-width="1.8" fill="none"/></svg></div>
          <h2 class="lf__h">${T.h3}</h2><p class="lf__p">${T.p3}</p>
          <dl class="lf__sum" data-lf-sum></dl>
          <button type="button" class="lf__go lf__go--wa" data-lf-wa><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.8-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3z"/></svg><span>${T.go}</span></button>
        </section>
      </div>`;
    document.body.appendChild(m);
    const f = $('form', m), tel = $('#lf-phone', m);
    tel.addEventListener('input', () => { tel.value = fmtPhone(tel.value); });
    const check = k => { const el = k === 'centro' ? (f.querySelector('input[name=centro]:checked') || { value: '' }) : f.elements[k]; const ok = valid[k](el.value || ''); const fl = m.querySelector(`[data-f=${k}]`); if (fl) fl.classList.toggle('is-bad', !ok); return ok; };
    $$('input,select', f).forEach(i => i.addEventListener('change', () => { if (i.name && valid[i.name]) check(i.name); }));
    f.addEventListener('submit', e => {
      e.preventDefault();
      const bad = ['name', 'email', 'phone', 'centro'].filter(k => !check(k));
      if (bad.length) { const first = m.querySelector(`[data-f=${bad[0]}] input`); if (first) first.focus(); $('.lf__card', m).animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 260 }); return; }
      const cen = f.querySelector('input[name=centro]:checked');
      state.lead = { name: f.elements.name.value.trim().replace(/\s+/g, ' '), email: f.elements.email.value.trim(), phone: f.elements.phone.value.replace(/\D/g, '').slice(-10), centro: cen ? cen.value : '', motivo: f.elements.motivo.value, plan: state.lead.plan || '' };
      saveLead(state.lead); fire('datos'); go(2);
    });
    m.addEventListener('click', e => {
      if (e.target.closest('[data-lf-close]')) return close();
      const b = e.target.closest('[data-lf-back]'); if (b) return go(+b.dataset.lfBack);
      const d = e.target.closest('.lf__day:not([disabled])'); if (d) { state.day = d.dataset.d; state.slot = null; renderCal(); return; }
      const nav = e.target.closest('[data-lf-month]'); if (nav) { const [y, mo] = state.month; const n = new Date(y, mo + +nav.dataset.lfMonth, 1); state.month = [n.getFullYear(), n.getMonth()]; renderCal(); return; }
      const s = e.target.closest('.lf__slot'); if (s) { state.slot = { day: state.day, time: s.dataset.t }; $$('.lf__slot', m).forEach(x => x.classList.toggle('is-on', x === s)); const c = $('[data-lf-confirm]', m); if (c) c.disabled = false; return; }
      if (e.target.closest('[data-lf-confirm]') && state.slot) { fire('agenda'); return go(3); }
      if (e.target.closest('[data-lf-wa]')) return toWa();
    });
    m.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    window.addEventListener('message', e => { let host = ''; try { host = new URL(e.origin).hostname; } catch (er) {} if (/calendly\.com$/.test(host) && e.data && e.data.event === 'calendly.event_scheduled') { state.slot = { calendly: true }; fire('agenda'); go(3); } });
    return m;
  }
  function centroObj() { return centros.find(c => c.id === state.lead.centro) || null; }
  function go(step) {
    const m = ensure(); m.dataset.step = String(step);
    $$('.lf__steps li', m).forEach(li => { const s = +li.dataset.s; li.classList.toggle('is-on', s === step); li.classList.toggle('is-done', s < step); });
    $('.lf__bar i', m).style.width = (step / 3 * 100) + '%';
    if (step === 2) { const c = centroObj(); $('[data-lf-where]', m).textContent = c ? c.name : 'PHYX'; renderCal(); }
    if (step === 3) renderSum();
    const pane = $(`[data-pane="${step}"]`, m); setTimeout(() => { const f = pane.querySelector('input:not([type=radio]),.lf__go,button'); if (f) f.focus({ preventScroll: true }); }, 60);
  }
  
  function hoursFor(date) {
    const c = centroObj(); const h = (c && c.hours) || D.hours || { 1: ['07:00', '21:00'], 2: ['07:00', '21:00'], 3: ['07:00', '21:00'], 4: ['07:00', '21:00'], 5: ['07:00', '21:00'], 6: ['08:00', '14:00'] };
    return h[date.getDay()] || null;
  }
  function slotsFor(date) {
    const h = hoursFor(date); if (!h) return [];
    const [a, b] = h.map(t => +t.split(':')[0]); const out = []; const now = new Date();
    for (let x = a; x < b; x++) { const d = new Date(date); d.setHours(x, 0, 0, 0); if (d - now > 2 * 3600e3) out.push(`${String(x).padStart(2, '0')}:00`); }
    // deterministic "busy" slots so the grid looks real
    return out.filter((t, i) => ((date.getDate() * 7 + i * 3) % 5) !== 0);
  }
  function renderCal() {
    const m = ensure(), box = $('[data-lf-cal]', m);
    if (D.calendly) {
      const u = new URL(D.calendly); u.searchParams.set('name', state.lead.name || ''); u.searchParams.set('email', state.lead.email || ''); u.searchParams.set('hide_gdpr_banner', '1'); u.searchParams.set('embed_domain', location.hostname); u.searchParams.set('embed_type', 'Inline');
      if (!box.querySelector('iframe')) box.innerHTML = `<iframe class="lf__calendly" src="${u}" title="${T.calendlyNote}" loading="lazy"></iframe>`; return;
    }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (!state.month) state.month = [today.getFullYear(), today.getMonth()];
    if (!state.day) { const d = new Date(today); for (let i = 0; i < 30; i++) { if (slotsFor(d).length) { state.day = d.toDateString(); break; } d.setDate(d.getDate() + 1); } }
    const [y, mo] = state.month, first = new Date(y, mo, 1), lead = first.getDay(), len = new Date(y, mo + 1, 0).getDate();
    const maxD = new Date(today); maxD.setDate(maxD.getDate() + 45);
    let cells = ''; for (let i = 0; i < lead; i++) cells += '<span></span>';
    for (let d = 1; d <= len; d++) { const dt = new Date(y, mo, d); const ok = dt >= today && dt <= maxD && slotsFor(dt).length; cells += `<button type="button" class="lf__day${dt.toDateString() === state.day ? ' is-on' : ''}${dt.getTime() === today.getTime() ? ' is-today' : ''}" data-d="${dt.toDateString()}" ${ok ? '' : 'disabled'}>${d}</button>`; }
    const sel = state.day ? new Date(state.day) : null, slots = sel ? slotsFor(sel) : [];
    const canPrev = new Date(y, mo, 1) > new Date(today.getFullYear(), today.getMonth(), 1);
    box.innerHTML = `<div class="lf__month"><div class="lf__mhead"><b>${T.months[mo]} ${y}</b><span><button type="button" data-lf-month="-1" aria-label="Mes anterior" ${canPrev ? '' : 'disabled'}>‹</button><button type="button" data-lf-month="1" aria-label="Mes siguiente">›</button></span></div>
      <div class="lf__dow">${T.days.map(d => `<span>${d}</span>`).join('')}</div><div class="lf__grid">${cells}</div></div>
      <div class="lf__times"><p class="lf__tday">${sel ? `${T.days[sel.getDay()]} ${sel.getDate()} de ${T.months[sel.getMonth()]}` : T.pick}</p>
      <div class="lf__slots">${slots.length ? slots.map(t => `<button type="button" class="lf__slot${state.slot && state.slot.day === state.day && state.slot.time === t ? ' is-on' : ''}" data-t="${t}">${t}</button>`).join('') : `<p class="lf__none">${T.noSlots}</p>`}</div>
      <button type="button" class="lf__go" data-lf-confirm ${state.slot && state.slot.day === state.day ? '' : 'disabled'}>${T.confirmSlot}</button></div>`;
  }
  const whenText = () => { if (!state.slot) return ''; if (state.slot.calendly) return 'Agendado en calendario'; const d = new Date(state.slot.day); return `${T.days[d.getDay()]} ${d.getDate()} de ${T.months[d.getMonth()]}, ${state.slot.time} h`; };
  function renderSum() {
    const m = ensure(), c = centroObj(), L = state.lead;
    $('[data-lf-sum]', m).innerHTML = [[T.sumWho, `${esc(L.name)}<small>+52 ${esc(fmtPhone(L.phone || ''))} · ${esc(L.email)}</small>`, 1], [T.sumWhere, esc(c ? c.name : 'PHYX') + (c && c.address ? `<small>${esc(c.address)}</small>` : ''), 1], [T.sumWhen, esc(whenText()), 2], L.motivo ? [T.sumWhy, esc(L.motivo), 1] : null]
      .filter(Boolean).map(([k, v, s]) => `<div><dt>${k}</dt><dd>${v}</dd><button type="button" class="lf__edit" data-lf-back="${s}">${T.edit}</button></div>`).join('');
  }
  function waUrl() {
    const c = centroObj(), L = state.lead;
    const base = state.waUrl ? new URL(state.waUrl, location.href) : new URL(`https://wa.me/${waNumber()}`);
    const lines = [base.searchParams.get('text') || T.wa, '', `${T.waData}:`, L.name, `+52 ${fmtPhone(L.phone || '')}`, L.email, c ? `Centro: ${c.name}` : '', state.slot ? `Cita: ${whenText()}` : '', L.motivo ? `Motivo: ${L.motivo}` : '', L.plan ? `Plan: ${L.plan}` : ''].filter((x, i) => x !== '' || i === 1);
    base.searchParams.delete('text');
    return `${base.origin}${base.pathname}?text=${encodeURIComponent(lines.join('\n'))}`;
  }
  function toWa() {
    const url = waUrl(); fire('whatsapp', url);
    const b = $('[data-lf-wa]', ensure()); b.disabled = true; b.classList.add('is-loading'); $('span', b).textContent = T.going;
    const w = nativeOpen(url, '_blank', 'noopener'); if (!w) location.href = url;
    setTimeout(() => { close(); b.disabled = false; b.classList.remove('is-loading'); $('span', b).textContent = T.go; }, 600);
  }
  const fire = (step, url) => document.dispatchEvent(new CustomEvent('px:lead', { detail: { lead: state.lead, step, slot: state.slot, url: url || null } }));
  let lastFocus = null;
  function open(opts = {}) {
    const m = ensure(), L = getLead();
    state.waUrl = opts.waUrl || null; state.slot = null; state.day = null; state.month = null;
    state.lead = Object.assign({}, L, { plan: opts.plan || '' });
    const f = $('form', m);
    ['name', 'email'].forEach(k => { if (L[k] && !f.elements[k].value) f.elements[k].value = L[k]; });
    if (L.phone && !f.elements.phone.value) f.elements.phone.value = fmtPhone(L.phone);
    const cen = opts.centro || L.centro; if (cen) { const r = f.querySelector(`input[name=centro][value="${cen}"]`); if (r) r.checked = true; }
    if (opts.motivo) f.elements.motivo.value = opts.motivo; else if (L.motivo) f.elements.motivo.value = L.motivo;
    $$('.lf__field', m).forEach(x => x.classList.remove('is-bad'));
    lastFocus = document.activeElement; go(1);
    m.classList.add('is-open'); document.documentElement.classList.add('lf-lock');
  }
  function close() { const m = $('#lf'); if (!m) return; m.classList.remove('is-open'); document.documentElement.classList.remove('lf-lock'); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const b = e.target.closest('[data-book]');
    if (b) { e.preventDefault(); return open({ centro: b.dataset.centro, plan: b.dataset.plan, motivo: b.dataset.motivo }); }
    const a = e.target.closest('a[href]');
    if (a && !a.closest('#lf') && isWa(a.getAttribute('href'))) { e.preventDefault(); e.stopImmediatePropagation(); open({ waUrl: a.href }); }
  }, true);
  window.open = function (url, ...rest) { if (isWa(String(url || ''))) { open({ waUrl: String(url) }); return null; } return nativeOpen(url, ...rest); };
  window.PXLead = { open, close, go };
})();
