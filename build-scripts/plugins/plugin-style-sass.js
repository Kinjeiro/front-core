// todo @ANKU @CRIT @MAIN - объединить с коравскими loader (искать их через filter rules)

function jsonToSassVars(obj, indent) {
  // Make object root properties into sass variables
  let sass = '';
  for (const key in obj) {
    sass += `$${key}:${JSON.stringify(obj[key], null, indent)};\n`;
  }

  // Store string values (so they remain unaffected)
  const storedStrings = [];
  sass = sass.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, (str) => {
    const id = `___JTS${storedStrings.length}`;
    storedStrings.push({ id, value: str });
    return id;
  });

  // Convert js lists and objects into sass lists and maps
  sass = sass.replace(/[{\[]/g, '(').replace(/[}\]]/g, ')');

  // Put string values back (now that we're done converting)
  storedStrings.forEach((str) => {
    sass = sass.replace(str.id, str.value);
  });

  return sass;
}

function pluginStyleSass(webpackConfig, context) {
  const {
    appStyleConfig
  } = context;

  const loaders = {
    style: { loader: 'style-loader' },
    css: {
      loader: 'css-loader',
      options: { sourceMap: true }
    },
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
    sass: {
      loader: 'sass-loader',
      options: {
        sourceMap: true
        // todo @ANKU @CRIT @MAIN - не заработало на версии webpack@3 - возможна нужна версия webpack@4
        // /*
        //  https://webpack.js.org/loaders/sass-loader/#environment-variables
        //  data: "$env: " + process.env.NODE_ENV + ";"
        //
        //  https://github.com/webpack-contrib/sass-loader/issues/49#issuecomment-90648288
        // */
        // // data: encodeURIComponent(jsonToSassVars(appStyleConfig))
        // data: jsonToSassVars(appStyleConfig)
      }
    }

    // todo @ANKU @CRIT @MAIN - не заработало на версии webpack@3 - возможна нужна версия webpack@4
    // или можно спец лоадер использовать
    // ,
    // sassVars: {
    //   loader: '@epegzz/sass-vars-loader',
    //   options: {
    //     syntax: 'scss',
    //     vars: appStyleConfig
    //     // files: [
    //     //   // Option 3) Load vars from JavaScript file
    //     //   path.resolve(__dirname, 'config/sassVars.js')
    //     // ]
    //   }
    // }
  };

  // const postCssLoader = {
  //   loader: 'postcss-loader',
  //   options: {
  //     sourceMap: true,
  //     plugins: (loader) => [
  //       require('postcss-import')({
  //         root: loader.resourcePath
  //       }),
  //       require('postcss-nested')(),
  //       require('postcss-cssnext')({
  //         browsers: 'last 2 versions',
  //         features: {
  //           customProperties: {
  //             variables: appStyleConfig
  //           }
  //         }
  //       })
  //     ]
  //   }
  // };

  webpackConfig.module.rules.push({
    test: /\.scss$/,
    use: [
      loaders.style,
      loaders.css,
      // postCssLoader,
      loaders.resolve,
      loaders.sass
      // ,
      // loaders.sassVars
    ]
  });
}


module.exports = pluginStyleSass;
