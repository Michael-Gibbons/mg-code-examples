
import { Card } from '@shopify/polaris';
import CustomerEmailEditModal from './CustomerEmailEditModal';
import CustomerShippingAddress from './CustomerShippingAddress';
import CustomerBillingAddress from './CustomerBillingAddress';
import CustomerReferredFrom from './CustomerReferredFrom';

const CustomerInformation = ({ customer, updateUserEmail, currentShippingAddress, currentBillingAddress, currentUserEmail, currentReferredFrom, updateMasterBillingAddress, updateMasterShippingAddress, updateReferredFrom}) => {
  return(
    <Card>
      <CustomerEmailEditModal
        customer={customer}
        updateUserEmail={updateUserEmail}
        currentUserEmail={currentUserEmail}
      ></CustomerEmailEditModal>
      <CustomerShippingAddress
        updateMasterShippingAddress={updateMasterShippingAddress}
        currentShippingAddress={currentShippingAddress}
        currentBillingAddress={currentBillingAddress}
      ></CustomerShippingAddress>
      <CustomerBillingAddress
        updateMasterBillingAddress={updateMasterBillingAddress}
        currentShippingAddress={currentShippingAddress}
        currentBillingAddress={currentBillingAddress}
      ></CustomerBillingAddress>
      <CustomerReferredFrom
        updateReferredFrom={updateReferredFrom}
        currentReferredFrom={currentReferredFrom}
      ></CustomerReferredFrom>
    </Card>
  );
};

export default CustomerInformation;