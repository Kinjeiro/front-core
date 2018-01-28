import url from 'url';

import { setRequestData } from './hapi-utils';

describe('(Utils) hapi-utils', () => {
  describe('(method) setRequestData', () => {
    it('should correct set query params', async function test() {
      // const testUrl = 'http://example.opa.com/path1/path2/?query1=value1&query2=value2#hash1';
      const testRelativeUrl = '/path1/path2/?query1=value1&query2=value2#hash1';
      const requestOptions = setRequestData({
        url: testRelativeUrl,
      }, {
        testQuery: 'testValue',
      });

      expect(requestOptions.url).to.be.a('string');

      const urlObj = url.parse(requestOptions.url, true);
      // old correct
      expect(urlObj.pathname).to.equal('/path1/path2/');
      expect(urlObj.query).to.include({ query1: 'value1' });
      expect(urlObj.hash).to.equal('#hash1');

      // new set
      expect(urlObj.query).to.include({ testQuery: 'testValue' });
    });
  });
});
