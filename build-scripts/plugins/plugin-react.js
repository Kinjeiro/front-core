const webpack = require('webpack');

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
}

module.exports = pluginReact;
