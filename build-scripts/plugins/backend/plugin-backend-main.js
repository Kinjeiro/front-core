/* eslint-disable no-param-reassign */
const fs = require('fs');
const webpack = require('webpack');

const { pathJoin } = require('../../utils/path-utils');

function pluginBackendMain(webpackConfig, {
  publicPath,
  serverStartPath, // ./src/server/index.js
  // inProject,
  // inProjectSrc,
  inProjectBuild,
  isLocalhost,
  ENV
}) {
  // The target: 'node' option tells webpack not to touch any built-in modules like fs or path.
  webpackConfig.target = 'node';
  webpackConfig.entry.server = [serverStartPath];

  webpackConfig.output.path = inProjectBuild();
  webpackConfig.output.publicPath = pathJoin('/', publicPath);
  // webpackConfig.output.filename = '[name].js';
  webpackConfig.output.filename = 'server.js';

  /*
   see http://jlongster.com/Backend-Apps-with-Webpack--Part-I

   Webpack will load modules from the node_modules folder and bundle them in. This is fine for frontend code, but backend modules typically aren't prepared for this (i.e. using require in weird ways) or even worse are binary dependencies. We simply don't want to bundle in anything from node_modules.

   The backend entry point loads express and starts a server. If you try the above webpack configuration, you'll see this warning:
   WARNING in ./~/express/lib/view.js
   Critical dependencies:
   50:48-69 the request of a dependency is an expression
   @ ./~/express/lib/view.js 50:48-69

   I'm sure we could get express to fix this, but the major problem is binary dependencies. The simple thing to do is not to bundle node_modules. We can solve this using webpack's externals configuration option. A module listed as an external will simply be left alone; it will not be bundled in.
   We just need to read the list of directories inside node_modules and give to externals.

   Unfortunately the default behavior of externals is not what we want. It assumes a browser environment, so require("foo") is turned into just foo, a global variable. We want to keep the require. This is possible by creating an object with a key/value of each module name, and prefixing the value with "commonjs". The entire configuration is now this:
   */
  const nodeModules = {};
  fs.readdirSync('node_modules')
    .filter((x) => {
      return ['.bin'].indexOf(x) === -1;
    })
    .forEach((mod) => {
      nodeModules[mod] = `commonjs ${mod}`;
    });
  Object.assign(webpackConfig.externals, nodeModules);



  /*
   webpackConfig.plugins.push(
   new webpack.IgnorePlugin(/\.(css|less)$/)
   );

   the above only works when you only use code splitting to pull in CSS,
   like in the componentDidMount method. The IgnorePlugin will simply avoid generating that extra chunk, but doesn't help when you want to actually tell the server-side to ignore a top-level require (you will get a "module not found" error at run-time).
   */
  webpackConfig.plugins.push(
    new webpack.NormalModuleReplacementPlugin(/\.(css|scss|less)/, 'node-noop')
  );


  if (isLocalhost) {
    /*
     If you add the option devtool: 'sourcemap' to your config, webpack will generate a sourcemap. For backend apps, you also want to use source-map-support which automatically sourcemaps stack traces from node/io.js. We need to install it at the top of the generated file, and we can use the BannerPlugin to do this
     - raw: true tells webpack to prepend the text as it is, not wrapping it in a comment.
     - entryOnly: false adds the text to all generated files, which you might have multiple if using code splitting.
     */
    webpackConfig.plugins.push(
      new webpack.BannerPlugin({
        banner: 'require("source-map-support").install();',
        raw: true,
        entryOnly: false
      })
    );

    if (!ENV.WATCH_CLIENT_FILES) {
      webpackConfig.watchOptions = {
        ignored: [
          /node_modules/,
          /[/\\]static[/\\]/,
          /[/\\]src[/\\]client[/\\]/,
          /[/\\]src[/\\]common[/\\]app-redux[/\\]/,
          /[/\\]src[/\\]common[/\\]app-style[/\\]/,
          /[/\\]src[/\\]common[/\\]app-styles[/\\]/,
          /[/\\]src[/\\]common[/\\]components[/\\]/,
          /[/\\]src[/\\]common[/\\]containers[/\\]/,
          /[/\\]src[/\\]modules[/\\]\S+[/\\]static[/\\]/,
          /[/\\]src[/\\]modules[/\\]\S+[/\\]common[/\\]containers[/\\]/,
          /[/\\]src[/\\]modules[/\\]\S+[/\\]common[/\\]components[/\\]/,
          /[/\\]src[/\\]modules[/\\]\S+[/\\]common[/\\]subModule[/\\]containers[/\\]/,
          /[/\\]src[/\\]modules[/\\]\S+[/\\]common[/\\]subModule[/\\]components[/\\]/
          // api, model, routes не игнорируем, потому что сервер может от этого плясать

          // function (string) {
          //   console.warn('ANKU , string', string);
          //   return false;
          // },
        ]
        // todo @ANKU @LOW - НЕ РАБОТАЮТ blob
        // ignored: [
        //   /*
        //    // https://github.com/micromatch/anymatch#anymatch-matchers-teststring-returnindex-startindex-endindex
        //    // chokidar options
        //
        //    // using globs to match directories and their children
        //    anymatch('node_modules', 'node_modules'); // true
        //    anymatch('node_modules', 'node_modules/somelib/index.js'); // false
        //    anymatch('node_modules/**', 'node_modules/somelib/index.js'); // true
        //    anymatch('node_modules/**', '/absolute/path/to/node_modules/somelib/index.js'); // false
        //   */
        //   // anymatch('**/node_modules/**', '/absolute/path/to/node_modules/somelib/index.js'); // true
        //
        //   // 'node_modules',
        //   // /node_modules/,
        //   inProject('node_modules'),
        //
        //     // если localhost то для клиенских скриптов уже запущен webpackDevServer на который настроен прокси и не нужно еще раз перезагружать сервак
        //     // это относится ко всему что содержится в common и static (в модулях и корне)
        //
        //     // /src/,
        //     // /src\\common/,
        //   inProjectSrc('**'),
        //
        //   // inProjectSrc('client', '**', '*'),
        //   // inProjectSrc('common', '**', '*'),
        //   // inProject('static', '**', '*'),
        //   // inProjectSrc('modules', '**', 'common', '**', '*'),
        //   // inProjectSrc('modules', '**', 'static', '**', '*')
        // ]
      };
    }
  }


  /*
   todo @ANKU @LOW - хорошей идеей было бы вынести .result-config.json в отдельный файл,
   но при попытке сделать чанк, он server.js компилирует просто как набор модулей, без инфы о запуске

   // Load entry module and return exports
   return __webpack_require__(__webpack_require__.s = 245);

   Нужно подумать как это обойти
   */
  // webpackConfig.output.filename = '[name].js';
  //
  // webpackConfig.plugins.push(
  //   new webpack.optimize.CommonsChunkPlugin({
  //     name: 'config',
  //     minChunks(module) {
  //       console.warn('ANKU , module', module.userRequest);
  //       return module.userRequest && module.userRequest.indexOf('.result-config.json') !== -1;
  //     }
  //   })
  // );


  /*
   __dirname returns '/' when js file is built with webpack
   https://github.com/webpack/webpack/issues/1599#issuecomment-417948725
   */
  webpackConfig.node = {
    // __filename: false,
    __dirname: true
  };
}

module.exports = pluginBackendMain;
