import { UPDATE_APPLIED_DISCOUNT, CLEAR_APPLIED_DISCOUNT } from '../actionTypes';

let initialState = {
  value: 0,
  valueType: 'PERCENTAGE',
  description: '',
};

const appliedDiscount = (state = initialState, { type, payload }) => {
  switch (type) {
    case UPDATE_APPLIED_DISCOUNT:
      return { ...payload.discount };
    case CLEAR_APPLIED_DISCOUNT:
      return { ...initialState };
    default:
      return state;
  }
};

export default appliedDiscount;