const fs = require('fs');
const path = require('path');

const {
  removeFile,
  createTempFile,
  getTmpDirectory,
  readFile,
  getCurrentDir,
  getFileInfo
  // writeToFilePromise,
} = require('./file-utils');

describe('file-utils', () => {
  describe('[createTempFile] method', () => {
    it('should be create ok', async () => {
      const pathFile = await createTempFile();
      expect(!!pathFile).to.be.true;
    });
    it('should be create ok with fileName', async () => {
      const FILE_NAME = 'opa.txt';
      removeFile(path.join(getTmpDirectory(), FILE_NAME));
      const pathFile = await createTempFile(null, FILE_NAME);
      expect(path.basename(pathFile)).to.be.equal(FILE_NAME);
    });
    it('should be create ok with content', async () => {
      const CONTENT = 'test';
      const pathFile = await createTempFile(CONTENT);
      const fileContent = readFile(pathFile);
      expect(fileContent).to.be.equal(CONTENT);
    });
    it('should be create ok with fileName and content', async () => {
      const FILE_NAME = 'content.txt';
      const CONTENT = 'content';
      removeFile(path.join(getTmpDirectory(), FILE_NAME));
      const pathFile = await createTempFile(CONTENT, FILE_NAME);

      const fileContent = readFile(pathFile);

      expect(path.basename(pathFile)).to.be.equal(FILE_NAME);
      expect(fileContent).to.be.equal(CONTENT);
    });
    it('should be create ok with stream content', async () => {
      const INPUT_FILE_NAME = getCurrentDir('./test-image.jpeg');
      const OUTPUT_FILE_NAME = 'test-image-output.jpeg';
      removeFile(path.join(getTmpDirectory(), OUTPUT_FILE_NAME));
      const outputFilePath = await createTempFile(fs.createReadStream(INPUT_FILE_NAME), OUTPUT_FILE_NAME);

      const inputContent = readFile(INPUT_FILE_NAME);
      const outputContent = readFile(outputFilePath);
      expect(path.basename(outputFilePath)).to.be.equal(OUTPUT_FILE_NAME);
      expect(inputContent).to.be.deep.equal(outputContent);
    });
    it('should return correct file info', async () => {
      const INPUT_FILE_NAME = getCurrentDir('./test-image.jpeg');
      const fileInfo = getFileInfo(INPUT_FILE_NAME);

      expect(fileInfo).to.be.deep.equal({
        filePath: INPUT_FILE_NAME,
        fileName: 'test-image.jpeg',
        ext: 'jpeg',
        isExist: true,
        isDir: false,
        size: 97762,
        type: 'image/jpeg',
        isImage: true
      });
    });
  });
});

