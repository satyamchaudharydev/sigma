import { useEffect, useState } from 'preact/hooks';

function compressBoxValues(values: { top: string; right: string; bottom: string; left: string }): string {
  if (values.top === values.right && values.top === values.bottom && values.top === values.left) {
    return values.top;
  }

  return [values.top, values.right, values.bottom, values.left].join(' ').trim();
}

export function BoxModelSection(props: {
  title: string;
  expanded: boolean;
  values: { top: string; right: string; bottom: string; left: string };
  onChange: (side: 'top' | 'right' | 'bottom' | 'left', value: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(props.expanded);
  const shorthandValue = compressBoxValues(props.values);

  useEffect(() => {
    setIsExpanded(props.expanded);
  }, [props.expanded]);

  return (
    <section className="rve-inspector-section">
      <div className="rve-box-model-row">
        <div className="rve-inspector-label">{props.title}</div>
        <div className="rve-box-model-control">
          <input
            className="rve-inspector-input rve-box-model-input"
            value={shorthandValue}
            onInput={(event) => {
              const next = (event.currentTarget as HTMLInputElement).value;
              props.onChange('top', next);
              props.onChange('right', next);
              props.onChange('bottom', next);
              props.onChange('left', next);
            }}
          />
          <div className="rve-box-model-toggle-group">
            <button
              type="button"
              className="rve-box-model-mode"
              data-active={isExpanded ? 'false' : 'true'}
              aria-label={`${props.title} single value`}
              onClick={() => setIsExpanded(false)}
            >
              <span className="rve-box-model-mode-square" />
            </button>
            <button
              type="button"
              className="rve-box-model-mode"
              data-active={isExpanded ? 'true' : 'false'}
              aria-label={`${props.title} separate sides`}
              onClick={() => setIsExpanded(true)}
            >
              <span className="rve-box-model-mode-grid">
                <span />
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </div>
      {isExpanded ? (
        <div className="rve-box-model-grid-wrap">
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
        </div>
      ) : null}
    </section>
  );
}
