import { defineConfig } from 'astro/config';

// SPA estática, cero JS de framework. Animaciones 3D CSS + Lenis (scroll).
// Deploy: GitHub Pages en https://jupaorba.github.io/tour-skill/
export default defineConfig({
  site: 'https://jupaorba.github.io',
  base: '/tour-skill',
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
  },
});
