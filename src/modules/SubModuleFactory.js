/* eslint-disable no-unused-vars */
export const SUB_MODULE_FACTORY = {
  SUB_MODULE_TYPES: {
    COMMON: 'common',
    SERVER: 'server',
  },

  /**
   * только для require.context нужно явно regexp задавать а не через переменную
   */
  COMMON_SUB_MODULE_REGEXP: /^\.\/(.*)\/common\/subModule\/index\.js/gi,
  SERVER_SUB_MODULE_REGEXP: /^\.\/(.*)\/server\/subModule\/index\.js/gi,

  /**
   *
   * @param webpackRequireContext - require.context('./', true, SUB_MODULE_FACTORY.COMMON_SUB_MODULE_REGEXP);
   * @param type
   */
  loadSubModules(webpackRequireContext, type = this.SUB_MODULE_TYPES.COMMON) {
    const modules = webpackRequireContext
      .keys()
      .map((modulePath) => webpackRequireContext(modulePath).default);
    // modules.forEach(({ MODULE_NAME }) => console.log(`Load "${type}" sub module: "${MODULE_NAME}"`));
    return modules.map((module) =>
      (type === this.SUB_MODULE_TYPES.COMMON
        ? this.createCommonSubModule(module)
        : this.createServerSubModule(module)),
    );
  },

  DEFAULT_COMMON_SUB_MODULE_OPTIONS: {
    MODULE_NAME: null,
    initComponents: (componentsBase) => componentsBase,
    paths: {},

    getRoutes: (moduleRoutePrefix) => null,
    getApi: () => [],
    getRootReducers: () => ({}),

    hotReloadFunc: (reloadUi, reloadStore, reloadAll) => {
      // module.hot.accept('./routes-products', reloadUi);
    },
  },

  /**
   - MODULE_NAME: null,
   - initComponents: (componentsBase) => componentsBase,
   - paths: {},

   - getRoutes: (moduleRoutePrefix) => null,
   - getApi: () => [],
   - getStores: () => ({}),

   - hotReloadFunc: (reloadUi, reloadStore, reloadAll) => {
      // module.hot.accept('./routes-products', reloadUi);
    },

   * @return options
   */
  createCommonSubModule(options) {
    return {
      ...this.DEFAULT_COMMON_SUB_MODULE_OPTIONS,
      ...options,
    };
  },

  DEFAULT_SERVER_SUB_MODULE_OPTIONS: {
    getServerApi: (services, strategies, servicesContext) => [],
    getServerMocks: (services, strategies, servicesContext) => [],
    getServerServices: (endpointServices, servicesContext) => ({}),
    getServerMockServices: (endpointServices, servicesContext) => ({}),
  },

  /**
   - getServerApi: (services, strategies, servicesContext) => [],
   - getServerMocks: (services, strategies, servicesContext) => [],
   - getServerServices: (endpointServices, servicesContext) => ({}),
   - getServerMockServices: (endpointServices, servicesContext) => ({}),

   * @param options
   * @return {{options: *}}
   */
  createServerSubModule(options) {
    return {
      ...this.DEFAULT_SERVER_SUB_MODULE_OPTIONS,
      ...options,
    };
  },
};

export default SUB_MODULE_FACTORY;
