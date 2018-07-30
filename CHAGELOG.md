# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).


## [last version][1.4.0 - ] (2018.07.28)
### !!! Breaking changes:
1. Настроил ServiceAuth на работу с сервером ```@reagentum/auth-server@1.0.4```. Добавил Signup \ Forgot password \ Reset password фунционал
   Перенес все что связано с авторизацией пока в отдельный псевдомодуль ```/src/modules/module-auth```
   Изменил роутинг с ```/login``` на ```/auth/signin``` и кое-где классы для компонентов -
   Поэтому проверьте у себя, чтобы ничего не отвалилось в авторизации
1. Добавил /src/components/ComponentsBase - место отложенной инициализации компонентов. 
Убрал из ```create-routes``` определение классов компонентов
Если хотите их заменить, то инициализируйте в ComponentsBase:
```
NoticeComponentClass -> Notice в ComponentsBase
LoginPageComponentClass -> Signin в ComponentsBase
ModalLoginPageComponentClass -> Signin в ComponentsBase
```
   
### API Dependencies:
    + ServiceAuth - @reagentum/auth-server@1.0.4

### Dependencies:
    + normalize.css@8.0.0
    
### Dev Dependencies:

### Features:
1.  OAuth авторизация с регистрацией и сбросом пароля через почту
2.  ComponentsBase - для переопределения и поздней инициализации всех компонентов

### Commits:
    - chore(*) patch version: 1.4.2
    - feat(i18n, auth) - локализация для auth
    - !!! feat(components): - перевел определение всех компонентов (NoticeComponentClass, LoginPageComponentClass, ModalLoginPageComponentClass) на CB
    - feat(all): - отменил правило global-require \\ убрал старый react dts
        \\ Link теперь подчекивается по умолчанию 
    - feat(auth): - стилизовал форму логина
        \\ перевел auth на CB (componentsBase)
    - feat(components): - добавил ComponentsBase - мапу всех компонентов, в которой есть возможность заменить компоненты в дочерних проектах (к примеру, стили Form, Loading, Button) + чтобы не грузились лишние css стили сделана поздняя инициализация через require 
    - !!! feat(css, depen): - normalize.css@8.0.0 для усреднения стилей - может поехать верстка 
    - feat(components, form): - добавил CoreForm \ CoreField \ CoreInput \ CoreSelect и лайутинг для них FormLayout \ FieldLayout 
    - bug(utils, i18n): - i18n поправил багу с defaultValue
    - feat(utils): - executeVariableMemoize по первому специальному ключу сохраняет полученные из функции значения 
    - chore(*) patch version: 1.4.1 
    - !!! feat(auth): - вынес авторизацию в отдельный псевдомодуль (src\common\modules\module-auth)
        \\ добавил signup (Регистрацию) и возможность сброса пароля через почту (forgot и reset)
    - chore(*) minor version: 1.4.0
    
 

## [last version][1.3.0 - 1.3.38] (2018.07.28)
### !!! Breaking changes:
1. Теперь конфиги клиента подгружаются асинхронно. Это необходимо, если код используется как статические ассеты на другом сервере (к примеру, на weblogic).
Необходимо свои src\client\index.js переписать на асинхронный режим
```javascript
import initAll from '@reagentum/front-core/lib/client/init';

async function start() {
  await initAll();
  // подгружаем раннер со всеми его импортами ПОСЛЕ инициализации конфигов и глобальных значений (i18n)
  const ClientRunner = require('./ClientRunner').default;
  await (new ClientRunner()).run();
}

try {
  start();
} catch (error) {
  console.error(error);
}
```
2. Добавил использование новой фичи реакта - создание нового контекста React.createContext. Необходимо обновить версию реакта
```
 "react": "~16.4.0",
 "react-dom": "~16.4.0",
```
3. ServerRunner::noAuthRequireMatcher принимает pathname без контекста, для удобства сравнения с путями
4. Чистка зависимостей в package.json. Нужно проверить работоспособность. Был баг: неправильно записаны зависимости в dependencies для продакшена (npm i --production)
- убрал "redux-form" (не использовался)
- убрал "date-fns" (мы используем тяжеловесный moment пока)
- убрал "moment-duration-format" (не использовался)
- убрал "nock" (не использовался)
- убрал "good" и "good-console" (не использовался)
ВАЖНО: после обновления коры почистите npm у себя:
```
rm -rf ./node_modules && rm -f package-lock.json && npm cache clean --force && npm install
```

### Dependencies:
    + "whatwg-fetch": "~2.0.4"
    
### Dev Dependencies:

### Features:
1. использование сборки как статически ассетов для другого сервера 

