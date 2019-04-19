import SubModuleFactory from '../../../SubModuleFactory';

import MODULE_NAME from './module-name';

export default SubModuleFactory.createCommonSubModule({
  MODULE_NAME,
  initComponents: (CB) => require('./get-components').initComponents(CB),

  hotReloadFunc: (reloadUi, reloadStore, reloadAll) => {
    module.hot.accept('./get-components', reloadUi);
  },
});
