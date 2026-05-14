import { render } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { PencilLine, Paperclip, X } from 'lucide-preact';
import { EditorController, type MountAdapter } from './core/controller';
import { editorStyles } from './ui/theme';
import { Toolbar } from './ui/Toolbar';
import { Panel } from './ui/Panel';
import type { CommentAttachment, CommentSnapshot, EditorSnapshot, ResolvedStartEditorOptions } from './types';

function Root(props: { controller: EditorController; initialSnapshot: EditorSnapshot }) {
  const [snapshot, setSnapshot] = useState(props.initialSnapshot);
  const lastVersionRef = useRef(props.controller.getSnapshotVersion());

  useEffect(() => props.controller.subscribe(() => {
    const version = props.controller.getSnapshotVersion();
    if (version === lastVersionRef.current) return;
    lastVersionRef.current = version;
    setSnapshot(props.controller.getSnapshot());
  }), [props.controller]);

  const resolvedTheme = snapshot.options.theme === 'auto'
    ? (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : snapshot.options.theme;

  return (
    <div className="rve-root" data-theme={resolvedTheme}>
      {snapshot.hoverOverlay ? <Overlay info={snapshot.hoverOverlay} /> : null}
      {snapshot.selectedOverlay ? <Overlay info={snapshot.selectedOverlay} selected /> : null}
      <CommentLayer controller={props.controller} snapshot={snapshot} />
      {snapshot.commentDraft ? <CommentComposer controller={props.controller} snapshot={snapshot} /> : null}
      {snapshot.message ? <div className="rve-toast">{snapshot.message}</div> : null}
      <Toolbar controller={props.controller} snapshot={snapshot} />
      <Panel controller={props.controller} snapshot={snapshot} />
    </div>
  );
}

function Overlay(props: { info: NonNullable<EditorSnapshot['hoverOverlay']>; selected?: boolean }) {
  const showBelow = props.info.rect.top < 120;

  return (
    <div
      className="rve-overlay"
      data-selected={props.selected ? 'true' : 'false'}
      data-emphasis={props.info.emphasis ?? 'default'}
      style={{
        top: `${props.info.rect.top}px`,
        left: `${props.info.rect.left}px`,
        width: `${props.info.rect.width}px`,
        height: `${props.info.rect.height}px`
      }}
    >
      <div className="rve-overlay-card" data-placement={showBelow ? 'below' : 'above'}>
        <div className="rve-overlay-header">
          <div className="rve-overlay-title-block">
            <div className="rve-overlay-title">{props.info.title}</div>
            {props.info.subtitle ? <div className="rve-overlay-subtitle">{props.info.subtitle}</div> : null}
          </div>
          {props.info.metrics?.[0] ? <div className="rve-overlay-dimension">{props.info.metrics[0].value}</div> : null}
        </div>
        {props.info.metrics?.slice(1).map((metric) => (
          <div className="rve-overlay-row" key={metric.label}>
            <span className="rve-overlay-row-label">{metric.label}</span>
            <span className="rve-overlay-row-value">
              {metric.label === 'Color' ? (
                <span
                  className="rve-overlay-color-chip"
                  aria-hidden="true"
                  style={{ background: metric.value }}
                />
              ) : null}
              <span>{metric.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommentLayer(props: { controller: EditorController; snapshot: EditorSnapshot }) {
  return (
    <>
      {props.snapshot.comments.map((comment) => (
        <CommentMarker key={comment.id} controller={props.controller} comment={comment} />
      ))}
    </>
  );
}

function CommentMarker(props: { controller: EditorController; comment: CommentSnapshot }) {
  const [isHovered, setIsHovered] = useState(false);
  const rect = props.comment.rect;
  if (!rect) {
    return null;
  }

  const left = rect.left + Math.max(20, Math.min(rect.width / 2, Math.max(28, rect.width - 20)));
  const top = Math.max(12, rect.top - 28);

  return (
    <div
      className="rve-comment-anchor"
      style={{ left: `${left}px`, top: `${top}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="rve-comment-line" aria-hidden="true" />
      <button
        type="button"
        className="rve-comment-marker"
        aria-label={`Comment ${props.comment.number}`}
        onClick={() => props.controller.openCommentEditor(props.comment.id)}
      >
        <span className="rve-comment-marker-label" data-hidden={isHovered ? 'true' : 'false'}>{props.comment.number}</span>
        <span className="rve-comment-marker-icon" data-visible={isHovered ? 'true' : 'false'}>
          <PencilLine size={14} strokeWidth={2.2} />
        </span>
      </button>
      {isHovered ? (
        <div className="rve-comment-tooltip">
          <div className="rve-comment-tooltip-target">{props.comment.target.label}</div>
          <div className="rve-comment-tooltip-text">{props.comment.text}</div>
          {props.comment.attachment ? (
            <img className="rve-comment-tooltip-image" src={props.comment.attachment.dataUrl} alt={props.comment.attachment.name} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function CommentComposer(props: { controller: EditorController; snapshot: EditorSnapshot }) {
  const draft = props.snapshot.commentDraft;
  const inputRef = useRef<HTMLInputElement>(null);

  if (!draft) {
    return null;
  }

  const showBelow = draft.rect.top < 180;
  const popoverWidth = 360;
  const left = clamp(draft.rect.left + (draft.rect.width / 2) - (popoverWidth / 2), 12, window.innerWidth - popoverWidth - 12);
  const top = showBelow ? Math.min(window.innerHeight - 216, draft.rect.top + draft.rect.height + 14) : Math.max(12, draft.rect.top - 196);

  return (
    <div className="rve-comment-composer" style={{ left: `${left}px`, top: `${top}px`, width: `${popoverWidth}px` }}>
      <textarea
        className="rve-comment-input"
        value={draft.text}
        placeholder="What should change?"
        onInput={(event) => props.controller.updateCommentDraftText((event.currentTarget as HTMLTextAreaElement).value)}
      />
      <div className="rve-comment-composer-footer">
        <div className="rve-comment-attachment-area">
          <input
            ref={inputRef}
            className="rve-comment-file-input"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => {
              const file = (event.currentTarget as HTMLInputElement).files?.[0];
              if (!file) {
                return;
              }

              const reader = new FileReader();
              reader.onload = () => {
                props.controller.updateCommentDraftAttachment({
                  name: file.name,
                  mimeType: file.type || 'image/png',
                  dataUrl: typeof reader.result === 'string' ? reader.result : ''
                });
              };
              reader.readAsDataURL(file);
              event.currentTarget.value = '';
            }}
          />
          <button type="button" className="rve-comment-attach-button" onClick={() => inputRef.current?.click()}>
            <Paperclip size={14} strokeWidth={2.1} />
            <span>{draft.attachment ? 'Change image' : 'Add image'}</span>
          </button>
          {draft.attachment ? (
            <AttachmentPreview attachment={draft.attachment} onRemove={() => props.controller.updateCommentDraftAttachment(null)} />
          ) : null}
        </div>
        <div className="rve-comment-actions">
          <button type="button" className="rve-comment-action rve-comment-action-ghost" onClick={() => props.controller.closeCommentDraft()}>
            Cancel
          </button>
          <button type="button" className="rve-comment-action rve-comment-action-primary" onClick={() => props.controller.saveCommentDraft()}>
            {draft.mode === 'edit' ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AttachmentPreview(props: { attachment: CommentAttachment; onRemove: () => void }) {
  return (
    <div className="rve-comment-attachment-preview">
      <img src={props.attachment.dataUrl} alt={props.attachment.name} className="rve-comment-attachment-image" />
      <div className="rve-comment-attachment-meta">
        <div className="rve-comment-attachment-name">{props.attachment.name}</div>
      </div>
      <button type="button" className="rve-comment-attachment-remove" aria-label="Remove attachment" onClick={props.onRemove}>
        <X size={14} strokeWidth={2.1} />
      </button>
    </div>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function mountEditor(options: ResolvedStartEditorOptions): EditorController {
  const host = document.createElement('div');
  host.setAttribute('data-react-visual-editor', '');
  document.body.appendChild(host);
  const shadowRoot = host.attachShadow({ mode: 'open' });

  const styleElement = document.createElement('style');
  styleElement.textContent = editorStyles;
  shadowRoot.appendChild(styleElement);

  const appRoot = document.createElement('div');
  shadowRoot.appendChild(appRoot);

  let controller: EditorController;
  const mountAdapter: MountAdapter = {
    unmount() {
      render(null, appRoot);
      host.remove();
    }
  };

  controller = new EditorController(options, host, mountAdapter);
  render(<Root controller={controller} initialSnapshot={controller.getSnapshot()} />, appRoot);
  return controller;
}
