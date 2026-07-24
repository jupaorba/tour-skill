import { inject, type App, type InjectionKey } from 'vue';
import { Waypoint, type WaypointOptions } from '@waypoint-tours/runtime';

export const WAYPOINT_KEY: InjectionKey<Waypoint> = Symbol('waypoint');

export function createWaypointPlugin(options: WaypointOptions) {
  const waypoint = new Waypoint(options);
  return {
    install(app: App) {
      app.provide(WAYPOINT_KEY, waypoint);
      app.mixin({
        unmounted() {
          if (this.$root === this) waypoint.destroy();
        },
      });
    },
    waypoint,
  };
}

export function injectWaypoint(): Waypoint {
  const waypoint = inject(WAYPOINT_KEY);
  if (!waypoint) {
    throw new Error('[waypoint] No se encontró la instancia. ¿Registraste createWaypointPlugin() con app.use()?');
  }
  return waypoint;
}
