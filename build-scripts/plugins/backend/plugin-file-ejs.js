function pluginFileJson(webpackConfig, context) {
  webpackConfig.module.rules.push({
    test: /\.ejs$/,
    loader: 'ejs-compiled-loader'
  });
}

module.exports = pluginFileJson;
