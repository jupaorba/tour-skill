# Waypoint

Tours guiados interactivos para apps web: un agente de IA lee tu código,
entiende el flujo, y produce un `*.tour.json` que el runtime convierte en un
tutorial con máscara de enfoque, cursor animado y textos en español neutro.
Tú no escribes CSS ni lógica de overlay — eso ya existe. Tú (o tu agente)
decides orden, agrupación y redacción.

## Paquetes

| Paquete | Qué es |
|---|---|
| [`@waypoint-tours/runtime`](packages/runtime) | Motor: máscara, cursor, tooltip, máquina de estados. Sin dependencias salvo `@floating-ui/dom`. ≤18 KB gzip. |
| [`@waypoint-tours/react`](packages/react) | `<WaypointProvider>` + `useTour()`. |
| [`@waypoint-tours/vue`](packages/vue) | Plugin + `useTour()` para Vue 3. |
| [`@waypoint-tours/cli`](packages/cli) | `npx waypoint <comando>` — descubre vistas, ancla elementos, extrae design tokens, verifica tours en un navegador real. |
| [`packages/skill`](packages/skill) | La skill que usa un agente (Claude Code, Cursor, cualquiera) para generar los `.tour.json`. |

## Instalación rápida

```bash
npm install @waypoint-tours/runtime @waypoint-tours/react
npm install -D @waypoint-tours/cli
npx waypoint init
```

`init` agrega las dependencias correctas según tu framework, crea `tours/`, e
instala la skill para tu agente (`.claude/skills/waypoint-tours/` para
Claude Code, `.cursor/rules/waypoint-tours.mdc` para Cursor, y un bloque en
`AGENTS.md` para cualquier otro). No hace `git commit` — revisa el diff tú
mismo.

## Uso en la app (React)

```tsx
import { WaypointProvider } from '@waypoint-tours/react';
import '@waypoint-tours/runtime/styles.css';
import toursIndex from '../tours/index.json';

<WaypointProvider
  tours={async () => {
    const entries = await Promise.all(
      toursIndex.tours.map(async (t) => [t.id, (await import(`../${t.file}`)).default])
    );
    return Object.fromEntries(entries);
  }}
  locale="es-MX"
>
  <App />
</WaypointProvider>;
```

```tsx
const { start } = useTour();
<button onClick={() => start('login')}>¿Cómo funciona?</button>;
```

## Pipeline del agente (resumen — ver `packages/skill/SKILL.md`)

```
npx waypoint discover          → .tourmap.json (framework, router, rutas → archivos)
(el agente analiza la vista y modela el flujo)
npx waypoint anchor --view=X   → inyecta data-tour="x.elemento" (codemod idempotente)
npx waypoint tokens            → tours/theme.css con tus design tokens reales
(el agente escribe tours/<id>.tour.json)
npx waypoint verify tours/<id>.tour.json --json → hasta 3 ciclos de reparación
npx waypoint register          → tours/index.json
```

## Desarrollo de este repo

```bash
npm install
npm run build
npm run typecheck
npm test              # vitest — algoritmos puros + validación de schema
npm run size           # presupuesto de 18 KB gzip del runtime
npm run e2e             # Playwright contra examples/react-vite-crm

cd examples/react-vite-crm && npm run dev   # levantar el ejemplo
```

Ver `BUILD_PLAN.md` para los contratos de interfaz y algoritmos críticos, y
`AGENTS_LOG.md` para las decisiones tomadas durante la construcción
(incluye las desviaciones frente al plan original: npm workspaces en vez de
pnpm, y el ejemplo de Vue diferido).

## Qué NO hace (por diseño)

Apps nativas, editor visual, session replay, traducción automática,
soporte a canvas/iframe/WebGL, A/B testing, SSR del overlay.
