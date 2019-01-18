/*
 Выделяем в отдельный файл без запуска тестов, чтобы использовать его как пред условие для дебага отдельных тестов в IDE
 Для этого в поле NODE_OPTIONS для моки пропишите --require <абсолютный путь до этого файла>
 К примеру:
 --require С:\Code\front-core\test\server\init-server-tests.js


 Для наследных проектов: необходимо переопределять, так как
 - у каждого свой ServerRunner
 - идут ссылка на src, а мы используем libs
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'test';


// 1) Генерим .babelrc для es6
require('../../build-scripts/init-babel')(true);
// если используется webpack require.context - нужно полифил для него
require('babel-plugin-require-context-hook/register')();


// 2) Инициализирируем тестовую среду (проставляются глобальные переменные) (+ к примеру игнорит css, ejs правя babel и require)
require('./init/init-test-server-enviroment');

// 3) Инициализирируем остальные настройки сервера
// * server-config.js - автоматически синхронно инициализируются при первом запросе с помощью модуля node-config
try {
  // для коры
  require('../../src/server/init');
} catch (error) {
  // для других проектов где нет src
  require('../../lib/server/init');
}


// 4) добавдяем глобальный дефолтный сервер, для упрощения тестирования (он подключается по запросу)
require('./init/init-global-default-server');
