import { UPDATE_SHIPPING_ADDRESS } from '../actionTypes';

let initialState = {};

const shippingAddress = (state = initialState, { type, payload }) => {
  switch (type) {
    case UPDATE_SHIPPING_ADDRESS:
      return {
        ...state,
        ...payload.address,
      };
    default:
      return state;
  }
};

export default shippingAddress;