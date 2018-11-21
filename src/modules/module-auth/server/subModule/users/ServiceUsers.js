import logger from '../../../../../server/helpers/server-logger';
import serverConfig from '../../../../../server/server-config';

import CoreService from '../../../../../server/services/utils/CoreService';

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
      changeUserPassword: '/users/changePassword',
      deleteUser: '/users',
      checkUnique: '/users/unique',

      editUserByAdmin: '/users/{userId}',
      deleteUserByAdmin: '/users/{userId}',
      deleteAllByAdmin: '/users/all',

      getAvatar: '/users/avatar/{userIdOrAliasId}',
      getPublicInfo: '/users/public/{userIdOrAliasId}',
      getProtectedInfo: '/users/protected/{userIdOrAliasId}',
      ...urls,
    };
  }

  // ======================================================
  // NO AUTH
  // ======================================================
  async checkUnique(field, value) {
    logger.debug('ServiceUsers', 'checkUnique', field, value);
    const responseData = await this.send(
      this.urls.checkUnique,
      {
        field,
        value,
      },
    );
    return !responseData || typeof responseData.result === 'undefined' || responseData.result;
  }

  async getAvatar(userIdOrAliasId, key = undefined) {
    logger.debug('ServiceUsers', 'getAvatar', userIdOrAliasId, key);
    const response = await this.send(
      this.urls.getAvatar,
      {
        userIdOrAliasId,
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

  async getPublicInfo(userIdOrAliasId) {
    logger.log('ServiceUsers', 'getPublicInfo', userIdOrAliasId);
    return this.send(
      this.urls.getPublicInfo,
      {
        userIdOrAliasId,
      },
    );
  }

  // ======================================================
  // AUTH
  // ======================================================
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
  async changeUserPassword(newPassword, oldPassword) {
    logger.debug('ServiceUsers', 'changeUserPassword');
    return this.sendWithAuth(
      this.urls.changeUserPassword,
      {
        newPassword,
        oldPassword,
      },
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


  /**
   *
   * @param token - нужен пользователь с ролью 'protector'
   * @param userIdOrAliasId
   * @return {*}
   */
  async getProtectedInfoByToken(userIdOrAliasId, token = undefined) {
    logger.log('ServiceUsers', 'getProtectedInfoByToken', userIdOrAliasId);
    return this.sendWithAuth(
      this.urls.getProtectedInfo,
      {
        userIdOrAliasId,
      },
      {
        token,
      },
    );
  }

  /**
   * @param userIdOrAliasId
   * @return {Promise.<[
     'userId',
     'displayName',
     'aliasId',
     'description',
     'username',
     'firstName',
     'lastName',
     'middleName',
     'email',
     'phone',
     'address',
   ]>}
   */
  async getProtectedInfo(userIdOrAliasId) {
    logger.log('ServiceUsers', 'getProtectedInfo', userIdOrAliasId);
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

    return this.getProtectedInfoByToken(userIdOrAliasId, access_token);
  }


  async editUserByAdmin(userId, userData, token = undefined) {
    logger.log('ServiceUsers', 'editUserByAdmin', userId);
    return this.sendWithAuth(
      this.urls.editUserByAdmin,
      {
        userId,
        ...userData,
      },
      {
        method: 'PUT',
        token,
      },
    );
  }
  async deleteUserByAdmin(userId, token = undefined) {
    logger.log('ServiceUsers', 'deleteUserByAdmin', userId);
    return this.sendWithAuth(
      this.urls.deleteUserByAdmin,
      {
        userId,
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
