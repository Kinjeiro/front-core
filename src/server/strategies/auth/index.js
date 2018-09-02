import CredentialsModel from '../../models/credentials';

// import serverConfig from '../../server-config';
//
// import authStrategyMock from './auth-strategy-mock';
import authStrategyOauth2 from './auth-strategy-oauth2';

export default function factoryAuthStrategy(servicesContext) {
  return async (request, response) => {
    // let userInfo;
    // if (serverConfig.server.features.mocking.authMock) {
    //   userInfo = await authStrategyMock(request, response, services);
    // } else {
    //   userInfo = await authStrategyOauth2(request, response, servicesContext);
    // }
    const userInfo = await authStrategyOauth2(request, response, servicesContext);
    return new CredentialsModel(userInfo);
  };
}



