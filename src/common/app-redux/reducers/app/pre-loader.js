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
  TOOGLE_PRELOADER:     `${PREFIX}/TOOGLE_PRELOADER`,
};

// ======================================================
// ACTION CREATORS
// ======================================================
export const actions = {
  actionClosePreLoader() {
    return {
      type: TYPES.TOOGLE_PRELOADER,
    };
  } };


    // ======================================================
// REDUCER
// ======================================================
const reducer = createReducer(initialState, {
  [TYPES.TOOGLE_PRELOADER]:
      (state) => {
        const { isPreloaderVisible } = state;
        return {
          ...state,
          isPreloaderVisible: !isPreloaderVisible,
        };
      },
});

export default reducer;

