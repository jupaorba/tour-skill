import { writeFileSync } from 'node:fs';
import { detectBundler, detectFramework } from '../detect/framework.js';
import { detectRouter } from '../detect/router.js';
import { detectStyles } from '../detect/styles.js';
import { detectForms } from '../detect/forms.js';
import { scanReactRouterViews, type DiscoveredView } from '../detect/react-views.js';
import { scanNextAppViews } from '../detect/next-views.js';
import { scanVueRouterViews } from '../detect/vue-views.js';
import type { WaypointConfig, CliGlobalOpts } from '../config.js';
import { logger } from '../logger.js';

export interface Tourmap {
  generatedAt: string;
  root: string;
  framework: string;
  bundler: string;
  router: { kind: string; version?: string };
  styles: { kind: string; configPath?: string };
  forms: { kind: string; validator: string };
  views: Array<{
    name: string;
    route: string;
    file: string;
    children: string[];
    hasForm: boolean;
    hasModal: boolean;
    sourceHash: string;
  }>;
}

export function runDiscover(config: WaypointConfig, opts: CliGlobalOpts): Tourmap {
  const root = config.root;
  const { framework, version: frameworkVersion } = detectFramework(root);
  const bundler = detectBundler(root, framework);
  const router = detectRouter(root, framework);
  const styles = detectStyles(root);
  const forms = detectForms(root);

  let views: DiscoveredView[];
  if (framework === 'next') {
    views = scanNextAppViews(root);
  } else if (framework === 'vue') {
    views = scanVueRouterViews(root);
  } else if (framework === 'react') {
    views = scanReactRouterViews(root);
  } else {
    views = [];
  }

  const tourmap: Tourmap = {
    generatedAt: new Date().toISOString(),
    root: '.',
    framework: frameworkVersion ? `${framework}` : framework,
    bundler,
    router,
    styles,
    forms,
    views: views.map(({ name, route, file, children, hasForm, hasModal, sourceHash }) => ({
      name,
      route,
      file,
      children,
      hasForm,
      hasModal,
      sourceHash,
    })),
  };

  writeFileSync(config.tourmapPath, JSON.stringify(tourmap, null, 2) + '\n', 'utf-8');

  if (opts.silent) return tourmap;

  if (opts.json) {
    logger.json(tourmap);
    return tourmap;
  }

  if (framework === 'unknown') {
    logger.error('No se pudo detectar el framework (busca "react", "vue" o "next" en package.json).');
    logger.dim('Sin esto no puedes ubicar vistas. Revisa que estés parado en la raíz del proyecto.');
    process.exitCode = 1;
    return tourmap;
  }

  logger.ok(`Framework: ${framework}${frameworkVersion ? ` (${frameworkVersion})` : ''} · bundler: ${bundler}`);
  logger.ok(`Router: ${router.kind} · estilos: ${styles.kind} · formularios: ${forms.kind}/${forms.validator}`);
  logger.ok(`${views.length} vista(s) encontradas → ${config.tourmapPath}`);
  for (const v of views) {
    logger.dim(`  ${v.route} → ${v.file}${v.hasForm ? ' [form]' : ''}${v.hasModal ? ' [modal]' : ''}`);
  }

  return tourmap;
}
