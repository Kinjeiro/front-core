import { createApiConfig as api } from '../utils/create-api-config';
import { readAsDataURL } from '../utils/api-utils';
import sendApiRequest from '../utils/send-api-request';
import ImageTools from '../utils/image-utils';
import logger from '../helpers/client-logger';

export const API_PREFIX = 'users';
export const API_CONFIGS = {
  editUser: api(`${API_PREFIX}/`, 'PUT'),
  deleteUser: api(`${API_PREFIX}/`, 'DELETE'),

  avatar: api(`${API_PREFIX}/avatar/{username}`, 'GET'),
};

/**
 * синхронный метод, дает только урл, по которому вернется картинка
 *
 * @param username
 */
export function apiGetUserAvatarUrl(username) {
  return API_CONFIGS.avatar.path.replace(/{username}/gi, username);
}
export function apiEditUser(userData) {
  return sendApiRequest(API_CONFIGS.editUser, userData);
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
export function apiDeleteUser() {
  return sendApiRequest(API_CONFIGS.deleteUser);
}

export default {
  apiGetUserAvatarUrl,

  apiEditUser,
  apiDeleteUser,
};
