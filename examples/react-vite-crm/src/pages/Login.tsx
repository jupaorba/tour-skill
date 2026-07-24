import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useTour } from '@waypoint-tours/react';

const schema = z.object({
  email: z.string().email('Debe ser un correo válido, con arroba y dominio.'),
  password: z.string().min(8, 'Mínimo 8 caracteres.'),
});

type LoginForm = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { start } = useTour();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) });

  const onSubmit = () => navigate('/dashboard');

  return (
    <div className="page">
      <div className="card">
        <div className="toolbar">
          <h1>Entra a tu cuenta</h1>
          <button
            type="button"
            className="btn btn-secondary"
            data-tour-start="login"
            onClick={() => start('login')}
            data-tour="login.como-funciona">
            ¿Cómo funciona?
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <label htmlFor="email">Correo</label>
            <input id="email" type="email" aria-label="Correo" data-tour="login.email" {...register('email')} />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" aria-label="Contraseña" data-tour="login.password" {...register('password')} />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>
          <button type="submit" className="btn btn-primary" data-tour="login.submit" aria-label="Entrar">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
