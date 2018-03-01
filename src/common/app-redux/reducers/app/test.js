/* eslint-disable max-len */
import { createReducer } from '../../utils';
import { createStatusReducer } from '../../helpers';

import * as api from '../../../api/api-test';

// ======================================================
// INITIAL STATE
// ======================================================
const initialState = {
  result: null,
  actionLoadTestGetStatus: undefined,
};


// ======================================================
// TYPES
// ======================================================
const PREFIX = 'test';
export const TYPES = {
  LOAD_TEST_GET_FETCH:     `${PREFIX}/LOAD_TEST_GET_FETCH`,
  LOAD_TEST_GET_FAIL:      `${PREFIX}/LOAD_TEST_GET_FAIL`,
  LOAD_TEST_GET_SUCCESS:   `${PREFIX}/LOAD_TEST_GET_SUCCESS`,
};


// ======================================================
// ACTION CREATORS
// ======================================================
export function getBindActions({
  apiTestGet,
}) {
  return {
    actionLoadTestGet() {
      return {
        types: [TYPES.LOAD_TEST_GET_FETCH, TYPES.LOAD_TEST_GET_SUCCESS, TYPES.LOAD_TEST_GET_FAIL],
        payload: apiTestGet(),
      };
    },
  };
}

export const actions = getBindActions(api);

// ======================================================
// REDUCER
// ======================================================
const reducer = createReducer(
  initialState,
  {
    [TYPES.LOAD_TEST_GET_SUCCESS]:
      'result',
  },
  {
    actionLoadTestGetStatus: createStatusReducer(
      TYPES.LOAD_TEST_GET_FETCH, TYPES.LOAD_TEST_GET_SUCCESS, TYPES.LOAD_TEST_GET_FAIL,
    ),
  },
);

export default reducer;
