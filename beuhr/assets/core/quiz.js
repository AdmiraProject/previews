
(function () {
  const LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  const B = window.BEUHR || { products: [], contact: { wa: '523511609794' } };
  const L = (o) => (o && typeof o === 'object' && ('es' in o || 'en' in o)) ? (o[LANG] ?? o.es) : o;
  const yn = [{ v: 'si', t: { es: 'Sí', en: 'Yes' } }, { v: 'no', t: { es: 'No', en: 'No' } }];
  const ynd = [...yn, { v: 'nose', t: { es: 'No sé', en: 'Not sure' } }];
  const STATES = ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Estado de México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'];

  // ——— Question bank (wording follows BEUHR's form; options verbatim) ———
  const Q = {
    goal: { type: 'single', eyebrow: { es: 'Empieza por lo que te pasa', en: 'Start with what’s going on' },
      q: { es: '¿Qué quieres resolver primero?', en: 'What do you want to work on first?' },
      sub: { es: 'No necesitas saber qué producto comprar. Ese es nuestro trabajo.', en: 'You don’t need to know which product to buy. That’s our job.' },
      opts: [{ v: 'hair', ic: 'hair', t: { es: 'Caída o pérdida de cabello', en: 'Hair loss or thinning' } },
             { v: 'sex', ic: 'sex', t: { es: 'Disfunción eréctil', en: 'Erectile dysfunction' } },
             { v: 'both', ic: 'both', t: { es: 'Ambos', en: 'Both' } },
             { v: 'sleep', ic: 'sleep', t: { es: 'Dormir y bajar el estrés', en: 'Sleep and stress' }, d: { es: 'Sin valoración médica', en: 'No medical review needed' } },
             { v: 'energy', ic: 'energy', t: { es: 'Energía y vitalidad', en: 'Energy and vitality' }, d: { es: 'Sin valoración médica', en: 'No medical review needed' } }] },
    info_hair: { type: 'info', eyebrow: { es: 'Así de claro', en: 'Straight talk' },
      q: { es: 'Primero entendemos tu caso. Después, un médico decide.', en: 'First we understand your case. Then a doctor decides.' },
      sub: { es: 'Unas preguntas sobre tu cabello y tu salud. Toma unos minutos y es 100% confidencial.', en: 'A few questions about your hair and your health. It takes a few minutes and it’s 100% confidential.' } },
    h_time: { type: 'single', block: 'hair', q: { es: '¿Hace cuánto tiempo notas pérdida de cabello?', en: 'How long have you noticed hair loss?' },
      opts: [{ v: '<6m', t: { es: 'Menos de 6 meses', en: 'Less than 6 months' } }, { v: '6-12m', t: { es: 'Entre 6 y 12 meses', en: '6 to 12 months' } },
             { v: '1-3y', t: { es: 'Entre 1 y 3 años', en: '1 to 3 years' } }, { v: '>3y', t: { es: 'Más de 3 años', en: 'More than 3 years' } }] },
    h_pattern: { type: 'single', block: 'hair', visual: true, q: { es: '¿Cómo describirías el patrón de caída?', en: 'How would you describe the pattern?' },
      opts: [{ v: 'entradas', ic: 'p-front', t: { es: 'Entradas en la frente', en: 'Receding hairline' } }, { v: 'corona', ic: 'p-crown', t: { es: 'Corona / cima de la cabeza', en: 'Crown / top of the head' } },
             { v: 'ambas', ic: 'p-both', t: { es: 'Ambas zonas', en: 'Both areas' } }, { v: 'difusa', ic: 'p-diffuse', t: { es: 'Caída difusa / generalizada', en: 'Diffuse / all over' } }] },
    h_family: { type: 'single', block: 'hair', q: { es: '¿Tienes familiares directos con calvicie?', en: 'Do close relatives have hair loss?' }, sub: { es: 'Padre, hermanos, abuelos.', en: 'Father, brothers, grandparents.' },
      opts: [{ v: 'padre', t: { es: 'Sí, por parte de padre', en: 'Yes, on my father’s side' } }, { v: 'madre', t: { es: 'Sí, por parte de madre', en: 'Yes, on my mother’s side' } },
             { v: 'ambos', t: { es: 'Ambos lados', en: 'Both sides' } }, { v: 'no', t: { es: 'No', en: 'No' } }, { v: 'nose', t: { es: 'No sé', en: 'Not sure' } }] },
    h_prev: { type: 'multi', block: 'hair', q: { es: '¿Usas o has usado algún tratamiento para la caída?', en: 'Have you used any hair-loss treatment?' }, sub: { es: 'Elige todas las que apliquen.', en: 'Choose all that apply.' },
      opts: [{ v: 'minox', t: { es: 'Minoxidil (tópico)', en: 'Minoxidil (topical)' } }, { v: 'fina', t: { es: 'Finasterida (oral)', en: 'Finasteride (oral)' } },
             { v: 'shampoo', t: { es: 'Shampoo anticaída', en: 'Anti-hair-loss shampoo' } }, { v: 'pro', t: { es: 'Tratamiento capilar profesional', en: 'Professional hair treatment' } },
             { v: 'none', excl: true, t: { es: 'No, ninguno', en: 'No, none' } }] },
    h_pref: { type: 'single', block: 'hair', q: { es: '¿Cómo prefieres llevar tu tratamiento?', en: 'How would you prefer to take your treatment?' },
      opts: [{ v: 'topical', ic: 'drop', t: { es: 'Solo tópico', en: 'Topical only' }, d: { es: 'Aplicación en el cuero cabelludo', en: 'Applied to the scalp' } },
             { v: 'oral', ic: 'pill', t: { es: 'Solo oral', en: 'Oral only' }, d: { es: 'Una cápsula al día', en: 'One capsule a day' } },
             { v: 'combined', ic: 'both', t: { es: 'Combinado: oral + tópico', en: 'Combined: oral + topical' } },
             { v: 'doctor', ic: 'doctor', t: { es: 'Que mi médico elija la mejor opción', en: 'Let my doctor choose the best option' } }] },
    h_women: { type: 'single', block: 'hair', q: { es: '¿En mujeres de tu familia existe alopecia o calvicie notable?', en: 'Is there notable hair loss among women in your family?' }, opts: ynd },
    h_psa: { type: 'single', block: 'hair', q: { es: '¿Tienes o has tenido cáncer de próstata o alteraciones en el PSA?', en: 'Have you had prostate cancer or abnormal PSA results?' }, opts: ynd },
    h_libido: { type: 'single', block: 'hair', q: { es: '¿Has tenido baja de libido, disfunción eréctil o cambios de ánimo antes de un tratamiento capilar?', en: 'Have you had low libido, ED or mood changes before any hair treatment?' },
      opts: [{ v: 'si', t: { es: 'Sí', en: 'Yes' } }, { v: 'no', t: { es: 'No', en: 'No' } }, { v: 'na', t: { es: 'No aplica / nunca he usado tratamiento', en: 'Not applicable / never used treatment' } }] },
    info_sex: { type: 'info', eyebrow: { es: 'Sin juicios', en: 'No judgment' },
      q: { es: 'A veces pasa. Hablarlo es el primer paso.', en: 'It happens. Talking about it is the first step.' },
      sub: { es: 'Estas preguntas ayudan a tu médico a saber si un tratamiento es seguro para ti.', en: 'These questions help your doctor know whether treatment is safe for you.' } },
    e_freq: { type: 'single', block: 'sex', q: { es: '¿Con qué frecuencia tienes dificultad para lograr o mantener una erección?', en: 'How often do you have trouble getting or keeping an erection?' },
      opts: [{ v: 'siempre', t: { es: 'Siempre o casi siempre', en: 'Always or almost always' } }, { v: 'mas', t: { es: 'Más de la mitad de las veces', en: 'More than half the time' } },
             { v: 'mitad', t: { es: 'Aproximadamente la mitad de las veces', en: 'About half the time' } }, { v: 'menos', t: { es: 'Menos de la mitad de las veces', en: 'Less than half the time' } }] },
    e_since: { type: 'single', block: 'sex', q: { es: '¿Desde cuándo presentas esta dificultad?', en: 'How long has this been happening?' },
      opts: [{ v: '<3m', t: { es: 'Menos de 3 meses', en: 'Less than 3 months' } }, { v: '3-12m', t: { es: 'Entre 3 y 12 meses', en: '3 to 12 months' } },
             { v: '>1y', t: { es: 'Más de 1 año', en: 'More than 1 year' } }, { v: '>3y', t: { es: 'Más de 3 años', en: 'More than 3 years' } }] },
    e_morning: { type: 'single', block: 'sex', q: { es: '¿Tienes erecciones matutinas al despertar?', en: 'Do you have morning erections?' },
      opts: [{ v: 'reg', t: { es: 'Sí, regularmente', en: 'Yes, regularly' } }, { v: 'oca', t: { es: 'Sí, ocasionalmente', en: 'Yes, sometimes' } }, { v: 'no', t: { es: 'No', en: 'No' } }] },
    e_context: { type: 'single', block: 'sex', q: { es: '¿La dificultad ocurre también en solitario o solo en pareja?', en: 'Does it also happen alone, or only with a partner?' },
      opts: [{ v: 'pareja', t: { es: 'Solo con pareja', en: 'Only with a partner' } }, { v: 'solo', t: { es: 'También en solitario', en: 'Alone too' } }, { v: 'ne', t: { es: 'No he podido evaluar', en: 'I haven’t been able to tell' } }] },
    e_prev: { type: 'single', block: 'sex', q: { es: '¿Has usado medicamentos para la erección?', en: 'Have you used erection medication before?' }, sub: { es: 'Sildenafil, tadalafil, etc.', en: 'Sildenafil, tadalafil, etc.' },
      opts: [{ v: 'ok', t: { es: 'Sí, con buen resultado', en: 'Yes, with good results' } }, { v: 'bad', t: { es: 'Sí, sin resultado o con efectos adversos', en: 'Yes, without results or with side effects' } }, { v: 'no', t: { es: 'No, nunca', en: 'No, never' } }] },
    e_nitrates: { type: 'single', block: 'sex', stop: ['si'], q: { es: '¿Usas nitratos o medicamentos para angina de pecho?', en: 'Do you take nitrates or angina medication?' }, sub: { es: 'Nitroglicerina, isosorbide, etc.', en: 'Nitroglycerin, isosorbide, etc.' }, opts: yn },
    e_cardiac: { type: 'multi', block: 'sex', stopAnyBut: 'none', q: { es: '¿Has tenido en los últimos 6 meses alguno de estos eventos?', en: 'In the last 6 months, have you had any of these?' },
      opts: [{ v: 'infarto', t: { es: 'Infarto al miocardio', en: 'Heart attack' } }, { v: 'angina', t: { es: 'Angina inestable', en: 'Unstable angina' } }, { v: 'arritmia', t: { es: 'Arritmia grave', en: 'Serious arrhythmia' } },
             { v: 'ic', t: { es: 'Insuficiencia cardiaca', en: 'Heart failure' } }, { v: 'evc', t: { es: 'Accidente cerebrovascular (EVC)', en: 'Stroke' } }, { v: 'none', excl: true, t: { es: 'Ninguno de los anteriores', en: 'None of these' } }] },
    e_bp: { type: 'single', block: 'sex', q: { es: '¿Tienes presión arterial muy baja o muy alta sin control?', en: 'Is your blood pressure very low, or high and uncontrolled?' },
      opts: [{ v: 'hipo', t: { es: 'Sí, hipotensión', en: 'Yes, low blood pressure' } }, { v: 'hiper', t: { es: 'Sí, hipertensión sin control', en: 'Yes, uncontrolled high blood pressure' } },
             { v: 'ok', t: { es: 'No, está bien controlada / no tengo', en: 'No, it’s controlled / I don’t have it' } }, { v: 'nose', t: { es: 'No sé', en: 'Not sure' } }] },
    e_naion: { type: 'single', block: 'sex', stop: ['si'], q: { es: '¿Has tenido pérdida de visión en uno o ambos ojos (NAION)?', en: 'Have you had vision loss in one or both eyes (NAION)?' }, opts: yn },
    m_cond: { type: 'multi', block: 'med', eyebrow: { es: 'Antecedentes médicos', en: 'Medical history' }, q: { es: '¿Te han diagnosticado alguna de estas condiciones?', en: 'Have you been diagnosed with any of these?' },
      opts: [{ v: 'diabetes', t: { es: 'Diabetes', en: 'Diabetes' } }, { v: 'hta', t: { es: 'Hipertensión arterial', en: 'High blood pressure' } }, { v: 'cv', t: { es: 'Enfermedad cardiovascular', en: 'Heart disease' } },
             { v: 'renal', t: { es: 'Enfermedad renal o hepática', en: 'Kidney or liver disease' } }, { v: 'prostata', t: { es: 'Cáncer de próstata', en: 'Prostate cancer' } }, { v: 'hipo', t: { es: 'Hipotensión / presión baja', en: 'Low blood pressure' } },
             { v: 'none', excl: true, t: { es: 'Ninguna de las anteriores', en: 'None of these' } }] },
    m_meds: { type: 'single', block: 'med', follow: { v: 'si', name: 'meds_detail', ph: { es: '¿Cuál o cuáles?', en: 'Which ones?' } }, q: { es: '¿Tomas actualmente algún medicamento?', en: 'Are you currently taking any medication?' }, opts: yn },
    m_allergy: { type: 'single', block: 'med', follow: { v: 'si', name: 'allergy_detail', ph: { es: '¿A qué medicamento?', en: 'To which medication?' } }, q: { es: '¿Tienes alguna alergia conocida a medicamentos?', en: 'Any known drug allergies?' },
      opts: [{ v: 'no', t: { es: 'No', en: 'No' } }, { v: 'nose', t: { es: 'No sé', en: 'Not sure' } }, { v: 'si', t: { es: 'Sí', en: 'Yes' } }] },
    m_surgery: { type: 'single', block: 'med', follow: { v: 'si', name: 'surgery_detail', ph: { es: '¿Cuál y cuándo?', en: 'Which one and when?' } }, q: { es: '¿Has tenido alguna cirugía o procedimiento médico importante?', en: 'Have you had any major surgery or procedure?' }, opts: yn },
    m_family: { type: 'multi', block: 'med', q: { es: '¿Algún familiar de primer grado tiene o tuvo…?', en: 'Does a first-degree relative have or had…?' },
      opts: [{ v: 'diabetes', t: { es: 'Diabetes', en: 'Diabetes' } }, { v: 'hta', t: { es: 'Hipertensión', en: 'High blood pressure' } }, { v: 'cv', t: { es: 'Enfermedad cardiovascular', en: 'Heart disease' } },
             { v: 'prostata', t: { es: 'Cáncer de próstata', en: 'Prostate cancer' } }, { v: 'alopecia', t: { es: 'Alopecia / calvicie', en: 'Hair loss' } }, { v: 'none', excl: true, t: { es: 'Ninguna / No sé', en: 'None / Not sure' } }] },
    l_smoke: { type: 'single', block: 'life', eyebrow: { es: 'Hábitos', en: 'Habits' }, q: { es: '¿Fumas actualmente?', en: 'Do you smoke?' },
      opts: [{ v: 'diario', t: { es: 'Sí, a diario', en: 'Yes, daily' } }, { v: 'oca', t: { es: 'Ocasionalmente', en: 'Occasionally' } }, { v: 'ex', t: { es: 'Ex-fumador', en: 'Former smoker' } }, { v: 'no', t: { es: 'No fumo', en: 'I don’t smoke' } }] },
    l_alcohol: { type: 'single', block: 'life', q: { es: '¿Consumes alcohol?', en: 'Do you drink alcohol?' },
      opts: [{ v: 'no', t: { es: 'No consumo', en: 'I don’t drink' } }, { v: 'oca', t: { es: 'Ocasionalmente (fin de semana)', en: 'Occasionally (weekends)' } },
             { v: 'mod', t: { es: 'Moderado (3–5 días por semana)', en: 'Moderate (3–5 days a week)' } }, { v: 'diario', t: { es: 'Frecuente (diario)', en: 'Frequent (daily)' } }] },
    l_active: { type: 'single', block: 'life', q: { es: '¿Realizas actividad física?', en: 'Are you physically active?' },
      opts: [{ v: '3+', t: { es: 'Sí, 3 o más veces por semana', en: 'Yes, 3+ times a week' } }, { v: '1-2', t: { es: 'Sí, 1–2 veces por semana', en: 'Yes, 1–2 times a week' } },
             { v: 'espo', t: { es: 'Esporádicamente', en: 'Now and then' } }, { v: 'no', t: { es: 'No realizo', en: 'Not really' } }] },
    l_stress: { type: 'single', block: 'life', q: { es: '¿Cómo describes tu nivel de estrés actual?', en: 'How would you describe your stress level?' },
      opts: [{ v: 'bajo', t: { es: 'Bajo', en: 'Low' } }, { v: 'mod', t: { es: 'Moderado', en: 'Moderate' } }, { v: 'alto', t: { es: 'Alto', en: 'High' } }, { v: 'muy', t: { es: 'Muy alto', en: 'Very high' } }] },
    d_name: { type: 'fields', block: 'data', eyebrow: { es: 'Datos del paciente', en: 'Patient details' }, q: { es: '¿Cómo te llamas?', en: 'What’s your name?' }, sub: { es: 'Tu médico usará este nombre en tu receta.', en: 'Your doctor will use this name on your prescription.' },
      fields: [{ name: 'nombre', t: { es: 'Nombre', en: 'First name' }, ac: 'given-name' }, { name: 'apellidos', t: { es: 'Apellidos', en: 'Last name' }, ac: 'family-name' }] },
    d_birth: { type: 'fields', block: 'data', q: { es: '¿Cuándo naciste y dónde vives?', en: 'When were you born and where do you live?' }, sub: { es: 'Enviamos a todo México.', en: 'We ship anywhere in Mexico.' },
      fields: [{ name: 'nacimiento', type: 'date', t: { es: 'Fecha de nacimiento', en: 'Date of birth' }, ac: 'bday' }, { name: 'estado', type: 'select', opts: STATES, t: { es: 'Estado', en: 'State' } }] },
    d_body: { type: 'fields', block: 'data', q: { es: 'Tu peso y estatura', en: 'Your weight and height' }, sub: { es: 'Ayuda a tu médico a definir la dosis correcta.', en: 'It helps your doctor pick the right dose.' },
      fields: [{ name: 'peso', type: 'number', t: { es: 'Peso (kg)', en: 'Weight (kg)' }, min: 30, max: 250 }, { name: 'estatura', type: 'number', t: { es: 'Estatura (cm)', en: 'Height (cm)' }, min: 120, max: 230 }] },
    d_contact: { type: 'fields', block: 'data', q: { es: '¿Dónde te contactamos?', en: 'Where can we reach you?' }, sub: { es: 'Te avisamos por aquí cuando tu médico revise tu caso.', en: 'We’ll let you know here once your doctor reviews your case.' },
      fields: [{ name: 'email', type: 'email', t: { es: 'Email', en: 'Email' }, ac: 'email' }, { name: 'telefono', type: 'tel', t: { es: 'Teléfono (WhatsApp)', en: 'Phone (WhatsApp)' }, ac: 'tel' }] },
    consent: { type: 'consent', block: 'data', eyebrow: { es: 'Consentimiento', en: 'Consent' }, q: { es: 'Último paso', en: 'Last step' },
      sub: { es: 'Tus respuestas son confidenciales y solo las ve tu médico.', en: 'Your answers are confidential and only your doctor sees them.' },
      checks: [{ name: 'privacidad', t: { es: 'Acepto el Aviso de privacidad', en: 'I accept the Privacy notice' } }, { name: 'informado', t: { es: 'Acepto el Consentimiento informado', en: 'I accept the Informed consent' } },
               { name: 'terminos', t: { es: 'Acepto Términos y condiciones', en: 'I accept the Terms and conditions' } }] },
  };
  const FLOW = {
    hair: ['info_hair', 'h_time', 'h_pattern', 'h_family', 'h_prev', 'h_pref', 'h_women', 'h_psa', 'h_libido'],
    sex: ['info_sex', 'e_freq', 'e_since', 'e_morning', 'e_context', 'e_prev', 'e_nitrates', 'e_cardiac', 'e_bp', 'e_naion'],
    common: ['m_cond', 'm_meds', 'm_allergy', 'm_surgery', 'm_family', 'l_smoke', 'l_alcohol', 'l_active', 'l_stress', 'd_name', 'd_birth', 'd_body', 'd_contact', 'consent'],
  };
  const T = {
    es: { next: 'Continuar', back: 'Atrás', start: 'Empezar', of: 'de', submit: 'Enviar a revisión médica', required: 'Completa este paso para continuar',
      rx_k: 'Tu ruta sugerida', rx_h: (n) => `${n}, esto es lo que tu médico va a revisar`, rx_h0: 'Esto es lo que tu médico va a revisar',
      rx_p: 'Un médico de BEUHR revisa tus respuestas, confirma si eres candidato y define producto y dosis. Si no lo eres, te propone otra ruta.',
      rx_note: 'Venta bajo prescripción. El precio se confirma con tu receta.', from: 'Desde', view: 'Ver detalle', wa: 'Dudas por WhatsApp',
      done_k: 'Listo', done_h: 'Recibimos tu cuestionario', done_p: 'Tu médico lo revisa en 24 horas hábiles. Te escribimos por WhatsApp o email con tu confirmación y tu enlace de pago.',
      stop_k: 'Por tu seguridad', stop_h: 'Tu caso necesita una valoración en persona', stop_p: 'Por lo que nos compartiste, no podemos recetarte este tratamiento en línea. Escríbenos y te orientamos sobre el siguiente paso.',
      otc_k: 'Sin receta', otc_h: 'Para esto no necesitas valoración médica', otc_p: 'Elige tu presentación y la recibes en casa. Si quieres, te orientamos por WhatsApp.', shop: 'Comprar', soldout: 'Agotado por ahora', home: 'Volver al inicio',
      an_h: 'Preparando tu resumen', an_p: 'Ordenamos tus respuestas para que tu médico las revise.', steps: ['Tu objetivo', 'Tu caso', 'Tu salud', 'Tus datos'], wa_msg: (n) => `Hola BEUHR, soy ${n || ''}. Acabo de llenar mi cuestionario y tengo una duda.` },
    en: { next: 'Continue', back: 'Back', start: 'Start', of: 'of', submit: 'Send for medical review', required: 'Complete this step to continue',
      rx_k: 'Your suggested path', rx_h: (n) => `${n}, here’s what your doctor will review`, rx_h0: 'Here’s what your doctor will review',
      rx_p: 'A BEUHR doctor reviews your answers, confirms whether you’re a candidate and sets the product and dose. If you’re not, they’ll suggest another path.',
      rx_note: 'Prescription only. Price is confirmed with your prescription.', from: 'From', view: 'See details', wa: 'Questions on WhatsApp',
      done_k: 'Done', done_h: 'We got your questionnaire', done_p: 'Your doctor reviews it within 24 business hours. We’ll message you on WhatsApp or email with your confirmation and payment link.',
      stop_k: 'For your safety', stop_h: 'Your case needs an in-person visit', stop_p: 'Based on what you shared, we can’t prescribe this treatment online. Message us and we’ll help with the next step.',
      otc_k: 'No prescription', otc_h: 'You don’t need a medical review for this', otc_p: 'Pick your size and get it delivered. We’re happy to help on WhatsApp.', shop: 'Shop', soldout: 'Out of stock for now', home: 'Back to home',
      an_h: 'Preparing your summary', an_p: 'We\u2019re organizing your answers for your doctor to review.', steps: ['Your goal', 'Your case', 'Your health', 'Your details'], wa_msg: (n) => `Hi BEUHR, this is ${n || ''}. I just finished my questionnaire and have a question.` },
  }[LANG];
  const REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const OUT_MS = 180;
  const money = (n) => '$' + Number(n).toLocaleString('es-MX') + ' MXN';
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function recommend(a) {
    const out = [];
    if (a.goal === 'hair' || a.goal === 'both') {
      const noFina = a.h_psa === 'si' || a.h_libido === 'si';
      const pref = a.h_pref;
      if (pref === 'topical') out.push(noFina ? 'restore' : 'restore-max');
      else if (pref === 'combined') { out.push(noFina ? 'dense-25' : 'dense-max-25'); out.push('restore'); }
      else out.push(noFina ? 'dense-25' : 'dense-max-25');
    }
    if (a.goal === 'sex' || a.goal === 'both') out.push('apex');
    return out;
  }

  function mount(root) {
    const ans = {}; const hist = [];
    let seq = []; let i = 0; let state = 'q'; let rendered = false; let swapT = 0;
    const start = root.dataset.start || new URLSearchParams(location.search).get('goal');
    const build = () => {
      const g = ans.goal;
      seq = ['goal'];
      if (g === 'hair') seq.push(...FLOW.hair);
      if (g === 'sex') seq.push(...FLOW.sex);
      if (g === 'both') seq.push(...FLOW.hair, ...FLOW.sex.slice(1));
      if (g === 'hair' || g === 'sex' || g === 'both') seq.push(...FLOW.common);
    };
    if (start && Q.goal.opts.some((o) => o.v === start)) { ans.goal = start; }
    build();
    if (ans.goal) { if (ans.goal === 'sleep' || ans.goal === 'energy') state = 'otc'; else i = 1; }
    root.classList.add('qz');
    root.innerHTML = '<div class="qz__bar" aria-hidden="true"><span class="qz__bar-fill"></span></div><div class="qz__top"><button type="button" class="qz__back">' + icon('back') + '<span>' + T.back + '</span></button><span class="qz__count" aria-live="polite"></span></div><div class="qz__stage"></div>';
    const stage = root.querySelector('.qz__stage'); const fill = root.querySelector('.qz__bar-fill');
    const backBtn = root.querySelector('.qz__back'); const count = root.querySelector('.qz__count');
    backBtn.addEventListener('click', () => { if (state !== 'q') { state = 'q'; render(); return; } if (i > 0) { i--; render(); } else if (history.length > 1) history.back(); });

    root.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
      const nx = stage.querySelector('.is-in .qz__next:not([disabled]), .qz__screen:not(.is-out) .qz__next:not([disabled])'); if (nx) { e.preventDefault(); nx.click(); }
    });
    function advance() {
      const id = seq[i]; const q = Q[id]; const v = ans[id];
      if (q.stop && q.stop.includes(v)) { state = 'stop'; return render(); }
      if (q.stopAnyBut && Array.isArray(v) && v.some((x) => x !== q.stopAnyBut)) { state = 'stop'; return render(); }
      if (id === 'goal') { build(); if (v === 'sleep' || v === 'energy') { state = 'otc'; return render(); } }
      if (i < seq.length - 1) { i++; render(); } else { state = 'analyzing'; render(); setTimeout(() => { if (state === 'analyzing') { state = 'result'; render(); } }, REDUCED ? 300 : 1400); }
    }
    function render() {
      const id = seq[i]; const q = Q[id];
      const pct = state === 'q' ? Math.round((i / seq.length) * 100) : 100;
      fill.style.width = Math.max(4, pct) + '%'; root.style.setProperty('--qz-pct', pct);
      const blk = state !== 'q' ? 3 : id === 'goal' ? 0 : q.block === 'med' || q.block === 'life' ? 2 : q.block === 'data' ? 3 : 1;
      root.dataset.block = blk; count.textContent = state === 'q' && i > 0 ? `${i} ${T.of} ${seq.length - 1}` : '';
      backBtn.hidden = state === 'q' && i === 0 && !start;
      root.querySelectorAll('[data-qz-step]').forEach((el, k) => el.classList.toggle('is-on', k <= blk));
      let h = '';
      if (state === 'q') {
        h += `<div class="qz__screen" data-type="${q.type}" data-id="${id}">`;
        if (q.eyebrow) h += `<p class="qz__eyebrow">${L(q.eyebrow)}</p>`;
        h += `<h1 class="qz__q">${L(q.q)}</h1>`;
        if (q.sub) h += `<p class="qz__sub">${L(q.sub)}</p>`;
        if (q.type === 'single' || q.type === 'multi') {
          h += `<div class="qz__opts${q.visual ? ' qz__opts--visual' : ''}" role="${q.type === 'multi' ? 'group' : 'radiogroup'}">`;
          for (const o of q.opts) {
            const on = q.type === 'multi' ? (ans[id] || []).includes(o.v) : ans[id] === o.v;
            h += `<button type="button" class="qz__opt${on ? ' is-on' : ''}" data-v="${o.v}" role="${q.type === 'multi' ? 'checkbox' : 'radio'}" aria-checked="${on}">${o.ic ? `<span class="qz__opt-ic">${icon(o.ic)}</span>` : ''}<span class="qz__opt-t">${L(o.t)}</span>${o.d ? `<span class="qz__opt-d">${L(o.d)}</span>` : ''}${q.type === 'multi' ? '<span class="qz__opt-box" aria-hidden="true"></span>' : '<span class="qz__opt-arr" aria-hidden="true">' + icon('arrow') + '</span>'}</button>`;
          }
          h += '</div>';
          if (q.follow) h += `<label class="qz__field qz__follow" ${ans[id] === q.follow.v ? '' : 'hidden'}><span>${L(q.follow.ph)}</span><input name="${q.follow.name}" value="${esc(ans[q.follow.name])}"></label>`;
          if (q.type === 'multi' || q.follow) h += `<button type="button" class="qz__next" ${(q.type === 'multi' ? (ans[id] || []).length : ans[id]) ? '' : 'disabled'}>${T.next}</button>`;
        } else if (q.type === 'fields') {
          h += '<div class="qz__fields">';
          for (const f of q.fields) {
            const val = esc(ans[f.name]);
            if (f.type === 'select') h += `<label class="qz__field"><span>${L(f.t)}</span><select name="${f.name}" required><option value=""></option>${f.opts.map((o) => `<option${ans[f.name] === o ? ' selected' : ''}>${o}</option>`).join('')}</select></label>`;
            else h += `<label class="qz__field"><span>${L(f.t)}</span><input name="${f.name}" type="${f.type || 'text'}" value="${val}" ${f.ac ? `autocomplete="${f.ac}"` : ''} ${f.min ? `min="${f.min}" max="${f.max}" inputmode="numeric"` : ''} required></label>`;
          }
          h += `</div><button type="button" class="qz__next">${T.next}</button>`;
        } else if (q.type === 'consent') {
          h += '<div class="qz__checks">' + q.checks.map((c) => `<label class="qz__check"><input type="checkbox" name="${c.name}" ${ans[c.name] ? 'checked' : ''}><span class="qz__check-box" aria-hidden="true"></span><span>${L(c.t)}</span></label>`).join('') + `</div><button type="button" class="qz__next" ${q.checks.every((c) => ans[c.name]) ? '' : 'disabled'}>${T.submit}</button>`;
        } else if (q.type === 'info') {
          h += `<button type="button" class="qz__next">${T.next}</button>`;
        }
        h += `<p class="qz__note" hidden>${T.required}</p></div>`;
      } else if (state === 'result' || state === 'done') {
        const recs = recommend(ans).map((pid) => B.products.find((p) => p.id === pid)).filter(Boolean);
        const n = ans.nombre ? esc(ans.nombre) : '';
        h += `<div class="qz__screen qz__result" data-type="${state === 'done' ? 'done' : 'result'}"><p class="qz__eyebrow">${state === 'done' ? T.done_k : T.rx_k}</p><h1 class="qz__q">${state === 'done' ? T.done_h : (n ? T.rx_h(n) : T.rx_h0)}</h1><p class="qz__sub">${state === 'done' ? T.done_p : T.rx_p}</p><div class="qz__recs">`;
        for (const p of recs) h += `<article class="qz__rec"><img class="qz__rec-img" src="${assetBase()}${p.img.card}" alt="${p.name}" width="600" height="600" loading="lazy"><div class="qz__rec-body"><p class="qz__rec-k">${esc(L(B.lines[p.line]))}</p><h2 class="qz__rec-t">${p.name}</h2><p class="qz__rec-d">${L(p.dose)}</p><p class="qz__rec-p">${T.from} ${money(p.price)}</p><a class="qz__rec-link" href="product.html?p=${p.id}">${T.view}</a></div></article>`;
        h += `</div><p class="qz__fine">${T.rx_note}</p><div class="qz__actions">${state === 'done' ? '' : `<button type="button" class="qz__cta" data-qz-done>${T.submit}</button>`}<a class="qz__cta qz__cta--alt" href="https://wa.me/${B.contact.wa}?text=${encodeURIComponent(T.wa_msg(ans.nombre))}" target="_blank" rel="noopener">${icon('wa')}${T.wa}</a></div></div>`;
      } else if (state === 'analyzing') {
        h += `<div class="qz__screen qz__analyzing" data-type="analyzing" role="status"><span class="qz__spin" aria-hidden="true"></span><h1 class="qz__q">${T.an_h}</h1><p class="qz__sub">${T.an_p}</p></div>`;
      } else if (state === 'stop') {
        h += `<div class="qz__screen qz__result qz__result--stop" data-type="stop"><p class="qz__eyebrow">${T.stop_k}</p><h1 class="qz__q">${T.stop_h}</h1><p class="qz__sub">${T.stop_p}</p><div class="qz__actions"><a class="qz__cta" href="https://wa.me/${B.contact.wa}" target="_blank" rel="noopener">${icon('wa')}WhatsApp ${B.contact.waDisplay}</a><a class="qz__cta qz__cta--alt" href="index.html">${T.home}</a></div></div>`;
      } else if (state === 'otc') {
        const ids = ans.goal === 'sleep' ? ['zen'] : ['core', 'ascend'];
        h += `<div class="qz__screen qz__result" data-type="otc"><p class="qz__eyebrow">${T.otc_k}</p><h1 class="qz__q">${T.otc_h}</h1><p class="qz__sub">${T.otc_p}</p><div class="qz__recs">`;
        for (const id of ids) { const p = B.products.find((x) => x.id === id); if (!p) continue; h += `<article class="qz__rec"><img class="qz__rec-img" src="${assetBase()}${p.img.card}" alt="${p.name}" width="600" height="600" loading="lazy"><div class="qz__rec-body"><p class="qz__rec-k">${esc(L(B.lines[p.line]))}</p><h2 class="qz__rec-t">${p.name}</h2><p class="qz__rec-d">${L(p.dose)}</p><p class="qz__rec-p">${money(p.price)}</p>${p.stock === false ? `<span class="qz__rec-link is-off">${T.soldout}</span>` : `<a class="qz__rec-link" href="product.html?p=${p.id}">${T.shop}</a>`}</div></article>`; }
        h += `</div><div class="qz__actions"><a class="qz__cta qz__cta--alt" href="https://wa.me/${B.contact.wa}" target="_blank" rel="noopener">${icon('wa')}${T.wa}</a></div></div>`;
      }
      const prev = stage.firstElementChild;
      const paint = () => {
        stage.innerHTML = h;
        const scr = stage.firstElementChild; root.dataset.state = state;
        requestAnimationFrame(() => requestAnimationFrame(() => scr && scr.classList.add('is-in')));
        const hd = scr && scr.querySelector('.qz__q'); if (hd && rendered) { hd.setAttribute('tabindex', '-1'); hd.focus({ preventScroll: true }); }
        rendered = true;
        wire(id, q);
      };
      if (prev && !REDUCED) { prev.classList.remove('is-in'); prev.classList.add('is-out'); clearTimeout(swapT); swapT = setTimeout(paint, OUT_MS); }
      else paint();
      root.dispatchEvent(new CustomEvent('qz:render', { detail: { id: state === 'q' ? id : state, index: i, total: seq.length, block: blk } }));
      const top = root.getBoundingClientRect().top; if (top < 0) window.scrollTo({ top: window.scrollY + top - 80, behavior: 'smooth' });
    }
    function wire(id, q) {
      const done = stage.querySelector('[data-qz-done]'); if (done) done.addEventListener('click', () => { state = 'done'; render(); });
      if (state !== 'q') return;
      const next = stage.querySelector('.qz__next'); const note = stage.querySelector('.qz__note');
      stage.querySelectorAll('.qz__opt').forEach((b) => b.addEventListener('click', () => {
        const v = b.dataset.v;
        if (q.type === 'single') {
          ans[id] = v; stage.querySelectorAll('.qz__opt').forEach((x) => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-checked', on); });
          if (q.follow) { const f = stage.querySelector('.qz__follow'); f.hidden = v !== q.follow.v; next.disabled = false; if (!f.hidden) f.querySelector('input').focus(); return; }
          setTimeout(advance, REDUCED ? 60 : 260);
        } else {
          const o = q.opts.find((x) => x.v === v); let cur = ans[id] || [];
          cur = cur.includes(v) ? cur.filter((x) => x !== v) : o.excl ? [v] : [...cur.filter((x) => !q.opts.find((y) => y.v === x).excl), v];
          ans[id] = cur; stage.querySelectorAll('.qz__opt').forEach((x) => { const on = cur.includes(x.dataset.v); x.classList.toggle('is-on', on); x.setAttribute('aria-checked', on); });
          next.disabled = !cur.length;
        }
      }));
      stage.querySelectorAll('input,select').forEach((el) => el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', () => {
        ans[el.name] = el.type === 'checkbox' ? el.checked : el.value;
        if (q.type === 'consent') next.disabled = !q.checks.every((c) => ans[c.name]);
      }));
      if (next) next.addEventListener('click', () => {
        if (q.type === 'fields') {
          const bad = [...stage.querySelectorAll('input,select')].find((el) => !el.checkValidity());
          if (bad) { note.hidden = false; bad.focus(); return; }
        }
        advance();
      });
    }
    render();
  }
  function assetBase() { const s = document.querySelector('script[src*="core/quiz.js"]'); return s ? s.getAttribute('src').replace(/core\/quiz\.js.*$/, '') : '../../assets/'; }
  function icon(n) {
    const P = {
      back: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      arrow: '<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      wa: '<path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1 2.7 11.5 11.5 0 0 0 4.4 3.9c1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3Z"/>',
      hair: '<path d="M6 13c0-5 2.7-8 6-8s6 3 6 8M6 13c0 4 2.7 7 6 7s6-3 6-7M8 8c1.5 1 3 1.4 4 1.4S14.5 9 16 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
      sex: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
      both: '<circle cx="9" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="15" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="1.6"/>',
      sleep: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
      energy: '<path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
      drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" fill="none" stroke="currentColor" stroke-width="1.6"/>',
      pill: '<rect x="4" y="9" width="16" height="6" rx="3" fill="none" stroke="currentColor" stroke-width="1.6" transform="rotate(-35 12 12)"/><path d="M10 8.5l4 7" stroke="currentColor" stroke-width="1.6" transform="rotate(-35 12 12) translate(0 0)"/>',
      doctor: '<circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5M12 15v3m-1.5-1.5h3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
      'p-front': '<path d="M5 15c0-6 3-10 7-10s7 4 7 10" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7 9.5C8 8 9 8.6 10 7.4c.7.8 3.3.8 4 0 1 1.2 2 .6 3 2.1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M5 15c0 3 3 5 7 5s7-2 7-5" fill="none" stroke="currentColor" stroke-width="1.6"/>',
      'p-crown': '<ellipse cx="12" cy="12" rx="7.5" ry="8" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="2.6" fill="currentColor" opacity=".25"/>',
      'p-both': '<ellipse cx="12" cy="12" rx="7.5" ry="8" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="11" r="2.4" fill="currentColor" opacity=".25"/><path d="M8 6.5c1.3 1 2.6 1 4 0 1.4 1 2.7 1 4 0" fill="none" stroke="currentColor" stroke-width="1.6"/>',
      'p-diffuse': '<ellipse cx="12" cy="12" rx="7.5" ry="8" fill="none" stroke="currentColor" stroke-width="1.6"/><g fill="currentColor" opacity=".3"><circle cx="9" cy="9" r="1"/><circle cx="13" cy="8" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="10" cy="13" r="1"/><circle cx="12" cy="16" r="1"/></g>',
    };
    return `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">${P[n] || ''}</svg>`;
  }
  window.BEUHR_QUIZ = { Q, FLOW, recommend };
  const init = () => document.querySelectorAll('[data-quiz]').forEach(mount);
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
