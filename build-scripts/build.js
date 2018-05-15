const { tryLoadProjectFile } = require('./utils/require-utils');

const runner = require('./webpack.runner.build');

// const context = require('./webpack-context');
// const WEBPACK_CONFIG_UTILS = require('./webpack-config');
const context = tryLoadProjectFile('build-scripts/webpack-context');
const WEBPACK_CONFIG_UTILS = tryLoadProjectFile('build-scripts/webpack-config');

runner({
  context,
  webpackFrontConfig: WEBPACK_CONFIG_UTILS.getFrontendWebpackConfig(context),
  webpackBackendConfig: WEBPACK_CONFIG_UTILS.getBackendWebpackConfig(context)
});
