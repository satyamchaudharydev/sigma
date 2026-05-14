import { useEffect, useMemo, useState } from 'preact/hooks';
import type { CssInspectorEntry, EditorSnapshot, PanelDisplayMode, PanelDockSide } from '../types';
import type { EditorController } from '../core/controller';
import { parseBoxShadow, parseTransformValue, stringifyBoxShadow, stringifyTransformValue } from '../core/styles';
import { parseUnitValue } from '../core/utils';
import {
  CollapsibleSection,
  ColorTextControl,
  DualControlRow,
  DualFieldRow,
  IconGhost,
  InlineNumberWithIcon,
  InlineNumberWithUnit,
  InspectorRow,
  InspectorSection,
  SegmentedControl,
  SimpleSelect,
  TextControl,
  capitalize,
  stripUnit,
  toOption
} from './controls';
import { CssInspector, highlightHtml } from './CssInspector';
import { GridOverview } from './GridSection';
import { BoxModelSection } from './BoxModelSection';

type CssViewMode = 'defined' | 'computed';
type CollapsedKey = 'transform' | 'background' | 'border' | 'shadow' | 'changes';
const DOCK_SIDES: PanelDockSide[] = ['left', 'right', 'top', 'bottom'];
const PANEL_MODES: PanelDisplayMode[] = ['overlay', 'split'];
const MIN_MAX_OPTIONS = [
  { value: 'max-width', label: 'Max Width' },
  { value: 'min-width', label: 'Min Width' },
  { value: 'max-height', label: 'Max Height' },
  { value: 'min-height', label: 'Min Height' }
] as const;

