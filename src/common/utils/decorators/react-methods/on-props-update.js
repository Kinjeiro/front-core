/* eslint-disable no-param-reassign */
import lodashGet from 'lodash/get';
import lodashIsEqual from 'lodash/isEqual';

function getObjByPath(props, path) {
  if (!path) {
    return props;
  }
  if (typeof path === 'function') {
    return path(props);
  }
  return lodashGet(props, path);
}

/**
 *
 * @param path
 * @param deepEqual
 * @param singleRun
 * @param handler
 * @param context
 * @param newProps
 * @param oldProps
 * @param isInit
 * @returns {*} - возвращает true - если нужно прервать последующие обработчики, либо false если продолжать
 */
function updatePathIfChange(path, deepEqual, singleRun, handler, context, newProps, oldProps, isInit) {
  let paths = path;
  if (!Array.isArray(paths)) {
    paths = [paths];
  }

  try {
    const runContexts = [];

    paths.forEach((pathItem) => {
      const newObj = getObjByPath(newProps, pathItem);
      const oldObj = getObjByPath(oldProps, pathItem);
      if ((deepEqual && !lodashIsEqual(newObj, oldObj)) ||
        (!deepEqual && newObj !== oldObj)) {
        runContexts.push({
          path: pathItem,
          newProps,
          oldProps,
          newObj,
          oldObj,
          isInit,
        });
      }
    });

    if (runContexts.length > 0) {
      if (singleRun) {
        return handler.call(
          context,
          runContexts[0].newProps,
          {
            path: runContexts.map((runItem) => runItem.path),
            newProps: runContexts[0].newProps,
            oldProps: runContexts[0].oldProps,
            newObj: runContexts.map((runItem) => runItem.newObj),
            oldObj: runContexts.map((runItem) => runItem.oldObj),
            isInit: runContexts[0].isInit,
          },
        );
      }
      return runContexts.some((runContext) =>
        handler.call(
          context,
          runContext.newProps,
          runContext,
        ),
      );
    }
  } catch (error) {
    // todo @ANKU @LOW @BUG_OUT @react - не знаю чья бага, но при использовании декатраторов если внутри них произошла ошибка она проглатывается!
    // код который ее проглатывает в реакте
    // // Separated into a function to contain deoptimizations caused by try/finally.
    // function measureLifeCyclePerf(fn, debugID, timerType) {
    //  if (debugID === 0) {
    //    // Top-level wrappers (see ReactMount) and empty components (see
    //    // ReactDOMEmptyComponent) are invisible to hooks and devtools.
    //    // Both are implementation details that should go away in the future.
    //    return fn();
    //  }
    //
    //  ReactInstrumentation.debugTool.onBeginLifeCycleTimer(debugID, timerType);
    //  try {
    //    return fn();
    //  } finally {
    //    ReactInstrumentation.debugTool.onEndLifeCycleTimer(debugID, timerType);
    //  }
    // }
    console.error(error, error.stack);
    return true;
  }
  return false;
}

// function updater(pathToHandlerMap, cmp, newProps, oldProps) {
//   if (typeof pathToHandlerMap === 'function') {
//     updatePathIfChange(null, pathToHandlerMap, cmp, newProps, oldProps);
//   }
//   Object.keys(pathToHandlerMap).forEach((path) => {
//     const handler = pathToHandlerMap[path];
//     updatePathIfChange(path, handler, cmp, newProps, oldProps);
//   });
// }

/**
 * Таргет метод для обновления данных, если меняются пропсы наденные по пути propertyPath
 * Срабатывает как при инициализации (componentWillMount), так и в будущем при componentWillReceiveProps
 *
 * Большая проблема была в том, что зависимость от redux данных проявляется как при старте приложения так и при обновлении пропсов.
 * Но в реакте сделано так что componentWillReceiveProps не дергается при инициализации, поэтому постоянно приходилось писать 2 метода для одних и техже частей пропсов
 * Поэтому создал декоратор, тарнет метод которого автоматически срабатывает и при componentWillMount и при componentWillReceiveProps
 *
 * @param propertyPath -
 *  - если пусто - то target метод срабатывает если props компонента
 *  - если function - функция вызывается дважды, один раз для newProps второй раз для oldProps - на вход который подаются пропсы, вернуть должна часть props по которой будет deep equals
 *  - если string - путь в props для объектов которые будут сравниваться
 *  - если string array - если больше 1 то singleRun по умолчанию true
 *
 * @param deepEqual - (default true)
 *  - true - глубокое сравнение
 *  - false - мутабельные (массивы, объекты) - по ссылкам, инмутабельные (стринги, числа) - по контенту
 *
 * @param singleRun - (по умолчанию true если propertyPath - это массив и больше 1 элемента)
 *   - true - выполнять вызов не для каждого отдельно, а один раз для всех, при этом newObj \ oldObj меняются на массив, соотвественно порядку в path
 *  (часто возникающая ситуация при инициализации когда все пасы считаются новыми и происходит дублирование вызовов)
 *
 * @param oldPropsNotNull
 * @param afterCustomFilter
 * @returns {function(newProps, { newProps, oldProps, newObj, oldObj, path, isInit })} - newObj \ oldObj \ path - меняются на массив, если singleRun - true
 *  - если вернуть true, то все последующие методы не будут запущены.
 *  Обычно true возвращается тогда, когда идет явно изменение state и нужно чтобы react-redux прошел новый цикл и подставил в последующие методы уже обновленную информацию
 *
 * Пример,
    export default class AccountAndSite extends Component {
      static propTypes = {
        accountId: PropTypes.number,
        ...
      }
      ...

      @onPropsUpdate('accountId')
      updateAccount(newProps, {newProps, oldProps, newObj, oldObj, path, isInit}) {
        const {
          accountId,
          actionChangeAccount
        } = newProps;

        actionChangeAccount(accountId);
        this.updateSite(newProps);
      }
      ...
    }
 */
export default function onPropsUpdate(
  propertyPath,
  {
    deepEqual = true,
    singleRun = true,
    oldPropsNotNull = true,
    afterCustomFilter,
  } = {},
) {
  return (targetReactComponentPrototype, name, descriptor) => {
    const currentFunction = descriptor.value;

    const old = {
      componentWillMount: targetReactComponentPrototype.componentWillMount,
      componentWillReceiveProps: targetReactComponentPrototype.componentWillReceiveProps,
    };

    targetReactComponentPrototype.componentWillMount = function (...args) {
      const { props } = this;
      let stopPropagation = false;
      if (old.componentWillMount) {
        stopPropagation = old.componentWillMount.call(this, ...args);
      }
      if (!stopPropagation) {
        stopPropagation = updatePathIfChange(
          propertyPath,
          deepEqual,
          singleRun,
          afterCustomFilter ? afterCustomFilter.bind(this, currentFunction) : currentFunction,
          this,
          props,
          oldPropsNotNull ? {} : undefined,
          true,
        );
      }
      return stopPropagation;
    };
    targetReactComponentPrototype.componentWillReceiveProps = function (newProps, ...args) {
      const { props } = this;
      let stopPropagation = null;
      if (old.componentWillReceiveProps) {
        stopPropagation = old.componentWillReceiveProps.call(this, newProps, ...args);
      }
      if (!stopPropagation) {
        stopPropagation = updatePathIfChange(
          propertyPath,
          deepEqual,
          singleRun,
          afterCustomFilter ? afterCustomFilter.bind(this, currentFunction) : currentFunction,
          this,
          newProps,
          props);
      }
      return stopPropagation;
    };

    return descriptor;
  };
}




