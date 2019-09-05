const webpack = require('webpack');
const path = require('path');

/**
 * Убираем ошибку множественного react
 * // todo @ANKU @QUESTION - Добавляем автоматически import React from 'react' в каждый jsx файл, чтобы не писать самим
 * @param webpackConfig
 */
function pluginReact(webpackConfig) {
  /*
  Multiple react instance problem:
    Uncaught Error: Invariant Violation: addComponentAsRefTo(...): Only a ReactOwner can have refs
  https://github.com/callemall/material-ui/issues/2818
  */
  // webpackConfig.resolve.alias['react'] = inProject('./node_modules/react');
  // webpackConfig.resolve.alias['react'] = inCoreProject('./node_modules/react');

  // AutoImport
  webpackConfig.plugins.push(
    new webpack.ProvidePlugin({
      React: 'react'
    })
  );

  const PROCESS_DIR = process.cwd();
  const CURRENT_FILE_PATH = __dirname;
  const isUseFromFrontCore = CURRENT_FILE_PATH.indexOf(path.join(PROCESS_DIR, 'build-scripts')) >= 0;

  if (
    isUseFromFrontCore
    && process.env.NODE_ENV !== 'test'
    && process.env.NODE_ENV !== 'localhost'
  ) {
    webpackConfig.externals = {
      ...webpackConfig.externals,
      // Don't bundle react or react-dom
      react: {
        commonjs: 'react',
        commonjs2: 'react',
        amd: 'React',
        root: 'React'
      },
      'react-dom': {
        commonjs: 'react-dom',
        commonjs2: 'react-dom',
        amd: 'ReactDOM',
        root: 'ReactDOM'
      }
    };
  }
}

module.exports = pluginReact;
