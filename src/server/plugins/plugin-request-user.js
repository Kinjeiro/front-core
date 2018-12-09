/* eslint-disable no-param-reassign */
import {
  wrapToArray,
  generateId,
} from '../../common/utils/common';

import serverConfig from '../server-config';

import { getCredentialsFromRequest } from '../utils/credentials-utils';
import { getToken } from '../utils/auth-utils';
import { getCookie, setCookie } from '../utils/hapi-utils';

export const COOKIE__GUEST_ID = 'guestId';

export const REQUEST_FIELD__USER = 'user';
export const REQUEST_FIELD__GUEST_ID = 'guestId';
export const REQUEST_FIELD__USER_TOKEN = 'userToken';
export const REQUEST_FIELD__IS_ADMIN = 'isAdmin';

function pluginRequestUser(server, options, next) {
  // после авторизации
  server.ext('onPostAuth', (request, reply) => {
    const { userInfo } = getCredentialsFromRequest(request);
    request[REQUEST_FIELD__USER] = userInfo;
    request[REQUEST_FIELD__IS_ADMIN] = userInfo && wrapToArray(userInfo.roles).includes(serverConfig.common.features.auth.adminRoleName);
    request[REQUEST_FIELD__USER_TOKEN] = getToken(request);

    // ======================================================
    // GUEST ID
    // ======================================================
    let guestId = getCookie(request, COOKIE__GUEST_ID);
    if (!userInfo && !guestId) {
      // если нету ни юзера и ни разу не создавали для куков guestId - создаем и проставляем
      guestId = generateId();
      setCookie(reply, COOKIE__GUEST_ID, guestId);
    }
    request[REQUEST_FIELD__GUEST_ID] = guestId;

    return reply.continue();
  });

  next();
}

pluginRequestUser.attributes = {
  name: 'pluginRequestUser',
};

export default pluginRequestUser;
