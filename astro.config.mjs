import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { liveConfigUpdates } from './scripts/live-config-updates';

const defaultConfigFile = fileURLToPath(new URL('./config/starrybio.config.ts', import.meta.url));
const configFile = path.resolve(process.env.STARRYBIO_CONFIG_PATH || defaultConfigFile);
const site = process.env.STARRYBIO_SITE_URL;
const base = process.env.STARRYBIO_BASE_PATH;

export default defineConfig({
  site: site || undefined,
  base: base || undefined,
  output: 'static',
  integrations: [liveConfigUpdates(configFile)],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        'virtual:starrybio-config': configFile,
      },
    },
  },
});
