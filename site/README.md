# Waypoint — sitio (landing)

SPA estática en Astro. Landing de la skill Waypoint, basada 100% en la
portada de marca (`../public/port.png`): canvas navy, pin-brújula gradiente
azul→morado, órbitas con dots teal/ámbar/morado.

Diseño construido con la metodología **Hallmark** (género atmospheric,
macroestructura Marquee Hero, tema custom OKLCH, nav N5 floating pill,
footer Ft5 statement). Ver el stamp en `src/styles/tokens.css`.

## Correr

```bash
cd site
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ estático
npm run preview  # sirve dist/
```

## Cómo es "super rápida"

- Astro estático: **cero JS de framework**. La página es un solo HTML
  (~8 KB gzip) con el CSS inline.
- Las animaciones 3D (pin flotante, órbitas, brújula) son **CSS puro**
  (`perspective` + `transform-style: preserve-3d`), sin librerías.
- El único JS es un script diferido pequeño: parallax de cursor sobre la
  escena 3D, reveal on scroll y botón de copiar. Todo respeta
  `prefers-reduced-motion`.

## Estructura

- `src/pages/index.astro` — la página completa (nav, hero, features,
  pipeline, paquetes, uso, footer) + script diferido.
- `src/components/Scene.astro` — pieza central 3D (pin SVG + órbitas CSS).
- `src/styles/tokens.css` — paleta OKLCH + tipografías (Outfit / Inter /
  JetBrains Mono), derivadas de `port.png`.
- `src/styles/global.css` — todos los estilos de componentes + responsive.

## Deploy

Cualquier host estático (Vercel, Netlify, GitHub Pages, Cloudflare Pages).
Sube el contenido de `dist/`. No necesita servidor.
