import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import fg from 'fast-glob';
import type { WaypointConfig, CliGlobalOpts } from '../config.js';
import { logger } from '../logger.js';

export interface TourIndexEntry {
  id: string;
  title: string;
  route: string;
  audience: string;
  file: string;
}

export interface RegisterOpts extends CliGlobalOpts {
  helpPage?: string;
}

export function runRegister(config: WaypointConfig, opts: RegisterOpts): TourIndexEntry[] {
  const files = fg.sync('**/*.tour.json', { cwd: config.toursDir, absolute: true });
  const entries: TourIndexEntry[] = [];

  for (const file of files) {
    try {
      const tour = JSON.parse(readFileSync(file, 'utf-8'));
      entries.push({
        id: tour.id,
        title: tour.title,
        route: tour.route,
        audience: tour.audience,
        file: relative(config.root, file).split('\\').join('/'),
      });
    } catch {
      logger.warn(`${file} no se pudo leer como JSON. Se omite del índice.`);
    }
  }

  entries.sort((a, b) => a.title.localeCompare(b.title, 'es'));
  const indexPath = join(config.toursDir, 'index.json');
  writeFileSync(indexPath, JSON.stringify({ tours: entries }, null, 2) + '\n', 'utf-8');

  if (opts.json) {
    logger.json({ indexPath, entries });
  } else {
    logger.ok(`${indexPath} actualizado con ${entries.length} tour(s).`);
  }

  if (opts.helpPage) {
    writeHelpPageStub(opts.helpPage, entries);
  }

  return entries;
}

/**
 * Genera un componente que LEE tours/index.json — nunca hardcodea la lista.
 * Si el archivo destino ya existe, no lo pisa: solo avisa (podría tener
 * personalización manual del usuario).
 */
function writeHelpPageStub(targetPath: string, entries: TourIndexEntry[]) {
  if (existsSync(targetPath)) {
    logger.warn(`${targetPath} ya existe. No se sobreescribe; edítalo a mano si agregaste tours nuevos.`);
    return;
  }

  const content = `import toursIndex from '../../tours/index.json';

export function HelpTours() {
  return (
    <ul className="wp-help-tours">
      {toursIndex.tours.map((tour) => (
        <li key={tour.id}>
          <a href={tour.route} data-tour-start={tour.id}>
            {tour.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
`;
  writeFileSync(targetPath, content, 'utf-8');
  logger.ok(`${targetPath} creado, lee tours/index.json (${entries.length} tour(s)).`);
}
