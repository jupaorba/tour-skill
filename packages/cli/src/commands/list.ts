import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Tourmap } from './discover.js';
import type { WaypointConfig, CliGlobalOpts } from '../config.js';
import { logger } from '../logger.js';

export interface ListOpts extends CliGlobalOpts {
  views?: boolean;
}

export function runList(config: WaypointConfig, opts: ListOpts) {
  if (opts.views) {
    if (!existsSync(config.tourmapPath)) {
      logger.error('No existe .tourmap.json. Corre `waypoint discover` primero.');
      process.exitCode = 1;
      return;
    }
    const tourmap: Tourmap = JSON.parse(readFileSync(config.tourmapPath, 'utf-8'));
    if (opts.json) return logger.json(tourmap.views);
    for (const v of tourmap.views) logger.info(`${v.name} — ${v.route} (${v.file})`);
    return;
  }

  const indexPath = join(config.toursDir, 'index.json');
  if (!existsSync(indexPath)) {
    logger.error('No existe tours/index.json. Corre `waypoint register` primero.');
    process.exitCode = 1;
    return;
  }
  const index = JSON.parse(readFileSync(indexPath, 'utf-8'));
  if (opts.json) return logger.json(index.tours);
  for (const t of index.tours) logger.info(`${t.id} — ${t.title} (${t.route})`);
}
