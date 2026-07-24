import { chromium, type Browser, type Page } from 'playwright';
import type { Issue } from './checks.js';

export interface VerifyStep {
  id: string;
  type: string;
  anchor?: { selector: string; strategy: string };
  anchors?: Array<{ selector: string; strategy: string }>;
  advanceOn?: { event: string; value?: string };
  skipIf?: string | null;
  timeoutMs?: number;
  demoValue?: string;
}

export interface VerifyTour {
  id: string;
  route: string;
  steps: VerifyStep[];
}

interface AnchorCheckResult {
  issues: Issue[];
  box: { x: number; y: number; width: number; height: number } | null;
}

/**
 * `count()`/`isVisible()` no esperan (resuelven con el estado actual del DOM);
 * a propósito, para no colgarse 30s en un ancla que legítimamente no existe
 * todavía (eso ya lo reporta ANCHOR_NOT_FOUND/ANCHOR_NOT_VISIBLE).
 */
async function checkAnchor(page: Page, selector: string, stepId: string): Promise<AnchorCheckResult> {
  const issues: Issue[] = [];
  const locator = page.locator(selector);
  const count = await locator.count();

  if (count === 0) {
    issues.push({
      stepId,
      code: 'ANCHOR_NOT_FOUND',
      severity: 'error',
      message: `No existe ${selector} en la página.`,
      hint: 'Corre `npx waypoint anchor --view=<Vista>` o revisa si el campo está dentro de un render condicional.',
    });
    return { issues, box: null };
  }

  if (count > 1) {
    issues.push({
      stepId,
      code: 'ANCHOR_AMBIGUOUS',
      severity: 'warning',
      message: `${selector} coincide con ${count} elementos; en runtime se usa el primero.`,
      hint: 'Haz el selector más específico o agrega un contenedor con data-tour propio.',
    });
  }

  const el = locator.first();
  const visible = await el.isVisible().catch(() => false);
  // Sin esto, un ancla fuera del viewport hace que elementFromPoint() devuelva
  // null y se reporte como ANCHOR_OCCLUDED — es lo mismo que scrollIntoView
  // hace en el runtime real antes de mostrar el paso.
  if (visible) await el.scrollIntoViewIfNeeded().catch(() => {});
  const box = visible ? await el.boundingBox().catch(() => null) : null;

  if (!visible || !box || box.width === 0 || box.height === 0) {
    issues.push({
      stepId,
      code: 'ANCHOR_NOT_VISIBLE',
      severity: 'error',
      message: `${selector} existe pero no es visible (display:none, 0×0, o dentro de un render condicional cerrado).`,
      hint: 'Agrega un paso `action` que abra el acordeón/tab contenedor antes de este paso.',
    });
    return { issues, box: null };
  }

  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const occluded = await page.evaluate(
    ([sel, x, y]) => {
      const target = document.querySelector(sel as string);
      const atPoint = document.elementFromPoint(x as number, y as number);
      if (!target || !atPoint) return true;
      return !(target === atPoint || target.contains(atPoint) || atPoint.contains(target));
    },
    [selector, cx, cy] as const
  );

  if (occluded) {
    issues.push({
      stepId,
      code: 'ANCHOR_OCCLUDED',
      severity: 'error',
      message: `Otro elemento tapa el centro de ${selector} (posible sticky header o modal encima).`,
      hint: 'Revisa si un sticky header lo tapa; ajusta scrollIntoView o cambia de ancla.',
    });
    return { issues, box: null };
  }

  return { issues, box };
}

function tooltipOverflowRisk(box: { x: number; y: number; width: number; height: number }, viewport: { width: number; height: number }): boolean {
  const TOOLTIP_MIN = 236; // 220 de max-width + 8*2 de padding de shift()
  const spaceTop = box.y;
  const spaceBottom = viewport.height - (box.y + box.height);
  const spaceLeft = box.x;
  const spaceRight = viewport.width - (box.x + box.width);
  return Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight) < TOOLTIP_MIN;
}

export interface RunnerResult {
  ok: boolean;
  issues: Issue[];
}

export async function verifyTourInBrowser(tour: VerifyTour, baseUrl: string): Promise<RunnerResult> {
  let browser: Browser | null = null;
  const issues: Issue[] = [];

  try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    // Bloqueo de submits real, sin importar demoMode: verify nunca debe disparar
    // una petición real, y así los pasos posteriores del tour sí pueden
    // depender de que un `input`/`action` anterior haya ocurrido de verdad.
    await page.addInitScript(() => {
      document.addEventListener(
        'submit',
        (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
        },
        { capture: true }
      );
    });

    await page.goto(new URL(tour.route, baseUrl).toString(), { waitUntil: 'networkidle', timeout: 15000 });

    for (const step of tour.steps) {
      if (step.skipIf && (await page.locator(step.skipIf).count()) === 0) {
        continue;
      }

      const anchors = step.anchor ? [step.anchor] : step.anchors ?? [];
      let singleBox: AnchorCheckResult['box'] = null;

      for (const a of anchors) {
        const result = await checkAnchor(page, a.selector, step.id);
        issues.push(...result.issues);
        if (anchors.length === 1) singleBox = result.box;
      }

      if (singleBox) {
        const viewport = page.viewportSize();
        const singleSelector = anchors[0]?.selector;
        if (viewport && singleSelector && tooltipOverflowRisk(singleBox, viewport)) {
          issues.push({
            stepId: step.id,
            code: 'TOOLTIP_OVERFLOW',
            severity: 'error',
            message: `No hay espacio suficiente alrededor de ${singleSelector} para el tooltip en 1280×800.`,
            hint: 'Cambia placement a "auto", o acorta el body.',
          });
        }
      }

      // Reproduce la acción demo del paso para que las precondiciones de los
      // pasos siguientes (un campo condicional, un modal) existan de verdad.
      // El submit real ya está bloqueado arriba, sin importar demoMode.
      if (singleBox && anchors.length === 1 && anchors[0]) {
        const el = page.locator(anchors[0].selector).first();
        if (step.type === 'input' && step.demoValue !== undefined) {
          const tag = await el.evaluate((node) => node.tagName).catch(() => '');
          if (tag === 'SELECT') {
            await el.selectOption(step.demoValue).catch(() => {});
          } else {
            await el.fill(step.demoValue).catch(() => {});
          }
        } else if (step.type === 'action' || step.type === 'openModal') {
          await el.click().catch(() => {});
        }
      }

      if (step.advanceOn?.event === 'selector' && step.advanceOn.value) {
        const timeout = step.timeoutMs ?? 8000;
        const found = await page
          .waitForSelector(step.advanceOn.value, { timeout, state: 'attached' })
          .then(() => true)
          .catch(() => false);
        if (!found) {
          issues.push({
            stepId: step.id,
            code: 'STEP_TIMEOUT',
            severity: 'error',
            message: `advanceOn.selector "${step.advanceOn.value}" nunca apareció en ${timeout}ms.`,
            hint: 'Revisa si el selector es correcto o si depende de una acción previa que no ocurrió en la demo.',
          });
        }
      }
    }
  } finally {
    await browser?.close();
  }

  return { ok: issues.every((i) => i.severity !== 'error'), issues };
}
