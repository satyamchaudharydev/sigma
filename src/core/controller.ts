import type {
  CommentAttachment,
  CommentDraftSnapshot,
  CommentSnapshot,
  CommentTarget,
  EditorInstance,
  PanelDisplayMode,
  PanelDockSide,
  EditorSnapshot,
  EditorTab,
  OverlayInfo,
  PreviewMode,
  PromptComment,
  RectBounds,
  ResolvedStartEditorOptions,
  SelectedElementContext,
  SelectionSnapshot
} from '../types';
import { resolveFiberMetadata } from './fiber';
import { ElementPicker } from './picker';
import { buildAgentPrompt } from './prompt';
import { collectComputedStyles, collectDefinedStyles } from './css';
import {
  applyStyleValue,
  clearStyleChanges,
  createStyleSession,
  getStyleChanges,
  listStyleValues,
  readStyleValue,
  reapplyStyleChanges,
  suspendStyleChanges,
  type StyleSession
} from './styles';
import {
  colorStringToHex,
  describeElement,
  getElementSelector,
  hasVisibleTextContent,
  isEditableTarget,
  matchesShortcut,
  rectToBounds
} from './utils';

export interface MountAdapter {
  unmount(): void;
}

interface CommentRecord {
  id: string;
  element: HTMLElement;
  selector: string;
  target: CommentTarget;
  text: string;
  attachment: CommentAttachment | null;
  createdAt: number;
  updatedAt: number;
}

interface CommentDraftState {
  mode: 'create' | 'edit';
  commentId: string | null;
  element: HTMLElement;
  selector: string;
  target: CommentTarget;
  text: string;
  attachment: CommentAttachment | null;
}

export class EditorController implements EditorInstance {
  private readonly options: ResolvedStartEditorOptions;
  private readonly host: HTMLElement;
  private readonly layoutStyleElement: HTMLStyleElement;
  private readonly subscriptions = new Set<() => void>();
  private readonly picker: ElementPicker;
  private readonly commentPicker: ElementPicker;
  private readonly mountAdapter: MountAdapter;
  private session: StyleSession | null = null;
  private selectionContext: Omit<SelectedElementContext, 'changes'> | null = null;
  private isPickerOpen = false;
  private isCommentModeOpen = false;
  private isPanelOpen = false;
  private panelDockSide: PanelDockSide = 'right';
  private panelDisplayMode: PanelDisplayMode = 'overlay';
  private panelSize = 456;
  private showFourSides = false;
  private activeTab: EditorTab = 'design';
  private previewMode: PreviewMode = 'live';
  private hoverOverlay: OverlayInfo | null = null;
  private comments: CommentRecord[] = [];
  private commentDraft: CommentDraftState | null = null;
  private message: string | null = null;
  private messageTimeout: number | null = null;
  private isDestroyed = false;
  private snapshotVersion = 0;
  private viewportChangeFrame: number | null = null;

  constructor(options: ResolvedStartEditorOptions, host: HTMLElement, mountAdapter: MountAdapter) {
    this.options = options;
    this.host = host;
    this.mountAdapter = mountAdapter;
    this.layoutStyleElement = document.createElement('style');
    this.layoutStyleElement.setAttribute('data-rve-layout', '');
    document.head.appendChild(this.layoutStyleElement);

    this.picker = new ElementPicker({
      shortcut: this.options.parsedShortcut,
      shouldIgnoreElement: (element) => this.shouldIgnoreElement(element),
      onHover: (element, rect, label) => {
        this.hoverOverlay = element && rect && label ? this.createHoverOverlay(element, rect, label) : null;
        this.notify();
      },
      onSelect: (element) => {
        void this.selectElement(element);
      },
      onCancel: () => this.closePicker()
    });

    this.commentPicker = new ElementPicker({
      shortcut: this.options.parsedShortcut,
      shouldIgnoreElement: (element) => this.shouldIgnoreElement(element),
      onHover: (element, rect, label) => {
        this.hoverOverlay = element && rect && label ? this.createHoverOverlay(element, rect, label) : null;
        this.notify();
      },
      onSelect: (element) => {
        void this.beginCommentForElement(element);
      },
      onCancel: () => this.closeCommentMode()
    });

    document.addEventListener('keydown', this.handleGlobalKeyDown, true);
    window.addEventListener('scroll', this.handleViewportChange, true);
    window.addEventListener('resize', this.handleViewportChange, true);
    this.applyPanelLayout();
  }

