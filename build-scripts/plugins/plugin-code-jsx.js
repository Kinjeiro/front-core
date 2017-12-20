const path = require('path');
//const webpack = require('webpack');

function pluginCodeJsx(webpackConfig, { inProjectSrc }) {
  const projectSrc = inProjectSrc();

  webpackConfig.resolve.modules.push(
    //src - чтобы находить свои модули абсолютно от рута, а не только относительно (к примеру, вместо
    // '../../../helper/mock', писать 'helper/mock'
    //'src',
    projectSrc,
    'lib',
    //path.join(PROCESS_PATH, 'src'),
    'node_modules'
  );

  webpackConfig.resolve.extensions.push('*', '.js', '.jsx', '.web.js', '.webpack.js', '.styl');

  webpackConfig.module.rules.push({
    test: /\.jsx?$/,
    //include: path.join(__dirname, 'src'),
    loader: 'babel-loader',
    include: [
      projectSrc
    ],
    exclude: /node_modules/
  });
}

module.exports = pluginCodeJsx;
