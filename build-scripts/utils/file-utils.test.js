const path = require('path');

const {
  removeFile,
  createTempFile,
  getTmpDirectory,
  readFile
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
  });
});

