import serverConfig from '../../../../../server/server-config';

/* eslint-disable camelcase */
import apiPluginFactory from '../../../../../server/utils/api-plugin-factory';
import logger from '../../../../../server/helpers/server-logger';

import { API_CONFIGS } from '../../../common/subModule/api-users';
import { login } from '../auth/server-api-auth';

export default function createApiPlugins() {
  const plugins = [];

  if (serverConfig.common.features.auth.allowSignup) {
    plugins.push(
      apiPluginFactory(
        API_CONFIGS.signup,
        async (requestData, request, reply) => {
          const { username, password } = requestData;
          const {
            services: {
              serviceAuth,
              serviceUsers,
            },
          } = request;

          logger.log('SIGNUP: ', username);
          await serviceUsers.userSignup(requestData);

          logger.log('-- done. Now login');
          return login(username, password, serviceAuth, reply);
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

  if (serverConfig.common.features.auth.allowResetPasswordByEmail) {
    plugins.push(
      apiPluginFactory(
        API_CONFIGS.forgot,
        async (requestData, request, reply) => {
          const { email, resetPasswordPageUrl, emailOptions } = requestData;
          logger.log('[FORGOT PASSWORD]', email);
          await request.services.serviceUsers.sendForgotPasswordEmail(
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
        API_CONFIGS.resetPasswordByUser,
        async (requestData, request, reply) => {
          const { resetPasswordToken, newPassword, emailOptions } = requestData;
          const {
            services: {
              serviceAuth,
              serviceUsers,
            },
          } = request;
          logger.log('[RESET PASSWORD]');
          const {
            username,
          } = await serviceUsers.resetPasswordByUser(
            resetPasswordToken,
            newPassword,
            emailOptions,
          );

          logger.log(`-- done for user "${username}". Now login`);
          return login(
            username,
            newPassword,
            serviceAuth,
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



  plugins.push(
    // ======================================================
    // NO AUTH
    // ======================================================
    apiPluginFactory(
      API_CONFIGS.checkUnique,
      async (userData, request, reply) => {
        logger.debug('checkUnique: ', userData);
        const {
          field,
          value,
        } = userData;
        return reply({
          result: await request.services.serviceUsers.checkUnique(field, value),
        });
      },
      {
        routeConfig: {
          // не требуется авторизация для проверки уникальности
          auth: false,
        },
      },
    ),
    apiPluginFactory(
      API_CONFIGS.getPublicInfo,
      async (userData, request, reply) => {
        logger.debug('getPublicInfo: ', userData);
        const {
          services: {
            serviceUsers,
          },
          params: {
            userIdOrAliasId,
          },
        } = request;
        return reply(
          serviceUsers.getPublicInfo(userIdOrAliasId),
        );
      },
      {
        routeConfig: {
          // не требуется авторизация для проверки уникальности
          auth: false,
        },
      },
    ),
    apiPluginFactory(
      API_CONFIGS.avatar,
      async (requestData, request, reply) => {
        const { key } = requestData;
        const { userIdOrAliasId } = request.params;
        logger.debug('avatar for', userIdOrAliasId);

        let result;
        try {
          result = await request.services.serviceUsers.getAvatar(userIdOrAliasId, key);
        } catch (error) {
          if (error.responseStatusCode !== 404) {
            logger.error(error);
          }
          return reply().code(error.responseStatusCode);
        }

        const {
          headers,
          buffer,
        } = result;

        const response = reply(buffer);
        Object.keys(headers).forEach((headerKey) => {
          response.header(headerKey, headers[headerKey]);
        });
        return response;
      },
      {
        routeConfig: {
          // не требуется авторизация для аватарок других пользователей
          auth: false,
        },
      },
    ),


    // ======================================================
    // AUTH
    // ======================================================
    apiPluginFactory(
      API_CONFIGS.editUserByUser,
      async (userData, request, reply) => {
        logger.debug('editUserByUser: ', userData);
        const editedUser = await request.services.serviceUsers.editUserByUser(userData);
        return reply(editedUser);
      },
    ),
    apiPluginFactory(
      API_CONFIGS.deleteUserByUser,
      async (requestData, request, reply) => {
        logger.debug('deleteUserByUser');
        await request.services.serviceUsers.deleteUserByUser();
        return reply();
      },
    ),
    apiPluginFactory(
      API_CONFIGS.changePassword,
      async (userData, request, reply) => {
        logger.debug('changePassword: ', userData);
        const {
          newPassword,
          oldPassword,
        } = userData;
        return reply(request.services.serviceUsers.changePasswordByUser(newPassword, oldPassword));
      },
    ),
  );

  return plugins;
}
