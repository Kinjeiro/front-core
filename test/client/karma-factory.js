/* eslint-disable global-require,import/no-extraneous-dependencies,no-unused-vars */
import webpack from 'webpack';
import { argv } from 'yargs';

import {
  inSrc,
  inNodeModules,
  inCoreRoot,
  inModules,
} from '../../build-scripts/utils/path-utils';

function getTestsGlobs(testPaths, postfix = 'test') {
  return testPaths.map(testName =>
    `${testName}/**/*.${postfix}.js?(x)`);
}

export default function (webpackContext, webpackConfigUtils) {
  function initKarmaConfig(karmaConfig) {
    const {
      ENV,
    } = webpackContext;
    const webpackConfig = webpackConfigUtils.getTestWebpackConfig(webpackContext);

    /*
      Проблема в том, что на каждый файл запускается отдельная компиляция через webpack
      Чтобы сделать через один запуск нужно использовать require.context('.') но у нас файлы цепляются из текущей дироктории наследуемых проектов, поэтому не получится

      Из-за этого не получится настроить окружение внутри для каждого скрипта, только через window.variable
    */
    const TEST_FILES_PATHS = ENV.TESTS
      // todo @ANKU @LOW @TEST - протестить ENV.TESTS
      ? ENV.TESTS.split(',').resolve('.')
      : [
        inSrc('common'),
        inSrc('client'),
        ...inModules('/*/common'),
      ];

    const SETUP_CLIENT_FILE = inCoreRoot('test/client/setup-client.js');
    const SRC_FILES_MASK = inSrc('/**/*');

    const testsFiles = [
      SETUP_CLIENT_FILE,
      // пока не нужно, так как мы используем webpack с babel а внутри ключен polyfill: true. Phantom все прекрасно распознает
      // inCoreRoot('src/client/vendor-fixes/polyfills/polyfills.js'),
      ...getTestsGlobs(TEST_FILES_PATHS),
    ];


    // ======================================================
    // INIT
    // ======================================================
    const config = {
      singleRun: !argv.watch,
      files: testsFiles,
      preprocessors: {
        [SETUP_CLIENT_FILE]: [],
        [SRC_FILES_MASK]: [],
      },
      plugins: [],
      browsers: [],
      customLaunchers: {},
      frameworks: [],
      reporters: [],
    };


    // ======================================================
    // CONSOLE LOG
    // ======================================================
    config.logLevel = config.LOG_DEBUG;
    config.browserConsoleLogOptions = {
      level: 'log',
      format: '%b %T: %m',
      terminal: true,
    };


    // ======================================================
    // BROWSER
    // ======================================================
    config.plugins.push(
      require('karma-chrome-launcher'),
      // require('karma-phantomjs-launcher')
    );
    config.customLaunchers.CustomChromeHeadless = {
      base: 'ChromeHeadless',
    };
    // config.browsers.push('PhantomJS');
    config.browsers.push(...Object.keys(config.customLaunchers));


    // ======================================================
    // COMPILATION - WEBPACK
    // ======================================================
    // не нужен отдельно babel, так как мы используем webpack c babel для компиляции
    config.files.unshift(inNodeModules('babel-polyfill/dist/polyfill.js'));
    // config.plugins.push(require('karma-babel-preprocessor'));
    // config.preprocessors[SRC_FILES_MASK].push('babel');

    config.plugins.push(
      require('karma-webpack'),
      require('karma-sourcemap-loader'),
    );

    webpackConfig.devtool = 'inline-source-map';
    // с новой версии enzyme не нужно
    // Object.assign(webpackConfig.externals, {
    //   // todo @ANKU @LOW @BUG_OUT @enzyme - https://github.com/airbnb/enzyme/issues/892
    //   'react/addons': true,                      // pre-existing at enzyme 2.8.0
    //   'react/lib/ExecutionEnvironment': true,    // pre-existing at enzyme 2.8.0
    //   'react/lib/ReactContext': true,            // pre-existing at enzyme 2.8.0
    //   'react-dom/test-utils': true,
    //   'react-test-renderer/shallow': true,
    // });

    // todo @ANKU @LOW @BUT_OUT @karma-webpack - падала ошибка
    // Cannot read property 'addChunk' of null
    // https://github.com/webpack/webpack/issues/3324#issuecomment-289720345
    delete webpackConfig.bail;

    config.webpack = webpackConfig;
    config.webpackServer = {
      // noInfo: true,
    };
    config.preprocessors[SETUP_CLIENT_FILE].push('webpack', 'sourcemap');
    config.preprocessors[SRC_FILES_MASK].push('webpack', 'sourcemap');


    // ======================================================
    // COVERAGE - покрытие тестами
    // ======================================================
    require('isparta-loader');

    config.plugins.push(
      require('karma-coverage'),
    );

    config.webpack.module.rules.push({
      test: /\.jsx?$/,
      loader: 'isparta-loader',
      include: TEST_FILES_PATHS,
    });

    config.reporters.push('coverage');

    config.coverageReporter = {
      check: {
        global: {
          // statements: 86,
          // branches: 80,
          // functions: 95,
          // statements: 70,
          statements: 50,
          branches: 40,
          functions: 60,
          lines: 40,
        },
      },
    };


    // ======================================================
    // TEST FRAMEWORKS - mock + chai + sinon
    // ======================================================
    config.plugins.push(
      require('karma-mocha'),
      require('karma-mocha-reporter'),
      require('karma-chai-spies'),
      require('karma-chai-dom'),
      require('karma-chai-as-promised'),
      require('karma-chai'),
      require('karma-sinon'),
    );
    config.frameworks.push(
      'mocha',
      /*
       http://justincalleja.com/2014/12/26/setting-up-karma-with-mocha-chai-and-requirejs/
       Uncaught TypeError: Cannot read property ‘should’ of undefined
       at /Users/justin/tmp/setting-up-karma/node_modules/karma-chai/adapter.js:4

       https://github.com/xdissent/karma-chai/issues/5
      */
      'chai-spies',
      'chai-dom',
      // todo @ANKU @LOW @BUG_OUT @chai-as-promise - не работают после 6.0 версии через карму с последней версией - https://stackoverflow.com/questions/39918861/karma-require-is-not-defined
      'chai-as-promised',
      // @guide - очень важна последовательность! последние проставляются в globals первыми (иначе будет "chai is not defined")
      'chai',
      'sinon',
    );
    config.reporters.push('mocha');


    // ======================================================
    // REPORTERS - mocha + coverage + junit
    // ======================================================
    config.plugins.push(require('karma-junit-reporter'));
    config.reporters.push('junit');
    config.junitReporter = {
      outputFile: 'test-results.xml',
      useBrowserName: false,
    };


    // ======================================================
    // DATA to window
    // ======================================================
    const CLIENT_CONFIG_WINDOW_VARIABLES = 'testConfig';
    config.plugins.push(
      require('../../build-scripts/karma-plugins/karma-window-globals-preprocessor'),
    );
    config.globals = {
      // config
      [CLIENT_CONFIG_WINDOW_VARIABLES]: {
        client: webpackContext.appConfig.client,
        common: webpackContext.appConfig.common,
      },
    };
    config.preprocessors[SETUP_CLIENT_FILE].push('window-globals');
    config.preprocessors[SRC_FILES_MASK].push('window-globals');

    console.log(
      '\n===== KARMA CONFIG =====\n',
      config,
      '\n========================\n\n',
    );
    karmaConfig.set(config);
  }

  return initKarmaConfig;
}
