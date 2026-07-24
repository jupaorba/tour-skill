export type StepType =
  | 'modal'
  | 'highlight'
  | 'input'
  | 'action'
  | 'await'
  | 'group'
  | 'navigate'
  | 'openModal';

export type AnchorStrategy = 'data-tour' | 'data-testid' | 'css' | 'text';
export type SideEffect = 'none' | 'network' | 'navigation' | 'destructive';
export type Placement = 'auto' | 'top' | 'bottom' | 'left' | 'right';

export interface Anchor {
  selector: string;
  strategy: AnchorStrategy;
  fragile?: boolean;
  fallback?: string;
}

export interface FieldMeta {
  required?: boolean;
  validation?: string | null;
  dependsOn?: string | null;
  optionsHint?: string | null;
}

export interface AdvanceOn {
  event: 'click' | 'route' | 'selector' | 'timeout' | 'manual' | 'input';
  value?: string;
}

export interface Step {
  id: string;
  type: StepType;
  anchor?: Anchor;
  anchors?: Anchor[];
  title?: string;
  body: string;
  placement?: Placement;
  maskPadding?: number;
  maskRadius?: 'inherit' | number;
  scrollIntoView?: boolean;
  demoValue?: string;
  typingSpeedMs?: number;
  field?: FieldMeta;
  advanceOn?: AdvanceOn;
  sideEffect?: SideEffect;
  route?: string;
  skipIf?: string | null;
  timeoutMs?: number;
}

export interface Tour {
  id: string;
  specVersion: 1;
  title: string;
  description?: string;
  route: string;
  audience: 'end-user' | 'admin' | 'developer';
  estimatedSeconds?: number;
  locale?: string;
  demoMode?: boolean;
  prerequisites?: string[];
  generatedBy?: {
    agent?: string;
    at?: string;
    sourceFiles?: string[];
    sourceHash?: string;
  };
  steps: Step[];
  onFinish?: { persist?: string; message?: string; nextTour?: string };
}

export interface Hole {
  x: number;
  y: number;
  w: number;
  h: number;
  radius: string;
}

export interface WaypointOptions {
  tours: Record<string, Tour> | (() => Promise<Record<string, Tour>>);
  theme?: 'auto' | 'none';
  demoMode?: boolean;
  reducedMotion?: 'auto' | 'always' | 'never';
  locale?: string;
  router?: RouterAdapter;
  zIndexFallback?: number;
  onStep?: (e: StepEvent) => void;
  onFinish?: (e: TourEvent) => void;
  onAbort?: (e: TourEvent & { reason: AbortReason }) => void;
  onAnchorLost?: (e: { tourId: string; stepId: string; selector: string }) => void;
}

export type AbortReason = 'user' | 'anchor-lost' | 'timeout' | 'error' | 'navigation';
export interface TourEvent {
  tourId: string;
  at: number;
}
export interface StepEvent extends TourEvent {
  stepId: string;
  index: number;
  total: number;
}

export interface RouterAdapter {
  navigate(to: string): void | Promise<void>;
  current(): string;
  subscribe(cb: (path: string) => void): () => void;
}

export interface ResolvedAnchor {
  el: HTMLElement;
  rect: DOMRect;
  radius: string;
}

export interface MaskStrategy {
  mount(root: HTMLElement): void;
  update(holes: Hole[]): void;
  clear(): void;
  destroy(): void;
}

export type LayerMode = 'blocking' | 'passthrough';
export interface LayerManager {
  mount(mode: LayerMode): HTMLElement;
  setMode(mode: LayerMode): void;
  /** El host cambia de nodo cuando setMode() cambia de blocking a passthrough (o viceversa). */
  host(): HTMLElement;
  destroy(): void;
}

export interface VirtualCursor {
  moveTo(x: number, y: number): Promise<void>;
  click(): Promise<void>;
  hide(): void;
  destroy(): void;
}

export interface Tooltip {
  mount(root: HTMLElement): void;
  show(target: HTMLElement, opts: TooltipContent): Promise<void>;
  hide(): void;
  destroy(): void;
}

export interface TooltipContent {
  title?: string;
  body: string;
  placement: Placement;
  index: number;
  total: number;
  onNext?: () => void;
  onPrev?: () => void;
  onClose?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  closeLabel?: string;
}

export interface EngineState {
  status: 'idle' | 'running' | 'waiting-user' | 'navigating' | 'finished' | 'aborted';
  index: number;
  stepId: string | null;
}

export interface EngineDeps {
  layer: LayerManager;
  mask: MaskStrategy;
  tooltip: Tooltip;
  cursor: VirtualCursor;
  router?: RouterAdapter;
  options: WaypointOptions;
}
