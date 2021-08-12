import { UPDATE_SALESFORCE_CUSTOMER } from '../actionTypes';

let initialState = {};

const salesforceCustomer = (state = initialState, { type, payload }) => {
  switch (type) {
    case UPDATE_SALESFORCE_CUSTOMER:
      return {
        ...state,
        ...payload.customer,
      };
    default:
      return state;
  }
};

export default salesforceCustomer;