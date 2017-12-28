const CopyWebpackPlugin = require('copy-webpack-plugin');

function pluginI18nFiles(webpackConfig, {
  staticPaths,
  assetsDir
}) {
  if (staticPaths && staticPaths.length) {
    webpackConfig.plugins.push(
      new CopyWebpackPlugin(staticPaths.map((pathStatic) => ({
        from: `${pathStatic}/i18n`,
        to: `${webpackConfig.output.path}/${assetsDir}/i18n`,
        force: true
      })))
    );
  }
}

module.exports = pluginI18nFiles;
