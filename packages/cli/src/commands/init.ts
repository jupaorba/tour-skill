import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { detectFramework } from '../detect/framework.js';
import { installClaudeSkill } from '../agents/claude.js';
import { installCursorRule } from '../agents/cursor.js';
import { installAgentsMdBlock } from '../agents/agents-md.js';
import type { WaypointConfig, CliGlobalOpts } from '../config.js';
import { logger } from '../logger.js';

const VERSION = '0.1.0';

export interface InitOpts extends CliGlobalOpts {
  agent?: 'claude' | 'cursor' | 'all';
}

/** Nunca hace `git commit`: deja todo en el working tree para que el humano revise el diff. */
export function runInit(config: WaypointConfig, opts: InitOpts): void {
  const root = config.root;
  const { framework } = detectFramework(root);

  const pkgPath = join(root, 'package.json');
  if (!existsSync(pkgPath)) {
    logger.error('No hay package.json en este directorio. `waypoint init` debe correr en la raíz del proyecto.');
    process.exitCode = 1;
    return;
  }

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  pkg.dependencies ??= {};
  pkg.dependencies['@waypoint-tours/runtime'] = `^${VERSION}`;
  if (framework === 'react') pkg.dependencies['@waypoint-tours/react'] = `^${VERSION}`;
  if (framework === 'vue') pkg.dependencies['@waypoint-tours/vue'] = `^${VERSION}`;
  pkg.devDependencies ??= {};
  pkg.devDependencies['@waypoint-tours/cli'] = `^${VERSION}`;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  logger.ok('package.json actualizado. Corre tu instalador (npm/pnpm/yarn) para bajar los paquetes.');

  mkdirSync(config.toursDir, { recursive: true });
  logger.ok(`${config.toursDir} creado.`);

  const agent = opts.agent ?? 'all';
  if (agent === 'claude' || agent === 'all') installClaudeSkill(root);
  if (agent === 'cursor' || agent === 'all') installCursorRule(root);
  installAgentsMdBlock(root);

  logger.info('Listo. Revisa el diff (`git status` / `git diff`) antes de confirmar cualquier cambio.');
  logger.info('Siguiente paso: `npx waypoint discover`.');
}
