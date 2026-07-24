import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { detectStyles } from '../detect/styles.js';
import { readTailwindTokens } from '../tokens/tailwind.js';
import { scanCssCustomProperties, guessMapping } from '../tokens/css-vars.js';
import { emitThemeCss, type ThemeTokens } from '../tokens/emit.js';
import type { WaypointConfig, CliGlobalOpts } from '../config.js';
import { logger } from '../logger.js';

export async function runTokens(config: WaypointConfig, opts: CliGlobalOpts): Promise<void> {
  const styles = detectStyles(config.root);
  const tokens: ThemeTokens = {};
  const sources: string[] = [];

  if (styles.kind === 'tailwind') {
    const tw = await readTailwindTokens(config.root, styles.configPath);
    if (tw?.primary) {
      tokens.accent = tw.primary;
      sources.push('tailwind.config');
    }
    if (tw?.radius) tokens.radius = tw.radius;
    if (tw?.fontFamily) tokens.fontFamily = tw.fontFamily;
  }

  const cssHits = scanCssCustomProperties(config.root);
  if (cssHits.length > 0) {
    const mapped = guessMapping(cssHits);
    if (mapped.accent) tokens.accent ??= mapped.accent;
    if (mapped.surface) tokens.surface ??= mapped.surface;
    if (mapped.text) tokens.text ??= mapped.text;
    if (mapped.border) tokens.border ??= mapped.border;
    if (mapped.radius) tokens.radius ??= mapped.radius;
    if (Object.keys(mapped).length > 0) sources.push('css custom properties');
  }

  const css = emitThemeCss(tokens);
  const outPath = join(config.toursDir, 'theme.css');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, css, 'utf-8');

  if (opts.json) {
    logger.json({ outPath, tokens, sources });
    return;
  }

  if (sources.length === 0) {
    logger.warn(`No se encontraron design tokens reales (ni Tailwind ni CSS custom properties). Se escribió ${outPath} con los valores neutros por defecto.`);
    logger.dim('Revisa el archivo y ajusta --wp-accent y --wp-radius a mano si quieres que el tour se vea como tu marca.');
    return;
  }

  logger.ok(`${outPath} generado a partir de: ${sources.join(', ')}.`);
}
