const config = require('config');

// /* eslint-disable global-require,import/no-dynamic-require */
// const fs = require('fs');
// const path = require('path');
// // todo @ANKU @LOW @BUG_OUT @deep-assign - забагованная библиотека изменяла сорсы при мерже
// // const deepAssign = require('deep-assign');
// const merge = require('lodash/merge');
//
// const {
//   inRoot,
//   inNodeModules
// } = require('../../build-scripts/utils/path-utils');
// const { readFile } = require('../../build-scripts/utils/file-utils');
//
// // ======================================================
// // CONST
// // ======================================================
// const CURRENT_PROJECT_CONFIG_DIR = inRoot('config');
//
/*
  @NOTE: во время тестов может меняться, поэтому сделали метод
*/
function getNodeEnv() {
  return process.env.NODE_ENV
    ? process.env.NODE_ENV.toLowerCase()
    : 'development';
}
//
// function getParentConfigsInfoFromConfig(config) {
//   // return (config && config.server && config.server.parentConfigs) || [];
//   let parentConfig = config && config.parentConfigs;
//   if (typeof parentConfig === 'string') {
//     parentConfig = [parentConfig];
//   }
//   return parentConfig || [];
// }
//
//
// // ======================================================
// // METHODS
// // ======================================================
//
//
// // сделаем не затирающий, чтобы всегда мержилось в новую мапу
// function mergeConfig(...args) {
//   return merge({}, ...args);
// }
//
// function getConfigFromDir(dir, env = getNodeEnv()) {
//   // console.trace();
//
//   const configDefaultPath = path.join(dir, 'default.js');
//   // в вебпаке можно динамически require
//   let configDefault = null;
//   if (fs.existsSync(configDefaultPath)) {
//     console.info(`get default config from "${configDefaultPath}"`);
//     configDefault = require(configDefaultPath);
//   }
//
//   let configEnv = null;
//   const configEnvPath = path.join(dir, `${env}.js`);
//   if (fs.existsSync(configEnvPath)) {
//     console.info(`get env config from "${configEnvPath}"`);
//     configEnv = require(configEnvPath);
//   }
//
//   console.warn('ANKU , configDefault', !!configDefault);
//   return mergeConfig(configDefault, configEnv);
// }
//
//
// function getFileDirFromString(configInfo, findInNodeModule = false) {
//   let resultConfig;
//
//   if (fs.existsSync(configInfo)) {
//     console.info(`get config from "${configInfo}"`);
//     resultConfig = fs.lstatSync(configInfo).isFile()
//       ? require(configInfo)
//       : getConfigFromDir(configInfo);
//   } else if (fs.existsSync(`${configInfo}.js`)) {
//     console.info(`get config from "${configInfo}.js"`);
//     resultConfig = require(configInfo);
//   } else {
//     const dirs = [configInfo];
//     if (findInNodeModule) {
//       dirs.push(
//         inNodeModules(configInfo, 'config'),
//         inNodeModules(configInfo)
//       );
//     }
//     dirs.some((dir) => {
//       if (fs.existsSync(dir)) {
//         resultConfig = getConfigFromDir(dir);
//         return true;
//       }
//       return false;
//     });
//   }
//
//   if (!resultConfig) {
//     throw new Error(`Config file "${configInfo}" doesn't exists`);
//   }
//
//   return resultConfig;
// }
//
// function getConfig(configInfo) {
//   switch (typeof configInfo) {
//     case 'string':
//       return getFileDirFromString(configInfo, true);
//     case 'function':
//       return configInfo();
//     case 'object':
//       return configInfo;
//     default:
//       return null;
//   }
// }
//
// function getNodeConfig() {
//   const {
//     // по аналогии с https://github.com/lorenwest/node-config/wiki/Environment-Variables#node_config
//     // но использовать node-config пакет не хотим, так как он вносит путаницу
//     // в мезос конфигах (к примеру, в development) нужно писать сразу объект json
//     // NODE_CONFIG={\"server\":{\"features\": { \"auth\": false }}}}
//     NODE_CONFIG
//   } = process.env || {};
//
//   let nodeConfig = null;
//   if (NODE_CONFIG) {
//     try {
//       nodeConfig = typeof NODE_CONFIG === 'object'
//         ? NODE_CONFIG
//         : JSON.parse(NODE_CONFIG);
//     } catch (error) {
//       console.error('Error while parse NODE_CONFIG', error.stack);
//     }
//   }
//   return nodeConfig;
// }
//
//
// function getParentConfig(parentConfigInfo) {
//   try {
//     const parentConfig = getConfig(parentConfigInfo);
//     // recursive
//     const subParentsInfo = getParentConfigsInfoFromConfig(parentConfig);
//     if (subParentsInfo) {
//       return mergeConfig(
//         ...subParentsInfo.map(getParentConfig),
//         // eslint-disable-next-line comma-dangle
//         parentConfig
//       );
//     }
//     return parentConfig;
//   } catch (error) {
//     console.error(error, error.stack);
//     throw error;
//   }
// }
//
// function getParentConfigs(currentConfig) {
//   const configs = getParentConfigsInfoFromConfig(currentConfig)
//     .map(getParentConfig);
//
//   return configs.reduce((resultConfig, config) => {
//     // eslint-disable-next-line no-param-reassign
//     resultConfig = mergeConfig(resultConfig, config);
//     return resultConfig;
//   }, {});
// }

function getFullConfig() {
  // const currentFull = getConfigFromDir(CURRENT_PROJECT_CONFIG_DIR);
  // const parentConfig = getParentConfigs(currentFull);
  // const nodeConfig = getNodeConfig();
  //
  // return mergeConfig(
  //   parentConfig,
  //   currentFull,
  //   // eslint-disable-next-line comma-dangle
  //   nodeConfig
  // );
  return config;
}



module.exports = {
  nodeEnv: getNodeEnv(),
  // getNodeEnv,
  // mergeConfig,
  // getConfig,
  // getNodeConfig,
  // getConfigFromDir,
  // getParentConfigs,
  getFullConfig
};
