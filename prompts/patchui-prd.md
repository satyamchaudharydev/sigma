# PRD: AI-Native Visual UI Editor for React Apps

## 1. Product Summary

### Product Name

Working name: **PatchUI**
Alternative names: **LiveCanvas**, **ReactCanvas**, **PromptPatch**, **UI Patch Studio**, **Figma for AI UI**

### One-Line Description

A visual editing layer for AI-generated React UIs that lets users inspect, tweak, and export exact code-ready changes without repeatedly prompting the model.

### Product Thesis

AI can generate a useful first draft of UI, but it rarely produces pixel-perfect results. Current iteration loops are inefficient: users either keep prompting the AI with vague visual feedback or manually edit styles in DevTools and then translate those changes back into code.

This product changes the workflow:

> AI generates the first UI → user visually edits the live React app → system records exact changes → user exports a clean AI prompt, JSON patch, Tailwind diff, or code patch.

The product is not just a design editor. It is an **AI-aware UI correction layer**.

---

## 2. Problem Statement

### Current Workflow

Users building UI with AI typically follow this process:

1. Ask AI to generate a UI.
2. Receive a mostly-correct layout.
3. Notice visual imperfections: spacing, colors, typography, shadows, alignment, hierarchy, responsiveness.
4. Ask AI to fix the issue.
5. AI often changes too much, misunderstands the request, or creates new issues.
6. User spends more tokens and time iterating.
7. Eventually the user edits in DevTools or code manually.
8. Those manual edits are not automatically captured as reusable code changes.

### Pain Points

* AI-generated UI needs many small visual corrections.
* Prompting is inefficient for pixel-level edits.
* DevTools edits are temporary and hard to convert back to source code.
* AI cannot reliably infer visual intent from vague text.
* Tailwind class changes require manual translation.
* Users need a bridge between live visual edits and source-code-ready changes.

### Core Problem

There is no lightweight visual editing layer that allows developers to polish AI-generated React UIs and export the exact changes back into code or AI context.

---

## 3. Target Users

### Primary Users

#### 1. Developers using AI to generate UI

These users use ChatGPT, Claude, Cursor, v0, Bolt, Lovable, or other AI tools to generate React/Tailwind interfaces.

They need:

* Faster visual iteration.
* Less repeated prompting.
* Exact code-ready output.
* Tailwind-aware changes.

#### 2. Indie hackers and product builders

They build dashboards, landing pages, portfolio sites, SaaS apps, and prototypes.

They need:

* Quick UI polish.
* No heavy design-tool workflow.
* Direct editing inside the actual app.

#### 3. Frontend engineers

They care about code quality and do not want visual edits to destroy layout semantics.

They need:

* Source-aware changes.
* Component-aware editing.
* Tailwind/CSS diff output.
* Minimal messy inline styles.

### Secondary Users

#### 4. Designers who can inspect live UI

Designers may not write code but can select elements and suggest visual changes.

They need:

* Figma-like selection.
* Measurement guides.
* Color inspection.
* Copyable change summary for developers.

#### 5. AI coding tool builders

This library could be embedded inside AI app builders.

They need:

* SDK/API.
* Structured edit events.
* Patch export.
* Source/component mapping.

---

## 4. Product Goals

### Primary Goals

1. Allow users to visually select and edit elements in a live React app.
2. Capture every visual edit as structured, replayable change data.
3. Export clean AI-readable and code-ready edit instructions.
4. Reduce token-heavy AI iteration loops.
5. Preserve layout intent as much as possible.

### Secondary Goals

1. Provide Figma-like direct manipulation for live DOM elements.
2. Detect and expose component-level colors, spacing, typography, and layout properties.
3. Support Tailwind-aware diffs and class updates.
4. Help users audit consistency problems in AI-generated UI.
5. Enable scoped AI edits on selected elements/components.

### Non-Goals for MVP

* Full Figma replacement.
* Full drag-and-drop app builder.
* Complete source-code rewriting engine.
* Perfect code patch generation for all frameworks.
* Complex design collaboration features.
* Backend CMS or design system management.

---

## 5. Success Metrics

### Activation Metrics

* User selects an element within first session.
* User makes at least one property edit.
* User copies or exports at least one change.

### Core Product Metrics

* Number of visual edits made per session.
* Number of exported AI prompts / JSON patches / Tailwind diffs.
* Percentage of edits successfully mapped to source/component.
* Average time from first edit to exported patch.
* Reduction in repeated AI prompts per UI task.

### Quality Metrics

* Percentage of edits that produce valid CSS/Tailwind output.
* Percentage of edits that preserve layout semantics.
* User-rated usefulness of generated AI prompt.
* User-rated accuracy of generated code diff.

