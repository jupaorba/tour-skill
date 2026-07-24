import { existsSync, readFileSync } from 'node:fs';
import fg from 'fast-glob';
import { execSync } from 'node:child_process';
import { runDiscover } from './discover.js';
import type { WaypointConfig, CliGlobalOpts } from '../config.js';
import { logger } from '../logger.js';

interface DoctorCheck {
  name: string;
  ok: boolean;
  detail: string;
}

export function runDoctor(config: WaypointConfig, opts: CliGlobalOpts): DoctorCheck[] {
  const checks: DoctorCheck[] = [];

  const [major] = process.versions.node.split('.').map(Number);
  checks.push({
    name: 'Node >= 18',
    ok: (major ?? 0) >= 18,
    detail: `Node ${process.versions.node}`,
  });

  try {
    execSync('npx playwright --version', { stdio: 'pipe' });
    checks.push({ name: 'Playwright CLI', ok: true, detail: 'disponible' });
  } catch {
    checks.push({
      name: 'Playwright CLI',
      ok: false,
      detail: 'no encontrado. Corre `npx playwright install chromium` antes de `waypoint verify`.',
    });
  }

  checks.push({
    name: '.tourmap.json',
    ok: existsSync(config.tourmapPath),
    detail: existsSync(config.tourmapPath) ? 'presente' : 'falta — corre `waypoint discover`',
  });

  if (existsSync(config.tourmapPath)) {
    const before = JSON.parse(readFileSync(config.tourmapPath, 'utf-8'));
    const after = runDiscover(config, { silent: true });
    const drifted = before.views.filter(
      (v: { route: string; sourceHash: string }) =>
        after.views.find((w) => w.route === v.route)?.sourceHash !== v.sourceHash
    );
    checks.push({
      name: 'Drift de vistas',
      ok: drifted.length === 0,
      detail: drifted.length === 0 ? 'sin cambios desde el último discover' : `${drifted.length} vista(s) cambiaron: ${drifted.map((d: { route: string }) => d.route).join(', ')}`,
    });
  }

  const tourFiles = fg.sync('**/*.tour.json', { cwd: config.toursDir });
  checks.push({
    name: 'Tours registrados',
    ok: true,
    detail: `${tourFiles.length} archivo(s) en ${config.toursDir}`,
  });

  if (opts.json) {
    logger.json(checks);
  } else {
    for (const c of checks) {
      (c.ok ? logger.ok : logger.warn)(`${c.name}: ${c.detail}`);
    }
  }

  return checks;
}
