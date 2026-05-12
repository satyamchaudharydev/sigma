import { afterEach, describe, expect, it } from 'vitest';
import { collectComputedStyles, collectDefinedStyles } from '../core/css';

describe('css inspector', () => {
  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  it('collects defined styles from matching rules and inline styles', () => {
    const style = document.createElement('style');
    style.textContent = `
      .card {
        padding-top: 16px;
        color: rgb(17, 32, 59);
      }
    `;
    document.head.appendChild(style);

    const element = document.createElement('div');
    element.className = 'card';
    element.style.backgroundColor = 'rgb(255, 255, 255)';
    document.body.appendChild(element);

    const entries = collectDefinedStyles(element, new Set(['background-color']));

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'padding-top', value: '16px', source: '.card' }),
        expect.objectContaining({ property: 'color', value: 'rgb(17, 32, 59)', source: '.card' }),
        expect.objectContaining({ property: 'background-color', value: 'rgb(255, 255, 255)', source: 'inline style', changed: true })
      ])
    );
  });

  it('collects computed styles for the selected element', () => {
    const element = document.createElement('div');
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    document.body.appendChild(element);

    const entries = collectComputedStyles(element, new Set(['display']));

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'display', value: 'flex', changed: true }),
        expect.objectContaining({ property: 'align-items', value: 'center' })
      ])
    );
  });
});
