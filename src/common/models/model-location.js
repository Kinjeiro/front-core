import PropTypes from 'prop-types';

/*
 History
 https://github.com/ReactTraining/history/blob/v3/docs/Glossary.md#locationdescriptor

 type LocationDescriptorObject = {
   pathname: Pathname;
   search: Search;
   query: Query;
   state: LocationState;
 };

 type LocationDescriptor = LocationDescriptorObject | Path;



  Свойства объекта Location
  Все следующие свойства являются строками.
  Колонка "Пример" содержит их значения для URL:

  http://www.google.com:80/search?q=javascript#test

  Свойство	Пример                                              Описание
  hash	    #test                                               часть URL, которая идет после символа решетки '#', включая символ '#'
  host	    www.google.com:80                                   хост и порт
  href	    http://www.google.com:80/search?q=javascript#test   весь URL
  hostname	www.google.com                                      хост (без порта)
  pathname  /search                                             строка пути (относительно хоста)
  port	    80                                                  номер порта
  protocol	http:                                               протокол
  search	  ?q=javascript                                       часть адреса после символа ?, включая символ ?

  В Firefox есть баг: если hash-компонент адреса содержит закодированные (см. encodeURIComponent) символы, свойство hash возвращает раскодированный компонент. Например, вместо %20 будет пробел и т.п. Другие браузеры ведут себя корректно и не раскодируют hash.
*/

export const LOCATION_OBJECT_PROP_TYPE_MAP = {
  pathname: PropTypes.string,
  search: PropTypes.string,
  query: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  state: PropTypes.object,
};

export const LOCATION_PROP_TYPE = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape(LOCATION_OBJECT_PROP_TYPE_MAP),
]);

export default LOCATION_PROP_TYPE;
