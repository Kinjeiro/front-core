const path = require('path');
const glob = require('glob');

const PROCESS_DIR = process.cwd();
const CURRENT_FILE_PATH = __dirname;

// ======================================================
// UTILS
// ======================================================

function pathJoin(...args) {
  // return path.posix.join(...args);
  return path.join(...args);
}
function urlJoin(...args) {
  return path.posix.join(...args);
}

function pathResolve(...args) {
  return path.resolve(...args);
}

// ======================================================
// GET INFO
// ======================================================
function getProjectDir() {
  return PROCESS_DIR;
}
function inProject(...relativePath) {
  // return pathResolve(getProjectDir(), ...relativePath);
  return pathJoin(getProjectDir(), ...relativePath);
}

// ======================================================
// IN
// ======================================================
function inRoot(...args) {
  return inProject(...args);
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

// ======================================================
// CORE PATHS
// ======================================================
// const useFromFrontCore = CURRENT_FILE_PATH.indexOf('node_modules') < 0;
const useFromFrontCore = CURRENT_FILE_PATH.indexOf(pathJoin(PROCESS_DIR, 'build-scripts')) >= 0;

function isUseFromCore() {
  return useFromFrontCore;
}

function inCoreRoot(...args) {
  const FRONT_CORE_ROOT_DIR = path.resolve(CURRENT_FILE_PATH, '../../');

  return args.length === 0
    ? FRONT_CORE_ROOT_DIR
    : pathJoin(FRONT_CORE_ROOT_DIR, ...args);
}

function inCoreSrcRelative(srcPath) {
  return isUseFromCore()
    ? `src/${srcPath}`
    : `node_modules/@reagentum/front-core/lib/${srcPath}`;
}


// ======================================================
// MODULES
// ======================================================
function getModulesDirectories() {
  const dirs = [];
  dirs.push(inProject(inCoreSrcRelative('modules')));
  if (!isUseFromCore()) {
    dirs.push(inProject('src/modules'));
  }
}

/**
 *
 * @param globRegexp - https://www.npmjs.com/package/glob#glob-primer
 * @param useFromCore
 * @return {Array}
 */
function inModules(globRegexp = null, useFromCore = isUseFromCore()) {
  const moduleFiles = [];
  if (globRegexp) {
    if (!useFromCore) {
      moduleFiles.push(...glob.sync(globRegexp, { root: inProject(inCoreSrcRelative('modules')) }));
    }
    moduleFiles.push(...glob.sync(globRegexp, { root: inProject('src/modules') }));
  } else {
    if (!useFromCore) {
      moduleFiles.push(inProject(inCoreSrcRelative('modules')));
    }
    moduleFiles.push(inProject('src/modules'));
  }

  return moduleFiles;
}

module.exports = {
  PROCESS_DIR,

  pathJoin,
  urlJoin,
  pathResolve,

  getProjectDir,
  inProject,

  inRoot,
  inSrc,
  inNodeModules,
  inBuild,
  inBuildAssets,
  inStatic,

  isUseFromCore,
  inCoreRoot,
  inCoreSrcRelative,

  inModules
};
