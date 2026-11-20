/* Branch map (Leaflet + OSM). Pins/cards open the lead popup for that branch (window.SFlead).
   Coordinates are approximate from street addresses — VALIDAR exact pins with the client. */
(() => {
  const el = document.getElementById('sf-map'); if (!el) return;
  const B = JSON.parse(el.dataset.branches);
  let map, markers = {};
  const init = () => {
    if (map || !window.L) return;
    map = L.map(el, { scrollWheelZoom: false, zoomControl: false, attributionControl: true }).setView([25.552, -103.46], 12);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
    B.forEach((b, i) => {
      const icon = L.divIcon({ className: 'pin', html: `<span class="pin-dot"><b>${i + 1}</b></span><span class="pin-lb${b.id === 'matamoros' ? ' l' : ''}">${b.short}</span>`, iconSize: [36, 46], iconAnchor: [18, 44] });
      const m = L.marker([b.lat, b.lng], { icon, keyboard: true, title: b.name }).addTo(map);
      m.on('click', () => { activate(b.id); window.SFlead && window.SFlead('sucursal', b.id); });
      m.on('mouseover', () => activate(b.id));
      markers[b.id] = m;
    });
    map.fitBounds(L.latLngBounds(B.map(b => [b.lat, b.lng])).pad(.35));
  };
  const activate = id => {
    document.querySelectorAll('.loc').forEach(c => c.classList.toggle('on', c.dataset.branch === id));
    Object.entries(markers).forEach(([k, m]) => m.getElement()?.classList.toggle('on', k === id));
  };
  document.querySelectorAll('.loc').forEach(c => {
    c.addEventListener('mouseenter', () => { activate(c.dataset.branch); const b = B.find(x => x.id === c.dataset.branch); map && map.flyTo([b.lat, b.lng], 14, { duration: .8 }); });
  });
  const load = () => {
    if (window.L) return init();
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'; document.head.appendChild(css);
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'; s.onload = init; document.head.appendChild(s);
  };
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); load(); } }, { rootMargin: '400px' }); io.observe(el); } else load();
})();
