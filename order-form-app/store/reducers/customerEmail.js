import { UPDATE_CUSTOMER_EMAIL } from '../actionTypes';

let initialState = '';

const customerEmail = (state = initialState, { type, payload }) => {
  switch (type) {
    case UPDATE_CUSTOMER_EMAIL:
      return payload.email;
    default:
      return state;
  }
};

export default customerEmail;