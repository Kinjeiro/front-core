import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import RedBox from 'redbox-react';
import { useRouterHistory } from 'react-router';
// import { createHistory } from 'history'; // через require
import { syncHistoryWithStore } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import clientConfig from '../common/client-config';

import { joinUri } from '../common/utils/uri-utils';
import logger from '../common/helpers/client-logger';
import getApiClient, {
  initApiClient,
  initApiClientClass,
  createApiClientByEndpoint,
} from '../common/helpers/get-api-client';
import BaseApiClient from '../common/utils/BaseApiClient';
import * as apiUtils from '../common/utils/api-utils';

import { registerModels as registerOrmModels } from '../common/models/domains/utils/orm';
import
  createStore,
  {
    reloadReducers,
    getRootReducer,
  }
from '../common/app-redux/create-store';

import COMPONENTS_BASE_CORE from '../common/components/ComponentsBase';

import './AbstractClientRunner.css';

/**
 * Абстракный класс для точечной настройки процесса запуска клиентской (браузерной) части приложения
 */
export default class AbstractClientRunner {
  htmlContainerId;

  store;
  history;
  routes;

  /**
   * Мапа options
   * @param htmlContainerId - id дива, в котором будет разворачиваться реатовское приложение
   */
  constructor(runnerOptions = {}) {
    const {
      htmlContainerId = 'react-app',
    } = runnerOptions;

    this.htmlContainerId = htmlContainerId;
  }

  // ======================================================
  // for OVERRIDE
  // ======================================================
  getInitialState() {
    return {};
  }

  /**
   * для hot reload необходимо загружать через require
   * @returns {{}}
   */
  getReducers() {
    return {};
  }
  getEntityModels() {
    return {};
  }
  getRoutes(store) {
    throw new Error('need override "AbstractClientRunner.getRoutes"');
  }
  getApi() {
    return {};
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

  initComponents(COMPONENTS_BASE) {
    return COMPONENTS_BASE;
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
      CB: require('../common/components/ComponentsBase').default,
    };
  }

  // ======================================================
  // INIT
  // ======================================================
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

  createStore(history, initialState = this.getInitialState()) {
    // перед тем как будут запрошены reducer (через require, чтобы раньше не подцепились) нужно инициализировать orm модели
    this.registerModels();

    return createStore(history, {
      initialState,
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
    this.initComponents(COMPONENTS_BASE_CORE);

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
    // ======================================================
    const ApiClientClass = this.getApiClientClass();
    initApiClientClass(ApiClientClass);
    const apiClient = this.getApiClient(clientConfig.common.apiClientEndpoint);
    initApiClient(apiClient);

    // ======================================================
    // DEBUG
    // ======================================================
    logger.warn(`
      ================================\n
      ======= ${clientConfig.common.appId}:${clientConfig.common.appVersion} ========\n
      ================================
    `);

    if (!clientConfig.common.isProduction) {
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
  // AFTER INIT
  // ======================================================
  createRootComponent() {
    const Root = require('./Root').default;
    return (
      <Root
        store={ this.store }
        history={ this.history }
        routes={ this.routes }
      />
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
    this.routes = this.getRoutes(this.store);
    this.renderDOM(true);
  }

  hotReloadListeners() {
    module.hot.accept('./Root', this.reloadUi);
  }

  // ======================================================
  // RENDER
  // ======================================================
  renderDOM(isUseHot = undefined) {
    let reactRootComponent = this.createRootComponent();

    const isHot = typeof isUseHot === 'undefined'
      ? clientConfig.common.hotLoader
      : isUseHot;

    if (isHot) {
      reactRootComponent = (
        // todo @ANKU @BUG_OUT @react-hot-loader - при отключенном SERVER_SIDE_RENDER, если явно
        // не задать errorReporter, то внутри он берет RedBox через required но
        // без default (может быть связано с тем что работает компилятор TypeScript) соотвественно
        // получает объект а не функцию - создание компонента и падает с ошибкой, не показывая оригинальную ошибку
        // поэтому пришлось самому инсталить его и подавать правильно
        <AppContainer errorReporter={ clientConfig.common.isProduction ? undefined : RedBox }>
          {reactRootComponent}
        </AppContainer>
      );
    }

    const reactAppDiv = this.getHtmlContainer();

    ReactDOM.render(
      reactRootComponent,
      reactAppDiv,
    );
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
    }
  }
}
