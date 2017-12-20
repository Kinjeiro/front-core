// import merge from 'lodash/merge';
// import at from 'lodash/at';
import nodeConfig from 'config';

// const config = {};

/*
 todo @ANKU @LOW - странная бага, при тестах и node запуске все отлично находит, но если запускать через компиляцию webpack он динамические урлы не распознает
 Это нормально, НО почему nodeConfig работает? У них в коде явно вызывается require(fullFilePath)

 // import fullConfig from '../../config/utils/get-full-config';
 // const config = fullConfig;

 console.warn('ANKU , require()', require(`H:\\__CODER__\\_W_Reagentum_\\__E5__\\p_TOS\\core\\frontend\\front-core\\config\\default.js?${Math.random()}`));

 Error: Cannot find module "."
 at webpackMissingModule        (H:\__CODER__\_W_Reagentum_\__E5__\p_TOS\core\frontend\front-core\.build\webpack:\src\server\server-config.js:10:34)
 at Object.<anonymous>          (H:\__CODER__\_W_Reagentum_\__E5__\p_TOS\core\frontend\front-core\.build\webpack:\src\server\server-config.js:10:34)
 at __webpack_require__         (H:\__CODER__\_W_Reagentum_\__E5__\p_TOS\core\frontend\front-core\.build\webpack:\webpack\bootstrap 750093f60a1c5597e9d5:19:1)
 at Object.<anonymous>          (H:\__CODER__\_W_Reagentum_\__E5__\p_TOS\core\frontend\front-core\.build\webpack:\src\server\init\init-client-config.js:3:1)
 at __webpack_require__         (H:\__CODER__\_W_Reagentum_\__E5__\p_TOS\core\frontend\front-core\.build\webpack:\webpack\bootstrap 750093f60a1c5597e9d5:19:1)
 at Object.<anonymous>          (H:\__CODER__\_W_Reagentum_\__E5__\p_TOS\core\frontend\front-core\.build\webpack:\src\server\init\index.js:2:1)
 at __webpack_require__         (H:\__CODER__\_W_Reagentum_\__E5__\p_TOS\core\frontend\front-core\.build\webpack:\webpack\bootstrap 750093f60a1c5597e9d5:19:1)
 at Object.<anonymous>          (H:\__CODER__\_W_Reagentum_\__E5__\p_TOS\core\frontend\front-core\.build\webpack:\src\server\run-server.js:2:1)
 at __webpack_require__         (H:\__CODER__\_W_Reagentum_\__E5__\p_TOS\core\frontend\front-core\.build\webpack:\webpack\bootstrap 750093f60a1c5597e9d5:19:1)
 at Object.defineProperty.value (H:\__CODER__\_W_Reagentum_\__E5__\p_TOS\core\frontend\front-core\.build\webpack:\src\server\index.js:2:1)
*/

// const config = new Proxy({}, {
//   get(target, name, receiver) {
//     return nodeConfig.get(name);
//   },
// });

const config = nodeConfig;

// export function updateConfig(newConfig, clearPrevious = false) {
//   if (clearPrevious) {
//     // удаляем все поля, но нужно чтобы ссылка на объект сохранилась для всех
//     for (const prop of Object.getOwnPropertyNames(config)) {
//       delete config[prop];
//     }
//   }
//   merge(config, newConfig);
// }
//
// export function getSaveConfig(keyPath, defaultValue = undefined) {
//   const result = at(config, keyPath)[0];
//   return typeof result === 'undefined'
//     ? defaultValue
//     : result;
// }

export default config;
