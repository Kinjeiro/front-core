import pluginH2o2 from 'h2o2';
// import streamToPromise from 'stream-to-promise';
// import FormData from 'form-data';
//
// import fs from 'fs';

import { createEndpointServiceConfig } from '../../../config/utils/create-config';

// import createApiConfig from '../../common/utils/create-api-config';

import {
  simpleServer,
  upstreamServer,
} from '../../test/server/test-server-utils';

import { UNI_ERROR_FROM } from '../../common/models/uni-error';

// const Lab = require('lab');
// const Code = require('code');

// const Hoek = require('hoek');
// const Wreck = require('wreck');

// const lab = exports.lab = Lab.script();
// const describe = lab.describe;
// const it = lab.it;
// const expect = Code.expect;

import {
  apiPluginFactory,
  proxyRoute,
  proxyRouteFactory,
} from './api-plugin-factory';

describe('api-plugin-factory', () => {
  describe('[method] proxyRoute', () => {
    async function runSimpleUpstream(testCodeFn) {
      return upstreamServer(
        null,
        [{
          method: 'GET',
          path: '/upstreamApi/test',
          handler(request, h) {
            return h.response('ok');
          },
        }],
        null,
        testCodeFn,
      );
    }

    it('should work with absolute uri with match data', async () => {
      await runSimpleUpstream(async (upstream) => {
        const server = simpleServer([
          pluginH2o2,
          proxyRoute(
            '/test',
            {
              uri: `{protocol}://{host}:${upstream.info.port}/upstreamApi{path}`,
            },
            {
              routeConfig: {
                auth: false,
              },
            },
          ),
        ]);

        const res = await server.inject({
          url: '/test',
          headers: {
            'content-type': 'text/html',
          },
        });

        expect(res.statusCode).to.equal(200);
        expect(res.result).to.equal('ok');
      });
    });

    it('should work with apiPrefix', async () => {
      await runSimpleUpstream(async (upstream) => {
        const server = await simpleServer([
          pluginH2o2,
          proxyRoute(
            '/test',
            {
              apiPrefix: 'upstreamApi',
              port: upstream.info.port,
            },
            {
              routeConfig: {
                auth: false,
              },
            },
          ),
        ]);

        const res = await server.inject('/test');

        expect(res.statusCode).to.equal(200);
        expect(res.result).to.equal('ok');
      });
    });

    it('should work with handler for string payload', async () => {
      await runSimpleUpstream(async (upstream) => {
        const server = await simpleServer([
          pluginH2o2,
          proxyRoute(
            '/test',
            {
              apiPrefix: 'upstreamApi',
              port: upstream.info.port,
            },
            {
              handler: (proxyPayload, requestData, apiRequest, newReply, proxyResponse, pluginOptions) => {
                return newReply(`updated_${proxyPayload}`);
              },
              routeConfig: {
                auth: false,
              },
            },
          ),
        ]);

        const res = await server.inject('/test');

        expect(res.statusCode).to.equal(200);
        // expect(res.payload).to.equal('ok');
        expect(res.result).to.equal('updated_ok');
      });
    });

    it('should work with handler for json payload', async () => {
      await upstreamServer(
        null,
        [{
          method: 'GET',
          path: '/upstreamApi/test',
          handler(request, h) {
            return h.response({
              test: 'testValue',
            });
          },
        }],
        null,
        async (upstream) => {
          const server = await simpleServer([
            pluginH2o2,
            proxyRoute(
              '/test',
              {
                apiPrefix: 'upstreamApi',
                port: upstream.info.port,
              },
              {
                handler: (proxyPayload, requestData, apiRequest, newReply) => newReply({
                  ...proxyPayload,
                  test2: 'test2Value',
                }),
                routeConfig: {
                  auth: false,
                },
              },
            ),
          ]);

          const res = await server.inject('/test');

          expect(res.statusCode).to.equal(200);
          // expect(res.payload).to.equal('ok');
          expect(res.result).to.deep.equal({
            test: 'testValue',
            test2: 'test2Value',
          });
        },
      );
    });

    it('should work with wildcard (*)', async () => {
      await upstreamServer(
        null,
        [{
          method: 'GET',
          path: '/upstreamApi/test/1',
          handler: (request, h) => h.response('test1'),
        },
        {
          method: 'GET',
          path: '/upstreamApi/test/2',
          handler: (request, h) => h.response('test2'),
        }],
        null,
        async (upstream) => {
          const server = await simpleServer([
            pluginH2o2,
            proxyRoute(
              {
                path: '/test/*',
              },
              {
                apiPrefix: 'upstreamApi',
                port: upstream.info.port,
              },
              {
                routeConfig: {
                  auth: false,
                },
              },
            ),
          ]);

          let res = await server.inject('/test/1');
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.deep.equal('test1');

          res = await server.inject('/test/2');
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.deep.equal('test2');
        },
      );
    });

    it('should work with wildcard (*) on root', async () => {
      await upstreamServer(
        null,
        [{
          method: 'GET',
          path: '/upstreamApi/test',
          handler: (request, h) => h.response('test1'),
        }],
        null,
        async (upstream) => {
          const server = await simpleServer([
            pluginH2o2,
            proxyRoute(
              {
                path: '/test/*',
              },
              {
                apiPrefix: 'upstreamApi',
                port: upstream.info.port,
              },
              {
                routeConfig: {
                  auth: false,
                },
              },
            ),
          ]);

          const res = await server.inject('/test');
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.deep.equal('test1');
        },
      );
    });
    it('should work with wildcard (*) on few slashes', async () => {
      await upstreamServer(
        null,
        [{
          method: 'GET',
          path: '/upstreamApi/test/test2',
          handler: (request, h) => h.response('test1'),
        }],
        null,
        async (upstream) => {
          const server = await simpleServer([
            pluginH2o2,
            proxyRoute(
              {
                path: '/test/*',
              },
              {
                apiPrefix: 'upstreamApi',
                port: upstream.info.port,
              },
              {
                routeConfig: {
                  auth: false,
                },
              },
            ),
          ]);

          const res = await server.inject('/test/test2');
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.deep.equal('test1');
        },
      );
    });
    it('should work with function (with callback h2o2@6.1.0)', async () => {
      await upstreamServer(
        null,
        [{
          method: 'GET',
          path: '/upstreamApi/test/test2',
          handler: (request, h) => h.response('test1'),
        }],
        null,
        async (upstream) => {
          const server = await simpleServer([
            pluginH2o2,
            proxyRoute(
              '/test/*',
              (request, callback) => {
                // в версии h2o2@6.0.1 нужно подавать через callback
                callback(null, `http://127.0.0.1:${upstream.info.port}/upstreamApi${request.url.href}`);
              },
              {
                routeConfig: {
                  auth: false,
                },
              },
            ),
          ]);

          const res = await server.inject('/test/test2');
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.deep.equal('test1');
        },
      );
    });
    it('should work with function mapUri with return params (without callback h2o2@7.0.0)', async () => {
      await upstreamServer(
        null,
        [{
          method: 'GET',
          path: '/upstreamApi/test/test2',
          handler: (request, h) => h.response('test1'),
        }],
        null,
        async (upstream) => {
          const server = await simpleServer([
            pluginH2o2,
            proxyRoute(
              '/test/*',
              (request) => ({
                uri: `http://127.0.0.1:${upstream.info.port}/upstreamApi${request.url.href}`,
              }),
              {
                routeConfig: {
                  auth: false,
                },
              },
            ),
          ]);

          const res = await server.inject('/test/test2');
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.deep.equal('test1');
        },
      );
    });


    it('should pass query params through mapUri proxy', async () => {
      await upstreamServer(
        null,
        [{
          method: 'GET',
          path: '/upstreamApi/test/test2',
          handler: (request, h) => h.response(request.query),
        }],
        null,
        async (upstream) => {
          const server = await simpleServer([
            pluginH2o2,
            proxyRoute(
              '/test/*',
              (request) => ({
                uri: `http://127.0.0.1:${upstream.info.port}/upstreamApi${request.url.href}`,
              }),
              {
                handler: (proxyPayload, requestData, apiRequest, newReply) => newReply(proxyPayload),
                routeConfig: {
                  auth: false,
                },
              },
            ),
          ]);

          const res = await server.inject('/test/test2?param1=value1');
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.deep.equal({
            param1: 'value1',
          });
        },
      );
    });

    it('should pass query params through simple proxy', async () => {
      await upstreamServer(
        null,
        [{
          method: 'GET',
          path: '/test/test2',
          handler: (request, h) => h.response(request.query),
        }],
        null,
        async (upstream) => {
          const server = await simpleServer([
            pluginH2o2,
            proxyRoute(
              '/test/*',
              {
                host: '127.0.0.1',
                port: upstream.info.port,
              },
              {
                routeConfig: {
                  auth: false,
                },
              },
            ),
          ]);

          const res = await server.inject('/test/test2?param1=value1');
          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(res.payload)).to.deep.equal({
            param1: 'value1',
          });
        },
      );
    });



    it('should work without method value (for all request methods)', async () => {
      await upstreamServer(
        null,
        [
          {
            method: 'GET',
            path: '/upstreamApi/test/test2',
            handler: (request, h) => h.response(request.query),
          },
          {
            method: 'POST',
            path: '/upstreamApi/test/test2',
            handler: (request, h) => h.response({
              ...request.query,
              ...request.payload,
            }),
          },
        ],
        null,
        async (upstream) => {
          const server = await simpleServer([
            pluginH2o2,
            proxyRoute(
              '/test/*',
              (request) => ({
                uri: `http://127.0.0.1:${upstream.info.port}/upstreamApi${request.url.href}`,
              }),
              {
                routeConfig: {
                  auth: false,
                },
              },
            ),
          ]);

          let res = await server.inject('/test/test2?param1=value1');
          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(res.payload)).to.deep.equal({
            param1: 'value1',
          });

          res = await server.inject({
            url: '/test/test2?param1=value1',
            method: 'post',
            payload: {
              postField: 'postValue',
            },
          });
          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(res.payload)).to.deep.equal({
            param1: 'value1',
            postField: 'postValue',
          });
        },
      );
    });

    // todo @ANKU @LOW - портит консоль своим выводом инфы - пока отключил
    // it('should proxy file', async () => {
    //   await upstreamServer(
    //     null,
    //     [
    //       {
    //         method: 'POST',
    //         path: '/upstreamApi/test/upload',
    //         config: {
    //           // payload: {
    //           //   maxBytes: 1048576, // 1MB
    //           //   output: 'stream',  // We need to pipe the filedata to another server
    //           //   parse: true
    //           // },
    //         },
    //         handler: (request, h) => {
    //           // return h.response('ok');
    //           return h(request.payload);
    //         },
    //       },
    //     ],
    //     null,
    //     async (upstream) => {
    //       const server = await simpleServer([
    //         pluginH2o2,
    //         proxyRoute(
    //           '/test/*',
    //           (request) => ({
    //             uri: `http://127.0.0.1:${upstream.info.port}/upstreamApi${request.url.href}`,
    //           }),
    //           {
    //             routeConfig: {
    //               auth: false,
    //             },
    //           },
    //         ),
    //       ]);
    //
    //       const myLogoFileBuffer = fs.readFileSync('./static/favicon.ico', 'utf-8');
    //
    //       const image = {
    //         name: 'Ren & Stimpy',
    //         description: [
    //           'Ren Höek is a hot-tempered, "asthma-hound" Chihuahua.',
    //           'Stimpson "Stimpy" J. Cat is a three-year-old dim-witted and happy-go-lucky cat.',
    //         ].join('\n'),
    //         filename: 'ren.jpg',
    //         checksum: '5965ae98ecab44a2a29b87f90c681229',
    //         width: '256',
    //         height: '256',
    //         filedata: new Buffer('lets imagine that this is an image'),
    //         myLogo: myLogoFileBuffer,
    //       };
    //
    //       const form = new FormData();
    //       // Fill the form object
    //       Object.keys(image).forEach((key) => {
    //         form.append(key, image[key]);
    //       });
    //
    //       const resultStream = await streamToPromise(form);
    //
    //       const response = await server.inject({
    //         url: '/test/upload',
    //         method: 'POST',
    //         headers: form.getHeaders(),
    //         payload: resultStream,
    //       });
    //       const { result } = response;
    //
    //       expect(response.statusCode).to.equal(200);
    //       expect(result.name).to.equal(image.name);
    //       expect(result.description).to.equal(image.description);
    //       expect(result.filename).to.equal(image.filename);
    //       expect(result.checksum).to.equal(image.checksum);
    //       expect(result.width).to.equal(image.width);
    //       expect(result.height).to.equal(image.height);
    //       // expect(Buffer.from(result.myLogo, 'utf-8')).to.equal(myLogoFile);
    //
    //       expect(result.myLogo).to.equal(myLogoFileBuffer.toString());
    //     },
    //   );
    // });

    it('should work with replace api prefix', async () => {
      await upstreamServer(
        null,
        [{
          method: 'GET',
          path: '/upstreamApi/test/test2',
          handler: (request, h) => h.response('test1'),
        }],
        null,
        async (upstream) => {
          const apiPrefixRegExp = new RegExp('^/?api/', 'g');

          const server = await simpleServer([
            pluginH2o2,
            proxyRoute(
              '/api/test/*',
              (request) => ({
                uri: `http://127.0.0.1:${upstream.info.port}/upstreamApi${request.url.href.replace(apiPrefixRegExp, '/')}`,
              }),
              {
                routeConfig: {
                  auth: false,
                },
              },
            ),
          ]);

          const res = await server.inject('/api/test/test2');
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.deep.equal('test1');
        },
      );
    });
    it('should work with two string parameters', async () => {
      await upstreamServer(
        null,
        [{
          method: 'GET',
          path: '/upstreamApi/test/test2',
          handler: (request, h) => h.response('testAnswer'),
        }],
        null,
        async (upstream) => {
          // https://github.com/hapijs/h2o2#custom-uri-template-values
          const server = await simpleServer([
            pluginH2o2,
            proxyRoute(
              '/api/apiContext/{myPath*}',
              `http://127.0.0.1:${upstream.info.port}/upstreamApi/{myPath}`,
              {
                routeConfig: {
                  auth: false,
                },
              },
            ),
          ]);

          const res = await server.inject('/api/apiContext/test/test2');
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.deep.equal('testAnswer');
        },
      );
    });
    it('should work with two string parameters and headers', async () => {
      await upstreamServer(
        null,
        [{
          method: 'GET',
          path: '/upstreamApi/test/test2',
          handler: (request, h) => h.response('testAnswer'),
        }],
        null,
        async (upstream) => {
          // https://github.com/hapijs/h2o2#custom-uri-template-values
          const server = await simpleServer([
            pluginH2o2,
            proxyRoute(
              '/api/apiContext/{myPath*}',
              (request) => ({
                uri: `http://127.0.0.1:${upstream.info.port}/upstreamApi/{myPath}`,
                headers: {},
              }),
              {
                routeConfig: {
                  auth: false,
                },
              },
            ),
          ]);

          const res = await server.inject('/api/apiContext/test/test2');
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.deep.equal('testAnswer');
        },
      );
    });
    it('should throw string error', async () => {
      await upstreamServer(
        null,
        [{
          method: 'GET',
          path: '/upstreamApi/test/test2',
          handler: (request, h) => h.response('errorMessage').code(400),
        }],
        null,
        async (upstream) => {
          // https://github.com/hapijs/h2o2#custom-uri-template-values
          const server = await simpleServer([
            pluginH2o2,
            proxyRoute(
              '/api/apiContext/{myPath*}',
              (request) => {
                return {
                  uri: `http://127.0.0.1:${upstream.info.port}/upstreamApi/{myPath}`,
                  headers: {},
                };
              },
              {
                routeConfig: {
                  auth: false,
                },
              },
            ),
          ]);

          const res = await server.inject('/api/apiContext/test/test2?opa=test');
          expect(res.statusCode).to.equal(400);
          expect(res.result.uniCode).to.deep.equal(400);
          expect(res.result.message).to.deep.equal('errorMessage');
        },
      );
    });
    it('should throw json error', async () => {
      await upstreamServer(
        null,
        [{
          method: 'GET',
          path: '/upstreamApi/test/test2',
          handler: (request, h) => h.response({
            errorCode: 'ERROR_CODE',
            errorName: 'Error message',
          }).code(400),
        }],
        null,
        async (upstream) => {
          // https://github.com/hapijs/h2o2#custom-uri-template-values
          const server = await simpleServer([
            pluginH2o2,
            proxyRoute(
              '/api/apiContext/{myPath*}',
              (request) => ({
                uri: `http://127.0.0.1:${upstream.info.port}/upstreamApi/{myPath}`,
                headers: {},
              }),
              {
                routeConfig: {
                  auth: false,
                },
              },
            ),
          ]);

          const res = await server.inject('/api/apiContext/test/test2');
          expect(res.statusCode).to.equal(400);
          expect(res.result.uniCode).to.deep.equal('ERROR_CODE');
          expect(res.result.message).to.deep.equal('Error message');
        },
      );
    });
    it('should throw error when middleware endpoint doesn\'t reachable', async () => {
      const fakeEndpoint = createEndpointServiceConfig({
        port: 8088,
        endpoint: 'fakeApi',
      });
      const proxyFactory = proxyRouteFactory(fakeEndpoint);
      function proxy(pathOrApiConfig, middleApiPath = undefined, otherRouteOptions = {}) {
        return proxyFactory(pathOrApiConfig, middleApiPath, {
          routeConfig: {
            auth: false,
          },
          ...otherRouteOptions,
        });
      }

      const server = await simpleServer([
        pluginH2o2,
        proxy('/api/testUnits', '/testUnits'),
        proxy('/api/testUnits/{myPath*}', '/testUnits/{myPath}'),
      ]);

      const res = await server.inject('/api/testUnits');
      expect(res.statusCode).to.equal(500);
      expect(res.result.isUniError).to.equal(true);
      expect(res.result.errorFrom).to.equal(UNI_ERROR_FROM.FROM_BOOM);
      expect(res.result.isNotFound).to.equal(true);
    });
  });
});
