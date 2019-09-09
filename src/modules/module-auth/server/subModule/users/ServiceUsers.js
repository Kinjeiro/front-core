/* eslint-disable lines-between-class-members */
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import { isEmail } from '../../../../../common/utils/common';

import logger from '../../../../../server/helpers/server-logger';
import serverConfig from '../../../../../server/server-config';

import CoreService from '../../../../../server/services/utils/CoreService';
import { hashData } from '../../../../../server/utils/server-utils';
import { USER_REPRESENTATION_FIELDS } from './user-representation';

export const USER_ATTR__VERIFY_TOKEN = 'verifyToken';

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
    // https://www.keycloak.org/docs-api/5.0/rest-api/index.html#_userrepresentation
    // attributes email
    // "username":"test1","enabled":true,"firstName":"test1","lastName"
    const {
      userId,
      ...other
    } = user;

    const serverMainUserData = pick(other, USER_REPRESENTATION_FIELDS);
    const customUserData = omit(other, USER_REPRESENTATION_FIELDS);

    const serverUserRepresentation = serverMainUserData;
    if (userId) {
      serverUserRepresentation.id = userId;
    }
    if (Object.keys(customUserData).length > 0) {
      serverUserRepresentation.attributes = customUserData;
    }

    // https://www.keycloak.org/docs-api/5.0/rest-api/index.html#_userrepresentation
    return serverUserRepresentation;
  }
  parseToFullUserInfo(serverUserData) {
    /*
    {
      id: 'fe8df35e-16eb-4048-ba27-dbed0494e8ea',
      createdTimestamp: 1567271584548,
      username: '111',
      enabled: true,
      totp: false,
      emailVerified: false,
      firstName: '11',
      lastName: '111',
      email: '111q@asd.r',
      attributes:
       { middleName: [ '11' ],
         clientId: [ '11' ],
         position: [ '1' ],
         phone: [ '+7-111-111-11-11' ] },
      disableableCredentialTypes: [ 'password' ],
      requiredActions: [],
      notBefore: 0,
      access:
       { manageGroupMembership: true,
         view: true,
         mapRoles: true,
         impersonate: true,
         manage: true }
       }
    */
    const {
      id,
      attributes,
      ...other
    } = serverUserData;

    console.warn('ANKU , JSON.stringify(serverUserData)', JSON.stringify(serverUserData, null, 2));

    // const user = this.getService('serviceAuth').parseUserFromOpenidData(serverUserData);
    // Object.assign(user, other);
    const user = {
      userId: id,
      ...other,
    };
    if (attributes) {
      Object.keys(attributes).forEach((attribute) => {
        const value = attributes[attribute];
        // todo @ANKU @LOW @BUG_OUT @keycloak - почему-то все аттрибуты сохраняются в массиве!
        user[attribute] = Array.isArray(value) ? value[0] : value;
      });
    }
    return user;
  }
  parseToProtectedUserInfo(serverUserData) {
    const user = this.parseToFullUserInfo(serverUserData);
    return omit(user, [USER_ATTR__VERIFY_TOKEN]);
  }
  parseToPublicUserInfo(serverUserData) {
    const user = this.parseToFullUserInfo(serverUserData);
    return pick(user, 'username');
  }


  isUserId(userId) {
    /*
      296b6d56-84c0-41fa-bca3-dd3ae6233a25
      8297b9f4-83e9-47bd-b4e9-729cf315466d
    */
    return /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/gi.test(userId);
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

  async getAvatar(userIdentify, key = undefined) {
    logger.debug('ServiceUsers', 'getAvatar', userIdentify, key);
    throw new Error('Not implemented');
    // const response = await this.send(
    //   this.urls.getAvatar,
    //   {
    //     userIdentify,
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

  async getPublicInfo(userIdentify) {
    logger.log('ServiceUsers', 'getPublicInfo', userIdentify);
    const user = await this.findUser(userIdentify);
    return user && this.parseToPublicUserInfo(user);
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
  }/**
   * @param resetPasswordToken
   * @param newPassword
   * @param emailOptions
   * @return {Promise.<*>}
   */
  async resetPasswordByEmail(resetPasswordToken, newPassword, emailOptions) {
    // try {
    //   return await this.send(
    //     this.urls.resetPasswordByEmail,
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
  async resetPasswordByVerifyToken(user, verifyToken, newPassword) {
    if (await this.checkVerifyToken(user, verifyToken)) {
      return this.resetPassword(user.userId, newPassword);
    }
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
  /**
   * Query

    email                 optional string
    firstName             optional string
    lastName              optional string
    search                optional A String contained in username, first or last name, or email string
    username              optional string

    briefRepresentation   optional  boolean
    first                 optional integer(int32)
    max                   optional Maximum results size (defaults to 100) integer(int32)
   * @param query
   * @return {Promise<*>}
   */
  async findUsers(query) {
    logger.log('ServiceUsers', 'getProtectedInfo', query);

    // todo @ANKU @LOW - @BUG_OUT @keycloak - не умеет искать по кастомным аттрибутам (либо если базы не большие выкачивать их и искать там)

    return this.sendWithClientCredentials(
      this.urls.findUsers,
      query,
    );
  }

  /**
   *
   * @param userIdentify - userId | email | username
   * @return project user
   */
  async findUser(userIdentify, silent = false) {
    let resultUser = null;
    if (this.isUserId(userIdentify)) {
      try {
        resultUser = await this.loadUser(userIdentify);
      } catch (error) {
        logger.log(`UserId ${userIdentify} not found - search by username`);
      }
    } else if (isEmail(userIdentify)) {
      const result = await this.findUsers({
        email: userIdentify.toLowerCase(),
        max: 1,
      });
      resultUser = result[0];
    } else {
      const result = await this.findUsers({
        username: userIdentify.toLowerCase(),
        max: 1,
      });
      resultUser = result[0];
      // todo @ANKU @LOW @BUG_OUT - Keycloak не умеет искать по кастомным аттрибутам - https://issues.jboss.org/browse/KEYCLOAK-2343
    }

    if (!resultUser && !silent) {
      // todo @ANKU @LOW - @@loc
      throw new Error(`Пользователь ${userIdentify} не найден`);
    }

    return this.parseToFullUserInfo(resultUser);
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
    const serverUser = await this.sendWithClientCredentials(
      this.urls.loadUser,
      undefined,
      {
        pathParams: {
          userId,
        },
      },
    );
    return this.parseToFullUserInfo(serverUser);
  }
  async editUser(userId, userPartData) {
    logger.log('ServiceUsers', 'editUser', userId);
    return this.sendWithClientCredentials(
      this.urls.editUser,
      this.serializeUserToStorageData(userPartData),
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
   * @param userIdentify
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
  async getProtectedInfo(userIdentify) {
    logger.log('ServiceUsers', 'getProtectedInfo', userIdentify);
    const user = await this.findUser(userIdentify);
    return user && this.parseToProtectedUserInfo(user);
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


  hashVerifyToken(verifyToken) {
    return hashData(verifyToken);
  }
  async setVerifyToken(userId, resetPasswordToken) {
    const hash = this.hashVerifyToken(resetPasswordToken);
    await this.editUser(
      userId,
      {
        [USER_ATTR__VERIFY_TOKEN]: hash,
      },
    );
    return hash;
  }
  async checkVerifyToken(user, inputVerifyToken, silent = false) {
    const {
      [USER_ATTR__VERIFY_TOKEN]: verifyToken,
    } = user;
    // eslint-disable-next-line eqeqeq
    if (inputVerifyToken && this.hashVerifyToken(inputVerifyToken) === verifyToken) {
      return true;
    }
    if (silent) {
      return false;
    }
    // todo @ANKU @LOW - @@loc
    throw new Error('Неправильно введен проверочный код');
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
