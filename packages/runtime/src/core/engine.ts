import type { AbortReason, EngineDeps, EngineState, Tour } from '../types.js';
import { runStep, type StepDisposer } from './step-runner.js';
import { clearProgress, loadProgress, persistFinish, saveProgress } from '../persist/session.js';
import { FocusTrap } from '../a11y/focus-trap.js';

export class TourEngine {
  private tour: Tour;
  private deps: EngineDeps;
  private disposer: StepDisposer | null = null;
  private focusTrap: FocusTrap | null = null;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private busy = false;
  private _state: EngineState = { status: 'idle', index: -1, stepId: null };

  constructor(tour: Tour, deps: EngineDeps) {
    this.tour = tour;
    this.deps = deps;
  }

  get state(): Readonly<EngineState> {
    return this._state;
  }

  async start(opts?: { fromStep?: string }): Promise<void> {
    const resumeId = opts?.fromStep ?? loadProgress(this.tour.id)?.stepId ?? null;
    const startIndex = resumeId ? Math.max(0, this.tour.steps.findIndex((s) => s.id === resumeId)) : 0;

    const host = this.deps.layer.mount('blocking');
    this.deps.mask.mount(host);
    this.deps.tooltip.mount(host);
    this.focusTrap = new FocusTrap(host);
    this.focusTrap.activate();
    this.installKeyboardNav();

    await this.withBusyGuard(() => this.gotoIndex(startIndex));
  }

  async next(): Promise<void> {
    await this.withBusyGuard(() => this.gotoIndex(this._state.index + 1));
  }

  async prev(): Promise<void> {
    if (this._state.index <= 0) return;
    await this.withBusyGuard(() => this.gotoIndex(this._state.index - 1));
  }

  async goTo(stepId: string): Promise<void> {
    const idx = this.tour.steps.findIndex((s) => s.id === stepId);
    if (idx === -1) return;
    await this.withBusyGuard(() => this.gotoIndex(idx));
  }

  abort(reason: AbortReason): void {
    this.disposer?.();
    this.disposer = null;
    this._state = { ...this._state, status: 'aborted' };
    this.teardownChrome();
    clearProgress(this.tour.id);
    this.deps.options.onAbort?.({ tourId: this.tour.id, at: Date.now(), reason });
  }

  destroy(): void {
    this.disposer?.();
    this.disposer = null;
    this.teardownChrome();
    this.deps.mask.destroy();
    this.deps.tooltip.destroy();
    this.deps.cursor.destroy();
    this.deps.layer.destroy();
  }

  /** Serializa next()/prev()/goTo(): una sola transición de estado a la vez. */
  private async withBusyGuard(fn: () => Promise<void>): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    try {
      await fn();
    } finally {
      this.busy = false;
    }
  }

  private teardownChrome(): void {
    this.focusTrap?.deactivate();
    this.focusTrap = null;
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler, true);
      this.keydownHandler = null;
    }
  }

  /** ←/→ avanzan o retroceden (salvo si el foco está en un campo editable); Esc siempre cierra. */
  private installKeyboardNav(): void {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.abort('user');
        return;
      }

      const active = document.activeElement;
      const isEditable =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement ||
        (active instanceof HTMLElement && active.isContentEditable);
      if (isEditable) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        void this.next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        void this.prev();
      }
    };
    document.addEventListener('keydown', handler, true);
    this.keydownHandler = handler;
  }

  private async finish(): Promise<void> {
    this.disposer?.();
    this.disposer = null;
    this._state = { ...this._state, status: 'finished' };
    this.teardownChrome();
    clearProgress(this.tour.id);
    if (this.tour.onFinish?.persist) persistFinish(this.tour.onFinish.persist);
    this.deps.options.onFinish?.({ tourId: this.tour.id, at: Date.now() });
    this.deps.mask.clear();
    this.deps.tooltip.hide();
    this.deps.cursor.hide();
  }

  /**
   * Único punto de mutación de índice. No aplica el guard de `busy`: lo
   * usan tanto las API públicas (que sí lo aplican) como el auto-advance de
   * los pasos `navigate` (que ya corre dentro de un `withBusyGuard`).
   */
  private async gotoIndex(index: number): Promise<void> {
    this.disposer?.();
    this.disposer = null;

    if (index >= this.tour.steps.length) {
      await this.finish();
      return;
    }

    const step = this.tour.steps[index];
    if (!step) return;

    this._state = { status: 'running', index, stepId: step.id };
    saveProgress(this.tour.id, { stepId: step.id, index, at: Date.now() });

    if (step.skipIf && !document.querySelector(step.skipIf)) {
      await this.gotoIndex(index + 1);
      return;
    }

    if (step.type === 'navigate' && step.route && this.deps.router) {
      this._state = { ...this._state, status: 'navigating' };
      await this.deps.router.navigate(step.route);
      await this.gotoIndex(index + 1);
      return;
    }

    this.deps.options.onStep?.({
      tourId: this.tour.id,
      at: Date.now(),
      stepId: step.id,
      index,
      total: this.tour.steps.length,
    });

    this.disposer = await runStep({
      step,
      index,
      total: this.tour.steps.length,
      deps: this.deps,
      advance: () => void this.next(),
      goPrev: () => void this.prev(),
      close: () => this.abort('user'),
      onAnchorLost: (selector) => {
        this.deps.options.onAnchorLost?.({ tourId: this.tour.id, stepId: step.id, selector });
        this.abort('anchor-lost');
      },
    });

    this._state = { ...this._state, status: 'waiting-user' };
  }
}
