// import i18n from 'i18n';
import i18next from 'i18next';

import clientConfig from '../client-config';

// default
let i18nInstance = i18next;

/**
 * Метод инициализации настроек
 * Используется отдельно на клиенте и отдельно на сервере
 *
 * @param newI18nInstance
 */
export function init(newI18nInstance) {
  i18nInstance = newI18nInstance;
  return i18nInstance;
}

export function getI18Instance() {
  return i18nInstance;
}


export function translateWithNamespace(namespace, key, mapParams = {}) {
  // return i18nInstance.t(key, {
  //  defaultValue: defaultValue || key,
  //  ...mapParams
  // });
  if (!i18nInstance.language) {
    console.error(
      'i18n: language hasn\'t been set yet. Doesn\'t use i18n out of container/I18NProvider wrapper',
      `key: ${key}`,
    );
  }

  if (namespace && key.indexOf(':') < 0) {
    // eslint-disable-next-line no-param-reassign
    key = `${namespace}:${key}`;
  }

  const value = i18nInstance.t(key, {
    defaultValue: clientConfig.common && !clientConfig.common.isProduction
      ? `@@ ${key}`
      : undefined,
    ...mapParams,
  });
  return value;
}

/**
 * Translate - see \lk\front\src\i18n\ru\common.json
 * @param key
 * @param mapParams ( defaultValue props include )
 * @param namespace
 * @returns {*}
 */
export function translateDefault(key, mapParams = {}, namespace = '') {
  return translateWithNamespace(namespace, key, mapParams);
}

export const translateCore = translateWithNamespace.bind(null, 'core');


/**
 * чтобы каждый раз не писать префиксы для конкретного компонента
 *
 * Пример:
 * import {i18nContextProvider}
   const i18n = i18nContextProvider('components.MyComponent');
   console.log(i18n('core:keyForMyComponent')); //components.MyComponent.keyForMyComponent

 * @param context
 * @returns {Function}
 */
export function i18nContextProvider(context) {
  if (context[context.length - 1] !== '.') {
    context += '.';
  }
  return (key, ...other) => translate(`${context}${key}`, ...other);
}

export function getWhitelistLanguages() {
  return i18nInstance.options.whitelist;
}

export function getCurrentLanguage() {
  return i18nInstance.language;
}

export function changeLanguagePromise(language) {
  let loadedHandler;
  let errorLoadedHandler;

  return new Promise((resolve, reject) => {
    loadedHandler = resolve;
    errorLoadedHandler = reject;

    // i18nInstance.on('loaded', loadedHandler);
    i18nInstance.on('languageChanged', loadedHandler);
    i18nInstance.on('failedLoading', errorLoadedHandler);

    i18nInstance.changeLanguage(language);
  })
    .finally(() => {
      i18nInstance.off('languageChanged', loadedHandler);
      i18nInstance.off('failedLoading', errorLoadedHandler);
    });
}

export default translateDefault;
