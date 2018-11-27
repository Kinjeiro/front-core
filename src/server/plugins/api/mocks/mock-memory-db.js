/* eslint-disable camelcase */
import { createApiConfig as api } from '../../../../common/utils/create-api-config';

import serverConfig from '../../../server-config';
import {
  createMockRoute,
} from '../../../utils/mock-utils';
import logger from '../../../helpers/server-logger';
import { MOCK_DBS } from '../../../services/utils/CoreServiceMock';

export default [
  createMockRoute(
    api('mockDb', 'GET'),
    async (userData, request, reply) => {
      const {
        pass, // protector pass
      } = userData;
      logger.debug('mockDb: ', userData);

      if (pass === serverConfig.server.features.auth.protectorUser.password) {
        return MOCK_DBS;
      }
      // todo @ANKU @LOW - @@loc
      throw new Error('Нету прав');
    },
  ),
];

