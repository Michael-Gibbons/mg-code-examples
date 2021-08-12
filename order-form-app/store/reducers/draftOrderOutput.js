import { UPDATE_DRAFT_ORDER_OUTPUT } from '../actionTypes';

let initialState = {};

const draftOrderOutput = (state = initialState, { type, payload }) => {
  switch (type) {
    case UPDATE_DRAFT_ORDER_OUTPUT:
      return { ...payload.order };
    default:
      return state;
  }
};

export default draftOrderOutput;