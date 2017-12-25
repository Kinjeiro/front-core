import { createApiConfig as api } from '../utils/create-api-config';

import sendApiRequest from '../utils/send-api-request';

export const API_PREFIX = 'apiUserInfo';
export const API_CONFIGS = {
  login: api(`${API_PREFIX}/login`, 'POST'),
  refreshLogin: api(`${API_PREFIX}/refreshLogin`),
  logout: api(`${API_PREFIX}/logout`),
};

function apiLogin(username, password) {
  return sendApiRequest(API_CONFIGS.login, {
    username,
    password,
  });
}
function apiRefreshLogin() {
  return sendApiRequest(API_CONFIGS.refreshLogin);
}

function apiLogout(username) {
  return sendApiRequest(API_CONFIGS.logout, {
    username,
  });
}

export default {
  apiLogin,
  apiRefreshLogin,
  apiLogout,
};
