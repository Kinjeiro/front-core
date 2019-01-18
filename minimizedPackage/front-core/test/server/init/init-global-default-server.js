const { tryLoadProjectFile } = require('../../../build-scripts/utils/require-utils');

/*
 @NOTE: добавим в глобальные переменные инстанс, чтобы не получать его каждый раз + в концу можно сделать server.close.
 Хотя мока сама это уже делает, но пусть будет.
 */
let defaultServer = null;

global.getDefaultServer = async () => {
  if (!defaultServer) {
    // загружаем только при необходимости

    // ОПЦИОНАЛЬНО (можно и не использовать, это для удобства)
    // Получаем класс сервер раннера после того как все было проинициализировано (так как внутри много импортов, а внутри могут быть статики от рута, которые используют конфиги или локализцию сразу при загрузке файла)
    // tryLoadProjectFile - чтобы вначале искал в текущем проекте, если не найдет то брал из корного
    const ProjectServerRunnerClass = tryLoadProjectFile('test/server/init/get-project-server-runner-class');
    if (ProjectServerRunnerClass) {
      const serverRunner = new ProjectServerRunnerClass();
      await serverRunner.run();
      defaultServer = serverRunner.server;
    }
  }
  return defaultServer;
};
