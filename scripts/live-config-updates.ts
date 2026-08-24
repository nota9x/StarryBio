import path from 'node:path';
import type { AstroIntegration, AstroIntegrationLogger } from 'astro';

const CONFIG_EVENTS = new Set(['add', 'change', 'unlink']);

interface ConfigWatcher {
  add(file: string): unknown;
  on(event: 'all', listener: (event: string, file: string) => void): unknown;
  off(event: 'all', listener: (event: string, file: string) => void): unknown;
}

interface CloseEmitter {
  once(event: 'close', listener: () => void): unknown;
  off(event: 'close', listener: () => void): unknown;
}

interface LiveConfigServer {
  watcher: ConfigWatcher;
  moduleGraph: { invalidateAll(): void };
  ws: { send(payload: { type: 'full-reload'; path: string }): void };
  httpServer: CloseEmitter | null;
}

function comparablePath(file: string): string {
  const absolutePath = path.resolve(file);
  return process.platform === 'win32' ? absolutePath.toLowerCase() : absolutePath;
}

/**
 * Watch the user-facing config explicitly. Config is outside src/, so it does
 * not have an Astro HMR boundary of its own and needs a full browser reload.
 */
export function attachLiveConfigUpdates(
  server: LiveConfigServer,
  logger: Pick<AstroIntegrationLogger, 'info'>,
  configFile: string,
  debounceMilliseconds = 50
): () => void {
  const expectedFile = comparablePath(configFile);
  let reloadTimer: ReturnType<typeof setTimeout> | undefined;

  const reloadForConfig = (event: string, file: string): void => {
    if (!CONFIG_EVENTS.has(event) || comparablePath(file) !== expectedFile) return;

    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      // Ensure the next page request evaluates the latest config rather than a
      // cached SSR module, then tell every connected browser to request it.
      server.moduleGraph.invalidateAll();
      server.ws.send({ type: 'full-reload', path: '*' });
      logger.info('Configuration updated. Reloading the site.');
    }, debounceMilliseconds);
  };

  const cleanup = (): void => {
    clearTimeout(reloadTimer);
    server.watcher.off('all', reloadForConfig);
    server.httpServer?.off('close', cleanup);
  };

  server.watcher.add(configFile);
  server.watcher.on('all', reloadForConfig);
  server.httpServer?.once('close', cleanup);

  return cleanup;
}

export function liveConfigUpdates(configFile: string): AstroIntegration {
  return {
    name: 'starrybio-live-config-updates',
    hooks: {
      'astro:server:setup': ({ server, logger }) => {
        attachLiveConfigUpdates(server, logger, configFile);
      },
    },
  };
}
