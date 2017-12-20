import { getCredentialsFromRequest } from '../../utils/credentials-utils';

export default function getUserInfoDefault(apiRequest) {
  const credentials = getCredentialsFromRequest(apiRequest);
  // практически полностью совпадает с user-info
  return credentials.userInfo;
}
