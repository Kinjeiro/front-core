/* eslint-disable global-require,import/no-dynamic-require */
const fs = require('fs');
const path = require('path');
const rmdir = require('rimraf');
const tmp = require('tmp');
const { Readable } = require('stream');
const os = require('os');

// ModuleNotFoundError: Module not found: Error: Can't resolve './types/standard' in 'H:\__CODER__\_W_Reagentum_\__Gasprom__\Project_Rascenka\formRascenka_FrontCore\node_modules\mime'
// const mime = require('mime/lite');
const mime = require('mime');


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

function removeFile(filePath) {
  rmdir.sync(filePath);
}
function removeDir(dirPath) {
  removeFile(dirPath);
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



function getTmpDirectory() {
  return os.tmpdir();
}


async function writeToFilePromise(filePath, content, streamOptions = null, newFileName = null, fileDescriptor = null) {
  return new Promise((resolve, reject) => {
    try {
      ensureDirectoryExistence(filePath);

      const {
        append = true
      } = streamOptions || {};

      if (newFileName) {
        if (fileDescriptor) {
          fs.close(fileDescriptor);
        }
        const newPath = path.join(path.dirname(filePath), newFileName);
        fs.renameSync(filePath, newPath);
        console.log(`\nRename file\n-- from: ${filePath}\n--   to: ${newPath}`);
        // eslint-disable-next-line no-param-reassign
        filePath = newPath;
      } else {
        console.log(`\nWrite content to file: ${filePath}`);
      }

      if (content !== null) {
        // let downloaded  = 0;

        // use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file
        const writeStream = fs.createWriteStream(
          filePath,
          Object.apply(
            { flags: append ? 'a' : 'w' },
            streamOptions
          ),
        )
          // https://nodejs.org/api/stream.html#stream_class_stream_writable
          .on('finish', () => {
            resolve(filePath);
          })
          .on('error', (error) => {
            reject(error);
          })
        ;

        if (content instanceof Readable) {
          // content.on('data', (chunk) => {
          //   downloaded += chunk.length;
          // });
          content.pipe(writeStream);
        } else {
          writeStream.write(content);
          //  wStream.end is better because it asks node to close immediatelly after the write.
          writeStream.end();
        }
      } else {
        resolve(filePath);
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 *
 * @param content
 * @param fileName
 * @param options - https://raszi.github.io/node-tmp/ options
     mode: the file mode to create with, it fallbacks to 0600 on file creation and 0700 on directory creation
     prefix: the optional prefix, fallbacks to tmp- if not provided
     postfix: the optional postfix, fallbacks to .tmp on file creation
     template: mkstemp like filename template, no default
     dir: the optional temporary directory, fallbacks to system default (guesses from environment)
     tries: how many times should the function try to get a unique filename before giving up, default 3
     keep: signals that the temporary file or directory should not be deleted on exit, default is false, means delete
       Please keep in mind that it is recommended in this case to call the provided cleanupCallback function manually.
       unsafeCleanup: recursively removes the created temporary directory, even when it's not empty. default is false
 * @return {*}
 */
async function createTempFile(content = null, fileName = null, options = undefined) {
  return new Promise((resolve, reject) => {
    tmp.file(
      Object.apply(
        { keep: true },
        options
      ),
      (error, filePath, fd, cleanupCallback) => {
        if (error) {
          reject(error);
        } else {
          writeToFilePromise(filePath, content, null, fileName, fd)
            .then(resolve, reject);
          // // If we don't need the file anymore we could manually call the cleanupCallback
          // // But that is not necessary if we didn't pass the keep option because the library
          // // will clean after itself.
          // cleanupCallback();
        }
      }
    );
  });
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

function getCurrentDir(...paths) {
  // return path.join(path.dirname(require.main.filename), ...paths);
  return path.join(__dirname, ...paths);
}

// todo @ANKU @LOW - убрать дублирование здесь и в path-utils
function getProjectDir() {
  return process.cwd();
}
function inProject(relativePath) {
  return path.resolve(getProjectDir(), relativePath);
}

function getMimeType(filePath) {
  return mime.getType(filePath);
}
function getExtension(mimeType) {
  return mime.getExtension(mimeType);
}

module.exports = {
  ensureDirectoryExistence,
  getTmpDirectory,

  createTempFile,
  createDir,

  readFile,
  writeToFile,
  writeToFilePromise,

  removeFile,
  removeDir,

  getAbsolutePath,
  getCurrentDir,
  getProjectDir,
  inProject,

  getMimeType,
  getExtension
};
