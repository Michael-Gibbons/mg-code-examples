import {useCallback, useState, useEffect, useContext} from 'react';
import {Stack, Modal, TextField, FormLayout, TextStyle, Select} from '@shopify/polaris';
import fetch from 'node-fetch';
import sha256 from 'sha256';
import { getRawVariantId, isSubscription } from '../lib/variants';
import { Redirect } from '@shopify/app-bridge/actions';
import { Context } from '@shopify/app-bridge-react';
import { getDraftOrderInput } from '../store/selectors';
import { setBannerError } from '../store/actions';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

export default function AuthorizeCCModal({ active, toggle, lineItems, billingAddress, shippingAddress, customerEmail, userContactID, salesforceCustomer, resetApp }) {
  const [cc, setCC] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userAnetProfileID, setUserAnetProfileID] = useState(null);
  const [userAnetPaymentProfileID, setUserAnetPaymentProfileID] = useState(null);
  const [userNewPaymentMethodProfileInfo, setUserNewPaymentMethodProfileInfo] = useState(null);
  const [chargeCustomerValue, setChargeCustomerValue] = useState('0');
  const [chargeCustomerUnit, setChargeCustomerUnit] = useState('day');
  const [chargeCustomerDate, setChargeCustomerDate] = useState(formatDate(chargeCustomerUnit,chargeCustomerValue));
  const [chargeCustomerDateUS, setChargeCustomerDateUS] = useState(formatDate(chargeCustomerUnit,chargeCustomerValue, true));
  const draftOrderInput = useSelector(getDraftOrderInput(true), shallowEqual);

  const app = useContext(Context);
  const dispatch = useDispatch();

  function formatDate(unit, value, formatUS = false) {
    var d = new Date();
    if(parseInt(value) != 0 && value){
      if(unit == 'day'){
        d.setDate(new Date().getDate() + parseInt(value));
      }else if(unit === 'week'){
        d.setDate(new Date().getDate() + parseInt(value)*7);
      }else if(unit === 'month'){
        d.setMonth(new Date().getMonth() + parseInt(value));
      }
    }
    let month = '' + (d.getMonth()+ 1);
    let day = '' + d.getDate();
    let year = d.getFullYear();


    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    if(formatUS){
      return [ month, day, year].join('/');
    }
    return [year, month, day].join('-');
  }

  useEffect(() => {
    setChargeCustomerDate(formatDate(chargeCustomerUnit,chargeCustomerValue));
    setChargeCustomerDateUS(formatDate(chargeCustomerUnit,chargeCustomerValue,true))
  }, [chargeCustomerUnit, chargeCustomerValue]);

  const handleChange = useCallback(() => {
    toggle(!active);
    setErrors([]);
  });

  const handleChargeDateUnitChamge =  useCallback((val) => {
    setChargeCustomerUnit(val)
  });

  const handleChargeDateValueChange =  useCallback((val) => {
    if((Number.isInteger(parseInt(val)) || val == '') && val.length <= 4){
      setChargeCustomerValue(val);
    }
  });

  const handleCCChange = useCallback((string) => {
    const nibbles = string.replace(/[^0-9]/g, '').match(/\d{1,4}/g);
    const MaxCardLengthWithSpaces = 27;
    if(string.length > MaxCardLengthWithSpaces){return}
    if (!nibbles) {
      setCC(string);
    }else{
      setCC(nibbles.join('  '));
    }
  });

  const handleExpChange = useCallback((string) => {
    const nibbles = string.replace(/[^0-9]/g, '').match(/\d{1,2}/g);
    const MaxExpWithSpaces = 7;
    if(string.length > MaxExpWithSpaces){return}
    if (!nibbles) {
      setExp(string);
    }else{
      if(string.length == 2){
        setExp(nibbles + ' / ');
      }else{
        setExp(nibbles.join(' / '));
      }
    }
  });

  const handleCVCChange = useCallback((string) => {
    const nibbles = string.replace(/[^0-9]/g, '');
    const maxCvcLength = 4;
    if(nibbles.length > maxCvcLength){return}
    setCvc(nibbles);
  });

  const getPaymentProfileID = (paymentProfiles) => {
    if(!paymentProfiles){return null}
    let paymentFoundID = null;
    paymentProfiles.forEach(paymentProfile => {
      const usersLast4 = cc.replace(/\s+/g, '').slice(-4);
      const aNetsLast4 = paymentProfile.payment.creditCard.cardNumber.substr(-4);
      if(usersLast4 === aNetsLast4){
        paymentFoundID = paymentProfile.customerPaymentProfileId
      }
    });
    return paymentFoundID;
  };


  const handleUpdate = useCallback(() => {
    setUserAnetPaymentProfileID(null);
    setUserAnetProfileID(null);
    setUserNewPaymentMethodProfileInfo(null);
    getAnetProfile();
    // toggle(!active);
  });

  const getAnetProfile = () => {
    setLoading(true);
    fetch( "/getCustomerProfile", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({AuthorizeIDHash: sha256(userContactID + AUTHORIZE_LOGIN_ID).substring(0, 20)})
    }).then(response => response.json())
      .then(json => {
        if(json.messages.message.length && json.messages.message[0].code && json.messages.message[0].code == "E00040"){
          // Profile is not found
          // tokenize payment info and create a new customer with provided payment method
          sendPaymentDataToAnet("newCustomer");
        }else{
          // Profile is found
          // Check if payment method provided is already in authorize.net, if so grab ID
          // If not create new payment method and grab ID
          let paymentFoundID = false;
          if(json.profile){
            paymentFoundID = getPaymentProfileID(json.profile.paymentProfiles);
          }
          if(paymentFoundID){
            // Payment Method is found, use it
            console.log("GOT CUSTOMER AND PAYMENT METHOD",json);
            setUserAnetProfileID(json.profile.customerProfileId);
            setUserAnetPaymentProfileID(paymentFoundID);
          }else{
            // Payment Method not found
            // tokenize payment info and create a new payment profile with provided payment method
            setUserNewPaymentMethodProfileInfo(json);
          }
        }
      });
  };

  const sendPaymentDataToAnet = useCallback((aNetAction) => {
    setErrors([]);
    var authData = {};
    authData.clientKey = AUTHORIZE_CLIENT_KEY;
    authData.apiLoginID = AUTHORIZE_LOGIN_ID;

    var cardData = {};
    cardData.cardNumber = cc.replace(/\s+/g, '');
    cardData.month = exp.split(' / ')[0];
    cardData.year = exp.split(' / ')[1];
    cardData.cardCode = cvc;

    var secureData = {};
    secureData.authData = authData;
    secureData.cardData = cardData;
    if(aNetAction === "newCustomer"){
      Accept.dispatchData(secureData, aNetNewCustomer);
    }else if(aNetAction === "newPayment"){
      Accept.dispatchData(secureData, aNetNewPayment);
    }
  });

  const aNetNewCustomer = (response) => {
    if (response.messages.resultCode === "Error") {
      var errorArr = [];
      for(const error of response.messages.message){
        errorArr.push(error.text);
      }
      setErrors(errorArr.map( error => {
        return(
          <div key={error}>
            <TextStyle variation="negative" >{error}</TextStyle>
          </div>
        )
      }));
      setLoading(false);
    }else{
      setErrors([]);
      createNewAnetProfile(response);
    }
  };

  const aNetNewPayment = (response) => {
    if (response.messages.resultCode === "Error") {
      var errorArr = [];
      for(const error of response.messages.message){
        errorArr.push(error.text);
      }
      setErrors(errorArr.map( error => {
        return(
          <div key={error}>
            <TextStyle variation="negative" >{error}</TextStyle>
          </div>
        )
      }));
      setLoading(false);
      return;
    }

    setErrors([]);
    createNewAnetPaymentProfile(response);
  };

  const createNewAnetProfile = (response) => {
    console.log("NEW PROFILE TOKEN", response)
    fetch( "/authorizeCreateCustomerProfile", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ opaqueData: response.opaqueData, billingAddress, customerEmail, AuthorizeIDHash: sha256(userContactID + AUTHORIZE_LOGIN_ID).substring(0, 20)})
    }).then(response => response.json())
      .then(json => {
        setUserAnetProfileID(json.customerProfileId);
        console.log(json)
        setUserAnetPaymentProfileID(json.customerPaymentProfileIdList.numericString[0]);
      });
  };

  const createNewAnetPaymentProfile = (response) => {
    console.log("NEW PAYMENT TOKEN", response)
    fetch( "/authorizeCreateCustomerPaymentProfile", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ opaqueData: response.opaqueData, billingAddress, customerProfileId: userNewPaymentMethodProfileInfo.profile.customerProfileId})
    }).then(response => response.json())
      .then(json => {
        setUserAnetProfileID(json.customerProfileId);
        setUserAnetPaymentProfileID(json.customerPaymentProfileId);
      });
  };

  const rechargeGetCustomer = () => {
    fetch(`/rechargeGetCustomer?email=${customerEmail}`, {
      method: 'GET'
    }).then(response => response.json()).then(json => {
      console.log(json);
      if(!json.customers.length){
        console.log('RECHARGE CUSTOMER NOT FOUND, CREATING NEW RECHARGE CUSTOMER')
        rechargeCreateCustomer();
      }else{
        console.log("CUSTOMER FOUND, CHECKING ADDRESSES FOR MATCH")
        //Check addresses for match, else make new address
        //CHECK FOR NEW PAYMENT METHOD, CHECK COMPONENT'S LAST 4 # WITH RECHARGE'S LAST 4 IF MATCH NO UPDATE, ELSE UPDATE
        rechargeGetAddresses(json.customers[0].id)
      }
    });
  };

  const rechargeCreateCustomer = () => {
    fetch( "/rechargeCreateCustomer", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({billingAddress, userAnetProfileID, userAnetPaymentProfileID, salesforceCustomer})
    }).then(response => response.json()).then(async json => {
      console.log(json);
      if ((json.first_name && json.first_name === 'Required field missing') || (json.last_name && json.last_name === 'Required field missing')) {
        dispatch(setBannerError({title: "Salesforce contact ID required", text: "Subscriptions can only be created from Salesforce"}));
        setLoading(false);
        toggle(!active);
        return;
      } else if (json.billing_province && json.billing_province.startsWith('State is not right based on zip code.')) {
        const messageThenSuggestion = json.billing_province.split(': ', 2);
        if (messageThenSuggestion.length > 1) {
          dispatch(setBannerError({title: "Invalid billing state", text: `Incorrect billing state based on the provided ZIP code. Did you mean ${messageThenSuggestion[1]}?`}));
        } else {
          dispatch(setBannerError({title: "Invalid billing state", text: "Incorrect billing state based on the provided ZIP code"}));
        }
        setLoading(false);
        toggle(!active);
        return;
      }

      // Recharge does not properly validate the billing city location when the state location is valid
      // Until this is fixed, don't try to validate it

      /* else if (json.billing_zip && json.billing_zip === 'Zip code is not right based on city.') {
        dispatch(setBannerError({title: "Invalid billing ZIP code", text: "Billing city is not within the provided ZIP code area"}));
        setLoading(false);
        toggle(!active);
        return;
      } */

      console.log("Customer ID: ", json.customer.id);
      rechargeCreateAddress(json.customer.id);
    });
  };

  const rechargeCreateAddress = (customerID) => {
    const { customAttributes = [] } = draftOrderInput;
    fetch( "/rechargeCreateAddress", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ shippingAddress, customerID, customAttributes })
    }).then(response => response.json()).then(json => {
      console.log(json);
      if (json.province && json.province.startsWith('State is not right based on zip code.')) {
        const messageThenSuggestion = json.province.split(': ', 2);
        if (messageThenSuggestion.length > 1) {
          dispatch(setBannerError({title: "Invalid state", text: `Incorrect shipping state based on the provided ZIP code. Did you mean ${messageThenSuggestion[1]}?`}));
        } else {
          dispatch(setBannerError({title: "Invalid state", text: "Incorrect shipping state based on the provided ZIP code"}));
        }
        setLoading(false);
        toggle(!active);
        return;
      }

      // After some testing, it seems Recharge does not attempt to validate the shipping city at all, unlike billing city
      // Maybe we should consider creating our own validation logic in the future?

      rechargeCreateSubscription(json.address.id, json.address.customer_id);
    });
  };

  const rechargeCreateSubscription = (addressID, customerID) => {
    console.log("Address ID: ", addressID);
    console.log({ draftOrderInput });
    const data = {
      address_id: addressID,
      subscriptions: draftOrderInput.lineItems.filter(item => isSubscription(item)).map(item => ({
        next_charge_scheduled_at: chargeCustomerDate,
        shopify_variant_id: getRawVariantId(item.variantId),
        quantity: item.quantity,
        order_interval_unit: item.order_interval_unit,
        order_interval_frequency: item.order_interval_frequency,
        charge_interval_frequency: item.charge_interval_frequency,
        customer_id: customerID,
        product_title: item.title,
        price: item.price,
        properties: item.customAttributes,
      })),
    };
    console.log({ data });
    fetch( "/rechargeCreateSubscription", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    }).then(response => response.json()).then(json => {
      console.log(json);
      rechargeCreateOnetime(addressID, customerID);
    });
  };

  const rechargeGetAddresses = (customerID) => {
    fetch(`/rechargeGetAddresses?id=${customerID}`,{
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(response => response.json()).then(json => {
      console.log(json)
      const foundAddress = json.addresses.find((address) => address.address1.toLowerCase().trim() === shippingAddress.address1.toLowerCase().trim() && address.city.toLowerCase().trim() === shippingAddress.city.toLowerCase().trim() );
      if(foundAddress){
        console.log('FOUND ADDRESS', foundAddress)
        // TODO: if present, add customAttributes to address note_attributes
        rechargeCreateSubscription(foundAddress.id, foundAddress.customer_id);
      }else{
        console.log("NO ADDRESS FOUND, CREATING ADDRESS")
        rechargeCreateAddress(customerID);
      }
    });
  };

  const rechargeCreateOnetime = (addressID, customerID) => {
    const data = lineItems.filter(item => !isSubscription(item)).map(item => ({
      address_id: addressID,
      next_charge_scheduled_at: chargeCustomerDate,
      shopify_variant_id: getRawVariantId(item.variantId),
      quantity: item.quantity,
      customer_id: customerID,
      product_title: item.title,
      price: item.price,
    }));
    const dataLength = data.length;
    let responseCounter = 0;
    const loadingOff = () => {
      if(responseCounter === dataLength){
        setLoading(false);
        toggle(!active);
        resetApp();
      }
    }

    const recursiveOnetime = async () => {
      if(!data.length){
        loadingOff();
        resetApp();
        const redirect = Redirect.create(app);
        redirect.dispatch(
          Redirect.Action.ADMIN_PATH,
          '/apps/shopify-recurring-payments/orders/upcoming',
        );
        return;
      }

      fetch( "/rechargeCreateOnetime", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({data: data[data.length-1]}),
      }).then(response => response.json()).then(json => {
        console.log(json);
        data.pop();
        responseCounter += 1;
        loadingOff();
        recursiveOnetime();
      });
    }
    recursiveOnetime();
  };

  useEffect(() => {
    if(userNewPaymentMethodProfileInfo){
      console.log("GOT CUSTOMER NEW PAYMENT METHOD",userNewPaymentMethodProfileInfo);
      sendPaymentDataToAnet("newPayment");
    }
  }, [userNewPaymentMethodProfileInfo]);

  useEffect(() => {
    if(userAnetProfileID && userAnetPaymentProfileID ){
      console.log("PROFILE ID: ", userAnetProfileID);
      console.log("PAYMENT PROFILE ID: ", userAnetPaymentProfileID);
      rechargeGetCustomer();
    }
  }, [userAnetProfileID, userAnetPaymentProfileID]);


  return (
    <Modal
      open={active}
      onClose={handleChange}
      title="Enter Payment Information"
      primaryAction={{
        content: 'Save',
        onAction: handleUpdate,
        loading: loading
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: handleChange,
        },
      ]}
    >
      <Modal.Section>
        <FormLayout>
          <FormLayout.Group>
            <FormLayout.Group>
              <TextField  label="Card Number" name="credit-number" type="tel" pattern="\d*" maxlength="19" placeholder="1234  1234  1234  1234" onChange = {handleCCChange} value = {cc}></TextField>
            </FormLayout.Group>
            <FormLayout.Group condensed>
              <TextField label="Expiration (MM/YY)" name="expiration" type="tel" placeholder="MM / YY" onChange = {handleExpChange} value = {exp}></TextField>
              <TextField label="Security Code" name="CVC" type = "tel" placeholder = "CVC" onChange = {handleCVCChange} value = {cvc}></TextField>
            </FormLayout.Group>
          </FormLayout.Group>
          <FormLayout.Group>
            <FormLayout.Group>
              <Stack alignment="center">
                <Stack.Item>
                <p>Charge Customer In: </p>
                </Stack.Item>
                <Stack.Item>
                <div style={{width:'5em'}}>
                  <TextField
                    value={chargeCustomerValue}
                    onChange={handleChargeDateValueChange}
                  ></TextField>
                </div>
                </Stack.Item>
                <Stack.Item>
                <Select
                  value={chargeCustomerUnit}
                  onChange={handleChargeDateUnitChamge}
                  options={[
                    {label: 'Days', value: 'day'},
                    {label: 'Weeks', value: 'week'},
                    {label: 'Months', value: 'month'},
                  ]}>

                </Select>
                </Stack.Item>
                <Stack.Item>
                  <p>Customer will be charged on {chargeCustomerDateUS}</p>
                </Stack.Item>
              </Stack>

            </FormLayout.Group>
          </FormLayout.Group>
        </FormLayout>
        {errors}
      </Modal.Section>

    </Modal>
  );
}