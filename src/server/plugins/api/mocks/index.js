import mockHealthmonitor from './mock-healthmonitor';
import mockApiUser from './mock-api-user';

import serverConfig from '../../../server-config';

export default [
  ...mockHealthmonitor,
  ...(serverConfig.server.features.mocking.authMock
    ? mockApiUser
    : []),
];

