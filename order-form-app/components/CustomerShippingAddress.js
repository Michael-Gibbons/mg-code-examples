import {useCallback, useState } from 'react';
import {Card, TextStyle} from '@shopify/polaris';
import CustomerShippingEditModal from './CustomerShippingEditModal';

export default function CustomerShippingAddress({ updateMasterShippingAddress, currentShippingAddress }) {
  const [active, setActive] = useState(false);
  const modalToggle = useCallback(() => setActive(!active), [active]);
  const updateAddress = useCallback((newAddress) => {
    updateMasterShippingAddress(newAddress);
    modalToggle();
  });

  const { firstName, lastName, company, address1, address2, city, provinceCode, zip, country, phone } = currentShippingAddress;

  return (
    <Card.Section title="Shipping Address" actions={[{content: 'Edit', onAction: modalToggle}]}>
      <TextStyle variation="subdued">
        <div>{firstName} {lastName}</div>
        <div>{company}</div>
        <div>{address1}</div>
        <div>{address2}</div>
        <div>{city} { provinceCode } {zip}</div>
        <div>{country}</div>
        <div>{phone}</div>
      </TextStyle>
      <CustomerShippingEditModal active={active}  modalToggle={modalToggle} updateAddress={updateAddress} lastSavedAddress={currentShippingAddress}></CustomerShippingEditModal>
    </Card.Section>
  );
}