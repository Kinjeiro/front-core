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
  return false;
}

function removeDir(dirPath) {
  rmdir.sync(dirPath);
}

function createDir(dirPath, clean = false) {
  const filePath = path.join(dirPath, 'test.file');
  const exist = ensureDirectoryExistence(filePath);
  if (exist && clean) {
    removeDir(dirPath);
    ensureDirectoryExistence(filePath);
    return true;
  }
  return exist;
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


function getAbsolutePath(relativePath) {
  return path.resolve(relativePath);
}

function getCurrentDir() {
  return path.dirname(require.main.filename);
}

function getProjectDir() {
  return process.cwd();
}
function inProject(relativePath) {
  return path.resolve(getProjectDir(), relativePath);
}

module.exports = {
  ensureDirectoryExistence,
  removeDir,
  createDir,

  readFile,
  writeToFile,

  getAbsolutePath,
  getCurrentDir,
  getProjectDir,
  inProject
};
