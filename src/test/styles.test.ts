import { describe, expect, it } from 'vitest';
import { applyStyleValue, clearStyleChanges, createStyleSession, getStyleChanges, parseBoxShadow, stringifyBoxShadow } from '../core/styles';

describe('style session', () => {
  it('tracks changes against selection-time baseline and removes them on revert', () => {
    const element = document.createElement('div');
    element.style.setProperty('padding-top', '16px');
    document.body.appendChild(element);

    const session = createStyleSession(element);
    applyStyleValue(session, 'padding-top', '32px');
    expect(getStyleChanges(session)).toEqual([
      { property: 'padding-top', oldValue: '16px', newValue: '32px' }
    ]);

    applyStyleValue(session, 'padding-top', '16px');
    expect(getStyleChanges(session)).toEqual([]);
  });

  it('restores inline styles when clearing preview changes', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const session = createStyleSession(element);
    applyStyleValue(session, 'border-radius', '12px');
    clearStyleChanges(session);

    expect(element.style.getPropertyValue('border-radius')).toBe('');
    expect(getStyleChanges(session)).toEqual([]);
  });

  it('supports properties outside the predefined design panel list', () => {
    const element = document.createElement('div');
    element.style.setProperty('animation-duration', '0.3s');
    document.body.appendChild(element);

    const session = createStyleSession(element);
    applyStyleValue(session, 'animation-duration', '0.6s');

    expect(getStyleChanges(session)).toEqual([
      { property: 'animation-duration', oldValue: '0.3s', newValue: '0.6s' }
    ]);

    clearStyleChanges(session);
    expect(element.style.getPropertyValue('animation-duration')).toBe('0.3s');
  });

  it('parses and stringifies simple box shadows', () => {
    const parsed = parseBoxShadow('rgba(0, 0, 0, 0.2) 0px 8px 24px 0px');
    expect(parsed.blur).toBe('24px');
    expect(stringifyBoxShadow(parsed)).toContain('rgba(0, 0, 0, 0.2)');
  });
});
