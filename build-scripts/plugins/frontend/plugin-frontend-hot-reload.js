const webpack = require('webpack');

function pluginFinishFrontendHotReload(webpackConfig, {
  appConfig,
  isProduction
}) {
  if (isProduction) {
    return;
  }

  const isHotLoader = appConfig.common.hotLoader;
  const PROXY_ASSETS = appConfig.server.main.proxyAssets;

  webpackConfig.entry =
    Object.keys(webpackConfig.entry)
      .reduce((result, entryKey) => {
        const currentEntry = webpackConfig.entry[entryKey];
        const newEntry = [];

        // переход на react-hot-loader v4 - это уже не нужно
        // if (isHotLoader) {
        //   // should be first
        //   newEntry.push('react-hot-loader/patch');
        // }

        if (PROXY_ASSETS) {
          newEntry.push(
            'webpack/hot/only-dev-server',
            `webpack-dev-server/client?http://${PROXY_ASSETS.host}:${PROXY_ASSETS.port}`
          );
        }

        newEntry.push(...currentEntry);

        result[entryKey] = newEntry;
        return result;
      }, {});

  if (isHotLoader) {
    const babelLoader = webpackConfig.module.rules
      .find((rule) => rule.loader === 'babel-loader');

    babelLoader.options.plugins.unshift('react-hot-loader/babel');

    webpackConfig.plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin()
    );
  }
}

module.exports = pluginFinishFrontendHotReload;
