
(function () {
  const D = {
 "site": "https://phyx.mx",
 "privacy": "https://phyx.mx/aviso-de-privacidad",
 "logo": "brand/logo.svg",
 "logoWhite": "brand/logo-white.svg",
 "calendly": null,
 "brand": {
  "name": "PHYX",
  "tagline_candidates": [
   "We phyx you",
   "Strong Again"
  ],
  "colors": {
   "primary": {
    "teal": "#55BDBB",
    "charcoal": "#383838",
    "black": "#000000",
    "off_white": "#FFFFFC"
   },
   "secondary": [
    "#2A6F73",
    "#89CBC9",
    "#00B894",
    "#5C5C5C",
    "#4A8C8A",
    "#0070F3",
    "#8C5A3C",
    "#D95F43",
    "#FFB347"
   ],
   "phyx_mx_css": {
    "teal_dark": "#3E7D82",
    "teal": "#55BBB9",
    "logo_dot": "#55BAB8",
    "red_accent": "#FF4646",
    "wa_green": "#25D366",
    "light_bg": "#F8F8F8",
    "border": "#D9D9D9",
    "gray_text": "#767676"
   }
  },
  "fonts": {
   "logo_brand": "Zen Dots",
   "product_ui": "Plus Jakarta Sans (200-800)",
   "accent_mono": "Courier Prime"
  },
  "logo_files": [
   "site/assets/brand/logo.svg (#383838 + #55BAB8 dot)",
   "site/assets/brand/logo-white.svg",
   "site/assets/brand/logo.webp",
   "site/assets/brand/iso.webp"
  ],
  "source": "Brandbook-Phyx-v.2025 (v3.0, 05.2025) + phyx.mx/index.css"
 },
 "contact": {
  "phone": "+52 55 2754 8004",
  "tel_href": "tel:+525527548004",
  "whatsapp_number_on_site": "5527548004",
  "whatsapp_note": "El sitio arma api.whatsapp.com/send?phone=5527548004 SIN código de país (52) — probablemente roto; usar 525527548004 tras VALIDAR",
  "whatsapp_prefill": "¡Hola! Quisiera saber más información sobre sus servicios.",
  "email": "contacto@phyx.mx",
  "social": {
   "facebook": "https://www.facebook.com/phyx.mexico",
   "instagram": "https://www.instagram.com/phyx.mx/",
   "tiktok": "https://www.tiktok.com/@phyx.mx"
  },
  "medical_network": "https://linktr.ee/medicos.phyx",
  "form": {
   "fields": [
    "Nombre",
    "Correo electrónico",
    "Teléfono (intl-tel-input)",
    "¿Qué centro te interesa? (Ecatepec / Las Américas / Lindavista)",
    "¿Qué plan te interesa? (Promo primera vez / Ortopedia / Membresía Performance / Otros)"
   ],
   "consent": "Al hacer clic en 'Enviar' acepto que he leído el aviso de privacidad",
   "submit_to": "Zapier webhook (hooks.zapier.com/hooks/catch/18995727/ux97av5/) + /webhook_process.php + send_email.php",
   "redirect": "/gracias-redirect → /gracias ('Muchas gracias por escribirnos. Pronto, uno de nuestros agentes se pondrá en contacto contigo.')",
   "crm": "Kommo (VALIDAR)",
   "tracking": "GA4 G-QGRZ4Y6ZVC + GTM + Meta pixel"
  },
  "booking_flow_today": "Todos los CTA (#whatsapp_dnm) abren WhatsApp con mensaje prellenado; o formulario → Zapier → agente contacta vía WhatsApp. Sin agenda online. Lead calificado = 'Agendamos una cita' (desde 08/10/2026).",
  "whatsapp": "525527548004"
 },
 "centers": [
  {
   "id": "ecatepec",
   "name": "Ecatepec",
   "address": "Tamaulipas 255, Santa María Tulpetlac, Ecatepec de Morelos, Estado de México",
   "reference": "Dentro del Hospital Medicina Integral Guadalupe",
   "postal_code": "VALIDAR",
   "maps": "https://maps.app.goo.gl/Dm8y2A89JPuAiAqu5",
   "tone": "cercano y claro",
   "site_image": "site/assets/img/client/centro-img1.webp",
   "open": true
  },
  {
   "id": "las-americas",
   "name": "Las Américas",
   "address": "Av. Insurgentes 20, Fracc. Las Américas, 55075 Ecatepec de Morelos, Estado de México",
   "reference": "Dentro de Plaza Paseo Ventura, planta baja, a un lado de Starbucks",
   "maps": "https://maps.app.goo.gl/xYkpSoWCvEM177QV6",
   "extras": "Recovery Zone by Kontrast (sauna, cold plunge, HBOT 1.5 ATA, presoterapia, light therapy)",
   "tone": "personal y sobrio",
   "naming_rule": "Decir 'Las Américas', nunca 'Centro de Las Américas'",
   "site_image": "site/assets/img/client/centro-img2.webp",
   "open": true
  },
  {
   "id": "lindavista",
   "name": "Lindavista",
   "address": "Av. Fortuna 334, Piso 2, Local SSC03, Magdalena de las Salinas, Gustavo A. Madero, 07760 CDMX",
   "reference": "Dentro de Plaza Encuentro Fortuna, segundo piso, frente al restaurante 'Perros y Burros'",
   "maps": "https://maps.app.goo.gl/1UyFZZoxRfR5dFGJ9",
   "maps_on_site": "https://maps.app.goo.gl/KK5LwJUB1TDxm34i8",
   "extras": "Ortopedia, nutrición, psicología, Kontrast (vibroacústica, PEMF, HBOT 1.3 ATA), equipos Medical (BTL Spinal, SIS, LightForce)",
   "tone": "preciso y profesional",
   "site_image": "site/assets/img/client/centro-img3.webp",
   "open": true
  },
  {
   "id": "condesa",
   "name": "Condesa",
   "status": "Apertura mayo (según brief del coordinador) — VALIDAR fecha, dirección y servicios; no aparece en phyx.mx ni en el Master",
   "open": false
  }
 ],
 "hours_text": {
  "general": "Lunes a viernes 09:00–21:00 · Sábado y domingo 09:00–18:00",
  "lunch": "14:00–15:00 (solo fin de semana; algunos servicios limitados)",
  "holidays": "puede variar; confirmar antes",
  "note": "Horario por centro no especificado — VALIDAR (brandbook mockup muestra 6:00–17:00, es ejemplo de diseño)",
  "source": "DOCUMENTO MASTER"
 },
 "services": [
  {
   "id": "btl-combo",
   "name": "Electroterapia y ultrasonido",
   "equipment": "BTL Combo Premium",
   "category": "Rehabilitación",
   "description_source": "Modalidades de electroterapia empleadas para la relajación muscular, disminución del dolor y control de la inflamación en lesiones músculo esqueléticas.",
   "centers": [
    "Ecatepec",
    "Las Américas",
    "Lindavista"
   ],
   "application_time": "Ultrasonido 5-10 min; electroterapia 15-30 min",
   "follow_up": "1-2 meses",
   "indications_source": [
    "Esguinces",
    "Luxaciones",
    "Fracturas",
    "Post operados",
    "Desgarros musculares",
    "Contracturas",
    "Lumbalgias",
    "Hombro doloroso"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "session_tier": "Básica"
  },
  {
   "id": "btl-5000-magneto",
   "name": "Magnetoterapia",
   "equipment": "BTL 5000 Combo",
   "category": "Rehabilitación",
   "description_source": "Modalidad terapéutica basada en ondas electromagnéticas empleada para la regeneración de tejidos (hueso, tendón, ligamento y músculo).",
   "centers": [
    "Ecatepec"
   ],
   "application_time": "30 min",
   "follow_up": "1 mes",
   "indications_source": [
    "Fracturas",
    "Esguinces",
    "Osteoporosis",
    "Lesión de ligamentos",
    "Desgarros musculares"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "compliance_note": "'regeneración de tejidos' = claim terapéutico; suavizar"
  },
  {
   "id": "redcord-neurac",
   "name": "Redcord Neurac (activación neuromuscular clínica)",
   "equipment": "Redcord",
   "category": "Rehabilitación",
   "description_source": "Método de rehabilitación activa que utiliza suspensión con cuerdas y arneses para reactivar músculos profundos, mejorar el control neuromuscular y reducir el dolor mediante movimiento.",
   "centers": [
    "Ecatepec",
    "Las Américas",
    "Lindavista"
   ],
   "application_time": "30 min",
   "follow_up": "1-2 meses",
   "indications_source": [
    "Lumbalgias crónicas",
    "Cervicalgia",
    "Síndromes de hombro doloroso",
    "Post-operados (rodilla, cadera y columna)",
    "Desórdenes músculo esqueléticos y posturales"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "session_tier": "Premium"
  },
  {
   "id": "ondas-choque",
   "name": "Ondas de choque radiales",
   "equipment": "BTL SWT Magnum, Zimmer EmPulse",
   "category": "Rehabilitación",
   "description_source": "Ondas acústicas de alta potencia principalmente empleadas para la recuperación de tejidos degenerados o calcificados.",
   "centers": [
    "Ecatepec",
    "Las Américas",
    "Lindavista"
   ],
   "application_time": "20 min",
   "follow_up": "1-2 meses",
   "indications_source": [
    "Fascitis plantar",
    "Espolón calcáneo",
    "Tendinopatías crónicas",
    "Contracturas musculares",
    "Epicondilitis"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "session_tier": "Premium"
  },
  {
   "id": "gimnasio-terapeutico",
   "name": "Área de readaptación / gimnasio terapéutico",
   "equipment": "Pesas, poleas, caminadora (Rehabmill), Redcord Active, cancha, cicloergómetro (PhysioMax), Speediance, Mad-Up Pro",
   "category": "Readaptación",
   "description_source": "Área de entrenamiento enfocada en rehabilitación física y readaptación deportiva, con el objetivo del fortalecimiento, la funcionalidad y la reintegración del paciente a la vida cotidiana y/o deportiva.",
   "centers": [
    "Ecatepec",
    "Las Américas",
    "Lindavista"
   ],
   "application_time": "20-30 min",
   "follow_up": "Variable",
   "indications_source": [
    "Atrofia muscular",
    "Post-operados",
    "Pacientes geriátricos",
    "Pacientes ortopédicos",
    "Pacientes neurológicos",
    "Estimulación temprana"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf"
  },
  {
   "id": "termoterapia",
   "name": "Termoterapia (compresas calientes)",
   "equipment": "—",
   "category": "Rehabilitación",
   "description_source": "Modalidad terapéutica que proporciona disminución del dolor y relajación de tejido.",
   "centers": [
    "Ecatepec",
    "Las Américas",
    "Lindavista"
   ],
   "application_time": "15 min",
   "follow_up": "1-2 meses",
   "indications_source": [
    "Contracturas y espasmos musculares",
    "Lesiones crónicas",
    "Rigidez articular",
    "Artritis reumatoide"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf"
  },
  {
   "id": "btl-trt-tecar",
   "name": "Radiofrecuencia selectiva (tecarterapia)",
   "equipment": "BTL-TRT",
   "category": "Rehabilitación",
   "description_source": "Ondas electromagnéticas de radiofrecuencia que generan calor en el tejido para favorecer su relajación.",
   "centers": [
    "Las Américas"
   ],
   "application_time": "10-20 min",
   "follow_up": "1 mes",
   "indications_source": [
    "Contracturas musculares",
    "Tendinopatías",
    "Rigidez articular",
    "Lesión de ligamentos",
    "Lumbalgias",
    "Cervicalgia",
    "Fascitis plantar"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "compliance_note": "fuente dice 'regeneración celular' — no usar"
  },
  {
   "id": "sensopro",
   "name": "Sensopro Trainer (entrenamiento propioceptivo-neuromotor)",
   "equipment": "SensoPro",
   "category": "Readaptación / Performance",
   "description_source": "Estación de entrenamiento en plataforma inestable enfocada en equilibrio, fuerza, control postural y coordinación, integrando estímulo cognitivo durante el movimiento. Entrena al cuerpo a mantenerse estable y reaccionar mejor mientras se mueve.",
   "centers": [
    "Las Américas",
    "Lindavista"
   ],
   "application_time": "10-20 min",
   "follow_up": "1-2 meses",
   "indications_source": [
    "Adultos mayores",
    "Deportistas",
    "Rehabilitación de lesiones músculo-esqueléticas",
    "Problemas de coordinación y equilibrio"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "session_tier": "Premium"
  },
  {
   "id": "presoterapia",
   "name": "Presoterapia",
   "equipment": "Air Relax, Normatec, Elevè Health, Hyperice",
   "category": "Recovery",
   "description_source": "Sistema de compresión neumática enfocado a la recuperación muscular y la circulación.",
   "centers": [
    "Ecatepec",
    "Las Américas",
    "Lindavista"
   ],
   "application_time": "15-20 min",
   "follow_up": "Según evolución",
   "indications_source": [
    "Problemas circulatorios",
    "Edema post-quirúrgico",
    "Post entrenamiento deportivo",
    "Linfedema",
    "Neuropatías crónicas",
    "Fibromialgia"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "session_tier": "Básica / Recovery"
  },
  {
   "id": "compex",
   "name": "Electroestimulación inalámbrica",
   "equipment": "Compex",
   "category": "Rehabilitación / Performance",
   "description_source": "Electroestimulación inalámbrica para facilitar el fortalecimiento y recuperación muscular en sesiones activas.",
   "centers": [
    "Lindavista"
   ],
   "application_time": "15-30 min",
   "follow_up": "Según evolución",
   "indications_source": [
    "Post-quirúrgico",
    "Pre-entrenamiento deportivo",
    "Debilidad muscular",
    "Contracturas musculares",
    "Dolor post entrenamiento"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "session_tier": "Básica"
  },
  {
   "id": "game-ready",
   "name": "Crio-compresión",
   "equipment": "Game Ready",
   "category": "Recovery / Rehabilitación",
   "description_source": "Compresión neumática con frío modulable (7 a 1 °C) para pacientes ortopédicos y deportivos.",
   "centers": [
    "Las Américas",
    "Lindavista"
   ],
   "application_time": "20-30 min",
   "follow_up": "2-4 semanas",
   "indications_source": [
    "Edema post-entrenamiento",
    "Post-quirúrgico",
    "Esguinces",
    "Traumatismos",
    "Luxaciones"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf"
  },
  {
   "id": "percusion",
   "name": "Terapia de percusión",
   "equipment": "Theragun, Hypervolt",
   "category": "Recovery",
   "description_source": "Dispositivo de masaje por percusión (hasta 3,200 percusiones por minuto) para calentamiento o relajación muscular.",
   "centers": [
    "Ecatepec",
    "Las Américas",
    "Lindavista"
   ],
   "application_time": "15-20 min",
   "follow_up": "1 mes",
   "indications_source": [
    "Contracturas",
    "Dolor muscular",
    "Lumbalgias",
    "Cervicalgia",
    "Epicondilitis",
    "Fascitis plantar"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "compliance_note": "fuente dice 'alivio inmediato del dolor' — no usar"
  },
  {
   "id": "redcord-active",
   "name": "Redcord Active (activación neuromuscular funcional)",
   "equipment": "Redcord",
   "category": "Performance / Readaptación",
   "description_source": "Sistema de entrenamiento con cuerdas y ligas que activa cadenas musculares para dar mayor movilidad y control del movimiento.",
   "centers": [
    "Las Américas",
    "Lindavista"
   ],
   "application_time": "30 min",
   "follow_up": "1 mes",
   "indications_source": [
    "Deportistas",
    "Adultos mayores",
    "Desbalances musculares",
    "Acondicionamiento físico",
    "Prevención de lesiones"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf"
  },
  {
   "id": "kinesiotaping",
   "name": "Vendaje neuromuscular (kinesiotaping)",
   "equipment": "—",
   "category": "Rehabilitación",
   "description_source": "Técnica de vendaje para disminuir la tensión muscular y dar estabilidad articular.",
   "centers": [
    "Ecatepec",
    "Las Américas",
    "Lindavista"
   ],
   "application_time": "10 min",
   "follow_up": "2-4 semanas",
   "indications_source": [
    "Edema posquirúrgico",
    "Esguinces",
    "Tensión muscular",
    "Contracturas",
    "Luxaciones",
    "Epicondilitis",
    "Fascitis plantar"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf"
  },
  {
   "id": "mad-up",
   "name": "Restricción del flujo sanguíneo (BFR)",
   "equipment": "Mad-Up Pro",
   "category": "Readaptación",
   "description_source": "Ejercicio con torniquete neumático que ocluye parcialmente el flujo sanguíneo para trabajar fuerza con muy baja carga.",
   "centers": [
    "Las Américas",
    "Lindavista"
   ],
   "application_time": "20 min",
   "follow_up": "1-2 meses",
   "indications_source": [
    "Deportistas",
    "Post quirúrgicos",
    "Pacientes geriátricos"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "session_tier": "Premium"
  },
  {
   "id": "btl-sis",
   "name": "SIS — Sistema Super Inductivo",
   "equipment": "BTL-SIS",
   "category": "Rehabilitación",
   "description_source": "Campo electromagnético de alta intensidad (hasta 2.5 Teslas) que despolariza nervios periféricos y desencadena contracciones musculares; se usa para control del dolor, relajación y estimulación muscular.",
   "centers": [
    "Lindavista"
   ],
   "application_time": "10-15 min",
   "follow_up": "1 mes",
   "indications_source": [
    "Lumbalgias",
    "Espasmos y contracturas",
    "Bloqueos articulares",
    "Neuropatías crónicas",
    "Fibromialgia",
    "Hemiparesia",
    "Posquirúrgico",
    "Debilidad muscular"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "session_tier": "Medical",
   "compliance_note": "fuente: 'una de las tecnologías más potentes del mundo', 'curación de fracturas', 'repara nervios' — NO usar; phyx.mx Las Américas photos show SIS DUO in Las Américas (Drive folder 'PHYX-SIS Las Américas') vs catálogo 'Lindavista' -> VALIDAR"
  },
  {
   "id": "btl-spinal",
   "name": "Descompresión vertebral robotizada",
   "equipment": "BTL-Spinal",
   "category": "Rehabilitación",
   "description_source": "Terapia mecánica con fuerzas de descompresión automáticas para movilizar articulaciones y liberar presión sobre estructuras de la columna; opción de tratamiento no quirúrgico.",
   "centers": [
    "Lindavista"
   ],
   "application_time": "30 min",
   "follow_up": "1 mes",
   "indications_source": [
    "Hernias de disco",
    "Hipomovilidad articular",
    "Radiculopatías",
    "Síndrome facetario",
    "Lumbalgias",
    "Dolor de cuello"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "session_tier": "Medical",
   "compliance_note": "no decir 'evita cirugías'"
  },
  {
   "id": "medestec",
   "name": "Diatermia profunda",
   "equipment": "Medestec",
   "category": "Rehabilitación",
   "description_source": "Electroterapia que genera calor profundo mediante electrodos especiales.",
   "centers": [
    "Lindavista",
    "Ecatepec"
   ],
   "application_time": "15-20 min",
   "follow_up": "1 mes",
   "indications_source": [
    "Contracturas",
    "Tendinopatías",
    "Rigidez articular",
    "Lesión de ligamentos",
    "Lumbalgias",
    "Cervicalgia",
    "Post quirúrgicos"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf"
  },
  {
   "id": "btl-hil",
   "name": "Láser de alta intensidad",
   "equipment": "BTL HIL 12W",
   "category": "Rehabilitación",
   "description_source": "Láser terapéutico de alta intensidad para bioestimulación.",
   "centers": [
    "Las Américas"
   ],
   "application_time": "5-10 min",
   "follow_up": "1-2 meses",
   "indications_source": [
    "Esguinces",
    "Lesiones musculares",
    "Dolor de espalda agudo",
    "Lesiones deportivas"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf"
  },
  {
   "id": "blazepod",
   "name": "Entrenamiento neuromotor / cognitivo",
   "equipment": "BlazePod",
   "category": "Readaptación / Performance",
   "description_source": "Luces LED inalámbricas controladas por app que dan señales visuales para trabajar reacción, agilidad, coordinación y toma de decisiones.",
   "centers": [
    "Ecatepec",
    "Las Américas",
    "Lindavista"
   ],
   "application_time": "15 min",
   "follow_up": "Últimas fases de rehabilitación / readaptación",
   "indications_source": [
    "Rehabilitación de lesiones ortopédicas",
    "Readaptación deportiva"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf"
  },
  {
   "id": "hbot",
   "name": "Cámara hiperbárica (HBOT)",
   "equipment": "Las Américas: cámara 1.5 ATA · Lindavista: cámara suave 1.3 ATA",
   "category": "Recovery",
   "description_source": "Sesión dentro de una cámara presurizada que permite que el oxígeno adicional se disuelva en el plasma sanguíneo.",
   "centers": [
    "Las Américas",
    "Lindavista"
   ],
   "application_time": "60 min",
   "follow_up": "1-2 meses",
   "indications_source": [
    "Lesiones deportivas",
    "Recuperación postquirúrgica",
    "Reducción de la fatiga"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "compliance_note": "fuente lista úlceras diabéticas, quemaduras, heridas crónicas -> NO usar (claims médicos); catálogo dice 1.3 ATA en ambos, Master 1.5 en Las Américas -> VALIDAR"
  },
  {
   "id": "mdurance",
   "name": "Electromiografía de superficie (evaluación)",
   "equipment": "mDurance",
   "category": "Evaluación",
   "description_source": "Mide la actividad eléctrica del músculo en reposo y en movimiento con electrodos autoadheribles y software en tiempo real, para evaluar desbalances musculares.",
   "centers": [
    "Lindavista"
   ],
   "application_time": "20-30 min",
   "follow_up": "Evaluación inicial y revaloración (1-3 meses)",
   "indications_source": [
    "Persistencia de lesiones",
    "Control motor"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "compliance_note": "sustenta 'Medimos, no adivinamos'"
  },
  {
   "id": "winback",
   "name": "Tecarterapia multifrecuencia",
   "equipment": "Winback 3TX Trolley",
   "category": "Rehabilitación",
   "description_source": "Combina tres corrientes terapéuticas: TECAR, Hi-TENS y Hi-EMS.",
   "centers": [
    "Lindavista"
   ],
   "application_time": "10-15 min",
   "follow_up": "1 mes",
   "indications_source": [
    "Contracturas",
    "Tendinopatías",
    "Rigidez articular",
    "Lumbalgias",
    "Cervicalgia",
    "Post quirúrgicos"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "session_tier": "Premium"
  },
  {
   "id": "speediance",
   "name": "Resistencia digital",
   "equipment": "Speediance Gym Monster 2",
   "category": "Performance / Readaptación",
   "description_source": "Equipo de entrenamiento inteligente para fuerza y movilidad con resistencia digital, personalizable según fase de rehabilitación y tolerancia del paciente.",
   "centers": [
    "Lindavista",
    "Las Américas"
   ],
   "application_time": "15-30 min",
   "follow_up": "1 mes",
   "indications_source": [
    "Post-rehabilitación",
    "Readaptación",
    "Adulto mayor activo",
    "Deportivo en retorno"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "session_tier": "Premium"
  },
  {
   "id": "lightforce",
   "name": "Láser de alta potencia con feedback",
   "equipment": "LightForce 25W XPi",
   "category": "Rehabilitación",
   "description_source": "Láser de alta potencia; el sistema XPi da retroalimentación al terapeuta en tiempo real para una aplicación homogénea.",
   "centers": [
    "Lindavista"
   ],
   "application_time": "5-10 min",
   "follow_up": "1 mes",
   "indications_source": [
    "Lumbalgias y cervicalgias",
    "Lesiones musculares y deportivas",
    "Tendinopatías",
    "Dolor post-quirúrgico",
    "Artrosis"
   ],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "session_tier": "Medical",
   "compliance_note": "fuente: 'sin dolor y sin efectos secundarios' — NO usar"
  },
  {
   "id": "vibroacustica",
   "name": "Terapia vibroacústica",
   "equipment": "Cama vibroacústica",
   "category": "Recovery (Kontrast)",
   "description_source": "Sonido y vibraciones suaves para relajación.",
   "centers": [
    "Lindavista"
   ],
   "application_time": "30 min",
   "follow_up": "Uso específico / continuo",
   "indications_source": [],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf"
  },
  {
   "id": "light-therapy",
   "name": "Terapia de luz (roja, infrarroja, azul) / máscara LED",
   "equipment": "Panel de luz",
   "category": "Recovery (Kontrast)",
   "description_source": "Luz roja, infrarroja y azul como parte de la recuperación después del esfuerzo.",
   "centers": [
    "Las Américas",
    "Lindavista"
   ],
   "application_time": "15-30 min",
   "follow_up": "Uso específico / continuo",
   "indications_source": [],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "compliance_note": "fuente: 'recarga de ATP', 'células se reparan mejor' — NO usar"
  },
  {
   "id": "pemf",
   "name": "Terapia de energía celular (PEMF baja frecuencia)",
   "equipment": "PEMF LF",
   "category": "Recovery (Kontrast)",
   "description_source": "Campos magnéticos suaves y lentos de baja potencia.",
   "centers": [
    "Lindavista"
   ],
   "application_time": "20-30 min",
   "follow_up": "Uso específico / continuo",
   "indications_source": [],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf",
   "compliance_note": "evitar claims de metabolismo/reparación"
  },
  {
   "id": "sauna",
   "name": "Sauna (infrarrojo)",
   "equipment": "—",
   "category": "Recovery (Kontrast)",
   "description_source": "Exposición controlada al calor.",
   "centers": [
    "Las Américas"
   ],
   "application_time": "30 min",
   "follow_up": "—",
   "indications_source": [],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf"
  },
  {
   "id": "cold-plunge",
   "name": "Cold plunge / terapia de contraste (Kontrast Therapy)",
   "equipment": "Tinas de agua fría",
   "category": "Recovery (Kontrast)",
   "description_source": "Contraste calor (sauna) + frío (cold plunge), sesión social o privada.",
   "centers": [
    "Las Américas"
   ],
   "application_time": "60 min",
   "follow_up": "—",
   "indications_source": [],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf"
  },
  {
   "id": "deep-tissue",
   "name": "Masaje Deep Tissue",
   "equipment": "Manual + IASTM (a domicilio)",
   "category": "Recovery",
   "description_source": "Masaje profundo orientado al rendimiento deportivo.",
   "centers": [
    "Ecatepec",
    "Las Américas",
    "Lindavista",
    "Domicilio"
   ],
   "application_time": "60 min",
   "follow_up": "—",
   "indications_source": [],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf"
  },
  {
   "id": "puncion-seca",
   "name": "Punción seca",
   "equipment": "—",
   "category": "Rehabilitación (adicional)",
   "description_source": "Servicio adicional (25 min aprox.).",
   "centers": [
    "Ecatepec",
    "Las Américas",
    "Lindavista"
   ],
   "application_time": "25 min",
   "follow_up": "—",
   "indications_source": [],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf"
  },
  {
   "id": "breathwork",
   "name": "Breathwork",
   "equipment": "—",
   "category": "Recovery (Kontrast)",
   "description_source": "Próximamente en Las Américas (Master).",
   "centers": [
    "Las Américas (próximamente)"
   ],
   "application_time": "—",
   "follow_up": "—",
   "indications_source": [],
   "source": "Drive: DOCUMENTO MASTER-PHYX2026 v3.docx (1Or42UjwoTdBI0cPER1ZjQ5KHTTq1xMGS, upd 2026-11-26) + CATALOGO TECNOLOGIAS 2026-PHYX.pdf"
  }
 ],
 "session_tiers": [
  {
   "tier": "Rehabilitación Básica",
   "technologies": [
    "Combo BTL (electroterapia + ultrasonido)",
    "Presoterapia Hyperice",
    "Caminadora Rehabmill",
    "Cicloergómetro PhysioMax",
    "Electroestimulación Compex"
   ],
   "duration": "60 min aprox."
  },
  {
   "tier": "Rehabilitación Premium",
   "technologies": [
    "(incluye Básica)",
    "Sensopro",
    "Speediance",
    "Mad-Up Pro (BFR)",
    "Redcord Neurac",
    "Winback tecarterapia multifrecuencia",
    "Ondas de choque BTL"
   ],
   "duration": "60 min aprox."
  },
  {
   "tier": "Rehabilitación Medical",
   "technologies": [
    "(incluye Básica + Premium)",
    "BTL Spinal (descompresión robotizada)",
    "BTL SIS (sistema super inductivo)",
    "Láser LightForce"
   ],
   "duration": "60 min aprox.",
   "available": [
    "Las Américas",
    "Lindavista"
   ]
  }
 ],
 "plans": [
  {
   "id": "promo-primera-vez",
   "name": "Promoción primera vez",
   "on_phyx_mx": "Desde $1,199 MXN",
   "price_by_center": {
    "Ecatepec": 1199,
    "Las Américas": 1299,
    "Lindavista": 1499
   },
   "includes": [
    "Consulta de valoración por fisioterapia (45 min aprox.)",
    "1 sesión Recovery (50-60 min aprox.)",
    "1 sesión de rehabilitación o masaje Deep Tissue (60 min aprox.)"
   ],
   "rules": [
    "No presentar como 'precio de valoración'",
    "Campaña B (consideración/remarketing) CTA 'Conoce la experiencia'"
   ],
   "source": "phyx.mx + DOCUMENTO MASTER + Figma Camp Primera Cita"
  },
  {
   "id": "paquete-ortopedia",
   "name": "Paquete Ortopedia check",
   "on_phyx_mx": "Desde $1,999 MXN",
   "price": 1999,
   "centers": [
    "Lindavista"
   ],
   "includes": [
    "Consulta de valoración por Traumatología y Ortopedia (45 min aprox.)",
    "Seguimiento de Traumatología y Ortopedia (30 min aprox.)",
    "Consulta de valoración por fisioterapia + sesión muestra (60 min aprox.)"
   ],
   "source": "phyx.mx + DOCUMENTO MASTER"
  },
  {
   "id": "active-performance",
   "name": "Membresía Performance — Active Performance",
   "on_phyx_mx": "Membresía Performance desde $2,199 MXN",
   "price_month": 2199,
   "centers": [
    "Las Américas",
    "Lindavista"
   ],
   "includes": [
    "4 sesiones Performance (fuerza, potencia, estabilidad, técnica, resistencia)",
    "Evaluación funcional mensual",
    "Plan de entrenamiento personalizado"
   ]
  },
  {
   "id": "advance-performance",
   "name": "Membresía Performance — Advance Performance",
   "price_month": 3999,
   "centers": [
    "Las Américas",
    "Lindavista"
   ],
   "includes": [
    "8 sesiones Performance",
    "Evaluación funcional mensual",
    "Plan de entrenamiento personalizado"
   ],
   "variants": {
    "Sport Training": "8 sesiones (fuerza, potencia, estabilidad, técnica, resistencia) + evaluación funcional mensual + plan",
    "Mayor Training (adultos mayores / geriátricos)": "8 sesiones (fuerza básica, equilibrio, prevención de caídas, movilidad suave) + evaluación funcional mensual + plan"
   },
   "note": "Master lists Advance in Las Américas with 'fuerza básica, equilibrio...' (Mayor) and in Lindavista with 'fuerza, potencia...' — VALIDAR"
  },
  {
   "id": "wellness-las-americas",
   "name": "Membresías Recovery Wellness — Kontrast by PHYX (Las Américas)",
   "tiers": [
    {
     "name": "Base",
     "price_month": 1299,
     "includes": [
      "2 sesiones Recovery",
      "1 acceso a tecnologías (presoterapia, máscara LED, Light Therapy)",
      "1 acceso mensual a Kontrast Therapy (sauna + cold plunge)"
     ]
    },
    {
     "name": "Flow",
     "price_month": 2199,
     "includes": [
      "4 sesiones Recovery",
      "1 acceso semanal a tecnologías",
      "1 acceso semanal a Kontrast",
      "1 Deep Tissue",
      "15% en HBOT",
      "Plan Recovery"
     ]
    },
    {
     "name": "Peak",
     "price_month": 3499,
     "includes": [
      "8 sesiones Recovery",
      "Tecnologías ilimitadas",
      "Kontrast ilimitado",
      "2 Deep Tissue",
      "2 HBOT 1.5 ATA",
      "Plan Recovery"
     ]
    }
   ],
   "addons": {
    "Kontrast (Flow)": 449,
    "Deep Tissue (Flow/Peak)": 399,
    "Cámara hiperbárica (Peak)": 399
   }
  },
  {
   "id": "wellness-lindavista",
   "name": "Membresías Wellness — Kontrast (Lindavista)",
   "tiers": [
    {
     "name": "Base",
     "price_month": 1999,
     "includes": [
      "2 sesiones Recovery",
      "2 accesos a tecnologías (presoterapia, electroterapia, light therapy, vibroacústica, energía celular)"
     ]
    },
    {
     "name": "Flow",
     "price_month": 2499,
     "includes": [
      "4 sesiones Recovery",
      "1 acceso semanal a tecnologías",
      "1 Deep Tissue",
      "15% en HBOT",
      "Plan Performance Recovery"
     ]
    },
    {
     "name": "Peak",
     "price_month": 3499,
     "includes": [
      "8 sesiones Recovery",
      "Tecnologías ilimitadas",
      "2 Deep Tissue",
      "2 HBOT 1.3 ATA",
      "Plan Performance Recovery"
     ]
    }
   ],
   "addons": {
    "Deep Tissue (Flow/Peak)": 399,
    "Cámara hiperbárica (Peak)": 399
   },
   "note": "Precios docx (Ajuste Daniel) names tiers Base $1,999 / Peak $2,499 / Flow $3,499 (swapped) — Master v3 uses Base/Flow/Peak. VALIDAR"
  },
  {
   "id": "nutricion",
   "name": "Paquetes Nutrición PHYX (Lindavista)",
   "items": [
    {
     "name": "PHYX Metabolic Reset (8 semanas)",
     "price": 3800
    },
    {
     "name": "PHYX Recovery Nutrition (6 semanas)",
     "price": 2500
    },
    {
     "name": "PHYX Performance Fuel (4 semanas)",
     "price": 2600
    },
    {
     "name": "Programa de optimización — Ciclo 2 (4 semanas)",
     "price": 1200
    },
    {
     "name": "Mantenimiento activo — Ciclo 3 (30 días)",
     "price": 899
    }
   ]
  },
  {
   "id": "domicilio",
   "name": "PHYX a domicilio",
   "ranges": {
    "EDOMEX alto": {
     "valoracion": 800,
     "sesion": 1000,
     "10": 9000,
     "20": 17000
    },
    "EDOMEX medio": {
     "valoracion": 800,
     "sesion": 900,
     "10": 8100,
     "20": 15300
    },
    "EDOMEX corto (Tulpetlac, Amp. Tulpetlac, Ejidos de Tulpetlac, Nuevo Laredo, San Carlos)": {
     "valoracion": 700,
     "sesion": 800,
     "10": 7200,
     "20": 13600
    },
    "CDMX norte": {
     "valoracion": 900,
     "sesion": 1200,
     "10": 10800,
     "20": 20400
    },
    "CDMX centro": {
     "valoracion": 1000,
     "sesion": 1400,
     "10": 12600,
     "20": 23800
    }
   },
   "package_benefits": [
    "Descuento en consulta de valoración por Ortopedia y Nutrición (Lindavista)",
    "Revaloración fisioterapéutica",
    "Sesión de cortesía en el centro más cercano (según necesidad)",
    "Kit de regalo (bandas de resistencia + pelota)"
   ],
   "recovery_domicilio": {
    "includes": [
     "Kinesiotaping",
     "Pistola de percusión",
     "Presoterapia",
     "Electroterapia",
     "Camilla portátil"
    ],
    "price": {
     "EDOMEX": 700,
     "CDMX": 800,
     "CDMX centro-sur": 1000
    }
   },
   "deep_tissue_domicilio": {
    "price": {
     "EDOMEX": 1000,
     "CDMX": 1200,
     "CDMX centro-sur": 1400
    }
   },
   "audience_note": "Notion: pacientes 45+ / decide hijo(a)"
  },
  {
   "id": "integra-salud",
   "name": "Lista de precios Integra Salud 2026 (convenio)",
   "items": {
    "servicio_inicial": 900,
    "basica": 680,
    "premium": 900,
    "medical": 1100,
    "nutricion": 800,
    "ortopedia": 1150
   },
   "note": "no publicar sin aprobación"
  }
 ],
 "prices_by_center": {
  "Ecatepec": {
   "valoracion_fisio_45min": 600,
   "rehab_basica": 600,
   "rehab_premium": 800,
   "recovery_60": 500,
   "deep_tissue": 700,
   "paquetes": {
    "10_basica": 5400,
    "10_premium": 7200,
    "20_basica": 10200,
    "20_premium": 13600
   },
   "adicionales": {
    "vendaje_neuromuscular": 200,
    "puncion_seca": 300
   }
  },
  "Las Américas": {
   "valoracion_fisio_45min": 700,
   "rehab_basica": 700,
   "rehab_premium": 1000,
   "rehab_medical": 1400,
   "deep_tissue": 800,
   "performance_training_50min": 700,
   "paquetes": {
    "10_basica": 6300,
    "10_premium": 9000,
    "20_basica": 11900,
    "20_premium": 17000
   },
   "recovery_zone_kontrast": {
    "test_inicial_mas_sesion": 700,
    "sesion_recovery_60": 700,
    "kontrast_social_60": 500,
    "kontrast_privado_1a4": 2500,
    "kontrast_addon_por_persona": 500,
    "presoterapia_led_30": 300,
    "hbot_1_5ATA_60": 600,
    "sauna_30": 400,
    "cold_plunge_30": 400,
    "light_therapy_30": 300,
    "hbot_paquetes": {
     "5": 2500,
     "10": 4500,
     "20": 8000
    }
   },
   "adicionales": {
    "vendaje_neuromuscular": 200,
    "puncion_seca": 400
   }
  },
  "Lindavista": {
   "valoracion_fisio_45min": 900,
   "rehab_basica": 1000,
   "rehab_premium": 1400,
   "rehab_medical": 1700,
   "deep_tissue": 1000,
   "performance_training_50min": 900,
   "paquetes": {
    "10_basica": 9000,
    "10_premium": 12600,
    "10_medical": 15300,
    "20_basica": 17000,
    "20_premium": 23800,
    "20_medical": 28900
   },
   "especialidad": {
    "ortopedia_traumatologia_45": 1300,
    "consulta_medica_nutricional_90": 1200,
    "nutricion_clinica_deportiva_45": 900,
    "psicologia_clinica_60": 900
   },
   "kontrast": {
    "sesion_recovery_60": 800,
    "presoterapia_led_30": 300,
    "hbot_1_3ATA_60": 650,
    "light_therapy_25": 300,
    "vibroacustica_30": 650,
    "energia_celular_30": 350,
    "hbot_paquetes": {
     "3": 1800,
     "5": 2750,
     "10": 5000,
     "20": 9000
    }
   },
   "adicionales": {
    "vendaje_neuromuscular": 300,
    "puncion_seca": 500
   }
  }
 },
 "insurers_platforms": {
  "convenio_directo": [
   "Peacock",
   "Quálitas",
   "Integra Salud",
   "Sura"
  ],
  "reembolso_ejemplos": [
   "MetLife",
   "AXA",
   "GNP",
   "Atlas",
   "Sofía"
  ],
  "platforms": [
   "TotalPass",
   "Wellhub",
   "Fitpass (Beauty Pass)",
   "Sporttips"
  ],
  "rule": "No usar logos de aseguradoras sin autorización (Refresh Home doc) — VALIDAR"
 },
 "testimonials_real": [
  {
   "name": "Rebeca Sosa Ramos",
   "context": "Lesión en el hombro",
   "quote": "...Mi recuperación avanzó muchísimo más de lo que esperaba.",
   "body": "Excelente servicio y atención. Soy paciente de Quálitas y este ha sido un excelente lugar para tomar fisioterapia: está muy bien equipado y la atención es de primera.",
   "avatar": "site/assets/img/client/user-1.webp",
   "source": "phyx.mx",
   "status": "VALIDAR — Notion Refresh Oct-2026 dice 'No hay testimonios verificados (los de la LP son borradores)'; avatar parece stock"
  },
  {
   "name": "Daniel González",
   "context": "Rehabilitación de tobillo",
   "quote": "La atención es excepcional, desde la recepción hasta los terapeutas...",
   "body": "Después de un accidente y una operación en el tobillo, comencé a asistir a Phyx para mi rehabilitación, y ha sido una experiencia muy positiva.",
   "avatar": "site/assets/img/client/user-2.webp",
   "source": "phyx.mx",
   "status": "VALIDAR — mismo caso"
  }
 ],
 "hours": {
  "1": [
   "09:00",
   "21:00"
  ],
  "2": [
   "09:00",
   "21:00"
  ],
  "3": [
   "09:00",
   "21:00"
  ],
  "4": [
   "09:00",
   "21:00"
  ],
  "5": [
   "09:00",
   "21:00"
  ],
  "6": [
   "09:00",
   "18:00"
  ],
  "0": [
   "09:00",
   "18:00"
  ]
 }
};
  D.byId = {};
  window.PHYX = D;
})();
