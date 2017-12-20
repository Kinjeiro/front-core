/* eslint-disable global-require,import/no-dynamic-require */
const fs = require('fs');
const path = require('path');
const rmdir = require('rimraf');

// const pathModule = path.posix || path;

function ensureDirectoryExistence(filePath) {
  const dirName = path.dirname(filePath);
  if (fs.existsSync(dirName)) {
    return true;
  }
  ensureDirectoryExistence(dirName);
  fs.mkdirSync(dirName);
  return true;
}

function readFile(fullFilename, options = {}) {
  // if (fullFilename.indexOf('.js') < 0) {
  //   fullFilename += '.js';
  // }

  // eslint-disable-next-line no-param-reassign
  options.encoding = options.encoding || 'UTF-8';

  const fileContent = fs.readFileSync(fullFilename, options);
  return fileContent.replace(/^\uFEFF/, ''); // delete BOM
}

function writeToFile(filePath, content) {
  ensureDirectoryExistence(filePath);
  fs.writeFileSync(
    filePath,
    typeof content === 'object'
      ? JSON.stringify(content, null, 2)
      : content,
    'utf8'
  );
}

function removeDir(dirPath) {
  rmdir.sync(dirPath);
}

function getAbsolutePath(relativePath) {
  return path.resolve(relativePath);
}

function getCurrentDir() {
  return path.dirname(require.main.filename);
}

module.exports = {
  readFile,
  writeToFile,
  removeDir,
  getAbsolutePath,
  getCurrentDir,
  ensureDirectoryExistence
};
