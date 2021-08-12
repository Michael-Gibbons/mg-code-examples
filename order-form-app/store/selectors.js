import Cookies from "js-cookie";
import { isSubscription } from "../lib/variants";
import { useSelector } from "react-redux";
import store from 'store-js';

export const getAppliedDiscount = store => store.appliedDiscount;
export const getBannerError = store => store.bannerError;
export const getCustomerEmail = store => store.customerEmail;
export const getSalesforceCustomer = store => store.salesforceCustomer;
export const getBillingAddress = store => store.billingAddress;
export const getShippingAddress = store => store.shippingAddress;
export const getLineItems = store => store.lineItems;
export const getDraftOrderOutput = store => store.draftOrderOutput;
export const getPaymentModalActive = store => store.paymentModalActive;
export const getTaxExempt = store => store.taxExempt;
export const getDiscountCode = store => store.discountCode;
export const getShippingLine = store => store.shippingLine;
export const getReferredFrom = store => store.referredFrom;

export const getDraftOrderInput = (isCreate = false) => (notStore) => {
  const input = {
    email: notStore.customerEmail,
    billingAddress: notStore.billingAddress,
    shippingAddress: notStore.shippingAddress,
    lineItems: [...notStore.lineItems].map(({ variantId, quantity, appliedDiscount, customAttributes, ...fullItem }) => {
      const item = { variantId, quantity };
      const filteredAttributes = customAttributes.filter(attribute => !isCreate || attribute.key !== 'id');
      item.customAttributes = filteredAttributes;
      if (appliedDiscount && appliedDiscount.value > 0) {
        item.appliedDiscount = appliedDiscount;
      }
      if (isCreate && isSubscription(fullItem)) {
        const { order_interval_unit, order_interval_frequency, charge_interval_frequency, title, price, originalPrice } = fullItem;
        item.order_interval_unit = order_interval_unit;
        item.order_interval_frequency = order_interval_frequency;
        item.charge_interval_frequency = charge_interval_frequency;
        item.title = title;
        item.price = price;
        if (originalPrice && appliedDiscount && appliedDiscount.value > 0) {
          item.price = appliedDiscount.valueType === 'FIXED_AMOUNT' ? originalPrice - appliedDiscount.value : (originalPrice - (appliedDiscount.value * originalPrice));
          item.customAttributes = item.customAttributes || [];
          item.customAttributes.push({ name: 'Recurring Price', value: originalPrice });
        }
      }
      return item;
    }),
    taxExempt: notStore.taxExempt,
  };

  if (notStore.appliedDiscount && notStore.appliedDiscount.value > 0) {
    input.appliedDiscount = notStore.appliedDiscount;
  }

  input.customAttributes = [];

  const staffMember = Cookies.get('staffMember');
  if (staffMember) {
    input.customAttributes.push({ key: 'CSR_NAME', value: staffMember });
  }
  if (notStore.salesforceCustomer && notStore.salesforceCustomer.SFContactID) {
    input.customAttributes.push({ key: 'SFContactID', value: notStore.salesforceCustomer.SFContactID });
  }

  if (store.get('referredFrom')) {
    input.customAttributes.push({ key: 'ReferredFrom', value: store.get('referredFrom') });
  }

  // if (store.discountCode && store.discountCode.codeDiscount && store.discountCode.codeDiscount.title) {
  //   input.customAttributes = input.customAttributes || [];
  //   input.customAttributes.push({ key: 'DISCOUNT_CODE', value: store.discountCode.codeDiscount.title });
  // }

  if (Object.entries(notStore.shippingLine).length) {
    input.shippingLine = notStore.shippingLine;
  }

  return input;
};