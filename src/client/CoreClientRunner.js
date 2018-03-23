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

  getRoutes(store) {
    return require('../common/create-routes').default(store);
  }

  getApi() {
    return require('../common/api').default;
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
