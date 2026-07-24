# BUILD_PLAN.md — Waypoint

> **Documento de ejecución.** `SPEC.md` dice *qué* se construye y *por qué*.
> Este dice *cómo, en qué orden, y cómo se sabe que está terminado*.
> Ante conflicto entre ambos, manda `SPEC.md` y se anota la discrepancia.

---

## 0. Reglas de ejecución para el agente

Lee esta sección completa antes de escribir una línea de código.

### 0.1 Protocolo de trabajo

1. **Una tarea a la vez.** Cada tarea de §5 tiene un ID (`A1`, `B3`, …). No
   empieces una sin haber cerrado sus dependencias.
2. **Registra todo en `AGENTS_LOG.md`** con este formato, una línea por evento:
   ```
   [A4] 2026-07-23T10:22Z | done | máscara box-shadow lista, 6 tests verdes
   [A8] 2026-07-23T11:05Z | blocked | dialog modal bloquea pointer-events en pasos await
   ```
   Estados válidos: `started` · `done` · `blocked` · `needs-review`.
3. **No inventes alcance.** Si algo no está en `SPEC.md` ni aquí, va a
   `AGENTS_LOG.md` bajo `## Preguntas abiertas` y sigues con otra tarea.
4. **Definition of Done es literal.** Una tarea está terminada cuando su comando
   de verificación pasa, no cuando "ya quedó".
5. **Checkpoints humanos.** En §7 hay 4 puntos marcados `⏸ CHECKPOINT`. Al
   llegar, detente y pide revisión. No los cruces solo.

### 0.2 Restricciones técnicas no negociables

- TypeScript `strict: true`. Cero `any` implícito, cero `@ts-ignore` sin comentario justificando.
- `@waypoint/runtime` **solo puede depender de `@floating-ui/dom`**. Nada más.
- Presupuesto de bundle: **18 KB gzip** para runtime + floating-ui. Medido con `size-limit` en CI.
- Todo el CSS del runtime consume `var(--wp-*)`. Cero colores literales.
- Nada de `localStorage` para estado de sesión del tour; va en `sessionStorage`.
  `localStorage` solo para `onFinish.persist`.

### 0.3 Qué NO construir (recordatorio)

Apps nativas · editor visual · session replay · traducción automática ·
soporte a canvas/iframe/WebGL · A/B testing · SSR del overlay.

---

## 1. Bootstrap

```bash
mkdir waypoint && cd waypoint
pnpm init
pnpm add -D typescript vitest @vitest/coverage-v8 playwright @playwright/test \
  size-limit @size-limit/preset-small-lib tsup eslint prettier \
  @changesets/cli ajv ajv-formats
pnpm dlx changeset init
npx playwright install chromium
```

`pnpm-workspace.yaml`:

```yaml
packages:
  - 'packages/*'
  - 'examples/*'
```

`tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "declaration": true,
    "isolatedModules": true
  }
}
```

---

## 2. Árbol de archivos objetivo

Crea exactamente esta estructura. Los archivos marcados `[dado]` ya existen y se
copian tal cual, no se reescriben.

