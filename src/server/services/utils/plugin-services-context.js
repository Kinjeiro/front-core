/* eslint-disable no-param-reassign */
export const REQUEST_FIELD__SERVICES_CONTEXT = 'servicesContext';
export const REQUEST_FIELD__GET_SERVICES = 'getService';
export const REQUEST_FIELD__SERVICES = 'services';

/**
 * Обогощает request "servicesContext" и "services" еще перед авторизацией
 * @param server
 * @param options
 * @param next
 */
function pluginServicesContext(server, options, next) {
  const {
    servicesContext,
  } = options;

  // после парсинга кук, но перед проверкой авторизации
  server.ext('onPreAuth', (request, reply) => {
    request[REQUEST_FIELD__SERVICES_CONTEXT] = servicesContext;
    request[REQUEST_FIELD__GET_SERVICES] = servicesContext.getService.bind(servicesContext, request);
    // для удобства
    request[REQUEST_FIELD__SERVICES] = servicesContext.createServicesProxy(request);

    return reply.continue();
  });

  next();
}

pluginServicesContext.attributes = {
  name: 'pluginServicesContext',
};

export default pluginServicesContext;
