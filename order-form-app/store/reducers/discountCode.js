import { UPDATE_DISCOUNT_CODE, CLEAR_DISCOUNT_CODE } from '../actionTypes';

let initialState = {
  codeDiscount: {
    title: '',
    customerSelection: [],
  },
};

const discountCode = (state = initialState, { type, payload }) => {
  switch (type) {
    case UPDATE_DISCOUNT_CODE:
      return { ...payload.discount };
    case CLEAR_DISCOUNT_CODE:
      return { ...initialState };
    default:
      return state;
  }
};

export default discountCode;