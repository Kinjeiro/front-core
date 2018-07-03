import { ContextModulesConsumer } from './ContextModulesProvider';

import createContextDecorator from '../../utils/decorators/utils/create-context-decorator';

/**
 * Декорирует компонент и добавляет в него:
    - getFullPath(location, moduleName)
    - onGoTo(location, moduleName)
    - match
    - location

   location - LocationDescriptor (see \src\common\models\model-location.js)
 */
export const decoratorContextModules = createContextDecorator(ContextModulesConsumer);

export default decoratorContextModules;
