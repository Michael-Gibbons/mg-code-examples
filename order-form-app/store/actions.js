import store from 'store-js';
import {
  APPLY_LINE_ITEM_DISCOUNT,
  UPDATE_LINE_ITEMS,
  UPDATE_SALESFORCE_CUSTOMER,
  UPDATE_CUSTOMER_EMAIL,
  UPDATE_SHIPPING_ADDRESS,
  UPDATE_SHIPPING_LINE,
  UPDATE_BANNER_ERROR,
  UPDATE_DRAFT_ORDER_OUTPUT,
  TOGGLE_PAYMENT_MODAL,
  UPDATE_APPLIED_DISCOUNT,
  CLEAR_APPLIED_DISCOUNT,
  TOGGLE_TAX_EXEMPT,
  UPDATE_REFERRED_FROM,
  UPDATE_BILLING_ADDRESS,
  UPDATE_DISCOUNT_CODE,
  CLEAR_DISCOUNT_CODE,
} from './actionTypes';

export const setCustomerEmail = email => {
  store.set('customerEmail', email);
  return {
    type: UPDATE_CUSTOMER_EMAIL,
    payload: { email },
  };
};

export const setSalesforceCustomer = customer => {
  store.set('salesforceCustomer', customer);
  return {
    type: UPDATE_SALESFORCE_CUSTOMER,
    payload: { customer },
  };
};

export const setBillingAddress = address => {
  store.set('billingAddress', address);
  return {
    type: UPDATE_BILLING_ADDRESS,
    payload: { address },
  };
};

export const setShippingAddress = address => {
  store.set('shippingAddress', address);
  return {
    type: UPDATE_SHIPPING_ADDRESS,
    payload: { address },
  };
};

export const setLineItems = items => {
  store.set('lineItems', items);
  return {
    type: UPDATE_LINE_ITEMS,
    payload: { items },
  };
};

export const applyLineItemDiscount = (index, appliedDiscount) => ({
  type: APPLY_LINE_ITEM_DISCOUNT,
  payload: { index, appliedDiscount },
});

export const setBannerError = message => {
  store.set('bannerError', message);
  return {
    type: UPDATE_BANNER_ERROR,
    payload: { message },
  }
};

export const setDraftOrderOutput = order => {
  store.set('draftOrderOutput', order);
  return {
    type: UPDATE_DRAFT_ORDER_OUTPUT,
    payload: { order },
  }
};

export const clearDraftOrderOutput = () => {
  store.remove('draftOrderOutput');
  return {
    type: UPDATE_DRAFT_ORDER_OUTPUT,
    payload: { order: {} },
  }
};

export const togglePaymentModal = (active = null) => ({
  type: TOGGLE_PAYMENT_MODAL,
  payload: { active },
});

export const setAppliedDiscount = (discount) => {
  console.log({ newValue: discount, stack: new Error().stack });
  store.set('appliedDiscount', discount);
  return {
    type: UPDATE_APPLIED_DISCOUNT,
    payload: { discount },
  };
};

export const clearAppliedDiscount = () => {
  store.remove('appliedDiscount');
  return {
    type: CLEAR_APPLIED_DISCOUNT,
  }
};

export const toggleTaxExempt = (exempt = null) => {
  store.set('taxExempt', exempt);
  return {
    type: TOGGLE_TAX_EXEMPT,
    payload: { exempt },
  };
};

export const setShippingLine = (line) => {
  store.set('shippingLine', line);
  return {
    type: UPDATE_SHIPPING_LINE,
    payload: { line },
  }
};

export const setReferredFrom = referredFrom => {
  store.set('referredFrom', referredFrom);
  console.log(store.referredFrom);
  return {
    type: UPDATE_REFERRED_FROM,
    payload: { referredFrom },
  };
};

export const setDiscountCode = (discount) => ({
  type: UPDATE_DISCOUNT_CODE,
  payload: { discount },
});

export const clearDiscountCode = () => ({
  type: CLEAR_DISCOUNT_CODE,
});