function pluginFileHtml(webpackConfig) {
  webpackConfig.module.rules.push({
    test: /\.(html)$/,
    loader: 'html-loader'
  });
}

module.exports = pluginFileHtml;
