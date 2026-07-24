import { existsSync, readFileSync } from 'node:fs';
import { checkAnchorStrategy, checkCopy, checkDemoMode, checkSchema, checkStepCount, type Issue } from './checks.js';
import { verifyTourInBrowser, type VerifyTour } from './runner.js';
import { contrastRatio, extractCssVar } from './contrast.js';
import type { Tourmap } from '../commands/discover.js';
import type { WaypointConfig } from '../config.js';

export interface TourVerifyResult {
  id: string;
  file: string;
  ok: boolean;
  issues: Issue[];
}

export interface VerifyReport {
  ok: boolean;
  checkedAt: string;
  baseUrl: string;
  tours: TourVerifyResult[];
}

function checkSourceDrift(tour: { route: string; generatedBy?: { sourceHash?: string } }, tourmap: Tourmap | null): Issue[] {
  if (!tourmap || !tour.generatedBy?.sourceHash) return [];
  const view = tourmap.views.find((v) => v.route === tour.route);
  if (!view) return [];
  if (view.sourceHash !== tour.generatedBy.sourceHash) {
    return [
      {
        code: 'SOURCE_DRIFT',
        severity: 'warning',
        message: `La vista de "${tour.route}" cambió desde que se generó el tour (sourceHash distinto).`,
        hint: 'Vuelve a FASE 1 completa para esa vista.',
      },
    ];
  }
  return [];
}

function checkContrast(config: WaypointConfig): Issue[] {
  const themePath = `${config.toursDir}/theme.css`;
  if (!existsSync(themePath)) return [];
  const css = readFileSync(themePath, 'utf-8');
  const surface = extractCssVar(css, '--wp-surface');
  const text = extractCssVar(css, '--wp-text');
  if (!surface || !text) return [];

  const ratio = contrastRatio(surface, text);
  if (ratio !== null && ratio < 4.5) {
    return [
      {
        code: 'CONTRAST_LOW',
        severity: 'warning',
        message: `Contraste entre --wp-surface y --wp-text es ${ratio.toFixed(2)}:1, bajo el mínimo WCAG AA de 4.5:1.`,
        hint: 'Ajusta --wp-text o --wp-surface en tours/theme.css.',
      },
    ];
  }
  return [];
}

export async function verifyOneTour(
  tourPath: string,
  tour: Record<string, unknown>,
  schema: object,
  config: WaypointConfig,
  tourmap: Tourmap | null
): Promise<TourVerifyResult> {
  const issues: Issue[] = [
    ...checkSchema(tour, schema),
    ...checkStepCount(tour as { steps: unknown[] }),
    ...checkCopy(tour as { audience: string; steps: Array<{ id: string; title?: string; body: string }> }),
    ...checkDemoMode(tour as { demoMode?: boolean; steps: Array<{ id: string; sideEffect?: string }> }),
    ...checkAnchorStrategy(tour as { steps: Array<{ id: string; anchor?: { strategy: string }; anchors?: Array<{ strategy: string }> }> }),
    ...checkSourceDrift(tour as { route: string; generatedBy?: { sourceHash?: string } }, tourmap),
    ...checkContrast(config),
  ];

  const hasSchemaError = issues.some((i) => i.code === 'SCHEMA_INVALID');
  if (!hasSchemaError) {
    const browserResult = await verifyTourInBrowser(tour as unknown as VerifyTour, config.baseUrl).catch((err) => ({
      ok: false,
      issues: [
        {
          code: 'UNSUPPORTED_CONTEXT',
          severity: 'error' as const,
          message: `No se pudo abrir ${config.baseUrl}${(tour as { route: string }).route}: ${(err as Error).message}`,
          hint: 'Levanta la app (npm run dev) antes de correr verify, o pasa --base-url.',
        },
      ],
    }));
    issues.push(...browserResult.issues);
  }

  return {
    id: (tour as { id: string }).id,
    file: tourPath,
    ok: issues.every((i) => i.severity !== 'error'),
    issues,
  };
}

export function loadTourmap(config: WaypointConfig): Tourmap | null {
  if (!existsSync(config.tourmapPath)) return null;
  try {
    return JSON.parse(readFileSync(config.tourmapPath, 'utf-8'));
  } catch {
    return null;
  }
}
