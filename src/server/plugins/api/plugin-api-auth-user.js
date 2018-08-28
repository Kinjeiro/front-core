/* eslint-disable camelcase */
import { API_CONFIGS } from '../../../common/api/api-auth';

import serverConfig from '../../server-config';
import apiPluginFactory from '../../utils/api-plugin-factory';
import logger from '../../helpers/server-logger';
import {
  setAuthCookies,
  getToken,
  getRefreshToken,
  clearAuthCookie,
} from '../../utils/auth-utils';

export const API = API_CONFIGS;

async function login(username, password, services, reply) {
  const {
    access_token,
    refresh_token,
    expires_in,
  } = await services.authUserService.authLogin(username, password);
  const userInfo = await services.authUserService.authValidate(access_token);
  return setAuthCookies(
    reply(userInfo),
    access_token,
    refresh_token,
    // стандарт работает на секундах, а сервер на милисекундах
    // https://developers.google.com/identity/protocols/OAuth2UserAgent#validate-access-token
    // expires_in,
    expires_in * 1000,
  );
}

export default function createApiPlugins(services/* , strategies*/) {
  const plugins = [];

  if (serverConfig.common.features.auth.allowSignup) {
    plugins.push(
      apiPluginFactory(
        API.signup,
        async (requestData, apiRequest, reply) => {
          const {
            username,
            password,
          } = requestData;
          logger.log('SIGNUP: ', username);
          console.warn('ANKU , requestData', requestData.password);
          await services.authUserService.authSignup(requestData);

          logger.log('-- done. Now login');
          return login(username, password, services, reply);
        },
        {
          routeConfig: {
            // для этого обработчика авторизация не нужна
            auth: false,
          },
        },
      ),
    );
  }

  plugins.push(
    apiPluginFactory(
      API.login,
      async (requestData, apiRequest, reply) => {
        const {
          username,
          password,
        } = requestData;
        logger.log('LOGIN: ', username);
        return login(username, password, services, reply);
      },
      {
        routeConfig: {
          // для этого обработчика авторизация не нужна
          auth: false,
        },
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
          // expires_in,
          expires_in * 1000,
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
  );

  if (serverConfig.common.features.auth.allowResetPasswordByEmail) {
    plugins.push(
      apiPluginFactory(
        API.forgot,
        async (requestData, apiRequest, reply) => {
          const {
            email,
            resetPasswordPageUrl,
            emailOptions,
          } = requestData;
          logger.log('[FORGOT PASSWORD]', email);
          await services.authUserService.authForgot(email, resetPasswordPageUrl, emailOptions);
          return reply();
        },
        {
          routeConfig: {
            // для этого обработчика авторизация не нужна
            auth: false,
          },
        },
      ),

      apiPluginFactory(
        API.resetPassword,
        async (requestData, apiRequest, reply) => {
          const {
            resetPasswordToken,
            newPassword,
            emailOptions,
          } = requestData;
          logger.log('[RESET PASSWORD]');
          const {
            username,
          } = await services.authUserService.authResetPassword(resetPasswordToken, newPassword, emailOptions);

          logger.log(`-- done for user "${username}". Now login`);
          return login(username, newPassword, services, reply);
        },
        {
          routeConfig: {
            // для этого обработчика авторизация не нужна
            auth: false,
          },
        },
      ),
    );
  }

  return plugins;
}
