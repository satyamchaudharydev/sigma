import type { RectBounds } from '../types';
import type { ParsedShortcut } from '../types';
import { describeElement, isEditableTarget, matchesShortcut, rectToBounds } from './utils';

interface PickerOptions {
  shortcut: ParsedShortcut;
  shouldIgnoreElement: (element: HTMLElement) => boolean;
  onHover: (element: HTMLElement | null, rect: RectBounds | null, label: string | null) => void;
  onSelect: (element: HTMLElement) => void;
  onCancel: () => void;
}

export class ElementPicker {
  private readonly options: PickerOptions;
  private isOpen = false;
  private hoveredElement: HTMLElement | null = null;

  constructor(options: PickerOptions) {
    this.options = options;
  }

  open(): void {
    if (this.isOpen) {
      return;
    }

    this.isOpen = true;
    document.addEventListener('mouseover', this.handleMouseOver, true);
    document.addEventListener('click', this.handleClick, true);
    document.addEventListener('keydown', this.handleKeyDown, true);
    document.body.style.cursor = 'crosshair';
  }

  close(): void {
    if (!this.isOpen) {
      return;
    }

    this.isOpen = false;
    this.hoveredElement = null;
    document.removeEventListener('mouseover', this.handleMouseOver, true);
    document.removeEventListener('click', this.handleClick, true);
    document.removeEventListener('keydown', this.handleKeyDown, true);
    document.body.style.removeProperty('cursor');
    this.options.onHover(null, null, null);
  }

  destroy(): void {
    this.close();
  }

  private handleMouseOver = (event: MouseEvent): void => {
    const element = this.resolveTarget(event.target);
    if (!element) {
      this.hoveredElement = null;
      this.options.onHover(null, null, null);
      return;
    }

    this.hoveredElement = element;
    this.options.onHover(element, rectToBounds(element.getBoundingClientRect()), describeElement(element));
  };

  private handleClick = (event: MouseEvent): void => {
    const element = this.resolveTarget(event.target);
    if (!element) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.options.onSelect(element);
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.options.onCancel();
      return;
    }

    if (matchesShortcut(event, this.options.shortcut) && !isEditableTarget(event.target)) {
      event.preventDefault();
      this.options.onCancel();
    }
  };

  private resolveTarget(target: EventTarget | null): HTMLElement | null {
    if (!(target instanceof HTMLElement)) {
      return null;
    }
    if (this.options.shouldIgnoreElement(target)) {
      return null;
    }
    return target;
  }
}
