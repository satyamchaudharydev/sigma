import type { PreviewMode, SelectedElementContext, SelectionSnapshot } from '../types';
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
import { collectComputedStyles, collectDefinedStyles } from './css';
import { hasVisibleTextContent, rectToBounds } from './utils';

export class StyleManager {
  session: StyleSession | null = null;
  selectionContext: Omit<SelectedElementContext, 'changes'> | null = null;
  previewMode: PreviewMode = 'live';

  createSession(element: HTMLElement): void {
    this.restore();
    this.session = createStyleSession(element);
    this.previewMode = 'live';
  }

  setContext(context: Omit<SelectedElementContext, 'changes'> | null): void {
    this.selectionContext = context;
  }

  applyStyle(property: string, value: string): boolean {
    if (!this.session) return false;
    if (this.previewMode === 'original') this.setPreviewMode('live');
    applyStyleValue(this.session, property, value);
    return true;
  }

  clearChanges(): boolean {
    if (!this.session) return false;
    clearStyleChanges(this.session);
    return true;
  }

  getSelection(): SelectedElementContext | null {
    if (!this.session || !this.selectionContext) return null;
    return { ...this.selectionContext, changes: getStyleChanges(this.session) };
  }

  getCurrentValue(property: string): string {
    if (!this.session) return '';
    return readStyleValue(this.session, property);
  }

  setPreviewMode(mode: PreviewMode): void {
    this.previewMode = mode;
    if (!this.session) return;
    if (mode === 'original') suspendStyleChanges(this.session);
    else reapplyStyleChanges(this.session);
  }

  restore(): void {
    if (this.session) clearStyleChanges(this.session);
    this.session = null;
    this.selectionContext = null;
  }

  getSelectionSnapshot(): SelectionSnapshot | null {
    if (!this.session || !this.selectionContext) return null;
    const changedProperties = new Set(getStyleChanges(this.session).map((c) => c.property));
    return {
      context: { ...this.selectionContext, changes: getStyleChanges(this.session) },
      values: listStyleValues(this.session),
      css: {
        defined: collectDefinedStyles(this.session.element, changedProperties),
        computed: collectComputedStyles(this.session.element, changedProperties)
      },
      html: this.session.element.outerHTML,
      hasTextContent: hasVisibleTextContent(this.session.element),
      display: readStyleValue(this.session, 'display'),
      rect: rectToBounds(this.session.element.getBoundingClientRect())
    };
  }
}
