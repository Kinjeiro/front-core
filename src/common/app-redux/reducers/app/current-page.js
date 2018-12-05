import { createReducer } from '../../utils';

// ======================================================
// INITIAL STATE
// ======================================================
const initialState = {
  id: null, // id
  title: null,
  metas: {},
  otherInfo: {},
};


// ======================================================
// TYPES
// ======================================================
const PREFIX = 'currentPage';
export const TYPES = {
  CURRENT_PAGE_CHANGED:     `${PREFIX}/CHANGED`,
  CLEAR_CURRENT_PAGE_INFO:     `${PREFIX}/CLEAR_CURRENT`,
  CLEAR_PAGE_INFO:     `${PREFIX}/CLEAR`,
};


// ======================================================
// ACTION CREATORS
// ======================================================
export const actions = {
  actionCurrentPageChanged(newPageData, replace = false) {
    return {
      type: TYPES.CURRENT_PAGE_CHANGED,
      payload: newPageData,
      replace,
    };
  },
  actionClearCurrentPageInfo(pageId) {
    return {
      type: TYPES.CLEAR_CURRENT_PAGE_INFO,
      payload: pageId,
    };
  },
  actionClearPageInfo() {
    return {
      type: TYPES.CLEAR_PAGE_INFO,
    };
  },
};


// ======================================================
// REDUCER
// ======================================================
const reducer = createReducer(initialState, {
  [TYPES.CURRENT_PAGE_CHANGED]:
    (state, { replace }, newPageData) => ({
      ...(replace ? initialState : state),
      ...newPageData,
    }),
  [TYPES.CLEAR_CURRENT_PAGE_INFO]:
    (state, action, pageId) => {
      return state.id === pageId
        ? initialState
        : state;
    },
  [TYPES.CLEAR_PAGE_INFO]:
    () => initialState,
});

export default reducer;
