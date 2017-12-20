import {
  appUrl,
} from './app-urls';

describe('app-urls', () => {
  describe('[function] appUrl', () => {
    it('should parse simple', () => {
      const url = appUrl('opa1/', '/', '/', '/opa2', 'opa3');
      expect(url).to.be.deep.equal('/opa1/opa2/opa3');
    });
    it('should parse with last url parameters', () => {
      const url = appUrl('opa1', 'opa2', 'opa3', {
        param1: 'value1&',
        paramArray: ['a1', 'a2']
      });
      expect(url).to.be.deep.equal('/opa1/opa2/opa3?param1=value1%26&paramArray=a1&paramArray=a2');
    });
  });
});