### Retention Metrics

* Repeat usage across projects.
* Number of projects using the library.
* Number of sessions where users review previous edit history.

---

## 6. Core User Journey

### Journey: AI UI Polish Loop

1. User generates a React/Tailwind UI using AI.
2. User runs the app locally.
3. User enables the visual editor overlay.
4. User hovers over elements and sees outlines.
5. User clicks an element to select it.
6. Property panel opens.
7. User changes spacing, typography, colors, radius, shadow, or position.
8. Live UI updates immediately.
9. Tool records exact before/after changes.
10. User copies a structured prompt or patch.
11. User gives that patch to AI or applies it to code.
12. Final UI becomes closer to the desired design with fewer AI iterations.

---

## 7. Product Modes

### 7.1 Inspect Mode

Safe read-only mode.

User can:

* Hover elements.
* See element boundaries.
* View computed styles.
* View Tailwind classes.
* Measure spacing.
* Inspect colors and typography.
* Copy element context.

No visual changes are made.

### 7.2 Edit Mode

Main visual editing mode.

User can:

* Select elements.
* Edit CSS properties.
* Drag, resize, and rotate elements.
* Change text inline.
* Modify classes/styles.
* Undo and redo edits.
* Export changes.

### 7.3 AI Mode

Scoped AI command mode.

User can:

* Select an element/component.
* Ask AI to modify only the selected scope.
* Preview proposed changes.
* Accept/reject changes.
* Export AI prompt with selected element context.

### 7.4 Diff Mode

Review mode.

User can:

* View all changes made in the session.
* Compare before/after.
* Squash edits.
* Revert individual changes.
* Copy final diff.
* Export AI prompt, JSON patch, Tailwind diff, or CSS diff.

---

## 8. Core Features

# Feature 1: Hover Highlight

## Description

When the user hovers over an editable DOM element, show a lightweight visual outline.

## Requirements

* Highlight hovered element with a thin outline.
* Show floating label near element.
* Label should include:

  * Element type.
  * Component name, if available.
  * Dimensions.
  * Important className preview.
  * Optional source file and line number.

## Example Label

```txt
Card
320 × 180
ProjectCard.tsx
class: rounded-xl p-6 bg-white
```

## Acceptance Criteria

* Hover outline appears without shifting layout.
* Overlay does not block normal page rendering.
* Hover label avoids viewport overflow.
* Nested elements can be hovered accurately.

---

# Feature 2: Element Selection

## Description

Clicking an element selects it and opens editing controls.

## Requirements

* Selected element receives stronger outline.
* Show resize handles.
* Show rotation handle.
* Show floating mini toolbar.
* Show selected element in component tree.
* Show breadcrumb path.

## Breadcrumb Example

```txt
Page > ProjectGrid > ProjectCard > Button
```

## Acceptance Criteria

* User can select deeply nested elements.
* User can select parent from breadcrumb.
* User can deselect with Escape or clicking outside.
* Selection persists while editing properties.

---

# Feature 3: Property Panel

## Description

A side panel displays editable properties for the selected element.

## Sections

1. Layout
2. Spacing
3. Typography
4. Color
5. Border and Radius
6. Shadow and Effects
7. Transform
8. Image Controls
9. SVG Controls
10. Advanced CSS

## Acceptance Criteria

* Property panel updates when selected element changes.
* Controls are relevant to selected element type.
* Text elements show typography controls.
* Images show image controls.
* SVGs show fill/stroke controls.
* Flex/grid containers show layout-specific controls.

---

# Feature 4: Layout Controls

## Properties

```txt
display
position
top
right
bottom
left
z-index
width
height
min-width
max-width
min-height
max-height
aspect-ratio
overflow
box-sizing
```

## Flex Controls

```txt
flex-direction
justify-content
align-items
align-content
align-self
gap
row-gap
column-gap
flex-wrap
flex-grow
flex-shrink
flex-basis
order
```

## Grid Controls

```txt
grid-template-columns
grid-template-rows
grid-column
grid-row
grid-auto-flow
grid-auto-columns
grid-auto-rows
gap
place-items
place-content
```

## Acceptance Criteria

* Flex controls only show when relevant.
* Grid controls only show when relevant.
* Width/height changes are reflected immediately.
* Invalid CSS values are rejected or warned.

---

# Feature 5: Spacing Controls

## Description

User can edit margin and padding visually and numerically.

## Properties

```txt
margin
margin-top
margin-right
margin-bottom
margin-left
padding
padding-top
padding-right
padding-bottom
padding-left
```

## UX Requirements

