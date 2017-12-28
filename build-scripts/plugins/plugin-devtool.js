function pluginDevtool(webpackConfig, {
  isProduction,
  appConfig,
  assetsDir
}) {
  const configDevTools = appConfig.server.main.devtools;
  // for production
  webpackConfig.devtool = false;

  // todo @ANKU @LOW @BUG_OUT @webpack - динамически чанки через import \ require.ensure подключаются просто тупым сложением publicPath + chunkFilename без нормализации
  // <script type="text/javascript" charset="utf-8" async="" src="\./assets/0.js"></script>
  // webpackConfig.output.chunkFilename = './' + assetsDir + '/[name].js';
  // webpackConfig.output.chunkFilename = assetsDir + '/[name].js';
  // todo @ANKU @LOW - пропали sourcemap для веба

  if (configDevTools) {
    // https://webpack.js.org/configuration/devtool/#devtool
    // webpackConfig.devtool = 'sourcemap';
    webpackConfig.devtool = configDevTools === true
      ? 'inline-source-map'
      // ? 'cheap-module-source-map'
      : configDevTools;
  }
}

module.exports = pluginDevtool;
