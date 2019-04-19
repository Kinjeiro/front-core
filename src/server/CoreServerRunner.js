/* eslint-disable no-unused-vars */
import h2o2 from 'h2o2'; // Proxy handler plugin for hapi.js
import bind from 'lodash-decorators/bind';

// ======================================================
// UTILS
// ======================================================
import { aggregateArrayFn } from '../common/utils/common';
import { joinPath } from '../common/utils/uri-utils';
import { testAppUrlStartWith } from '../common/helpers/app-urls';

import serverConfig from './server-config';

// ======================================================
// COMMON
// ======================================================
import CoreClientRunner from '../client/CoreClientRunner';
import { createComponentBase } from '../common/ComponentsBase';
import SubModuleFactory from '../modules/SubModuleFactory';

import createServices from './services';
import createMockServices from './services/mocks';
import createStrategies from './strategies';
import {
  ASSETS,
  PATH_ERROR_PAGE,
  PATH_ACCESS_DENIED,
  HOT_RELOAD_PREFIX,
} from '../common/routes.pathes';

import moduleAuth from '../modules/module-auth/common/subModule';


// ======================================================
// UTILS CONFIGS
// ======================================================
import { AUTH_SCHEME_NAME } from '../modules/module-auth/server/subModule/plugins/jwt-auth';

import pluginPageIndex from './plugins/pages/pages';
import getPreLoader from './plugins/pages/default-pre-loader';
import pluginProxyAssets from './plugins/proxy-assets';
import pluginStaticAssets from './plugins/static-assets';
import pluginI18n from './plugins/i18n';
import pluginMocking from './plugins/plugin-mocking';
import pluginsRequestUser from './plugins/plugin-request-user';
import pluginModuleMap from './plugins/plugin-module-map';

// plugin api
import pluginApiHealthmonitor from './plugins/api/healthmonitor';
import pluginApiTest from './plugins/api/plugin-api-test';
import pluginApiConfig from './plugins/api/plugin-api-config';

import AbstractServerRunner from './AbstractServerRunner';

import getMockRoutes from './plugins/api/mocks';

// нужно статически обозначить контекст + необходим regexp без переменных
const serverSubModulesContext = require.context('../modules', true, /^\.\/(.*)\/server\/subModule\/index\.js/gi);

/**
 * Расширение для установки core зависимостей
 */
export default class CoreServerRunner extends AbstractServerRunner {
  clientRunner = null;

  // ======================================================
  // UTILS
  // ======================================================
  getModuleToRoutePrefixMap() {
    return this.getClientRunner().getModuleToRoutePrefixMap();
  }
  getModuleRoutePrefix(moduleName) {
    return this.getClientRunner().getModuleRoutePrefix(moduleName);
  }

  getClientRunner() {
    if (!this.clientRunner) {
      this.clientRunner = this.createClientRunner();
      if (serverConfig.common.isServerSideRendering) {
        this.clientRunner.initAllComponents(createComponentBase());
      }
    }
    return this.clientRunner;
  }

  // ======================================================
  // for OVERRIDE
  // ======================================================
  loadServerSubModules() {
    return [
      ...super.loadServerSubModules(),
      ...SubModuleFactory.loadSubModules(serverSubModulesContext, SubModuleFactory.SUB_MODULE_TYPES.SERVER),
    ];
  }

  createServices(endpointServices, servicesContext) {
    return {
      ...super.createServices(endpointServices, servicesContext),
      ...createServices(endpointServices, servicesContext),
    };
  }

  createMockServices(endpointServices, servicesContext) {
    return {
      ...super.createMockServices(endpointServices, servicesContext),
      ...createMockServices(endpointServices, servicesContext),
    };
  }

  createStrategies(servicesContext) {
    return {
      ...super.createStrategies(servicesContext),
      ...createStrategies(servicesContext),
    };
  }

  createClientRunner() {
    return new CoreClientRunner();
  }

  @bind()
  // eslint-disable-next-line no-unused-vars
  createProjectPrepareState(request, server, reduxGlobalState, pluginOptions) {
    return reduxGlobalState;
  }

  getMockRoutes(services, strategies, servicesContext) {
    return [
      ...aggregateArrayFn(this.getServerSubModules(), 'getServerMocks')(services, strategies, servicesContext),
      ...getMockRoutes(services, strategies, servicesContext),
    ];
  }

