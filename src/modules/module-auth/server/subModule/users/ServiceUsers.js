/* eslint-disable lines-between-class-members */
import logger from '../../../../../server/helpers/server-logger';
import serverConfig from '../../../../../server/server-config';

import CoreService from '../../../../../server/services/utils/CoreService';
import { CONTENT_TYPES } from '../../../../../server/utils/send-server-request';

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
  // UTILS
  // ======================================================
  serializeUserToStorageData(user) {
    return this.getService('serviceAuth').serializeUserToStorageData(user);
  }
  parseToFullUserInfo(user) {
    return this.getService('serviceAuth').parseUserFromOpenidData(user);
  }
  parseToProtectedUserInfo(user) {
    return user;
  }
  parseToPublicUserInfo(user) {
    return {};
  }

  // ======================================================
  // NO AUTH
  // ======================================================
  async checkUnique(field, value) {
    logger.debug('ServiceUsers', 'checkUnique', field, value);
    throw new Error('Not implemented');
    // const responseData = await this.send(
    //   this.urls.checkUnique,
    //   {
    //     field,
    //     value,
    //   },
    // );
    // return !responseData || typeof responseData.result === 'undefined' || responseData.result;
  }

  async getAvatar(userIdOrAliasId, key = undefined) {
    logger.debug('ServiceUsers', 'getAvatar', userIdOrAliasId, key);
    throw new Error('Not implemented');
    // const response = await this.send(
    //   this.urls.getAvatar,
    //   {
    //     userIdOrAliasId,
    //     key,
    //   },
    //   {
    //     returnResponse: true,
    //     // todo @ANKU @LOW @BUG_OUT @request - УЖАСНАЯ БАГА буффер не формируется https://stackoverflow.com/questions/14855015/getting-binary-content-in-node-js-using-request
    //     // encoding: 'utf8',
    //     encoding: null,
    //   },
    // );
    //
    // return {
    //   headers: response.headers,
    //   buffer: response.body,
    // };
  }

  async getPublicInfo(userIdOrAliasId) {
    logger.log('ServiceUsers', 'getPublicInfo', userIdOrAliasId);
    const user = await this.loadUser(userIdOrAliasId);
    return this.parseToPublicUserInfo(user);
  }

  /**
   * @param resetPasswordToken
   * @param newPassword
   * @param emailOptions
   * @return {Promise.<*>}
   */
  async resetPasswordByUser(resetPasswordToken, newPassword, emailOptions) {
    // try {
    //   return await this.send(
    //     this.urls.resetPasswordByUser,
    //     {
    //       resetPasswordToken,
    //       newPassword,
    //
    //       emailOptions,
    //       // ...this.getClientInfo(),
    //     },
    //     {
    //       method: 'post',
    //       headers: {
    //         // todo @ANKU @CRIT @MAIN -
    //         ...this.getClientCredentialsHeaders(),
    //       },
    //     },
    //   );
    // } catch (error) {
    //   return this.catchAuthError(error);
    // }
    throw new Error('Not implemented');
  }

  /**
   * @param email
   * @param resetPasswordPageUrl
   * @param emailOptions
   * @return {*}
   */
  async sendForgotPasswordEmail(email, resetPasswordPageUrl, emailOptions) {
    // try {
    //   return await this.sendWithClientCredentials(
    //     this.urls.sendForgotPasswordEmail,
    //     {
    //       email,
    //       emailOptions,
    //
    //       resetPasswordPageUrl,
    //       // ...this.getClientInfo(),
    //     },
    //     {
    //       method: 'post',
    //       headers: {
    //         // todo @ANKU @CRIT @MAIN -
    //         ...this.getClientCredentialsHeaders(),
    //         contentType: CONTENT_TYPES.FORM_URLENCODED,
    //       },
    //     },
    //   );
    // } catch (error) {
    //   return this.catchAuthError(error);
    // }
    throw new Error('Not implemented');
  }



  // ======================================================
  // AUTH
  // ======================================================
  async editUserByUser(userData) {
    logger.debug('ServiceUsers', 'editUserByUser');
    throw new Error('Not implemented');
    // return this.sendWithAuth(
    //   this.urls.editUserByUser,
    //   userData,
    //   {
    //     method: 'PUT',
    //   },
    // );
  }
  async changePasswordByUser(newPassword, oldPassword) {
    logger.debug('ServiceUsers', 'changePasswordByUser');
    throw new Error('Not implemented');
    // return this.sendWithAuth(
    //   this.urls.changePasswordByUser,
    //   {
    //     newPassword,
    //     oldPassword,
    //   },
    //   {
    //     method: 'PUT',
    //   },
    // );
  }
  async deleteUserByUser() {
    logger.debug('ServiceUsers', 'deleteUserByUser');
    throw new Error('Not implemented');
    // return this.sendWithAuth(
    //   this.urls.deleteUserByUser,
    //   undefined,
    //   {
    //     method: 'DELETE',
    //   },
    // );
  }




  // ======================================================
  // BY ADMIN
  // ======================================================
  async findUsers(userId) {
    logger.log('ServiceUsers', 'getProtectedInfo', userId);
    return this.sendWithClientCredentials(
      this.urls.findUsers,
    );
  }
  async userSignup(userData) {
    const {
      password,
      ...otherUserData
    } = userData;
    logger.log('ServiceUsers', 'userSignup', userData.username);

    return this.sendWithClientCredentials(
      this.urls.userSignup,
      {
        // https://www.keycloak.org/docs-api/5.0/rest-api/index.html#_userrepresentation
        enabled: true,
        credentials: [
          {
            // https://www.keycloak.org/docs-api/5.0/rest-api/index.html#_credentialrepresentation
            temporary: false,
            type: 'password',
            value: password,
          },
        ],

        ...this.serializeUserToStorageData(otherUserData),
      },
      {
        method: 'POST',
      },
    );
  }
  async loadUser(userId) {
    logger.log('ServiceUsers', 'getProtectedInfo', userId);
    const userFromDB = await this.sendWithClientCredentials(
      this.urls.loadUser,
      undefined,
      {
        pathParams: {
          userId,
        },
      },
    );
    return this.parseToFullUserInfo(userFromDB);
  }
  async editUser(userId, userData) {
    logger.log('ServiceUsers', 'editUser', userId);
    return this.sendWithClientCredentials(
      this.urls.editUser,
      this.serializeUserToStorageData(userData),
      {
        method: 'PUT',
        pathParams: {
          userId,
        },
      },
    );
  }
  async deleteUser(userId) {
    logger.log('ServiceUsers', 'deleteUser', userId);
    return this.sendWithClientCredentials(
      this.urls.deleteUser,
      {
        method: 'DELETE',
        pathParams: {
          userId,
        },
      },
    );
  }

  // ======================================================
  // ADMIN SPECIAL
  // ======================================================
  /**
   * Информация которая загружается на клиент о пользователе (без системной инфы)
   *
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
    const user = await this.loadUser(userIdOrAliasId);
    return this.parseToProtectedUserInfo(user);
  }

  async revokeTokens(userId) {
    logger.log('ServiceUsers', 'revokeTokens', userId);
    return this.sendWithClientCredentials(
      this.urls.revokeTokens,
      undefined,
      {
        method: 'DELETE',
        pathParams: {
          userId,
          clientId: this.getClientInfo().client_id,
        },
      },
    );
  }

  async resetPassword(userId, newPassword) {
    logger.log('ServiceUsers', 'revokeTokens', userId);
    return this.sendWithClientCredentials(
      this.urls.resetPassword,
      {
        // https://www.keycloak.org/docs-api/5.0/rest-api/index.html#_credentialrepresentation
        temporary: false,
        type: 'password',
        value: newPassword,
      },
      {
        method: 'PUT',
        pathParams: {
          userId,
        },
      },
    );
  }
}
