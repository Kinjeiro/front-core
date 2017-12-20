const path = require('path');

const appConfig = require('../config/utils/get-full-config');

const ENV = process.env;
const PROCESS_PATH = process.cwd();
const CURRENT_FILE_PATH = __dirname;

const srcDir = 'src';
const buildDir = '.build';
const assetsDir = 'assets';
const publicPath = '/';

const staticPath = './static';
const clientStartPath = './src/client/index.js';
const serverStartPath = './src/server/index.js';

function inCoreProject(...args) {
  return path.resolve(CURRENT_FILE_PATH, '..', ...args);
}
function inProject(...args) {
  return path.resolve(PROCESS_PATH, ...args);
}

const appStyleConfig = require('../src/common/app-style/vars.js');

const context = {
  PROCESS_PATH,
  ENV,

  srcDir,
  buildDir,
  assetsDir,

  staticPaths: [
    // абсолютные, чтобы другие проекты могли добавлять свои
    path.resolve(CURRENT_FILE_PATH, '..', staticPath)
  ],

  publicPath,
  clientStartPath,
  serverStartPath,

  inProject,
  inCoreProject,
  // делаем внутри, так как если переопределят srcDir чтобы подхватилось новое значение
  inProjectSrc(...args) {
    return this.inProject(this.srcDir, ...args);
  },
  inProjectBuild(...args) {
    return this.inProject(this.buildDir, ...args);
  },
  inProjectBuildAssets(...args) {
    return this.inProjectBuild(this.assetsDir, ...args);
  },

  appConfig,
  appStyleConfig,

  // todo @ANKU @LOW - сделать методом, чтобы если переопределят assetsDir чтобы и тут менялось
  ASSETS_BASE_QUERY: {
    name: `${assetsDir}/[name].[hash].[ext]`,
    limit: 10000
  },
  isProduction: ENV.NODE_ENV === 'production',
  isLocalhost: ENV.NODE_ENV === 'localhost'
};
context.inProjectSrc = context.inProjectSrc.bind(context);
context.inProjectBuild = context.inProjectBuild.bind(context);
context.inProjectBuildAssets = context.inProjectBuildAssets.bind(context);

module.exports = context;
