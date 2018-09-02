import logger from '../helpers/server-logger';
import serverConfig from '../server-config';

import CoreService from './utils/CoreService';

export default class ServiceUsers extends CoreService {
  urls = {};

  constructor(endpointServiceConfig, urls, options) {
    super(endpointServiceConfig, options);

    this.urls = {
    //   - [GET] /api/users/avatar/:username - получение аватарки в data:image
    // - [GET] /api/users/public/:username - получение публичных данных пользователя
    // - [GET] /api/users/protected/:username - получение частисных данных пользователя (телефон, почта и так далее). **Нужна роль 'protector'**
    //
    // - [PUT] /api/users/ - изменение данных пользователя
    // - [DELETE] /api/users/ - удаление пользователя
    //
    // - [PUT] /api/users/:username - изменение данных пользователя админом
    // - [DELETE] /api/users/:username - удаление пользователя админом
    //
    // - [DELETE] /api/users/all - удаление всех пользователей админом

      editUser: '/users',
      deleteUser: '/users',

      editUserByAdmin: '/users/{username}',
      deleteUserByAdmin: '/users/{username}',
      deleteAllByAdmin: '/users/all',

      getAvatar: '/users/avatar/{username}',
      getPublicInfo: '/users/public/{username}',
      getProtectedInfo: '/users/protected/{username}',
      ...urls,
    };
  }

  async editUser(userData) {
    logger.debug('ServiceUsers', 'editUser');
    return this.sendWithAuth(
      this.urls.editUser,
      userData,
      {
        method: 'PUT',
      },
    );
  }
  async deleteUser() {
    logger.debug('ServiceUsers', 'deleteUser');
    return this.sendWithAuth(
      this.urls.deleteUser,
      undefined,
      {
        method: 'DELETE',
      },
    );
  }


  async getAvatar(username, key = undefined) {
    logger.debug('ServiceUsers', 'getAvatar', username, key);
    const response = await this.sendWithAuth(
      this.urls.getAvatar,
      {
        username,
        key,
      },
      {
        returnResponse: true,
        // todo @ANKU @LOW @BUG_OUT @Request - УЖАСНАЯ БАГА буффер не формируется https://stackoverflow.com/questions/14855015/getting-binary-content-in-node-js-using-request
        // encoding: 'utf8',
        encoding: null,
      },
    );

    return {
      headers: response.headers,
      buffer: response.body,
    };
  }

  async getPublicInfo(username) {
    logger.log('ServiceUsers', 'getPublicInfo', username);
    return this.sendWithAuth(
      this.urls.getPublicInfo,
      {
        username,
      },
    );
  }

  /**
   *
   * @param token - нужен пользователь с ролью 'protector'
   * @param username
   * @return {*}
   */
  async getProtectedInfoByToken(username, token = undefined) {
    logger.log('ServiceUsers', 'getProtectedInfoByToken', username);
    return this.sendWithAuth(
      this.urls.getProtectedInfo,
      {
        username,
      },
      {
        token,
      },
    );
  }

  async getProtectedInfo(username) {
    logger.log('ServiceUsers', 'getProtectedInfo', username);
    const serviceAuth = this.getService('serviceAuth');
    const {
      username: protector,
      password,
    } = serverConfig.server.features.auth.protectorUser;

    if (!serviceAuth) {
      throw new Error('Нет необходимого сервиса serviceAuth.');
    }
    if (!password) {
      // eslint-disable-next-line max-len
      throw new Error(`Не указан пароль для пользователя "${protector}" с ролью "protector" (serverConfig.server.features.auth.protectorUser.password).`);
    }

    const { access_token } = await serviceAuth.authLogin(protector, password);

    return this.getProtectedInfoByToken(username, access_token);
  }


  async editUserByAdmin(username, userData, token = undefined) {
    logger.log('ServiceUsers', 'editUserByAdmin', username);
    return this.sendWithAuth(
      this.urls.editUserByAdmin,
      {
        username,
        ...userData,
      },
      {
        method: 'PUT',
        token,
      },
    );
  }
  async deleteUserByAdmin(username, token = undefined) {
    logger.log('ServiceUsers', 'deleteUserByAdmin', username);
    return this.sendWithAuth(
      this.urls.deleteUserByAdmin,
      {
        username,
      },
      {
        method: 'DELETE',
        token,
      },
    );
  }
  async deleteAllByAdmin(token = undefined) {
    logger.log('ServiceUsers', 'deleteAllByAdmin');
    return this.sendWithAuth(
      this.urls.deleteAllByAdmin,
      undefined,
      {
        method: 'DELETE',
        token,
      },
    );
  }
}
