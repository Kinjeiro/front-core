import h2o2 from 'h2o2'; // Proxy handler plugin for hapi.js
import bind from 'lodash-decorators/bind';

// ======================================================
// UTILS
// ======================================================
import { testAppUrlStartWith } from '../common/helpers/app-urls';

import serverConfig from './server-config';

// ======================================================
// COMMON
// ======================================================
import CoreClientRunner from '../client/CoreClientRunner';

import createServices from './services';
import createStrategies from './strategies';
import {
  ASSETS,
  PATH_ERROR_PAGE,
  PATH_ACCESS_DENIED,
  PATH_LOGIN_PAGE,
} from '../common/constants/routes.pathes';

// ======================================================
// UTILS CONFIGS
// ======================================================
import pluginAuthJwt, { AUTH_SCHEME_NAME } from './plugins/jwt-auth';
import pluginPageIndex from './plugins/pages/pages';
import pluginProxyAssets from './plugins/proxy-assets';
import pluginStaticAssets from './plugins/static-assets';
import pluginI18n from './plugins/i18n';
import pluginMocking from './plugins/mocking';
// plugin api
import pluginApiHealthmonitor from './plugins/api/healthmonitor';
import pluginsApiAuthUser from './plugins/api/plugin-api-auth-user';

import AbstractServerRunner from './AbstractServerRunner';

import coreMockRoutes from './plugins/api/mocks';

/**
 * Расширение для установки core зависимостей
 */
export default class CoreServerRunner extends AbstractServerRunner {
  // ======================================================
  // for OVERRIDE
  // ======================================================
  createServices() {
    return {
      ...super.createServices(),
      ...createServices(serverConfig.server.endpointServices),
    };
  }

  createStrategies(services) {
    return {
      ...super.createStrategies(services),
      ...createStrategies(services),
    };
  }

  getClientRunner() {
    return new CoreClientRunner();
  }

  @bind()
  // eslint-disable-next-line no-unused-vars
  createProjectPrepareState(request, server, reduxGlobalState, pluginOptions) {
    return reduxGlobalState;
  }

  getMockRoutes() {
    return coreMockRoutes;
  }

  getTemplateHead() {
    return '';
  }
  getTemplateBody() {
    return '';
  }

  @bind()
  noAuthRequireMatcher(pathname) {
    return testAppUrlStartWith(
      pathname,
      ASSETS,
      this.getLoginPath(),
      PATH_ERROR_PAGE,
      PATH_ACCESS_DENIED,
      'favicon.ico',
    );
  }

  getLoginPath() {
    return PATH_LOGIN_PAGE;
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
        loginPath: this.getLoginPath(),
        noAuthRequireMatcherFn: this.noAuthRequireMatcher,
      },
    };
  }

  getPlugins(services, strategies) {
    const PROXY_ASSETS = serverConfig.server.main.proxyAssets;

    const hapiServerPlugins = super.getPlugins(services, strategies);

    // ======================================================
    // HAPI SERVER PLUGINS
    // ======================================================
    hapiServerPlugins.push(
      h2o2, // проксирование
      // loggerPlugin,
      pluginI18n,
      pluginAuthJwt, // options передаются при регистрации стратегии в методе initServerAuthStrategy
      {
        register: pluginMocking,
        options: {
          ...serverConfig.server.features.mocking,
          mockRoutes: this.getMockRoutes(),
        },
      },
      pluginApiHealthmonitor,
      ...pluginsApiAuthUser(services, strategies),
      this.getIndexPagePlugin(services, strategies),
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
