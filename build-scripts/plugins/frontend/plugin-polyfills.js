function pluginPolyfills(webpackConfig, {
  inCoreProject
}) {
  const POLYFILLS_PATH = inCoreProject('src/client/vendor-fixes/polyfills.js');

  webpackConfig.entry.index = [
    POLYFILLS_PATH,
    ...(webpackConfig.entry.index || [])
  ];
}

module.exports = pluginPolyfills;
