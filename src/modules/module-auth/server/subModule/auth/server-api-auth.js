/* eslint-disable camelcase */
import serverConfig from '../../../../../server/server-config';
import apiPluginFactory from '../../../../../server/utils/api-plugin-factory';
import logger from '../../../../../server/helpers/server-logger';
import { clearCookie, replaceLocalhostByCurrentHost } from '../../../../../server/utils/hapi-utils';
import {
  setAuthCookies,
  getToken,
  getRefreshToken,
  clearAuthCookie,
} from '../../../../../server/utils/auth-utils';
import { COOKIE__GUEST_ID } from '../../../../../server/plugins/plugin-request-user';

import { API_CONFIGS } from '../../../common/subModule/api-auth';

// ======================================================
// MODULE
// ======================================================
import PROVIDERS from './social-providers';

export const API = API_CONFIGS;

async function login(username, password, serviceAuth, reply) {
  const {
    access_token,
    refresh_token,
    expires_in,
  } = await serviceAuth.authLogin(username, password);
  const userInfo = await serviceAuth.authValidate(access_token);
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

export default function createApiPlugins() {
  const plugins = [];

  if (serverConfig.common.features.auth.allowSignup) {
    plugins.push(
      apiPluginFactory(
        API.signup,
        async (requestData, request, reply) => {
          const { username, password } = requestData;
          logger.log('SIGNUP: ', username);
          await request.services.serviceAuth.authSignup(requestData);

          logger.log('-- done. Now login');
          return login(username, password, request.services.serviceAuth, reply);
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

  if (serverConfig.common.features.auth.socialProvides.google) {
    // todo @ANKU @LOW - может сделать один метод апи просто пас параметр провайдера сделать
    plugins.push(
      apiPluginFactory(
        API.googleSignin,
        async (requestData, request, reply) => {
          logger.log('GOOGLE_SIGNIN');
          // todo @ANKU @CRIT @MAIN - убрать редирект, заменить на возвращение обычного html и его вставку в reply
          reply.redirect(
            // так как нам нужно редиректится при социальной авторизации, локалхост нужно заменить на хост сервера, чтобы браузерный переход отработал правильно
            replaceLocalhostByCurrentHost(request, request.services.serviceAuth.getSocialAuthUrl(PROVIDERS.GOOGLE)),
          );
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
  if (serverConfig.common.features.auth.socialProvides.vkontakte) {
    plugins.push(
      apiPluginFactory(
        API.vkontakteSignin,
        async (requestData, request, reply) => {
          logger.log('VKONTAKTE_SIGNIN');
          reply.redirect(
            // так как нам нужно редиректится при социальной авторизации, локалхост нужно заменить на хост сервера, чтобы браузерный переход отработал правильно
            replaceLocalhostByCurrentHost(request, request.services.serviceAuth.getSocialAuthUrl(PROVIDERS.VKONTAKTE)),
          );
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
  if (serverConfig.common.features.auth.socialProvides.facebook) {
    plugins.push(
      apiPluginFactory(
        API.facebookSignin,
        async (requestData, request, reply) => {
          logger.log('FACEBOOK_SIGNIN');
          reply.redirect(
            // так как нам нужно редиректится при социальной авторизации, локалхост нужно заменить на хост сервера, чтобы браузерный переход отработал правильно
            replaceLocalhostByCurrentHost(request, request.services.serviceAuth.getSocialAuthUrl(PROVIDERS.FACEBOOK)),
          );
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
      async (requestData, request, reply) => {
        const { username, password } = requestData;
        logger.log('LOGIN: ', username);
        return login(username, password, request.services.serviceAuth, reply);
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
      async (requestData, request, reply) => {
        logger.log('refreshLogin');
        const {
          access_token,
          refresh_token,
          expires_in,
        } = await request.services.serviceAuth.authRefresh(
          getRefreshToken(request),
        );

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
      async (requestData, request, reply) => {
        logger.log('LOGOUT');
        await request.services.serviceAuth.authLogout(getToken(request));

        // очищаем guest если он был
        clearCookie(reply, COOKIE__GUEST_ID);
        clearAuthCookie(reply);
        return reply();
      },
    ),
  );

  if (serverConfig.common.features.auth.allowResetPasswordByEmail) {
    plugins.push(
      apiPluginFactory(
        API.forgot,
        async (requestData, request, reply) => {
          const { email, resetPasswordPageUrl, emailOptions } = requestData;
          logger.log('[FORGOT PASSWORD]', email);
          await request.services.serviceAuth.authForgot(
            email,
            resetPasswordPageUrl,
            emailOptions,
          );
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
        async (requestData, request, reply) => {
          const { resetPasswordToken, newPassword, emailOptions } = requestData;
          logger.log('[RESET PASSWORD]');
          const {
            username,
          } = await request.services.serviceAuth.authResetPassword(
            resetPasswordToken,
            newPassword,
            emailOptions,
          );

          logger.log(`-- done for user "${username}". Now login`);
          return login(
            username,
            newPassword,
            request.services.serviceAuth,
            reply,
          );
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