  destroy(): void {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;
    this.picker.destroy();
    this.commentPicker.destroy();
    this.restoreSelection();
    document.removeEventListener('keydown', this.handleGlobalKeyDown, true);
    window.removeEventListener('scroll', this.handleViewportChange, true);
    window.removeEventListener('resize', this.handleViewportChange, true);
    if (this.viewportChangeFrame !== null) {
      cancelAnimationFrame(this.viewportChangeFrame);
    }
    this.resetDocumentLayout();
    this.layoutStyleElement.remove();
    if (this.messageTimeout !== null) {
      window.clearTimeout(this.messageTimeout);
    }
    this.mountAdapter.unmount();
    this.subscriptions.clear();
  }

  openPicker(): void {
    this.closeCommentMode();
    this.isPickerOpen = true;
    this.setMessage('Picker mode enabled');
    this.picker.open();
    this.notify();
  }

  closePicker(): void {
    this.isPickerOpen = false;
    this.picker.close();
    this.notify();
  }

  openCommentMode(): void {
    this.closePicker();
    this.commentDraft = null;
    this.isCommentModeOpen = true;
    this.setMessage('Comment mode enabled');
    this.commentPicker.open();
    this.notify();
  }

  closeCommentMode(): void {
    this.isCommentModeOpen = false;
    this.commentPicker.close();
    this.notify();
  }

  toggleCommentMode(): void {
    if (this.isCommentModeOpen) {
      this.closeCommentMode();
      return;
    }

    this.openCommentMode();
  }

  getSelection(): SelectedElementContext | null {
    if (!this.session || !this.selectionContext) {
      return null;
    }

    return {
      ...this.selectionContext,
      changes: getStyleChanges(this.session)
    };
  }

  subscribe(callback: () => void): () => void {
    this.subscriptions.add(callback);
    return () => {
      this.subscriptions.delete(callback);
    };
  }

  getSnapshotVersion(): number {
    return this.snapshotVersion;
  }

  getSnapshot(): EditorSnapshot {
    return {
      isPickerOpen: this.isPickerOpen,
      isCommentModeOpen: this.isCommentModeOpen,
      activeTab: this.activeTab,
      isPanelOpen: this.isPanelOpen,
      panelLayout: {
        dockSide: this.panelDockSide,
        displayMode: this.panelDisplayMode,
        size: this.panelSize,
        showFourSides: this.showFourSides
      },
      previewMode: this.previewMode,
      hoverOverlay: this.hoverOverlay,
      selectedOverlay: this.getSelectedOverlay(),
      selection: this.getSelectionSnapshot(),
      comments: this.getCommentsSnapshot(),
      commentDraft: this.getCommentDraftSnapshot(),
      totalComments: this.comments.length,
      message: this.message,
      options: this.options
    };
  }

  setActiveTab(tab: EditorTab): void {
    this.activeTab = tab;
    this.notify();
  }

  setShowFourSides(value: boolean): void {
    this.showFourSides = value;
    this.notify();
  }

  setPanelDockSide(side: PanelDockSide): void {
    this.panelDockSide = side;
    this.panelSize = this.clampPanelSize(this.panelSize, side);
    this.applyPanelLayout();
    this.notify();
  }

  setPanelDisplayMode(mode: PanelDisplayMode): void {
    this.panelDisplayMode = mode;
    this.applyPanelLayout();
    this.notify();
  }

  setPanelSize(size: number): void {
    this.panelSize = this.clampPanelSize(size, this.panelDockSide);
    this.applyPanelLayout();
    this.notify();
  }

  async selectElement(element: HTMLElement): Promise<void> {
    if (this.shouldIgnoreElement(element)) {
      return;
    }

    this.restoreSelection();
    this.closeCommentMode();
    this.closeCommentDraft();
    this.closePicker();
    this.session = createStyleSession(element);
    this.isPanelOpen = true;
    this.previewMode = 'live';
    this.applyPanelLayout();

    const metadata = await resolveFiberMetadata(element);
    this.selectionContext = {
      tagName: element.tagName.toLowerCase(),
      selector: getElementSelector(element),
      componentName: metadata.componentName,
      filePath: metadata.filePath,
      lineNumber: metadata.lineNumber
    };
    this.activeTab = 'design';
    this.setMessage(`Selected ${describeElement(element)}`);
    this.notify();
  }

