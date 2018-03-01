import { getToken } from '../../utils/auth-utils';
import { getUserByToken } from '../../plugins/api/mocks/users';

export default async function authStrategyOAuth2(request/* , response, services*/) {
  return getUserByToken(getToken(request));
}
