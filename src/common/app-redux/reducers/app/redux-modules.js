/* eslint-disable max-len */
import { createReducer } from '../../utils';
// import { createStatusReducer } from '../../helpers';

// import * as api from '../../api/';

// ======================================================
// INITIAL STATE
// ======================================================
const initialState = {
  moduleToRoutePrefixMap: {},
};


// ======================================================
// TYPES
// ======================================================
const PREFIX = 'modules';
export const TYPES = {
  INIT_MODULES_ROUTE_PREFIXES: `${PREFIX}/INIT_MODULES_ROUTE_PREFIXES`,
};


// ======================================================
// ACTION CREATORS
// ======================================================
export function getBindActions({
  api,
}) {
  return {
    actionInitModulesRoutePrefixes(moduleToRoutePrefixMap) {
      return {
        type: TYPES.INIT_MODULES_ROUTE_PREFIXES,
        payload: moduleToRoutePrefixMap,
      };
    },
  };
}

export const actions = getBindActions({});

// ======================================================
// REDUCER
// ======================================================
const reducer = createReducer(
  initialState,
  {
    [TYPES.INIT_MODULES_ROUTE_PREFIXES]:
      'moduleToRoutePrefixMap',
  },
);

export default reducer;
