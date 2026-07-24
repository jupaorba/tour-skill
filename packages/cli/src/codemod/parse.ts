import * as recast from 'recast';
import * as babelTsParser from 'recast/parsers/babel-ts.js';

/**
 * recast reimprime solo los nodos que cambian; el resto sale carácter por
 * carácter igual al original. Es lo que hace idempotente `waypoint anchor`:
 * correrlo 2 veces no reformatea el archivo.
 *
 * Importante: se pasa el módulo completo (no su export `parser`, que es el
 * `@babel/parser` crudo sin plugins). recast llama a `options.parser.parse`,
 * y `babelTsParser.parse` es el wrapper que sí agrega los plugins `jsx` y
 * `typescript` antes de invocar al parser real.
 */
/**
 * `lineTerminator: '\n'` fijo: recast usa `os.EOL` por default fuera del
 * navegador, así que en Windows reimprimiría todo el archivo en CRLF aunque
 * el original fuera LF — falso positivo de "cambió todo el archivo".
 */
export function parseForCodemod(source: string) {
  return recast.parse(source, { parser: babelTsParser, lineTerminator: '\n' });
}

export type CodemodAst = ReturnType<typeof parseForCodemod>;

export function printForCodemod(ast: CodemodAst): string {
  return recast.print(ast, { lineTerminator: '\n' }).code;
}
