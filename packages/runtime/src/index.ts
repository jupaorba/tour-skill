import { TourEngine } from './core/engine.js';
import { MaskSelector } from './mask/index.js';
import { TopLayerManager } from './layer/layer-manager.js';
import { WaypointCursor } from './cursor/cursor.js';
import { WaypointTooltip } from './tooltip/tooltip.js';
import type { EngineDeps, RouterAdapter, Tour, WaypointOptions } from './types.js';

export * from './types.js';
export { TourEngine } from './core/engine.js';
export { createReactRouterAdapter } from './router/react-router.js';
export { createVueRouterAdapter, type VueRouterLike } from './router/vue-router.js';
export { createNextAdapter, type NextRouterLike } from './router/next.js';
export { getDict, registerDict } from './i18n/index.js';
export { hasFinished } from './persist/session.js';

/**
 * Punto de entrada público. Una instancia por app; cada `start(tourId)`
 * crea y destruye su propio `TourEngine` para no acumular listeners.
 */
export class Waypoint {
  private options: WaypointOptions;
  private toursCache: Record<string, Tour> | null = null;
  private engine: TourEngine | null = null;

  constructor(options: WaypointOptions) {
    this.options = options;
  }

  async listTours(): Promise<Tour[]> {
    const tours = await this.resolveTours();
    return Object.values(tours);
  }

  async start(tourId: string, opts?: { fromStep?: string }): Promise<void> {
    const tours = await this.resolveTours();
    const tour = tours[tourId];
    if (!tour) throw new Error(`[waypoint] Tour "${tourId}" no existe en la configuración.`);

    this.engine?.destroy();

    const layer = new TopLayerManager();
    const mask = new MaskSelector();
    const tooltip = new WaypointTooltip();
    const cursor = new WaypointCursor(
      document.body,
      this.options.reducedMotion ? { reducedMotion: this.options.reducedMotion } : {}
    );

    const router: RouterAdapter | undefined = this.options.router;

    const deps: EngineDeps = {
      layer,
      mask,
      tooltip,
      cursor,
      ...(router ? { router } : {}),
      options: { ...this.options, demoMode: tour.demoMode ?? this.options.demoMode ?? true },
    };

    this.engine = new TourEngine(tour, deps);
    await this.engine.start(opts);
  }

  next(): Promise<void> {
    return this.engine?.next() ?? Promise.resolve();
  }

  prev(): Promise<void> {
    return this.engine?.prev() ?? Promise.resolve();
  }

  goTo(stepId: string): Promise<void> {
    return this.engine?.goTo(stepId) ?? Promise.resolve();
  }

  abort(): void {
    this.engine?.abort('user');
  }

  destroy(): void {
    this.engine?.destroy();
    this.engine = null;
  }

  get isRunning(): boolean {
    return this.engine !== null && this.engine.state.status !== 'finished' && this.engine.state.status !== 'aborted';
  }

  private async resolveTours(): Promise<Record<string, Tour>> {
    if (this.toursCache) return this.toursCache;
    const tours = typeof this.options.tours === 'function' ? await this.options.tours() : this.options.tours;
    this.toursCache = tours;
    return tours;
  }
}
