/* eslint-disable camelcase */
import { API_CONFIGS } from '../../../common/api/api-users';

import apiPluginFactory from '../../utils/api-plugin-factory';
import logger from '../../helpers/server-logger';

export default function createApiPlugins() {
  return [
    apiPluginFactory(
      API_CONFIGS.editUser,
      async (userData, request, reply) => {
        logger.debug('editUser: ', userData);
        await request.services.serviceUsers.editUser(userData);
        return reply();
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
      API_CONFIGS.avatar,
      async (requestData, request, reply) => {
        const { key } = requestData;
        const { username } = request.params;
        logger.debug('avatar for', username);

        let result;
        try {
          result = await request.services.serviceUsers.getAvatar(username, key);
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
    ),
  ];
}
