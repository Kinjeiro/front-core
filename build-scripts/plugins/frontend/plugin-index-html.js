const merge = require('lodash/merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * смотри \src\common\constants\sync-consts.js
 * @type {string}
 */
const GLOBAL_CLIENT_STORE_INITIAL_STATE = '__data';
const STATE_CLIENT_CONFIG_PARAM = 'clientConfig';

function pluginIndexHtml(webpackConfig, context) {
  const {
    appConfig,
    assetsDir,
    inProjectSrc,
    inCoreProjectSrcRelative,
    inProjectBuildAssets
  } = context;

  const basePath = appConfig.common.app.contextRoot;

  // убираем все серверные настройки
  const clientConfig = merge({}, {
    common: appConfig.common,
    client: appConfig.client
  });

  // todo @ANKU @LOW @BUG_OUT @html-loader - не пропускает параметры - поэтмоу пришлось брать ejs лоадер

  // @guide - пример авторизациооных данных с сервера
  // const userInfo = {
  //   username: 'ivanov',
  //   userType: null,
  //
  //   firstName: 'Ivan',
  //   middleName: 'Test',
  //   lastName: 'Ivanov',
  //   displayName: 'IvanovIvan',
  //   email: null,
  //
  //   roles: [],
  //   permissions: []
  // };

  webpackConfig.plugins.push(
    new HtmlWebpackPlugin({
      // './node-modules/@reagentum/front-core/lib/static-client/index.template.ejs'
      // template:  './src/static-client/index.template.ejs',
      template:  inCoreProjectSrcRelative('static-client/index.template.ejs'),
      // filename: './.build/assets/index.html', // relative to root of the application
      filename: 'index.html', // relative to build root
      // template: inProjectSrc('index.template.html'),
      // filename: inProjectBuildAssets('index.html'),
      // hash: true,

      inject: false, // сами добавим через наши ассеты и basePath

      // params
      GLOBAL_CLIENT_STORE_INITIAL_STATE,
      // assetsDir: appUrl(ASSETS),
      assetsDir: `/${basePath ? `${basePath}/` : ''}${assetsDir}`,
      storeState: JSON.stringify({
        // todo @ANKU @CRIT @MAIN @DEBUG -
        // [STATE_CLIENT_CONFIG_PARAM]: clientConfig
        // ,
        // userInfo
      })

      // полностью заменяет все параметры и доступ будет от templateParameters: <%= test %>
      // templateParameters: {
      //   test: 'testOpa'
      // }
    })
  );
}

module.exports = pluginIndexHtml;
