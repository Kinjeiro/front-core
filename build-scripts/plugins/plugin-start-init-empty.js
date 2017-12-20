function pluginStartInitEmpty(webpackConfig = {}, context) {
  return Object.assign(webpackConfig, {
    entry: {},
    output: {},
    plugins: [],
    resolve: {
      modules: [],
      extensions: [],
      alias: []
    },
    module: {
      rules: []
    },
    externals: {},

    // Fail out on the first error instead of tolerating it. By default webpack will log these errors in red in the terminal, as well as the browser console when using HMR, but continue bundling
    // https://webpack.js.org/configuration/other-options/#bail
    bail: true
  });
}

module.exports = pluginStartInitEmpty;
