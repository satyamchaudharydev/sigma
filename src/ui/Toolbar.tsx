import { Copy, FlipHorizontal2, MessageCircleMore, MousePointer2 } from 'lucide-preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { EditorSnapshot } from '../types';
import type { EditorController } from '../core/controller';

interface Point {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function ToolbarIconButton(props: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ComponentChildren;
}) {
  return (
    <button
      type="button"
      className="rve-toolbar-icon"
      data-active={props.active ? 'true' : 'false'}
      aria-label={props.label}
      title={props.label}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

export function Toolbar(props: { controller: EditorController; snapshot: EditorSnapshot }) {
  const changes = props.snapshot.selection?.context.changes.length ?? 0;
  const canCopy = changes > 0 || props.snapshot.totalComments > 0;
  const rootRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef<Point | null>(null);
  const [position, setPosition] = useState<Point>({ x: 20, y: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const nextY = window.innerHeight - 76;
    setPosition((current) => ({ x: current.x, y: current.y === 0 ? nextY : current.y }));
    setReady(true);
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragOffsetRef.current || !rootRef.current) {
        return;
      }

      const width = rootRef.current.offsetWidth;
      const height = rootRef.current.offsetHeight;
      setPosition({
        x: clamp(event.clientX - dragOffsetRef.current.x, 12, window.innerWidth - width - 12),
        y: clamp(event.clientY - dragOffsetRef.current.y, 12, window.innerHeight - height - 12)
      });
    };

    const handlePointerUp = () => {
      dragOffsetRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="rve-toolbar"
      style={ready ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
      onPointerDown={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest('button')) {
          return;
        }

        const rect = rootRef.current?.getBoundingClientRect();
        if (!rect) {
          return;
        }

        dragOffsetRef.current = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
      }}
    >
      <div className="rve-toolbar-drag" aria-hidden="true" />
      <div className="rve-toolbar-actions">
        <ToolbarIconButton
          label={props.snapshot.isPickerOpen ? 'Exit cursor mode' : 'Cursor mode'}
          active={props.snapshot.isPickerOpen}
          onClick={() => (props.snapshot.isPickerOpen ? props.controller.closePicker() : props.controller.openPicker())}
        >
          <MousePointer2 className="rve-toolbar-icon-svg" strokeWidth={2.2} />
        </ToolbarIconButton>
        {!props.snapshot.isPanelOpen && props.snapshot.selection ? (
          <button
            type="button"
            className="rve-toolbar-mode"
            data-state="live"
            onClick={() => props.controller.openPanel()}
            title="Reopen inspector"
          >
            <span className="rve-toolbar-mode-label">Panel</span>
          </button>
        ) : null}
        <ToolbarIconButton
          label={props.snapshot.isCommentModeOpen ? 'Exit comment mode' : 'Comment mode'}
          active={props.snapshot.isCommentModeOpen}
          onClick={() => props.controller.toggleCommentMode()}
        >
          <MessageCircleMore className="rve-toolbar-icon-svg" strokeWidth={2.1} />
        </ToolbarIconButton>
        <button
          type="button"
          className="rve-toolbar-mode"
          data-state={props.snapshot.previewMode}
          onClick={() => props.controller.cyclePreviewMode()}
          title={`Preview mode: ${props.snapshot.previewMode}`}
        >
          <FlipHorizontal2 className="rve-toolbar-icon-svg" strokeWidth={2.1} />
          <span className="rve-toolbar-mode-label">
            {props.snapshot.previewMode === 'live' ? 'Live' : props.snapshot.previewMode === 'original' ? 'Original' : 'Diff'}
          </span>
        </button>
        <ToolbarIconButton
          label="Copy prompt"
          disabled={!canCopy}
          onClick={() => void props.controller.copyPrompt()}
        >
          <Copy className="rve-toolbar-icon-svg" strokeWidth={2.1} />
        </ToolbarIconButton>
      </div>
    </div>
  );
}
