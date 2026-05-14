import type { PromptComment, SelectedElementContext } from '../types';

export function buildAgentPrompt(payload: {
  selection: SelectedElementContext | null;
  comments?: PromptComment[];
}): string {
  const { selection, comments = [] } = payload;
  const lines = ['I made the following visual changes and review comments in the browser. Please apply them to the source code.', ''];

  if (selection) {
    lines.push(`Element: <${selection.tagName.toLowerCase()}${selectorSuffix(selection.selector)}>`);
    lines.push(`Component: ${selection.componentName ?? 'Unavailable'}`);
    lines.push(metadataLine(selection));
    lines.push('');
    lines.push('Style changes:');

    if (selection.changes.length === 0) {
      lines.push('- None recorded');
    } else {
      for (const change of selection.changes) {
        lines.push(`- ${change.property}: ${change.oldValue} -> ${change.newValue}`);
      }
    }

    lines.push('');
  }

  if (comments.length > 0) {
    lines.push('Comments:');
    for (const comment of comments) {
      lines.push(`- Comment ${comment.number} on <${comment.target.tagName}${selectorSuffix(comment.target.selector)}>`);
      lines.push(`  Component: ${comment.target.componentName ?? 'Unavailable'}`);
      lines.push(`  ${metadataLine(comment.target)}`);
      lines.push(`  Target label: ${comment.target.label}`);
      lines.push(`  Request: ${comment.text}`);
      if (comment.attachment) {
        lines.push(`  Image attachment: ${comment.attachment.name} (${comment.attachment.mimeType})`);
        lines.push(`  Image data: ${comment.attachment.dataUrl}`);
      }
    }
    lines.push('');
  }

  lines.push('Please update the relevant CSS, utility classes, CSS-in-JS, component styling, and content to match these exact changes and comments.');

  if (
    !selection ||
    !selection.filePath ||
    !selection.lineNumber ||
    !selection.componentName ||
    comments.some((comment) => !comment.target.filePath || !comment.target.lineNumber || !comment.target.componentName)
  ) {
    lines.push('Source metadata was not fully available, so use the DOM selector context above to find the correct element.');
  }

  return lines.join('\n');
}

function selectorSuffix(selector: string): string {
  const trimmed = selector.trim();
  if (!trimmed) {
    return '';
  }
  return ` selector=\"${trimmed}\"`;
}

function metadataLine(context: { filePath: string | null; lineNumber: number | null }): string {
  if (context.filePath && context.lineNumber) {
    return `File: ${context.filePath} (line ${context.lineNumber})`;
  }
  if (context.filePath) {
    return `File: ${context.filePath}`;
  }
  return 'File: Unavailable';
}
