import { useContext } from 'react';
import { WaypointContext, type WaypointContextValue } from './provider.js';

export function useTour(): WaypointContextValue {
  const ctx = useContext(WaypointContext);
  if (!ctx) {
    throw new Error('[waypoint] useTour() debe usarse dentro de <WaypointProvider>.');
  }
  return ctx;
}
