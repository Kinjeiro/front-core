/* eslint-disable lines-between-class-members */
import logger from '../../../../../server/helpers/server-logger';
import serverConfig from '../../../../../server/server-config';

import CoreService from '../../../../../server/services/utils/CoreService';

export default class ServiceUsers extends CoreService {
  urls = {};

  constructor(endpointServiceConfig, urls, options) {
    super(endpointServiceConfig, options);

    this.urls = {
      ...serverConfig.server.features.serviceUsers.urls,
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
   * @deprecated - use getProtectedInfo
   * @param token - нужен пользователь с ролью 'protector'
   * @param userIdOrAliasId
   * @return {*}
   */
  async getProtectedInfoByToken(userIdOrAliasId, token = undefined) {
    logger.log('ServiceUsers', 'getProtectedInfoByToken', userIdOrAliasId);
    return this.sendWithClientCredentials(
      this.urls.getProtectedInfo,
      {
        userIdOrAliasId,
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
    return this.sendWithClientCredentials(
      this.urls.getProtectedInfo,
      {
        userIdOrAliasId,
      },
    );
  }


  // ======================================================
  // BY ADMIN
  // ======================================================
  async editUserByAdmin(userId, userData) {
    logger.log('ServiceUsers', 'editUserByAdmin', userId);
    return this.sendWithClientCredentials(
      this.urls.editUserByAdmin,
      {
        userId,
        ...userData,
      },
      {
        method: 'PUT',
      },
    );
  }
  async deleteUserByAdmin(userId) {
    logger.log('ServiceUsers', 'deleteUserByAdmin', userId);
    return this.sendWithClientCredentials(
      this.urls.deleteUserByAdmin,
      {
        userId,
      },
      {
        method: 'DELETE',
      },
    );
  }
  async deleteAllByAdmin() {
    logger.log('ServiceUsers', 'deleteAllByAdmin');
    return this.sendWithClientCredentials(
      this.urls.deleteAllByAdmin,
      undefined,
      {
        method: 'DELETE',
      },
    );
  }
}
