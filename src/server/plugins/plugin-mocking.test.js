import Cookie from 'cookie';

import {
  simpleServer,
  proceedRequest,
} from '../../test/server/test-server-utils';

import mockingPlugin, {
  validateRoutePath,
  getRequestPath,
} from './plugin-mocking';

describe('(Plugin) Mocking', () => {
  describe('Mocking utils', () => {
    describe('(method) getRequestPath', () => {
      it('should return correct url with mock', () => {
        const mockedUrl = getRequestPath(
          '/testmock',
          {
            mocksRouteBase: 'mockBase',
          },
          true,
        );

        expect(mockedUrl).to.equals('/mockBase/testmock');
      });

      it('should return mocked url with correct apiPrefix', () => {
        const mockedUrl = getRequestPath(
          '/api/testApiMethod/{user}',
          {
            apiPrefix: 'api',
            mocksRouteBase: 'mockBase',
          },
          true,
        );

        expect(mockedUrl).to.equals('/api/mockBase/testApiMethod/{user}');
      });

      it('should return real url from mocked url', () => {
        const mockedUrl = getRequestPath(
          '/api/mockBase/testApiMethod/{user}',
          {
            apiPrefix: 'api',
            mocksRouteBase: 'mockBase',
          },
          false,
        );

        expect(mockedUrl).to.equals('/api/testApiMethod/{user}');
      });
    });

    describe('(method) validateRoutePath', () => {
      let request;
      beforeEach(() => {
        request = {
          // todo @ANKU @CRIT @MAIN - может попробовать оригинальный request
          path: '/api/testUrl/opa/value1',
          method: 'GET',
          params: {
            pathParam1: 'value1',
          },
          query: {
            queryParam1: 'qValue1',
            queryParam2: ['qValue21', 'qValue22', 'qValue23'],
          },
        };
      });

      it('should catch request url', () => {
        const result = validateRoutePath(
          request,
          '/api/testUrl/opa/{pathParam1}',
        );

        expect(result).to.be.true;
      });

      it('should catch request url with specified path params', () => {
        let result = validateRoutePath(
          request,
          '/api/testUrl/opa/{pathParam1}',
          {
            mockFilterConditions: {
              pathParams: {
                pathParam1: 'value1',
              },
            },
          },
        );

        expect(result).to.be.true;

        result = validateRoutePath(
          request,
          '/api/testUrl/opa/{pathParam1}',
          {
            mockFilterConditions: {
              pathParams: {
                pathParam1: 'value2',
              },
            },
          },
        );

        expect(result).to.be.false;
      });

      it('should catch request url with specified query params', () => {
        let result = validateRoutePath(
          request,
          '/api/testUrl/opa/{pathParam1}',
          {
            mockFilterConditions: {
              queryParams: {
                queryParam1: 'qValue1',
                queryParam2: () => ['qValue21', 'qValue22'],
              },
            },
          },
        );
        expect(result).to.be.true;

        result = validateRoutePath(
          request,
          '/api/testUrl/opa/{pathParam1}',
          {
            mockFilterConditions: {
              queryParams: {
                queryParam2: () => 'qValue21',
              },
            },
          },
        );
        expect(result).to.be.true;

        result = validateRoutePath(
          request,
          '/api/testUrl/opa/{pathParam1}',
          {
            mockFilterConditions: {
              queryParams: {
                queryParam2: () => 'qValue21',
                queryParam3: () => 'qValue33',
              },
            },
          },
        );
        expect(result).to.be.false;
      });

      // todo @ANKU @CRIT @MAIN - check regexp
    });
  });

  describe('Request mocking', () => {
    let routes;
    let server;
    const apiPrefix = 'api';
    let testRequest;
    let testRequestMethod;

    beforeEach(() => {
      routes = [
        {
          method: 'GET',
          path: '/anyService/{pathParam1}/{pathParam2}',
          handler: (request, reply) => reply('This is real'),
        },
        {
          method: 'GET',
          path: `/${apiPrefix}/anyService`,
          handler: (request, reply) => reply('This is real'),
        },
      ];

      testRequest = {
        method: 'GET',
        url: '/anyService/pathValue1/path-value-2?query1=value11&query1=value12',
      };

      testRequestMethod = (mockingOptions, request = testRequest) => {
        server = simpleServer({
          register: mockingPlugin,
          options: {
            enable: true,
            useMocks: true,
            ...mockingOptions,
          },
        }, routes);

        return proceedRequest(request, server);
      };
    });

    it('should mocked request', () => {
      return testRequestMethod({
        mockRoutes: [
          {
            method: routes[0].method,
            path: routes[0].path,
            handler: (request, reply) => reply('This is mock'),
          },
        ],
      })
        .then((response) => expect(response.payload).to.equal('This is mock'));
    });

    it('should mocked request with specified path params', () => {
      return testRequestMethod({
        mockRoutes: [
          {
            // common route
            method: routes[0].method,
            path: routes[0].path,
            handler: (request, reply) => reply('This is mock'),

            mockFilterConditions: {
              pathParams: {
                pathParam2: 'path-value-2',
              },
            },
          },
        ],
      })
        .then((response) => expect(response.payload).to.equal('This is mock'));
    });
    it('should not mocked request with specified path params', () => {
      return testRequestMethod({
        mockRoutes: [
          {
            method: routes[0].method,
            path: routes[0].path,
            handler: (request, reply) => reply('This is mock'),
            mockFilterConditions: {
              pathParams: {
                pathParam2: 'pathValue2',
              },
            },
          },
        ],
      })
        .then((response) => expect(response.payload).to.equal('This is real'));
    });


    it('should not mocked request with specified query params', () => {
      return testRequestMethod({
        mockRoutes: [
          {
            method: routes[0].method,
            path: routes[0].path,
            handler: (request, reply) => reply('This is mock'),
            mockFilterConditions: {
              queryParams: {
                query1: () => ['value11'],
              },
            },
          },
        ],
      })
        .then((response) => {
          expect(response.payload).to.equal('This is mock');
          // урл параметры пробрасываются в мок роут
          expect(response.request.query.query1).to.deep.equal(['value11', 'value12']);
        })
        .then(() => testRequestMethod({
          mockRoutes: [
            {
              method: routes[0].method,
              path: routes[0].path,
              handler: (request, reply) => reply('This is mock'),
              mockFilterConditions: {
                queryParams: {
                  queryWrong: () => ['value11'],
                },
              },
            },
          ],
        }))
        .then((response) => expect(response.payload).to.equal('This is real'));
    });



    it('should mock request with api prefix', async function test() {
      const response = await testRequestMethod(
        {
          apiPrefix,
          mockRoutes: [
            {
              method: routes[1].method,
              path: routes[1].path,
              handler: (request, reply) => reply('This is mock'),
            },
          ],
        },
        {
          method: routes[1].method,
          url: routes[1].path,
        },
      );
      expect(response.payload).to.equal('This is mock');
    });
  });

  describe('Mocking options', () => {
    let route;
    let server;
    let request;
    let urlParamForEnableMocking;
    let cookieEnableMocking;

    beforeEach(() => {
      route = {
        method: 'get',
        path: '/testRoute',
        handler: (request, reply) => reply('This is real'),
      };
      urlParamForEnableMocking = 'mock2';
      cookieEnableMocking = 'app-mocking2';

      request = {
        method: route.method,
        url: route.path,
      };

      server = simpleServer(
        [
          {
            register: mockingPlugin,
            options: {
              enable: false,
              urlParamForEnableMocking,
              cookieEnableMocking,
              mockRoutes: [
                {
                  path: route.path,
                  method: route.method,
                  handler: (request, reply) => reply('This is mock'),
                },
              ],
            },
          },
        ],
        route,
      );
    });

    it('should be turn on all mocks by special url param', () => {
      return server.inject(request)
        // should be real
        .then((response) => expect(response.payload).to.equal('This is real'))
        // turn on mocks
        .then(() => server.inject({
          url: `${route.path}?${urlParamForEnableMocking}=true`,
        }))
        // test cookie
        .then((response) => {
          expect(
            response.headers['set-cookie']
              .map(Cookie.parse)
              .some((cookies) => cookies[cookieEnableMocking] === 'true'),
          ).to.be.true;
          expect(response.payload).to.equal('This is mock');
        });
    });

    // it('should be turn on only part of mocks by special url param value', (done) => {
    //  // todo @ANKU @LOW -
    //  expect(true).to.be.false;
    // });
    //
    // it('should be turn on only part of mocks by special url param regexp value', (done) => {
    //  // todo @ANKU @LOW -
    //  expect(true).to.be.false;
    // });
  });
});
