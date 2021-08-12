import { useEffect, useState, useCallback } from 'react';
import { useMutation, useLazyQuery } from 'react-apollo';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { ResourceList, Stack, Spinner, Button, Modal, TextField, Badge } from '@shopify/polaris';
import { setAppliedDiscount, clearAppliedDiscount, setLineItems, setShippingLine, setDiscountCode, clearDiscountCode } from '../store/actions';
import { getLineItems, getDiscountCode } from '../store/selectors';
import { isSubscription } from '../lib/variants';
import CountryRegionData from '../node_modules/country-region-data/data.json';
import getOrderFromDiscountQuery from '../lib/graphql/getOrderFromDiscount';
import getActiveDiscountCodes from '../lib/graphql/getActiveDiscountCodes';
import getCustomersInGroupQuery from '../lib/graphql/getCustomersInGroup';
import checkBulkOperationQuery from '../lib/graphql/checkBulkOperation';
import getBxGyQuery from '../lib/graphql/getBxGyQuery';

export default function DiscountCodePicker({salesforceCustomer, draftOrderOutput, shippingAddress, setBannerError, setDisableOrderDiscount}) {
  const dispatch = useDispatch();
  const lineItems = useSelector(getLineItems, shallowEqual);
  const selectedCode = useSelector(getDiscountCode, shallowEqual);
  const [active, setActive] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [discountCodes, setDiscountCodes] = useState([]);
  const [filteredDiscountCodes, setFilteredDiscountCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerGroupQuery, setCustomerGroupQuery] = useState('');
  const [oneUseIsValid, setOneUseIsValid] = useState(false);
  const [orderData, setOrderData] = useState({});
  const [groupData, setGroupData] = useState({});
  const [customerIsEligible, setCustomerIsEligible] = useState(false);
  const [draftOrderChangedFromCode, setDraftOrderChangedFromCode] = useState({});

  const handleSearchChange = useCallback((newValue) => {
    const matchingCodes = discountCodes.filter((item) => {
      return !newValue.length || item.codeDiscount.title.toLowerCase().includes(newValue.toLowerCase());
    });
    setFilteredDiscountCodes(matchingCodes);
    setSearchString(newValue);
  }, [discountCodes]);

  const resetData = () => {
    setOrderData({});
    setGroupData({});
    setOneUseIsValid(null);
    setCustomerIsEligible(null);
    setCustomerGroupQuery('');
    setDisableOrderDiscount(false);
    // remove all applied discounts and re-enable discounts for all line items
    const newLineItems = lineItems.map(item => ({
      ...item,
      disableLineItemDiscounts: false,
      appliedDiscount: { valueType: 'FIXED_AMOUNT', value: 0 },
    }));
    dispatch(setLineItems(newLineItems));
  }

  const handleCodeCancel = useCallback(() => {
    resetData();
    setActive(false);
    dispatch(clearDiscountCode());
    dispatch(clearAppliedDiscount());
  });

  const handleCodeSelection = (item) => {
    if(isEquivalent(item, selectedCode)){
      setActive(false);
      return;
    }
    resetData();
    setActive(false);
    dispatch(clearAppliedDiscount());
    dispatch(setDiscountCode(item));
  };

  const updateOrderDiscount = (discountObject)  => {
    setTimeout(() => {
      dispatch(setAppliedDiscount(discountObject));
    }, 300);
  }

  const isEquivalent = (a, b) => {
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);
    return aProps.length === bProps.length && aProps.every(prop => a[prop] === b[prop]);
  }

  const fetchDiscountCodes = (dataUrl) => {
    fetch(`/getDiscountCodes`,{
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dataUrl }),
      })
      .then(response => response.json())
      .then(({ discountCodes: codes = [] }) => {
        const discountCodes = codes.filter(item => item.codeDiscount.title);
        setDiscountCodes([...discountCodes]);
        setFilteredDiscountCodes([...discountCodes]);
        setLoading(false);
      });
  };

  const [ checkBulkOperation, {BOdata, BOloading, BOerror}] = useLazyQuery(checkBulkOperationQuery, {
    fetchPolicy: "network-only",
    onCompleted(data) {
      switch (data.currentBulkOperation.status) {
        case 'FAILED':
          setLoading(false);
          setActive(false);
          setBannerError({ title: "Shopify Error", text: "Something went wrong with Shopify's API, please refresh the page." });
          break;
        case 'RUNNING':
        case 'CREATED':
          setTimeout(() => {
            checkBulkOperation();
          }, 500);
          break;
        case 'COMPLETED':
          fetchDiscountCodes(data.currentBulkOperation.url);
          break;
      }
    }
  });

  const [getDiscountCodes] = useMutation(getActiveDiscountCodes, {
    onCompleted(data) {
      checkBulkOperation();
    },
  });

  const [getBxGyCode] = useLazyQuery(getBxGyQuery, {
    fetchPolicy: 'no-cache',
    variables: { code: "bxgyVAL" },
    onCompleted(data) {
      console.log("BXGY CODE:", data);
      dispatch(setDiscountCode(data.codeDiscountNodeByCode));
    },
  });

  const openModal = useCallback(() => {
    if (!discountCodes.length) {
      setLoading(true);
      getDiscountCodes();
    }
    setActive(true);
  });

  const refresh = useCallback(() => {
    setLoading(true);
    setSearchString('');
    getDiscountCodes();
  });


  // VALIDATION --------------------------------------------------------------------------------------------
  const [getOrders] = useLazyQuery(getOrderFromDiscountQuery, {
    variables: { query: `email:${salesforceCustomer.email} AND discount_code:${selectedCode.codeDiscount.title}` },
    fetchPolicy: "network-only",
    onCompleted(data) {
      setOrderData(data);
      checkCustomerHasUsesRemaining(selectedCode);
    },
  });

  const [getCustomersInGroup] = useLazyQuery(getCustomersInGroupQuery, {
    variables: { query: customerGroupQuery },
    fetchPolicy: "network-only",
    onCompleted(data) {
      setGroupData(data);
    },
  });

  const checkCustomerHasUsesRemaining = (codeObject) => {
    if (!codeObject.codeDiscount.appliesOncePerCustomer) {
      console.log("Code does not apply once per customer, validated");
      setOneUseIsValid(true);
      return;
    }

    if (Object.keys(orderData).length === 0) {
      getOrders();
      return;
    }

    const alreadyUsed = orderData.orders.edges.length > 0;
    console.log(`Customer ${alreadyUsed ? 'has' : 'has not'} used code before`);
    setOneUseIsValid(!alreadyUsed);
    if (alreadyUsed) {
      setBannerError({ title: "Invalid Code", text: "Customer has used code before" });
      dispatch(clearDiscountCode());
    }
  }

  const checkCustomerEligibility = ({ codeDiscount: { customerSelection } = {} }) => {
    if (customerSelection.allCustomers) {
      console.log('Discount is usable for all, Customer is eligible')
      setCustomerIsEligible(true);
      return;
    }

    if (customerSelection.customers) {
      const isEligible = customerSelection.customers.some((customer) => customer.email === salesforceCustomer.email);
      console.log(`Discount is customer specific and customer ${isEligible ? 'is' : 'is not'} eligible`);
      setCustomerIsEligible(isEligible);
      if (!isEligible) {
        setBannerError({ title: "Invalid Code", text: "Discount does not apply to this customer." });
        dispatch(clearDiscountCode());
      }
      return;
    }

    const searchQueries = customerSelection.savedSearches.map(({ query }) => query).join(' OR ');
    const queryString = `(${searchQueries}) AND email:${salesforceCustomer.email}`;
    setCustomerGroupQuery(queryString);
  }

  const validateGroupData = () => {
    if (!Object.keys(groupData).length) {
      return;
    }

    const isEligible = groupData.customers.edges.length > 0;
    console.log(isEligible ? 'customer belongs to group and is eligible' : 'customer does not exist in group');
    setCustomerIsEligible(isEligible);
    if (!isEligible) {
      setBannerError({ title: "Invalid Code", text: "Customer is not in the group specified by discount code." });
      dispatch(clearDiscountCode());
    }
  }

  useEffect(() => {
    if (customerGroupQuery) {
      getCustomersInGroup();
    }
  }, [customerGroupQuery]);

  useEffect(() => {
    validateGroupData();
  }, [groupData]);

  const meetsMinimumRequirements = ({ codeDiscount: { minimumRequirement } = {} }) => {
    if(!minimumRequirement){
      console.log("Code has no minimum requirements, customer is validated");
      return true;
    }

    let meetsRequirement = false;
    let error = {};

    if (minimumRequirement.greaterThanOrEqualToSubtotal) {
      let originalSubtotal = 0;
      draftOrderOutput.draftOrderCalculate.calculatedDraftOrder.lineItems.forEach(product => {
        originalSubtotal += parseFloat(product.originalTotal.amount)
      });
      const minimumSubtotal = parseFloat(minimumRequirement.greaterThanOrEqualToSubtotal.amount);
      meetsRequirement = originalSubtotal >= minimumSubtotal;
      if (!meetsRequirement) {
        error = { title: "Invalid Code", text: "Discount code price requirement not met." };
      }
    } else if (minimumRequirement.greaterThanOrEqualToQuantity) {
      const minimumCount = parseInt(minimumRequirement.greaterThanOrEqualToQuantity);
      const itemCount = lineItems.reduce((carry, item) => carry + item.quantity);
      meetsRequirement = itemCount >= minimumCount;
      if (!meetsRequirement) {
        error = { title: "Invalid Code", text: "Discount code quantity requirement not met." };
      }
    }

    console.log(meetsRequirement ? "Requirement met, validated": "Requirement not met, invalid");
    if (!meetsRequirement) {
      setBannerError(error);
      dispatch(clearDiscountCode());
    }

    return meetsRequirement;
  }

  const meetsProductRequirements = (codeObject) => {
    if (!codeObject.itemsType) {
      console.log("No product or collection requirements, code validated")
      return true;
    }

    let meetsRequirement = false;
    let error = {};

    if (codeObject.itemsType == 'PRODUCT') {
      console.log('product code');
      meetsRequirement = codeObject.items.some(
        item => lineItems.findIndex(
          variant => variant.variantId === item.id || (item.product && variant.handle === item.product.handle) || (item.handle && variant.handle === item.handle)
        ) !== -1
      );
      console.log(meetsRequirement ? "product has been found in cart, code validated." : "product has not been found in cart, code invalid.");
      if (!meetsRequirement) {
        error = { title: "Invalid Code", text: "Products attached to this discount code are not selected." };
      }
    } else if (codeObject.itemsType == 'COLLECTION') {
      console.log('collection code')
      meetsRequirement = codeObject.items.some(collection => lineItems.some(item => item.collections && item.collections.includes(collection.handle)));
      console.log(meetsRequirement ? 'collection found, code validated': 'No product in cart belongs to the collections specified in the code');
      if(!meetsRequirement){
        error = { title: "Invalid Code", text: "Discount code collection requirement not met." };
      }
    }

    if (!meetsRequirement) {
      setBannerError(error);
      dispatch(clearDiscountCode());
    }

    return meetsRequirement;
  }

  const meetsCountryRequirements = (codeObject) => {
    if(!codeObject.codeDiscount.destinationSelection){
      console.log('Discount code is not for free shipping, validated');
      return true;
    }
    if (codeObject.codeDiscount.destinationSelection.allCountries) {
      console.log('Free shipping code valid for all countries, validated.')
      return true;
    }
    const selectedCountry = CountryRegionData.find(country => country.countryName === shippingAddress.country).countryShortCode;
    const validCountry = codeObject.codeDiscount.destinationSelection.countries.find(country => country === selectedCountry);
    if (validCountry) {
      console.log('User country is in code, valid');
      return true;
    }

    console.log('User country is not in code, invalid')
    setBannerError({ title: "Invalid Code", text: "Discount code country requirement not met." });
    dispatch(clearDiscountCode());
    return false;
  }

  const isSubscriptionOrder = () => {
    return lineItems.some(item => isSubscription(item));
  }

  const getAppliedDiscountFromCode = (codeObject) => {
    if (codeObject.codeDiscount.customerGets.value.percentage) {
      return {
        value: codeObject.codeDiscount.customerGets.value.percentage * 100,
        valueType: 'PERCENTAGE',
        description: '',
      };
    }

    console.log({ amount: codeObject.codeDiscount.customerGets.value.amount.amount });
    return {
      value: parseFloat(codeObject.codeDiscount.customerGets.value.amount.amount),
      valueType: 'FIXED_AMOUNT',
      description: '',
    };
  }

  const applyDiscountCode = (codeObject) => {
    const hasSubscriptions = isSubscriptionOrder();
    console.log(hasSubscriptions ? "IS SUBSCRIPTION" : "IS DRAFT");
    console.log(codeObject);
    if(!!codeObject.codeDiscount.customerGets && !!codeObject.codeDiscount.customerGets.items.allItems && codeObject.itemsType !== 'PRODUCT' && codeObject.itemsType !== 'COLLECTION' ){
      applyFixedDiscountCode(codeObject, hasSubscriptions);
    } else if (codeObject.itemsType == 'PRODUCT') {
      applyProductDiscountCode(codeObject);
    } else if (codeObject.itemsType == 'COLLECTION') {
      applyCollectionDiscountCode(codeObject, hasSubscriptions);
    } else if (codeObject.codeDiscount.destinationSelection) {
      console.log('free shipping code');
      dispatch(setShippingLine({
        price: "0",
        shippingRateHandle: 'standard-shipping',
        title: 'Standard Shipping',
      }));
    }
  }

  const applyFixedDiscountCode  = (codeObject, isSubscription) => {
    console.log("Is order level discount")
    const discountObject = getAppliedDiscountFromCode(codeObject);

    if (isSubscription) {
      const newLineItems = lineItems.map(item => {
        if (discountObject.valueType !== 'PERCENTAGE') {
          discountObject.value = (discountObject.value / lineItems.length).toFixed(2);
        }
        item.appliedDiscount = discountObject;

        return {
          ...item,
          disableLineItemDiscounts: true,
        };
      });
      dispatch(setLineItems(newLineItems));
      return;
    }

    updateOrderDiscount(discountObject);
    setDisableOrderDiscount(true);
  }

  const applyProductDiscountCode = (codeObject) => {
    const IDsFromCode = codeObject.items.map(item => item.id);
    const discountObject = getAppliedDiscountFromCode(codeObject);

    if (codeObject.codeDiscount.customerGets.value.appliesOnEachItem) {
      console.log('APPLIES ON EVERY ITEM')
      const newLineItems = lineItems.map(item => {
        const { appliedDiscount, ...newItem } = { ...item, disableLineItemDiscounts: false };
        if (IDsFromCode.includes(item.variantId)) {
          newItem.appliedDiscount = discountObject;
          newItem.disableLineItemDiscounts = true;
        }
        return newItem;
      });
      dispatch(setLineItems(newLineItems));
      return;
    }

    console.log('APPLIES ONCE PER ORDER')
    const itemToSplit = lineItems.find(item => IDsFromCode.includes(item.variantId) || IDsFromCode.includes(item.productId));
    if (discountObject.valueType === 'FIXED_AMOUNT' && itemToSplit && itemToSplit.quantity > 1) {
      const itemToSplitIndex = lineItems.findIndex(lineItem => lineItem.id === itemToSplit.id);
      const itemID = itemToSplit.id + '--SPLIT';
      const item = {
        id: itemID,
        variantId: itemToSplit.variantId,
        quantity: 1,
        title: itemToSplit.title,
        productId: itemToSplit.productId,
        handle: itemToSplit.handle,
        disableLineItemDiscounts: true,
        singular: true,
        customAttributes: [{key:"id", value:itemID}],
        appliedDiscount: discountObject
      };
      itemToSplit.quantity -=1;
      const newLineItems = [...lineItems];
      newLineItems.splice(itemToSplitIndex, 1, itemToSplit);
      newLineItems.splice(itemToSplitIndex, 0, item);
      dispatch(setLineItems(newLineItems));
      return;
      // const validItemCount = lineItems.filter(item => IDsFromCode.includes(item.variantId)).length;
      // discountObject.value = parseFloat(codeObject.codeDiscount.customerGets.value.amount.amount) / validItemCount;
    }

    let discountLimitReached = false;
    const newLineItems = lineItems.map(item => {
      const { appliedDiscount, ...newItem } = { ...item, disableLineItemDiscounts: false };
      if (!discountLimitReached && (IDsFromCode.includes(item.variantId) || IDsFromCode.includes(item.productId))) {
        newItem.appliedDiscount = discountObject;
        newItem.disableLineItemDiscounts = true;
        newItem.singular = discountObject.valueType === 'FIXED_AMOUNT';
        discountLimitReached = discountObject.valueType === 'FIXED_AMOUNT';
      }
      return newItem;
    });
    dispatch(setLineItems(newLineItems));
  }

  const applyCollectionDiscountCode = (codeObject, isSubscription) => {
    console.log('collection code');
    const discountObject = getAppliedDiscountFromCode(codeObject);

    if (codeObject.codeDiscount.customerGets.value.appliesOnEachItem) {
      const newLineItems = lineItems.map(item => {
        const { appliedDiscount, ...newItem } = { ...item, disableLineItemDiscounts: false };
        if (codeObject.items.some(collection => newItem.collections && newItem.collections.includes(collection.handle))) {
          newItem.appliedDiscount = discountObject;
          newItem.disableLineItemDiscounts = true;
        }
        return newItem;
      });
      dispatch(setLineItems(newLineItems));
      return;
    }

    // split between items since recharge can't have order level
    if (isSubscription) {
      if (discountObject.valueType === 'FIXED_AMOUNT') {
        const matchingItemCount = lineItems.filter(item => item.collections && item.collections.some(collection => collection === collection.handle)).length;
        discountObject.value = parseFloat(codeObject.codeDiscount.customerGets.value.amount.amount) / matchingItemCount;
      }
      const newLineItems = lineItems.map(item => {
        const { appliedDiscount, ...newItem } = { ...item, disableLineItemDiscounts: false };
        if (codeObject.items.some(collection => newItem.collections && newItem.collections.includes(collection.handle))) {
          newItem.appliedDiscount = discountObject;
          newItem.disableLineItemDiscounts = true;
        }
        return newItem;
      });
      dispatch(setLineItems(newLineItems));
      return;
    }

    // apply to order level
    updateOrderDiscount(discountObject)
    setDisableOrderDiscount(true);
  }

  const validateDiscountCode = async (codeObject) => {
    console.log(codeObject)
    const minReq = await meetsMinimumRequirements(codeObject);
    console.log('------------------')
    const prodReq = await meetsProductRequirements(codeObject);
    console.log('------------------')
    const countryReq = await meetsCountryRequirements(codeObject);
    console.log('------------------')
    console.log("SATISFIES NON-QUERY",minReq && prodReq && countryReq);
    if (minReq && prodReq && countryReq) {
      checkCustomerHasUsesRemaining(codeObject);
      checkCustomerEligibility(codeObject);
    }
  }

  useEffect(() => {
    if(oneUseIsValid && customerIsEligible){
      console.log('CODE IS VALID');
      setBannerError({});
      applyDiscountCode(selectedCode);
    }
  }, [oneUseIsValid, customerIsEligible]);

  useEffect(() => {
    if(lineItems.length){
      setDraftOrderChangedFromCode(draftOrderOutput)
    }
  }, [JSON.stringify(lineItems)]);

  useEffect(() => {
    if(selectedCode.codeDiscount.title){
      validateDiscountCode(selectedCode);
    }
  }, [selectedCode, draftOrderChangedFromCode]);

  const activator = (
    <Button plain onClick={openModal}>
      Add Discount Code {selectedCode.codeDiscount.title ? (
         <Badge>{selectedCode.codeDiscount.title}</Badge>
      ):null}
    </Button>
  );

  return (
    <div>
      {activator}
      <Modal
        open={active}
        onClose={() => setActive(false)}
        title="Discount Code"
        secondaryActions={[
          {
            content: 'Remove Code',
            disabled: !selectedCode.codeDiscount.title,
            onAction: handleCodeCancel,
          },
          {
            content: 'Refresh',
            onAction: refresh,
          }
        ]}
        loading={loading}
      >

        <Modal.Section>
          <TextField onChange={handleSearchChange} value={searchString} placeholder="20OFF" autoFocus={true} autoComplete={false}></TextField>
        </Modal.Section>
        {!filteredDiscountCodes.length ? (
          <Modal.Section>
            <div style={{fontSize: '20px', textAlign: 'center',height:'260px'}}>No discount codes found for '{searchString}'</div>
          </Modal.Section>) : (
          <div style={{height: '300px'}}>
            <ResourceList
            resourceName={{ singular: 'Discount Code', plural: 'Discount Codes' }}
            items={filteredDiscountCodes}
            renderItem={(item) => {
              if (loading) { return (
                <div style={{display: 'flex',  justifyContent:'center', alignItems:'center',height: '200px'}}>
                  <Spinner accessibilityLabel="Spinner" size="large" color="teal" />
                </div>
              ); }
              return (
                <ResourceList.Item
                  id={item.id}
                  accessibilityLabel={`View details for ${item.codeDiscount.title}`}
                  onClick={() => handleCodeSelection(item)}
                >
                  <div style={{height:'50px'}}>
                  <Stack >
                    <Stack.Item fill alignment='center'>
                      {item.codeDiscount.title}
                    </Stack.Item>
                      {item.codeDiscount.usageLimit !== null ? (
                        <Stack.Item>
                          {item.codeDiscount.asyncUsageCount}/{item.codeDiscount.usageLimit} Used
                        </Stack.Item>
                      ): (
                        null
                      )}
                      {item.codeDiscount.appliesOncePerCustomer ? (
                        <Stack.Item>
                          {item.codeDiscount.asyncUsageCount}/1 Used
                        </Stack.Item>
                      ): (
                        null
                      )}
                    <Stack.Item>
                      <Badge status="success">Active</Badge>
                    </Stack.Item>
                  </Stack>
                  </div>

                <p>{item.codeDiscount.summary}</p>
                </ResourceList.Item>
              );

            }}
          />
          </div>
        )}

      </Modal>
    </div>

  );
}
