import { push } from 'react-router-redux';

import { USER_INFO_DEFAULT_VALUES } from '../../../../common/models/model-user-info';

import { createReducer } from '../../../../common/app-redux/utils';
import { createStatusReducer } from '../../../../common/app-redux/helpers/index';
import { actions as errorActions } from '../../../../common/app-redux/reducers/app/last-uni-error';

import * as apiAuth from './api-auth';
import * as apiUsers from './api-users';

// ======================================================
// INITIAL STATE
// ======================================================
export const initialState = {
  // todo @ANKU @CRIT @MAIN - проверить, так как часть инфы приходит с сервера в фиксированном стартовом initialState (без actionChangeUserStatus)
  userData: USER_INFO_DEFAULT_VALUES,

  actionSignupStatus: undefined,
  actionChangeUserStatus: undefined,
  actionUserLogoutStatus: undefined,
  actionForgotPasswordStatus: undefined,
  actionResetPasswordStatus: undefined,

  actionEditUserStatus: undefined,
  actionChangeEmailStatus: undefined,
  avatarKey: undefined,
  actionChangeUserPasswordStatus: undefined,
  actionChangeUserAvatarStatus: undefined,
  actionDeleteUserStatus: undefined,
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


  EDIT_USER_FETCH:     `${PREFIX}/EDIT_USER_FETCH`,
  EDIT_USER_FAIL:      `${PREFIX}/EDIT_USER_FAIL`,
  EDIT_USER_SUCCESS:   `${PREFIX}/EDIT_USER_SUCCESS`,

  CHANGE_EMAIL_FETCH:     `${PREFIX}/CHANGE_EMAIL_FETCH`,
  CHANGE_EMAIL_SUCCESS:   `${PREFIX}/CHANGE_EMAIL_SUCCESS`,
  CHANGE_EMAIL_FAIL:      `${PREFIX}/CHANGE_EMAIL_FAIL`,

  CHANGE_USER_AVATAR_FETCH:     `${PREFIX}/CHANGE_USER_AVATAR_FETCH`,
  CHANGE_USER_AVATAR_SUCCESS:   `${PREFIX}/CHANGE_USER_AVATAR_SUCCESS`,
  CHANGE_USER_AVATAR_FAIL:      `${PREFIX}/CHANGE_USER_AVATAR_FAIL`,

  CHANGE_USER_PASSWORD_FETCH:     `${PREFIX}/CHANGE_USER_PASSWORD_FETCH`,
  CHANGE_USER_PASSWORD_SUCCESS:   `${PREFIX}/CHANGE_USER_PASSWORD_SUCCESS`,
  CHANGE_USER_PASSWORD_FAIL:      `${PREFIX}/CHANGE_USER_PASSWORD_FAIL`,

  DELETE_USER_FETCH:     `${PREFIX}/DELETE_USER_FETCH`,
  DELETE_USER_SUCCESS:   `${PREFIX}/DELETE_USER_SUCCESS`,
  DELETE_USER_FAIL:      `${PREFIX}/DELETE_USER_FAIL`,
};


