const merge = require('lodash/merge');
const fs = require('fs');
const webpack = require('webpack');
const rimraf = require('rimraf');

const { writeToFile } = require('./utils/file-utils');

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
  context,
  webpackFrontConfig,
  webpackBackendConfig
}) {
  const {
    appConfig,
    inProjectBuildAssets,
    appStyleConfig
  } = context;

  if (fs.existsSync(webpackFrontConfig.output.path)) {
    rimraf.sync(webpackFrontConfig.output.path);
  }

  // создаем json для статической сборки, чтобы темплейтеры (к примеру, jsp для java могли вставить их в свой index страницы)
  // убираем все серверные настройки
  const clientConfig = merge({}, {
    common: appConfig.common,
    client: appConfig.client
  });
  // todo @ANKU @LOW - может название куда вынести?
  const defaultConfigFile = inProjectBuildAssets('default-config.json');
  writeToFile(defaultConfigFile, clientConfig);

  const frontendCompiler = webpack(webpackFrontConfig);
  const backendCompiler = webpack(webpackBackendConfig);

  console.log('=== APP STYLES ===\n', appStyleConfig, '\n');

  console.log('=== APP CONFIG (while build) ===\n', JSON.stringify(appConfig, null, 2));
  frontendCompiler.plugin('compile', () => console.log('Building frontend...'));
  backendCompiler.plugin('compile', () => console.log('Building server...'));

  frontendCompiler.run((error, stats) => {
    checkError(error, stats, () => {
      backendCompiler.run(checkError);
    });
  });
}

module.exports = startBuild;
