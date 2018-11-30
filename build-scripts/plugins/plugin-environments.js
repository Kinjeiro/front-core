const path = require('path');
const webpack = require('webpack');

// используемм process.cwd() (именно процесс запуск, может быть наследуемый проект) вместо __dirname (конкретно front-core)
const packageJson = require(path.join(process.cwd(), 'package.json'));

function pluginEnvironments(webpackConfig, {
  isLocalhost,
  ENV
}, customEnvironments = {}) {
  webpackConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env': Object.assign(
        {
          APP_ID: JSON.stringify(packageJson.name),
          APP_VERSION: JSON.stringify(packageJson.version),
          NODE_ENV: JSON.stringify(ENV.NODE_ENV)
        },
        // переменный стоит фиксировать только для локалхоста, остальные запускаются через build и могут свои переменные
        // при запуске проставлять а в таком случае они перезатрут на те, которые были при билде
        isLocalhost ? {
          NODE_ENV: JSON.stringify(ENV.NODE_ENV),
          NODE_CONFIG: JSON.stringify(ENV.NODE_CONFIG),

          PROJECT_NAME: JSON.stringify(ENV.PROJECT_NAME),
          PORT: ENV.PORT,
          SERVER_PORT: ENV.SERVER_PORT,
          CONTEXT_PATH: JSON.stringify(ENV.CONTEXT_PATH),
          CONTEXT_ROOT: JSON.stringify(ENV.CONTEXT_ROOT),
          CLIENT_SIDE_RENDERING: JSON.stringify(ENV.CLIENT_SIDE_RENDERING),
          WATCH_CLIENT_FILES: JSON.stringify(ENV.WATCH_CLIENT_FILES),
          APP_MOCKS: JSON.stringify(ENV.APP_MOCKS),
          USE_MOCKS: JSON.stringify(ENV.USE_MOCKS),
          DEBUG: JSON.stringify(ENV.DEBUG),
          HOT_LOADER: JSON.stringify(ENV.HOT_LOADER),
          LOGS_PATH: JSON.stringify(ENV.LOGS_PATH),

          SERVICES_PROTOCOL: JSON.stringify(ENV.SERVICES_PROTOCOL),
          SERVICES_HOST: JSON.stringify(ENV.SERVICES_HOST),
          SERVICES_PORT: ENV.SERVICES_PORT,

          PROTECTOR_PASSWORD: JSON.stringify(ENV.PROTECTOR_PASSWORD)
        } : null,
        customEnvironments
      )
    })
  );
}

module.exports = pluginEnvironments;
