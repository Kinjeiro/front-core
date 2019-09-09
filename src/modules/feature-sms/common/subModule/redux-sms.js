/* eslint-disable max-len */
import { createStatusReducer } from '../../../../common/app-redux/helpers';
import { createReducer } from '../../../../common/app-redux/utils';
import * as api from './api-sms';

// ======================================================
// INITIAL STATE
// ======================================================
const initialState = {
  actionSendSmsCodeStatus: undefined,
  // actionVerifyLastSmsCodeStatus: undefined,
};


// ======================================================
// TYPES
// ======================================================
const PREFIX = 'sms';
export const TYPES = {
  SEND_SMS_CODE_FETCH:     `${PREFIX}/SEND_SMS_CODE_FETCH`,
  SEND_SMS_CODE_SUCCESS:   `${PREFIX}/SEND_SMS_CODE_SUCCESS`,
  SEND_SMS_CODE_FAIL:      `${PREFIX}/SEND_SMS_CODE_FAIL`,

  // VERIFY_LAST_SMS_CODE_FETCH:     `${PREFIX}/VERIFY_LAST_SMS_CODE_FETCH`,
  // VERIFY_LAST_SMS_CODE_SUCCESS:   `${PREFIX}/VERIFY_LAST_SMS_CODE_SUCCESS`,
  // VERIFY_LAST_SMS_CODE_FAIL:      `${PREFIX}/VERIFY_LAST_SMS_CODE_FAIL`,
};


// ======================================================
// ACTION CREATORS
// ======================================================
export function getBindActions({
  apiSendSmsCode,
  // apiVerifyLastSmsCode,
}) {
  return {
    actionSendSmsCode(phone, preCodeText, userIdentify) {
      return {
        types: [TYPES.SEND_SMS_CODE_FETCH, TYPES.SEND_SMS_CODE_SUCCESS, TYPES.SEND_SMS_CODE_FAIL],
        payload: apiSendSmsCode(phone, preCodeText, userIdentify),
      };
    },

    // actionVerifyLastSmsCode(inputSmsCode) {
    //   return {
    //     types: [TYPES.VERIFY_LAST_SMS_CODE_FETCH, TYPES.VERIFY_LAST_SMS_CODE_SUCCESS, TYPES.VERIFY_LAST_SMS_CODE_FAIL],
    //     payload: apiVerifyLastSmsCode(inputSmsCode),
    //   };
    // },
  };
}

export const actions = getBindActions(api);

// ======================================================
// REDUCER
// ======================================================
const reducer = createReducer(
  initialState,
  {
    // [TYPES.SEND_SMS_CODE_FETCH]: (state) => ({
    //   ...state,
    //   // сбрасываем старую проверку
    //   actionVerifyLastSmsCodeStatus: ACTION_STATUS_INIT,
    // }),
  },
  {
    actionSendSmsCodeStatus: createStatusReducer(
      TYPES.SEND_SMS_CODE_FETCH, TYPES.SEND_SMS_CODE_SUCCESS, TYPES.SEND_SMS_CODE_FAIL,
    ),
    // actionVerifyLastSmsCodeStatus: createStatusReducer(
    //   TYPES.VERIFY_LAST_SMS_CODE_FETCH, TYPES.VERIFY_LAST_SMS_CODE_SUCCESS, TYPES.VERIFY_LAST_SMS_CODE_FAIL,
    // ),
  },
);

// нету никаких редьюсеров
export default {
  sms: reducer,
};
