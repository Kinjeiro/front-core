/* eslint-disable no-unused-vars */
import pick from 'lodash/pick';

import {
  objectValues,
  merge,
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
  async editUser(newData) {
    logger.debug('ServiceMockUsers', 'editUser');
    const serviceAuth = this.getService('serviceAuth');
    const user = await serviceAuth.authValidate(this.getUserToken());
    return merge(
      serviceAuth.getUsers()[user.userId],
      pick(newData, PUBLIC_EDITABLE_ATTRS),
    );
  }
  async changeUserPassword(newPassword, oldPassword) {
    logger.debug('ServiceMockUsers', 'changeUserPassword');
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

  async deleteUser() {
    logger.debug('ServiceMockUsers', 'deleteUser');
    const user = await this.getService('serviceAuth').authValidate(this.getUserToken());
    delete this.getService('serviceAuth').getUsers()[user.username];
  }

  async getAvatar(userIdOrAliasId, key = undefined) {
    logger.debug('ServiceMockUsers', 'getAvatar', userIdOrAliasId);
    const user = this.getService('serviceAuth').getUserInner(userIdOrAliasId);
    if (!user || !user.profileImageURI) {
      throw new ThrowableUniError({ errorCode: 404 });
    }
    return base64ToBuffer(user.profileImageURI);
  }

  async getPublicInfo(userIdOrAliasId) {
    logger.log('ServiceMockUsers', 'getPublicInfo', userIdOrAliasId);
    return pick(this.getService('serviceAuth').getUserInner(userIdOrAliasId), PUBLIC_TO_ALL_ATTRS);
  }

  async getProtectedInfoByToken(userIdOrAliasId, token = this.getUserToken()) {
    logger.log('ServiceMockUsers', 'getProtectedInfoByToken', userIdOrAliasId);
    return pick(this.getService('serviceAuth').getUserInner(userIdOrAliasId), PROTECTED_ATTRS);
  }

  async getProtectedInfo(userIdOrAliasId) {
    logger.log('ServiceMockUsers', 'getProtectedInfo', userIdOrAliasId);
    return this.getProtectedInfoByToken(userIdOrAliasId);
  }


  async editUserByAdmin(userId, userData) {
    logger.log('ServiceMockUsers', 'editUserByAdmin', userId);
    throw new Error('Not implemented');
  }
  async deleteUserByAdmin(userId) {
    logger.log('ServiceMockUsers', 'deleteUserByAdmin', userId);
    throw new Error('Not implemented');
  }
  async deleteAllByAdmin() {
    logger.log('ServiceMockUsers', 'deleteAllByAdmin');
    throw new Error('Not implemented');
  }
}
