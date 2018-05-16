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
  const contextPath = (window[CONTEXT_PATH] || '').replace(/^\//gi, '');
  let clientConfig = getClientStoreInitialState()[STATE_CLIENT_CONFIG_PARAM];
  if (!clientConfig || clientConfig === {}) {
    const url = `/${contextPath}/${DEFAULT_CONFIG_JSON_PATH}`;
    try {
      const response = await fetch(url);
      clientConfig = await response.json();
    } catch (error) {
      console.error(`Can't load ${url}`, error);
    }
  }

  // перезатираем, если явно задан
  if (contextPath) {
    clientConfig.common.app.contextRoot = contextPath;
  }
  return clientConfig || {};
}

export function getI18nClientBundles() {
  return window[GLOBAL_I18N_CLIENT_BUNDLES] || {};
}
