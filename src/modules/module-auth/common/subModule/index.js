import SubModuleFactory from '../../../SubModuleFactory';

import MODULE_NAME from './module-name';
import * as paths from './routes-paths-auth';

export default SubModuleFactory.createCommonSubModule({
  MODULE_NAME,
  isSystem: true,
  paths,
  initComponents: (CB) => require('./get-components').initComponents(CB),

  getRootReducers: () => require('./redux-auth').default,
  getRoutes: (...args) => require('./routes-auth').default(...args),
  getApi: () => [
    ...require('./api-auth'),
    ...require('./api-users'),
  ],

  hotReloadFunc: (reloadUi, reloadStore, reloadAll) => {
    module.hot.accept('./routes-auth', reloadUi);
    module.hot.accept('./api-auth', reloadAll);
    module.hot.accept('./api-users', reloadAll);
    module.hot.accept('./redux-auth', reloadStore);
    module.hot.accept('./get-components', reloadUi);
  },
});
