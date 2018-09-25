import SubModuleFactory from '../../../SubModuleFactory';

import MODULE_NAME from './module-name';
import * as paths from './routes-paths-auth';
import { initComponents } from './get-components';

export default SubModuleFactory.createCommonSubModule({
  MODULE_NAME,
  isSystem: true,
  initComponents,
  paths,

  getRoutes: (...args) => require('./routes-auth').default(...args),

  hotReloadFunc: (reloadUi, reloadStore, reloadAll) => {
    // module.hot.accept('./routes-auth', reloadUi);
    module.hot.accept('./get-components', reloadUi);
  },
});
