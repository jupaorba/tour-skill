import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export interface WaypointConfig {
  root: string;
  toursDir: string;
  tourmapPath: string;
  baseUrl: string;
  locale: string;
}

export interface CliGlobalOpts {
  json?: boolean;
  cwd?: string;
  /** Uso interno: corre el comando sin imprimir nada (p.ej. `doctor` reusando `discover`). */
  silent?: boolean;
}

export function loadConfig(cwd = process.cwd()): WaypointConfig {
  const configPath = join(cwd, 'waypoint.config.json');
  const defaults: WaypointConfig = {
    root: cwd,
    toursDir: join(cwd, 'tours'),
    tourmapPath: join(cwd, '.tourmap.json'),
    baseUrl: 'http://localhost:5173',
    locale: 'es-MX',
  };

  if (!existsSync(configPath)) return defaults;

  try {
    const raw = JSON.parse(readFileSync(configPath, 'utf-8'));
    return {
      ...defaults,
      ...raw,
      toursDir: raw.toursDir ? join(cwd, raw.toursDir) : defaults.toursDir,
      tourmapPath: raw.tourmapPath ? join(cwd, raw.tourmapPath) : defaults.tourmapPath,
    };
  } catch {
    return defaults;
  }
}
