import { createUniError } from '../../../models/uni-error';

import { ACTION_PROMISE_UNI_ERROR_FIELD } from '../../middlewares/promise-middleware';

// ======================================================
// INITIAL STATE
// ======================================================
const initialState = null;

// ======================================================
// TYPES
// ======================================================
const PREFIX = 'lastError';
export const TYPES = {
  THROW_NOT_AUTH_ERROR: `${PREFIX}/THROW_NOT_AUTH_ERROR`,
  CLEAR_LAST_ERROR:     `${PREFIX}/CLEAR_LAST_ERROR`,
};


// ======================================================
// ACTION CREATORS
// ======================================================
export function getBindActions() {
  return {
    actionThrowNotAuthError(linkForwardTo = undefined) {
      return {
        type: TYPES.THROW_NOT_AUTH_ERROR,
        payload: createUniError({
          isNotAuth: true,
          linkForwardTo,
        }),
      };
    },
    actionClearLastError() {
      return {
        type: TYPES.CLEAR_LAST_ERROR,
      };
    },
  };
}

export const actions = getBindActions();

// ======================================================
// REDUCER
// ======================================================
export default function lastUniError(state = initialState, action) {
  // проставляется в promise-middleware
  if (action.type === TYPES.CLEAR_LAST_ERROR) {
    return initialState;
  }
  if (action.type === TYPES.THROW_NOT_AUTH_ERROR) {
    return action.payload;
  }
  return action[ACTION_PROMISE_UNI_ERROR_FIELD] || state;
}
