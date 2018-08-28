import mockHealthmonitor from './mock-healthmonitor';
import mockApiAuth from './mock-api-auth';
import mockApiUsers from './mock-api-users';

import serverConfig from '../../../server-config';

export default [
  ...mockHealthmonitor,
  ...(serverConfig.server.features.mocking.authMock
    ? [
      ...mockApiAuth,
      ...mockApiUsers,
    ]
    : []),
];

