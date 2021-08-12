import {useCallback, useState} from 'react';
import { useDispatch } from 'react-redux';
import {Card, Select} from '@shopify/polaris';
import { setReferredFrom } from '../store/actions';

export default function CustomerReferredFrom({ updateReferredFrom, currentReferredFrom }) {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState('');
  
  const handleSelectChange = useCallback((value) => {
    updateReferredFrom(value)
    dispatch(setReferredFrom(value));
    setSelected(value);
  });

  const options = [
    {label: 'Select an option...', value: ''},
    {label: 'Healthcare Provider', value: 'Healthcare Provider'},
    {label: 'Internet/social media', value: 'Internet/social media'},
    {label: 'Friend/family', value: 'Friend/family'},
    {label: 'Other', value: 'Other'},
  ];

  return (
    <Card.Section title="Referred from">
      <Select
        label="How did you hear about us?"
        options={options}
        onChange={handleSelectChange}
        value={selected}
      />
    </Card.Section>
  );
}