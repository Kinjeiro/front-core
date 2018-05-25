import initClientConfig from './init-client-config';

export default async function initAll() {
  await initClientConfig();

  // только после того как все подгрузили, запускаем остальные процессы

  // инициалзиция локализации
  const i18next = require('./init-client-i18n').default;

  await new Promise((resolve, reject) => {
    // первая загрузка
    i18next.on('languageChanged', (lng) => {
      resolve();
    });
  });
}
