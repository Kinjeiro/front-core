import { getCredentialsFromRequest } from '../../utils/credentials-utils';

export default function checkPermissionDefault(apiRequest, accessObject) {
  return getCredentialsFromRequest(apiRequest).checkSimplePermission(accessObject);
}
