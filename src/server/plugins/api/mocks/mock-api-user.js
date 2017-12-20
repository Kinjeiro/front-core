import { API_CONFIGS } from '../../../../common/api/api-user';

import { createMockRoute } from '../../../utils/mock-utils';
import { setAuthCookies } from '../../../utils/auth-utils';

import i18n from '../../../../common/utils/i18n-utils';
import { createUniError } from '../../../../common/models/uni-error';

import {
  getUser,
  TOKENS,
} from './users';

export default [
  createMockRoute(API_CONFIGS.login, (requestData, request, reply) => {
    const userInfo = getUser(requestData.username, requestData.password);
    if (!userInfo) {
      return reply(createUniError({
        code: 401,
        clientErrorMessage: i18n('core:Mock user not found'),
      }));
    }
    const fakeToken = TOKENS[userInfo.username];

    return setAuthCookies(
      reply(userInfo),
      fakeToken,
      fakeToken,
    );
  }),
];
