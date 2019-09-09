/* eslint-disable import/prefer-default-export */
import apiConfig from '../../../../common/utils/create-api-config';
import sendApi from '../../../../common/utils/send-api-request';

export const API_PREFIX = 'sms';
export const API_CONFIGS = {
  apiSendSmsCode: apiConfig(`/${API_PREFIX}/send`, 'POST'),
  // apiVerifyLastSmsCode: apiConfig(`/${API_PREFIX}/verifyLast`, 'GET'),
};

export function apiSendSmsCode(phone, preCodeText, userIdentify) {
  return sendApi(API_CONFIGS.apiSendSmsCode, { phone, preCodeText, userIdentify });
}
// export function apiVerifyLastSmsCode(inputSmsCode) {
//   return sendApi(API_CONFIGS.apiVerifyLastSmsCode, { inputSmsCode });
// }
