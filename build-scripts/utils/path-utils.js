const path = require('path');

const ROOT_DIR = process.cwd();
const FRONT_CORE_ROOT_DIR = path.resolve(__dirname, '../../');

function pathJoin(...args) {
  // return path.posix.join(...args);
  return path.join(...args);
}
function urlJoin(...args) {
  // return path.posix.join(...args);
  return path.posix.join(...args);
}

function pathResolve(...args) {
  return path.resolve(...args);
}

function inRoot(...args) {
  return args.length === 0
    ? ROOT_DIR
    : pathJoin(ROOT_DIR, ...args);
}

function inSrc(...args) {
  return inRoot('src', ...args);
}

function inNodeModules(...args) {
  return inRoot('node_modules', ...args);
}

function inBuild(...args) {
  return inRoot('.build', ...args);
}

function inBuildAssets(...args) {
  return inBuild('assets', ...args);
}

function inStatic(...args) {
  return inRoot('static', ...args);
}

function inFrontCoreRoot(...args) {
  return args.length === 0
    ? FRONT_CORE_ROOT_DIR
    : pathJoin(FRONT_CORE_ROOT_DIR, ...args);
}

module.exports = {
  pathJoin,
  urlJoin,
  pathResolve,

  ROOT_DIR,
  FRONT_CORE_ROOT_DIR,

  inRoot,
  inSrc,
  inNodeModules,
  inBuild,
  inBuildAssets,
  inStatic,
  inFrontCoreRoot
};
