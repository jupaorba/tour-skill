# FASE 5 · Redactar el tour

## Antes de escribir una sola palabra

1. Lee `reference/tone.md` completo. Sin excepción, aunque ya lo hayas leído
   en una sesión anterior — las reglas y la lista negra son las que hacen
   fallar `verify`.
2. Si `.tourmap.json` marca `hasForm: true` para esta vista, lee también
   `reference/forms.md`.
3. Ten a mano la lista de pasos que armaste en FASE 2 (modelo de flujo) y
   los selectores reales que produjo FASE 3 (`npx waypoint anchor`).

## Plantilla del JSON

```jsonc
{
  "id": "kebab-case-igual-al-nombre-de-archivo",
  "specVersion": 1,
  "title": "3 a 8 palabras, dice qué va a aprender el usuario",
  "description": "Opcional, máx 160 caracteres",
  "route": "/la-ruta-de-la-vista",
  "audience": "end-user",
  "locale": "es-MX",
  "demoMode": true,
  "generatedBy": {
    "agent": "tu-identificador-de-agente",
    "at": "2026-07-23T10:00:00Z",
    "sourceFiles": ["src/pages/Vista.tsx", "src/components/HijoUsado.tsx"],
    "sourceHash": "sha256:... (cópialo del sourceHash de .tourmap.json para esta vista)"
  },
  "steps": [
    { "id": "intro", "type": "modal", "body": "..." },
    { "id": "...", "type": "...", "anchor": { "selector": "...", "strategy": "data-tour" }, "body": "..." }
  ],
  "onFinish": { "message": "..." }
}
```

## Checklist final antes de guardar `tours/<id>.tour.json`

- [ ] El primer paso (`type: "modal"`) promete algo concreto y acota el
      tiempo (ver `tone.md`, sección "Paso de intro y paso de cierre").
- [ ] El último paso cierra el ciclo: dice qué pasa, cuánto tarda, cómo sabe
      el usuario que funcionó. Si termina un formulario, aplica `forms.md`
      Regla 6.
- [ ] Cada `body` tiene ~25 palabras o menos (objetivo real de `tone.md`;
      220 caracteres es el límite duro del schema, no la meta).
- [ ] Ningún `title`/`body` usa un término de la lista negra de `tone.md`.
- [ ] Cada `anchor.selector` salió de `.tourmap.json`/`anchor`, no lo
      inventaste.
- [ ] `demoValue` en todo paso `input`, siempre con datos ficticios (nunca
      copiados de seeds/fixtures/BD real).
- [ ] `sideEffect` marcado en cualquier paso que toque el servidor, y
      `demoMode: true` en el tour si algún paso es `"network"` o
      `"destructive"`.
- [ ] 12 pasos o menos.
- [ ] `generatedBy.sourceFiles` y `sourceHash` llenos — sin esto, `verify`
      no puede detectar `SOURCE_DRIFT` cuando la vista cambie después.

Cuando el checklist esté completo, escribe el archivo. El siguiente paso no
es opcional: FASE 6 (`npx waypoint verify`).
