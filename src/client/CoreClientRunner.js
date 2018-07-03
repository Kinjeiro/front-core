import AbstractClientRunner from './AbstractClientRunner';

import { getClientStoreInitialState as getStateFromPage } from './get-global-data';

/**
 * Расширение для установки core зависимостей по redux и импорт данных, пришедших с сервера при отрисовки
 */
export default class CoreClientRunner extends AbstractClientRunner {
  getEntityModels() {
    return require('../common/models/domains').default;
  }

  /**
   * Возвращаем мапу редьюсеров
   * @returns {*}
   */
  getReducers() {
    return require('../common/app-redux/reducers/root').coreReduces;
  }

  getRoutes(store, projectLayout = null, options = {}) {
    return require('../common/create-routes').default(store, projectLayout, options);
  }

  getApi() {
    return require('../common/api').default;
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

    module.hot.accept('../common/create-routes', this.reloadUi);
    module.hot.accept('../common/app-redux/reducers/root', this.reloadStore);
    module.hot.accept('../common/models/domains', this.reloadAll);
    module.hot.accept('../common/api', this.reloadAll);
  }

  getInitialState() {
    // данные преходящие с серверного рендеринга, смотри \src\server\plugins\pages\index.html.ejs
    return getStateFromPage();
  }
}
