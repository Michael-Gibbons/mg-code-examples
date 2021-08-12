import { TOGGLE_PAYMENT_MODAL } from '../actionTypes';

let initialState = false;

const paymentModalActive = (state = initialState, { type, payload }) => {
  switch (type) {
    case TOGGLE_PAYMENT_MODAL:
      return payload.active === null ? !state : payload.active;
    default:
      return state;
  }
};

export default paymentModalActive;