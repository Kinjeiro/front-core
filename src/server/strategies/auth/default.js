import CredentialsModel from '../../models/credentials';

import serverConfig from '../../server-config';
import { getUserByToken } from '../../plugins/api/mocks/users';

export default async function authDefault(token, authUserService) {
  let userInfo;
  if (serverConfig.server.features.mocking.authMock) {
    userInfo = getUserByToken(token);
  } else {
    userInfo = await authUserService.authValidate(token);
  }

  return new CredentialsModel(userInfo);
}
