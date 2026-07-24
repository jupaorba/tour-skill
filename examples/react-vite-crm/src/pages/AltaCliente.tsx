import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal.js';

const schema = z
  .object({
    nombre: z.string().min(1, 'Escribe el nombre.'),
    apellidos: z.string().min(1, 'Escribe los apellidos.'),
    correo: z.string().email('Debe ser un correo válido, con arroba y dominio.'),
    telefono: z.string().min(10, 'Son 10 dígitos.'),
    rfc: z.string().min(12, 'Son 13 caracteres para persona física y 12 para moral. Sin espacios ni guiones.'),
    tipoPersona: z.enum(['fisica', 'moral']),
    razonSocial: z.string().optional(),
    calle: z.string().min(1),
    numero: z.string().min(1),
    colonia: z.string().min(1),
    cp: z.string().length(5, 'El código postal son 5 dígitos.'),
    ciudad: z.string().min(1),
    estado: z.string().min(1),
  })
  .refine((data) => data.tipoPersona !== 'moral' || !!data.razonSocial, {
    message: 'La razón social es obligatoria para persona moral.',
    path: ['razonSocial'],
  });

type AltaClienteForm = z.infer<typeof schema>;

export default function AltaCliente() {
  const navigate = useNavigate();
  const [confirmado, setConfirmado] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AltaClienteForm>({ resolver: zodResolver(schema), defaultValues: { tipoPersona: 'fisica' } });

  const tipoPersona = watch('tipoPersona');

  const onSubmit = () => setConfirmado(true);

  return (
    <div className="page">
      <div className="card">
        <h1>Nuevo cliente</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" aria-label="Nombre" data-tour="alta-cliente.nombre" {...register('nombre')} />
            </div>
            <div className="field">
              <label htmlFor="apellidos">Apellidos</label>
              <input id="apellidos" aria-label="Apellidos" data-tour="alta-cliente.apellidos" {...register('apellidos')} />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="correo">Correo</label>
              <input id="correo" type="email" aria-label="Correo" data-tour="alta-cliente.correo" {...register('correo')} />
            </div>
            <div className="field">
              <label htmlFor="telefono">Teléfono</label>
              <input id="telefono" aria-label="Teléfono" data-tour="alta-cliente.telefono" {...register('telefono')} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="tipoPersona">Tipo de persona</label>
            <select id="tipoPersona" aria-label="Tipo de persona" data-tour="alta-cliente.tipo-persona" {...register('tipoPersona')}>
              <option value="fisica">Física</option>
              <option value="moral">Moral</option>
            </select>
          </div>

          {tipoPersona === 'moral' && (
            <div className="field">
              <label htmlFor="razonSocial">Razón social</label>
              <input id="razonSocial" aria-label="Razón social" data-tour="alta-cliente.razon-social" {...register('razonSocial')} />
              {errors.razonSocial && <span className="field-error">{errors.razonSocial.message}</span>}
            </div>
          )}

          <div className="field">
            <label htmlFor="rfc">RFC</label>
            <input id="rfc" aria-label="RFC" data-tour="alta-cliente.rfc" {...register('rfc')} />
            {errors.rfc && <span className="field-error">{errors.rfc.message}</span>}
          </div>

          <div className="grid-2">
            <div className="field">
              <label htmlFor="calle">Calle</label>
              <input id="calle" aria-label="Calle" data-tour="alta-cliente.calle" {...register('calle')} />
            </div>
            <div className="field">
              <label htmlFor="numero">Número</label>
              <input id="numero" aria-label="Número" data-tour="alta-cliente.numero" {...register('numero')} />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="colonia">Colonia</label>
              <input id="colonia" aria-label="Colonia" data-tour="alta-cliente.colonia" {...register('colonia')} />
            </div>
            <div className="field">
              <label htmlFor="cp">Código postal</label>
              <input id="cp" aria-label="Código postal" data-tour="alta-cliente.cp" {...register('cp')} />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="ciudad">Ciudad</label>
              <input id="ciudad" aria-label="Ciudad" data-tour="alta-cliente.ciudad" {...register('ciudad')} />
            </div>
            <div className="field">
              <label htmlFor="estado">Estado</label>
              <input id="estado" aria-label="Estado" data-tour="alta-cliente.estado" {...register('estado')} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" data-tour="alta-cliente.guardar" aria-label="Guardar">
            Guardar
          </button>
        </form>
      </div>

      {confirmado && (
        <ConfirmModal
          title="Cliente guardado"
          onClose={() => {
            setConfirmado(false);
            navigate('/dashboard');
          }}
        >
          <p>El cliente queda disponible de inmediato para facturarle.</p>
        </ConfirmModal>
      )}
    </div>
  );
}
