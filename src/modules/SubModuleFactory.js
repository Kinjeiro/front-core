/* eslint-disable no-unused-vars */

/**
 Упрощенный модуль выглядит так:
 src/modules/module
   common/
    subModule/
      api/
      components/
      containers/
      models/
      stores/
        redux-reducers.js
        redux-selectors.js
        mobx-stores.js
      index.js
      get-components.js
      routes.jsx
      routes.paths.js
      module-name.js
   server/
    subModule/
       services/
       mockServices/
       plugins/
       mockRoutes/
       api-routes/
       index.js
       module-name.js
   package.json

 */
export const SUB_MODULE_FACTORY = {
  SUB_MODULE_TYPES: {
    COMMON: 'common',
    SERVER: 'server',
  },

  /**
   * ПРИМЕР
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
    )
      .filter((module) => !module.isTurnOff);
  },

  DEFAULT_COMMON_SUB_MODULE_OPTIONS: {
    MODULE_NAME: null,
    isTurnOff: false,
    isSystem: false,
    initComponents: (componentsBase) => componentsBase,
    paths: {},

    // getRoutes: (moduleRoutePrefix) => null,
    getRoutes: null,
    getApi: () => [],
    getRootReducers: () => ({}),
    reduxSelectors: {},
    reduxActions: () => ({}),

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
   - getRootReducers: () => ({}),
   - reduxSelectors: {},
   - reduxActions: (api) => ({}),

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
    isTurnOff: false,
    initServerSubModule: async (serverRunner) => {},
    afterStartServer: async (serverRunner) => {},

    getServerPlugins: (services, strategies, servicesContext) => [],
    getServerApi: (services, strategies, servicesContext) => [],
    getServerMocks: (services, strategies, servicesContext) => [],
    getServerServices: (endpointServices, servicesContext) => ({}),
    getServerMockServices: (endpointServices, servicesContext) => ({}),
    getServerStrategies: (servicesContext) => ({}),
    getDBModels: () => [],
  },

  /**
   - async initServerSubModule: (serverRunner) => {},
      событие происходящее один раз на сервере. Если что-то изменили в модуле - нужно весь сервер перезапустить
   - async afterStartServer: (serverRunner) => {},
      событие происходящее один раз на сервере. Если что-то изменили в модуле - нужно весь сервер перезапустить

   - getServerPlugins: (services, strategies, servicesContext) => [],
   - getServerApi: (services, strategies, servicesContext) => [],
   - getServerMocks: (services, strategies, servicesContext) => [],
   - getServerServices: (endpointServices, servicesContext) => ({}),
   - getServerMockServices: (endpointServices, servicesContext) => ({}),
   - getServerStrategies: (servicesContext) => ({}),
   - getDBModels: () => [],

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
