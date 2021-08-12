import { UPDATE_REFERRED_FROM } from '../actionTypes';

let initialState = '';

const referredFrom = (state = initialState, { type, payload }) => {
  switch (type) {
    case UPDATE_REFERRED_FROM:
      return payload.referredFrom;
    default:
      return state;
  }
};

export default referredFrom;