import {
  joinPath,
  parseUrlParameters,
  formatUrlParameters,
  updateUrl,
} from './uri-utils';

describe('uri-utils', () => {
  describe('[function] formatUrlParameters', () => {
    it('should format simple', () => {
      const params = {
        itemsPerPage: 10,
        testArray: [10, 20],
      };

      expect(formatUrlParameters(params)).to.be.equal('itemsPerPage=10&testArray=10&testArray=20');
    });
    it('should format inner object params', () => {
      const params = {
        itemsPerPage: 10,
        filters: {
          user: 'ivanovI',
        },
        testArray: [10, 20],
      };

      expect(formatUrlParameters(params)).to.be.equal('itemsPerPage=10&filters%5Buser%5D=ivanovI&testArray=10&testArray=20');
    });
  });

  describe('[function] joinPath', () => {
    it('should return valid relative url', () => {
      expect(joinPath('/api/', '/api2/', 'api3/', { test: 'test' }))
        .to.be.equal('/api/api2/api3/?test=test');
    });
    it('should return valid relative url with null last param', () => {
      expect(joinPath('api/', '/api2/', '', null))
        .to.be.equal('/api/api2/');
    });
    it('should return valid relative url with menu slashes', () => {
      expect(joinPath('/', '/api/attachments'))
        .to.be.equal('/api/attachments');
    });
    it('should return valid relative url with menu slashes 2', () => {
      expect(joinPath('api', '/'))
        .to.be.equal('/api/');
    });
    it('should return valid relative url with menu slashes 3', () => {
      expect(joinPath('/', 'api', '/', '/attachments'))
        .to.be.equal('/api/attachments');
    });
    it('should return valid relative url null args', () => {
      expect(joinPath(null))
        .to.be.equal('/');
    });
    it('should return valid absolute url', () => {
      expect(joinPath('http://test.com/', 'api', '/api2', { test: 'test' }))
        .to.be.equal('http://test.com/api/api2?test=test');
    });
    it('should return valid absolute url with parameters and without middle part', () => {
      expect(joinPath('http://test.com', { test: 'test' }))
        .to.be.equal('http://test.com?test=test');
    });
  });

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


  describe('[function] updateUrl', () => {
    it('should update exist params', () => {
      const url = 'http://test.domain.com/test?param1=1&param2=2';
      expect(updateUrl(url, { param2: '22', param3: '3' }))
        .to.be.equal('http://test.domain.com/test?param1=1&param2=22&param3=3');
    });
    it('should update without search', () => {
      const url = 'http://test.domain.com/test';
      expect(updateUrl(url, { param2: '22', param3: '3' }))
        .to.be.equal('http://test.domain.com/test?param2=22&param3=3');
    });

    it('should replace array params', () => {
      const url = 'test?var1=11&var1=12&var1=13&var2=2';
      expect(updateUrl(url, { var1: ['13', '14'] }))
        .to.be.equal('test?var1=13&var1=14&var2=2');
    });
    it('should merge array params', () => {
      const url = 'test?var1=11&var1=12&var1=13&var2=2';
      expect(updateUrl(url, { var1: ['13', '14'] }, true))
        .to.be.equal('test?var1=11&var1=12&var1=13&var1=14&var2=2');
    });


    it('should replace object params', () => {
      const url = 'http://localhost:8080/api/products?meta%5Bsearch%5D&meta%5BstartPage%5D=0&meta%5BitemsPerPage%5D=10&filters%5Btype%5D=goods';
      expect(
        updateUrl(
          url,
          {
            // filters: {
            //   type: 'goods',
            // },
            meta: {
              // search: null,
              startPage: '10',
              // itemsPerPage: '10',
            },
          },
        ),
      ).to.be.equal('http://localhost:8080/api/products?filters%5Btype%5D=goods&meta%5BstartPage%5D=10');
    });
    it('should merge object params', () => {
      const url = 'http://localhost:8080/api/products?meta%5Bsearch%5D&meta%5BstartPage%5D=0&meta%5BitemsPerPage%5D=10&filters%5Btype%5D=goods';
      expect(
        updateUrl(
          url,
          {
            // filters: {
            //   type: 'goods',
            // },
            meta: {
              // search: null,
              startPage: '10',
              // itemsPerPage: '10',
            },
          },
          true,
        ),
      ).to.be.equal('http://localhost:8080/api/products?filters%5Btype%5D=goods&meta%5BitemsPerPage%5D=10&meta%5Bsearch%5D&meta%5BstartPage%5D=10');
    });
  });
});
