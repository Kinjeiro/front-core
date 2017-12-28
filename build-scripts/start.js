const { inFrontCoreRoot } = require('./utils/path-utils');

const spawn = require('child_process').spawn;

spawn('node', [inFrontCoreRoot('build-scripts/start-backend')], { stdio: 'inherit' });

// todo @ANKU @BUG_OUT @LOW - не понятная бага, иногда backend не запускается - приходится делать тайммаут
setTimeout(() => {
  spawn('node', [inFrontCoreRoot('build-scripts/start-frontend')], { stdio: 'inherit' });
}, 6000);


