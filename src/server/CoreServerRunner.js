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
  CORE_ROUTES_NAMES,
  ASSETS,
  PATH_ERROR_PAGE,
  PATH_ACCESS_DENIED,
} from '../common/routes.pathes';
import { PATH_AUTH_SIGNIN } from '../common/modules/module-auth/routes-paths-auth';


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
import pluginsApiTest from './plugins/api/plugin-api-test';
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
  createServices(endpointServices) {
    return {
      ...super.createServices(endpointServices),
      ...createServices(endpointServices),
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
  noAuthRequireMatcher(pathnameWithoutContextPath) {
    return testAppUrlStartWith(
      pathnameWithoutContextPath,
      ASSETS,
      CORE_ROUTES_NAMES.auth,
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
   * @return {boolean}
   */
  @bind()
  noNeedCredentialsPageMatcher(pathnameWithoutContextPath) {
    return false;
  }

  getLoginPath() {
    return PATH_AUTH_SIGNIN;
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
        noNeedCredentialsPageMatcherFn: this.noNeedCredentialsPageMatcher,
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
      pluginsApiTest,
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