```
waypoint/
├── SPEC.md                                   [dado]
├── BUILD_PLAN.md                             [dado]
├── AGENTS_LOG.md                             ← crear vacío con las secciones de §0.1
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .github/workflows/ci.yml
│
├── packages/runtime/
│   ├── package.json
│   ├── src/
│   │   ├── index.ts                          ← API pública, clase Waypoint
│   │   ├── types.ts                          ← §3.1
│   │   ├── core/
│   │   │   ├── engine.ts                     ← máquina de estados, §3.2
│   │   │   ├── step-runner.ts                ← ejecuta un paso según su type
│   │   │   └── events.ts
│   │   ├── anchor/
│   │   │   ├── resolve.ts                    ← §4.1
│   │   │   └── observe.ts                    ← §4.2
│   │   ├── mask/
│   │   │   ├── index.ts                      ← selector de estrategia
│   │   │   ├── box-shadow.ts                 ← §4.3 estrategia A
│   │   │   └── svg-mask.ts                   ← estrategia B (grupos)
│   │   ├── layer/
│   │   │   └── layer-manager.ts              ← §4.4 top layer, resuelve riesgo A8
│   │   ├── cursor/
│   │   │   ├── cursor.ts                     ← §4.5
│   │   │   └── typing.ts                     ← §4.6, resuelve riesgo A9
│   │   ├── tooltip/
│   │   │   ├── tooltip.ts                    ← floating-ui
│   │   │   └── template.ts
│   │   ├── router/
│   │   │   ├── types.ts
│   │   │   ├── react-router.ts
│   │   │   ├── vue-router.ts
│   │   │   └── next.ts
│   │   ├── a11y/
│   │   │   ├── focus-trap.ts
│   │   │   └── announce.ts
│   │   ├── persist/session.ts
│   │   └── i18n/
│   │       ├── index.ts
│   │       └── es-MX.ts
│   ├── styles/tour.css                       ← §4.7, solo var(--wp-*)
│   └── test/
│
├── packages/react/src/{index.ts,provider.tsx,use-tour.ts}
├── packages/vue/src/{index.ts,plugin.ts,use-tour.ts}
│
├── packages/skill/
│   ├── SKILL.md                              [dado]
│   ├── schema/tour.schema.json               [dado]
│   ├── reference/
│   │   ├── tone.md                           [dado]
│   │   ├── forms.md                          [dado]
│   │   ├── selectors.md                      ← §6.1
│   │   ├── step-types.md                     ← §6.2
│   │   └── frameworks/{react.md,vue.md,next.md}
│   └── prompts/
│       ├── 02-analyze-view.md                ← §6.3
│       ├── 03-model-flow.md                  ← §6.4
│       ├── 04-write-copy.md                  ← §6.5
│       └── 05-repair.md                      ← §6.6
│
├── packages/cli/
│   ├── package.json                          ← bin: { waypoint: ./dist/cli.js }
│   └── src/
│       ├── cli.ts
│       ├── config.ts
│       ├── commands/{init,discover,anchor,tokens,verify,register,prompt,list,doctor}.ts
│       ├── detect/{framework.ts,router.ts,styles.ts,forms.ts}
│       ├── codemod/{inject-data-tour.ts,parse.ts}
│       ├── tokens/{tailwind.ts,css-vars.ts,emit.ts}
│       ├── verify/{runner.ts,checks.ts,report.ts}
│       └── agents/{claude.ts,cursor.ts,agents-md.ts}
│
├── examples/react-vite-crm/                   ← app de prueba, §5 D1
├── examples/vue-vite-pos/
└── e2e/
```

---

## 3. Contratos de interfaz

Estas firmas son el contrato entre tracks. **No las cambies sin actualizar este
documento y anotarlo en `AGENTS_LOG.md`.**

### 3.1 `runtime/src/types.ts`

```ts
export type StepType =
  | 'modal' | 'highlight' | 'input' | 'action'
  | 'await' | 'group' | 'navigate' | 'openModal';

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
    agent?: string; at?: string;
    sourceFiles?: string[]; sourceHash?: string;
  };
  steps: Step[];
  onFinish?: { persist?: string; message?: string; nextTour?: string };
}

export interface Hole {
  x: number; y: number; w: number; h: number; radius: string;
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
export interface TourEvent { tourId: string; at: number }
export interface StepEvent extends TourEvent { stepId: string; index: number; total: number }

export interface RouterAdapter {
  navigate(to: string): void | Promise<void>;
  current(): string;
  subscribe(cb: (path: string) => void): () => void;
}
```

### 3.2 Motor

```ts
export class TourEngine {
  constructor(tour: Tour, deps: EngineDeps);
  start(opts?: { fromStep?: string }): Promise<void>;
  next(): Promise<void>;
  prev(): Promise<void>;
  goTo(stepId: string): Promise<void>;
  abort(reason: AbortReason): void;
  destroy(): void;
  readonly state: Readonly<EngineState>;
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
```

