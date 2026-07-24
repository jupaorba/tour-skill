import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import fg from 'fast-glob';
import { parse } from '@babel/parser';
import { traverse } from '../utils/babel-interop.js';
import * as t from '@babel/types';
import { analyzeView } from './analyze-view.js';
import type { DiscoveredView } from './react-views.js';

function resolveVueFile(routerFile: string, importPath: string, root: string): string | null {
  if (!importPath.startsWith('.')) return null;
  const base = join(dirname(routerFile), importPath);
  const candidates = [base, base + '.vue', join(base, 'index.vue')];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return null;
}

/**
 * Escanea `createRouter({ routes: [{ path, component }] })` de Vue Router 4.
 * Soporta `component: Home` (import estático) y
 * `component: () => import('./views/Home.vue')` (lazy).
 */
export function scanVueRouterViews(root: string, srcDir = 'src'): DiscoveredView[] {
  const files = fg.sync(`${srcDir}/**/{router,routes,index}.{ts,js}`, { cwd: root, absolute: true });
  const views: DiscoveredView[] = [];

  for (const file of files) {
    const source = readFileSync(file, 'utf-8');
    if (!/createRouter\s*\(/.test(source)) continue;

    let ast: t.File;
    try {
      ast = parse(source, { sourceType: 'module', plugins: ['typescript'] });
    } catch {
      continue;
    }

    const staticImports = new Map<string, string>();
    traverse(ast, {
      ImportDeclaration(path) {
        for (const spec of path.node.specifiers) {
          if (t.isImportDefaultSpecifier(spec)) {
            staticImports.set(spec.local.name, path.node.source.value);
          }
        }
      },
    });

    traverse(ast, {
      ObjectExpression(path) {
        const pathProp = path.node.properties.find(
          (p): p is t.ObjectProperty => t.isObjectProperty(p) && t.isIdentifier(p.key, { name: 'path' })
        );
        const componentProp = path.node.properties.find(
          (p): p is t.ObjectProperty => t.isObjectProperty(p) && t.isIdentifier(p.key, { name: 'component' })
        );
        if (!pathProp || !componentProp || !t.isStringLiteral(pathProp.value)) return;

        let importPath: string | null = null;
        let name = 'View';

        if (t.isIdentifier(componentProp.value)) {
          name = componentProp.value.name;
          importPath = staticImports.get(name) ?? null;
        } else if (t.isArrowFunctionExpression(componentProp.value)) {
          const body = componentProp.value.body;
          const call = t.isCallExpression(body) ? body : null;
          if (call && t.isImport(call.callee) && t.isStringLiteral(call.arguments[0])) {
            importPath = call.arguments[0].value;
            name = importPath.split('/').pop()?.replace('.vue', '') ?? 'View';
          }
        }

        if (!importPath) return;
        const componentFile = resolveVueFile(file, importPath, root);
        if (!componentFile) return;

        const analysis = analyzeView(componentFile, root);
        views.push({
          name,
          route: pathProp.value.value,
          file: relative(root, componentFile).split('\\').join('/'),
          ...analysis,
        });
      },
    });
  }

  return views;
}