* Box model visual UI.
* Linked values for all sides.
* Horizontal/vertical lock.
* Individual side editing.
* Pixel and rem support.
* Tailwind scale snapping.

## Acceptance Criteria

* User can edit each side independently.
* User can apply same spacing to all sides.
* User can reset spacing value.
* Changes are captured in edit history.

---

# Feature 6: Typography Controls

## Description

Controls for text elements.

## Properties

```txt
font-family
font-size
font-weight
line-height
letter-spacing
text-align
text-transform
text-decoration
font-style
white-space
word-break
text-wrap
color
```

## Additional Requirements

* Inline text editing.
* Font weight dropdown.
* Font size input with stepper.
* Line-height input.
* Text alignment buttons.
* Text transform buttons.

## Acceptance Criteria

* Text can be edited directly on canvas.
* Typography changes are live.
* Multi-line text remains editable.
* Text changes are tracked separately from style changes.

---

# Feature 7: Color Inspector and Palette

## Description

When a component/element is selected, show all colors used inside it.

## Requirements

* Extract colors from selected element subtree.
* Group by usage:

  * Background
  * Text
  * Border
  * Shadow
  * SVG fill/stroke
  * Gradient stops
* Show color swatches.
* Allow color replacement by scope.

## Scope Options

```txt
This element
Selected subtree
Similar elements
Component
Global token
```

## Example

```txt
Selected Card Colors
Background: #FAF3E3
Text: #111111
Muted text: #6B6257
Border: #D6C8A8
Accent: #FACC15
```

## Acceptance Criteria

* Color panel detects colors accurately from computed styles.
* User can replace a color in selected element.
* User can copy color value.
* User can save color as token if supported.

---

# Feature 8: Border and Radius Controls

## Properties

```txt
border
border-width
border-style
border-color
border-radius
outline
outline-offset
```

## Presets

```txt
Sharp
Slight
Card
Pill
Organic
Editorial hard border
Hand-drawn border
```

## Acceptance Criteria

* User can edit border width, style, and color.
* User can edit radius globally or per-corner.
* Presets apply expected styles.
* Tailwind class output maps common values.

---

# Feature 9: Shadow and Effects Controls

## Properties

```txt
box-shadow
filter
backdrop-filter
opacity
mix-blend-mode
background-blend-mode
```

## Presets

```txt
Soft card
Hard editorial shadow
Paper lift
Pressed
Glow
None
Newspaper shadow
Rough paper
Ink bleed
Cutout sticker
Photocopy
```

## Acceptance Criteria

* Shadow values are editable visually.
* User can select presets.
* User can reset effects.
* Effects are exported as CSS/Tailwind-compatible values where possible.

---

# Feature 10: Transform Controls

## Properties

```txt
transform
translate
rotate
scale
skew
transform-origin
```

## Direct Manipulation

* Drag to move.
* Corner handles to resize.
* Rotation handle to rotate.
* Shift key for constrained movement.
* Alt/Option to duplicate.

## Acceptance Criteria

* Transform controls update selected element live.
* Dragging does not accidentally select text.
* Transform changes are reversible.
* Final transform is recorded in edit history.

---

# Feature 11: Image Controls

## Properties

```txt
object-fit
object-position
aspect-ratio
border-radius
brightness
contrast
grayscale
opacity
clip-path
mask-image
```

## Actions

```txt
Replace image
Crop image
Turn black and white
Add paper/noise texture
Add rough edge mask
Reset image styles
```

## Acceptance Criteria

* Image-specific controls appear only for image elements.
* Object fit and position update live.
* Filter controls work without altering image source.
* Image changes are exported as style/class changes.

---

# Feature 12: SVG Controls

## Properties

```txt
fill
stroke
stroke-width
stroke-dasharray
stroke-linecap
stroke-linejoin
opacity
```

## Acceptance Criteria

* SVG paths can be selected when possible.
* Fill and stroke are editable.
* Changes apply to selected SVG or whole icon depending on scope.

---

# Feature 13: Component Tree Panel

## Description

A tree view showing the structure of the current page/component hierarchy.

## Example

```txt
Page
  HeroSection
    Badge
    Heading
    Paragraph
    CTAGroup
      Button
      Button
  ProjectGrid
    ProjectCard
      Image
      Title
      Description
      Tags
```

## Actions

```txt
Select
Hide
Lock
Rename layer
Duplicate
Delete
Move up/down
Wrap in div
Extract component
```

## Acceptance Criteria

* Selecting an item in tree selects element on canvas.
* Selecting an element on canvas highlights it in tree.
* Locked elements cannot be edited accidentally.
* Hidden elements can be restored.

---

# Feature 14: Scope-Aware Editing

## Description

User can decide where a change should apply.

