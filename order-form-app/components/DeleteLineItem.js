import {Button} from '@shopify/polaris';
import {useCallback, useState, useEffect} from 'react';
import { useDispatch, shallowEqual, useSelector } from 'react-redux';
import { getLineItems, getDraftOrderOutput } from '../store/selectors';
import { setLineItems, clearDraftOrderOutput } from '../store/actions';

export default function DeleteLineItem({lineItem}){
  const dispatch = useDispatch();
  const lineItems = useSelector(getLineItems, shallowEqual);
  const [disabled, setDisabled] = useState(false);
  useEffect(() => {
    if(lineItem.id && lineItem.id.includes('--SPLIT')){
      setDisabled(true);
      return
    }
    setDisabled(false);
    return
  },[JSON.stringify(lineItem)])
  const deleteItem = useCallback(() => {
    const updatedItems = [...lineItems];
    if(!lineItem || !lineItem.customAttributes || !updatedItems.length){return}
    const itemToDelete = updatedItems.findIndex(updateItem => lineItem.customAttributes.find(item => item.key === 'id').value === updateItem.customAttributes.find(item => item.key === 'id').value);
    updatedItems.splice(itemToDelete, 1);
    if(!updatedItems.length){
      dispatch(clearDraftOrderOutput());
    }
    dispatch(setLineItems(updatedItems));
  });
  return(
    <Button plain destructive={true} onClick={deleteItem} > X </Button>//TODO: maybe set disabled here?
  )
}