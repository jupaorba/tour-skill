import { basename, dirname, join, relative } from 'node:path';
import fg from 'fast-glob';
import { analyzeView, type ViewAnalysis } from './analyze-view.js';
import type { DiscoveredView } from './react-views.js';

function folderToRoute(pageFile: string, appDir: string, root: string): string {
  const rel = relative(appDir, dirname(pageFile)).split('\\').join('/');
  if (rel === '.' || rel === '') return '/';

  const segments = rel
    .split('/')
    .filter((s) => !/^\(.*\)$/.test(s)) // route groups: (marketing)
    .map((s) => {
      if (s.startsWith('[...') && s.endsWith(']')) return '*';
      if (s.startsWith('[') && s.endsWith(']')) return `:${s.slice(1, -1)}`;
      return s;
    });

  return '/' + segments.join('/');
}

export function scanNextAppViews(root: string): DiscoveredView[] {
  const appDirCandidates = ['app', 'src/app'];
  const views: DiscoveredView[] = [];

  for (const appDirRel of appDirCandidates) {
    const pages = fg.sync(`${appDirRel}/**/page.{tsx,jsx,ts,js}`, { cwd: root, absolute: true });
    if (pages.length === 0) continue;

    const appDir = join(root, appDirRel);

    for (const pageFile of pages) {
      const route = folderToRoute(pageFile, appDir, root);
      const analysis: ViewAnalysis = analyzeView(pageFile, root);
      views.push({
        name: basename(dirname(pageFile)) || 'Home',
        route,
        file: relative(root, pageFile).split('\\').join('/'),
        ...analysis,
      });
    }
    break;
  }

  return views;
}
