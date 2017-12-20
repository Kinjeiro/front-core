import glob from 'glob';

import { inSrc } from '../../build-scripts/utils/path-utils';

// ======================================================
// Tests Importer
// ======================================================
const testFiles = glob.sync('/**/*.test.js', {
  root: inSrc('server'),
});
testFiles.forEach((testFile) => require(testFile));
// or mocha --require test/test-runner.js /src/server/**/*.test.js

// shutdown server
// server.close();

export default testFiles;
