import { DEFAULT_VALUES } from '../../../models/user-info';

import { createReducer } from '../../utils';
import { createStatusReducer } from '../../helpers';

// ======================================================
// INITIAL STATE
// ======================================================
export const initialState = {
  // todo @ANKU @CRIT @MAIN - проверить, так как часть инфы приходит с сервера в фиксированном стартовом initialState (без actionChangeUserStatus)
  ...DEFAULT_VALUES,

  actionChangeUserStatus: undefined,
};

// ======================================================
// TYPES
// ======================================================
const PREFIX = 'user-info';
export const TYPES = {
  CHANGE_USER_FETCH:    `${PREFIX}/CHANGE_USER_FETCH`,
  CHANGE_USER_FAIL:     `${PREFIX}/CHANGE_USER_FAIL`,
  CHANGE_USER_SUCCESS:  `${PREFIX}/CHANGE_USER_SUCCESS`,
};


// ======================================================
// ACTION CREATORS
// ======================================================
export const actions = {
  actionChangeUser(apiChangeUser, username, password) {
    return {
      types: [TYPES.CHANGE_USER_FETCH, TYPES.CHANGE_USER_SUCCESS, TYPES.CHANGE_USER_FAIL],
      payload: apiChangeUser(username, password),
    };
  },
};

export function getBindActions({
  apiChangeUser,
}) {
  return {
    ...actions,
    actionChangeUser: actions.actionChangeUser.bind(this, apiChangeUser),
  };
}

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
  },
  {
    actionChangeUserStatus: createStatusReducer(
      TYPES.CHANGE_USER_FETCH, TYPES.CHANGE_USER_SUCCESS, TYPES.CHANGE_USER_FAIL,
    ),
  },
);

export default reducer;