## Scope Options

```txt
This element only
Similar elements
This component
All instances of this component
Global design token
```

## Use Cases

* Change one button.
* Change all buttons in selected card.
* Change all ProjectCard instances.
* Change global accent color.

## Acceptance Criteria

* Scope selector appears before broad changes.
* Default scope is conservative: this element only.
* Similar-element detection is explainable.
* Component-level scope requires source/component mapping.

---

# Feature 15: Multi-Select Editing

## Description

User can select multiple elements and apply shared operations.

## Actions

```txt
Align left
Align center
Align right
Align top
Align middle
Align bottom
Distribute vertically
Distribute horizontally
Same width
Same height
Group
Ungroup
Apply shared style
```

## Acceptance Criteria

* Shift-click adds/removes from selection.
* Drag selection box can select multiple elements.
* Shared property panel shows common values.
* Mixed values show as mixed state.

---

# Feature 16: Measurement and Guides

## Description

Visual measurement tools for spacing and alignment.

## Requirements

* Show dimensions of selected element.
* Show distance to hovered sibling/parent.
* Show alignment guides while dragging.
* Show snap lines.
* Show spacing inconsistencies.

## Example Warning

```txt
This card uses 22px padding. Nearby cards use 24px.
```

## Acceptance Criteria

* Measurements are accurate.
* Guides do not interfere with interaction.
* Snap behavior can be disabled.
* Measurements work across responsive layouts.

---

# Feature 17: Tailwind-Aware Editing

## Description

The editor should understand Tailwind classes and produce Tailwind-friendly output.

## Requirements

* Parse className.
* Group classes by category.
* Map CSS values to Tailwind classes.
* Warn when values are outside Tailwind scale.
* Generate Tailwind class diffs.

## Example

```diff
- p-4 rounded-md bg-black text-white
+ p-6 rounded-full bg-[#FACC15] text-black
```

## Class Grouping Example

```txt
Layout: flex items-center gap-4
Spacing: p-6
Color: bg-white text-black
Radius: rounded-xl
Shadow: shadow-sm
```

## Acceptance Criteria

* Common Tailwind utilities are detected.
* Changed values map to nearest utility where possible.
* Arbitrary values are supported when needed.
* Conflicting classes are resolved correctly.

---

# Feature 18: Design Token Awareness

## Description

Detect and edit CSS variables / theme tokens.

## Requirements

* Detect CSS variables used in computed styles.
* Show token name and resolved value.
* Allow raw color edit or token edit.
* Allow detach from token.

## Example

```txt
Uses token: --accent
Current value: #facc15
```

## Actions

```txt
Edit token
Edit only this element
Detach from token
Copy token name
```

## Acceptance Criteria

* CSS variable references are detected where possible.
* Token edits update all linked usages in preview.
* User is warned before global token changes.

---

# Feature 19: Change History

## Description

Every edit is recorded in a timeline.

## Example

```txt
1. Selected ProjectCard
2. Changed background #fff → #faf3e3
3. Increased padding 24px → 32px
4. Rotated image -2deg
5. Changed title font size 32px → 40px
```

## Actions

```txt
Undo
Redo
Revert selected change
Copy selected changes to AI
Squash changes
Clear history
```

## Acceptance Criteria

* Every edit has before/after value.
* Undo/redo works reliably.
* Squashing removes intermediate noise.
* History can be exported.

---

# Feature 20: Copy to AI

## Description

Generate a clean AI-readable summary of visual edits.

## Output Types

```txt
Human-readable prompt
JSON patch
Tailwind diff
CSS diff
Component context
Full session summary
```

## Human Prompt Example

```txt
I made the following UI changes in the live editor:

Target:
- File: components/ProjectCard.tsx
- Component: ProjectCard
- Element: CTA button

Changes:
- Increased padding from px-4 py-2 to px-5 py-3
- Changed border radius from rounded-md to rounded-full
- Changed background from #111111 to #FACC15
- Changed text color from #FFFFFF to #111111
- Added rotate(-1deg)
- Added hard editorial shadow: 4px 4px 0 #111111

Please update the code to preserve these exact visual changes.
```

## JSON Patch Example

```json
{
  "target": {
    "file": "components/ProjectCard.tsx",
    "component": "ProjectCard",
    "selector": "button[data-role='project-cta']"
  },
  "changes": [
    {
      "property": "padding",
      "from": "8px 16px",
      "to": "12px 20px"
    },
    {
      "property": "borderRadius",
      "from": "6px",
      "to": "9999px"
    },
    {
      "property": "backgroundColor",
      "from": "#111111",
      "to": "#FACC15"
    }
  ]
}
```

