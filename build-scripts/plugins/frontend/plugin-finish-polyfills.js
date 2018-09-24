function pluginPolyfills(webpackConfig, {
  inCoreRoot
}) {
  const POLYFILLS_PATH = inCoreRoot('build-scripts/plugins/frontend/vendor-fixes/polyfills/polyfills.js');

  webpackConfig.entry.index = [
    POLYFILLS_PATH,
    ...(webpackConfig.entry.index || [])
  ];
}

module.exports = pluginPolyfills;
