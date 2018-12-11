import { ADMIN } from '../../../common/all-roles';
import createApiConfig from '../../../common/utils/create-api-config';

import config from '../../server-config';
import apiPluginFactory from '../../utils/api-plugin-factory';

export default apiPluginFactory(
  createApiConfig('/config'),
  (data, request, reply) => reply(config),
  {
    roles: [ADMIN],
  },
);


