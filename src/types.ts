export interface StartEditorOptions {
  theme?: 'light' | 'dark' | 'auto';
  shortcut?: string;
}

export interface EditorInstance {
  destroy(): void;
  openPicker(): void;
  closePicker(): void;
  getSelection(): SelectedElementContext | null;
}

export interface StyleChange {
  property: string;
  oldValue: string;
  newValue: string;
}

export interface CommentAttachment {
  name: string;
  mimeType: string;
  dataUrl: string;
}

export interface CssInspectorEntry {
  property: string;
  value: string;
  source?: string;
  changed?: boolean;
}

export interface SelectedElementContext {
  tagName: string;
  selector: string;
  componentName: string | null;
  filePath: string | null;
  lineNumber: number | null;
  changes: StyleChange[];
}

export interface CommentTarget {
  tagName: string;
  selector: string;
  componentName: string | null;
  filePath: string | null;
  lineNumber: number | null;
  label: string;
}

export interface PromptComment {
  id: string;
  number: number;
  text: string;
  attachment: CommentAttachment | null;
  target: CommentTarget;
}

export interface StyleControlValue {
  value: string | number | null;
  unit?: string;
}

export interface ParsedShortcut {
  alt: boolean;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  key: string;
  label: string;
}

export interface ResolvedStartEditorOptions {
  theme: 'light' | 'dark' | 'auto';
  shortcut: string;
  parsedShortcut: ParsedShortcut;
}

export interface RectBounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface OverlayInfo {
  rect: RectBounds;
  title: string;
  subtitle?: string;
  emphasis?: 'default' | 'diff';
  metrics?: Array<{
    label: string;
    value: string;
  }>;
}

export type EditorTab = 'design' | 'css' | 'html';
export type PreviewMode = 'live' | 'original' | 'diff';
export type PanelDockSide = 'left' | 'right' | 'top' | 'bottom';
export type PanelDisplayMode = 'overlay' | 'split';

export interface PanelLayoutSnapshot {
  dockSide: PanelDockSide;
  displayMode: PanelDisplayMode;
  size: number;
  showFourSides: boolean;
}

export interface CommentSnapshot extends PromptComment {
  rect: RectBounds | null;
}

export interface CommentDraftSnapshot {
  mode: 'create' | 'edit';
  commentId: string | null;
  targetLabel: string;
  rect: RectBounds;
  text: string;
  attachment: CommentAttachment | null;
}

export interface SelectionSnapshot {
  context: SelectedElementContext;
  values: Record<string, string>;
  css: {
    defined: CssInspectorEntry[];
    computed: CssInspectorEntry[];
  };
  html: string;
  hasTextContent: boolean;
  display: string;
  rect: RectBounds | null;
}

export interface EditorSnapshot {
  isPickerOpen: boolean;
  isCommentModeOpen: boolean;
  activeTab: EditorTab;
  isPanelOpen: boolean;
  panelLayout: PanelLayoutSnapshot;
  previewMode: PreviewMode;
  hoverOverlay: OverlayInfo | null;
  selectedOverlay: OverlayInfo | null;
  selection: SelectionSnapshot | null;
  comments: CommentSnapshot[];
  commentDraft: CommentDraftSnapshot | null;
  totalComments: number;
  message: string | null;
  options: ResolvedStartEditorOptions;
}
