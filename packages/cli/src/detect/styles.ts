import { existsSync } from 'node:fs';
import { join } from 'node:path';
import fg from 'fast-glob';
import { readPackageJson } from './framework.js';

export type StylesKind = 'tailwind' | 'css-modules' | 'styled-components' | 'plain-css' | 'unknown';

export interface StylesInfo {
  kind: StylesKind;
  configPath?: string;
}

const TAILWIND_CONFIGS = ['tailwind.config.ts', 'tailwind.config.js', 'tailwind.config.cjs'];

export function detectStyles(root: string): StylesInfo {
  for (const f of TAILWIND_CONFIGS) {
    if (existsSync(join(root, f))) return { kind: 'tailwind', configPath: f };
  }

  const deps = { ...readPackageJson(root).dependencies, ...readPackageJson(root).devDependencies };
  if (deps.tailwindcss) return { kind: 'tailwind' };
  if (deps['styled-components']) return { kind: 'styled-components' };

  const cssModules = fg.sync('src/**/*.module.css', { cwd: root });
  if (cssModules.length > 0) return { kind: 'css-modules' };

  const plainCss = fg.sync('src/**/*.css', { cwd: root });
  if (plainCss.length > 0) return { kind: 'plain-css' };

  return { kind: 'unknown' };
}
