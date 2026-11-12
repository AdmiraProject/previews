# Ultra Techos — Websites v2–v6 (código)

5 versiones del sitio, HTML/CSS/JS estático (sin build). Todas comparten `assets/`.

| Versión | Carpeta | Concepto |
|---|---|---|
| v2 | `v2/` | Hero Tesla + animación de tejas (Westlake) + reseñas estilo Mill |
| v3 | `v3/` | Jetson + Tesla, hero con video de proyectos reales |
| v4 | `v4/` | Estilo Cosentino |
| v5 | `v5/` | Figma 1:1 con animaciones |
| v6 | `v6/` | Landing B2B (naves, bodegas, hoteles, comercios) |

## Paquete completo (Drive)
El sitio completo viene en partes `ultratechos-site-parte-XX.zip` (Drive limita cada archivo subido desde acá). Descargá todas en una carpeta y descomprimilas juntas — todas se combinan en la misma carpeta `site/`:
```
for z in ultratechos-site-parte-*.zip; do unzip -oq "$z"; done
```

## Correr local
```
cd site
python3 -m http.server 4700
```
Abrir http://localhost:4700/v2/ … /v6/

## Subir a producción
- Subir la carpeta `site/` completa (las versiones usan `../assets/`).
- El servidor debe soportar *range requests* para los videos (cualquier hosting normal / CDN lo hace).
- Formulario de cotización: `assets/shared/ut-lead.js` + `ut-lead.css` (pop-up 2 pasos del Figma, compartido por las 5 versiones). **Hoy no envía nada**: guarda en `localStorage('ut-lead')`. Conectar el `submit` (línea "prototype: nothing is sent") a email / WhatsApp / CRM.
- WhatsApp: +506 7012-1636 (`wa.me/50670121636`).
- `?shot` en la URL desactiva pop-ups/animaciones pinned (solo para capturas).

## VALIDAR con JP antes de publicar
- "Aísla 33% más que coberturas metálicas"
- "+1,200 clientes" y "10 años de garantía" (no están en las páginas hasta confirmar)
- Apellido de Heiner (instalador)
- Nombre y permiso de la arquitecta de la Expo 2026
- Nombre del hotel en Tortuguero
- "Sin costo extra" (ingeniería de valor)
- Logos reales de clientes para la franja de logos de v6 (hoy son nombres de proyectos)
- Tono: el pop-up usa *usted* (Figma), el resto de las páginas *vos* — definir uno.
