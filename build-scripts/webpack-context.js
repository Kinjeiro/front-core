const glob = require('glob');

const {
  urlJoin,
  pathResolve,

  getProjectDir,

  inProject,
  inCoreRoot,
  inCoreSrc,
  inCoreSrcRelative,
  getModulesStatic
} = require('./utils/path-utils');
const appConfig = require('../config/utils/get-full-config');

const ENV = process.env;
const CURRENT_FILE_PATH = __dirname;

const srcDir = 'src';
const buildDir = '.build';
const assetsDir = 'assets';
const publicPath = urlJoin('/', appConfig.common.app.contextRoot);
const hasContextRoot = publicPath !== '/';


const staticPath = './static';
const clientStartPath = './src/client/index.js';
const serverStartPath = './src/server/index.js';

// todo @ANKU @LOW - если запускаем кору из коры нужно писать src/ path.cwd === __dirname
const coreAppStyleConfig = require(inProject(inCoreSrcRelative('common/app-style/vars.js')));

const context = {
  PROCESS_PATH: getProjectDir(),
  ENV,

  srcDir,
  buildDir,
  assetsDir,
  HOT_RELOAD_PREFIX: 'hot',

  staticPaths: [
    // абсолютные, чтобы другие проекты могли добавлять свои
    pathResolve(CURRENT_FILE_PATH, '..', staticPath),
    // todo @ANKU @CRIT @MAIN - сделать локализацию модулей через js а не обычным копированием
    ...getModulesStatic(inCoreSrc())
  ],

  publicPath,
  clientStartPath,
  serverStartPath,

  inProject,
  inCoreRoot,
  inCoreSrcRelative,
  inCoreSrc,
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
  appStyleConfig: coreAppStyleConfig,

  // todo @ANKU @LOW - сделать методом, чтобы если переопределят assetsDir чтобы и тут менялось
  ASSETS_BASE_QUERY: {
    name: urlJoin(hasContextRoot ? '/' : '', assetsDir, '[name].[hash].[ext]'),
    limit: 10000,
    publicPath: hasContextRoot ? publicPath : undefined,
  },
  isProduction: ENV.NODE_ENV === 'production',
  isLocalhost: ENV.NODE_ENV === 'localhost',

  compileNodeModules: [
    // 'redux-logger'
  ]
};
context.inProjectSrc = context.inProjectSrc.bind(context);
context.inProjectBuild = context.inProjectBuild.bind(context);
context.inProjectBuildAssets = context.inProjectBuildAssets.bind(context);

module.exports = context;
