/* eslint-disable no-console,no-param-reassign */


/*
 https://tools.ietf.org/html/rfc5424
 {
   error: 0,
   warn: 1,
   info: 2,
   verbose: 3,
   debug: 4,
   silly: 5
 }
*/
export default class UniLogger {
  error(...other) {
    console.error(...other);
  }
  warn(...other) {
    console.warn(...other);
  }
  info(...other) {
    console.info(...other);
  }
  verbose(...other) {
    this.log(...other);
  }
  debug(...other) {
    this.log(...other);
  }
  silly(...other) {
    this.log(...other);
  }


  log(first, ...other) {
    // todo @ANKU @LOW @BUG_OUT @node - console - если первым параметром идет объект, он перестается энтерпретировать перевод карретки \n. Приходится ставить первым параметром пустую строчку
    // console.log(object, '\n\n');
    // console.log('', object, '\n\n');

    if (typeof first !== 'string') {
      console.log('', first, ...other);
    } else {
      console.log(first, ...other);
    }
  }
}
