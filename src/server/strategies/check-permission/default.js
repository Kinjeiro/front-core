import { getCredentialsFromRequest } from '../../utils/credentials-utils';

export default function checkPermissionDefault(apiRequest, accessObject, notAuthCheck) {
  return getCredentialsFromRequest(apiRequest).checkSimplePermission(accessObject, notAuthCheck);
}
