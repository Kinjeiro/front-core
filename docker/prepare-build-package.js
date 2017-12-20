/**
 *  Создает файл tmp-package.json,
 *  который используется для установки зависимостей в build-контейнере.
 *
 *  1. Фиксирует версию проекта, чтобы package.json
 *     разных сборок совпадал и докер использовал кэш.
 *  2. Вырезает из package.json все зависимости для тестирования,
 *     они не нужны для сборки, PhantomJS ставится долго.
 */

var fs = require('fs');
var packages = require('./../package.json');

function isTestDependency(dependency) {
    return !!dependency.match(/chai|karma|lint|mocha/ig);
}

function removeTestDependensies(deps) {
    var result = {};
    var key;
    for (key in deps) {
        if (!isTestDependency(key)) {
            result[key] = deps[key];
        }
    }

    return result;
}

// проставляем фейковую версию
packages.version = '99.0.0';
packages.dependencies = removeTestDependensies(packages.dependencies);
packages.devDependencies = removeTestDependensies(packages.devDependencies);

// не забываем что процесс запущен из-под рутовой директории (2 пробела - comma trailing)
fs.writeFileSync('./docker/tmp-package.json', JSON.stringify(packages, null, 2));
