// const babelOptions = require('../.babelrc');

/*
ЗАДАЧА:
необходимо скомпилировать всю директорию перед npm publish
+ зафискировать позицию файла .babelrc чтобы унаследуемые пакеты не думали об этом
НО .babelrc берется каждый раз относительно проекта
*/


/*
 НЕ ПОДХОДИТ
 1) Компилирует только код или один файл

 require('babel-core').transform('code', Object.assign(
 {},
 babelOptions,
 {

 }
 ));

*/

/*
НЕ ПОДХОДИТ
2) Babel-cli работает ТОЛЬКО из консоли, и там нельзя задать явно откудать барть .babelrc
(он берет его из рута/.babelrc) либо придется подавать все перечислять в --plugins
https://babeljs.io/docs/usage/api/#options
+ это незадокументированное использование

 require("babel-cli/lib/babel/dir")(
 {
 outDir: 'lib'
 },
 [glob.sync('src')]
 );

*/

/*
 НЕ ПОДХОДИТ
3) запускать как процесс - не получится options для плагинов прописать

 const sourceDir = path.resolve(PACKAGES_SRC_DIR, packageName)
 const outDir = path.resolve(PACKAGES_OUT_DIR, packageName)

 log('Cleaning destination directory...')
 rm('-rf', outDir)

 log('Compiling source files...')

 const sourceFiles = glob
 .sync(`${sourceDir}/**   /*.js`, {
    ignore: `${sourceDir}/node_modules/**          /*.js`,
 })
 .map(to => path.relative(sourceDir, to))

 exec(
 `cd ${sourceDir} && ` +
 'cross-env BABEL_ENV=cjs ' +
 `${path.resolve(BIN)}/babel ${sourceFiles.join(' ')} ` +
 `--out-dir ${path.resolve(outDir)}`
 )
*/

/*
ВЫВОД - будем использовать babel-cli а все проекты будут копировать себе .babelrc

// todo @ANKU @LOW - искать выходы
*/

