import config from '../client-config';

// import {
//   appUrl,
//   // cutContextPath,
// } from './app-urls';

let fakeContextRoot = '';
Object.defineProperty(
  config.common.app,
  'contextRoot',
  {
    get() {
      return fakeContextRoot;
    },
  },
);

describe('app-urls', () => {
  describe('[function] appUrl', () => {
    let appUrl;
    beforeEach(() => {
      fakeContextRoot = '';
      appUrl = require('./app-urls').appUrl;
    });

    it('should parse simple', () => {
      fakeContextRoot = 'testContextPath';
      const url = appUrl('opa1/', '/', '/', '/opa2', 'opa3');
      expect(url).to.be.deep.equal('/testContextPath/opa1/opa2/opa3');
    });
    it('should parse with last url parameters', () => {
      fakeContextRoot = 'testContextPath2';
      const url = appUrl('opa1', 'opa2', 'opa3', {
        param1: 'value1&',
        paramArray: ['a1', 'a2'],
      });
      expect(url).to.be.deep.equal('/testContextPath2/opa1/opa2/opa3?param1=value1%26&paramArray=a1&paramArray=a2');
    });
  });

  describe('[function] cutContextPath', () => {
    let cutContextPath;
    beforeEach(() => {
      fakeContextRoot = '';
      cutContextPath = require('./app-urls').cutContextPath;
    });

    it('should cut while contextPath without slash', () => {
      fakeContextRoot = 'contextPath';
      const url = '/contextPath/test1';
      expect(cutContextPath(url))
        .to.be.deep.equal('/test1');
    });
    it('should cut while contextPath with slash', () => {
      fakeContextRoot = '/contextPath';
      const url = '/contextPath/test1';
      expect(cutContextPath(url))
        .to.be.deep.equal('/test1');
    });
    it('should cut while contextPath is slash', () => {
      fakeContextRoot = '/';
      const url = '/test1';
      expect(cutContextPath(url))
        .to.be.deep.equal('/test1');
    });
    it('should cut while contextPath is empty', () => {
      fakeContextRoot = '';
      const url = '/test1';
      expect(cutContextPath(url))
        .to.be.deep.equal('/test1');
    });
  });
});