## Acceptance Criteria

* Prompt is concise and useful.
* JSON patch is machine-readable.
* Tailwind diff is generated when Tailwind is detected.
* Export includes target context.

---

# Feature 21: Code Patch Generation

## Description

Generate source-code patch suggestions when source mapping is available.

## Example

```diff
- <div className="rounded-xl bg-white p-6 shadow-sm">
+ <div className="rounded-none border-2 border-black bg-[#faf3e3] p-8 shadow-[6px_6px_0_#111]">
```

## Requirements

* Detect source component.
* Identify className or style attribute.
* Generate minimal diff.
* Preserve existing formatting where possible.

## Acceptance Criteria

* Patch generation is opt-in.
* User can review before applying.
* If source cannot be mapped, fallback to AI prompt/JSON patch.

---

# Feature 22: Prompt-to-Edit for Selected Elements

## Description

User can type natural-language edit commands scoped to selected element/component.

## Examples

```txt
Make this card more editorial.
Make all buttons sharper and more newspaper-like.
Increase spacing between these cards.
Make this section feel less rounded.
```

## Requirements

* AI command is scoped by current selection.
* Generated changes are previewed before applying.
* User can accept/reject.
* Changes are added to history.

## Acceptance Criteria

* AI does not modify unselected page areas unless explicitly requested.
* Preview clearly shows proposed changes.
* User can compare before/after.

---

# Feature 23: Visual Annotation Mode

## Description

User can draw feedback directly on the screen.

## Capabilities

* Draw arrows.
* Circle areas.
* Cross out elements.
* Add sticky text notes.
* Convert annotations into AI instructions.

## Example Output

```txt
User annotated the selected ProjectCard:
- Circled the CTA area
- Wrote: "make this pop more"
- Arrow points to title
- Wrote: "bigger, serif"

Suggested code changes:
- Increase title font size
- Change CTA background to accent color
- Add hard shadow
```

## Acceptance Criteria

* Annotation layer does not affect app DOM.
* Annotations can be exported with screenshot/context.
* AI prompt includes annotation summary.

---

# Feature 24: Before/After Preview

## Description

Users can compare edited UI against the original state.

## Modes

```txt
Toggle changes on/off
Compare selected element
Compare full page
Show changed elements only
```

## Acceptance Criteria

* User can instantly toggle edits.
* Diff mode highlights changed elements.
* Before/after state remains accurate after multiple edits.

---

# Feature 25: Consistency Audit

## Description

Detect common AI-generated UI issues.

## Audits

```txt
Spacing consistency
Color consistency
Radius consistency
Typography consistency
Shadow consistency
Theme consistency
Contrast/accessibility
```

## Examples

```txt
Spacing issue: this section uses gaps of 22px, 28px, and 32px.
Suggestion: normalize to 24px or 32px.
```

```txt
Color issue: #111111, #121212, and #0f0f0f are visually similar.
Suggestion: merge into #111111.
```

```txt
Theme issue: this section uses modern glass blur, but the rest of the page uses newspaper styling.
Suggestion: replace blur with hard border and paper shadow.
```

## Acceptance Criteria

* Audit results are suggestions, not automatic changes.
* User can apply suggestions selectively.
* Suggestions include reasoning.

---

# Feature 26: Style Presets

## Description

Reusable style recipes that apply multiple properties at once.

## Presets

```txt
Editorial Card
Newspaper Clipping
Rough Paper
Black Ink Border
Cutout Sticker
Hand-drawn Note
Brutalist Button
Luxury Magazine
Terminal Panel
Glass Card
```

## Preset Example

```txt
Newspaper Clipping:
- background: #f8f1df
- border: 1px solid #111
- border-radius: 0
- box-shadow: 4px 4px 0 #111
- font-family: serif
- transform: rotate(-0.5deg)
```

## Acceptance Criteria

* Presets are previewable.
* Presets can be applied to selected element.
* Preset changes are tracked as individual property edits.
* Users can create custom presets later.

---

## 9. UX Layout

### Main UI Regions

```txt
┌─────────────────────────────────────────────────────────────┐
│ Top Toolbar                                                  │
├───────────────┬───────────────────────────────┬─────────────┤
│ Component Tree│ Live App Canvas + Overlay      │ Properties  │
│               │                               │ Panel       │
├───────────────┴───────────────────────────────┴─────────────┤
│ Change History / Diff Panel                                  │
└─────────────────────────────────────────────────────────────┘
```

### Top Toolbar

Controls:

```txt
Inspect
Edit
AI Edit
Diff
Undo
Redo
Preview Toggle
Copy to AI
Export
Settings
```

### Floating Mini Toolbar

