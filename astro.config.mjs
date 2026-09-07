import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { liveConfigUpdates } from './scripts/live-config-updates';

const configFile = fileURLToPath(new URL('./config/starrybio.config.ts', import.meta.url));
const site = process.env.STARRYBIO_SITE_URL;
const base = process.env.STARRYBIO_BASE_PATH;

export default defineConfig({
  site: site || undefined,
  base: base || undefined,
  output: 'static',
  integrations: [liveConfigUpdates(configFile)],
  vite: {
    plugins: [tailwindcss()],
  },
});
