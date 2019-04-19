const {
  extendDeep,
  loadFileConfigs
} = require('config/lib/util');


function loadFileConfigsWrapper(...args) {
  try {
    return loadFileConfigs(...args);
  } catch (error) {
    console.warn('Error while reading loadFileConfigs\n', error);
    return {};
  }
}

// чтобы не было конликтов между версиями config пакета и нашего форканутого, просто сделаем проксирование методов
module.exports = {
  extendDeep,
  loadFileConfigs: loadFileConfigsWrapper
};
