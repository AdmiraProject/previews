/* "Lo que opinan nuestros clientes" — shared review data for v1/v2/v3.
   PLACEHOLDER RENDER (Andre, Nov 19): photos are default portraits and the platform/stars are layout placeholders;
   the client replaces photos + reviews with real ones before going live.
   real:true  = quote published on inbasixmedical.com/pages/dm (names/roles from there; still VALIDAR).
   real:false = EJEMPLO text written for the render only — must be replaced before publishing. */
window.IB_REVIEWS = [
  { slug: 'dr-carlos-ramirez', name: 'Dr. Carlos Ramírez', role: 'Ginecólogo Obstetra', group: 'medicos', platform: 'google', stars: 5, real: true,
    quote: 'Gracias al arrendamiento de Inbasix pude abrir mi segunda sucursal sin tocar mis ahorros. El proceso fue increíblemente rápido.' },
  { slug: 'dra-sofia-mendez', name: 'Dra. Sofía Méndez', role: 'Radióloga', group: 'medicos', platform: 'google', stars: 5, real: true,
    quote: 'La asesoría técnica fue clave. No sabía qué ultrasonido elegir y me ayudaron a encontrar la mejor relación costo-beneficio.' },
  { slug: 'dr-luis-torres', name: 'Dr. Luis Torres', role: 'Director Clínico', group: 'medicos', platform: 'facebook', stars: 5, real: true,
    quote: 'Excelente servicio post-venta. Tuvimos una duda con la configuración del equipo y nos atendieron el mismo día.' },
  { slug: 'dra-ana-villalobos', name: 'Dra. Ana Villalobos', role: 'Dermatóloga', group: 'medicos', platform: 'google', stars: 5, real: false,
    quote: 'Fui al showroom a probar el láser antes de comprarlo. Me capacitaron botón por botón y a la semana ya estaba atendiendo pacientes.' },
  { slug: 'mvz-jorge-salinas', name: 'MVZ Jorge Salinas', role: 'Médico Veterinario', group: 'medicos', platform: 'trustpilot', stars: 5, real: false,
    quote: 'Equipamos la clínica veterinaria completa con un solo proveedor. La instalación y la garantía nos dieron mucha tranquilidad.' },
  { slug: 'mariana-cortes', name: 'Mariana Cortés', role: 'Dueña de day spa', group: 'negocios', platform: 'facebook', stars: 5, real: false,
    quote: 'No soy médica y aun así me asesoraron sin presión. Elegimos la aparatología ideal para el spa y la cotización llegó al día siguiente.' },
  { slug: 'ricardo-pena', name: 'Ricardo Peña', role: 'Centro de bienestar', group: 'negocios', platform: 'google', stars: 5, real: false,
    quote: 'El arrendamiento puro nos dejó renovar equipo sin descapitalizarnos. Todo el proceso fue claro desde la primera llamada.' },
  { slug: 'lucia-herrera', name: 'Lucía Herrera', role: 'Cosmetóloga', group: 'negocios', platform: 'trustpilot', stars: 5, real: false,
    quote: 'Me encantó poder ver los equipos funcionando en el showroom. Hablas con expertos de verdad, no con robots.' }
];
window.IB_REVIEW_PLATFORMS = {
  google: { name: 'Google', logo: 'assets/brand/reviews/google-g.svg', starColor: '#FBBC04' },
  facebook: { name: 'Facebook', logo: 'assets/brand/reviews/facebook.svg', starColor: '#FBBC04' },
  trustpilot: { name: 'Trustpilot', logo: 'assets/brand/reviews/trustpilot.svg', starColor: '#00B67A' }
};