  getTemplateHead() {
    return '';
  }
  getTemplateBody() {
    return '';
  }

  @bind()
  noAuthRequireMatcher(pathnameWithoutContextPath) {
    return testAppUrlStartWith(
      pathnameWithoutContextPath,
      ASSETS,
      HOT_RELOAD_PREFIX,
      // CORE_ROUTES_NAMES.auth,
      this.getModuleRoutePrefix(moduleAuth.MODULE_NAME),
      // this.getLoginPath(),
      PATH_ERROR_PAGE,
      PATH_ACCESS_DENIED,
      'favicon.ico',
    );
  }

  /**
   * Определеяет какие куски приложения требуют авторизации
   * В enterprise обычно все что не noAuthRequireMatcher
   * Но других проектах помимо noAuthRequireMatcher (где указыавются просто файлы, статика, авторизация и подобное)
   * еще позволительный страницы без юзера (к примеру лендинг)
   *
   * @param pathnameWithoutContextPath
   * @param moduleToRoutePrefixMap
   * @return {boolean}
   */
  @bind()
  noNeedCredentialsPageMatcher(pathnameWithoutContextPath) {
    return false;
  }

  @bind()
  getLoginPath() {
    return joinPath(this.getModuleRoutePrefix(moduleAuth.MODULE_NAME), moduleAuth.paths.PATH_AUTH_SIGNIN);
  }

  /**
   *
   * @return  string || (reduxStore, i18n) => string
   */
  getPreLoader() {
    return getPreLoader;
  }

  // ======================================================
  // METHODS
  // ======================================================
  getIndexPagePlugin(services, strategies) {
    const PROXY_ASSETS = serverConfig.server.main.proxyAssets;

    return {
      register: pluginPageIndex,
      options: {
        staticAssets: !PROXY_ASSETS,
        services,
        strategies,
        clientRunner: this.getClientRunner(),
        createProjectPrepareState: this.createProjectPrepareState,
        headHtml: this.getTemplateHead(),
        bodyHtml: this.getTemplateBody(),
        loginPath: this.getLoginPath,
        noAuthRequireMatcherFn: this.noAuthRequireMatcher,
        noNeedCredentialsPageMatcherFn: this.noNeedCredentialsPageMatcher,
        preLoader: this.getPreLoader(),
      },
    };
  }

  getPlugins(services, strategies, servicesContext) {
    const PROXY_ASSETS = serverConfig.server.main.proxyAssets;

    const hapiServerPlugins = super.getPlugins(services, strategies, servicesContext);

    // ======================================================
    // HAPI SERVER PLUGINS
    // ======================================================
    hapiServerPlugins.push(
      h2o2, // проксирование
      // loggerPlugin,
      {
        register: pluginModuleMap,
        options: {
          getModuleToRoutePrefixMap: this.getModuleToRoutePrefixMap.bind(this),
        },
      },
      pluginI18n,
      // получаем из module-auth::getServerPlugins
      // pluginAuthJwt, // options передаются при регистрации стратегии в методе initServerAuthStrategy
      pluginsRequestUser,

      // ======================================================
      // API additional
      // ======================================================
      {
        register: pluginMocking,
        options: {
          ...serverConfig.server.features.mocking,
          mockRoutes: this.getMockRoutes(services, strategies, servicesContext),
        },
      },
      this.getIndexPagePlugin(services, strategies),

      // ======================================================
      // API
      // ======================================================
      pluginApiHealthmonitor,
      pluginApiTest,
      pluginApiConfig,
    );

    if (PROXY_ASSETS) {
      hapiServerPlugins.push(
        {
          register: pluginProxyAssets,
          options: PROXY_ASSETS,
        },
      );
    } else {
      hapiServerPlugins.push(
        {
          register: pluginStaticAssets,
          // ,
          // options: { basePath: CONTEXT_PATH }
        },
      );
    }

    return hapiServerPlugins;
  }

  initServerAuthStrategy(services, strategies) {
    const { server } = this;

    server.auth.strategy('default', AUTH_SCHEME_NAME, false, {
      authStrategy: strategies.authStrategy,
      noAuthRequireMatcherFn: this.noAuthRequireMatcher,
    });

    super.initServerAuthStrategy(services, strategies);
  }
}
