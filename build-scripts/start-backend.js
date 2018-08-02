const { tryLoadProjectFile } = require('./utils/require-utils');

const runner = require('./webpack.runner.backend');

// const context = require('./webpack-context');
// const WEBPACK_CONFIG_UTILS = require('./webpack-config');
const context = tryLoadProjectFile('build-scripts/webpack-context');
const WEBPACK_CONFIG_UTILS = tryLoadProjectFile('build-scripts/webpack-config');

runner({
  context,
  appConfig: context.appConfig,
  buildDir: context.buildDir,
  webpackConfig: WEBPACK_CONFIG_UTILS.getBackendWebpackConfig(context)
});