### Commits:
    - chore(*) patch version: 1.3.38
    - feat(api, health): - /health возвращает название и версию прилоежния
    - bug(uni-error): - пофиксид uni-error нужно использовать uniMessage а не clientErrorMessage
    - feat(auth): - добавил в конфиги common.features.auth.allowSignup и allowResetPasswordByEmail - возможность их включать и отключать
		\\ i18n теперь по умолчанию не эскейпит html в сообщениях
		\\ client_id равен APP_ID, а client_secret APP_IDAPP_ID
    - bug(routes): - обновил history@3.3.0 там была бага сбрасывались query в стринговом path
    - feat(components): - ActionStatus - чтобы показывать ошибки после промисов
    - feat(utils): - новый метод app-urls::getFullUrl
		\\ user - теперь появилось поле phone, email стал required
		\\ utils\common.js::errorToJson - сериализация ошибок
		\\ фикс uri-utils::joinPath - если последний параметер пустой - не учитывать его
    - feat(redux): - добавил декоратор redux-simple-form для удобства работы с нашими redux ui form (как простую замену redux-form)
    - chore(*) patch version: 1.3.37
    - bug(contextPath, hapi): - бага в hapi - он не достает куки от contextPath а пихает все, использовали workaround с получением первого элемента массива для кук
    - chore(*) patch version: 1.3.36
    - bug(contextPath): - бага - моки не работали при contextPath
    - chore(*) patch version: 1.3.35
    - bug(ReduxTable): - при очистки фильтров терся весь остальной state
    - bug(utils, uri): - не парсились вложенные объекты
    - chore(*) patch version: 1.3.34
    - feat(utils, regexp): - escapeToRegExp
    - chore(babel): - добавил в webapck-context compileNodeModules - чтобы указывать какие модули в node_modules нужно траспилировать через babel (которые используют ES6)
    - feat(i18n): - добавил defaultValue если нет такого ключа
    - chore(depen): - отключил правило что нужно только из своего собственного package.json брать зависимости, ибо в коре уже многие есть
    - chore(auth): - добавил AuthCheckWrapper - для проверки авторизованности и если ее нет - то появляется модальное окно логина
		\\ обновил Link добавив внутрь этот враппер (перевел в containers) - checkAuth, permissions
		\\ для uni-error linkForwardTo чтобы можно было после перейти на нужный роут
    - bug(redux-logger): - @bug_out redux-logger ошибка из-за версии diff - изменил на исправленный форк
    - chore(*) patch version: 1.3.33
    - !!! chore(depen): - почистил депенденси
		\\ бага что продакшен зависимости были в devDependencies
		\\ теперь требуется реакт 16.4.0 (мы используем фичи React.createContext)
    - bug(mock, contextPath): - неправильные пути до ассетов строились на сервере
    - chore(*) patch version: 1.3.32
    - bug(mock, contextPath): - моки не работали если есть contextPath
    - chore(*) patch version: 1.3.31
    - bug(contextPath): - для сервера нужно доп обертка для уверенности
    - chore(*) patch version: 1.3.30
    - feat(contextPath): - добавил оберту для contextPath чтобы если есть впереди проставлял слеш
    - chore(*) patch version: 1.3.29
    - feat(modules): - компонент ModuleLink для удобства
    - chore(*) patch version: 1.3.28
    - feat(utils, api): - сделал передачу meta от рута (без префикса meta[search])
    - chore(*) patch version: 1.3.27
    - bug(utils, api, uri): - исправил багу в api crud - убрал первым параметром id компонента
		\\ добавил возможность парсить объекты из параметров: queryparam[innerKey]=value
    - chore(*) patch version: 1.3.26
    - feat(utils): - лучше использовать joinPath вместо joinUri
		\\ добавил метод getModuleFullPath, чтобы в дочерних проектов у раутов \ меню расчитывать пути
    - chore(*) patch version: 1.3.25
    - feat(redux-table): - добавил в передаваемые проперти table
    - chore(*) patch version: 1.3.24
    - feat(context, ContextModulesProvider): - добавил доп проперть в которую передется маппинг модуля и префикса для него (через createRouter: rootAppComponentProps.modulesProviderProps.moduleToRoutePrefixMap)
		\\ затем это используется в ContextModulesProvider чтобы составлять полный урл из относительного урла модуля
		\\ а потом поставляются в любые компоненты посредствам декоратора src\common\contexts\ContextModules\decorator-context-modules.js - подаются методы getFullPath и onGoTo
		\\ добавил описание model-location.js
    - feat(utils): - добавил способ создания декораторов по Context.Consumer \utils\decorators\utils\create-context-decorator.jsx
    - chore(eslint): - отключил проверку на PropTypes.object и остальное
    - bug(utils): - в joinUrl было ограничение что можно только стринги были подавать, на number ругался
    - chore(*) patch version: 1.3.23
    - feat(models): - обновил модели, добавил model-table и model-id
		\\ в утилиты добавил результат дифа - deep-diff.js
    - chore(*) patch version: 1.3.22
    - feat(Link): - добавил подсветку при наведении
    - chore(*) patch version: 1.3.21
    - feat(utils): - createCrud все поля с наймингом Record а не Entity для единообразия с ReduxTable
    - feat(utils): - common::wrapToArray
    - chore(*) patch version: 1.3.20
    - feat(utils): - api-utils:createCrudApi
		\\ в конфигах задать server.endpointServices.middlewareApiService и можно использовать server\helpers\middleware-api::proxy или send методы
    - feat(redux): - декоратор для redux tables чтобы автоматом инициализироваться
    - feat(utils): - добавил checkExist (для удобной проверки наличия переменных)
    - feat(utils): - добавил createTestUser для удобства
		\\ пару описаний
    - chore(*) patch version: 1.3.19
    - feat(utils): - добавил formatStringWithoutAutoSpaces
    - chore(*) patch version: 1.3.18
    - feat(utils): - format-utils:formatString
    - chore(*) patch version: 1.3.17
    - feat(utils): - formatString
		\\ treeUtils - isRoot если нашелся элемент и он рутовый, подаваемый
    - chore(*) patch version: 1.3.16
    - feat(redux): - обновил redux-logger (добавился diff)
    - chore(*) patch version: 1.3.15
    - feat(tree-utils): - findInTree обновил и написал тесты (появилась возможность задать фильтр как функцию)
    - chore(*) patch version: 1.3.14
    - bug(webpack): - ассеты с контекст пасом не определялись
    - chore(*) patch version: 1.3.13
    - chore(depen): - обновил версию реакта до 16.4.0
    - chore(*) patch version: 1.3.12
    - feat(apiClient): - добавил инициализация общего для всех класс ApiClientClass чтобы проекты могли создавать множество инстансов на одинаковых данных
		\\ также добавил по умолчанию в классе получение контекста - redux state и метод getUserInfo()
    - chore(*) patch version: 1.3.11
    - bug(patch): - regexp объект мутабельный и test плохо отрабатывает
    - chore(*) patch version: 1.3.10
    - bug(build): - неправильное проставлялись пути до ассетов шрифтов и иконок
    - feat(client): - добавил window глобальные перменные
    - chore(*) patch version: 1.3.9
    - chore(dep): - апдейт
    - bug(i18n): - отложенная загрузка скриптов. Приложение не стартанет пока не загрузится локализация
    - chore(*) patch version: 1.3.8
    - bug(api, utils): - неправильно находился "-" при добавлении
    - chore(*) patch version: 1.3.7
    - feat(api): - createEndpointServiceConfig useDefaults - чтобы можно было дефолтов делать относительные ссылки
    - chore(*) patch version: 1.3.6
    - feat(api): - добавил доп настройку для BaseApiClient - withContextUrl по умолчанию true (чтобы на другие относительные namespace заходить)
    - chore(*) patch version: 1.3.5
    - feat(utils, api): - patch-operation add 3
    - feat(utils, api): - patch-operation add 2
    - feat(utils, api): - patch-operation add - добавил автоматическое добавление \- для вставки в конец по стандарту
    - chore(*) patch version: 1.3.4
    - feat(utils, url): - joinUri в конце может принимать object - это query parameters
    - bug(contextUrl): - appUrl не нужно использовать для роутинга, history сама добавит из basename
    - chore(*) patch version: 1.3.3
    - feat(apiClient): - метод взятия единого apiClient в helpers/get-api-client (возвращает метод который нужно вызвать)
		\\ его инициализация происходит в AbstractClientRunner (либо внутри него самого, по умолчанию используется BaseApiClient)
		\\ BaseApiClient по умолчанию берет apiHost \ apiPort \ apiPrefix из конфигов common.apiClientEndpoint (если пустой, то будет относительно запускаемого сервера)
		\\ настройки для коннекшена hapi - server.features.serverFeatures.serverConnectionOptions
		\\ включен cors * на ноде
    - chore(*) patch version: 1.3.2
    - bug(contextPath): - в path у роутеров были куски контекст паса из appUrl
    - chore(*) patch version: 1.3.1
    - feat(contextPath): - починил contextPath для статического билда (к сожалению, с серверной ноды, он пока не работает)
    - chore(*) minor version: 1.3.0
    - chore(doc): - change log
    - feat(build): - теперь конфиги инициализируются асинхронно (нужно переделать src\client\index.js стартеры в проектах)
        \\ если конфиги не пришли вместе со window.__data - тогда они загрузятся из ассектов\default-config.json (поэтому и асинхронно) 
    - chore(ie): - добавил полифил для fetch в ie 


