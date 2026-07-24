import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTour } from '@waypoint-tours/react';
import { useNavigate } from 'react-router-dom';

interface ExportarDialogProps {
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Se monta/desmonta con `exportarAbierto` (como ConfirmModal) para que el
 * MutationObserver de `advanceOn: selector` detecte la inserción real del
 * nodo; un <dialog> siempre montado y solo abierto/cerrado con
 * showModal()/close() ya existiría en el DOM antes de que el usuario lo
 * abriera, y el tour avanzaría de inmediato sin esperar el click real.
 */
function ExportarDialog({ onClose, onConfirm }: ExportarDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog ref={ref} className="native-dialog" onClose={onClose}>
      <h2>Exportar datos del cliente</h2>
      <p data-tour="preferencias.exportar-contenido">
        Se generará un archivo CSV con los datos y preferencias de este cliente.
      </p>
      <div className="toolbar">
        <button type="button" className="btn btn-secondary" aria-label="Cancelar" onClick={onClose}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          aria-label="Confirmar exportación"
          data-tour="preferencias.exportar-confirmar"
          onClick={onConfirm}
        >
          Confirmar
        </button>
      </div>
    </dialog>
  );
}

interface PreferenciasForm {
  notificaciones: boolean;
  plan: 'mensual' | 'anual' | 'personalizado';
  notas: string;
  limiteCredito: number;
  fechaCorte: string;
  diasAlerta: number;
  canales: string[];
}

export default function Preferencias() {
  const navigate = useNavigate();
  const { start } = useTour();
  const [modoOscuro, setModoOscuro] = useState(false);
  const [exportarAbierto, setExportarAbierto] = useState(false);
  const [exportado, setExportado] = useState(false);
  const {
    register,
    handleSubmit,
  } = useForm<PreferenciasForm>({
    defaultValues: {
      notificaciones: false,
      plan: 'mensual',
      notas: '',
      limiteCredito: 5000,
      fechaCorte: '',
      diasAlerta: 3,
      canales: [],
    },
  });

  const onSubmit = () => navigate('/dashboard');

  return (
    <div className="page">
      <div className="card">
        <div className="toolbar">
          <h1>Preferencias del cliente</h1>
          <button
            type="button"
            className="btn btn-secondary"
            data-tour-start="preferencias"
            onClick={() => start('preferencias')}
            data-tour="preferencias.como-funciona"
          >
            ¿Cómo funciona?
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="field field-inline">
            <label htmlFor="notificaciones">
              <input
                id="notificaciones"
                type="checkbox"
                aria-label="Recibir notificaciones por correo"
                data-tour="preferencias.notificaciones"
                {...register('notificaciones')}
              />
              Recibir notificaciones por correo
            </label>
          </div>

          <fieldset className="field">
            <legend>Plan de facturación</legend>
            <div className="radio-group">
              <label>
                <input type="radio" value="mensual" aria-label="Plan mensual" {...register('plan')} />
                Mensual
              </label>
              <label>
                <input
                  type="radio"
                  value="anual"
                  aria-label="Plan anual"
                  data-tour="preferencias.plan-anual"
                  {...register('plan')}
                />
                Anual
              </label>
              <label>
                <input type="radio" value="personalizado" aria-label="Plan personalizado" {...register('plan')} />
                Personalizado
              </label>
            </div>
          </fieldset>

          <div className="field">
            <label htmlFor="notas">Notas internas</label>
            <textarea
              id="notas"
              aria-label="Notas internas"
              data-tour="preferencias.notas"
              rows={3}
              {...register('notas')}
            />
          </div>

          <div className="grid-2">
            <div className="field">
              <label htmlFor="limiteCredito">Límite de crédito</label>
              <input
                id="limiteCredito"
                type="number"
                min={0}
                step={500}
                aria-label="Límite de crédito"
                data-tour="preferencias.limite-credito"
                {...register('limiteCredito')}
              />
            </div>
            <div className="field">
              <label htmlFor="fechaCorte">Fecha de corte</label>
              <input
                id="fechaCorte"
                type="date"
                aria-label="Fecha de corte"
                data-tour="preferencias.fecha-corte"
                {...register('fechaCorte')}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="diasAlerta">Días de alerta antes del corte</label>
            <input
              id="diasAlerta"
              type="range"
              min={1}
              max={15}
              aria-label="Días de alerta antes del corte"
              data-tour="preferencias.dias-alerta"
              {...register('diasAlerta')}
            />
          </div>

          <div className="field">
            <label htmlFor="canales">Canales de contacto</label>
            <select
              id="canales"
              multiple
              aria-label="Canales de contacto"
              data-tour="preferencias.canales"
              {...register('canales')}
            >
              <option value="correo">Correo</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="llamada">Llamada</option>
            </select>
          </div>

          <div className="field field-inline">
            <span id="modoOscuroLabel">Modo oscuro</span>
            <button
              type="button"
              role="switch"
              aria-checked={modoOscuro}
              aria-labelledby="modoOscuroLabel"
              data-tour="preferencias.modo-oscuro"
              className={`switch ${modoOscuro ? 'switch-on' : ''}`}
              onClick={() => setModoOscuro((v) => !v)}
            >
              <span className="switch-thumb" />
            </button>
          </div>

          <div className="field">
            <button
              type="button"
              className="btn btn-secondary"
              aria-label="Exportar datos"
              data-tour="preferencias.exportar"
              onClick={() => setExportarAbierto(true)}
            >
              Exportar datos
            </button>
          </div>

          <button type="submit" className="btn btn-primary" data-tour="preferencias.guardar" aria-label="Guardar preferencias">
            Guardar preferencias
          </button>
        </form>
      </div>

      {exportarAbierto && (
        <ExportarDialog
          onClose={() => setExportarAbierto(false)}
          onConfirm={() => {
            setExportado(true);
            setExportarAbierto(false);
          }}
        />
      )}

      {exportado && (
        <div className="toast-inline" role="status">
          Exportación lista. Revisa tu carpeta de descargas.
        </div>
      )}
    </div>
  );
}
