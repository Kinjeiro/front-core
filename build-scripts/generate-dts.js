const path = require('path');
const fs = require('fs');
const glob = require('glob');
const react2dts = require('react-to-typescript-definitions');

const basedir = path.join(process.cwd(), 'lib');
const paths = [
  '/common/components/**/*.js',
  '/common/containers/**/*.js'
  // '/common/models/**/*.js'
];

// todo @ANKU @LOW - если компилить через lib то он везде проставляет any везде, если через src - нужно декораторы абсолютно все переделывать + незаглядывает в наследуемые propTypes так как анализирует строчки в файле
function generateDts() {
  paths.forEach((globRegexp) => {
    // https://github.com/isaacs/node-glob#options - options is optional
    glob(`${basedir}${globRegexp}`, /* options, */(er, files) => {
      // files is an array of filenames.
      // If the `nonull` option is set, and nothing
      // was found, then files is ["**/*.js"]
      // er is an error object or null.
      files.forEach(file => {
        try {
          if (!/\.test\./gi.test(file)) {
            const contentDts = react2dts.generateFromFile(undefined, file);
            fs.writeFileSync(
              file.replace(/\.js(x)?$/gi, '.d.ts'),
              contentDts
            );
          }
        } catch (error) {
          console.error('generateDts', file, error);
        }
      });
    });
  });
}

generateDts();
