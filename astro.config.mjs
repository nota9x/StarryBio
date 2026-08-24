import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { liveConfigUpdates } from './scripts/live-config-updates';

const configFile = fileURLToPath(new URL('./config/starrybio.config.ts', import.meta.url));

export default defineConfig({
  output: 'static',
  integrations: [liveConfigUpdates(configFile)],
  vite: {
    plugins: [tailwindcss()],
  },
});
