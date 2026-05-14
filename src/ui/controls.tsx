import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { colorStringToHex, parseUnitValue } from '../core/utils';

export function toOption(value: string, label = capitalize(value)): { value: string; label: string } {
  return { value, label };
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function stripUnit(value: string, unit: string): string {
  return value.trim().replace(new RegExp(`${unit}$`, 'i'), '') || '0';
}

export function TextControl(props: { value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean }) {
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

export function SimpleSelect(props: {
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

export function SegmentedControl(props: {
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

export function DualControlRow(props: { children: ComponentChildren }) {
  return <div className="rve-dual-control">{props.children}</div>;
}

export function IconGhost(props: { children: ComponentChildren }) {
  return <span className="rve-icon-ghost">{props.children}</span>;
}

export function InlineNumberWithIcon(props: { icon: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="rve-inline-with-icon">
      <span className="rve-icon-ghost">{props.icon}</span>
      <InlineNumberWithUnit value={props.value} unit="px" onChange={props.onChange} />
    </div>
  );
}

export function InlineNumberWithUnit(props: { value: string; unit: string; onChange: (value: string) => void; disabled?: boolean }) {
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

export function ColorTextControl(props: { value: string; onChange: (value: string) => void }) {
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

export function InspectorSection(props: { title: string; children: ComponentChildren; action?: string }) {
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

export function CollapsibleSection(props: { title: string; children: ComponentChildren; collapsed: boolean; onToggle: () => void }) {
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

export function InspectorRow(props: { label: string; children: ComponentChildren; leading?: string }) {
  return (
    <div className="rve-inspector-row">
      <div className="rve-inspector-label">
        {props.leading ? <span className="rve-inspector-leading">{props.leading}</span> : null}
        <span>{props.label}</span>
      </div>
      <div className="rve-inspector-control">{props.children}</div>
    </div>
  );
}

export function DualFieldRow(props: {
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
