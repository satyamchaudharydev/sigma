import { ColorPicker, LengthInput, Section, SelectField, SliderField, ToggleGroup } from '../common';
import { parseUnitValue } from '../../core/utils';

export function TypographySection(props: { values: Record<string, string>; onChange: (property: string, value: string) => void }) {
  const fontSize = parseUnitValue(props.values['font-size']).value ?? 16;

  return (
    <Section title="Typography">
      <div className="rve-grid">
        <label className="rve-field">
          <span className="rve-label">Font family</span>
          <input className="rve-input" value={props.values['font-family']} onInput={(event) => props.onChange('font-family', (event.currentTarget as HTMLInputElement).value)} />
        </label>
        <SliderField label="Font size" value={fontSize} min={8} max={96} onChange={(value) => props.onChange('font-size', `${value}px`)} />
        <SelectField
          label="Font weight"
          value={props.values['font-weight'] || '400'}
          options={['100', '200', '300', '400', '500', '600', '700', '800', '900'].map((value) => ({ label: value, value }))}
          onChange={(value) => props.onChange('font-weight', value)}
        />
        <LengthInput label="Line height" value={props.values['line-height']} keywords={['normal']} onChange={(value) => props.onChange('line-height', value)} />
        <LengthInput label="Letter spacing" value={props.values['letter-spacing']} keywords={['normal']} onChange={(value) => props.onChange('letter-spacing', value)} />
        <ToggleGroup
          label="Text align"
          value={props.values['text-align'] || 'left'}
          options={[
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
            { label: 'Justify', value: 'justify' }
          ]}
          onChange={(value) => props.onChange('text-align', value)}
        />
        <ColorPicker label="Color" value={props.values['color']} onChange={(value) => props.onChange('color', value)} />
      </div>
    </Section>
  );
}
