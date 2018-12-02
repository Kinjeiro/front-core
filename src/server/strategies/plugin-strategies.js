/* eslint-disable no-param-reassign */
export const REQUEST_FIELD__STRATEGIES = 'strategies';

/**
 * Обогощает request "servicesContext" и "services" еще перед авторизацией
 * @param server
 * @param options
 * @param next
 */
function pluginStrategies(server, options, next) {
  const {
    strategies,
    servicesContext,
  } = options;

  // после парсинга кук, но перед проверкой авторизации
  server.ext('onPreAuth', (request, reply) => {
    request[REQUEST_FIELD__STRATEGIES] = strategies;
    return reply.continue();
  });

  next();
}

pluginStrategies.attributes = {
  name: 'pluginStrategies',
};

export default pluginStrategies;
