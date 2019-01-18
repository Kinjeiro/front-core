const {
  extendDeep,
  loadFileConfigs
} = require('config/lib/util');

// чтобы не было конликтов между версиями config пакета и нашего форканутого, просто сделаем проксирование методов
module.exports = {
  extendDeep,
  loadFileConfigs
};