Appears near selected element.

Controls:

```txt
Edit text
Color
Spacing
Duplicate
Delete
Copy change
Ask AI
More
```

### Right Property Panel

Tabs:

```txt
Style
Layout
Content
Colors
Effects
AI
Diff
```

### Bottom Diff Panel

Shows:

```txt
Timeline
Changed elements
Export options
Before/after toggle
Patch preview
```

---

## 10. Keyboard Shortcuts

```txt
V - Select
H - Hand/pan
T - Text edit
R - Rotate
Cmd/Ctrl + Z - Undo
Cmd/Ctrl + Shift + Z - Redo
Arrow keys - Move 1px
Shift + Arrow - Move 10px
Cmd/Ctrl + D - Duplicate
Backspace - Delete
Esc - Deselect
Enter - Edit text / drill into child
Shift + Click - Multi-select
Cmd/Ctrl + C - Copy selected edit summary
Cmd/Ctrl + E - Export changes
```

---

## 11. Data Model

### Element Target

```ts
type ElementTarget = {
  id: string;
  domPath: string;
  selector?: string;
  tagName: string;
  componentName?: string;
  filePath?: string;
  lineNumber?: number;
  className?: string;
  textContent?: string;
};
```

### Style Change

```ts
type StyleChange = {
  id: string;
  timestamp: number;
  target: ElementTarget;
  property: string;
  from: string | number | null;
  to: string | number | null;
  source: "property-panel" | "drag" | "resize" | "rotate" | "preset" | "ai";
  cssOutput?: string;
  tailwindOutput?: {
    remove: string[];
    add: string[];
  };
};
```

### Text Change

```ts
type TextChange = {
  id: string;
  timestamp: number;
  target: ElementTarget;
  from: string;
  to: string;
};
```

### Session Change Set

```ts
type ChangeSet = {
  id: string;
  projectId?: string;
  pageUrl: string;
  createdAt: number;
  changes: Array<StyleChange | TextChange>;
  squashedChanges?: Array<StyleChange | TextChange>;
};
```

### Export Payload

```ts
type ExportPayload = {
  targetSummary: string;
  humanPrompt: string;
  jsonPatch: object;
  cssDiff?: string;
  tailwindDiff?: string;
  codePatch?: string;
};
```

---

## 12. Technical Architecture

### High-Level Architecture

```txt
React App
  ↓
Editor Provider
  ↓
DOM Inspector + React Fiber Mapping
  ↓
Overlay Renderer
  ↓
Property Engine
  ↓
Change Tracker
  ↓
Export Engine
```

### Core Modules

#### 1. Editor Provider

Wraps the app and enables editor mode.

```tsx
<UIEditorProvider>
  <App />
</UIEditorProvider>
```

#### 2. DOM Inspector

Responsible for:

* Hit testing.
* Hover detection.
* Selection.
* Bounding box calculation.
* Computed style extraction.

#### 3. React Mapping Layer

Using tools like `bippy`, map DOM nodes to React component metadata.

Responsibilities:

* Find component name.
* Find owner hierarchy.
* Find props if possible.
* Find source metadata if available.

#### 4. Overlay Renderer

Responsible for:

* Hover outline.
* Selection box.
* Handles.
* Guides.
* Labels.
* Annotation layer.

Should render outside app layout using portal.

#### 5. Property Engine

Responsible for:

* Reading computed styles.
* Normalizing values.
* Applying live edits.
* Mapping values to CSS/Tailwind.

#### 6. Tailwind Engine

Responsible for:

* Parsing className.
* Resolving conflicting classes.
* Mapping CSS values to Tailwind utilities.
* Generating class diffs.

#### 7. Change Tracker

Responsible for:

* Capturing before/after values.
* Undo/redo.
* Squashing edits.
* Exporting edit history.

#### 8. Export Engine

Responsible for:

* Human AI prompt.
* JSON patch.
* CSS diff.
* Tailwind diff.
* Code patch when possible.

---

## 13. Source Mapping Strategy

### Levels of Confidence

#### Level 1: DOM Only

Can edit live DOM and export selectors/styles.

Available:

* Tag name.
* DOM path.
* Computed styles.
* className.

Unavailable:

* Source file.
* Component name.
* Code patch.

#### Level 2: React Component Mapping

Can map DOM node to React component.

Available:

* Component name.
* Component tree.
* Props in some cases.

#### Level 3: Source Mapping

Can map selected node to source file/line.

Available:

* File path.
* Line number.
* Better code patch.

#### Level 4: AST Patch

Can safely modify source code.

Available:

* Minimal className/style patch.
* Reviewable code diff.

### Fallback Principle

If source mapping fails, never block the user. Fall back to:

