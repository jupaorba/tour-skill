import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Tourmap } from './discover.js';
import type { WaypointConfig, CliGlobalOpts } from '../config.js';
import { logger } from '../logger.js';

export interface PromptOpts extends CliGlobalOpts {
  view: string;
}

/**
 * Salida pegable en cualquier chat de agente: sin rutas absolutas, sin
 * asumir que el agente tiene el repo abierto. Se basta a sí misma.
 */
export function runPrompt(config: WaypointConfig, opts: PromptOpts): string {
  if (!existsSync(config.tourmapPath)) {
    logger.error('No existe .tourmap.json. Corre `waypoint discover` primero.');
    process.exitCode = 1;
    return '';
  }

  const tourmap: Tourmap = JSON.parse(readFileSync(config.tourmapPath, 'utf-8'));
  const view = tourmap.views.find((v) => v.name === opts.view);
  if (!view) {
    logger.error(`No hay una vista llamada "${opts.view}".`);
    process.exitCode = 1;
    return '';
  }

  const filePath = join(config.root, view.file);
  const source = existsSync(filePath) ? readFileSync(filePath, 'utf-8') : '(no se pudo leer el archivo)';

  const output = `Haz un tour guiado de la vista "${view.name}" (ruta ${view.route}).

Sigue el pipeline de la skill Waypoint completo (SKILL.md, 7 fases). No te
saltes FASE 3 (anchor) ni FASE 6 (verify).

Contexto de .tourmap.json para esta vista:
- framework: ${tourmap.framework}
- router: ${tourmap.router.kind}
- estilos: ${tourmap.styles.kind}
- formularios: ${tourmap.forms.kind} / validador: ${tourmap.forms.validator}
- archivo: ${view.file}
- tiene formulario: ${view.hasForm ? 'sí' : 'no'}
- tiene modal: ${view.hasModal ? 'sí' : 'no'}
- hijos: ${view.children.length ? view.children.join(', ') : '(ninguno)'}

Código fuente de la vista (${view.file}):
\`\`\`
${source}
\`\`\`
`;

  if (opts.json) {
    logger.json({ view: view.name, prompt: output });
  } else {
    console.log(output);
  }

  return output;
}
