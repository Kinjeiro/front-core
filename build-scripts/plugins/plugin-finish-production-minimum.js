const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

function pluginFinishProductionMinimum(
  webpackConfig,
  {
    appConfig
  }
) {
  if (appConfig.common.build.minimize) {
    webpackConfig.plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),

      // new UglifyJsPlugin({
      //   uglifyOptions: {
      //     ecma: 7,
      //     warnings: true,
      //     output: {
      //       beautify: true,
      //     },
      //   },
      //   sourceMap: false,
      // })
      // с параметрами падает ошибка (хотя бабель настроен): SyntaxError: Unexpected token: punc ())
      new UglifyJsPlugin(),

      /*
        There’s also an option to use identifiers instead of module names to minize the output a bit more.
        To enable this simply invoke HashedModuleIdsPlugin (NamedModulesPlugin is recommended for development).
      */
      new webpack.HashedModuleIdsPlugin(),

      /*
       Gzipping build files will reduce their size by a huge amount.
       In order for this to work we’ll also need to do modifications on your webserver config (e.g. Apache|Nginx).
       If the browser supports gzip that’s what he’ll receive.
      */
      new CompressionPlugin({
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: /\.js$|\.css$|\.html$|\.eot?.+$|\.ttf?.+$|\.woff?.+$|\.svg?.+$/,
        threshold: 10240,
        minRatio: 0.8
      })
    );
  }
}

module.exports = pluginFinishProductionMinimum;
