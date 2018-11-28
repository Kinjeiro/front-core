import glob from 'glob';

import { inRoot } from '../../build-scripts/utils/path-utils';

/*
 Выделяем в отдельный файл без запуска тестов, чтобы использовать его как пред условие для дебага отдельных тестов в IDE
 Для этого в поле NODE_OPTIONS для моки пропишите --require <абсолютный путь до этого файла>
 К примеру:
 --require С:\Code\front-core\test\scripts\init-scripts-tests.js


 Для наследных проектов: необходимо переопределять, так как
 - у каждого свой ServerRunner
 - идут ссылка на src, а мы используем libs
 */

const testFiles = [
  ...glob.sync('/**/*.test.js', { root: inRoot('config') }),
  ...glob.sync('/**/*.test.js', { root: inRoot('build-scripts') }),
];
testFiles.forEach((testFile) => require(testFile));

export default testFiles;
