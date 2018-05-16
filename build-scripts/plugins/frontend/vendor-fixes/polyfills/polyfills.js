var ObjectIs = require('object-is');
var ObjectAssign = require('es6-object-assign');
var ArrayFind = require('array.prototype.find');
var ArrayFrom = require('array-from');
require('array.prototype.fill');
require('ima-babel6-polyfill'); // fix super constructor call for ie < 10, see https://phabricator.babeljs.io/T3041
require('core-js');

require('es6-promise');
require('es6-weak-map'); // for autobind from core-decorators
require('es6-set/implement');
require('es6-map/implement');
require('es6-promise').polyfill();

/*
 "core-js": "^2.4.1",
 "object-is": "^1.0.1",
 "es6-map": "^0.1.4",
 "es6-set": "^0.1.4",
 "es6-object-assign": "^1.0.1",
 "es6-weak-map": "^2.0.1",
 "es6-promise": "^3.3.1",
 "array-from": "^2.1.1",
 "array.prototype.fill": "^1.0.1",
 "array.prototype.find": "^2.0.0",
 "ima-babel6-polyfill": "^0.12.0",
 "matches-selector-polyfill": "^1.0.0",
 "matchmedia-polyfill": "^0.3.0",
 "raf": "^3.3.0",
 "classlist-polyfill": "^1.0.3",
*/
if (typeof window !== 'undefined') {
  require('matches-selector-polyfill/dist/matches-selector-polyfill.js');
  require('matchmedia-polyfill'); // window.matchMedia polyfill for ie 9
  require('matchmedia-polyfill/matchMedia.addListener.js'); // addListener polyfill for ie 9
  require('raf').polyfill(); // window.requestAnimationFrame for ie < 10 & android 4.0..4.3

  if ('performance' in window === false) {
    window.performance = {};
  }

    // ie 9 has window.performance, but not window.performance.now
  if ('now' in window.performance === false) {
    window.performance.now = require('performance-now');
  }

  require('classlist-polyfill');
}

if (!Object.assign) {
  ObjectAssign.polyfill();
}

if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: ArrayFind.getPolyfill()
  });
}

if (!Object.is) {
  Object.is = ObjectIs;
}

if (!Array.from) {
  Array.from = ArrayFrom;
}

require('whatwg-fetch');

require('./promise-finally-polyfill');
