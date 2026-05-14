import { useState } from 'preact/hooks';
import { parseUnitValue } from '../core/utils';

export function GridOverview(props: {
  columns: number;
  rows: number;
  columnGap: string;
  rowGap: string;
  onColumnsChange: (value: number) => void;
  onRowsChange: (value: number) => void;
  onColumnGapChange: (value: string) => void;
  onRowGapChange: (value: string) => void;
}) {
  const [showDimensions, setShowDimensions] = useState(false);
  const [previewSize, setPreviewSize] = useState<{ columns: number; rows: number } | null>(null);
  const activeColumns = previewSize?.columns ?? props.columns;
  const activeRows = previewSize?.rows ?? props.rows;

  return (
    <div className="rve-grid-overview">
      <div className="rve-grid-summary">
        <div className="rve-grid-summary-block">
          <div className="rve-grid-mini-label">Grid</div>
          <button type="button" className="rve-grid-summary-card" onClick={() => setShowDimensions((value) => !value)}>
            <span>{props.columns} × {props.rows}</span>
          </button>
          {showDimensions ? (
            <div className="rve-grid-dimensions-popover">
              <div className="rve-grid-mini-label">Dimensions</div>
              <div className="rve-grid-dimension-row">
                <GridCountInput icon="▯▯" value={activeColumns} onChange={props.onColumnsChange} />
                <span className="rve-grid-times">×</span>
                <GridCountInput icon="▭▭" value={activeRows} onChange={props.onRowsChange} />
              </div>
              <GridPreview
                columns={props.columns}
                rows={props.rows}
                previewColumns={previewSize?.columns ?? null}
                previewRows={previewSize?.rows ?? null}
                onPreviewChange={(columns, rows) => setPreviewSize({ columns, rows })}
                onPreviewEnd={() => setPreviewSize(null)}
                onCommit={(columns, rows) => {
                  props.onColumnsChange(columns);
                  props.onRowsChange(rows);
                  setPreviewSize(null);
                }}
              />
            </div>
          ) : null}
        </div>
        <div className="rve-grid-summary-block">
          <div className="rve-grid-mini-label">Gap</div>
          <div className="rve-grid-gap-stack">
            <GridMetricInput icon="▭" value={props.rowGap} onChange={props.onRowGapChange} />
            <GridMetricInput icon="││" value={props.columnGap} onChange={props.onColumnGapChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function GridMetricInput(props: { icon: string; value: string; onChange: (value: string) => void }) {
  const parsed = parseUnitValue(props.value);
  const displayValue = parsed.value === null ? props.value.replace('px', '') : String(parsed.value);

  return (
    <div className="rve-grid-metric-card">
      <span className="rve-grid-metric-icon">{props.icon}</span>
      <input
        className="rve-grid-metric-input"
        value={displayValue}
        onInput={(event) => {
          const next = (event.currentTarget as HTMLInputElement).value.trim();
          props.onChange(next ? `${next}px` : '');
        }}
      />
    </div>
  );
}

export function GridCountInput(props: { icon: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="rve-grid-metric-card">
      <span className="rve-grid-metric-icon">{props.icon}</span>
      <input
        className="rve-grid-metric-input"
        value={String(props.value)}
        onInput={(event) => {
          const numeric = Number.parseInt((event.currentTarget as HTMLInputElement).value, 10);
          props.onChange(Number.isFinite(numeric) ? Math.max(1, numeric) : 1);
        }}
      />
    </div>
  );
}

export function GridPreview(props: {
  columns: number;
  rows: number;
  previewColumns?: number | null;
  previewRows?: number | null;
  disabled?: boolean;
  onPreviewChange?: (columns: number, rows: number) => void;
  onPreviewEnd?: () => void;
  onCommit?: (columns: number, rows: number) => void;
}) {
  const committedColumns = Math.max(1, Math.min(12, props.columns));
  const committedRows = Math.max(1, Math.min(8, props.rows));
  const visibleColumns = Math.max(1, Math.min(12, props.previewColumns ?? props.columns));
  const visibleRows = Math.max(1, Math.min(8, props.previewRows ?? props.rows));
  const total = 12 * 8;

  const isWithinBounds = (index: number, columns: number, rows: number) => {
    const column = (index % 12) + 1;
    const row = Math.floor(index / 12) + 1;
    return column <= columns && row <= rows;
  };

  return (
    <div
      className="rve-grid-preview"
      data-disabled={props.disabled ? 'true' : 'false'}
      style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }}
      onMouseLeave={() => props.onPreviewEnd?.()}
    >
      <div
        className="rve-grid-preview-label"
        style={{
          left: `${((Math.min(12, visibleColumns) - 1) / 12) * 100}%`
        }}
      >
        {visibleColumns} × {visibleRows}
      </div>
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className="rve-grid-preview-cell"
          data-active={isWithinBounds(index, visibleColumns, visibleRows) ? 'true' : 'false'}
          data-committed={isWithinBounds(index, committedColumns, committedRows) ? 'true' : 'false'}
          onMouseEnter={() => {
            if (props.disabled) {
              return;
            }
            const row = Math.floor(index / 12) + 1;
            const column = (index % 12) + 1;
            props.onPreviewChange?.(column, row);
          }}
          onClick={() => {
            if (props.disabled) {
              return;
            }
            const row = Math.floor(index / 12) + 1;
            const column = (index % 12) + 1;
            props.onCommit?.(column, row);
          }}
        />
      ))}
    </div>
  );
}
