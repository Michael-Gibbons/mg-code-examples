import { combineReducers } from 'redux';
import appliedDiscount from './appliedDiscount';
import bannerError from './bannerError';
import billingAddress from './billingAddress';
import customerEmail from './customerEmail';
import discountCode from './discountCode';
import draftOrderOutput from './draftOrderOutput';
import lineItems from './lineItems';
import paymentModalActive from './paymentModalActive';
import salesforceCustomer from './salesforceCustomer';
import shippingAddress from './shippingAddress';
import shippingLine from './shippingLine';
import taxExempt from './taxExempt';

export default combineReducers({
  appliedDiscount,
  bannerError,
  billingAddress,
  customerEmail,
  discountCode,
  draftOrderOutput,
  lineItems,
  paymentModalActive,
  salesforceCustomer,
  shippingAddress,
  shippingLine,
  taxExempt,
});