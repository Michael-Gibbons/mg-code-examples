import { UPDATE_BILLING_ADDRESS } from '../actionTypes';

let initialState = {};

const billingAddress = (state = initialState, { type, payload }) => {
  switch (type) {
    case UPDATE_BILLING_ADDRESS:
      return {
        ...state,
        ...payload.address,
      };
    default:
      return state;
  }
};

export default billingAddress;