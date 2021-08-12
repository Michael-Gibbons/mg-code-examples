import React, {useCallback, useState} from 'react';
import {ButtonGroup, FormLayout, Button, Popover} from '@shopify/polaris';
import {ChoiceList} from '@shopify/polaris';
import { useDispatch } from 'react-redux';
import { setShippingLine } from '../store/actions';

export default function ShippingPopup({ draftOrderOutput }) {
    const dispatch = useDispatch();

    const [popoverActive, setPopoverActive] = useState(false);
    const [selected, setSelected] = useState(['hidden']);

    const handleChange = useCallback((value) => setSelected(value), []);

    const togglePopoverActive = useCallback(
      () => setPopoverActive((popoverActive) => !popoverActive),
      [],
    );

    const getShippingRates = () => {
      if(Object.entries(draftOrderOutput).length > 0){
        const rates = draftOrderOutput.draftOrderCalculate.calculatedDraftOrder.availableShippingRates;
        const rateChoices = rates.map( rate => ({label: rate.title + ' - ' + '$' + parseFloat(rate.price.amount).toFixed(2) , value: rate.handle}));
        if (!selected) {
          setSelected(rateChoices[0].handle);
        }
        return rateChoices;
      }
    }
    const renderChoiceList = () => {
      if(Object.entries(draftOrderOutput).length > 0){
        return (
          <ChoiceList
          title="Select Shipping Rate"
          choices={getShippingRates()}
          selected={selected}
          onChange={handleChange}
        />
        );
      }else{
        return (<div>Please select products and shipping address</div>)
      }
    }
    const submitEdit = () => {
      if(Object.entries(draftOrderOutput).length > 0){
        const rates = draftOrderOutput.draftOrderCalculate.calculatedDraftOrder.availableShippingRates;
        const selectedRate = rates.find(rate => rate.handle === selected[0]);
        if (!selectedRate) {
          return;
        }
        const orderFormRateObject = {
          price: selectedRate.price.amount,
          shippingRateHandle: selectedRate.handle,
          title: selectedRate.title
        };
        dispatch(setShippingLine(orderFormRateObject));
      }
      togglePopoverActive();
    }


    const activator = (
      <Button plain onClick={togglePopoverActive}>
        Shipping
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
          {renderChoiceList()}
          <ButtonGroup fullWidth={true}>
            <Button onClick = {togglePopoverActive}>Cancel</Button>
            <Button primary onClick = {submitEdit}>Apply</Button>
          </ButtonGroup>
        </FormLayout>
      </Popover>
    );
}