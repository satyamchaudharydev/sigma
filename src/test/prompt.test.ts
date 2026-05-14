import { describe, expect, it } from 'vitest';
import { buildAgentPrompt } from '../core/prompt';

describe('buildAgentPrompt', () => {
  it('includes full source metadata when available', () => {
    const prompt = buildAgentPrompt({
      selection: {
        tagName: 'div',
        selector: 'div.hero-card',
        componentName: 'HeroCard',
        filePath: 'src/components/HeroCard.tsx',
        lineNumber: 42,
        changes: [{ property: 'padding-top', oldValue: '16px', newValue: '32px' }]
      },
      comments: []
    });

    expect(prompt).toContain('Component: HeroCard');
    expect(prompt).toContain('File: src/components/HeroCard.tsx (line 42)');
    expect(prompt).not.toContain('Source metadata was not fully available');
  });

  it('falls back gracefully when metadata is unavailable', () => {
    const prompt = buildAgentPrompt({
      selection: {
        tagName: 'button',
        selector: 'button.cta',
        componentName: null,
        filePath: null,
        lineNumber: null,
        changes: [{ property: 'border-radius', oldValue: '8px', newValue: '999px' }]
      },
      comments: []
    });

    expect(prompt).toContain('Component: Unavailable');
    expect(prompt).toContain('File: Unavailable');
    expect(prompt).toContain('Source metadata was not fully available');
  });

  it('includes comment text and attachment data', () => {
    const prompt = buildAgentPrompt({
      selection: null,
      comments: [{
        id: 'comment-1',
        number: 1,
        text: 'Make this card feel more editorial.',
        attachment: {
          name: 'reference.png',
          mimeType: 'image/png',
          dataUrl: 'data:image/png;base64,abc123'
        },
        target: {
          tagName: 'section',
          selector: 'section.card',
          componentName: 'ProjectCard',
          filePath: 'src/components/ProjectCard.tsx',
          lineNumber: 12,
          label: 'section.card'
        }
      }]
    });

    expect(prompt).toContain('Comments:');
    expect(prompt).toContain('Make this card feel more editorial.');
    expect(prompt).toContain('data:image/png;base64,abc123');
  });
});
