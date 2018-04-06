___Front Core (FC)___ - это расширяемый boilerplate для создания приложений уровня enterprise на React

!!! главное отличие от статических boilerplate - это наследуемость и будущие поставки c новыми фичами и правками.
То есть вы инсталити FC как обычный модуль, подключаетесь в описанных входных точках, пишите кастомную логику и 
удобно получаете новые обновления и новые версии коры.
Вы не тратите уйму времени и денег на настройку и подгонку плагинов, каких-то важных кусков базовой для enterprise функциональности. 
Все это уже есть в коробке.
  
Можно провести аналогию с https://github.com/facebook/create-react-app только не для hello world, а для enterprise проектов.

___Front Core (FC) - коробка для быстрого развертывания сложных проектов!___ 


[Видео о Front-Core](https://youtu.be/HE45oM7IFpA)

[![Видео о Front-Core](https://cdn1.iconfinder.com/data/icons/logotypes/32/youtube-256.png)](https://youtu.be/HE45oM7IFpA)


## Меню
* [Ключенвые особенности](#features)
* [Используемые технологии](#techStack)
* [Как начать](#howToStart)
* [Документация API](#api)
* [Change Log](#changeLog)
* [Roadmap](#roadmap)
* [Описание структуры Front Core](#structure)
* [Troubleshooting](#troubleshooting)


## Ключенвые особенности

### BUILD
- расширяемые конфиги, зависящие от среды 
(к примеру для ENV=production, <core> default.js + <project> default.js + <core> production.js + <project> productions.js + <project> local_production.js)
- уже настроенный webpack build со всеми плагинами, в который можно в любой момент встроить свою кастомную логику
(автогенерация .babelrc для упрощения наследования)
- расширяемость webpack build
(webpack-context.js - для дополнительных переменных и webpack-config.js - для подключения кастомных модулей по сборке)
- hot reload 
(c автоматическое перезагрузкой при изменении роутингов, редакса, компонентов)
- готовый полный package.json со всеми командами
- настроенные автотесты для клиента (karma)
- настроенные автотесты для сервера (mocha)
- настроенные докеры с минимальными образами (двухэтапные сборки)
- eslint (на базе airbnb)

### CLIENT
- расширяемость роутингов \ редуксов \ orm моделей с помощью наследования от CoreClientRunner.js
- встроенные и настроенные redux \ react-router + UniRedux подход, где в классе наследуются экшены, типы, slide и case редьюсеры 
- настроенный postCss \ less \ sass и расширяемость глобальными переменными
(к примеру цветов для внешних библиотек)
- удобная реализация БЭМ (bem-component.js для компонентов и декораторы внутри postCss файлов)
- механизм нотификаций
- rest client
(BaseApiClient, надстройка над superagent с patch json, кастомными (де)сериализаторами, моками, унифицированными ошибками и возможностями повторного запроса при ошибки авторизации по токену)
- готовые IDE Live Templates для react и redux компонентов
(для сред IDEA \ Webstorm)

### SERVER
- быстрый современный nodejs сервер hapi
- серверный рендеринг (минимальное время загрузки первой страницы)
- встроенный протокол авторизации: OAuth 2.0 (jwt токены) 
- отдельным компонентом - auth сервер с OAuth 2.0
- проверка запросов на валидность авторизации, серверная проверка прав и ролей
- расширяемый logger (winston \ logstash)
- мокирование запросов с клиента
- проксируемые запросы до middle серверов (надстройка над request)
- куча доп утилит

## Используемые библиотеки, технологии и стандарты
На базе `NodeJS@9+` версии. 

### на клиенте
* `react@16` - слой визуализации
* `react-router@3` - роутинг приложения
* `redux@3` - слой управления данными
* `redux middle promises` - для управления состояниями промис запросов
* `json-patch` для Http PATCH
* `i18next@8` - интернализация \ локализация
* `moment@2` - работа с датами
* `winston@2` - логирование
* `webpack@3` - сборщик
* `babel` - компилятор ES7
* `karma@1` + `mocha@2` + `chai@3` - тестирование
* `documentation.js@6` - документирование 

### на сервере NodeJS
* `hapi@16` - nodeJs сервер
* `mocha@2` - тестирование
* протокол `OAuth 2.0` - для дефолтной авторизации 

## Как начать
* [Видео о Front-Core](https://youtu.be/HE45oM7IFpA)
  
  [![Видео о Front-Core](https://cdn1.iconfinder.com/data/icons/logotypes/32/youtube-256.png)](https://youtu.be/HE45oM7IFpA)
 
* [Документация как стартовать шаблонный проект](./docs/HOW_TO_START.md)
* [Как добавить кусок логики (api, redux, containers, mock, proxy)](./docs/CREATE_UNIT.md)

## Документация API 
* [API в html](./docs/api/index.html)
* [API в MD](./docs/api.md)

## Change Log 
Актуальный [Change Log](./CHAGELOG.md)

## Roadmap
- добавить yoman скрипт вместо frontCore-Stub
- data entity relations (допилить rest redux-orm или mobx)
- hot reload (webpack неоптимально компилирует новые изменения)
- добавить websocket из коробки
- разбить на асинхронные chunk modules (react-router@4 + import + webpack chunks)
- найти альтернативу redux-form

## Описание структуры Front Core
TODO

## Troubleshooting
TODO
