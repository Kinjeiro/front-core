/*
 Для наследных проектов:
 Не обязательно переопределять, а сразу в package.json прописывать, так как
 - все зависимые специфики (webpackContext, WEBPACK_CONFIG_UTILS) берутся сначала из текущего проекта, а уже потом если их нет из абсолютного проекта (front-core) c помощью tryLoadProjectFile
*/

require('../../build-scripts/init-babel')();

const { tryLoadProjectFile } = require('../../build-scripts/utils/require-utils');

const karmaFactory = require('./karma-factory').default;

// import context from '../../build-scripts/webpack-context';
// import WEBPACK_CONFIG_UTILS from '../../build-scripts/webpack-config';
const context = tryLoadProjectFile('build-scripts/webpack-context');
const WEBPACK_CONFIG_UTILS = tryLoadProjectFile('build-scripts/webpack-config');

module.exports = karmaFactory(context, WEBPACK_CONFIG_UTILS);
