import _traverse from '@babel/traverse';

/**
 * `@babel/traverse` es CJS con `module.exports = traverse` y también
 * `traverse.default = traverse`. Según cómo el bundler haga la interop
 * ESM↔CJS, el import por defecto a veces devuelve el namespace en vez de la
 * función. Este helper cubre ambos casos.
 */
export const traverse: typeof _traverse =
  typeof _traverse === 'function' ? _traverse : (_traverse as unknown as { default: typeof _traverse }).default;
