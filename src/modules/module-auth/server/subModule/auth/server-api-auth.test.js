import {
  getRequestCookieFromResponse,
  getCookiesValues,
} from '../../../../../server/utils/hapi-utils';

import { getBoolEnv } from '../../../../../server/utils/env-utils';

import { proceedApiRequest } from '../../../../../test/server/test-server-utils';

import serverConfig from '../../../../../server/server-config';

import { ivanovI } from '../users/data-users';

import { API } from './server-api-auth';

const tokenCookie = serverConfig.server.features.auth.tokenCookie;
const refreshTokenCookie = serverConfig.server.features.auth.refreshTokenCookie;

const TEST_USER = {
  userId: ivanovI.userId,
  username: ivanovI.username,
  password: ivanovI.password,
};

function skipIntegrationTest(result) {
  const skip = getBoolEnv('TEST_SKIP_AUTH') && result.isUniError && result.isNotFound;
  if (skip) {
    console.warn(`SKIP Auth tests, because server doesn't find: ${result.message}`);
    console.warn(result, result.stack);
    return true;
  }
  return false;
}

describe('(Plugin)(Api) User', () => {
  describe(API.login.path, () => {
    it('should return correct user when login', async function test() {
      /*
       "username": "ivanovI",
       "scope": "*"
       */
      const {
        statusCode,
        result: userInfo,
      } = await proceedApiRequest(API.login, TEST_USER);

      if (skipIntegrationTest(userInfo)) {
        this.skip();
      } else {
        expect(statusCode).to.equal(200);
        expect(userInfo.username).to.equal(TEST_USER.username);
      }
    });
  });

  describe(API.refreshLogin.path, () => {
    it('should update cookie token after refresh', async function test() {
      const loginResponse = await proceedApiRequest(API.login, TEST_USER);

      if (skipIntegrationTest(loginResponse.result)) {
        this.skip();
      } else {
        const oldCookie = getCookiesValues(loginResponse);

        const response = await proceedApiRequest(API.refreshLogin, null, {
          headers: {
            cookie: getRequestCookieFromResponse(loginResponse),
          },
        });

        const newCookie = getCookiesValues(response);

        expect(response.statusCode).to.equal(200);
        expect(newCookie[tokenCookie]).to.not.be.empty();
        expect(newCookie[refreshTokenCookie]).to.not.be.empty();
        expect(oldCookie[tokenCookie]).not.to.equal(newCookie[tokenCookie]);
        expect(oldCookie[refreshTokenCookie]).not.to.equal(newCookie[refreshTokenCookie]);
        expect(newCookie[tokenCookie]).not.to.equal(newCookie[refreshTokenCookie]);
      }
    });
  });
});
