import { describe, expect, it, vi } from 'vitest';
import { startEditor } from '../index';

function setNodeEnv(value: string | undefined): void {
  vi.stubGlobal('process', { env: { NODE_ENV: value } });
}

describe('startEditor', () => {
  it('no-ops in production', () => {
    setNodeEnv('production');
    const instance = startEditor();
    expect(instance.getSelection()).toBeNull();
    expect(document.body.querySelector('[data-react-visual-editor]')).toBeNull();
  });

  it('mounts in development and supports picker-driven selection', async () => {
    setNodeEnv('development');
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
    });

    const target = document.createElement('div');
    target.className = 'hero-card';
    target.textContent = 'Hello';
    target.style.paddingTop = '16px';
    document.body.appendChild(target);

    const instance = startEditor();
    const host = document.body.querySelector('[data-react-visual-editor]') as HTMLDivElement | null;
    expect(host).not.toBeNull();

    instance.openPicker();
    target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await Promise.resolve();

    expect(instance.getSelection()?.selector).toContain('div.hero-card');

    instance.destroy();
    expect(document.body.querySelector('[data-react-visual-editor]')).toBeNull();
  });
});
