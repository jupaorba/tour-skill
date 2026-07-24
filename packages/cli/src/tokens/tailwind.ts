import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export interface TailwindTokens {
  primary?: string;
  radius?: string;
  fontFamily?: string;
}

/**
 * Intenta cargar el config de Tailwind como módulo ES (`.js`/`.mjs`). Los
 * config en `.ts` no se ejecutan aquí (requeriría transpilar) — se avisa y se
 * sigue con el fallback de `css-vars.ts`.
 */
export async function readTailwindTokens(root: string, configPath?: string): Promise<TailwindTokens | null> {
  const candidates = configPath ? [configPath] : ['tailwind.config.js', 'tailwind.config.cjs', 'tailwind.config.mjs'];
  const found = candidates.find((c) => existsSync(join(root, c)));
  if (!found) return null;

  try {
    const mod = await import(pathToFileURL(join(root, found)).href);
    const config = mod.default ?? mod;
    const colors = config?.theme?.extend?.colors ?? config?.theme?.colors ?? {};
    const primaryKey = Object.keys(colors).find((k) => /primary|brand|accent/i.test(k));
    const primary = primaryKey ? extractColorValue(colors[primaryKey]) : undefined;

    const radiusScale = config?.theme?.extend?.borderRadius ?? config?.theme?.borderRadius ?? {};
    const radius = radiusScale.DEFAULT ?? radiusScale.md ?? radiusScale.lg;

    const fontFamily = config?.theme?.extend?.fontFamily?.sans?.[0] ?? config?.theme?.fontFamily?.sans?.[0];

    const tokens: TailwindTokens = {};
    if (primary) tokens.primary = primary;
    if (radius) tokens.radius = radius;
    if (fontFamily) tokens.fontFamily = fontFamily;
    return tokens;
  } catch {
    return null;
  }
}

function extractColorValue(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const scale = value as Record<string, string>;
    return scale['500'] ?? scale['600'] ?? Object.values(scale)[0];
  }
  return undefined;
}