### 3.3 Interfaces de subsistema

```ts
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
  destroy(): void;
}

export interface VirtualCursor {
  moveTo(x: number, y: number): Promise<void>;
  click(): Promise<void>;
  hide(): void;
  destroy(): void;
}

export interface ResolvedAnchor {
  el: HTMLElement;
  rect: DOMRect;
  radius: string;
}
```

### 3.4 `.tourmap.json` — salida de `discover`

```jsonc
{
  "generatedAt": "2026-07-23T10:00:00Z",
  "root": ".",
  "framework": "react",              // react | vue | next | angular | unknown
  "bundler": "vite",
  "router": { "kind": "react-router", "version": "6.22.0" },
  "styles": { "kind": "tailwind", "configPath": "tailwind.config.ts" },
  "forms": { "kind": "react-hook-form", "validator": "zod" },
  "views": [
    {
      "name": "Login",
      "route": "/login",
      "file": "src/pages/Login.tsx",
      "children": ["src/components/AuthForm.tsx"],
      "hasForm": true,
      "hasModal": false,
      "sourceHash": "sha256:..."
    }
  ]
}
```

### 3.5 `verify --json` — contrato que consume el agente

```jsonc
{
  "ok": false,
  "checkedAt": "2026-07-23T10:05:00Z",
  "baseUrl": "http://localhost:5173",
  "tours": [{
    "id": "login",
    "file": "tours/login.tour.json",
    "ok": false,
    "issues": [{
      "stepId": "email",
      "code": "ANCHOR_NOT_FOUND",
      "severity": "error",
      "message": "No existe [data-tour='login.email'] en /login",
      "hint": "Corre `npx waypoint anchor --view=Login` o revisa si el campo está dentro de un render condicional"
    }]
  }]
}
```

**Códigos de issue** (cerrados; `05-repair.md` mapea cada uno a una acción):

| Código | Severidad |
|---|---|
| `SCHEMA_INVALID` | error |
| `ANCHOR_NOT_FOUND` | error |
| `ANCHOR_NOT_VISIBLE` | error |
| `ANCHOR_OCCLUDED` | error |
| `ANCHOR_AMBIGUOUS` | error |
| `TOOLTIP_OVERFLOW` | error |
| `STEP_TIMEOUT` | error |
| `COPY_FORBIDDEN_TERM` | error |
| `COPY_TOO_LONG` | error |
| `TOO_MANY_STEPS` | error |
| `MISSING_DEMO_MODE` | error |
| `ANCHOR_FRAGILE` | warning |
| `CONTRAST_LOW` | warning |
| `SOURCE_DRIFT` | warning |
| `UNSUPPORTED_CONTEXT` | warning |

---

## 4. Algoritmos críticos — implementar tal cual

Estos resuelven los riesgos técnicos reales del proyecto. No los reinventes.

### 4.1 Resolución de ancla con cascada y reintento

```ts
const BACKOFF_MS = [100, 300, 900];

export async function resolveAnchor(
  a: Anchor,
  padding = 0
): Promise<ResolvedAnchor | null> {
  for (const delay of [0, ...BACKOFF_MS]) {
    if (delay) await new Promise(r => setTimeout(r, delay));

    const found = document.querySelectorAll<HTMLElement>(a.selector);
    let el = found[0] ?? null;

    if (!el && a.fallback) {
      el = document.querySelector<HTMLElement>(a.fallback);
    }
    if (!el) continue;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;

    return { el, rect, radius: cs.borderRadius || '0px' };
  }
  return null;
}
```

`ANCHOR_AMBIGUOUS` se reporta en `verify` si `found.length > 1`, pero en runtime
se usa el primero y se sigue: nunca romper el tour del usuario final.

### 4.2 Observación sincronizada — un solo rAF

