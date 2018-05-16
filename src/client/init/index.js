import initClientConfig from './init-client-config';

export default async function initAll() {
  await initClientConfig();

  // только после того как все подгрузили, запускаем остальные процессы

  // инициалзиция локализации
  require('./init-client-i18n').default;
}
