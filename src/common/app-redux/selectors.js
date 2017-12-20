import { createSelector } from 'redux-orm';

import orm from '../models/domains/utils/orm';

import { STATE_CLIENT_CONFIG_PARAM } from '../constants/sync-consts';

// ======================================================
// APP
// ======================================================
export function getUserInfo(globalState) {
  return globalState.userInfo;
}

export function getUser(globalState) {
  const userInfo = getUserInfo(globalState);
  return userInfo && userInfo.username
    ? userInfo
    : null;
}

export function hasPermission(globalState, permission) {
  const user = getUser(globalState);
  return user && user.permissions && user.permissions.includes(permission);
}

export function getGlobalUniError(globalState) {
  return globalState.globalUniError;
}

export const CLIENT_CONFIG_STORE_VARIABLE = STATE_CLIENT_CONFIG_PARAM;
export function getClientConfig(globalState) {
  return globalState[STATE_CLIENT_CONFIG_PARAM];
}

export function getI18NInfo(globalState) {
  return globalState.i18nInfo;
}

export function getCurrentPage(globalState) {
  return globalState.currentPage;
}

export function getOrm(globalState) {
  return globalState.orm;
}

export function createOrmSelector(...args) {
  const ormSelector = createSelector(orm, ...args);
  return (globalState) => ormSelector(getOrm(globalState));
}

export const getTestDomains = createOrmSelector(session => {
  // return session.TestDomain.all().toRefArray();
  return session.TestDomain.query.toRefArray();
  // return session.TestDomain.query.all(entity => {
  //  // entity.ref - Returns a reference to the raw object in the store, so it doesn't include any reverse or m2m fields.
  //  return entity.ref;
  // });
});


// ======================================================
// UI-DOMAINS
// ======================================================
function getUiDomainEntity(globalState, domainName, id) {
  const moduleInstance = globalState.uiDomains[domainName].byIds[id];
  return moduleInstance ? moduleInstance.data : undefined;
}
export function getForm(globalState, id) {
  return getUiDomainEntity(globalState, 'forms', id) || undefined;
}
export function getFilter(globalState, id) {
  return getUiDomainEntity(globalState, 'filters', id) || undefined;
}

