const CopyWebpackPlugin = require('copy-webpack-plugin');

function pluginFileStatic(webpackConfig, {
  staticPaths,
  assetsDir
}) {
  if (staticPaths && staticPaths.length) {
    // todo @ANKU @CRIT @MAIN - включать ли хэши?
    /* //информация для серверного рендеринга, где в сборке искать файлы (ибо у них могут быть хэши)
    new AssetsPlugin({
      path: pathStatic,
      filename: 'assets.json'
    }),*/

    webpackConfig.plugins.push(
      // https://github.com/kevlened/copy-webpack-plugin
      new CopyWebpackPlugin(staticPaths.map((pathStatic) => ({
        from: pathStatic,
        // пихнет относительно указанного в конфигах output (в нашем случае внутрь папки .build)
        // to: pathStaticOutput,
        to: `${webpackConfig.output.path}/${assetsDir}`,
        // чтобы перезаписывать корные файл (к примеру, favicon.ico)
        force: true
      })))
    );
  }
}

module.exports = pluginFileStatic;
