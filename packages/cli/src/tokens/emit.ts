const WP_VARS = [
  '--wp-surface',
  '--wp-surface-2',
  '--wp-text',
  '--wp-text-muted',
  '--wp-accent',
  '--wp-accent-text',
  '--wp-border',
  '--wp-radius',
  '--wp-shadow',
  '--wp-font',
  '--wp-font-size',
  '--wp-overlay-color',
  '--wp-overlay-opacity',
  '--wp-z',
] as const;

export interface ThemeTokens {
  accent?: string;
  surface?: string;
  text?: string;
  border?: string;
  radius?: string;
  fontFamily?: string;
}

const DEFAULTS: Record<(typeof WP_VARS)[number], string> = {
  '--wp-surface': '#ffffff',
  '--wp-surface-2': '#111827',
  '--wp-text': '#1a1a1a',
  '--wp-text-muted': 'rgba(0, 0, 0, 0.68)',
  '--wp-accent': '#4f46e5',
  '--wp-accent-text': '#ffffff',
  '--wp-border': 'rgba(0, 0, 0, 0.1)',
  '--wp-radius': '12px',
  '--wp-shadow': '0 8px 24px rgba(0, 0, 0, 0.16)',
  '--wp-font': 'system-ui, -apple-system, "Segoe UI", sans-serif',
  '--wp-font-size': '15px',
  '--wp-overlay-color': 'rgba(0, 0, 0, 0.55)',
  '--wp-overlay-opacity': '0.55',
  '--wp-z': '2147483000',
};

export function emitThemeCss(tokens: ThemeTokens): string {
  const values: Record<(typeof WP_VARS)[number], string> = { ...DEFAULTS };

  if (tokens.accent) values['--wp-accent'] = tokens.accent;
  if (tokens.surface) values['--wp-surface'] = tokens.surface;
  if (tokens.text) values['--wp-text'] = tokens.text;
  if (tokens.border) values['--wp-border'] = tokens.border;
  if (tokens.radius) values['--wp-radius'] = tokens.radius;
  if (tokens.fontFamily) values['--wp-font'] = tokens.fontFamily;

  const lines = WP_VARS.map((name) => `  ${name}: ${values[name]};`).join('\n');

  return `/* Generado por \`npx waypoint tokens\`. No editar a mano: se sobreescribe. */\n:root {\n${lines}\n}\n`;
}

export { WP_VARS };
