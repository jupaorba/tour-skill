import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import forbiddenTerms from '../../../skill/reference/forbidden-terms.json' with { type: 'json' };

export interface Issue {
  stepId?: string;
  code: string;
  severity: 'error' | 'warning';
  message: string;
  hint: string;
}

let ajvInstance: InstanceType<typeof Ajv2020> | null = null;

function getAjv(schema: object) {
  if (ajvInstance) return ajvInstance;
  ajvInstance = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajvInstance);
  ajvInstance.addSchema(schema, 'tour');
  return ajvInstance;
}

export function checkStepCount(tour: { steps: unknown[] }): Issue[] {
  if (tour.steps.length > 12) {
    return [
      {
        code: 'TOO_MANY_STEPS',
        severity: 'error',
        message: `El tour tiene ${tour.steps.length} pasos; el máximo es 12.`,
        hint: 'Agrupa con type:"group" o parte en dos tours con onFinish.nextTour.',
      },
    ];
  }
  return [];
}

const TERM_RE = new RegExp(`\\b(${(forbiddenTerms as string[]).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'i');

export function checkCopy(tour: { audience: string; steps: Array<{ id: string; title?: string; body: string }> }): Issue[] {
  const issues: Issue[] = [];
  for (const step of tour.steps) {
    const text = `${step.title ?? ''} ${step.body}`;
    const normalized = text
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();

    if (tour.audience !== 'developer' || !/token de acceso/.test(normalized)) {
      const match = normalized.match(TERM_RE);
      if (match) {
        issues.push({
          stepId: step.id,
          code: 'COPY_FORBIDDEN_TERM',
          severity: 'error',
          message: `El paso "${step.id}" usa jerga técnica ("${match[0]}") prohibida por reference/tone.md.`,
          hint: 'Reescribe con tone.md; nunca sinonimizar la jerga, replantea la frase.',
        });
      }
    }

    const words = step.body.trim().split(/\s+/).filter(Boolean).length;
    if (words > 25) {
      issues.push({
        stepId: step.id,
        code: 'COPY_TOO_LONG',
        severity: 'error',
        message: `El body del paso "${step.id}" tiene ${words} palabras; el objetivo de tone.md es ~25.`,
        hint: 'Cambia placement a "auto", o acorta el body.',
      });
    }
  }
  return issues;
}

export function checkDemoMode(tour: {
  demoMode?: boolean;
  steps: Array<{ id: string; sideEffect?: string }>;
}): Issue[] {
  const risky = tour.steps.filter((s) => s.sideEffect === 'network' || s.sideEffect === 'destructive');
  if (risky.length > 0 && tour.demoMode !== true) {
    return risky.map((s) => ({
      stepId: s.id,
      code: 'MISSING_DEMO_MODE',
      severity: 'error' as const,
      message: `El paso "${s.id}" tiene sideEffect:"${s.sideEffect}" pero el tour no tiene demoMode:true.`,
      hint: 'Agrega "demoMode": true al tour. Nunca se debe enviar un formulario real.',
    }));
  }
  return [];
}

export function checkSchema(tour: unknown, schema: object): Issue[] {
  const ajv = getAjv(schema);
  const validate = ajv.getSchema('tour')!;
  const ok = validate(tour);
  if (ok) return [];

  return (validate.errors ?? []).map((err) => ({
    code: 'SCHEMA_INVALID',
    severity: 'error' as const,
    message: `${err.instancePath || '(raíz)'} ${err.message ?? 'inválido'}`,
    hint: 'Corrige el JSON contra schema/tour.schema.json y vuelve a correr verify.',
  }));
}

export function checkAnchorStrategy(tour: {
  steps: Array<{ id: string; anchor?: { strategy: string }; anchors?: Array<{ strategy: string }> }>;
}): Issue[] {
  const issues: Issue[] = [];
  for (const step of tour.steps) {
    const anchors = step.anchor ? [step.anchor] : step.anchors ?? [];
    for (const a of anchors) {
      if (a.strategy === 'css' || a.strategy === 'text') {
        issues.push({
          stepId: step.id,
          code: 'ANCHOR_FRAGILE',
          severity: 'warning',
          message: `El paso "${step.id}" usa un selector ${a.strategy}, el último recurso de la cascada.`,
          hint: 'Corre `waypoint anchor` para inyectar data-tour y evitar depender de CSS/texto.',
        });
      }
    }
  }
  return issues;
}
