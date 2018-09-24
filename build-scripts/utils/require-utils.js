/* eslint-disable global-require,import/no-dynamic-require */
const fs = require('fs');
const path = require('path');

const {
  inCoreRoot,
  inRoot
} = require('./path-utils');

// todo @ANKU @LOW - как научить webpack использовать здесь вместо своего require node.require
function requireSafe(modulePath) {
  let result;

  try {
    result = require(modulePath);
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND' || fs.existsSync(`${modulePath}.js`)) {
      throw e;
    }
    console.log(`Doesn't find in current project module "${modulePath}"`);
  }

  // // @NOTE: важно помнить, что если не подать разрешение, то existsSync не найдет
  // if (fs.existsSync(modulePath)) {
  //   result = require(modulePath);
  // } else {
  //   console.log(`Doesn't find module ${modulePath}`);
  // }

  return result;
}

function tryLoadProjectFile(fromRootPath) {
  let result = requireSafe(inRoot(fromRootPath));
  if (!result) {
    result = require(inCoreRoot(fromRootPath));
  }

  if (!result) {
    throw new Error(`Can't load path "${fromRootPath}"`);
  }

  return result;
}

module.exports = {
  requireSafe,
  tryLoadProjectFile
};
