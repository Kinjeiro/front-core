// see initialization in index.jsx

/**
 * Располагается в common, так как используется для инициализации и на серверной части тоже для компонентов
 */

/*
 @NOTE: К сожалению, clientConfig нельзя использовать для глобальных переменных (во время загрузки файлов),
 так как он ициниализируется чуть позже
 */

const clientConfig = {};
/**
 * Конфиги для клиента - это только лишь часть общих конфигов, которые поставляются на клиент вместе с initialState для стора при формировании html страницы
 * @param inputConfig
 * @returns {{}}
 */
export function initConfig(inputConfig) {
  Object.assign(clientConfig, inputConfig);
  return clientConfig;
}

/*
  Для тестирования через karma нужно передать суммарные конфиги - \build-scripts\karma-factory.js - 'testConfig' (CLIENT_CONFIG_WINDOW_VARIABLES)
*/
if (typeof window !== 'undefined' && window.testConfig) {
  initConfig(window.testConfig);
}

export default clientConfig;
