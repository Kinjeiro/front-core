import { parseToUniError } from '../../../common/models/uni-error';

import logger from '../../helpers/server-logger';
import {
  getToken,
  getAuthType,
  getRefreshToken,
  setAuthCookies,
} from '../../utils/auth-utils';

export default async function authStrategyOAuth2(request, response, services) {
  const { authUserService } = services;

  const accessToken = getToken(request);
  const authType = getAuthType(request);
  const refreshToken = getRefreshToken(request);

  logger.debug(`Auth strategy. authType: ${authType}, accessToken:\n${accessToken}`);

  async function tryRefresh() {
    let userInfo;
    if (authUserService.authRefresh && refreshToken) {
      logger.debug(`Auth strategy error. Try to reLogin by refresh_token:\n${refreshToken}`);
      const newAuthInfo = await authUserService.authRefresh(refreshToken);

      setAuthCookies(
        response,
        newAuthInfo.access_token,
        newAuthInfo.refresh_token,
        newAuthInfo.expires_in,
        newAuthInfo.token_type,
      );

      logger.debug(`Auth strategy reLogin. Get userInfo by new access_token:\n${newAuthInfo.access_token}`);
      userInfo = await authUserService.authValidate(newAuthInfo.access_token);
    }
    return userInfo;
  }

  let userInfo;
  if (!accessToken) {
    userInfo = await tryRefresh();
  } else {
    try {
      userInfo = await authUserService.authValidate(accessToken, authType);
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
