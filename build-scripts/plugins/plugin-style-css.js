const ExtractTextPlugin = require('extract-text-webpack-plugin');

// todo @ANKU @LOW - может переместить только на фронт
function pluginStyleBase(webpackConfig, { isLocalhost, assetsDir }) {
  if (!isLocalhost) {
    webpackConfig.plugins.push(
      new ExtractTextPlugin({
        filename: `${assetsDir}/[name].css`, // относительно .build
        allChunks: true
      })
    );
  }
}

module.exports = pluginStyleBase;
