import { TOGGLE_TAX_EXEMPT } from '../actionTypes';

let initialState = false;

const taxExempt = (state = initialState, { type, payload }) => {
  switch (type) {
    case TOGGLE_TAX_EXEMPT:
      return payload.exempt === null ? !state : payload.exempt;
    default:
      return state;
  }
};

export default taxExempt;