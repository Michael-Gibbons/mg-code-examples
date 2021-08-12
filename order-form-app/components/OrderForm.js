import { Layout, Page, Card, Frame, Loading, Banner } from '@shopify/polaris';
import {useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from 'react-apollo';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import store from 'store-js';
import { isSubscription } from '../lib/variants';
import { Redirect } from '@shopify/app-bridge/actions';
import { Context } from '@shopify/app-bridge-react';

import OrderActionTable from './OrderActionTable';
import ProductResourcePicker from './ProductResourcePicker';
import OrderNotes from './OrderNotes';
import CustomerInformation from './CustomerInformation';
import DRAFT_ORDER_CALCULATE from './GQL_DRAFT_ORDER_CALCULATE';
import DRAFT_ORDER_CREATE from './GQL_DRAFT_ORDER_CREATE';
import CountryRegionData from '../node_modules/country-region-data/data.json';
import AuthorizeCCModal from './AuthorizeCCModal';

import { getBannerError, getCustomerEmail, getSalesforceCustomer, getBillingAddress, getShippingAddress, getReferredFrom, getLineItems, getDraftOrderInput, getDraftOrderOutput, getPaymentModalActive, getAppliedDiscount, getTaxExempt, getShippingLine } from '../store/selectors';
import { setBannerError, setCustomerEmail, setSalesforceCustomer, setBillingAddress, setShippingAddress, setReferredFrom, setLineItems, setDraftOrderOutput, togglePaymentModal, setAppliedDiscount, toggleTaxExempt } from '../store/actions';


const OrderForm = () => {
  const app = useContext(Context);
  const router = useRouter();
  const dispatch = useDispatch();
  const [draftOrderCreatedSuccess, setDraftOrderCreatedSuccess] = useState(false);

  const bannerError = useSelector(getBannerError, shallowEqual);
  const paymentModalActive = useSelector(getPaymentModalActive);
  const customerEmail = useSelector(getCustomerEmail);
  const salesforceCustomer = useSelector(getSalesforceCustomer, shallowEqual);
  const shippingAddress = useSelector(getShippingAddress, shallowEqual);
  const billingAddress = useSelector(getBillingAddress, shallowEqual);
  const referredFrom = useSelector(getReferredFrom);
  const lineItems = useSelector(getLineItems, shallowEqual);
  const appliedDiscount = useSelector(getAppliedDiscount, shallowEqual);
  const draftOrderInput = useSelector(getDraftOrderInput(), shallowEqual);
  const draftOrderInputCreate = useSelector(getDraftOrderInput(true), shallowEqual);
  const draftOrderOutput = useSelector(getDraftOrderOutput, shallowEqual);
  const shippingLine = useSelector(getShippingLine, shallowEqual);
  const taxExempt = useSelector(getTaxExempt);

  useEffect(() => {
    const savedEmail = store.get('customerEmail');
    if (!customerEmail && savedEmail) {
      dispatch(setCustomerEmail(savedEmail));
    }

    const savedSalesforceCustomer = store.get('salesforceCustomer');
    if (!Object.keys(salesforceCustomer).length && savedSalesforceCustomer && Object.keys(savedSalesforceCustomer).length) {
      dispatch(setSalesforceCustomer(savedSalesforceCustomer));
    }

    const savedShippingAddress = store.get('shippingAddress');
    if (!Object.keys(shippingAddress).length && savedShippingAddress && Object.keys(savedShippingAddress).length) {
      dispatch(setShippingAddress(savedShippingAddress));
    }

    const savedBillingAddress = store.get('billingAddress');
    if (!Object.keys(billingAddress).length && savedBillingAddress && Object.keys(savedBillingAddress).length) {
      dispatch(setBillingAddress(savedBillingAddress));
    }

    const savedLineItems = store.get('lineItems');
    if (!lineItems.length && savedLineItems && savedLineItems.length) {
      dispatch(setLineItems(savedLineItems));
    }

    // const savedAppliedDiscount = store.get('appliedDiscount');
    // if (!Object.keys(appliedDiscount).length && savedAppliedDiscount && Object.keys(savedAppliedDiscount).length) {
    //   dispatch(setAppliedDiscount(savedAppliedDiscount));
    // }

    const savedDraftOrderOutput = store.get('draftOrderOutput');
    if (!Object.keys(draftOrderOutput).length && savedDraftOrderOutput && Object.keys(savedDraftOrderOutput).length) {
      dispatch(setDraftOrderOutput(savedDraftOrderOutput));
    }

    const savedTaxExempt = store.get('taxExempt');
    if (!savedTaxExempt) {
      dispatch(toggleTaxExempt(true));
    }
  }, []);

  const redirectToDraftOrder = (data) => {
    if(data && data.draftOrderCreate && data.draftOrderCreate.draftOrder){
      const gid = data.draftOrderCreate.draftOrder.id.replace(/\D/g,'');
      const redirect = Redirect.create(app);
      redirect.dispatch(
        Redirect.Action.ADMIN_PATH,
        `/draft_orders/${gid}`,
      );
    }
  };

  // TODO: rename variables with "calculate" prefix like the create variables, "data" is too general and unclear
  const [ calculate, { data, loading, error }] = useMutation(DRAFT_ORDER_CALCULATE, {
    onCompleted(data) {
      if(data.draftOrderCalculate.userErrors.length){
        console.log(data);
        // TODO: this is not a valid error message, it just discards the actual errors and makes a very specific complaint about the email domain?
        dispatch(setBannerError({title:"Invalid Email", text:"Email contains an invalid domain name"}));
      } else {
        dispatch(setDraftOrderOutput(data));
        setDraftOrderCreatedSuccess(false);
      }
    }
  });

  const [create, {data: createData, loading: createLoading, error: createError}] = useMutation(DRAFT_ORDER_CREATE,{
    onCompleted(data) {
      redirectToDraftOrder(data);
      setDraftOrderCreatedSuccess(true);
    }
  });


  useEffect(() => {
    if (router.query['firstName']) {
      const { firstName, lastName, email, phone, fullMailingAddress, mailingStreet, mailingCity, mailingCountry, mailingState, mailingPostalCode, SFContactID } = router.query;
      const salesforceCustomer = {
        firstName, lastName, email, phone, SFContactID, fullMailingAddress, mailingStreet, mailingCity, mailingCountry, mailingPostalCode, mailingState: mailingState.toUpperCase(),
      };
      const mailingCountryUpperCase = mailingCountry.toUpperCase();
      const mailingCountryObject = CountryRegionData.find(
        country => country.countryName.toUpperCase() === mailingCountryUpperCase || country.countryShortCode.toUpperCase() === mailingCountryUpperCase
      );
      console.log(mailingCountryObject);
      const countryCode = mailingCountryObject.countryShortCode;
      const newShippingAddress = {
        firstName, lastName, phone, countryCode,
        company: '',
        country: mailingCountryObject.countryName,
        address1: mailingStreet,
        address2: '',
        city: mailingCity,
        provinceCode: salesforceCustomer.mailingState.toUpperCase(),
        zip: mailingPostalCode,
      };
      const newBillingAddress = { ...newShippingAddress };
      dispatch(setSalesforceCustomer(salesforceCustomer));
      dispatch(setShippingAddress(newShippingAddress));
      dispatch(setBillingAddress(newBillingAddress));
      dispatch(setCustomerEmail(salesforceCustomer.email));
    }
  }, [router.query]);

  const updateMasterShippingAddress = (newAddress) => {
    const { country: savedCountry = 'United States' } = newAddress;
    const countryCode = CountryRegionData.find(country => country.countryName === savedCountry).countryShortCode;
    dispatch(setShippingAddress({ ...newAddress, countryCode }));
  }

  const updateMasterBillingAddress = (newAddress) => {
    const { country: savedCountry = 'United States' } = newAddress;
    const countryCode = CountryRegionData.find(country => country.countryName === savedCountry).countryShortCode;
    dispatch(setBillingAddress({ ...newAddress, countryCode }));
    console.log(newAddress, billingAddress)
  }

  const updateUserEmail = (newEmail) => {
    dispatch(setBannerError({}));
    dispatch(setCustomerEmail(newEmail));
    dispatch(setSalesforceCustomer({ email: newEmail }));
  }

  const updateReferredFrom = (newReferredFrom) => {
    dispatch(setReferredFrom(newReferredFrom));
  }

  const calculateDraftOrder = () => {
    if (!lineItems.length) {
      return;
    }
    calculate({ variables: { "input": draftOrderInput }});
  }

  const submitDraftOrder = () => {
    dispatch(setBannerError({}));
    if(!customerEmail) {
      dispatch(setBannerError({title: "Email is required", text: "Email is required to create a Shopify order and to save payment information in Authorize.net"}));
      return;
    }
    if(! (billingAddress.firstName.trim() && billingAddress.lastName.trim() && shippingAddress.address1.trim() && shippingAddress.city.trim() && shippingAddress.country && shippingAddress.provinceCode && shippingAddress.zip.trim())) {
      dispatch(setBannerError({title: "Shipping address is required", text: "Shipping first name, last name, address, city, country, state/province, and ZIP/postal code are required"}));
      return;
    }
    if(! (billingAddress.firstName.trim() && billingAddress.lastName.trim() && billingAddress.address1.trim() && billingAddress.city.trim() && billingAddress.country && billingAddress.provinceCode && billingAddress.zip.trim()) ) {
      dispatch(setBannerError({title: "Billing address is required", text: "Billing first name, last name, address, city, country, state/province, and ZIP/postal code are required"}));
      return;
    }
    if(shippingAddress.address1.length > 69) {
      dispatch(setBannerError({title: "Shipping address is too long", text: "Shipping address line 1 should be less than 70 characters"}));
      return;
    }
    if(billingAddress.address1.length > 69) {
      dispatch(setBannerError({title: "Billing address is too long", text: "Billing address line 1 should be less than 70 characters"}));
      return;
    }
    if(!lineItems.length) {
      dispatch(setBannerError({title: "Products are required", text: "At least 1 product is required"}));
      return;
    }
    if(draftOrderInput.shippingLine === undefined) {
      dispatch(setBannerError({title: "Shipping rate is required", text: "Select the shipping rate by clicking \"Shipping\" in the order table"}));
      return;
    }
    const hasSubscription = lineItems.some(item => isSubscription(item));
    if (data && !hasSubscription) {
      create({ variables: { "input": draftOrderInputCreate }});
      resetApp();
    } else if (data && hasSubscription) {
      dispatch(togglePaymentModal(true));
    }
  }

  const showCompletedBanner = () => {
    if(draftOrderCreatedSuccess){
      return (
        <Banner
          title="Your draft order has been created."
          status="success"
          onDismiss={() => {setDraftOrderCreatedSuccess(false)}}
        />
      )
    }
  }

  const showErrorBanner = (error) => {
    if (error && error.title && error.text) {
      return (
        <Banner
          title={error.title}
          status="critical"
          onDismiss={() => dispatch(setBannerError({}))}
        >
          <p>{error.text}</p>
        </Banner>
      );
    }
  }

  const isLoading = (loading) => {
    if (loading) {
      return (
        <Loading />
      );
    }
    return null;
  }

  const resetApp = () => {
    store.remove('customerEmail');
    store.remove('salesforceCustomer');
    store.remove('shippingAddress');
    store.remove('billingAddress');
    store.remove('referredFrom');
    store.remove('lineItems');
    store.remove('appliedDiscount');
    store.remove('taxExempt');
    dispatch(setCustomerEmail(''));
    dispatch(setSalesforceCustomer({}));
    dispatch(setShippingAddress({}));
    dispatch(setBillingAddress({}));
    dispatch(setReferredFrom(''));
    dispatch(setLineItems([]));
    dispatch(setDraftOrderOutput({}));
    dispatch(setAppliedDiscount({}));
    dispatch(toggleTaxExempt(false));
  }

  useEffect(() => {
    if (lineItems.length > 0) {
      calculateDraftOrder();
    }
  }, [JSON.stringify(lineItems), shippingAddress, appliedDiscount, shippingLine, taxExempt]);

  return (
    <Page>
      <Frame>
      {isLoading(loading)}
      <Layout>
      <Layout.Section>
        {showCompletedBanner()}
        {showErrorBanner(bannerError)}
        <AuthorizeCCModal
          active={paymentModalActive}
          toggle={(active) => dispatch(togglePaymentModal(active))}
          lineItems={lineItems}
          billingAddress={billingAddress}
          shippingAddress={shippingAddress}
          customerEmail={customerEmail}
          userContactID={salesforceCustomer.SFContactID}
          salesforceCustomer={salesforceCustomer}
          resetApp={resetApp}
        ></AuthorizeCCModal>
      </Layout.Section>
      <Layout.Section>
        <Card sectioned title="Order Details" primaryFooterAction={{content: 'Create Order', onAction: submitDraftOrder, loading: createLoading}}>
          <Layout>
            <ProductResourcePicker/>
            <OrderNotes></OrderNotes>
            <OrderActionTable
              draftOrderOutput={draftOrderOutput}
              salesforceCustomer={salesforceCustomer}
              shippingAddress={shippingAddress}
              setBannerError={(error) => dispatch(setBannerError(error))}
              ></OrderActionTable>
          </Layout>
        </Card>
      </Layout.Section>
      <Layout.Section secondary>
        <CustomerInformation
          customer={salesforceCustomer}
          updateMasterShippingAddress={updateMasterShippingAddress}
          updateMasterBillingAddress={updateMasterBillingAddress}
          updateUserEmail={updateUserEmail}
          updateReferredFrom={updateReferredFrom}
          currentUserEmail={customerEmail}
          currentShippingAddress={shippingAddress}
          currentBillingAddress={billingAddress}
          currentReferredFrom={referredFrom}
        ></CustomerInformation>
      </Layout.Section>
      </Layout>
      </Frame>
    </Page>
  );
}

export default OrderForm;