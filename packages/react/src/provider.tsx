import { createContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Waypoint, type WaypointOptions } from '@waypoint-tours/runtime';

export interface WaypointContextValue {
  waypoint: Waypoint;
  isRunning: boolean;
  start: (tourId: string, opts?: { fromStep?: string }) => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  abort: () => void;
}

export const WaypointContext = createContext<WaypointContextValue | null>(null);

export interface WaypointProviderProps extends WaypointOptions {
  children: ReactNode;
}

export function WaypointProvider({ children, ...options }: WaypointProviderProps) {
  const waypointRef = useRef<Waypoint | null>(null);
  if (!waypointRef.current) {
    waypointRef.current = new Waypoint(options);
  }
  const waypoint = waypointRef.current;

  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    return () => waypoint.destroy();
  }, [waypoint]);

  const value = useMemo<WaypointContextValue>(
    () => ({
      waypoint,
      isRunning,
      start: async (tourId, opts) => {
        await waypoint.start(tourId, opts);
        setIsRunning(waypoint.isRunning);
      },
      next: async () => {
        await waypoint.next();
        setIsRunning(waypoint.isRunning);
      },
      prev: async () => {
        await waypoint.prev();
        setIsRunning(waypoint.isRunning);
      },
      abort: () => {
        waypoint.abort();
        setIsRunning(false);
      },
    }),
    [waypoint, isRunning]
  );

  return <WaypointContext.Provider value={value}>{children}</WaypointContext.Provider>;
}
