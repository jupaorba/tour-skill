import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '../logger.js';

const RULE = `---
description: Genera tours guiados interactivos con Waypoint cuando el usuario pida un tour, tutorial, onboarding o ayuda contextual de una vista.
globs:
alwaysApply: false
---

# Waypoint — generador de tours guiados

Cuando el usuario pida un tour, tutorial, onboarding o guía de usuario para
alguna vista de esta app, sigue el pipeline completo descrito en
\`.claude/skills/waypoint-tours/SKILL.md\` (7 fases, en orden). No inventes
selectores ni te saltes FASE 3 (\`npx waypoint anchor\`) ni FASE 6
(\`npx waypoint verify\`).

Lee \`.claude/skills/waypoint-tours/reference/tone.md\` antes de escribir
cualquier texto, y \`reference/forms.md\` si la vista tiene formulario.
`;

/** Cursor no tiene sistema de skills; se traduce a una regla en .cursor/rules/. */
export function installCursorRule(projectRoot: string): string {
  const dir = join(projectRoot, '.cursor', 'rules');
  const dest = join(dir, 'waypoint-tours.mdc');

  if (existsSync(dest)) {
    logger.warn(`${dest} ya existe. No se sobreescribe.`);
    return dest;
  }

  mkdirSync(dir, { recursive: true });
  writeFileSync(dest, RULE, 'utf-8');
  logger.ok(`Regla de Cursor instalada en ${dest}`);
  return dest;
}
