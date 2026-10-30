import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lliooly.github.io',
  base: '/wuwa-tappo-assets',
  vite: { cacheDir: './.astro/vite' },
});
