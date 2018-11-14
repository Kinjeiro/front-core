import { ContextModulesConsumer } from './ContextModulesProvider';

import createContextDecorator from '../../utils/decorators/utils/create-context-decorator';

/**
 * Декорирует компонент и добавляет в него:
    - getFullPath(location, moduleName)
    - getRoutePath(location, moduleName)
    - onGoTo(location, moduleName)
    - onReplaceLocation(location, moduleName)
    - match
    - location
    - moduleToRoutePrefixMap

   location - LocationDescriptor (see \src\common\models\model-location.js)
 */
export const decoratorContextModules = createContextDecorator(ContextModulesConsumer);

export default decoratorContextModules;
