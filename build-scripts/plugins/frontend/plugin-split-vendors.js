const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function pluginOptimizeProdVendors(webpackConfig, {
  isProduction
}) {
  // if (isProduction) {
  // Если css вендора и проектный в одном файле, если разделение - то нужно закоментить
  const splitVendorCss = true;

  /*
   // todo @ANKU @CRITICAL @BUG_OUT @ExtractTextPlugin - бага в том, что не сохраняет порядок css файлов

   Пофиксили только для webpack@3.5.0
   https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/200
   https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/548#issuecomment-313991243
   https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/581#issuecomment-318968988
   */
  // webpackConfig.optimization = {
  //   runtimeChunk: 'single',
  //   splitChunks: {
  //     cacheGroups: {
  //       vendor: {
  //         test: /[\\/]node_modules[\\/]/,
  //         name: 'vendors',
  //         chunks: 'all'
  //       }
  //     }
  //   }
  // };
  //
  // webpackConfig.plugins.push(
  //   new webpack.HashedModuleIdsPlugin()
  // );

  webpackConfig.plugins.push(
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks(module) {
        if (!splitVendorCss) {
          // This prevents stylesheet resources with the .css or .scss extension
          // from being moved from their original chunk to the vendor chunk
          if (module.resource && (/^.*\.(css|scss|less)$/).test(module.resource)) {
            return false;
          }
        }

        return module.context && module.context.indexOf('node_modules') !== -1;
      }
    })
  );
  // // todo @ANKU @LOW - нужно отделить корные вещи в отдельный файл
  // webpackConfig.plugins.push(
  //   new webpack.optimize.CommonsChunkPlugin({
  //     name: 'front-core',
  //     minChunks(module) {
  //       return module.context && module.context.indexOf('/front-core') !== -1;
  //     }
  //   })
  // );

  /*
   плюс нужно чтобы было [name]:
   // todo @ANKU @LOW - можно потом поискать по плагинам и удалить и заменить новым с filnename другим
   webpackConfig.plugins.push(
   new ExtractTextPlugin({
   filename: assetsDir + '/[name].css',
   allChunks: true
   })
   );
   */

  // }
}

module.exports = pluginOptimizeProdVendors;
