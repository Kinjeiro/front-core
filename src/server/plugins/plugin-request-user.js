/* eslint-disable no-param-reassign */
import { wrapToArray } from '../../common/utils/common';

import serverConfig from '../server-config';

import { getCredentialsFromRequest } from '../utils/credentials-utils';
import { getToken } from '../utils/auth-utils';

export const REQUEST_FIELD__USER = 'user';
export const REQUEST_FIELD__USER_TOKEN = 'userToken';
export const REQUEST_FIELD__IS_ADMIN = 'isAdmin';

function pluginRequestUser(server, options, next) {
  // после авторизации
  server.ext('onPostAuth', (request, reply) => {
    const { userInfo } = getCredentialsFromRequest(request);
    request[REQUEST_FIELD__USER] = userInfo;
    request[REQUEST_FIELD__IS_ADMIN] = userInfo && wrapToArray(userInfo.roles).includes(serverConfig.common.features.auth.adminRoleName);
    request[REQUEST_FIELD__USER_TOKEN] = getToken(request);
    return reply.continue();
  });

  next();
}

pluginRequestUser.attributes = {
  name: 'pluginRequestUser',
};

export default pluginRequestUser;
