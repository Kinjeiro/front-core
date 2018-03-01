import CredentialsModel from '../../models/credentials';

import serverConfig from '../../server-config';

import authStrategyMock from './auth-strategy-mock';
import authStrategyOauth2 from './auth-strategy-oauth2';

export default function factoryAuthStrategy(services/* , otherStrategies, strategyOptions*/) {
  return async (request, response) => {
    let userInfo;
    if (serverConfig.server.features.mocking.authMock) {
      userInfo = await authStrategyMock(request, response, services);
    } else {
      userInfo = await authStrategyOauth2(request, response, services);
    }

    return new CredentialsModel(userInfo);
  };
}



