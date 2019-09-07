import { createApiConfig as api } from '../../../../common/utils/create-api-config';
import { readAsDataURL } from '../../../../common/utils/api-utils';
import sendApiRequest from '../../../../common/utils/send-api-request';
import ImageTools from '../../../../common/utils/image-utils';
import logger from '../../../../common/helpers/client-logger';

export const API_PREFIX = 'users';
export const API_CONFIGS = {
  signup: api(`${API_PREFIX}/signup`, 'POST'),
  forgot: api(`${API_PREFIX}/forgot`, 'POST'),
  resetPasswordByUser: api(`${API_PREFIX}/resetPasswordByUser`, 'POST'),

  editUserByUser: api(`${API_PREFIX}/`, 'PUT'),
  deleteUserByUser: api(`${API_PREFIX}/`, 'DELETE'),
  changePassword: api(`${API_PREFIX}/changePassword`, 'PUT'),

  checkUnique: api(`${API_PREFIX}/checkUnique`, 'GET'),
  avatar: api(`${API_PREFIX}/avatar/{userIdOrAliasId}`, 'GET'),
  getPublicInfo: api(`${API_PREFIX}/public/{userIdOrAliasId}`, 'GET'),
};

export function apiSignup(userData) {
  return sendApiRequest(API_CONFIGS.signup, userData, { isAuth: true });
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
    API_CONFIGS.resetPasswordByUser,
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

/**
 * синхронный метод, дает только урл, по которому вернется картинка
 *
 * @param userId
 * @param key
 */
export function apiGetUserAvatarUrl(userIdOrAliasId, key = null) {
  return `${API_CONFIGS.avatar.path.replace(/{userIdOrAliasId}/gi, userIdOrAliasId)}\
  ${key ? `?key=${encodeURI(key)}` : ''}`;
}
export function apiEditUser(userData) {
  return sendApiRequest(API_CONFIGS.editUserByUser, userData);
}
export async function apiChangeUserAvatar(file) {
  return new Promise((resolve, reject) => {
    const support = ImageTools.resize(
      file,
      {
        width: 240,
        height: 240,
      },
      async (blob, didItResize) => {
        try {
          // didItResize will be true if it managed to resize it, otherwise false (and will return the original file as 'blob')
          // const dataUrl = window.URL.createObjectURL(blob);
          const dataUrl = await readAsDataURL(blob);
          const result = await apiEditUser({
            // храним все в dataUrl
            profileImageURI: dataUrl,
          });

          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
    );
    if (!support) {
      logger.debug(`${file.name} not support resizing.`);
    }
    return support;
  });
}
export function apiChangeUserPassword(newPassword, oldPassword) {
  return sendApiRequest(API_CONFIGS.changePassword, {
    newPassword,
    oldPassword,
  });
}
export function apiCheckUnique(field, value) {
  return sendApiRequest(API_CONFIGS.checkUnique, {
    field,
    value,
  });
}
export function apiGetPublicInfo(userIdOrAliasId) {
  return sendApiRequest(API_CONFIGS.getPublicInfo, { userIdOrAliasId });
}
export function apiDeleteUser() {
  return sendApiRequest(API_CONFIGS.deleteUserByUser);
}
