import { LengthInput, Section } from '../common';

export function SizeSection(props: { values: Record<string, string>; onChange: (property: string, value: string) => void }) {
  return (
    <Section title="Size">
      <div className="rve-grid">
        <LengthInput label="W" value={props.values['width']} onChange={(value) => props.onChange('width', value)} />
        <LengthInput label="H" value={props.values['height']} onChange={(value) => props.onChange('height', value)} />
        <LengthInput label="Min W" value={props.values['min-width']} onChange={(value) => props.onChange('min-width', value)} />
        <LengthInput label="Min H" value={props.values['min-height']} onChange={(value) => props.onChange('min-height', value)} />
        <LengthInput label="Max W" value={props.values['max-width']} onChange={(value) => props.onChange('max-width', value)} />
        <LengthInput label="Max H" value={props.values['max-height']} onChange={(value) => props.onChange('max-height', value)} />
      </div>
    </Section>
  );
}
