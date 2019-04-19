import { createReducer } from '../../utils';

// ======================================================
// INITIAL STATE
// ======================================================
const initialState = {
  isPreloaderVisible: true,
};


// ======================================================
// TYPES
// ======================================================
const PREFIX = 'preLoader';
export const TYPES = {
  TOGGLE_PRELOADER:     `${PREFIX}/TOGGLE_PRELOADER`,
};

// ======================================================
// ACTION CREATORS
// ======================================================
export const actions = {
  actionClosePreLoader() {
    return {
      type: TYPES.TOGGLE_PRELOADER,
    };
  },
};


    // ======================================================
// REDUCER
// ======================================================
const reducer = createReducer(initialState, {
  [TYPES.TOGGLE_PRELOADER]:
    (state) => {
      const { isPreloaderVisible } = state;
      return {
        ...state,
        isPreloaderVisible: !isPreloaderVisible,
      };
    },
});

export default reducer;

