import { ADMIN } from '../../../common/all-roles';

import config from '../../server-config';

import apiPluginFactory from '../../utils/api-plugin-factory';

export default apiPluginFactory(
  'config',
  (data, request, reply) => reply(config),
  {
    roles: [ADMIN],
  },
);


