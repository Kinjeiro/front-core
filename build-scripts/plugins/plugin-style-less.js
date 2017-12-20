const ExtractTextPlugin = require('extract-text-webpack-plugin');

function pluginStyleLess(webpackConfig, context) {
  const {
    isLocalhost,
    appStyleConfig
  } = context;

  if (!isLocalhost) {
    webpackConfig.module.rules.push({
      test: /\.less$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          {
            loader: 'css-loader'
          },
          {
            loader: 'less-loader',
            options: {
              modifyVars: appStyleConfig
            }
          }
        ]
      })
    });
  } else {
    webpackConfig.module.rules.push({
      test: /\.less$/,
      use: [
        {
          loader: 'style-loader' // creates style nodes from JS strings
        },
        {
          loader: 'css-loader',  // translates CSS into CommonJS
          options: {
            sourceMap: true
          }
        },
        {
          loader: 'less-loader', // compiles Less to CSS
          options: {
            modifyVars: appStyleConfig
          }
        }
      ]
    });
  }
}

module.exports = pluginStyleLess;
