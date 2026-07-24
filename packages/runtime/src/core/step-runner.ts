import type { Anchor, EngineDeps, Hole, ResolvedAnchor, Step } from '../types.js';
import { resolveAnchor, resolveAnchors } from '../anchor/resolve.js';
import { observeAnchor } from '../anchor/observe.js';
import { applyDemoValue } from '../cursor/typing.js';
import { getDict } from '../i18n/index.js';
import { announce } from '../a11y/announce.js';

export type StepDisposer = () => void;

export interface StepRunContext {
  step: Step;
  index: number;
  total: number;
  deps: EngineDeps;
  advance: () => void;
  goPrev: () => void;
  close: () => void;
  onAnchorLost: (selector: string) => void;
}

const BLOCKING_TYPES = new Set(['modal', 'highlight']);

/** Anchor virtual centrado en viewport, para pasos `modal` sin ancla real. */
function centerVirtualAnchor(): ResolvedAnchor {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const rect = new DOMRect(w / 2 - 1, h / 2 - 1, 2, 2);
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;left:50%;top:50%;width:1px;height:1px;pointer-events:none;';
  document.body.appendChild(el);
  return { el, rect, radius: '0px' };
}

function rectToHole(rect: DOMRect, padding: number, radius: Step['maskRadius'], borderRadius: string): Hole {
  return {
    x: rect.x - padding,
    y: rect.y - padding,
    w: rect.width + padding * 2,
    h: rect.height + padding * 2,
    radius: radius === 'inherit' || radius === undefined ? borderRadius : `${radius}px`,
  };
}

function showDemoToast(root: HTMLElement, locale: string | undefined) {
  const toast = document.createElement('div');
  toast.className = 'wp-toast';
  toast.textContent = getDict(locale).demoToast;
  root.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

/** §4.8 del BUILD_PLAN: nunca deja salir un submit real cuando demoMode está activo. */
function guardSubmit(root: HTMLElement, anchorEl: HTMLElement, step: Step, demoMode: boolean, locale?: string): StepDisposer {
  if (!demoMode || step.sideEffect === 'none' || !step.sideEffect) return () => {};
  const form = anchorEl.closest('form');
  if (!form) return () => {};
  const h = (e: Event) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    showDemoToast(root, locale);
  };
  form.addEventListener('submit', h, { capture: true });
  return () => form.removeEventListener('submit', h, { capture: true });
}

function setupAdvance(ctx: StepRunContext, anchorEl: HTMLElement | null): StepDisposer {
  const { step, deps, advance } = ctx;
  const advanceOn = step.advanceOn;
  if (!advanceOn || advanceOn.event === 'manual') return () => {};

  switch (advanceOn.event) {
    case 'timeout': {
      const t = setTimeout(advance, step.timeoutMs ?? 8000);
      return () => clearTimeout(t);
    }
    case 'click': {
      if (!anchorEl) return () => {};
      const h = () => advance();
      anchorEl.addEventListener('click', h, { once: true });
      return () => anchorEl.removeEventListener('click', h);
    }
    case 'input': {
      if (!anchorEl) return () => {};
      const h = () => advance();
      anchorEl.addEventListener('input', h, { once: true });
      return () => anchorEl.removeEventListener('input', h);
    }
    case 'route': {
      if (!deps.router || !advanceOn.value) return () => {};
      return deps.router.subscribe((path) => {
        if (path === advanceOn.value) advance();
      });
    }
    case 'selector': {
      if (!advanceOn.value) return () => {};
      const selector = advanceOn.value;
      if (document.querySelector(selector)) {
        queueMicrotask(advance);
        return () => {};
      }
      const mo = new MutationObserver(() => {
        if (document.querySelector(selector)) {
          mo.disconnect();
          advance();
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }
    default:
      return () => {};
  }
}

export async function runStep(ctx: StepRunContext): Promise<StepDisposer> {
  const { step, deps, index, total, advance, goPrev, close, onAnchorLost } = ctx;
  const disposers: StepDisposer[] = [];
  const locale = deps.options.locale;

  deps.layer.setMode(BLOCKING_TYPES.has(step.type) ? 'blocking' : 'passthrough');
  const host = deps.layer.host();

  let resolved: ResolvedAnchor[] = [];
  let isVirtual = false;

  if (step.type === 'modal') {
    resolved = [centerVirtualAnchor()];
    isVirtual = true;
  } else if (step.type === 'group' && step.anchors) {
    resolved = await resolveAnchors(step.anchors);
    if (resolved.length === 0) {
      onAnchorLost(step.anchors.map((a: Anchor) => a.selector).join(', '));
      return () => {};
    }
  } else if (step.anchor) {
    const r = await resolveAnchor(step.anchor);
    if (!r) {
      onAnchorLost(step.anchor.selector);
      return () => {};
    }
    resolved = [r];
  }

  const primary = resolved[0] ?? null;

  if (primary && step.scrollIntoView !== false && !isVirtual) {
    primary.el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
  }

  const updateMask = () => {
    if (isVirtual) {
      deps.mask.clear();
      return;
    }
    const holes = resolved.map((r) => rectToHole(r.el.getBoundingClientRect(), step.maskPadding ?? 8, step.maskRadius, r.radius));
    deps.mask.update(holes);
  };
  updateMask();

  if (primary && !isVirtual) {
    const stopObserving = observeAnchor(primary.el, updateMask);
    disposers.push(stopObserving);
  }

  if (primary) {
    const r = primary.el.getBoundingClientRect();
    await deps.cursor.moveTo(r.left + r.width / 2, r.top + r.height / 2);
  }

  if (step.type === 'input' && primary && step.demoValue !== undefined) {
    const reduced = deps.options.reducedMotion === 'always';
    await applyDemoValue(primary.el, step.demoValue, step.typingSpeedMs ?? 45, reduced);
  }

  if (step.type === 'action' && primary) {
    await deps.cursor.click();
    const demoMode = deps.options.demoMode ?? true;
    const unguard = guardSubmit(host, primary.el, step, demoMode, locale);
    disposers.push(unguard);
    primary.el.click();
  }

  const dict = getDict(locale);
  await deps.tooltip.show(primary?.el ?? host, {
    ...(step.title ? { title: step.title } : {}),
    body: step.body,
    placement: step.placement ?? 'auto',
    index,
    total,
    onNext: advance,
    ...(index > 0 ? { onPrev: goPrev } : {}),
    onClose: close,
    nextLabel: index + 1 === total ? dict.done : dict.next,
    prevLabel: dict.prev,
    closeLabel: dict.close,
  });

  announce(dict.stepAnnounce(index, total));

  disposers.push(setupAdvance(ctx, primary?.el ?? null));

  return () => {
    disposers.forEach((d) => d());
    if (isVirtual) primary?.el.remove();
    deps.tooltip.hide();
  };
}
