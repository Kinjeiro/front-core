import config from '../../../server-config';

import {
  createMockRoute,
  delayValueHandler,
} from '../../../utils/mock-utils';

export default [
  // createMockRoute(config.common.apiConfig.health, 'ok - health mock')
  createMockRoute(config.common.apiConfig.health, delayValueHandler('ok - health mock', 100, 1000)),
];