export function Panel(props: { controller: EditorController; snapshot: EditorSnapshot }) {
  const selection = props.snapshot.selection;
  const [cssViewMode, setCssViewMode] = useState<CssViewMode>('defined');
  const [cssQuery, setCssQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showMinMaxMenu, setShowMinMaxMenu] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<CollapsedKey, boolean>>({
    transform: false,
    background: true,
    border: true,
    shadow: true,
    changes: false
  });

  useEffect(() => {
    setCssViewMode('defined');
    setCssQuery('');
    setShowMenu(false);
    setShowMinMaxMenu(false);
  }, [selection?.context.selector]);

  // All useMemo calls must be before any early return to avoid hooks-in-conditional violations
  const cssEntries = useMemo<CssInspectorEntry[]>(() => {
    if (!selection) return [] as CssInspectorEntry[];
    const sourceEntries = cssViewMode === 'defined' ? selection.css.defined : selection.css.computed;
    const query = cssQuery.trim().toLowerCase();
    if (!query) return sourceEntries;
    return sourceEntries.filter((entry) =>
      entry.property.toLowerCase().includes(query) ||
      entry.value.toLowerCase().includes(query) ||
      entry.source?.toLowerCase().includes(query)
    );
  }, [cssQuery, cssViewMode, selection?.css.computed, selection?.css.defined]);

  const shadow = useMemo(() => parseBoxShadow(selection?.values['box-shadow'] ?? ''), [selection?.values['box-shadow']]);
  const transform = useMemo(() => parseTransformValue(selection?.values['transform'] ?? ''), [selection?.values['transform']]);

  if (!selection || !props.snapshot.isPanelOpen) {
    return null;
  }

  const values = selection.values;
  const changes = selection.context.changes;

  const displayType = values['display'] === 'grid' ? 'grid' : 'stack';
  const panelLayout = props.snapshot.panelLayout;
  const isHorizontalDock = panelLayout.dockSide === 'left' || panelLayout.dockSide === 'right';
  const isGrid = displayType === 'grid';
  const direction = values['flex-direction'] || 'row';
  const justify = values['justify-content'] || 'flex-start';
  const align = values['align-items'] || 'stretch';
  const wrap = values['flex-wrap'] === 'wrap' ? 'wrap' : 'nowrap';
  const opacityPercent = Math.round((Number.parseFloat(values['opacity'] || '1') || 1) * 100);
  const radiusValue = parseUnitValue(values['border-radius']).value ?? 0;
  const fontSizeValue = parseUnitValue(values['font-size']).value ?? 14;
  const gridColumns = getGridTrackCount(values['grid-template-columns']) ?? 4;
  const gridRows = getGridTrackCount(values['grid-template-rows']) ?? 2;
  const minMaxKeys = MIN_MAX_OPTIONS
    .map((option) => option.value)
    .filter((property) => isActiveMinMaxValue(property, values[property]));
  const availableMinMaxOptions = MIN_MAX_OPTIONS.filter((option) => !minMaxKeys.includes(option.value));

  const setValue = (property: string, value: string) => props.controller.updateStyle(property, value);
  const panelStyle = isHorizontalDock ? { width: `${panelLayout.size}px` } : { height: `${panelLayout.size}px` };
  const startResize = (event: PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const move = (nextEvent: PointerEvent) => {
      if (panelLayout.dockSide === 'left') {
        props.controller.setPanelSize(nextEvent.clientX);
        return;
      }
      if (panelLayout.dockSide === 'right') {
        props.controller.setPanelSize(window.innerWidth - nextEvent.clientX);
        return;
      }
      if (panelLayout.dockSide === 'top') {
        props.controller.setPanelSize(nextEvent.clientY);
        return;
      }
      props.controller.setPanelSize(window.innerHeight - nextEvent.clientY);
    };

    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
  };

  return (
    <aside
      className="rve-panel"
      data-dock={panelLayout.dockSide}
      data-mode={panelLayout.displayMode}
      style={panelStyle}
    >
      <div className="rve-panel-resize-handle" onPointerDown={startResize} />
      <div className="rve-panel-topbar">
        <div className="rve-tabs">
          <button type="button" className="rve-tab" data-active={props.snapshot.activeTab === 'design'} onClick={() => props.controller.setActiveTab('design')}>
            Style
          </button>
          <button type="button" className="rve-tab" data-active={props.snapshot.activeTab === 'css'} onClick={() => props.controller.setActiveTab('css')}>
            CSS
          </button>
          <button type="button" className="rve-tab" data-active={props.snapshot.activeTab === 'html'} onClick={() => props.controller.setActiveTab('html')}>
            HTML
          </button>
        </div>
        <div className="rve-panel-menu-wrap">
          <button type="button" className="rve-panel-menu-button" aria-label="Panel settings" onClick={() => setShowMenu((value) => !value)}>
            ⋯
          </button>
          {showMenu ? (
            <div className="rve-panel-menu">
              <div className="rve-panel-menu-group">
                <div className="rve-panel-menu-label">Panel mode</div>
                <div className="rve-panel-menu-segmented">
                  {PANEL_MODES.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className="rve-panel-menu-segment"
                      data-active={panelLayout.displayMode === mode}
                      onClick={() => props.controller.setPanelDisplayMode(mode)}
                    >
                      {mode === 'overlay' ? 'Overlay' : 'Split'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rve-panel-menu-group">
                <div className="rve-panel-menu-label">Dock side</div>
                <div className="rve-panel-menu-segmented rve-panel-menu-segmented-grid">
                  {DOCK_SIDES.map((side) => (
                    <button
                      key={side}
                      type="button"
                      className="rve-panel-menu-segment"
                      data-active={panelLayout.dockSide === side}
                      onClick={() => props.controller.setPanelDockSide(side)}
                    >
                      {capitalize(side)}
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" className="rve-panel-menu-item" onClick={() => props.controller.setShowFourSides(!panelLayout.showFourSides)}>
                <span>4 sides</span>
                <span className="rve-panel-menu-check">{panelLayout.showFourSides ? '✓' : ''}</span>
              </button>
              <button type="button" className="rve-panel-menu-item" onClick={() => props.controller.closePanel()}>
                <span>Close panel</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="rve-panel-body">
        {props.snapshot.previewMode === 'original' ? (
          <div className="rve-preview-banner">
            Showing original state. Editing a value will switch back to live preview.
          </div>
        ) : null}

        {props.snapshot.activeTab === 'design' ? (
          <div className="rve-inspector">
            <InspectorSection title="Position">
              <InspectorRow label="Type">
                <SimpleSelect
                  value={values['position'] || 'relative'}
                  options={['static', 'relative', 'absolute', 'sticky', 'fixed'].map((value) => toOption(value))}
                  onChange={(value) => setValue('position', value)}
                />
              </InspectorRow>
            </InspectorSection>

            <InspectorSection title="Size">
              <InspectorRow label="Width">
                <DualControlRow>
                  <TextControl value={values['width']} onChange={(value) => setValue('width', value)} />
                  <SimpleSelect value="fill" options={[toOption('fill', 'Fill'), toOption('fit', 'Fit'), toOption('fixed', 'Fixed')]} disabled />
                </DualControlRow>
              </InspectorRow>
              <InspectorRow label="Height">
                <DualControlRow>
                  <TextControl value={values['height']} onChange={(value) => setValue('height', value)} />
                  <SimpleSelect value="fit" options={[toOption('fill', 'Fill'), toOption('fit', 'Fit'), toOption('fixed', 'Fixed')]} disabled />
                </DualControlRow>
              </InspectorRow>
              {minMaxKeys.map((property) => (
                <InspectorRow key={property} label={MIN_MAX_OPTIONS.find((option) => option.value === property)?.label ?? property}>
                  <DualControlRow>
                    <TextControl value={values[property]} onChange={(value) => setValue(property, value)} />
                    <SimpleSelect value="fixed" options={[toOption('fill', 'Fill'), toOption('fit', 'Fit'), toOption('fixed', 'Fixed')]} disabled />
                  </DualControlRow>
                </InspectorRow>
              ))}
              {availableMinMaxOptions.length > 0 ? (
                <InspectorRow label="Min Max">
                  <div className="rve-add-control-wrap">
                    <button
                      type="button"
                      className="rve-add-control"
                      onClick={() => setShowMinMaxMenu((value) => !value)}
                    >
                      <IconGhost>↔</IconGhost>
                      <span>Add...</span>
                    </button>
                    {showMinMaxMenu ? (
                      <div className="rve-add-menu">
                        {availableMinMaxOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className="rve-add-menu-item"
                            onClick={() => {
                              setShowMinMaxMenu(false);
                              setValue(option.value, getDefaultMinMaxValue(option.value));
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </InspectorRow>
              ) : null}
            </InspectorSection>

            <InspectorSection title="Layout">
              <InspectorRow label="Type">
                <SegmentedControl
                  value={displayType}
                  options={[toOption('stack', 'Stack'), toOption('grid', 'Grid')]}
                  onChange={(value) => setValue('display', value === 'grid' ? 'grid' : 'flex')}
                />
              </InspectorRow>
              <InspectorRow label="Direction">
                <SegmentedControl
                  value={direction}
                  options={[toOption('row', '↔'), toOption('column', '↕')]}
                  onChange={(value) => setValue('flex-direction', value)}
                  disabled={isGrid}
                />
              </InspectorRow>
              <InspectorRow label="Distribute">
                <SimpleSelect
                  value={justify}
                  options={[
                    toOption('flex-start', 'Start'),
                    toOption('center', 'Center'),
                    toOption('flex-end', 'End'),
                    toOption('space-between', 'Between'),
                    toOption('space-around', 'Around'),
                    toOption('space-evenly', 'Evenly')
                  ]}
                  onChange={(value) => setValue('justify-content', value)}
                />
              </InspectorRow>
              <InspectorRow label="Align">
                <SegmentedControl
                  value={align}
                  options={[
                    toOption('flex-start', '⇤'),
                    toOption('center', '↔'),
                    toOption('flex-end', '⇥')
                  ]}
                  onChange={(value) => setValue('align-items', value)}
                />
              </InspectorRow>
              <InspectorRow label="Wrap">
                <SegmentedControl
                  value={wrap}
                  options={[toOption('wrap', 'Yes'), toOption('nowrap', 'No')]}
                  onChange={(value) => setValue('flex-wrap', value)}
                  disabled={isGrid}
                />
              </InspectorRow>
              {!isGrid ? (
                <InspectorRow label="Gap">
                  <DualControlRow>
                    <InlineNumberWithIcon icon="↔" value={values['column-gap']} onChange={(value) => setValue('column-gap', value)} />
                    <InlineNumberWithIcon icon="↕" value={values['row-gap']} onChange={(value) => setValue('row-gap', value)} />
                  </DualControlRow>
                </InspectorRow>
              ) : null}
              {isGrid ? (
                <GridOverview
                  columns={gridColumns}
                  rows={gridRows}
                  columnGap={values['column-gap']}
                  rowGap={values['row-gap']}
                  onColumnsChange={(value) => setValue('grid-template-columns', `repeat(${Math.max(1, value)}, minmax(0, 1fr))`)}
                  onRowsChange={(value) => setValue('grid-template-rows', `repeat(${Math.max(1, value)}, minmax(0, 1fr))`)}
                  onColumnGapChange={(value) => setValue('column-gap', value)}
                  onRowGapChange={(value) => setValue('row-gap', value)}
                />
              ) : null}
            </InspectorSection>

            <BoxModelSection
              title="Padding"
              expanded={panelLayout.showFourSides}
              values={{
                top: values['padding-top'],
                right: values['padding-right'],
                bottom: values['padding-bottom'],
                left: values['padding-left']
              }}
              onChange={(side, value) => setValue(`padding-${side}`, value)}
            />

            <BoxModelSection
              title="Margin"
              expanded={panelLayout.showFourSides}
              values={{
                top: values['margin-top'],
                right: values['margin-right'],
                bottom: values['margin-bottom'],
                left: values['margin-left']
              }}
              onChange={(side, value) => setValue(`margin-${side}`, value)}
            />

            <InspectorSection title="Appearance">
              <DualFieldRow
                leftLabel="Opacity"
                leftControl={<InlineNumberWithUnit value={`${opacityPercent}%`} unit="%" onChange={(value) => setValue('opacity', String(Math.max(0, Math.min(100, Number.parseFloat(value) || 0)) / 100))} />}
                rightLabel="Corner Radius"
                rightControl={<InlineNumberWithUnit value={`${radiusValue}px`} unit="px" onChange={(value) => setValue('border-radius', value)} />}
              />
            </InspectorSection>

            <CollapsibleSection
              title="Transforms"
              collapsed={collapsed.transform}
              onToggle={() => setCollapsed((current) => ({ ...current, transform: !current.transform }))}
            >
              <InspectorRow label="Rotate" leading="+">
                <DualControlRow>
                  <InlineNumberWithUnit
                    value={`${transform.rotate}deg`}
                    unit="deg"
                    disabled={transform.mode === '3d'}
                    onChange={(value) => {
                      const next = parseTransformValue(values['transform'] || '');
                      next.mode = '2d';
                      next.rotate = stripUnit(value, 'deg');
                      setValue('transform', stringifyTransformValue(next));
                    }}
                  />
                  <SegmentedControl
                    value={transform.mode}
                    options={[toOption('2d', '2D'), toOption('3d', '3D')]}
                    onChange={(value) => {
                      const next = parseTransformValue(values['transform'] || '');
                      next.mode = value as '2d' | '3d';
                      setValue('transform', stringifyTransformValue(next));
                    }}
                  />
                </DualControlRow>
              </InspectorRow>
              {transform.mode === '3d' ? (
                <div className="rve-transform-axis-grid">
                  {([
                    ['rotateX', 'X'],
                    ['rotateY', 'Y'],
                    ['rotateZ', 'Z']
                  ] as const).map(([key, label]) => (
                    <div key={key} className="rve-transform-axis-cell">
                      <input
                        className="rve-inspector-input"
                        value={transform[key].replace('deg', '')}
                        onInput={(event) => {
                          const next = parseTransformValue(values['transform'] || '');
                          next.mode = '3d';
                          next[key] = (event.currentTarget as HTMLInputElement).value.trim() || '0';
                          setValue('transform', stringifyTransformValue(next));
                        }}
                      />
                      <span className="rve-transform-axis-label">{label}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              <InspectorRow label="Perspective" leading="+">
                <DualControlRow>
                  <TextControl value={values['perspective']} onChange={(value) => setValue('perspective', value)} />
                  <input
                    className="rve-range"
                    type="range"
                    min="0"
                    max="3000"
                    step="1"
                    value={String((parseUnitValue(values['perspective']).value ?? Number.parseFloat(values['perspective'])) || 0)}
                    onInput={(event) => setValue('perspective', (event.currentTarget as HTMLInputElement).value)}
                  />
                </DualControlRow>
              </InspectorRow>
            </CollapsibleSection>

            <InspectorSection title="Text">
              <DualControlRow>
                <SimpleSelect
                  value={values['font-family'] || '"Avenir Next", "Segoe UI", sans-serif'}
                  options={[
                    toOption('"Avenir Next", "Segoe UI", sans-serif', 'Avenir Next'),
                    toOption('Georgia, serif', 'Georgia'),
                    toOption('"Helvetica Neue", Arial, sans-serif', 'Helvetica Neue')
                  ]}
                  onChange={(value) => setValue('font-family', value)}
                />
                <SimpleSelect
                  value={values['font-weight'] || '400'}
                  options={['300', '400', '500', '600', '700'].map((value) => toOption(value))}
                  onChange={(value) => setValue('font-weight', value)}
                />
                <InlineNumberWithUnit value={`${fontSizeValue}px`} unit="px" onChange={(value) => setValue('font-size', value)} />
              </DualControlRow>
              <DualFieldRow
                leftLabel="Color"
                leftControl={
                  <DualControlRow>
                    <SimpleSelect value="solid" options={[toOption('solid', 'Solid')]} disabled />
                    <ColorTextControl value={values['color']} onChange={(value) => setValue('color', value)} />
                    <InlineNumberWithUnit value="100%" unit="%" disabled onChange={() => {}} />
                  </DualControlRow>
                }
              />
              <DualFieldRow
                leftLabel="Line Height"
                leftControl={<TextControl value={values['line-height']} onChange={(value) => setValue('line-height', value)} />}
                rightLabel="Letter Spacing"
                rightControl={<TextControl value={values['letter-spacing']} onChange={(value) => setValue('letter-spacing', value)} />}
              />
              <InspectorRow label="Alignment">
                <DualControlRow>
                  <SegmentedControl
                    value={values['text-align'] || 'left'}
                    options={[
                      toOption('left', '≡'),
                      toOption('center', '≣'),
                      toOption('right', '☰'),
                      toOption('justify', '☷')
                    ]}
                    onChange={(value) => setValue('text-align', value)}
                  />
                  <SegmentedControl
                    value="bottom"
                    options={[
                      toOption('top', '↑'),
                      toOption('middle', '✳'),
                      toOption('bottom', '↓'),
                      toOption('baseline', '⇣')
                    ]}
                    disabled
                    onChange={() => {}}
                  />
                </DualControlRow>
              </InspectorRow>
            </InspectorSection>

            <CollapsibleSection
              title="Background"
              collapsed={collapsed.background}
              onToggle={() => setCollapsed((current) => ({ ...current, background: !current.background }))}
            >
              <InspectorRow label="Color">
                <ColorTextControl value={values['background-color']} onChange={(value) => setValue('background-color', value)} />
              </InspectorRow>
            </CollapsibleSection>

            <CollapsibleSection
              title="Border"
              collapsed={collapsed.border}
              onToggle={() => setCollapsed((current) => ({ ...current, border: !current.border }))}
            >
              <DualFieldRow
                leftLabel="Width"
                leftControl={<InlineNumberWithUnit value={values['border-width']} unit="px" onChange={(value) => setValue('border-width', value)} />}
                rightLabel="Style"
                rightControl={
                  <SimpleSelect
                    value={values['border-style'] || 'none'}
                    options={['none', 'solid', 'dashed', 'dotted', 'double'].map((value) => toOption(value))}
                    onChange={(value) => setValue('border-style', value)}
                  />
                }
              />
              <InspectorRow label="Color">
                <ColorTextControl value={values['border-color']} onChange={(value) => setValue('border-color', value)} />
              </InspectorRow>
            </CollapsibleSection>

            <CollapsibleSection
              title="Shadow & Blur"
              collapsed={collapsed.shadow}
              onToggle={() => setCollapsed((current) => ({ ...current, shadow: !current.shadow }))}
            >
              <DualFieldRow
                leftLabel="Offset"
                leftControl={<InlineNumberWithUnit value={shadow.offsetX} unit="px" onChange={(value) => setValue('box-shadow', stringifyBoxShadow({ ...shadow, offsetX: value }))} />}
                rightLabel="Y"
                rightControl={<InlineNumberWithUnit value={shadow.offsetY} unit="px" onChange={(value) => setValue('box-shadow', stringifyBoxShadow({ ...shadow, offsetY: value }))} />}
              />
              <DualFieldRow
                leftLabel="Blur"
                leftControl={<InlineNumberWithUnit value={shadow.blur} unit="px" onChange={(value) => setValue('box-shadow', stringifyBoxShadow({ ...shadow, blur: value }))} />}
                rightLabel="Spread"
                rightControl={<InlineNumberWithUnit value={shadow.spread} unit="px" onChange={(value) => setValue('box-shadow', stringifyBoxShadow({ ...shadow, spread: value }))} />}
              />
              <InspectorRow label="Color">
                <ColorTextControl value={shadow.color} onChange={(value) => setValue('box-shadow', stringifyBoxShadow({ ...shadow, color: value }))} />
              </InspectorRow>
            </CollapsibleSection>

            <CollapsibleSection
              title="Changes"
              collapsed={collapsed.changes}
              onToggle={() => setCollapsed((current) => ({ ...current, changes: !current.changes }))}
            >
              {changes.length > 0 ? (
                <div className="rve-change-list">
                  {changes.map((change) => (
                    <div className="rve-change-item" key={change.property}>
                      <div className="rve-change-property">{change.property}</div>
                      <div className="rve-change-values">
                        <span className="rve-change-old">{change.oldValue}</span>
                        <span className="rve-change-arrow">→</span>
                        <span className="rve-change-new">{change.newValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rve-help-text">Adjust a value to build a prompt-ready diff.</div>
              )}
            </CollapsibleSection>
          </div>
        ) : null}

        {props.snapshot.activeTab === 'css' ? (
          <CssInspector
            entries={cssEntries}
            viewMode={cssViewMode}
            query={cssQuery}
            onQueryChange={setCssQuery}
            onViewModeChange={setCssViewMode}
            onValueChange={(property, value) => props.controller.updateStyle(property, value)}
          />
        ) : null}

        {props.snapshot.activeTab === 'html' ? (
          <pre className="rve-code" dangerouslySetInnerHTML={{ __html: highlightHtml(selection.html) }} />
        ) : null}
      </div>
    </aside>
  );
}

function isActiveMinMaxValue(property: string, value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  if (property === 'min-width' || property === 'min-height') {
    return normalized !== '0px' && normalized !== '0' && normalized !== 'auto';
  }

  return normalized !== 'none' && normalized !== 'auto';
}

function getDefaultMinMaxValue(property: string): string {
  if (property === 'max-width' || property === 'max-height') {
    return '320px';
  }

  return '100px';
}

function getGridTrackCount(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const repeatMatch = trimmed.match(/repeat\((\d+),/);
  if (repeatMatch) {
    return Number.parseInt(repeatMatch[1], 10);
  }

  return trimmed.split(/\s+/).filter(Boolean).length || null;
}
