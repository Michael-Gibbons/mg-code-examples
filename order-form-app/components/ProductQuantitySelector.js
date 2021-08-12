import React, {useCallback, useState, useEffect} from 'react';
import {TextField } from '@shopify/polaris';
import { mapQuantityToVariant } from '../lib/variants';

export default function ProductQuantitySelector({lineItems, lineItem ,updateLineItems }) {
  const [value, setValue] = useState(lineItem.quantity ? lineItem.quantity.toString() : '1');
  useEffect(() => {
    submitEdit();
  }, [value]);

  useEffect(() => {
    if(lineItem && lineItem.quantity &&  lineItem.quantity !== parseInt(value)){
      setValue(lineItem.quantity.toString() || '1');
    }
  },[JSON.stringify(lineItem)]);

  const submitEdit = useCallback(() => {
      const updatedItems = [...lineItems];
      if(!lineItem || !lineItem.customAttributes || !updatedItems.length){return}
      const itemToUpdate = updatedItems.findIndex(updateItem => lineItem.customAttributes.find(item => item.key === 'id').value === updateItem.customAttributes.find(item => item.key === 'id').value);
      updatedItems[itemToUpdate].quantity = parseInt(value);
      updatedItems[itemToUpdate] = mapQuantityToVariant(updatedItems[itemToUpdate]);
      updateLineItems(updatedItems);
  }, [JSON.stringify(lineItem), value]);

  return (
    <div style = {{'width': '5em'}}>
      <TextField
        type="number"
        min = {1}
        value={value}
        onChange={setValue}
        disabled={lineItem.singular}
      />
    </div>
  )
}
