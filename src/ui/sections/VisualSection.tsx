import { useMemo } from 'preact/hooks';
import { parseBoxShadow, stringifyBoxShadow } from '../../core/styles';
import { parseUnitValue } from '../../core/utils';
import { ColorPicker, LengthInput, Section, SelectField, SliderField } from '../common';

export function VisualSection(props: { values: Record<string, string>; onChange: (property: string, value: string) => void }) {
  const opacity = Number.parseFloat(props.values['opacity'] || '1') || 1;
  const radius = parseUnitValue(props.values['border-radius']).value ?? 0;
  const shadow = useMemo(() => parseBoxShadow(props.values['box-shadow']), [props.values]);

  return (
    <Section title="Visual">
      <div className="rve-grid">
        <ColorPicker label="Background" value={props.values['background-color']} onChange={(value) => props.onChange('background-color', value)} />
        <SliderField label="Border radius" value={radius} min={0} max={64} onChange={(value) => props.onChange('border-radius', `${value}px`)} />
        <SliderField label="Opacity" value={opacity} min={0} max={1} step={0.01} onChange={(value) => props.onChange('opacity', String(value))} />
        <div className="rve-grid">
          <span className="rve-label">Box shadow</span>
          <div className="rve-shadow-grid">
            <LengthInput label="X" value={shadow.offsetX} onChange={(value) => props.onChange('box-shadow', stringifyBoxShadow({ ...shadow, offsetX: value }))} />
            <LengthInput label="Y" value={shadow.offsetY} onChange={(value) => props.onChange('box-shadow', stringifyBoxShadow({ ...shadow, offsetY: value }))} />
            <LengthInput label="Blur" value={shadow.blur} onChange={(value) => props.onChange('box-shadow', stringifyBoxShadow({ ...shadow, blur: value }))} />
            <LengthInput label="Spread" value={shadow.spread} onChange={(value) => props.onChange('box-shadow', stringifyBoxShadow({ ...shadow, spread: value }))} />
          </div>
          <ColorPicker label="Shadow color" value={shadow.color} onChange={(value) => props.onChange('box-shadow', stringifyBoxShadow({ ...shadow, color: value }))} />
        </div>
        <div className="rve-grid">
          <span className="rve-label">Border</span>
          <div className="rve-border-grid">
            <LengthInput label="Width" value={props.values['border-width']} onChange={(value) => props.onChange('border-width', value)} />
            <SelectField
              label="Style"
              value={props.values['border-style'] || 'solid'}
              options={['none', 'solid', 'dashed', 'dotted', 'double'].map((value) => ({ label: value, value }))}
              onChange={(value) => props.onChange('border-style', value)}
            />
          </div>
          <ColorPicker label="Border color" value={props.values['border-color']} onChange={(value) => props.onChange('border-color', value)} />
        </div>
      </div>
    </Section>
  );
}
