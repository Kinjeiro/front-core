/* eslint-disable camelcase */
import apiPluginFactory from '../../../../../server/utils/api-plugin-factory';
import logger from '../../../../../server/helpers/server-logger';

import { API_CONFIGS } from '../../../common/subModule/api-users';

export default function createApiPlugins() {
  return [
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
        const { userIdOrAliasId } = request.params;
        return reply(request.services.serviceUsers.getPublicInfo(userIdOrAliasId));
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
          if (error.uniCode !== 404) {
            logger.error(error);
          }
          return reply().code(error.uniCode);
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
      API_CONFIGS.editUser,
      async (userData, request, reply) => {
        logger.debug('editUser: ', userData);
        const editedUser = await request.services.serviceUsers.editUser(userData);
        return reply(editedUser);
      },
    ),
    apiPluginFactory(
      API_CONFIGS.deleteUser,
      async (requestData, request, reply) => {
        logger.debug('deleteUser');
        await request.services.serviceUsers.deleteUser();
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
        return reply(request.services.serviceUsers.changeUserPassword(newPassword, oldPassword));
      },
    ),
  ];
}
