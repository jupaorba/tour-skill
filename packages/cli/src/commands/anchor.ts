import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createTwoFilesPatch } from 'diff';
import { injectDataTour } from '../codemod/inject-data-tour.js';
import type { Tourmap } from './discover.js';
import type { WaypointConfig, CliGlobalOpts } from '../config.js';
import { logger } from '../logger.js';

export interface AnchorOpts extends CliGlobalOpts {
  view: string;
  dryRun?: boolean;
}

export function runAnchor(config: WaypointConfig, opts: AnchorOpts): void {
  if (!existsSync(config.tourmapPath)) {
    logger.error('No existe .tourmap.json. Corre `waypoint discover` primero.');
    process.exitCode = 1;
    return;
  }

  const tourmap: Tourmap = JSON.parse(readFileSync(config.tourmapPath, 'utf-8'));
  const view = tourmap.views.find((v) => v.name === opts.view);
  if (!view) {
    logger.error(`No hay una vista llamada "${opts.view}" en .tourmap.json. Vistas disponibles: ${tourmap.views.map((v) => v.name).join(', ') || '(ninguna)'}`);
    process.exitCode = 1;
    return;
  }

  const filePath = join(config.root, view.file);
  const source = readFileSync(filePath, 'utf-8');
  const result = injectDataTour(source, view.name);

  if (opts.json) {
    logger.json({ file: view.file, changed: result.changed, added: result.added });
    if (!opts.dryRun && result.changed) writeFileSync(filePath, result.code, 'utf-8');
    return;
  }

  if (!result.changed) {
    logger.ok(`${view.file} ya tiene data-tour en todos los elementos interactivos detectados. Nada que hacer.`);
    return;
  }

  if (opts.dryRun) {
    const patch = createTwoFilesPatch(view.file, view.file, source, result.code);
    logger.info(`Diff para ${view.file} (--dry-run, no se escribe nada):`);
    console.log(patch);
    return;
  }

  writeFileSync(filePath, result.code, 'utf-8');
  logger.ok(`${view.file}: ${result.added.length} atributo(s) data-tour agregado(s).`);
  for (const a of result.added) logger.dim(`  data-tour="${a}"`);
}