```ts
export function observeAnchor(el: HTMLElement, onChange: () => void): () => void {
  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; onChange(); });
  };

  const ro = new ResizeObserver(schedule);
  ro.observe(el);
  ro.observe(document.documentElement);

  const mo = new MutationObserver(schedule);
  mo.observe(el, { attributes: true, childList: true, subtree: true });

  addEventListener('scroll', schedule, { passive: true, capture: true });
  addEventListener('resize', schedule, { passive: true });
  visualViewport?.addEventListener('resize', schedule);
  visualViewport?.addEventListener('scroll', schedule);

  return () => {
    if (frame) cancelAnimationFrame(frame);
    ro.disconnect(); mo.disconnect();
    removeEventListener('scroll', schedule, { capture: true } as EventListenerOptions);
    removeEventListener('resize', schedule);
    visualViewport?.removeEventListener('resize', schedule);
    visualViewport?.removeEventListener('scroll', schedule);
  };
}
```

### 4.3 Máscara estrategia A — box-shadow

```ts
export class BoxShadowMask implements MaskStrategy {
  private node: HTMLDivElement | null = null;

  mount(root: HTMLElement) {
    const d = document.createElement('div');
    d.className = 'wp-mask';
    root.appendChild(d);
    this.node = d;
  }

  update(holes: Hole[]) {
    const h = holes[0];
    if (!this.node || !h) return;
    Object.assign(this.node.style, {
      transform: `translate3d(${h.x}px, ${h.y}px, 0)`,
      width: `${h.w}px`,
      height: `${h.h}px`,
      borderRadius: h.radius,
      opacity: '1',
    });
  }

  clear() { if (this.node) this.node.style.opacity = '0'; }
  destroy() { this.node?.remove(); this.node = null; }
}
```

```css
.wp-mask {
  position: fixed;
  top: 0; left: 0;
  pointer-events: none;
  box-shadow: 0 0 0 9999px var(--wp-overlay-color, rgba(0,0,0,.55));
  transition: transform 320ms cubic-bezier(.4,0,.2,1),
              width 320ms cubic-bezier(.4,0,.2,1),
              height 320ms cubic-bezier(.4,0,.2,1),
              border-radius 200ms linear;
}
@media (prefers-reduced-motion: reduce) { .wp-mask { transition: none; } }
```

Si `holes.length > 1`, el selector de §`mask/index.ts` cambia a `SvgMask`.

### 4.4 Top layer — resuelve el riesgo A8

El conflicto es real: `<dialog>.showModal()` da top layer pero vuelve inerte el
fondo, lo que impide los pasos `await` donde el usuario debe interactuar de
verdad. **La solución no es un dialog no-modal** (`show()` no entra al top
layer). Es la Popover API:

| Modo | Elemento | Top layer | ¿Bloquea el fondo? | Se usa en |
|---|---|---|---|---|
| `blocking` | `<dialog>` + `showModal()` | sí | sí | `modal`, `highlight` |
| `passthrough` | `[popover=manual]` + `showPopover()` | sí | no | `input`, `action`, `await`, `openModal`, `group` |

```ts
export class TopLayerManager implements LayerManager {
  private dialog = document.createElement('dialog');
  private pop = document.createElement('div');
  private mode: LayerMode = 'blocking';

  mount(mode: LayerMode): HTMLElement {
    this.dialog.className = 'wp-layer wp-layer--blocking';
    this.pop.className = 'wp-layer wp-layer--pass';
    this.pop.setAttribute('popover', 'manual');
    document.body.append(this.dialog, this.pop);
    this.setMode(mode);
    return this.host();
  }

  setMode(mode: LayerMode) {
    if (mode === this.mode && this.isOpen()) return;
    this.closeAll();
    this.mode = mode;
    if (mode === 'blocking') this.dialog.showModal();
    else this.pop.showPopover();
  }

  host(): HTMLElement {
    return this.mode === 'blocking' ? this.dialog : this.pop;
  }
  // closeAll(), isOpen(), destroy() …
}
```

**Fallback obligatorio.** Si `HTMLElement.prototype.showPopover` no existe, usa
un `<div>` con `z-index: var(--wp-z, 2147483000)` y avisa una vez por consola.
Cubre Safari < 17 y navegadores embebidos.

