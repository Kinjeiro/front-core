// const path = require('path');
const fs = require('fs');

/**
 * вместо .babelrc
 * @param webpackConfig
 * @param context
 */
function pluginCodeBabelOptions(webpackConfig, context) {
  const {
    ENV: {
      MINIMIZED
    }
  } = context;

  const babelLoader = webpackConfig.module.rules
    .find((rule) => rule.loader === 'babel-loader');

  // babelLoader.include = [
  //  //resolve('src')
  //  path.join(process.cwd(), 'src'),
  //  path.join(__dirname, 'src')
  // ];
  // babelLoader.exclude = [/node_modules/];

  /*
   [РЕШЕНО] => создаем перед использованием файл .babelrc

   ТАК КАК НАМ НУЖЕН .babelrc для babel-cli (для компиляции библиотеки для npm publish)
   пока временно отказываемся от options

   const babelOptions = JSON.parse(fs.readFileSync(
    inCoreRoot('.babelrc'),
     'utf8'
   ));
  */

  const presets = [
    'babel-preset-react',
    [
      'babel-preset-env', {
        /*
         webpack 2 doesn't support module.exports but we need use get-config in node (before webpack, commonJs) and in app (es6)
         modules: false, - break our logic
         See: Cannot assign to read only property 'exports' of object '#<Object>' (mix require and export)
         https://github.com/webpack/webpack/issues/4039#issuecomment-283501082
         */
        // modules: false,

        targets: {
          ie9: true
        },
        uglify: true
      }
    ]
  ];

  if (MINIMIZED) {
    // минификация кода для компиляции через babel (для репозитория lib)
    // presets.push('babel-preset-minify');
    presets.push(['babel-preset-minify', {

      /*
        // todo @ANKU @LOW @BUG_OUT @babel-minify
        Cannot read property 'contexts' of null (Workaround here) #933
        https://github.com/babel/minify/issues/933

        src\common\utils\common.js -> minimizedPackage\front-core\lib\common\utils\common.js
        TypeError: src/common/utils/common.test.js: Cannot read property 'contexts' of null
            at NodePath._getQueueContexts (H:\__CODER__\_W_Reagentum_\_FRONT_CORE_\front-core\node_modules\babel-traverse\lib\path\context.js:278
        :21)
            at NodePath._containerInsert (H:\__CODER__\_W_Reagentum_\_FRONT_CORE_\front-core\node_modules\babel-traverse\lib\path\modification.js
        :94:23)
      */
      // keepFnName: true
      // keepClassName: true, // важная настройка чтобы this.constructor.name не менялось и корретно работало
      builtIns: false
    }]);
  }

  const plugins = [
    'babel-plugin-transform-class-properties',
    'babel-plugin-syntax-dynamic-import',
    [
      'babel-plugin-transform-runtime',
      {
        helpers: true,
        // если не выключить не компилятся export * from './test'; конструкции
        polyfill: false,

        // polyfill: true,

        regenerator: true
      }
    ],

    // [
    //  'babel-plugin-transform-object-rest-spread',
    //  {
    //    useBuiltIns: true // we polyfill Object.assign in src/normalize.js
    //  }
    // ],
    'babel-plugin-transform-object-rest-spread',

    // Для декараторов @myDecorator
    'babel-plugin-transform-decorators-legacy',

    /*
     for export * as ns from 'mod';
     https://github.com/babel/babel/issues/2877#issuecomment-156031685
     */
    'babel-plugin-transform-export-extensions'
  ];

  babelLoader.options = Object.assign(
    {},
    babelLoader.options,
    {
      // This is a feature of `babel-loader` for webpack (not Babel itself).
      // It enables caching results in ./node_modules/.cache/babel-loader/
      // directory for faster rebuilds.
      cacheDirectory: true,

      // не используем файл .babelrc (чтобы было более удобное наследование проектов)
      babelrc: false,

      presets,
      plugins,

      comments: !MINIMIZED
    }
  );
}

module.exports = pluginCodeBabelOptions;
