import { createApiConfig as api } from '../../../../common/utils/create-api-config';

import sendApiRequest from '../../../../common/utils/send-api-request';

export const API_PREFIX = 'auth';
export const API_CONFIGS = {
  signup: api(`${API_PREFIX}/signup`, 'POST'),
  login: api(`${API_PREFIX}/login`, 'POST'),

  // todo @ANKU @CRIT @MAIN - сделать отдельный один метод с название провайдера
  googleSignin: api(`${API_PREFIX}/google`, 'GET'),
  facebookSignin: api(`${API_PREFIX}/facebook`, 'GET'),
  vkontakteSignin: api(`${API_PREFIX}/vkontakte`, 'GET'),

  refreshLogin: api(`${API_PREFIX}/refreshLogin`),
  logout: api(`${API_PREFIX}/logout`),
  forgot: api(`${API_PREFIX}/forgot`, 'POST'),
  resetPassword: api(`${API_PREFIX}/resetPassword`, 'POST'),
};

export function apiSignup(userData) {
  return sendApiRequest(API_CONFIGS.signup, userData, { isAuth: true });
}
export function apiLogin(username, password) {
  return sendApiRequest(
    API_CONFIGS.login,
    {
      username,
      password,
    },
    {
      isAuth: true,
    },
  );
}

export function apiGoogleSignin() {
  return sendApiRequest(API_CONFIGS.googleSignin, undefined, { isAuth: true });
}
export function apiRefreshLogin() {
  return sendApiRequest(API_CONFIGS.refreshLogin, undefined, { isAuth: true });
}

export function apiLogout() {
  return sendApiRequest(API_CONFIGS.logout, undefined, { isAuth: true });
}

export function apiForgotPassword(email, resetPasswordPageUrl, emailOptions) {
  return sendApiRequest(
    API_CONFIGS.forgot,
    {
      email,
      resetPasswordPageUrl,
      emailOptions,
    },
    {
      isAuth: true,
    },
  );
}
export function apiResetPassword(resetPasswordToken, newPassword, successEmailOptions) {
  return sendApiRequest(
    API_CONFIGS.resetPassword,
    {
      resetPasswordToken,
      newPassword,
      successEmailOptions,
    },
    {
      isAuth: true,
    },
  );
}

export default {
  apiSignup,
  apiLogin,
  apiRefreshLogin,
  apiLogout,
  apiForgotPassword,
  apiResetPassword,
};
