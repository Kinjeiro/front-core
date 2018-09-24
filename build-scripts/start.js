const { inCoreRoot } = require('./utils/path-utils');

const spawn = require('child_process').spawn;
spawn('node', [inCoreRoot('build-scripts/start-backend')], { stdio: 'inherit' });

// todo @ANKU @BUG_OUT @LOW - не понятная бага, иногда backend не запускается - приходится делать тайммаут
setTimeout(() => {
  spawn('node', [inCoreRoot('build-scripts/start-frontend')], { stdio: 'inherit' });
}, 6000);


// // todo @ANKU @LOW - попробовать
// // ENOENT on Windows - https://stackoverflow.com/a/39682805/344172
// // 1 ВАРИАНТ
// (function () {
//   const childProcess = require('child_process');
//   const oldSpawn = childProcess.spawn;
//   function mySpawn() {
//     console.log('spawn called');
//     console.log(arguments);
//     const result = oldSpawn.apply(this, arguments);
//     return result;
//   }
//   childProcess.spawn = mySpawn;
// }());
//
// // 2 ВАРИАНТ
// // spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['-v'], {stdio: 'inherit'})





