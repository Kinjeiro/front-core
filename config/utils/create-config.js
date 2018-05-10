/* eslint-disable no-unused-vars */
const pathLib = require('path');
// на клиенте нет pahtLib.posix а на винде на сервере без posix будет неправильный урлы
const join = (pathLib.posix || pathLib).join;

const FRONT_UI_SERVER_API_PREFIX = 'api';

function createConfig(
  fullPath,
  method = 'get',
  payload = undefined
) {
  /*
   @guide - пример apiConfig

   accounts: {
   //метод запроса до внешнего сервиса (используется как с клиента так и с нод сервера)
   method: 'GET',

   //проксирующий путь на локальном node сервере, по которому клиент будет обращаться,
   //а node сервер будет уже дальше пробрасывать запрос на сервис по [method][url]
   path: '/api/accounts/{pinEq}',

   //мапа дополнительной информация пробрасываемая на удаленный сервис
   payload: { maxBytes: 2345678945678 },

   //путь до внешнего middleware REST сервиса
   proxyUrl: `http://${SERVICES_HOST}/ufr-accounts-api/accounts/{pinEq}`,
   }
   */

  return {
    method,
    // /api/test-client-api/find
    path: join('/', FRONT_UI_SERVER_API_PREFIX, fullPath),
    payload
  };
}

/**
 * Создание настроек для клиенской части и их роутинг через плагину на серверной
 *
 * @param path
 * @param method
 * @param payload
 * @returns {{method, path, payload}|*}
 */
function createApiConfig(
  path,
  method,
  payload
) {
  const fullPath = join('/', path);
  return createConfig(fullPath, method, payload);
}

// /**
//  * Настройки для клиенской части и проксирование через сервер по урлу удаленного rest сервиса
//  *
//  * @param restServiceProtocol
//  * @param restServiceHost
//  * @param restServicePort
//  * @param restServiceContextRoot
//  * @param restServicePath
//  * @param method
//  * @param payload
//  * @returns {{method, path, payload}|*}
//  */
// function createApiConfigWithService(
//   restServiceProtocol,
//   restServiceHost,
//   restServicePort,
//   restServiceContextRoot,
//   restServicePath,
//   method,
//   payload
// ) {
//   const fullPath = join('/', restServiceContextRoot, restServicePath);
//   const restServiceFullUrl = `${restServiceProtocol}://${restServiceHost}:${restServicePort}${fullPath}`;
//   return createConfig(restServiceFullUrl, fullPath, method, payload);
// }

// /**
//  * Настрока для REST сервисов, которые необходимы только на серверное части.
//  *
//  * @param restServiceFullUrl
//  * @param method
//  * @param payload
//  * @returns {{method, path, payload}|*}
//  */
// function createRestServiceConfig(
//   // restServiceFullUrl,
//   method,
//   payload
// ) {
//   return createConfig(restServiceFullUrl, null, method, payload);
// }

/**
 * Это настройка для набора сервисов, который после подключения спец библиотек (Thrift или оберток над Rest)
 * позволяют дергать свое апи через методы с переменными
 * (вся логика выстраивания пути до rest сервисов, инкапсулирована внутри).
 * Это позволяет их легко переиспользовать, в том числе и в других проектах.
 *
 * @param protocol
 * @param host
 * @param port
 * @param endpoint
 * @param timeout
 * @returns {{protocol: string, host: string, port: number, endpoint: string, fullUrl: string, timeout: *}}
 */
function createEndpointServiceConfig({
  protocol,
  host,
  port,
  endpoint,
  timeout,
  fullUrl
}) {
  if (fullUrl) {
    return {
      fullUrl,
      timeout
    };
  }

  const {
    /** Марафон при запуска автоматически добавляет адресс хоста в эту переменную */
    HOST,
    /** Когда запускаем на localhost или нужно на стендах зашить */
    SERVICES_HOST,
    SERVICES_PORT,
    /** Первый запуск мидловых сервисов бывает до 20 сек*/
    REQUEST_TIMEOUT
  } = process.env;

  const config = {
    protocol: protocol || 'http',
    host: host || HOST || SERVICES_HOST || 'localhost',
    port: port || SERVICES_PORT || 80,
    endpoint: endpoint || '',
    timeout: timeout || REQUEST_TIMEOUT || 120000
    // fullUrl,
  };

  // eslint-disable-next-line max-len
  config.fullUrl = `${config.protocol}://${config.host}${config.port !== 80 ? `:${config.port}` : ''}${config.endpoint ? join('/', config.endpoint) : ''}`;
  return config;
}

/**
 * @deprecated
 *
 * @param env
 * @returns {function(*, *=)}
 */
function createEndpointFactoryFromEnv(env) {
  const {
    /** Марафон при запуска автоматически добавляет адресс хоста в эту переменную */
    HOST,
    /** Когда запускаем на localhost или нужно на стендах зашить */
    SERVICES_HOST,
    SERVICES_PORT = 80,
    /** Первый запуск мидловых сервисов бывает до 20 сек*/
    REQUEST_TIMEOUT = 120000
  } = env || process.env;

  const FINAL_SERVICES_HOST = HOST || SERVICES_HOST || 'localhost';

  return (endpoint, otherConfigs = {}) => {
    return createEndpointServiceConfig(Object.assign({
      host: FINAL_SERVICES_HOST,
      port: SERVICES_PORT,
      endpoint,
      timeout: REQUEST_TIMEOUT
    }, otherConfigs));
  };
}

module.exports = {
  FRONT_UI_SERVER_API_PREFIX,
  createApiConfig,
  // createApiConfigWithService,
  createEndpointServiceConfig,
  createEndpointFactoryFromEnv
};
