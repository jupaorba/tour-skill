import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Ubica los archivos de la skill empacados junto al CLI (`packages/skill` se
 * copia a `dist/skill` en el paso de build; ver README de este paquete).
 */
function skillSourceDir(): string {
  return join(__dirname, 'skill');
}

/** Instala la skill en `.claude/skills/waypoint-tours/` para que Claude Code la descubra sola. */
export function installClaudeSkill(projectRoot: string): string {
  const src = skillSourceDir();
  const dest = join(projectRoot, '.claude', 'skills', 'waypoint-tours');

  if (!existsSync(src)) {
    logger.warn('No se encontraron los archivos empacados de la skill (dist/skill). ¿Corriste `npm run build` en @waypoint-tours/cli?');
    return dest;
  }

  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true });
  logger.ok(`Skill de Claude Code instalada en ${dest}`);
  return dest;
}
