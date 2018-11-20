import { includes } from '../../../../common/utils/common';

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

export function hasPermission(globalState, permission) {
  const user = getUser(globalState);
  return user && includes(user.permissions, permission);
}

export function hasRole(globalState, role) {
  const user = getUser(globalState);
  return user && includes(user.roles, role);
}
