import type { NodePath } from '@babel/traverse';
import { traverse } from '../utils/babel-interop.js';
import * as t from '@babel/types';
import { parseForCodemod, printForCodemod } from './parse.js';

const INTERACTIVE_TAGS = new Set(['button', 'input', 'select', 'textarea', 'a']);
const INTERACTIVE_ROLES = new Set(['button', 'tab', 'switch', 'menuitem', 'checkbox']);

export interface InjectResult {
  code: string;
  changed: boolean;
  added: string[];
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function jsxAttrString(attrs: t.JSXAttribute[], name: string): string | null {
  const attr = attrs.find((a) => t.isJSXIdentifier(a.name) && a.name.name === name);
  if (!attr?.value) return null;
  if (t.isStringLiteral(attr.value)) return attr.value.value;
  return null;
}

function textContentOf(el: t.JSXElement): string | null {
  for (const child of el.children) {
    if (t.isJSXText(child) && child.value.trim()) return child.value.trim();
  }
  return null;
}

/**
 * Deriva un slug legible del elemento: aria-label > texto > name/htmlFor >
 * placeholder > tag + índice. Nunca inventa significado de negocio, solo
 * describe el elemento tal como aparece en el markup.
 */
function elementSlug(opening: t.JSXOpeningElement, el: t.JSXElement | null, fallbackIndex: number): string {
  const attrs = opening.attributes.filter((a): a is t.JSXAttribute => t.isJSXAttribute(a));
  const tagName = t.isJSXIdentifier(opening.name) ? opening.name.name : 'el';

  const label = jsxAttrString(attrs, 'aria-label');
  if (label) return slugify(label);

  const text = el ? textContentOf(el) : null;
  if (text) return slugify(text);

  const name = jsxAttrString(attrs, 'name') ?? jsxAttrString(attrs, 'htmlFor') ?? jsxAttrString(attrs, 'id');
  if (name) return slugify(name);

  const placeholder = jsxAttrString(attrs, 'placeholder');
  if (placeholder) return slugify(placeholder);

  return `${slugify(tagName)}-${fallbackIndex}`;
}

function isInteractive(opening: t.JSXOpeningElement): boolean {
  const name = t.isJSXIdentifier(opening.name) ? opening.name.name.toLowerCase() : '';
  if (INTERACTIVE_TAGS.has(name)) return true;
  const role = opening.attributes.find(
    (a): a is t.JSXAttribute => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'role'
  );
  if (role?.value && t.isStringLiteral(role.value) && INTERACTIVE_ROLES.has(role.value.value)) return true;
  return false;
}

function hasDataTour(opening: t.JSXOpeningElement): boolean {
  return opening.attributes.some((a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'data-tour');
}

export function injectDataTour(source: string, viewName: string): InjectResult {
  const ast = parseForCodemod(source);
  const viewSlug = slugify(viewName);
  const used = new Set<string>();
  const added: string[] = [];
  let index = 0;

  traverse(ast as unknown as t.Node, {
    JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
      const opening: t.JSXOpeningElement = path.node;
      if (!isInteractive(opening) || hasDataTour(opening)) return;

      index += 1;
      const parentEl = t.isJSXElement(path.parent) ? path.parent : null;
      let slug = elementSlug(opening, parentEl, index);
      let unique = slug;
      let n = 2;
      while (used.has(unique)) {
        unique = `${slug}-${n}`;
        n += 1;
      }
      used.add(unique);

      const value = `${viewSlug}.${unique}`;
      opening.attributes.push(t.jsxAttribute(t.jsxIdentifier('data-tour'), t.stringLiteral(value)));
      added.push(value);
    },
  });

  return { code: printForCodemod(ast), changed: added.length > 0, added };
}
