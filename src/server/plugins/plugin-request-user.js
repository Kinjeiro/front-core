/* eslint-disable no-param-reassign */
import { getCredentialsFromRequest } from '../utils/credentials-utils';
import { getToken } from '../utils/auth-utils';

export const REQUEST_FIELD__USER = 'user';
export const REQUEST_FIELD__USER_TOKEN = 'userToken';

function pluginRequestUser(server, options, next) {
  // после авторизации
  server.ext('onPostAuth', (request, reply) => {
    request[REQUEST_FIELD__USER] = getCredentialsFromRequest(request).userInfo;
    request[REQUEST_FIELD__USER_TOKEN] = getToken(request);
    return reply.continue();
  });

  next();
}

pluginRequestUser.attributes = {
  name: 'pluginRequestUser',
};

export default pluginRequestUser;
