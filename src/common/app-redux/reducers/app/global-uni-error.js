import { createReducer } from '../../utils';

// ======================================================
// INITIAL STATE
// ======================================================
const initialState = null;

// ======================================================
// TYPES
// ======================================================
const PREFIX = 'global-uni-error';
export const TYPES = {
  CHANGE_GLOBAL_UNI_ERROR: `${PREFIX}/CHANGE_GLOBAL_UNI_ERROR`,
  CLEAR_GLOBAL_UNI_ERROR: `${PREFIX}/CLEAR_GLOBAL_UNI_ERROR`,
};


// ======================================================
// ACTION CREATORS
// ======================================================
export const actions = {
  actionChangeGlobalUniError(globalUniError) {
    return {
      type: TYPES.CHANGE_GLOBAL_UNI_ERROR,
      payload: globalUniError || null,
    };
  },
  actionClearGlobalUniError() {
    return {
      type: TYPES.CLEAR_GLOBAL_UNI_ERROR,
    };
  },
};

// ======================================================
// REDUCER
// ======================================================
const reducer = createReducer(
  initialState,
  {
    [TYPES.CHANGE_GLOBAL_UNI_ERROR]:
      (state, action, globalUniError) => globalUniError,
    [TYPES.CLEAR_GLOBAL_UNI_ERROR]:
      () => initialState,
  },
);

export default reducer;
