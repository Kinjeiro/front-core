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

  actionSignupStatus: undefined,
  actionChangeUserStatus: undefined,
  actionUserLogoutStatus: undefined,
  actionForgotPasswordStatus: undefined,
  actionResetPasswordStatus: undefined,
};

// ======================================================
// TYPES
// ======================================================
const PREFIX = 'user-info';
export const TYPES = {
  SIGNUP_FETCH:     `${PREFIX}/SIGNUP_FETCH`,
  SIGNUP_SUCCESS:   `${PREFIX}/SIGNUP_SUCCESS`,
  SIGNUP_FAIL:      `${PREFIX}/SIGNUP_FAIL`,

  CHANGE_USER_FETCH:    `${PREFIX}/CHANGE_USER_FETCH`,
  CHANGE_USER_FAIL:     `${PREFIX}/CHANGE_USER_FAIL`,
  CHANGE_USER_SUCCESS:  `${PREFIX}/CHANGE_USER_SUCCESS`,

  USER_LOGOUT_FETCH:     `${PREFIX}/USER_LOGOUT_FETCH`,
  USER_LOGOUT_SUCCESS:   `${PREFIX}/USER_LOGOUT_SUCCESS`,
  USER_LOGOUT_FAIL:      `${PREFIX}/USER_LOGOUT_FAIL`,

  USER_FORGOT_PASSWORD_FETCH:     `${PREFIX}/USER_FORGOT_PASSWORD_FETCH`,
  USER_FORGOT_PASSWORD_SUCCESS:   `${PREFIX}/USER_FORGOT_PASSWORD_SUCCESS`,
  USER_FORGOT_PASSWORD_FAIL:      `${PREFIX}/USER_FORGOT_PASSWORD_FAIL`,

  USER_RESET_PASSWORD_FETCH:     `${PREFIX}/USER_RESET_PASSWORD_FETCH`,
  USER_RESET_PASSWORD_SUCCESS:   `${PREFIX}/USER_RESET_PASSWORD_SUCCESS`,
  USER_RESET_PASSWORD_FAIL:      `${PREFIX}/USER_RESET_PASSWORD_FAIL`,
};


// ======================================================
// ACTION CREATORS
// ======================================================
export function getBindActions({
  apiSignup,
  apiChangeUser,
  apiUserLogout,
  apiForgotPassword,
  apiResetPassword,
}) {
  return {
    actionSignup(userData) {
      return {
        types: [TYPES.SIGNUP_FETCH, TYPES.SIGNUP_SUCCESS, TYPES.SIGNUP_FAIL],
        payload: apiSignup(userData),
      };
    },
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
    actionForgotPassword(email, resetPasswordPageUrl, emailOptions) {
      return {
        types: [TYPES.USER_FORGOT_PASSWORD_FETCH, TYPES.USER_FORGOT_PASSWORD_SUCCESS, TYPES.USER_FORGOT_PASSWORD_FAIL],
        payload: apiForgotPassword(email, resetPasswordPageUrl, emailOptions),
      };
    },
    actionResetPassword(resetPasswordToken, newPassword, successEmailOptions) {
      return {
        types: [TYPES.USER_RESET_PASSWORD_FETCH, TYPES.USER_RESET_PASSWORD_SUCCESS, TYPES.USER_RESET_PASSWORD_FAIL],
        payload: apiResetPassword(resetPasswordToken, newPassword, successEmailOptions),
      };
    },
  };
}

export const actions = getBindActions({
  ...api,
  apiSignup: api.apiSignup,
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
    actionSignupStatus: createStatusReducer(
      TYPES.SIGNUP_FETCH, TYPES.SIGNUP_SUCCESS, TYPES.SIGNUP_FAIL,
    ),
    actionChangeUserStatus: createStatusReducer(
      TYPES.CHANGE_USER_FETCH, TYPES.CHANGE_USER_SUCCESS, TYPES.CHANGE_USER_FAIL,
    ),
    actionUserLogoutStatus: createStatusReducer(
      TYPES.USER_LOGOUT_FETCH, TYPES.USER_LOGOUT_SUCCESS, TYPES.USER_LOGOUT_FAIL,
    ),
    actionForgotPasswordStatus: createStatusReducer(
      TYPES.USER_FORGOT_PASSWORD_FETCH, TYPES.USER_FORGOT_PASSWORD_SUCCESS, TYPES.USER_FORGOT_PASSWORD_FAIL,
    ),
    actionResetPasswordStatus: createStatusReducer(
      TYPES.USER_RESET_PASSWORD_FETCH, TYPES.USER_RESET_PASSWORD_SUCCESS, TYPES.USER_RESET_PASSWORD_FAIL,
    ),
  },
);

export default reducer;