1. Human prompt.
2. JSON patch.
3. CSS diff.
4. Selector-based instructions.

---

## 14. Smart Layout Preservation

### Problem

Direct manipulation can ruin code by adding absolute positioning everywhere.

### Principle

Visual edits should preserve layout intent whenever possible.

### Drag Strategy

When user drags an element:

1. Detect current layout context.
2. If parent is flex:

   * Prefer gap, margin, order, justify, align.
3. If parent is grid:

   * Prefer grid-column, grid-row, gap.
4. If element is absolute:

   * Update top/left/transform.
5. If movement is small:

   * Prefer margin or transform.
6. If no semantic mapping is safe:

   * Use transform as temporary edit.

### Example

Bad output:

```css
left: 17px;
position: absolute;
```

Better output:

```diff
- gap-4
+ gap-6
```

or:

```diff
+ ml-4
```

---

## 15. Export Formats

### 15.1 Human Prompt

Best for ChatGPT, Claude, Cursor, or any coding AI.

### 15.2 JSON Patch

Best for machine ingestion.

### 15.3 Tailwind Diff

Best for Tailwind projects.

### 15.4 CSS Diff

Best for plain CSS / CSS modules.

### 15.5 Code Patch

Best when source mapping is available.

### 15.6 Screenshot + Annotation Export

Best for visual feedback workflows.

---

## 16. MVP Scope

### MVP Goal

Let users select elements, edit core styles, track changes, and copy clean AI-ready output.

### MVP Must-Haves

1. Hover highlight.
2. Element selection.
3. Property panel.
4. Spacing controls.
5. Typography controls.
6. Color controls.
7. Border/radius controls.
8. Shadow controls.
9. Basic transform controls.
10. Change history.
11. Undo/redo.
12. Copy to AI.
13. JSON patch export.
14. Basic Tailwind class diff.

### MVP Nice-to-Haves

1. Component tree.
2. Color palette extraction.
3. Measurement guides.
4. Style presets.
5. Before/after toggle.

### Not in MVP

1. Full drag-resize-rotate system.
2. Visual annotation mode.
3. AI prompt-to-edit.
4. AST code patching.
5. Collaborative editing.
6. Global design token editing.

---

## 17. Phased Roadmap

### Phase 1: Visual Inspect + Basic Editing

Build:

* Hover outline.
* Selection.
* Property panel.
* Live style editing.
* Change tracking.
* Copy to AI.

Outcome:
Users can visually tweak UI and export exact changes.

### Phase 2: Tailwind-Aware Editing

Build:

* Tailwind class parsing.
* Tailwind scale snapping.
* Class grouping.
* Tailwind diff export.

Outcome:
Tool becomes much more useful for AI-generated React/Tailwind apps.

### Phase 3: Figma-like Manipulation

Build:

* Drag.
* Resize.
* Rotate.
* Snap guides.
* Distance measurements.

Outcome:
Users can manipulate UI directly on canvas.

### Phase 4: Component Intelligence

Build:

* Component tree.
* React fiber mapping.
* Scope-aware editing.
* Similar element detection.
* Source metadata.

Outcome:
Tool becomes component-aware instead of just DOM-aware.

### Phase 5: AI-Native Layer

Build:

* Prompt-to-edit selected elements.
* Visual annotation mode.
* AI-generated patch preview.
* Consistency audit.
* Theme suggestions.

Outcome:
Tool becomes a complete AI UI iteration environment.

### Phase 6: Code Patch System

Build:

* AST source patching.
* Framework adapters.
* Git diff generation.
* Apply patch to codebase.

Outcome:
Tool closes the loop from visual edit to code edit.

---

## 18. Edge Cases and Risks

### Risk 1: Editing Computed Styles Is Not Enough

Computed styles may not map cleanly back to source classes.

Mitigation:

* Store computed style and original className.
* Generate best-effort Tailwind diff.
* Fall back to AI prompt.

### Risk 2: Layout Breakage

Dragging can break responsive layout.

Mitigation:

* Avoid defaulting to absolute positioning.
* Add layout strategy engine.
* Mark some edits as temporary transforms.

### Risk 3: Source Mapping Is Hard

Mapping DOM nodes back to source code is unreliable across build tools.

Mitigation:

* Use progressive confidence levels.
* Do not require source mapping for MVP.
* Provide fallback exports.

### Risk 4: Too Many Controls

A full CSS panel can become overwhelming.

Mitigation:

* Show contextual controls.
* Hide advanced properties by default.
* Use presets and grouped sections.

### Risk 5: AI Edit Scope Creep

Prompt-to-edit could become another vague AI tool.

Mitigation:

