import { Navigate, Route, Routes } from 'react-router-dom';
import { WaypointProvider } from '@waypoint-tours/react';
import Login from './pages/Login.js';
import Dashboard from './pages/Dashboard.js';
import AltaCliente from './pages/AltaCliente.js';
import Preferencias from './pages/Preferencias.js';
import toursIndex from '../tours/index.json';

async function loadTours() {
  const entries = await Promise.all(
    toursIndex.tours.map(async (t) => {
      const mod = await import(/* @vite-ignore */ `../${t.file}`);
      return [t.id, mod.default ?? mod] as const;
    })
  );
  return Object.fromEntries(entries);
}

export default function App() {
  return (
    <WaypointProvider tours={loadTours} locale="es-MX">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes/nuevo" element={<AltaCliente />} />
        <Route path="/preferencias" element={<Preferencias />} />
      </Routes>
    </WaypointProvider>
  );
}
