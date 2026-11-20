/* Enlace Visual — testimonials data.
 * ⚠️ DESIGN PLACEHOLDERS (sample:true): photos are generated portraits and quotes are illustrative,
 * requested by Andre (Nov 19 2026) to show the visual. Replace with real patient reviews/videos
 * (name, photo, source, quote) before going live. Video loops: assets/video/t-<id>.mp4.
 */
window.EV_REVIEWS = {
  sample: true,
  rating: '5.0',
  videos: [
    { id: 'carmen', name: 'Carmen R.', age: 64, proc: { es: 'Cirugía de catarata', en: 'Cataract surgery' },
      q: { es: 'Volví a leer sin lupa. Me explicaron todo el mismo día y salí con fecha para operarme.', en: 'I can read without a magnifier again. They explained everything the same day and I left with a surgery date.' } },
    { id: 'diego', name: 'Diego M.', age: 31, proc: { es: 'Cirugía refractiva', en: 'Refractive surgery' },
      q: { es: 'Llevaba 15 años con lentes. En una sola visita me dijeron si era candidato y cuánto costaba.', en: 'I wore glasses for 15 years. In one visit they told me if I was a candidate and what it would cost.' } },
    { id: 'roberto', name: 'Roberto S.', age: 71, proc: { es: 'Catarata con lente intraocular', en: 'Cataract with intraocular lens' },
      q: { es: 'Mis hijos me acompañaron y nadie tuvo que pedir el día dos veces. Todo fue en una visita.', en: 'My kids came with me and nobody had to take a second day off. Everything happened in one visit.' } },
    { id: 'valeria', name: 'Valeria T.', age: 27, proc: { es: 'Queratocono', en: 'Keratoconus' },
      q: { es: 'Por fin alguien me explicó qué tenía en palabras normales, sin asustarme.', en: 'Finally someone explained what I had in plain words, without scaring me.' } },
    { id: 'lucia', name: 'Lucía H.', age: 46, proc: { es: 'Valoración oftalmológica', en: 'Comprehensive eye exam' },
      q: { es: 'Me hicieron todos los estudios ahí mismo. No tuve que ir a otro lado.', en: 'They ran every test right there. I didn’t have to go anywhere else.' } },
    { id: 'arturo', name: 'Arturo G.', age: 53, proc: { es: 'Retinopatía diabética', en: 'Diabetic retinopathy' },
      q: { es: 'Con la diabetes me daba miedo revisarme. Salí con un plan claro y fechas de seguimiento.', en: 'With diabetes I was afraid to get checked. I left with a clear plan and follow-up dates.' } }
  ],
  cards: [
    { id: 'patricia', name: 'Patricia L.', src: 'google', when: { es: 'hace 2 semanas', en: '2 weeks ago' }, proc: { es: 'Cirugía de catarata', en: 'Cataract surgery' },
      q: { es: 'Desde que llegué me explicaron cada estudio. La doctora fue muy paciente con todas mis preguntas y me dieron el precio antes de decidir.', en: 'From the moment I arrived they explained every test. The doctor was very patient with all my questions and gave me the price before I decided.' } },
    { id: 'emilio', name: 'Emilio V.', src: 'facebook', when: { es: 'hace 1 mes', en: '1 month ago' }, proc: { es: 'Cirugía refractiva', en: 'Refractive surgery' },
      q: { es: 'Fui a ver si era candidato para dejar los lentes. En la misma cita tuve estudios, diagnóstico y cotización.', en: 'I went to see if I could stop wearing glasses. In the same appointment I got tests, a diagnosis and a quote.' } },
    { id: 'esperanza', name: 'Esperanza M.', src: 'google', when: { es: 'hace 3 semanas', en: '3 weeks ago' }, proc: { es: 'Catarata', en: 'Cataracts' },
      q: { es: 'A mi edad uno tiene miedo. Me trataron con mucho cariño y mi hija pudo estar conmigo en todo momento.', en: 'At my age you get scared. They treated me with so much care and my daughter could be with me the whole time.' } },
    { id: 'daniela', name: 'Daniela P.', src: 'instagram', when: { es: 'hace 5 días', en: '5 days ago' }, proc: { es: 'Ojo seco', en: 'Dry eye' },
      q: { es: 'Llevaba meses con ardor. Encontraron la causa y me dieron un tratamiento que sí puedo seguir.', en: 'I had burning eyes for months. They found the cause and gave me a treatment I can actually stick to.' } },
    { id: 'raul', name: 'Raúl C.', src: 'doctoralia', when: { es: 'hace 2 meses', en: '2 months ago' }, proc: { es: 'Glaucoma', en: 'Glaucoma' },
      q: { es: 'Atención puntual y clara. Me explicaron mis resultados con calma y salí sabiendo exactamente qué seguía.', en: 'On time and clear. They walked me through my results calmly and I left knowing exactly what came next.' } },
    { id: 'monica', name: 'Mónica A.', src: 'google', when: { es: 'hace 1 semana', en: '1 week ago' }, proc: { es: 'Valoración oftalmológica', en: 'Eye exam' },
      q: { es: 'Me respondieron por WhatsApp en minutos y me dieron cita esa misma semana. Las instalaciones están impecables.', en: 'They answered on WhatsApp within minutes and booked me that same week. The clinic is spotless.' } },
    { id: 'carmen', name: 'Carmen R.', src: 'facebook', when: { es: 'hace 3 meses', en: '3 months ago' }, proc: { es: 'Cirugía de catarata', en: 'Cataract surgery' },
      q: { es: 'Me ofrecieron meses sin intereses y me ayudaron con el seguro. Nunca sentí que me quisieran vender algo.', en: 'They offered interest-free months and helped with my insurance. I never felt pushed into anything.' } },
    { id: 'diego', name: 'Diego M.', src: 'tiktok', when: { es: 'hace 4 días', en: '4 days ago' }, proc: { es: 'Cirugía refractiva', en: 'Refractive surgery' },
      q: { es: 'Me encontré su video y agendé. El trato fue directo y sin rodeos, justo lo que buscaba.', en: 'I found their video and booked. Straightforward care, no runaround — exactly what I wanted.' } }
  ]
};
