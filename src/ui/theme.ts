export const editorStyles = /* css */ `
  :host {
    color-scheme: dark;
    font-family: Inter, system-ui, sans-serif;
    --rve-color-bg: rgba(13, 13, 13, 0.96);
    --rve-color-bg-soft: rgba(21, 21, 21, 0.94);
    --rve-color-surface: #1f1f1f;
    --rve-color-surface-strong: #2b2b2b;
    --rve-color-surface-hover: #343434;
    --rve-color-border: rgba(255, 255, 255, 0.08);
    --rve-color-border-strong: rgba(255, 255, 255, 0.14);
    --rve-color-text: rgba(255, 255, 255, 0.94);
    --rve-color-text-muted: rgba(255, 255, 255, 0.5);
    --rve-color-text-soft: rgba(255, 255, 255, 0.68);
    --rve-color-accent: #ffffff;
    --rve-color-accent-soft: rgba(255, 255, 255, 0.08);
    --rve-color-blue: #2296ff;
    --rve-color-blue-soft: rgba(34, 150, 255, 0.18);
    --rve-space-1: 4px;
    --rve-space-2: 8px;
    --rve-space-3: 12px;
    --rve-space-4: 16px;
    --rve-space-5: 20px;
    --rve-space-6: 24px;
    --rve-radius-xs: 8px;
    --rve-radius-sm: 12px;
    --rve-radius-md: 16px;
    --rve-radius-lg: 20px;
    --rve-shadow-panel: 0 24px 64px rgba(0, 0, 0, 0.38);
    --rve-shadow-toolbar: 0 14px 32px rgba(0, 0, 0, 0.3);
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  .rve-root {
    position: fixed;
    inset: 0;
    z-index: 2147483646;
    color: var(--rve-color-text);
    pointer-events: none;
  }

  .rve-toolbar,
  .rve-panel,
  .rve-overlay,
  .rve-toast,
  .rve-popover,
  .rve-comment-anchor,
  .rve-comment-composer {
    pointer-events: auto;
  }

  .rve-toolbar {
    position: fixed;
    width: max-content;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px;
    border-radius: 18px;
    background: rgba(13, 13, 13, 0.76);
    border: 1px solid var(--rve-color-border);
    box-shadow: var(--rve-shadow-toolbar);
    backdrop-filter: blur(14px);
    user-select: none;
    touch-action: none;
    cursor: grab;
  }

  .rve-toolbar:active {
    cursor: grabbing;
  }

  .rve-toolbar-drag {
    width: 10px;
    height: 24px;
    border-radius: 999px;
    background:
      radial-gradient(circle, rgba(255, 255, 255, 0.18) 1px, transparent 1px) center/4px 7px;
    opacity: 0.36;
    flex: 0 0 auto;
  }

  .rve-toolbar-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .rve-toolbar-mode {
    min-width: 88px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 12px;
    border: 1px solid transparent;
    border-radius: 12px;
    background: transparent;
    color: var(--rve-color-text-soft);
    font: inherit;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
  }

  .rve-toolbar-mode:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--rve-color-text);
  }

  .rve-toolbar-mode[data-state="original"],
  .rve-toolbar-mode[data-state="diff"] {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--rve-color-border-strong);
    color: var(--rve-color-text);
  }

  .rve-toolbar-mode[data-state="diff"] {
    border-color: rgba(34, 150, 255, 0.34);
    box-shadow: inset 0 0 0 1px rgba(34, 150, 255, 0.14);
  }

  .rve-toolbar-mode-label {
    white-space: nowrap;
  }

  .rve-toolbar-icon {
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: 12px;
    background: transparent;
    color: var(--rve-color-text-soft);
    cursor: pointer;
    transition: background 140ms ease, color 140ms ease, border-color 140ms ease, transform 140ms ease, opacity 140ms ease;
  }

  .rve-toolbar-icon:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--rve-color-text);
    transform: translateY(-1px);
  }

  .rve-toolbar-icon[data-active="true"] {
    background: rgba(255, 255, 255, 0.12);
    border-color: var(--rve-color-border-strong);
    color: var(--rve-color-text);
  }

  .rve-toolbar-icon:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .rve-toolbar-icon-svg {
    width: 16px;
    height: 16px;
  }

  .rve-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(456px, 100vw);
    display: flex;
    flex-direction: column;
    border-radius: 0;
    background: var(--rve-color-bg);
    border-left: 1px solid var(--rve-color-border);
    box-shadow: var(--rve-shadow-panel);
    overflow: hidden;
  }

  .rve-panel[data-dock="left"] {
    left: 0;
    right: auto;
    border-left: 0;
    border-right: 1px solid var(--rve-color-border);
  }

  .rve-panel[data-dock="right"] {
    left: auto;
    right: 0;
  }

  .rve-panel[data-dock="top"] {
    left: 0;
    right: 0;
    bottom: auto;
    width: 100vw;
    border-left: 0;
    border-bottom: 1px solid var(--rve-color-border);
  }

  .rve-panel[data-dock="bottom"] {
    left: 0;
    right: 0;
    top: auto;
    width: 100vw;
    border-left: 0;
    border-top: 1px solid var(--rve-color-border);
  }

  .rve-panel[data-mode="overlay"] {
    background: rgba(13, 13, 13, 0.96);
    backdrop-filter: blur(12px);
  }

  .rve-panel[data-mode="split"] {
    background: rgba(13, 13, 13, 0.985);
  }

  .rve-panel-resize-handle {
    position: absolute;
    z-index: 4;
    background: transparent;
  }

  .rve-panel[data-dock="right"] .rve-panel-resize-handle {
    top: 0;
    left: 0;
    bottom: 0;
    width: 8px;
    cursor: ew-resize;
  }

  .rve-panel[data-dock="left"] .rve-panel-resize-handle {
    top: 0;
    right: 0;
    bottom: 0;
    width: 8px;
    cursor: ew-resize;
  }

  .rve-panel[data-dock="top"] .rve-panel-resize-handle {
    left: 0;
    right: 0;
    bottom: 0;
    height: 8px;
    cursor: ns-resize;
  }

  .rve-panel[data-dock="bottom"] .rve-panel-resize-handle {
    left: 0;
    right: 0;
    top: 0;
    height: 8px;
    cursor: ns-resize;
  }

  .rve-help-text {
    font-size: 12px;
    color: var(--rve-color-text-muted);
  }

  .rve-panel-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px;
    border-bottom: 1px solid var(--rve-color-border);
  }

  .rve-tabs {
    display: inline-flex;
    gap: var(--rve-space-2);
    min-width: 0;
  }

  .rve-tab,
  .rve-chip,
  .rve-inline-button,
  .rve-button,
  .rve-icon-button {
    border: 1px solid transparent;
    background: transparent;
    color: var(--rve-color-text-muted);
    font: inherit;
    cursor: pointer;
  }

  .rve-tab {
    min-width: 74px;
    height: 34px;
    padding: 0 14px;
    border-radius: 999px;
    background: var(--rve-color-surface);
    font-size: 12px;
    font-weight: 600;
  }

  .rve-tab[data-active="true"],
  .rve-chip[data-active="true"] {
    background: var(--rve-color-surface-strong);
    border-color: var(--rve-color-border-strong);
    color: var(--rve-color-text);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  }

  .rve-panel-body {
    flex: 1;
    overflow: auto;
    padding: 0 8px 16px 8px;
  }

  .rve-panel-menu-wrap {
    position: relative;
    flex: 0 0 auto;
  }

  .rve-panel-menu-button {
    width: 34px;
    height: 34px;
    border: 0;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    color: var(--rve-color-text-soft);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
  }

  .rve-panel-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    z-index: 5;
    width: 224px;
    padding: 6px;
    border-radius: 12px;
    background: rgba(18, 18, 18, 0.98);
    border: 1px solid var(--rve-color-border);
    box-shadow: var(--rve-shadow-toolbar);
  }

  .rve-panel-menu-group + .rve-panel-menu-group,
  .rve-panel-menu-group + .rve-panel-menu-item {
    margin-top: 10px;
  }

  .rve-panel-menu-label {
    margin-bottom: 8px;
    color: var(--rve-color-text-muted);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .rve-panel-menu-segmented {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }

  .rve-panel-menu-segment {
    height: 32px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    color: var(--rve-color-text-soft);
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .rve-panel-menu-segment[data-active="true"] {
    background: rgba(255, 255, 255, 0.12);
    border-color: var(--rve-color-border-strong);
    color: var(--rve-color-text);
  }

  .rve-panel-menu-item {
    width: 100%;
    min-height: 34px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 0 10px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--rve-color-text);
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }

  .rve-panel-menu-item:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .rve-panel-menu-item[data-disabled="true"] {
    opacity: 0.48;
    cursor: not-allowed;
  }

  .rve-panel-menu-check {
    min-width: 12px;
    text-align: right;
    color: var(--rve-color-blue);
  }

  .rve-section {
    padding: 18px 8px;
    border-bottom: 1px solid var(--rve-color-border);
  }

  .rve-section-compact {
    padding-bottom: 8px;
  }

  .rve-section h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 650;
    color: var(--rve-color-text);
  }

  .rve-section-title-row,
  .rve-spacing-header,
  .rve-field-row,
  .rve-tab-strip,
  .rve-shadow-grid,
  .rve-border-grid,
  .rve-change-values {
    display: flex;
    gap: var(--rve-space-2);
    align-items: center;
  }

  .rve-section-title-row,
  .rve-spacing-header {
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .rve-inline-button,
  .rve-icon-button {
    padding: 6px 10px;
    border-radius: var(--rve-radius-xs);
    background: rgba(255, 255, 255, 0.04);
    color: var(--rve-color-text-soft);
    font-size: 12px;
    font-weight: 600;
  }

  .rve-inline-button:hover,
  .rve-icon-button:hover,
  .rve-chip:hover,
  .rve-tab:hover {
    background: var(--rve-color-surface-hover);
    color: var(--rve-color-text);
  }

  .rve-grid {
    display: grid;
    gap: 10px;
  }

  .rve-field {
    display: grid;
    grid-template-columns: 94px minmax(0, 1fr);
    gap: 12px;
    align-items: center;
  }

  .rve-field > .rve-help-text {
    grid-column: 2;
    margin-top: -4px;
  }

  .rve-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--rve-color-text-soft);
  }

  .rve-input,
  .rve-select,
  .rve-textarea,
  .rve-color-trigger {
    width: 100%;
    min-height: 40px;
    padding: 0 14px;
    border: 1px solid transparent;
    border-radius: var(--rve-radius-sm);
    background: var(--rve-color-surface);
    color: var(--rve-color-text);
    font: inherit;
    outline: none;
    transition: border-color 120ms ease, background 120ms ease;
  }

  .rve-input::placeholder,
  .rve-textarea::placeholder {
    color: var(--rve-color-text-muted);
  }

  .rve-input:focus,
  .rve-select:focus,
  .rve-textarea:focus,
  .rve-color-trigger:focus {
    border-color: var(--rve-color-border-strong);
    background: var(--rve-color-surface-strong);
  }

  .rve-input:disabled,
  .rve-select:disabled {
    opacity: 0.45;
  }

  .rve-input[type="range"] {
    min-height: 4px;
    padding: 0;
    background: transparent;
    accent-color: var(--rve-color-text);
  }

  .rve-field-row > * {
    flex: 1;
  }

  .rve-select-compact {
    width: auto;
    min-width: 74px;
    flex: 0 0 74px;
    padding-right: 28px;
  }

  .rve-four-up,
  .rve-shadow-grid,
  .rve-border-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .rve-chip {
    min-height: 40px;
    padding: 0 12px;
    border-radius: var(--rve-radius-sm);
    background: var(--rve-color-surface);
    font-size: 12px;
    font-weight: 600;
  }

  .rve-color-input {
    width: 44px;
    min-width: 44px;
    height: 40px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: var(--rve-radius-sm);
    background: var(--rve-color-surface);
    cursor: pointer;
    overflow: hidden;
    appearance: none;
  }

  .rve-color-input::-webkit-color-swatch-wrapper {
    padding: 6px;
  }

  .rve-color-input::-webkit-color-swatch {
    border: 0;
    border-radius: 8px;
  }

  .rve-code {
    margin: 8px 0 0;
    padding: 14px;
    border-radius: var(--rve-radius-sm);
    background: #171717;
    color: rgba(255, 255, 255, 0.88);
    font-size: 12px;
    line-height: 1.6;
    overflow: auto;
  }

  .rve-token-tag { color: #82bfff; }
  .rve-token-attr { color: #f1c877; }
  .rve-token-string { color: #95d891; }

  .rve-preview-banner {
    margin: 10px 8px 0;
    padding: 10px 12px;
    border-radius: var(--rve-radius-sm);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--rve-color-border);
    color: var(--rve-color-text-soft);
    font-size: 12px;
    line-height: 1.45;
  }

  .rve-css-section {
    border-bottom: 0;
  }

  .rve-inspector {
    display: grid;
    gap: 14px;
    padding: 10px 8px 16px;
  }

  .rve-inspector-section {
    padding-bottom: 14px;
    border-bottom: 1px solid var(--rve-color-border);
  }

  .rve-inspector-section-header,
  .rve-collapse-toggle,
  .rve-box-model-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .rve-inspector-section-header h3 {
    margin: 0;
    font-size: 12px;
    font-weight: 600;
    color: var(--rve-color-text);
  }

  .rve-section-action,
  .rve-collapse-toggle,
  .rve-box-model-toggle {
    border: 0;
    background: transparent;
    color: var(--rve-color-text-muted);
    font: inherit;
  }

  .rve-collapse-toggle {
    width: 100%;
    padding: 0;
    cursor: pointer;
  }

  .rve-collapse-toggle span:first-child {
    font-size: 12px;
    font-weight: 600;
    color: var(--rve-color-text);
  }

  .rve-inspector-section-body {
    display: grid;
    gap: 10px;
    margin-top: 12px;
  }

  .rve-inspector-row {
    display: grid;
    grid-template-columns: 112px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
  }

  .rve-inspector-label,
  .rve-inspector-sub-label,
  .rve-box-model-label {
    font-size: 12px;
    color: var(--rve-color-text-soft);
  }

  .rve-inspector-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .rve-inspector-leading {
    width: 18px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    color: var(--rve-color-text-soft);
    font-size: 13px;
    line-height: 1;
  }

  .rve-inspector-sub-label {
    margin-bottom: 6px;
  }

  .rve-inspector-control,
  .rve-dual-control,
  .rve-inspector-dual,
  .rve-color-control,
  .rve-add-control-wrap {
    display: flex;
    gap: 10px;
    min-width: 0;
  }

  .rve-dual-control > *,
  .rve-inspector-dual-item,
  .rve-color-control > :last-child {
    flex: 1;
    min-width: 0;
  }

  .rve-inspector-input,
  .rve-inspector-select {
    width: 100%;
    min-height: 32px;
    padding: 0 12px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    color: var(--rve-color-text);
    font: inherit;
    font-size: 12px;
    outline: none;
  }

  .rve-inspector-input:focus,
  .rve-inspector-select:focus {
    border-color: var(--rve-color-border-strong);
    background: rgba(255, 255, 255, 0.08);
  }

  .rve-range {
    width: 100%;
    accent-color: var(--rve-color-blue);
    background: transparent;
  }

  .rve-inspector-input:disabled,
  .rve-inspector-select:disabled,
  .rve-segmented-button:disabled,
  .rve-stepper-button:disabled,
  .rve-box-model-toggle:disabled {
    opacity: 0.48;
    cursor: not-allowed;
  }

  .rve-segmented {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2px;
    padding: 2px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
  }

  .rve-segmented-button {
    min-height: 28px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--rve-color-text-soft);
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }

  .rve-segmented-button[data-active="true"] {
    background: rgba(255, 255, 255, 0.12);
    color: var(--rve-color-text);
  }

  .rve-icon-ghost {
    width: 32px;
    min-width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    color: var(--rve-color-text-soft);
    font-size: 12px;
  }

  .rve-inline-with-icon,
  .rve-inline-unit {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .rve-inline-unit-label {
    min-width: 24px;
    font-size: 12px;
    color: var(--rve-color-text-muted);
  }

  .rve-add-control-wrap {
    position: relative;
    width: 100%;
  }

  .rve-add-control {
    width: 100%;
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 0 12px;
    border: 0;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.07);
    color: var(--rve-color-text-soft);
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }

  .rve-add-control .rve-icon-ghost {
    width: 28px;
    min-width: 28px;
    height: 28px;
  }

  .rve-add-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 6;
    width: 180px;
    padding: 8px;
    border-radius: 18px;
    background: rgba(38, 38, 38, 0.98);
    border: 1px solid var(--rve-color-border);
    box-shadow: var(--rve-shadow-toolbar);
  }

  .rve-add-menu-item {
    width: 100%;
    min-height: 44px;
    display: flex;
    align-items: center;
    padding: 0 14px;
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: var(--rve-color-text);
    font: inherit;
    font-size: 13px;
    text-align: left;
    cursor: pointer;
  }

  .rve-add-menu-item:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .rve-add-menu-item:disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }

  .rve-transform-axis-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0;
    margin: -2px 0 14px 122px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--rve-color-border);
    background: rgba(255, 255, 255, 0.04);
  }

  .rve-transform-axis-cell {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 0 10px;
    border-right: 1px solid var(--rve-color-border);
  }

  .rve-transform-axis-cell:last-child {
    border-right: 0;
  }

  .rve-transform-axis-cell .rve-inspector-input {
    min-height: 44px;
    border: 0;
    border-radius: 0;
    background: transparent;
    text-align: center;
  }

  .rve-transform-axis-label {
    color: var(--rve-color-text-muted);
    font-size: 12px;
    text-align: center;
    letter-spacing: 0.08em;
  }

  .rve-stepper {
    display: grid;
    grid-template-columns: 32px 1fr 32px;
    gap: 1px;
    border-radius: 10px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.05);
  }

  .rve-stepper-button,
  .rve-stepper-value {
    min-height: 32px;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, 0.02);
    color: var(--rve-color-text);
    font-size: 12px;
  }

  .rve-stepper-button {
    border: 0;
    cursor: pointer;
  }

  .rve-grid-preview {
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: 3px;
    padding: 8px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.04);
  }

  .rve-grid-preview[data-disabled="true"] {
    opacity: 0.48;
  }

  .rve-grid-preview-cell {
    height: 18px;
    border-radius: 4px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .rve-grid-preview-cell[data-active="true"] {
    background: rgba(34, 150, 255, 0.12);
    border-color: rgba(34, 150, 255, 0.6);
  }

  .rve-grid-overview {
    display: grid;
    gap: 16px;
  }

  .rve-grid-summary {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
    gap: 12px;
  }

  .rve-grid-summary-block,
  .rve-grid-dimensions {
    display: grid;
    position: relative;
    gap: 8px;
  }

  .rve-grid-mini-label {
    color: var(--rve-color-text-soft);
    font-size: 12px;
    font-weight: 600;
  }

  .rve-grid-summary-card {
    min-height: 92px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.56);
    border: 0;
    font: inherit;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
  }

  .rve-grid-gap-stack {
    display: grid;
    gap: 8px;
  }

  .rve-grid-metric-card {
    min-height: 44px;
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.06);
  }

  .rve-grid-metric-icon {
    color: var(--rve-color-text-soft);
    font-size: 18px;
    letter-spacing: -0.08em;
    text-align: center;
  }

  .rve-grid-metric-input {
    width: 100%;
    border: 0;
    background: transparent;
    color: var(--rve-color-text);
    font: inherit;
    font-size: 16px;
    outline: none;
  }

  .rve-grid-dimension-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    gap: 12px;
    align-items: center;
  }

  .rve-grid-dimensions-popover {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 0;
    min-width: 320px;
    z-index: 6;
    display: grid;
    gap: 12px;
    padding: 12px;
    border-radius: 16px;
    background: rgba(18, 18, 18, 0.98);
    border: 1px solid var(--rve-color-border);
    box-shadow: var(--rve-shadow-toolbar);
  }

  .rve-grid-times {
    color: var(--rve-color-text-muted);
    font-size: 28px;
    line-height: 1;
  }

  .rve-grid-dimensions-popover .rve-grid-preview {
    padding: 0;
    gap: 4px;
    background: transparent;
    position: relative;
  }

  .rve-grid-dimensions-popover .rve-grid-preview-cell {
    height: 26px;
    border-radius: 6px;
    transition: background 120ms ease, border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease;
    cursor: pointer;
  }

  .rve-grid-dimensions-popover .rve-grid-preview-cell:hover {
    transform: translateY(-1px);
  }

  .rve-grid-dimensions-popover .rve-grid-preview-cell[data-committed="true"] {
    background: rgba(34, 150, 255, 0.08);
    border-color: rgba(34, 150, 255, 0.3);
  }

  .rve-grid-dimensions-popover .rve-grid-preview-cell[data-active="true"] {
    background: rgba(34, 150, 255, 0.16);
    border-color: rgba(34, 150, 255, 0.88);
    box-shadow: 0 0 0 1px rgba(34, 150, 255, 0.2), 0 0 16px rgba(34, 150, 255, 0.18);
  }

  .rve-grid-preview-label {
    position: absolute;
    top: -34px;
    left: 0;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(10, 10, 10, 0.92);
    border: 1px solid rgba(34, 150, 255, 0.34);
    color: rgba(255, 255, 255, 0.92);
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    pointer-events: none;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
    transform: translateX(-12%);
    white-space: nowrap;
  }

  .rve-box-model {
    display: grid;
    gap: 10px;
  }

  .rve-box-model-hint {
    font-size: 11px;
    color: var(--rve-color-text-muted);
  }

  .rve-box-model-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .rve-box-model-cell {
    display: grid;
    gap: 6px;
  }

  .rve-css-toolbar {
    display: grid;
    gap: 10px;
    margin-bottom: 14px;
  }

  .rve-css-search {
    min-height: 36px;
  }

  .rve-css-list {
    display: grid;
    gap: 6px;
  }

  .rve-css-row {
    display: grid;
    grid-template-columns: minmax(116px, 0.9fr) minmax(0, 1.4fr);
    gap: 14px;
    align-items: start;
    padding: 10px 12px;
    border-radius: var(--rve-radius-sm);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid transparent;
  }

  .rve-css-row[data-changed="true"] {
    background: rgba(34, 150, 255, 0.1);
    border-color: rgba(34, 150, 255, 0.18);
  }

  .rve-css-property {
    font-size: 12px;
    font-weight: 600;
    line-height: 1.45;
    color: var(--rve-color-text-soft);
    word-break: break-word;
  }

  .rve-css-value-wrap {
    min-width: 0;
  }

  .rve-css-editor {
    min-width: 0;
  }

  .rve-css-editor-color {
    display: grid;
    grid-template-columns: 22px minmax(0, 1fr);
    gap: 8px;
    align-items: center;
  }

  .rve-css-inline-input {
    width: 100%;
    min-height: 30px;
    padding: 5px 8px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: var(--rve-color-text);
    font-size: 12px;
    line-height: 1.45;
    outline: none;
  }

  .rve-css-inline-input:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .rve-css-inline-input:focus {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .rve-css-color-input {
    width: 22px;
    height: 14px;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 3px;
    background: transparent;
    overflow: hidden;
    cursor: pointer;
    appearance: none;
  }

  .rve-css-color-input::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .rve-css-color-input::-webkit-color-swatch {
    border: 0;
    border-radius: 2px;
  }

  .rve-css-value {
    font-size: 12px;
    line-height: 1.45;
    color: var(--rve-color-text);
    word-break: break-word;
  }

  .rve-css-source {
    margin-top: 4px;
    font-size: 11px;
    line-height: 1.35;
    color: var(--rve-color-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rve-change-list {
    display: grid;
    gap: 8px;
  }

  .rve-change-item {
    padding: 10px 12px;
    border-radius: var(--rve-radius-sm);
    background: var(--rve-color-surface);
  }

  .rve-change-property {
    margin-bottom: 4px;
    font-size: 12px;
    font-weight: 600;
    color: var(--rve-color-text-soft);
  }

  .rve-change-values {
    font-size: 12px;
    color: var(--rve-color-text-muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  .rve-change-old {
    opacity: 0.75;
    text-decoration: line-through;
  }

  .rve-change-new {
    color: var(--rve-color-text);
  }

  .rve-overlay {
    position: fixed;
    border-radius: var(--rve-radius-sm);
    border: 1px solid var(--rve-color-blue);
    background: var(--rve-color-blue-soft);
    pointer-events: none;
  }

  .rve-overlay[data-selected="true"] {
    border-color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
  }

  .rve-overlay[data-emphasis="diff"] {
    border-color: #2296ff;
    background: rgba(34, 150, 255, 0.14);
    box-shadow: 0 0 0 1px rgba(34, 150, 255, 0.18);
  }

  .rve-overlay-card {
    position: absolute;
    left: 0;
    width: min(268px, calc(100vw - 24px));
    padding: 12px 14px 14px;
    border-radius: 22px;
    background: rgba(13, 13, 13, 0.76);
    border: 1px solid var(--rve-color-border);
    box-shadow: var(--rve-shadow-toolbar);
    backdrop-filter: blur(14px);
    color: var(--rve-color-text);
  }

  .rve-overlay-card[data-placement="above"] {
    bottom: calc(100% + 10px);
  }

  .rve-overlay-card[data-placement="below"] {
    top: calc(100% + 10px);
  }

  .rve-overlay-header,
  .rve-overlay-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
  }

  .rve-overlay-header {
    margin-bottom: 6px;
  }

  .rve-overlay-title-block {
    min-width: 0;
  }

  .rve-overlay-title {
    font-size: 12px;
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.01em;
  }

  .rve-overlay-dimension {
    flex: 0 0 auto;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.15;
    color: var(--rve-color-text);
  }

  .rve-overlay-subtitle {
    margin-top: 4px;
    font-size: 11px;
    line-height: 1.2;
    color: var(--rve-color-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rve-overlay-row + .rve-overlay-row {
    margin-top: 4px;
  }

  .rve-overlay-row-label {
    flex: 0 0 auto;
    font-size: 11px;
    line-height: 1.25;
    color: var(--rve-color-text-muted);
  }

  .rve-overlay-row-value {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.25;
    color: var(--rve-color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rve-overlay-color-chip {
    width: 21px;
    height: 12px;
    flex: 0 0 auto;
    border-radius: 3px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  }

  .rve-overlay[data-selected="true"] .rve-overlay-card {
    background: rgba(13, 13, 13, 0.84);
  }

  .rve-comment-anchor {
    position: fixed;
    z-index: 8;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .rve-comment-line {
    position: absolute;
    width: 136px;
    height: 1px;
    background: rgba(255, 255, 255, 0.18);
    transform: translateX(56px);
    transform-origin: left center;
  }

  .rve-comment-marker {
    position: relative;
    width: 44px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 999px;
    background: linear-gradient(180deg, #2ea1ff 0%, #0e84f2 100%);
    color: white;
    box-shadow: 0 10px 24px rgba(18, 122, 229, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.28);
    cursor: pointer;
  }

  .rve-comment-marker-label,
  .rve-comment-marker-icon {
    position: absolute;
    inset: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: opacity 140ms ease, transform 140ms ease;
  }

  .rve-comment-marker-label[data-hidden="true"] {
    opacity: 0;
    transform: scale(0.88);
  }

  .rve-comment-marker-icon {
    opacity: 0;
    transform: scale(0.88);
  }

  .rve-comment-marker-icon[data-visible="true"] {
    opacity: 1;
    transform: scale(1);
  }

  .rve-comment-tooltip {
    position: absolute;
    top: calc(100% + 12px);
    left: 50%;
    min-width: 196px;
    max-width: 260px;
    padding: 14px 16px;
    border-radius: 22px;
    background: rgba(19, 19, 19, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 22px 48px rgba(0, 0, 0, 0.38);
    transform: translateX(-50%);
  }

  .rve-comment-tooltip-target {
    margin-bottom: 10px;
    color: rgba(255, 255, 255, 0.56);
    font-size: 14px;
    font-style: italic;
    letter-spacing: 0.01em;
  }

  .rve-comment-tooltip-text {
    color: rgba(255, 255, 255, 0.96);
    font-size: 16px;
    line-height: 1.35;
    white-space: pre-wrap;
  }

  .rve-comment-tooltip-image {
    display: block;
    width: 100%;
    margin-top: 12px;
    border-radius: 14px;
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .rve-comment-composer {
    position: fixed;
    z-index: 12;
    padding: 14px;
    border-radius: 24px;
    background: rgba(20, 20, 20, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 26px 64px rgba(0, 0, 0, 0.42);
  }

  .rve-comment-input {
    width: 100%;
    min-height: 116px;
    padding: 16px 18px;
    border: 1px solid rgba(34, 150, 255, 0.9);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.96);
    font: inherit;
    font-size: 16px;
    line-height: 1.45;
    resize: vertical;
    outline: none;
  }

  .rve-comment-input::placeholder {
    color: rgba(255, 255, 255, 0.34);
  }

  .rve-comment-composer-footer {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-top: 12px;
  }

  .rve-comment-attachment-area {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
    flex: 1;
  }

  .rve-comment-file-input {
    display: none;
  }

  .rve-comment-attach-button {
    height: 34px;
    width: max-content;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    border: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.78);
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .rve-comment-attachment-preview {
    display: grid;
    grid-template-columns: 44px 1fr auto;
    align-items: center;
    gap: 10px;
    min-width: 0;
    padding: 8px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.05);
  }

  .rve-comment-attachment-image {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    object-fit: cover;
  }

  .rve-comment-attachment-meta {
    min-width: 0;
  }

  .rve-comment-attachment-name {
    overflow: hidden;
    color: rgba(255, 255, 255, 0.74);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rve-comment-attachment-remove {
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.68);
    cursor: pointer;
  }

  .rve-comment-actions {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    flex: 0 0 auto;
  }

  .rve-comment-action {
    min-width: 88px;
    height: 40px;
    padding: 0 18px;
    border: 0;
    border-radius: 999px;
    font: inherit;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
  }

  .rve-comment-action-ghost {
    background: transparent;
    color: rgba(255, 255, 255, 0.62);
  }

  .rve-comment-action-primary {
    background: #0e84f2;
    color: rgba(255, 255, 255, 0.96);
  }

  .rve-toast {
    position: fixed;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(13, 13, 13, 0.88);
    border: 1px solid var(--rve-color-border);
    color: var(--rve-color-text);
    font-size: 12px;
  }

  @media (max-width: 900px) {
    .rve-panel {
      width: min(420px, 100vw);
      bottom: 0;
    }
  }

  @media (max-width: 640px) {
    .rve-toolbar {
      padding: 6px;
    }

    .rve-toolbar-icon {
      width: 34px;
      height: 34px;
    }

    .rve-panel {
      left: 0;
      right: 0;
      top: auto;
      bottom: 0;
      width: 100vw;
      max-height: 72vh;
      border-left: 0;
      border-top: 1px solid var(--rve-color-border);
    }

    .rve-field {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .rve-css-row {
      grid-template-columns: 1fr;
      gap: 6px;
    }

    .rve-field > .rve-help-text {
      grid-column: 1;
    }

    .rve-four-up,
    .rve-shadow-grid,
    .rve-border-grid {
      grid-template-columns: 1fr;
    }
  }
`;
