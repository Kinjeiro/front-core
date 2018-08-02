const { tryLoadProjectFile } = require('./utils/require-utils');

const runner = require('./webpack.runner.frontend');

// const context = require('./webpack-context');
// const WEBPACK_CONFIG_UTILS = require('./webpack-config');
const context = tryLoadProjectFile('build-scripts/webpack-context');
const WEBPACK_CONFIG_UTILS = tryLoadProjectFile('build-scripts/webpack-config');

runner({
  context,
  appConfig: context.appConfig,
  webpackConfig: WEBPACK_CONFIG_UTILS.getFrontendWebpackConfig(context)
});
