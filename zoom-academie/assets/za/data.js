/* Zoom Académie — shared data (facts from BRIEF.md only). */
window.ZA = {
  booking: {
    // admissions consultation (VALIDAR destination with client)
    es: 'https://www.zoomacademie.com/reservez-appel-avec-conseiller-dadmission',
    en: 'https://zoomacademy.net/event-planning/'
  },
  products: [
    {
      id: 'event-live', kind: 'consult', price: null, img: 'assets/img/site/Events.jpg', page: 'programa.html',
      es: { name: 'Programa de Organización de Eventos', variant: 'En vivo · 13 semanas', short: '8 módulos, 1 evento real, kit de lanzamiento de $5,000', note: 'El precio y tu plan de pagos se confirman en tu llamada gratuita de 15 min.' },
      en: { name: 'Event Planning Program', variant: 'Live · 13 weeks', short: '8 modules, 1 real event, $5,000 launch kit', note: 'Price and your payment plan are confirmed on your free 15-min call.' }
    },
    {
      id: 'wedding-live', kind: 'consult', price: 1497, plan: { n: 3, each: 549 }, img: 'assets/img/lp/gal-3.webp', url: 'https://zoomacademy.net/wedding-planner/',
      es: { name: 'Wedding Planner', variant: 'En vivo · 6 semanas', short: '12 clases en vivo, plantillas pro y certificado oficial', note: 'O 3 pagos de $549. Se confirma en tu llamada.' },
      en: { name: 'Wedding Planner', variant: 'Live · 6 weeks', short: '12 live classes, pro templates and the official certificate', note: 'Or 3 × $549. Confirmed on your call.' }
    },
    {
      id: 'wedding-essentials', kind: 'paid', price: 197, img: 'assets/img/lp/tab-4.webp', url: 'https://enligne.zoomacademie.com/offers/AGpFoPFw/checkout',
      es: { name: 'Wedding Essentials', variant: 'A tu ritmo · 12 meses', short: 'Curso en video + 25 herramientas descargables', note: 'Tus $197 se acreditan al programa en vivo.' },
      en: { name: 'Wedding Essentials', variant: 'Self-paced · 12 months', short: 'Video course + 25+ downloadable tools', note: 'Your $197 credits toward the live program.' }
    },
    {
      id: 'virtual-events', kind: 'paid', price: 149, img: 'assets/img/site/virtual2.jpg', url: 'https://enligne.zoomacademie.com/offers/HSghVaFg/checkout',
      es: { name: 'Eventos Virtuales', variant: 'A tu ritmo · 12 meses', short: '8 módulos en video, más de 2 h', note: '' },
      en: { name: 'Virtual Events', variant: 'Self-paced · 12 months', short: '8 video modules, 2h+', note: '' }
    },
    {
      id: 'podcast-pro', kind: 'paid', price: 247, img: 'assets/img/site/Podcast.jpg', url: 'https://lancersonpodcast.systeme.io/f6374c57-d677fd11',
      es: { name: 'Podcast Pro', variant: 'A tu ritmo · 12 meses', short: '8 módulos en video, más de 5 h', note: '' },
      en: { name: 'Podcast Pro', variant: 'Self-paced · 12 months', short: '8 video modules, 5h+', note: '' }
    },
    {
      id: 'website', kind: 'paid', price: 427, img: 'assets/img/site/Entrepreneur.jpg', url: 'https://www.wixquebec.com/formation-wix-en-ligne/payment/eyJpbnRlZ3JhdGlvbkRhdGEiOnsicGxhbklkcyI6WyJiNWJmYzRmNy04ZDdhLTRkYjQtOTgyNi1jYjA0N2RhYzZkYTkiXX0sInBsYW5JZCI6ImI1YmZjNGY3LThkN2EtNGRiNC05ODI2LWNiMDQ3ZGFjNmRhOSJ9/?ref=ZOOMACADEMIE',
      es: { name: 'Crea tu sitio web', variant: 'A tu ritmo · 12 meses', short: '36 módulos en video, más de 9 h + bono ChatGPT', note: '' },
      en: { name: 'Create Your Website', variant: 'Self-paced · 12 months', short: '36 video modules, 9h+ + ChatGPT bonus', note: '' }
    }
  ],
  // activation flow questions (from their real enrollment form)
  enroll: {
    goal: {
      es: ['Lanzar mi propia empresa de eventos', 'Trabajar en una agencia o empresa de eventos', 'Organizar eventos para mi empresa o mis proyectos', 'Explorar si los eventos son carrera para mí'],
      en: ['Launch my own event business', 'Work for an agency or event company', 'Run events for my company or my projects', 'Explore whether events could be my career']
    },
    when: {
      es: ['En la próxima cohorte', 'En los próximos 3 meses', 'Este año', 'Solo estoy explorando'],
      en: ['Next cohort', 'Within the next 3 months', 'This year', "I'm just exploring"]
    },
    path: {
      es: ['Emprendedor de eventos', 'Planner corporativo', 'Gestión de eventos in-house','Ruta exploratoria con asesor'],
      en: ['Event entrepreneur', 'Corporate event planner', 'In-house event manager', 'Exploration path with an advisor']
    }
  },
  stats: { grads: '10,000+', since: 2007, rating: '4.8', experts: 35, weeks: 13, modules: 8, kit: '$5,000' },
  gradfest: { students: 800, sales: 35000, profit: 12000 }
};
