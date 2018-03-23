## Оглавление
* [Конечная структура](#structure)
* [Client api](#api)
* [Client redux](#redux)
* [Client Container](#container)
* [Client router](#router)
* [Server api mock](#api_mock)
* [Server proxy](#proxy)

## Конечная структура

```
Project
├── src                         
│   └── common                  
│      └── api/                 
│         └── api-testUnits.js              // апи для наших запросов, которые мы будем использовать для мокирования
│      └── app-redux            
│         └── reducers          
│            └── root.js                    // добавим редьюсер testUtilsPage от рута        
│            └── testUtils-page.js          // модуль с редьюсером и actions (использующих api-testUtils.js)
│         └── selectors.js                  // методы для получения данных о testUtilsPage
│      └── containers          
│         └── TestUtils
│            └── TestUtils.jsx              // Главный контейнер, который в connect через selectors.js получит данные из стора
                                              и из редьюсера testUtils-page.js подключит экшены
│            └── TestUtils.scss             // Стили для нашего контейнера
│      └── create-routes.jsx                // добавим роутинг, чтобы можно было перейти на эту страницу
│      └── menu.js                          // добавим пункт меню о наших testUnits
│      └── routes.pathes.js                 // определим функции полного пути для testUtils
│   └── server                  
│      └── plugins              
│         └── api               
│            └── mock                           
│               └── index.js                // добавим новый мок mock-api-testUtils           
│               └── mock-api-testUtils.js   // мокирование, небольшая статическа выборка
│            └── index.js                   // добавим функцию проксирования на мидл
└── static                          
    └── i18n\ru\project.js                  // локализация для контейнера          
```

## Client api
./src/common/api/api-testUnits.js
```javascript
// api-config - это элементаный формат записи куда апи посылается { path, method }
import apiConfig from '@reagentum/front-core/lib/common/utils/create-api-config';

// используем обертку на BaseApiClient, чтобы можно было если что расширить его сериализаторы
import apiClient from '../utils/api-client'; 

// уникальный префикс позволяету добно проксировать на мидл
export const API_PREFIX = 'testUnits';
// экспорт мапы апи конфигов позволяет удобно мокать запросы. Идет связь не по стринговым строкам, а по объектам
export const API_CONFIGS = {
  loadTestUnits: apiConfig(`/${API_PREFIX}`, 'GET'),

  createTestUnit: apiConfig(`/${API_PREFIX}`, 'POST'),
  // {id} - корный apiClient поддерживает вставку данных в url path 
  deleteTestUnit: apiConfig(`/${API_PREFIX}/{id}`, 'DELETE'),
  loadTestUnit: apiConfig(`/${API_PREFIX}/{id}`, 'GET'),
  // обычно частичное редактирование данных объекта происходят по протоколу json patch - http://jsonpatch.com/
  // (PUT используется только для полной замены объекта)
  // если необходимо вместо индексов передать id объектов, то можно включить доп настройку в options при создании инстанса BaseApiClient: 
  // { usePatchByItemId: true }
  // и подавать в operation помимо 'path', 'value', 'op' еще и 'itemIds' (массив или сингл, если один айди только)  
  editTestUnit: apiConfig(`/${API_PREFIX}/{id}`, 'PATCH'),
};

// обычно найминг api<название api конфига>
export function apiLoadTestUnits(type, meta = null, filters = null) {
  // вызов инстанса BaseApiClient с методом api (на вход принимает apiConfig), вторым параметром идут данные, в зависимости от типа GET \ POST он либо отправит их как queryParams либо как data в теле запроса
  return apiClient.api(API_CONFIGS.loadTestUnits, {
    type,
    meta,
    filters,
  });
}

export function apiCreateTestUnit(data) {
  return apiClient.api(API_CONFIGS.createTestUnit, data);
}
export function apiLoadTestUnit(id) {
  return apiClient.api(API_CONFIGS.loadTestUnit, null, { pathParams: { id } });
}
export function apiEditTestUnit(id, patchOperations) {
  return apiClient.api(API_CONFIGS.editTestUnit, patchOperations, { pathParams: { id } });
}
```
