import { USER_INFO_DEFAULT_VALUES } from '../../../models/model-user-info';

import { createReducer } from '../../utils';
import { createStatusReducer } from '../../helpers';

import * as api from '../../../api/api-user';

// ======================================================
// INITIAL STATE
// ======================================================
export const initialState = {
  // todo @ANKU @CRIT @MAIN - проверить, так как часть инфы приходит с сервера в фиксированном стартовом initialState (без actionChangeUserStatus)
  ...USER_INFO_DEFAULT_VALUES,

  actionChangeUserStatus: undefined,
  actionUserLogoutStatus: undefined,
};

// ======================================================
// TYPES
// ======================================================
const PREFIX = 'user-info';
export const TYPES = {
  CHANGE_USER_FETCH:    `${PREFIX}/CHANGE_USER_FETCH`,
  CHANGE_USER_FAIL:     `${PREFIX}/CHANGE_USER_FAIL`,
  CHANGE_USER_SUCCESS:  `${PREFIX}/CHANGE_USER_SUCCESS`,

  USER_LOGOUT_FETCH:     `${PREFIX}/USER_LOGOUT_FETCH`,
  USER_LOGOUT_SUCCESS:   `${PREFIX}/USER_LOGOUT_SUCCESS`,
  USER_LOGOUT_FAIL:      `${PREFIX}/USER_LOGOUT_FAIL`,
};


// ======================================================
// ACTION CREATORS
// ======================================================
export function getBindActions({
  apiChangeUser,
  apiUserLogout,
}) {
  return {
    actionChangeUser(username, password) {
      return {
        types: [TYPES.CHANGE_USER_FETCH, TYPES.CHANGE_USER_SUCCESS, TYPES.CHANGE_USER_FAIL],
        payload: apiChangeUser(username, password),
      };
    },
    actionUserLogout() {
      return {
        types: [TYPES.USER_LOGOUT_FETCH, TYPES.USER_LOGOUT_SUCCESS, TYPES.USER_LOGOUT_FAIL],
        payload: apiUserLogout(),
      };
    },
  };
}

export const actions = getBindActions({
  apiChangeUser: api.apiLogin,
  apiUserLogout: api.apiLogout,
});

// ======================================================
// REDUCER
// ======================================================
export const reducer = createReducer(
  initialState,
  {
    [TYPES.CHANGE_USER_SUCCESS]:
      (state, action, userInfo) => ({
        ...state,
        ...userInfo,
      }),
    [TYPES.USER_LOGOUT_SUCCESS]:
      (state) => ({
        ...state,
        ...USER_INFO_DEFAULT_VALUES,
      }),
  },
  {
    actionChangeUserStatus: createStatusReducer(
      TYPES.CHANGE_USER_FETCH, TYPES.CHANGE_USER_SUCCESS, TYPES.CHANGE_USER_FAIL,
    ),
    actionUserLogoutStatus: createStatusReducer(
      TYPES.USER_LOGOUT_FETCH, TYPES.USER_LOGOUT_SUCCESS, TYPES.USER_LOGOUT_FAIL
    ),
  },
);

export default reducer;
