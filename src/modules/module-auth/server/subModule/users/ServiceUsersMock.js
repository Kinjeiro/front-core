/* eslint-disable no-unused-vars */
import pick from 'lodash/pick';

// import { aggregation } from '../../../common/utils/common';
import {
  PUBLIC_USER_INFO_PROP_TYPE_MAP,
  PROTECTED_USER_INFO_PROP_TYPE_MAP,
  PUBLIC_EDITABLE_ATTRS,
} from '../../../../../common/models/model-user-info';

import logger from '../../../../../server/helpers/server-logger';
import { base64ToBuffer } from '../../../../../server/utils/file-utils';

// import CoreMockService from '../utils/CoreMockService';
import ServiceUsers from './ServiceUsers';

export const PUBLIC_TO_ALL_ATTRS = Object.keys(PUBLIC_USER_INFO_PROP_TYPE_MAP);
export const PROTECTED_ATTRS = Object.keys(PROTECTED_USER_INFO_PROP_TYPE_MAP);

export default class ServiceMockUsers extends ServiceUsers {
  async editUser(newData) {
    logger.debug('ServiceMockUsers', 'editUser');
    const user = await this.getService('serviceAuth').authValidate(this.getUserToken());
    Object.apply(user, pick(newData, PUBLIC_EDITABLE_ATTRS));
  }

  async deleteUser() {
    logger.debug('ServiceMockUsers', 'deleteUser');
    const user = await this.getService('serviceAuth').authValidate(this.getUserToken());
    delete this.getService('serviceAuth').getUsers()[user.username];
  }

  async getAvatar(userIdOrAliasId, key = undefined) {
    logger.debug('ServiceMockUsers', 'getAvatar', userIdOrAliasId);
    const user = this.getService('serviceAuth').getUserInner(userIdOrAliasId);
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
