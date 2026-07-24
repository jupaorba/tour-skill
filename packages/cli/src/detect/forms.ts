import { readPackageJson } from './framework.js';

export type FormsKind = 'react-hook-form' | 'formik' | 'vee-validate' | 'formkit' | 'native' | 'none';
export type ValidatorKind = 'zod' | 'yup' | 'valibot' | 'joi' | 'none';

export interface FormsInfo {
  kind: FormsKind;
  validator: ValidatorKind;
}

export function detectForms(root: string): FormsInfo {
  const deps = { ...readPackageJson(root).dependencies, ...readPackageJson(root).devDependencies };

  let kind: FormsKind = 'native';
  if (deps['react-hook-form']) kind = 'react-hook-form';
  else if (deps.formik) kind = 'formik';
  else if (deps['vee-validate']) kind = 'vee-validate';
  else if (deps['@formkit/vue']) kind = 'formkit';

  let validator: ValidatorKind = 'none';
  if (deps.zod) validator = 'zod';
  else if (deps.yup) validator = 'yup';
  else if (deps.valibot) validator = 'valibot';
  else if (deps.joi) validator = 'joi';

  return { kind, validator };
}
