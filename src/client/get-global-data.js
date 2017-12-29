import {
  GLOBAL_CLIENT_STORE_INITIAL_STATE,
  GLOBAL_I18N_CLIENT_BUNDLES,
  STATE_CLIENT_CONFIG_PARAM,
} from '../common/constants/sync-consts';

// export const isBrowser = (new Function('try {return this===window;}catch(e){ return false;}'))();
export function getClientStoreInitialState() {
  return window[GLOBAL_CLIENT_STORE_INITIAL_STATE] || {};
}

export function getClientConfig() {
  return getClientStoreInitialState()[STATE_CLIENT_CONFIG_PARAM];
}

export function getI18nClientBundles() {
  return window[GLOBAL_I18N_CLIENT_BUNDLES] || {};
}
