import { readFileSync } from 'node:fs';
import fg from 'fast-glob';

const VAR_DECL_RE = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;

export interface CssVarHit {
  name: string;
  value: string;
  file: string;
}

/** Escanea `:root { --x: valor; }` en todo el CSS del proyecto (no dentro de node_modules). */
export function scanCssCustomProperties(root: string): CssVarHit[] {
  const files = fg.sync(['src/**/*.css', 'src/**/*.scss', '*.css'], {
    cwd: root,
    absolute: true,
    ignore: ['**/node_modules/**'],
  });

  const hits: CssVarHit[] = [];
  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const rootBlockMatch = content.match(/:root\s*{([^}]*)}/);
    if (!rootBlockMatch) continue;
    const block = rootBlockMatch[1] ?? '';
    let m: RegExpExecArray | null;
    VAR_DECL_RE.lastIndex = 0;
    while ((m = VAR_DECL_RE.exec(block))) {
      const [, name, value] = m;
      if (!name || !value) continue;
      hits.push({ name, value: value.trim(), file });
    }
  }
  return hits;
}

const NAME_HINTS: Record<string, string[]> = {
  accent: ['primary', 'accent', 'brand'],
  surface: ['surface', 'background', 'bg'],
  text: ['text', 'foreground', 'fg'],
  border: ['border', 'outline'],
  radius: ['radius', 'rounded'],
};

/** "primary" matchea tanto "color-primary" como "primary-color" o "brand-primary-500". */
function matchesSegment(varName: string, keyword: string): boolean {
  return varName.split('-').includes(keyword);
}

export function guessMapping(hits: CssVarHit[]): Partial<Record<'accent' | 'surface' | 'text' | 'border' | 'radius', string>> {
  const result: Partial<Record<'accent' | 'surface' | 'text' | 'border' | 'radius', string>> = {};
  for (const hit of hits) {
    for (const [key, keywords] of Object.entries(NAME_HINTS)) {
      if (key in result) continue;
      if (keywords.some((kw) => matchesSegment(hit.name.toLowerCase(), kw))) {
        result[key as keyof typeof result] = `var(--${hit.name})`;
      }
    }
  }
  return result;
}
