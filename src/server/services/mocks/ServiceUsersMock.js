/* eslint-disable no-unused-vars */
import pick from 'lodash/pick';

// import { aggregation } from '../../../common/utils/common';

import logger from '../../helpers/server-logger';
import { base64ToBuffer } from '../../utils/file-utils';

// import CoreMockService from '../utils/CoreMockService';
import ServiceUsers from '../ServiceUsers';

import {
  USERS,
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

  async getAvatar(username, key = undefined) {
    logger.debug('ServiceMockUsers', 'getAvatar', username);
    const user = USERS[username];
    return base64ToBuffer(user.profileImageURI);
  }

  async getPublicInfo(username) {
    logger.log('ServiceMockUsers', 'getPublicInfo', username);
    return pick(USERS[username], PUBLIC_TO_ALL_ATTRS);
  }

  async getProtectedInfoByToken(username, token = this.getUserToken()) {
    logger.log('ServiceMockUsers', 'getProtectedInfoByToken', username);
    return pick(USERS[username], PROTECTED_ATTRS);
  }

  async getProtectedInfo(username) {
    logger.log('ServiceMockUsers', 'getProtectedInfo', username);
    return this.getProtectedInfoByToken(username);
  }


  async editUserByAdmin(username, userData) {
    logger.log('ServiceMockUsers', 'editUserByAdmin', username);
    throw new Error('Not implemented');
  }
  async deleteUserByAdmin(username) {
    logger.log('ServiceMockUsers', 'deleteUserByAdmin', username);
    throw new Error('Not implemented');
  }
  async deleteAllByAdmin() {
    logger.log('ServiceMockUsers', 'deleteAllByAdmin');
    throw new Error('Not implemented');
  }
}
