import { existsSync, readFileSync } from 'node:fs';
import fg from 'fast-glob';
import { loadTourmap, verifyOneTour, type VerifyReport } from '../verify/report.js';
import schema from '../../../skill/schema/tour.schema.json' with { type: 'json' };
import type { WaypointConfig, CliGlobalOpts } from '../config.js';
import { logger } from '../logger.js';

export interface VerifyOpts extends CliGlobalOpts {
  all?: boolean;
  ci?: boolean;
  baseUrl?: string;
  file?: string;
}

export async function runVerify(config: WaypointConfig, opts: VerifyOpts): Promise<VerifyReport> {
  const baseUrl = opts.baseUrl ?? config.baseUrl;
  const cfg = { ...config, baseUrl };

  const files = opts.file
    ? [opts.file]
    : fg.sync('**/*.tour.json', { cwd: config.toursDir, absolute: true });

  if (files.length === 0) {
    logger.error(`No hay tours en ${config.toursDir}. Escribe uno con FASE 5 del SKILL.md primero.`);
    process.exitCode = 1;
    return { ok: false, checkedAt: new Date().toISOString(), baseUrl, tours: [] };
  }

  const tourmap = loadTourmap(config);
  const results = [];

  for (const file of files) {
    if (!existsSync(file)) continue;
    let tour: Record<string, unknown>;
    try {
      tour = JSON.parse(readFileSync(file, 'utf-8'));
    } catch (err) {
      results.push({
        id: file,
        file,
        ok: false,
        issues: [
          {
            code: 'SCHEMA_INVALID' as const,
            severity: 'error' as const,
            message: `JSON inválido: ${(err as Error).message}`,
            hint: 'Corrige la sintaxis del archivo.',
          },
        ],
      });
      continue;
    }
    results.push(await verifyOneTour(file, tour, schema, cfg, tourmap));
  }

  const report: VerifyReport = {
    ok: results.every((r) => r.ok),
    checkedAt: new Date().toISOString(),
    baseUrl,
    tours: results,
  };

  if (opts.json) {
    logger.json(report);
  } else {
    for (const r of results) {
      if (r.ok) {
        logger.ok(`${r.id} — sin errores${r.issues.length ? ` (${r.issues.length} advertencia(s))` : ''}`);
      } else {
        logger.error(`${r.id} — ${r.issues.filter((i) => i.severity === 'error').length} error(es)`);
      }
      for (const issue of r.issues) {
        const prefix = issue.severity === 'error' ? '    ✗' : '    !';
        logger.dim(`${prefix} [${issue.code}]${issue.stepId ? ` (${issue.stepId})` : ''} ${issue.message}`);
        logger.dim(`      → ${issue.hint}`);
      }
    }
    logger.info(report.ok ? 'Todos los tours pasan.' : 'Hay tours con errores. Corre `05-repair.md` sobre los codes marcados con ✗.');
  }

  if (opts.ci && !report.ok) process.exitCode = 1;
  return report;
}
