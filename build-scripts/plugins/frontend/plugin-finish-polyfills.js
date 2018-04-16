function pluginPolyfills(webpackConfig, {
  inCoreProject
}) {
  const POLYFILLS_PATH = inCoreProject('build-scripts/plugins/frontend/vendor-fixes/polyfills/polyfills.js');

  webpackConfig.entry.index = [
    POLYFILLS_PATH,
    ...(webpackConfig.entry.index || [])
  ];
}

module.exports = pluginPolyfills;
