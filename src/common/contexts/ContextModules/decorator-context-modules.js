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


   @contextModules()
   export default class ModuleLink extends Component {
    static propTypes = {
      // ======================================================
      // @contextModules
      // ======================================================
      getRoutePath: PropTypes.func,
      onGoTo: PropTypes.func,
    };

    ...

    @bind()
    async handleClickRegistration() {
      this.props.onGoTo(moduleRegister.paths.PATH_REGISTER_INDEX, moduleRegister.MODULE_NAME);
    }
   }
 */
export const decoratorContextModules = createContextDecorator(ContextModulesConsumer);

export default decoratorContextModules;
