const { getFullConfig } = require('./config-utils');

const appConfig = getFullConfig();
// перенес их отображение при запуске сервера
// // конифиги необходимы для многих плагинов
// console.log(
//   '\n    Server config       \n',
//   '\n =======================\n',
//   '==[  COMMON CONFIG  ]==\n',
//   JSON.stringify(appConfig.common, null, 2),
//   '\n =======================\n',
//   '==[  CLIENT CONFIG  ]==\n',
//   JSON.stringify(appConfig.client, null, 2),
//   '\n =======================\n',
//   '==[  SERVER CONFIG  ]==\n',
//   JSON.stringify(appConfig.server, null, 2),
//   '\n=======================\n',
// );

module.exports = appConfig;
