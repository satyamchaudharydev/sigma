import { mountEditor } from './mount';
import type { EditorInstance, StartEditorOptions } from './types';
import { isBrowserEnvironment, isDevelopmentEnvironment, resolveOptions } from './core/utils';

export type { EditorInstance, SelectedElementContext, StartEditorOptions, StyleChange, StyleControlValue } from './types';

let activeInstance: EditorInstance | null = null;

function createNoopInstance(): EditorInstance {
  return {
    destroy() {},
    openPicker() {},
    closePicker() {},
    getSelection() {
      return null;
    }
  };
}

export function startEditor(options: StartEditorOptions = {}): EditorInstance {
  if (!isBrowserEnvironment() || !isDevelopmentEnvironment()) {
    return createNoopInstance();
  }

  if (activeInstance) {
    return activeInstance;
  }

  activeInstance = mountEditor(resolveOptions(options));
  const originalDestroy = activeInstance.destroy.bind(activeInstance);
  activeInstance.destroy = () => {
    originalDestroy();
    activeInstance = null;
  };
  return activeInstance;
}
