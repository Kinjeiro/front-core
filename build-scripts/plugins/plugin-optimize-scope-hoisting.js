const webpack = require('webpack');

/**
 * From webpack 3.0 - https://medium.com/webpack/webpack-3-official-release-15fd2dd8f07b
 *
 * @param webpackConfig
 * @param context
 */
function pluginOptimizeScopeHosting(webpackConfig, context) {
  webpackConfig.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
}

module.exports = pluginOptimizeScopeHosting;
