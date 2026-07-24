import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal.js';

interface Pedido {
  id: string;
  cliente: string;
  monto: string;
  estado: string;
}

const PEDIDOS: Pedido[] = [
  { id: '1024', cliente: 'Panadería El Trigo', monto: '$1,240.00', estado: 'Pagado' },
  { id: '1023', cliente: 'Ferretería Dos Ríos', monto: '$860.50', estado: 'Pendiente' },
  { id: '1022', cliente: 'Estética Luna', monto: '$430.00', estado: 'Pagado' },
];

type ViewState = 'ok' | 'empty' | 'error';

export default function Dashboard() {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<ViewState>('ok');
  const [search, setSearch] = useState('');
  const [detalle, setDetalle] = useState<Pedido | null>(null);

  const pedidos = PEDIDOS.filter((p) => p.cliente.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page">
      <div className="toolbar">
        <h1>Tus pedidos</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary"
            data-tour="dashboard.preferencias"
            aria-label="Preferencias"
            onClick={() => navigate('/preferencias')}
          >
            Preferencias
          </button>
          <button
            type="button"
            className="btn btn-primary"
            data-tour="dashboard.nuevo-cliente"
            aria-label="Nuevo cliente"
            onClick={() => navigate('/clientes/nuevo')}
          >
            Nuevo cliente
          </button>
        </div>
      </div>
      <div className="card">
        <input
          type="search"
          placeholder="Busca por cliente"
          aria-label="Buscar pedidos"
          data-tour="dashboard.buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {viewState === 'empty' && (
          <div className="empty-state">Todavía no tienes clientes registrados. En cuanto agregues el primero, aparecerá en esta lista.</div>
        )}

        {viewState === 'error' && <div className="error-state">No pudimos cargar tus pedidos. Intenta de nuevo en un momento.</div>}

        {viewState === 'ok' && (
          <table data-tour="dashboard.tabla">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Monto</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id} data-tour="dashboard.fila">
                  <td>#{p.id}</td>
                  <td>{p.cliente}</td>
                  <td>{p.monto}</td>
                  <td>{p.estado}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-tour="dashboard.ver-detalle"
                      aria-label="Ver detalle"
                      onClick={() => setDetalle(p)}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Controles de demo para forzar los 3 estados de la vista, no son parte del flujo real */}
      <div className="toolbar" style={{ marginTop: 16 }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setViewState('ok')}
          data-tour="dashboard.ok">
          ok
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setViewState('empty')}
          data-tour="dashboard.vacio">
          vacío
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setViewState('error')}
          data-tour="dashboard.error">
          error
        </button>
      </div>
      {detalle && (
        <ConfirmModal title={`Pedido #${detalle.id}`} onClose={() => setDetalle(null)}>
          <p data-tour="dashboard.detalle-contenido">
            {detalle.cliente} — {detalle.monto} — {detalle.estado}
          </p>
        </ConfirmModal>
      )}
    </div>
  );
}
