// @guide - Первым делом инициализируем конфиги, а уж потом импортим все остальное, чтобы во время своих внутренних импортов они могли пользоваться
import initAll from './init';

let runner = null;

async function start() {
  await initAll();
  const CoreClientRunner = require('./CoreClientRunner').default;
  runner = new CoreClientRunner();
  await runner.run();
}

try {
  start();
} catch (error) {
  console.error(error);
}

if (module.hot) {
  /*
   todo @ANKU @LOW @BUG_OUT @webpack - hot reload - странно, если здесь не указать пустой handler не дойдет событие до module.hot.accept в AbstractClientRunner на Root настроенного!

   vendor.js:96489 [HMR] Updated modules:
   16:52:58.879 vendor.js:96489 [HMR]  - ./src/common/containers/StubPage/StubPage.jsx
   16:52:58.879 vendor.js:96489 [HMR]  - ./src/common/containers/index.js
   16:52:58.880 vendor.js:96489 [HMR]  - ./src/common/create-routes.jsx
   16:52:58.880 vendor.js:96489 [HMR]  - ./src/client/Root.jsx
   16:52:58.880 vendor.js:96489 [HMR]  - ./src/client/CoreClientRunner.js
   16:52:58.880 vendor.js:96489 [HMR]  - ./src/common/run-configurator.js
   16:52:58.880 vendor.js:96489 [HMR]  - ./src/client/run-client.js

   todo @ANKU @LOW - При изменении reducer нужно до StubPage обаботать, так как Root не нужно обновлять
   [HMR] Updated modules:
   21:55:59.279 log.js:23 [HMR]  - ./src/common/app-redux/reducers/app/current-page.js
   21:55:59.279 log.js:23 [HMR]  - ./src/common/app-redux/reducers/root.js
   21:55:59.279 log.js:23 [HMR]  - ./src/common/containers/StubPage/StubPage.jsx
   21:55:59.279 log.js:23 [HMR]  - ./src/common/containers/index.js
   21:55:59.280 log.js:23 [HMR]  - ./src/common/create-routes.jsx
   21:55:59.280 log.js:23 [HMR]  - ./src/client/Root.jsx
   21:55:59.280 log.js:23 [HMR]  - ./src/client/CoreClientRunner.js
   21:55:59.281 log.js:23 [HMR]  - ./src/common/run-configurator.js
   21:55:59.281 log.js:23 [HMR]  - ./src/client/run-client.js
   21:55:59.281 log.js:23 [HMR]  - ./src/common/app-redux/create-store.js
  */
  module.hot.accept(
    [
      './init',
      './CoreClientRunner',
    ],
    () => {
      runner.reloadUi();
    },
  );
}
