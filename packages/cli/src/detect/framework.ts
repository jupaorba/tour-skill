import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type Framework = 'react' | 'vue' | 'next' | 'angular' | 'unknown';
export type Bundler = 'vite' | 'webpack' | 'next' | 'unknown';

export interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export function readPackageJson(root: string): PackageJson {
  const p = join(root, 'package.json');
  if (!existsSync(p)) return {};
  try {
    return JSON.parse(readFileSync(p, 'utf-8'));
  } catch {
    return {};
  }
}

function allDeps(pkg: PackageJson): Record<string, string> {
  return { ...pkg.dependencies, ...pkg.devDependencies };
}

export function detectFramework(root: string): { framework: Framework; version?: string } {
  const deps = allDeps(readPackageJson(root));

  if (deps.next) return { framework: 'next', version: deps.next };
  if (deps['@angular/core']) return { framework: 'angular', version: deps['@angular/core'] };
  if (deps.vue) return { framework: 'vue', version: deps.vue };
  if (deps.react) return { framework: 'react', version: deps.react };
  return { framework: 'unknown' };
}

export function detectBundler(root: string, framework: Framework): Bundler {
  const deps = allDeps(readPackageJson(root));
  if (framework === 'next') return 'next';
  if (deps.vite || existsSync(join(root, 'vite.config.ts')) || existsSync(join(root, 'vite.config.js'))) {
    return 'vite';
  }
  if (deps.webpack) return 'webpack';
  return 'unknown';
}
