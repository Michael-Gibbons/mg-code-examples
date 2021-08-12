import {useCallback, useState } from 'react';
import {Card, TextStyle} from '@shopify/polaris';
import CustomerBillingEditModal from './CustomerBillingEditModal';

export default function CustomerBillingAddress({ updateMasterBillingAddress, currentShippingAddress, currentBillingAddress}) {
  const [active, setActive] = useState(false);
  const modalToggle = useCallback(() => setActive(!active), [active]);
  const updateAddress = useCallback((newAddress) => {
    updateMasterBillingAddress(newAddress);
    modalToggle();
  });

  if(Object.entries(currentShippingAddress).sort().toString() === Object.entries(currentBillingAddress).sort().toString()){
    return (
      <Card.Section title="Billing Address" actions={[{content: 'Edit', onAction: modalToggle}]}>
      <TextStyle variation="subdued">
        <div>Same as shipping address. </div>
      </TextStyle>
      <CustomerBillingEditModal active={active} modalToggle={modalToggle} updateAddress={updateAddress} lastSavedAddress={currentBillingAddress}></CustomerBillingEditModal>
    </Card.Section>
    );
  }

  const { firstName, lastName, company, address1, address2, city, provinceCode, zip, country, phone } = currentBillingAddress;

  return (
    <Card.Section title="Billing Address" actions={[{content: 'Edit', onAction: modalToggle}]}>
    <TextStyle variation="subdued">
      <div>{firstName} {lastName}</div>
      <div>{company}</div>
      <div>{address1}</div>
      <div>{address2}</div>
      <div>{city} { provinceCode } {zip}</div>
      <div>{country }</div>
      <div>{phone}</div>
    </TextStyle>
    <CustomerBillingEditModal active={active} modalToggle={modalToggle} updateAddress={updateAddress} lastSavedAddress={currentBillingAddress}></CustomerBillingEditModal>
    </Card.Section>
  );
}