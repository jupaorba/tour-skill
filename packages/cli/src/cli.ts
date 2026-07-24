import { Command } from 'commander';
import { loadConfig } from './config.js';
import { runInit } from './commands/init.js';
import { runDiscover } from './commands/discover.js';
import { runAnchor } from './commands/anchor.js';
import { runTokens } from './commands/tokens.js';
import { runVerify } from './commands/verify.js';
import { runRegister } from './commands/register.js';
import { runPrompt } from './commands/prompt.js';
import { runList } from './commands/list.js';
import { runDoctor } from './commands/doctor.js';

const program = new Command();

program.name('waypoint').description('Genera, ancla y verifica tours guiados interactivos.').version('0.1.0');

program
  .command('init')
  .description('Instala el runtime, la skill del agente y crea tours/')
  .option('--agent <agent>', 'claude | cursor | all', 'all')
  .option('--json', 'salida en JSON')
  .action((o) => {
    runInit(loadConfig(), { agent: o.agent, json: o.json });
  });

program
  .command('discover')
  .description('Detecta framework, router, estilos, formularios y mapea rutas → archivos en .tourmap.json')
  .option('--json', 'salida en JSON')
  .action((o) => {
    runDiscover(loadConfig(), { json: o.json });
  });

program
  .command('anchor')
  .description('Inyecta atributos data-tour en los elementos interactivos de una vista (codemod idempotente)')
  .requiredOption('--view <name>', 'nombre de la vista, tal como aparece en .tourmap.json')
  .option('--dry-run', 'muestra el diff sin escribir el archivo')
  .option('--json', 'salida en JSON')
  .action((o) => {
    runAnchor(loadConfig(), { view: o.view, dryRun: o.dryRun, json: o.json });
  });

program
  .command('tokens')
  .description('Extrae los design tokens reales de la app a tours/theme.css')
  .option('--json', 'salida en JSON')
  .action(async (o) => {
    await runTokens(loadConfig(), { json: o.json });
  });

program
  .command('verify [tourFile]')
  .description('Levanta la app en un navegador real y verifica cada paso de uno o todos los tours')
  .option('--all', 'verifica todos los tours en tours/')
  .option('--ci', 'sale con código 1 si algún tour tiene errores')
  .option('--base-url <url>', 'URL de la app corriendo (default: http://localhost:5173)')
  .option('--json', 'salida en JSON')
  .action(async (tourFile, o) => {
    await runVerify(loadConfig(), { file: tourFile, all: o.all, ci: o.ci, baseUrl: o.baseUrl, json: o.json });
  });

program
  .command('register')
  .description('Actualiza tours/index.json a partir de tours/*.tour.json')
  .option('--help-page <path>', 'genera/actualiza un componente de Ayuda que lee el índice')
  .option('--json', 'salida en JSON')
  .action((o) => {
    runRegister(loadConfig(), { helpPage: o.helpPage, json: o.json });
  });

program
  .command('prompt')
  .description('Genera un prompt autocontenido para pedirle a un agente que haga el tour de una vista')
  .requiredOption('--view <name>', 'nombre de la vista, tal como aparece en .tourmap.json')
  .option('--json', 'salida en JSON')
  .action((o) => {
    runPrompt(loadConfig(), { view: o.view, json: o.json });
  });

program
  .command('list')
  .description('Lista los tours registrados (o las vistas descubiertas con --views)')
  .option('--views', 'lista vistas de .tourmap.json en vez de tours')
  .option('--json', 'salida en JSON')
  .action((o) => {
    runList(loadConfig(), { views: o.views, json: o.json });
  });

program
  .command('doctor')
  .description('Diagnostica el entorno: Node, Playwright, drift de vistas, tours registrados')
  .option('--json', 'salida en JSON')
  .action((o) => {
    runDoctor(loadConfig(), { json: o.json });
  });

program.parseAsync(process.argv);
