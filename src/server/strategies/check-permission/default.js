import { getCredentialsFromRequest } from '../../utils/credentials-utils';

export default function checkPermissionDefault(apiRequest, permission) {
  return getCredentialsFromRequest(apiRequest).checkSimplePermission(permission);
}
