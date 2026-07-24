import { describe, expect, it } from 'vitest';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import schema from './schema/tour.schema.json' with { type: 'json' };

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const goodTour = {
  id: 'login',
  specVersion: 1,
  title: 'Cómo iniciar sesión',
  route: '/login',
  audience: 'end-user',
  steps: [
    {
      id: 'intro',
      type: 'modal',
      body: 'Te muestro en menos de un minuto cómo entrar a tu cuenta.',
    },
    {
      id: 'email',
      type: 'input',
      body: 'Escribe el correo con el que te registraste.',
      anchor: { selector: '[data-tour="login.email"]', strategy: 'data-tour' },
      demoValue: 'persona@ejemplo.com',
      field: { required: true, validation: 'Debe ser un correo válido.' },
    },
    {
      id: 'submit',
      type: 'action',
      body: 'Entra a tu cuenta. Si tus datos son correctos, verás tu panel al instante.',
      anchor: { selector: '[data-tour="login.submit"]', strategy: 'data-tour' },
      sideEffect: 'network',
    },
  ],
};

describe('tour.schema.json', () => {
  it('acepta un tour válido', () => {
    const ok = validate(goodTour);
    expect(ok, JSON.stringify(validate.errors)).toBe(true);
  });

  it('rechaza specVersion distinto de 1', () => {
    const ok = validate({ ...goodTour, specVersion: 2 });
    expect(ok).toBe(false);
  });

  it('rechaza más de 12 pasos', () => {
    const steps = Array.from({ length: 13 }, (_, i) => ({
      id: `s${i}`,
      type: 'highlight',
      body: 'Texto de relleno de al menos diez caracteres.',
      anchor: { selector: `[data-tour="x${i}"]`, strategy: 'data-tour' },
    }));
    const ok = validate({ ...goodTour, steps });
    expect(ok).toBe(false);
  });

  it('rechaza un selector css sin fragile:true', () => {
    const ok = validate({
      ...goodTour,
      steps: [
        {
          id: 'a',
          type: 'highlight',
          body: 'Texto de relleno de al menos diez caracteres.',
          anchor: { selector: '.btn-primary', strategy: 'css' },
        },
      ],
    });
    expect(ok).toBe(false);
  });

  it('rechaza type:"input" sin demoValue', () => {
    const ok = validate({
      ...goodTour,
      steps: [
        {
          id: 'a',
          type: 'input',
          body: 'Texto de relleno de al menos diez caracteres.',
          anchor: { selector: '[data-tour="x"]', strategy: 'data-tour' },
        },
      ],
    });
    expect(ok).toBe(false);
  });

  it('rechaza type:"modal" con anchor', () => {
    const ok = validate({
      ...goodTour,
      steps: [
        {
          id: 'a',
          type: 'modal',
          body: 'Texto de relleno de al menos diez caracteres.',
          anchor: { selector: '[data-tour="x"]', strategy: 'data-tour' },
        },
      ],
    });
    expect(ok).toBe(false);
  });

  it('rechaza un id que no es kebab-case', () => {
    const ok = validate({ ...goodTour, id: 'Login_Tour' });
    expect(ok).toBe(false);
  });
});
