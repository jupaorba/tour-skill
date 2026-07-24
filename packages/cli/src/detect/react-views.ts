import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import fg from 'fast-glob';
import { parse } from '@babel/parser';
import { traverse } from '../utils/babel-interop.js';
import * as t from '@babel/types';
import { analyzeView, type ViewAnalysis } from './analyze-view.js';

export interface DiscoveredView extends ViewAnalysis {
  name: string;
  route: string;
  file: string;
}

const ROUTER_FILE_HINTS = /App\.(tsx|jsx)$|routes?\.(tsx|jsx)$|router\.(tsx|jsx)$/i;

/** Los imports pueden usar sufijo `.js` (convención ESM) aunque el archivo real sea .tsx/.jsx. */
function stripJsExt(p: string): string {
  return p.replace(/\.(tsx|ts|jsx|js|mjs|cjs)$/, '');
}

function resolveComponentFile(routerFile: string, importPath: string, root: string): string | null {
  if (!importPath.startsWith('.')) return null;
  const base = join(dirname(routerFile), stripJsExt(importPath));
  const candidates = [base + '.tsx', base + '.jsx', base + '.ts', base + '.js', join(base, 'index.tsx'), join(base, 'index.jsx')];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return null;
}

function componentNameFromRoute(routeExpr: t.JSXElement | null): string | null {
  if (!routeExpr) return null;
  const name = routeExpr.openingElement.name;
  return t.isJSXIdentifier(name) ? name.name : null;
}

function findImportSource(ast: t.File, componentName: string): string | null {
  let source: string | null = null;
  traverse(ast, {
    ImportDeclaration(path) {
      for (const spec of path.node.specifiers) {
        if (t.isImportDefaultSpecifier(spec) && spec.local.name === componentName) {
          source = path.node.source.value;
        }
      }
    },
  });
  return source;
}

function attrString(attrs: t.JSXAttribute[], name: string): string | null {
  const attr = attrs.find((a) => t.isJSXIdentifier(a.name) && a.name.name === name);
  if (!attr || !attr.value) return null;
  if (t.isStringLiteral(attr.value)) return attr.value.value;
  return null;
}

/**
 * Escanea `<Route path="..." element={<X/>} />` de React Router 6 (JSX) y el
 * array de `createBrowserRouter([{ path, element }])`. No cubre rutas
 * anidadas con `<Outlet/>` en esta pasada — quedan con su `path` relativo tal
 * cual lo declara el código.
 */
export function scanReactRouterViews(root: string, srcDir = 'src'): DiscoveredView[] {
  const files = fg.sync(`${srcDir}/**/*.{tsx,jsx}`, { cwd: root, absolute: true }).filter((f) => ROUTER_FILE_HINTS.test(f));
  const views = new Map<string, DiscoveredView>();

  for (const file of files) {
    const source = readFileSync(file, 'utf-8');
    let ast: t.File;
    try {
      ast = parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
    } catch {
      continue;
    }

    traverse(ast, {
      JSXElement(path) {
        const opening = path.node.openingElement;
        if (!t.isJSXIdentifier(opening.name) || opening.name.name !== 'Route') return;
        const attrs = opening.attributes.filter((a): a is t.JSXAttribute => t.isJSXAttribute(a));
        const routePath = attrString(attrs, 'path');
        if (!routePath) return;

        const elementAttr = attrs.find((a) => t.isJSXIdentifier(a.name) && a.name.name === 'element');
        let componentName: string | null = null;
        if (elementAttr?.value && t.isJSXExpressionContainer(elementAttr.value) && t.isJSXElement(elementAttr.value.expression)) {
          componentName = componentNameFromRoute(elementAttr.value.expression);
        }
        if (!componentName) return;

        const importSource = findImportSource(ast, componentName);
        if (!importSource) return;
        const componentFile = resolveComponentFile(file, importSource, root);
        if (!componentFile) return;

        const analysis = analyzeView(componentFile, root);
        views.set(routePath, {
          name: componentName,
          route: routePath,
          file: relative(root, componentFile).split('\\').join('/'),
          ...analysis,
        });
      },
    });
  }

  return Array.from(views.values());
}
