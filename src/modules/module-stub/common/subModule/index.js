import clientConfig from '../../../../common/client-config';

import SubModuleFactory from '../../../SubModuleFactory';

import MODULE_NAME from './module-name';

export default SubModuleFactory.createCommonSubModule({
  MODULE_NAME,
  isTurnOff: !clientConfig.common.app.isCore,
  initComponents: (CB) => require('./get-components').initComponents(CB),

  getRoutes: (...args) => require('./routes-stub').default(...args),

  hotReloadFunc: (reloadUi, reloadStore, reloadAll) => {
    module.hot.accept('./routes-stub', reloadUi);
    module.hot.accept('./get-components', reloadUi);
  },
});
