const {
  urlJoin,
  pathResolve,
} = require('./utils/path-utils');
const appConfig = require('../config/utils/get-full-config');

const ENV = process.env;
const PROCESS_PATH = process.cwd();
const CURRENT_FILE_PATH = __dirname;

const srcDir = 'src';
const buildDir = '.build';
const assetsDir = 'assets';
const publicPath = urlJoin('/', appConfig.common.app.contextRoot);
const hasContextRoot = publicPath !== '/';


const staticPath = './static';
const clientStartPath = './src/client/index.js';
const serverStartPath = './src/server/index.js';

const useFromFrontCore = CURRENT_FILE_PATH.indexOf('node_modules') < 0;

function inCoreProject(...args) {
  return pathResolve(CURRENT_FILE_PATH, '..', ...args);
}
function inCoreProjectSrcRelative(srcPath) {
  return useFromFrontCore
    ? `src/${srcPath}`
    : `node_modules/@reagentum/front-core/lib/${srcPath}`;
}

function inProject(...args) {
  return pathResolve(PROCESS_PATH, ...args);
}

// todo @ANKU @LOW - если запускаем кору из коры нужно писать src/ path.cwd === __dirname
const appStyleConfig = require(useFromFrontCore
  ? inCoreProject('src/common/app-style/vars.js')
  : inCoreProject('lib/common/app-style/vars.js')
);

const context = {
  PROCESS_PATH,
  ENV,

  srcDir,
  buildDir,
  assetsDir,

  staticPaths: [
    // абсолютные, чтобы другие проекты могли добавлять свои
    pathResolve(CURRENT_FILE_PATH, '..', staticPath)
  ],

  publicPath,
  clientStartPath,
  serverStartPath,

  inProject,
  inCoreProject,
  inCoreProjectSrcRelative,
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
    name: urlJoin(hasContextRoot ? '/' : '', assetsDir, '[name].[hash].[ext]'),
    limit: 10000,
    publicPath: hasContextRoot ? publicPath : undefined,
  },
  isProduction: ENV.NODE_ENV === 'production',
  isLocalhost: ENV.NODE_ENV === 'localhost',

  compileNodeModules: [
    'redux-logger'
  ]
};
context.inProjectSrc = context.inProjectSrc.bind(context);
context.inProjectBuild = context.inProjectBuild.bind(context);
context.inProjectBuildAssets = context.inProjectBuildAssets.bind(context);

module.exports = context;