  async beginCommentForElement(element: HTMLElement): Promise<void> {
    if (this.shouldIgnoreElement(element)) {
      return;
    }

    const metadata = await resolveFiberMetadata(element);
    const target = this.createCommentTarget(element, metadata);
    const selector = getElementSelector(element);
    const existing = this.comments.find((comment) => comment.element === element || (selector && comment.selector === selector));

    this.commentPicker.close();
    this.isCommentModeOpen = false;
    this.hoverOverlay = null;
    this.commentDraft = {
      mode: existing ? 'edit' : 'create',
      commentId: existing?.id ?? null,
      element,
      selector,
      target,
      text: existing?.text ?? '',
      attachment: existing?.attachment ?? null
    };
    this.setMessage(existing ? 'Comment ready to edit' : 'Comment target selected');
    this.notify();
  }

  openCommentEditor(commentId: string): void {
    const comment = this.comments.find((entry) => entry.id === commentId);
    if (!comment) {
      return;
    }

    this.closePicker();
    this.closeCommentMode();
    this.commentDraft = {
      mode: 'edit',
      commentId: comment.id,
      element: comment.element,
      selector: comment.selector,
      target: comment.target,
      text: comment.text,
      attachment: comment.attachment
    };
    this.notify();
  }

  updateCommentDraftText(text: string): void {
    if (!this.commentDraft) {
      return;
    }

    this.commentDraft = {
      ...this.commentDraft,
      text
    };
    this.notify();
  }

  updateCommentDraftAttachment(attachment: CommentAttachment | null): void {
    if (!this.commentDraft) {
      return;
    }

    this.commentDraft = {
      ...this.commentDraft,
      attachment
    };
    this.notify();
  }

