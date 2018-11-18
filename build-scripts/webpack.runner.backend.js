Error.stackTraceLimit = 30;

const respawn = require('respawn');
const webpack = require('webpack');

const STATS_OPTIONS = {
  assets: false,
  colors: true,
  version: false,
  modules: false,
  hash: false,
  timings: false,
  chunks: false,
  chunkModules: false,
  reasons: true,
  cached: true,
  chunkOrigins: true,
  errorDetails: true
};

function startBackend({
  webpackConfig,
  buildDir,
  nodeOptions = {}
}) {
  // require('./generate-app-config');

  // const serverFilePath = path.join(webpackConfig.output.path, webpackConfig.output.filename);
  const serverFilePath = `./${buildDir}/${webpackConfig.output.filename}`;
  const backendCompiler = webpack(webpackConfig);

  let lastHash = null;
  function backendCompilerCallback(error, stats) {
    if (error || stats.compilation.errors.length) {
      lastHash = null;
      if (error) {
        console.error(error.stack || error);
        if (error.details) {
          console.error(error.details);
        }
      } else {
        console.error(stats.compilation.errors);
      }

      return;
    }

    if (stats.hash !== lastHash) {
      lastHash = stats.hash;
      process.stdout.write(`${stats.toString(STATS_OPTIONS)}\n`);
    }
  }

  backendCompiler.plugin('compile',
    () => console.log('Building server...')
  );

  let monitor;
  backendCompiler.plugin('done', () => {
    console.log('Compilation is done.');
    try {
      console.log('Restarting server...');
      if (!monitor) {
        const finalNodeOptions = Object.assign(
          {
            cwd: '.',
            maxRestarts: 1,
            sleep: 100,
            kill: 1000,
            stdio: [
              process.stdin,
              process.stdout,
              process.stderr
            ]
          },
          nodeOptions
        );

        // перезапускает ноду при краше
        monitor = respawn(['node', '--harmony', serverFilePath], finalNodeOptions);

        monitor.start();
      } else {
        monitor.stop(() => monitor.start());
      }
    } catch (error) {
      console.error(error.toString());
    }
  });

  // https://github.com/webpack/docs/wiki/node.js-api#the-long-way
  if (webpackConfig.watch === false) {
    backendCompiler.run(backendCompilerCallback);
  } else {
    backendCompiler.watch(webpackConfig.watchOptions, backendCompilerCallback);
  }
}

module.exports = startBackend;
