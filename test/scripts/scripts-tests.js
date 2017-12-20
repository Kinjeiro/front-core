import glob from 'glob';

import { inRoot } from '../../build-scripts/utils/path-utils';

const testFiles = [
  ...glob.sync('/**/*.test.js', { root: inRoot('config') }),
  ...glob.sync('/**/*.test.js', { root: inRoot('build-scripts') }),
];
testFiles.forEach((testFile) => require(testFile));

export default testFiles;
