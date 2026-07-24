# Selectores

## La cascada

1. **`data-tour`** — el único selector que deberías escribir tú. Nunca lo
   inventes a mano: sale de correr `npx waypoint anchor --view=<Vista>`
   (FASE 3). El codemod es idempotente, córrelo las veces que necesites.
2. **`data-testid`** — si la vista ya tiene testids estables y consistentes,
   `anchor` los reutiliza en vez de duplicar atributos. Nunca los agrega si
   no existían.
3. **Inyectar** — cuando no hay ni `data-tour` ni `data-testid`, el codemod
   agrega `data-tour` nuevo.
4. **CSS crudo** (`strategy: "css"`) o **texto** (`strategy: "text"`) —
   último recurso. El schema **obliga** `"fragile": true` en ambos casos.
   Úsalos solo cuando el elemento vive fuera de tu control (ej. un
   componente de terceros que no acepta props de atributo) y anótalo también
   en `AGENTS_LOG.md` bajo preguntas abiertas si te bloquea.

## Convención de nombres

`vista.elemento` en kebab-case con punto separador:

```
"login.email"
"login.submit"
"alta-cliente.tipo-persona"
"alta-cliente.direccion.codigo-postal"
```

- `vista`: nombre de la vista tal como aparece en `.tourmap.json` (`name`),
  en kebab-case.
- `elemento`: describe QUÉ es, no dónde está. `"login.boton-azul"` está mal;
  `"login.submit"` está bien.

## Listas y elementos repetidos

Para una fila de una tabla o un ítem de lista, ancla el contenedor y usa un
selector posicional acotado:

```json
{ "selector": "[data-tour=\"pedidos.fila\"]:first-of-type", "strategy": "css", "fragile": true }
```

Prefiere siempre que el codemod pueda anclar el *contenedor* de la lista con
`data-tour="pedidos.fila"` (sin duplicarlo en cada fila) y dejar que el
`:first-of-type` seleccione la primera instancia. Si la lista puede estar
vacía cuando corre el tour, agrega `skipIf` apuntando a un selector que solo
exista cuando hay datos.

## Qué NO anclar

- Elementos que se desmontan antes de que el usuario llegue a ese paso
  (por ejemplo, un toast que desaparece en 3 segundos).
- Portales sin ID estable (un `Portal` de UI library que genera su propio
  nodo cada render sin `data-tour` propagado — pide al humano que lo
  propague como prop, no inventes un selector fragile para esquivarlo).
- Nodos dentro de `<canvas>`, `<iframe>` o WebGL. El runtime no tiene forma
  de anclar dentro de esos contextos (ver `UNSUPPORTED_CONTEXT` en
  `05-repair.md`); convierte ese paso a `highlight` sobre el contenedor
  externo, o quítalo del tour.

## Regla dura

Cualquier `anchor` con `strategy: "css"` o `"text"` **siempre** lleva
`"fragile": true`. El schema lo rechaza si falta. `verify` además emite
`ANCHOR_FRAGILE` (warning) para que sepas cuáles conviene reemplazar con
`data-tour` en cuanto puedas volver a correr `anchor`.
