Error.stackTraceLimit = 30;

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

function startFrontend({
  appConfig,
  webpackConfig,
  webpackDevServerOptions
}) {
  // console.debug('WEBPACK FRONTEND', JSON.stringify(webpackConfig, null, 2));

  const PROXY_ASSETS = appConfig.server.main.proxyAssets;

  webpackDevServerOptions = Object.assign({
    contentBase: webpackConfig.output.path,
    filename: webpackConfig.output.filename,
    // chunkFilename: webpackConfig.output.chunkFilename,
    publicPath: webpackConfig.output.publicPath,

    hot: true,
    quiet: false,
    noInfo: false,
    inline: true,
    lazy: false,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    },
    headers: {
      'X-Custom-Header': 'yes',
      'Access-Control-Allow-Origin': '*'
    },
    stats: {
      colors: true,
      timing: true,
      chunks: false,
      chunkModules: false
    }
  }, webpackDevServerOptions);

  // ======================================================
  // COMPILE
  // ======================================================
  // console.debug('FRONTEND webpackConfig', JSON.stringify(webpackConfig, null, 2));
  const frontendCompiler = webpack(webpackConfig);

  // ======================================================
  // RUN WEBPACK DEV SERVER
  // ======================================================
  const webpackProxyDevServer = new WebpackDevServer(frontendCompiler, webpackDevServerOptions);

  if (PROXY_ASSETS) {
    webpackProxyDevServer.listen(PROXY_ASSETS.port, PROXY_ASSETS.host, () => {
      console.log(`webpackProxyDevServer running at http://${PROXY_ASSETS.host}:${PROXY_ASSETS.port}...`);
    });
  }
}

module.exports = startFrontend;
