import { createApiConfig as api } from '../../../../common/utils/create-api-config';

import sendApiRequest from '../../../../common/utils/send-api-request';

export const API_PREFIX = 'auth';
export const API_CONFIGS = {
  login: api(`${API_PREFIX}/login`, 'POST'),

  // todo @ANKU @CRIT @MAIN - сделать отдельный один метод с название провайдера
  googleSignin: api(`${API_PREFIX}/google`, 'GET'),
  facebookSignin: api(`${API_PREFIX}/facebook`, 'GET'),
  vkontakteSignin: api(`${API_PREFIX}/vkontakte`, 'GET'),

  refreshLogin: api(`${API_PREFIX}/refreshLogin`),
  logout: api(`${API_PREFIX}/logout`),
};

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
