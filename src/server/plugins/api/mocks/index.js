import mockHealthmonitor from './mock-healthmonitor';
import mockMemoryDB from './mock-memory-db';
// import mockApiAuth from './mock-api-auth';
// import mockApiUsers from './mock-api-users';
//
// import serverConfig from '../../../server-config';

export default function getMockRoutes(services, strategies) {
  return [
    ...mockHealthmonitor,
    ...mockMemoryDB,
    // ...(serverConfig.server.features.mocking.authMock
    //   ? [
    //     ...mockApiAuth,
    //     ...mockApiUsers,
    //   ]
    //   : []),
  ];
}

