const { writeToFile } = require('./utils/file-utils');
const { tryLoadProjectFile } = require('./utils/require-utils');

// const context = require('./webpack-context');
// const WEBPACK_CONFIG_UTILS = require('./webpack-config');
const context = tryLoadProjectFile('build-scripts/webpack-context');
const WEBPACK_CONFIG_UTILS = tryLoadProjectFile('build-scripts/webpack-config');

const isServer = process.env.BABEL_MODE === 'server'; // 0: 'node', 1: '/path to running file', 2: firstArgument
console.log('Create .babelrc for', isServer ? 'SERVER' : 'CLIENT');

const webpackConfig = isServer
  ? WEBPACK_CONFIG_UTILS.getBackendWebpackConfig(context)
  : WEBPACK_CONFIG_UTILS.getFrontendWebpackConfig(context);

const babelLoader = webpackConfig.module.rules
  .find((rule) => rule.loader === 'babel-loader');

// Если указывать просто все options, почему-то ругается, если указывать с другими опциями что неправильно назван preset
// JSON.stringify(babelLoader.options, null, 2),

const babelRcFinal = {
  presets: babelLoader.options.presets,
  plugins: babelLoader.options.plugins,
  comments: babelLoader.options.comments,
  env: babelLoader.options.env
};

if (process.env.NODE_ENV === 'test') {
  // require.context для mocha
  babelRcFinal.plugins.push('babel-plugin-require-context-hook');
}

writeToFile(context.inProject('.babelrc'), babelRcFinal);
