
(function () {
  const R = [
    { name: 'Mariana Gutiérrez', age: 34, centro: 'Lindavista', service: 'Descompresión robótica', rating: 5.0, src: 'google', date: 'hace 2 semanas', photo: 'media/img/people/p01.jpg',
      title: 'Volví a dormir tranquila', quote: 'Llegué con una hernia lumbar y miedo a operarme. Desde la valoración me explicaron todo con mis estudios y hoy hago mi vida normal' },
    { name: 'Jorge Ramírez', age: 67, centro: 'Las Américas', service: 'Membresía adulto mayor', rating: 4.9, src: 'facebook', date: 'hace 1 mes', photo: 'media/img/people/p07.jpg',
      title: 'Me siento más firme al caminar', quote: 'Entreno tres veces por semana con mi fisio. Ya subo escaleras sin agarrarme y mis hijos notan el cambio' },
    { name: 'Daniela Ortiz', age: 28, centro: 'Ecatepec', service: 'Rehabilitación de rodilla', rating: 4.8, src: 'instagram', date: 'hace 3 semanas', photo: 'media/img/people/p02.jpg',
      title: 'De la cirugía a correr otra vez', quote: 'Después de mi ligamento cruzado pensé que no volvería a correr. El plan fue claro semana a semana y ya regresé a mis 5K' },
    { name: 'Ricardo Méndez', age: 41, centro: 'Lindavista', service: 'Paquete Ortopedia', rating: 4.7, src: 'google', date: 'hace 5 días', photo: 'media/img/people/p08.jpg',
      title: 'Ortopedista y fisio en un solo lugar', quote: 'No tuve que ir de consultorio en consultorio. El ortopedista y mi fisioterapeuta revisan mi avance juntos' },
    { name: 'Fernanda Ríos', age: 31, centro: 'Las Américas', service: 'Recovery Zone', rating: 5.0, src: 'tiktok', date: 'hace 1 semana', photo: 'media/img/people/p03.jpg',
      title: 'Mi rutina de recuperación', quote: 'Entreno pesado y la Recovery Zone cambió cómo me siento al día siguiente. El equipo te guía en cada sesión' },
    { name: 'Laura Castañeda', age: 52, centro: 'Ecatepec', service: 'Rehabilitación de hombro', rating: 4.9, src: 'facebook', date: 'hace 2 meses', photo: 'media/img/people/p04.jpg',
      title: 'Atención de primera', quote: 'Desde recepción hasta los terapeutas, todos te tratan con calma. Recuperé el movimiento del hombro antes de lo que esperaba' },
    { name: 'Andrés Salazar', age: 24, centro: 'Lindavista', service: 'Membresía Performance', rating: 4.8, src: 'x', date: 'hace 3 días', photo: 'media/img/people/p09.jpg',
      title: 'Entreno con datos, no a ojo', quote: 'Me miden fuerza y movilidad cada mes. Saber exactamente dónde estoy me motiva a seguir' },
    { name: 'Patricia Luna', age: 59, centro: 'Las Américas', service: 'Cámara hiperbárica', rating: 5.0, src: 'instagram', date: 'hace 4 semanas', photo: 'media/img/people/p05.jpg',
      title: 'Me acompañaron en todo', quote: 'Me explicaron cada tecnología antes de usarla y nunca me sentí un número más. Muy recomendable' },
    { name: 'Héctor Vargas', age: 38, centro: 'Las Américas', service: 'Rehabilitación de espalda', rating: 4.9, src: 'google', date: 'hace 6 días', photo: 'media/img/people/p10.jpg',
      title: 'Por fin entendí mi lesión', quote: 'Me enseñaron mis estudios y el plan sesión por sesión. Saber qué estamos trabajando cambia todo' },
    { name: 'Teresa Morales', age: 70, centro: 'Lindavista', service: 'Membresía adulto mayor', rating: 5.0, src: 'facebook', date: 'hace 3 semanas', photo: 'media/img/people/p12.jpg',
      title: 'Más segura en mi día a día', quote: 'Mi fisio adapta cada ejercicio a mí. Ya camino con más confianza y salgo sola al mercado' }
  ];
  const UGC = [
    { photo: 'media/img/people/u01.jpg', handle: '@fer.rios', src: 'instagram', service: 'Recovery Zone', caption: 'Después del entreno' },
    { photo: 'media/img/people/u02.jpg', handle: '@andres.slz', src: 'tiktok', service: 'Performance', caption: 'Movilidad antes de entrenar' },
    { photo: 'media/img/people/u03.jpg', handle: '@dani.ortiz', src: 'instagram', service: 'Rehabilitación', caption: 'Semana 8 de rodilla' },
    { photo: 'media/img/people/u04.jpg', handle: '@jorge.rmz', src: 'facebook', service: 'Adulto mayor', caption: 'Entreno a los 67' },
    { photo: 'media/img/people/u05.jpg', handle: '@laura.cast', src: 'instagram', service: 'Recovery Zone', caption: 'Mi rato de recuperación' },
    { photo: 'media/img/people/u06.jpg', handle: '@ricardo.mdz', src: 'tiktok', service: 'Performance', caption: 'De vuelta a la pista' }
  ];
  window.PX_REVIEWS = { es: R, ugc: UGC, summary: { rating: 4.9, count: '2,400+', label: 'reseñas verificadas', sources: ['google', 'facebook', 'instagram', 'tiktok', 'x'] },
    srcLabel: { google: 'Google', facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', x: 'X' } };
})();
