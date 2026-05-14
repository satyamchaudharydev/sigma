import type { CommentAttachment, CommentDraftSnapshot, CommentSnapshot, CommentTarget, PromptComment, RectBounds } from '../types';

export interface CommentRecord {
  id: string;
  element: HTMLElement;
  selector: string;
  target: CommentTarget;
  text: string;
  attachment: CommentAttachment | null;
  createdAt: number;
  updatedAt: number;
}

export interface CommentDraftState {
  mode: 'create' | 'edit';
  commentId: string | null;
  element: HTMLElement;
  selector: string;
  target: CommentTarget;
  text: string;
  attachment: CommentAttachment | null;
}

export class CommentManager {
  private comments: CommentRecord[] = [];
  draft: CommentDraftState | null = null;

  get count(): number {
    return this.comments.length;
  }

  openDraft(element: HTMLElement, selector: string, target: CommentTarget): void {
    const existing = this.findByElement(element, selector);
    this.draft = {
      mode: existing ? 'edit' : 'create',
      commentId: existing?.id ?? null,
      element,
      selector,
      target,
      text: existing?.text ?? '',
      attachment: existing?.attachment ?? null
    };
  }

  openEditDraft(commentId: string): boolean {
    const comment = this.comments.find((c) => c.id === commentId);
    if (!comment) return false;
    this.draft = {
      mode: 'edit',
      commentId: comment.id,
      element: comment.element,
      selector: comment.selector,
      target: comment.target,
      text: comment.text,
      attachment: comment.attachment
    };
    return true;
  }

  updateDraftText(text: string): void {
    if (!this.draft) return;
    this.draft = { ...this.draft, text };
  }

  updateDraftAttachment(attachment: CommentAttachment | null): void {
    if (!this.draft) return;
    this.draft = { ...this.draft, attachment };
  }

  saveDraft(): 'saved' | 'updated' | 'empty' {
    if (!this.draft) return 'empty';
    const text = this.draft.text.trim();
    if (!text && !this.draft.attachment) return 'empty';

    const existing = this.comments.find(
      (c) => c.element === this.draft?.element || c.id === this.draft?.commentId
    );
    const timestamp = Date.now();

    if (existing) {
      existing.target = this.draft.target;
      existing.text = text;
      existing.attachment = this.draft.attachment;
      existing.updatedAt = timestamp;
      this.draft = null;
      return 'updated';
    }

    this.comments.push({
      id: `comment-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
      element: this.draft.element,
      selector: this.draft.selector,
      target: this.draft.target,
      text,
      attachment: this.draft.attachment,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    this.draft = null;
    return 'saved';
  }

  closeDraft(): void {
    this.draft = null;
  }

  getCommentsSnapshot(): CommentSnapshot[] {
    return this.comments.map((comment, index) => ({
      id: comment.id,
      number: index + 1,
      text: comment.text,
      attachment: comment.attachment,
      target: comment.target,
      rect: this.resolveElementRect(comment.element, comment.selector)
    }));
  }

  getDraftSnapshot(): CommentDraftSnapshot | null {
    if (!this.draft) return null;
    return {
      mode: this.draft.mode,
      commentId: this.draft.commentId,
      targetLabel: this.draft.target.label,
      rect: this.resolveElementRect(this.draft.element, this.draft.selector),
      text: this.draft.text,
      attachment: this.draft.attachment
    };
  }

  getPromptComments(): PromptComment[] {
    return this.comments.map((comment, index) => ({
      id: comment.id,
      number: index + 1,
      text: comment.text,
      attachment: comment.attachment,
      target: comment.target
    }));
  }

  private findByElement(element: HTMLElement, selector: string): CommentRecord | undefined {
    return this.comments.find((c) => c.element === element || (selector && c.selector === selector));
  }

  private resolveElementRect(element: HTMLElement, selector: string): RectBounds {
    const el = element.isConnected
      ? element
      : selector ? (document.querySelector(selector) as HTMLElement | null) : null;
    const rect = el?.getBoundingClientRect() ?? new DOMRect();
    return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
  }
}