Al cambiar de modo, el contenido (máscara, tooltip, cursor) se reparenta al nuevo
host. Diséñalo desde el inicio: los subsistemas reciben su `root` en `mount()` y
deben soportar `remount(newRoot)`.

### 4.5 Cursor virtual

```ts
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)');

async moveTo(x: number, y: number): Promise<void> {
  const from = this.pos;
  const dist = Math.hypot(x - from.x, y - from.y);
  const dur = Math.min(900, Math.max(300, dist * 0.6));
  this.pos = { x, y };

  if (REDUCED.matches || this.forceReduced) {
    this.node.style.transform = `translate3d(${x}px,${y}px,0)`;
    return;
  }

  // curva bezier cuadrática con punto de control desplazado perpendicular
  const mx = (from.x + x) / 2 + (y - from.y) * 0.18;
  const my = (from.y + y) / 2 - (x - from.x) * 0.18;
  const frames = Array.from({ length: 24 }, (_, i) => {
    const t = i / 23, u = 1 - t;
    const px = u*u*from.x + 2*u*t*mx + t*t*x;
    const py = u*u*from.y + 2*u*t*my + t*t*y;
    return { transform: `translate3d(${px}px,${py}px,0)` };
  });

  await this.node.animate(frames, {
    duration: dur, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards'
  }).finished;
}
```

### 4.6 Escritura en inputs controlados — resuelve el riesgo A9

React y Vue ignoran `el.value = x` porque interceptan el setter del prototipo.
Hay que llamar al setter nativo y disparar el evento manualmente.

```ts
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (!setter) { el.value = value; return; }
  setter.call(el, value);
}

export async function typeInto(
  el: HTMLInputElement | HTMLTextAreaElement,
  text: string,
  speedMs = 45,
  reduced = false
): Promise<void> {
  el.focus();
  if (reduced) {
    setNativeValue(el, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  for (let i = 1; i <= text.length; i++) {
    setNativeValue(el, text.slice(0, i));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, speedMs));
  }
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));
}
```

Para `<select>`: `setNativeValue` + `change`. Para checkbox/radio: click nativo.
Para editores enriquecidos (contenteditable, CodeMirror, Quill): **no soportado**,
emite `UNSUPPORTED_CONTEXT` y convierte el paso a `highlight`.

### 4.7 Variables de tema

`styles/tour.css` solo puede usar estas, con fallback neutro incluido:

```
--wp-surface --wp-surface-2 --wp-text --wp-text-muted --wp-accent
--wp-accent-text --wp-border --wp-radius --wp-shadow --wp-font
--wp-font-size --wp-overlay-color --wp-overlay-opacity --wp-z
```

Test de aceptación: cambiar esas 14 variables cambia el 100% del aspecto del
tour, sin tocar una línea de CSS del runtime.

### 4.8 Intercepción de demoMode

```ts
function guardSubmit(root: HTMLElement, step: Step, demoMode: boolean) {
  if (!demoMode || step.sideEffect === 'none') return () => {};
  const form = step.anchorEl?.closest('form');
  if (!form) return () => {};
  const h = (e: Event) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    showDemoToast();  // "Aquí se guardaría tu información"
  };
  form.addEventListener('submit', h, { capture: true });
  return () => form.removeEventListener('submit', h, { capture: true });
}
```

Se registra en `capture: true` para ganarle a los handlers de la app.

---

## 5. Tareas

Formato: `ID · tarea · depende de · **DoD** (comando o criterio literal)`.

### Track A — Runtime

