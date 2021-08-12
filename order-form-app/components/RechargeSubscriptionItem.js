import {useState, useCallback, useEffect } from 'react';
import {useSelector, shallowEqual} from 'react-redux';
import {Stack, TextField, Select} from '@shopify/polaris';
import store from 'store-js';
import { getLineItems } from '../store/selectors';
import { setLineItems } from '../store/actions';

export default function RechargeSubscriptionItem ({calculatedItem, originalItem}) {
  const lineItems = useSelector(getLineItems, shallowEqual);

  const [orderInterval, setOrderInterval] = useState('1');
  const [orderUnit, setOrderUnit] = useState('month');
  useEffect(() => {
    seedDropdowns();
  }, [originalItem]);

  const seedDropdowns = () => {
    const { order_interval_frequency = '1', order_interval_unit = 'month' } = originalItem;
    setOrderInterval(order_interval_frequency);
    setOrderUnit(order_interval_unit);
  }

  const handleOrderUnitChange = useCallback((value) => {
    let lineItemsCopy = [...lineItems];
    let currentItem = lineItemsCopy.find((subItem)=>subItem.id === originalItem.id);
    let currentItemIndex = lineItemsCopy.findIndex((subItem)=>subItem.id === originalItem.id);
    lineItemsCopy.splice(currentItemIndex,1);
    currentItem.order_interval_unit = value;
    lineItemsCopy.push(currentItem);
    setOrderUnit(value)
    setLineItems(lineItemsCopy)
  }, []);

  const handleOrderIntervalChange = useCallback((value) =>{
    let lineItemsCopy = [...lineItems];
    let currentItem = lineItemsCopy.find((subItem)=>subItem.handle === originalItem.handle);
    let currentItemIndex = lineItemsCopy.findIndex((subItem)=>subItem.handle === originalItem.handle);
    lineItemsCopy.splice(currentItemIndex,1);
    currentItem.order_interval_frequency = value;
    currentItem.charge_interval_frequency = value;
    lineItemsCopy.push(currentItem);
    setLineItems(lineItemsCopy);
    console.log(lineItemsCopy);
    setOrderUnit(value)
    setOrderInterval(value)}, []);

  return (
    <div style={{margin:"15px 0"}}>
    <Stack alignment='center'>
    <Stack.Item>Deliver Every </Stack.Item>
    <Stack.Item>
      <div style={{width:'5em'}}>
        <TextField
          value={orderInterval}
          onChange={handleOrderIntervalChange}
        ></TextField>
      </div>
    </Stack.Item>
    <Stack.Item>
        <Select options={[
          {label: 'Days', value: 'day'},
          {label: 'Weeks', value: 'week'},
          {label: 'Months', value: 'month'},
        ]}
        value={orderUnit}
        onChange={handleOrderUnitChange}
        >
        </Select>
      </Stack.Item>
  </Stack>
  </div>
  )
}