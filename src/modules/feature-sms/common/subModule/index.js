import SubModuleFactory from '../../../SubModuleFactory';

import MODULE_NAME from './module-name';

export default SubModuleFactory.createCommonSubModule({
  MODULE_NAME,

  getApi: () => require('./api-sms'),
  getRootReducers: () => require('./redux-sms').default,

  hotReloadFunc: (reloadUi, reloadStore, reloadAll) => {
    module.hot.accept('./api-sms', reloadAll);
    module.hot.accept('./redux-sms', reloadStore);
  },
});
