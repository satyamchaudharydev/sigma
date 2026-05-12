import { useEffect, useMemo, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { CssInspectorEntry, EditorSnapshot, PanelDisplayMode, PanelDockSide } from '../types';
import type { EditorController } from '../core/controller';
import { parseBoxShadow, stringifyBoxShadow } from '../core/styles';
import { adjustNumericCssValue, colorStringToHex, escapeHtml, getCssValueKind, parseUnitValue } from '../core/utils';

type CssViewMode = 'defined' | 'computed';
type CollapsedKey = 'background' | 'border' | 'shadow' | 'changes';
const DOCK_SIDES: PanelDockSide[] = ['left', 'right', 'top', 'bottom'];
const PANEL_MODES: PanelDisplayMode[] = ['overlay', 'split'];

function highlightHtml(html: string): string {
  const escaped = escapeHtml(html);
  return escaped
    .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="rve-token-tag">$2</span>')
    .replace(/([\w:-]+)=(&quot;[^&]*&quot;)/g, '<span class="rve-token-attr">$1</span>=<span class="rve-token-string">$2</span>');
}

export function Panel(props: { controller: EditorController; snapshot: EditorSnapshot }) {
  const selection = props.snapshot.selection;
  const [cssViewMode, setCssViewMode] = useState<CssViewMode>('defined');
  const [cssQuery, setCssQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<CollapsedKey, boolean>>({
    background: true,
    border: true,
    shadow: true,
    changes: false
  });

  useEffect(() => {
    setCssViewMode('defined');
    setCssQuery('');
    setShowMenu(false);
  }, [selection?.context.selector]);

  if (!selection || !props.snapshot.isPanelOpen) {
    return null;
  }

  const values = selection.values;
  const changes = selection.context.changes;
  const cssEntries = useMemo(() => {
    const sourceEntries = cssViewMode === 'defined' ? selection.css.defined : selection.css.computed;
    const query = cssQuery.trim().toLowerCase();
    if (!query) {
      return sourceEntries;
    }

    return sourceEntries.filter((entry) =>
      entry.property.toLowerCase().includes(query) ||
      entry.value.toLowerCase().includes(query) ||
      entry.source?.toLowerCase().includes(query)
    );
  }, [cssQuery, cssViewMode, selection.css.computed, selection.css.defined]);

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
  const shadow = useMemo(() => parseBoxShadow(values['box-shadow']), [values]);
  const gridColumns = getGridTrackCount(values['grid-template-columns']) ?? 4;
  const gridRows = getGridTrackCount(values['grid-template-rows']) ?? 2;

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

            <InspectorSection title="Size" action="+">
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
              <InspectorRow label="Min Max">
                <DualControlRow>
                  <IconGhost>↔</IconGhost>
                  <TextControl value="" placeholder="Add..." disabled onChange={() => {}} />
                </DualControlRow>
              </InspectorRow>
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
              <InspectorRow label="Gap">
                <DualControlRow>
                  <InlineNumberWithIcon icon="↔" value={values['column-gap']} onChange={(value) => setValue('column-gap', value)} />
                  <InlineNumberWithIcon icon="↕" value={values['row-gap']} onChange={(value) => setValue('row-gap', value)} />
                </DualControlRow>
              </InspectorRow>
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

            <InspectorSection title="Grid Structure">
              <InspectorRow label="Columns">
                <StepperControl
                  value={gridColumns}
                  onChange={(value) => setValue('grid-template-columns', `repeat(${Math.max(1, value)}, minmax(0, 1fr))`)}
                  disabled={!isGrid}
                />
              </InspectorRow>
              <InspectorRow label="Rows">
                <StepperControl
                  value={gridRows}
                  onChange={(value) => setValue('grid-template-rows', `repeat(${Math.max(1, value)}, minmax(0, 1fr))`)}
                  disabled={!isGrid}
                />
              </InspectorRow>
              <GridPreview columns={gridColumns} rows={gridRows} disabled={!isGrid} />
            </InspectorSection>

            <InspectorSection title="Appearance">
              <DualFieldRow
                leftLabel="Opacity"
                leftControl={<InlineNumberWithUnit value={`${opacityPercent}%`} unit="%" onChange={(value) => setValue('opacity', String(Math.max(0, Math.min(100, Number.parseFloat(value) || 0)) / 100))} />}
                rightLabel="Corner Radius"
                rightControl={<InlineNumberWithUnit value={`${radiusValue}px`} unit="px" onChange={(value) => setValue('border-radius', value)} />}
              />
            </InspectorSection>

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

function CssInspector(props: {
  entries: CssInspectorEntry[];
  viewMode: CssViewMode;
  query: string;
  onQueryChange: (value: string) => void;
  onViewModeChange: (value: CssViewMode) => void;
  onValueChange: (property: string, value: string) => void;
}) {
  return (
    <section className="rve-section rve-css-section">
      <div className="rve-css-toolbar">
        <div className="rve-tab-strip">
          <button type="button" className="rve-chip" data-active={props.viewMode === 'defined'} onClick={() => props.onViewModeChange('defined')}>
            Defined
          </button>
          <button type="button" className="rve-chip" data-active={props.viewMode === 'computed'} onClick={() => props.onViewModeChange('computed')}>
            Computed
          </button>
        </div>
        <input
          className="rve-input rve-css-search"
          placeholder="Filter properties"
          value={props.query}
          onInput={(event) => props.onQueryChange((event.currentTarget as HTMLInputElement).value)}
        />
      </div>
      <div className="rve-css-list">
        {props.entries.length > 0 ? (
          props.entries.map((entry) => (
            <div className="rve-css-row" data-changed={entry.changed ? 'true' : 'false'} key={`${entry.property}:${entry.source ?? 'computed'}`}>
              <div className="rve-css-property">{entry.property}</div>
              <div className="rve-css-value-wrap">
                <CssValueEditor entry={entry} onChange={(value) => props.onValueChange(entry.property, value)} />
                {entry.source ? <div className="rve-css-source" title={entry.source}>{entry.source}</div> : null}
              </div>
            </div>
          ))
        ) : (
          <div className="rve-help-text">No CSS properties matched this filter.</div>
        )}
      </div>
    </section>
  );
}

function CssValueEditor(props: {
  entry: CssInspectorEntry;
  onChange: (value: string) => void;
}) {
  const kind = getCssValueKind(props.entry.property, props.entry.value);
  const [draft, setDraft] = useState(props.entry.value);

  useEffect(() => {
    setDraft(props.entry.value);
  }, [props.entry.value]);

  const commit = (nextValue: string) => {
    const normalizedValue = nextValue.trim();
    setDraft(normalizedValue);
    props.onChange(normalizedValue);
  };

  if (kind === 'color') {
    return <ColorTextControl value={draft} onChange={(value) => { setDraft(value); props.onChange(value); }} />;
  }

  return (
    <input
      className="rve-css-inline-input"
      value={draft}
      title={draft}
      onInput={(event) => setDraft((event.currentTarget as HTMLInputElement).value)}
      onBlur={() => commit(draft)}
      onKeyDown={(event) => {
        if (kind === 'number' && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
          const nextValue = adjustNumericCssValue(props.entry.property, draft, event.key === 'ArrowUp' ? 1 : -1, {
            shiftKey: event.shiftKey,
            altKey: event.altKey
          });

          if (nextValue) {
            event.preventDefault();
            setDraft(nextValue);
            props.onChange(nextValue);
          }
        }

        if (event.key === 'Enter') {
          commit(draft);
        }

        if (event.key === 'Escape') {
          setDraft(props.entry.value);
        }
      }}
    />
  );
}

function InspectorSection(props: { title: string; children: ComponentChildren; action?: string }) {
  return (
    <section className="rve-inspector-section">
      <div className="rve-inspector-section-header">
        <h3>{props.title}</h3>
        {props.action ? <button type="button" className="rve-section-action" disabled>{props.action}</button> : null}
      </div>
      <div className="rve-inspector-section-body">{props.children}</div>
    </section>
  );
}

function CollapsibleSection(props: { title: string; children: ComponentChildren; collapsed: boolean; onToggle: () => void }) {
  return (
    <section className="rve-inspector-section">
      <button type="button" className="rve-collapse-toggle" onClick={props.onToggle}>
        <span>{props.title}</span>
        <span>{props.collapsed ? '+' : '−'}</span>
      </button>
      {!props.collapsed ? <div className="rve-inspector-section-body">{props.children}</div> : null}
    </section>
  );
}

function InspectorRow(props: { label: string; children: ComponentChildren }) {
  return (
    <div className="rve-inspector-row">
      <div className="rve-inspector-label">{props.label}</div>
      <div className="rve-inspector-control">{props.children}</div>
    </div>
  );
}

function DualFieldRow(props: {
  leftLabel: string;
  leftControl: ComponentChildren;
  rightLabel?: string;
  rightControl?: ComponentChildren;
}) {
  return (
    <div className="rve-inspector-dual">
      <div className="rve-inspector-dual-item">
        <div className="rve-inspector-sub-label">{props.leftLabel}</div>
        {props.leftControl}
      </div>
      {props.rightControl ? (
        <div className="rve-inspector-dual-item">
          <div className="rve-inspector-sub-label">{props.rightLabel}</div>
          {props.rightControl}
        </div>
      ) : null}
    </div>
  );
}

function DualControlRow(props: { children: ComponentChildren }) {
  return <div className="rve-dual-control">{props.children}</div>;
}

function TextControl(props: { value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <input
      className="rve-inspector-input"
      value={props.value}
      placeholder={props.placeholder}
      disabled={props.disabled}
      onInput={(event) => props.onChange((event.currentTarget as HTMLInputElement).value)}
    />
  );
}

function SimpleSelect(props: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <select
      className="rve-inspector-select"
      value={props.value}
      disabled={props.disabled}
      onChange={(event) => props.onChange?.((event.currentTarget as HTMLSelectElement).value)}
    >
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

function SegmentedControl(props: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="rve-segmented" data-disabled={props.disabled ? 'true' : 'false'}>
      {props.options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="rve-segmented-button"
          data-active={props.value === option.value ? 'true' : 'false'}
          disabled={props.disabled}
          onClick={() => props.onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function IconGhost(props: { children: ComponentChildren }) {
  return <span className="rve-icon-ghost">{props.children}</span>;
}

function InlineNumberWithIcon(props: { icon: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="rve-inline-with-icon">
      <span className="rve-icon-ghost">{props.icon}</span>
      <InlineNumberWithUnit value={props.value} unit="px" onChange={props.onChange} />
    </div>
  );
}

function InlineNumberWithUnit(props: { value: string; unit: string; onChange: (value: string) => void; disabled?: boolean }) {
  const parsed = parseUnitValue(props.value);
  const displayValue = parsed.value === null ? props.value.replace(props.unit, '') : String(parsed.value);

  return (
    <div className="rve-inline-unit">
      <input
        className="rve-inspector-input"
        value={displayValue}
        disabled={props.disabled}
        onInput={(event) => {
          const next = (event.currentTarget as HTMLInputElement).value.trim();
          props.onChange(next ? `${next}${props.unit}` : '');
        }}
      />
      <span className="rve-inline-unit-label">{props.unit}</span>
    </div>
  );
}

function StepperControl(props: { value: number; onChange: (value: number) => void; disabled?: boolean }) {
  return (
    <div className="rve-stepper">
      <button type="button" className="rve-stepper-button" disabled={props.disabled} onClick={() => props.onChange(props.value - 1)}>−</button>
      <div className="rve-stepper-value">{props.value}</div>
      <button type="button" className="rve-stepper-button" disabled={props.disabled} onClick={() => props.onChange(props.value + 1)}>+</button>
    </div>
  );
}

function GridPreview(props: { columns: number; rows: number; disabled?: boolean }) {
  const total = Math.max(1, Math.min(12, props.columns)) * Math.max(1, Math.min(4, props.rows));
  return (
    <div className="rve-grid-preview" data-disabled={props.disabled ? 'true' : 'false'}>
      {Array.from({ length: total }).map((_, index) => (
        <span key={index} className="rve-grid-preview-cell" />
      ))}
    </div>
  );
}

function BoxModelSection(props: {
  title: string;
  expanded: boolean;
  values: { top: string; right: string; bottom: string; left: string };
  onChange: (side: 'top' | 'right' | 'bottom' | 'left', value: string) => void;
}) {
  const shorthandValue = compressBoxValues(props.values);

  return (
    <InspectorSection title={props.title}>
      <div className="rve-box-model">
        <div className="rve-box-model-toolbar">
          <span className="rve-box-model-hint">{props.expanded ? 'Separate sides' : 'All sides'}</span>
        </div>
        {props.expanded ? (
          <div className="rve-box-model-grid">
            {([
              ['top', 'T'],
              ['right', 'R'],
              ['bottom', 'B'],
              ['left', 'L']
            ] as const).map(([side, label]) => (
              <div key={side} className="rve-box-model-cell">
                <input
                  className="rve-inspector-input"
                  value={props.values[side]}
                  onInput={(event) => props.onChange(side, (event.currentTarget as HTMLInputElement).value)}
                />
                <span className="rve-box-model-label">{label}</span>
              </div>
            ))}
          </div>
        ) : (
          <input
            className="rve-inspector-input"
            value={shorthandValue}
            onInput={(event) => {
              const next = (event.currentTarget as HTMLInputElement).value;
              props.onChange('top', next);
              props.onChange('right', next);
              props.onChange('bottom', next);
              props.onChange('left', next);
            }}
          />
        )}
      </div>
    </InspectorSection>
  );
}

function ColorTextControl(props: { value: string; onChange: (value: string) => void }) {
  const [rawValue, setRawValue] = useState(props.value);

  useEffect(() => {
    setRawValue(props.value);
  }, [props.value]);

  return (
    <div className="rve-color-control">
      <input
        className="rve-css-color-input"
        type="color"
        value={colorStringToHex(props.value)}
        onInput={(event) => {
          const nextValue = (event.currentTarget as HTMLInputElement).value;
          setRawValue(nextValue);
          props.onChange(nextValue);
        }}
      />
      <input
        className="rve-inspector-input"
        value={rawValue}
        onInput={(event) => {
          const nextValue = (event.currentTarget as HTMLInputElement).value;
          setRawValue(nextValue);
          props.onChange(nextValue);
        }}
      />
    </div>
  );
}

function toOption(value: string, label = capitalize(value)): { value: string; label: string } {
  return { value, label };
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
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

function compressBoxValues(values: { top: string; right: string; bottom: string; left: string }): string {
  if (values.top === values.right && values.top === values.bottom && values.top === values.left) {
    return values.top;
  }

  return [values.top, values.right, values.bottom, values.left].join(' ').trim();
}
