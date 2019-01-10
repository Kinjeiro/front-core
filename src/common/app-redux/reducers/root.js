import merge from 'lodash/merge';
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import ormReducer from './app/orm-reducer';
import globalUniError from './app/global-uni-error';
import lastUniError from './app/last-uni-error';
import currentPage from './app/current-page';
import i18nInfo from './app/i18n-info';
import tables from './app/redux-tables';
import modules from './app/redux-modules';
import test from './app/test';
import preLoader from './app/pre-loader';

import uiDomains from './ui-domains';

// todo @ANKU @CRIT @MAIN - может для инат на сервере сделать dispatch с экшеном?
import { CLIENT_CONFIG_STORE_VARIABLE } from '../selectors';

export const coreReduces = {
  // ======================================================
  // VENDORS
  // ======================================================
  routing: routerReducer,
  orm: ormReducer,

  // ======================================================
  // PROJECT
  // ======================================================
  globalUniError,
  lastUniError,
  currentPage,
  i18nInfo,
  tables,
  modules,
  test,
  preLoader,

  // ======================================================
  // UI DOMAINS
  // ======================================================
  uiDomains,

  // todo @ANKU @CRIT @MAIN - почему-то создается на сервере? нужно убрать
  app: (state = {}) => state,

  [CLIENT_CONFIG_STORE_VARIABLE]: (state = {}) => state,
};

export function createRootReducer(customReducers) {
  return combineReducers(merge({}, coreReduces, customReducers));
}

export default createRootReducer();
