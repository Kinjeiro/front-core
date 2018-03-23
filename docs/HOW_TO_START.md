## Оглавление
* [Подготовка](#prestart)
* [Шаблон - заготовка приложения](#stubTemplate)
* [Сборка](#build-scripts)
* [Точки входа приложения](#points)
* [Конфигурации](#config)
* [package.json](#packageJson)
* [Подробная структура](#structure)

## Подготовка
1. Установить Node JS 9.0.0+

## Шаблон - заготовка приложения
1. Скачать шаблон https://bitbucket.org/kinjeiro/frontcore_stub
2. Запустить `npm install` для установки зависимостей

`@reagentum/front-core` поставляется в скомпилированном виде без исходников и соотвественно все файлы приложения используются от `@reagentum/front-core/lib/*`
<br/> Исходники - https://bitbucket.org/kinjeiro/frontcore

## Сборка
Теперь необходимо определить входные точки для будущего приложения.
Все точки подхватываются автоматически, когда Front Core анализирует проект.
Начнем со сборки.

### webpack-context.js
В файле `build-scripts/webpack-context.js` - определяются папки для билда проекта.
Основное это папка со статикой проекта (`inFrontCoreComponentsProject('static')`) и если нужно файл с style переменными проекта (`../src/common/app-style/vars`)

```javascript
const path = require('path');

// const PARENT_WEBPACK_CONTEXT = require('@reagentum/front-core/build-scripts/webpack-context');
// @guide - компоненты уже унаследованы от фронт коры
const COMPONENTS_WEBPACK_CONTEXT = require('@reagentum/frontCore_Components/build-scripts/webpack-context');

const CURRENT_FILE_PATH = __dirname;

function inFrontCoreComponentsProject(...args) {
  return path.resolve(CURRENT_FILE_PATH, '..', ...args);
}

module.exports = Object.assign(
  {},
  // PARENT_WEBPACK_CONTEXT,
  COMPONENTS_WEBPACK_CONTEXT,
  {
    // appStyleConfig: require('../src/common/app-style/vars'),
    staticPaths: [
      // ...PARENT_WEBPACK_CONTEXT.staticPaths,
      ...COMPONENTS_WEBPACK_CONTEXT.staticPaths,
      // абсолютные, чтобы другие проекты могли добавлять свои
      inFrontCoreComponentsProject('static')
    ]
  }
);
```

### webpack-config.js
Если есть необходимость добавить свои билд плагины на этапе сборке или повлиять на текущие, то необходимо создать 
в проекте файл `/build-scripts/webpack-config.js` (кора его автоматом распознает и подцепит при сборке) и в нем определить
нужную секцию

Пример как подключить стелевой компонент библиотеки antd
```javascript
const PARENT_WEBPACK_CONFIG = require('@reagentum/front-core/build-scripts/webpack-config');
const pluginStyleLibAntd = require('./plugins/plugin-style-lib-antd');

module.exports = Object.assign(
  {},
  PARENT_WEBPACK_CONFIG,
  {
    getUniWebpackConfig(context, plugins = {}) {
      return PARENT_WEBPACK_CONFIG.getUniWebpackConfig(
        context,
        this.expandPlugins(
          pluginStyleLibAntd,
          plugins
        )
      );
    }
  }
);
```

Для файлов-плагинов есть несколько секций, определяющих части сборки:
```
getUniWebpackConfig - для всех режимов
getFrontendWebpackConfig - только для клиента
getBackendWebpackConfig - только для сервера
getStaticWebpackConfig - только для статики
getTestWebpackConfig - только для тестов
```
Файлы в каждой секции сгруппированы по 3ем ключам:
* startPlugins
* middlePlugins
* finishPlugins
либо используя метод expandPlugins по умолчанию все попадут в middlePlugins 




## Точки входа приложения
Для основного проектного приложения необходимо определить две основные точки входа 
* src/client/index.js 
* src/server/index.js

Эти проектные файлы используются внутри корных скриптов сборки `@reagentum/front-core/build-scripts/webpack-context.js`
```javascript
const clientStartPath = './src/client/index.js';
const serverStartPath = './src/server/index.js';
```
потом в `@reagentum/build-scripts/plugins/frontend/plugin-frontend-main.js`
и в `@reagentum/build-scripts/plugins/backend/plugin-backend-main.js` соотвественно 
при запуске сборки приложения

В этих точках сначала инициализуется конфиги и запускаются инстанты раннеров для клиента (браузера)(ClientRunner) и для сервера (ServerRunner) соответственно
```javascript
import '@reagentum/front-core/lib/client/init';

import ClientRunner from './ClientRunner';

try {
  (new ClientRunner()).run();
} catch (error) {
  console.error(error);
}
```

Раннеры - это расширяемые классы, которые хранят в себе всю инфомарцию о важнейших частях приложения,
а также инкапсулируют в себе механику их обработки и запуска, позволяя разработчикам проектов не задумываться о множестве внутренних вещей. 
Но при этом имея возможность гибкой настройки, если на проекте это понадобиться.

### ClientRunner
Можно переопределяя методы для указания важнейших частей клиенской части (запускаемой в браузере)
```
getRoutes(store)        - роутинг приложений (пока на react-router@3)
getApi()                - клиенские апи для вызова и проксирования запросов на backend и middle сервера, обычно подаются в редьюсеры для promise-action 
getReducers()           - мапа редьюсеров проекта 
getEntityModels()       - моделя для redux-orm, если у вас есть сущности со сложными взаимосвязами
hotReloadListeners()    - для корректно работы хот лоадера нужно перегружать все классы через require c прямыми ссылками (они на этапе сборки обрабатываются webpack, динамические пути не могут быть разлинкованы)
init()                  - можно сделать всякие разовые настройки при запуске клиента 
```

### ServerRunner
```
getClientRunner()                   - инстанс клиентского класса ClientRunner для серверного рендеринга (содержит необходимую инфу о роутинге)
createServices(endpointServices)    - создание собственных сервисов для использования в плагинах и стратегиях
getPlugins(services, strategies)    - главный метод, все в хапи сделано через плагины, для нас главное это плагины роутинга для api
getMockRoutes()                     - мокирование роутов от клиента 
noAuthRequireMatcher(pathname)      - метод необходим чтобы пропускать роутеры вне системы авторизации
getLoginPath()                      - для собственной системы авторизации (в коре используется одна страница входа login,
                                      а бывают комплексная авторизация с (signin, register, reset password и так далее))
```

## Конфигурации
Конфиги динамические и составляются путем мержа мап в зависимости от переменной среды NODE_ENV и наличия соотвествующих файлов.

К примеру, последовательность для `NODE_ENV=production`:
```
  @reagentum/front-core/config/default.js 
+ ./config/default.js 
+ @reagentum/front-core/config/production.js 
+ ./config/productions.js 
+ ./config/local_production.js 
```
Инициализация конфигов для клиента и сервера происходит на этапе запуска входных точек приложения

Итоговый весь конфиг делится на три составляющие по области видимости:
* `common` - для общих настроек, видимы и на клиенте и на сервере
* `client` - только для настроек браузерного клиента, видимы и на клиенте и на сервере
* `server` - только для серверных настроек, видимы и только на сервере.

В основном все конфиги по умолчанию есть в корных конфигах. Но на проекте желательно определить следующие:
* `common.features.i18n.ns` - добавить namespace для локализации 'project'
* `common.features.i18n.language` - установить язык по умолчанию (по умолчанию 'en')
* `server.endpointServices.authApiService` - определить endpoint до авторизационного сервера 
(если он работает на протоколе OAuth 2.0 то больше и ничего делать не нужно, если нет, то нужно будет еще расширить `src/server/services/ServiceAuth.js`) 
* `server.endpointServices.*` - добавить необходимые вам настройки middle серверов на которые вы будете проксировать запросы, чтобы получить реальные данные
```
  {
    // ======================================================
    // ОБЩИЕ КОНФИГИ для КЛИЕНТА И СЕРВЕРА
    // ======================================================
    common: {
      features: {
        i18n: {
          i18nextOptions: {
            //see \static\i18n\en\project.js
            ns: ['core', 'frontCore-components', 'project'],
            language: 'ru',
            fallbackLng: 'ru'
          }
        }
      }
    },

    // ======================================================
    // конфиги для СЕРВЕРА
    // ======================================================
    server: {
      endpointServices: {
        authApiService: middlewareApiService,
        middlewareApiService,
      }
    }
  }
```


## package.json
Теперь несколько изменений в самом файле package.json.
Установите `name`, `description` и если пользуетесь демонами --name вашего приложения в `start-daemon` и `stop-daemon`
```json
{
  "name": "Stub_Project",
  "version": "1.0.0",
  "description": "Stub Project",
  "scripts": {
    "start-build": "node ./.build/server.js",
    "start-daemon": "pm2 start ./.build/server.js --name stub_project",
    "stop-daemon": "pm2 stop stub_project"
  }
}
```

После этих небольших настроек можно запустить приложение. Для этого взглянем подробнее на скрипты.
В нем вызывается множество скрпитов из `@reagentum/front-core/build-scripts` чтобы упростить работу в проекте 
и инкапсулировать всю сложную логику.

Для запуска локального рабочего сервера используйте `npm start` (аналог `npm run start`)

Для сборки и накатывание прода использовать `npm run build && npm run start-production`
Также есть возможность для запуска процесса-демона `npm run start-production-daemon` и `npm run stop-daemon`.
Если у вас на сервере уже запущен демон процесс прода и нужно обновить приложение, то просто запускайте `npm run update-prod`.

Для проверки приложения на качество кода используется `npm run lint`.
Для запуска тестов `npm run test`.

Для получение самой свежей версии коры достаточно выполнить команду `npm run update-core`.
```json
{
  "scripts": {
    "start-build": "node ./.build/server.js",
    "start-daemon": "pm2 start ./.build/server.js --name stub_project",
    "stop-daemon": "pm2 stop stub_project",
    "start-production": "cross-env NODE_ENV=production npm run start-build",
    "start-production-daemon": "cross-env NODE_ENV=production npm run start-daemon",
    "update-prod": "npm run stop-daemon && npm i && npm run build && npm run start-production-daemon",
    "start-development": "cross-env NODE_ENV=development npm run start-build",
    "start-integration": "cross-env NODE_ENV=integration npm run start-build",
    "start-loadtesting": "cross-env NODE_ENV=loadtesting npm run start-build",
    "start-prelive": "cross-env NODE_ENV=prelive npm run start-build",
    "start-localhost": "cross-env NODE_ENV=localhost HOT_LOADER=1 APP_MOCKS=1 USE_MOCKS=1 node ./node_modules/@reagentum/front-core/build-scripts/start.js",
    "start-localhost-other-port": "cross-env SERVER_PORT=8082 PROXY_PORT=9092 npm run start-localhost",
    "start": "npm run start-localhost",
    "start-without-SSR": "cross-env CLIENT_SIDE_RENDERING=1 npm run start-localhost",
    "start-frontend-server": "node ./node_modules/@reagentum/front-core/build-scripts/start-frontend.js",
    "start-backend-server": "node ./node_modules/@reagentum/front-core/build-scripts/start-backend.js",
    "build": "node ./node_modules/@reagentum/front-core/build-scripts/update-babelrc.js && cross-env NODE_ENV=production node ./node_modules/@reagentum/front-core/build-scripts/build.js",
    "test-build": "npm run build && npm run start-production",
    "lint": "./node_modules/.bin/eslint --ext js,jsx .",
    "test-client": "cross-env NODE_ENV=test karma start ./node_modules/@reagentum/front-core/test/client/run-client-tests.js",
    "test-client:watch": "npm run test-client -- --watch",
    "test-server": "cross-env NODE_ENV=test mocha ./node_modules/@reagentum/front-core/test/server/run-server-tests.js --timeout 10000",
    "test-server:watch": "npm run test-server -- --watch",
    "test-scripts": "cross-env NODE_ENV=test mocha ./node_modules/@reagentum/front-core/test/scripts/run-scripts-tests.js",
    "test": "npm run test-scripts && npm run test-server && npm run test-client",
    "sync-work-branch": "sh ./node_modules/@reagentum/front-core/build-scripts/sync-work-branch.sh",
    "update-core": "npm install --save @reagentum/front-core@latest @reagentum/frontCore_Components@latest"
  }
}
```

## Подробная структура
```
Project
├── .build/                 // сборка
├── .git/            
├── build-scripts           // все относится к сборке проекта
│   └── .eslintrc           // исключения для версии js
│   └── stub.test.js        // пустой тест-пример для тестирования инструментов сборки
│   └── webpack-context.js  // определение доп переменных для сборки, но главное пути до статики
│   └── webpack-config.js   // (опционально) добавляет возможность добавить кастомные проектные плагины для сборки
├── config                  // папка для конфигов приложения, склеиваются с конфигами из коры в зависимости от NODE_ENV 
│   └── .eslintrc
│   └── default.js
│   └── local-localhost.js  // префикс 'local-' скливается последним, удобно его не класть в репозиторий и тем самым иметь на локальном компе нужные особые настройки
│   └── localhost.js
│   └── production.js
├── logs/                   // папка с логами node js сервера 
├── node_modules/           // папка с зависимостями
│   └── @reagentum          // папка с коравскими либами - @reagentum - это скоуп библиотек          
│      └── front-core       // собстенно сама кора
│      └── frontCore_Components // библиотека со стилизованными компонентами
│   └── ...    
├── src                         // основные файлы проекта
│   └── client                  // папка для кода, относящегося только к клиенту (запускаемому в браузере)     
│      └── ClientRunner.js      // !!! Главный расшириненный класс от CoreClientRunner, описывающий основные части приложения (роутинг, редьюсеры и т.д.) 
│      └── index.js             // !!! Главный файл который запускается при старте приложения в клиенте (браузере) 
│      └── stub.test.js         // заглушка для клиентских тестов (служит примером и еще карма падает если нет ни единого теста)
│   └── common                  // папка для общего кода, доступного и клиенту и серверу (для серверного рендеринга)     
│      └── api/                 // папка для вызовов апи через hapi сервер 
│      └── app-redux            // папка для работы cо data слоем 
│         └── reducers          // все редьюсеры проекта
│            └── root.js        // гланый рутовый редьюсер проекта, из которого берут мапу в ClientRunner.js     
│            └── testUtils-page.js // тестовый редьюсер
│         └── selectors.js      // логика получения данных (инфа где что хранится) отделена от редьюсеров
│                                 и вынесена в селекторы. Так же их можно мемоизировать с помощью библиотеки reselect, чтобу улучшить производительость 
│      └── app-styles           // глобальные стилевые настройки и переменные 
│         └── mixins.scss       // разнообразные SASS миксины
│         └── vars.scss         // основные переменные проекта (цвета, тона, шрифты, размеры, z-index)
│      └── components/          // простые dummy stateless компоненты
│      └── constants/           // проектные константы
│      └── containers/          // умные контейнеры, используемые в роутинге (в будущем будет pod (по модульная) вложенная структура)
│      └── utils                // разнообразные утилиты
│         └── i18n.js           // обертка для удобства над core i18n с префиксом project по умолчанию 
│      └── create-routes.jsx    // !!! Роутинг приложения          
│      └── menu.js              // меню для header приложения
│      └── routes.pathes.js     // константы путей приложения, которые используются в разных контейнерах (должны быть отделены от роутов)
│   └── server                  // папка с серверным кодом 
│      └── helpers              // helpers - это утилиты, которые имеют состояние (обычно от конфигов)
│         └── middleware-api.js // удобный тестовый хелпер, если у вас все один middlewareApi сервер (берет по-умолчанию настройки из serverConfig.server.endpointServices.middlewareApiService)
│                                  и оборачивает для сервера proxy и send  
│      └── plugins              // основа hapi сервера
│         └── api               // роут плагины, которые отвечают за обработку апи от клиента
│            └── mock                           // мокирование запросов от клиента
│               └── index.js                    // агрегация моков, которая используется в ServerRunner
│               └── mock-api-user.js            // подключение ./users.js  
│               └── mock-api-testUtils.js       // мокирование тестового апи
│               └── users.js                    // мокирование тестовых пользователей (по умолчанию есть два IvanovI и KorolevaU) можно добавить 
│                                                  новых или добавить им нужны прав. Важно обновить информацию о их бесконечных токенах
│            └── api.test.js        // пример теста апи             
│            └── index.js           // агрегация всех апи, которые используются в ServerRunner
│      └── services                 // папка с проектными сервисами (классы, которые инкапсулируют логику обращения к каким-то конкретным endpoint api сервера)
│         └── auth-api-service.js   // обертка над ServiceAuth.js чтобы если api не поддерживается полностью OAuth 2.0 что-то подправить 
│         └── index.js              // агрегация сервисов, которая используется в ServerRunner 
│      └── index.js                 // !!! Стартовая точка для сервера
│      └── ServerRunner.js          // !!! Главный класс, унаследованный от CoreServerRunner, икпапсулирующий работу сервера
│      └── stub.test.js             // заглушка и пример для серверных тестов на mocha 
├── static                          // статическая часть проекта (копируется при сборке)
│   └── i18n\en\project.js          // локализация для en
│   └── i18n\ru\project.js          // локализация для en 
├── test                            // все настройик для тестов в коре
│   └── server\init\get-project-server-runner-class.js  // но чтобы иметь возможность запускать серверные тесты вместе с реальным 
│                                                         проектным сервером нужно указать ссылку на проектны ServerRunner
├── .babelrc                    // игнорируется для коммитов - он автоматически генерируется при сборке корой (из плагинов),
│                                  чтобы поддержать унификацию плагинов, но при этом нужен для некоторых внешних вещей таких как babel cli compile dir, которому не скормишь плагины
├── .editorconfig               // настройки для сред разработки 
├── .eslintrc.json              // настройки eslint (они наследуются от коровского, которые расширяет и немного изменяет airbnb)
├── .gitconfig                  // настройки гита
├── .gitignore                  // игноры для коммитов
├── .npmignore                  // игноры при публишенге проекто в npm (папка src не паблишится) 
├── .npmrc                      // настройки для npm, в них указан путь и ключ для приватного репозитория, где лежит скопилированная @reagentum/front-core
├── package.json                // сердце проекта со скриптами и зависимостями
├── package-lock.json           // лок
└── README.md                   // читаем в первую очередь
```

