/* eslint-disable no-unused-vars */
import pick from 'lodash/pick';

// import { aggregation } from '../../../common/utils/common';

import logger from '../../helpers/server-logger';
import { base64ToBuffer } from '../../utils/file-utils';

// import CoreMockService from '../utils/CoreMockService';
import ServiceUsers from '../ServiceUsers';

import {
  USERS,
  getUserInner,
} from './data-users';

export const PUBLIC_TO_ALL_ATTRS = [
  'username',
  'displayName',
  // 'profileImageURI',
];
export const PROTECTED_ATTRS = [
  ...PUBLIC_TO_ALL_ATTRS,
  'firstName',
  'lastName',
  'middleName',
  'email',
  'phone',
  'address',
];

export const PUBLIC_EDITABLE_ATTRS = [
  'firstName',
  'lastName',
  'middleName',
  'displayName',
  'email',
  'phone',
  'address',
  'profileImageURI',
  'contextData',
];

export default class ServiceMockUsers extends ServiceUsers {
  async editUser(newData) {
    logger.debug('ServiceMockUsers', 'editUser');
    const user = await this.getService('serviceAuth').authValidate(this.getUserToken());
    Object.apply(user, pick(newData, PUBLIC_EDITABLE_ATTRS));
  }

  async deleteUser() {
    logger.debug('ServiceMockUsers', 'deleteUser');
    const user = await this.getService('serviceAuth').authValidate(this.getUserToken());
    delete USERS[user.username];
  }

  async getAvatar(userIdOrAliasId, key = undefined) {
    logger.debug('ServiceMockUsers', 'getAvatar', userIdOrAliasId);
    const user = getUserInner(userIdOrAliasId);
    return base64ToBuffer(user.profileImageURI);
  }

  async getPublicInfo(userIdOrAliasId) {
    logger.log('ServiceMockUsers', 'getPublicInfo', userIdOrAliasId);
    return pick(getUserInner(userIdOrAliasId), PUBLIC_TO_ALL_ATTRS);
  }

  async getProtectedInfoByToken(userIdOrAliasId, token = this.getUserToken()) {
    logger.log('ServiceMockUsers', 'getProtectedInfoByToken', userIdOrAliasId);
    return pick(getUserInner(userIdOrAliasId), PROTECTED_ATTRS);
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
