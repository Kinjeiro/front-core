const webpack = require('webpack');

const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');

const state = require('../../../src/static/state.json');

// todo @ANKU @CRIT @MAIN - Нужно дорабатывать
function pluginStaticMain(webpackConfig, context) {
  webpackConfig.entry = {
    index: [
      './src/static/index-static.jsx'
    ]
  };
  webpackConfig.output.libraryTarget = 'umd';

  webpackConfig.plugins.push(
    /*
     new version
     // `main` is the bundle name sepcified in the `entry` section above.
     -    new StaticSiteGeneratorPlugin('main', paths, {
     -      // Properties here are merged into `locals`
     -      // passed to the exported render function
     -      greet: 'Hello'
     +    new StaticSiteGeneratorPlugin({
     +      entry: 'main',
     +      paths: [
     +        '/hello/',
     +        '/world/'
     +      ],
     +      locals: {
     +        // Properties here are merged into `locals`
     +        // passed to the exported render function
     +        greet: 'Hello'
     +      }
     })
     */
    new StaticSiteGeneratorPlugin(
      'index',
      ['/'],
      {
        state
      }
    )
  );
}

module.exports = pluginStaticMain;
