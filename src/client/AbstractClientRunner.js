import React from 'react';
import ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader';
// import RedBox from 'redbox-react';
import { useRouterHistory } from 'react-router';
// import { createHistory } from 'history'; // через require
import { syncHistoryWithStore } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import clientConfig from '../common/client-config';

import {
  // aggregateArrayFn,
  aggregateObjectFn,
} from '../common/utils/common';
import { joinUri } from '../common/utils/uri-utils';
import BaseApiClient from '../common/utils/BaseApiClient';
import * as apiUtils from '../common/utils/api-utils';

import logger from '../common/helpers/client-logger';
import getApiClient, {
  initApiClient,
  initApiClientClass,
  createApiClientByEndpoint,
} from '../common/helpers/get-api-client';


import { registerModels as registerOrmModels } from '../common/models/domains/utils/orm';
import createStore, {
  reloadReducers,
  getRootReducer,
} from '../common/app-redux/create-store';

import { createComponentBase } from '../common/ComponentsBase';

import './AbstractClientRunner.css';

/**
 * Абстракный класс для точечной настройки процесса запуска клиентской (браузерной) части приложения
 */
export default class AbstractClientRunner {
  htmlContainerId;

  commonSubModules = null;

  store;
  history;
  routes;

  componentsBase = null;

  /**
   * Мапа options
   * @param htmlContainerId - id дива, в котором будет разворачиваться реатовское приложение
   */
  constructor(runnerOptions = {}) {
    const {
      htmlContainerId,
    } = runnerOptions;

    // todo @ANKU @LOW - вынести в константы
    this.htmlContainerId = htmlContainerId || 'react-app';
  }


  // ======================================================
  // UTILS
  // ======================================================
  getCommonSubModules(force = false) {
    if (!this.commonSubModules || force) {
      // todo @ANKU @LOW - проверить: перегружать hot reload если изменится что-то внутри
      this.commonSubModules = this.loadCommonSubModules();
      this.commonSubModules.forEach((module) => {
        logger.log(`Init module "${module.MODULE_NAME}"`);
      });
    }
    return this.commonSubModules;
  }

  getComponents() {
    return this.componentsBase;
  }


  // ======================================================
  // for OVERRIDE
  // ======================================================
  loadCommonSubModules() {
    return [];
  }

  /**
   * для hot reload необходимо загружать через require
   * @returns {{}}
   */
  getReducers() {
    return aggregateObjectFn(this.getCommonSubModules(), 'getRootReducers')();
  }

  // todo @ANKU @LOW - переименовать в reduxOrmModels
  getEntityModels() {
    return {};
  }

  getApi() {
    return aggregateObjectFn(this.getCommonSubModules(), 'getApi')();
  }

  hotReloadListeners() {
    module.hot.accept('./Root', this.reloadUi);
    this.getCommonSubModules().forEach(
      (subModule) => subModule.hotReloadFunc(this.reloadUi, this.reloadStore, this.reloadAll, this.reloadModels),
    );
  }
  initComponents(COMPONENTS_BASE) {
    return COMPONENTS_BASE;
  }
  initSubModulesComponents(COMPONENTS_BASE) {
    this.getCommonSubModules().forEach((subModule) => subModule.initComponents(COMPONENTS_BASE));
    return COMPONENTS_BASE;
  }


  /**
   * Маппинг модуля на путь
   */
  getModuleToRoutePrefixMap() {
    // по умолчанию роутинг будет равен названию модуля
    return this.getCommonSubModules().reduce((result, commonSubModule) => {
      if (commonSubModule.getRoutes) {
        // добавляем лишь те, у которых есть роуты
        const moduleName = commonSubModule.MODULE_NAME;
        // eslint-disable-next-line no-param-reassign
        result[moduleName] = moduleName;
      }
      return result;
    }, {});
  }

  @bind()
  getModuleRoutePrefix(moduleName) {
    return this.getModuleToRoutePrefixMap()[moduleName];
  }

  getRoutes(/* store, options */) {
    throw new Error('need override "AbstractClientRunner.getRoutes"');
  }

  /**
   * место для переопределения и инициализации инстанса BaseApiClient
   */
  getApiClientClass() {
    return BaseApiClient;
  }

  getApiClient(defaultEndpoint) {
    return createApiClientByEndpoint(defaultEndpoint);
  }

  getGlobalWindowDebugVariables() {
    return {
      store: this.store,
      config: clientConfig,
      api: this.api,
      apiClient: getApiClient(),
      clientRunner: this,
      BaseApiClient,
      apiUtils,
      CB: require('../common/ComponentsBase').default,
      routes: this.routes,
    };
  }

  getInitialState() {
    return {};
  }

  // ======================================================
  // INIT
  // ======================================================
  initAllComponents(COMPONENTS_BASE) {
    this.initComponents(COMPONENTS_BASE);
    this.initSubModulesComponents(COMPONENTS_BASE);
    this.componentsBase = COMPONENTS_BASE;
    return COMPONENTS_BASE;
  }

  getContextRootBasename() {
    const basename = joinUri('/', clientConfig.common.app.contextRoot);
    return basename === '/' ? undefined : basename;
  }

