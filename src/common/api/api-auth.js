import { createApiConfig as api } from '../utils/create-api-config';

import sendApiRequest from '../utils/send-api-request';

export const API_PREFIX = 'auth';
export const API_CONFIGS = {
  signup: api(`${API_PREFIX}/signup`, 'POST'),
  login: api(`${API_PREFIX}/login`, 'POST'),
  refreshLogin: api(`${API_PREFIX}/refreshLogin`),
  logout: api(`${API_PREFIX}/logout`),
  forgot: api(`${API_PREFIX}/forgot`, 'POST'),
  resetPassword: api(`${API_PREFIX}/resetPassword`, 'POST'),
};

export function apiSignup(userData) {
  return sendApiRequest(API_CONFIGS.signup, userData);
}
export function apiLogin(username, password) {
  return sendApiRequest(API_CONFIGS.login, {
    username,
    password,
  });
}
export function apiRefreshLogin() {
  return sendApiRequest(API_CONFIGS.refreshLogin);
}

export function apiLogout(username) {
  return sendApiRequest(API_CONFIGS.logout, {
    username,
  });
}

export function apiForgotPassword(email, resetPasswordPageUrl, emailOptions) {
  return sendApiRequest(API_CONFIGS.forgot, {
    email,
    resetPasswordPageUrl,
    emailOptions,
  });
}
export function apiResetPassword(resetPasswordToken, newPassword, successEmailOptions) {
  return sendApiRequest(API_CONFIGS.resetPassword, {
    resetPasswordToken,
    newPassword,
    successEmailOptions,
  });
}

export default {
  apiSignup,
  apiLogin,
  apiRefreshLogin,
  apiLogout,
  apiForgotPassword,
  apiResetPassword,
};