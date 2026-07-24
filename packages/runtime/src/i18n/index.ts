import { esMX } from './es-MX.js';

export interface I18nDict {
  next: string;
  prev: string;
  close: string;
  done: string;
  demoToast: string;
  stepAnnounce: (index: number, total: number) => string;
}

const DICTS: Record<string, I18nDict> = {
  'es-MX': esMX,
};

export function getDict(locale = 'es-MX'): I18nDict {
  return DICTS[locale] ?? DICTS['es-MX']!;
}

export function registerDict(locale: string, dict: I18nDict) {
  DICTS[locale] = dict;
}
