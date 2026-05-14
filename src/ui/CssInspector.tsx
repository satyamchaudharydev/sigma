import { useEffect, useState } from 'preact/hooks';
import type { CssInspectorEntry } from '../types';
import { adjustNumericCssValue, escapeHtml, getCssValueKind } from '../core/utils';
import { ColorTextControl } from './controls';

type CssViewMode = 'defined' | 'computed';

export function highlightHtml(html: string): string {
  const escaped = escapeHtml(html);
  return escaped
    .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="rve-token-tag">$2</span>')
    .replace(/([\w:-]+)=(&quot;[^&]*&quot;)/g, '<span class="rve-token-attr">$1</span>=<span class="rve-token-string">$2</span>');
}

export function CssInspector(props: {
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
