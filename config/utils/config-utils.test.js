// const merge = require('lodash/merge');
// const { expect } = require('chai');
//
// const {
//   writeToFile,
//   removeDir
// } = require('../../build-scripts/utils/file-utils');
// const { inNodeModules } = require('../../build-scripts/utils/path-utils');
//
// const { getConfig } = require('./config-utils');
//
// const testModuleName = 'testModule';
// const testModuleDefaultConfigPath = inNodeModules(`${testModuleName}/config/default.js`);
// const testDefaultConfig = {
//   config1: {
//     config12: 'value'
//   }
// };
// const testDefaultFileContent = `module.exports = ${JSON.stringify(testDefaultConfig)}`;
//
// const testModuleEnvConfigPath = inNodeModules(`${testModuleName}/config/test.js`);
// const testEnvConfig = {
//   config1: {
//     config12: 'value2'
//   },
//   config2: {
//     config22: 'value3'
//   }
// };
// const testEnvFileContent = `module.exports = ${JSON.stringify(testEnvConfig)}`;
//
// const resultConfig = merge({}, testDefaultConfig, testEnvConfig);
//
// describe('(Config) Config utils', () => {
//   describe('(func) getConfig', () => {
//     before(() => {
//       writeToFile(testModuleDefaultConfigPath, testDefaultFileContent);
//       writeToFile(testModuleEnvConfigPath, testEnvFileContent);
//     });
//
//     beforeEach(() => {
//       process.env.NODE_ENV = 'test';
//     });
//
//     after(() => {
//       removeDir(inNodeModules(testModuleName));
//     });
//
//     describe('with DIR path parameter', () => {
//       it('should return config from node_modules module without full folder path', async function test() {
//         const config = getConfig(testModuleName);
//         expect(config).to.deep.equal(resultConfig);
//       });
//
//       it('should return config from node_modules module with config folder', async function test() {
//         const config = getConfig(`${testModuleName}/config`);
//         expect(config).to.deep.equal(resultConfig);
//       });
//
//       it('should return default config if NODE_ENV not test', async function test() {
//         process.env.NODE_ENV = 'development';
//         const config = getConfig(testModuleName);
//         expect(config).to.deep.equal(testDefaultConfig);
//       });
//     });
//
//     describe('with FILE path parameter', () => {
//       it('should return config from file path', async function test() {
//         const config = getConfig(testModuleDefaultConfigPath);
//         expect(config).to.deep.equal(testDefaultConfig);
//       });
//
//       it('should return config from file path without extension', async function test() {
//         const config = getConfig(inNodeModules(`${testModuleName}/config/default`));
//         expect(config).to.deep.equal(testDefaultConfig);
//       });
//     });
//   });
// });
