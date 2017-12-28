import Hapi from 'hapi';

import { setRequestData } from '../../server/utils/hapi-utils';

const { getDefaultServer } = global;

function routesPlugin(server, options, next) {
  server.route(options.routes);
  next();
}
routesPlugin.attributes = {
  name: 'routesPlugin',
};

/*
  See https://hapijs.com/api#serverinjectoptions-callback
*/
export function simpleServer(plugins = [], routes = null, serverConfig = null) {
  const server = new Hapi.Server();
  server.connection(serverConfig || {});

  const finalPlugins = plugins
    ? Array.isArray(plugins)
      ? [...plugins]
      : [plugins]
    : [];

  finalPlugins.forEach((plugin) => {
    if (!plugin.attributes) {
      plugin.attributes = { name: `${Math.random()}` };
    }
  });

  if (routes) {
    finalPlugins.unshift({
      register: routesPlugin,
      options: {
        routes,
      },
    });
  }

  server.register(finalPlugins);

  /*
   Don't call anything like server.start.
   We have inject to ping routes even when your server is not bound to a port.

   server.inject(options, handler);
  */
  return server;
}

export async function upstreamServer(plugins, routes, serverConfig, testFn) {
  const upstream = simpleServer(plugins, routes, serverConfig);
  await upstream.start();

  await testFn(upstream);

  await upstream.stop();
}

// вместе с "hapi-session-inject"
// export function initTestServer(server, plugins = [], routes = null) {
//  server.connection({ port: 8000 });
//
//  const finalPlugins = Array.isArray(plugins) ? [...plugins] : [plugins];
//
//  if (routes) {
//    function routesPlugin(server, options, next) {
//      server.route(routes);
//      next();
//    }
//    routesPlugin.attributes = {
//      name: 'routesPlugin'
//    };
//
//    finalPlugins.unshift(routesPlugin);
//  }
//
//  /*
//   Don't call anything like server.start.
//   We have inject to ping routes even when your server is not bound to a port.
//
//   server.inject(options, handler);
//   */
//
//  return server.register(finalPlugins)
//    .then(() => server.initialize());
// }

/**
 * @param server
 * @param requestOptions - see https://hapijs.com/api#serverinjectoptions-callback
 * @return - Promise
 */
export async function proceedRequest(requestOptions, server = undefined) {
  let serverFinal = server;
  let requestOptionsFinal = requestOptions;
  if (typeof requestOptions === 'string') {
    requestOptionsFinal = {
      url: requestOptions,
    };
  }

  if (typeof server === 'undefined') {
    if (typeof getDefaultServer !== 'function') {
      throw new Error('There aren\'t server or global.getDefaultServer() is not function.');
    }

    serverFinal = await getDefaultServer();
  }

  return serverFinal.inject(requestOptionsFinal);
}

export function proceedApiRequest(apiConfig, data = undefined, requestOptions = {}, server = undefined) {
  const requestOptionsFinal = setRequestData({
    method: apiConfig.method,
    url: apiConfig.path,
    ...requestOptions,
  }, data);

  return proceedRequest(requestOptionsFinal, server);
}
