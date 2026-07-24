import type { I18nDict } from './index.js';

export const esMX: I18nDict = {
  next: 'Siguiente',
  prev: 'Atrás',
  close: 'Cerrar tour',
  done: 'Listo',
  demoToast: 'Aquí se guardaría tu información',
  stepAnnounce: (index, total) => `Paso ${index + 1} de ${total}`,
};
