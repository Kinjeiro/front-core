import { includes } from '../../../../common/utils/common';

import { checkAccess as checkAccessMethod } from './helpers/access-object-utils';

export function getUserInfo(globalState) {
  return globalState.userInfo;
}

export function getUser(globalState) {
  const userInfo = getUserInfo(globalState);
  const { userData } = userInfo || {};
  return userData && userData.userId
    ? userData
    : null;
}
export function getUserId(globalState) {
  const userData = getUser(globalState);
  return (userData && userData.userId) || null;
}

export function hasPermission(globalState, ...permissions) {
  const user = getUser(globalState);
  return user && permissions.some((permission) => includes(user.permissions, permission));
}

export function hasRole(globalState, ...roles) {
  const user = getUser(globalState);
  return user && roles.some((role) => includes(user.roles, role));
}
export function checkAccess(globalState, accessObjectOrRoles, permissions = undefined) {
  const user = getUser(globalState);
  const isAccess = checkAccessMethod(user, accessObjectOrRoles, permissions);
  return isAccess === true;
}
