// todo @ANKU @LOW @UP - вынести в отдельный github репозиторий
/* eslint-disable */
var util = require('util');

var TEMPLATE = 'window[\'%s\'] = %s;\n';

var createGlobalVariables = function (args, config, logger, helper) {
  var log = logger.create('preprocessor.window-globals');
  var globals = config.globals || {};
  log.info('Attaching the global variables to the window object: ', JSON.stringify(globals, null, 2));

  return function (content, file, done) {
    var envContent = '';

    Object.keys(globals)
      .forEach(function (key) {
        envContent += util.format(TEMPLATE, key, JSON.stringify(globals[key]));
      });

    done(envContent + '\n' + content);
  };
};

module.exports = {
  'preprocessor:window-globals': ['factory', createGlobalVariables],
};
