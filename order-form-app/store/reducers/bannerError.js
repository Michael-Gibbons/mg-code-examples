import { UPDATE_BANNER_ERROR } from '../actionTypes';

let initialState = {
  title: '',
  text: '',
};

const bannerError = (state = initialState, { type, payload }) => {
  switch (type) {
    case UPDATE_BANNER_ERROR:
      return { ...payload.message };
    default:
      return state;
  }
};

export default bannerError;