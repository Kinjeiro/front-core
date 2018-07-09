function pluginCodeJsx(
  webpackConfig,
  {
    inProjectSrc,
    compileNodeModules
  }
) {
  const projectSrc = inProjectSrc();

  webpackConfig.resolve.modules.push(
    // src - чтобы находить свои модули абсолютно от рута, а не только относительно (к примеру, вместо
    // '../../../helper/mock', писать 'helper/mock'
    // 'src',
    projectSrc,
    'lib',
    // path.join(PROCESS_PATH, 'src'),
    'node_modules'
  );

  webpackConfig.resolve.extensions.push('*', '.js', '.jsx', '.web.js', '.webpack.js', '.styl');

  const compileNodeModulesStr = compileNodeModules
    .map((moduleName) => `${moduleName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\/`)
    .join('|');

  webpackConfig.module.rules.push({
    test: /\.jsx?$/,
    // include: path.join(__dirname, 'src'),
    loader: 'babel-loader',
    include: [
      projectSrc
    ],
    // exclude(modulePath) {
    //   console.warn('ANKU , modulePath', modulePath, /node_modules/.test(modulePath) &&
    //     !/node_modules\/redux-logger/.test(modulePath));
    //   return /node_modules/.test(modulePath) &&
    //     !/node_modules\/redux-logger/.test(modulePath);
    // }
    exclude: compileNodeModulesStr
      // (?!foo|bar) - это negative lookahead - https://www.regular-expressions.info/lookaround.html
      ? new RegExp(`node_modules\\/(?!${compileNodeModulesStr})`)
      : /node_modules\//
  });
}

module.exports = pluginCodeJsx;
