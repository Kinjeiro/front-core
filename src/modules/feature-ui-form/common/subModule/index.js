import SubModuleFactory from '../../../SubModuleFactory';

import MODULE_NAME from './module-name';
// import { initComponents } from './get-components';

export default SubModuleFactory.createCommonSubModule({
  MODULE_NAME,
  initComponents: (CB) => require('./get-components').initComponents(CB),

  hotReloadFunc: (reloadUi, reloadStore, reloadAll) => {
    module.hot.accept('./get-components', reloadUi);
  },
});
