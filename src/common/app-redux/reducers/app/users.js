/* eslint-disable max-len */
import { createReducer } from '../../utils';
import { createStatusReducer } from '../../helpers';

import * as api from '../../../api/api-users';

// ======================================================
// INITIAL STATE
// ======================================================
const initialState = {
  avatarKey: undefined,
  actionUpdateUserStatus: undefined,
  actionChangeUserAvatarStatus: undefined,
  actionDeleteUserStatus: undefined,
};


// ======================================================
// TYPES
// ======================================================
const PREFIX = 'users';
export const TYPES = {
  UPDATE_USER_FETCH:     `${PREFIX}/UPDATE_USER_FETCH`,
  UPDATE_USER_FAIL:      `${PREFIX}/UPDATE_USER_FAIL`,
  UPDATE_USER_SUCCESS:   `${PREFIX}/UPDATE_USER_SUCCESS`,

  CHANGE_USER_AVATAR_FETCH:     `${PREFIX}/CHANGE_USER_AVATAR_FETCH`,
  CHANGE_USER_AVATAR_SUCCESS:   `${PREFIX}/CHANGE_USER_AVATAR_SUCCESS`,
  CHANGE_USER_AVATAR_FAIL:      `${PREFIX}/CHANGE_USER_AVATAR_FAIL`,

  DELETE_USER_FETCH:     `${PREFIX}/DELETE_USER_FETCH`,
  DELETE_USER_SUCCESS:   `${PREFIX}/DELETE_USER_SUCCESS`,
  DELETE_USER_FAIL:      `${PREFIX}/DELETE_USER_FAIL`,
};


// ======================================================
// ACTION CREATORS
// ======================================================
export function getBindActions({
  apiUpdateUser,
  apiChangeUserAvatar,
  apiDeleteUser,
}) {
  return {
    actionUpdateUser(userData) {
      return {
        types: [TYPES.UPDATE_USER_FETCH, TYPES.UPDATE_USER_SUCCESS, TYPES.UPDATE_USER_FAIL],
        payload: apiUpdateUser(userData),
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

export const actions = getBindActions(api);

export const getUserAvatarUrl = api.apiGetUserAvatarUrl;

// ======================================================
// REDUCER
// ======================================================
const reducer = createReducer(
  initialState,
  {
    [TYPES.CHANGE_USER_AVATAR_SUCCESS]:
      (state, { uuid }) => ({
        ...state,
        avatarKey: uuid,
      }),
  },
  {
    actionUpdateUserStatus: createStatusReducer(
      TYPES.UPDATE_USER_FETCH, TYPES.UPDATE_USER_SUCCESS, TYPES.UPDATE_USER_FAIL,
    ),
    actionChangeUserAvatarStatus: createStatusReducer(
      TYPES.CHANGE_USER_AVATAR_FETCH, TYPES.CHANGE_USER_AVATAR_SUCCESS, TYPES.CHANGE_USER_AVATAR_FAIL
    ),
    actionDeleteUserStatus: createStatusReducer(
      TYPES.DELETE_USER_FETCH, TYPES.DELETE_USER_SUCCESS, TYPES.DELETE_USER_FAIL
    ),
  },
);

export default reducer;
