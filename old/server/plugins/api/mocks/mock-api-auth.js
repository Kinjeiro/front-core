import { API_CONFIGS } from '../../../../../src/common/api/api-auth';

import { createMockRoute } from '../../../../../src/server/utils/mock-utils';
import {
  setAuthCookies,
  clearAuthCookie,
} from '../../../../../src/server/utils/auth-utils';

import i18n from '../../../../../src/common/utils/i18n-utils';
import { createUniError } from '../../../../../src/common/models/uni-error';

import logger from '../../../../../src/server/helpers/server-logger';

import {
  getUser,
  TOKENS,
} from './users';

// todo @ANKU @LOW - перенести в отдельный мок сервис
export default [
  createMockRoute(API_CONFIGS.login, (requestData, request, reply) => {
    logger.debug('MOCK LOGIN', requestData.username);
    const userInfo = getUser(requestData.username, requestData.password);
    if (!userInfo) {
      return reply(createUniError({
        responseStatusCode: 401,
        clientErrorMessage: i18n('core:errors.mockUserNotFound'),
      }))
        .code(401);
    }
    const fakeToken = TOKENS[userInfo.username];

    return setAuthCookies(
      reply(userInfo),
      fakeToken,
      fakeToken,
    );
  }),
  createMockRoute(API_CONFIGS.logout, (requestData, request, reply) => {
    return clearAuthCookie(reply());
  }),
];