// ======================================================
// ACTION CREATORS
// ======================================================
export function getBindActions({
  apiSignup,
  apiLogin,
  apiLogout,
  apiForgotPassword,
  apiResetPassword,

  apiEditUser,
  apiChangeUserPassword,
  apiChangeUserAvatar,
  apiDeleteUser,
}) {
  const actionSignin = (username, password) => {
    return {
      types: [TYPES.CHANGE_USER_FETCH, TYPES.CHANGE_USER_SUCCESS, TYPES.CHANGE_USER_FAIL],
      payload: apiLogin(username, password),
    };
  };

  return {
    actionCloseAuthModal() {
      return (dispatch) => {
        return dispatch(errorActions.actionClearLastError());
      };
    },

    actionSignup(userData) {
      return {
        types: [TYPES.SIGNUP_FETCH, TYPES.SIGNUP_SUCCESS, TYPES.SIGNUP_FAIL],
        payload: apiSignup(userData),
      };
    },
    actionSignin,
    /**
     * @deprecated use actionSignin
     */
    actionChangeUser: actionSignin,
    actionUserLogout() {
      return async (dispatch, getState) => {
        await dispatch({
          types: [TYPES.USER_LOGOUT_FETCH, TYPES.USER_LOGOUT_SUCCESS, TYPES.USER_LOGOUT_FAIL],
          payload: apiLogout()
            .then(() => {
              // до USER_LOGOUT_SUCCESS чтобы компоненты уже заанмаунтились и пропсы в них не поменялись когда пользователя уже и нет
              dispatch(push('/'));
            }),
        });
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

    // ======================================================
    // USERS
    // ======================================================
    actionEditUser(userData) {
      return {
        types: [TYPES.EDIT_USER_FETCH, TYPES.EDIT_USER_SUCCESS, TYPES.EDIT_USER_FAIL],
        payload: apiEditUser(userData)
          .then((user) => user || userData),
      };
    },
    actionChangeEmail(email) {
      return {
        types: [TYPES.CHANGE_EMAIL_FETCH, TYPES.CHANGE_EMAIL_SUCCESS, TYPES.CHANGE_EMAIL_FAIL],
        payload: apiEditUser({
          email,
        })
          .then((newEmail) => newEmail || email),
      };
    },
    actionChangeUserPassword(newPassword, oldPassword) {
      return {
        types: [TYPES.CHANGE_USER_PASSWORD_FETCH, TYPES.CHANGE_USER_PASSWORD_SUCCESS, TYPES.CHANGE_USER_PASSWORD_FAIL],
        payload: apiChangeUserPassword(newPassword, oldPassword),
      };
    },
    actionChangeUserAvatar(file) {
      return {
        uuid: Math.random(),
        types: [TYPES.CHANGE_USER_AVATAR_FETCH, TYPES.CHANGE_USER_AVATAR_SUCCESS, TYPES.CHANGE_USER_AVATAR_FAIL],
        payload: apiChangeUserAvatar(file),
      };
    },
    actionDeleteUser() {
      return {
        types: [TYPES.DELETE_USER_FETCH, TYPES.DELETE_USER_SUCCESS, TYPES.DELETE_USER_FAIL],
        payload: apiDeleteUser(),
      };
    },
  };
}

export const actions = getBindActions({
  ...apiAuth,
  ...apiUsers,
});

export const getUserAvatarUrl = apiUsers.apiGetUserAvatarUrl;

// ======================================================
// REDUCER
// ======================================================
export const reducer = createReducer(
  initialState,
  {
    [TYPES.CHANGE_USER_SUCCESS]:
      'userData',
    [TYPES.SIGNUP_SUCCESS]:
      'userData',
    [TYPES.USER_LOGOUT_SUCCESS]:
      (state) => ({
        ...state,
        userData: null,
      }),

    [TYPES.EDIT_USER_SUCCESS]:
      (state, action, userData) => ({
        ...state,
        userData: {
          ...state.userData,
          ...userData,
        },
      }),
    [TYPES.CHANGE_EMAIL_SUCCESS]:
      (state, action, email) => ({
        ...state,
        userData: {
          ...state.userData,
          email,
        },
      }),
    [TYPES.CHANGE_USER_AVATAR_SUCCESS]:
      (state, { uuid }) => ({
        ...state,
        avatarKey: uuid,
      }),
    [TYPES.DELETE_USER_SUCCESS]:
      (state) => ({
        ...state,
        userData: null,
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

    actionEditUserStatus: createStatusReducer(
      TYPES.EDIT_USER_FETCH, TYPES.EDIT_USER_SUCCESS, TYPES.EDIT_USER_FAIL,
    ),
    actionChangeUserPasswordStatus: createStatusReducer(
      TYPES.CHANGE_USER_PASSWORD_FETCH, TYPES.CHANGE_USER_PASSWORD_SUCCESS, TYPES.CHANGE_USER_PASSWORD_FAIL,
    ),
    actionChangeUserAvatarStatus: createStatusReducer(
      TYPES.CHANGE_USER_AVATAR_FETCH, TYPES.CHANGE_USER_AVATAR_SUCCESS, TYPES.CHANGE_USER_AVATAR_FAIL,
    ),
    actionDeleteUserStatus: createStatusReducer(
      TYPES.DELETE_USER_FETCH, TYPES.DELETE_USER_SUCCESS, TYPES.DELETE_USER_FAIL,
    ),
    actionChangeEmailStatus: createStatusReducer(
      TYPES.CHANGE_EMAIL_FETCH, TYPES.CHANGE_EMAIL_SUCCESS, TYPES.CHANGE_EMAIL_FAIL,
    ),
  },
);

export default reducer;
