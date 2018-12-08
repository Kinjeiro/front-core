export const REQUEST_FIELD__GET_MODULE_PREFIXES = 'getModulesPrefixes';

function pluginModuleMap(server, options, next) {
  const {
    getModuleToRoutePrefixMap,
  } = options;
  // после авторизации
  server.ext('onPostAuth', (request, reply) => {
    // eslint-disable-next-line no-param-reassign
    request[REQUEST_FIELD__GET_MODULE_PREFIXES] = getModuleToRoutePrefixMap;
    return reply.continue();
  });

  next();
}

pluginModuleMap.attributes = {
  name: 'pluginModuleMap',
};

export default pluginModuleMap;
