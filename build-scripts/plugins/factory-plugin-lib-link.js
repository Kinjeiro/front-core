const fs = require('fs');
const path = require('path');

/*
 Прекрасная статья об подключении зависимой библиотеки
 https://medium.com/@bmihelac/tips-for-local-developing-of-react-modules-with-babel-and-webpack-51f9c2f0477

 factoryPluginLibLink('front-core', { scoped: '@reagentum', filesDir: 'lib' })
 Before:
 import run from '@reagentum/front-core/lib/client/run-client';
 After:
 import run from 'front-core/client/run-client';

 see https://github.com/tleunen/babel-plugin-module-resolver
 */
function factoryPluginLibLink(libName, { filesDir = 'src', scoped = '' } = {}) {
  return (webpackConfig, { inProject }) => {
    // const libModulePath = fs.realpathSync(inProject('node_modules', libName, filesDir));
    // // todo @ANKU @LOW @BUG_OUT @webpack - не работает alias - https://github.com/webpack/webpack/issues/4160#issuecomment-300280757
    // webpackConfig.resolve.alias[libName] = libModulePath;
    //
    // const babelLoader = webpackConfig.module.rules
    //  .find((loader) => loader.loader === 'babel-loader');
    //
    // babelLoader.include.push(libModulePath);


    const babelLoader = webpackConfig.module.rules
      .find((loader) => loader.loader === 'babel-loader');

    babelLoader.options.plugins.push(
      ['babel-plugin-module-resolver', {
        root: ['./src'],
        alias: {
          [libName]: path.posix.join('', scoped, libName, filesDir)
        }
      }]
    );
  };
}

module.exports = factoryPluginLibLink;
