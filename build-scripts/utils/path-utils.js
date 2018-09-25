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

function inCoreSrcRelative(...args) {
  return isUseFromCore()
    ? pathJoin('src', ...args)
    : pathJoin('node_modules/@reagentum/front-core/lib', ...args);
}

function inCoreSrc() {
  return inProject(inCoreSrcRelative());
}


// ======================================================
// MODULES
// ======================================================
function getModulesDirectories(projectSrcPath = undefined) {
  if (projectSrcPath) {
    return [
      path.join(projectSrcPath, 'modules')
    ];
  }
  return [
    inProject('src/modules')
  ];
}

/**
 *
 * @param globRegexp - https://www.npmjs.com/package/glob#glob-primer
 * @param projectSrcPath
 * @return {Array}
 */
function inModules(globRegexp = null, projectSrcPath = undefined) {
  const moduleFiles = [];
  getModulesDirectories(projectSrcPath).forEach((dir) => {
    if (globRegexp) {
      moduleFiles.push(...glob.sync(globRegexp, { root: dir }));
    } else {
      moduleFiles.push(dir);
    }
  });
  return moduleFiles;
}

function getModulesStatic(projectSrcPath = undefined) {
  return inModules('/*/static', projectSrcPath);
}

function getI18nModules(projectSrcPath = undefined) {
  return inModules('/*/static/i18n', projectSrcPath).map((dir) => {
    // \FrontCore\src\modules\module-auth\static\i18n
    // H:/FrontCore/src/modules/module-auth/static/i18n
    return dir.replace(/^.*[/\\]([\w-]*)[/\\]static[/\\]i18n$/gi, '$1');
  });
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
  inCoreSrc,

  getModulesDirectories,
  inModules,
  getI18nModules,
  getModulesStatic
};
