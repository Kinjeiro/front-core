const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

function pluginStylePostCss(webpackConfig, context) {
  const {
    isLocalhost,
    appStyleConfig,
    appConfig
  } = context;

  const postCssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: true,
      plugins: (loader) => [
        require('postcss-import')({
          root: loader.resourcePath

          /*
            todo @ANKU @LOW - проблема с тем, что не выделяет в chunk vendor если внутри css @import сделать (только если импортить как модуль в js)
            WORK (import as module - use CommonChunkPlugin)
            js file: import "antd/dist/antd.css";

            NOT WORK:
            css file: @import "antd/dist/antd.css";

            еще проблема - https://stackoverflow.com/questions/40919927/webpack-extracttextplugin-outputs-empty-file#comment69059734_40919927

            Кажется есть решение - но нужно разбираться
            https://medium.com/@faceyspacey/45cb474cc332
            https://github.com/faceyspacey/extract-css-chunks-webpack-plugin

            ИЛИ
            https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/200#issuecomment-248248578
          */
          // addDependencyTo: webpack
          // addDependencyTo: loader,
          // plugins: [
          //  (any, result) => {
          //    //result.opts.from --- node_modules
          //    console.warn('ANKU args', args);
          //  }
          // ]
        }),
        // todo @ANKU @LOW @BUG_OUT @postcss-bemed - НУЖЕН только postcss@5 явно! не работает inner стили при компиляции через postcss@6

        // @guide - ОЧЕНЬ важна последовательность
        require('postcss-bemed')({
          separators: appConfig.common.features.bem.separators
        }),

        // todo @ANKU @LOW @BUG_OUT @postcss-cssnext - не работает nested, приходится его явно прописывать
        require('postcss-nested')(),

        require('postcss-cssnext')({
          browsers: 'last 2 versions',
          features: {
            customProperties: {
              variables: appStyleConfig
            }
          }
        })

        /*
         todo @ANKU @LOW - потом разобраться с минификацией
         - либо через postcss - 'cssnano': env === 'production' ? options.cssnano : false
         - либо через css-loader - { options: { minimize: true } }
         */
      ]
    }
  };

  if (!isLocalhost) {
    webpackConfig.module.rules.push({
      test: /\.css$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          {
            loader: 'css-loader',
            options: {
              // The query parameter importLoaders allows to configure how many loaders before css-loader should be applied to @imported resources.
              importLoaders: 1
            }
          },
          postCssLoader
        ]
      })
    });
  } else {
    webpackConfig.module.rules.push({
      test: /\.css$/,
      use: [
        {
          loader: 'style-loader'
        },
        {
          loader: 'css-loader',
          options: {
            // The query parameter importLoaders allows to configure how many loaders before css-loader should be applied to @imported resources.
            importLoaders: 1 // postCss
          }
        },
        postCssLoader
      ]
    });
  }
}

module.exports = pluginStylePostCss;
