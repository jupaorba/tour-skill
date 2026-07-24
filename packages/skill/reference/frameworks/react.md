# React (con React Router)

## Ubicar la vista

`.tourmap.json` ya resolvió `route → file` corriendo `waypoint discover`
(lee `<Route path="..." element={<X/>}>` o el array de
`createBrowserRouter`). Si la vista no aparece ahí, probablemente:

- Usa rutas anidadas con `<Outlet/>` — el `path` que ves en `.tourmap.json`
  puede ser relativo al padre. Revisa el archivo de rutas padre para armar
  la ruta completa.
- El componente se importa dinámicamente (`React.lazy`) — el codemod de
  `discover` no sigue imports dinámicos en esta versión. Dile al humano y
  usa `.tourmap.json` como punto de partida, no como verdad absoluta.

## Renderizado condicional

Busca patrones `v-if`-equivalentes de React:

```tsx
{isLoading && <Spinner />}
{error ? <ErrorBanner message={error} /> : null}
{step === 2 && <DireccionForm />}
{user.role === 'admin' && <AdminPanel />}
```

Cada uno es un **estado** que tu tour debe contemplar (ver FASE 1 del
SKILL.md). Si un elemento que quieres anclar vive dentro de una de estas
condiciones, o el paso anterior debe disparar la condición, o el paso actual
necesita `skipIf`.

## Formularios

Orden de confianza para leer validación real (ver `forms.md` Regla 2):

1. `react-hook-form` + `zodResolver`/`yupResolver` — lee el schema de Zod/Yup
   directamente, ahí está la validación real, no en el JSX.
2. `Formik` + `validationSchema` — mismo patrón.
3. Atributos HTML nativos en el `<input>`: `required`, `pattern`, `minLength`,
   `min`, `max`.
4. Validación manual dentro de `onSubmit` u `onChange` — la última opción,
   suele ser menos confiable de traducir.

`.tourmap.json` ya te dice si `forms.kind` es `react-hook-form` y
`forms.validator` es `zod`/`yup` — empieza por ahí.

## Modales

Busca `Dialog`, `Modal`, `Drawer` de tu librería de UI (Radix, Headless UI,
MUI, shadcn/ui) o un patrón `isOpen` + `onOpenChange`. Un modal que se abre
desde la vista es candidato a paso `openModal`.
