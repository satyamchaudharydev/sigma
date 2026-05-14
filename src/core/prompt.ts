import type { PromptComment, SelectedElementContext } from '../types';

export function buildAgentPrompt(payload: {
  selection: SelectedElementContext | null;
  comments?: PromptComment[];
}): string {
  const { selection, comments = [] } = payload;
  const lines: string[] = ['Apply the following visual changes from the browser editor to the source code.', ''];

  const metadataIncomplete =
    !selection ||
    !selection.filePath ||
    !selection.lineNumber ||
    !selection.componentName ||
    comments.some((comment) => !comment.target.filePath || !comment.target.lineNumber || !comment.target.componentName);

  if (selection) {
    lines.push('## Element');
    lines.push(`- Tag: \`<${selection.tagName.toLowerCase()}>\``);
    lines.push(`- Component: ${selection.componentName ?? 'Unavailable'}`);
    lines.push(`- Selector: \`${selection.selector}\``);
    lines.push(`- File: ${formatFileLine(selection)}`);
    lines.push('');

    lines.push('## Style Changes');
    if (selection.changes.length === 0) {
      lines.push('- None recorded');
    } else {
      for (const change of selection.changes) {
        lines.push(`- \`${change.property}\`: \`${change.oldValue}\` → \`${change.newValue}\``);
      }
    }
    lines.push('');
  }

  if (comments.length > 0) {
    lines.push('## Review Comments');
    lines.push('');
    for (const comment of comments) {
      lines.push(`### Comment ${comment.number}`);
      lines.push(`- Element: \`<${comment.target.tagName}>\` \`${comment.target.selector}\``);
      lines.push(`- Component: ${comment.target.componentName ?? 'Unavailable'}`);
      lines.push(`- File: ${formatFileLine(comment.target)}`);
      lines.push(`- Label: ${comment.target.label}`);
      lines.push(`- Request: ${comment.text}`);
      if (comment.attachment) {
        lines.push(`- Image: ${comment.attachment.name} (${comment.attachment.mimeType})`);
        lines.push(`  \`${comment.attachment.dataUrl}\``);
      }
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('Update the relevant CSS, Tailwind classes, CSS-in-JS, or component styling to match the changes above.');

  if (metadataIncomplete) {
    lines.push('Note: Source metadata was incomplete — use the selector and component name to locate the element.');
  }

  return lines.join('\n');
}

function formatFileLine(context: { filePath: string | null; lineNumber: number | null }): string {
  if (context.filePath && context.lineNumber) {
    return `\`${context.filePath}\` line ${context.lineNumber}`;
  }
  if (context.filePath) {
    return `\`${context.filePath}\``;
  }
  return 'Unavailable';
}
