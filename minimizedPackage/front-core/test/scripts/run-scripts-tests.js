/*
  Для наследных проектов:
  Не обязательно переопределять, а сразу в package.json прописывать, так как нет зависимой специфики.
*/
require('../../build-scripts/init-babel')(true);

require('../server/init/init-test-server-enviroment');

module.exports = require('./scripts-tests');
