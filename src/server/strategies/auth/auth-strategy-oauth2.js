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

  logger.log(`Auth strategy. authType: ${authType}, accessToken:\n${accessToken}`);

  let userInfo;
  try {
    userInfo = await authUserService.authValidate(accessToken, authType);
  } catch (error) {
    const uniError = parseToUniError(error);
    if (authUserService.authRefresh && refreshToken && uniError.isNotAuth) {
      const newAuthInfo = await authUserService.authRefresh(refreshToken);

      setAuthCookies(
        response,
        newAuthInfo.access_token,
        newAuthInfo.refresh_token,
        newAuthInfo.expires_in,
        newAuthInfo.token_type,
      );

      userInfo = await authUserService.authValidate(newAuthInfo.access_token);
    } else {
      throw error;
    }
  }

  return userInfo;
}
