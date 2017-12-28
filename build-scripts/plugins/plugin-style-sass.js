// todo @ANKU @CRIT @MAIN - объединить с коравскими loader (искать их через filter rules)

function pluginStyleSass(webpackConfig, context) {
  const loaders = {
    style: { loader: 'style-loader' },
    css: { loader: 'css-loader', options: { sourceMap: true } },
    resolve: 'resolve-url-loader',
    postcss: {
      loader: 'postcss-loader',
      options: {
        sourceMap: true
      }
      // plugins: {
      //   'postcss-import': {},
      //   'postcss-cssnext': options.cssnext ? {} : false,
      //   autoprefixer: env === 'production' ? {} : false,
      //   'postcss-browser-reporter': {},
      //   'postcss-reporter': {}
      // }
      // ,
      // plugins: (loader) => [
      //   require('postcss-import')({ root: loader.resourcePath }),
      //   require('postcss-cssnext')(),
      //   require('autoprefixer')(),
      //   require('postcss-reporter')(),
      //   require('cssnano')()
      // ]
    },
    sass: { loader: 'sass-loader', options: { sourceMap: true } }
  };

  const postCssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: true,
      plugins: (loader) => [
        require('postcss-import')({
          root: loader.resourcePath
        }),
        require('postcss-nested')(),
        require('postcss-cssnext')({
          browsers: 'last 2 versions',
          features: {
            customProperties: {
              variables: {}
            }
          }
        })
      ]
    }
  };

  webpackConfig.module.rules.push({
    test: /\.scss$/,
    use: [
      loaders.style,
      loaders.css,
      postCssLoader,
      loaders.resolve,
      loaders.sass
    ]
  });
}


module.exports = pluginStyleSass;
