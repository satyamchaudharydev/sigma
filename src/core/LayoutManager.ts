import type { PanelDisplayMode, PanelDockSide, PanelLayoutSnapshot } from '../types';

export class LayoutManager {
  dockSide: PanelDockSide = 'right';
  displayMode: PanelDisplayMode = 'overlay';
  size = 456;
  isPanelOpen = false;
  showFourSides = false;
  private readonly layoutStyleElement: HTMLStyleElement;
  private cachedSnapshot: PanelLayoutSnapshot | null = null;

  constructor() {
    this.layoutStyleElement = document.createElement('style');
    this.layoutStyleElement.setAttribute('data-rve-layout', '');
    document.head.appendChild(this.layoutStyleElement);
  }

  openPanel(): boolean {
    if (this.isPanelOpen) return false;
    this.isPanelOpen = true;
    this.apply();
    return true;
  }

  closePanel(): boolean {
    if (!this.isPanelOpen) return false;
    this.isPanelOpen = false;
    this.apply();
    return true;
  }

  setDockSide(side: PanelDockSide): void {
    this.dockSide = side;
    this.size = this.clamp(this.size, side);
    this.cachedSnapshot = null;
    this.apply();
  }

  setDisplayMode(mode: PanelDisplayMode): void {
    this.displayMode = mode;
    this.cachedSnapshot = null;
    this.apply();
  }

  setSize(size: number): void {
    this.size = this.clamp(size, this.dockSide);
    this.cachedSnapshot = null;
    this.apply();
  }

  clampToViewport(): void {
    const clamped = this.clamp(this.size, this.dockSide);
    if (clamped !== this.size) {
      this.size = clamped;
      this.cachedSnapshot = null;
      this.apply();
    }
  }

  getSnapshot(): PanelLayoutSnapshot {
    if (
      this.cachedSnapshot &&
      this.cachedSnapshot.dockSide === this.dockSide &&
      this.cachedSnapshot.displayMode === this.displayMode &&
      this.cachedSnapshot.size === this.size &&
      this.cachedSnapshot.showFourSides === this.showFourSides
    ) {
      return this.cachedSnapshot;
    }
    this.cachedSnapshot = {
      dockSide: this.dockSide,
      displayMode: this.displayMode,
      size: this.size,
      showFourSides: this.showFourSides
    };
    return this.cachedSnapshot;
  }

  apply(): void {
    const root = document.documentElement;
    root.dataset.rvePanelDisplay = this.displayMode;
    root.dataset.rvePanelSide = this.dockSide;

    if (!this.isPanelOpen || this.displayMode !== 'split') {
      this.layoutStyleElement.textContent = '';
      return;
    }

    const property =
      this.dockSide === 'left' ? 'padding-left' :
      this.dockSide === 'right' ? 'padding-right' :
      this.dockSide === 'top' ? 'padding-top' : 'padding-bottom';

    this.layoutStyleElement.textContent = `
      html[data-rve-panel-display="split"] body {
        transition: padding 160ms ease;
        ${property}: ${this.size}px !important;
        box-sizing: border-box;
      }
    `;
  }

  reset(): void {
    const root = document.documentElement;
    delete root.dataset.rvePanelDisplay;
    delete root.dataset.rvePanelSide;
    this.layoutStyleElement.textContent = '';
    this.layoutStyleElement.remove();
  }

  private clamp(size: number, side: PanelDockSide): number {
    if (side === 'left' || side === 'right') {
      return Math.min(Math.max(320, window.innerWidth - 96), Math.max(320, size));
    }
    return Math.min(Math.max(240, window.innerHeight - 96), Math.max(240, size));
  }
}