* Always scope AI to selected element/component.
* Require preview before apply.
* Keep manual editing as the core product.

### Risk 6: Tailwind Conflicts

Tailwind classes can conflict and order matters.

Mitigation:

* Use class conflict resolution.
* Group by CSS category.
* Preserve unknown classes.

---

## 19. Open Questions

1. Should this be a browser extension, React library, or both?
2. Should visual edits apply through inline styles first and then export patches?
3. How deeply should the tool integrate with build systems like Vite, Next.js, and Remix?
4. Should the product focus first on Tailwind apps only?
5. Should code patching be handled by the library or delegated to AI editors like Cursor?
6. Should design presets be built in or user-defined?
7. How much of Figma-like drag/resize should be in MVP?
8. Should the editor store sessions locally or in project files?
9. Should the tool support production apps, or only development mode?
10. Should source mapping require a Babel/Vite plugin?

---

## 20. Recommended MVP Build Plan

### Week 1: Core Overlay

* Editor provider.
* Hover detection.
* Selection system.
* Overlay outlines.
* Floating label.

### Week 2: Property Reading and Editing

* Computed style extraction.
* Property panel.
* Spacing controls.
* Color controls.
* Typography controls.
* Live style application.

### Week 3: Change Tracking

* Edit history.
* Undo/redo.
* Squash changes.
* Before/after state.

### Week 4: Export System

* Human prompt export.
* JSON patch export.
* Basic CSS diff.
* Copy to clipboard.

### Week 5: Tailwind Support

* Parse className.
* Map common CSS values to Tailwind utilities.
* Generate Tailwind diff.
* Warn for non-scale values.

### Week 6: Polish and Demo

* Component tree basic version.
* Color palette extraction.
* Basic presets.
* Demo with AI-generated UI examples.

---

## 21. MVP Acceptance Criteria

The MVP is successful if a user can:

1. Enable editor overlay in a React app.
2. Hover and select a visible element.
3. Change padding, margin, font size, color, radius, and shadow.
4. See the UI update instantly.
5. Undo and redo edits.
6. View a history of changes.
7. Copy a clean AI prompt describing the exact edits.
8. Copy a JSON patch of the edits.
9. Copy a basic Tailwind diff when editing Tailwind classes.
10. Use the exported prompt in an AI coding assistant to update source code more accurately than vague natural-language feedback.

---

## 22. Example End-to-End Scenario

### Input

AI generated a project card, but the CTA button looks weak.

### User Actions

1. User hovers button.
2. Editor shows: `Button 112 × 40`.
3. User clicks button.
4. Property panel opens.
5. User changes:

   * Padding: `8px 16px` → `12px 20px`
   * Radius: `6px` → `9999px`
   * Background: `#111111` → `#FACC15`
   * Text color: `#FFFFFF` → `#111111`
   * Shadow: none → `4px 4px 0 #111111`
   * Rotate: `0deg` → `-1deg`
6. User clicks **Copy to AI**.

### Exported Prompt

```txt
Target:
- Component: ProjectCard
- Element: CTA button
- Selector: button[data-role="project-cta"]

Apply these exact UI changes:
- Padding: 8px 16px → 12px 20px
- Border radius: 6px → 9999px
- Background color: #111111 → #FACC15
- Text color: #FFFFFF → #111111
- Box shadow: none → 4px 4px 0 #111111
- Transform: none → rotate(-1deg)

Update the React/Tailwind code to preserve these exact visual changes. Prefer Tailwind utilities where possible.
```

### Tailwind Diff

```diff
- rounded-md bg-black px-4 py-2 text-white
+ rounded-full bg-[#FACC15] px-5 py-3 text-black shadow-[4px_4px_0_#111] -rotate-1
```

---

## 23. Strategic Positioning

### Simple Positioning

Figma-like editing for live React UIs, built for AI-generated interfaces.

### Developer Positioning

A React visual editing SDK that turns live UI tweaks into AI-readable patches and Tailwind/code diffs.

### AI Workflow Positioning

Stop prompting AI for every pixel. Edit visually, then send exact changes.

### Differentiation

Unlike DevTools:

* Changes are tracked.
* Changes are exportable.
* Tailwind-aware output is generated.
* AI-ready prompts are produced.

Unlike Figma:

* Edits happen on the real app.
* Real DOM and React components are inspected.
* Changes can map back to code.

Unlike AI app builders:

* User stays in control of visual details.
* AI does not regenerate everything blindly.
* Manual edits become structured context.

---

## 24. Final Product Principle

The product should not try to replace AI or replace code.

It should become the missing layer between them:

> A precise visual correction layer that turns human design judgment into structured code changes.
