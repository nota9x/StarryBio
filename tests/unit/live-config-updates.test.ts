import { EventEmitter } from 'node:events';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { attachLiveConfigUpdates } from '../../scripts/live-config-updates';

class Watcher extends EventEmitter {
  readonly add = vi.fn();
}

describe('live config updates', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('invalidates server modules and reloads browsers when the config changes', () => {
    vi.useFakeTimers();
    const configFile = path.resolve('config/starrybio.config.ts');
    const watcher = new Watcher();
    const httpServer = new EventEmitter();
    const invalidateAll = vi.fn();
    const send = vi.fn();
    const info = vi.fn();

    attachLiveConfigUpdates(
      {
        watcher,
        moduleGraph: { invalidateAll },
        ws: { send },
        httpServer,
      },
      { info },
      configFile
    );

    expect(watcher.add).toHaveBeenCalledWith(configFile);
    watcher.emit('all', 'change', configFile);
    vi.runAllTimers();

    expect(invalidateAll).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledWith({ type: 'full-reload', path: '*' });
    expect(info).toHaveBeenCalledOnce();
  });

  it('debounces config saves, ignores other files, and cleans up on close', () => {
    vi.useFakeTimers();
    const configFile = path.resolve('config/starrybio.config.ts');
    const watcher = new Watcher();
    const httpServer = new EventEmitter();
    const invalidateAll = vi.fn();
    const send = vi.fn();

    attachLiveConfigUpdates(
      {
        watcher,
        moduleGraph: { invalidateAll },
        ws: { send },
        httpServer,
      },
      { info: vi.fn() },
      configFile
    );

    watcher.emit('all', 'change', path.resolve('src/pages/index.astro'));
    watcher.emit('all', 'change', configFile);
    watcher.emit('all', 'change', configFile);
    vi.runAllTimers();

    expect(invalidateAll).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledOnce();

    httpServer.emit('close');
    watcher.emit('all', 'change', configFile);
    vi.runAllTimers();
    expect(send).toHaveBeenCalledOnce();
  });
});
