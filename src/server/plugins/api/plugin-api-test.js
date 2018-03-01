import { API_CONFIGS } from '../../../common/api/api-test';

import apiPluginFactory from '../../utils/api-plugin-factory';

export default apiPluginFactory(
  API_CONFIGS.testGet,
  (data, request, reply) => reply({ ok: true }),
);


