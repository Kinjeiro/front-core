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
    it('should parse object in query params', () => {
      const url = 'http://localhost:8080/api/products?type=products&meta%5Bsearch%5D&meta%5BstartPage%5D=0&meta%5BitemsPerPage%5D=10&meta%5BsortBy%5D&meta%5BsortDesc%5D=true&meta%5Btotal%5D&filters%5Btype%5D=goods';
      expect(parseUrlParameters(url)).to.be.deep.equal({
        filters: {
          type: 'goods',
        },
        meta: {
          itemsPerPage: '10',
          search: null,
          sortBy: null,
          sortDesc: 'true',
          startPage: '0',
          total: null,
        },
        type: 'products',
      });
    });
  });
});
