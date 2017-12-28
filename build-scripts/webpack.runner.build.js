const fs = require('fs');
const webpack = require('webpack');
const rimraf = require('rimraf');

function checkError(error, stats, next) {
  if (error || stats.compilation.errors.length) {
    if (error) {
      console.error(error.stack || error);
      if (error.details) {
        console.error(error.details);
      }
    } else {
      console.error(stats.compilation.errors);
    }

    process.exit(1);
  }

  if (next) {
    next();
  }
}

function startBuild({
  webpackFrontConfig,
  webpackBackendConfig
}) {
  if (fs.existsSync(webpackFrontConfig.output.path)) {
    rimraf.sync(webpackFrontConfig.output.path);
  }

  const frontendCompiler = webpack(webpackFrontConfig);
  const backendCompiler = webpack(webpackBackendConfig);

  frontendCompiler.plugin('compile', () => console.log('Building frontend...'));
  backendCompiler.plugin('compile', () => console.log('Building server...'));

  frontendCompiler.run((error, stats) => {
    checkError(error, stats, () => {
      backendCompiler.run(checkError);
    });
  });
}

module.exports = startBuild;
