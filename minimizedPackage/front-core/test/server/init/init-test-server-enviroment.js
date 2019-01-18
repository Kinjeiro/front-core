/* eslint-disable global-require */
import chai from 'chai';
import sinon from 'sinon';
import dirtyChai from 'dirty-chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import ignoreStyles, { DEFAULT_EXTENSIONS } from 'ignore-styles';

process.on('unhandledRejection', error => {
  console.error('unhandledRejection', error);
});

// при запуске серверных тестов с мокой, игнорируем все не js (css \ ejs и так далее)
ignoreStyles([...DEFAULT_EXTENSIONS, '.ejs']);

// ======================================================
// Mocha / Chai
// ======================================================
// Тестим через expect чтобы не загрязнять Object.prototype дополнительными should конструкциями
// chai.should();

// ======================================================
// Chai Plugins
// ======================================================
chai.use(dirtyChai);
chai.use(chaiAsPromised);
chai.use(sinonChai);

// ======================================================
// Globals
// ======================================================
global.chai = chai;
global.expect = chai.expect;
global.sinon = sinon;
