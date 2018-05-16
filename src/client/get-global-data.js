import {
  GLOBAL_CLIENT_STORE_INITIAL_STATE,
  GLOBAL_I18N_CLIENT_BUNDLES,
  STATE_CLIENT_CONFIG_PARAM,
  CONTEXT_PATH,
} from '../common/constants/sync-consts';

// если мы используем внешний сервер, который плюется статикой, то нужно дефолтные настройки подцепить отдельным файлом
const DEFAULT_CONFIG_JSON_PATH = 'assets/default-config.json';

// export const isBrowser = (new Function('try {return this===window;}catch(e){ return false;}'))();
export function getClientStoreInitialState() {
  return window[GLOBAL_CLIENT_STORE_INITIAL_STATE] || {};
}

export async function getClientConfig() {
  let clientConfig = getClientStoreInitialState()[STATE_CLIENT_CONFIG_PARAM];
  if (!clientConfig || clientConfig === {}) {
    try {
      const contextPath = window[CONTEXT_PATH] || '';
      const response = await fetch(`${contextPath}/${DEFAULT_CONFIG_JSON_PATH}`);
      clientConfig = await response.json();
    } catch (error) {
      console.error('Can\'t load "/assets/default-config.json"', error);
    }
  }
  return clientConfig || {};
}

export function getI18nClientBundles() {
  return window[GLOBAL_I18N_CLIENT_BUNDLES] || {};
}
