import { readPackageJson } from './framework.js';
import type { Framework } from './framework.js';

export type RouterKind = 'react-router' | 'vue-router' | 'next-app-router' | 'none';

export interface RouterInfo {
  kind: RouterKind;
  version?: string;
}

export function detectRouter(root: string, framework: Framework): RouterInfo {
  const pkg = readPackageJson(root);
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  if (framework === 'next') return deps.next ? { kind: 'next-app-router', version: deps.next } : { kind: 'next-app-router' };
  if (deps['react-router-dom']) return { kind: 'react-router', version: deps['react-router-dom'] };
  if (deps['vue-router']) return { kind: 'vue-router', version: deps['vue-router'] };
  return { kind: 'none' };
}
