import type { ParsedShortcut, RectBounds, ResolvedStartEditorOptions, StartEditorOptions } from '../types';

const LENGTH_PATTERN = /^(-?\d*\.?\d+)(px|%|rem|em|vh|vw)?$/i;
const COLOR_PATTERN = /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|transparent|currentcolor)$/i;

export type CssValueKind = 'number' | 'color' | 'text';

export function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function isDevelopmentEnvironment(): boolean {
  if (!isBrowserEnvironment()) {
    return false;
  }

  const runtimeProcess = typeof process !== 'undefined' ? process.env?.NODE_ENV : undefined;
  if (runtimeProcess === 'production') {
    return false;
  }

  return true;
}

export function inferDefaultShortcut(): string {
  const platform = typeof navigator !== 'undefined' ? (navigator.platform ?? '').toLowerCase() : '';
  return platform.includes('mac') ? 'Option+C' : 'Alt+C';
}

export function parseShortcut(shortcut: string): ParsedShortcut {
  const tokens = shortcut
    .split('+')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  const key = tokens.find((token) => !['alt', 'option', 'ctrl', 'control', 'meta', 'cmd', 'command', 'shift'].includes(token)) ?? 'c';

  return {
    alt: tokens.includes('alt') || tokens.includes('option'),
    ctrl: tokens.includes('ctrl') || tokens.includes('control'),
    meta: tokens.includes('meta') || tokens.includes('cmd') || tokens.includes('command'),
    shift: tokens.includes('shift'),
    key,
    label: shortcut
  };
}

export function resolveOptions(options: StartEditorOptions = {}): ResolvedStartEditorOptions {
  const shortcut = options.shortcut ?? inferDefaultShortcut();
  return {
    position: 'bottom-center',
    theme: options.theme ?? 'auto',
    shortcut,
    parsedShortcut: parseShortcut(shortcut)
  };
}

export function matchesShortcut(event: KeyboardEvent, shortcut: ParsedShortcut): boolean {
  return (
    event.key.toLowerCase() === shortcut.key.toLowerCase() &&
    event.altKey === shortcut.alt &&
    event.ctrlKey === shortcut.ctrl &&
    event.metaKey === shortcut.meta &&
    event.shiftKey === shortcut.shift
  );
}

export function rectToBounds(rect: DOMRect): RectBounds {
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height
  };
}

export function getElementSelector(element: HTMLElement): string {
  const segments: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body && segments.length < 4) {
    const tag = current.tagName.toLowerCase();
    const id = current.id ? `#${current.id}` : '';
    const classNames = Array.from(current.classList)
      .slice(0, 2)
      .map((className) => `.${className}`)
      .join('');
    const nth = !id && !classNames ? `:nth-of-type(${getSiblingIndex(current)})` : '';
    segments.unshift(`${tag}${id}${classNames}${nth}`);
    if (id) {
      break;
    }
    current = current.parentElement;
  }

  return segments.join(' > ');
}

function getSiblingIndex(element: HTMLElement): number {
  let index = 1;
  let previous = element.previousElementSibling;
  while (previous) {
    if (previous.tagName === element.tagName) {
      index += 1;
    }
    previous = previous.previousElementSibling;
  }
  return index;
}

export function describeElement(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase();
  const className = element.classList.length > 0 ? `.${Array.from(element.classList).slice(0, 2).join('.')}` : '';
  const id = element.id ? `#${element.id}` : '';
  return `${tag}${id}${className}`;
}

export function hasVisibleTextContent(element: HTMLElement): boolean {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (walker.currentNode.textContent?.trim()) {
      return true;
    }
  }
  return false;
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function toKebabCase(property: string): string {
  return property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

export function parseUnitValue(rawValue: string): { value: number | null; unit: string; keyword?: string; raw: string } {
  const value = rawValue.trim();
  if (!value) {
    return { value: null, unit: 'px', raw: '' };
  }

  if (['auto', 'none', 'normal'].includes(value)) {
    return { value: null, unit: 'px', keyword: value, raw: value };
  }

  const match = value.match(LENGTH_PATTERN);
  if (!match) {
    return { value: null, unit: 'px', raw: value };
  }

  return {
    value: Number(match[1]),
    unit: match[2] ?? '',
    raw: value
  };
}

export function stringifyUnitValue(value: number | null, unit: string, keyword?: string): string {
  if (keyword) {
    return keyword;
  }
  if (value === null || Number.isNaN(value)) {
    return '';
  }
  return `${value}${unit}`;
}

export function escapeHtml(value: string): string {
  return value
    .split('&').join('&amp;')
    .split('<').join('&lt;')
    .split('>').join('&gt;')
    .split('"').join('&quot;')
    .split("'").join('&#39;');
}

export function colorStringToHex(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '#000000';
  }

  if (trimmed.startsWith('#')) {
    if (trimmed.length === 4) {
      return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`.toLowerCase();
    }
    return trimmed.slice(0, 7).toLowerCase();
  }

  const rgb = trimmed.match(/rgba?\(([^)]+)\)/i);
  if (rgb) {
    const [r, g, b] = rgb[1].split(',').slice(0, 3).map((part) => Number.parseInt(part.trim(), 10));
    return `#${[r, g, b]
      .map((channel) => Math.max(0, Math.min(255, channel)).toString(16).padStart(2, '0'))
      .join('')}`;
  }

  return '#000000';
}

export function isColorLikeValue(value: string): boolean {
  return COLOR_PATTERN.test(value.trim());
}

export function getCssValueKind(property: string, value: string): CssValueKind {
  if (
    property.includes('color') ||
    isColorLikeValue(value)
  ) {
    return 'color';
  }

  const parsed = parseUnitValue(value);
  if (parsed.value !== null && parsed.raw === value.trim()) {
    return 'number';
  }

  return 'text';
}

export function adjustNumericCssValue(
  property: string,
  value: string,
  direction: 1 | -1,
  modifiers: { shiftKey?: boolean; altKey?: boolean } = {}
): string | null {
  const parsed = parseUnitValue(value);
  if (parsed.value === null) {
    return null;
  }

  const baseStep = getBaseNumericStep(property, parsed.raw, parsed.unit);
  const multiplier = modifiers.shiftKey ? 10 : modifiers.altKey ? 0.1 : 1;
  const nextValue = roundCssNumber(parsed.value + (baseStep * multiplier * direction));
  return stringifyUnitValue(nextValue, parsed.unit);
}

function getBaseNumericStep(property: string, rawValue: string, unit: string): number {
  if (property === 'opacity' || property === 'line-height') {
    return 0.1;
  }

  if (unit === 'rem' || unit === 'em') {
    return 0.1;
  }

  if (unit === '%' || unit === 'vh' || unit === 'vw') {
    return 1;
  }

  if (rawValue.includes('.')) {
    return 0.1;
  }

  return 1;
}

function roundCssNumber(value: number): number {
  return Math.round(value * 1000) / 1000;
}
