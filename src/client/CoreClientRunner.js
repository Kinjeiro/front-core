/* eslint-disable no-undef */
import AbstractClientRunner from './AbstractClientRunner';

import { getClientStoreInitialState as getStateFromPage } from './get-global-data';

import SubModuleFactory from '../modules/SubModuleFactory';

/**
 * Расширение для установки core зависимостей по redux и импорт данных, пришедших с сервера при отрисовки
 */
export default class CoreClientRunner extends AbstractClientRunner {
  // ======================================================
  // FOR OVERRIDE
  // ======================================================
  /**
   * нужно выделить отдельный метод с контекстами, для hot reload (чтобы там id их использовать)
   * @return {[*]}
   */
  loadCommonSubModulesContexts() {
    return [
      require.context('../modules', true, /^\.\/(.*)\/common\/subModule\/index\.js/gi),
      require.context('../modules', true, /^\.\/(.*)\/common\/index\.js/gi),
    ];
  }

  // ======================================================
  // INNER
  // ======================================================
  subModulesContexts = null;

  getCommonSubModulesContexts(force = false) {
    if (force || !this.subModulesContexts) {
      this.subModulesContexts = this.loadCommonSubModulesContexts();
    }
    return this.subModulesContexts;
  }

  loadCommonSubModules() {
    const contexts = this.getCommonSubModulesContexts(true);
    const subModules = super.loadCommonSubModules();
    contexts.forEach((context) => subModules.push(...SubModuleFactory.loadSubModules(context)));
    return subModules;
  }

  getEntityModels() {
    return {
      ...super.getEntityModels(),
      ...require('../common/models/domains').default,
    };
  }

  initComponents(COMPONENTS_BASE) {
    super.initComponents(COMPONENTS_BASE);
    return require('../common/get-components').initComponents(COMPONENTS_BASE);
  }

  /**
   * Возвращаем мапу редьюсеров
   * @returns {*}
   */
  getReducers() {
    return {
      ...super.getReducers(),
      ...require('../common/app-redux/reducers/root').coreReduces,
    };
  }

  getProjectLayoutComponent() {
    return null;
  }

  getIndexRoute() {
    return null;
  }

  getRoutes(store, options = {}) {
    return require('../common/create-routes').default(
      store,
      this.getProjectLayoutComponent(store, options),
      this.getIndexRoute(store, options),
      {
        ...options,
        commonSubModules: this.getCommonSubModules(),
        moduleToRoutePrefixMap: this.getModuleToRoutePrefixMap(),
      },
    );
  }

  getApi() {
    return {
      ...super.getApi(),
      ...require('../common/api'),
    };
  }

  getApiClientClass() {
    const { store } = this;

    /*
      todo @ANKU @LOW @BUG_OUT @babel-minify - не умеет минимизировать файл если есть динамическое наследование внутри методов
      Cannot read property 'end' of null
      at _evaluate (H:\__CODER__\_W_Reagentum_\__Gasprom__\Project_Rascenka\formRascenka_FrontCore\node_modules\babel-traverse\lib\
      path\evaluation.js:159:58)
    */
    // чтобы получать redux данные внутри апи (удобно для userId), чтобы не передавать глобальные контекстные данные во все методы апи
    const SuperClass = super.getApiClientClass();
    // class ApiClientWithContextClass extends SuperClass {
    //   constructor(...args) {
    //     super(...args);
    //     this.setGetContextDataFn(store.getState.bind(store));
    //   }
    // }
    // return ApiClientWithContextClass;
    return class extends SuperClass {
      constructor(...args) {
        super(...args);
        this.setGetContextDataFn(store.getState.bind(store));
      }
    };
  }

  getInitialState() {
    // данные преходящие с серверного рендеринга, смотри \src\server\plugins\pages\index.html.ejs
    return getStateFromPage();
  }

  // hotReloadListeners() {
  //   super.hotReloadListeners();
  //
  //   // /**
  //   //  * // todo @ANKU @LOW - только в связке они работают, поэтому приходится добавлять пустой метод, ибо без него проскакивает контекст
  //   //  */
  //   // // https://github.com/webpack/webpack/issues/834#issuecomment-76590576
  //   // // ./src/modules recursive ^\.\/(.*)\/common\/index\.js/g
  //   // this.getCommonSubModulesContexts().forEach((context) => {
  //   //   module.hot.accept(context.id, this.reloadUi);
  //   // });
  //   // module.hot.accept('../common/create-routes', () => {});
  //   // module.hot.accept('../common/app-redux/reducers/root', this.reloadStore);
  //   // module.hot.accept('../common/api', this.reloadAll);
  //   module.hot.accept('../common/get-components.jsx', this.reloadUi);
  // }
}
