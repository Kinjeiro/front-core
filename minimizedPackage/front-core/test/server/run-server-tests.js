require('./init-server-tests');

// 6) Ищем и запускаем сами тесты
module.exports = require('./server-tests').default;
