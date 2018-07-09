/* eslint-disable global-require */
const { tryLoadProjectFile } = require('../build-scripts/utils/require-utils');

const context = tryLoadProjectFile('build-scripts/webpack-context');

const packageJson = require('../package.json');

module.exports = function initBabel(isServer = false) {
  /*
   @NOTE: Сначала обновляем .babelrc файл, а потом запускаем регистр babel настроенный на этот файл
  */
  process.env.BABEL_MODE = process.env.BABEL_MODE || isServer ? 'server' : 'client';
  require('./update-babelrc');

  /*
    @NOTE: ЗАПУСКАЕМ БАБЕЛ, чтобы он все последующие require компилировал из ES6
  */
  console.info('babel-register');


  /*
    todo @ANKU @QUESTION - папку для тестирования мы сделали на es6 с использованием babel.
    Но если вызывать их из наследуемых проектов с бабелем, по умолчанию babel игнорирует все, что находится в node_modules

    Решения
    1) добавить игнор на наш проект
    2) либо перевести тесты на es5 (без import)

    Выбрал: 1) - packageJson.name
  */
  const compileNodeModulesStr = [packageJson.name, ...context.compileNodeModules]
    .map((moduleName) => `${moduleName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\/`)
    .join('|');

  require('babel-register')({
    // todo @ANKU @LOW @BUG_OUT @babel - работает только через require (через .babelrc не пашет) - https://stackoverflow.com/questions/35002195/babel-node-fails-to-require-jsx-file-in-node-modules
    // https://github.com/babel/babel/pull/3644#issuecomment-297016161
    // ignore: `node_modules\\/(?!${packageJson.name})`


    /*
     todo @ANKU @LOW @BUG_OUT @babel - если подавать стрингой падает ошибка

     H:\__CODER__\_W_Reagentum_\__E5__\p_TOS\core\frontend\front-core\node_modules\babel-core\lib\transfo
     rmation\file\options\option-manager.js:328
     throw e;
     ^

     Error: Options {"loose":true} passed to H:\__CODER__\_W_Reagentum_\__E5__\p_TOS\core\frontend\front-
     core\node_modules\babel-preset-env\lib\index.js which does not accept options. (While processing pre
     set: "H:\\__CODER__\\_W_Reagentum_\\__E5__\\p_TOS\\core\\frontend\\front-core\\node_modules\\babel-p
     reset-env\\lib\\index.js") (While processing preset: "H:\\__CODER__\\_W_Reagentum_\\__E5__\\p_TOS\\c
     ore\\frontend\\front-core\\node_modules\\babel-preset-env\\lib\\index.js") (While processing preset:
     "H:\\__CODER__\\_W_Reagentum_\\__E5__\\p_TOS\\core\\frontend\\front-core\\node_modules\\babel-prese
     t-react\\lib\\index.js")
    */
    // ignore: `/node_modules\\/(?!${packageJson.name})/`
    // ignore: new RegExp(`node_modules\\/(?!${packageJson.name})`)
    // ignore: new RegExp(`node_modules\\/(?!${packageJson.name}|redux-logger)`)
    ignore: new RegExp(`\\/node_modules\\/(?!${compileNodeModulesStr})`)
  });
};
