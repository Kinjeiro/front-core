/* eslint-disable camelcase */
import { API_CONFIGS } from '../../../common/api/api-users';

import apiPluginFactory from '../../utils/api-plugin-factory';
import logger from '../../helpers/server-logger';
import {
  getToken,
} from '../../utils/auth-utils';

export default function createApiPlugins(services/* , strategies*/) {
  const { usersService } = services;

  return [
    apiPluginFactory(
      API_CONFIGS.editUser,
      async (userData, apiRequest, reply) => {
        logger.debug('editUser: ', userData);
        await usersService.editUser(getToken(apiRequest), userData);
        return reply();
      },
    ),
    apiPluginFactory(
      API_CONFIGS.deleteUser,
      async (requestData, apiRequest, reply) => {
        logger.debug('deleteUser');
        await usersService.deleteUser(getToken(apiRequest));
        return reply();
      },
    ),
    apiPluginFactory(
      API_CONFIGS.avatar,
      async (requestData, apiRequest, reply) => {
        const { username } = apiRequest.params;
        logger.debug('avatar for', username);
        const {
          headers,
          buffer,
        } = await usersService.getAvatar(getToken(apiRequest), username);

        const response = reply(buffer);

        Object.keys(headers).forEach((headerKey) => {
          response.header(headerKey, headers[headerKey]);
        });
        return response;
      },
    ),
  ];
}
