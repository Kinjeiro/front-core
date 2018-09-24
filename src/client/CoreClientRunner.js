/* eslint-disable no-undef */
import AbstractClientRunner from './AbstractClientRunner';

import { getClientStoreInitialState as getStateFromPage } from './get-global-data';

import { initComponents } from '../common/get-components';

import SubModuleFactory from '../modules/SubModuleFactory';

/**
 * Расширение для установки core зависимостей по redux и импорт данных, пришедших с сервера при отрисовки
 */
export default class CoreClientRunner extends AbstractClientRunner {
  subModulesContextId = null;

  loadCommonSubModules() {
    const subModulesContext = require.context('../modules', true, /^\.\/(.*)\/common\/subModule\/index\.js/gi);
    this.subModulesContextId = subModulesContext.id;
    return [
      ...super.loadCommonSubModules(),
      // нужно статически обозначить контекст + необходим regexp без переменных
      ...SubModuleFactory.loadSubModules(subModulesContext),
    ];
  }

  getEntityModels() {
    return {
      ...super.getEntityModels(),
      ...require('../common/models/domains').default,
    };
  }

  initComponents(COMPONENTS_BASE) {
    super.initComponents(COMPONENTS_BASE);
    return initComponents(COMPONENTS_BASE);
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
      this.getProjectLayoutComponent(),
      this.getIndexRoute(),
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
    // чтобы получать redux данные внутри апи (удобно для userId), чтобы не передавать глобальные контекстные данные во все методы апи
    const SuperClass = super.getApiClientClass();
    class ApiClientWithContextClass extends SuperClass {
      constructor(...args) {
        super(...args);
        this.setGetContextDataFn(store.getState.bind(store));
      }
    }
    return ApiClientWithContextClass;
  }

  hotReloadListeners() {
    super.hotReloadListeners();

    /**
     * // todo @ANKU @LOW - только в связке они работают, поэтому приходится добавлять пустой метод, ибо без него проскакивает контекст
     */
    // https://github.com/webpack/webpack/issues/834#issuecomment-76590576
    // ./src/modules recursive ^\.\/(.*)\/common\/index\.js/g
    module.hot.accept(this.subModulesContextId, this.reloadUi);
    module.hot.accept('../common/create-routes', () => {});

    module.hot.accept('../common/app-redux/reducers/root', this.reloadStore);
    module.hot.accept('../common/models/domains', this.reloadAll);
    module.hot.accept('../common/api', this.reloadAll);
  }

  getInitialState() {
    // данные преходящие с серверного рендеринга, смотри \src\server\plugins\pages\index.html.ejs
    return getStateFromPage();
  }
}
