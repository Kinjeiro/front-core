___Front Core (FC)___ - это расширяемый boilerplate для создания приложений уровня enterprise на React

!!! главное отличие от статических boilerplate - это наследуемость и будущие поставки c новыми фичами и правками.
То есть вы инсталити FC как обычный модуль, подключаетесь в описанных входных точках, пишите кастомную логику и 
получаете без лишних забот новые обновления и новые версии коры.
Вы не тратите уйму времени и денег на настройку и подгонку плагинов, каких-то важных кусков базовой для enterprise функциональности. 
Все это уже есть в коробке.
  
Можно провести аналогию с https://github.com/facebook/create-react-app только не для hello world, а для enterprise проектов.

___Front Core (FC) - в проектах должен быть только проектный код!___ 


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
* [Поддержка](#crossbrowsers)
* [Commits](#commits)


## Ключенвые особенности

### Общие
- минимизация расходов на развертывание, генераторы - шаблоны для быстрого старта (на базе yeomen https://github.com/Kinjeiro/generator-front-core)
- готовая база компонентов и логики
- низкий порог входа и устойчивость к текучке (junior в проекте могут сразу писать компоненты, не задумываюсь как это работает)
- надежная эксплуатация, стабильность обеспечена за счет того, что происходят фиксы со всех проектов, уже вышедших в продакшен
- модульная разработка (удобство и высокое переиспользование блоков логики) 

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
- модульная структура частей приложения и фич
- настроенная интеграция с GitLab CI
- автодеплой на удаленный сервера с помощью pm2

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
- единая регистрируемая база компонентов с возможностью оборачивания, подмены и подгрузки при необходимости (dependency injection)

### SERVER
- быстрый современный nodejs сервер hapi
- серверный рендеринг (минимальное время загрузки первой страницы)
- встроенный протокол авторизации: OAuth 2.0 (jwt токены)
- проверка запросов на валидность авторизации, серверная проверка прав и ролей
- управление пользователем \ email нотификации и восстановление пароля
- расширяемый logger (winston \ logstash)
- мокирование запросов с клиента
- проксируемые запросы до middle серверов (надстройка над библиотекой 'request')
- сервисный подход к получению данных
- гибкая расширяемость за счет плагинов \ моков \ сервисов
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
- react-router@4
- data entity relations (допилить rest redux-orm или mobx (MST))
- перейти на react-scripts
- добавить websocket из коробки
- разбить на асинхронные chunk modules (react-router@4 + import + webpack chunks)

## Описание структуры Front Core
TODO

## Troubleshooting
TODO

## Поддержка
IE 11+
(IE <= 10 [не поддерживает наследование статических методов в классе](https://babeljs.io/docs/usage/caveats/#classes-10-and-below) (используется у нас в UniRedux и redux-orm)
Есть непроверенные workaround, но это если ооооочень понадобиться.

## Commits
Используем [стиль для коммитов](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines)

### Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

### Revert
If the commit reverts a previous commit, it should begin with `revert: `, followed by the header
of the reverted commit.
In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit
being reverted.
A commit with this format is automatically created by the [`git revert`][git-revert] command.

### Type
Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing or correcting existing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

### Scope
The scope could be anything specifying place of the commit change. For example `$location`,
`$browser`, `$compile`, `$rootScope`, `ngHref`, `ngClick`, `ngView`, etc...

You can use `*` when the change affects more than a single scope.

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

### Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

### Footer
The footer should contain any information about **Breaking Changes** and is also the place to
[reference GitHub issues that this commit closes][closing-issues].

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines.
The rest of the commit message is then used for this.

A detailed explanation can be found in this [document][commit-message-format].
