# Next.js (App Router)

## Ubicar la vista

`.tourmap.json` resolvió la ruta a partir de la estructura de carpetas de
`app/` (o `src/app/`): cada `page.tsx` define una ruta. Las convenciones que
ya traduce `discover`:

- `app/dashboard/page.tsx` → `/dashboard`
- `app/(marketing)/precios/page.tsx` → `/precios` (los route groups entre
  paréntesis no cuentan como segmento de URL)
- `app/clientes/[id]/page.tsx` → `/clientes/:id`
- `app/blog/[...slug]/page.tsx` → `/blog/*`

Si la vista usa Parallel Routes (`@modal`) o Intercepting Routes
(`(.)foto`), `discover` no las distingue en esta versión — trátalas como la
ruta base y avisa al humano si el tour necesita cubrir el estado
interceptado por separado.

## Client vs Server Components

Antes de anclar nada, revisa si el archivo tiene `'use client'` al inicio:

- **Sin `'use client'`** (Server Component): no hay `onClick`, no hay
  estado, no hay `useState`/`useEffect`. Los elementos interactivos reales
  casi siempre viven en un componente hijo con `'use client'` — sigue el
  import hasta encontrarlo, es ahí donde el codemod `anchor` debe correr.
- **Con `'use client'`**: se comporta como React normal, aplica todo lo de
  `reference/frameworks/react.md`.

## Renderizado condicional y estados

Mismo patrón que React (`{isLoading && <Spinner/>}`), más los específicos de
Next: `loading.tsx` (estado de carga automático de la ruta) y `error.tsx`
(boundary de error automático). Si tu tour necesita cubrir el estado de
carga real de la ruta, es ese archivo, no una condición dentro de
`page.tsx`.

## Formularios y Server Actions

Si el formulario usa una Server Action (`action={miServerAction}` en el
`<form>`), la validación real casi siempre vive en la función del servidor,
no en el cliente. Búscala en el archivo de la Server Action (normalmente con
`'use server'` al inicio) y aplica el mismo orden de confianza de
`forms.md` Regla 2 sobre lo que encuentres ahí (Zod es el validador más común
en Server Actions).

## Navegación

Los pasos `type: "navigate"` en Next usan `router.push()` de
`next/navigation` (App Router), no `next/router` (Pages Router, obsoleto).
Si el proyecto todavía usa `pages/`, trátalo como el flujo de React Router
clásico y avisa al humano — esta skill prioriza App Router.