| ID | Tarea | Dep. | Definition of Done |
|---|---|---|---|
| A1 | Monorepo, tsconfig, tsup, size-limit, CI base | — | `pnpm build && pnpm size` verde |
| **A8** | **Spike top layer** (§4.4): dialog vs popover, reparenting, fallback | A1 | Demo estático: modo `blocking` bloquea el fondo, `passthrough` deja hacer click en un botón real debajo. Ambos por encima de un modal de la app con `z-index:9999` |
| **A9** | **Spike escritura** (§4.6) en React controlled + Vue `v-model` + react-hook-form | A1 | El valor persiste tras el `input` y el estado del framework lo refleja. Verificado en los 3 casos |
| A2 | Cargar `tour.schema.json` + validador ajv | A1 | Los 5 casos de rechazo del schema fallan y el caso bueno pasa |
| A3 | `anchor/resolve.ts` + `observe.ts` (§4.1, §4.2) | A1 | Test: ancla eliminada del DOM → `null` tras 3 reintentos, sin excepción. Un solo rAF por ráfaga de eventos |
| A4 | `mask/box-shadow.ts` (§4.3) | A3, A8 | Recorte sigue al elemento en scroll, resize y zoom. 60fps en throttling 4× de CPU |
| A5 | `tooltip/` con floating-ui: `offset(12) flip() shift({padding:8}) arrow() size()` | A3, A8 | Cabe y es legible en 375×667 y 1440×900. Nunca se sale del viewport |
| A6 | `cursor/cursor.ts` (§4.5) | A3, A8 | Trayectoria curva suave; con `prefers-reduced-motion` salta sin animar |
| A7 | `core/engine.ts` + `step-runner.ts`: los 8 tipos de paso | A2,A4,A5,A6,A9 | Tour de 8 pasos avanza, retrocede y se destruye sin fugas de listeners (assert de conteo antes/después) |
| A10 | `a11y/`: focus trap, `aria-live`, teclado ←/→/Esc | A7 | `axe-core` sin violaciones críticas. Recorrido completo solo con teclado |
| A11 | `persist/session.ts` + `resume()` | A7 | Recargar a mitad del tour reanuda en el mismo paso |
| A12 | Theming: `styles/tour.css` con las 14 variables (§4.7) | A5 | Cambiar las 14 variables cambia todo el aspecto; grep de colores literales en el CSS da 0 |
| A13 | `@waypoint/react` y `@waypoint/vue` | A7 | `<WaypointProvider>` + `useTour()` funcionan en ambos examples |
| A14 | `mask/svg-mask.ts` para `type: "group"` | A4 | Dos huecos simultáneos con transición suave |
| A15 | Adaptadores de router (RR6, Vue Router 4, Next App Router) | A11 | Tour de 3 rutas se reanuda solo tras cada navegación |
| A16 | `i18n/` con diccionario `es-MX` | A5 | Cero strings hardcodeados en la UI del tour |
| A17 | `demoMode` guard (§4.8) | A7 | Un submit real nunca sale a la red con `demoMode: true` |

### Track B — CLI

| ID | Tarea | Dep. | Definition of Done |
|---|---|---|---|
| B1 | Esqueleto CLI, `config.ts`, logger, `--json` global | A1 | `npx waypoint --help` lista los 9 comandos |
| B2 | `discover` + `detect/*` | B1 | `.tourmap.json` correcto en los dos examples, incluido `hasForm` y `sourceHash` |
| B3 | `anchor` — codemod idempotente sobre AST (ts-morph / @babel/parser + recast) | B2 | Correrlo 2× no duplica atributos ni reformatea el archivo. `--dry-run` imprime diff |
| B4 | `tokens` — extractor Tailwind + CSS custom properties | B2 | `theme.css` válido en ambos examples; mapea las 14 variables |
| B5 | `init` — instala runtime, escribe skill del agente, crea `tours/` | B2,B3,B4 | <2 min en un proyecto Vite limpio, sin preguntas más allá del agente |
| B6 | `verify` — runner Playwright + los 15 checks de §3.5 | A7, B2 | Detecta ancla rota, término prohibido, contraste bajo y overflow de tooltip en un tour sembrado a propósito |
| B7 | `verify --json` estable | B6 | La salida valida contra un schema propio; el agente la parsea sin heurísticas |
| B8 | `register` + generador de sección de Ayuda | B6 | `index.json` correcto; el componente de Ayuda lee el índice, no hardcodea |
| B9 | `prompt --view=X` | B2 | Salida pegable en un chat, autocontenida, sin rutas absolutas |
| B10 | `doctor` + detección de drift por `sourceHash` | B6 | Modificar la vista genera `SOURCE_DRIFT` |
| B11 | Acción de CI | B6 | Un PR que renombra un botón anclado hace fallar el workflow |

