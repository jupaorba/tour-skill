const PREFIX = 'wp:progress:';

export interface TourProgress {
  stepId: string;
  index: number;
  at: number;
}

/**
 * Progreso de un tour en curso: sessionStorage, nunca localStorage (se pierde
 * al cerrar la pestaña por diseño — no es una preferencia del usuario).
 */
export function saveProgress(tourId: string, progress: TourProgress): void {
  try {
    sessionStorage.setItem(PREFIX + tourId, JSON.stringify(progress));
  } catch {
    /* storage no disponible (SSR, modo privado agotado): el tour sigue sin resume */
  }
}

export function loadProgress(tourId: string): TourProgress | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + tourId);
    if (!raw) return null;
    return JSON.parse(raw) as TourProgress;
  } catch {
    return null;
  }
}

export function clearProgress(tourId: string): void {
  try {
    sessionStorage.removeItem(PREFIX + tourId);
  } catch {
    /* no-op */
  }
}

/**
 * `onFinish.persist` es la única ruta permitida hacia localStorage: marca que
 * un tour ya se completó, sobrevive a cerrar la pestaña.
 */
export function persistFinish(key: string): void {
  try {
    localStorage.setItem(key, String(Date.now()));
  } catch {
    /* no-op */
  }
}

export function hasFinished(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}
