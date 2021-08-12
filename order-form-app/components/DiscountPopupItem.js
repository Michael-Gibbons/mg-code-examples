import React, {useCallback, useState, useEffect} from 'react';
import {ButtonGroup, FormLayout, TextField, Button, Popover, Badge} from '@shopify/polaris';

export default function DiscountPopupItem({ updateLineItemDiscount, originalItem }) {
    const [popoverActive, setPopoverActive] = useState(false);
    const [currentPrefix, setCurrentPrefix] = useState('$');
    const [currentSuffix, setCurrentSuffix] = useState('');
    const [valueType, setValueType] = useState('FIXED_AMOUNT');
    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const [description, setDescription] = useState('');
    const [disabled, setDisabled] = useState(false);
    const handleChange = useCallback((newValue) => setValue(newValue), []);
    const handleDescriptionChange = useCallback((description) => setDescription(description), []);

    const togglePopoverActive = useCallback(() => {
      setPopoverActive(!popoverActive);
      setError('');
    }, [popoverActive]);

    const isDisabled = () => {
      setDisabled(!!originalItem.disableLineItemDiscounts);
    }

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
      if (!validateForm()) {
        return;
      }

      const discountObject = {
        value: parseFloat(value),
        valueType: valueType,
        description: description,
      };
      updateLineItemDiscount(discountObject, originalItem);
      togglePopoverActive();
    };

    const getFormattedDiscount = (lineItem) => {
      if (!lineItem.appliedDiscount || !lineItem.appliedDiscount.value) {
        return null;
      }

      if (lineItem.appliedDiscount.valueType === 'FIXED_AMOUNT') {
        return '-$' + parseFloat(lineItem.appliedDiscount.value).toFixed(2);
      }

      if (lineItem.appliedDiscount.valueType === 'PERCENTAGE'){
        return '-' + lineItem.appliedDiscount.value + '%';
      }

      return null;
    };

    useEffect(() => {
      isDisabled();
    }, [JSON.stringify(originalItem)]);

    const activator = (
      <Button plain onClick={togglePopoverActive} disabled={disabled}>
        Add Item Discount
        {originalItem.appliedDiscount && originalItem.appliedDiscount.value ? (
          <Badge>{getFormattedDiscount(originalItem)}</Badge>
        ) : null}
      </Button>
    );

    return (
      <Popover
        active={popoverActive}
        activator={activator}
        onClose={togglePopoverActive}
        ariaHaspopup={false}
        sectioned
      >
        <FormLayout>
          <TextField
            label="Discount this item by"
            connectedLeft={
              <ButtonGroup segmented>
                <Button onClick={ () => handleButtonPress('$') }>$</Button>
                <Button onClick={ () => handleButtonPress('%') }>%</Button>
              </ButtonGroup>
            }
            prefix={currentPrefix}
            suffix={currentSuffix}
            value={value}
            onChange={handleChange}
            error={error}
          />
          <TextField
            label="Reason"
            placeholder="Damaged item, loyalty discount"
            onChange={handleDescriptionChange}
            value={description}
            ></TextField>
          <ButtonGroup fullWidth={true}>
            <Button onClick={togglePopoverActive}>Cancel</Button>
            <Button primary onClick={submitEdit}>Apply</Button>
          </ButtonGroup>
        </FormLayout>
      </Popover>
    );
}
