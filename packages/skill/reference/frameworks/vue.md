# Vue (con Vue Router)

## Ubicar la vista

`.tourmap.json` resolvió `route → file` leyendo el array `routes` de
`createRouter({...})`, tanto `component: Home` (import estático) como
`component: () => import('./views/Home.vue')` (lazy). Si tu proyecto define
las rutas en varios archivos (`routes/admin.ts`, `routes/public.ts`
combinados con `...adminRoutes`), `discover` solo sigue el archivo que
contiene el `createRouter(...)` — dile al humano si faltan vistas.

## Renderizado condicional

Los equivalentes de Vue a vigilar en el `<template>`:

```vue
<Spinner v-if="isLoading" />
<ErrorBanner v-else-if="error" :message="error" />
<DireccionForm v-if="step === 2" />
<AdminPanel v-if="user.role === 'admin'" />
```

Igual que en React: cada `v-if`/`v-else-if` es un estado que tu tour debe
contemplar. Si el elemento a anclar depende de uno de estos, usa `skipIf` o
agrega un paso previo que dispare la condición.

## Formularios

Orden de confianza (ver `forms.md` Regla 2):

1. `vee-validate` + `zod`/`yup` como schema — la validación real vive en el
   schema, no en el `<template>`.
2. `FormKit` — su config de validación declarativa (`validation="required|email"`).
3. Atributos HTML nativos: `required`, `pattern`, `minlength`.
4. Validación manual en un `watch` o en el handler de `@submit`.

`.tourmap.json` te dice `forms.kind` (`vee-validate`/`formkit`/`native`) y
`forms.validator` — empieza por ahí antes de leer el `<script setup>` entero.

## Modales

Busca componentes `Modal`, `Dialog`, `Drawer` de tu librería (Headless UI
Vue, PrimeVue, Vuetify) o un patrón `v-model:open` / `visible.sync`. Un
modal que se abre desde la vista es candidato a paso `openModal`.
