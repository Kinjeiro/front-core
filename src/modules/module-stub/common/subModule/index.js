import clientConfig from '../../../../common/client-config';

import SubModuleFactory from '../../../SubModuleFactory';

import MODULE_NAME from './module-name';
import { initComponents } from './get-components';

export default SubModuleFactory.createCommonSubModule({
  MODULE_NAME,
  isTurnOff: !clientConfig.common.app.isCore,
  initComponents,

  getRoutes: (...args) => require('./routes-stub').default(...args),

  // hotReloadFunc: (reloadUi, reloadStore, reloadAll) => {
  //   // module.hot.accept('./routes-stub', reloadUi);
  //   // module.hot.accept('./get-components', reloadUi);
  // },
});
