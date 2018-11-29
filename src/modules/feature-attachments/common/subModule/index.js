import SubModuleFactory from '../../../SubModuleFactory';

import MODULE_NAME from './module-name';

export default SubModuleFactory.createCommonSubModule({
  MODULE_NAME,

  // todo @ANKU @CRIT @MAIN - сделать простейший компонент BaseAttachment и CoreAttachment

  getApi: () => require('./api-attachments'),
  getRootReducers: () => require('./redux-module-attachments').default,

  hotReloadFunc: (reloadUi, reloadStore, reloadAll) => {
    module.hot.accept('./api-attachments', reloadAll);
    module.hot.accept('./redux-module-attachments', reloadStore);
  },
});