## [1.2.24] - 2018-05-15
### !!! Breaking changes:
1. переместил src/common/app-redux/simple-module-factory -> src/common/app-redux/helpers/simple-module-factory
<br/>Изменились параметры создания и по-новому называются дефолтные экшены (actionModuleItemInit)

### Features:
1. ServiceAuth - теперь это класс для удобного и гибкого расширения
1. UniRedux - новая схема работы с редаксом all-in-one и через расширение классов
1. ReduxTable - редакс для таблиц со встроенным selected, meta, filters, changeStatus и редактированием

### Dependencies:
    + "node-sass": "~4.6.0"
    + "html-webpack-plugin": "~3.2.0"
    + "pm2": "~2.8.0"
    
### Dev Dependencies:
    + "documentation": "~6.1.0"
    + "live-server": "~1.2.0"

### Commits:
    - feat(build): - добавил полезности для статической сборки: ./.build/default-config.json и ./.build/index.html с втроенным дефолтным конфигом
        \\ в плагине /build-scripts/frontend/plugin-index-html.js показано как создавть темплейт для index.html 
        \\ перевел npm на ru
    - chore(npm_repo): - обновил наш npm репозиторий
    - chore(depen): - обновил node-sass@4.6.0 которая дружит с nodejs 9
    - feat(utils, redux): - теперь createAllTypesMapCollectionReducer если не найден элемент вызывает редьюсер с undefined в state
    - feat(utils): - endpoint унифицировал
    - feat(uni-error): - добавил формат от java error json (от нашей платформы)
    - feat(api-patch): - возможность конвертить коммон lodash.get в patch json формат
    - chore(redme): - правила и найминг коммитов
    - chore(lock): - лок постоянно скачет
    - bug(ie11): - исправил полифилы для ie11, ie10 не поддерживается так как babel без __proto__ (которого нет в ie10) не может сделать наследование статических методов \\ добавил это в readme
    - feature(mocks) - тесты дополнены (path param с дефисом) AVagizov 13.04.2018 22:35 
    - feature(mocks) - корректный парсинг значений path params, содержащих дефис AVagizov 13.04.2018 22:21 
    - feat(ReduxTable): - возможность в качестве данных поставлять не { meta, records }, а просто массив, который пойдет сразу в records
    - chore(routes): - для единообразия вынес роут константы выше, а прошлый файл пометил деприкейтед - теперь используес src/routes-paths.js (как в проектах)
    - bug(start, core): - если запускать кору, без скомпиленной lib то падала ошибка
    - bug(i18n): - при смене языка через клиент не учитывался contextPath и сложный роутинг (был относительный, а не абсолютный путь)
    - chore(docs): - добавил ссылку на видео о Front-Core
    - chore(package.json): - фикс чтобы при сохранении зависимостей указывался префикс только патчей \\ добавил скрипт npm run full-update-npm чтобы полностью обновить node_modules (будет полезно пока package-lock.json не устаканится)
    - chore(test, proxy): - 502 статус для uniError.isNotFound = true
    - chore(test, proxy): - добавил тест для ошибки на фейк эндпоинт
    - bug(proxy): - не обрабатывались ошибки во время proxy \\ добавил в uni-error FROM_BOOM (hapi boom - https://github.com/hapijs/boom)
    - chore(package.json): - stop-daemon теперь не падает с ошибкой, если процесс не был запущен // установил обновление версий только в рамках patch (0.0.*) (минорные фичи (через ^) у сторонних часто ломают функционал)
    - bug(webpack-config): - если ошибка компиляции самого файла webpack-config - то она не показывалась
    - chore(dependencies): - добавил недостающие пакеты \\ добавил лок файл
    - chore(docs): - красивости
    - chore(version): - борьда с версиями, бывает что не успеваю пароль ввбить для пуша и падает. Чтобы версию не обновлять добавил доп метод
    - chore(docs): - добавил компиляцию доков в markdown
    - chore(docs): - красивости
    - chore(version): - война с версиями
    - chore(npm scripts): - настройка авторизационного таймаута
    - chore(docs): - Документирование проекта \\ обновил CHANGELOG \\ Написал первые инструкции в \docs\*.md
    - bug(redux, table): - добавил возможность сбросить фильтры и мета через подачу null или false
    - bug(auth): - если попытки истекли предлагать залогиниться. Но остается проблема, что после релогина нет повторного запуска неудачных процессов
    - bug(auth): - проксирование обновленного после refresh токена для следующих requests 
        \\ чтобы повторить клиенские запросы упавшие с 401 сделал настройку retryWhenNotAuthErrorTimeout и retryWhenNotAuthErrorAttempts 
        \\ некоторые мидл апи по oauth2.0 возвращают неправильное с маленькой буквы название token_type: 'bearer' сдалал против ник обход
    - bug(auth): - если истек токен, то нужно еще проверить refresh_token, вдруг с помощью него можно залогиниться
    - feat(redux, tables): - дефолтный actions для simple-module-factory
    - chore(changelog): - обновление changelog.md
    - feat(redux, tables): - новый редукс для любых табилц ReduxTable, который можно расширять (либо через override методов, либо через getFeatures()) 
        \\ в ReduxTable есть records, selected, meta, filters, changeStatus и другое 
        \\ обновил simple-module-factory для мапы объектов по uuid
    - bug(ie): - ругался на стрелочные функции
    - bug(auth): - expire в стандарте OAuth2.0 в секундах, а сервер hapi на милисекундах 
        // в новых версиях нет для кук параметра expire, есть ttl
    - bug(auth): - удаление куков в request
    - feat(auth): - Переделал ServiceAuth на класс


## [1.2.0] - 2018-03-01
### !!! Breaking changes:
1. переделал роутинг на опции среди которых можно переопределить классы для некоторых стилизованных компонентов (Notice)
```javascript
 return createParentRoutes(
    store,
    [
      // ======================================================
      // AUTH
      // ======================================================
      <Route
        key="authLayout"
        path={ NAMES.auth }
        component={ AuthLayout }
      >
        <IndexRedirect to={ NAMES.signin } />
        <Route
          path={ NAMES.signin }
          component={ Signin }
        />
      </Route>,

      // ======================================================
      // APP
      // ======================================================
      <Route
        key="appLayout"
        component={ AppLayout }
      >
        <IndexRedirect to={ NAMES.tickers } />
        <Route
          path={ NAMES.tickers }
          component={ Tickers }
        />
      </Route>,
    ],
    [
      <Redirect
        key={ `redirect_${PATH_LOGIN_PAGE}` }
        from={ PATH_LOGIN_PAGE }
        to={ paths.PATH_AUTH_INDEX }
      />,
    ],
  );
```
Вынести в отдельные куски projectLayout и authLayout:
```javascript
  return createParentRoutes(
    store,
    projectLayout,
    {
      beforeRoutes: [
        <Redirect
          key={ `redirect_${PATH_LOGIN_PAGE}` }
          from={ PATH_LOGIN_PAGE }
          to={ FC_COMPONENTS_PATHS.PATH_AUTH_INDEX }
        />,
      ],
      authLayout,

      NoticeComponentClass: Notice,
      LoginPageComponentClass: Signin,
      ModalLoginPageComponentClass: Signin,
    },
  );
```

2. переделал authStrategy: теперь вместо (token) она работает от (request, response)
\src\server\strategies\auth\index.js
```
export default function factoryAuthStrategy(services/* , otherStrategies, strategyOptions*/) {
  return async (request, response) => {
    let userInfo;
    if (serverConfig.server.features.mocking.authMock) {
      userInfo = await authStrategyMock(request, response, services);
    } else {
      userInfo = await authStrategyOauth2(request, response, services);
    }

    return new CredentialsModel(userInfo);
  };
}
```

### Dependencies:

### Features:
1. переделал роутинг на мапу опций, среди которых можно переопределить классы компонентов для некоторых стилизованные компонентов 
1. переделал authStrategy теперь она работает от request, response 
1. если сессия протухла, то либо появится сообщение о переходе на логин страницу, либо форма логина (в завизимости от config.common.features.auth.reLoginModalForm) за этим следить AuthErrorContainer 
1. uni-error теперь содержит поле isNoAuth, если слетела авторизация
1. добавил CHANGELOG.md журнал

### Commits:
    - feat(auth): - !!! переделал роутинг на опции среди которых можно переопределить классы для некоторых компонентов // !!! - переделал authStrategy теперь она работает от request, response // если сесси протухла, то либо появится сообщение о переходе на логин страницу, либо форма логина (в завизимости от config.common.features.auth.reLoginModalForm) за этим следить AuthErrorContainer 
        // добавлен новый redux lastUniError (в промисах) 
        // uni-error теперь содержит поле isNoAuth, если слетела авторизаци 
        // в i18n-utils появился метод для биндинга namespace translateWithNamespace 
        // пофиксил багу queryString что не энкодился hash
    - feat(chore): - add CHANGELOG.md

## [1.1.0] - 2018-02-27

### !!! Breaking changes:
1. **BaseApiClient** метод **serializeRequest** теперь принимает два параметра и должен вернуть request.
<br/>При наследовании старые **serializeRequest** переименуйте в **parseOptions**

### Features:
1. В BaseApiClient добавлены в request options: serializer, deserializer, optionsParser 
1. В BaseApiClient добавлены http PATCH метод c возможностью замены индексов на переданные id элементов
1. В BaseApiClient добавлены downloadFile и uploadFile методы
1. новые утилиты date-utils \ common utils \ tree-utils
1. auth - логин по Enter \ autoComplete
1. Стилизированный Notice класс компонент можно передать в App

### Dependencies:
    + "file-saver": "~1.3.3"

### Commits:
    - feat(api): - обновлен BaseApiClient - добавлены в request options: serializer, deserializer, optionsParser \\ добавлены методы у apiClient: downloadFile и uploadFile \\ добавил библиотеку file-saver@1.3.3
    - feat(uni-error): - uni-error может быть только из clientErrorMessages
    - feat(uni-error): - uni-error из json формата
    - bug(uni-error): - локализация для ошибок
    - bug(notice): - нужна задержка чтобы setState у компонентов срабатывать успевал
    - feat(notice, uni-error) - Notice компонент можно передать в App 
        \\ uni-error теперь поддержка clientErrorMessages
    - feat(server, proxy) - подправил тесты
    - feat(server, proxy) - улучшение удобства проксирования (в handler proxy передаются - (payload, requestData, apiRequest, newReply, proxyResponse, pluginOptions))
    - bug(utils, date) - баг названия конфига
    - bug(api, utils) - если id были числовыми itemIds не правильно заменялись
    - feat(api) - теперь BaseApiClient берет по умолчанию настройки из конфигов 
        \\ windows.api - если не продакшен
    - feat(tree, utils) - tree-utils.js методы
    - bug(mock) - mock enable не работал
    - feat(api, patch, utils) - BaseApiClient настройка - usePatchByItemId заменяем path index на itemId
    - feat(api, utils) - api-utils для patch операций 
        \\ моки не включаются если не enable
    - feat(proxy) - доп методы для проксирования на middleware
    - bug(url) - url query arrays
    - chore(git) - pre-commit tests
    - feat(test) - для тестирование улучшение механизмов
    - feat(auth) - логин по Enter \\ autoComplete
    - bug(utils): - фикс arrayToTree
    - feat(utils): - новые утилиты для date-utils \\ common utils
    - feat(utils): - common includes
    - bug(utils): - uuid версия
    - feat(utils): - generateId не работал на ноде 
        \\ ошибки в normalizeDate от '' 
        \\ add lib uuid 
        \\ убрал при логини чтобы отсылался пароль 
        \\ инициализация языка для momentJs
    - feat(auth): - loginButtonClassName
    - feat(auth): - замокировал logout
    - chore(typescript): - пока отключил тайпскрипт
    - feat(auth): - добавил actionUserLogout
    - bug(auth): - зафиксил багу с uncontrolled input
    - chore(lodash-decorators): - заменил устаревший core-decorators на lodash-decorators
    - bug(mocks): - не работала задержка если тело было функцией
    - feat(utils): - generateId return uuid
    - bug(page-info): - спонтанно очищался тайтл страницы
    - chore(test): - тестирование на разных портах
    - feat(all): - русская локализация 
        \\ декоратор titled поставляется props 
        \\ mock utils пробрасывает параметры
    - chore(build): - webpack-context doesn't see src
    - chore(git): - git postversion
    - chore(publish): - without src
    - chore(babel, ie): - babel ie polyfill
    - chore(build): - git versions scripts


## [1.0.0] - 2017.12.26
### Features:
1. проксирование запросов через hapi (с матчерами)
1. обновление до webpack 3
1. обновелние до react 16 (fiber)
1. обновление до redux-router 3
1. локализация теперь из js файлов, а не json
1. Поддержка sass
1. новые компоненты MediaQuery (react-responsive) \ ReadMore (react-truncate)
1. обновленный универсальный uni-error используется везде
1. возможность создания собственных схем авторизации (матчеры пропуска, редиректы стандартной логин страницы)
1. авторизационный моки
1. сприкты для демонизации процессов
1. небольшая оптимизация под прод
1. декоратор @titled для смены title заголовков
1. фиксы загрузки в IE

### Commits
    - bug(uniError): - captureStackTrace нет в Firefox
    - bug(ie, babel): - переместил полифилы из src чтобы не путали никого и пофиксил неточности
    - feat(mocks): - моки по умолчанию инициализированы (APP_MOCKS) и запущены сразу (USE_MOCKS)
    - bug(ie, babel): - babel polyfill для IE нужно перед hot reload patch подавать
    - feat(notifications, uniError): - возможность отключать notifications 
        \\ uniError сразу извлекается из response.body
    - bug(proxy, uniError): - фикс не показывалась ошибка от middle сервера
    - feat(proxy): - не делать toString для буффера, чтобы не захломлять логи
    - bug(proxy): - бага что неправильно бросалась ошибка
    - feat(proxy): - фича params теперь поддерживается и в mapUri функции
    - feat(proxy): - дебаг прокси и добавлена поддержка мапинга просто на стринг урл с wildcard
    - feat(mock, api, i18n): - мок теперь включется либо через url, либо доп флаг USE_MOCKS 
        \\ i18n пофикшена бага с подкгрузкой на клиенте js файлов - теперь единая переменная 
        \\ i18n клиент берет настройки из конфига   
        \\ api - добавлен api метод для apiConfig 
        \\ eslint - убраны лишние правила
    - feat(eslint): - убрал одно правило
    - feat(utils): - executeVariable возвращает по умолчанию undefined
    - feat(route): - добавил default для routeConfig
    - feat(utils): - executeVariable для функции или булевых 
        \\ dom-utils - getScrollParent
    - feat(hapi): - вынес настройки hapi в конфиги 
        \\ увеличил объет payload файлов до 7 мб
    - bug(devtools): - бага в хроме не перезагружаются по sourcemap
    - bug(api): - отсылка файлов с неправильным content-type
    - bug(proxy): - добавил проксирование заголовков и автопарсинг json
    - bug(build): - пути исправил для динамических чанков (бага в вебпаке)
    - bug(proxy): - тесты для проксирования файлов
    - feat(error): - в client-api добавил проверку на uni-error
    - feat(build): - фиксы билда
    - bug(favicon): - favicon для ботов
    - bug(build): - подкорректировал пути до сборки ассетов, в частности dynamic chunkName 
        \\ включил возможность мокирования для прода 
        \\ почистил конфиги
    - feat(url): - add formatUrlParameter to appUrl
    - bug(titled): - очищать заголовок при didUnmount страницы
    - bug(build): - фикс require в ноде
    - feat(meta): - добавил декоратор @titled чтобы задавать заголовки для страниц 
        \\ вынес конфиги сервера, чтобы они каждый раз в лог не печатались при обновлении 
        \\ убрал ворниниги на require - отделив webpack require часть
    - bug(i18n): - создавались лишние куки для i18n 
        \\ чтобы конфиги при каждом апдейте не писались в лог
    - bug(auth): - res.unstate не работал без доп options c которым создавались
    - chore(i18n): - i18n теперь может получать локализацию через js файлы (так удобнее заполнять)
    - bug(proxy): - not parse json только для прокси 
        \\ коррекция uni-error
    - chore(proxy): - множественный methods 
        \\ убрал ручное наполнение proxy headers
    - chore(bem): - переименовал bc на bemDecorator
    - bug(proxy): - при минификации отиваливался класснайм для bem 
        \\ бага с редиректом на error page
    - bug(proxy): - pass query params сквозь mapUri
    - bug(build): - лишний метод
    - bug(build): - Object.values убрал, ибо в unix pw2 почему-то из-за этого падает
    - bug(build): - inline svg
    - bug(build): - оптимизация под прод
    - bug(build): - h2o2 проксирование в прод режиме
    - bug(build): - билд продакшена - отключил пока глючный минификатор
    - bug(build): - билд продакшена 
        \\ скрипты для демона
    - feat(logging): - вывод в зависимости от кода ответа
    - bug(error): - фикс баги в uni-error
    - bug(proxy): - проблема старой документации h2o2
    - bug(proxy): - возможность proxy от рута
    - feat(proxy): - добавил возможность wildcard 
        \\ убрал serviceUrl
    - bug(test): - починил тесты
    - feat(api): - api proxy + tests 
        \\ root favicon 
        \\ improve logging
    - bug(api): - для тестов auth моки и скипы
    - bug(api): - api client обновил 
        \\ authStrategies может возвращать не только promise
    - feat(config): - добавил в конфиги server api prefix 
        \\ мелочевка
    - feat(auth, url): - новый хелпер app-url для работы с contextPath 
        \\ добавил для сервера getLoginPath чтобы можно было точки для авторизации настриавать
    - feat(logger, auth): - для авторизации в сервере можно задать матчер какие файлы пропускать мимо авторизации \\ winston logger log теперь по умолчанию дергает info (если первым параметром не задать логлевел) \\ убрал лишнее
    - feat(template): - добавил возможность в темплейты добавлять body и head 
        \\ доп утилс
    - feat(routes): - добавил возможность вставлять роутеры после сервисных
    - chore(depen, karma): - проблема с новым реактом -> новый enzyme (который нужно настраивать), поэтому теперь используем window.enzyme в файлах
    - chore(lib): - либы тут не должно быть, почему-то неправильно отрабатывает hgignore
    - chore(react): - апгрейд до реакта 16, роутера 
        \\ хистори 3 
        \\ promise-middleware и uni-error модификация 
        \\ try-catch для ранов
    - chore(ignore): - игнор для hg не заработали
    - chore(all, front-core): - commit all front-core

## [0.2.16] - 2017.11.17
### Commits:
    - feat(route): - убрал явный запуск stub
    - chore(тесты): - явно добавил babel-polyfill для karma (чтобы не падала Object.values из ECMA 7)
    - feat(loading): - добавил к loading loaded декоратор
    - feat(loading): - добавил loading decorator и примитивный компонент
    - feat(notifications): - добавил глобальные визуальные notifications
    - chore(eslint): - eslint style
    - chore(doc): - несколько полезных README.md
    - bug(users): - по-умолчанию должны быть пустые роли
    - feat(logger): - добавил logger черезе winston (в том числе и настройку для logstash)
    - feat(mock): - добавил serverConfig.server.mocking.authMock - мокирование через USERS
        \\ eslint правки и по мелочи
    - bug(errors): - опечатка в ключе лейбла
    - bug(errors): - errors подкорректировал
        \\ исправил ошибку с ThrolableUniError
    - feat(test): - авторизационные тесты требуеют отдельного сервера, чтобы при комите не падали ошибки используйте TEST_SKIP_AUTH \ добавил env-utils
    - feat(extend, test): - оптимизация тестов - достаточно разместить у себя файл test/server/init/get-project-server-runner-class.js \ убрал лишние run-server.js
    - feat(extend, test, path): - автоматическое тестирование в дочерних проектах. Достаточно в package.json прописать "cross-env NODE_ENV=test karma start ./node_modules/@efive/front-core/test/client/run-client-tests.js"
    - bug(extend, config): - заиспользовал lorenwest/node-config для конфигов (у них webpack:compiler на require не ругается)
    - bug(extend, config): - для каждого проекта нужно вручную конфиги импортировать, чтобы были прямые ссылки в require
    - bug(extend, test): - адаптация для наследников тестов
    - feat(extend, compile): - для дочерних проектов все необзяательно, если не найдены webpack-config или webpack-context то они будут взяты из front-core / также можно на прямую использовать src и test используя es6 (добавил ignore)
    - bug(compile): - забыл про компиляцию, там тоже используется явно файл update-babelrc
    - feat(config): - вынес результирующий конфиг в <root>/.result-config.json 
        \\ разобрался с комляцией, настроил во всех входных точках использование init-babel.js 
        \\ везде кроме папки build-scripts используется es6 (дополнил .eslintrc для папок) 
        \\ почистил package.json скрипты
    - feat(config): - перенес parentConfigs 
        \\ добавил тесты для scripts и config директории
    - feat(auth): - подправили конфиги 
        \\ исправили багу что не учитывается для запуска process.env 
        \\ синхронизировал userInfo с auth сервером
    - feat(config): - вынес в отдельный раннер 
        \\ сделал наследуемые конфиги через config.server.parentConfigs 
        \\ fillBase доработал
    - bug(test): - тесты для сервера
    - feat(test): - победил karma и пробросил внутрь ее браузера конфиги для клиента 
        \\ написал собственный плагин для этого
    - feat(*): - подключил OAuth через front-core-auth сервер 
        \\ страница логина 
        \\ отключил мокирование авторизации 
        \\ тестирование авторизации на полном сервере 
        \\ dateUtils 
        \\ redux ui domains 
        \\ стили кода (в конце запятые по airbnb) 
        \\ и куча других изменений
    - feat(orm): - nextId 
        \\ найминг 
        \\ инструменты для создания селекторов
    - bug(hot-reload): - небольшой фикс перезагрузки роутов 
        \\ добавил getUser селектор (а то проблемы были если пустой юзер при отключенной проверки авторизации)
    - feat(models): - подключил redux-orm для связей
        \\ изменил способ подключения редьюсеров через require 
        \\ сервер index page теперь питается ClientRunner
    - bug(plugin-api): - универсальный parseResponseHandler для моков и api-plugin
    - bug(*): - changeUser + MOCK - ListItem - для перебора элементов без bind на handler - проблема с куками для csrf атак - фикс i18n начальный язык мануально насильственно проставляется - фикс hot-reload
    - bug(webpack): - бага в ExtractTextPlugin - обновил ее и webpack@3.5.0
    - feat(webpack): - вынес отдельно vendors.css
    - bug(build): - фикс build 
        \\ добавил метод для указания hot reload путей
    - feat(mock): - добавил mock-utils 
        \\ userInfo.avatar
    - bug(config): - в карму невозможно ничего передать, пока зашил config руками
    - bug(config): - конфиги нужно генерить и для тестов тоже
    - feat(propsType): - добавил ACTION_STATUS
    - bug(i18n): - не проставлялся язык, если куки были пусты 
        \\ подцепил bem конфиги
    - bug(auth): - вынес авторизацию в раздел фич 
        \\ баги с auth permissions \\ добавил send-api-request
    - bug(config): - неправильное использование merge
    - feat(config): - config компилится в .build/app-config.json и этот путь должен указываться в env CONFIG_PATH при запуске сервера
    - bug(config): - заменил глючную библиотеку deep-assign 
        \\ добавил загрузку общего конфига через папку текущего проекта (а не Коры)
    - feat(api): - адаптировал api-client для вызова с клиента 
        \\ добавил защиту от csrf атаки
    - chore(config): - вынес объединение конфигов на уровень webpack (до сервера) 
        \\ теперь на сервере конфиги сразу инициализируются 
        \\ добавил parentConfigs для указание папки родительских конфигов 
        \\ фиксы по мелочи
    - feat(bem): - убрал лишний функционал оборачивания, теперь всегда возвращается стринга при this.bem
    - bug(webpack): - доступ по cors для hot reload (разные порты были из-за двух серверов во время ДЕВ режима)
    - bug(css): - опустил библиотеки до версии postcss@5 так как на 6 версии не работает postcss-bemed (просто пустоту в тегах выдает)
    - bug(test): - переименование название блоков в css как название компонентов в js (c большой буквы и слитно)
    - feat(bem): - проблема компилирования postcss (разные версии) 
        \\ компиляция bem в postcss 
        \\ webpack не показывал ошибки компиляции 
        \\ небольшие баги
    - chore (webpack): - фиксы плагинов для вебпака
    - chore (babel): - решил проблема с babel - теперь если он нужен его нужно сгенерировать из конфигов
    - небольшие фиксы либы
    - chore(build): - скрипт для синхронизации рабочего бранча и мастера 
        \\ а также для паблиша новой версии после фаст форвард мержа
    - chore(mocking): - проброс query параметров для мок урлов
    - chore(mocking): - провязка через cookie и url
    - chore(mocking): - тестирование серверной части 
        \\ основной механизм мокирование запросов на сервер
    - chore(unittest): - тестирование async функций
        \\ хелперы для тестирования redux 
        \\ бага с chai-as-promise
    - chore(i18n): - более прозрачные единый метод для инициализации i18n
    - chore(unittest): - фикс enzyme
    - chore(unittest): - exist фикс + тесты перед версией
    - chore(unittest): - основные механизмы для подключения тестирования через mocha + chai + enzyme
    - chore(I18N): - смена заголовка страницы при изменении страниц и локали 
        \\ remount при изменении локали
    - chore(I18N): - локализация для стаб страницы
    - chore(bem): - переименовал для уникальности
    - chore(*) подключение через link и alias на front-core для дочерних компонентов
        \\ добавил в паблиш файлы не js
    - chore(unitest) Подготовка к publish
    - chore(localization) CORE: Локализация приложения
        \\ конфигурация для i18n в конфигах 
        \\ тест на странице 
        \\ react нежесткая завесимость 
        \\ многочисленные фиксы
    - chore(webpack) CORE: переезд на webpack 3.0
    - chore(webpack) CORE: переезд на webpack 2.0 - фиксы для дочерних проектов
    - chore(webpack) CORE: переезд на webpack 2.0
    - chore(webpack): - добавил less-loader 
        \\ вынес в babel-loader 
        \\ упростил создание и расширение webpack config
    - chore(webpack): - система плагинов + less loader - окончание
    - chore(*): - работу с текущем package.json вынес
    - chore(*): - front-core init

<!--
[Unreleased]: https://github.com/olivierlacan/keep-a-changelog/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.3.0...v1.0.0
[0.3.0]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.0.8...v0.1.0
[0.0.8]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.0.1...v0.0.2
-->
