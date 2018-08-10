/* eslint-disable no-param-reassign */
Error.stackTraceLimit = 30;

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

function startFrontend({
  appConfig,
  webpackConfig,
  webpackDevServerOptions,
  context
}) {
  const {
    appStyleConfig,
    HOT_RELOAD_PREFIX
  } = context;
  // console.debug('WEBPACK FRONTEND', JSON.stringify(webpackConfig, null, 2));

  const PROXY_ASSETS = appConfig.server.main.proxyAssets;

  console.log('=== APP STYLES ===\n', appStyleConfig, '\n');

  // https://webpack.js.org/configuration/output/#output-hotupdatemainfilename
  webpackConfig.output.hotUpdateChunkFilename = `${HOT_RELOAD_PREFIX}/[id].[hash].hot-update.js`;
  webpackConfig.output.hotUpdateMainFilename = `${HOT_RELOAD_PREFIX}/[hash].hot-update.json`;

  // ======================================================
  // COMPILE
  // ======================================================
  // console.debug('FRONTEND webpackConfig', JSON.stringify(webpackConfig, null, 2));
  const frontendCompiler = webpack(webpackConfig);

  if (PROXY_ASSETS) {
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
    // RUN WEBPACK DEV SERVER
    // ======================================================
    const webpackProxyDevServer = new WebpackDevServer(frontendCompiler, webpackDevServerOptions);

    webpackProxyDevServer.listen(PROXY_ASSETS.port, PROXY_ASSETS.host, () => {
      console.log(`webpackProxyDevServer running at http://${PROXY_ASSETS.host}:${PROXY_ASSETS.port}...`);
    });
  }
}

module.exports = startFrontend;
