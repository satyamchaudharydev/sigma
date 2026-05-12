import { LengthInput, Section, SelectField, ToggleGroup } from '../common';

export function LayoutSection(props: { values: Record<string, string>; onChange: (property: string, value: string) => void }) {
  const display = props.values['display'];
  const isFlex = display === 'flex' || display === 'inline-flex';
  const isGrid = display === 'grid' || display === 'inline-grid';

  return (
    <Section title="Layout">
      <div className="rve-grid">
        <SelectField
          label="Display"
          value={display}
          options={[
            { label: 'Block', value: 'block' },
            { label: 'Flex', value: 'flex' },
            { label: 'Grid', value: 'grid' },
            { label: 'Inline', value: 'inline' },
            { label: 'None', value: 'none' }
          ]}
          onChange={(value) => props.onChange('display', value)}
        />
        {isFlex ? (
          <>
            <ToggleGroup
              label="Direction"
              value={props.values['flex-direction'] || 'row'}
              options={[
                { label: 'Row', value: 'row' },
                { label: 'Column', value: 'column' }
              ]}
              onChange={(value) => props.onChange('flex-direction', value)}
            />
            <ToggleGroup
              label="Wrap"
              value={props.values['flex-wrap'] || 'nowrap'}
              options={[
                { label: 'No wrap', value: 'nowrap' },
                { label: 'Wrap', value: 'wrap' }
              ]}
              onChange={(value) => props.onChange('flex-wrap', value)}
            />
            <SelectField
              label="Align"
              value={props.values['align-items'] || 'stretch'}
              options={['stretch', 'flex-start', 'center', 'flex-end', 'baseline'].map((value) => ({ label: value, value }))}
              onChange={(value) => props.onChange('align-items', value)}
            />
            <SelectField
              label="Justify"
              value={props.values['justify-content'] || 'flex-start'}
              options={['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'].map((value) => ({ label: value, value }))}
              onChange={(value) => props.onChange('justify-content', value)}
            />
          </>
        ) : null}
        {(isFlex || isGrid) ? <LengthInput label="Gap" value={props.values['gap']} onChange={(value) => props.onChange('gap', value)} /> : null}
      </div>
    </Section>
  );
}
