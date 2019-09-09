/* eslint-disable no-unused-vars */
import pick from 'lodash/pick';

import {
  objectValues,
  merge, getRandomInt, generateId,
} from '../../../../../common/utils/common';
import {
  PUBLIC_USER_INFO_PROP_TYPE_MAP,
  PROTECTED_USER_INFO_PROP_TYPE_MAP,
  PUBLIC_EDITABLE_ATTRS,
} from '../../../../../common/models/model-user-info';
import { ThrowableUniError } from '../../../../../common/models/uni-error';

import logger from '../../../../../server/helpers/server-logger';
import { base64ToBuffer } from '../../../../../server/utils/file-utils';

// import CoreMockService from '../utils/CoreMockService';
import ServiceUsers from './ServiceUsers';

export const PUBLIC_TO_ALL_ATTRS = Object.keys(PUBLIC_USER_INFO_PROP_TYPE_MAP);
export const PROTECTED_ATTRS = Object.keys(PROTECTED_USER_INFO_PROP_TYPE_MAP);

export default class ServiceMockUsers extends ServiceUsers {
  async editUserByUser(newData) {
    logger.debug('ServiceMockUsers', 'editUserByUser');
    const serviceAuth = this.getService('serviceAuth');
    const user = await serviceAuth.authValidate(this.getUserToken());
    return merge(
      serviceAuth.getUsers()[user.userId],
      pick(newData, PUBLIC_EDITABLE_ATTRS),
    );
  }
  async changePasswordByUser(newPassword, oldPassword) {
    logger.debug('ServiceMockUsers', 'changePasswordByUser');
    const serviceAuth = this.getService('serviceAuth');
    const user = await serviceAuth.authValidate(this.getUserToken());
    if (user.password === oldPassword) {
      serviceAuth.getUsers()[user.userId].password = newPassword;
    } else {
      // todo @ANKU @LOW - @@loc
      throw new Error('Неверный старый пароль');
    }
  }
  async checkUnique(field, value) {
    logger.debug('ServiceMockUsers', 'checkUnique');
    const result = objectValues(this.getService('serviceAuth').getUsers())
      .every((user) => user[field] !== value);
    if (result === false) {
      // todo @ANKU @LOW - @@loc
      throw new Error(`Значение "${value}" для поля "${field}" уже используется.`);
    }
    return {
      result,
    };
  }

  async deleteUserByUser() {
    logger.debug('ServiceMockUsers', 'deleteUserByUser');
    const user = await this.getService('serviceAuth').authValidate(this.getUserToken());
    delete this.getService('serviceAuth').getUsers()[user.username];
  }

  async getAvatar(userIdentify, key = undefined) {
    logger.debug('ServiceMockUsers', 'getAvatar', userIdentify);
    const user = this.getService('serviceAuth').getUserInner(userIdentify);
    if (!user || !user.profileImageURI) {
      throw new ThrowableUniError({ errorCode: 404 });
    }
    return base64ToBuffer(user.profileImageURI);
  }

  async getPublicInfo(userIdentify) {
    logger.log('ServiceMockUsers', 'getPublicInfo', userIdentify);
    return pick(this.getService('serviceAuth').getUserInner(userIdentify), PUBLIC_TO_ALL_ATTRS);
  }

  async getProtectedInfoByToken(userIdentify, token = this.getUserToken()) {
    logger.log('ServiceMockUsers', 'getProtectedInfoByToken', userIdentify);
    return pick(this.getService('serviceAuth').getUserInner(userIdentify), PROTECTED_ATTRS);
  }

  async getProtectedInfo(userIdentify) {
    logger.log('ServiceMockUsers', 'getProtectedInfo', userIdentify);
    return this.getProtectedInfoByToken(userIdentify);
  }


  async loadUser(userId, userData) {
    logger.log('ServiceMockUsers', 'loadUser', userId);
    throw new Error('Not implemented');
  }
  async editUser(userId, userData) {
    logger.log('ServiceMockUsers', 'editUser', userId);
    throw new Error('Not implemented');
  }
  async deleteUser(userId) {
    logger.log('ServiceMockUsers', 'deleteUser', userId);
    throw new Error('Not implemented');
  }



  async userSignup(userData) {
    // eslint-disable-next-line no-param-reassign
    const userDataFinal = {
      userId: `${getRandomInt()}`,
      ...userData,
    };
    logger.log('ServiceAuthMock', 'userSignup', userDataFinal);
    this.getUsers()[userDataFinal.userId] = userDataFinal;
    this.getTokens()[userDataFinal.userId] = generateId();
    return userDataFinal;
  }
  /**
   * Протокол для @reagentum/auth-server@1.0.4
   *
   * @param email
   * @param resetPasswordPageUrl
   * @param emailOptions
   * @return {*}
   */
  async sendForgotPasswordEmail(email, resetPasswordPageUrl, emailOptions) {
    logger.log('ServiceAuthMock', 'sendForgotPasswordEmail', email);
    throw new Error('Not implemented');
  }

  /**
   * Протокол для @reagentum/auth-server@1.0.4
   *
   * @param resetPasswordToken
   * @param newPassword
   * @param emailOptions
   * @return {Promise.<*>}
   */
  async resetPasswordByEmail(resetPasswordToken, newPassword, emailOptions) {
    logger.log('ServiceAuthMock', 'resetPasswordByEmail', resetPasswordToken);
    throw new Error('Not implemented');
  }
}
