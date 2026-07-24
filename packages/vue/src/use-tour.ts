import { ref } from 'vue';
import { injectWaypoint } from './plugin.js';

export function useTour() {
  const waypoint = injectWaypoint();
  const isRunning = ref(false);

  const sync = () => {
    isRunning.value = waypoint.isRunning;
  };

  return {
    waypoint,
    isRunning,
    start: async (tourId: string, opts?: { fromStep?: string }) => {
      await waypoint.start(tourId, opts);
      sync();
    },
    next: async () => {
      await waypoint.next();
      sync();
    },
    prev: async () => {
      await waypoint.prev();
      sync();
    },
    abort: () => {
      waypoint.abort();
      sync();
    },
  };
}
