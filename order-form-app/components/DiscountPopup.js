import React, {useCallback, useState, useEffect} from 'react';
import {ButtonGroup, FormLayout, TextField, Button, Popover} from '@shopify/polaris';
import { isSubscription } from '../lib/variants';
import { useDispatch, shallowEqual, useSelector } from 'react-redux';
import { setAppliedDiscount } from '../store/actions';
import { getLineItems } from '../store/selectors';

export default function DiscountPopup( { draftOrderOutput, disableOrderDiscount }) {
    const dispatch = useDispatch();
    const lineItems = useSelector(getLineItems, shallowEqual);
    const [popoverActive, setPopoverActive] = useState(false);
    const [currentPrefix, setCurrentPrefix] = useState('$');
    const [currentSuffix, setCurrentSuffix] = useState('');
    const [valueType, setValueType] = useState('FIXED_AMOUNT');
    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const [description, setDescription] = useState('');
    const handleChange = useCallback((newValue) => setValue(newValue), []);
    const handleDescriptionChange = useCallback((description) => setDescription(description), []);
    const [disabled, setDisabled] = useState(false);

    const togglePopoverActive = useCallback(
      () => {
        setPopoverActive((popoverActive) => !popoverActive)
        setError('');
      },
      [],
    );

    const handleButtonPress = (char) => {
      if(char == '$'){
        setCurrentPrefix('$');
        setCurrentSuffix('');
        setValueType('FIXED_AMOUNT');
      }else{
        setCurrentPrefix('');
        setCurrentSuffix('%');
        setValueType('PERCENTAGE');
      }
    }

    const validateForm = () => {
      if(isNaN(parseFloat(value))){
        setError("Discount amount must be a number.")
        return false
      }
      return true;
    }

    const submitEdit = () => {
      if(validateForm()){
        const discountObject = {
          value: parseFloat(value),
          valueType: valueType,
          description: description
        }
        dispatch(setAppliedDiscount(discountObject));
        togglePopoverActive();
      }
    }

    const isDisabled = () => {
      let isSub = lineItems.some((item) => isSubscription(item));
      setDisabled(isSub);
    }

    useEffect(() => {
      isDisabled();
    }, [draftOrderOutput]);

    const activator = (
      <Button plain onClick={togglePopoverActive} disabled={disabled || disableOrderDiscount}>
        Add Order Discount
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
          <TextField
            label="Discount this order by"
            helpText="Order discounts are ignored for subscription orders."
            connectedLeft = {
              <ButtonGroup segmented>
                <Button onClick = { () => handleButtonPress('$') }>$</Button>
                <Button onClick = { () => handleButtonPress('%') }>%</Button>
              </ButtonGroup>
            }
            prefix = {currentPrefix}
            suffix = {currentSuffix}
            value = {value}
            onChange = {handleChange}
            error={error}
          />
          <TextField
            label="Reason"
            placeholder="Damaged item, loyalty discount"
            onChange = {handleDescriptionChange}
            value = {description}
            ></TextField>
          <ButtonGroup fullWidth={true}>
            <Button onClick = {togglePopoverActive}>Cancel</Button>
            <Button primary onClick = {submitEdit}>Apply</Button>
          </ButtonGroup>
        </FormLayout>
      </Popover>
    );
}
