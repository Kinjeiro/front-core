import { API_CONFIGS } from '../../../common/api/api-user';

import apiPluginFactory from '../../utils/api-plugin-factory';
import logger from '../../helpers/server-logger';
import {
  setAuthCookies,
  getToken,
  getRefreshToken,
  clearAuthCookie,
} from '../../utils/auth-utils';

export const API = API_CONFIGS;

export default function createApiPlugins(services/* , strategies*/) {
  return [
    apiPluginFactory(
      API.login,
      async (requestData, apiRequest, reply) => {
        logger.log('LOGIN: ', requestData.username);
        const {
          access_token,
          refresh_token,
          expires_in,
        } = await services.authUserService.authLogin(requestData.username, requestData.password);

        const userInfo = await services.authUserService.authValidate(access_token);

        return setAuthCookies(
          reply(userInfo),
          access_token,
          refresh_token,
          expires_in,
        );
      },
      {
        routeConfig: {
          // для этого обработчика авторизация не нужна
          auth: false,
        }
      },
    ),
    apiPluginFactory(
      API.refreshLogin,
      async (requestData, apiRequest, reply) => {
        logger.log('refreshLogin');
        const {
          access_token,
          refresh_token,
          expires_in,
        } = await services.authUserService.authRefresh(getRefreshToken(apiRequest));

        return setAuthCookies(
          reply(),
          access_token,
          refresh_token,
          expires_in,
        );
      },
    ),
    apiPluginFactory(
      API.logout,
      async (requestData, apiRequest, reply) => {
        logger.log('LOGOUT');
        await services.authUserService.authLogout(getToken(apiRequest));
        return clearAuthCookie(reply());
      },
    ),
  ];
}
