import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';

const FORM_RE = /<form[\s>]|useForm\s*\(|<Form[\s>]/;
const MODAL_RE = /Modal|Dialog|Drawer/;
const EXTS_JS = ['.tsx', '.ts', '.jsx', '.js'];
const EXTS_VUE = ['.vue'];

/** Los imports pueden usar sufijo `.js` (convención ESM) aunque el archivo real sea .tsx/.jsx/.vue. */
function stripJsExt(p: string): string {
  return p.replace(/\.(tsx|ts|jsx|js|mjs|cjs)$/, '');
}

function resolveImportPath(fromFile: string, importPath: string, root: string): string | null {
  if (!importPath.startsWith('.')) return null;
  const base = join(dirname(fromFile), stripJsExt(importPath));
  const candidates = [base, ...EXTS_JS.map((e) => base + e), ...EXTS_JS.map((e) => join(base, 'index' + e)), ...EXTS_VUE.map((e) => base + e)];
  for (const c of candidates) {
    if (existsSync(c)) return relative(root, c).split('\\').join('/');
  }
  return null;
}

/** Heurística: imports locales cuyo nombre local aparece como tag JSX/componente en el archivo. */
function findLocalComponentImports(source: string, fromFile: string, root: string): string[] {
  const importRe = /import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"](\.\.?\/[^'"]+)['"]/g;
  const namedImportRe = /import\s+(\w+)\s+from\s+['"](\.\.?\/[^'"]+)['"]/g;
  const children = new Set<string>();
  let m: RegExpExecArray | null;

  while ((m = namedImportRe.exec(source))) {
    const [, localName, importPath] = m;
    if (!localName || !importPath) continue;
    const usedAsJsx = new RegExp(`<${localName}[\\s/>]`).test(source);
    if (!usedAsJsx) continue;
    const resolved = resolveImportPath(fromFile, importPath, root);
    if (resolved) children.add(resolved);
  }

  // Vue SFC: import X from './X.vue' + <x-component> o <X /> en <template>.
  importRe.lastIndex = 0;
  while ((m = importRe.exec(source))) {
    const importPath = m[1];
    if (!importPath || !importPath.endsWith('.vue')) continue;
    const resolved = resolveImportPath(fromFile, importPath, root);
    if (resolved) children.add(resolved);
  }

  return Array.from(children);
}

export interface ViewAnalysis {
  hasForm: boolean;
  hasModal: boolean;
  children: string[];
  sourceHash: string;
}

export function analyzeView(filePath: string, root: string): ViewAnalysis {
  const source = readFileSync(filePath, 'utf-8');
  const children = findLocalComponentImports(source, filePath, root);

  let combined = source;
  for (const child of children) {
    const abs = join(root, child);
    if (existsSync(abs)) combined += readFileSync(abs, 'utf-8');
  }

  const hasForm = FORM_RE.test(combined);
  const hasModal = MODAL_RE.test(combined);
  const sourceHash = 'sha256:' + createHash('sha256').update(combined).digest('hex');

  return { hasForm, hasModal, children, sourceHash };
}

export function isSupportedSourceFile(file: string): boolean {
  return [...EXTS_JS, ...EXTS_VUE].includes(extname(file));
}
