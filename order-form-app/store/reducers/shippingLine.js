import { UPDATE_SHIPPING_LINE } from '../actionTypes';

let initialState = {};

const shippingLine = (state = initialState, { type, payload }) => {
  switch (type) {
    case UPDATE_SHIPPING_LINE:
      return { ...payload.line };
    default:
      return state;
  }
};

export default shippingLine;