import React, {useCallback, useState} from 'react';
import {Checkbox, ButtonGroup, FormLayout, Button, Popover} from '@shopify/polaris';
import { useDispatch } from 'react-redux';
import { toggleTaxExempt } from '../store/actions';

export default function TaxesPopup({ exempt }) {
    const dispatch = useDispatch();

    const [popoverActive, setPopoverActive] = useState(false);
    const [checked, setChecked] = useState(!exempt);

    const handleChange = useCallback((newChecked) => setChecked(newChecked), []);

    const togglePopoverActive = useCallback(
      () => setPopoverActive((popoverActive) => !popoverActive),
      []
    );

    const submitEdit = () => {
      dispatch(toggleTaxExempt(!checked));
      togglePopoverActive();
    }


    const activator = (
      <Button plain onClick={togglePopoverActive}>
        Taxes
      </Button>
    );

    return(
      <Popover
        active={popoverActive}
        activator={activator}
        onClose={togglePopoverActive}
        ariaHaspopup={false}
        sectioned
      >
        <FormLayout>
          <Checkbox
            label="Charge Taxes"
            checked={checked}
            onChange={handleChange}
          />
          <ButtonGroup fullWidth={true}>
            <Button onClick = {togglePopoverActive}>Cancel</Button>
            <Button primary onClick = {submitEdit}>Apply</Button>
          </ButtonGroup>
        </FormLayout>
      </Popover>
    );
}