  saveCommentDraft(): void {
    if (!this.commentDraft) {
      return;
    }

    const text = this.commentDraft.text.trim();
    if (!text && !this.commentDraft.attachment) {
      this.setMessage('Add a comment or image before saving');
      this.notify();
      return;
    }

    const existing = this.comments.find((comment) => comment.element === this.commentDraft?.element || comment.id === this.commentDraft?.commentId);
    const timestamp = Date.now();

    if (existing) {
      existing.target = this.commentDraft.target;
      existing.text = text;
      existing.attachment = this.commentDraft.attachment;
      existing.updatedAt = timestamp;
      this.setMessage('Comment updated');
    } else {
      this.comments.push({
        id: `comment-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
        element: this.commentDraft.element,
        selector: this.commentDraft.selector,
        target: this.commentDraft.target,
        text,
        attachment: this.commentDraft.attachment,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      this.setMessage('Comment added');
    }

    this.commentDraft = null;
    this.notify();
  }

  closeCommentDraft(): void {
    if (!this.commentDraft) {
      return;
    }

    this.commentDraft = null;
    this.notify();
  }

  updateStyle(property: string, value: string): void {
    if (!this.session) {
      return;
    }

    if (this.previewMode === 'original') {
      this.setPreviewMode('live');
    }

    applyStyleValue(this.session, property, value);
    this.notify();
  }

  updateManyStyles(changes: Array<{ property: string; value: string }>): void {
    for (const change of changes) {
      this.updateStyle(change.property, change.value);
    }
  }

  clearChanges(): void {
    if (!this.session) {
      return;
    }

    clearStyleChanges(this.session);
    this.setMessage('Cleared inline preview changes');
    this.notify();
  }

  async copyPrompt(): Promise<void> {
    const selection = this.getSelection();
    const comments = this.getPromptComments();
    if ((!selection || selection.changes.length === 0) && comments.length === 0) {
      return;
    }

    const prompt = buildAgentPrompt({ selection, comments });
    try {
      await navigator.clipboard.writeText(prompt);
      this.setMessage('Prompt copied to clipboard');
    } catch {
      this.setMessage('Clipboard copy failed. You can copy from the panel text instead.');
    }
    this.notify();
  }

  getCurrentValue(property: string): string {
    if (!this.session) {
      return '';
    }
    return readStyleValue(this.session, property);
  }

  private handleViewportChange = (): void => {
    if (this.viewportChangeFrame !== null) return;
    this.viewportChangeFrame = requestAnimationFrame(() => {
      this.viewportChangeFrame = null;
      this.panelSize = this.clampPanelSize(this.panelSize, this.panelDockSide);
      this.applyPanelLayout();
      if (this.hoverOverlay || this.session || this.comments.length > 0 || this.commentDraft) {
        this.notify();
      }
    });
  };

  private handleGlobalKeyDown = (event: KeyboardEvent): void => {
    if (matchesShortcut(event, this.options.parsedShortcut) && !isEditableTarget(event.target)) {
      event.preventDefault();
      if (this.isPickerOpen) {
        this.closePicker();
      } else {
        this.openPicker();
      }
      return;
    }

    if (event.key === 'Escape' && this.commentDraft) {
      event.preventDefault();
      this.closeCommentDraft();
      return;
    }

    if (event.key === 'Escape' && this.activeTab === 'html') {
      this.activeTab = 'design';
      this.notify();
    }
  };

  clearSelection(): void {
    this.restoreSelection();
    this.notify();
  }

  closePanel(): void {
    if (!this.session) {
      return;
    }

    this.isPanelOpen = false;
    this.applyPanelLayout();
    this.notify();
  }

  openPanel(): void {
    if (!this.session) {
      return;
    }

    this.isPanelOpen = true;
    this.applyPanelLayout();
    this.notify();
  }

  cyclePreviewMode(): void {
    const nextMode: PreviewMode = this.previewMode === 'live' ? 'original' : this.previewMode === 'original' ? 'diff' : 'live';

    this.setPreviewMode(nextMode);
    this.setMessage(nextMode === 'live' ? 'Viewing edited preview' : nextMode === 'original' ? 'Viewing original preview' : 'Viewing diff preview');
    this.notify();
  }

  showMessage(message: string): void {
    this.setMessage(message);
    this.notify();
  }

  private resolveCommentRect(element: HTMLElement, selector: string): RectBounds {
    const el = element.isConnected
      ? element
      : (selector ? document.querySelector(selector) as HTMLElement | null : null);
    const rect = el?.getBoundingClientRect() ?? new DOMRect();
    return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
  }

  private getSelectionSnapshot(): SelectionSnapshot | null {
    if (!this.session || !this.selectionContext) {
      return null;
    }

    return {
      context: {
        ...this.selectionContext,
        changes: getStyleChanges(this.session)
      },
      values: listStyleValues(this.session),
      css: this.getCssSnapshot(),
      html: this.session.element.outerHTML,
      hasTextContent: hasVisibleTextContent(this.session.element),
      display: readStyleValue(this.session, 'display'),
      rect: rectToBounds(this.session.element.getBoundingClientRect())
    };
  }

  private getCommentsSnapshot(): CommentSnapshot[] {
    return this.comments.map((comment, index) => ({
      id: comment.id,
      number: index + 1,
      text: comment.text,
      attachment: comment.attachment,
      target: comment.target,
      rect: this.resolveCommentRect(comment.element, comment.selector)
    }));
  }

  private getCommentDraftSnapshot(): CommentDraftSnapshot | null {
    if (!this.commentDraft) {
      return null;
    }

    return {
      mode: this.commentDraft.mode,
      commentId: this.commentDraft.commentId,
      targetLabel: this.commentDraft.target.label,
      rect: this.resolveCommentRect(this.commentDraft.element, this.commentDraft.selector),
      text: this.commentDraft.text,
      attachment: this.commentDraft.attachment
    };
  }

  private getPromptComments(): PromptComment[] {
    return this.comments.map((comment, index) => ({
      id: comment.id,
      number: index + 1,
      text: comment.text,
      attachment: comment.attachment,
      target: comment.target
    }));
  }

  private getSelectedOverlay(): OverlayInfo | null {
    if (!this.session || !this.selectionContext) {
      return null;
    }

    const rect = this.session.element.getBoundingClientRect();
    return {
      rect: rectToBounds(rect),
      title: this.selectionContext.componentName ?? describeElement(this.session.element),
      subtitle: describeElement(this.session.element),
      emphasis: this.previewMode === 'diff' ? 'diff' : 'default',
      metrics: [
        {
          label: 'Size',
          value: `${Math.round(rect.width)}×${Math.round(rect.height)}`
        },
        {
          label: 'Preview',
          value: formatPreviewMode(this.previewMode)
        }
      ]
    };
  }

  private getCssSnapshot(): SelectionSnapshot['css'] {
    if (!this.session) {
      return { defined: [], computed: [] };
    }

    const changedProperties = new Set(getStyleChanges(this.session).map((change) => change.property));

    return {
      defined: collectDefinedStyles(this.session.element, changedProperties),
      computed: collectComputedStyles(this.session.element, changedProperties)
    };
  }

  private createHoverOverlay(element: HTMLElement, rect: RectBounds, label: string): OverlayInfo {
    const computed = window.getComputedStyle(element);
    const fontSize = computed.getPropertyValue('font-size').trim() || 'inherit';
    const fontFamily = formatFontFamily(computed.getPropertyValue('font-family'));
    const textColor = colorStringToHex(computed.getPropertyValue('color').trim());
    const tagName = element.tagName.toLowerCase();

    return {
      rect,
      title: tagName,
      subtitle: this.getHoverSubtitle(element, label),
      metrics: [
        {
          label: 'Size',
          value: `${Math.round(rect.width)}×${Math.round(rect.height)}`
        },
        {
          label: 'Color',
          value: textColor
        },
        {
          label: 'Font',
          value: `${fontSize} ${fontFamily}`.trim()
        }
      ]
    };
  }

  private getHoverSubtitle(element: HTMLElement, label: string): string | undefined {
    const componentName = this.selectionContext?.componentName;
    if (componentName && this.session?.element === element) {
      return componentName;
    }

    const selector = label || describeElement(element);
    return selector === element.tagName.toLowerCase() ? undefined : selector;
  }

  private createCommentTarget(
    element: HTMLElement,
    metadata: { componentName: string | null; filePath: string | null; lineNumber: number | null }
  ): CommentTarget {
    return {
      tagName: element.tagName.toLowerCase(),
      selector: getElementSelector(element),
      componentName: metadata.componentName,
      filePath: metadata.filePath,
      lineNumber: metadata.lineNumber,
      label: describeElement(element)
    };
  }

  private shouldIgnoreElement(element: HTMLElement): boolean {
    return element === this.host || this.host.contains(element);
  }

  private restoreSelection(): void {
    if (!this.session) {
      this.selectionContext = null;
      return;
    }

    clearStyleChanges(this.session);
    this.session = null;
    this.selectionContext = null;
    this.isPanelOpen = false;
    this.applyPanelLayout();
  }

  private setMessage(message: string): void {
    this.message = message;
    if (this.messageTimeout !== null) {
      window.clearTimeout(this.messageTimeout);
    }
    this.messageTimeout = window.setTimeout(() => {
      this.message = null;
      this.notify();
    }, 2400);
  }

  private notify(): void {
    this.snapshotVersion += 1;
    for (const callback of this.subscriptions) {
      callback();
    }
  }

  private setPreviewMode(mode: PreviewMode): void {
    this.previewMode = mode;

    if (!this.session) {
      return;
    }

    if (mode === 'original') {
      suspendStyleChanges(this.session);
      return;
    }

    reapplyStyleChanges(this.session);
  }

  private clampPanelSize(size: number, side: PanelDockSide): number {
    if (side === 'left' || side === 'right') {
      return clampNumber(size, 320, Math.max(320, window.innerWidth - 96));
    }

    return clampNumber(size, 240, Math.max(240, window.innerHeight - 96));
  }

  private applyPanelLayout(): void {
    const root = document.documentElement;
    root.dataset.rvePanelDisplay = this.panelDisplayMode;
    root.dataset.rvePanelSide = this.panelDockSide;

    if (!this.isPanelOpen || this.panelDisplayMode !== 'split') {
      this.layoutStyleElement.textContent = '';
      return;
    }

    const property =
      this.panelDockSide === 'left'
        ? 'padding-left'
        : this.panelDockSide === 'right'
          ? 'padding-right'
          : this.panelDockSide === 'top'
            ? 'padding-top'
            : 'padding-bottom';

    this.layoutStyleElement.textContent = `
      html[data-rve-panel-display="split"] body {
        transition: padding 160ms ease;
        ${property}: ${this.panelSize}px !important;
        box-sizing: border-box;
      }
    `;
  }

  private resetDocumentLayout(): void {
    const root = document.documentElement;
    delete root.dataset.rvePanelDisplay;
    delete root.dataset.rvePanelSide;
    this.layoutStyleElement.textContent = '';
  }
}

function formatFontFamily(rawValue: string): string {
  const first = rawValue
    .split(',')
    .map((value) => value.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)[0];

  if (!first) {
    return 'inherit';
  }

  return first.length > 18 ? `${first.slice(0, 18)}...` : first;
}

function formatPreviewMode(mode: PreviewMode): string {
  if (mode === 'original') {
    return 'Original';
  }
  if (mode === 'diff') {
    return 'Diff';
  }
  return 'Live';
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
