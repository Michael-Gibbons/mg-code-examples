import { UPDATE_LINE_ITEMS, APPLY_LINE_ITEM_DISCOUNT } from '../actionTypes';

let initialState = [];

const lineItems = (state = initialState, { type, payload }) => {
  switch (type) {
    case UPDATE_LINE_ITEMS:
      return [ ...payload.items ];
    case APPLY_LINE_ITEM_DISCOUNT:
      const newLineItems = [...lineItems];
      newLineItems[payload.index].appliedDiscount = payload.appliedDiscount;
      return newLineItems;
    default:
      return state;
  }
};

export default lineItems;