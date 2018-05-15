/* eslint-disable global-require */

// noinspection WebpackConfigHighlighting
const WEBPACK_CONFIG_UTILS = {
  extractPlugins(plugins = []) {
    let startPlugins = [];
    let middlePlugins = [];
    let finishPlugins = [];

    if (typeof plugins === 'function') {
      middlePlugins = [plugins];
    } else if (Array.isArray(plugins)) {
      middlePlugins = plugins;
    } else {
      startPlugins = plugins.startPlugins || [];
      middlePlugins = plugins.middlePlugins || [];
      finishPlugins = plugins.finishPlugins || [];
    }

    return {
      startPlugins,
      middlePlugins,
      finishPlugins
    };
  },

  expandPlugins(...pluginsArray) {
    const resultPlugins = this.extractPlugins();

    if (pluginsArray.length) {
      pluginsArray.forEach((plugins) => {
        const extractedPlugins = this.extractPlugins(plugins);

        resultPlugins.startPlugins.push(...extractedPlugins.startPlugins);
        resultPlugins.middlePlugins.push(...extractedPlugins.middlePlugins);
        resultPlugins.finishPlugins.push(...extractedPlugins.finishPlugins);
      });
    }

    return resultPlugins;
  },


  getWebpackConfig(context, plugins = []) {
    const webpackConfig = {};
    const {
      startPlugins,
      middlePlugins,
      finishPlugins
    } = this.extractPlugins(plugins);

    startPlugins.map((plugin) => plugin(webpackConfig, context));
    middlePlugins.map((plugin) => plugin(webpackConfig, context));
    finishPlugins.map((plugin) => plugin(webpackConfig, context));

    return webpackConfig;
  },

  getUniWebpackConfig(context, otherPlugins) {
    const plugins = this.expandPlugins({
      startPlugins: [
        require('./plugins/plugin-start-init-empty')
      ],
      middlePlugins: [
        require('./plugins/plugin-environments'),
        require('./plugins/plugin-code-jsx'),
        require('./plugins/plugin-code-babel-options'),
        // require('./plugins/plugin-code-typescript'),

        require('./plugins/plugin-file-image'),
        require('./plugins/plugin-file-font'),
        require('./plugins/plugin-file-html'),
        require('./plugins/plugin-file-ejs'), // на фронте для static билада
        // require('./plugins/plugin-file-json'), //doesn't need in webpack 2

        require('./plugins/plugin-style-css'),
        require('./plugins/plugin-style-less'),
        require('./plugins/plugin-style-post-css'),
        require('./plugins/plugin-style-sass'),

        require('./plugins/plugin-react'),
        require('./plugins/plugin-devtool'),
        require('./plugins/plugin-optimize-scope-hoisting')
      ],
      finishPlugins: [
        require('./plugins/plugin-finish-production-minimum')
      ]
    }, otherPlugins);

    return this.getWebpackConfig(context, plugins);
  },

  getFrontendWebpackConfig(context, otherPlugins) {
    return this.getUniWebpackConfig(context, this.expandPlugins({
      startPlugins: [
        require('./plugins/frontend/plugin-frontend-main')
      ],
      middlePlugins: [
        require('./plugins/frontend/plugin-split-vendors'),
        require('./plugins/frontend/plugin-file-static'),
        require('./plugins/frontend/plugin-index-html'),
        require('./plugins/frontend/plugin-frontend-hot-reload')
      ],
      finishPlugins: [
        require('./plugins/frontend/plugin-finish-polyfills')
      ]
    }, otherPlugins));
  },

  getBackendWebpackConfig(context, otherPlugins) {
    return this.getUniWebpackConfig(context, this.expandPlugins({
      startPlugins: [
        require('./plugins/backend/plugin-backend-main')
      ],
      middlePlugins: [
        require('./plugins/backend/plugin-i18n-files')
      ]
    }, otherPlugins));
  },

  getStaticWebpackConfig(/* context, otherPlugins */) {
    throw new Error('// todo @ANKU @LOW - static');
    // return getUniWebpackConfig(context, expandPlugins({
    //  middlePlugins: [
    //    require('./plugins/plugin-file-ejs')
    //  ]
    // }, otherPlugins));
  },

  getTestWebpackConfig(context, otherPlugins) {
    return this.getUniWebpackConfig(context, this.expandPlugins({
      finishPlugins: [
        require('./plugins/frontend/plugin-finish-polyfills')
      ]
    }, otherPlugins));
  }
};

module.exports = WEBPACK_CONFIG_UTILS;
