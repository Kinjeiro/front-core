import { sendWithAuth } from '../utils/send-server-request';
import logger from '../helpers/server-logger';

import serverConfig from '../server-config';

export default class ServiceUsers {
  endpointServiceConfig = null;
  urls = {};
  services = {};

  constructor({
    endpointServiceConfig,
    urls,
    services,
  }) {
    this.services = services;
    this.endpointServiceConfig = endpointServiceConfig;

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

  async editUser(token, userData) {
    logger.debug('ServiceUsers', 'editUser');
    return sendWithAuth(
      token,
      this.endpointServiceConfig,
      this.urls.editUser,
      'PUT',
      userData,
    );
  }
  async deleteUser(token) {
    logger.debug('ServiceUsers', 'deleteUser');
    return sendWithAuth(
      token,
      this.endpointServiceConfig,
      this.urls.deleteUser,
      'DELETE',
    );
  }


  async getAvatar(token, username) {
    logger.debug('ServiceUsers', 'getAvatar', username);
    const response = await sendWithAuth(
      token,
      this.endpointServiceConfig,
      this.urls.getAvatar,
      'GET',
      {
        username,
      },
      null,
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
  async getPublicInfo(token, username) {
    logger.log('ServiceUsers', 'getPublicInfo', username);
    return sendWithAuth(
      token,
      this.endpointServiceConfig,
      this.urls.getPublicInfo,
      'GET',
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
  async getProtectedInfoByToken(token, username) {
    logger.log('ServiceUsers', 'getProtectedInfoByToken', username);
    return sendWithAuth(
      token,
      this.endpointServiceConfig,
      this.urls.getProtectedInfo,
      'GET',
      {
        username,
      },
    );
  }

  async getProtectedInfo(username) {
    const {
      authUserService,
    } = this.services;
    const {
      username: protector,
      password,
    } = serverConfig.server.features.auth.protectorUser;

    if (!authUserService) {
      throw new Error('Нет необходимого сервиса authUserService.');
    }
    if (!password) {
      throw new Error(`Не указан пароль для пользователя "${protector}" с ролью "protector" (serverConfig.server.features.auth.protectorUser.password).`);
    }

    const { access_token } = await authUserService.authLogin(protector, password);

    return this.getProtectedInfoByToken(access_token, username);
  }


  async editUserByAdmin(token, username, userData) {
    // todo @ANKU @LOW - заиспользовать разные типы
    return sendWithAuth(
      token,
      this.endpointServiceConfig,
      this.urls.editUserByAdmin,
      'PUT',
      {
        username,
        ...userData,
      },
    );
  }
  async deleteUserByAdmin(token, username) {
    logger.log('ServiceUsers', 'deleteUserByAdmin', username);
    return sendWithAuth(
      token,
      this.endpointServiceConfig,
      this.urls.deleteUserByAdmin,
      'DELETE',
      {
        username,
      },
    );
  }
  async deleteAllByAdmin(token) {
    logger.log('ServiceUsers', 'deleteAllByAdmin');
    return sendWithAuth(
      token,
      this.endpointServiceConfig,
      this.urls.deleteAllByAdmin,
      'DELETE',
    );
  }
}
