// @guide - инициализация всех конфигов в самом начале
import './init';

import CoreServerRunner from './CoreServerRunner';

export default (new CoreServerRunner()).run();
