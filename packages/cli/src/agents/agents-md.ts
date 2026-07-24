import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '../logger.js';

const MARKER_START = '<!-- waypoint-tours:start -->';
const MARKER_END = '<!-- waypoint-tours:end -->';

const BLOCK = `${MARKER_START}
## Tours guiados (Waypoint)

Si te piden un tour, tutorial, onboarding o ayuda contextual para una vista:
sigue el pipeline de \`.claude/skills/waypoint-tours/SKILL.md\` completo, en
orden, sin saltarte FASE 3 (\`npx waypoint anchor\`) ni FASE 6
(\`npx waypoint verify\`).
${MARKER_END}
`;

/** AGENTS.md es la convención genérica que leen varios agentes (no solo uno). */
export function installAgentsMdBlock(projectRoot: string): string {
  const dest = join(projectRoot, 'AGENTS.md');
  const existing = existsSync(dest) ? readFileSync(dest, 'utf-8') : '';

  if (existing.includes(MARKER_START)) {
    logger.dim(`AGENTS.md ya tiene el bloque de Waypoint. Sin cambios.`);
    return dest;
  }

  const next = existing ? `${existing.trimEnd()}\n\n${BLOCK}` : `# AGENTS.md\n\n${BLOCK}`;
  writeFileSync(dest, next, 'utf-8');
  logger.ok(`AGENTS.md actualizado en ${dest}`);
  return dest;
}
