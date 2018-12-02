const factoryPluginLibLink = require('./factory-plugin-lib-link');

/*
  Для подключения в дочерних проектах
  + можно переключать с lib на src, если проект на npm-link

 Before:
  import run from '@igs/front-core/src/client/run-client';
 After:
  import run from 'front-core/client/run-client';
*/
module.exports = factoryPluginLibLink('front-core', { scoped: '@igs', filesDir: 'src' });
