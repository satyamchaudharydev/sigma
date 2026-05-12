import { describe, expect, it } from 'vitest';
import { adjustNumericCssValue, getCssValueKind, getElementSelector, hasVisibleTextContent, parseUnitValue } from '../core/utils';

describe('utils', () => {
  it('builds a stable selector from DOM context', () => {
    const root = document.createElement('div');
    root.id = 'app';
    const child = document.createElement('section');
    child.className = 'hero-card accent';
    root.appendChild(child);
    document.body.appendChild(root);

    expect(getElementSelector(child)).toBe('div#app > section.hero-card.accent');
  });

  it('detects text content visibility', () => {
    const element = document.createElement('div');
    element.textContent = 'Hello';
    expect(hasVisibleTextContent(element)).toBe(true);
  });

  it('parses number and unit values', () => {
    expect(parseUnitValue('12px')).toEqual({ value: 12, unit: 'px', raw: '12px' });
    expect(parseUnitValue('auto')).toEqual({ value: null, unit: 'px', keyword: 'auto', raw: 'auto' });
  });

  it('detects css value kinds', () => {
    expect(getCssValueKind('color', '#11203b')).toBe('color');
    expect(getCssValueKind('padding-top', '16px')).toBe('number');
    expect(getCssValueKind('font-family', 'Avenir Next')).toBe('text');
  });

  it('adjusts numeric css values with keyboard-style stepping', () => {
    expect(adjustNumericCssValue('padding-top', '16px', 1)).toBe('17px');
    expect(adjustNumericCssValue('opacity', '0.5', -1)).toBe('0.4');
    expect(adjustNumericCssValue('font-size', '1.2rem', 1, { shiftKey: true })).toBe('2.2rem');
  });
});
