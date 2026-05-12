# react-visual-editor

A dev-only visual editor for React apps that lets you inspect an element, tweak styles live in the browser, and export a structured prompt for a coding agent.

## Install

```bash
npm install react-visual-editor
```

## Usage

```ts
import { startEditor } from 'react-visual-editor';

if (import.meta.env.DEV) {
  startEditor();
}
```

## Features in v0.1

- Dev-only toolbar mounted outside your app
- Element picker with hover overlay
- Shadow DOM-isolated editor UI built with Preact
- Live inline-style preview for size, spacing, layout, typography, and visual controls
- Prompt export with style diffs and best-effort React source metadata

## Notes

- Targets React 18+ development environments.
- When source metadata is unavailable, prompt export falls back to DOM selector context.
- v0.1 does not write back to source files directly.
