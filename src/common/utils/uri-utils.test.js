import {
  parseUrlParameters,
  formatUrlParameters,
} from './uri-utils';

describe('uri-utils', () => {
  describe('[function] parseUrlParameters', () => {
    it('should parse array variables correct', () => {
      const url = 'test?var2[]=21&var3[]=31&var3[]=32&var4=4';
      expect(parseUrlParameters(url)).to.be.deep.equal({
        var2: ['21'],
        var3: ['31', '32'],
        var4: '4',
      });
    });
    it('should parse array variables correct', () => {
      const url = 'test?var1=1&var1=2&var1=3&var4=4';
      expect(parseUrlParameters(url)).to.be.deep.equal({
        var1: ['1', '2', '3'],
        var4: '4',
      });
    });
  });
});
