import type { ComponentChildren } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { colorStringToHex, parseUnitValue, stringifyUnitValue } from '../core/utils';

export function Section(props: { title: string; children: ComponentChildren }) {
  return (
    <section className="rve-section">
      <h3>{props.title}</h3>
      {props.children}
    </section>
  );
}

export function Field(props: { label: string; children: ComponentChildren; help?: string }) {
  return (
    <label className="rve-field">
      <span className="rve-label">{props.label}</span>
      {props.children}
      {props.help ? <span className="rve-help-text">{props.help}</span> : null}
    </label>
  );
}

export function LengthInput(props: {
  label: string;
  value: string;
  units?: string[];
  keywords?: string[];
  onChange: (value: string) => void;
}) {
  const units = props.units ?? ['px', '%', 'rem', 'em', 'vh', 'vw'];
  const keywords = props.keywords ?? ['auto'];
  const parsed = useMemo(() => parseUnitValue(props.value), [props.value]);
  const [numberValue, setNumberValue] = useState<string>(parsed.value === null ? '' : String(parsed.value));
  const [unitValue, setUnitValue] = useState<string>(parsed.keyword ?? parsed.unit);

  useEffect(() => {
    setNumberValue(parsed.value === null ? '' : String(parsed.value));
    setUnitValue(parsed.keyword ?? parsed.unit);
  }, [parsed.keyword, parsed.unit, parsed.value]);

  const usingKeyword = Boolean(parsed.keyword && keywords.includes(parsed.keyword));
  const useRawText = parsed.value === null && !parsed.keyword && Boolean(props.value.trim());

  if (useRawText) {
    return (
      <Field label={props.label} help="Using raw CSS value because the current value is not a simple number + unit.">
        <input className="rve-input" value={props.value} onInput={(event) => props.onChange((event.currentTarget as HTMLInputElement).value)} />
      </Field>
    );
  }

  return (
    <Field label={props.label}>
      <div className="rve-field-row">
        <input
          className="rve-input"
          type="number"
          step="0.1"
          value={usingKeyword ? '' : numberValue}
          disabled={usingKeyword}
          onInput={(event) => {
            const next = (event.currentTarget as HTMLInputElement).value;
            setNumberValue(next);
            props.onChange(next ? stringifyUnitValue(Number(next), parsed.unit || 'px') : '');
          }}
        />
        <select
          className="rve-select rve-select-compact"
          value={unitValue}
          onChange={(event) => {
            const next = (event.currentTarget as HTMLSelectElement).value;
            setUnitValue(next);
            if (keywords.includes(next)) {
              props.onChange(next);
              return;
            }
            const numeric = numberValue ? Number(numberValue) : parsed.value;
            props.onChange(stringifyUnitValue(numeric ?? 0, next));
          }}
        >
          {units.map((unit) => (
            <option value={unit}>{unit}</option>
          ))}
          {keywords.map((keyword) => (
            <option value={keyword}>{keyword}</option>
          ))}
        </select>
      </div>
    </Field>
  );
}

export function SelectField(props: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={props.label}>
      <select className="rve-select" value={props.value} onChange={(event) => props.onChange((event.currentTarget as HTMLSelectElement).value)}>
        {props.options.map((option) => (
          <option value={option.value}>{option.label}</option>
        ))}
      </select>
    </Field>
  );
}

export function SliderField(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={props.label}>
      <div className="rve-field-row">
        <input
          className="rve-input"
          type="range"
          min={props.min}
          max={props.max}
          step={props.step ?? 1}
          value={props.value}
          onInput={(event) => props.onChange(Number((event.currentTarget as HTMLInputElement).value))}
        />
        <input
          className="rve-input"
          type="number"
          value={props.value}
          step={props.step ?? 1}
          onInput={(event) => props.onChange(Number((event.currentTarget as HTMLInputElement).value))}
        />
      </div>
    </Field>
  );
}

export function ToggleGroup(props: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={props.label}>
      <div className="rve-tab-strip">
        {props.options.map((option) => (
          <button type="button" className="rve-chip" data-active={option.value === props.value} onClick={() => props.onChange(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
    </Field>
  );
}

export function ColorPicker(props: { label: string; value: string; onChange: (value: string) => void }) {
  const [rawValue, setRawValue] = useState(props.value);

  useEffect(() => {
    setRawValue(props.value);
  }, [props.value]);

  return (
    <Field label={props.label}>
      <div className="rve-field-row">
        <input
          className="rve-color-input"
          type="color"
          value={colorStringToHex(props.value)}
          onInput={(event) => {
            const next = (event.currentTarget as HTMLInputElement).value;
            setRawValue(next);
            props.onChange(next);
          }}
        />
        <input
          className="rve-input"
          value={rawValue}
          onInput={(event) => {
            const next = (event.currentTarget as HTMLInputElement).value;
            setRawValue(next);
            props.onChange(next);
          }}
        />
      </div>
    </Field>
  );
}
