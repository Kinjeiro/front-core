import { parseToUniError } from '../../../common/models/uni-error';

import logger from '../../helpers/server-logger';
import {
  getToken,
  getAuthType,
  getRefreshToken,
  setAuthCookies,
} from '../../utils/auth-utils';

/*
 https://developers.google.com/identity/protocols/OAuth2UserAgent#validate-access-token
*/
export default async function authStrategyOAuth2(request, response, servicesContext) {
  const accessToken = getToken(request);
  const authType = getAuthType(request);
  const refreshToken = getRefreshToken(request);

  logger.debug(`Auth strategy. authType: ${authType}, accessToken:\n${accessToken}`);
  const serviceAuth = request.services.serviceAuth;

  async function tryRefresh() {
    let userInfo;

    if (serviceAuth.authRefresh && refreshToken) {
      logger.debug(`Auth strategy error. Try to reLogin by refresh_token:\n${refreshToken}`);
      const newAuthInfo = await serviceAuth.authRefresh(refreshToken);

      logger.debug(`Auth strategy reLogin. Get userInfo by new access_token:\n${newAuthInfo.access_token}`);
      userInfo = await serviceAuth.authValidate(newAuthInfo.access_token);

      setAuthCookies(
        response,
        newAuthInfo.access_token,
        newAuthInfo.refresh_token,
        newAuthInfo.expires_in ? newAuthInfo.expires_in * 1000 : undefined,
        undefined,
        newAuthInfo.token_type,
        request,
      );
    }
    return userInfo;
  }

  let userInfo;
  if (!accessToken) {
    userInfo = await tryRefresh();
  } else {
    try {
      userInfo = await serviceAuth.authValidate(accessToken, authType);
    } catch (error) {
      const uniError = parseToUniError(error);
      if (uniError.isNotAuth) {
        userInfo = await tryRefresh();
      } else {
        throw error;
      }
    }
  }

  return userInfo;
}
