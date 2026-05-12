import { useState } from 'preact/hooks';
import { LengthInput, Section } from '../common';

interface SpacingSectionProps {
  values: Record<string, string>;
  onChange: (property: string, value: string) => void;
}

function SidesEditor(props: {
  title: string;
  linked: boolean;
  values: Record<string, string>;
  prefix: 'padding' | 'margin';
  onToggle: () => void;
  onChange: (property: string, value: string) => void;
}) {
  const top = `${props.prefix}-top`;
  const right = `${props.prefix}-right`;
  const bottom = `${props.prefix}-bottom`;
  const left = `${props.prefix}-left`;

  const updateAll = (value: string) => {
    props.onChange(top, value);
    props.onChange(right, value);
    props.onChange(bottom, value);
    props.onChange(left, value);
  };

  return (
    <div className="rve-grid">
      <div className="rve-spacing-header">
        <span className="rve-label">{props.title}</span>
        <button type="button" className="rve-chip" data-active={props.linked} onClick={props.onToggle}>
          {props.linked ? 'Linked' : 'Split'}
        </button>
      </div>
      {props.linked ? (
        <LengthInput label={`${props.title} all`} value={props.values[top]} onChange={updateAll} />
      ) : (
        <div className="rve-four-up">
          <LengthInput label="Top" value={props.values[top]} onChange={(value) => props.onChange(top, value)} />
          <LengthInput label="Right" value={props.values[right]} onChange={(value) => props.onChange(right, value)} />
          <LengthInput label="Bottom" value={props.values[bottom]} onChange={(value) => props.onChange(bottom, value)} />
          <LengthInput label="Left" value={props.values[left]} onChange={(value) => props.onChange(left, value)} />
        </div>
      )}
    </div>
  );
}

export function SpacingSection(props: SpacingSectionProps) {
  const [paddingLinked, setPaddingLinked] = useState(true);
  const [marginLinked, setMarginLinked] = useState(true);

  return (
    <Section title="Spacing">
      <div className="rve-grid">
        <SidesEditor
          title="Padding"
          linked={paddingLinked}
          values={props.values}
          prefix="padding"
          onToggle={() => setPaddingLinked((value) => !value)}
          onChange={props.onChange}
        />
        <SidesEditor
          title="Margin"
          linked={marginLinked}
          values={props.values}
          prefix="margin"
          onToggle={() => setMarginLinked((value) => !value)}
          onChange={props.onChange}
        />
      </div>
    </Section>
  );
}
