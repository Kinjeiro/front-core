function pluginFrontendMain(webpackConfig, {
  inCoreRoot
}) {
  const CORE_TYPESCRIPT_DEFINE_PATH = inCoreRoot('lib/common/defines.d.ts');

  // const TYPESCRIPT_ATL_OPTIONS = [
  //  'target=es6',
  //  'jsx=react',
  //  '+experimentalDecorators',
  //  '+experimentalAsyncFunctions',
  //  '+useBabel',
  //  '+useCache',
  //  '+emitRequireType',
  //  'instanceName=front',
  //  'externals[]=' + CORE_TYPESCRIPT_DEFINE_PATH
  // ].join('&');

  webpackConfig.module.rules.push({
    test: /\.tsx?$/,
    // todo @ANKU @CRIT @MAIN - test: /\.ts/, loaders: ['ts-loader'], exclude: /node_modules/
    loader: 'awesome-typescript-loader',
    options: {
      target: 'es6',
      jsx: 'react',
      experimentalDecorators: true,
      experimentalAsyncFunctions: true,
      useBabel: true,
      useCache: true,
      emitRequireType: true,
      instanceName: 'front',
      externals: [CORE_TYPESCRIPT_DEFINE_PATH]
    }
  });

  webpackConfig.resolve.extensions.push('.ts', '.tsx');
}

module.exports = pluginFrontendMain;
