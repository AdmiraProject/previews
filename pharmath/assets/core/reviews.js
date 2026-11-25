
(function () {
  const R = [
    { name: 'Mariana G.', age: 29, city: 'CDMX', kit: 'kit-salud-sexual', rating: 4.9, src: 'google', date: 'hace 2 semanas', photo: 'img/people/real/p01.jpg',
      title: 'Discreto de principio a fin', quote: 'Llegó en una caja sin nada que dijera qué era. Hice mi prueba con calma y con el video entendí todo' },
    { name: 'Daniel R.', age: 34, city: 'Guadalajara', kit: 'kit-salud-sexual', rating: 4.8, src: 'facebook', date: 'hace 1 mes', photo: 'img/people/real/p07.jpg',
      title: 'Me quité la pena', quote: 'Me daba pena ir al laboratorio. Aquí lo resolví en privado y por WhatsApp me ayudaron con mis dudas' },
    { name: 'Sofía L.', age: 26, city: 'Monterrey', kit: 'kit-vph-femenino', rating: 4.9, src: 'instagram', date: 'hace 3 semanas', photo: 'img/people/real/p02.jpg',
      title: 'Instrucciones muy claras', quote: 'Las instrucciones son muy claras. Tomé mi muestra en casa y supe exactamente qué hacer después' },
    { name: 'Andrés M.', age: 41, city: 'Puebla', kit: 'kit-de-multidrogas', rating: 4.7, src: 'google', date: 'hace 5 días', photo: 'img/people/real/p08.jpg',
      title: 'Fácil y rápido', quote: 'Todo muy discreto y fácil de usar. En minutos tuve mi resultado. Lo volvería a pedir sin pensarlo' },
    { name: 'Valeria C.', age: 33, city: 'Querétaro', kit: 'kit-de-enfermedades-respiratorias-copia', rating: 4.8, src: 'tiktok', date: 'hace 1 semana', photo: 'img/people/real/p03.jpg',
      title: 'Para toda la familia', quote: 'Con el kit familiar revisamos a todos sin salir de casa cuando mi hijo se enfermó. Súper práctico' },
    { name: 'Laura P.', age: 38, city: 'Mérida', kit: 'kit-salud-femenina', rating: 4.9, src: 'facebook', date: 'hace 2 meses', photo: 'img/people/real/p04.jpg',
      title: 'Me sentí acompañada', quote: 'Tenía miedo de hacerlo sola, pero el soporte por WhatsApp me explicó cada paso con mucha paciencia' },
    { name: 'Jorge H.', age: 45, city: 'León', kit: 'kit-de-enfermedades-respiratorias', rating: 4.7, src: 'x', date: 'hace 3 días', photo: 'img/people/real/p09.jpg',
      title: 'Salí de dudas el mismo día', quote: 'Tenía síntomas y no quería hacer fila. En 15 minutos tuve mi resultado y pude avisar en el trabajo' },
    { name: 'Fernanda T.', age: 24, city: 'CDMX', kit: 'kit-ets-vph-femenino', rating: 4.8, src: 'instagram', date: 'hace 4 semanas', photo: 'img/people/real/p05.jpg',
      title: 'Lo recomiendo a mis amigas', quote: 'Pagué en OXXO, llegó rápido y sin logotipos. El proceso para enviar la muestra fue muy sencillo' }
  ];
  const UGC = [
    { photo: 'img/people/real/u01.jpg', handle: '@mariana.gtz', src: 'instagram', kit: 'kit-salud-sexual', caption: 'Mi primera prueba en casa' },
    { photo: 'img/people/real/u02.jpg', handle: '@vale.cruz', src: 'tiktok', kit: 'kit-de-enfermedades-respiratorias-copia', caption: 'Kit familiar, todos revisados' },
    { photo: 'img/people/real/u03.jpg', handle: '@dani.rmz', src: 'instagram', kit: 'kit-salud-sexual', caption: 'Así de discreto llega' },
    { photo: 'img/people/real/u04.jpg', handle: '@sofi.lpz', src: 'tiktok', kit: 'kit-vph-femenino', caption: 'Autotoma sin estrés' },
    { photo: 'img/people/real/u05.jpg', handle: '@laura.pech', src: 'instagram', kit: 'kit-salud-femenina', caption: 'Me cuido desde casa' },
    { photo: 'img/people/real/u06.jpg', handle: '@jorge.hdz', src: 'tiktok', kit: 'kit-de-enfermedades-respiratorias', caption: 'Resultado en 15 minutos' },
    { photo: 'img/people/real/u07.jpg', handle: '@fer.tov', src: 'instagram', kit: 'kit-ets-vph-femenino', caption: 'Unboxing sin pena' },
    { photo: 'img/people/real/u08.jpg', handle: '@andres.mtz', src: 'tiktok', kit: 'kit-de-multidrogas', caption: 'Fácil de leer' }
  ];
  window.PH_REVIEWS = {
    es: R, ugc: UGC,
    summary: { rating: 4.8, count: '35,500+', label: 'reseñas verificadas', sources: ['google', 'facebook', 'instagram', 'tiktok', 'x'] },
    srcLabel: { google: 'Google', facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', x: 'X' },
    srcLogo: s => `img/social/${s}.svg`
  };
})();