### Track C — Skill

| ID | Tarea | Dep. | Definition of Done |
|---|---|---|---|
| C1 | Copiar `SKILL.md` [dado] a `packages/skill/` | — | `wc -l` ≤ 200 |
| C2 | Copiar `tone.md` [dado]; exportar la lista negra como JSON para B6 | C1 | B6 importa la lista de un solo lugar |
| C3 | Copiar `forms.md` [dado] | C1 | — |
| C4 | Escribir `selectors.md` (§6.1) y `step-types.md` (§6.2) | C1, A2 | Cada uno cubre los 8 tipos / las 4 estrategias |
| C5 | Prompts `02`, `03`, `04` (§6.3–6.5) | C1 | Cada uno autocontenido, ≤120 líneas |
| C6 | Prompt `05-repair.md` (§6.6) | B7 | Mapea los 15 códigos a una acción concreta |
| C7 | Adaptadores de agente: `.cursor/rules/*.mdc`, bloque en `AGENTS.md` | C1, B5 | Cursor dispara la skill con "haz un tour del login" |
| C8 | `reference/frameworks/{react,vue,next}.md` | C1 | Cada uno explica cómo localizar vistas y validaciones en ese framework |

### Track D — Ejemplos y pruebas

| ID | Tarea | Dep. | Definition of Done |
|---|---|---|---|
| D1 | `examples/react-vite-crm`: login, dashboard con tabla, alta de cliente (13 campos, condicional por tipo de persona), modal de confirmación, estados vacío/error | A1 | Cubre los 8 tipos de paso y al menos 2 renders condicionales |
| D2 | `examples/vue-vite-pos` | A13 | Equivalente funcional |
| D3 | Tours **escritos a mano** para D1 | A7, D1 | Son la prueba real del runtime en Fase 1 |
| D4 | Suite e2e Playwright | A10, D3 | Verde en CI, incluye recorrido con teclado |
| D5 | Banco de evaluación de la skill: 10 prompts × 3 agentes | C1, B6 | Métrica O2 (≥80% de pasos pasan al primer intento) medible y registrada |

---

## 6. Contenido de los archivos pendientes de la skill

### 6.1 `reference/selectors.md`

Debe contener: la cascada `data-tour` → `data-testid` → inyectar → CSS `fragile`;
la convención de nombres `vista.elemento` en kebab/dot; qué hacer con listas
(`data-tour="pedidos.fila"` + `:first-of-type`); qué NO anclar (elementos que se
desmontan, portales sin ID estable, nodos dentro de canvas/iframe); y la regla de
que un selector CSS siempre lleva `fragile: true`.

### 6.2 `reference/step-types.md`

Tabla de los 8 tipos con: cuándo usarlo, campos obligatorios, error típico. Debe
incluir el árbol de decisión: *¿el usuario solo mira?* → `highlight`. *¿escribe?*
→ `input`. *¿tiene que hacerlo él con datos reales?* → `await`. *¿son varios
elementos de una sección?* → `group`.

### 6.3 `prompts/02-analyze-view.md`

Guía de lectura de código: qué buscar, hasta qué profundidad, cómo detectar
renders condicionales y estados. Salida esperada: inventario estructurado en
memoria, **no** archivo.

### 6.4 `prompts/03-model-flow.md`

Cómo construir el happy path. Preguntas guía: ¿por dónde entra el usuario? ¿qué
es lo primero que tiene que hacer? ¿qué puede ignorar? ¿dónde se atora la gente?
Regla de agrupación y límite de 12.

### 6.5 `prompts/04-write-copy.md`

Recordatorio de leer `tone.md`, plantilla del JSON, cómo llenar `generatedBy`,
checklist final antes de escribir el archivo.