  createHistory() {
    // только для клиента
    const CAN_USE_DOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

    return CAN_USE_DOM
      // необходимо через require, так как этот файл используется на сервере и там windows нет
      ? useRouterHistory(require('history').createHistory)({
        basename: this.getContextRootBasename(),
      })
      : null;
  }

  createStore(history, initialState = null) {
    // перед тем как будут запрошены reducer (через require, чтобы раньше не подцепились) нужно инициализировать orm модели
    this.registerModels();

    return createStore(history, {
      initialState: initialState || this.getInitialState(),
      rootReducer: getRootReducer(this.getReducers()),
    });
  }

  registerModels(reload = false) {
    try {
      registerOrmModels(this.getEntityModels(), reload);
    } catch (error) {
      logger.error(error);
    }
  }

  init() {
    // ======================================================
    // COMPONENTS
    // ======================================================
    // должны инициализироваться до роутев
    this.initAllComponents(createComponentBase());

    // ======================================================
    // CREATE STORE + HISTORY + ROUTES
    // ======================================================
    const routeHistory = this.createHistory();
    this.store = this.createStore(routeHistory);
    this.history = syncHistoryWithStore(routeHistory, this.store);
    this.routes = this.getRoutes(this.store);
    this.api = this.getApi();

    // ======================================================
    // API CLIENT
    // (после store чтобы дать доступ к контекстным данным, к примеру текущему пользователю)
    // ======================================================
    const ApiClientClass = this.getApiClientClass();
    initApiClientClass(ApiClientClass);
    const apiClient = this.getApiClient(clientConfig.common.apiClientEndpoint);
    initApiClient(apiClient);
  }


  // ======================================================
  // AFTER INIT
  // ======================================================
  printDebugInfo() {
    // ======================================================
    // DEBUG
    // ======================================================
    if (!clientConfig.common.isProduction) {
      logger.warn(`
        ================================\n
        ======= ${clientConfig.common.appId}:${clientConfig.common.appVersion} ========\n
        ================================
      `);
      logger.log('=====[ COMMON CONFIG ]=====', clientConfig.common);
      logger.log('=====[ CLIENT CONFIG ]=====', clientConfig.client);

      const variables = this.getGlobalWindowDebugVariables();

      logger.log(`Init global window variables: \n${Object.keys(variables).join('\n')}`);
      Object.keys(variables).forEach((key) => {
        logger.log(`Init variable: window.${key}`);
        window[key] = variables[key];
      });
    }
  }


  // ======================================================
  // RENDER
  // ======================================================
  createRootComponent(isUseHot = undefined) {
    let Root = require('./Root').default;
    const {
      store,
      history,
      routes,
    } = this;

    const isHot = typeof isUseHot === 'undefined'
      ? clientConfig.common.hotLoader
      : isUseHot;

    if (isHot) {
      // переход на react-hot-reload v4 - https://github.com/gaearon/react-hot-loader/blob/master/README.md#appcontainer-vs-hot
      // // todo @ANKU @BUG_OUT @react-hot-loader - при отключенном SERVER_SIDE_RENDER, если явно
      // // не задать errorReporter, то внутри он берет RedBox через required но
      // // без default (может быть связано с тем что работает компилятор TypeScript) соотвественно
      // // получает объект а не функцию - создание компонента и падает с ошибкой, не показывая оригинальную ошибку
      // // поэтому пришлось самому инсталить его и подавать правильно
      // reactRootComponent = React.createElement(
      //   AppContainer,
      //   {
      //     errorReporter: clientConfig.common.isProduction ? undefined : RedBox,
      //   },
      //   reactRootComponent,
      // );

      Root = hot(module)(Root);
    }

    return React.createElement(
      Root,
      {
        store,
        history,
        routes,
      },
    );
  }

  getHtmlContainer() {
    const { htmlContainerId } = this;
    let container = document.getElementById(htmlContainerId);

    if (!container) {
      logger.warn(`Container with "${htmlContainerId}" id doesn't exist. Create manual.`);
      container = document.createElement('div', {
        id: htmlContainerId,
        className: 'ReactApp',
      });
      document.body.appendChild(container);
    }
    return container;
  }

  renderDOM(isUseHot = undefined) {
    const reactRootComponent = this.createRootComponent(isUseHot);
    const reactAppDiv = this.getHtmlContainer();

    ReactDOM.render(
      reactRootComponent,
      reactAppDiv,
    );
  }


  // ======================================================
  // RELOAD
  // ======================================================
  @bind()
  reloadAll() {
    this.reloadModels();
    this.reloadStore();
    this.reloadUi();
  }

  @bind()
  reloadModels() {
    this.registerModels(true);
  }

  @bind()
  reloadStore() {
    reloadReducers(this.store, getRootReducer(this.getReducers()));
  }

  @bind()
  reloadUi() {
    this.commonSubModules = null;
    this.initAllComponents(createComponentBase());
    this.routes = this.getRoutes(this.store);
    this.renderDOM(true);
  }


  // ======================================================
  // MAIN RUN
  // ======================================================
  run() {
    try {
      // ======================================================
      // INITIALIZATION
      // ======================================================
      this.init();
      this.printDebugInfo();


      // ======================================================
      // LISTENERS
      // ======================================================
      if (clientConfig.common.hotLoader) {
        if (module.hot) {
          this.hotReloadListeners();
        }
      }

      // ======================================================
      // RENDER APP
      // ======================================================
      this.renderDOM();
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
