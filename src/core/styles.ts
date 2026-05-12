import type { StyleChange } from '../types';
import { parseUnitValue } from './utils';

export const SIZE_PROPERTIES = ['width', 'height', 'min-width', 'min-height', 'max-width', 'max-height'] as const;
export const SPACING_PROPERTIES = [
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left'
] as const;
export const LAYOUT_PROPERTIES = [
  'display',
  'position',
  'flex-direction',
  'flex-wrap',
  'align-items',
  'justify-content',
  'gap',
  'column-gap',
  'row-gap',
  'grid-template-columns',
  'grid-template-rows'
] as const;
export const TYPOGRAPHY_PROPERTIES = ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-align', 'color'] as const;
export const VISUAL_PROPERTIES = [
  'background-color',
  'border-radius',
  'opacity',
  'box-shadow',
  'border-width',
  'border-style',
  'border-color'
] as const;

export const SUPPORTED_PROPERTIES = [
  ...SIZE_PROPERTIES,
  ...SPACING_PROPERTIES,
  ...LAYOUT_PROPERTIES,
  ...TYPOGRAPHY_PROPERTIES,
  ...VISUAL_PROPERTIES
] as const;

export type SupportedProperty = (typeof SUPPORTED_PROPERTIES)[number];

export interface StyleBaseline {
  inlineValue: string;
  computedValue: string;
}

export interface StyleSession {
  element: HTMLElement;
  baselines: Map<string, StyleBaseline>;
  changes: Map<string, StyleChange>;
}

export interface BoxShadowValue {
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
  color: string;
}

export function createStyleSession(element: HTMLElement): StyleSession {
  const baselines = new Map<string, StyleBaseline>();
  const computed = window.getComputedStyle(element);

  for (const property of SUPPORTED_PROPERTIES) {
    baselines.set(property, {
      inlineValue: element.style.getPropertyValue(property).trim(),
      computedValue: computed.getPropertyValue(property).trim()
    });
  }

  return {
    element,
    baselines,
    changes: new Map()
  };
}

export function readStyleValue(session: StyleSession, property: string): string {
  const inlineValue = session.element.style.getPropertyValue(property).trim();
  if (inlineValue) {
    return inlineValue;
  }
  return window.getComputedStyle(session.element).getPropertyValue(property).trim();
}

export function listStyleValues(session: StyleSession): Record<string, string> {
  return Object.fromEntries(SUPPORTED_PROPERTIES.map((property) => [property, readStyleValue(session, property)]));
}

export function applyStyleValue(session: StyleSession, property: string, nextValue: string): void {
  const baseline = ensureBaseline(session, property);

  const normalizedValue = nextValue.trim();
  const previousValue = baseline.inlineValue || baseline.computedValue || '';

  if (!normalizedValue || normalizedValue === previousValue) {
    restoreProperty(session, property);
    session.changes.delete(property);
    return;
  }

  session.element.style.setProperty(property, normalizedValue);
  session.changes.set(property, {
    property,
    oldValue: previousValue || '(empty)',
    newValue: normalizedValue
  });
}

export function restoreProperty(session: StyleSession, property: string): void {
  const baseline = ensureBaseline(session, property);

  if (baseline.inlineValue) {
    session.element.style.setProperty(property, baseline.inlineValue);
  } else {
    session.element.style.removeProperty(property);
  }
}

export function clearStyleChanges(session: StyleSession): void {
  for (const property of session.changes.keys()) {
    restoreProperty(session, property);
  }
  session.changes.clear();
}

export function suspendStyleChanges(session: StyleSession): void {
  for (const property of session.changes.keys()) {
    restoreProperty(session, property);
  }
}

export function reapplyStyleChanges(session: StyleSession): void {
  for (const change of session.changes.values()) {
    session.element.style.setProperty(change.property, change.newValue);
  }
}

export function getStyleChanges(session: StyleSession): StyleChange[] {
  return Array.from(session.changes.values()).sort((left, right) => left.property.localeCompare(right.property));
}

export function normalizeLengthValue(value: string): string {
  const parsed = parseUnitValue(value);
  if (parsed.keyword) {
    return parsed.keyword;
  }
  if (parsed.value === null) {
    return value.trim();
  }
  return `${parsed.value}${parsed.unit}`;
}

export function parseBoxShadow(rawValue: string): BoxShadowValue {
  const value = rawValue.trim();
  if (!value || value === 'none') {
    return { offsetX: '0px', offsetY: '0px', blur: '0px', spread: '0px', color: '#000000' };
  }

  const colorMatch = value.match(/(rgba?\([^)]*\)|hsla?\([^)]*\)|#[0-9a-fA-F]{3,8})/);
  const color = colorMatch?.[0] ?? '#000000';
  const rest = value.replace(color, '').trim();
  const lengths = rest.split(/\s+/);

  return {
    offsetX: lengths[0] ?? '0px',
    offsetY: lengths[1] ?? '0px',
    blur: lengths[2] ?? '0px',
    spread: lengths[3] ?? '0px',
    color
  };
}

export function stringifyBoxShadow(value: BoxShadowValue): string {
  return [value.offsetX, value.offsetY, value.blur, value.spread, value.color].join(' ').trim();
}

export function isLengthLikeValue(value: string): boolean {
  const parsed = parseUnitValue(value);
  return parsed.value !== null || Boolean(parsed.keyword);
}

function ensureBaseline(session: StyleSession, property: string): StyleBaseline {
  const existing = session.baselines.get(property);
  if (existing) {
    return existing;
  }

  const baseline = {
    inlineValue: session.element.style.getPropertyValue(property).trim(),
    computedValue: window.getComputedStyle(session.element).getPropertyValue(property).trim()
  };

  session.baselines.set(property, baseline);
  return baseline;
}