### 6.6 `prompts/05-repair.md`

Tabla código → acción. Ejemplos:

| Código | Acción |
|---|---|
| `ANCHOR_NOT_FOUND` | Correr `waypoint anchor` de nuevo; si persiste, el elemento está tras render condicional → agregar paso previo que lo dispare, o `skipIf` |
| `ANCHOR_NOT_VISIBLE` | Agregar paso `action` que abra el acordeón/tab contenedor |
| `ANCHOR_OCCLUDED` | Revisar si un sticky header lo tapa; ajustar `scrollIntoView` o cambiar de ancla |
| `TOOLTIP_OVERFLOW` | Cambiar `placement` a `auto`, o acortar `body` |
| `COPY_FORBIDDEN_TERM` | Reescribir con `tone.md`; nunca sinonimizar la jerga, replantear la frase |
| `TOO_MANY_STEPS` | Agrupar con `type: "group"` o partir en dos tours con `onFinish.nextTour` |
| `SOURCE_DRIFT` | Volver a FASE 1 completa para esa vista |

---

## 7. Orden de ejecución y checkpoints

```
SEMANA 1   A1
           ├─ A8  spike top layer      ⚠ puede cambiar el diseño
           └─ A9  spike escritura      ⚠ puede cambiar el diseño
           A2, A3, D1
           ⏸ CHECKPOINT 1 — revisión humana de los spikes.
             Si A8 o A9 fallan, se replantea §4.4 / §4.6 antes de seguir.

SEMANA 2   A4, A5, A6 en paralelo → A7 → A17

SEMANA 3   A10, A11, A12, A16, D3, D4
           ⏸ CHECKPOINT 2 — CIERRE FASE 1
             Criterio: tour de login hecho a mano se ve nativo, sobrevive
             scroll/resize/teclado, bundle ≤18 KB gzip.

SEMANA 4   B1, B2 · C1, C2, C3 en paralelo

SEMANA 5   B3, B4 · C4, C5, C8

SEMANA 6   B5, B9, A13, D2
           ⏸ CHECKPOINT 3 — CIERRE FASE 2
             Criterio: "haz un tour del login" produce JSON válido y usable sin
             edición manual, con Claude Code y con Cursor.

SEMANA 7   B6, B7, A14

SEMANA 8   C6, B8, B10, B11, A15, D5
           ⏸ CHECKPOINT 4 — CIERRE FASE 3
             Criterio: ≥80% de pasos pasan al primer intento, ≥95% tras el loop
             de reparación. Un PR rompe-tour falla el CI.
```

### Ruta crítica

`A1 → A8/A9 → A7 → B6`. Todo lo demás puede reordenarse; esto no.

---

## 8. Comandos de verificación

```bash
pnpm build                       # todos los paquetes compilan
pnpm test                        # vitest, cobertura ≥70% en runtime/core
pnpm size                        # runtime ≤18 KB gzip — FALLA si se pasa
pnpm e2e                         # Playwright contra los examples
pnpm lint && pnpm typecheck

# extremo a extremo del producto
cd examples/react-vite-crm
npx waypoint discover
npx waypoint anchor --view=Login
npx waypoint tokens
npx waypoint verify tours/login.tour.json --json
```

### Gate de CI

El workflow falla si: `size` excede el presupuesto · `verify --all --ci` reporta
cualquier `error` · `axe` reporta violación crítica · cobertura de
`runtime/core` < 70%.

---

## 9. Decisiones pendientes que bloquean Fase 2

No las tomes tú. Escríbelas en `AGENTS_LOG.md` y espera respuesta.

1. Nombre definitivo y disponibilidad en npm (`waypoint` casi seguro está tomado).
2. ¿El tier gratuito limita por tours o por proyectos?
3. ¿`init` hace commit del codemod o lo deja en el working tree?
4. Idioma por defecto: ¿`lang` del HTML, config, o pregunta en `init`?
5. Angular: ¿v1 o v2? Recomendación del spec: diferir.
